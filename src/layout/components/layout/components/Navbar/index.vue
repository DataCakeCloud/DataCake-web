<template>
  <div class="navbar">
    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <div class="menu-btn" ref="menu" @pointerenter="delayOpenMenu" @pointerleave="delayCloseMenu" @click="toggleMenu" :class="{ active: fixedPannel.opened }">
      <svg v-if="!fixedPannel.opened" t="1646820904745" class="menu-icon" style="width: 1.3em; height: 1.3em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2196" width="200" height="200">
        <path
          d="M388.4 529.7H147.2c-27.1 0-49.2-22.1-49.2-49.2V239.3c0-27.1 22.1-49.2 49.2-49.2h241.2c27.1 0 49.2 22.1 49.2 49.2v241.2c0 27.1-22 49.2-49.2 49.2zM147.2 236c-1.8 0-3.3 1.5-3.3 3.3v241.2c0 1.8 1.5 3.3 3.3 3.3h241.2c1.8 0 3.3-1.5 3.3-3.3V239.3c0-1.8-1.5-3.3-3.3-3.3H147.2zM388.4 912.9H147.2c-27.1 0-49.2-22.1-49.2-49.2V622.5c0-27.1 22.1-49.2 49.2-49.2h241.2c27.1 0 49.2 22.1 49.2 49.2v241.2c0 27.2-22 49.2-49.2 49.2zM147.2 619.3c-1.8 0-3.3 1.5-3.3 3.3v241.2c0 1.8 1.5 3.3 3.3 3.3h241.2c1.8 0 3.3-1.5 3.3-3.3V622.5c0-1.8-1.5-3.3-3.3-3.3l-241.2 0.1zM780.2 912.9H539c-27.1 0-49.2-22.1-49.2-49.2V622.5c0-27.1 22.1-49.2 49.2-49.2h241.2c27.1 0 49.2 22.1 49.2 49.2v241.2c0 27.2-22.1 49.2-49.2 49.2zM539 619.3c-1.8 0-3.3 1.5-3.3 3.3v241.2c0 1.8 1.5 3.3 3.3 3.3h241.2c1.8 0 3.3-1.5 3.3-3.3V622.5c0-1.8-1.5-3.3-3.3-3.3l-241.2 0.1z"
          fill="currentColor"
          p-id="3219"
        ></path>
        <path d="M691.8 498.2l-170-169.9c-10.2-10.2-10.2-26.8 0-37l169.9-169.9c10.2-10.2 26.8-10.2 37 0l169.9 169.9c10.2 10.2 10.2 26.8 0 37L728.7 498.2c-10.1 10.2-26.8 10.2-36.9 0z" fill="currentColor" p-id="3220"></path>
        <path
          d="M710.3 529.6c-12.8 0-25.5-4.9-35.3-14.6L505.1 345.1c-19.4-19.4-19.4-51.1 0-70.5l169.9-170c19.4-19.4 51.1-19.4 70.5 0l169.9 169.9c19.4 19.4 19.4 51.1 0 70.5L745.5 515c-9.7 9.7-22.5 14.6-35.2 14.6z m0-392.1c-0.6 0-1.3 0.2-1.7 0.7l-170 169.9c-0.9 0.9-0.9 2.5 0 3.4l169.9 169.9c0.6 0.6 1.2 0.7 1.7 0.7s1.1-0.1 1.7-0.7l169.9-169.9c0.9-0.9 0.9-2.5 0-3.4L712 138.2c-0.5-0.5-1.1-0.7-1.7-0.7z"
          fill="currentColor"
          p-id="3221"
        ></path>
      </svg>
      <svg v-else t="1646820904745" style="width: 0.8em; height: 0.8em" class="menu-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2196" width="200" height="200">
        <path
          d="M512 456.310154L94.247385 38.557538a39.542154 39.542154 0 0 0-55.689847 0 39.266462 39.266462 0 0 0 0 55.689847L456.310154 512 38.557538 929.752615a39.542154 39.542154 0 0 0 0 55.689847 39.266462 39.266462 0 0 0 55.689847 0L512 567.689846l417.752615 417.752616c15.163077 15.163077 40.290462 15.36 55.689847 0a39.266462 39.266462 0 0 0 0-55.689847L567.689846 512 985.442462 94.247385a39.542154 39.542154 0 0 0 0-55.689847 39.266462 39.266462 0 0 0-55.689847 0L512 456.310154z"
          p-id="2250"
          fill="currentColor"
        ></path>
      </svg>
    </div>
    <Logo class="logo-container" :options="navbarOptions.logo" />
    <div class="solt-container">
      <el-scrollbar class="bread-scroll">
        <Breadcrumb />
      </el-scrollbar>
      <slot />
    </div>
    <div class="rigth-block">
      <!-- <Tenant /> -->
      <!-- 协议提示 -->
      <div v-if="$store.getters.userInfo.expiration" class="time-tip" @click="showTimeTip">
        <svg-icon icon-class="useTime"></svg-icon>
      </div>
      <div class="right_navs" v-if="fixedRoutersRight.length > 0">
        <AppLink
          v-for="item in fixedRoutersRight"
          :key="item.path"
          :to="item.path"
          :class="{
            active: isActive(item.path)
          }"
        >
          <span class="title">{{ $t('route.' + item.meta.title) }}</span>
        </AppLink>
      </div>
      <FullScreen class="fullscreen" v-if="navbarOptions.fullscreen" />
      <lang-select class="lang-container" v-if="navbarOptions.langSelect" />
      <el-dropdown class="avatar-container" trigger="hover">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="navbarOptions.userAvatar.src || defaultAvatar" v-if="navbarOptions.userAvatar.show" />
          <span>{{ currentUserGroup.name }}</span>
          <i class="el-icon-arrow-down" />
        </div>
        <el-dropdown-menu slot="dropdown" ref="navDropdown">
          <div @mouseenter="showGroup" @mouseleave="hideGroup" class="group-box">
            <!-- <i class="el-icon-connection">
              <ul class="group-list" v-if="groupVisible">
                <li v-for="(item, key) in userGroupList" :key="key" :class="{ 'active-group': item.id === currentUserGroup.id }" @click="chooseGroup(item)" :data-key="item.name">
                  {{ item.name }}
                </li>
              </ul>
            </i> -->
            <span class="group-icon">
              <svg-icon icon-class="userGroup"></svg-icon>
              <ul class="group-list" v-if="groupVisible">
                <li v-for="(item, key) in userGroupList" :key="key" :class="{ 'active-group': item.id === currentUserGroup.id }" @click="chooseGroup(item)" :data-key="item.name">
                  {{ item.name }}
                </li>
              </ul>
            </span>
            <span class="user-name">
              {{ currentUserGroup.name }}
            </span>
          </div>
          <!-- <el-dropdown-item divided>
            <span style="display: block" @click="setPassword">
              <i class="el-icon-setting"></i>
              修改密码
            </span>
          </el-dropdown-item> -->
          <el-dropdown-item divided>
            <span style="display: block" @click="logout"> <i class="el-icon-switch-button" /> LogOut </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 修改密码 -->
    <SetPassword ref="SetPassword" />
    <el-dialog title="提示信息" :append-to-body="true" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px" class="groupDialog">
      <span>
        <i class="el-icon-warning"></i>
        <span class="import-info">平台未获取到您的团队信息</span>
      </span>
      <!-- <el-collapse class="admin-list">
        <el-collapse-item title="管理员列表" name="1">
          <span v-for="(item, index) in adminList" :key="index">{{ item }} <span v-if="index !== adminList.length - 1">、</span> </span>
        </el-collapse-item>
      </el-collapse>
      <span class="tip">添加后，重新刷新此页面。</span> -->
      <div class="tip">1. 所在团队已有大数据平台权限，请联系团队负责人增加人员</div>
      <div class="tip">2. 无大数据团队，联系大数据dahai.yang@ninebot.com进行新增用户组</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Logo from './Logo';
