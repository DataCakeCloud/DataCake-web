<template>
  <div class="fullscreen-outer" @click="handleFullscreen">
    <!-- <svg-icon :icon-class="isFullscreen?'fullscreen-exit':'fullscreen'" class="fullscreen-icon" /> -->
    <img v-if="isFullscreen" src="../../images/fullscreen-exit.svg" alt="fullscreen" class="fullscreen-icon" />
    <img v-else src="../../images/fullscreen.svg" alt="fullscreen" class="fullscreen-icon" />
  </div>
</template>

<script>
export default {
  name: 'Screenfull',
  data() {
    return {
      isFullscreen: false
    };
  },
  methods: {
    handleFullscreen() {
      if (this.isFullscreen) {
        this.closeFullScreen();
      } else {
        this.openFullScreen();
      }
    },
    openFullScreen() {
      const el = document.documentElement;
      const rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (typeof rfs !== 'undefined' && rfs) {
        rfs.call(el);
        this.isFullscreen = true;
      } else {
        this.$message({
          message: 'you browser can not work',
          type: 'warning'
        });
      }
      return;
    },
    closeFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.isFullscreen = false;
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        this.isFullscreen = false;
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
        this.isFullscreen = false;
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        this.isFullscreen = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.fullscreen-outer {
  padding: 0 10px;
  color: #fff;
}
.fullscreen-icon {
  width: 22px;
  vertical-align: -6px !important;
}
</style>
