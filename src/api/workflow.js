import axios from '@/utils/gateway-request';

export function getWorkFlowList(params) {
  return axios.get('/ds_task/workflow/page', { params });
}

export function deleteWorkFlowById(params) {
  return axios.delete('/ds_task/workflow/delete', { params });
}

export function getWorkFlowById(params) {
  return axios.get('/ds_task/workflow/getby', { params });
}

export function toggleWrokFlow(id, online = true) {
  return axios.get('/ds_task/workflow/online/offline', { params: { id, online }});
}

export function getInstacne(id) {
  return axios.get('/ds_task/workflow/instance/get', {
    params: {
      id
    }
  });
}

/**
 * 创建工作流
 * @param {*} data
 * {
 *   name: '工作流1',
 *   description: '描述',
 *   tasks: [
 *      {
 *         // 任务字段
 *      }
 *   ],
 *   firstPoints: '1,2,3,4' // 头结点集合
 * }
 */
export function addWorkflow(data) {
  return axios.post('/ds_task/workflow/add', data);
}

/**
 * 编辑工作流
 * @param {*} data
 * {
 *   id: 12,
 *   name: '工作流1',
 *   description: '描述',
 *   tasks: [
 *      {
 *         // 任务字段
 *      }
 *   ],
 *   firstPoints: '1,2,3,4' // 头结点集合
 * }
 */
export function editWorkflow(data) {
  return axios.put('/ds_task/workflow/update', data);
}

/**
 * 重新标记任务实例状态
 * @param {*} params
 */
export function mark(params) {
  return axios.get('/ds_task/workflow/instance/mark', { params });
}

/**
 * 重跑任务
 * @param {*} params
 */
export function clear(params) {
  return axios.get('/ds_task/workflow/instance/clear', { params });
}
