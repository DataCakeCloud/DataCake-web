<template>
  <el-dialog title="转让工单" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" label-width="100px">
      <el-form-item label="转让人">
        <el-select v-model="ruleForm.assignee" placeholder="请输入转让人" class="form-width" clearable filterable remote :remote-method="remoteMethod" :loading="loading" popper-class="custom-popper">
          <el-option v-for="item in userList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="转让原因">
        <el-input v-model="ruleForm.reason" placeholder="请输入转让原因" class="form-width" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { assignFeedback } from '@/api/feedback';
import { getUserList } from '@/api/task';

export default {
  name: 'WinTransfer',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        feedbackId: '',
        assignee: '',
        reason: ''
      },
      userList: [],
      loading: false,
      btnDisabled: false
    };
  },
  methods: {
    showWin(id) {
      this.ruleForm.feedbackId = id;
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        getUserList(query).then(res => {
          const data = res.data;
          this.loading = false;
          this.userList = data;
        });
      } else {
        this.userList = [];
      }
    },
    resetForm() {
      this.ruleForm.assignee = '';
      this.ruleForm.reason = '';
    },
    save() {
      if (this.ruleForm.assignee) {
        this.btnDisabled = true;
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        const formData = new FormData();
        formData.append('feedbackId', this.ruleForm.feedbackId);
        formData.append('assignee', this.ruleForm.assignee);
        formData.append('reason', this.ruleForm.reason);
        assignFeedback(formData, config)
          .then(data => {
            this.dialogVisible = false;
            this.$message({
              type: 'success',
              message: '转让成功'
            });
            this.$emit('save');
            // this.$parent.getList();
          })
          .finally(() => {
            this.btnDisabled = false;
          });
      } else {
        this.$message.error('请输入转让人');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.form-width {
  width: 260px;
}
</style>
