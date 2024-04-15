<template>
  <div class="msg_item">
    <div class="msg_content" :style="styleFn()">
      <el-avatar v-if="options.position === 'left'" size="large" :src="src"></el-avatar>
      <div class="msg">
        <div class="header">
          <div class="name">{{ `@${options.userName || 'DataCake'}` }}</div>
          <div v-if="options.position === 'left'" class="tool">
            <i class="el-icon-document-copy copy" @click="handelCopy(options.msg)"></i>
          </div>
        </div>
        <slot>
          <div v-highlight :class="['msg_box', options.position === 'left' ? 'addPadding' : '']" v-html="options.transMSg || options.msg"></div>
        </slot>
      </div>
      <el-avatar v-if="options.position === 'right'" size="large" :src="src"></el-avatar>
    </div>
  </div>
</template>

<script>
import copy from 'copy-to-clipboard';

export default {
  name: 'AIsql',
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          userName: '',
          msg: '',
          position: 'left'
        };
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    src() {
      return this.options.position === 'left' ? require('@/assets/avatar/avatar1.jpeg') : require('@/assets/avatar/avatar2.png');
    }
  },
  methods: {
    handelCopy(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    styleFn() {
      const res = {};
      res['background-color'] = this.options.position === 'left' ? '#c4ecfe' : '#e2e0fe';
      res['float'] = this.options.position;
      return res;
    }
  }
};
</script>

<style lang="scss" scoped>
.msg_item {
  overflow: hidden;
  margin-bottom: 10px;

  .msg_content {
    min-width: 200px;
    max-width: 75%;
    padding: 5px 10px;
    display: inline-flex;
    align-items: start;
    background-color: #e2e0fe;
    border-radius: 10px;
    overflow: hidden;

    .msg {
      flex: 1;

      .header {
        display: flex;
        justify-content: space-between;
        color: $c-primary;
        .name {
          opacity: 0;
        }
        .tool {
          .copy {
            cursor: pointer;
          }
        }
      }

      .msg_box {
        margin-top: -4px;
        width: 100%;
        overflow: auto;
        line-height: 1.5;
        word-break: break-all;
        word-wrap: break-word;
        &.addPadding {
          padding-right: 12px;
        }
        ::v-deep {
          .ai_sql_btn {
            margin: 0 5px;
            color: $c-primary;
            cursor: pointer;

            &.color_cyan {
              color: #63d717;
            }
          }
          .code_tool {
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-start-start-radius: 8px;
            border-start-end-radius: 8px;
            background-color: #343540;
            .tool_language {
              color: #fff;
            }
            .copy_btn {
              color: #fff;
              margin-right: 5px;
              cursor: pointer;
            }
          }
          .code_msg {
            // margin-top: -33px;
          }

          pre > code {
            background: #000;
            color: #fff;
            border-bottom: 2px solid #e8e8ed;
            border-radius: 8px;
            border-start-start-radius: 0px;
            border-start-end-radius: 0px;
            display: block;
            overflow: auto;
            padding: 15px;
            text-align: start;
            font-size: $global-font-size-14;
            line-height: 18px;
          }
        }
      }
    }
  }
}
</style>
