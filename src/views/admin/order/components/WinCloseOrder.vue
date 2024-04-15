<template>
  <el-dialog title="关闭工单" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" label-width="130px">
      <el-form-item v-if="isAdmin" label="工单解决方案：">
        <el-input v-model="ruleForm.resolveReply" type="textarea" rows="4" placeholder="工单解决方案"></el-input>
      </el-form-item>
      <div v-else>
        <el-form-item label="关闭工单的原因：">
          <el-radio-group v-model="ruleForm.resolveReply">
            <el-radio label="自己已解决"></el-radio>
            <el-radio label="不想问了"></el-radio>
            <el-radio label="找不到人工"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="请您对工单评分：">
          <el-rate v-model="ruleForm.score" show-text :texts="scoreTexts"></el-rate>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { closeFeedback, scoreFeedback } from '@/api/feedback';
export default {
  name: 'WinCloseOrder',
  data() {
    return {
      dialogVisible: false,
      isAdmin: false,
      ruleForm: {
        feedbackId: '',
        resolveReply: '',
        score: 5
      },
      scoreTexts: ['极差', '失望', '一般', '满意', '十分满意'],
      btnDisabled: false
    };
  },
  methods: {
    showWin(isAdmin, id) {
      this.isAdmin = isAdmin;
      this.ruleForm.feedbackId = id;
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    resetForm() {
      this.ruleForm.resolveReply = '';
    },
    save() {
      if (!this.ruleForm.resolveReply) {
        if (this.isAdmin) {
          this.$message.error('请输入工单解决方案');
        } else {
          this.$message.error('请选择关闭工单的原因');
        }
        return;
      }
      if (!this.ruleForm.score && !this.isAdmin) {
        this.$message.error('请您对工单评分');
        return;
      }
      this.btnDisabled = true;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const formData = new FormData();
      formData.append('feedbackId', this.ruleForm.feedbackId);
      formData.append('reason', this.ruleForm.resolveReply);
      formData.append('score', this.ruleForm.score);
      closeFeedback(formData, config)
        .then(data => {
          if (this.isAdmin) {
            this.dialogVisible = false;
            this.$message({
              type: 'success',
              message: '关闭成功'
            });
            this.$emit('save');
          } else {
            scoreFeedback(formData, config)
              .then(data => {
                this.dialogVisible = false;
                this.$message({
                  type: 'success',
                  message: '关闭成功'
                });
                this.$emit('save');
              })
              .finally(() => {
                this.btnDisabled = false;
              });
          }
        })
        .finally(() => {
          this.btnDisabled = false;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.el-rate {
  display: inline-block;
}
</style>
