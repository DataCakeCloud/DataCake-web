<template>
  <el-card class="feedback-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="提交人">
        <el-input v-model.trim="params.createBy" class="search-box" placeholder="请输入提交人" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <search-condition label="问题类型">
        <el-select v-model="params.type" class="search-box" placeholder="请选择问题类型" clearable>
          <el-option label="任务" value="任务"></el-option>
          <el-option label="交互" value="交互"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="data" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column label="附件" min-width="200">
          <template slot-scope="scope">
            <span v-if="scope.row.attachmentList.length === 0"> - </span>
            <template v-else>
              <a v-for="item in scope.row.attachmentList" :key="item.id" class="attachment" @click="download(item.id)">{{ item.fileName }}</a>
            </template>
          </template>
        </el-table-column>
      </table-page>
    </div>
  </el-card>
</template>

<script>
// import SearchGroup from '@/components/SearchGroup';
// import SearchItem from '@/components/SearchItem';
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { getFeedbackList } from '@/api/feedback.js';

export default {
  components: {
    // SearchGroup,
    // SearchItem,
    SearchCondition,
    TablePage
  },
  data() {
    return {
      params: {
        // appName: 'DataCake',
        createBy: '',
        type: '',
        pageNum: 1,
        pageSize: 10
      },
      loading: false,
      data: [],
      keyWordResults: [],
      columnData: [
        {
          prop: 'createBy',
          label: '提交人',
          width: '100'
        },
        {
          prop: 'type',
          label: '问题类型',
          width: '100'
        },
        {
          prop: 'description',
          label: '问题描述',
          width: '150',
          tooltip: true
        },
        {
          prop: 'createTime',
          label: '提交时间',
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        }
      ],
      total: 0
    };
  },
  created() {
    this.getList();
  },
  methods: {
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = true;
      Object.keys(this.params).forEach(item => {
        if (!this.params[item]) delete this.params[item];
      });
      getFeedbackList(this.params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    download(id) {
      const url = process.env.VUE_APP_API_GATEWAY_PATH + `ds_task/attachment/download?id=${id}`;
      window.location.href = url;
      return;
    }
  }
};
</script>
<style lang="scss" scoped>
.feedback-list {
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
    .attachment {
      margin-right: 10px;
    }
  }
}
</style>
