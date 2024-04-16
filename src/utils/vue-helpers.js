import debounce from 'lodash/debounce';

let list = [];

/**
 * @param {import("vue").ComponentOptions} componentOption
 */
export const wrapComponent = componentOption => {
  if (process.env.VUE_APP_ENV === 'development' || process.env.VUE_APP_ENV === 'cloud-aws-development') console.log('[Log]当前正在执行inject的component', { componentOption, list });
  if (list.length) {
    list.forEach(({ type, propertyName, value }) => {
      (componentOption[type] || (componentOption[type] = {}))[propertyName] = value;
    });
    list = [];
  }
  return componentOption;
};

export const trigger = eventName => (target, name, descriptor) => {
  const fn = descriptor.value;
  descriptor.value = async function(...args) {
    try {
      const result = await fn.apply(this, args);
      this.$emit(eventName, result);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
};

export const watch =
  (propertyName, immediate = false, deep = false) =>
    (target, name, descriptor) => {
      list.push({
        type: 'watch',
        propertyName,
        value: {
          handler: descriptor.value,
          immediate,
          deep
        }
      });
    };

export const loadingHandler = (t, n, d) => {
  const fn = d.value;
  d.value = async function(...args) {
    this.loading = true;
    let result;
    try {
      result = await fn.apply(this, args);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return result;
  };
};

export const debounceHandler = (time, setting) => (t, n, d) => {
  const fn = d.value;
  d.value = debounce(fn, time, setting);
};
