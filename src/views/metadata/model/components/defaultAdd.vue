<template>
  <el-dialog title="添加类目名称" :visible.sync="dialogVisible" width="40%" @close="close">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="类目" prop="class">
        <el-select v-model="ruleForm.class" class="w100" placeholder="请选择类目">
          <el-option v-for="item in classList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="云资源区域" prop="region">
        <el-select v-model="ruleForm.region" class="w100" placeholder="请选择云资源区域">
          <el-option label="区域一" value="shanghai"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.class === 'catalog' || ruleForm.class === 'db'" label="数据源类型" prop="catalog">
        <el-select v-model="ruleForm.catalog" class="w100" placeholder="请选择数据源类型">
          <el-option label="区域一" value="shanghai"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.class === 'db'" label="库" prop="db">
        <el-input v-model="ruleForm.db" disabled></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="ruleForm.desc" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddModel',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        class: '',
        region: '',
        catalog: '',
        db: '${DB}',
        desc: ''
      },
      resetForm: {
        class: '',
        region: '',
        catalog: '',
        db: '${DB}',
        desc: ''
      },
      rules: {
        class: [{ required: true, message: '请选择类目', trigger: 'change' }],
        region: [{ required: true, message: '请选择数据区域', trigger: 'change' }],
        catalog: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
        db: [{ required: true, message: '请输入数据库', trigger: 'blur' }]
      },
      classList: [
        { label: '云资源区域', value: 'region' },
        { label: '数据源类型', value: 'catalog' },
        { label: '库', value: 'db' }
      ]
    };
  },
  methods: {
    close() {
      Object.assign(this.ruleForm, this.resetForm);
      this.$refs.ruleForm?.clearValidate();
    },
    show() {
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.$emit('add', this.ruleForm);
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
