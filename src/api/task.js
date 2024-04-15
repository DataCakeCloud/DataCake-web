import axios from '@/utils/gateway-request';

const prefix = '/ds_task/task';

/**
 * 获取数据集级联数据
 * @param
 * @returns
 */
export function getDataSetList(data) {
  return axios.post(`/ds_task/metadata/search`, data);
}

/**
 * 获取任务类型数据
 * @param
 * @returns
 */
export function getTemplateList() {
  return axios.get(`/ds_task/sysdict/getTemplateList`);
}

/**
 * 获取数据粒度数据
 * @param
 * @returns
 */
export function getGranularityList(params) {
  return axios.get(`/ds_task/dict/list`, { params });
}

/**
 * 获取运行状态数据
 * @param
 * @returns
 */
export function getStatusCodeList() {
  return axios.get(`/ds_task/sysdict/list`, { params: { parentCode: 'RUNTIME_STATUS' }});
}

/**
 * 获取目录树
 * @param
 * @returns
 */
export function getCatalog() {
  return axios.get(`${prefix}/catalog`);
}

/**
 * 获取Jar文件下拉数据
 * @param
 * @returns
 */
export function getArtifactList(params) {
  return axios.get(`/ds_task/artifact/list`, { params });
}

/**
 * 获取Jar版本下拉数据
 * @param
 * @returns
 */
export function getVersionList(params) {
  return axios.get(`/ds_task/artifactversion/list`, { params });
}

/**
 * 获取Cluster下拉数据
 * @param
 * @returns
 */
export function getClusterList(params) {
  return axios.get(`/ds_task/flinkcluster/list`, { params });
}
export function getClusterAuto(params) {
  return axios.get(`/ds_task/flinkcluster/auto`, { params });
}
export function getClusterNotauto(params) {
  return axios.get(`/ds_task/flinkcluster/noauto`, { params });
}

/**
 * 获取单条任务数据
 * @param
 * @returns
 */
export function getTaskInfo(params) {
  return axios.get(`${prefix}/get`, { params });
}

/**
 * 获取部门列表
 * @param {string} name
 * @returns
 */
export function getDepList(name = '') {
  return axios.get(`${prefix}/getdepts`, { params: { name }});
}

/**
 * 增加部门
 * @param {object} dep
 * @returns
 */
export function addDep(dep) {
  return axios.post(`${prefix}/adddept`, dep);
}

/**
 * 修改部门
 * @param {object} dep
 * @returns
 */
export function updateDep(dep) {
  return axios.put(`${prefix}/updatedept`, dep);
}

/**
 * 删除部门
 * @param {number} id
 * @returns
 */
export function deleteDep(id) {
  return axios.delete(`${prefix}/deletedept`, { id });
}

/**
 * 分页查询任务列表
 * @param {string} name
 * @param {string} statusCode
 * @param {string} tenplateCode
 * @param {string} createBy
 * @param {number} startTime
 * @param {number} endTime
 * @param {string} devStatus
 * @param {number} catalogId
 * @returns {object}
 */
// keyWord = '', statusCode = '', tenplateCode = '', createBy = '', startTime = 0, endTime = 0, devStatus = '', catalogId = 0
export function getTaskListByPage(params) {
  return axios.get(`${prefix}/page`, { params });
}

/**
 * 根据数据集生成DDL
 * @param
 * @returns
 */
export function getDdl(data) {
  // return axios.get(`${prefix}/getddl`, { params });
  return axios.post(`/ds_task/metadata/getddl`, data);
}
/**
 * 根据表名称获取SQL
 * @param
 * @returns
 */
export function getSql(params) {
  return axios.get(`${prefix}/getInsertSql`, { params });
}

/**
 * 根据数据集生成DDL
 * @param
 * @returns
 */
export function getDisplayDdl(data) {
  // return axios.get(`${prefix}/getdispalyddl`, { params });
  return axios.post(`/ds_task/metadata/getdispalyddl`, data);
}

/**
 * 获取下游依赖数据
 * @param {number} id
 * @returns
 */
export function getChildDependencies(id) {
  return axios.get(`${prefix}/getChildDependencies`, { params: { id }});
}

/**
 * 获取任务详情
 * @param {number} id
 * @returns
 */
export function getTaskDetail(id) {
  return axios.get(`${prefix}/detail`, { params: { id }});
}

/**
 * 任务补数
 * @param {number} id
 * @param {number} startTime
 * @param {number} endTime
 * @returns
 */
export function backfill(params) {
  return axios.get(`${prefix}/backfill`, { params });
}

