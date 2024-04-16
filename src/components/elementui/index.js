const coms = require.context('./', true, /index.vue$/);

const data = {};
data.install = function (Vue) {
  coms.keys().forEach(fileName => {
    const component = coms(fileName).default;
    Vue.component(component.name, component);
  });
};

export default data;
