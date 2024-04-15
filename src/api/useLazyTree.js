import axios from '@/utils/gateway-request';

export function getFolderTree(params) {
  return axios.get(`/ds_task/filemanager/subset/list`, { params });
}
export function fileSearch(params) {
  return axios.get(`/ds_task/filemanager/search`, { params });
}
export function addFileApi(params) {
  return axios.post(`/ds_task/filemanager/add`, params);
}
export function addFileListApi(params) {
  return axios.post(`/ds_task/filemanager/batch/add`, params);
}
export function delTreeItemApi(params) {
  return axios.put(`/ds_task/filemanager/delete`, null, { params });
}
export function moveTreeItemApi(params) {
  return axios.put(`/ds_task/filemanager/move`, null, { params });
}
export function changeNameApi(params) {
  return axios.put(`/ds_task/filemanager/changeName`, null, { params });
}
export function getFileNums(params) {
  return axios.put(`/ds_task/filemanager/fresh`, null, { params });
}
export function getLabelUrl(params) {
  return axios.get(`/ds_task/filemanager/pfolder/list`, { params });
}
