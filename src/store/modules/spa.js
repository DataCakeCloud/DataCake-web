const spa = {
  namespaced: true,
  state: {
    isSpaApp: false,
    microStateFns: null
  },
  mutations: {
    SET_MICROSTATE_FNS: (state, fns) => {
      state.microStateFns = fns;
    },
    SET_ISSPAAPP: (state, isSpaApp) => {
      state.isSpaApp = isSpaApp;
    }
  },
  actions: {
    isSpaApp({ commit }, isSpaApp) {
      commit('SET_ISSPAAPP', isSpaApp);
    },
    microStateFns({ commit }, fns) {
      commit('SET_MICROSTATE_FNS', fns);
    }
  }
};

export default spa;
