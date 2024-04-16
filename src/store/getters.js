const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  isAdmin: state => state.user.userInfo.isAdmin,
  token: state => state.user.token,
  userInfo: state => state.user.userInfo,
  routers: state => state.user.routers,
  avatar: state => state.user.avatar,
  language: state => state.app.language,
  metaDetail: state => state.data.metaDetail,
  isSpaApp: state => state.spa.isSpaApp,
  guidanceMode: state => state.app.guidanceMode,
  isCloud: state => state.user.isCloud,
  userGroupList: state => state.user.userGroupList,
  currentUserGroup: state => state.user.currentUserGroup
};
export default getters;
