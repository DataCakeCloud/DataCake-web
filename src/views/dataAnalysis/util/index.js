import { localGetItem, localSetItem, localRemoveItem } from '@/utils/customStorage';

export function localSet(key, tab) {
  let tabs = localGetItem(`ds-query-sql-${key}`);
  if (tabs) {
    tabs = JSON.parse(tabs);
    const index = tabs.findIndex(item => {
      return item.name === tab.name;
    });
    if (index > -1) {
      tabs[index] = Object.assign(tabs[index], tab);
    } else {
      tabs.push(tab);
    }
  } else {
    tabs = [tab];
  }
  localSetItem(`ds-query-sql-${key}`, JSON.stringify(tabs));
}

export function localRemove(key, name) {
  let tabs = localGetItem(`ds-query-sql-${key}`);
  if (tabs) {
    tabs = JSON.parse(tabs);
    if (name) {
      const index = tabs.findIndex(tab => {
        return tab.name === name;
      });
      if (index > -1) {
        tabs.splice(index, 1);
        localSetItem(`ds-query-sql-${key}`, JSON.stringify(tabs));
      }
    } else {
      localRemoveItem(`ds-query-sql-${key}`);
    }
  }
}
export const numberType = ['integer', 'bigint', 'smallint', 'tinyint', 'float', 'real', 'double'];

export function setLocalCpmType(value) {
  localStorage.setItem(
    'cmpType',
    JSON.stringify({
      value,
      startDate: new Date().getTime()
    })
  );
}

export function getLocalCpmType() {
  const Obj = JSON.parse(localStorage.getItem('cmpType') || null);
  if (Obj) {
    const endDate = new Date().getTime();
    const startDate = Obj.startDate;
    if (endDate - startDate < 1000 * 60 * 60 * 24) {
      return Obj.value;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// 以;结尾的sql 清楚‘;’
export function removeEndStrSql(str = '') {
  if (str.trim().endsWith(';')) return str.slice(0, -1);
  return str;
}
