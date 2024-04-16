<template>
  <div class="flow-node">
    <img class="logo" :src="data.logo" alt="" />
    <el-tooltip effect="dark" placement="right" :open-delay="500">
      <div slot="content">
        <template v-if="data.name">
          <h3>任务信息：</h3>
          <div>名字： {{ data.name }}</div>
          <div>类型 {{ data.type }}</div>
          <div>数据集 {{ data.source }}</div>
        </template>
        <template v-else>
          <div>{{ data.description }}</div>
        </template>
      </div>
      <span class="label">{{ data.name || data.label }}</span>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'Task',
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
  background-color: #5f95ff;
  border: 1px solid #5f95ff;
  border-radius: 4px;
  .logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }
  .label {
    display: inline-block;
    // flex-shrink: 0;
    flex: 1;
    margin-left: 8px;
    color: #fff;
    font-size: $global-font-size-12;
  }
}
</style>
