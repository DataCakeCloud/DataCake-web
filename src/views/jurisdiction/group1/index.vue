<template>
  <el-card class="group-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="用户组名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入用户组名称" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="create">新建用户组</el-button>
    </div>
    <div class="table-wrap">
      <el-table ref="lazyTable" v-loading="loading" :data="tableData" lazy :load="load" highlight-current-row border header-row-class-name="custom-table-head" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column label="用户组名称" prop="name" align="left" min-width="200px" fixed show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column label="用户组 ID" prop="groupId" align="center" min-width="110px"> </el-table-column>
        <el-table-column label="用户组层级" prop="hierarchy" align="center" min-width="120px"> </el-table-column>
        <el-table-column label="父节点 ID" prop="parentId" align="center" min-width="110px">
          <template slot-scope="scope">
            <span class="cell-ellipsis">{{ scope.row.parentId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ID" prop="parentId" align="center" min-width="110px">
          <template slot-scope="scope">
            <span class="cell-ellipsis">{{ scope.row.id }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间" prop="createTime" align="center" min-width="100px">
          <template slot-scope="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="关联用户数" prop="userSize" align="center" min-width="120px"> </el-table-column>
        <el-table-column label="创建人" prop="createBy" align="center"> </el-table-column>
        <el-table-column label="是否是 Leader" prop="isLeaderFlag" align="center" min-width="120px"></el-table-column>
        <el-table-column label="操作人" prop="createBy" align="center"> </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" min-width="120px">
          <template slot-scope="scope">
            <el-button v-if="scope.row.type === 0" type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.type === 0" type="text" @click="handleAdd(scope.row)">添加子组</el-button>
            <el-button v-if="scope.row.type === 0" type="text" @click="groupDetail(scope.row)">添加/移除用户</el-button>
            <el-popconfirm v-if="scope.row.type === 0" title="确认删除吗？" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row)">
              <el-button slot="reference" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <win-add-group ref="addGroup" :current-selection="currentSelection" @updateList="updateList"></win-add-group>
    <win-group-detail ref="winGroupDetail" @updateList="updateList"></win-group-detail>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import WinAddGroup from './components/WinAddGroup';
import WinGroupDetail from './components/WinGroupDetail';
import { getGroupList, deleteGroup, organization, childrenGroup } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
import { parseTime } from '@/utils/';
export default {
  components: {
    SearchCondition,
    WinAddGroup,
    WinGroupDetail
  },
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      params: {
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      currentSelection: {},
      cacheTreeData: {}
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    this.organization();
  },
  mounted() {
    this.store = this.$refs.lazyTable.store;
  },
  methods: {
    getTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}');
    },
    organization() {
      this.loading = true;
      const params = {
        userId: this.userInfo.id
      };

      organization(params).then(res => {
        this.loading = false;
        const data = res.data;
        // this.tableData = data;
        this.tableData = data.filter(item => {
          return item.createBy === this.userInfo.userId;
        });
      });
    },
    getChildren(id, hierarchy, tree, treeNode, resolve) {
      childrenGroup({ id, hierarchy }).then(res => {
        const data = res.data;
        if (data && data.length > 0) {
          const arr = [...data];
          for (let i = 0; i < arr.length; i++) {
            arr[i]['length'] = arr.length;
            arr[i]['treeNode'] = treeNode;
            arr[i]['resolve'] = resolve;
          }
          this.$nextTick(_ => {
            resolve(arr);
          });
          this.currentSelection = Object.assign({}, tree, {
            treeNode: treeNode,
            resolve: resolve
          });
        } else {
          treeNode.children = [];
          treeNode.level = '';
          treeNode.display = false;
          treeNode.expanded = false;
          treeNode.loading = false;
          tree.hasChildren = false;

          this.currentSelection = Object.assign({}, tree, {
            treeNode: treeNode,
            resolve: resolve
          });
        }
      });
    },
    load(tree, treeNode, resolve) {
      const id = tree.id;
      const hierarchy = tree.hierarchy;

      this.$refs.lazyTable.setCurrentRow(tree);
      // 缓存当前展开信息
      this.cacheTreeData = Object.assign({}, this.cacheTreeData, {
        [tree.id]: {
          treeNode,
          resolve
        }
      });
      this.getChildren(id, hierarchy, tree, treeNode, resolve);
    },
    handleAdd(row) {
      // if (Object.keys(this.cacheTreeData).length && !this.cacheTreeData[row.id]) {
      //   this.$message({
      //     type: 'warning',
      //     message: '请在当前选中行添加子组'
      //   });
      //   return;
      // }
      this.currentSelection = Object.assign({}, this.currentSelection, row);
      this.$nextTick(_ => {
        this.$refs.addGroup.showWin();
      });
    },
    handleEdit(row) {
      // if (!this.cacheTreeData[row]) {
      //   this.$message({
      //     type: 'warning',
      //     message: '请在当前选中行添加子组'
      //   });
      //   return;
      // }
      if (row.parentId) {
        this.currentSelection = Object.assign({}, this.currentSelection, row);
      } else {
        this.currentSelection = Object.assign({}, this.currentSelection, row, { parentId: null });
      }
      this.$nextTick(_ => {
        this.$refs.addGroup.showWin(row);
      });
    },
    handleDelete(row) {
      const obj = Object.assign({}, row);
      deleteGroup({ id: row.id }).then(data => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        if (!row.parentId) {
          // 更新根组树
          const parent = this.store.states.data;
          const index = parent.findIndex(child => child.id === row.id);
          parent.splice(index, 1);
        } else {
          // 手动展开的
          if (obj.resolve) {
            if (row.length === 1) {
              const parent = this.store.states.lazyTreeNodeMap[row.parentId];
              const index = parent.findIndex(child => child.id === row.id);
              parent.splice(index, 1);
            }
            obj.id = obj.parentId;
            obj.hierarchy = obj.hierarchy - 1;
            this.load(obj, obj.treeNode, obj.resolve);
          } else {
            if (row.length === 1) {
              const parent = this.store.states.lazyTreeNodeMap[row.parentId];
              const index = parent.findIndex(child => child.id === row.id);
              parent.splice(index, 1);
              delete this.store.states.treeData[row.id];
            }

            this.refreshLazyRows(row.parentId, row.hierarchy - 1);
          }
        }
      });
    },
    getList() {
      this.loading = true;
      const params = Object.assign({}, this.params, {
        userId: this.userInfo.id,
        tenantId: this.userInfo.tenantId
      });
      getGroupList(params).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.total;
        // this.tableData = data.list;
        this.tableData = data.filter(item => {
          return item.createBy === this.userInfo.userId;
        });
      });
    },
    updateList(item) {
      if (!this.currentSelection.id) {
        // 更新根组树, states.data中有了数据后，会自动缓存到 treeData 中。
        this.store.states.data.push(item);
      } else {
        // 更新子树, 点开过就有 resolve
        if (this.currentSelection.resolve) {
          try {
            const id = this.currentSelection.id;
            this.load(this.currentSelection, this.cacheTreeData[id].treeNode, this.cacheTreeData[id].resolve);
            // 点开后，没有子级的话，添加后需要手动缓存一下。
            this.store.states.treeData[this.currentSelection.id] = this.currentSelection.treeNode;
            if (!this.currentSelection.hasChildren) this.currentSelection.hasChildren = true;
          } catch (e) {
            this.$refs.lazyTable.doLayout();
          }
        } else {
          // 给自动添加的缓存 treeNode
          this.store.states.treeData[this.currentSelection.id] = {
            display: true,
            loading: false,
            loaded: false,
            expanded: false,
            children: [],
            lazy: true,
            level: 0
          };
          this.refreshLazyRows(this.currentSelection.id, this.currentSelection.hierarchy);
        }
      }
    },
    refreshLazyRows(id, hierarchy) {
      this.store.states.treeData[id].loading = true;
      childrenGroup({ id, hierarchy }).then(res => {
        const data = res.data;
        this.store.states.treeData[id].loading = false;
        if (data && data.length > 0) {
          const result = data.map(e => {
            const obj = {
              ...e,
              length: data.length,
              treeNode: {
                display: true,
                loading: true,
                loaded: false,
                expanded: true,
                children: [],
                lazy: true,
                level: 0
              }
            };
            return obj;
          });
          data.forEach(e => {
            this.store.$set(this.store.states.treeData, e.id, {
              display: true,
              loading: false,
              loaded: false,
              expanded: false,
              children: [],
              lazy: true,
              level: 0
            });
          });
          const parentTreeNode = this.store.states.treeData[id];
          this.addLazyTableItemToParent(parentTreeNode, id, result);
        } else {
          this.store.states.treeData[id].expanded = false;
        }
      });
    },
    addLazyTableItemToParent(parentTreeNode, parentId, newItemData) {
      if (parentTreeNode) {
        this.store.states.treeData[parentId].expanded = true;
      }
      this.store.$set(this.store.states.lazyTreeNodeMap, parentId, newItemData);
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    create() {
      this.currentSelection = { tenantId: this.userInfo.tenantId, id: null };
      this.$nextTick(_ => {
        this.$refs.addGroup.showWin();
      });
    },
    groupDetail(row) {
      // if (Object.keys(this.cacheTreeData).length && !this.cacheTreeData[row.id]) {
      //   this.$message({
      //     type: 'warning',
      //     message: '请在当前选中行添加子组'
      //   });
      //   return;
      // }
      this.currentSelection = Object.assign({}, this.currentSelection, row);
      this.$nextTick(_ => {
        this.$refs.winGroupDetail.showWin(row);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.group-list {
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
