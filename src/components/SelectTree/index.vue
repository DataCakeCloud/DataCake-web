<template>
  <el-select ref="selectTree" v-model="label" placeholder="请选择文件夹" style="width: 100%" clearable @clear="$emit('input', '')">
    <template v-if="treeData.length > 0">
      <el-option hidden value=""></el-option>
      <el-tree :data="treeData" v-bind="treeOptions" @node-click="handleNodeClick"></el-tree>
    </template>
  </el-select>
</template>

<script>
import { findSubsetById } from '@/utils/index';

export default {
  name: 'SelectTree',
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    treeOptions: {
      type: Object,
      default: () => ({
        props: {
          children: 'children',
          label: 'label',
          value: 'label'
        },
        'default-expand-all': true,
        'expand-on-click-node': false
      })
    },
    value: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      label: ''
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.label = findSubsetById(this.treeData, val, this.treeOptions.props.value)?.[this.treeOptions.props.label] || '';
        } else {
          this.label = '';
        }
      },
      immediate: true
    }
  },
  methods: {
    handleNodeClick(data, node) {
      this.$emit('input', data[this.treeOptions.props.value]);
      this.label = data[this.treeOptions.props.label];
      this.$refs.selectTree.blur();
    }
  }
};
</script>

<style scoped lang="scss"></style>
