<template>
  <el-dialog title="工单评分" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <div>
      <div class="mb10">请您针对工单编号{{ params.feedbackId }}的处理情况进行评分呦，谢谢配合。</div>
      <el-rate v-model="params.score" show-text :texts="scoreTexts"></el-rate>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { scoreFeedback } from '@/api/feedback';

export default {
  name: 'WinScoreOrder',
  data() {
    return {
      dialogVisible: false,
      params: {
        feedbackId: '',
        score: 5
      },
      scoreTexts: ['极差', '失望', '一般', '满意', '十分满意'],
      btnDisabled: false
    };
  },
  methods: {
    showWin(row) {
      this.params.feedbackId = row.id;
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    resetForm() {
      this.params.score = '';
    },
    save() {
      if (this.params.score) {
        this.btnDisabled = true;
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        const formData = new FormData();
        formData.append('feedbackId', this.params.feedbackId);
        formData.append('score', this.params.score);
        scoreFeedback(formData, config)
          .then(data => {
            this.dialogVisible = false;
            this.$message({
              type: 'success',
              message: '评价成功'
            });
            // this.$parent.getList();
            this.$emit('save');
          })
          .finally(() => {
            this.btnDisabled = false;
          });
      } else {
        this.$message.error('请选择评分');
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
