import axios from '@/utils/gateway-request';

/**
 * 获取某个任务实例历史个数
 * @param
 * @returns
 */
export function getTaskDateList(params) {
  return axios.get(`/pipeline/task/dagid/count`, { params });
}
/**
 * 获取某一任务的实例日期
 * @param
 * @returns
 */
export function getSnapshotList(params) {
  return axios.get(`/pipeline/task/instance/dates`, { params });
}

/**
 * 数据血缘获取数据
 * @param
 * @returns
 */
export function getLineageData(params) {
  return axios.get(`/pipeline/task/data/lineage`, { params });
}

/**
 * 链路分析 柱状图数据获取
 * @param
 * @returns
 */
export function getAnalysisData(params) {
  return axios.get(`/pipeline/task/data/link/analysis`, { params });
}

/**
 * 启动弹窗 保存
 * @param
 * @returns
 */
// export function startTask(params) {
//   return axios.patch(`/task/start`, null, { params });
// }
