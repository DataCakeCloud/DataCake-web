import request from '@/utils/gateway-request';
// 登陆接口
import axios from '../utils/gateway-request';

const prefix = '/ds_task/accessuser';

// 登录
export function login(params) {
  return axios.post(`${prefix}/login`, params);
}

// 校验 MFA
export function checkMFACode(params) {
  return axios.post(`${prefix}/checkMFACode`, params);
}

// 解绑 MFA
export function unbundlingMFA(params, config) {
  return axios.post(`${prefix}/unbundlingMFA`, params);
}

// 发送验证码
export function sendCode(params) {
  return axios.get(`${prefix}/sendCode`, { params });
}

// 校验新的验证码
export function checkCode(params) {
  return axios.get(`${prefix}/checkCode`, { params });
}

// 更新密码
export function updatePassword(params) {
  return axios.get(`${prefix}/updatePassword`, { params });
}

/**
 * get user info(宙斯)
 */
export function getInfo() {
  return request({
    url: '/ds_task/systemuserinfo/expand/remote',
    method: 'get'
  });
}
/**
 * get user info(新的用户信息)
 */
export function getInfoNew() {
  return request({
    url: '/ds_task/ds/expand/remote',
    method: 'get'
  });
}
/**
 * logout
 */
export function logout() {
  return request({
    url: '/ds_task/systemlogout/remote',
    method: 'get'
  });
}

/**
 * get user menu(宙斯)
 */
export function getMenu() {
  return request({
    url: '/ds_task/systemmenu/remote',
    method: 'get'
  });
}
/**
 * get user menu(获取用户所有权限菜单接口)
 */
export function getMenuNew() {
  return request({
    url: '/ds_task/ds/menu/remote',
    method: 'get'
  });
}
/**
 * 切换新权限系统接口
 */
export function dsSwitch() {
  return request({
    url: '/ds_task/ds/switch/newaccess',
    method: 'get'
  });
}
/**
 * get tenant info
 */
export function getUserAksk(params) {
  return request({
    url: '/ds_task/tenant/aksk',
    method: 'get',
    params
  });
}
/**
 * get tenant info
 */
export function updateUserAksk(data) {
  return request({
    url: '/ds_task/tenant/aksk/update',
    method: 'post',
    data
  });
}

// 生成用户token
export function updateToken(data) {
  return request({
    url: '/ds_task/tenant/aksk/personalToken',
    method: 'post',
    data
  });
}
// 获取用户token
export function getToken(params) {
  return request({
    url: '/ds_task/tenant/aksk/personalToken/info',
    method: 'get',
    params
  });
}
