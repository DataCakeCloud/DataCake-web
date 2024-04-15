<template>
  <div class="sql-box">
    <div class="sql-box-btn">
      <el-button v-if="isShowCheck" type="primary" size="mini" :disabled="disabled" @click="checkSql">校验</el-button>
      <el-button type="primary" size="mini" :disabled="disabled" @click="formatSql">格式化</el-button>
      <el-button type="primary" size="mini" :disabled="disabled" @click="clearSql">清除</el-button>
    </div>
    <div :class="['sql-box-content', fullscreen ? 'table-fullscreen' : '']">
      <div :class="['label', required ? 'required' : '']" :style="{ width: widthStyle + 'px' }">{{ label }}</div>
      <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '全屏'" @click="switchFullscreen"></i>
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SqlBox',
  props: {
    label: {
      type: String,
      default: 'SQL'
    },
    required: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    isShowCheck: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    widthStyle: {
      type: String,
      default: '60'
    }
  },
  data() {
    return {
      fullscreen: false
    };
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
  },
  methods: {
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    checkSql() {
      this.$emit('check', this.name);
    },
    formatSql() {
      this.$emit('format', this.name);
    },
    clearSql() {
      this.$emit('clear', this.name);
    }
  }
};
</script>
<style lang="scss" scoped>
.sql-box {
  margin-bottom: 20px;
  .sql-box-btn {
    text-align: right;
    margin-bottom: 5px;
  }
  .table-fullscreen {
    overflow-y: hidden;
  }
  .sql-box-content {
    height: 300px;
    display: flex;
    position: relative;
    .label {
      width: 60px;
      text-align: right;
    }
    .required {
      &:before {
        content: '*';
        color: #ff5656;
        margin-right: 4px;
      }
    }
    .content {
      flex: 1;
    }
  }
}
</style>
