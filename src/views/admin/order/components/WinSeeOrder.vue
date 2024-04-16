<template>
  <div>
    <el-dialog title="工单详情" class="order-dialog" :visible.sync="dialogVisible" width="900px" :close-on-click-modal="false" @close="resetForm">
      <el-card v-loading="loading">
        <el-descriptions title="基础信息" :column="4" label-class-name="des-label">
          <template slot="extra">
            <template v-if="isEdit">
              <i class="el-icon-refresh-left toolbar-icon" title="取消" @click="isEdit = false"></i>
              <svg-icon class="toolbar-icon" icon-class="save" title="保存" @click="save" />
            </template>
            <i v-else class="el-icon-edit toolbar-icon" title="编辑" @click="edit"></i>
          </template>
          <el-descriptions-item label="工单编号">{{ data.id }}</el-descriptions-item>
          <el-descriptions-item label="工单提出人">{{ data.createBy }}</el-descriptions-item>
          <el-descriptions-item label="值班人">{{ data.chargePerson }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ data.handleBy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="分值">{{ data.score || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工单状态">{{ statusList[data.status] }}</el-descriptions-item>
          <el-descriptions-item label="所属产品">
            <el-select v-if="isEdit" v-model="newModule" placeholder="请选择所属产品" size="mini">
              <el-option v-for="item in moduleList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <template v-else>{{ data.module }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="问题分类">
            <el-select v-if="isEdit" v-model="newType" placeholder="请选择问题分类" size="mini">
              <el-option v-for="item in typeList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <template v-else>{{ data.type }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="问题标题">{{ data.title }}</el-descriptions-item>
          <el-descriptions-item label="任务ID">{{ data.taskId }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">{{ data.feedbackLevel || '一般' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card id="chat-wrap" v-loading="loading" class="chat-wrap">
        <chat-dialog v-for="item in data.feedbackProcessItemList" :key="item.id" :chat-left="!item.isCurrentUser" :user="item.createBy">
          <div v-for="attach in item.attachmentList" :key="attach.id">
            <big-img v-if="/\.(jpg|jpeg|png)$/.test(attach.fileName)" :img-src="downloadAttach(attach.id, 'img')"></big-img>
            <a v-else class="primary" @click="downloadAttach(attach.id, 'other')">{{ attach.fileName }}</a>
          </div>
          <div class="message">{{ item.detail }}</div>
          <div class="time">{{ item.createTime | dataTime }}</div>
        </chat-dialog>
      </el-card>
      <el-card v-if="['UN_ACCEPT', 'ACCEPTED'].includes(data.status)" class="enter-box">
        <div v-if="isAdmin" class="btn-wrap">
          <el-button type="text" size="mini" :disabled="['SOLVED', 'SCORED', 'ACCEPTED'].includes(data.status)" @click="handleAccept">受理</el-button>
          <el-button type="text" size="mini" :disabled="['SOLVED', 'SCORED'].includes(data.status)" @click="handleTransfer">转让</el-button>
        </div>
        <el-input v-model="message" type="textarea" class="textarea" placeholder="请输入要写入的内容（Shift+Enter换行，Ctrl+V支持上传图片）" rows="5" clearable @paste.native="handlePaste" @keydown.native="keydown"></el-input>
        <div class="btn-line">
          <el-upload ref="upload" action="" :accept="accept" :show-file-list="false" :on-change="fileChange" :on-exceed="fileExceed" :limit="3" :multiple="true" :auto-upload="false">
            <i class="el-icon-paperclip" title="上传附件"></i>
          </el-upload>
          <div>
            <el-button type="primary" size="mini" :disabled="!data.sendCloseFlag" @click="send">发送</el-button>
            <el-button size="mini" :disabled="!data.sendCloseFlag" @click="close">关闭工单</el-button>
          </div>
        </div>
      </el-card>
      <div v-if="['SOLVED', 'SCORED'].includes(data.status)" class="align-r">
        <el-button size="mini" @click="reopen">继续咨询</el-button>
      </div>
    </el-dialog>
    <win-transfer ref="transferOrder" @save="saveTransfer"></win-transfer>
    <win-close-order ref="closeOrder" @save="saveClose"></win-close-order>
  </div>
</template>
<script>
import ChatDialog from '@/components/ChatDialog';
import BigImg from '@/components/bigImg';
import WinTransfer from './WinTransfer';
import WinCloseOrder from './WinCloseOrder';
import { getDetail, updateInfo, sendMessage, acceptFeedback, reopenFeedback } from '@/api/feedback'; // modifyFeedback,

export default {
  name: 'WinSeeOrder',
  components: {
    ChatDialog,
    BigImg,
    WinTransfer,
    WinCloseOrder
  },
  data() {
    return {
      sending: false,
      dialogVisible: false,
      loading: false,
      isAdmin: false,
      feedbackId: '',
      data: {},
      isEdit: false,
      moduleList: ['数据查询', '数据开发', '业务BI', '资源中心', '数据治理', '其他'],
      newModule: '',
      newType: '',
      statusList: {
        UN_ACCEPT: '待接单',
        ACCEPTED: '处理中',
        SOLVED: '已完成',
        SCORED: '已打分'
      },
      message: '',
      btnDisabled: false
    };
  },
  computed: {
    typeList() {
      let list = [];
      if (this.newModule === '数据查询') {
        list = ['查询失败', '功能故障', '权限类', '产品功能/交互体验', '其他'];
      } else if (this.newModule === '数据开发') {
        list = ['任务失败类', '调度异常类', '任务配置类', '权限类', '产品建议', '其他'];
      } else if (this.newModule === '数据治理') {
        list = ['查询故障', '权限问题', '功能故障', '交互体验', '功能优化', '其他'];
      } else {
        list = ['故障类', '运维类', '权限类', '产品建议', '其他'];
      }
      return list;
    },
    lastProcessItemId() {
      const process = this.data.feedbackProcessItemList;
      const lastObj = process[process.length - 1];
      return lastObj.id;
    },
    accept() {
      return '.doc, .docx, .pdf, .jpg, .jpeg, .png, .xlsx';
    }
  },
  methods: {
    showWin(isAdmin, id) {
      this.isAdmin = isAdmin;
      this.feedbackId = id;
      this.getInfo(id);
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    scrollToBottom() {
      const div = document.getElementById('chat-wrap');
      div && (div.scrollTop = div.scrollHeight);
    },
    getInfo(id) {
      this.loading = true;
      getDetail({
        feedbackId: id
      }).then(res => {
        const data = res.data;
        this.data = data;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        this.loading = false;
      });
    },
    edit() {
      this.isEdit = true;
      this.newModule = this.data.module;
      this.newType = this.data.type;
    },
    save() {
      updateInfo({
        id: this.feedbackId,
        module: this.newModule,
        type: this.newType,
        maxId: this.lastProcessItemId
      }).then(res => {
        const data = res.data;
        this.data.module = data.module;
        this.data.type = data.type;
        this.isEdit = false;
        this.data.feedbackProcessItemList.push(...data.feedbackProcessItemList);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });
    },
    downloadAttach(id, type) {
      const url = process.env.VUE_APP_API_GATEWAY_PATH + `ds_task/attachment/download?id=${id}`;
      if (type === 'img') {
        return url;
      }
      window.location.href = url;
      return;
    },
    handleAccept() {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const formData = new FormData();
      formData.append('feedbackId', this.feedbackId);
      acceptFeedback(formData, config).then(data => {
        this.$message({
          type: 'success',
          message: '受理成功'
        });
        this.getInfo(this.feedbackId);
        // this.$parent.getList();
        this.$emit('save');
      });
    },
    handleTransfer() {
      this.$refs.transferOrder.showWin(this.feedbackId);
    },
    saveTransfer() {
      this.getInfo(this.feedbackId);
      // this.$parent.getList();
      this.$emit('save');
    },
    close() {
      this.$refs.closeOrder.showWin(this.isAdmin, this.feedbackId);
    },
    saveClose() {
      this.getInfo(this.feedbackId);
      // this.$parent.getList();
      this.$emit('save');
    },
    reopen() {
      this.$confirm('继续咨询将重开工单，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          reopenFeedback({
            feedbackId: this.feedbackId,
            maxId: this.lastProcessItemId
          }).then(res => {
            const data = res.data;
            this.data.status = data.status;
            this.data.feedbackProcessItemList.push(...data.feedbackProcessItemList);
            this.$nextTick(() => {
              this.scrollToBottom();
            });
            // this.$parent.getList();
            this.$emit('save');
          });
        })
        .catch(() => {});
    },
    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items;
      let file = null;

      if (!items || items.length === 0) {
        this.$message.error('当前浏览器不支持粘贴');
        return;
      }
      // 搜索剪切板items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
      // 此时file就是我们的剪切板中的图片对象
      if (file) {
        this.addFile(file); // 预览
      }
    },
    addFile(file) {
      if (file.type.indexOf('image') >= 0) {
        const reader = new FileReader();
        let img;
        reader.onload = event => {
          img = `<image src="${event.target.result}" width="500" />`;
          this.$confirm(img, '提示', {
            customClass: 'img-preview',
            confirmButtonText: '上传',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true
          })
            .then(() => {
              this.sendMsg([file]);
            })
            .catch(() => {});
        };
        reader.readAsDataURL(file);
      }
    },
    fileExceed() {
      this.$message({
        type: 'warning',
        message: '最多上传3个文件'
      });
    },
    fileChange(file, fileList) {
      const files = fileList.map(item => item.raw);
      this.sendMsg(files);
    },
    sendMsg(fileList) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const formData = new FormData();
      formData.append('feedbackId', this.feedbackId);
      formData.append('detail', this.message);
      formData.append('maxId', this.lastProcessItemId);
      if (fileList) {
        fileList.forEach(item => {
          formData.append('multipartFileList', item);
        });
      }
      this.sending = true;
      sendMessage(formData, config)
        .then(res => {
          const data = res.data;
          this.data.feedbackProcessItemList.push(...data.feedbackProcessItemList);
          this.message = '';
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        })
        .finally(() => {
          this.sending = false;
          this.$refs.upload.clearFiles();
        });
    },
    resetForm() {
      this.message = '';
      this.isEdit = false;
      this.data = {};
    },
    send() {
      if (this.sending) return;
      if (this.message) {
        this.sendMsg();
      } else {
        this.$message.error('请输入内容');
      }
    },
    keydown(e) {
      if (!e.shiftKey && e.keyCode === 13) {
        this.send();
        e.cancelBubble = true; // ie阻止冒泡行为
        e.preventDefault(); // 取消事件的默认动作*换行
        e.stopPropagation(); // Firefox阻止冒泡行为
        return false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.order-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 0;
  }
  .toolbar-icon {
    cursor: pointer;
    &:hover {
      color: $c-primary;
    }
  }
  .chat-wrap {
    margin-top: 10px;
    margin-bottom: 10px;
    max-height: 300px;
    overflow-y: auto;
    .message {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .time {
      margin-top: 5px;
      font-size: $global-font-size-12;
      text-align: right;
      color: #c0c4cc;
    }
  }
  .enter-box {
    position: relative;
    .btn-wrap {
      position: absolute;
      right: 10px;
      top: 5px;
      z-index: 10;
      ::v-deep .el-button {
        min-width: 30px;
      }
    }
    .textarea {
      ::v-deep .el-textarea__inner {
        border: 0;
        padding: 0;
        margin-top: 2px;
      }
    }
    .btn-line {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 10px;
      .el-icon-paperclip {
        cursor: pointer;
        font-size: $global-font-size-18;
        &:hover {
          color: $c-primary;
        }
      }
    }
  }
}
</style>
