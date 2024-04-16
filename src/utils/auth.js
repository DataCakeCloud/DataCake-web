import Cookies from 'js-cookie';
const TokenKey = 'ST_VUE-TOKEN';
const FromKey = 'St-vue-From';
const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);
const whiteList = ['development', 'cloud-aws-development'];
// const domain = whiteList.includes(process.env.VUE_APP_ENV) ? 'localhost' : !isCloud ? '' : '.datacake.cloud';
const domain = whiteList.includes(process.env.VUE_APP_ENV) ? 'localhost' : !isCloud ? '' : window.location.host;
const isIp = /^[0-9.]*$/.test(window.location.host.split(':')[0]);
const _getToken = () => {
  if (isIp) {
    return window.localStorage.token;
  } else {
    const cookie = Cookies.get(TokenKey, { domain });
    if (cookie) {
      // 解决cookie首次无法设置上过期时间的问题
      setToken(cookie);
    }
    if (process.env.VUE_APP_ENV === 'cloud-aws-test' && process.env.VUE_APP_SELFTOKEN) {
      return process.env.VUE_APP_SELFTOKEN;
    } else {
      return cookie;
    }
  }
};
const _setToken = token => {
  if (isIp) {
    window.localStorage.token = token;
  } else {
    Cookies.set(TokenKey, token, { domain, expires: 1 });
  }
};
const _removeToken = () => {
  if (isIp) {
    window.localStorage.removeItem('token');
  } else {
    Cookies.remove(TokenKey, { domain });
  }
};
export function getToken() {
  return _getToken();
}

export function setToken(token) {
  _setToken(token);
}

export function removeToken() {
  _removeToken();
}

export function getFrom() {
  return Cookies.get(FromKey);
}

export function setFrom(from) {
  return Cookies.set(FromKey, from);
}
