import axios from '@/utils/gateway-request';

/**
 * 获取校验项列表
 * @param {string} params
 * @returns
 */
export function getValidList(code) {
  return axios.get('/ds_task/validator/item/list?templateCode=' + code);
}
/**
 * 检验成功标志路径
 * @param {string} params
 * @returns
 */
export function validator(code, data) {
  return axios.post('/ds_task/validator/check?templateCode=' + code, data);
}
