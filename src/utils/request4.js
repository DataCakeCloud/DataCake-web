import axios from 'axios';
import { Notification } from 'element-ui';
import store from '@/store';
import { getToken } from '@/utils/auth'; // get token from cookie , getFrom
// import { encode } from 'urlencode';
import i18n from '@/lang';

// create an axios instance
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'cloud-aws-development' ? process.env.VUE_APP_BASE_API4 : process.env.VUE_APP_API_PATH4, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters['user/token']) {
      config.headers['Authentication'] = getToken(); // 让每个请求携带自定义token
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
            message: `${res.message}<br/>${res.data}`,
            duration: 5 * 1000
          });
        }
        if (res.code === 502) {
          return res.data;
        } else {
          return Promise.reject(res);
        }
      } else {
        return res.data;
      }
    }
    if (response.config.responseType === 'blob') {
      return response;
    }
    return res;
  },
  error => {
    if (error.response && error.response.status === 403) {
      // 403沒登录或登录token过期
      store.dispatch('user/FedLogOut').then(() => {
        location.reload();
      });
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
        message: error.response.data.message,
        duration: 5 * 1000
      });
    }
    return Promise.reject(error);
  }
);

export default service;
