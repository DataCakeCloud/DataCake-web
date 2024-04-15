<template>
  <el-card class="tenant-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="租户名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入租户名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <search-condition label="租户状态">
        <el-select v-model="params.freeze" class="search-box" placeholder="租户状态" clearable>
          <el-option v-for="item in freezeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button
        type="primary"
        class="create"
        @click="
          dialogVisible = true;
          operateType = 'add';
          tenantForm.userRoleIds = [1, 5];
        "
      >新建租户</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.freezeStatus === 1" @click="configureFn(scope.row)">配置资源</el-button>
            <el-popconfirm title="确认冻结吗？" confirm-button-text="确认" cancel-button-text="取消" @confirm="tenantFreezeFn(scope.row.id, 1)">
              <el-button v-if="scope.row.freezeStatus === 0" slot="reference" type="text" size="mini">冻结</el-button>
            </el-popconfirm>
            <el-button v-if="scope.row.freezeStatus === 1" type="text" size="mini" @click="tenantFreezeFn(scope.row.id, 0)">启用</el-button>
            <el-button type="text" :disabled="scope.row.id === userId" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <!-- 弹框 -->
    <el-dialog :title="`${operateType === 'add' ? '创建' : '编辑'}租户组织`" :visible.sync="dialogVisible" width="600px" @closed="handleClose">
      <el-form ref="tenantRef" :model="tenantForm" :rules="rules" label-width="120px">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="tenantForm.name" :disabled="operateType === 'edit'"></el-input>
          <!-- <div>字母开头,只包含a-z,A-Z,0-9或下划线'_',长度2-64</div> -->
        </el-form-item>
        <el-form-item label="租户管理员邮箱" prop="managerEmail">
          <el-input v-model="tenantForm.managerEmail"></el-input>
          <!-- <div>字母开头,只包含a-z,A-Z,0-9或下划线'_',长度2-64</div> -->
        </el-form-item>
        <el-form-item label="角色" prop="userRoleIds">
          <el-select v-model="tenantForm.userRoleIds" placeholder="选择角色" multiple clearable style="width: 100%" disabled>
            <template v-for="(item, index) in roleData">
              <el-option :key="index" :label="item.label" :value="item.key"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item v-if="tenantForm.userRoleIds && tenantForm.userRoleIds.length > 0" label="角色描述">
          <el-input v-model="descriptionAll" type="textarea" :rows="3" disabled></el-input>
        </el-form-item>
        <el-form-item label="租户描述">
          <el-input v-model="tenantForm.description" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="submitLoading" :disabled="submitLoading" type="primary" @click="submit">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 配置资源弹框 -->
    <el-dialog title="配置产品资源" :visible.sync="resourceVisible" width="650px">
      <div slot="title" style="font-weight: 500; font-size: 16px">
        配置产品资源
        <el-tooltip class="item" effect="dark" content="您需要给租户配置对应的功能模块权限，如不配置，会影响租户的正常使用" placement="top">
          <i class="el-icon-info" style="cursor: pointer"></i>
        </el-tooltip>
      </div>
      <div>
        <div class="configureName">
          请为 <span style="font-weight: 900">{{ configureObj.name }}</span> 配置对应的产品资源信息
        </div>
        <el-transfer v-model="value" :data="resourceData" filterable filter-placeholder="请输入产品模块名称" :titles="['选择产品模块', '已选模块']"> </el-transfer>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resourceVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUp">创 建</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { tenantAdd, tenantUpdate, getConfig, tenantConfig, tenantDelete, tenantPage, tenantFreeze, roleList } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';

