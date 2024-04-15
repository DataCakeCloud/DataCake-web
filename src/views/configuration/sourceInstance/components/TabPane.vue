<!--  chenyh1 -->
<template>
  <el-card class="box-card-container">
    <!-- 查询条件 -->
    <div class="search-condition-wrap">
      <div class="search-group">
        <search-item :span="8" width="120px" label="数据源名称" class="custom-search">
          <el-input v-model="params.name" placeholder="请输入数据源名称" clearable> </el-input>
        </search-item>
        <search-item :span="8" width="120px" label="数据源类型" class="custom-search time-ele">
          <el-input v-model="params.sourceName" placeholder="请输入数据源类型" clearable> </el-input>
        </search-item>
        <!-- <search-item :span="7" width="120px" label="区域" class="custom-search time-ele last-ele area-ele">
          <el-select v-model="params.region" placeholder="请选择区域" clearable class="search-input" @change="regionSelect">
            <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </search-item> -->
        <search-item v-show="isShowAll" :span="8" width="120px" label="创建时间" class="custom-search time-ele">
          <el-date-picker v-model="params.createDate" type="date" placeholder="创建时间" value-format="yyyy-MM-dd" :picker-options="pickerOptions"> </el-date-picker>
        </search-item>
        <search-item v-show="isShowAll" :span="8" width="120px" label="更新时间" class="custom-search time-ele">
          <el-date-picker v-model="params.updateDate" type="date" placeholder="更新时间" value-format="yyyy-MM-dd" :picker-options="pickerOptions"> </el-date-picker>
        </search-item>
        <search-item v-show="isShowAll" :span="8" width="120px" label="创建人" class="custom-search time-ele last-ele">
          <el-select v-model="params.createBy" placeholder="请输入负责人" clearable filterable remote :remote-method="remoteMethod" :loading="ownerLoading" class="search-input" popper-class="custom-popper">
            <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
              <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
            </el-option>
          </el-select>
        </search-item>
        <search-item :span="8" width="0px" class="custom-search btns">
          <div v-show="isShowAll" class="btn-search">
            <el-button type="primary" size="small" icon="el-icon-search" @click="search"></el-button>
            <el-button size="small" @click="resetParamsFn">重置</el-button>
          </div>
          <div class="add-btn">
            <el-button type="primary" size="small" @click="toDetail">添加数据源</el-button>
            <el-button type="text" size="mini" style="margin-left: 0; min-width: auto" @click="isShowAll = !isShowAll">
              {{ text }}
              <i :class="isShowAll ? 'el-icon-arrow-down ' : 'el-icon-arrow-right'"></i>
            </el-button>
          </div>
        </search-item>
      </div>
    </div>
    <!-- 表格 -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="tableData" style="width: 100%" :default-sort="{ prop: 'createTime', order: 'descending' }" @sort-change="changeGateSort">
        <el-table-column type="index" :index="indexMethod" label="序号" width="70" align="center"></el-table-column>
        <el-table-column label="数据源名称" prop="name" sortable min-width="120" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="toDetail(scope.row, 'look')">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="数据源类型" min-width="120" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <div class="name-col">
              <div class="img-box">
                <el-image :src="scope.row[`${activeName}Icon`]" fit="fill">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </div>
              <div class="text-content">
                <span class="name-cont">{{ scope.row.sourceName }}</span>
                <span>({{ scope.row[`${activeName}ReleaseStage`] }})</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="region" label="区域" show-overflow-tooltip align="center">
          <template slot-scope="scope">{{ regionText(scope.row.region) }}</template>
        </el-table-column> -->
        <el-table-column prop="createBy" label="创建人" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="updateBy" label="更新人" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable min-width="90" show-overflow-tooltip>
          <template slot-scope="scope">{{ $utils.parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable min-width="90" show-overflow-tooltip>
          <template slot-scope="scope">{{ $utils.parseTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="120px" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="toDetail(scope.row)">编辑</el-button>
            <!-- <el-button size="mini" type="text" :disabled="!scope.row.edit" @click="showPermission(scope.row)">授权</el-button> -->
            <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="changePage"> </el-pagination>
    </div>
    <el-dialog :visible.sync="permissionVisible" width="40%">
      <span slot="title" style="font-weight: 500; font-size: 16px">
        权限设置
        <el-tooltip class="item" effect="dark" content="您可以指定该数据源对哪些用户/用户组可见，但这并不意味着该用户/用户组具有数据源下的库、表权限，最终由数据源的账号权限决定。" placement="top"> <i class="el-icon-info" style="cursor: pointer"></i> </el-tooltip>
      </span>
      <div>
        <el-button type="primary" class="btnEle" @click="handelAddGroup">添加用户组</el-button>
        <el-table v-loading="permissionLoading" :data="userTable" style="margin-top: 10px" max-height="350px">
          <el-table-column prop="shareId" label="用户组">
            <template slot-scope="{ row }">
              {{ row.type === 1 ? row.shareId : row.name }}
            </template>
          </el-table-column>
          <el-table-column label="赋予权限" align="center" min-width="250px">
            <template slot-scope="{ row }">
              <el-checkbox-group v-model="row.actorPrivileges">
                <el-checkbox v-for="item in permissionTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" class="global-color-cb" @click="deleteUser(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer permission-dialog">
        <el-button @click="permissionVisible = false">取 消</el-button>
        <el-button :disabled="savePermissionLoading" type="primary" @click="savePermission">
          <i v-if="savePermissionLoading" class="el-icon-loading"></i>
          保 存
        </el-button>
      </span>
    </el-dialog>
    <!-- 添加用户组 -->
    <el-dialog title="添加用户组" center :visible.sync="addGroupVisible" width="450px" @close="() => (userGroupIds = [])">
      <div>
        <span class="labelEle">用户组名称</span>
        <el-select v-model="userGroupIds" placeholder="请选择用户组" multiple clearable>
          <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer permission-dialog">
        <el-button @click="addGroupVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addUserLoading" @click="addUserBtn">增 加</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex';
import SearchItem from '@/components/SearchItem';
// import * as tools from '@/utils/tools';
import { getUserList } from '@/api/task';
import { listGet } from '@/api/connector.js';
import { pageGet, deleteGet, getAuthEdit, listUserGroup, saveUserGroup } from '@/api/sourceInstance.js';
import { getGroupPage } from '@/api/jurisdiction';
const resetParams = () => {
  return {
    pageNum: 1,
    pageSize: 10,
    sourceDefinitionId: '', // 数据 source 定义ID
    sourceId: '', // 数据源实例ID
    name: '', // 数据源实例名称
    sourceName: '', // 数据源类型
    createDate: '',
    updateDate: '',
    createBy: '',
    region: '', // 区域
    sortKey: 'createTime',
    sortOrder: 'desc'
  };
};
export default {
  components: {
    SearchItem
    // detail
  },
  props: {
    activeName: {
      type: String,
      default: 'source'
    }
  },
  data() {
    return {
      permissionTypeList: [
        {
          label: '使用',
          value: 'DESC CATALOG'
        },
        {
          label: '编辑',
          value: 'ALTER CATALOG'
        },
        {
          label: '删除',
          value: 'DROP CATALOG'
        }
      ],
      props: { multiple: true, value: 'id', label: 'name' },
      actorId: '',
      userTable: [],
      groupOptions: [],
      userGroupIds: [],
      addUserLoading: false,
      addGroupLoading: false,
      // regionList: tools.regionList,
      addGroupVisible: false,
      permissionVisible: false,
      permissionLoading: false,
      savePermissionLoading: false,
      optionList: [],
      isShowAll: true,
      ownerLoading: false,
      ownerList: [],
      params: resetParams(),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      total: 0,
      tableData: [],
      loading: false,
      model: null,
      fileList: []
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdmin', 'currentUserGroup']),
    rightWidth() {
      if (this.isOpen) {
        return 'calc(100% - 225px)';
      } else {
        return 'calc(100% - 10px)';
      }
    },
    text() {
      if (this.isShowAll) {
        return '收起';
      } else {
        return '展开';
      }
    }
    // regionText() {
    //   return val => {
    //     if (Array.isArray(this.regionList)) {
    //       return this.regionList.find(row => row.value === val)?.label;
    //     }
    //   };
    // }
  },
  watch: {
    activeName(newVal, oldVal) {
      this.getDataSourceByPage();
    },
    permissionVisible(val) {
      if (val) {
        this.getUserList();
      }
    }
  },
  created() {
    // tools.regionList.then(res => {
    //   this.regionList = res;
    // });
    // 数据源类型
    this.getDataSourceByPage();
    document.addEventListener('keyup', this.keyUpEnter);
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.keyUpEnter);
  },
  methods: {
    handelAddGroup() {
      this.addGroupVisible = true;
      this.getGroupPage();
    },
    keyUpEnter(e) {
      if (e.keyCode === 13) {
        this.search();
      }
    },
    // regionSelect() {
    //   this.search();
    // },
    addUserBtn() {
      if (!this.userGroupIds.length) {
        this.$message({
          type: 'warning',
          message: '请选择用户组'
        });
        return;
      }
      const currentGroup = [];
      this.groupOptions.forEach(item => {
        if (this.userGroupIds.includes(item.id)) {
          currentGroup.push(item);
        }
      });
      const once = this.userTable.map(({ id }) => id).some(id => !!currentGroup.find(v => v.id === id));
      if (once) {
        this.$message({
          type: 'warning',
          message: '选择的用户组存在已有的列表中'
        });
        return;
      }
      this.userTable.push(...currentGroup);
      this.addGroupVisible = false;
    },
    getUserList() {
      this.userTable = [];
      this.permissionLoading = true;
      const params = {
        id: this.actorId
      };
      listUserGroup(params)
        .then(data => {
          this.userTable = data.data;
        })
        .finally(() => {
          this.permissionLoading = false;
        });
    },
    savePermission() {
      this.savePermissionLoading = true;
      const params = {
        id: this.actorId,
        userGroupVoList: this.userTable
      };
      saveUserGroup(params)
        .then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功');
            this.permissionVisible = false;
          }
        })
        .finally(() => {
          this.savePermissionLoading = false;
        });
    },
    deleteUser(index) {
      this.userTable.splice(index, 1);
    },
    getGroupPage() {
      const { userGroup = [], roles } = this.userInfo || {};
      if (!roles.includes('admin')) {
        this.groupOptions = userGroup.map(item => {
          return {
            ...item,
            actorPrivileges: []
          };
        });
        return;
      }
      const params = {
        tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
    },
    async showPermission(row) {
      this.actorId = row.sourceId;
      this.permissionVisible = true;
    },
    changeGateSort(val) {
      const { order, prop } = val;
      this.params.sortKey = prop;
      this.params.sortOrder = order === 'descending' ? 'desc' : 'asc';
      this.search();
    },
    getDataSourceByPage() {
      const params = { ...this.params };
      if (params.sourceName && this.activeName === 'destination') {
        params[`${this.activeName}Name`] = params.sourceName;
        params.sourceName = '';
      }
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });

      this.loading = true;
      pageGet(params, this.activeName)
        .then(async res => {
          const data = res.data;
          this.total = data.total;
          // this.tableData = await this.premissionBtn(data.list);
          this.tableData = data.list;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // async premissionBtn(data = []) {
    //   if (this.isAdmin) {
    //     data.forEach(item => {
    //       item.delete = true;
    //       item.edit = true;
    //     });
    //   } else {
    //     const ids = data.map(({ sourceId }) => sourceId);
    //     ids.length &&
    //       (await getAuthEdit({ id: ids.join() }).then(res => {
    //         const perDataList = res.data || {};
    //         data.forEach(item => {
    //           const perData = perDataList[item.sourceId] || {};
    //           Object.assign(item, perData);
    //         });
    //       }));
    //   }
    //   return data;
    // },
    // 分页器的改变
    handleSizeChange(val) {
      this.params.pageNum = 1;
      this.params.pageSize = val;
      this.getDataSourceByPage();
    },
    changePage(page) {
      this.params.pageNum = page;
      this.getDataSourceByPage();
    },
    // 重置
    resetParamsFn() {
      // this.params = resetParams();
      this.params.name = '';
      this.params.sourceName = '';
      this.params.region = '';
      this.params.createDate = '';
      this.params.updateDate = '';
      this.params.createBy = '';
    },
    // 搜索创建人
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          const data = res.data;
          this.ownerLoading = false;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    // 数据源类型
    async listGetFn() {
      const data = await (await listGet(this.activeName)).data;
      this.optionList = data.length > 0 ? data.map(item => ({ name: item.name, sourceDefinitionId: item.sourceDefinitionId })) : [];
    },
    async toDetail(row, operate = '') {
      const query = {
        activeName: this.activeName
      };
      if (row.sourceId) {
        if (operate) {
          query.operate = operate;
        }
        query.id = row[`${this.activeName}DefinitionId`];
        query.editId = row[`${this.activeName}Id`];
      }
      this.$router.push({
        path: '/config/sourceInstance/sourceDetail',
        query
      });
    },
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    search() {
      this.params.pageNum = 1;
      this.getDataSourceByPage();
    },
    handleDelete(row) {
      this.$confirm('确定删除此数据源?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            [`${this.activeName}Id`]: row[`${this.activeName}Id`]
          };
          this.loading = true;
          deleteGet(params, this.activeName)
            .then(res => {
              this.$message.success('删除成功');
              this.getDataSourceByPage();
            })
            .finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.box-card-container {
  // height: calc(100vh - 76px);
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    display: flex;
    align-items: flex-end;
    .btns {
      padding-left: 35px;
      .add-btn {
        float: right;
      }
      .btn-search {
        float: left;
        margin-right: 10px;
      }
    }
    .custom-search {
      ::v-deep .search-item {
        margin-bottom: 0;
        margin-top: 5px;
        .label {
          width: 60px;
        }
      }
    }
    .search-input {
      width: 100% !important;
      // max-width: 250px;
      &.table {
        width: calc(50% - 80px) !important;
      }
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  .online-switch {
    ::v-deep .el-switch__core::after {
      background: #fff !important;
    }
  }
  .data-form {
    ::v-deep .el-upload__tip {
      margin-top: 2px;
      line-height: 15px;
    }
  }
  .search-time-item {
    ::v-deep .el-date-editor {
      width: 99%;
    }
  }
  .time-ele {
    ::v-deep .el-input {
      width: 100%;
    }
    ::v-deep .el-select {
      width: 100%;
    }
  }
  .last-ele {
    ::v-deep .label {
      min-width: 60px !important;
    }
  }
  .name-col {
    display: flex;
    align-items: center;
    width: 100px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    .text-content {
      width: calc(100% - 35px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .img-box {
      height: 30px;
      width: 30px;
      min-width: 30px;
      min-height: 30px;
      max-width: 30px;
      max-height: 30px;
      // overflow: hidden;
      ::v-deep .el-icon-picture-outline:before {
        font-size: $global-font-size-30;
      }
      ::v-deep .el-image {
        height: 100%;
        width: 100%;
      }
      ::v-deep .el-image__inner {
        height: 100%;
        width: 100%;
        // object-fit: fill;
      }
    }
    .name-cont {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
.permission-ipt {
  margin-top: 10px;
  display: flex;
  .ipt {
    width: 60%;
    margin-right: 10px;
  }
}
.permission-dialog {
  display: flex;
  justify-content: end;
}
</style>
