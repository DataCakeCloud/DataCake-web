import axios from '@/utils/gateway-request';

export function getConfig(params) {
  return axios.get(`/ds_task/tenant/get`, { params });
}

export function updateConfig(params) {
  return axios.put(`/ds_task/tenant/update`, params);
}
export function addToken(params) {
  return axios.post(`/ds_task/wechatAlert/add`, params);
}
export function updateToken(params) {
  return axios.post(`/ds_task/wechatAlert/update`, params);
}
export function deleteToken(params) {
  return axios.delete(`/ds_task/wechatAlert/deleteWechat`, { params });
}
export function getTokenList(params) {
  return axios.post(`/ds_task/wechatAlert/getWechat`, params);
}
