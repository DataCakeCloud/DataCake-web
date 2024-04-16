import axios from '@/utils/gateway-request';

/**
 * 分页查询列表
 * @param {*} params
 * @returns
 */
export function getAuditList(params) {
  return axios.get(`/ds_task/operate/page`, { params });
}

/**
 * 导出列表
 * @param {*} params
 * @returns
 */
export function exportAuditList(params) {
  return axios.get(`/ds_task/operate/dump`, { params });
}
export function functionListApi(params) {
  return axios.post(`/ds_task/audit/function`, params);
}
export function dataListApi(params) {
  return axios.post(`/ds_task/audit/data`, params);
}
export function getUriList(uri) {
  return axios.get('/ds_task/audit/uriMap', { params: { uri }});
}
export function getEventList(params) {
  return axios.get('/ds_task/audit/moduleEvent', { params });
}
