import axios from '@/utils/gateway-request';
const prefix = '/metadata';

/* ********************************************************************** */

// metadata

/**
 * 获取元数据列表
 * @param {object} params
 * @returns
 */
export function getTableList(params) {
  return axios.get(`${prefix}/table/search`, { params });
}

/**
 * 数据角色列表
 * @param {*} params
 * @returns
 */
export function dataRolePage(params) {
  return axios.get(`${prefix}/role/showRoles`, { params });
}

/**
 * 授权
 * @param {*} params
 * @returns
 */
export function batchGrantPrivilegeToUser(params) {
  return axios.post(`${prefix}/role/batchGrantPrivilegeToUser`, params);
}

/**
 * 数据库授权
 */
export function grantPrivilegeToRoleOnDB(params) {
  return axios.post(`${prefix}/role/grantPrivilegeToRoleOnDB`, params);
}

/**
 * 获取历史搜索
 * @param {object} params
 * @returns
 */
export function getHistorySearch(params) {
  return axios.get(`${prefix}/history/input`, { params });
}
/**
 * 删除历史搜索
 * @param {object} params
 * @returns
 */
export function delHistorySearch(params) {
  return axios.get(`${prefix}/history/del`, { params });
}
/**
 * 获取历史浏览
 * @param {object} params
 * @returns
 */
export function getHistoryTable(params) {
  return axios.get(`${prefix}/history/table`, { params });
}
/**
 * 获取主题域
 * @param {object} params
 * @returns
 */
export function getHistoryTopic() {
  return axios.get(`${prefix}/history/topic`);
}
/**
 * 建表
 * @param {object} data
 * @returns
 */
export function addTable(data) {
  return axios.post(`${prefix}/table/add`, data);
}
/**
 * 获取详情
 * @param {object} params
 * @returns
 */
export function getDetail(params) {
  return axios.get(`${prefix}/table/detail`, { params });
}
/**
 * 获取数据预览
 * @param {object} params
 * @returns
 */
export function getData(params) {
  return axios.get(`${prefix}/table/data`, { params });
}
/**
 * 获取数据库列表
 * @param {object} params
 * @returns
 */
export function getDbList(params) {
  return axios.get(`${prefix}/table/dbList`, { params });
}
/**
 * 建库
 * @param {object} data
 * @returns
 */
export function addDb(data) {
  return axios.post(`${prefix}/table/createdb`, data);
}
/**
 * 建表语句校验
 * @param {object} params
 * @returns
 */
export function checkSql(params) {
  return axios.get(`${prefix}/table/check`, { params });
}
/**
 * 编辑表详情
 * @param {object} data
 * @returns
 */
export function editDetail(data) {
  return axios.post(`${prefix}/table/changeDetail`, data);
}
/**
 * 编辑字段
 * @param {object} data
 * @returns
 */
export function editColumn(data) {
  return axios.post(`${prefix}/table/alterColumn`, data);
}
/**
 * 增加字段
 * @param {object} data
 * @returns
 */
export function addColumn(data) {
  return axios.post(`${prefix}/table/addColumn`, data);
}

// 字典获取
export function dict(data) {
  return axios.post(`${prefix}/dict/`, data);
}

/**
 * 认领字段
 * @param {object} params
 * @returns
 */
export function route(params) {
  return axios.post(`${prefix}/table/route`, params);
}

// 建表校验
export function checkCreate(params) {
  return axios.post(`${prefix}/table/checkCreate`, params);
}

/**
 * 认领字段
 * @param {object} params
 * @returns
 */
export function alterOwner(params) {
  return axios.get(`${prefix}/table/alterOwner`, { params });
}

/**
 * 申请权限
 * @param {object} params
 * @returns
 */
export function grantPrivilegeToUser(params) {
  return axios.post(`${prefix}/role/grantPrivilegeToUser`, params);
}

/**
 * 申请权限
 * @param {object} params
 * @returns
 */
export function doAuth(params) {
  return axios.post(`${prefix}/auth/doAuth`, params);
}

/** ************************************** */
// 元数据新版接口
// 获取表的产出信息
export function tableOutputInfo(params) {
  return axios.post(`${prefix}/table/tableOutputInfo`, params);
}

