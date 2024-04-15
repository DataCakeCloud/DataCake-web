<template>
  <el-dialog title="添加类目名称" :visible.sync="dialogVisible" width="40%" @close="close">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="选择类目" prop="class">
        <el-select v-model="ruleForm.level" :disabled="edit" class="w100" placeholder="请选择类目">
          <el-option v-for="item in classList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.level === 2 || ruleForm.level === 3" label="一级类目" prop="levelname1">
        <el-select v-model="ruleForm.levelname1" :disabled="edit" class="w100" placeholder="请选择一级类目">
          <el-option v-for="item in classList1" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.level === 3" label="二级类目" prop="levelname2">
        <el-select v-model="ruleForm.levelname2" :disabled="edit" class="w100" placeholder="请选择二级类目">
          <el-option v-for="item in classList2" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类目名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="名字只能包含中文,a-z,A-Z,0-9或-或_,最多20个字符"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="ruleForm.description" maxlength="100" placeholder="请输入描述,长度不超过100" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="loading" :loading="loading" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addMetaMode, updateMetaMode } from '@/api/metadata';

export default {
  name: 'AddModel',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        id: null,
        level: null,
        levelname1: null,
        levelname2: null,
        name: '',
        description: ''
      },
      resetForm: {
        id: null,
        level: null,
        levelname1: null,
        levelname2: null,
        name: '',
        description: ''
      },
      rules: {
        level: [{ required: true, message: '请选择类目', trigger: 'change' }],
        levelname1: [{ required: true, message: '请选择一级类目', trigger: 'change' }],
        levelname2: [{ required: true, message: '请选择二级类目', trigger: 'change' }],
        name: [
          { required: true, message: '请输入类目名称', trigger: 'blur' },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9-_]{1,20}$/, message: '名字只能包含中文,a-z,A-Z,0-9或-或_,最多20个字符', trigger: 'blur' }
        ]
      },
      classList: [
        { label: '一级类目', value: 1 },
        { label: '二级类目', value: 2 },
        { label: '三级类目', value: 3 }
      ],
      edit: false
    };
  },
  computed: {
    classList1() {
      return this.data.children?.filter(item => item.level === 1) || [];
    },
    classList2() {
      return this.classList1.find(item => item.id === this.ruleForm.levelname1)?.children || [];
    }
  },
  methods: {
    close() {
      Object.assign(this.ruleForm, this.resetForm);
      this.$refs.ruleForm?.clearValidate();
      this.edit = false;
    },
    show(data) {
      this.dialogVisible = true;
      if (data.id) {
        this.edit = true;
        this.ruleForm.level = data.level;
        if (data.level === 2) {
          this.ruleForm.levelname1 = data.parentId;
        } else if (data.level) {
          this.ruleForm.levelname2 = data.parentId;
          const parentData = this.$utils.findSubsetById(this.data.children, this.ruleForm.levelname2, 'id');
          if (parentData) {
            this.ruleForm.levelname1 = parentData.parentId;
          }
        }
        this.ruleForm.id = data.id;
        this.ruleForm.description = data.description;
        this.ruleForm.name = data.name;
      }
    },
    submit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.loading = true;
          const params = {
            name: this.ruleForm.name,
            description: this.ruleForm.description
          };
          let ajaxFn;
          if (this.ruleForm.id) {
            params.id = this.ruleForm.id;
            ajaxFn = updateMetaMode;
          } else {
            params.parentId = this.ruleForm['levelname' + (this.ruleForm.level - 1)] || this.data.id;
            ajaxFn = addMetaMode;
          }
          ajaxFn(params)
            .then(res => {
              this.$message.success('操作成功');
              this.$emit('getModelTree');
            })
            .catch(_ => {
              this.$message.warning('操作失败');
            })
            .finally(() => {
              this.loading = false;
            });
          this.dialogVisible = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.w100 {
  width: 100%;
}
</style>
