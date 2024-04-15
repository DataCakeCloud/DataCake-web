import Vue from 'vue';

Vue.directive('track', {
  bind(el, binding) {
    const params = {
      currentUrl: binding.value.currentUrl,
      behavior: binding.value.behavior
    };
    const { arg } = binding;
    if (arg === 'click') {
      el.addEventListener(
        'click',
        e => {
          // todo
        },
        false
      );
    }
  }
});
