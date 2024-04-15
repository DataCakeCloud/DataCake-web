<template>
  <router-link class="nav-logo" :to="homePath" v-if="options.show || options.titleShow">
    <!-- <svg-icon class-name="logo" icon-class="logo-white" /> -->
    <img v-if="options.show" :src="options.src || defaultLogo" alt="logo" class="svg-icon" />
    <span v-if="options.titleShow">{{ $t('route.title') }}</span>
  </router-link>
</template>

<script>
const defaultLogo = require('../../images/logo-white.svg');
import { mapGetters } from 'vuex';
export default {
  name: 'Logo',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data() {
    return {
      defaultLogo: defaultLogo,
      homePath: ''
    };
  },
  created() {
    // this.homePath = `/home?tenantName=${this.userInfo.tenantName}`;
    this.homePath = '/home';
  }
};
</script>

<style lang="scss" scoped>
.nav-logo {
  display: flex;
  .svg-icon {
    /* width: 180px;
    height: 62px; */
    width: 143px;
    height: 45px;
    margin: auto 16px;
  }
  & > span {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
