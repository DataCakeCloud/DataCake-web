<template>
  <div id="watermark" :class="classObj" class="app-wrapper">
    <navbar v-if="!hideNavbar && !$slots.header" class="fixed-header" :navbar-options="navbarNewOptions">
      <slot v-if="$slots['header-custom']" name="header-custom" />
      <slot v-else-if="$slots.default" name="default" />
    </navbar>
    <slot v-if="$slots.header" name="header" />
    <slot v-if="$slots.container" name="container" />
    <div v-else class="main-container">
      <sidebar :navbar-options="navbarNewOptions" :is-open-menu-all="navbarNewOptions.isOpenMenuAll" class="sidebar-container" />
      <app-main :mircoStart="mircoStart" />
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components';
import ResizeMixin from './mixin/ResizeHandler';
import watermark from '@/utils/watermark.js';
import { mapGetters } from 'vuex';
// import weakStore from "../utils/weakStore";

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  mixins: [ResizeMixin],
  props: {
    hideNavbar: {
      type: Boolean,
      default: false
    },
    navbarOptions: {
      type: Object,
      default: function () {
        return {};
      }
    },
    watermark: {
      type: Object,
      default: function () {
        return {
          show: false,
          text: ''
        };
      }
    },
    mircoStart: {
      type: Function
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'sidebar']),
    // sidebar() {
    //   return this.$store.state.app.sidebar;
    // },
    device() {
      return this.$store.state.app.device;
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader;
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        // withoutAnimation: this.sidebar.withoutAnimation,
        // mobile: this.device === 'mobile',
        hideNavbar: this.hideNavbar
      };
    },
    navbarNewOptions() {
      const logo = Object.assign(
        {
          show: true,
          src: '',
          titleShow: true
        },
        this.navbarOptions.logo || {}
      );
      const userAvatar = Object.assign(
        {
          show: true,
          src: ''
        },
        this.navbarOptions.userAvatar || {}
      );
      return Object.assign(
        {
          fullscreen: true,
          langSelect: true,
          fixedRouterNum: 4,
          rightFixedRouter: []
        },
        this.navbarOptions,
        { logo: logo, userAvatar: userAvatar }
      );
    }
  },
  mounted() {
    if (this.watermark.show) {
      const options = Object.assign({ text: this.userInfo.userId || 'SHAREit' }, { ...this.watermark }, { renderNode: 'watermark' });
      this.$nextTick(() => {
        watermark(options);
      });
    }
  },
  methods: {
    handleClickOutside() {
      if (this.$store._actions.CloseSideBar) {
        this.$store.dispatch('CloseSideBar', { withoutAnimation: false });
      } else if (this.$store._actions['app/closeSideBar']) {
        this.$store.dispatch('app/closeSideBar', { withoutAnimation: false });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/mixin.scss';
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 3000;
  width: 100%;
  transition: width 0.28s;
}

.mobile .fixed-header {
  width: 100%;
}
</style>
