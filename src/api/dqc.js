import axios from '@/utils/gateway-request';

const metricPrefix = '/sla-service/metric';
const templatePrefix = '/sla-service/template';

// 添加DQC监控
export function MetricAdd(params) {
  return axios.post(`${metricPrefix}/add`, params);
}

// 更新DQC监控
export function MetricUpdate(params) {
  return axios.post(`${metricPrefix}/update`, params);
}

// DQC监控详情
export function MetricInfo(params) {
  return axios.get(`${metricPrefix}/info`, { params });
}

// DQC监控报告
export function MetricReport(params) {
  return axios.get(`${metricPrefix}/report`, { params });
}

// 开启/关闭DQC监控
export function MetricActive(params) {
  return axios.get(`${metricPrefix}/active`, { params });
}

// 删除DQC监控
export function MetricDelete(params) {
  return axios.get(`${metricPrefix}/delete`, { params });
}

// DQC监控分页列表
export function MetricPages(params) {
  return axios.get(`${metricPrefix}/pages`, { params });
}
/** *********************************************************** **/

// 添加模板
export function templateAddItem(params) {
  return axios.post(`${templatePrefix}/addItem`, params);
}

// 修改模板
export function templateUpdateItem(params) {
  return axios.post(`${templatePrefix}/updateItem`, params);
}

// 模板详情
export function templateInfo(params) {
  return axios.get(`${templatePrefix}/info`, { params });
}

// 删除模板
export function templateDelete(params) {
  return axios.get(`${templatePrefix}/delete`, { params });
}

// 模板分页列表
export function templatePages(params) {
  return axios.get(`${templatePrefix}/pages`, { params });
}
