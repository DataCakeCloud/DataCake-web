<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu class="main-menu" :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg" :text-color="variables.menuText" :unique-opened="false" :active-text-color="variables.menuActiveText" :collapse-transition="false" mode="vertical">
        <sidebar-item-not-admin v-for="route in routers" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
      <el-divider></el-divider>
      <el-menu class="main-menu" :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg" :text-color="variables.menuText" :unique-opened="false" :active-text-color="variables.menuActiveText" :collapse-transition="false" mode="vertical">
        <sidebar-item-is-admin v-for="route in routers" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
    <hamburger />

    <!-- 漂浮 menu -->
    <div class="sidebar-shadow" v-show="!isShow" @click="close()"></div>
    <menu-pannel :navbar-options="navbarOptions" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SidebarItemNotAdmin from './SidebarItemNotAdmin';
import SidebarItemIsAdmin from './SidebarItemIsAdmin';
import variables from '../../../styles/variables.scss';
import Hamburger from '../Navbar/Hamburger';
import weakStore, { isFixedRouter, close } from '../../../utils/weakStore';
import MenuPannel from './MenuPannel';
import { isExternal } from '../../../utils/validate.js';
import path from 'path';

export default {
  components: { SidebarItemNotAdmin, SidebarItemIsAdmin, Hamburger, MenuPannel },
  data() {
    return weakStore;
  },
  props: {
    navbarOptions: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isOpenMenuAll: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'routers']),
    openeds() {
      if (this.isOpenMenuAll) {
        return this.fixedRouters.filter(item => item.path.startsWith('/')).map(({ path }) => path);
      } else {
        return [];
      }
    },
    fixedRouters() {
      const result = [];
      this.routers.forEach(r => {
        if (isFixedRouter(this.resolvePath(r.path, '/'))) {
          result.push(r);
        } else {
          const children = [];
          r.children?.forEach?.(child => {
            if (isFixedRouter(this.resolvePath(child.path, r.path))) {
              children.push(child);
            }
          });
          if (children.length) {
            result.push({ ...r, children });
          }
        }
      });
      return result;
    },
    routes() {
      return this.$router.options.routes;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
    isShow() {
      return !this.fixedPannel.opened;
    }
  },
  methods: {
    close,
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

<style lang="scss" rel="stylesheet/sass" scoped>
::v-deep .el-divider--horizontal {
  width: 90%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

::v-deep .el-scrollbar__bar {
  &.is-vertical {
    width: 5px;
  }
}

::v-deep .el-scrollbar__thumb {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::v-deep .el-scrollbar__thumb:hover {
  background: rgba(91, 112, 228, 0.6);
}
</style>
