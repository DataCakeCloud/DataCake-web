<template>
  <div :class="['task-state', taskInstanceStateClass, 'task']">
    <img class="logo" :src="logo" :alt="task.name || task.label" />
    <span class="label">{{ task.name || task.label }}</span>
  </div>
</template>

<script>
import { dataSetList, otherList } from '@/utils/tools';

export default {
  props: {
    task: {
      required: true,
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    logo() {
      if (this.task.logo) return this.task.logo;
      let cur = '';
      [...dataSetList, ...otherList].find(sheet => (cur = sheet.list.find(item => item.templateCode === this.task.templateCode)));
      return cur?.logo || 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg';
    },

    taskInstanceStateClass() {
      return this.task && this.task.taskInstance ? this.task.taskInstance.state : '';
    }
  }
};
</script>

<style lang="scss" scoped>
.task {
  display: flex;
  align-items: center;
  width: 200px;
  height: 40px;
  background-color: #5f95ff;
  border: 1px solid #5f95ff;
  border-radius: 4px;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 12px;

  .logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }
  .label {
    display: inline-block;
    flex: 1;
    margin-left: 8px;
    color: #fff;
    font-size: $global-font-size-12;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
