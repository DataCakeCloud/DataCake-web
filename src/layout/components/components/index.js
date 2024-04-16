import NumberInput from './NumberInput';
import PageTitle from './PageTitle';

const components = [NumberInput, PageTitle];

const install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
};

// if (typeof window !== 'undefined' && window.Vue) {
//   install(window.Vue);
// }

export default {
  version: '1.0.0',
  install,
  NumberInput,
  PageTitle
};
