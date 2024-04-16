import debounce from 'lodash/debounce';

function getItem(key, inital) {
  const items = localStorage.getItem(key);
  try {
    return JSON.parse(items) || inital;
  } catch (error) {
    return inital;
  }
}

function setItem(key, value) {
  let str = value;
  try {
    str = JSON.stringify(value);
  } catch (error) {}
  localStorage.setItem(key, str);
}

const state = {
  fixedPannel: {
    opening: false, // 偏好菜单是否开始展开计时
    opened: false, // 偏好菜单是否展开
    modalOpening: false, // 菜单详情是否开始展开计时
    modalOpened: false // 菜单详情是否展开
  },
  fixedRouter: getItem('fixedRouter', [])
};

const changeOpened = debounce(() => {
  if (state.fixedPannel.opened !== state.fixedPannel.opening) {
    state.fixedPannel.opened = state.fixedPannel.opening;
  }
}, 1000);

const changeModalOpened = debounce(modalOpened => {
  if (state.fixedPannel.modalOpened !== state.fixedPannel.modalOpening) {
    state.fixedPannel.modalOpened = state.fixedPannel.modalOpening;
  }
}, 1000);

/**
 * 延时关闭一级菜单
 */
export const opening = () => {
  state.fixedPannel.opening = true;
  changeOpened();
};

/**
 * 延时关闭二级菜单
 */
export const modalOpening = () => {
  state.fixedPannel.modalOpening = true;
  changeModalOpened();
};

/**
 * 立即展开sidebar
 */
export const open = () => {
  state.fixedPannel.opening = true;
  state.fixedPannel.opened = true;
  state.fixedPannel.modalOpened = true;
  state.fixedPannel.modalOpening = true;
};

/**
 * 延时关闭sidebar
 */
export const closing = () => {
  state.fixedPannel.opening = false;
  state.fixedPannel.modalOpening = false;
};

/**
 * 立即关闭sidebar
 */
export const close = () => {
  state.fixedPannel.opening = false;
  state.fixedPannel.opened = false;
  state.fixedPannel.modalOpened = false;
  state.fixedPannel.modalOpening = false;
};

export const toggleFixedRouter = path => {
  const index = state.fixedRouter.findIndex(p => p === path);
  if (index >= 0) {
    state.fixedRouter.splice(index, 1);
  } else {
    state.fixedRouter.push(path);
  }
  setItem('fixedRouter', state.fixedRouter);
};

export const isFixedRouter = path => {
  return state.fixedRouter.some(p => p === path);
};

export default state;
