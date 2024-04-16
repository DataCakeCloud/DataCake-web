<template>
  <div>
    <el-dialog :visible.sync="createTableData.visible" :append-to-body="true" title="自定义建表">
      <div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" :class="['ruleForm', 'step-form', 'step-content-form']" label-width="100px">
          <el-form-item label="表名(英文)" prop="name">
            <el-input v-model="ruleForm.name" placeholder="表名支持有英文小写、下划线、数字，不允许数字作为表名开头" clearable></el-input>
          </el-form-item>
          <el-form-item label="别名">
            <el-input v-model="ruleForm.cnName" placeholder="业务描述（事实）-使用中文填写" clearable></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="ruleForm.description" type="textarea" placeholder="不允许使用英文分号 (;)，英文冒号 (:)" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="ruleForm.sdFileFormat === 'textfile'" label="分隔符">
            <el-input v-model="ruleForm.fileDelimiter" placeholder="请输入分隔符"></el-input>
          </el-form-item>
          <el-form-item label="标签">
            <div class="tagList">
              <div class="labels_box">
                <div v-for="(item, index) in ruleForm.tagList" :key="index" class="labels_item">
                  <div class="box">
                    <span class="label">key</span>
                    <el-input v-model="item.key" placeholder="请输入key" clearable></el-input>
                    <span class="label last">value</span>
                    <el-input v-model="item.value" placeholder="请输入value" clearable></el-input>
                  </div>
                  <i class="el-icon-circle-close" @click="setLabels('sub', index)"></i>
                </div>
              </div>
              <el-button type="text" icon="el-icon-plus" @click="setLabels('add')">新建标签</el-button>
            </div>
          </el-form-item>
          <el-form-item label="授权对象" prop="showObj">
            <div class="form_item">
              <el-select v-model="effectScope" placeholder="选择生效范围" style="width: 100px" @change="handleScope">
                <el-option v-for="(item, index) in scopeList" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>

              <el-select
                v-if="effectScope === 1"
                v-model="scopes"
                placeholder="请输入用户ID, 最多20个"
                clearable
                filterable
                multiple
                remote
                :remote-method="remoteMethod"
                :loading="ownerLoading"
popper-class="custom-popper"
                style="width: 65%; margin-left: 20px"
              >
                <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
                  <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.deptFullPath }}</div>
                </el-option>
              </el-select>
              <el-select
                v-if="effectScope === 2"
                v-model="scopes"
                placeholder="请输入角色名称，支持多个"
                clearable
                filterable
                multiple
                remote
                :remote-method="remoteMethod2"
                :loading="roleLoading"
