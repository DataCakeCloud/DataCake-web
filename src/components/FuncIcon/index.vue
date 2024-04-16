<template>
  <div class="func-icon">
    <!-- <el-tooltip effect="dark" content="添加转换函数" placement="top" popper-class="tag-popper">
      <div class="func-icon-code">&lt;/&gt;</div>
    </el-tooltip> -->
    <div v-if="showicon" class="func-icon-code">&lt;/&gt;</div>
    <div class="func-icon-line">
      <div class="circle left"></div>
      <div class="circle right"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FuncIcon',
  props: {
    showicon: {
      type: Boolean,
      default: true
    }
  }
};
</script>
<style lang="scss" scoped>
.func-icon {
  width: 100%;
  min-width: 80px;
  min-height: 24px;
  color: $c-primary;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 5px;
  .func-icon-code {
    text-align: center;
    cursor: pointer;
  }
  .func-icon-line {
    position: relative;
    border-top: 1px solid $c-primary;
    // top: -5px;
    .circle {
      position: absolute;
      top: -4px;
      width: 6px;
      height: 6px;
      box-shadow: 0 1px 2px 0 #dbdde9;
      background-color: $c-primary;
      border-radius: 50%;
    }
    .left {
      left: 0;
    }
    .right {
      right: 0;
    }
  }
}
</style>
