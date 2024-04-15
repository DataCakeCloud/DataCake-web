<template>
  <el-dialog title="成功标志" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="resetForm">
    <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" label-width="100px">
      <el-form-item label="是否生成标志:">
        <el-switch v-model="ruleForm.check"></el-switch>
      </el-form-item>
      <el-form-item label="标志路径:">
        <el-input v-model="ruleForm.location" type="textarea" rows="5" placeholder="请输入路径" :disabled="!ruleForm.check" clearable style="width: 95%"></el-input>
      </el-form-item>
      <el-form-item label="检查文件名:">
        <el-input v-model="ruleForm.fileName" placeholder="请输入文件名" :disabled="!ruleForm.check" clearable style="width: 95%"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { checkSuccess } from '@/api/task';

export default {
  name: 'GeneratePath',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      ruleForm: {
        index: 0,
        fileName: '_SUCCESS',
        check: false,
        location: ''
      }
    };
  },
  methods: {
    showWin({ index, name, location, fileName }) {
      this.dialogVisible = true;
      this.ruleForm.index = index;
      this.ruleForm.fileName = fileName === undefined ? '_SUCCESS' : fileName;
      if (location) {
        this.ruleForm.check = true;
        this.ruleForm.location = location;
      } else {
        this.ruleForm.location = '';
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.ruleForm.check = false;
    },
    save() {
      const formData = new FormData();
      formData.append('path', this.ruleForm.location);
      checkSuccess(formData).then(data => {
        if (data.data) {
          this.$emit('save', this.ruleForm);
          this.dialogVisible = false;
        } else {
          this.$message.error('标志路径输入格式有误');
        }
      });
      // const reg = new RegExp('(obs|s3a|s3)://([^\\/]*)/(.*)');
      // if (reg.test(this.ruleForm.location)) {
      //   this.$emit('save', this.ruleForm);
      //   this.dialogVisible = false;
      // } else {
      //   this.$message.error('标志路径输入格式有误');
      // }
    }
  }
};
</script>
<style lang="scss" scoped></style>
