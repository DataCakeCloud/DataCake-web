<template>
  <el-card class="role-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="角色名称">
        <el-input v-model.trim="params.roleName" class="search-box" placeholder="请输入角色名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button
        type="primary"
        class="create"
        @click="
          dialogVisible = true;
          operateType = 'add';
        "
      >新建角色</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="comTableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" style="margin: 0 10px" @click="roleDetail(scope.row)">用户/权限管理</el-button>
            <el-button type="text" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <!-- 创建/编辑角色——弹框 -->
    <el-dialog :title="`${showSuccess ? '角色授权' : operateType === 'edit' ? '编辑角色' : '新增数据权限角色'}`" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" @closed="handleClose">
      <el-form v-show="!showSuccess" ref="roleRef" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
          <div>允许英文字母、数字或'_'。字符数应小于等于64个</div>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.comment" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <ul v-if="showSuccess" class="seccueeBox">
        <li>
          <el-button type="success" icon="el-icon-check" circle></el-button>
          <span class="successTitle"> 角色创建成功</span>
        </li>
        <li>
          <span class="labelEle">已选实体账号:{{ userInfo.tenantName }}</span>
        </li>
        <li>
          <span class="labelEle">角色名称：{{ addUserForm.roleName }}</span>
        </li>
        <li>
          为确保角色的正常使用，建议您继续为此角色添加权限
          <el-button type="primary" @click="addMenu">新增权限</el-button>
        </li>
      </ul>
      <span v-if="!showSuccess" slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 详情——弹框 -->
    <el-dialog v-if="detailVisible" title="角色详情" :visible.sync="detailVisible" width="80%" class="detaiDial" :close-on-click-modal="false" @close="detailClose">
      <div>
        <el-card class="box-card">
          <el-descriptions :column="2">
            <el-descriptions-item label="角色名称">{{ addUserForm.roleName }}</el-descriptions-item>
            <el-descriptions-item label="角色ID">{{ addUserForm.roleId }}</el-descriptions-item>
            <el-descriptions-item label="角色描述">{{ addUserForm.comment }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-tabs v-model="activeName" type="">
          <el-tab-pane name="first">
            <span slot="label"><i class="el-icon-s-custom"></i> 用户管理</span>
            <div class="tool">
              <el-button type="primary" class="btnEle" @click="addUserVisible = true">添加用户</el-button>
              <el-button type="primary" class="btnEle" @click="addGroupVisible = true">添加用户组</el-button>
              <div class="searchName">
                <el-input v-model.trim="searchName" class="search-box" placeholder="请输入用户名称" @keyup.enter.native="searchNameFn">
                  <i slot="suffix" class="el-input__icon el-icon-search" @click="searchNameFn"></i>
                </el-input>
              </div>
            </div>
            <el-table :data="comTableDataUser" border height="350px">
              <el-table-column prop="name" label="用户名称"> </el-table-column>
              <!-- <el-table-column prop="createTime" label="添加角色时间" width="180">
                <template slot-scope="scope">
                  {{ $utils.parseTime(scope.row.createTime) }}
                </template>
              </el-table-column> -->
              <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                  <el-popconfirm title="确认移除该用户吗？" @confirm="removeUserBtn(scope.row)">
                    <el-button slot="reference" type="text" size="mini">从该角色移除</el-button>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane name="second">
            <span slot="label"><i class="el-icon-s-tools"></i> 数据权限配置</span>
            <data-role-table :info="addUserForm" />
            <!-- <MenuAction ref="menuActionRef" :all-arr="allArr" :action-checked="actionChecked" :menu-checked="menuChecked"></MenuAction> -->
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="detail-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
        <!-- <el-button v-show="activeName === 'second'" type="primary" @click="saveBtn">保 存</el-button> -->
      </span>
    </el-dialog>
    <!--添加用户 ——弹框 -->
    <el-dialog :close-on-click-modal="false" :title="`角色名称:${addUserForm.roleName}`" center :visible.sync="addUserVisible" width="450px" @closed="addUserClosed">
      <ul>
        <li v-for="(item, index) in addUserForm.userIds" :key="index" class="liEle">
          <span class="labelEle">用户名称</span>
          <el-select
            v-model="item.id"
            filterable
            placeholder="请输入用户名称"
            :remote-method="
              query => {
                remoteMethod(query, index);
              }
            "
            remote
            reserve-keyword
            :loading="loadingSelect"
          >
            <el-option v-for="val in options[index]" :key="val.value" :label="val.label" :value="val.value"> </el-option>
          </el-select>
          <i v-if="index === 0" class="el-icon-plus iconEle" @click="addItem"></i>
          <i v-if="index !== 0" class="el-icon-minus iconEle" @click="deleteItem(index)"></i>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addUserLoading" @click="addUserBtn">增 加</el-button>
      </span>
    </el-dialog>
    <!-- 添加用户组 -->
    <el-dialog :title="`角色名称:${addUserForm.roleName}`" center :visible.sync="addGroupVisible" width="450px" @closed="addGroupClosed">
      <div>
        <span class="labelEle">用户组名称</span>
        <el-cascader v-model="userGroupIds" :options="groupOptions" :props="props" clearable placeholder="请选择用户组"></el-cascader>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGroupVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addGroupLoading" @click="addGroupBtn">增 加</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { dataRoleAdd, dataRoleUpdate, dataRoleDelete, dataRolePage, roleGet, dataShowUsers, dataAddUsers, dataRemoveUsers, roleUpdateMenus } from '@/api/dataRole';
import { userList, getUserGroup } from '@/api/jurisdiction';
import DataRoleTable from '../components/DataRoleTable';
import { mapGetters } from 'vuex';

const resetDetail = () => {
  return {
    roleId: '',
    roleName: '',
    userIds: [{ id: '' }],
    comment: ''
  };
};
export default {
  name: 'DataRole',
  components: {
    SearchCondition,
    TablePage,
    // MenuAction,
    DataRoleTable
  },
  data() {
    return {
      props: { multiple: true, value: 'id', label: 'name' },
      groupOptions: [],
      userGroupIds: [],
      addGroupVisible: false,
      searchName: '',
      // userId: JSON.parse(sessionStorage.getItem('userInfo')).userId,
      addUserLoading: false,
      addGroupLoading: false,
      // tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      // tenantName: JSON.parse(sessionStorage.getItem('userInfo')).tenantName,
      showSuccess: false,
      allArr: [],
      actionChecked: [],
      menuChecked: [],
      operateType: '',
      menuLoading: false,
      actionLoading: false,
      tableDataUser: [],
      comTableDataUser: [],
      addUserVisible: false,
      addUserForm: resetDetail(),
      options: [[]],
      loadingSelect: false,
      activeName: 'first',
      detailVisible: false,
      roleForm: {
        roleName: '',
        comment: ''
      },
      oldName: '',
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { max: 64, message: '字符数应小于等于64个', trigger: 'blur' },
          { pattern: /^\w+$/, message: '格式错误', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'roleName',
          label: '角色名称',
          width: '100'
        },
        {
          prop: 'roleId',
          label: '角色ID',
          width: '180'
        },
        {
          prop: 'comment',
          label: '角色描述',
          width: '100'
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          width: '100',
          format: row => {
            return this.$utils.parseTime(row.createdTime);
          }
        },
        {
          prop: 'owner',
          label: '创建人',
          width: '80'
        }
      ],
      total: 0,
      params: {
        roleName: '',
        pageNum: 1,
        pageSize: 10
        // tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    comTableData() {
      const start = (this.params.pageNum - 1) * this.params.pageSize;
      const end = this.params.pageNum * this.params.pageSize;
      return this.tableData.slice(start, end);
    }
  },
  created() {
    this.getList();
    this.getUserGroup();
  },
  methods: {
    getUserGroup() {
      const params = {
        userId: JSON.parse(sessionStorage.getItem('userInfo')).userId
      };
      getUserGroup(params).then(data => {
        this.groupOptions = data.data;
        this.solveEmptyChildren(this.groupOptions);
      });
    },
    solveEmptyChildren(data) {
      data.forEach(item => {
        if (!item.children.length) {
          delete item.children;
        } else {
          this.solveEmptyChildren(item.children);
        }
      });
    },
    searchNameFn() {
      if (!this.searchName) {
        this.comTableDataUser = this.tableDataUser;
        return;
      }
      this.comTableDataUser = this.tableDataUser.filter(item => item.name.includes(this.searchName));
    },
    addUserClosed() {
      this.addUserForm.userIds = [{ id: '' }];
      this.options = [[]];
    },
    addGroupClosed() {},
    async remoteMethod(query, index) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userList({ name: query, tenantId: this.userInfo.tenantId })).data;
        this.loadingSelect = false;
        this.options[index] = data.length > 0 ? data.map(item => ({ label: item.name, value: item.name })) : [];
      } else {
        this.options[index] = [];
      }
    },
    async roleGetFn(roleId) {
      await roleGet({ id: roleId });
    },
    async removeUserBtn(data) {
      await dataRemoveUsers({
        roleName: this.addUserForm.roleName,
        userIds: [data.name]
      });
      this.$message.success(`删除成功`);
      this.roleDetail(this.addUserForm);
    },
    async addUserBtn() {
      let userIds = this.addUserForm.userIds;
      if (userIds.some(item => item.id === '')) {
        this.$message.warning('用户名称不能为空');
        return;
      }
      this.addUserLoading = true;
      userIds = userIds.map(({ id }) => id);
      try {
        await dataAddUsers({ roleName: this.addUserForm.roleName, userIds });
        this.$message.success(`添加成功`);
        await this.roleDetail(this.addUserForm);
        this.addUserVisible = false;
      } catch (error) {
        console.error(error);
      }
      this.addUserLoading = false;
    },
    async addGroupBtn() {
      if (!this.userGroupIds.length) {
        this.$message.warning('用户名称不能为空');
        return;
      }
      this.addGroupLoading = true;
      try {
        await dataAddUsers({ roleName: this.addUserForm.roleName, groupIds: this.userGroupIds.map(it => it[it.length - 1]).join(',') });
        await this.roleDetail(this.addUserForm);
        this.$message.success(`添加成功`);
        this.addGroupVisible = false;
      } catch (error) {
        console.error(error);
      }
      this.addGroupLoading = false;
    },
    deleteItem(i) {
      this.addUserForm.userIds.splice(i, 1);
    },
    addItem() {
      this.addUserForm.userIds.push({ id: '' });
      this.options.push([]);
    },
    // 获取角色详情
    async roleDetail({ comment, roleId, roleName }) {
      const { toUsers } = await (await dataShowUsers({ projectId: this.userInfo.tenantName || 'shareit', roleName })).data;
      this.addUserForm.roleId = roleId;
      this.addUserForm.roleName = roleName;
      this.addUserForm.comment = comment;
      // this.allArr = menus;
      // this.actionChecked = actionChecked;
      // this.menuChecked = menuChecked;
      this.tableDataUser = this.comTableDataUser = toUsers.map(item => ({ name: item }));
      this.detailVisible = true;
      return;
    },
    addMenu() {
      this.dialogVisible = false;
      this.detailVisible = true;
      this.roleDetail(this.addUserForm);
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
          const submitFn = this.operateType === 'add' ? dataRoleAdd : dataRoleUpdate;
          const params = this.operateType === 'add' ? { ...this.roleForm, ownerUser: this.userInfo.userId } : { oldName: this.oldName, comment: this.roleForm.comment, newName: this.roleForm.roleName };
          await submitFn(params);
          if (this.operateType === 'add') {
            this.showSuccess = true;
            // this.addUserForm.roleId = data.id;
            this.addUserForm.roleName = this.roleForm.roleName;
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
    edit({ roleName, comment }) {
      this.oldName = roleName;
      this.operateType = 'edit';
      this.roleForm.roleName = roleName;
      this.roleForm.comment = comment;
      this.dialogVisible = true;
    },
    handleClose() {
      this.$refs.roleRef.resetFields();
      this.roleForm = {
        roleName: '',
        comment: ''
      };
      this.showSuccess && this.getList();
      this.showSuccess = false;
    },
    detailClose() {
      this.addUserForm = resetDetail();
      this.activeName = 'first';
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      // this.getList();
    },
    getList() {
      this.loading = true;
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      if (params.roleName) {
        dataShowUsers({
          roleName: params.roleName,
          projectId: this.userInfo.tenantName || 'shareit'
        })
          .then(res => {
            this.loading = false;
            const data = res.data;
            this.total = 1;
            this.tableData = data ? [data] : [];
          })
          .catch(() => {
            this.loading = false;
            this.total = 1;
            this.tableData = [];
          });
      } else {
        dataRolePage(params)
          .then(res => {
            const data = res.data;
            this.loading = false;
            this.total = data.length;
            this.tableData = data;
          })
          .catch(err => {
            console.log(err, 'err');
          });
      }
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
    deleteData({ roleName }) {
      this.$confirm(`确定删除${roleName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          dataRoleDelete({ roleName }).then(data => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.params.roleName = '';
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
  .detaiDial {
    ::v-deep .el-dialog__body {
      padding: 0 20px;
    }
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
.tool {
  justify-content: space-between;
  align-content: center;
}
</style>
