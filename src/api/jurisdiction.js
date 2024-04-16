import axios from '@/utils/gateway-request';
/**
 * 新建租户
 * @param {object} params
 * @returns
 */
export function tenantAdd(params) {
  return axios.post(`/ds_task/tenant/add`, params);
}
/**
 * 编辑租户
 * @param {object} data
 * @returns
 */
export function tenantUpdate(data) {
  return axios.put(`/ds_task/tenant/update`, data);
}

/**
 * 资源列表
 * @param {*} params
 * @returns
 */
export function getConfig(params) {
  return axios.get(`/ds_task/product/getConfig`, { params });
}
/**
 * 配置资源
 * @param {*} params
 * @returns
 */
export function tenantConfig(params) {
  return axios.get(`/ds_task/tenant/config`, { params });
}

/**
 * 删除租户
 * @param {*} params
 * @returns
 */
export function tenantDelete(params) {
  return axios.delete(`/ds_task/tenant/delete`, { params });
}
/**
 * 租户列表
 * @param {*} params
 * @returns
 */
export function tenantPage(params) {
  return axios.get(`/ds_task/tenant/page`, { params });
}
/**
 * 冻结或启动租户
 * @param {*} params
 * @returns
 */
export function tenantFreeze(params) {
  return axios.get(`/ds_task/tenant/freeze`, { params });
}
/**
 * 添加角色
 * @param {*} params
 * @returns
 */
export function userAddRoles(params) {
  return axios.get(`/ds_task/userrole/addRoles`, { params });
}

// 重置密码
export function resetPassword(params) {
  return axios.get(`/ds_task/accessuser/resetPassword`, { params });
}
// 发送验证码
export function sendCode(params) {
  return axios.get(`/ds_task/accessuser/sendCode`, { params });
}
// 更新密码
export function updatePassword(params) {
  return axios.get(`/ds_task/accessuser/updatePassword`, { params });
}
/**
 * 冻结或启动用户
 * @param {*} params
 * @returns
 */
export function userFreeze(params) {
  return axios.get(`/ds_task/accessuser/freeze`, { params });
}
/**
 * 删除用户
 * @param {*} params
 * @returns
 */
export function userDelete(params) {
  return axios.delete(`/ds_task/accessuser/delete`, { params });
}
/**
 * 用户列表
 * @param {*} params
 * @returns
 */
export function userPage(params) {
  return axios.get(`/ds_task/accessuser/page`, { params });
}
/**
 * 用户list
 * @param {*} params
 * @returns
 */
export function userList(params) {
  return axios.get(`/ds_task/accessuser/list`, { params });
}
/**
 * 新建角色
 * @param {*} params
 * @returns
 */
export function roleAdd(params) {
  return axios.post(`/ds_task/role/add`, params);
}
/**
 * 编辑角色
 * @param {*} params
 * @returns
 */
export function roleUpdate(params) {
  return axios.put(`/ds_task/role/update`, params);
}
/**
 * 删除角色
 * @param {*} params
 * @returns
 */
export function roleDelete(params) {
  return axios.delete(`/ds_task/role/delete`, { params });
}
/**
 * 角色列表
 * @param {*} params
 * @returns
 */
export function rolePage(params) {
  return axios.get(`/ds_task/role/page`, { params });
}
/**
 * 角色详情
 * @param {*} params
 * @returns
 */
export function roleGet(params) {
  return axios.get(`/ds_task/role/get`, { params });
}
/**
 * 给角色添加不同的用户
 * @param {*} params
 * @returns
 */
export function addUsers(params) {
  return axios.get(`/ds_task/userrole/addUsers`, { params });
}
/**
 * 从该角色移除用户
 * @param {*} params
 * @returns
 */
export function roleRemoveUser(params) {
  return axios.get(`/ds_task/userrole/removeUser`, { params });
}
/**
 * 修改角色对应的菜单
 * @param {*} params
 * @returns
 */
export function roleUpdateMenus(params) {
  return axios.get(`/ds_task/role/updateMenus`, { params });
}
/**
 * 新建菜单
 * @param {object} params
 * @returns
 */
export function menuAdd(params) {
  return axios.post(`/ds_task/menu/add`, params);
}
/**
 * 修改菜单
 * @param {*} params
 * @returns
 */
