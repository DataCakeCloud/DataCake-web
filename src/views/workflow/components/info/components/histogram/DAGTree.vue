<template>
  <ul class="ui_tree">
    <li v-for="tree in trees" :key="tree.nodeID" style="list-style: none">
      <div class="node_item">
        <div class="node-icon1" :class="tree.isExternal ? 'border_dotted' : ''" />
        <div class="tree-node-name-title">{{ tree.taskName }}</div>
      </div>
      <Tree v-if="tree.children" :trees="tree.children" />
    </li>
  </ul>
</template>
<script>
import Tree from './Tree.vue';
export default {
  name: '',
  components: { Tree },
  props: {
    trees: {
      type: Array,
      required: true
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .ui_tree {
  margin: 14px 0;
  padding: 0;
  list-style: none;
}
::v-deep .node_item {
  display: flex;
  align-items: center;
  line-height: 30px;
  justify-content: start;
}
::v-deep .node-icon1 {
  vertical-align: middle;
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 32px;
  border-radius: 11px;
  // background-color: #555;
  border: 2px solid #555;
}
::v-deep .tree-node-name-title {
  margin-left: 12px;
  white-space: nowrap;
}
::v-deep .node-icon1::after {
  content: '';
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  // background-color: #fff;
  left: 0;
  top: -1px;
}
::v-deep .border_dotted {
  border-style: dashed;
}
</style>
