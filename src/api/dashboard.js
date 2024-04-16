import axios from '@/utils/gateway-request';

/**
 * 动态
 * @param
 * @returns
 */
export function list(params) {
  return axios.get(`/ds_task/announcement/list`, { params });
}

// 公告列表
export function page(params) {
  return axios.get('/ds_task/announcement/page', { params });
}

// 公告详情
export function detail(params) {
  return axios.get('/ds_task/announcement/get', { params });
}

// 新建公告
export function add(params) {
  return axios.post('/ds_task/announcement/add', params);
}

// 编辑公告
export function update(params) {
  return axios.put('/ds_task/announcement/update', params);
}

// 删除公告
export function deleteAnn(params) {
  return axios.delete('/ds_task/announcement/delete', { params });
}

// 上线下线公告
export function onlineOffline(params) {
  return axios.get('/ds_task/announcement/online/offline', { params });
}

// 任务概况统计
export function taskStatistics(params) {
  return axios.get('/ds_task/home/task/statistics', { params });
}

// 查询概况统计
export function queryStatistics(params) {
  return axios.get('/ds_task/home/query/statistics', { params });
}

// 数据资产
export function asset(params) {
  return axios.get('/ds_task/home/data/asset', { params });
}

// 关键指标
export function key(params) {
  return axios.get('/ds_task/home/key', { params });
}

// 综合评分
export function score(params) {
  return axios.get('/ds_task/home/overall/score', { params });
}

// 表高频访问
export function topTable(params) {
  return axios.get('/ds_task/home/top/table', { params });
}

// 扫描量 top
export function topScan(params) {
  return axios.get('/ds_task/home/top/scan', { params });
}

// 查询时长 top
export function topExecution(params) {
  return axios.get('/ds_task/home/top/execution', { params });
}
