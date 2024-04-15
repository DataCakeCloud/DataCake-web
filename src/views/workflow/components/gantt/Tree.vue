<template>
  <ul>
    <li v-for="node in trees" :key="node.name">
      <div class="node tree-node">
        <div class="node-icon" />
        <div class="tree-node-name">{{ node.name }}</div>
      </div>
      <Tree v-if="node.children" :trees="node.children" />
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
  .node {
    display: flex;
    align-items: center;
  }
}
ul {
  position: relative;
  margin: 0 0 0 $tree-indentation;
  padding: 0;
  list-style: none;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1px;
    border-left: 1px dotted rgba(0, 0, 0, 0.3);
  }

  li {
    padding-left: ($tree-indentation + 0.5);
    &:before {
      content: '';
      position: absolute;
      top: ($tree-line-height / 2);
      left: 0;
      width: $tree-indentation;
      height: 1px;
      border-top: 1px dotted rgba(0, 0, 0, 0.3);
    }
    &:last-child:before {
      height: auto;
      top: ($tree-line-height / 2);
      left: -1px;
      bottom: 0;
    }
  }

  ul {
    margin-left: ($tree-indentation / 2); /* half the indentation */
  }
}

.tree-node {
  // padding-bottom: 1px;
  .node-icon::after {
    background-color: #f0dd04;
  }
}

.tree-node-name {
  white-space: nowrap;
}
</style>