/**
 * 修改任务状态
 * @param {number} id
 * @param {number} statsus
 * @returns
 */
export function changeStatus(params) {
  return axios.put(`${prefix}/onlineAndOffline`, null, { params });
}

/**
 * 新增任务
 * @param {object} task
 * @returns
 */
export function addTask(task) {
  return axios.post(`${prefix}/add`, task);
}

/**
 * 修改任务
 * @param {object} task
 * @returns
 */
export function updateTask(task) {
  return axios.put(`${prefix}/update`, task);
}

/**
 * 删除任务
 * @param {number} id
 * @returns
 */
export function deleteTask(params) {
  return axios.delete(`${prefix}/new/delete`, { params });
}

/**
 * 获取血缘图数据
 * @param {number} params
 * @returns
 */
export function getDependencies(params) {
  return axios.get(`${prefix}/getDependencies`, { params });
}
/**
 * 获取血缘图数据
 * @param {object} params
 * @returns
 */
export function getNextTasks(params) {
  return axios.get(`${prefix}/upanddown`, { params });
}
/**
 * 获取用户基本信息
 * @param {string} name
 * @returns
 */
export function getUserList(name) {
  return axios.get('/ds_task/user/list', { params: { name }});
}
/**
 * 获取标签列表
 * @param {string} name
 * @returns
 */
export function getLabelList(name) {
  return axios.get('/ds_task/label/list', { params: { name }});
}
/**
 * 获取标签详情
 * @param {string} name
 * @returns
 */
export function getLabelInfo(id) {
  return axios.get('/ds_task/label/get', { params: { id }});
}
/**
 * 新增标签
 * @param data
 * @returns
 */
export function addLabel(data) {
  return axios.post('/ds_task/label/add', data);
}
/**
 * 更新标签
 * @param data
 * @returns
 */
export function updateLabel(data) {
  return axios.put('/ds_task/label/update', data);
}
/**
 * 删除标签
 * @param data
 * @returns
 */
export function deleteLabel(id) {
  return axios.delete('/ds_task/label/delete', { params: { id }});
}
/**
 * 收藏标签
 * @param
 * @returns
 */
export function collectLabel(params) {
  return axios.patch(`/ds_task/collect/add`, null, { params });
}
/**
 * 取消标签
 * @param {string} params
 * @returns
 */
export function cancelLabel(params) {
  return axios.get('/ds_task/collect/cancel', { params });
}
/**
 * 我的收藏标签
 * @param {string} params
 * @returns
 */
export function myLabel(params) {
  return axios.get('/ds_task/collect/my', { params });
}
/**
 * 获取任务列表
 * @param {string} name
 * @returns
 */
export function getListForLabel(name) {
  return axios.get('/ds_task/task/listforlabel', { params: { name }});
}
/**
 * 复制任务保存
 * @param {string} params
 * @returns
 */
export function copyTask(params) {
  return axios.get('/ds_task/task/copy', { params });
}
/**
 * 获取huawei iam列表
 * @param {string} params
 * @returns
 */
export function getIam(params) {
  return axios.get('/ds_task/task/iam', { params });
}
/**
 * 校验SQL
 * @param {string} params
 * @returns
 */
export function check(data) {
  return axios.post('/ds_task/task/check', data);
}
/**
 * 模糊查询
 * @param {string} name
 * @returns
 */
export function searchName(name) {
  return axios.get('/ds_task/task/name/search', { params: { name }});
}
/**
 * 获取统计数量
 * @param
 * @returns
 */
export function getCount(params) {
  return axios.get('/ds_task/task/countall', { params });
}
/**
 * 判断是否是管理员
 * @param
 * @returns
 */
// export function getAdmin(params) {
//   return axios.get('/user/admin', { params });
// }
/**
 * 获取依赖概述
 * @param {string} tableName 表名
 * @returns
 */
export function getDepend(tableName) {
  return axios.get('/ds_task/task/getDependenciesOverview', { params: { tableName }});
}
/**
 * 根据输出数据查询任务
 * @param {string} tableName 表名
 * @returns
 */
export function getTaskName(output) {
  return axios.get('/ds_task/task/selectbyoutputguid', { params: { output }});
}
/**
 * 根据输入数据集查询数据
 * @param {string} params
 * @returns
 */
export function getDatasetInfo(params) {
  return axios.get('/ds_task/task/backfillDateDetail', { params });
}
/**
 * 获取列表运行状态
 * @param {string} params
 * @returns
 */
export function getTaskInstance(params) {
  return axios.get('/ds_task/task/last7', { params });
}
/**
 * 获取成本归属部门
 * @param {string} name
 * @returns
 */
