<template>
  <el-card class="artifact-list box-card-container">
    <div class="task-list">
      <div class="left-wrap transition" :class="{ 'left-close': !isOpen }">
        <div v-show="isOpen" class="tree">
          <el-tabs v-model="tabActiveName" type="border-card" class="border-card">
            <el-tab-pane name="文件夹" label="文件夹">
              <UseLazyTree v-if="tabActiveName === '文件夹'" module="ARTIFACT" @clickTreeItem="clickTreeItem" @treeSearch="treeSearch" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <div :class="['tree-arrow', { 'tree-arrow-close': !isOpen }]" @click="handleOpen">
          <i :class="['icon-arrow-tree', isOpen ? 'el-icon-arrow-left' : 'el-icon-arrow-right']"></i>
        </div>
      </div>
      <div ref="rightWrap" class="right-wrap">
        <div class="search-condition-wrap">
          <search-condition :label="$t('common.name')">
            <!-- <el-input v-model.trim="params.name" class="search-box" placeholder="工件名称" clearable @keyup.enter.native="search"></el-input> -->
            <el-autocomplete v-model.trim="params.name" class="search-box" popper-class="suggest-input" :fetch-suggestions="querySearch" value-key="name" placeholder="工件名称" :trigger-on-focus="false" clearable @keyup.enter.native="search"></el-autocomplete>
          </search-condition>
          <search-condition :label="$t('common.type')">
            <el-select v-model="params.typeCode" class="search-box" placeholder="选择类型" clearable>
              <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </search-condition>
          <search-condition label="创建人">
            <el-select
              v-model="params.createBy"
              placeholder="请输入创建人"
              class="search-box"
              clearable
              filterable
              allow-create
              default-first-option
              remote
              :remote-method="remoteMethod"
:loading="ownerLoading"
              popper-class="custom-popper"
              @change="changeCreateBy"
            >
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
                <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </search-condition>
          <el-button class="btn" type="primary" size="small" @click="search">查询</el-button>
          <el-button type="primary" class="create" @click="add">新建</el-button>
        </div>
        <div class="table-wrap">
          <table-page v-loading="loading" :table-data="data" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
            <el-table-column fixed="right" :label="$t('common.operation')" min-width="120">
              <template slot-scope="scope">
                <router-link :to="{ path: '/task/artifact/detail', query: { id: scope.row.id } }">{{ $t('common.edit') }}</router-link>
                <el-button type="text" class="global-color-cb" @click="deleteArtifact(scope.row.id)">{{ $t('common.delete') }}</el-button>
              </template>
            </el-table-column>
          </table-page>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
