<template>
  <el-col :span="span" class="data-set">
    <div v-if="title" class="title">{{ title }}</div>
    <div class="content">
      <slot></slot>
    </div>
  </el-col>
</template>
<script>
export default {
  name: 'DataSet',
  props: {
    span: {
      type: Number,
      default: 24
    },
    title: {
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
.data-set {
  // margin-top: 20px;
  .title {
    font-size: $global-font-size-16;
    padding: 15px;
    border-bottom: 1px solid #dcdfe6;
  }
  .content {
    padding: 15px 20px;
  }
}
</style>
