export default {
  workflow: {
    status: [
      {
        name: '任务成功',
        value: 'success'
      },
      {
        name: '任务运行中',
        value: 'running'
      },
      {
        name: '任务失败',
        value: 'failed'
      },
      {
        name: '检查上游',
        value: 'waiting'
      },
      {
        name: '终止检查上游',
        value: 'termination'
      },
      {
        // name: '等待调度队列资源中',
        name: '排队中',
        value: 'waiting_queue'
      },
      {
        name: '任务等待重试',
        value: 'up_for_retry'
      },
      {
        name: '无状态',
        value: 'no_status'
      }
    ]
  }
};
