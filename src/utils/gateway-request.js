import axios from 'axios';
import { Notification } from 'element-ui';
import store from '@/store';
import { getToken } from '@/utils/auth'; // get token from cookie
// import { updateVersion } from '@/updateVersion';
import i18n from '@/lang';
const whiteList = ['development', 'cloud-aws-development'];
import { errorInterfaceList } from './config';
import { rootVue } from '@/main';
import { v4 as uuid } from 'uuid';
import router from '@/router';
// 导出-为了在切换页面时取消被切换页面的正在请求的接口
export const pendingMap = new Map();
/**
 * 生成每个请求唯一的键
 * @param {*} config
 * @returns string
 */
function getPendingKey(config) {
  const { url, method, params } = config;
  let { data } = config;
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  // 以url和...组成字符串作为储存的key值
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
}
/**
 * 储存每个请求唯一值, 也就是cancel()方法, 用于取消请求
 * @param {*} config
 */
function addPending(config) {
  const pendingKey = getPendingKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingMap.has(pendingKey)) {
        pendingMap.set(pendingKey, cancel);
      }
    });
}
/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
  const pendingKey = getPendingKey(config);
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey);
    cancelToken(pendingKey);
    pendingMap.delete(pendingKey);
  }
}

// create an axios instance
const service = axios.create({
  baseURL: whiteList.includes(process.env.VUE_APP_ENV) ? process.env.VUE_APP_BASE_API_GATEWAY : process.env.VUE_APP_API_GATEWAY_PATH, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 4000 * 1000, // request timeout
  retry: 3
});

// error message 处理
let messageList = [];

// 清空错误信息
export function clearMessageList() {
  // 重复收集的埋点
  // messageList.forEach(item => {
  //   if (item.errorType || item.message.includes('timeout')) {
  //     rootVue.$report({ userId: store.getters['userInfo'] && store.getters['userInfo'].userId, time: Date.now(), event: { type: item.errorType ? 'filter-' + item.errorType : 'filter-timeout', id: 'httpError', message: item.message, requestUrl: item.requestUrl }});
  //   }
  // });
  messageList = [];
}

