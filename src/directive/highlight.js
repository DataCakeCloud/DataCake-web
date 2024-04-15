import Vue from 'vue';
import hl from 'highlight.js'; // 导入代码高亮文件
import 'highlight.js/styles/a11y-dark.css'; // 导入代码高亮样式

// 滚动加载更多
Vue.directive('highlight', {
  inserted(el, binding) {
    const blocks = el.querySelectorAll('pre code');
    blocks.forEach(block => {
      hl.highlightBlock(block);
    });
  },
  update(el, binding) {
    const blocks = el.querySelectorAll('pre code');
    blocks.forEach(block => {
      hl.highlightBlock(block);
    });
  }
});
