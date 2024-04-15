<template>
  <div class="sql-box">
    <div class="sql-box-btn">
      <el-button type="primary" size="mini" @click="checkSql">sql校验</el-button>
      <el-button type="primary" size="mini" @click="formatSql">格式化</el-button>
      <el-button type="primary" size="mini" @click="clearSql">清除</el-button>
    </div>
    <div class="sql-smaple">
      在下方填写SQL，包含insert，overwrite等，还有一些别的Tips
      <el-popover class="sql-tips" placement="bottom" width="900" trigger="click">
        <div class="monaco-editor-wrap">
          <monaco-editor ref="monaco" v-model="content" :read-only="true"></monaco-editor>
        </div>
        <i slot="reference" class="el-icon-info"></i>
      </el-popover>
    </div>
    <div :class="['sql-box-content', fullscreen ? 'table-fullscreen' : '']">
      <div :class="['label', required ? 'required' : '']">{{ label }}：</div>
      <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import MonacoEditor from '@/components/MonacoEditor/index';

export default {
  name: 'SqlBox',
  components: {
    MonacoEditor
  },
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
    }
  },
  data() {
    return {
      fullscreen: false,
      content: this.$t('data.sqlExam')
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
  position: relative;
  .sql-box-btn {
    text-align: right;
    margin-bottom: 5px;
  }
  .table-fullscreen {
    overflow-y: hidden;
  }
  .sql-box-content {
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
.sql-smaple {
  position: absolute;
  top: 0px;
  left: 52px;
  font-size: $global-font-size-12;
  border: 1px solid #91d5ff;
  background: #e6f7ff;
  color: #888;
  padding: 4px 10px;
  border-radius: 2px;
  .el-icon-info {
    color: #108ee9;
    font-size: $global-font-size-16;
    position: relative;
    top: 1px;
    cursor: pointer;
  }
}
.monaco-editor-wrap {
  height: 300px;
}
</style>
