<template>
  <ul class="ui-tree">
    <li>
      <div class="node">
        <div class="node-icon" />
        <div class="tree-node-name">[DAG]</div>
      </div>
      <Tree :trees="trees" />
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
<style lang="scss">
.ui-tree {
  margin: 14px 0;
  padding: 0;
  list-style: none;
}
.node {
  display: flex;
  align-items: center;
  line-height: 30px;
}
.node-icon {
  vertical-align: middle;
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 32px;
  border-radius: 11px;
  background-color: #555;
  margin-right: 12px;
}
.node-icon::after {
  content: '';
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #fff;
  left: 1px;
}
</style>
