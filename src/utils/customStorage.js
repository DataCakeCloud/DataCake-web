import store from '@/store';

export function localSetItem(key, value) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return localStorage.setItem(key, value);
  } else {
    return localStorage.setItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key, value);
  }
}
export function localRemoveItem(key, value) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return localStorage.removeItem(key, value);
  } else {
    return localStorage.removeItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key, value);
  }
}
export function localGetItem(key) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return localStorage.getItem(key);
  } else {
    return localStorage.getItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key);
  }
}
export function sessionSetItem(key, value) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return sessionStorage.setItem(key, value);
  } else {
    return sessionStorage.setItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key, value);
  }
}
export function sessionGetItem(key) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return sessionStorage.getItem(key);
  } else {
    return sessionStorage.getItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key);
  }
}
export function sessionRemoveItem(key, value) {
  const userId = store?.getters?.userInfo?.id;
  const groupUuid = store?.getters?.currentUserGroup?.uuid;
  const tenantName = store?.getters?.userInfo?.tenantName;
  if (!userId) {
    return sessionStorage.removeItem(key, value);
  } else {
    return sessionStorage.removeItem(userId + '-' + tenantName + '-' + groupUuid + '-' + key, value);
  }
}
