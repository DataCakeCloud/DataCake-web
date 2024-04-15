<template>
  <div :class="['node_item', { current_item: data.isRootId }, { [data.position]: data.isBoundary }]">
    <div class="content">
      <div class="box_item">
        <span class="node_title">hive: </span>
        <el-tooltip placement="top" :disabled="isTipDisabled2" :enterable="false" :content="data.qn.split('.').slice(1, 3).join('.') || '-'">
          <div class="node_text table_name" @mouseenter="isShowTooltip2">
            {{ data.qn.split('.').slice(1, 3).join('.') || '-' }}
          </div>
        </el-tooltip>
      </div>
      <div class="box_item">
        <span class="node_title node_title_icon round"></span>
        <el-tooltip placement="top" :disabled="isTipDisabled" :content="data.qn.split('.')[3] || '-'">
          <div class="node_text ellipsis" @mouseenter="isShowTooltip">
            {{ data.qn.split('.')[3] || '-' }}
          </div>
        </el-tooltip>
      </div>
    </div>
    <i v-if="data.isBoundary" :class="['el-icon-circle-plus-outline', 'add_icon', data.position]"></i>
  </div>
</template>
<script>
export default {
  name: 'ColumnNode',
  inject: ['getGraph', 'getNode'],
  data() {
    return {
      data: {
        id: null,
        qn: '',
        shape: 'table-node',
        width: 200,
        height: 36,
        isRootId: false,
        upNum: null,
        downNum: null,
        isBoundary: false,
        position: ''
      },
      isTipDisabled: true,
      isTipDisabled2: true
    };
  },
  mounted() {
    const data = this.getNode().getData();
    this.data = data;
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    isShowTooltip2(e) {
      const clientHeight = e.target.clientHeight;
      const scrollHeight = e.target.scrollHeight;
      if (scrollHeight > clientHeight) {
        this.isTipDisabled2 = false;
      } else {
        this.isTipDisabled2 = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.node_item {
  position: relative;
  border: 2px solid $c-primary !important;
  padding: 5px 10px;
  border-radius: 8px;
  color: #333;
  height: 100%;
  background-color: #fff;
  &.current_item {
    border-top-width: 6px !important;
    box-shadow: 0 0 10px #5f5e5e;
    .table_name {
      color: #000 !important;
      cursor: default !important;
    }
  }
  &.up .content {
    margin-left: 16px;
  }
  &.down .content {
    margin-right: 16px;
  }
  .box_item {
    display: flex;
    // align-items: center;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
    .node_title_icon {
      width: 1em;
      height: 1em;
      margin-top: 1px;
    }
    .node_text {
      flex: 1;
      text-align: start;
      padding-left: 5px;
      &.table_name {
        cursor: pointer;
        color: $c-primary;
        display: -webkit-box;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  .add_icon {
    cursor: pointer;
    color: #666;
    position: absolute;
    font-size: $global-font-size-20;
    bottom: calc(50% - 10px);
    &.up {
      left: 3px;
    }
    &.down {
      right: 3px;
    }
  }
  .round {
    border-radius: 50%;
    background-color: #f69c27;
    overflow: hidden;
  }
}
</style>
