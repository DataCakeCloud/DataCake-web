import Cookies from 'js-cookie';

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : false,
    withoutAnimation: false
  },
  device: 'desktop',
  language: Cookies.get('language') || 'zh',

  // 子应用模式
  micrlMode: false,
  // 子应用加载loading
  microLoading: false,
  // 全局状态控制器
  MicroStateActions: null,

  // 引导开关
  guidanceMode: window.localStorage.getItem('guidanceMode') !== null ? JSON.parse(window.localStorage.getItem('guidanceMode')) : true
};

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened;
    state.sidebar.withoutAnimation = false;
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1);
    } else {
      Cookies.set('sidebarStatus', 0);
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0);
    state.sidebar.opened = false;
    state.sidebar.withoutAnimation = withoutAnimation;
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device;
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language;
    Cookies.set('language', language);
  },
  SET_MICRO_STATE_ACTIONS: (state, actions) => {
    state.MicroStateActions = actions;
  },
  TOGGLE_HAMBURGER: state => {
    state.sidebar.showHamburger = !state.sidebar.showHamburger;
  },
  TOGGLE_MICRM_LOADING: (state, loading) => {
    state.microLoading = loading;
  },
  TOGGLE_MICRM_MODE: (state, mode) => {
    state.micrlMode = mode;
  },
  TOGGLE_GUIDANCE_MODE: (state, mode) => {
    state.guidanceMode = mode;
  }
};

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR');
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation);
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device);
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language);
  },
  // 切换Hamburger是否显示
  toggleHamburger({ commit }) {
    commit('TOGGLE_HAMBURGER');
  },
  // 初始化微前端全局状态监听器
  setMicroStateActions({ commit }, actions) {
    commit('SET_MICRO_STATE_ACTIONS', actions);
  },
  // 子应用加载loading
  setMicroLoading({ commit }, loading) {
    commit('TOGGLE_MICRM_LOADING', loading);
  },
  // 子应用模式
  setMicroMode({ commit }, mode) {
    commit('TOGGLE_MICRM_MODE', mode);
  },
  setGuidanceMode({ commit }, mode) {
    commit('TOGGLE_GUIDANCE_MODE', mode);
    window.localStorage.setItem('guidanceMode', mode);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
