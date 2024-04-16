<template>
  <div class="filter-tree-wrap">
    <el-input v-model="filterText" placeholder="输入关键字进行过滤" suffix-icon="el-icon-search"></el-input>
    <!-- el-icon-folder-opened -->
    <el-tree ref="tree" class="filter-tree" :data="data" node-key="id" :props="defaultProps" :highlight-current="true" :expand-on-click-node="false" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick"> </el-tree>
  </div>
</template>
<script>
export default {
  name: 'FilterTree',
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'createBy'
      },
      // 选中的所有父级元素
      parentsNodeArr: []
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.createBy.indexOf(value) !== -1;
    },
    handleNodeClick(data, node) {
      this.parentsNodeArr = [];
      while (node.label) {
        this.parentsNodeArr.unshift({
          id: node.key,
          label: node.label
        });
        node = node.parent;
      }
      this.$emit('nodeClick', this.parentsNodeArr, data);
    }
  }
};
</script>
<style lang="scss" scoped>
.filter-tree-wrap {
  .filter-tree {
    margin-top: 15px;
    overflow-y: auto;
    height: calc(100vh - 185px);
    ::v-deep .el-tree-node__expand-icon.expanded {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    ::v-deep .el-icon-caret-right:before {
      font-size: $global-font-size-14;
      content: '\e78a'; /*具体的图标*/
    }
    ::v-deep .el-tree-node__expand-icon.expanded.el-icon-caret-right:before {
      font-size: $global-font-size-14;
      content: '\e784'; /*具体的图标*/
    }
  }
}
</style>
