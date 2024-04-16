import { logout, getInfo, getInfoNew, getMenu, getMenuNew, dsSwitch } from '@/api/user';
import { getConfig } from '@/api/system.js';
import { getToken, setToken, removeToken, setFrom } from '@/utils/auth';
import { constantRoutes, asyncRouterMap } from '@/router';

import router from '@/router';
const session = sessionStorage;
const router_key = 'SHAREit_ROUTER';

const state = {
  // isAdmin: undefined,
  token: getToken(),
  userInfo: '',
  avatar: '',
  routers: [],
  admin: false,
  isCloud: JSON.parse(window.sessionStorage.getItem('isCloud')),
  currentUserGroup: {},
  userGroupList: [],
  systemConf: {}
};
// getters
const getters = {
  token: state => state.token,
  routers: state => state.routers,
  isAdmin: state => state.userInfo.isAdmin,
  userGroupList: state => state.userInfo.userGroup || [],
  currentUserGroup: state => state.currentUserGroup,
  systemConf: state => state.systemConf
};
const mutations = {
  // SET_ISADMIN: (state, isAdmin) => {
  //   state.isAdmin = isAdmin;
  // },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_INFO: (state, user) => {
    state.userInfo = user;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_ROUTERS: (state, routers) => {
    router.addRoutes(filterMicroAppRouters(routers));
    state.routers = constantRoutes.concat(routers);
  },
  SET_ADMIN: (state, admin) => {
    state.admin = admin;
  },
  SET_USERGROUP: (state, currentUserGroup) => {
    state.currentUserGroup = currentUserGroup || {};
  },
  SET_SYSTEMCONF: (state, data) => {
    state.systemConf = data;
  }
};

