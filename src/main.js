import './public-path';
import Vue from 'vue';
import '@babel/polyfill';
import 'normalize.css/normalize.css'; // A modern alternative to CSS resets

import '@/permission-config'; // permission control

import ElementUI from 'element-ui';
import './layout/components/styles/index.scss';
import '@/styles/index.scss'; // global css
import '@/icons/font/iconfont.css';

import App from './App';
import store from './store';
import router from './router';
import i18n from './lang';
import { initQiankun } from './qiankun';

import '@/icons'; // icon
import * as filters from '@/filters/index';
import * as utils from '@/utils/index';
import { locationOrigin } from '@/utils';
import Contextmenu from 'vue-contextmenujs'; // 右键自定义菜单

import './directive/loadMore';
import './directive/autoFous';
import './directive/dragSize';
import './directive/highlight';
import './directive/permission';
import ElTreeSelect from 'el-tree-select';
import drag from './directive/drag';
import copy from 'copy-to-clipboard';
import resetElementUi from '@/components/elementui';

Vue.directive('drag', drag);
Vue.prototype.$utils = utils;
// 注册filter
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
Vue.mixin({
  methods: {
    copyHandler(value) {
      copy(value, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: `已复制`
      });
    }
  }
});
// 此处为埋点函数，暂时去掉
Vue.$report = Vue.prototype.$report = function(data) {
  return false;
};
Vue.$locationOrigin = Vue.prototype.$locationOrigin = locationOrigin();

// set ElementUI lang to EN
Vue.use(ElementUI, {
  size: 'small',
  zIndex: 3000,
  i18n: (key, value) => i18n.t(key, value)
});
Vue.use(ElTreeSelect);
Vue.use(Contextmenu);
Vue.use(resetElementUi);

Vue.config.productionTip = false;

export const rootVue = Vue;

import { initApp } from './spa';
let instance = null;

function render(props = {}) {
  const { container } = props;
  instance = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  console.log('!window.__POWERED_BY_QIANKUN__');
  render();
}
export async function bootstrap(props) {
  console.log('zeus bootstrap', props);
}

export async function mount(props) {
  console.log('zeus mount', props);
  document.title = 'ZEUS';

  // 全局状态初始化
  initApp(props);

  // 初始化vue
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance = null;
}

initQiankun();