// 获取表的权限信息
export function tablePrivilegeInfo(params) {
  return axios.post(`${prefix}/table/tablePrivilegeInfo`, params);
}

// 获取表的访问信息
export function tableProfileInfo(params) {
  return axios.post(`${prefix}/table/tableProfileInfo`, params);
}

// 获取表的存储信息
export function tableStorageInfo(params) {
  return axios.post(`${prefix}/table/tableStorageInfo`, params);
}

// 获取表的综合信息
export function tableSummaryDescInfo(params) {
  return axios.post(`${prefix}/table/tableSummaryDescInfo`, params);
}

// 数据库下拉列表
export function dbList(params) {
  return axios.get(`${prefix}/table/dbList`, { params });
}

// 收藏&取消收藏
export function collect(params) {
  return axios.post(`${prefix}/table/collect`, params);
}

// 字段信息
export function column(params) {
  return axios.get(`${prefix}/table/column`, { params });
}

// 收藏后更新列表
export function searchOne(params) {
  return axios.get(`${prefix}/table/searchOne`, { params });
}

// 获取标签
export function searchtags(params) {
  return axios.post(`${prefix}/tags/search`, params);
}

// 收藏列表
export function collectList(params) {
  return axios.get(`${prefix}/table/collectList`, { params });
}

// 血缘图
export function blood(params) {
  return axios.post(`${prefix}/blood`, params);
}

// 敏感级别说明
export function sensitivityLevel(params) {
  return axios.get(`${prefix}/table/sensitivityLevel`, { params });
}

// 获取数据库详情
export function getDbDetail(params) {
  return axios.get(`${prefix}/table/getdb`, { params });
}
// 更新数据库
export function editDb(params) {
  return axios.post(`${prefix}/table/updatedb`, params);
}
// 删除数据库
export function deleteDb(params) {
  return axios.post(`${prefix}/table/deletedb`, params);
}

// 湖仓模型树获取
export function getModelTree(params) {
  return axios.get(`${prefix}/model/listModelTree`, { params });
}

// 湖仓模型单个类目获取
export function getModel(params) {
  return axios.get(`${prefix}/model/getModel`, { params });
}

// 列表页模型表count
export function searchModelCount(params) {
  return axios.get(`${prefix}/model/searchModelCount`, { params });
}

// 设置有效的模型
export function updateEffectiveModel(params) {
  return axios.get(`${prefix}/model/updateEffectiveModel`, { params });
}

// 湖仓模型类目的增加
export function addMetaMode(params) {
  return axios.post(`${prefix}/model/addModel`, params);
}

// 湖仓模型类目的修改
export function updateMetaMode(params) {
  return axios.post(`${prefix}/model/updateModel`, params);
}

// 湖仓模型类目的删除
export function delMetaMode(params) {
  return axios.delete(`${prefix}/model/deleteModel`, { params });
}

// 表详情
export function getTableInfo(params) {
  return axios.get(`${prefix}/table/getTable`, { params });
}

// 表详情 其他
export function getTableOtherInfo(params) {
  return axios.get(`${prefix}/table/getTableOtherInfo`, { params });
}

// 表详情修改
export function updateTableInfo(params) {
  return axios.post(`${prefix}/table/updateTable`, params);
}

// 库的分页列表
export function getDbPage(params) {
  return axios.post(`${prefix}/database/pagesDb`, params);
}

// 收藏分页列表
export function collectPages(params) {
  return axios.get(`${prefix}/table/collectPages`, { params });
}

// 授权信息记录分页列表
export function tablePrivilegeInfoPages(params) {
  return axios.post(`${prefix}/table/tablePrivilegeInfoPages`, params);
}

// 权限回收
export function revokePrivilegeFromRole(params) {
  return axios.patch(`${prefix}/role/revokePrivilegeFromRole`, params);
}

// 批量权限回收
export function bathRevokePrivilegeFromRole(params) {
  return axios.patch(`${prefix}/role/bathRevokePrivilegeFromRole`, params);
}

// 获取表/字段血缘
export function getLineageGraph(params) {
  return axios.post(`${prefix}/lineage/getLineageGraph`, params);
}

// 获取血缘关系的详情信息
export function getLineageFact(params) {
  return axios.post(`${prefix}/lineage/getLineageFact`, params);
}
