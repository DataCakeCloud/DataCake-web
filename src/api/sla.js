import axios from '@/utils/gateway-request';

const prefix = '/sla-service/sla';

/**
 * 获取数据集级联数据
 * @param
 * @returns
 */
export function getDataSetList(params) {
  return axios.get(`/sla-service/metadata/dataset/searchDataset`, { params });
}
/**
 * 获取hive表数据
 * @param
 * @returns
 */
export function getDataSetColumns(params) {
  return axios.get(`/sla-service/metadata/dataset/get`, { params });
}

/**
 * 获取大盘关键指标
 * @param {object} params
 */
export function getSummary(params) {
  return axios.get(`${prefix}/getSummary`, { params });
}
/**
 * 获取监控列表
 * @param {object} params
 */
export function getItemList(params) {
  return axios.get(`${prefix}/getItems`, { params });
}
/**
 * 更改监控启动状态
 * @param {object} params
 */
export function activeItem(params) {
  return axios.get(`${prefix}/activeItem`, { params });
}

// 获取SLA监控失败但仍未恢复
export function failedButUnrecovered(params) {
  return axios.post(`${prefix}/failedButUnrecovered`, params);
}

// 获取SLA监控数据概览
export function dataOverview(params) {
  return axios.get(`${prefix}/dataOverview`, { params });
}

// 获取SLA监控log列表
export function logList(params) {
  return axios.get(`${prefix}/logList`, { params });
}

// 获取SLA监控统计
export function monitorStatistic(params) {
  return axios.get(`${prefix}/monitorStatistic`, { params });
}

// 获取SLA监控统计top10
export function failedMonitorTop(params) {
  return axios.get(`${prefix}/failedMonitorTop`, { params });
}

// 获取 SLA 分页列表
export function slaPages(params) {
  return axios.get(`${prefix}/pages`, { params });
}

// 查询名称列表
export function slaList(params) {
  return axios.get(`${prefix}/list`, { params });
}

// 获取 SLA 监控详情
export function slaInfo(params) {
  return axios.get(`${prefix}/info`, { params });
}

// 添加 SLA 监控
export function addItem(params) {
  return axios.post(`${prefix}/addItem`, params);
}

// 更新 SLA 监控
export function updateItem(params) {
  return axios.post(`${prefix}/updateItem`, params);
}
