<template>
  <div>
    <el-tabs class="process">
      <div>
        <div class="editor_tool">
          <div class="left-box">
            <div class="editor-btn">
              <span>{{ $t('task.taskEditor1') }}</span>
              <sql-smaple :name="editorInfo.sqlTip" class="sqlSmaple"></sql-smaple>
            </div>
            <div class="editor-btn" @click="checkSql">
              <i class="el-icon-success"></i>
              {{ $t('task.taskEditor2') }}
            </div>
            <div class="editor-btn" @click="formatSql">
              <i class="el-icon-s-open"></i>
              {{ $t('task.taskEditor3') }}
            </div>
            <div class="editor-btn" @click="clearSql">
              <i class="el-icon-delete"></i>
              {{ $t('task.taskEditor4') }}
            </div>
            <div v-if="editorInfo.showGitPull" class="editor-btn" @click="pullGitSql">
              <i class="el-icon-download"></i>
              {{ $t('task.taskEditor5') }}
            </div>
            <div>
              <span class="tips" @click="handelInfo('jinjia', $t('task.taskEditor6'))"> {{ $t('task.taskEditor6') }}</span>
            </div>
          </div>
          <div v-if="editorInfo.showRightBtn" class="right-box">
            <EditorDataSelect :editor-info="editorInfo" />
            <el-button class="setBtn" type="primary" size="mini" @click="rBtnClick('highSetting')">{{ $t('task.highSetting') }}</el-button>
          </div>
        </div>
        <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']" :style="{ height: editorInfo.height ? editorInfo.height : '300px' }">
          <span class="require">*</span>
          <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? $t('task.commonSmall') : $t('task.commonBig')" @click="switchFullscreen"></i>
          <!-- :read-only="seniorForm.sqlType === 'git'" -->
          <monaco-editor ref="monaco" v-model="content" :rules="monacoRules" :init-keywords="editorInfo.editorKeywords" :class="{ editor: true, 'full-editor': !editorInfo.showRightBtn }"></monaco-editor>
          <div v-if="editorInfo.showRightBtn" class="editor-btn-box">
            <div v-if="editorInfo.region && editorInfo.editorDataDb" :class="{ active: activeDrawer === 'dataTable' }" @click="rBtnClick('dataTable')">{{ $t('task.taskEditor7') }}</div>
            <div v-if="editorInfo.region" :class="{ active: activeDrawer === 'udfFunc' }" @click="rBtnClick('udfFunc')"><span class="udf">udf</span>{{ $t('task.taskEditor8') }}</div>
            <!-- <div @click="rBtnClick('highSetting')">{{$t('task.highSetting')}}</div> -->
          </div>
          <div id="drawerBox" class="drawer-box" :class="{ 'active-box': activeDrawer !== '' }">
            <!-- 拖拽表单宽度的按钮 -->
            <div v-if="activeDrawer !== '' && editorInfo.showDragBtn" v-dragSize="dragSizeObj" class="drop" style="right: 55%">
              <i class="el-icon-more icon"></i>
            </div>
            <div class="drawer-content">
              <slot></slot>
              <EditorUdfDrawer v-show="activeDrawer === 'udfFunc'" :editor-info="editorInfo" @insertSqlHeader="insertSqlHeader" @insertSql="insertSql" />
              <EditorTableDrawer v-show="activeDrawer === 'dataTable'" :editor-info="editorInfo" @insertSql="insertSql" />
            </div>
          </div>
          <div v-if="activeDrawer !== ''" class="mask" @click="clickMask"></div>
        </div>
        <div v-if="editorInfo.alertMessage" class="mt10">{{ $t('task.taskEditor9') }}</div>
        <el-alert v-if="editorInfo.alertMessage" id="checkMsg" class="check-msg" type="info" :closable="false">{{ editorInfo.alertMessage }}</el-alert>
      </div>
    </el-tabs>
    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
    </el-info>
  </div>
