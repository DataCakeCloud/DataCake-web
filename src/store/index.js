import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import app from './modules/app';
import settings from './modules/settings';
import user from './modules/user';
import data from './modules/data';
import spa from './modules/spa';
import query from './modules/query';
import task from './modules/task';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    data,
    spa,
    query,
    task
  },
  getters
});

export default store;
