import axios from '@/utils/request2';

const prefix = '/metadata/source';

export function getDataSourceListByPage(params) {
  return axios.post(`${prefix}/list`, params);
}

export function addOrUpdate(params) {
  return axios.post(`${prefix}/addOrUpdate`, params);
}

export function deleteDataSource(guid) {
  return axios.delete(`${prefix}/delete?guid=${guid}`);
}

export function getDataSourceDetail(guid) {
  return axios.get(`${prefix}/get?guid=${guid}`);
}

export function getTest(params, config) {
  return axios.get(`${prefix}/test`, { params, config });
}