export function menuUpdate(params) {
  return axios.put(`/ds_task/menu/update`, params);
}
/**
 * 菜单详情
 * @param {*} params
 * @returns
 */
export function menuGet(params) {
  return axios.get(`/ds_task/menu/get`, { params });
}
/**
 * 菜单列表
 * @param {*} params
 * @returns
 */
export function menuList(params) {
  return axios.get(`/ds_task/menu/getlist`, { params });
}
/**
 * 新建角色时列出当期用户所在的租户
 * @param {*} params
 * @returns
 */
export function tenantCurrent(params) {
  return axios.get(`/ds_task/tenant/current`, { params });
}
/**
 * 删除角色
 * @param {*} params
 * @returns
 */
export function menuDelete(params) {
  return axios.delete('/ds_task/menu/delete', { params });
}
/**
 * 角色list
 * @param {*} params
 * @returns
 */
export function roleList(params) {
  return axios.get(`/ds_task/role/list`, { params });
}
/**
 * 用户组list
 * @param {*} params
 * @returns
 */
export function getGroupList(params) {
  return axios.get(`/ds_task/group/page`, { params });
}
/**
 * 新建用户组
 * @param {object} data
 * @returns
 */
export function addGroup(data) {
  return axios.post(`/ds_task/group/add`, data);
}
/**
 * 更新用户组
 * @param {object} data
 * @returns
 */
export function updateGroup(data) {
  return axios.put(`/ds_task/group/update`, data);
}
/**
 * 删除用户组
 * @param {*} params
 * @returns
 */
export function deleteGroup(params) {
  return axios.delete(`/ds_task/group/delete`, { params });
}
/**
 * 用户组详细信息
 * @param {*} params
 * @returns
 */
export function getGroupInfo(params) {
  return axios.get(`/ds_task/group/get`, { params });
}
/**
 * 给用户添加用户
 * @param {*} params
 * @returns
 */
export function addGroupUser(params) {
  return axios.get(`/ds_task/group/add/user`, { params });
}
/**
 * 从用户组移除用户
 * @param {*} params
 * @returns
 */
export function removeUser(params) {
  return axios.get(`/ds_task/group/remove/user`, { params });
}
/**
 * 获取用户组list
 * @param {*} params
 * @returns
 */
export function getGroup(params) {
  return axios.get(`/ds_task/group/list`, { params });
}

/* ******************************** */
// 组织架构
export function organization(params) {
  return axios.get(`/ds_task/group/user/organization`, { params });
}

// 获取子组合子用户
export function childrenGroup(params) {
  return axios.post(`/ds_task/group/user/childrenGroup`, params);
}
// 邀请用户
export function accessuserAdd(params) {
  return axios.post(`/ds_task/accessuser/add`, params);
}
// 添加用户
export function accessAddUser(params) {
  return axios.post(`/ds_task/accessuser/addUser`, params);
}
// 修改用户
export function accessEditUser(params) {
  return axios.post(`/ds_task/accessuser/editUser`, params);
}
// 获取用户组树结构
export function getUserGroup(params) {
  return axios.get(`/ds_task/group/createByUserTree`, { params });
}

/**
 * 获取用户组list
 * @param {*} params
 * @returns
 */
export function getGroupPage(params) {
  return axios.get(`/ds_task/userGroup/page`, { params });
}
/**
 * 添加用户组
 * @param {*} params
 * @returns
 */
export function addUserGroup(params) {
  return axios.post(`/ds_task/userGroup/addUserGroup`, params);
}
/**
 * 更新用户组
 * @param {*} params
 * @returns
 */
export function editUserGroup(params) {
  return axios.post(`/ds_task/userGroup/editUserGroup`, params);
}
/**
 * 删除用户组
 * @param {*} params
 * @returns
 */
export function deleteUserGroup(params) {
  return axios.get(`/ds_task/userGroup/deleteUserGroup`, { params });
}
/**
 * 用户组增加用户
 * @param {*} params
 * @returns
 */
export function userGroupAddUser(params) {
  return axios.post(`/ds_task/userGroup/batchAddUser`, params);
}
/**
 * 用户组删除用户
 * @param {*} params
 * @returns
 */
export function userGroupRemoveUser(params) {
  return axios.post(`/ds_task/userGroup/removeUser`, params);
}
// 所属组织
export function groupTree(params) {
  return axios.get(`/ds_task/group/groupTree`, { params });
}
