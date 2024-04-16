let permission;
const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);
window.sessionStorage.setItem('isCloud', isCloud);
if (isCloud) {
  permission = require('./permission-cloud');
} else {
  permission = require('./permission-zeus');
}

export default permission;
