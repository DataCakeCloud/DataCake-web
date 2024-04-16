import axios from '@/utils/gateway-request';

/**
 * 新建数据角色
 * @param {*} params
 * @returns
 */
export function dataRoleAdd(data) {
  return axios.post(`/metadata/role/createRole`, data);
}
// /**
//  * 数据角色权限列表
//  * @param {*} params
//  * @returns
//  */
// export function dataRolePrivileges(params) {
//   return axios.get(`/metadata/role/showPrivileges`, { params });
// }
/**
 * 数据角色列表
 * @param {*} params
 * @returns
 */
export function dataRolePage(params) {
  return axios.get(`/metadata/role/showRoles`, { params });
}
/**
 * 删除数据角色
 * @param {*} params
 * @returns
 */
export function dataRoleDelete(params) {
  return axios.delete(`/metadata/role/dropRole`, { params });
}
/**
 * 编辑数据角色
 * @param {*} params
 * @returns
 */
export function dataRoleUpdate(data) {
  return axios.patch(`/metadata/role/alterRole`, data);
}
/**
 * 展示角色内用户
 * @param {*} params
 * @returns
 */
export function dataShowUsers(params) {
  return axios.get(`/metadata/role/showUsers`, { params });
}
/**
 * 从一个角色中移除用户
 * @param {*} params
 * @returns
 */
export function dataRemoveUsers(data) {
  return axios.patch(`/metadata/role/removeUsers`, data);
}
/**
 * 给一个角色添加用户
 * @param {*} params
 * @returns
 */
export function dataAddUsers(data) {
  return axios.post(`/metadata/role/addUsers`, data);
}
/**
 * 展示角色权限
 * @param {*} params
 * @returns
 */
export function dataShowPrivileges(params) {
  return axios.get(`/metadata/role/showPrivileges`, { params });
}
/**
 * 展示角色未拥有的所有权限
 * @param {*} params
 * @returns
 */
export function dataShowNoPrivileges(params) {
  return axios.get(`/metadata/role/showObjectNames`, { params });
}
/**
 * 给角色添加权限
 * @param {*} params
 * @returns
 */
export function dataGrantPrivilegeToRole(data) {
  return axios.post(`/metadata/role/grantPrivilegeToRole`, data);
}
/**
 * 给角色移除权限
 * @param {*} params
 * @returns
 */
export function dataRevokePrivilegeFromRolea(data) {
  return axios.patch(`/metadata/role/revokePrivilegeFromRole`, data);
}
