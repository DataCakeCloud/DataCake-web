<template>
  <div id="app">
    <router-view />
    <back-to-top bottom="80px" right="0px">
      <el-button type="text" class="btn btn-info btn-to-top"><i class="el-icon-caret-top"></i></el-button>
    </back-to-top>
  </div>
</template>

<script>
import BackToTop from 'vue-backtotop';
export default {
  name: 'App',
  components: {
    BackToTop
  },
  created() {}
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.btn-to-top {
  background-color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: $c-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $global-font-size-20;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  z-index: 5;

  &:hover {
    background-color: #f2f6fc;
  }
}
</style>