</template>
<script>
import SqlSmaple from './SqlSmaple';
import editerTipsMixin from '@/utils/editerTipsMixin';
import MonacoEditor from '@/components/MonacoEditor/index';
import EditorDataSelect from './EditorDataSelect.vue';
import EditorUdfDrawer from './EditorUdfDrawer.vue';
import EditorTableDrawer from './EditorTableDrawer.vue';
import SqlTips from './SqlTips';
export default {
  components: { SqlSmaple, MonacoEditor, SqlTips, EditorDataSelect, EditorUdfDrawer, EditorTableDrawer },
  mixins: [editerTipsMixin],
  props: {
    value: {
      type: String,
      default: ''
    },
    // 从模版传入配置和信息，以及传给子组件配置和信息都放在这一个对象里
    editorInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      content: this.value,
      fullscreen: false,
      dragSizeObj: {},
      activeDrawer: '',
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      }
    };
  },
  computed: {
    editorParams() {
      return {
        region: this.editorInfo.region || '',
        catalog: 'iceberg'
      };
    }
  },
  watch: {
    value(v) {
      this.content = v;
    },
    content(v) {
      this.$emit('input', v);
    }
  },
  mounted() {
    const result = {};
    result.sizeDom = document.getElementById('drawerBox');
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
    this.dragSizeObj = result;
  },
  methods: {
    insertSql(text) {
      this.$refs.monaco.insertContent(text);
    },
    insertSqlHeader(val) {
      this.content = val + '\n' + this.content;
      this.$refs.monaco.setCode(this.content);
    },
    clickMask() {
      this.activeDrawer = '';
    },
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.msgType = msgType;
      this.infoObj.title = title;
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    getMonaco() {
      return this.$refs.monaco;
    },
    checkSql() {
      this.$emit('editorEmit', 'checkSql');
    },
    formatSql() {
      this.$refs.monaco.formatSql();
    },
    clearSql() {
      this.$emit('editorEmit', 'clearSql');
    },
    pullGitSql() {
      this.$emit('editorEmit', 'pullGitSql');
    },
    rBtnClick(type) {
      if (type === 'highSetting') {
        this.activeDrawer = '';
        this.$emit('editorEmit', 'highSetting');
      } else {
        if (this.activeDrawer) {
          if (this.activeDrawer !== type) {
            setTimeout(() => {
              this.activeDrawer = type;
            }, 200);
          }
          this.activeDrawer = '';
        } else {
          this.activeDrawer = type;
        }
        // 初始化弹窗宽度，避免上一次拖拽效果
        // document.getElementById('drawerBox').style.width = '500px';
        // 去掉运动效果，以便于拖拽
        // setTimeout(() => {
        //   document.getElementById('drawerBox').style.transition = 'none';
        // }, 500);
      }
    },
    emitDb(db) {
      this.dataDb = db;
    }
  }
};
</script>
<style lang="scss" scoped>
.process {
  .sqlSmaple {
    top: 7px;
    left: 52px;
    line-height: 14px;
    background-color: transparent;
    border: none;
  }
  .check-msg {
    margin-top: 5px;
    white-space: pre-line;
    max-height: 200px;
    overflow-y: auto;
    ::v-deep .el-alert__content {
      max-height: 200px;
    }
  }
  .check-msg::-webkit-scrollbar {
    width: 10px;
  }
  .monaco-editor-wrap {
    height: 300px;
    position: relative;
    .drawer-box {
      width: 0px;
      position: absolute;
      height: 100%;
      top: 0;
      right: 35px;
      z-index: 3000;
    }
    .active-box {
      transition: width 0.3s;
      width: 500px;
    }
  }
  .right-box {
    margin-right: 50px;
    display: flex;
    align-items: flex-end;
    .setBtn {
      margin-left: 10px;
    }
  }
  .btn-full-screen {
    right: 65px;
  }
  ::v-deep .el-tabs__content {
    overflow: visible;
    .monaco-btns {
      position: absolute;
      right: 0;
      top: -45px;
    }
    .editor_tool {
      margin: -10px 0 5px 0;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      .left-box {
        display: flex;
        min-width: 450px;
        .editor-btn {
          cursor: pointer;
          margin-right: 30px;
          display: flex;
          align-items: center;
          .el-icon-success,
          .el-icon-s-open,
          .el-icon-delete,
          .el-icon-download {
            color: #108ee9;
            font-size: $global-font-size-16;
            cursor: pointer;
          }
          .sqlSmaple {
            top: -5px;
            left: 50px;
          }
        }
      }
    }
  }
  .editor {
    width: calc(100% - 35px);
  }
  // .full-editor {
  //   width: 100%;
  // }
  .editor-btn-box {
    height: 100%;
    writing-mode: tb-rl;
    position: absolute;
    right: 0;
    top: 0;
    line-height: 35px;
    text-align: center;
    display: flex;
    background-color: #f4f6f9;
    z-index: 3000;
    div {
      height: 100px;
      width: 35px;
      border-bottom: 1px solid #ccc;
      cursor: pointer;
      .udf {
        writing-mode: lr;
        line-height: 18px;
      }
    }
  }
}
.active {
  color: #3782ff;
}
.drop {
  height: 40px;
  line-height: 20px;
  border-radius: 2px;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid #f2f2f2;
  position: absolute;
  top: 50%;
  left: 0px;
  transform: translate(0, -50%);
  .icon {
    transform: rotate(90deg) translateY(12px);
    color: #c0c0c0;
  }
}
.drawer-content {
  height: 100%;
  width: 100%;
}
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
  z-index: 1000;
}
</style>
