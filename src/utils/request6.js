import axios from 'axios';
import { Notification } from 'element-ui';
import store from '@/store';
import { getToken } from '@/utils/auth'; // get token from cookie , getFrom
import i18n from '@/lang';

// create an axios instance
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? process.env.VUE_APP_BASE_API6 : process.env.VUE_APP_API_PATH6, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters['user/token']) {
      config.headers['Authentication'] = getToken(); // 让每个请求携带自定义token
    }
    if (store.getters['userInfo']) {
      config.headers['user_id'] = store.getters['userInfo'].userId; // 给请求加上ID
    }
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
    const res = response.data;
    // zeus接口判断
    if (!res.success && res.returnCode && res.returnCode === '10004') {
      store.dispatch('user/FedLogOut').then(() => {
        location.reload();
      });
      return;
    }
    // 用于业务相关接口错误提示
    if (res.code !== undefined) {
      if (res.code !== 0) {
        if (res.code === 403) {
          // 403沒登录或登录token过期
          store.dispatch('user/FedLogOut').then(() => {
            location.reload();
          });
        } else {
          // 502 warning  500 error
          let type = 'error';
          let title = i18n.t('common.error');
          if (res.code === 502) {
            type = 'warning';
            title = i18n.t('common.warning');
          }
          Notification({
            title: title,
            type: type,
            dangerouslyUseHTMLString: true,
            message: `${res.message}`,
            duration: 5 * 1000
          });
        }
        if (res.code === 502) {
          return res;
        } else {
          return res;
        }
      } else {
        return res;
      }
    }
    if (response.config.response_type === 'blob') {
      const { data, headers } = response;
      var bom;
      if (headers['content-type'].toLowerCase().indexOf('csv') > -1) {
        var buffer = new ArrayBuffer(3);
        var dataView = new DataView(buffer);
        dataView.setUint8(0, 0xef);
        dataView.setUint8(1, 0xbb);
        dataView.setUint8(2, 0xbf);
        bom = new Uint8Array(buffer);
      }
      const fileName = headers['content-disposition'].replace(/\w+;filename="(.*)/, '$1');
      const blob = new Blob([bom || '', data], { type: headers['content-type'] });
      const dom = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      dom.href = url;
      dom.download = decodeURI(fileName);
      dom.style.display = 'none';
      document.body.appendChild(dom);
      dom.click();
      dom.parentNode.removeChild(dom);
      window.URL.revokeObjectURL(url);
      return response;
    }
    return res;
  },
  error => {
    console.log('err' + error); // for debug
    if (error.response && error.response.status === 403) {
      // 403沒登录或登录token过期
      store.dispatch('user/FedLogOut').then(() => {
        location.reload();
      });
    } else if (error.toString() === 'Cancel') {
      // 接口请求取消
    } else if (error.response && error.response.status === 405) {
      // 405沒接口权限
      Notification({
        title: i18n.t('common.error'),
        type: 'error',
        message: i18n.t('message.405'),
        duration: 5 * 1000
      });
    } else {
      Notification({
        title: i18n.t('common.error'),
        type: 'error',
        message: error.message,
        duration: 5 * 1000
      });
    }
    return Promise.reject(error);
  }
);

export default service;
