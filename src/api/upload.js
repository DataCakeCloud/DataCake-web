import request from '@/utils/request5';

// 上传
export const upload = async function(params) {
  return await request.post(upload, params, {
    'Content-Type': 'multipart/form-data'
  });
};
