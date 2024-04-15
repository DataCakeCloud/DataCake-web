import Vue from 'vue';

// 滚动加载更多
Vue.directive('loadMore', {
  bind(el, binding) {
    // 获取element，定义scroll
    const select_dom = el.querySelector(binding.value.selector);
    select_dom.addEventListener('scroll', function() {
      const height = this.scrollHeight - this.scrollTop <= this.clientHeight;
      if (height) {
        binding.value.fn();
      }
    });
  }
});
