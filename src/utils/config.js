import I18n from '@/lang';
import { v4 as uuid } from 'uuid';

// 单独处理相应拦截器的接口
export const errorInterfaceList = ['/query/execute', '/cluster-service/cloud/data/add', '/cluster-service/cloud/resource/add', '/query/history/data', '/query/statsInfo'];
// jianjia表达式
export const jianjiaData = [
  'ds',
  'ds_nodash',
  'yesterday_ds',
  'yesterday_ds_nodash',
  'tomorrow_ds',
  'tomorrow_ds_nodash',
  'ts',
  'ts_nodash',
  'execution_date',
  'prev_execution_date',
  'next_execution_date',
  'prev_2_execution_date',
  'ds_utc0',
  'ds_nodash_utc0',
  'yesterday_ds_utc0',
  'yesterday_ds_nodash_utc0',
  'tomorrow_ds_utc0',
  'tomorrow_ds_nodash_utc0',
  'execution_date_utc0'
  // 'prev_execution_date_utc0',
  // 'next_execution_date_utc0',
  // 'prev_2_execution_date_utc0'
];

// 租户白名单 (针对与页面应用)
export const whiteTenant = ['payment', 'shareit', 'bdp'];

export function setDocumentTitle(route) {
  try {
    const company = process.env.VUE_APP_NAME;
    const title = route.meta?.title || '';
    let taskId;
    if (route.path.includes('/task')) {
      taskId = route?.query?.id || '';
    }
    document.title = `${title ? `${I18n.t('route.' + title)}${taskId ? `-${taskId}` : ''}-` : ''}${company}`;
  } catch (error) {
    console.log(error);
  }
}

export function uuidStamp() {
  const timeStamp = new Date().getTime();
  return uuid() + '-' + timeStamp;
}
