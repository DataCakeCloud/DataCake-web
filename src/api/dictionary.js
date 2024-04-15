import axios from '@/utils/gateway-request';

const prefix = '/ds_task/dict';

/**
 * 获取字典类型列表
 * @returns
 */
export function getDictType() {
  return axios.get(`/ds_task/sysdict/mapByParentCode`, {
    params: {
      parentCode: 'DICTIONARY_TYPE'
    }
  });
}

/**
 * 获取指定类型的字典列表
 * @param {String} 字典类型Code
 * @returns
 */
// export function getDictListByPage(componentCode, keyword, createBy, pageNum = 1, pageSize = 10) {
//   return axios.get(`${prefix}/page`, {
//     params: { componentCode, keyword, createBy, pageNum, pageSize }
//   });
// }
export function getDictPageList(params) {
  return axios.get(`${prefix}/page`, { params });
}

export function deleteDict(id) {
  return axios.delete(`${prefix}/delete`, {
    params: { id }
  });
}

// export function updateDict({ id, componentCode, chineseName, englishName, description }) {
//   const option = id ? { method: 'put', url: 'update' } : { method: 'post', url: 'add' };
//   return axios[option.method](`${prefix}/${option.url}`, { id, componentCode, chineseName, englishName, description });
// }
export function addDict(data) {
  return axios.post(`${prefix}/add`, data);
}
export function updateDict(data) {
  return axios.put(`${prefix}/update`, data);
}

/**
 * 获取指定类型的字典列表
 * @param {String} 字典类型Code
 * @returns
 */
export function getDictList(code) {
  return axios.get(`${prefix}/list`, {
    params: { componentCode: code }
  });
}

/**
 * 获取数据源类型列表
 * @returns
 */
export function getDataSourceList() {
  return getDictList('SOURCE_TYPE');
}

/**
 * 获取数据分层列表
 * @returns
 */
export function getDataLayerList() {
  return getDictList('DATA_LAYER');
}

/**
 * 获取主题域列表
 * @returns
 */
export function getDomainList() {
  return getDictList('THEME');
}

/**
 * 获取APP列表
 * @returns
 */
export function getAppList() {
  return getDictList('APP');
}

/**
 * 获取更新频次
 * @returns
 */
export function getFrequencyList() {
  return getDictList('UPDATE_FREQUENCY');
}

/**
 * 获取表类型
 * @returns
 */
export function getTableTypeList() {
  return getDictList('TABLE_TYPE');
}

/**
 * 获取数据等级
 * @returns
 */
export function getDataGranularityList() {
  return getDictList('DATA_GRANULARITY');
}

/**
 * 获取二级主题
 * @returns
 */
export function getDepartmentList() {
  return getDictList('DEPARTMENT');
}
/**
 * 模糊查询
 * @param {string} keywords
 * @returns
 */
export function searchName(keywords) {
  return axios.get(`${prefix}/name/search`, { params: { keywords }});
}
