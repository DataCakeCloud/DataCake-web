<template>
  <el-dialog :title="`${isEdit ? '编辑' : '创建'}库`" :visible.sync="dialogVisible" width="620px" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="80px" label-position="left">
      <!-- <el-form-item label="云资源" prop="region">
        <el-select v-model="ruleForm.region" placeholder="请选择云资源" disabled style="width: 100%">
          <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="库名" prop="databaseName">
        <el-input v-model="ruleForm.databaseName" :disabled="isEdit" placeholder="名字只能包含a-z,A-Z,0-9或-或_；开始结尾需为字符,最多30个字符" maxlength="30"></el-input>
      </el-form-item>
      <el-form-item label="location" prop="locationUri">
        <el-input v-model="ruleForm.locationUri" placeholder="请输入库路径"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="ruleForm.description" type="textarea" placeholder="请输入描述" rows="4"></el-input>
      </el-form-item>
      <el-form-item label="归属" prop="uuid">
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
          <el-select v-if="effectScope === 2" v-model="currentGroup" value-key="id" placeholder="请选择用户组" style="width: 74%; margin-left: 20px" clearable>
            <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item"></el-option>
          </el-select>
          <!-- <el-button class="form_btn" type="text" @click="$router.push('/jurisdiction/dataRole')">数据角色</el-button> -->
        </div>
      </el-form-item>
      <!-- <el-form-item label="授权信息">
        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedOpes" class="checkbox-group" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in permissions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="btnDisabled" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addDb, editDb, grantPrivilegeToRoleOnDB } from '@/api/metadata';
import { mapGetters } from 'vuex';
import { getUserList } from '@/api/task';
import { getGroupPage } from '@/api/jurisdiction';

const validatePass = (rule, value, callback) => {
  const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
  if (!reg.test(value)) {
    callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多30个字符'));
  } else {
    callback();
  }
};
const locationUri = '/warehouse/{groupname}/db_{dbname}';
export default {
  name: 'CreateDb',
  props: {
    regionList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        region: '',
        databaseName: '',
        locationUri: '/warehouse/{groupname}/db_{dbname}',
        description: '',
        uuid: '',
        userId: '',
        userGroupName: ''
      },
      btnDisabled: false,
      checkAll: false,
      ownerLoading: false,
      permissions: [
        { label: '创建表', value: '创建表' },
        { label: '删除库', value: '删除库' },
        { label: '描述库', value: '描述库' },
        { label: '修改库', value: '修改库' }
      ],
      checkedOpes: ['创建表', '删除库', '描述库', '修改库'],
      isIndeterminate: true,
      ownerList: [],
      groupOptions: [],
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
      effectScope: 2,
      scopes: [],
      currentGroup: null,
      isEdit: false
    };
  },
  computed: {
    ...mapGetters(['isCloud', 'userInfo', 'currentUserGroup']),
    rules() {
      const obj = {
        databaseName: [
          { required: true, message: '请输入库名', trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        uuid: [{ required: true, message: '请选择负责人', trigger: ['blur', 'change'] }]
      };
      // if (this.isCloud) {
      //   obj = Object.assign({}, obj, {
      //     locationUri: [{ required: true, message: '请设置库路径', trigger: ['blur', 'change'] }]
      //   });
      // }
      return obj;
    }
  },
  watch: {
    currentGroup: {
      handler: function(val) {
        if (val) {
          this.ruleForm.uuid = val.uuid;
          this.ruleForm.userGroupName = val.name;
          const owner = val.userGroupRelationList.find(item => item.owner === 0)?.userName || val.userGroupRelationList[0]?.userName || '';
          if (owner) this.ruleForm.userId = owner;
        } else {
          this.ruleForm.uuid = '';
          this.ruleForm.userId = '';
          this.ruleForm.userGroupName = '';
        }
      }
    }
  },
  created() {
    this.getGroupPage();
    if (this.currentUserGroup.name) {
      this.ruleForm.locationUri = this.formatLocation(this.currentUserGroup.name);
    }
  },
  methods: {
    formatLocation(group, db) {
      let str = locationUri;
      if (group) {
        str = str.replace('{groupname}', this.currentUserGroup.name);
      }
      if (db) {
        str = str.replace('{dbname}', db);
      }
      return str;
    },
    getGroupPage() {
      const params = {
        userId: this.userInfo.userId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
    },
    handleCheckAllChange(val) {
      this.checkedOpes = val ? this.permissions.map(({ value }) => value) : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.permissions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length;
    },
    handleScope(val) {
      this.scopes = [];
      this.currentGroup = null;
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
    showWin(region, dbDetail = {}) {
      this.ruleForm.region = region || dbDetail.catalogName;
      this.dialogVisible = true;
      this.btnDisabled = false;
      if (dbDetail.databaseName) {
        this.ruleForm.databaseName = dbDetail.databaseName;
        this.ruleForm.locationUri = dbDetail.locationUri || dbDetail.location;
        this.ruleForm.description = dbDetail.description;
        this.ruleForm.userGroupName = dbDetail.owner;
        if (this.groupOptions.length) {
          const data = this.groupOptions.find(item => item.name === dbDetail.owner);
          if (data) this.currentGroup = data;
        }
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.ruleForm.databaseName = '';
      this.ruleForm.locationUri = this.formatLocation(this.currentUserGroup.name);
      this.scopes = [];
      this.currentGroup = null;
      this.ruleForm.description = '';
    },
    // handelAuthorized() {
    //   if (this.scopes.length) {
    //     // if (!this.checkedOpes.length) {
    //     //   this.$message({
    //     //     type: 'warning',
    //     //     message: '请选择权限'
    //     //   });
    //     //   return;
    //     // }
    //     const params = {
    //       owner: this.userInfo.userId,
    //       type: this.effectScope,
    //       operation: this.checkedOpes,
    //       roleNameList: this.scopes,
    //       objectNames: [`${this.ruleForm.region}.${this.ruleForm.databaseName}`]
    //     };
    //     grantPrivilegeToRoleOnDB(params).then(res => {});
    //   }
    // },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          let saveFn = null;
          if (this.isEdit) {
            saveFn = editDb;
          } else {
            saveFn = addDb;
          }
          saveFn(this.ruleForm)
            .then(res => {
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: `${this.isEdit ? '编辑' : '创建'}成功`
              });
              // 授权
              // this.handelAuthorized();
              this.$emit('addDbOk', this.isEdit);
            })
            .finally(() => {
              this.btnDisabled = false;
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
.form_item {
  display: flex;
  align-items: center;
  .form_btn {
    margin-left: 10px;
  }
}
.checkbox-group {
  display: inline-flex;
  align-items: center;
  padding-left: 20px;
}
</style>
