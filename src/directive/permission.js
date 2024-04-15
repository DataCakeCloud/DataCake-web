import Vue from 'vue';

/**
 * condition: 判断的依据
 * condition_met: 判断的条件
 * callBack: 回调函数
 * instead: 结果是否反转
 */
Vue.directive('permission', {
  inserted: function(el, binding) {
    const { condition, condition_met, callBack = () => {}, instead = false } = binding.value;

    if (!condition) return;

    let result;

    if (typeof condition === 'string') {
      result = condition === condition_met;
    } else if (Array.isArray(condition)) {
      result = condition.some(item => item === condition_met);
    } else {
      result = Object.values(condition).some(item => item === condition_met);
    }

    const res = instead ? !result : result;

    callBack(res);
    if (!res) {
      el.parentElement.removeChild(el);
    }
  }
});
