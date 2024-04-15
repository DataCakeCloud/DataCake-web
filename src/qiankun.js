import store from './store';
import apps from './apps';
import { registerMicroApps, initGlobalState } from 'qiankun';
const defaultSettings = require('./settings.js');

// 初始化 state
const state = {
  sidebarOpened: store.getters.sidebar.opened,
  language: store.getters.language,
  userInfo: store.getters.userInfo,
  logOut: false,
  init: 0
};

// 初始化全局消息通道
const actions = initGlobalState(state);
// 全局actions存放store
store.dispatch('app/setMicroStateActions', actions);
actions.onGlobalStateChange((newState, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log('base onGlobalStateChange', newState, prev);
  // 菜单切换按钮方向
  if (newState.sidebarOpened !== store.getters.sidebar.opened) {
    store.dispatch('app/toggleSideBar');
  }
  // 登出
  if (newState.logOut) {
    store.dispatch('user/FedLogOut').then(() => {
      location.reload();
    });
  }
});

// 注册子应用
function initQiankun() {
  const loader = loading => {
    // 子应用模式
    store.dispatch('app/setMicroMode', true);
    // 添加子应用挂载前资源加载loading
    if (loading) {
      store.dispatch('app/setMicroLoading', true);
    }
  };
  const appList = [];
  apps.forEach(app => {
    appList.push({
      name: app.name,
      entry: app.entry,
      loader,
      activeRule: '/' + app.name,
      container: '#micro-app',
      props: {
        token: store.getters.token
      }
    });
  });
  registerMicroApps(appList, {
    beforeLoad: [
      app => {
        console.log('before load', app);
      }
    ], // 挂载前回调
    beforeMount: [
      app => {
        store.dispatch('app/toggleHamburger');
        console.log('before mount', app);
      }
    ], // 挂载后回调
    afterMount: [
      app => {
        console.log('after mount', app);
        // 挂载完成取消loading
        store.dispatch('app/setMicroLoading', false);
      }
    ],
    afterUnmount: [
      app => {
        console.log('afterUnmount', app);
        if (app.name === app.props.name) {
          // 跳转到base项目
          // 隐藏菜单切换按钮
          store.dispatch('app/toggleHamburger');
          document.title = defaultSettings.title;
          // 切换非子应用模式
          store.dispatch('app/setMicroMode', false);
        }
      }
    ] // 卸载后回调
  });

  // 启动
  // start({
  //   // prefetch: (apps) => {
  //   //   return {
  //   //     criticalAppNames: ['zeus']
  //   //   };
  //   // }
  //   prefetch: false
  // });
}

export { initQiankun };
