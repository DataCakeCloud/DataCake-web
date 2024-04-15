import store from '@/store';
import { localGetItem } from '@/utils/customStorage';

export function initUserData() {
  const catalog = localGetItem('ds-query-catalog') || '';
  const metaData = JSON.parse(localGetItem('metaData')) || {};
  const region = localGetItem('region') || '';
  store.commit('SET_CATALOG', catalog);
  Object.keys(metaData).forEach(region => {
    store.commit('SET_METADATA', { region, resultData: metaData[region] });
  });
  store.commit('SET_REGION', region);
}
