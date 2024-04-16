import axios from '@/utils/gateway-request';

/**
 * 获取任务详情
 * @param
 * @returns
 */
export function getTaskDetailPage(params) {
  return axios.get(`/ds_task/taskinstance/page`, { params });
}

/**
 * 任务重算
 * @param
 * @returns
 */
export function clearTask(params) {
  return axios.post(`/ds_task/taskinstance/clear`, null, { params });
}

/**
 * 任务停止
 * @param
 * @returns
 */
export function stopTaskInstace(params) {
  return axios.patch(`/ds_task/taskinstance/stop`, null, { params });
}

/**
 * 获取snapshot任务详情
 * @param
 * @returns
 */
export function getTaskSnapshotsPage(params) {
  return axios.get(`/ds_task/tasksnapshot/page`, { params });
}

/**
 * 获取指标UI地址
 * @param
 * @returns
 */
export function getMetricsUi(params) {
  return axios.get(`/ds_task/task/metricsui`, { params });
}

/**
 * 获取日志UI地址
 * @param
 * @returns
 */
export function getLogsUi(params) {
  return axios.get(`/ds_task/task/logsui`, { params });
}

/**
 * 获取服务UI地址
 * @param
 * @returns
 */
export function getServiceUi(params) {
  return axios.get(`/ds_task/task/serviceui`, { params });
}

/**
 * 获取启动应用版本列表
 * @param
 * @returns
 */
export function getVersionList(params) {
  return axios.get(`/ds_task/taskversion/list`, { params });
}

/**
 * 获取启动task列表
 * @param
 * @returns
 */
export function getSnapshotList(params) {
  return axios.get(`/ds_task/tasksnapshot/list`, { params });
}

/**
 * 启动弹窗 保存
 * @param
 * @returns
 */
export function startTask(params) {
  return axios.patch(`/ds_task/task/start`, null, { params });
}

/**
 * 暂停
 * @param
 * @returns
 */
export function stopTask(params) {
  return axios.patch(`/ds_task/task/stop`, null, { params });
}

/**
 * 取消
 * @param
 * @returns
 */
export function cancelTask(params) {
  return axios.patch(`/ds_task/task/cancel`, null, { params });
}

/**
 * savePoint 新增
 * @param {object} data
 * @returns
 */
export function addSnapshot(data) {
  return axios.post(`/ds_task/tasksnapshot/trigger`, data);
}
/**
 * 实例状态检测
 * @param
 * @returns
 */
export function diagnoseError(params) {
  return axios.get(`/ds_task/taskinstance/diagnose`, { params });
}
/**
 * 获取成本统计
 * @param
 * @returns
 */
export function getUrl(data) {
  return axios.post(`/ds_task/dashboard/getUrl`, data);
}
/**
 * ds报表权限申请
 * @param
 * @returns
 */
export function permission(data) {
  return axios.post(`/ds_task/dashboard/permission`, data);
}
/**
 * 获取实例SQL
 * @param
 * @returns
 */
export function getExeSql(params) {
  return axios.get(`/ds_task/taskinstance/exeSql/get`, { params });
}
/**
 * 获取实例运行记录
 * @param
 * @returns
 */
export function getRecord(data) {
  return axios.post(`/pipeline/taskinstance/record`, data);
}

// 获取日志信息
export function getLogInfo(params, config) {
  return axios.get(`/ds_task/task/instanceLog`, { params, ...config });
}

export function getOfflineDetailPage(params) {
  return axios.get(`/ds_task/taskinstance/offline_pages`, { params });
}

// 离线批量重算
export function batchClearFn(params) {
  return axios.post(`/ds_task/taskinstance/batch_clear`, params);
}
// 离线批量停止
export function batchStopFn(params) {
  return axios.post(`/ds_task/taskinstance/batch_stop`, params);
}
