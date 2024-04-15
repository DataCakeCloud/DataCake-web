import axios from '@/utils/gateway-request';
const config = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
};
const prefix = '/ds_task';
// type:source输入源连接器的接口，destination输出源连接器的接口
// 分页列表
export function pageGet(params, type) {
  return axios.get(`${prefix}/actor/${type}_definitions/page`, { params });
}
// 连接器名称
export function listGet(type) {
  return axios.get(`${prefix}/actor/${type}_definitions/list`);
}
// 添加数据
export function createPost(params, type) {
  return axios.post(`${prefix}/actor/${type}_definitions/create`, params, { ...config });
}
// 更新数据
export function updatePost(params, type) {
  return axios.post(`${prefix}/actor/${type}_definitions/update`, params, config);
}
// 删除数据
export function deletePost(params, type) {
  return axios.post(`${prefix}/actor/${type}_definitions/delete`, params, config);
}
// 开启状态
export function openPost(params, type) {
  return axios.post(`${prefix}/actor/${type}_definitions/open`, params, config);
}
