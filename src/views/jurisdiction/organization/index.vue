<template>
  <el-card class="tenant-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="组织架构名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入组织架构名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="getList">查询</el-button>
      <el-button type="primary" class="create" @click="addAndEdit('new')">新建</el-button>
    </div>
    <div class="table-wrap">
      <el-table ref="table" v-loading="loading" :data="tableData" highlight-current-row row-key="id" border lazy :load="load" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @expand-change="expandChange">
        <el-table-column label="组织架构名称" prop="name" align="left" min-width="150px" fixed show-overflow-tooltip> </el-table-column>
        <el-table-column label="组织架构描述" prop="description" align="center"> </el-table-column>
        <el-table-column label="创建人" prop="createBy" align="center"> </el-table-column>
        <el-table-column label="负责人" prop="director" align="center"> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" min-width="100px">
          <template slot-scope="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="owner标识" prop="isOwner" align="center" min-width="120px">
          <template slot-scope="scope">
            {{ scope.row.isOwner ? '是' : '-' }}
          </template>
        </el-table-column> -->
        <el-table-column label="操作人" prop="createBy" align="center"> </el-table-column>
        <el-table-column prop="address" label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="addAndEdit('edit', scope)">编辑</el-button>
            <el-button type="text" @click="addAndEdit('addItem', scope)">新建子组织</el-button>
            <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" title="确定删除此组织架构？" @confirm="deleteItem(scope)">
              <el-button slot="reference" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <add-edit-group :dialog-data="dialogData" @updateList="updateList"></add-edit-group>
  </el-card>
</template>
<script>
import { getGroupList, childrenGroup, deleteGroup } from '@/api/jurisdiction';
import SearchCondition from '@/components/SearchCondition';
import addEditGroup from './addEditGroup';
import { parseTime } from '@/utils/';
import { mapGetters } from 'vuex';
import { resolve } from '@antv/x6/lib/registry/router/manhattan/options';

export default {
  components: {
    SearchCondition,
    addEditGroup
  },
  data() {
    return {
      dialogData: {
        dialogVisible: false
      },
      loading: false,
      tableData: [],
      rowArr: [],
      total: 0,
      params: {
        name: '',
        pageNum: 1,
        pageSize: 1000
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    this.getList();
  },
  methods: {
    getTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}');
    },
    getList() {
      this.loading = true;
      const params = Object.assign({}, this.params, {
        userId: this.userInfo.id,
        tenantId: this.userInfo.tenantId
      });
      getGroupList(params)
        .then(res => {
          const data = res.data;
          this.loading = false;
          this.total = data.total;
          this.tableData = data.list;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    load(row, treeNode, resolve) {
      const id = row.id;
      const hierarchy = row.hierarchy;
      row.resolve = resolve;
      const hasItem = this.rowArr.find(item => {
        return item.id === row.id;
      });
      if (!hasItem) {
        this.rowArr.push(row);
      }
      childrenGroup({ id, hierarchy }).then(res => {
        resolve(res.data);
      });
    },
    expandChange(row, expanded) {
      // 记录某一行是否展开
      row.expanded = expanded;
    },
    addAndEdit(type, scope) {
      this.dialogData.dialogVisible = true;
      this.dialogData.type = type;
      if (scope) {
        this.dialogData.tableRow = scope.row;
        this.rowArr.map(item => {
          if (item.id === this.dialogData.tableRow.id) {
            this.dialogData.tableRow.expanded = item.expanded;
            this.dialogData.tableRow.resolve = item.resolve;
          }
        });
      }
    },
    updateList(item) {
      // 从前端展示添加表单项
      if (this.dialogData.type === 'new') {
        this.tableData.push(item);
      } else if (this.dialogData.type === 'addItem') {
        if (this.dialogData.tableRow.expanded) {
          // 父行展开时
          this.load(this.dialogData.tableRow, {}, this.dialogData.tableRow.resolve);
        } else {
          this.$refs.table.store.loadOrToggle(this.dialogData.tableRow); // 父行未展开时，进行展开
        }
      }
    },
    deleteItem(scope) {
      // 从前端展示删除表单项
      deleteGroup({ id: scope.row.id }).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        if (!scope.row.parentId) {
          // 删除一级目录
          this.tableData.splice(scope.$index, 1);
        } else {
          // 删除展开的子目录
          this.rowArr.map(item => {
            if (item.id === scope.row.parentId) {
              if (this.$refs.table.store.states.lazyTreeNodeMap[scope.row.parentId].length === 1) {
                this.$refs.table.store.loadOrToggle(item);
              } else {
                this.load(item, {}, item.resolve);
              }
            }
          });
        }
      });
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
}
</style>
