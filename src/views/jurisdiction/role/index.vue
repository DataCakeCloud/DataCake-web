<template>
  <el-card class="role-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="账号类型">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入账号类型名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button
        type="primary"
        class="create"
        @click="
          dialogVisible = true;
          operateType = 'add';
        "
      >新建</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" style="margin: 0 10px" @click="roleDetail(scope.row)">添加/移除产品权限</el-button>
            <el-button type="text" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <!-- 创建/编辑账号类型——弹框 -->
    <el-dialog :title="`${showSuccess ? '账号类型授权' : operateType === 'edit' ? '编辑账号类型' : '新建账号类型'}`" :visible.sync="dialogVisible" width="600px" @closed="handleClose">
      <el-form v-show="!showSuccess" ref="roleRef" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item label="账号类型名称" prop="name">
          <el-input v-model="roleForm.name"></el-input>
          <div>允许英文字母、数字或'_'。字符数应小于等于64个</div>
        </el-form-item>
        <el-form-item label="账号类型描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <ul v-if="showSuccess" class="seccueeBox">
        <li>
          <el-button type="success" icon="el-icon-check" circle></el-button>
          <span class="successTitle"> 账号类型创建成功</span>
        </li>
        <li>
          <span class="labelEle">已选实体账号:{{ tenantName }}</span>
        </li>
        <li>
          <span class="labelEle">账号类型名称：{{ addUserForm.roleName }}</span>
        </li>
        <li>
          为确保账号类型的正常使用，建议您继续为此账号类型添加权限
          <el-button type="primary" @click="addMenu">新增权限</el-button>
        </li>
      </ul>
      <span v-if="!showSuccess" slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 详情——弹框 -->
    <el-dialog title="账号类型详情" :visible.sync="detailVisible" width="700px" @closed="detailClose">
      <div>
        <el-card class="box-card">
          <el-descriptions :column="2">
            <el-descriptions-item label="账号类型名称">{{ addUserForm.roleName }}</el-descriptions-item>
            <el-descriptions-item label="账号类型ID">{{ addUserForm.roleId }}</el-descriptions-item>
            <el-descriptions-item label="账号类型描述">{{ addUserForm.description }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-tabs v-model="activeName" type="">
          <el-tab-pane name="second">
            <span slot="label"><i class="el-icon-s-tools"></i> 权限配置</span>
            <MenuAction ref="menuActionRef" :all-arr="allArr" :action-checked="actionChecked" :menu-checked="menuChecked"></MenuAction>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="detail-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
        <el-button v-show="activeName === 'second'" type="primary" @click="saveBtn">保 存</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import MenuAction from '../components/MenuAction';
import { roleAdd, roleUpdate, roleDelete, rolePage, roleGet, roleUpdateMenus } from '@/api/jurisdiction';

const resetDetail = () => {
  return {
    roleId: '',
    roleName: '',
    userIds: [{ id: '' }],
    description: ''
  };
};
export default {
  components: {
    SearchCondition,
    TablePage,
    MenuAction
  },
  data() {
    return {
      props: { multiple: true, value: 'id', label: 'name' },
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      tenantName: JSON.parse(sessionStorage.getItem('userInfo')).tenantName,
      showSuccess: false,
      allArr: [],
      actionChecked: [],
      menuChecked: [],
      operateType: '',
      menuLoading: false,
      actionLoading: false,
      addGroupVisible: false,
      addUserForm: resetDetail(),
      activeName: 'second',
      detailVisible: false,
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入账号类型名称', trigger: 'blur' },
          { max: 64, message: '字符数应小于等于64个', trigger: 'blur' },
          { pattern: /^\w+$/, message: '格式错误', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'name',
          label: '账号类型',
          width: '150',
          tooltip: true
        },
        {
          prop: 'description',
          label: '账号类型描述',
          width: '180',
          tooltip: true
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
          prop: 'updateBy',
          label: '创建人',
          width: '100'
        }
      ],
      total: 0,
      params: {
        name: '',
        pageNum: 1,
        pageSize: 10,
        tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async roleGetFn(roleId) {
      await roleGet({ id: roleId });
    },
    // 获取角色详情
    async roleDetail({ id }) {
      const { name, description, menus = [], actionChecked, menuChecked } = await (await roleGet({ id })).data;
      this.addUserForm.roleId = id;
      this.addUserForm.roleName = name;
      this.addUserForm.description = description;
      this.allArr = menus;
      this.actionChecked = actionChecked;
      this.menuChecked = menuChecked;
      this.detailVisible = true;
      return;
    },
    addMenu() {
      this.dialogVisible = false;
      this.detailVisible = true;
      this.roleDetail({ id: this.addUserForm.roleId });
    },
    saveBtn() {
      const actionChecked = this.$refs.menuActionRef.$refs.menuTree.getCheckedKeys();
      if (actionChecked.length === 0) {
        this.$confirm(`未配置任何权限，确定保存吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.updateMenusFn();
          })
          .catch(() => {});
      } else {
        this.updateMenusFn();
      }
    },
    async updateMenusFn() {
      const actionChecked = this.$refs.menuActionRef.$refs.actionTree.getCheckedKeys();
      const menuChecked = this.$refs.menuActionRef.$refs.menuTree.getCheckedKeys();
      const menuChecked1 = this.$refs.menuActionRef.$refs.menuTree.getHalfCheckedKeys();
      const allChecked = [...actionChecked, ...menuChecked, ...menuChecked1];
      const params = { id: this.addUserForm.roleId, menuIds: allChecked.join(',') };
      await roleUpdateMenus(params);
      this.$message.success('保存成功');
      this.detailVisible = false;
    },
    submit() {
      this.$refs['roleRef'].validate(async valid => {
        if (valid) {
          const submitFn = this.operateType === 'add' ? roleAdd : roleUpdate;
          const params = this.operateType === 'add' ? { ...this.roleForm, id: this.tenantId } : { ...this.roleForm, id: this.addUserForm.roleId };
          const data = await (await submitFn(params)).data;
          if (this.operateType === 'add') {
            this.showSuccess = true;
            this.addUserForm.roleId = data.id;
            this.addUserForm.roleName = this.roleForm.name;
          } else {
            this.$message.success(`编辑成功`);
            this.dialogVisible = false;
            this.getList();
          }
        } else {
          return false;
        }
      });
    },
    edit({ name, description, id }) {
      this.operateType = 'edit';
      this.addUserForm.roleId = id;
      this.roleForm.name = name;
      this.roleForm.description = description;
      this.dialogVisible = true;
    },
    handleClose() {
      this.$refs.roleRef.resetFields();
      this.roleForm = {
        name: '',
        description: ''
      };
      this.showSuccess && this.getList();
      this.showSuccess = false;
    },
    detailClose() {
      this.addUserForm = resetDetail();
      this.activeName = 'second';
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
      rolePage(params).then(res => {
        this.loading = false;
        const data = res.data;
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
          roleDelete({ id }).then(data => {
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
.role-list {
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
  .box-card {
    margin-bottom: 10px;
  }
  .btnEle {
    margin-bottom: 15px;
  }
  .detail-footer {
    text-align: center;
    display: block;
  }
  .liEle {
    list-style: none;
    display: flex;
    margin-bottom: 20px;
    .labelEle {
      display: inline-block;
      width: 100px;
      height: 32px;
      line-height: 32px;
    }
    .iconEle {
      height: 32px;
      line-height: 32px;
      margin-left: 15px;
      cursor: pointer;
    }
  }
  .powerTitle {
    margin-bottom: 10px;
    margin-top: 0;
  }
  .powerBtn {
    margin-top: 10px;
  }
  .seccueeBox {
    li {
      list-style: none;
      margin-bottom: 10px;
      .successTitle {
        font-size: $global-font-size-16;
        font-weight: 700;
        margin-left: 15px;
      }
      .labelEle {
        font-weight: 700;
      }
    }
  }
}
</style>