// import SearchGroup from '@/components/SearchGroup';
// import SearchItem from '@/components/SearchItem';
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { getArtifactPage, deleteArtifact, searchName } from '@/api/artifact.js';
import { getUserList } from '@/api/task';
import * as tools from '@/utils/tools';
import UseLazyTree from '@/components/useLazyTree';
export default {
  components: {
    // SearchGroup,
    // SearchItem,
    SearchCondition,
    TablePage,
    UseLazyTree
  },
  data() {
    let initIsOpen = true;
    if (sessionStorage.getItem('isOpen')) {
      initIsOpen = sessionStorage.getItem('isOpen') === 'true';
    }
    return {
      isOpen: initIsOpen,
      tabActiveName: '文件夹',
      params: {
        name: '',
        typeCode: '',
        createBy: '',
        pageNum: 1,
        pageSize: 10
      },
      typeList: [
        { label: 'ALL', value: '' },
        { label: 'JAR', value: 'JAR' },
        { label: 'JSON', value: 'JSON' },
        { label: 'CSV', value: 'CSV' },
        { label: 'shell', value: 'shell' },
        { label: 'python', value: 'python' },
        { label: 'proto', value: 'proto' }
      ],
      selectFolderId: '',
      ownerList: [],
      ownerLoading: false,
      loading: false,
      data: [],
      keyWordResults: [],
      regionList: [],
      columnData: [
        {
          prop: 'name',
          label: 'name',
          width: '150',
          link: row => {
            return {
              path: '/task/artifact/version',
              query: {
                id: row.id
              }
            };
          },
          tooltip: true
        },
        {
          prop: 'modeCode',
          label: '模式',
          width: '100'
        },
        {
          prop: 'typeCode',
          label: this.$t('common.type'),
          width: '100'
        },
        {
          prop: 'regionList',
          label: '区域',
          width: '150',
          format: row => {
            if (row.regionList) {
              const list = row.regionList.split(',');
              if (!this.regionList.length) return '';
              const arr = list.map(region => {
                const item = this.regionList.find(item => item.value === region);
                return item ? item['label'] : '';
              });
              if (arr.filter(e => e.legnth > 0).length) return '-';
              return arr.join('，');
            } else {
              return '-';
            }
          },
          tooltip: true
        },
        {
          prop: 'createBy',
          label: '创建人',
          width: '100'
        },
        {
          prop: 'createTime',
          label: this.$t('common.createTime'),
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          },
          sortable: true
        },
        {
          prop: 'updateTime',
          label: this.$t('common.updateTime'),
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.updateTime);
          },
          sortable: true
        }
      ],
      total: 0
    };
  },
  created() {
    const localCreateBy = localStorage.getItem('artifact_create_by');
    const createBy = localCreateBy === null ? this.$store.getters.userInfo.userId : localCreateBy;
    this.params.createBy = createBy;
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.getArtifactPage();
    this.contextMenuOption = {
      menuList: [
        {
          label: '关联文件',
          disabledFn: (event, node, data) => {
            // return this.folderList[0]?.id === data.id;
            return false;
          },
          onClick: this.linkTask
        },
        {
          label: '新建文件',
          disabledFn: (event, node, data) => {
            // return this.folderList[0]?.id === data.id;
            return false;
          },
          onClick: this.newTask
        }
      ],
      setMenu(menuList, event, node, data) {
        menuList.forEach((item, index) => {
          if (item.label === '移 动') {
            menuList.splice(index, 1);
          }
        });
        return menuList;
      }
    };
  },
  methods: {
    clickTreeItem(data, filterText) {
      // 获取点击的文件夹id
      if (!data.leaf) {
        this.selectFolderId = data.id;
        this.params.folderId = this.selectFolderId;
        this.params.fileName = filterText;
        this.params.id = '';
      } else {
        this.selectFolderId = '';
        this.params.folderId = this.selectFolderId;
        this.params.fileName = '';
        this.params.id = data.entityId;
      }
      this.search();
    },
    treeSearch() {
      this.search();
    },
    handleOpen() {
      this.isOpen = !this.isOpen;
      sessionStorage.setItem('isOpen', this.isOpen);
    },
    changeCreateBy(val) {
      localStorage.setItem('artifact_create_by', val);
    },
    search() {
      this.params.pageNum = 1;
      this.getArtifactPage();
    },
    reset() {
      this.params = {
        name: '',
        typeCode: '',
        pageNum: 1,
        pageSize: 10
      };
      this.getArtifactPage();
    },
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
    querySearch(queryString, cb) {
      searchName(queryString).then(res => {
        const data = res.data;
        if (data) {
          this.keyWordResults = data;
        } else {
          this.keyWordResults = [];
        }
        cb(this.keyWordResults);
      });
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getArtifactPage();
    },
    getArtifactPage() {
      this.loading = true;
      getArtifactPage(this.params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    deleteArtifact(id) {
      this.$confirm('确认删除此工件？').then(() => {
        deleteArtifact(id).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getArtifactPage();
        });
      });
    },
    add() {
      this.$router.push({ name: 'ArtifactDetail', query: { folderId: this.selectFolderId }});
    }
  }
};
</script>
<style lang="scss" scoped>
.artifact-list {
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
.task-list {
  display: flex;
  .border-card {
    height: 100%;
    overflow: auto;
  }
  .left-wrap {
    position: relative;
    width: 250px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &.left-close {
      flex: 0 0 0;
      width: 0;
    }

    .header {
      height: 40px;
      padding: 0 15px;
    }
    .tree {
      padding: 8px;
      overflow-y: auto;
      height: calc(100vh - 48px);
      .box-card {
        margin-bottom: 15px;
        max-height: 42%;
        overflow-y: auto;
        &:last-child {
          margin-bottom: 0;
        }
        ::v-deep .el-card__header {
          padding: 6px 8px;
        }
        ::v-deep .el-card__body {
          padding: 6px;
          .item {
            margin: 2px;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 135px;
          }
        }
      }
    }
  }
  .tree-arrow {
    position: absolute;
    right: -25px;
    top: 50%;
    cursor: pointer;
    height: 56px;
    line-height: 56px;
    border-radius: 2px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 12px solid #f2f2f2;
    &:hover {
      transform: scale(1.1);
      transform-origin: left center;
      border-left: 12px solid #f0f0f0;
      .icon-arrow-tree {
        color: #c0c0c0;
      }
    }
    &.tree-arrow-close {
      top: 50%;
      right: -25px;
    }
    .icon-arrow-tree {
      position: relative;
      left: -12px;
      top: -10px;
      color: #c2c2c2;
    }
  }
  .right-wrap {
    padding: 10px 20px 0;
    flex: 1;
    overflow: auto;
    height: calc(100vh - 55px);
    .header {
      height: 26px;
      border-bottom: 1px solid #dcdfe6;
      margin-bottom: 10px;
      .can-click {
        ::v-deep .el-breadcrumb__inner {
          cursor: pointer;
          color: #10adf2;
        }
      }
    }
    .custom-table {
      ::v-deep .statusCol {
        .cell {
          & > span {
            display: inline-block;
            height: 100%;
            padding-top: 7px;
          }
        }
      }
      .el-icon-info {
        cursor: pointer;
      }
    }
    .table-icon {
      color: $c-primary;
    }
    .table-icon-red {
      color: $color-cb;
    }
    .search-condition-wrap {
      display: flex;
      align-items: flex-end;
      .search-group {
        flex: 1;
        margin-right: 70px;
      }
      .btns {
        width: 180px;
        margin-left: 30px;
      }
      .custom-search {
        margin: 3px 0;
        ::v-deep .search-item {
          margin-bottom: 0;
        }
      }
      .search-input {
        width: calc(100% - 80px) !important;
        max-width: 250px;
      }
    }
    ::v-deep .el-tabs.el-tabs--card.el-tabs--top {
      .el-tabs__content {
        padding: 15px 0 0;
        border: none;
      }
    }
    .check-content {
      position: relative;
    }
    .custom-checkbox {
      position: absolute;
      margin-left: 5px;
      ::v-deep .el-checkbox__label {
        padding-left: 5px;
      }
    }
    .custom-alert {
      margin-bottom: 0;
      padding: 4px 16px;
      .status-tag {
        font-size: $global-font-size-12;
        padding: 2px 6px;
        border-radius: 20px;
        background: #fff;
        color: #fff;
        cursor: pointer;
        &.online {
          color: #9270ca;
          border: 1px solid rgba(146, 112, 202, 0.8);
          &.active {
            background: rgba(146, 112, 202, 0.8);
          }
        }
        &.success {
          color: $color-cd;
          border: 1px solid $color-cd;
          &.active {
            background: $color-cd;
          }
        }
        &.failed {
          color: $color-cb;
          border: 1px solid $color-cb;
          &.active {
            background: $color-cb;
          }
        }
        &.canceled {
          color: $color-cc;
          border: 1px solid $color-cc;
          &.active {
            background: $color-cc;
          }
        }
        &.running {
          color: $c-primary;
          border: 1px solid $c-primary;
          &.active {
            background: $c-primary;
          }
        }
        &.active {
          color: #fff;
          font-size: $global-font-size-13;
        }
      }
    }
  }
  .status {
    color: #fff;
    background: #909399;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: $global-font-size-13;
  }
  .circle {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 4px;
    background: #dcdfe6;
  }
  .header-tip {
    position: absolute;
    top: 4px;
    right: 4px;
  }
  .online-switch {
    ::v-deep .el-switch__core::after {
      background: #fff !important;
    }
  }
}
.btn {
  margin-left: 15px;
}
</style>
