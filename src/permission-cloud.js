import Vue from 'vue';
import router from './router';
import store from './store';
import { Message } from 'element-ui';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import { getToken } from '@/utils/auth'; // get token from cookie
import { pendingMap, clearMessageList } from '@/utils/gateway-request';
import { updateVersion } from '@/updateVersion';
import { initUserData } from '@/utils/init';
import { setDocumentTitle } from '@/utils/config';

NProgress.configure({ showSpinner: false }); // NProgress Configuration
const whiteList = ['/login', '/mfa', '/guidance', '/retrieve-password/1/', '/retrieve-password/2', '/retrieve-password/3'];

router.beforeEach(async(to, from, next) => {
  // cancel loading的接口
  for (const [key, value] of pendingMap.entries()) {
    value(key);
  }
  // 清空之前的错误信息
  clearMessageList();

  const _base = router.options.base;
  const userInfo = store.getters.userInfo || JSON.parse(sessionStorage.getItem('userInfo'));
  if (to.name) {
    // 自定义上报
    const event = {
      type: 'pageView',
      id: to.name,
      name: to.meta.cnName
    };
    Vue.$report({
      userId: userInfo && userInfo.userId,
      time: Date.now(),
      event: event
    });
  }
  if (to.path === '/') {
    next();
    return;
  }
  // 更新版本自动刷新页面
  setTimeout(() => {
    updateVersion();
  }, 600);
  if (_base !== '/' && window.location.pathname.indexOf(_base) === -1) {
    return;
  }

  setDocumentTitle(to);

  if (getToken()) {
    NProgress.start();
    if (whiteList.includes(to.path)) {
      // next({ path: '/login' });
      next({ path: '/home' });
      NProgress.done();
    } else {
      // 刷新页面初始化用户信息
      if (!store.getters.userInfo) {
        await store.dispatch('user/GetCloudInfo');
        initUserData();
      }
      // 刷新页面时先挂载路由
      if (store.getters['user/routers'].length === 0) {
        store
          .dispatch('user/InitCloudRouters')
          .then(res => {
            // 刷新页面时由于路由开始未挂载所有路由 导致会直接重定向到404，这里挂载完后replace到正确的path
            if (to.path === '/404') {
              next({
                path: to.redirectedFrom,
                replace: true
              });
            } else {
              next(to.fullPath);
            }
          })
          .catch(error => {
            next();
            console.log(error);
          });
      } else {
        if (!to.matched || to.matched.length === 0) {
          Message({
            center: true,
            type: 'warning',
            message: '权限不足,请联系管理员'
          });
          NProgress.done();
        } else {
          next();
        }
      }
    }
  } else {
    // 白名单的路由，不需要 token 加持，直接进
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next({ path: '/login' });
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
