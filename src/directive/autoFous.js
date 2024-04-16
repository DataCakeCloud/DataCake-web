import Vue from 'vue';

// 滚动加载更多 select下拉加载更多
Vue.directive('autoFous', {
  inserted: function(el) {
    el.querySelector('input').focus();
  }
});
