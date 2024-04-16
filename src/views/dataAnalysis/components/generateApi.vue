<template>
  <div class="warrp">
    <div class="search">
      <el-row class="flex-search">
        <div class="flex-item">
          <div class="label">名 称:</div>
          <el-input v-model="searchForm.title" class="condition-input" size="mini" placeholder="请输入API名称" clearable @keyup.enter.native="search"> </el-input>
        </div>
        <!-- <div  class="flex-item">
          <div class="label">API Path:</div>
          <el-input v-model="searchForm.path" class="condition-input" size="mini" placeholder="请输入API Path">
          </el-input>
        </div> -->
        <div class="flex-item">
          <div class="label">查 询:</div>
          <el-input v-model="searchForm.querySql" class="condition-input" size="mini" placeholder="请输入查询" clearable @keyup.enter.native="search"> </el-input>
        </div>
        <!-- <div  class="flex-item">
          <div class="label">参 数:</div>
          <el-input v-model="searchForm.param" class="condition-input" size="mini" placeholder="请输入参数">
          </el-input>
        </div> -->
        <!-- <div class="flex-item">
          <div class="label">创建人:</div>
          <el-select
            v-model="searchForm.createBy"
            size="mini"
            filterable
            class="condition-input"
            clearable
            placeholder="请输入创建人"
            :remote-method="
              query => {
                remoteMethod(query);
              }
            "
            remote
          >
            <el-option v-for="val in options" :key="val.value" :label="val.label" :value="val.value"> </el-option>
          </el-select>
        </div> -->
        <div class="flex-item">
          <div class="label">引 擎:</div>
          <el-select v-model="searchForm.engineZh" class="condition-input" placeholder="请选择引擎" size="mini" clearable @change="search">
            <el-option v-for="item in engineListAll" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </div>
        <div class="flex-item">
          <div class="label">状 态:</div>
          <el-select v-model="searchForm.status" class="condition-input" placeholder="请选择状态" size="mini" clearable @change="search">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </div>
      </el-row>
      <div class="reset_btn">
        <el-button size="mini" @click="resetSearch">重置</el-button>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
      </div>
    </div>
    <el-table ref="multipleTable" v-loading="loading" border class="multipleTable" :data="tableData" tooltip-effect="dark table_overflow_tootip" style="width: 100%" :cell-style="{ padding: '0px', height: '36px' }" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" :selectable="checkSelectable"></el-table-column>
      <el-table-column label="名称" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button class="tableName ellipsis" size="mini" type="text" @click="goQueryTab(scope.row)">{{ scope.row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="API Path">
        <template slot-scope="scope">
          <div class="content">
            <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="scope.row.path" placement="top" :enterable="false">
              <div class="title" @mouseenter="isShowTooltip">{{ scope.row.path }}</div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="复制" placement="top" :enterable="false">
              <i class="el-icon-document-copy" @click="copyPath(scope.row.path)"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-for="item in columnData" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" show-overflow-tooltip :formatter="formatter"></el-table-column>
      <el-table-column label="被调用次数" width="120">
        <template slot-scope="scope">
          <el-popover popper-class="apiListCount" placement="bottom" :visible-arrow="true" width="230" trigger="hover">
            <div class="context">
              <div v-for="item in scope.row.countInfo" :key="item.id">{{ `${item.createBy} ${$utils.parseTime(item.createTime, '{y}-{m}-{d} {h}:{i}:{s}')} 调用了API` }}</div>
            </div>
            <el-button slot="reference" type="text" :disabled="scope.row.countInfo.length === 0">{{ scope.row.countInfo.length }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="checkSql(scope.row)">查看</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.status === 0" @click="upLine(scope.row)">上线</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.status === 1" @click="downLine(scope.row)">下线</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <el-button type="danger" size="mini" :disabled="selectData.length <= 0" :loading="deleting" @click="deleteHandler">删除</el-button>
      <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>
    <el-dialog width="700px" :close-on-click-modal="false" :visible.sync="dialogVisible" @opened="openDialog">
      <div slot="title">
        SQL脚本<span style="color: #909399">(Query Engine: {{ formatterEngine(activeItem) || '-' }})</span>
      </div>
      <div style="height: 350px">
        <monaco-editor ref="showMonaco" v-model="activeItem.querySql" :read-only="true" render-line-highlight="all" :scroll-beyond-last-line="false"></monaco-editor>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import copy from 'copy-to-clipboard';
import { EventBus, EventType } from '@/utils/eventbus';
import { mapGetters } from 'vuex';
import { userList } from '@/api/jurisdiction';
import { getDataServiceApiList, dataServiceStatus, delDataServiceApi } from '@/api/querydata';
import MonacoEditor from '@/components/MonacoEditor/index';

export default {
  name: 'GenerateApi',
  components: {
    MonacoEditor
  },
  data() {
    return {
      dialogVisible: false,
      activeItem: {},
      tableData: [],
      deleting: false,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      searchForm: {
        title: '',
        path: '',
        querySql: '',
        param: '',
        createBy: '',
        status: '',
        engineZh: ''
      },
      options: [],
      selectData: [],
      total: 0,
      params: {
        pageNum: 1,
        pageSize: 30
      },
      statusOptions: [
        {
          label: '已上线',
          value: 0
        },
        {
          label: '已下线',
          value: 1
        }
      ],
      columnData: [
        {
          prop: 'querySql',
          label: '查询'
        },
        {
          prop: 'region',
          label: '区域',
          width: '100'
        },
        {
          prop: 'engineZh',
          label: '查询引擎',
          width: '140'
        },
        // {
        //   prop: 'param',
        //   label: '参数',
        //   width: '140'
        // },
        {
          prop: 'createBy',
          label: '创建人',
          width: '120'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '160'
        },
        {
          prop: 'status',
          label: '状态',
          width: '70'
        }
      ],
      loading: false,
      isTipDisabled: false
    };
  },
  computed: {
    ...mapGetters(['engineListAll', 'regionList'])
  },
  created() {
    this.search();
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    resetSearch() {
      this.searchForm.title = '';
      this.searchForm.path = '';
      this.searchForm.querySql = '';
      this.searchForm.param = '';
      this.searchForm.createBy = '';
      this.searchForm.status = '';
      this.searchForm.engineZh = '';
      this.params.pageNum = 1;
      this.params.pageSize = 30;
      this.search();
    },
    checkSelectable(row) {
      return row.status === 1;
    },
    upLine(data) {
      const { id } = data;
      dataServiceStatus({ id, status: 0 }).then(res => {
        this.$message({
          type: 'success',
          message: '上线成功'
        });
        this.search();
      });
    },
    downLine(data) {
      const { id } = data;
      dataServiceStatus({ id, status: 1 }).then(res => {
        this.$message({
          type: 'success',
          message: '下线成功'
        });
        this.search();
      });
    },
    copyPath(path) {
      copy(path, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: 'API路径已复制到剪贴板'
      });
    },
    checkSql(row) {
      this.activeItem = { ...row };
      this.dialogVisible = true;
    },
    openDialog() {
      this.$refs.showMonaco.setCode(this.activeItem.querySql);
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.search();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.search();
    },
    deleteHandler() {
      const selectData = this.$refs.multipleTable.selection || [];
      let idList = selectData.map(({ id }) => id);
      idList = idList.join(',');
      delDataServiceApi(idList).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        this.search();
      });
    },
    formatterEngine(row) {
      if (this.engineListAll.length <= 0) {
        return '';
      }
      const item = this.engineListAll.find(item => {
        return item.value === row.engine;
      });
      if (!item) {
        return '';
      }
      return item.label || '';
    },
    formatter(row, column, cellValue, index) {
      if (column.property === 'status') {
        return this.statusOptions.find(item => item.value === cellValue).label;
      } else if (['createTime', 'updateTime'].includes(column.property)) {
        return this.$utils.parseTime(cellValue, '{y}-{m}-{d} {h}:{i}:{s}');
      } else if (column.property === 'region') {
        return this.regionList.find(item => item.name === cellValue)?.name_zh;
      } else {
        return cellValue;
      }
    },
    async remoteMethod(query) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userList({ name: query, tenantId: this.tenantId })).data;
        this.loadingSelect = false;
        this.options = data.length > 0 ? data.map(item => ({ label: item.name, value: item.name })) : [];
      } else {
        this.options = [];
      }
    },
    goQueryTab(data) {
      EventBus.$emit(EventType.switchQueryTab, data);
    },
    handleSelectionChange(val) {
      this.selectData = val;
    },
    search() {
      this.loading = true;
      const searchForm = JSON.parse(JSON.stringify(this.searchForm));
      Object.keys(searchForm).forEach(key => {
        if (!searchForm[key]) delete searchForm[key];
        if (['path', 'querySql'].includes[key]) {
          searchForm[key] = searchForm[key].replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\{/g, '%7B').replace(/\}/g, '%7D').replace(/\\/g, '%5C');
        }
      });
      const data = {
        ...this.searchForm,
        ...this.params
      };
      getDataServiceApiList(data)
        .then(res => {
          this.tableData = res.data.list;
          this.total = res.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style scoped lang="scss">
.warrp {
  height: 100%;
  padding: 8px;
  padding-top: 0;
  .search {
    padding: 10px 0;
    padding-top: 0;
    position: relative;
    .flex-search {
      display: flex;
      flex-wrap: wrap;
      .flex-item {
        display: flex;
        align-items: center;
        margin-top: 10px;
        .condition-input {
          width: 160px !important;
          margin: 0 5px;
          .el-icon-search {
            margin-top: 6px;
            cursor: pointer;
          }
        }
        ::v-deep .el-input__inner {
          padding-left: 3px;
          padding-right: 20px;
        }
        .el-select {
          width: 100%;
        }
        .label {
          white-space: nowrap;
          // width: 80px;
          // min-width: 55px;
          // text-align: end;
          // margin-right: 5px;
          // font-size: $global-font-size-12;
        }
      }
    }
    .reset_btn {
      position: absolute;
      top: 10px;
      right: 5px;
    }
  }
  .el-table {
    border-left: 0;
    border-right: 0;
    ::v-deep .el-table__body-wrapper {
      height: calc(100vh - 220px);
      overflow: auto;
    }
    .title {
      width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      i {
        cursor: pointer;
      }
    }
    .tableName {
      display: inline-block;
      width: 120px;
      white-space: nowrap !important;
      text-align: start;
    }
  }
  .footer {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .el-pagination {
      padding: 0;
    }
  }
}
</style>
<style lang="scss">
.apiListCount {
  padding: 0;
  font-size: $global-font-size-12;
  .context {
    padding: 10px;
    max-height: 140px;
    overflow-y: auto;
  }
}
</style>
