import Vue from 'vue';
import router from './router';
import store from './store';
import { Message } from 'element-ui';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import { getToken } from '@/utils/auth'; // get token from cookie
import encode from 'urlencode';
import { pendingMap, clearMessageList } from '@/utils/gateway-request';
import { updateVersion } from '@/updateVersion';
import { initUserData } from '@/utils/init';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

console.log('去zeus');
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
  // 更新版本检查
  setTimeout(() => {
    updateVersion();
  }, 600);

  if (_base !== '/' && window.location.pathname.indexOf(_base) === -1) {
    return;
  }
  if (to.query && to.query.t) {
    store.dispatch('user/Login', to.query).then(() => {
      delete to.query.t;
      delete to.query.f;
      next({ path: to.path, replace: true, query: to.query });
    });
  } else {
    NProgress.start();
    if (getToken()) {
      // 判断是采用新的权限还是宙斯权限
      if (sessionStorage.getItem('newSystem') === null) {
        await store.dispatch('user/switchSystem');
      }
      // 刷新页面初始化用户信息
      if (!store.getters.userInfo && to.matched.length > 0) {
        await store.dispatch('user/GetInfo');
        initUserData();
      }
      // 刷新页面时先挂载路由
      if (store.getters['user/routers'].length === 0) {
        store
          .dispatch('user/InitRouters')
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
          if (to.path === '/' && process.env.NODE_ENV !== 'development') {
            next('/admin/cost');
          } else {
            next();
          }
        }
      }
    } else {
      window.location.href = process.env.VUE_APP_ZEUS_PATH + '?from=' + encode(window.location.href);
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
