<template>
  <div class="iframe-box">
    <iframe src="/official/index.html" frameborder="0" class="iframe"></iframe>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  created() {
    window.postMsg = msg => {
      this.$router.push({ name: 'Dashboard' });
    };
  }
};
</script>
<style lang="scss" scoped>
.iframe-box {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #fff;
  z-index: 99999;
}
.iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
