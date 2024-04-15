import axios from '@/utils/gateway-request';

const prefix = '/ds_task/artifact';

/**
 * 分页查询工件
 * @param {object} params
 * @returns
 */
export function getArtifactPage(params) {
  return axios.get(`${prefix}/page?`, { params });
}

/**
 * 新增工件
 * @param {object} params
 * @returns
 */
export function addArtifact(params, config) {
  return axios.post(`${prefix}/add`, params, config);
}

/**
 * 更新工件
 * @param {object} params
 * @returns
 */
export function updateArtifact(params, config) {
  return axios.post(`${prefix}/update`, params, config);
}

/**
 * 获取工件详情信息
 * @param {number|string} id
 * @returns
 */
export function getArtifactDetail(id) {
  return axios.get(`${prefix}/get?id=${id}`);
}

/**
 * 删除工件
 * @param {number|string} id
 * @returns
 */
export function deleteArtifact(id) {
  return axios.delete(`${prefix}/delete`, {
    params: {
      id
    }
  });
}

/**
 * 分页查询工件版本列表
 * @param {number|string} params
 * @returns
 */
export function getArtifactVersionPage(params) {
  return axios.get(`/ds_task/artifactversion/page`, { params });
}

/**
 * 下载工件版本
 * @param {number|string} params
 * @returns
 */
export function downloadArtifactVersion(id) {
  return axios.get('/ds_task/artifactversion/download', { params: { artifactVersionId: id }, response_type: 'blob' });
}

/**
 * 工件版本信息
 * @param {number|string} id
 * @returns
 */
export function getVersionInfo(id) {
  return axios.get(`/ds_task/artifactversion/get?id=${id}`);
}
/**
 * 模糊查询
 * @param {string} name
 * @returns
 */
export function searchName(name) {
  return axios.get(`${prefix}/name/search`, { params: { name }});
}