// 等待函数
function sleep(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function handelMessage(error) {
  const { title, message, type = 'error', errorType, requestUrl } = error;
  // 埋点所有的timeout || networket error
  if (errorType || message.includes('timeout')) {
    rootVue.$report({ userId: store.getters['userInfo'] && store.getters['userInfo'].userId, time: Date.now(), event: { type: errorType || 'timeout', id: 'httpError', message, requestUrl } });
  }

  if (!messageList.find(item => item.message.includes(message))) {
    messageList.push({ message, errorType, requestUrl });
    Notification({
      title,
      type,
      dangerouslyUseHTMLString: true,
      message,
      duration: 5 * 1000,
      onClose: e => {
        const index = messageList.findIndex(item => item.message === e.message);
        messageList.splice(index, 1);
      }
    });
  } else {
    if (errorType || message.includes('timeout')) {
      rootVue.$report({ userId: store.getters['userInfo'] && store.getters['userInfo'].userId, time: Date.now(), event: { type: errorType ? 'filter-' + errorType : 'filter-timeout', id: 'httpError', message, requestUrl } });
    }
  }
}
// getRandomValues() {
//   var randomNum = getRandomValues
//   randomStr = randomNum.toString()
//   randomArr = randomStr.split('0')
//   randomVal = randomArr[randomArr.length - 1]
// }
// request interceptor
service.interceptors.request.use(
  config => {
    // 添加loading的接口
    // removePending(config);
    addPending(config);
    // updateVersion();
    config.headers['groupId'] = store.getters['user/currentUserGroup'].id || (window.localStorage.currentUserGroup && JSON.parse(window.localStorage.currentUserGroup).id) || '';
    if (getToken()) {
      const randomNum = Math.random();
      const randomStr = Math.floor(randomNum * 10000).toString();
      const randomVal = randomStr.padEnd(5, '0');
      config.headers['Authentication'] = getToken(); // 让每个请求携带自定义token
      config.headers['traceId'] = uuid() + randomVal;
      config.headers['currentGroup'] = store.getters['user/currentUserGroup'].name || '';
      config.headers['uuid'] = store.getters['user/currentUserGroup'].uuid || '';
    }
    // const userInfo = store.getters['userInfo'];
    // if (userInfo) {
    //   config.headers['UserInfo'] = JSON.stringify(userInfo); // 让每个请求携带自定义用户信息
    // }
    return config;
  },
  error => {
    // do something with request error
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // removePending(response.config);
    const res = response.data;
    const config = response.config;
    config.__retryCount = config.__retryCount || 0;

    // zeus接口判断
    if (!res.success && res.returnCode && res.returnCode === '10004') {
      store.dispatch('user/FedLogOut').then(() => {
        location.reload();
      });
      return;
    }
    // 用于业务相关接口错误提示
    if (res.code !== undefined) {
      if (String(res.code).startsWith('1') || String(res.code).startsWith('3') || String(res.code).startsWith('4') || String(res.code).startsWith('5')) {
        if (res.code === 403) {
          // 403沒登录或登录token过期
          store.dispatch('user/FedLogOut').then(() => {
            router.push('/login');
          });
        } else {
          // 单独处理错误提示接口
          if (errorInterfaceList.some(item => response.config.url.endsWith(item))) {
            if (res.code === 502) {
              return res;
            } else {
              return Promise.reject(res);
            }
          }

          // 502 warning  500 error
          if (!res.msgIgnore) {
            let type = 'error';
            let title = i18n.t('common.error');
            if (String(res.code).startsWith('1') || String(res.code).startsWith('3')) {
              type = 'warning';
              title = i18n.t('common.warning');
            }
            const message = res.message || '';
            if ((message.includes('timeout') || message.includes('UNAVAILABLE')) && config.__retryCount >= config.retry) {
              // 第三次报timeout才会纪录埋点
              handelMessage({ title, type, message, requestUrl: response.config.url });
            } else if (message.includes('timeout')) {
              config.__retryCount++;
              return service(config);
            } else if (message.includes('UNAVAILABLE')) {
              config.__retryCount++;
              return service(config);
            } else {
              handelMessage({ title, type, message, requestUrl: response.config.url });
            }
          }

          // 502 warning  500 error
          // let type = 'error';
          // let title = i18n.t('common.error');
          // if (res.code === 502) {
          //   type = 'warning';
          //   title = i18n.t('common.warning');
          // }
          // let dataMsg = '';
          // if (res.data !== null && res.data !== 'null') {
          //   dataMsg = (res.data && typeof res.data === 'string' ? res.data : JSON.stringify(res.data)) || '';
          // }
          // const message = dataMsg ? `${res.message || res.msg}<br/>${dataMsg}` : `${res.message || res.msg}`;
          // handelMessage({ title, type, message, requestUrl: response.config.url });
        }
        if (res.code === 502) {
          return res;
        } else if (res.code === 303) {
          router.replace('/home');
        } else {
          return Promise.reject(res);
        }
      } else {
        return res;
      }
    }
    // 单独处理 csv
    if ((response.config.response_type || response.config.responseType) === 'blob') {
      const { data, headers } = response;
      let bom, fileName, blob;
      const disposition = headers['content-disposition'];
      if (headers['content-type'].toLowerCase().indexOf('csv') > -1) {
        var buffer = new ArrayBuffer(3);
        var dataView = new DataView(buffer);
        dataView.setUint8(0, 0xef);
        dataView.setUint8(1, 0xbb);
        dataView.setUint8(2, 0xbf);
        bom = new Uint8Array(buffer);

        fileName = disposition.replace(/\w+; filename=/, '').replace(/"/g, '');
        blob = new Blob([bom || '', data], { type: headers['content-type'] });
      } else if (headers['content-type'].toLowerCase().indexOf('excel') > -1) {
        fileName = disposition.match(/(?:\%[a-zA-Z0-9]+)+\.xls/);
        blob = new Blob([response.data], { type: headers['content-type'] });
      } else if (headers['content-type'].toLowerCase().indexOf('pdf') > -1) {
        fileName = disposition.split('filename=')[1]?.replace(/"/g, '') || 'fileName.pdf';
        blob = new Blob([response.data], { type: headers['content-type'] });
      } else {
        fileName = disposition.replace(/\w+; filename=/, '').replace(/"/g, '');
        blob = new Blob([response.data], { type: headers['content-type'] });
      }
      const dom = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      dom.href = url;
      dom.download = decodeURIComponent(fileName);
      dom.style.display = 'none';
      document.body.appendChild(dom);
      dom.click();
      dom.parentNode.removeChild(dom);
      window.URL.revokeObjectURL(url);
      return response;
    }
    // 单独处理 excel
    // if (response.config.responseType === 'blob') {
    //   var downloadElement = document.createElement('a');
    //   var href = window.URL.createObjectURL(blob); // 常见下载的链接
    //   downloadElement.href = href;
    //   downloadElement.download = fileName; // 下载后文件名
    //   document.body.appendChild(downloadElement);
    //   downloadElement.click(); // 点击下载
    //   document.body.removeChild(downloadElement); // 下载完成移除元素
    //   window.URL.revokeObjectURL(href); // 释放blob对象
    // }
    return res;
  },
  async error => {
    // 报错类型收集
    let errorType;
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    try {
      if (error.toString().includes('timeout')) errorType = 'timeout';
      if (error.toString().includes('Network Error')) errorType = 'Network Error';
    } catch (error) {
      console.log(error, 'error toString()');
    }
    if (error.response && (error.response.status === 403 || error.response.status === 500)) {
      // 403, 500沒登录或登录token过期
      store.dispatch('user/FedLogOut').then(() => {
        location.reload();
      });
    } else if (error.response && error.response.status === 405) {
      // 405沒接口权限
      handelMessage({ title: i18n.t('common.error'), message: i18n.t('message.405'), requestUrl: error.config.url });
    } else {
      if (!axios.isCancel(error)) {
        if (errorType && config.__retryCount >= config.retry) {
          handelMessage({ title: i18n.t('common.error'), message: error.message, errorType, requestUrl: error.config.url });
        } else if (errorType) {
          config.__retryCount++;
          // config.url = config.url.split('api-gateway')[config.url.split('api-gateway').length - 1]
          await sleep(1500);
          return service(config);
        } else {
          handelMessage({ title: i18n.t('common.error'), message: error.message, requestUrl: error.config.url });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default service;
