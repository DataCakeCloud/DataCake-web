<template>
  <el-card class="box-card-container">
    <el-page-header content="配置规则模板" @back="goBack"></el-page-header>
    <el-form ref="form" v-loading="loading" :model="params" :rules="rules" label-position="left" label-width="120px" class="form">
      <el-form-item prop="name" label="模板名称">
        <el-input v-model="params.name" placeholder="支持中英文字符，长度不超过30个字符" clearable maxlength="30" show-word-limit style="width: 80%"></el-input>
      </el-form-item>
      <el-form-item prop="ruleType" label="模板规则">
        <el-radio-group v-model="params.ruleType">
          <template v-for="(item, index) in ruleTypeList">
            <el-radio :key="index" :label="item.value">{{ item.name }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
      <template v-for="(item, index) in params.fieldList">
        <el-form-item :key="index" :label="index === 0 ? '参数定义' : ''">
          <el-input v-model="item.filedName" placeholder="请输入参数名" clearable disabled style="width: 55%"></el-input>
          <el-select v-model="item.fieldType" :clearable="true" placeholder="请选择参数类型" style="width: 24.5%">
            <template v-for="(subItem, subIndex) in fieldTypeList">
              <el-option :key="subIndex" :label="subItem" :value="subItem"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item prop="sqlStatement" label="Sql表达式">
        <el-input v-model="params.sqlStatement" type="textarea" placeholder="请输入Sql表达式" clearable style="width: 80%"></el-input>
      </el-form-item>
      <el-form-item prop="sqlCondition" label="过滤条件">
        <el-input v-model="params.sqlCondition" type="textarea" placeholder="请输入过滤条件" clearable style="width: 80%"></el-input>
      </el-form-item>
      <el-form-item prop="checkType" label="校验类型">
        <el-select v-model="params.checkType" placeholder="请选择校验类型" clearable style="width: 80%">
          <template v-for="(item, index) in checkTypeList">
            <el-option :key="index" :label="item.name" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="checkAction" label="校验方式">
        <el-select v-model="params.checkAction" clearable placeholder="请选择校验方式" style="width: 80%">
          <template v-for="(item, index) in checkActionList">
            <el-option :key="index" :label="item.name" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="params.description" type="textarea" placeholder="请输入描述" clearable style="width: 80%"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="goBack">取消</el-button>
        <el-button :loading="saveLoading" :disabled="saveLoading" type="primary" @click="handleSave">确定</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { templateAddItem, templateInfo, templateUpdateItem } from '@/api/dqc';
export default {
  nam: 'DqcRuleModelConfig',
  data() {
    return {
      id: this.$route.query.id,
      loading: false,
      saveLoading: false,
      params: {
        checkAction: '',
        checkType: 'NUMBER',
        description: '',
        fieldList: [{ filedName: 'field', fieldType: '' }],
        name: '',
        ruleType: '',
        sqlCondition: '',
        sqlStatement: ''
      },
      ruleTypeList: this.$t('dqc.ruleTypeList'),
      fieldTypeList: this.$t('dqc.fieldTypeList'),
      checkTypeList: this.$t('dqc.checkTypeList'),

      rules: {
        name: [{ required: true, message: '请输入模板名称', trigger: ['blur', 'change'] }],
        ruleType: [{ required: true, message: '请选择模板规则', trigger: ['blur', 'change'] }],
        sqlStatement: [{ required: true, message: '请输入Sql表达式', trigger: ['blur', 'change'] }],
        checkType: [{ required: true, message: '请选择校验类型', trigger: ['blur', 'change'] }],
        checkAction: [{ required: true, message: '请选择校验方式', trigger: ['blur', 'change'] }],
        description: [{ required: true, message: '请输入描述', trigger: ['blur', 'change'] }]
      }
    };
  },
  computed: {
    checkActionList() {
      const checkActionLists = this.$t('dqc.checkActionList');
      return checkActionLists[this.params.checkType];
    }
  },
  watch: {
    'params.ruleType'(val) {
      if (val === 'TABLE') {
        this.params.fieldList = [];
      } else {
        const arr = this.params.fieldList.filter(e => e.fieldType.length);
        if (!arr.length) this.params.fieldList = [{ filedName: 'field', fieldType: '' }];
      }
    },
    'params.checkType'(val) {
      // this.params.checkAction = '';
    }
  },
  created() {
    if (this.id) this.templateInfo();
  },
  methods: {
    templateInfo() {
      this.loading = true;
      templateInfo({ id: this.id }).then(res => {
        this.loading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        this.params = Object.assign({}, this.params, data);
      });
    },
    goBack() {
      // this.$router.push('/dqc/ruleList');
      this.$router.push({ name: 'DqcRuleList' });
    },
    handleSave() {
      const params = Object.assign({}, this.params);
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.saveLoading = true;
          if (!this.id) {
            templateAddItem(params).then(res => {
              this.saveLoading = false;
              if (res.resultCode !== 0) {
                this.$message({
                  type: 'error',
                  message: res.msg || '服务端错误'
                });
                return;
              }
              this.$message({
                type: 'success',
                message: '配置模板成功'
              });
              this.goBack();
            });
          } else {
            templateUpdateItem(params).then(res => {
              this.saveLoading = false;
              if (res.resultCode !== 0) {
                this.$message({
                  type: 'error',
                  message: res.msg || '服务端错误'
                });
                return;
              }
              this.$message({
                type: 'success',
                message: '配置模板成功'
              });
              this.goBack();
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box-card-container {
  /* padding: 0 15%; */
}
.form {
  margin-top: 20px;
}
</style>
