<template>
  <el-drawer ref="infoDrawer" class="info_wrap" :title="title" :visible="visible" direction="rtl" :size="width" :close-on-press-escape="false" :modal="false" :before-close="beforeClose" @update:visible="visible = $event">
    <div class="content">
      <slot>
        <el-empty description="暂无数据"></el-empty>
      </slot>
    </div>

    <!-- 拖拽 -->
    <div v-if="visible" v-dragSize="dragSizeObj" class="drop" style="right: 55%">
      <i class="el-icon-more icon"></i>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'ElInfo',
  props: {
    title: {
      type: String,
      default: '提示信息'
    },
    value: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '360px'
    }
  },
  data() {
    return {
      visible: this.value,
      sizeDom: null,
      dragType: false
    };
  },
  computed: {
    dragSizeObj() {
      const result = {};
      result.sizeDom = this.sizeDom;
      result.sizeDomSeat = 'right';
      result.dropSeatType = 'right';
      result.callbackStatus = this.dragCallBack;
      result.sizeType = {
        width: true
      };
      result.limit = {
        minWidth: parseInt(this.width) + '',
        maxWidth: '50%'
      };
      return result;
    }
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible(val) {
      this.$emit('input', val);
    }
  },
  mounted() {
    this.sizeDom = this.$refs.infoDrawer.$el.querySelector('.el-drawer');
  },
  methods: {
    dragCallBack(status, e) {
      if (status === 'mouseup') {
        this.dragType = true;
        setTimeout(() => {
          this.dragType = false;
        }, 200);
      }
    },
    beforeClose(done) {
      if (!this.dragType) done();
    }
  }
};
</script>

<style lang="scss" scoped>
.info_wrap {
  z-index: 3001 !important;
  ::v-deep {
    .el-drawer__header {
      font-size: $global-font-size-16;
      padding: 10px;
      margin-bottom: 0;
      color: #606266;
      font-weight: 550;
      border-bottom: 2px solid #e2e9f3;
    }
    .el-drawer__body {
      overflow: auto;
      padding: 10px 10px 10px 20px;
      .content {
        // border: 1px solid #e2e9f3;
        // border-radius: 5px;
        // width: 100%;
        // padding: 5px 10px 15px 10px;
        .title1 {
          font-weight: 550;
          padding: 5px 0;
          color: #606266;
        }
        line-height: 1.5;
      }
    }
    .drop {
      height: 56px;
      line-height: 38px;
      border-radius: 2px;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 12px solid #f2f2f2;
      position: fixed;
      top: 50%;
      transform: translate(100%, -50%);
      .icon {
        transform: rotate(90deg) translateY(12px);
        color: #c0c0c0;
      }
    }
  }
}
</style>
