<template>
  <div class="wrapper">
    <div class="header">
      <div class="h_lf">SQL助手-Beta</div>
      <div class="h_ri">
        <span class="msg_tips tool_item">
          <i class="el-icon-document" @click="handelHelp"></i>
        </span>
        <i class="el-icon-close tool_item close" @click="close"></i>
      </div>
    </div>
    <div ref="AIsqlContent" class="content">
      <msgItem v-for="(item, index) in msgList" ref="msgItem" :key="index" :options="item" />
    </div>
    <div class="footer">
      <div class="tool_btn">
        <el-checkbox v-model="stop" :disabled="!loading" class="stop_btn" @change="changeStop">停止操作</el-checkbox>
      </div>
      <div class="input_box">
        <el-input ref="inputText" v-model="input" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }" :disabled="loading || stop" class="input_text" placeholder="请输入内容" @keyup.enter.native="handelInput"> </el-input>
        <div class="input_btn" @click="handelInput">
          <svg-icon icon-class="share" class="share_btn" />
        </div>
      </div>
    </div>

    <!-- 数据表的弹窗 -->
    <el-dialog title="请选择数据表" :visible.sync="dialogVisible" width="615px" @close="dialClose">
      <div class="dial_box">
        <el-transfer ref="tableTransfer" v-model="selectionTables" :titles="['数据表', '已选择数据表']" filterable :filter-method="filterMethod" filter-placeholder="请输入表名" :data="tableData">
          <span slot-scope="{ option }">
            <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="option.label" placement="top">
              <span class="block ellipsis" @mouseenter="isShowTooltip">{{ option.label }}</span>
            </el-tooltip>
          </span>
        </el-transfer>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectionTableOk">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 帮助文档 -->
    <el-info v-model="infoObj.type" :title="infoObj.title" width="620px">
      <div v-if="infoObj.type" id="helpDom" v-highlight class="helpDom"></div>
    </el-info>
  </div>
</template>

<script>
import { aiServiceSend, sendTableInfo } from '@/api/querydata';
import { mapGetters } from 'vuex';
import msgItem from './components/msgItem.vue';
import { v4 as uuid } from 'uuid';
import copy from 'copy-to-clipboard';
import { localGetItem } from '@/utils/customStorage';
import { marked } from 'marked';
import axios from 'axios';