const actions = {
  // user login
  Login({ commit }, query) {
    return new Promise((resolve, reject) => {
      setToken(query.t);
      setFrom(query.f);
      commit('SET_TOKEN', query.t);
      resolve();
    });
  },

  async switchSystem() {
    return await new Promise((resolve, reject) => {
      dsSwitch()
        .then(res => {
          const data = res.data;
          session.setItem('newSystem', data);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // get user info
  async GetInfo({ commit, state }) {
    return await new Promise((resolve, reject) => {
      const infoFn = session.getItem('newSystem') === 'true' ? getInfoNew : getInfo;
      infoFn()
        .then(res => {
          if (res.success) {
            const data = res.data;
            commit('SET_INFO', data);
            session.setItem('userInfo', JSON.stringify(data));
            resolve();
          } else {
            reject(res);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // get user info
  async GetCloudInfo({ commit, state }) {
    return await new Promise((resolve, reject) => {
      getInfoNew()
        .then(async res => {
          // const res = {
          //   data: {
          //     isSupperAdmin: false,
          //     org: '0',
          //     roles: 'common',
          //     isAdmin: false,
          //     userName: 'user_test6',
          //     userId: 'user_test6',
          //     alarmChannel: ['email', 'enterprise_wechat'],
          //     tenantName: 'ninebot',
          //     groupIds: '',
          //     tenantId: 1,
          //     id: 7,
          //     userGroup: [
          //       {
          //         owner: 1,
          //         dbc: false,
          //         defaultHiveDbName: 'test',
          //         name: 'ninebot_test',
          //         id: 11,
          //         uuid: 'groupe9vieieu'
          //       },
          //       {
          //         owner: 1,
          //         dbc: true,
          //         defaultHiveDbName: 'dbc',
          //         name: 'dbc',
          //         id: 17,
          //         uuid: 'groupwx7l4jo5'
          //       }
          //     ],
          //     email: 'user_test6@ushareit.com',
          //     group: ''
          //   },
          //   success: true
          // };
          if (res.success) {
            const data = res.data;
            commit('SET_INFO', data);
            session.setItem('userInfo', JSON.stringify(data));
            let currentUserGroup;
            if (window.localStorage.currentUserGroup) {
              let hasStorageUserGroup = false;
              if (data.userGroup && data.userGroup.length) {
                data.userGroup.some(item => {
                  if (item.id === JSON.parse(window.localStorage.currentUserGroup).id) {
                    currentUserGroup = item;
                    hasStorageUserGroup = true;
                    return true;
                  }
                });
              }
              if (!hasStorageUserGroup) {
                currentUserGroup = data.userGroup && data.userGroup.length ? data.userGroup[0] : {};
                window.localStorage.currentUserGroup = JSON.stringify(currentUserGroup);
              }
            } else {
              currentUserGroup = data.userGroup && data.userGroup.length ? data.userGroup[0] : {};
              window.localStorage.currentUserGroup = JSON.stringify(currentUserGroup);
            }
            commit('SET_USERGROUP', currentUserGroup);
            // 获取系统配置
            getConfig({ id: state.userInfo.tenantId }).then(res => {
              commit('SET_SYSTEMCONF', res.data);
            });
            resolve();
          } else {
            reject(res);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(res => {
          commit('SET_TOKEN', '');
          commit('SET_INFO', '');
          session.removeItem(router_key);
          session.removeItem('userInfo');
          session.removeItem('newSystem');
          removeToken();
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // 前端 登出
  FedLogOut({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '');
      commit('SET_INFO', '');
      session.removeItem(router_key);
      session.removeItem('userInfo');
      session.removeItem('newSystem');
      removeToken();
      resolve();
    });
  },

  InitRouters({ commit, state }) {
    return new Promise((resolve, reject) => {
      // const json = JSON.parse(session.getItem(router_key));
      // if (json) {
      //   commit('SET_ROUTERS', filterRouter(json));
      //   resolve();
      // } else {
      const menuFn = session.getItem('newSystem') === 'true' ? getMenuNew : getMenu;
      menuFn()
        .then(res => {
          if (res.success) {
            commit('SET_ROUTERS', filterRouter(res.data));
            if (res.data.length > 0) {
              session.setItem(router_key, JSON.stringify(res.data));
            }
            resolve();
          }
        })
        .catch(error => {
          reject(error);
        });
      // }
    });
  },

  InitCloudRouters({ commit, state }) {
    return new Promise((resolve, reject) => {
      getMenuNew()
        .then(res => {
          if (res.success) {
            commit('SET_ROUTERS', filterRouter(res.data));
            if (res.data.length > 0) {
              session.setItem(router_key, JSON.stringify(res.data));
            }
            resolve();
          }
        })
        .catch(error => {
          reject(error);
        });
      // }
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '');
      removeToken();
      resolve();
    });
  }
};
/**
 * 通过后台获取的菜单列表过滤路由并注入
 * @param {*} menuArr
 * @urlArr 收集所有后台返回的path
 * @asyncRouterMap 前端代码配置的所有业务路由
 */
function filterRouter(menuArr) {
  const urlArr = [];
  for (const menu of menuArr) {
    urlArr.push(menu.url);
  }
  function recursion(async, parent) {
    const newRouter = [];
    for (const router of async) {
      if (urlArr.indexOf(router.path) > -1 || urlArr.indexOf(router.redirect) > -1 || (parent && urlArr.indexOf(parent.path + '/' + router.path) > -1) || router.hidden) {
        const r = Object.assign({}, router);
        if (router.hasOwnProperty('children')) {
          r.children = recursion(router.children, router);
        }
        newRouter.push(r);
      }
    }
    return newRouter;
  }
  const lastRouter = recursion(asyncRouterMap);
  // 最后添加404
  lastRouter.push({
    path: '*',
    redirect: '/home'
  });
  return lastRouter;
}

/**
 * 过滤微应用的路由，对于微应用路由入口，只添加路径为*通配符的路由
 * @param {*} routers
 */
function filterMicroAppRouters(routers) {
  return routers.map(r => {
    if (r.meta?.micro) {
      const rr = Object.assign({}, r);
      if (r.hasOwnProperty('children')) {
        rr.children = r.children.filter(child => child.path === '*');
      }
      return rr;
    } else {
      return r;
    }
  });
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