popper-class="custom-popper"
                style="width: 65%; margin-left: 20px"
              >
                <el-option v-for="item in roleList" :key="item.roleId" :value="item.roleName" :label="item.roleName">
                  <div style="max-width: 420px; word-break: break-all">{{ item.roleName }}</div>
                </el-option>
              </el-select>
              <!-- <el-select v-if="effectScope === 2" v-model="scopes" placeholder="请选择用户组" style="width: 74%; margin-left: 20px" multiple clearable>
                <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.uuid"></el-option>
              </el-select> -->
              <!-- <el-button class="form_btn" type="text" @click="$router.push('/jurisdiction/dataRole')">数据角色</el-button> -->
            </div>
          </el-form-item>
          <el-form-item label="授权信息">
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
            <el-checkbox-group v-model="checkedOpes" class="checkbox-group" @change="handleCheckedCitiesChange">
              <el-checkbox v-for="item in permissions" :key="item" :label="item">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="权限保留周期">
            <el-radio-group v-model="cycle">
              <el-radio v-for="(item, index) in cycleList" :key="index" :label="item.value">{{ item.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createTableData.visible = false">{{ $t('task.taskCancel1') }}</el-button>
        <el-button type="primary" :loading="btnDisabled" :disabled="btnDisabled" @click="nextStep">完成</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { addTable, checkCreate, batchGrantPrivilegeToUser, dataRolePage } from '@/api/metadata';
import { getUserList } from '@/api/task';
// import { getGroupPage } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
function setSchema(dbName, tableName) {
  return `
-- CREATE TABLE TEMPLATE
-- 左侧必填：创建区域、数据源类型、库名、表名、location
-- SQL窗口定义schema和分区即可，选填：字段 COMMENT 注释，表  COMMENT 注释
-- location 自定义示例："s3://bucket/../databaseName/tableName"
-- 由于增加了库名、表名自动匹配功能，因此建议您完成SQL语句的填写，再校验右侧库、表名称是否正确
CREATE TABLE IF NOT EXISTS ${dbName || 'dbname'}.${tableName || 'tablename'} (
  id string COMMENT 'ID' ,
  name string COMMENT '名称'
)
row format delimited
fields terminated by '\/t'
STORED AS orc
    `;
}
const validateName = (rule, value, callback) => {
  const reg = /^(_?[a-z])([a-z0-9]|_[a-z0-9]_?)*$/;
  if (!reg.test(value)) {
    callback(new Error('表名支持有英文小写、下划线、数字，不允许数字作为表名开头'));
  } else {
    callback();
  }
};
export default {
  props: {
    createTableData: {
      type: Object,
      default: () => {
        return {
          visible: false,
          dbName: '',
          region: ''
        };
      }
    }
  },
  data() {
    return {
      ownerList: [],
      roleList: [],
      groupOptions: [],
      scopes: [],
      effectScope: 2,
      scopeList: [
        // {
        //   name: '个人',
        //   value: 1
        // },
        {
          name: '用户组',
          value: 2
        }
      ],
      checkedOpes: ['查询'],
      permissions: ['查询', '编辑', '删除', '描述', '插入'],
      cycleList: this.$t('data.cycle'),
      cycle: '2',
      ownerLoading: false,
      checkAll: false,
      isIndeterminate: true,
      roleLoading: false,
      initRuleForm: {
        region: '',
        type: 'hive',
        dbName: '',
        cnName: '',
        name: 'tablename',
        description: '',
        sdFileFormat: 'parquet',
        fileDelimiter: '',
        sql: '',
        tagList: [
          {
            key: '',
            value: ''
          }
        ]
      },
      ruleForm: {
        region: '',
        type: 'hive',
        dbName: '',
        cnName: '',
        name: 'tablename',
        description: '',
        sdFileFormat: 'parquet',
        fileDelimiter: '',
        sql: '',
        tagList: [
          {
            key: '',
            value: ''
          }
        ]
      },
      btnDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入英文名' },
          { validator: validateName, trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'currentUserGroup'])
  },
  watch: {
    'createTableData.visible'(v) {
      if (v) {
        this.ruleForm.dbName = this.createTableData.dbName;
        this.ruleForm.region = this.createTableData.region;
      } else {
        this.ruleForm = JSON.parse(JSON.stringify(this.initRuleForm));
        this.cycle = '2';
        this.effectScope = 2;
        this.scopes = [];
        this.checkedOpes = ['查询'];
      }
    }
  },
  created() {
    // this.getGroupPage();
  },
  methods: {
    handleScope(val) {
      this.scopes = [];
    },
    remoteMethod(query, shareId) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    remoteMethod2(query, shareId) {
      if (query !== '') {
        this.roleLoading = true;
        dataRolePage(query).then(res => {
          this.roleLoading = false;
          const data = res.data;
          this.roleList = data;
        });
      } else {
        this.roleList = [];
      }
    },
    // getGroupPage() {
    //   const params = {
    //     userId: this.userInfo.userId,
    //     name: '',
    //     pageNum: 1,
    //     pageSize: 10000
    //   };
    //   getGroupPage(params).then(data => {
    //     this.groupOptions = data.data.list || [];
    //   });
    // },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.permissions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length;
    },
    handleCheckAllChange(val) {
      this.checkedOpes = val ? this.permissions : [];
      this.isIndeterminate = false;
    },
    setLabels(type, index) {
      if (type === 'add') {
        this.ruleForm.tagList.push({
          key: '',
          value: ''
        });
      } else {
        this.ruleForm.tagList.splice(index, 1);
      }
    },
    nextStep() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          // 先校验下有无创建表的权限
          this.ruleForm.sql = window.btoa(encodeURIComponent(setSchema(this.createTableData.dbName, this.ruleForm.name)));
          checkCreate({
            ...this.ruleForm,
            owner: this.userInfo.userId
          })
            .then(res => {
              const data = res.data;
              if (!data) {
                this.btnDisabled = false;
                return;
              }

              const params = {
                ...this.ruleForm,
                owner: this.userInfo.userId,
                region: this.ruleForm.region
              };
              addTable({ ...params })
                .then(res => {
                  if (res.code === 0) {
                    // 授权
                    this.handelAuthorized();
                    this.createTableData.visible = false;
                  }
                })
                .finally(() => {
                  this.handelAuthorized();
                  this.btnDisabled = false;
                });
            })
            .catch(() => {
              this.btnDisabled = false;
            });
        }
      });
    },
    handelAuthorized() {
      if (this.scopes.length) {
        const params = {
          owner: this.userInfo.userId,
          type: this.effectScope,
          flag: 1,
          cycle: this.cycle,
          roleInputs: {
            objectName: [`${this.ruleForm.region}.${this.ruleForm.dbName}.${this.ruleForm.name}`],
            scope: this.scopes,
            operation: this.checkedOpes
          }
        };
        batchGrantPrivilegeToUser(params).then(res => {
          this.createTableData.visible = false;
          this.$emit('createTableEmit', this.ruleForm.name);
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.tagList {
  .labels_box {
    .labels_item {
      display: flex;
      align-items: center;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      .box {
        display: flex;
        align-items: center;
        .label {
          margin-right: 10px;
          width: 80px;
          &.last {
            margin-left: 10px;
          }
        }
      }
      i {
        padding: 5px 0 5px 10px;
        font-size: $global-font-size-18;
        cursor: pointer;
        color: #e47470;
      }
    }
  }
}
</style>