export default {
  components: {
    SearchCondition,
    TablePage
  },
  data() {
    // 增加列——基础字段
    var validateName = (rule, value, callback) => {
      if (value.trim() !== '') {
        const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        if (!reg.test(value)) {
          callback(new Error('英文字母为首，下划线与数字的组合'));
        }
        callback();
      } else {
        callback(new Error('请输入企业租户名称'));
      }
    };
    return {
      userId: JSON.parse(sessionStorage.getItem('userInfo')).id,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      freezeList: [
        {
          label: '启用',
          value: 0
        },
        {
          label: '冻结',
          value: 1
        }
      ],
      roleData: [],
      value: [],
      resourceData: [],
      configureObj: {
        id: '',
        name: ''
      },
      resourceVisible: false,
      submitLoading: false,
      tenantForm: {
        name: '',
        managerEmail: '',
        userRoleIds: [],
        description: ''
      },
      rules: {
        name: [
          { required: true, validator: validateName, trigger: 'blur' },
          { max: 16, message: '字符数应小于等于16个', trigger: 'blur' }
        ],
        userRoleIds: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }
        ],
        managerEmail: [{ required: true, message: '请输入租户管理员邮箱', trigger: 'blur' }]
      },
      dialogVisible: false,
      operateType: '',
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'name',
          label: '租户名称',
          width: '60'
        },
        {
          prop: 'id',
          label: '租户ID',
          width: '150'
        },
        {
          prop: 'description',
          label: '租户描述',
          width: '180'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        },
        {
          prop: 'managerEmail',
          label: '管理者邮箱',
          width: '150'
        },
        {
          prop: 'updateBy',
          label: '创建人',
          width: '100'
        }
      ],
      total: 0,
      params: {
        name: '',
        freeze: '',
        pageNum: 1,
        pageSize: 10
      },
      descriptionAll: ''
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'tenantForm.userRoleIds': {
      handler(val) {
        if (!val) return;
        let str = '';
        val.forEach(item => {
          const description = this.roleData.find(v => v.key === item).description;
          if (description) str = str + description + '\n';
        });
        this.descriptionAll = str;
      },
      immediate: true
    }
  },
  created() {
    this.getList();
    this.getRolePage();
    this.getConfigList(); // 获取资源列表
  },
  methods: {
    async tenantFreezeFn(id, freeze) {
      await tenantFreeze({ id, freeze });
      this.$message.success(`${freeze === 1 ? '冻结' : '启用'}成功`);
      this.getList();
    },
    async getRolePage() {
      const list = await (await roleList({ id: this.tenantId })).data;
      this.roleData = list.length > 0 ? list.map(item => ({ label: item.name, key: item.id, description: item.description })) : [];
    },
    async configureFn({ id, name }) {
      this.configureObj.id = id;
      this.configureObj.name = name;
      this.value = await this.getConfigList(id);
      this.resourceVisible = true;
    },
    async getConfigList(tenantId = '') {
      const params = {};
      tenantId !== '' && (params.tenantId = tenantId);
      const data = await (await getConfig(params)).data;
      if (tenantId === '') {
        this.resourceData = data.length > 0 ? data.map(item => ({ label: item.name, key: item.id })) : [];
      }
      return data.length > 0 ? data.map(item => item.id) : [];
    },
    setUp() {
      if (this.value.length === 0) {
        this.$confirm(`没有选择产品，确定保存吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.tenantConfigFn();
          })
          .catch(() => {});
      } else {
        this.tenantConfigFn();
      }
    },
    async tenantConfigFn() {
      await tenantConfig({ id: this.configureObj.id, productIds: this.value.join(',') });
      this.$message.success(`配置成功`);
      this.resourceVisible = false;
      this.getList();
    },
    submit() {
      this.$refs['tenantRef'].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          const submitFn = this.operateType === 'add' ? tenantAdd : tenantUpdate;
          const params =
            this.operateType === 'add'
              ? {
                ...this.tenantForm,
                userRoleIds: this.tenantForm.userRoleIds.join(',')
              }
              : {
                ...this.tenantForm,
                id: this.configureObj.id,
                userRoleIds: this.tenantForm.userRoleIds.join(',')
              };
          submitFn(params)
            .then(res => {
              this.submitLoading = false;
              this.$message.success(`${this.operateType === 'add' ? '创建' : '编辑'}成功`);
              this.dialogVisible = false;
              this.getList();
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },
    edit({ id, name, managerEmail, description, userRoleIds }) {
      this.dialogVisible = true;
      this.operateType = 'edit';
      this.configureObj.id = id;
      this.tenantForm.name = name;
      this.tenantForm.managerEmail = managerEmail;
      this.tenantForm.description = description;
      this.tenantForm.userRoleIds = userRoleIds;
    },
    handleClose() {
      this.tenantForm = {
        name: '',
        description: ''
      };
      this.$refs.tenantRef.resetFields();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = false;
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      tenantPage(params).then(res => {
        this.loading = false;
        const data = res.data;
        this.total = data.total;
        this.tableData = data.list;
      });
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
          tenantDelete({ id }).then(data => {
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
.tenant-list {
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
  .configureName {
    margin-bottom: 15px;
  }
}
</style>
