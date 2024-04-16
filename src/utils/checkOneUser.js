// 同一个浏览器确保只有一个用户登录
import Cookies from 'js-cookie';

export default (storageKeyString, seconds = 2, tipsCallFunction = () => {}, storageType = 'localStorage') => {
  if (typeof seconds !== 'number') throw new Error('seconds should be number');

  const cacheValue = getStorageVale(storageKeyString, storageType);

  if (document.hidden !== undefined) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const currentValue = getStorageVale(storageKeyString, storageType);
        if (currentValue !== cacheValue) {
          if (tipsCallFunction && typeof tipsCallFunction === 'function') {
            tipsCallFunction();
          }

          setTimeout(() => {
            window.location.reload();
          }, seconds * 1000);
        }
      }
    });
  }
};

function getMethods(storageType) {
  let fn = () => {};
  switch (storageType) {
    case 'cookie':
      fn = Cookies.get;
      break;
    case 'localStorage':
      fn = window.localStorage.getItem;
      break;
    case 'sessionStorage':
      fn = window.sessionStorage.getItem;
      break;
  }
  return fn;
}

function getStorageVale(storageKeyString, storageType) {
  var [localstorage, ...restKeyArrays] = storageKeyString.split('.');
  const localStorageInfo = getMethods(storageType)(localstorage);

  if (!restKeyArrays.length) return localStorageInfo;

  let returnVal = JSON.parse(localStorageInfo || '{}');

  for (let i = 0; i < restKeyArrays.length; i++) {
    returnVal = returnVal[restKeyArrays[i]];

    if (!returnVal) return '';

    if (typeof returnVal === 'string') {
      return returnVal;
    }
  }

  return '';
}
