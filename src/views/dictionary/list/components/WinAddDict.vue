<template>
  <el-dialog :title="ruleForm.id ? '编辑字典' : '添加字典'" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="120px">
      <el-form-item label="字典类型" prop="componentCode">
        <el-select v-model="ruleForm.componentCode" class="dialog-select" placeholder="请选择字典类型" clearable>
          <el-option v-for="(value, key) in list" :key="key" :label="value" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="中文名称" prop="chineseName">
        <el-input v-model="ruleForm.chineseName" class="dialog-select" placeholder="请输入中文名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="英文名称" prop="englishName">
        <el-input v-model="ruleForm.englishName" class="dialog-select" placeholder="请输入英文名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="ruleForm.description" class="dialog-select" type="textarea" placeholder="请输入描述" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addDict, updateDict } from '@/api/dictionary';

export default {
  name: 'WinAddDict',
  props: {
    list: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        id: '',
        componentCode: '',
        chineseName: '',
        englishName: '',
        description: ''
      },
      rules: {
        componentCode: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
        chineseName: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
        englishName: [{ required: true, message: '请输入英文名称', trigger: 'blur' }]
      },
      btnDisabled: false
    };
  },
  methods: {
    showWin(data) {
      this.dialogVisible = true;
      this.btnDisabled = false;
      if (data) {
        this.ruleForm.id = data.id;
        this.ruleForm.componentCode = data.componentCode;
        this.ruleForm.chineseName = data.chineseName;
        this.ruleForm.englishName = data.englishName;
        this.ruleForm.description = data.description;
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          let actionUrl;
          if (this.ruleForm.id) {
            actionUrl = updateDict(this.ruleForm);
          } else {
            actionUrl = addDict(this.ruleForm);
          }
          actionUrl.then(data => {
            this.dialogVisible = false;
            this.btnDisabled = false;
            this.$emit('save');
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-select {
  width: 350px;
}
</style>