export default {
  name: 'AIsql',
  components: {
    msgItem
  },
  props: {
    region: {
      type: String,
      default: ''
    },
    catalog: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      infoObj: {
        type: false,
        title: 'SQL助手教程'
      },
      dialogVisible: false,
      stop: false,
      input: '',
      msgList: [],
      selectionTables: [],
      renderer: null,
      loading: false,
      timer: null,
      contentDom: null,
      cancel: null,
      isTipDisabled: false,
      cueerntStr: ['语法检查', 'SQL优化', 'SQL生成']
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'tableList']),
    tableData() {
      return this.tableList.map(item => ({ key: item, label: item }));
    }
  },
  watch: {
    msgList(newVal) {
      if (newVal[newVal.length - 1]) {
        const endMsgObj = newVal[newVal.length - 1];
        if (endMsgObj.msg.trim() === '语法检查' && newVal.length > 1 && endMsgObj.position === 'right') {
          setTimeout(() => {
            this.msgList.push({
              userName: 'DataCake',
              msg: `您可以这样说：请帮我检查以下SQL是否有什么错误，如果有错，请解释错误并将修改后的SQL以代码块形式返回。SQL为：……`,
              position: 'left'
            });
          }, 1000);
        } else if (endMsgObj.msg.trim() === 'SQL优化' && newVal.length > 1 && endMsgObj.position === 'right') {
          setTimeout(() => {
            this.msgList.push({
              userName: 'DataCake',
              msg: `您可以这样说：请问以下SQL是否可以进一步优化从而提高执行效率，SQL为：……`,
              position: 'left'
            });
          }, 1000);
        } else if (endMsgObj.msg.trim() === 'SQL生成' && newVal.length > 1 && endMsgObj.position === 'right') {
          setTimeout(() => {
            this.msgList.push({
              userName: 'DataCake',
              msg: `
                请选择您要生产SQL的数据表: 
                <span class="ai_sql_btn color_cyan" data-type="4">点击进行选择数据表</sapn>
              `,
              position: 'left'
            });
          }, 1000);
        } else if (endMsgObj.type && endMsgObj.type === 'create_table') {
          setTimeout(() => {
            this.msgList.push({
              userName: 'DataCake',
              msg: `请描述您的需求，例如您可以这样说“请帮我写Trino SQL语句来查询上表中XX的数据，要求日期范围在XX和XX之间；XX字段取值只能为XX、XX；查询出的字段需要有XX、XX。SQL格式化后以代码块形式返回，末尾不要带分号。”`,
              position: 'left'
            });
          }, 1000);
        }
        this.endDomView();
      }
    }
  },
  mounted() {
    this.initMDRender();
    this.contentDom = this.$refs.AIsqlContent;
    if (this.contentDom) {
      this.contentDom.addEventListener('click', this.handelContent);
    }
  },
  destroyed() {
    this.contentDom?.removeEventListener('click', this.handelContent);
    clearTimeout(this.timer);
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
    changeStop(val) {
      if (val) {
        this.cancel && this.cancel();
        setTimeout(() => {
          this.stop = false;
          this.addMsgList({
            userName: 'DataCake',
            msg: '已取消,请重新描述您的需求.',
            position: 'left'
          });
        }, 1500);
      }
    },
    handelHelp() {
      this.infoObj.type = true;
      axios
        .get('/static/help.md')
        .then(res => {
          const dom = document.documentElement.querySelector('#helpDom');
          if (res.data) {
            dom.innerHTML = marked(res.data);
            this.$forceUpdate();
          } else {
            dom.innerHTML = '数据加载失败';
          }
        })
        .catch(() => {
          const dom = document.documentElement.querySelector('#helpDom');
          dom.innerHTML = '数据加载失败';
        });
    },
    addMsgList(data) {
      const loadingMsgIndex = this.msgList.findIndex(item => item.type === 'loading');
      if (loadingMsgIndex === -1) {
        this.msgList.splice(this.msgList.length, 0, data);
      } else {
        this.msgList.splice(loadingMsgIndex, 1, data);
      }
    },
    initMDRender() {
      // 添加一个自定义的 renderer，用于高亮代码块，并添加工具 dom
      this.renderer = new marked.Renderer();
      this.renderer.code = function(code, language) {
        const languageClass = language ? ` class="language-${language}"` : '';
        const tool = `
          <div class="code_tool">
            <span class="tool_language">${language || 'sql'}</span>
            <i class="el-icon-document-copy copy_btn ai_sql_btn" data-type="5" data-code=${encodeURI(code)}></i>
          </div>
        `; // 添加工具 dom
        return `<pre${languageClass}>${tool}<code class="code_msg">${code}</code></pre>`;
      };
    },
    selectionTableOk() {
      if (this.selectionTables.length === 0) {
        this.$message({
          type: 'warning',
          message: '至少选择一个数据表'
        });
        return;
      }
      this.dialogVisible = false;
      this.sendTableInfo(this.selectionTables);
    },
    sendTableInfo(tables) {
      const params = {
        uuid: this.uuid
      };
      params.info = tables.map(table => {
        return {
          region: this.region,
          catalog: this.catalog,
          database: localGetItem('ds-query-database') || '',
          table
        };
      });
      sendTableInfo(params)
        .then(res => {
          this.msgList.push({
            userName: this.userInfo.userId,
            msg: `
            您选择的数据表有: 
            ${tables.map(item => {
    return `<br />${item}`;
  })}
          `,
            type: 'create_table',
            position: 'right'
          });
        })
        .catch(() => {
          this.msgList.push({
            userName: 'DataCake',
            msg: `您选择的数据表,获取数据错误,请重新选择
          <span class="ai_sql_btn color_cyan" data-type="4">点击进行选择数据表</sapn>
          `,
            position: 'left'
          });
        });
    },
    dialClose() {
      this.selectionTables = [];
      this.$nextTick(() => {
        this.$refs.tableTransfer.clearQuery('left');
        this.$refs.tableTransfer.clearQuery('right');
      });
    },
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    handelContent(e) {
      let type;
      if (e && e.target?.className?.includes('ai_sql_btn')) {
        type = e.target.dataset.type;
      }
      switch (type) {
        case '1':
          this.handelSql(type, '语法检查');
          break;
        case '2':
          this.handelSql(type, 'SQL生成');
          break;
        case '3':
          this.handelSql(type, 'SQL优化');
          break;
        case '4':
          this.dialogVisible = true;
          break;
        case '5':
          this.handelCope(e.target.dataset.code);
          break;
      }
    },
    handelCope(str = '') {
      const decodeStr = decodeURI(str);
      const resStr = decodeStr.endsWith(';') ? decodeStr.slice(0, -1) : decodeStr;
      copy(resStr, {
        format: 'text/plain'
      });
      this.$message.success('已复制到剪贴板');
    },
    handelSql(type, msg = '') {
      this.msgList.push({
        userName: this.userInfo.userId,
        msg,
        position: 'right'
      });
    },
    init(type = 1, data) {
      this.uuid = uuid();
      // type  1;正常打开  2;点击错误分析打开
      if (type === 1) {
        this.msgList.push({
          userName: 'DataCake',
          msg: `请您选择要进行的操作 
                <span class="ai_sql_btn" data-type="1">语法检查</sapn>
                <span class="ai_sql_btn" data-type="2">SQL生成</sapn>
                <span class="ai_sql_btn" data-type="3">SQL优化</sapn>
              `,
          position: 'left'
        });
      } else if (type === 2) {
        this.handelInput(data);
      }
    },
    close() {
      this.msgList = [];
      this.$emit('close');
    },
    endDomView() {
      this.$nextTick(() => {
        const msgDomList = this.$refs.msgItem;
        const currentDom = msgDomList[msgDomList.length - 1]?.$el;
        if (currentDom) {
          currentDom.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    },
    handelInput(data) {
      if (!this.input.trim() && !data.msg) return;

      let msg = '';
      if (data.msg) {
        msg = `请帮我排查sql运行错误,sql语句为: ${data.sql},报错信息是: ${data.msg} 请解释原因并给出修改后的sql,并以代码块的方式返回`;
      }

      this.msgList.push({
        userName: this.userInfo.userId,
        msg: msg || this.input,
        position: 'right'
      });

      // 指定的语句不需要发送
      if (this.cueerntStr.some(str => str === this.input.trim())) {
        this.$nextTick(() => {
          this.$refs.inputText?.focus();
        });
        this.input = '';
        return;
      }

      this.loading = true;
      const params = {
        content: msg || this.input,
        uuid: this.uuid
      };

      this.timer = setTimeout(() => {
        this.addMsgList({
          userName: 'DataCake',
          msg: 'SQL小助手正在奋笔疾书中，请您稍候......',
          type: 'loading',
          position: 'left'
        });
      }, 1000 * 1);

      const self = this;
      const config = {
        cancelToken: new axios.CancelToken(function executor(c) {
          // executor 函数接收一个 cancel 函数作为参数
          self.cancel = c;
        })
      };
      aiServiceSend(params, config)
        .then(res => {
          this.addMsgList({
            userName: 'DataCake',
            msg: res.data.answer,
            transMSg: marked(res.data.answer || '', { renderer: this.renderer }),
            position: 'left'
          });
        })
        .catch(err => {
          if (axios.isCancel(err)) return;
          this.addMsgList({
            userName: 'DataCake',
            msg: err.msg || err.massage || '服务器资源紧张,请稍后重试.....',
            position: 'left'
          });
        })
        .finally(() => {
          this.loading = false;
          clearTimeout(this.timer);

          // 获取焦点处理
          this.$nextTick(() => {
            this.$refs.inputText?.focus();
          });
        });
      this.input = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  border: 1px solid #e2e9f3;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 95px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #e2e9f3;

    .h_lf {
      font-weight: 550;
    }

    .h_ri {
      display: flex;
      align-items: center;

      .tool_item {
        margin: 0 3px;
        cursor: pointer;
      }

      .msg_tips {
        display: inline-block;
        padding: 3px;
        border-radius: 5px;
        overflow: hidden;
        color: #fff;
        background-color: #fe711e;
      }

      .close {
        font-size: $global-font-size-16;
      }
    }
  }

  .content {
    flex: 1;
    overflow: auto;
    padding: 5px 15px;
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 5px 20px 15px 20px;

    .tool_btn {
      .el-checkbox {
        transform: scale(0.8);
        margin-left: -7px;
        margin-bottom: 2px;
      }
    }

    .input_box {
      position: relative;

      .input_btn {
        cursor: pointer;
        position: absolute;
        right: 0;
        bottom: 0;
        height: 28px;
        width: 35px;
        line-height: 30px;
        // border-left: 1px solid #e2e0fe;

        .share_btn {
          margin-left: 10px;
          color: #9587de;
          font-size: $global-font-size-16;
          transform: rotate(45deg);
        }
      }
    }

    .input_text {
      ::v-deep .el-textarea__inner {
        padding-right: 35px;
        height: 28px;
        // line-height: 28px;
        border: none;
        background-color: #f7f7f7;
        &::-webkit-scrollbar {
          display: none;
        }

        &::placeholder {
          font-size: $global-font-size-12;
          color: #c0bdbd;
          line-height: 22px;
        }
      }
    }
  }
}
.helpDom {
  line-height: 1.8;
  ::v-deep {
    pre > code {
      border-radius: 8px;
    }
    img {
      width: 80%;
    }
  }
}
</style>
5.11
