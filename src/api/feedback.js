import axios from '@/utils/gateway-request';

const prefix = '/ds_task/feedback';

/**
 * 新增反馈
 * @param {object} data
 * @returns
 */
export function saveFeedback(data, config) {
  return axios.post(`${prefix}/save`, data, config);
}
/**
 * 获取反馈列表
 * @param {object} params
 * @returns
 */
export function getFeedbackList(params) {
  return axios.get(`${prefix}/pages`, { params });
}
/**
 * 修改解决方案
 * @param {object} data
 * @returns
 */
export function modifyFeedback(data) {
  return axios.post(`${prefix}/modify`, data);
}
/**
 * 受理工单
 * @param {object} data
 * @returns
 */
export function acceptFeedback(data) {
  return axios.post(`${prefix}/accept`, data);
}
/**
 * 转让工单
 * @param {object} data
 * @returns
 */
export function assignFeedback(data) {
  return axios.post(`${prefix}/assign`, data);
}
/**
 * 关闭工单
 * @param {object} data
 * @returns
 */
export function closeFeedback(data) {
  return axios.post(`${prefix}/close`, data);
}
/**
 * 工单评分
 * @param {object} data
 * @returns
 */
export function scoreFeedback(data) {
  return axios.post(`${prefix}/score`, data);
}
/**
 * 获取工单相信
 * @param {object} params
 * @returns
 */
export function getDetail(params) {
  return axios.get(`/ds_task/feedbackdetail/getDetailInformation`, { params });
}
/**
 * 更新工单信息
 * @param {object} params
 * @returns
 */
export function updateInfo(params) {
  return axios.get(`${prefix}/updateAndSelect`, { params });
}
/**
 * 发送消息
 * @param {object} data
 * @returns
 */
export function sendMessage(data, config) {
  return axios.post(`/ds_task/feedbackdetail/messageSend`, data, config);
}
/**
 * 工单重开
 * @param {object} params
 * @returns
 */
export function reopenFeedback(params) {
  return axios.get(`${prefix}/reopen`, { params });
}
/**
 * 下载导出
 * @param {object} data
 * @returns
 */
export function exportFeedback(params) {
  return axios.get(`${prefix}/export`, { params, responseType: 'blob' });
}
/**
 * 新增用户反馈
 * @param {object} data
 * @returns
 */
export function saveAdvice(data, config) {
  return axios.post(`/ds_task/advice/save`, data, config);
}
