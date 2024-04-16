<template>
  <div class="data-set-item">
    <div class="data-set-item-header">{{ label }}</div>
    <div class="data-set-item-content">
      <i class="el-icon-info"></i>
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DataSetItem',
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="scss" scoped>
.data-set-item {
  margin-bottom: 15px;
  .data-set-item-header {
    padding: 10px;
  }
  .data-set-item-content {
    min-height: 90px;
    margin: 0 auto;
    padding: 15px 22px;
    background: #ecf5ff;
    color: #409eff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    &:hover {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
    }
    .el-icon-info {
      position: absolute;
      left: 7px;
    }
  }
}
</style>
