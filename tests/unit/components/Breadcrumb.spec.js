import { mount, createLocalVue, config } from '@vue/test-utils';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import Breadcrumb from '@/components/Breadcrumb/index.vue';

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(ElementUI);
config.methods['$t'] = () => {};
config.methods['$te'] = () => {};

const routes = [
  {
    path: '/',
    name: 'home',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard'
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

describe('Breadcrumb.vue', () => {
  const wrapper = mount(Breadcrumb, {
    localVue,
    router
  });
  it('dashboard', () => {
    router.push('/dashboard');
    const len = wrapper.findAll('.el-breadcrumb__inner').length;
    expect(len).toBe(1);
  });
});
