<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :max="10">
        <router-view v-if="$route.meta.keepAlive" :key="key" />
      </keep-alive>
    </transition>
    <transition name="fade-transform" mode="out-in">
      <router-view v-if="!$route.meta.keepAlive" :key="key" />
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  props: {
    mircoStart: {
      type: Function
    }
  },
  computed: {
    key() {
      // 对于微应用场景，相同的路由，不希望切换对应的渲染组件
      return this.$route.name;
      // return this.$route.path;
    }
  },
  mounted() {
    if (this.mircoStart && !window.qiankunStarted) {
      window.qiankunStarted = true;
      this.mircoStart();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';
.fixed-header + .app-main {
  padding-top: $s-navbar-height;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
