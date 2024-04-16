import axios from '@/utils/gateway-request';

export function getEngineList() {
  return axios.get('/qe/qe/configuration/engine');
}

export function getGroupList() {
  return axios.get('/qe/configuration/group');
}

export function getCatalogList(params) {
  return axios.get('/qe/metadata/catalog', { params });
}

export function getDbList(params) {
  return axios.get('/qe/metadata/database', { params });
}

export function getTableList(params) {
  return axios.get('/qe/metadata/table', { params });
}

export function getTableCols(params) {
  return axios.get('/qe/metadata/column', { params });
}

// 执行SQL
export function execute(data) {
  return axios.post('/qe/query/execute', data, { timeout: 1000 * 3600 * 5 }); // 执行SQLtimeout设为5小时
}

export function cancel(uuid) {
  return axios.get('/qe/query/cancel?uuid=' + uuid);
}
export function download(params, config = {}) {
  return axios.get('/qe/query/download', { params, response_type: 'blob', ...config });
}
export function downloadFile(params) {
  return axios.get('/qe/query/downloadFile', { params });
}
export function validOlap(uuid) {
  return axios.get('/qe/query/fromOlap', { params: { uuid }});
}
export function lookJournal(uuid) {
  return axios.get('/qe/query/logs?uuid=' + uuid);
}

export function getDataById(uuid) {
  return axios.get('/qe/query/history/data', { params: { uuid }});
}

export function getHistorySql(uuid) {
  return axios.get('/qe/query/history/sql', { params: { uuid }});
}

// 获取已保存的sql信息
export function getSaveSql(ids) {
  return axios.get('/qe/query/share', { params: { ids }});
}

export function add(data) {
  return axios.post('/qe/savedQuery/add', data);
}
export function update(data) {
  return axios.put('/qe/savedQuery/update', data);
}
// 保存的列表
export function savedQueryList(params) {
  return axios.get('/qe/savedQuery/all', { params });
}
// 删除保存的查询
export function deleteQuery(params) {
  return axios.delete('/qe/savedQuery/deleteBatch', { params });
}
// 历史查询的列表
export function historyQueryList(params) {
  return axios.get('/qe/queryHistory/all', { params });
}
// 用户引擎列表
export function engineConfigList(params) {
  return axios.get('/qe/engineAuth/all', { params });
}
// 全部引擎列表
export function engineAuthList() {
  return axios.get('/qe/engineAuth/engines');
}
// 全部DS用户
export function getAuthList() {
  return axios.get('/qe/engineAuth/users');
}
export function addEngineConfig(data) {
  return axios.post('/qe/engineAuth/add', data);
}
export function updateEngineConfig(data) {
  return axios.put('/qe/engineAuth/update', data);
}
// 删除保存的查询
export function deleteConfig(id) {
  return axios.delete(`/qe/engineAuth/delete?id=${id}`);
}
export function clearCache() {
  return axios.get('/qe/metadata/clearCache');
}

// 表名重复校验
export function nameCheck(params) {
  return axios.get('/qe/tempTable/nameCheck', { params });
}

