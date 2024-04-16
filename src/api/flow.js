// import axios from '@/utils/request';
// const prefix = '';
import axios from '@/utils/gateway-request';
const prefix = '/ds_task';

/**
 * 工作流分页列表
 * @param {*} data
 *
 */
export function getWorkflowList(data) {
  return axios.post(`${prefix}/workflow/page`, data);
}
/**
 * 获取最近几个运行实例
 * @param {*} data
 *
 */
export function getWorkflowInstance(data) {
  return axios.post(`/pipeline/workflow/instance/latest`, data);
}
/**
 * 获取工作流内所有下游任务
 * @param {*} data
 *
 */
export function getDowntasks(params) {
  return axios.get(`${prefix}/workflow/down/task/list`, { params });
}
/**
 * 获取工作流列表下次执行时间
 * @param {*} data
 *
 */
export function getNextdate(data) {
  return axios.post(`/pipeline/workflow/nextdate/list`, data);
}
/**
 * 工作流补数
 * @param {*} data
 *
 */
export function backfill(data) {
  return axios.post(`/pipeline/workflow/backfill`, data);
}
/**
 * 上线工作流
 * @param {*} data
 *
 */
export function turnOnWorkflow(data) {
  return axios.post(`${prefix}/workflow/turnOn`, data);
}
/**
 * 下线工作流
 * @param {*} data
 *
 */
export function turnOffWorkflow(data) {
  return axios.post(`${prefix}/workflow/turnOff`, data);
}
/**
 * 删除工作流
 * @param {*} data
 *
 */
export function deleteWorkflow(data) {
  return axios.post(`${prefix}/workflow/deleteOne`, data);
}
/**
 * 工作流版本分页列表
 * @param {*} data
 *
 */
export function getWorkflowVersion(data) {
  return axios.post(`${prefix}/workflow/version/page`, data);
}
/**
 * 切换工作流版本
 * @param {*} data
 *
 */
export function switchVersion(data) {
  return axios.post(`${prefix}/workflow/version/switch`, data);
}
/**
 * 历史任务查询列表
 * @param {*} data
 *
 */
export function searchTask(params) {
  return axios.get(`${prefix}/task/search`, { params });
}
/**
 * 获取crontab
 * @param {*} data
 *
 */
export function getCron(data) {
  return axios.post(`${prefix}/workflow/cron`, data);
}
/**
 * 新建工作流
 * @param {*} data
 *
 */
export function addWorkflow(data) {
  return axios.post(`${prefix}/workflow/addOne`, data);
}
/**
 * 编辑工作流
 * @param {*} data
 *
 */
export function editWorkflow(data) {
  return axios.post(`${prefix}/workflow/updateOne`, data);
}
/**
 * 获取工作流详情
 * @param {*} data
 *
 */
export function getWorkflowInfo(data) {
  return axios.post(`${prefix}/workflow/version/info`, data);
}
/**
 * 获取工作流明细血缘图
 * @param {*} data
 *
 */
export function getWorkflowRelation(data) {
  return axios.post(`/pipeline/workflow/lineagechart`, data);
}
/**
 * 获取工作流编辑血缘图
 * @param {*} data
 *
 */
export function getWorkflowDraw(data) {
  return axios.post(`/pipeline/workflow/draw`, data);
}
/**
 * 获取工作流网格图
 * @param {*} data
 *
 */
export function getGridChart(data) {
  return axios.post(`/pipeline/workflow/gridchart`, data);
}
/**
 * 获取工作流折线图
 * @param {*} data
 *
 */
export function getLineChart(data) {
  return axios.post(`/pipeline/workflow/linechart`, data);
}
/**
 * 获取工作流所有实例ID
 * @param {*} data
 *
 */
export function getInstanceId(data) {
  return axios.post(`/pipeline/workflow/instance/date/list`, data);
}
/**
 * 获取工作流明细血缘图
 * @param {*} data
 *
 */
export function getInstanceChart(data) {
  return axios.post(`/pipeline/workflow/lineagechart`, data);
}
/**
 * 获取工作流明细甘特图
 * @param {*} data
 *
 */
export function getInstanceGantt(data) {
  return axios.post(`/pipeline/workflow/ganttchart`, data);
}
/**
 * 重算工作流内任务
 * @param {*} data
 *
 */
export function clearTask(data) {
  return axios.post(`/pipeline/workflow/taskinstance/batch/clear`, data);
}
/**
 * 获取任务实例的基础信息
 * @param {*} data
 *
 */
export function getBaseInfo(data) {
  return axios.post(`/pipeline/workflow/taskinstance/baseinfo`, data);
}
/**
 * 获取工作流实例的表格数据
 * @param {*} data
 *
 */
export function getInstanceList(data) {
  return axios.post(`/pipeline/workflow/instance/list`, data);
}
/**
 * 批量获取任务list
 * @param {*} data
 *
 */
export function getTaskBatch(data) {
  return axios.post(`${prefix}/task/batch/get`, data);
}
/**
 * 获取删除任务的下游列表
 * @param {*} data
 *
 */
export function getDelTasks(params) {
  return axios.get(`${prefix}/workflow/down/task/listByTaskIds`, { params });
}
/**
 * 检查生成数据集是否重复
 * @param {*} data
 *
 */
export function checkOutput(data) {
  return axios.post(`${prefix}/task/output/check/exist`, data);
}
