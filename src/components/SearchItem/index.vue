<template>
  <el-col :span="span">
    <div class="search-item">
      <span class="label" :style="{ width: width }">{{ label }}</span>
      <slot></slot>
    </div>
  </el-col>
</template>
<script>
export default {
  name: 'SearchItem',
  props: {
    span: {
      type: Number,
      default: 24
    },
    label: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '100px'
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="scss" scoped>
.search-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  .label {
    display: inline-block;
    // min-width: 100px;
    text-align: right;
    margin-right: 5px;
  }
}
</style>
