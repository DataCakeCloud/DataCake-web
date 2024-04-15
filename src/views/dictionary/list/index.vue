<template>
  <el-card class="dict-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="字典类型">
        <el-select v-model="params.componentCode" class="search-box" placeholder="请选择字典类型" clearable>
          <el-option v-for="(value, key) in componentCodeList" :key="key" :label="value" :value="key"></el-option>
        </el-select>
      </search-condition>
      <search-condition label="创建人">
        <el-input v-model.trim="params.createBy" class="search-box" placeholder="请输入创建人" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <search-condition label="关键字">
        <!-- <el-input v-model.trim="params.keyword" class="search-box" placeholder="请输入字典名称、描述信息等" clearable @keyup.enter.native="search"></el-input> -->
        <el-autocomplete v-model.trim="params.keyword" class="search-box" popper-class="suggest-input" :fetch-suggestions="querySearch" value-key="name" placeholder="请输入字典名称、描述信息等" :trigger-on-focus="false" clearable @keyup.enter.native="search"></el-autocomplete>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="addDict">新建</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">修改</el-button>
            <el-button type="text" size="mini" class="table-btn-red" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <win-add-dict ref="winAddDict" :list="componentCodeList" @save="getList"></win-add-dict>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import WinAddDict from './components/WinAddDict';
import { getDictType, getDictPageList, deleteDict, searchName } from '@/api/dictionary'; // , deleteDict, updateDict

export default {
  components: {
    // SearchGroup,
    // SearchItem,
    SearchCondition,
    TablePage,
    WinAddDict
  },
  data() {
    return {
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'id',
          label: 'ID',
          width: '60'
        },
        {
          prop: 'componentCode',
          label: '字典类型',
          width: '120',
          format: row => {
            return this.componentCodeList[row.componentCode];
          }
        },
        {
          prop: 'chineseName',
          label: '中文名称',
          width: '150'
        },
        {
          prop: 'englishName',
          label: '英文名称',
          width: '150'
        },
        {
          prop: 'description',
          label: '描述',
          width: '180'
        },
        {
          prop: 'createBy',
          label: '创建人',
          width: '100'
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
          label: '更新人',
          width: '100'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.updateTime);
          }
        }
      ],
      total: 0,
      params: {
        componentCode: '',
        createBy: '',
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      componentCodeList: {},
      keyWordResults: []
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      getDictType().then(res => {
        const data = res.data;
        this.componentCodeList = data;
      });
      this.getList();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = true;
      getDictPageList(this.params).then(res => {
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
    addDict() {
      this.$refs.winAddDict.showWin();
    },
    edit(row) {
      this.$refs.winAddDict.showWin(row);
    },
    deleteData(row) {
      this.$confirm(`确定删除${row.chineseName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDict(row.id).then(data => {
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
.dict-list {
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
  .table-btn-red {
    color: $color-cb;
  }
}
</style>
