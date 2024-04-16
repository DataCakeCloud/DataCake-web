<template>
  <ul>
    <li v-for="node in trees" :key="node.name">
      <div class="node_item tree-node">
        <div class="tree-node-name-title">{{ node.name }}</div>
        <div class="node-icon1" :class="node.isExternal ? 'border_dotted' : ''" />
      </div>
      <Tree v-if="node.children" :trees="node.children" :class="[node.children.length ? (node.children.length < 2 ? 'half' : 'helf') : '']" />
    </li>
  </ul>
</template>
<script>
import Tree from './Tree';

export default {
  name: 'Tree',
  components: {
    Tree
  },
  props: {
    trees: {
      type: Array,
      required: true
    }
  }
};
</script>
<style lang="scss" scoped>
$tree-line-height: 32px;
$tree-indentation: 20px;

li {
  position: relative;
  line-height: $tree-line-height;
  .node_item {
    display: flex;
    align-items: center;
  }
}
ul {
  position: relative;
  margin: 0 $tree-indentation 0 0;
  padding: 0;
  list-style: none;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: -1px;
    border-right: 1px dashed rgba(0, 0, 0, 0.3);
  }
  &.half::before {
    bottom: calc(100% - $tree-line-height / 2);
  }
  &.helf::before {
    bottom: calc($tree-line-height / 2);
  }

  li {
    padding-right: ($tree-indentation + 0.5);
    &:before {
      content: '';
      position: absolute;
      top: ($tree-line-height / 2);
      right: 0;
      width: $tree-indentation;
      height: 1px;
      border-top: 1px dashed rgba(0, 0, 0, 0.3);
    }
    &:last-child:before {
      height: auto;
      top: ($tree-line-height / 2);
      right: -1px;
      bottom: 0;
    }
  }

  ul {
    margin-right: ($tree-indentation / 2); /* half the indentation */
  }
}

.tree-node {
  // padding-bottom: 1px;
  .node-icon1::after {
    // background-color: #f0dd04;
  }
}

.tree-node-name-title {
  white-space: nowrap;
}
</style>
