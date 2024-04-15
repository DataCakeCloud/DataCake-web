import store from '@/store';

const { body } = document;
const WIDTH = 992; // refer to Bootstrap's responsive design

export default {
  computed: {
    // vuex action CloseSideBar
    closeSideBarKey() {
      return this.$store._actions.CloseSideBar ? 'CloseSideBar' : 'app/closeSideBar';
    },
    // vuex action ToggleDevice
    toggleDeviceKey() {
      return this.$store._actions.ToggleDevice ? 'ToggleDevice' : 'app/toggleDevice';
    }
  },
  watch: {
    $route(route) {
      if (this.device === 'mobile' && this.sidebar.opened) {
        store.dispatch(this.closeSideBarKey, { withoutAnimation: false });
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.$_resizeHandler);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resizeHandler);
  },
  mounted() {
    const isMobile = this.$_isMobile();
    if (isMobile) {
      store.dispatch(this.toggleDeviceKey, 'mobile');
      store.dispatch(this.closeSideBarKey, { withoutAnimation: true });
    }
  },
  methods: {
    // use $_ for mixins properties
    // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
    $_isMobile() {
      const rect = body.getBoundingClientRect();
      return rect.width - 1 < WIDTH;
    },
    $_resizeHandler() {
      if (!document.hidden) {
        const isMobile = this.$_isMobile();
        store.dispatch(this.toggleDeviceKey, isMobile ? 'mobile' : 'desktop');

        if (isMobile) {
          store.dispatch(this.closeSideBarKey, { withoutAnimation: true });
        }
      }
    }
  }
};
