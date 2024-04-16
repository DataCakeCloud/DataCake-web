<!--  chenyh1 -->
<template>
  <div class="action-wrapper">
    <!-- action form dialog -->
    <el-dialog title="新增功能所属菜单" :visible.sync="actionDialog" width="900px" @opened="opened('actionForm')" @closed="closed('actionForm')">
      <el-form ref="actionForm" v-loading="formLoding" :model="actionForm" label-width="110px" class="main-form">
        <el-form-item v-show="false" prop="id">
          <el-input v-model="actionForm.id"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code" required>
          <el-input v-model.trim="actionForm.code" :clearable="true" :disabled="dialogType === 'edit'">
            <template v-if="actionForm.level === 2 && dialogType !== 'edit'" slot="prepend">{{ action.code }}-</template>
          </el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="actionForm.name" :clearable="true"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description" required>
          <el-input v-model="actionForm.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="连接" prop="url" required>
          <el-input v-model="actionForm.url" :clearable="true"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status" required>
          <el-radio-group v-model="actionForm.status" :disabled="dialogType === 'add'">
            <el-radio v-for="item in statusArr" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="actionSubmit">保 存</el-button>
          <el-button @click="cancel('actionDialog')">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    system: {
      type: Object,
      default() {
        return {};
      }
    },
    // 选中菜单节点
    menuId: {
      type: Number,
      default: null
    },
    // 父action
    action: {
      type: Object,
      default() {
        return {};
      }
    },
    item: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      statusArr: [
        { label: '有效', value: 1 },
        { label: '无效', value: 0 }
      ],
      actionDialog: false,
      dialogType: '',
      formLoding: false,
      actionForm: {
        id: '',
        code: '',
        name: '',
        description: '',
        systemId: '',
        menuId: '',
        status: 1,
        url: '',
        parentFunctionId: '',
        level: '',
        httpMethod: '',
        iamResource: {
          version: 'v1',
          statement: [
            {
              action: [],
              effect: 'allow',
              resource: [{ key: '*', value: '' }]
            }
          ]
        }
      },
      iamResourceJSON: {
        version: 'v1',
        statement: [
          {
            action: [],
            effect: 'allow',
            resource: [{ key: '*', value: '' }]
          }
        ]
      },
      iamGroups: [],
      activeTabs: '1',
      cMoptions: {
        mode: 'application/json',
        theme: 'cobalt',
        indentUnit: 2,
        lineNumbers: true,
        line: true,
        lint: true
      }
    };
  },
  created() {
    // this.departmentList();
  },
  methods: {
    show(type, level) {
      this.dialogType = type;
      if (this.dialogType === 'add') {
        if (level === 1) {
          this.actionForm.systemId = this.system.id;
          this.actionForm.menuId = this.menuId;
          this.actionForm.parentFunctionId = -1;
          this.actionForm.level = 1;
        } else if (level === 2) {
          this.actionForm.systemId = this.action.systemId;
          this.actionForm.menuId = this.action.menuId;
          this.actionForm.parentFunctionId = this.action.id;
          this.actionForm.level = 2;
          this.actionForm.iamResource.statement[0].action = [this.system.code + ':' + this.action.code];
          this.iamResourceJSON.statement[0].action = [this.system.code + ':' + this.action.code];
        }
      } else if (this.dialogType === 'edit') {
        this.formLoding = true;
      }
      this.actionDialog = true;
    },
    // 功能提交
    actionSubmit() {
      this.$refs.actionForm.validate(vali => {
        if (vali) {
          this.formLoding = true;
          const params = JSON.parse(JSON.stringify(this.actionForm));
          if (params.level === 2) {
            if (!params.id) {
              params.code = this.action.code + '-' + params.code;
            }
            // params.httpMethod = this.actionForm.iamResource.statement[0].action[0];
            if (this.activeTabs === '1') {
              params.iamResource.statement.forEach(statement => {
                statement.resource = statement.resource.map(item => {
                  // return 'zeus:' + item.key + ':*:' + this.system.code + ':*:' + item.value;
                  return `zeus:${item.key}:*:${this.system.code}:${item.type}:${item.value}`;
                });
              });
            } else if (this.activeTabs === '2') {
              params.iamResource = this.iamResourceJSON;
            }
            params.url = '';
            delete params.httpMethod;
          }
          // delete params.iam;
          // saveAction(params).then(res => {
          //   this.formLoding = false;
          //   if (res.success) {
          //     this.$message({
          //       type: 'success',
          //       center: true,
          //       message: this.$t('common.save_success')
          //     });
          //     this.$emit('success');
          //     this.actionDialog = false;
          //   } else {
          //     this.$message({
          //       type: 'error',
          //       center: true,
          //       message: this.$t('common.save_failed')
          //     });
          //   }
          // });
        }
      });
    },
    // dialog打开回调 编辑时赋值
    opened(formModel) {
      if (this.dialogType === 'edit') {
        // todo
      } else {
        this.formLoding = false;
      }
    },
    cancel(visible) {
      this[visible] = false;
    },
    // dialog关闭回调 清空表单
    closed(formRef) {
      this.$refs[formRef].resetFields();
      this.formLoding = false;
      if (formRef === 'actionForm') {
        this.actionForm.iamResource.statement = [
          {
            action: [],
            effect: 'allow',
            resource: [{ key: '*', value: '' }]
          }
        ];
        this.iamResourceJSON = {
          version: 'v1',
          statement: [
            {
              action: [],
              effect: 'allow',
              resource: [{ key: '*', value: '' }]
            }
          ]
        };
      }
    },
    // 删除IAM resource
    handleRemoveResource(idx, statidx) {
      this.actionForm.iamResource.statement[statidx].resource.splice(idx, 1);
    },
    // 添加IAM resource
    handleAddResource(statidx) {
      this.actionForm.iamResource.statement[statidx].resource.push({
        key: '',
        value: ''
      });
    },
    // 校验resource
    resourceValidate(rule, value, callback) {
      if (value.key && value.value) {
        callback();
      } else {
        callback(new Error('IAM resource is required'));
      }
    },
    // 删除IAM resource
    handleRemoveStatement(idx) {
      this.actionForm.iamResource.statement.splice(idx, 1);
    },
    // 添加IAM resource
    handleAddStatement() {
      this.actionForm.iamResource.statement.push({
        action: ['zeus:' + this.action.code],
        effect: 'allow',
        resource: [{ key: '*', value: '' }]
      });
    },
    // group列表
    departmentList() {
      // departmentList({ types: 0 }).then(res => {
      //   if (res.success) {
      //     this.iamGroups = res.data;
      //   }
      // });
    },
    iamJsonChange(val) {
      this.iamResourceJSON = JSON.parse(val);
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.main-wrapper {
  .main-form {
    width: 800px;
    margin: auto;
    .el-input {
      width: 100%;
    }
    .iam-tabs {
      // max-height: calc(100vh - 420px);
      margin-bottom: 20px;
      .iam-json {
        // height: calc(100vh - 520px);
        overflow: auto;
      }
    }
    .iam-inner {
      // min-height: 200px;
      // max-height: calc(100vh - 520px);
      overflow: auto;
      padding: 15px 0;
      .el-select {
        width: 150px;
      }
      .iam-resource {
        margin-bottom: 10px;
        position: relative;
        .delete-btn {
          position: absolute;
          min-width: inherit;
          right: 10px;
          top: 10px;
          display: none;
        }
        &:hover {
          .delete-btn {
            display: block;
          }
        }
        .resource-item {
          .el-select {
            width: 130px;
          }
          .el-input {
            width: 150px;
          }
          .handle-icon {
            font-size: $global-font-size-24;
            vertical-align: middle;
            cursor: pointer;
          }
        }
      }
      .add-btn {
        border-style: dashed;
        width: 100%;
        font-size: $global-font-size-16;
      }
    }
  }
}
.main-wrapper {
  .main-form {
    ::v-deep {
      .el-textarea {
        width: 100% !important;
      }
      .iam-tabs {
        .iam-json {
          .jsoneditor-vue {
            height: calc(100vh - 520px);
          }
        }
      }
      .iam-inner {
        .el-input {
          width: 100%;
        }
      }
    }
  }
}
</style>
