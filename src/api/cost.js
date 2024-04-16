import axios from '@/utils/gateway-request';
// import request from '@/utils/request6';

const prefix = '/ds_task/cost';

// 下拉查询
export function listDictionary(params) {
  return axios.post(`${prefix}/listDictionary`, params);
}
// 成本用量列表
export function stat(params) {
  return axios.post(`${prefix}/stat`, params);
}

// 监控任务保存和编辑
export function saveEdit(params) {
  return axios.post(`${prefix}/job/saveEdit`, params);
}

// 监控任务删除
export function jobDelete(params) {
  return axios.get(`${prefix}/job/delete`, { params });
}

// 监控任务查询
export function jobList(params) {
  return axios.get(`${prefix}/job/list`, { params });
}

// 成本监控任务通知查询
export function noticeList(params) {
  return axios.post(`${prefix}/job/noticeList`, params);
}

/** ********************************************* 2.0 */
// 首页成本接口
// reportType: 1:累计总成本, 2:占比计费项, 3: 占比租户/group, 4:波动, 5:变化, 6:成本分, 7:账单 , 8:下拉框, 9:
// queryGroup 查询分组 COSTTYPE(1,"计费项"),TENANT(2,"租户"),GROUP(3,"group  业务"),OWNER(4,"owner"),JOB(5,"任务")     ,JOBTAG(6,"任务标签"), JOBMODE(7,"任务模式"),BUCKETGROUP(8,"桶group"),BUCKET(9,"桶"),QUERYID(10,"查询id")     ,INSTANSE(11,"机型"), CLUSTER(12,"集群"),SHARE(13,"分摊项"),REGION(14,"区域"),
export function homeRequest(params) {
  return axios.post(`/cost/home/request`, params);
}

// 下拉查询
// 1 计费项 2租户 3group 4 job 5 任务标签 6任务模式 7 桶group 8 桶 9 查询id 10 机型 11 集群12 为分摊项 13 区域 14owner
export function costListDictionary(params) {
  return axios.post(`/cost/listDictionary`, params);
}

// 报告删除
export function reportDel(params) {
  return axios.post(`/cost/report/del`, params);
}

// 报告编辑
export function reportSave(params) {
  return axios.post(`/cost/report/save`, params);
}

// 报告另存为
export function reportSaveAs(params) {
  return axios.post(`/cost/report/saveAs`, params);
}

// 报告管理列表
export function reportList(params) {
  return axios.post(`/cost/report/list`, params);
}

// 报告详情
export function reportGetById(params) {
  return axios.post(`/cost/report/getById`, params);
}

// 报告历史
export function reportHistory(params) {
  return axios.post(`/cost/report/history`, params);
}
