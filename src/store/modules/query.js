import { execute, getCatalogAndEngine, getRegionList } from '@/api/querydata';
import { localGetItem, localSetItem } from '@/utils/customStorage';

const state = {
  sqlOptions: {},
  regionList: [],
  sqlList: {},
  catalog: localGetItem('ds-query-catalog') || '',
  // engine: localGetItem('ds-query-engine') || '',
  provider: null,
  engineConfig: {
    region: localGetItem('region') || '',
    catalog: localGetItem('ds-query-catalog') || ''
  },
  cancelledList: [],
  folderList: [],
  catalogAndEngine: [],
  metaData: JSON.parse(localGetItem('metaData')) || {},
  region: localGetItem('region') || '',
  tableList: []
};

const getters = {
  sqlList: state => state.sqlList,
  tableList: state => state.tableList,
  catalog: state => state.catalog,
  metaData: state => state.metaData,
  engineConfig: state => state.engineConfig,
  provider: state => state.provider,
  sqlOptions: state => state.sqlOptions,
  region: state => state.region,
  regionList: state => state.regionList,
  folderList: state => state.folderList,
  catalogList: state => {
    const customList = ['hive', 'iceberg'];
    const currentList = [];
    const data = state.catalogAndEngine.map(({ catalog }) => catalog).sort();
    if (data.length > 0) {
      customList.forEach(item => {
        const index = data.indexOf(item);
        if (index > 0) {
          const current = data.splice(index, 1);
          currentList.push(...current);
        }
      });
    }
    return [...currentList, ...data];
  },
  engineList: state => {
    const engineObje = state.catalogAndEngine.find(item => item.catalog === state.catalog);
    const engines = engineObje ? engineObje.engines : [];
    engines.forEach((item, i, arr) => {
      if (item.value === 'presto_ksyun_cn-beijing-6') {
        arr.splice(i, 1);
        arr.unshift(item);
      }
    });
    return engines;
  },
  engineListAll: state => {
    const engineObje = state.catalogAndEngine.map(({ engines }) => engines).flat(Infinity);
    const res = [];
    engineObje.forEach(item => {
      if (res.some(val => val.value === item.value)) return;
      res.push(item);
    });
    return res;
  }
};

// mutations
const mutations = {
  SET_TABLELIST(state, data) {
    state.tableList = data;
  },
  SET_REGIONLIST(state, data) {
    state.regionList = data;
    if (!state.region) this.commit('SET_REGION', data[0].name);
  },
  SET_CATALOGANDENGINE(state, data) {
    state.catalogAndEngine = data;
  },
  SET_FOLDERLIST(state, data) {
    state.folderList = data;
  },
  SET_REGION(state, data) {
    state.region = data;
    state.engineConfig.region = data;
    localSetItem('region', data);
  },
  SET_SQLOPTIONS(state, data) {
    const { region, name, key, value } = data;
    state.sqlOptions[region] = state.sqlOptions[region] ? state.sqlOptions[region] : {};
    state.sqlOptions[region][name] = state.sqlOptions[region][name] ? state.sqlOptions[region][name] : {};
    state.sqlOptions[region][name][key] = value;
  },
  SET_CANCELLEDlIST(state, data) {
    if (data.type === 'remove') {
      const index = state.cancelledList.indexOf(data.uuid);
      state.cancelledList.splice(index, 1);
    } else if (data.type === 'add') {
      state.cancelledList.push(data.uuid);
    }
  },
  SET_SQLLIST(state, data) {
    const { key, list } = data;
    if (!list) {
      state.sqlList[key] = {};
    } else if (list.removeName) {
      if (state.sqlList[key]) state.sqlList[key][list.removeName] = {};
    } else {
      if (Object.keys(state.sqlList).length > 0) {
        if (state.sqlList[key]) {
          state.sqlList[key][list.name] = list;
        } else {
          state.sqlList[key] = { [list.name]: list };
        }
      } else {
        state.sqlList[key] = { [list.name]: list };
      }
    }
  },
  SET_CATALOG(state, data) {
    state.catalog = data;
    state.engineConfig.catalog = data;
    localSetItem('ds-query-catalog', data);
  },
  SET_PROVIDER(state, data) {
    state.provider = data;
  },
  SET_METADATA(state, data) {
    const { region, resultData } = data;
    state.metaData[region] = resultData;
    localSetItem('metaData', JSON.stringify(state.metaData));
  }
};

// actions
const actions = {
  // 获取区域列表
  getRegionList({ commit }) {
    return getRegionList().then(res => {
      const data = res.data;
      const result = data || [];
      commit('SET_REGIONLIST', result);
    });
  },
  // 数据源和引擎
  getCatalogAndEngine({ commit, state }, params) {
    getCatalogAndEngine(params).then(res => {
      const data = res.data || [];
      commit('SET_CATALOGANDENGINE', data);
    });
  },
  // 保存搜索的结果
  saveSqueryList({ commit, state }, params) {
    const { region, uuid, name } = params;
    delete params.name;
    return execute(params)
      .then(res => {
        const data = res?.data || {};
        if (state.cancelledList.includes(uuid)) return state.sqlList[region][uuid];
        if (name) data.name = name;
        data.uuid = uuid;
        data.running = false;
        data.once = true;
        commit('SET_SQLLIST', { key: region, list: data });
        return Promise.resolve(data);
      })
      .catch(err => {
        if (state.cancelledList.includes(uuid)) return state.sqlList[region][uuid];
        if (name) err.name = name;
        err.uuid = uuid;
        err.running = false;
        err.once = true;
        err.status = 1;
        commit('SET_SQLLIST', { key: region, list: err });
        return Promise.reject(err);
      })
      .finally(() => {
        if (state.cancelledList.includes(uuid)) commit('SET_CANCELLEDlIST', { uuid, type: 'remove' });
      });
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
