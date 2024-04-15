import axios from '@/utils/gateway-request';
import initAxios from 'axios';

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};
// type:source输入源的接口，destination输出源的接口
// 获取数据分页列表
export function pageGet(params, type) {
  return axios.get(`/ds_task/actor/${type}s/page`, { params });
}
// 删除数据实例
export function deleteGet(params, type) {
  return axios.get(`/ds_task/actor/${type}s/delete`, { params });
}
// 获取数据 source/destination spec 信息
export function specGet(params, type) {
  return axios.get(`/ds_task/actor/${type}_definitions/spec`, { params });
}
// 检测数据 source/destination 实例名字是否存在
export function existGet(params, type) {
  return axios.get(`/ds_task/actor/${type}s/exist`, { params });
}
// 检查数据 source/destination 连接信息
export function checkConnection(params, config = {}) {
  // return axios.post(`/ds_task/actor/${type}s/check_connection`, params, { ...config });
  return axios.post(`/ds_task/metadata/checkConnection`, params, { ...config });
}
// 获取source/destination 连接信息
export function getSourceDestination(params, type) {
  return axios.get(`/ds_task/actor/${type}s/get`, { params });
}
// 检查数据 source/destination 连接信息_copy
export function documentGet(params, type) {
  return initAxios.get(`/md/${type}/${params}`);
}

// 添加数据 source/destination  实例
export function createPost(params, type) {
  return axios.post(`/ds_task/actor/${type}s/create`, params, { ...config });
}
// 更新数据 source/destination 实例
export function updatePost(params, type) {
  return axios.post(`/ds_task/actor/${type}s/update`, params, { ...config });
}
// 权限中新增用户/用户组
export function addUser(params) {
  return axios.post(`/ds_task/actor/sources/addShare`, params);
}
// 权限获取用户列表
export function getUser(params) {
  return axios.get(`/ds_task/actor/sources/listShare`, { params });
}
// 权限中删除用户/用户组
export function deleteUser(params) {
  return axios.get(`/ds_task/actor/sources/deleteShare`, { params });
}
// 权限中删除用户/用户组
export function getAuthEdit(params) {
  return axios.get(`/ds_task/actor/sources/doAuthEdit`, { params });
}
// 获取数据源的用户组列表
export function listUserGroup(params) {
  return axios.get(`/ds_task/actor/sources/listUserGroup`, { params });
}
// 更新数据源的用户组列表
export function saveUserGroup(params) {
  return axios.post(`/ds_task/actor/sources/saveUserGroup`, params);
}
