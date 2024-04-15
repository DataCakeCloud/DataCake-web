<template>
  <div :class="['node_item', { current_item: data.isRootId }, { [data.position]: data.isBoundary }]">
    <div class="content">
      <span v-if="data.isRootId" class="lf-num">
        {{ data.upNum || 0 }}
      </span>
      <el-tooltip placement="top" :disabled="isTipDisabled" :enterable="false" :content="data.qn.split('.').slice(1).join('.') || '-'">
        <div class="table_name" @mouseenter="isShowTooltip">
          {{ data.qn.split('.').slice(1).join('.') }}
        </div>
      </el-tooltip>
      <span v-if="data.isRootId" class="rg-num">
        {{ data.downNum || 0 }}
      </span>
    </div>
    <i v-if="data.isBoundary" :class="['el-icon-circle-plus-outline', 'add_icon', data.position]"></i>
  </div>
</template>
<script>
export default {
  name: 'TableNode',
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
      isTipDisabled: true
    };
  },
  mounted() {
    const data = this.getNode().getData();
    this.data = data;
  },
  methods: {
    isShowTooltip(e) {
      const clientHeight = e.target.clientHeight;
      const scrollHeight = e.target.scrollHeight;
      if (scrollHeight > clientHeight) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.node_item {
  width: 100%;
  height: 100%;
  border: 1px solid #c2c8d5;
  border-radius: 15px;
  padding: 2px;
  background-color: #fff;
  &.up .content {
    margin-left: 20px;
  }
  &.down .content {
    margin-right: 20px;
  }
  &.current_item {
    background-color: $c-primary !important;
    .content {
      .lf-num,
      .rg-num {
        background-color: #fff;
        color: #000;
      }
      .table_name {
        cursor: default;
        color: #fff;
      }
    }
  }
  .content {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .lf-num,
    .rg-num {
      display: inline-block;
      padding: 0 5px;
      height: 20px;
      line-height: 18px;
      border: 1px solid $c-primary;
      border-radius: 10px;
      color: #000;
      flex-shrink: 0;
    }
    .lf-num {
      margin-right: 5px;
    }
    .rg-num {
      margin-left: 5px;
    }
  }
  .table_name {
    color: $c-primary;
    padding: 0 2px;
    text-align: center;
    width: 100%;
    cursor: pointer;
    display: -webkit-box;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .add_icon {
    cursor: pointer;
    color: #666;
    position: absolute;
    bottom: calc(50% - 10px);
    font-size: $global-font-size-20;
    &.up {
      left: 3px;
    }
    &.down {
      right: 3px;
    }
  }
}
</style>
