<template>
  <div v-drag="{ dragElSelector: '.float-ball-wrap' }" :class="['float-ball', 'transition', { hover: canHover }]" :style="ballStyle">
    <div class="float-ball-wrap">
      <!-- <el-tooltip effect="light" content="用户反馈" placement="left">
        <svg-icon icon-class="opinion" class="float-ball-icon" style="margin-left: 12px" @click="openFeedback"></svg-icon>
      </el-tooltip> -->
      <el-tooltip effect="light" content="在线工单" placement="left">
        <i class="float-ball-icon el-icon-service" @click="openBox"></i>
      </el-tooltip>
      <!-- <el-tooltip effect="light" content="引导开关" placement="left">
        <i v-show="isCloud && userInfo.roles" class="float-ball-icon el-icon-guide" @click="handleGuidanceMode"></i>
      </el-tooltip> -->
      <el-tooltip effect="light" content="用户手册" placement="left">
        <i class="float-ball-icon el-icon-notebook-2" @click="openManual"></i>
      </el-tooltip>
    </div>
    <el-dialog title="提交反馈问题" :visible.sync="value" width="600px" :append-to-body="true" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="ruleForm" label-position="top" :model="ruleForm" :rules="rules" label-width="100px">
        <!-- <el-form-item label="问题类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择问题类型" clearable style="width: 100%">
            <el-option label="任务" value="任务"></el-option>
            <el-option label="交互" value="交互"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="页面链接" prop="pageUri">
          <el-input v-model="ruleForm.pageUri" placeholder="请输入页面链接" clearable></el-input>
        </el-form-item> -->
        <div class="mb10">感谢您使用Data Cake平台，我们的进步需要您的建议</div>
        <el-form-item label="您对Data Cake的满意程度为" prop="score">
          <el-rate v-model="ruleForm.score" :max="10" show-score></el-rate>
        </el-form-item>
        <el-form-item label="欢迎您对Data Cake提出建议" prop="adviceInfo">
          <el-input v-model="ruleForm.adviceInfo" type="textarea" rows="4" placeholder="您可以畅所欲言，任务需求或槽点都可以在此提出；支持Ctrl+V粘贴图片" maxlength="300" clearable @paste.native="handlePaste"></el-input>
          <div style="position: absolute; right: 0">{{ ruleForm.adviceInfo.length }}/300</div>
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload ref="upload" action="" :accept="accept" :on-change="fileChange" :on-exceed="fileExceed" :on-remove="fileRemove" :limit="3" :multiple="true" :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">支持扩展名：.doc, .docx, .pdf, .jpg, .jpeg, .png；最多上传3个文件</div>
          </el-upload>
          <el-progress v-show="loading" style="margin-top: 10px; width: 400px" status="success" :text-inside="true" :stroke-width="20" :percentage="percentage"></el-progress>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="value = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { saveAdvice } from '@/api/feedback';
import { mapGetters } from 'vuex';

export default {
  name: 'FloatBall',
  props: {
    value: {
      type: Boolean,
      reauired: true,
      default: false
    }
  },
  data() {
    return {
      btnDisabled: false,
      loading: false,
      percentage: 0,
      canHover: false,
      ballStyle: {
        right: 0,
        height: '114px'
      },
      ruleForm: {
        // type: '',
        // pageUri: '',
        score: null,
        adviceInfo: '',
        multipartFileLists: []
      },
      rules: {
        // type: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
        // pageUri: [{ required: true, message: '请输入页面链接', trigger: 'blur' }],
        score: [{ required: true, message: '请选择分数', trigger: 'blur' }],
        adviceInfo: [{ required: true, message: '请输入问题说明', trigger: 'blur' }]
      }
    };
  },
  computed: {
    ...mapGetters(['isCloud', 'guidanceMode', 'userInfo']),
    accept() {
      return '.doc, .docx, .pdf, .jpg, .jpeg, .png';
    }
  },
  watch: {
    value() {
      this.$emit('input', this.value);
    },
    $route: {
      handler(val) {
        if (val.path.indexOf('cost') === -1) {
          this.canHover = false;
          this.ballStyle = {
            right: 0,
            height: this.isCloud ? '82px' : '50px'
          };
          return;
        }
        this.canHover = true;
        this.ballStyle = {
          right: '-30px',
          height: this.isCloud ? '82px' : '50px'
        };
      },
      immediate: true
    }
  },
  methods: {
    openBox() {
      const { href } = this.$router.resolve({
        path: '/admin/order/create'
      });
      window.open(href, '_blank');
    },
    handleGuidanceMode() {
      this.$store.dispatch('app/setGuidanceMode', !this.guidanceMode);
    },
    openManual() {
      window.open('https://shimo.im/docs/pmkxQmWOO4COMKAN', '_blank');
    },
    openFeedback() {
      this.value = true;
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
        this.$refs.upload.handleStart(file);
      }
    },
    fileChange(file, fileList) {
      this.ruleForm.multipartFileLists = fileList.map(item => item.raw);
    },
    fileRemove(file, fileList) {
      this.ruleForm.multipartFileLists = fileList.map(item => item.raw);
    },
    fileExceed() {
      this.$message({
        type: 'warning',
        message: '最多上传3个文件'
      });
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.$refs.upload.clearFiles();
      this.ruleForm.multipartFileLists = [];
    },
    onUploadProgress(ProgressEvent) {
      if (ProgressEvent.lengthComputable) {
        const num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
        this.percentage = num >= 98 ? 99 : num;
      }
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };
          const formData = new FormData();
          formData.append('score', this.ruleForm.score);
          formData.append('adviceInfo', this.ruleForm.adviceInfo);
          if (this.ruleForm.multipartFileLists.length) {
            config.onUploadProgress = ProgressEvent => {
              this.onUploadProgress(ProgressEvent);
            };
            this.ruleForm.multipartFileLists.forEach(item => {
              formData.append('multipartFileLists', item);
            });
          }
          this.btnDisabled = true;
          this.loading = true;
          saveAdvice(formData, config)
            .then(res => {
              this.$message({
                type: 'success',
                message: '提交成功'
              });
              this.value = false;
            })
            .finally(() => {
              this.loading = false;
              this.btnDisabled = false;
              this.percentage = 0;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.float-ball {
  position: fixed;
  bottom: 220px;
  /* right: -30px; */
  z-index: 888;
  width: 40px;
  /* height: 146px; */
  line-height: normal;
  border-radius: 50px;
  opacity: 0.8;
  background: $c-nav-primary;
  .float-ball-wrap {
    width: 100%;
    height: 100%;
    text-align: center;
    overflow: hidden;
    .float-ball-icon {
      font-size: $global-font-size-18;
      cursor: pointer;
      display: block;
      margin: 15px 0;
    }
  }

  &.hover {
    &:hover {
      right: 0px;
    }
  }
}
</style>
