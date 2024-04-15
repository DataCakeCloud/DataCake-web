import Vue from 'vue';

// 滚动加载更多
Vue.directive('dragSize', {
  inserted: function(el, binding) {
    const dragDom = el;
    const sizeDom = binding.value.sizeDom;
    if (!sizeDom) return;
    const rootWidth = document.documentElement.clientWidth;
    const rootHeight = document.documentElement.clientHeight;

    if (binding.value.dropSeatType) dragDom.style[binding.value.dropSeatType] = `${sizeDom.clientWidth}px`;
    // 限制单位转换
    if (binding.value.limit) {
      if (Object.values(binding.value.limit).some(v => typeof v === 'string' && v.includes('%'))) {
        Object.keys(binding.value.limit).forEach(key => {
          if (binding.value.limit[key].includes('%')) {
            if (key.includes('Width')) {
              binding.value.limit[key] = (rootWidth * parseInt(binding.value.limit[key])) / 100;
            } else {
              binding.value.limit[key] = (rootHeight * parseInt(binding.value.limit[key])) / 100;
            }
          }
        });
      }
    }
    dragDom.style.cursor = 'col-resize';
    dragDom.onmousedown = e => {
      binding.value.callbackStatus && binding.value.callbackStatus('mousedown', e);
      document.body.style.cursor = 'col-resize';
      dragDom.classList.add('active');
      e.preventDefault();
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX;
      const disY = e.clientY;
      const w = sizeDom.clientWidth;
      const h = sizeDom.clientHeight;
      var nw;
      var nh;
      document.onmousemove = function(e) {
        binding.value.callbackStatus && binding.value.callbackStatus('mousemove', e);
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX;
        const r = e.clientY - disY;
        // 改变当前元素宽度，不可超过最小最大值限制
        let maxWidth = rootWidth;
        let minWidth = 0;
        let maxHeight = rootHeight;
        let minHeight = 0;
        if (binding.value.limit) {
          if (binding.value.limit.maxWidth) maxWidth = binding.value.limit.maxWidth;
          if (binding.value.limit.minWidth) minWidth = binding.value.limit.minWidth;
          if (binding.value.limit.maxHeight) maxHeight = binding.value.limit.maxHeight;
          if (binding.value.limit.minHeight) minHeight = binding.value.limit.minHeight;
        }
        if (binding.value.sizeDomSeat === 'left') {
          nw = w + l < minWidth ? minWidth : w + l > maxWidth ? maxWidth : w + l;
        } else {
          nw = w - l < minWidth ? minWidth : w - l > maxWidth ? maxWidth : w - l;
        }
        nh = h + r < minHeight ? minHeight : h + r > maxHeight ? maxHeight : h + r;

        if (binding.value.sizeType.width) sizeDom.style.width = `${nw}px`;
        if (binding.value.sizeType.height) sizeDom.style.height = `${nh}px`;

        // 拖拽图表位置
        if (binding.value.dropSeatType) dragDom.style[binding.value.dropSeatType] = `${nw}px`;
      };

      document.onmouseup = function(e) {
        binding.value.callbackStatus && binding.value.callbackStatus('mouseup', e);
        document.body.style.cursor = 'default';
        dragDom.classList.remove('active');
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
});
