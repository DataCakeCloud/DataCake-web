import store from './store';
import i18n from './lang';

// 定义子应用全局state变更方法
const microStateFns = (props) => {
  return {
    setSideBarState: (val) => { props.setGlobalState({ sidebarOpened: val }); }
  };
};
const initApp = (props) => {
  // 单点登陆
  store.dispatch('user/Login', { t: props.token });

  // 微应用信息初始化
  store.dispatch('spa/isSpaApp', true);
  store.dispatch('spa/microStateFns', microStateFns(props));

  // 全局状态监听
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log('subapp GlobalState', state, prev);
    if (state.language !== store.getters.language) {
      i18n.locale = state.language;
      store.dispatch('app/setLanguage', state.language);
    }
    if (state.sidebarOpened !== store.getters.sidebar.opened) {
      store.dispatch('app/toggleSideBar');
    }
  });
  // 触发onGlobalStateChange事件 用来首次同步数据
  props.setGlobalState({ init: 1 });
};
export {
  initApp
};
