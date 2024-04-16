import axios from '@/utils/gateway-request';
// import resource from '@/utils/request7';

const prefix = '/ds_task/flinkcluster';

/**
 * 分页查询集群
 * @param {object} params
 * @returns
 */
export function getClusterListPage(params) {
  return axios.get(`${prefix}/page?`, { params });
}

/**
 * 新增集群
 * @param {object} params
 * @returns
 */
export function addCluster(params) {
  return axios.post(`${prefix}/add`, params);
}

/**
 * 更新集群
 * @param {object} params
 * @returns
 */
export function updateCluster(params) {
  return axios.put(`${prefix}/update`, params);
}

/**
 * 获取集群详情信息
 * @param {number|string} params
 * @returns
 */
export function getClusterDetail(id) {
  return axios.get(`${prefix}/get?id=${id}`);
}

/**
 * 删除集群
 * @param {number|string} id
 * @returns
 */
export function deleteCluster(id) {
  return axios.delete(`${prefix}/delete`, {
    params: {
      id
    }
  });
}

/* **************  云资源注册  *********************************** */
// 添加云资源
export function resourceAdd(params) {
  return axios.post('/cluster-service/cloud/resource/add', params);
}

// 删除云资源
export function resourceDelete(id) {
  return axios.delete(`/cluster-service/cloud/resource/delete/${id}`);
}

// 云资源详情
export function resourceGetOne(params) {
  return axios.get('/cluster-service/cloud/resource/getOne', { params });
}

// 检索云资源
export function resourceSearch(params) {
  return axios.get('/cluster-service/cloud/resource/search', { params });
}

// 更新云资源
export function resourceUpdate(params) {
  return axios.post('/cluster-service/cloud/resource/update', params);
}

// 根据云商查找 region
export function getRegion(params) {
  return axios.get('/cluster-service/cloud/resource/getRegion', { params });
}

/* ************ 数据挂载 ************* */
// 新增数据
export function dataAdd(params) {
  return axios.post('/cluster-service/cloud/data/add', params);
}

// 更新数据挂载
export function dataUpdate(params) {
  return axios.post('/cluster-service/cloud/data/update', params);
}

// 判断路径是否可用 region
export function dataCheckpath(params) {
  return axios.get('/cluster-service/cloud/data/checkpath', { params });
}

// 删除挂载数据
export function dataDelete(params) {
  return axios.delete(`/cluster-service/cloud/data/delete`, { params });
}

// 数据挂载详情
export function dataGetOne(params) {
  return axios.get('/cluster-service/cloud/data/getOne', { params });
}

// 数据挂载检索
export function dataSearch(params) {
  return axios.get('/cluster-service/cloud/data/search', { params });
}

// 查询角色
export function getClousterRoles(params) {
  return axios.get('/cluster-service/cluster/service/roles', { params });
}

// 查询可用VPC
export function getClousterVpcs(params) {
  return axios.get('/cluster-service/cluster/vpcs', { params });
}

// 查询子网
export function getClousterSubnets(params) {
  return axios.get('/cluster-service/cluster/subnets', { params });
}

// 查询安全组
export function getClousterGroups(params) {
  return axios.get('/cluster-service/cluster/security/groups', { params });
}
