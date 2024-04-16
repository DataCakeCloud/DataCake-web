<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">授权记录</div>
      </div>
    </div>
    <div class="detial-box">
      <div class="search">
        <div class="search-item">
          <span class="label">被授权用户组: </span>
          <el-select v-model="params.userGroup" collapse-tags placeholder="请选择" clearable filterable @change="getList">
            <el-option v-for="item in groupOptions" :key="item.uuid" :label="item.name" :value="item.name"> </el-option>
          </el-select>
        </div>
        <div class="search-item">
          <span class="label">被授权类型: </span>
          <el-select v-model="params.typeList" multiple collapse-tags placeholder="请选择" clearable>
            <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </div>
        <div class="search-btn">
          <el-button type="primary" @click="getList">查询</el-button>
        </div>
      </div>
      <el-table ref="perTable" v-loading="loading" :data="visiteList" row-key="permissionTableId" class="table-box" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="35" :reserve-selection="true" :selectable="checkBox"></el-table-column>
        <el-table-column v-for="(item, key) in columnData" :key="key" :prop="item.prop" :label="item.label" :min-width="item.width">
          <template slot-scope="scope">
            <template v-if="item.prop === 'privilegeList'">
              <el-tag v-for="tag in scope.row[item.prop]" :key="tag">{{ tag }}</el-tag>
            </template>
            <template v-else>
              <el-tooltip :content="`${scope.row[item.prop]}`" :disabled="isTipDisabled">
                <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row[item.prop] || '-' }}</span>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" :disabled="!!scope.row.recoveryState" @click="handelRemove(scope.row)">{{ scope.row.recoveryState ? '已回收' : '权限回收' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <div class="footer-lf">
          <div class="batch">
            <i :class="['el-icon-menu', 'icon', { cancel: batchType }]"></i>
            <span v-show="!batchType" class="btn-text" @click="batchType = true">批量操作</span>
            <span v-show="batchType" class="btn-text cancel" @click="handelBranch(false)">取消批量操作</span>
            <el-button v-if="batchType" type="primary" @click="handelBranch(true)">批量回收</el-button>
          </div>
        </div>
        <el-pagination class="pagination" :page-sizes="[10, 20, 50, 100]" :current-page="params.pageNum" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { tablePrivilegeInfoPages, revokePrivilegeFromRole, bathRevokePrivilegeFromRole } from '@/api/metadata';

export default {
  name: 'Permission',
  props: {
    groupOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      route: this.$route.query || {},
      typeList: ['查询数据', '修改表', '删除表', '描述表', '插入数据'],
      batchType: false,
      columnData: [
        {
          prop: 'certigier',
          label: '授权人',
          width: '80'
        },
        {
          prop: 'userGroup',
          label: '被授权用户组',
          width: '110'
        },
        {
          prop: 'privilegeList',
          label: '被授权类型',
          width: '230'
        },
        {
          prop: 'cycle',
          label: '权限保留周期',
          width: '80'
        },
        {
          prop: 'reason',
          label: '申请原因',
          width: '110'
        },
        {
          prop: 'requestTime',
          label: '授权时间',
          width: '110'
        }
      ],
      visiteList: [],
      total: 0,
      params: {
        userGroup: '',
        typeList: [],
        pageSize: 20,
        pageNum: 1
      },
      loading: false,
      isTipDisabled: true,
      multipleSelection: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkBox(row) {
      return row.recoveryState === 0;
    },
    handelBranch(type) {
      if (type) {
        if (!this.multipleSelection.length) {
          this.$message.warning('请选择要回收的权限');
          return;
        }
        const params = this.multipleSelection.map(item => {
          return {
            permissionTableId: item.permissionTableId,
            roleName: item.userId,
            roleInputs: [
              {
                operation: item.privilegeList || [],
                objectType: 'TABLE',
                objectName: [`${this.route.region}.${this.route.databaseName}.${this.route.tableName}`]
              }
            ]
          };
        });
        bathRevokePrivilegeFromRole(params).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功');
            this.$refs.perTable?.clearSelection();
            this.batchType = false;
            this.getList();
          } else {
            this.$message.warning('操作失败');
          }
        });
      } else {
        this.batchType = type;
        this.$refs.perTable?.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handelRemove(data) {
      this.$confirm('确定要回收此用户对该表的所有权限吗？确定后，用户将不再具备该表的任何权限。你还要继续吗？', '权限回收提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          permissionTableId: data.permissionTableId,
          roleName: data.userId,
          roleInputs: [
            {
              operation: data.privilegeList || [],
              objectType: 'TABLE',
              objectName: [`${this.route.region}.${this.route.databaseName}.${this.route.tableName}`]
            }
          ]
        };
        revokePrivilegeFromRole(params).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功');
            this.getList();
          } else {
            this.$message.warning('操作失败');
          }
        });
      });
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.pageNum = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    getList() {
      this.loading = true;
      const params = {
        ...this.route,
        ...this.params
      };
      tablePrivilegeInfoPages(params)
        .then(res => {
          this.visiteList = res.data.list || [];
          this.total = res.data.total || 0;
        })
        .finally(_ => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
.detial-box {
  padding: 0 10px;
  .search {
    display: flex;
    .search-item {
      display: flex;
      align-items: center;
      margin-right: 10px;
      .label {
        margin-right: 5px;
        white-space: nowrap;
      }
    }
  }
  .table-box {
    margin-top: 10px;
    ::v-deep {
      .el-table__body-wrapper {
        height: calc(100vh - 288px);
        overflow: auto;
      }
    }
    .el-tag:not(:last-child) {
      margin-right: 5px;
      margin-bottom: 4px;
      transform: translateY(2px);
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    .footer-lf {
      .batch {
        .btn-text,
        .icon {
          color: #5b13f8;
        }
        .btn-text {
          cursor: pointer;
        }
        .cancel {
          color: #d1d7e6;
        }
      }
    }
    .pagination {
      padding: 0 !important;
      ::v-deep {
        .el-pagination__total {
          line-height: 35px;
        }
      }
    }
  }
}
</style>
