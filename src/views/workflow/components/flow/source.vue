<template>
  <div class="flow-node">
    <el-tooltip effect="dark" placement="right" :open-delay="500">
      <div slot="content">
        <h3>数据集信息：</h3>
        <div>名称：{{ data.label }}</div>
      </div>
      <span class="label">{{ data.label }}</span>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'SourceNode',
  inject: ['getGraph', 'getNode'],
  data() {
    return {
      node: null,
      data: {}
    };
  },
  mounted() {
    const self = this;
    this.node = this.getNode();
    this.data = this.node.getData();
    // 监听数据改变事件
    this.node.on('change:data', ({ current }) => {
      self.data = current;
    });
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.flow-node {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid #5f95ff;
  border-radius: 50%;
  .label {
    display: inline-block;
    flex: 1;
    margin-left: 46px;
    color: #000;
    font-size: $global-font-size-12;
  }
}
</style>
