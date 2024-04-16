// state
const state = {
  taskPageOptions: {}
};

// getters
const getters = {
  taskPageOptions: state => state.taskPageOptions
};

// mutations
const mutations = {
  SET_TASKPAGEOPTIONS(state, data) {
    const { tabs, ...val } = data;
    state.taskPageOptions[tabs] = val;
  },
  REMOVE_TASKPAGEOPTIONS(state) {
    state.taskPageOptions = {};
  }
};

// actions
const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
};
