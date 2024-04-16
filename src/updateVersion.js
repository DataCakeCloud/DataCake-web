import axios from 'axios';
import { throttle } from './utils';
// import { list } from '@/api/dashboard';
// import { b64_to_utf8 } from '@/utils/';
// import { MessageBox } from 'element-ui';

async function checkVersion() {
  // list().then(async result => {
  // const list =
  //   (result.data &&
  //     result.data.length &&
  //     result.data.map(e => {
  //       return { ...e, name: b64_to_utf8(e.name) };
  //     })) ||
  //   [];
  const data = await (await axios.get('/version.json', { params: { data: new Date().getTime() }})).data;
  const lakecatBaseURL = process.env.NODE_ENV === 'development' ? '/' : process.env.VUE_APP_LAKECAT_FRONTEND_ORIGIN;
  const lakecatData = await (await axios.get(`${lakecatBaseURL}version.json`, { params: { data: new Date().getTime() }})).data;
  console.log('版本信息', data.version, lakecatData.version);
  const version = window.localStorage.getItem('version') || '';
  const lakecatVersion = window.localStorage.getItem('lakecatVersion') || '';
  // const announcementId = window.localStorage.getItem('announcementId') || '';
  if (!version || !lakecatVersion) {
    window.localStorage.setItem('version', data.version);
    window.localStorage.setItem('lakecatVersion', lakecatData.version);
    // window.localStorage.setItem('announcementId', list[0].id);
  } else {
    // if (version !== data.version && parseInt(announcementId) !== list[0].id) {
    if (version !== data.version || lakecatVersion !== lakecatData.version) {
      localStorage.removeItem('version');
      localStorage.removeItem('lakecatVersion');
      // localStorage.removeItem('announcementId');
      window.location.reload();
      // const name = list[0].name;

      // MessageBox.confirm(`检测到功能更新，${name}，是否更新`, '提示', {
      //   confirmButtonText: '更新',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     window.location.reload();
      //   })
      //   .catch(() => {});
    }
  }
  // });
}
export const updateVersion = throttle(checkVersion, 1000 * 30);
// export const updateVersion = () => {};
// let timer = null;
// clearInterval(timer);
// timer = setInterval(_ => {
// checkVersion();
// }, 1000 * 5);
