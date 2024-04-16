<template>
  <el-dialog title="SavePoint Create" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入Name"></el-input>
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="ruleForm.description" placeholder="请输入Description"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addSnapshot } from '@/api/taskDetail';

export default {
  name: 'WinStart',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入Name', trigger: ['blur', 'change'] }]
      },
      appVersionList: [],
      savePointList: [],
      queryId: '',
      btnDisabled: false
    };
  },
  methods: {
    showWin(id) {
      this.queryId = id;
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.ruleForm.description = '';
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          addSnapshot({
            taskId: this.queryId,
            name: this.ruleForm.name,
            description: this.ruleForm.description
          }).then(data => {
            this.$emit('save');
            this.dialogVisible = false;
            this.btnDisabled = false;
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.ruleForm {
  width: 340px;
  margin: 0 auto;
}
</style>