export function getCostList(name) {
  return axios.get('/ds_task/user/getEffectiveCostList', { params: { name }});
}
/**
 * 获取git sql
 * @param {string} params
 * @returns
 */
export function getGitSql(params) {
  return axios.get('/ds_task/task/getGitSqlFile', { params });
}
/**
 * 根据 sql 获取库表
 * @param {string} params
 * @returns
 */
export function getSqlTbls(data) {
  return axios.post('/ds_task/task/sqlTbls', data, { headers: { 'Content-Type': 'multipart/form-data' }});
}
/**
 * 获取crontab表达式
 * @param {string} data
 * @returns
 */
export function getCrontab(data) {
  return axios.post('/ds_task/task/getCrontab', data);
}
/**
 * 获取偏移量
 * @param {string} data
 * @returns
 */
export function getOffset(data) {
  return axios.post('/ds_task/task/getOffset', data, { headers: { 'Content-Type': 'multipart/form-data' }});
}
/**
 * 获取版本信息
 * @param {string} params
 * @returns
 */
export function getVersion(params) {
  return axios.get('/ds_task/taskversion/pages', { params });
}
/**
 * 获取版本信息的操作类型列表
 * @returns
 */
export function getEventCode() {
  return axios.get('/ds_task/auditlog/type?module=task');
}
/**
 * 切换版本
 * @param {string} params
 * @returns
 */
export function switchVersion(params) {
  return axios.get('/ds_task/taskversion/verionSwitch', { params });
}
/**
 * 任务模板添加并发布
 * @param {string} data
 * @returns
 */
export function addAndStart(data) {
  return axios.post('/ds_task/task/addAndStart', data);
}
/**
 * 任务模板更新并发布
 * @param {string} data
 * @returns
 */
export function updateAndStart(data) {
  return axios.post('/ds_task/task/updateAndStart', data);
}
/**
 * 前置依赖日期预览
 * @param {string} data
 * @returns
 */
export function preview(data) {
  return axios.post('/ds_task/task/date/preview', data);
}
/**
 * 新增小文件合并
 * @param {string} data
 * @returns
 */
export function addMerge(data) {
  return axios.post('/ds_task/task/mergeSmallFiles', data);
}
/**
 * 更新小文件合并
 * @param {string} data
 * @returns
 */
export function updateMerge(data) {
  return axios.post('/ds_task/task/updateMergeSmallFiles', data);
}
/**
 * 根据区域获取地址
 * @param {string} params
 * @returns
 */
export function getJarUrl(data) {
  return axios.post('/ds_task/task/mergeSmallFiles/jars', data);
}
/**
 * 获取任务
 * @param {string} params
 * @returns
 */
export function getTasks(data) {
  return axios.post('/ds_task/task/getTasks', data);
}
/**
 * 检验成功标志路径
 * @param {string} params
 * @returns
 */
export function checkSuccess(data) {
  return axios.post('/ds_task/task/checkPath', data, { headers: { 'Content-Type': 'multipart/form-data' }});
}

/**
 * 手动执行任务
 */
export function customRunTask(data) {
  return axios.post('/ds_task/task/fastBackfill?taskId=' + data.taskId, data);
}

export function getLiveTable(params) {
  return axios.get('/ds_task/task/renderContent', { params });
}
export function getPreviewData(params) {
  return axios.post(`/ds_task/metadata/preview`, params);
}
export function getSourceOrDestination(params) {
  return axios.get('/ds_task/actor/sources/page', { params });
}
export function getSaveFolderTree(params) {
  return axios.get('/ds_task/taskfolder/listFolder', { params });
}
export function addFolder(params) {
  return axios.post('/ds_task/taskfolder/saveFolder', params);
}
export function delFolder(params) {
  return axios.get('/ds_task/taskfolder/deleteFolder', { params });
}
export function editFolderName(params) {
  return axios.post('/ds_task/taskfolder/editFolder', params);
}
export function getTaskLabelInfo(params) {
  return axios.get('/ds_task/taskfolder/listTask', { params });
}
export function updateFolderTask(params) {
  return axios.post('/ds_task/taskfolder/updateTask', params);
}
export function getTokenSelect(id) {
  return axios.get(`/ds_task/wechatAlert/listById?id=${id}`);
}
export function getCronTime(params) {
  return axios.post('/pipeline/cron/get', params);
}
export function getTemplate(params) {
  return axios.get('/ds_task/task/templateRendering', { params });
}
export function getDownstreamTask(params) {
  return axios.get('/ds_task/task/downstreamTask', { params });
}