// 临时表上传文件
export function uploadFile(data, config) {
  return axios.post('/qe/tempTable/upload/new', data, config);
}
// 临时表补充文件上传文件
export function overwriteFile(data, config) {
  return axios.post('/qe/tempTable/upload/overwrite', data, config);
}
// 创建临时表
export function createTempTable(data) {
  return axios.post('/qe/tempTable/create', data);
}
// 数据探查
export function dataExplore(params) {
  return axios.get('/qe/probe/data', { params });
}
// 数据预估扫描
export function dataScanSize(data) {
  return axios.post('/qe/probe/scan', data, { timeout: 1000 * 60 * 10 });
}
// "已生成的API"页面列表查询
export function getDataServiceApiList(params) {
  return axios.get('/qe/dataService/api/all', { params });
}
// API上线/下线
export function dataServiceStatus(data) {
  return axios.put('/qe/dataService/api/status', data);
}
// 删除API
export function delDataServiceApi(id) {
  return axios.delete('/qe/dataService/api/deleteBatch?id=' + id);
}
// API名称唯一性校验
export function dataServiceApiNameCheck(params) {
  return axios.get('/qe/dataService/api/nameCheck', { params });
}
// 生成API
export function addDataServiceApi(data) {
  return axios.post('/qe/dataService/api/add', data);
}
// 更新API
export function updateDataServiceApi(data) {
  return axios.put('/qe/dataService/api/update', data);
}
// 保存定时调度信息
export function addDispatchMsg(data) {
  return axios.post('/qe/dataEngineer/add', data);
}
// 语法转换
export function sqlTransfer(data) {
  return axios.post(`/qe/query/transferBase64`, data);
}
// 提取定时调度信息
export function getRegionAndSql(params) {
  return axios.get('/qe/dataEngineer/getInfo', { params });
}
// 获取mysql引擎下的下载量
export function getFileSize(params) {
  return axios.get('/qe/query/fileSize', { params });
}
// 获取sql是否加速的状态
export function accelerateType(data) {
  return axios.post(`/sharesql/databend/available`, data);
}
// 判断表是否符合加速要求
export function accRequirements(data) {
  return axios.post(`/sharesql/acc/available`, data);
}
// 创建加速表任务
export function creatAcceleration(data) {
  return axios.post(`/sharesql/acc/create`, data);
}
// 查询加速任务列表
export function getAccelerationList(params) {
  return axios.get(`/sharesql/acc/list`, { params });
}
// 删除加速表
export function deleteAcceleration(params) {
  return axios.get(`/sharesql/acc/delete`, { params });
}
// 获取保存的文件夹结构
export function getSaveFolderTree(params) {
  return axios.get(`/qe/classification/tree`, { params });
}
// 移动文件夹
export function folderMove(data) {
  return axios.post(`/qe/classification/move`, data);
}
// 删除文件夹
export function delFolder(data) {
  return axios.post(`/qe/classification/delete`, data);
}
// 修改文件夹名称
export function editFolderName(data) {
  return axios.post(`/qe/classification/edit`, data);
}
// 新增文件夹
export function addFolder(data) {
  return axios.post(`/qe/classification/add`, data);
}
// 获取区域列表接口
export function getRegionList(params) {
  return axios.get(`/qe/configuration/regions`, { params });
}
// 获取数据源和引擎
export function getCatalogAndEngine(params) {
  return axios.get(`/qe/metadata/catalogAndEngine`, { params });
}
// 新增收藏数据表
export function addTuckTable(data) {
  return axios.post(`/qe/favortable/add`, data);
}
// 移除收藏数据表
export function delTuckTable(data) {
  return axios.post(`/qe/favortable/delete`, data);
}
// 获取收藏数据表列表
export function getTuckTableList(params) {
  return axios.get(`/qe/favortable/favortablelist`, { params });
}
// 新增分享
export function addShare(data) {
  return axios.post(`/qe/savedQuery/addShare`, data);
}
// 获取分享结果(权限)
export function getShareGrade(params) {
  return axios.get(`/qe/query/shareGrade`, { params });
}
// 删除chart
export function chartDel(data) {
  return axios.post(`/qe/chart/delete`, data);
}
// 收藏chart
export function addTuckChart(data) {
  return axios.post(`/qe/favordach/addfavor`, data);
}
// 取消收藏chart
export function chartTuckDel(data) {
  return axios.post(`/qe/favordach/delete`, data);
}
// 新增对其他用户分享chart接口
export function shaerChart(data) {
  return axios.post(`/qe/chart/addShare`, data);
}
// 保存chart
export function updateChart(data) {
  return axios.post(`/qe/chart/update`, data);
}
// 新增chart
export function addChart(data) {
  return axios.post(`/qe/chart/addchart`, data);
}
// 获取chart列表
export function getChartList(params) {
  return axios.get(`/qe/chart/chartlist`);
}
// 更新看板
export function updateDashboard(data) {
  return axios.post(`/qe/dashboard/update`, data);
}
// 删除看板
export function delDashboard(data) {
  return axios.post(`/qe/dashboard/delete`, data);
}
// 分享看板
export function shareDashboard(data) {
  return axios.post(`/qe/dashboard/addShare`, data);
}
// 新增看板
export function addDashboard(data) {
  return axios.post(`/qe/dashboard/adddash`, data);
}
// 获取chart数据
export function getChartData(params) {
  return axios.get(`/qe/chart/databack`, { params });
}
// 看板综合列表（目录树）
export function getDashboardTree(params) {
  return axios.get(`/qe/dashboard/sumlist`, { params });
}
// 看板列表
export function getDashboardList(params) {
  return axios.get(`/qe/dashboard/listdash`, { params });
}
// 获取jinja表达式对应日期
export function getJinjaTime(params) {
  return axios.get(`/qe/chart/jinja`, { params });
}
// 获取chart配置数据
export function getChartOptions(params) {
  return axios.get(`/qe/chart/view`, { params });
}
// 获取看板数据
export function getDashboardData(params) {
  return axios.get(`/qe/dashboard/view`, { params });
}
// 清楚chartList缓存
export function chartClearCache() {
  return axios.get(`/qe/chart/clearCache`);
}
// 新增看板文件夹
export function addDashboardFolder(data) {
  return axios.post(`/qe/classdash/add`, data);
}
// 修改看板文件夹名称
export function editDashboardFolderName(data) {
  return axios.post(`/qe/classdash/edit`, data);
}
// 删除看板文件夹
export function delDashboardFolder(data) {
  return axios.post(`/qe/classdash/delete`, data);
}
// 移动看板文件夹
export function moveDashboardFolder(data) {
  return axios.post(`/qe/classdash/move`, data);
}
// 获取QE执行进度
export function getProgress(params) {
  return axios.get(`/qe/query/statsInfo`, { params });
}
// 获取分享列表
export function getShares(params) {
  return axios.get(`/qe/query/getShares`, { params });
}
// 新建临时表
export function createFromResult(data) {
  return axios.post(`/qe/tempTable/createFromResult`, data);
}
// 获取表owner
export function getTableOwner(params) {
  return axios.get(`/qe/metadata/tableOwner`, { params });
}

// QE单表刷新
export function clearTableCache(params) {
  return axios.get(`/qe/metadata/clearCache`, { params });
}

// 获取QE的历史状态
export function getStatus(data) {
  return axios.post(`/qe/query/getStatus`, data);
}

// AIsql 聊天接口
export function aiServiceSend(data, config) {
  return axios.post(`/qe/aiService/chat`, data);
}

// AIsql 发送表结构接口
export function sendTableInfo(data) {
  return axios.post(`/qe/aiService/tableInfo`, data);
}

// 定时任务创建
export function createControl(data) {
  return axios.post(`/qe/cronQuery/create`, data);
}

// 定时任务的启停
export function suspendControl(data) {
  return axios.post(`/qe/cronQuery/changeStatus`, data);
}

// 定时任务管理列表
export function controlHistory(data) {
  return axios.post(`/qe/cronQuery/history`, data);
}

// hive获取日志
export function getLogs(params) {
  return axios.get(`/qe/query/logs`, { params });
}
