<template>
  <el-card class="user-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="用户名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入用户名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button v-if="isCloud" :disabled="!isAdmin" type="primary" class="create" @click="handelUser('add')">新建用户</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="140">
          <template slot-scope="scope">
            <el-button :disabled="!isAdmin" type="text" size="mini" @click="handelUser('edit', scope.row)">编辑</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.freezeStatus === 1 || !isAdmin" @click="addRole(scope.row)">配置账号类型</el-button>
            <el-button :disabled="!isAdmin" type="text" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <!--邀请用户弹框 -->
    <el-dialog :title="`${setUserType === 'add' ? '新建' : '编辑'}用户`" :visible.sync="dialogVisible" width="600px" @closed="handleClose">
      <el-form ref="userRef" :model="userForm" :rules="rules" label-width="120px">
        <el-form-item label="租户名称">
          <el-input v-model="userForm.tenantName" disabled></el-input>
        </el-form-item>
        <el-form-item v-if="isShow('email')" label="电子邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="name">
          <el-input v-model="userForm.name" :disabled="setUserType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item v-if="isShow('phone')" label="手机号" prop="phone">
          <el-input v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userForm.eName"></el-input>
        </el-form-item>
        <el-form-item v-if="isShow('enterprise_wechat')" label="企业微信ID" prop="weChatId">
          <el-input v-model="userForm.weChatId"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="submitLoading" :disabled="submitLoading" type="primary" @click="submit">{{ setUserType === 'add' ? '新建' : '保存' }}</el-button>
      </span>
    </el-dialog>
    <!--添加角色弹框 -->
    <el-dialog title="配置账号类型" :visible.sync="addRoleVisible" width="750px" @closed="closed">
      <template #title>
        <span>{{ `配置账号类型${userObj.name ? ' - ' + userObj.name : ''}` }}</span>
      </template>
      <div>
        <div>
          <h4 class="mb10">账号类型 ：</h4>
          <el-transfer v-model="roleIds" :data="roleData" filterable filter-placeholder="请输入账号类型名称" :titles="['账号类型-备注', '已选择']">
            <span slot-scope="{ option }">{{ `${option.label}${option.description ? ` - ${option.description}` : ''}` }}</span>
          </el-transfer>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUp">保 存</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { userAddRoles, userDelete, userPage, roleList, accessAddUser, accessEditUser } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
const resetForm = () => {
  return {
    tenantName: '',
    email: '',
    eName: '',
    name: '',
    phone: '',
    weChatId: ''
  };
};
export default {
  name: 'User',
  components: {
    SearchCondition,
    TablePage
  },
  data() {
    return {
      submitLoading: false,
      roleIds: [],
      roleData: [],
      userObj: {
        id: '',
        name: ''
      },
      addRoleVisible: false,
      userForm: resetForm(),
      rules: {
        email: [
          { required: true, message: '请输入 email', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur'] }
        ],
        phone: [
          { required: true, message: '请输入 手机号', trigger: 'blur' },
          { pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur'] }
        ],
        name: [
          { required: true, message: '请输入 账号名称', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9_.-]{1,30}$/, message: '支持数字、英文、下划线、点、中划线1~30(含)字符的名称格式', trigger: ['blur'] }
        ]
      },
      dialogVisible: false,
      loading: false,
      tableData: [],
      defaultColumnData: [
        {
          prop: 'name',
          label: '账号',
          width: '100'
        },
        {
          prop: 'eName',
          label: '用户名称',
          width: '100',
          tooltip: true
        },
        {
          prop: 'weChatId',
          label: '企业微信ID',
          width: '100',
          tooltip: true
        },
        {
          prop: 'email',
          label: '邮箱',
          width: '160'
        },
        {
          prop: 'phone',
          label: '手机号',
          width: '100'
        },
        {
          prop: 'updateBy',
          label: '创建人',
          width: '100'
        },
        {
          prop: 'groups',
          label: '所属用户组',
          width: '100',
          tooltip: true,
          format: row => {
            return row.groups?.join() || '-';
          }
        },
        {
          prop: 'roles',
          label: '账号类型',
          width: '130',
          tooltip: true,
          format: row => {
            return row.roles?.join() || '-';
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '120',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        }
      ],
      total: 0,
      params: {
        name: '',
        pageNum: 1,
        pageSize: 10
        // tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId
      },
      // tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      setUserType: 'add'
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'userInfo', 'isCloud']),
    columnData() {
      const data = this.defaultColumnData;
      const kkey = ['email', 'phone', 'weChatId'];
      const alarmChannel = this.userInfo?.alarmChannel || [];
      return data.filter(item => {
        if (!kkey.includes(item.prop)) return item;
        const key = item.prop === 'weChatId' ? 'enterprise_wechat' : item.prop;
        if (alarmChannel.includes(key)) {
          return item;
        } else {
          return false;
        }
      });
    }
  },
  created() {
    this.userForm.tenantName = this.userInfo?.tenantName || 'xdf';
    this.getList();
    this.getRolePage(); // 获取角色列表
  },
  methods: {
    isShow(type) {
      return this.userInfo.alarmChannel?.includes(type);
    },
    handelUser(type, data) {
      this.dialogVisible = true;
      this.setUserType = type;
      if (data) this.userForm = Object.assign({}, data, { tenantName: this.userInfo.tenantName });
    },
    closed() {
      this.roleIds = [];
    },
    async getRolePage() {
      const list = await (await roleList()).data;
      this.roleData = list.length > 0 ? list.map(item => ({ label: item.name, key: item.id, description: item.description })) : [];
    },
    setUp() {
      if (this.roleIds.length === 0) {
        this.$confirm(`没有选择角色，确定保存吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.AddRolesFn();
          })
          .catch(() => {});
      } else {
        this.AddRolesFn();
      }
    },
    async AddRolesFn() {
      await userAddRoles({ userId: this.userObj.id, roleIds: this.roleIds.join(',') });
      this.$message.success(`添加成功`);
      this.getList();
      this.addRoleVisible = false;
    },
    submit() {
      this.$refs['userRef'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.userForm);
          this.submitLoading = true;
          const handelFn = this.setUserType === 'add' ? accessAddUser : accessEditUser;
          handelFn(params)
            .then(res => {
              this.$message({
                type: 'success',
                message: '操作成功'
              });

              this.dialogVisible = false;
              this.getList();
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },
    addRole(data) {
      this.userObj = Object.assign(this.userObj, data);
      this.roleIds = data.roleIds;
      this.addRoleVisible = true;
    },
    handleClose() {
      this.userForm = Object.assign(resetForm(), { tenantName: this.userInfo?.tenantName || 'xdf' });
      this.$refs.userRef.resetFields();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = true;
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      userPage(params).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.total;
        this.tableData = data.list;
      });
    },
    reset() {
      this.params = {
        componentCode: '',
        createBy: '',
        keyword: '',
        pageNum: 1,
        pageSize: 10
      };
      this.getList();
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    deleteData({ name, id }) {
      this.$confirm(`确定删除${name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          userDelete({ id }).then(data => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.user-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    padding: 15px;
    position: relative;
    .create {
      position: absolute;
      right: 15px;
      top: 20px;
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  .labelEle {
    display: inline-block;
    width: 50px;
    font-weight: 600;
  }
  ::v-deep .el-transfer-panel {
    width: 250px;
  }
}
</style>