import LangSelect from './LangSelect';
import FullScreen from './FullScreen';
// import Tenant from './Tenant.vue';
import SetPassword from './SetPassword';
import weakStore, { isFixedRouter, opening, modalOpening, closing, open, close } from '../../../utils/weakStore';
import { isExternal } from '../../../utils/validate.js';
import path from 'path';
import AppLink from '../Sidebar/Link';
const avatar = require('../../images/logo.png');
import Breadcrumb from './Breadcrumb.vue';

export default {
  components: {
    Logo,
    LangSelect,
    FullScreen,
    AppLink,
    SetPassword,
    Breadcrumb
    // Tenant
  },
  props: {
    navbarOptions: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data() {
    return {
      ...weakStore,
      defaultAvatar: avatar,
      groupVisible: false,
      dialogVisible: false
    };
  },
  computed: {
    ...mapGetters(['avatar', 'userInfo', 'routers', 'sidebar']),
    fixedRouters() {
      const result = [];
      this.routers.forEach(r => {
        if (isFixedRouter(this.resolvePath(r.path, '/'))) {
          result.push({ ...r, path: this.resolvePath(r.path, '/') });
        } else {
          r.children?.forEach?.(child => {
            if (isFixedRouter(this.resolvePath(child.path, r.path))) {
              result.push({
                ...child,
                path: this.resolvePath(child.path, r.path)
              });
            }
          });
        }
      });
      if (result.length > this.navbarOptions.fixedRouterNum) result.length = this.navbarOptions.fixedRouterNum;
      return result;
    },
    fixedRoutersRight() {
      const result = [];
      this.routers.forEach(r => {
        let path = this.resolvePath(r.path, '/');
        if (this.navbarOptions.rightFixedRouter.includes(path)) {
          result.push({ ...r, path });
        } else {
          r.children?.forEach?.(child => {
            let path = this.resolvePath(child.path, r.path);
            if (this.navbarOptions.rightFixedRouter.includes(path)) {
              result.push({
                ...child,
                path
              });
            }
          });
        }
      });
      return result;
    },
    currentUserGroup() {
      return this.$store.getters['user/currentUserGroup'] || {};
    },
    userGroupList() {
      return this.$store.getters['user/userGroupList'] || [];
    },
    adminList() {
      return this.$store.getters['userInfo'].admins;
    }
  },
  watch: {
    userGroupList: {
      handler(v) {
        if (v.length) {
          this.dialogVisible = false;
        }
        const now = new Date();
        const day = String(now.getDate());
        if (window.localStorage.userTimeTip !== day && this.$store.getters.userInfo.expiration && this.$store.getters.userInfo.expiration < 31) {
          this.$notify({
            title: '提示',
            message: `证书有效期还剩${this.$store.getters.userInfo.expiration}天`,
            type: 'warning',
            duration: 5000
          });
          window.localStorage.userTimeTip = day;
        }
      },
      deep: true
    }
  },
  mounted() {
    if (!this.userGroupList.length) {
      this.dialogVisible = true;
    }
  },
  methods: {
    showTimeTip() {
      if (this.$store.getters.userInfo.expiration) {
        this.$notify({
          title: '提示',
          message: `证书有效期还剩${this.$store.getters.userInfo.expiration}天`,
          type: 'warning',
          duration: 3000
        });
      }
    },
    setPassword() {
      this.$refs.SetPassword?.show();
    },
    showGroup() {
      this.groupVisible = true;
    },
    hideGroup() {
      this.groupVisible = false;
    },
    chooseGroup(item) {
      this.$refs.navDropdown.$el.style.display = 'none';
      this.currentUserGroup = item;
      window.localStorage.currentUserGroup = JSON.stringify(item);
      this.$store.commit('user/SET_USERGROUP', item);
      location.href = this.$locationOrigin + '/home';
      location.reload();
    },
    delayOpenMenu() {
      opening();
      modalOpening();
    },
    delayCloseMenu() {
      // 如果开始展开，并且开没到展开计时结束（没有真正展开），则取消展开计时
      if (this.fixedPannel.opening && !this.fixedPannel.opened) {
        closing();
      }
    },
    toggleMenu() {
      if (this.fixedPannel.opened) {
        close();
      } else {
        open();
      }
    },
    isActive(path) {
      return this.$route.path === path;
    },
    logout() {
      const isCloud = process.env.VUE_APP_IS_CLOUD ? JSON.parse(process.env.VUE_APP_IS_CLOUD) : '';
      if (isCloud) {
        if (this.$store._actions['user/FedLogOut']) {
          this.$store.dispatch('user/FedLogOut').then(() => {
            this.$router.push('/login');
          });
        }
      } else {
        if (this.$store._actions['user/logout']) {
          this.$store.dispatch('user/logout').then(() => {
            this.$router.push('/');
          });
        } else {
          console.log('请配置vuex/action的LogOut或user/logout方法！');
        }
      }
    },
    goFeedback() {
      this.$router.push({ name: 'Feedback' });
    },
    goOrderList() {
      this.$router.push({ name: 'OrderList' });
    },
    resolvePath(routePath, basePath) {
      if (isExternal(routePath)) {
        return routePath;
      }
      if (isExternal(basePath)) {
        return basePath;
      }
      return path.resolve(basePath, routePath);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
$hover-effect: rgba(0, 0, 0, 0.1);
@mixin pointHover() {
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.navbar {
  height: $s-navbar-height;
  overflow: hidden;
  background: $c-nav-primary;
  box-shadow: 0 1px 1px rgba(0, 21, 41, 0.08);

  .menu-btn {
    float: left;
    width: $s-navbar-height;
    height: $s-navbar-height;
    cursor: pointer;
    font-size: 23px;
    margin-right: 0 !important;
    background: $color-c6;
    color: $c-primary;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    &:hover,
    &.active {
      background: $color-c6;
      color: $c-primary;
    }
    .menu-icon {
      width: 1em;
      height: 1em;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  }

  & > * {
    line-height: $s-navbar-height;
    font-size: 14px;
    color: #fff;
    margin-right: 16px;
    &:last-child {
      margin-right: 24px;
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .logo-container {
    float: left;
    height: $s-navbar-height;
    height: 100%;
  }

  .solt-container {
    margin-left: -26px;
    float: left;
    .bread-scroll {
      margin-top: 12px;
      max-width: calc(100vw - 550px);
      ::v-deep {
        .el-scrollbar__bar {
          display: none;
        }
      }
    }
    .navs {
      color: #fff;
      padding-left: 24px;
      a {
        color: inherit;
        display: inline-block;
        font-weight: 500;
        padding: 0 12px;
        position: relative;
        &.active::before {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 1px;
          height: 2px;
          background: #fff;
          border-radius: 3px;
          content: '';
        }
      }
    }
  }

  .rigth-block {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    box-sizing: border-box;
    height: $s-navbar-height;
    line-height: $s-navbar-height;
    color: #fff;
    .time-tip {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .right_navs {
      display: inline-block;
      color: #fff;
      a {
        color: inherit;
        display: inline-block;
        font-weight: 500;
        padding: 0 12px;
        position: relative;
      }
    }
    .fullscreen {
      display: inline-block;
      @include pointHover;
    }
    .avatar-container {
      height: $s-navbar-height;
      display: inline-block;
      @include pointHover;
      .avatar-wrapper {
        color: #fff;
        cursor: pointer;
        position: relative;
        padding: 0 15px;
        .user-avatar {
          vertical-align: middle;
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 5px;
          border-radius: 50%;
        }
      }
    }
    .lang-container {
      color: #fff;
      @include pointHover;
      // margin: 0 8px;
      display: inline-block;
    }
  }
}
.group-box {
  padding: 5px 15px;
  color: #445782;
  .group-icon {
    position: relative;
  }
}
.group-box:hover {
  color: #3782ff;
  background-color: rgb(233, 244, 254);
}
.group-list {
  position: absolute;
  right: 25px;
  top: -13px;
  // width: 120px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
  z-index: 10000;
  li {
    float: left;
    width: 100%;
    padding: 11px 10px;
    color: #445782;
    border-top: 1px solid #e1e5ef;
  }
  li:hover {
    cursor: pointer;
    color: #3782ff;
    background-color: rgb(233, 244, 254);
  }
  .active-group {
    color: #3782ff;
    background-color: rgb(233, 244, 254);
  }
}
.groupDialog {
  line-height: 20px;
  i {
    color: #e6a23c;
  }
  .import-info {
    color: #ff5656;
  }
  .tip {
    // color: #3782ff;
    margin: 15px 0;
  }
}
.admin-list {
  margin: 15px 0;
}
</style>
