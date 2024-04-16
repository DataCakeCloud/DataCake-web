<template>
  <div class="task-config-bar">
    <div>配置栏</div>
    <el-form :model="taskInfo">
      <el-form-item label="名称">
        <el-input v-model="taskInfo.name"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-input v-model="taskInfo.type"></el-input>
      </el-form-item>
      <el-form-item label="数据集">
        <el-input v-model="taskInfo.source"></el-input>
      </el-form-item>
    </el-form>
    <div>
      <el-button @click="submit">保存</el-button>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';

export default {
  props: {
    curNode: {
      required: true
    }
  },
  data() {
    return {
      taskInfo: {}
    };
  },
  watch: {
    curNode() {
      this.taskInfo = cloneDeep(this.curNode.getData());
    }
  },
  created() {
    this.taskInfo = cloneDeep(this.curNode.getData());
  },
  methods: {
    submit() {
      this.$emit('change', this.taskInfo);
    }
  }
};
</script>

<style lang="scss" scoped>
.task-config-bar {
  height: 100%;
  padding: 10px;
  background-color: #ffffff;
}
</style>
