<template>
  <el-dialog :title="`${edit ? '修改模型名称' : '添加模型'}`" :visible.sync="dialogVisible" width="40%" @close="close">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="名字只能包含中文,a-z,A-Z,0-9或-或_,最多20个字符"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="loading" :disabled="loading" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addMetaMode, updateMetaMode } from '@/api/metadata';

export default {
  name: 'AddModel',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        id: null,
        name: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9-_]{1,20}$/, message: '名字只能包含中文,a-z,A-Z,0-9或-或_,最多20个字符', trigger: 'blur' }
        ]
      },
      loading: false,
      edit: false
    };
  },
  methods: {
    close() {
      this.ruleForm.name = '';
      this.$refs.ruleForm?.clearValidate();
      this.edit = false;
    },
    show(data) {
      this.dialogVisible = true;
      if (data) {
        this.ruleForm.name = data.name;
        this.ruleForm.id = data.id;
        this.ruleForm.description = data.description;
        this.edit = true;
      }
    },
    submit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.loading = true;
          const params = {
            name: this.ruleForm.name,
            description: ''
          };
          let handelFn = addMetaMode;
          if (this.edit) {
            handelFn = updateMetaMode;
            params.id = this.ruleForm.id;
          } else {
            params.parentId = -1;
          }
          handelFn(params)
            .then(res => {
              if (res.code === 0) {
                this.$message.success('操作成功');
                this.$emit('addModel', this.ruleForm);
                this.dialogVisible = false;
              }
            })
            .catch(_ => {
              this.$message.warning('操作失败');
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
