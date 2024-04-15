<template>
  <div class="content">
    <div v-show="step == 1" class="type">
      <div v-for="(item, index) in dataSourceList" :key="index">
        <div style="font-weight: bold">{{ item.label }}</div>
        <div>
          <type-card v-for="dataSource in item.list" :key="dataSource.type" v-model="model.sourceType" :data="dataSource" :class="{ selected: model.sourceType == dataSource.type }" />
        </div>
      </div>
    </div>
    <el-form v-show="step == 2" ref="form" :model="model" label-width="100px" style="max-width: 650px">
      <el-form-item v-for="field in fields" :key="field.key" :label="field.label" :required="field.required" :prop="field.key" :rules="field.rules">
        <el-input v-if="['input', 'password'].includes(field.type)" v-model="model[field.key]" :show-password="field.type == 'password'" class="w350" :placeholder="field.placeholder"></el-input>
        <el-select v-if="field.type == 'select'" v-model="model[field.key]" class="w350" :placeholder="field.placeholder">
          <el-option v-for="item in field.options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button v-show="step == 2 && ['mysql', 'clickhouse'].includes(model.sourceType)" class="btn-test" :loading="btnLoading" @click="test">测试连接</el-button>
      <el-button @click="cancel">取 消</el-button>
      <el-button v-show="step == 1" @click="nextStep">下一步</el-button>
      <el-button v-show="step == 2" @click="step = 1">上一步</el-button>
      <el-button v-show="step == 2" type="primary" :loading="loading" @click="submit">确 定</el-button>
    </div>
  </div>
</template>

<script>
import typeCard from './type-card.vue';
import { getTest } from '@/api/dataSource';

export default {
  components: {
    'type-card': typeCard
  },
  props: {
    value: {
      type: Object,
      require: true,
      default: () => {
        return {};
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validatePass = (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符'));
      } else {
        callback();
      }
    };
    return {
      btnLoading: false,
      dataSourceList: [
        {
          label: '关系型数据库',
          list: [
            // {
            //   type: 'mysql',
            //   label: 'MySql',
            //   fields: [
            //     {
            //       key: 'env',
            //       label: '区域',
            //       type: 'select',
            //       placeholder: '请选择区域',
            //       required: true,
            //       options: [
            //         { value: 'ue1', label: 'AWS 美东' },
            //         { value: 'sg1', label: 'AWS 新加坡' },
            //         { value: 'sg2', label: '华为 新加坡' }
            //       ]
            //     },
            //     { key: 'name', label: '数据源名称', type: 'input', placeholder: '请输入数据源名称', required: true, rules: [{ validator: validatePass, trigger: ['blur', 'change'] }] },
            //     { key: 'description', label: '数据源描述', type: 'input', placeholder: '请输入描述信息', required: true },
            //     { key: 'url', label: '服务器地址', type: 'input', placeholder: '请输入服务器地址', required: true },
            //     { key: 'port', label: '端口', type: 'input', placeholder: '请输入服务器端口号', required: false },
            //     { key: 'userName', label: '用户名', type: 'input', placeholder: '请输入用户名', required: true },
            //     { key: 'passWord', label: '密码', type: 'password', placeholder: '请输入密码', required: true },
            //     { key: 'owner', label: '负责人', type: 'input', placeholder: '请输入负责人', required: true },
            //     { key: 'securityLevel', label: '安全等级', type: 'input', placeholder: '请输入安全等级', required: false }
            //   ]
            // },
            {
              type: 'clickhouse',
              label: 'ClickHouse',
              fields: [
                {
                  key: 'env',
                  label: '区域',
                  type: 'select',
                  placeholder: '请选择区域',
                  required: true,
                  options: [
                    { value: 'ue1', label: 'AWS 美东' },
                    { value: 'sg1', label: 'AWS 新加坡' },
                    { value: 'sg2', label: '华为 新加坡' }
                  ]
                },
                { key: 'name', label: '数据源名称', type: 'input', placeholder: '请输入数据源名称', required: true, rules: [{ validator: validatePass, trigger: ['blur', 'change'] }] },
                { key: 'description', label: '数据源描述', type: 'input', placeholder: '请输入描述信息', required: true },
                { key: 'url', label: '服务器地址', type: 'input', placeholder: '请输入服务器地址', required: true },
                { key: 'port', label: '端口', type: 'input', placeholder: '请输入服务器端口号', required: false },
                { key: 'userName', label: '用户名', type: 'input', placeholder: '请输入用户名', required: true },
                { key: 'passWord', label: '密码', type: 'password', placeholder: '请输入密码', required: true },
                { key: 'owner', label: '负责人', type: 'input', placeholder: '请输入负责人', required: true },
                { key: 'securityLevel', label: '安全等级', type: 'input', placeholder: '请输入安全等级', required: false }
              ]
            }
          ]
        },
        {
          label: '大数据存储',
          list: [
            {
              type: 'metis',
              label: 'Metis',
              fields: [
                { key: 'name', label: '数据源名称', type: 'input', placeholder: '请输入数据源名称', required: true, rules: [{ validator: validatePass, trigger: ['blur', 'change'] }] },
                { key: 'description', label: '数据源描述', type: 'input', placeholder: '请输入描述信息', required: true },
                { key: 'owner', label: '负责人', type: 'input', placeholder: '请输入负责人', required: true },
                {
                  key: 'env',
                  label: '环境',
                  type: 'select',
                  placeholder: '请选择环境',
                  required: true,
                  options: [
                    { label: 'dev', value: 'dev' },
                    { label: 'test', value: 'test' },
                    { label: 'pre', value: 'pre' },
                    { label: 'pro', value: 'pro' }
                  ]
                }
              ]
            }
          ]
        }
      ],
      model: { sourceType: '' },
      step: 1
    };
  },
  computed: {
    fields() {
      let result = null;
      if (this.model.sourceType) {
        this.dataSourceList.find(source => {
          const dataSource = source.list.find(item => {
            return item.type === this.model.sourceType;
          });
          if (dataSource) {
            result = dataSource.fields;
            dataSource.fields.forEach(item => {
              let value = item.value || '';
              value = this.value ? this.value[item.key === 'passWord' ? 'epass' : item.key] : value;
              this.$set(this.model, item.key, value);
            });
            return true;
          }
        });
      }
      return result;
    }
  },
  created() {
    if (this.value) {
      this.model.sourceType = this.value.sourceType;
    }
  },
  methods: {
    test() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.btnLoading = true;
          getTest(
            {
              sourceType: this.model.sourceType,
              url: this.model.url,
              port: this.model.port,
              userName: this.model.userName,
              password: this.model.passWord
            },
            {
              onUploadProgress: ProgressEvent => {
                this.onUploadProgress(ProgressEvent);
              }
            }
          )
            .then(data => {
              const type = data.code === 0 ? 'success' : 'error';
              this.$alert(data.message, `已连接(${data.data}ms)`, {
                confirmButtonText: '确定',
                type: type
              });
            })
            .finally(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    nextStep() {
      if (!this.model.sourceType) {
        this.$message({
          type: 'warning',
          message: '请先选择数据源类型！'
        });
        return;
      }
      this.step = 2;
    },
    cancel() {
      this.$emit('submit', null);
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', this.model);
        }
      });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.content {
  padding: 0 30px;
}
.selected {
  border-color: #67c23a;
}
.w350 {
  width: 350px;
}
.footer {
  margin-top: 50px;
  text-align: right;
  position: relative;
  .btn-test {
    position: absolute;
    left: 0;
  }
}
</style>
