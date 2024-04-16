<template>
  <el-card class="user-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="用户组名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入用户名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" :disabled="!isAdmin" @click="handelUser('add')">新建</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button type="text" :disabled="!isAdmin" size="mini" @click="handelUser('edit', scope.row)">编辑</el-button>
            <el-button type="text" :disabled="!isAdmin" size="mini" @click="setDataRole(scope.row)">添加/移除数据权限</el-button>
            <el-button type="text" size="mini" :disabled="userSetType(scope.row)" @click="addRole(scope.row)">添加/移除用户</el-button>
            <el-button type="text" :disabled="!isAdmin" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <!--新增用户组弹框 -->
    <el-dialog :title="`${setUserType === 'add' ? '新建' : '编辑'}用户组`" :visible.sync="dialogVisible" width="600px" @closed="handleClose">
      <el-form ref="userRef" :model="groupForm" :rules="rules" label-width="120px">
        <el-form-item label="用户组名称" prop="name">
          <el-input v-model="groupForm.name"></el-input>
        </el-form-item>
        <el-form-item label="默认Hive库" prop="defaultHiveDbName">
          <el-input v-model="groupForm.defaultHiveDbName"></el-input>
        </el-form-item>
        <el-form-item label="所属组织" prop="parentId">
          <el-cascader v-model="groupForm.parentId" style="width: 100%" :options="treeData" :props="props" clearable :append-to-body="false"></el-cascader>
        </el-form-item>
        <el-form-item label="团队描述" prop="description">
          <el-input v-model="groupForm.description" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="submitLoading" :disabled="submitLoading" type="primary" @click="submit">{{ setUserType === 'add' ? '新建' : '保存' }}</el-button>
      </span>
    </el-dialog>
    <!--添加/移除用户弹框 -->
    <el-dialog :visible.sync="addUserVisible" width="750px">
      <template #title>
        <span>{{ `添加/移除用户${userObj.name ? ' - ' + userObj.name : ''}` }}</span>
      </template>
      <div>
        <div class="tool">
          <el-button type="primary" class="btnEle" @click="userVisible = true">添加用户</el-button>
          <div class="searchName">
            <el-input v-model.trim="searchName" placeholder="请输入用户名称" @keyup.enter.native="searchNameFn">
              <i slot="suffix" class="el-input__icon el-icon-search" @click="searchNameFn"></i>
            </el-input>
          </div>
        </div>
        <el-table :data="comTableDataUser" border height="350px" style="border: 1px solid #e2e9f3">
          <el-table-column prop="userName" label="用户名称"> </el-table-column>
          <el-table-column label="添加时间">
            <template slot-scope="{ row }">
              <span>{{ $utils.parseTime(row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="owner标识">
            <template slot-scope="{ row }">
              <span>{{ ownerTyleList[row.owner] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-popconfirm title="确认移除用户吗？" @confirm="removeUserBtn(scope.row.id)">
                <el-button slot="reference" type="text" size="mini">移除用户</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!--添加用户 ——弹框 -->
    <el-dialog :close-on-click-modal="false" title="添加用户" :visible.sync="userVisible" width="560px" @closed="addUserClosed">
      <ul>
        <li v-for="(item, index) in addUserList" :key="index" class="liEle">
          <span class="labelEle">用户名称</span>
          <el-select
            v-model="item.userName"
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
            <el-option v-for="val in options[index]" :key="val.value" :label="val.label" :value="val.value" @click.native="handelUserList(item, val)"> </el-option>
          </el-select>
          <el-radio-group v-model="item.owner" class="leader_radio">
            <el-radio :label="1">组员</el-radio>
            <el-radio :label="0" :disabled="isHasOwner1 || isHasOwner2">Owner</el-radio>
          </el-radio-group>
          <i v-if="index === 0" class="el-icon-plus iconEle" @click="addItem"></i>
          <i v-if="index !== 0" class="el-icon-minus iconEle" @click="deleteItem(index)"></i>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addUserLoading" @click="addUserBtn">增 加</el-button>
      </span>
    </el-dialog>

    <!-- 详情——弹框 -->
    <el-dialog v-if="detailVisible" :visible.sync="detailVisible" width="60%" class="detaiDial" :close-on-click-modal="false">
      <template #title>
        <span>{{ `添加/移除数据权限${roleData.name ? ' - ' + roleData.name : ''}` }}</span>
      </template>
      <data-role-table :info="roleData" />
      <span slot="footer" class="detail-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import DataRoleTable from './components/DataRoleTable';
import TablePage from '@/components/TablePage';
import { deleteUserGroup, getGroupPage, addUserGroup, editUserGroup, userList, userGroupAddUser, userGroupRemoveUser, groupTree } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
const resetForm = () => {
  return {
    name: '',
    defaultHiveDbName: '',
    parentId: [],
    description: '',
    isHasOwner1: false,
    isHasOwner2: false
  };
};
export default {
  components: {
    SearchCondition,
    TablePage,
    DataRoleTable
  },
  data() {
    return {
      props: { checkStrictly: true, value: 'id', label: 'name' },
      addUserList: [],
      roleData: {},
      ownerTyleList: {
        1: '组员',
        0: 'Owner'
      },
      treeData: [],
      detailVisible: false,
      comTableDataUser: [],
      loadingSelect: false,
      addUserLoading: false,
      userVisible: false,
      options: [[]],
      searchName: '',
      submitLoading: false,
      userObj: {
        userId: '',
        name: '',
        userGroupRelationList: []
      },
      addUserVisible: false,
      groupForm: resetForm(),
      rules: {
        name: [
          { required: true, message: '请输入 用户组名称', trigger: 'blur' },
          { pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]{1,30}$/, message: '支持中文、数字、英文、下划线、中划线1~30(含)字符的名称格式', trigger: ['blur'] }
        ],
        defaultHiveDbName: [{ required: true, message: '请输入 Hive库', trigger: 'blur' }],
        parentId: [{ required: true, message: '请选择 所属组织', trigger: 'change' }]
      },
      dialogVisible: false,
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'name',
          label: '用户组名称',
          width: '100'
        },
        {
          prop: 'description',
          label: '用户组描述',
          width: '180',
          tooltip: true
        },
        {
          prop: 'org',
          label: '所属组织',
          width: '120',
          format: this.formatOrg,
          tooltip: true
        },
        {
          prop: 'createBy',
          label: '创建人',
          width: '80'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '100',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        }
      ],
      total: 0,
      params: {
        name: '',
        pageNum: 1,
        pageSize: 10,
        tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId
      },
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      setUserType: 'add'
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdmin'])
  },
  watch: {
    'userObj.userGroupRelationList': {
      handler(val) {
        // 判断表单中是否存在owner
        const ownerFlag = val.some(item => {
          if (item.owner === 0) {
            return true;
          }
        });
        if (ownerFlag) {
          this.isHasOwner1 = true;
        } else {
          this.isHasOwner1 = false;
        }
      },
      deep: true,
      immediate: true
    },
    addUserList: {
      handler(val) {
        // 判断表单中是否存在owner
        const ownerFlag = val.some(item => {
          if (item.owner === 0) {
            return true;
          }
        });
        if (ownerFlag) {
          this.isHasOwner2 = true;
        } else {
          this.isHasOwner2 = false;
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.groupTree();
    this.getList();
  },
  methods: {
    userSetType(data) {
      if (!data) return true;
      let addFlag;
      if (this.isAdmin) {
        addFlag = true;
      } else {
        const { userGroupRelationList = [] } = data;
        addFlag = userGroupRelationList.some(item => item.userName === this.userInfo.userId && item.owner === 0);
      }
      return !addFlag;
    },
    formatOrg(data = {}) {
      const newObj = data?.org ? [...data.org] : [];
      return newObj.reverse().join(' - ');
    },
    handelUserList(data, optionData) {
      data.userId = optionData.userId;
    },
    groupTree() {
      const params = {
        userId: this.userInfo.userId
      };

      groupTree(params).then(res => {
        this.treeData = res.data || [];
        this.solveEmptyChildren(this.treeData);
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
    removeUserBtn(id) {
      userGroupRemoveUser({
        id: id
      }).then(data => {
        if (data.code === 0) {
          const index = this.comTableDataUser.findIndex(item => item.id === id);
          this.comTableDataUser.splice(index, 1);
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          // 更新用户信息的信息
          this.$store.dispatch('user/GetCloudInfo');
        }
      });
    },
    async addUserBtn() {
      if (this.addUserList.some(item => item.userName === '')) {
        this.$message.warning('用户名称不能为空');
        return;
      }
      this.addUserLoading = true;
      this.addUserList.forEach(item => {
        item.userGroupId = this.userObj.id;
        delete item.id;
      });
      try {
        await userGroupAddUser({ userGroupRelationList: this.addUserList });
        await this.getList();
        const currentObj = this.tableData.find(item => item.id === this.userObj.id);
        currentObj && this.addRole(currentObj);
        this.$message.success(`添加成功`);
        this.userVisible = false;
        // 更新用户信息的信息
        await this.$store.dispatch('user/GetCloudInfo');
      } catch (error) {
        console.error(error);
      }
      this.addUserLoading = false;
    },
    deleteItem(i) {
      this.addUserList.splice(i, 1);
    },
    addItem() {
      this.addUserList.push({
        userName: '',
        userId: null,
        owner: 1
      });
      this.options.push([]);
    },
    addUserClosed() {
      this.addUserList = [{ userName: '', userId: null, owner: 1 }];
      this.options = [[]];
    },
    searchNameFn() {
      if (!this.searchName) {
        this.comTableDataUser = this.userObj.userGroupRelationList;
        return;
      }
      this.comTableDataUser = this.userObj.userGroupRelationList.filter(item => item.userName.includes(this.searchName));
    },
    async remoteMethod(query, index) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userList({ name: query, tenantId: this.userInfo.tenantId })).data;
        this.loadingSelect = false;
        this.options[index] = data.length > 0 ? data.map(item => ({ label: item.name, value: item.name, userId: item.id })) : [];
      } else {
        this.options[index] = [];
      }
    },
    setDataRole(data) {
      this.roleData = Object.create(data);
      this.detailVisible = true;
    },
    handelUser(type, data) {
      this.dialogVisible = true;
      this.setUserType = type;
      if (data) {
        const orgId = data.orgId ? [...data.orgId] : [];
        const parentId = orgId.reverse();
        this.groupForm = Object.assign({}, data, { tenantName: this.userInfo.tenantName, parentId });
      }
    },
    submit() {
      this.$refs['userRef'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.groupForm, { parentId: this.groupForm.parentId[this.groupForm.parentId.length - 1] });
          this.submitLoading = true;
          const handelFn = this.setUserType === 'add' ? addUserGroup : editUserGroup;
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
      Object.assign(this.userObj, data);
      this.addUserList = [{ userName: '', owner: 1, id: null }];
      this.searchNameFn();
      this.addUserVisible = true;
    },
    handleClose() {
      this.groupForm = resetForm();
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
      return getGroupPage(params)
        .then(res => {
          const data = res.data;
          this.total = data.total;
          this.tableData = data.list;
        })
        .finally(() => {
          this.loading = false;
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
          deleteUserGroup({ id }).then(data => {
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
}
.tool {
  display: flex;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 10px;
  .searchName {
    width: 50%;
  }
}
.liEle {
  list-style: none;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  .leader_radio {
    margin: 0 10px 0 20px;
  }
  .labelEle {
    display: inline-block;
    width: 70px;
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
</style>
