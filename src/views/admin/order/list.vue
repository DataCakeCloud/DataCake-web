<template>
  <el-card class="order-list box-card-container">
    <div class="search-condition-wrap">
      <div class="search-group">
        <search-condition label="工单编号" label-class="search-label">
          <el-input v-model.trim="params.feedbackId" class="search-box" placeholder="工单编号" clearable @keyup.enter.native="search"></el-input>
        </search-condition>
        <search-condition label="产品模块" label-class="search-label">
          <el-select v-model="params.module" class="search-box" placeholder="产品模块" clearable>
            <el-option v-for="item in moduleList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </search-condition>
        <search-condition label="问题分类" label-class="search-label">
          <el-select v-model="params.type" class="search-box" placeholder="问题分类" clearable>
            <el-option v-for="item in typeList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </search-condition>
        <search-condition label="提交时间" label-class="search-label">
          <el-date-picker v-model="timeRange" class="search-box" type="daterange" range-separator="至" start-placeholder="开始日" end-placeholder="结束日" value-format="yyyy-MM-dd" :picker-options="pickerOptions" style="width: 225px" @change="changeTime"></el-date-picker>
        </search-condition>
        <search-condition label="工单状态" label-class="search-label">
          <el-select v-model="params.status" class="search-box" placeholder="工单状态" clearable>
            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </search-condition>
        <search-condition label="提交人" label-class="search-label">
          <el-input v-model.trim="params.createBy" class="search-box" placeholder="提交人" clearable @keyup.enter.native="search"></el-input>
        </search-condition>
        <search-condition label="处理人" label-class="search-label">
          <el-input v-model.trim="params.handleBy" class="search-box" placeholder="处理人" clearable @keyup.enter.native="search"></el-input>
          <el-button type="primary" size="small" @click="search">查询</el-button>
          <el-button v-if="isAdmin" type="primary" size="small" @click="exportData">下载</el-button>
        </search-condition>
      </div>
      <div class="btns">
        <!-- <el-button type="text" size="mini" @click="openPro">常见问题参考</el-button> -->
        <el-button type="primary" size="small" class="create" plain @click="create">新建工单</el-button>
      </div>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="data" :column-data="columnData" :is-show-index="false" :table-height="'calc(100vh - 240px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="see(scope.row)">详情</el-button>
            <el-button v-if="isAdmin" type="text" size="mini" :disabled="['SOLVED', 'SCORED', 'ACCEPTED'].includes(scope.row.status)" @click="accept(scope.row)">受理</el-button>
            <el-button v-if="isAdmin" type="text" size="mini" :disabled="['SOLVED', 'SCORED'].includes(scope.row.status)" @click="transfer(scope.row)">转让</el-button>
            <el-button type="text" size="mini" :disabled="!scope.row.sendCloseFlag || (!isAdmin && scope.row.status !== 'UN_ACCEPT') || (isAdmin && ['SOLVED', 'SCORED'].includes(scope.row.status))" @click="close(scope.row)">关闭</el-button>
            <!-- <el-button v-if="canScore && scope.row.status === 'SOLVED'" type="text" size="mini" @click="score(scope.row)">评分</el-button> -->
          </template>
        </el-table-column>
      </table-page>
    </div>
    <win-see-order ref="seeOrder" @save="getList"></win-see-order>
    <win-transfer ref="transferOrder" @save="getList"></win-transfer>
    <win-close-order ref="closeOrder" @save="getList"></win-close-order>
    <win-score-order ref="scoreOrder" @save="getList"></win-score-order>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import WinSeeOrder from './components/WinSeeOrder';
import WinTransfer from './components/WinTransfer';
import WinCloseOrder from './components/WinCloseOrder';
import WinScoreOrder from './components/WinScoreOrder';
import { getFeedbackList, acceptFeedback, exportFeedback } from '@/api/feedback';
import { mapGetters } from 'vuex';

export default {
  components: {
    SearchCondition,
    TablePage,
    WinSeeOrder,
    WinTransfer,
    WinCloseOrder,
    WinScoreOrder
  },
  data() {
    return {
      params: {
        appName: 'ds-work',
        feedbackId: this.$route.query.feedbackId,
        status: '',
        module: '',
        type: '',
        createStartTime: '',
        createEndTime: '',
        createBy: '',
        handleBy: '',
        pageNum: 1,
        pageSize: 10
      },
      timeRange: [],
      moduleList: ['数据查询', '数据开发', '业务BI', '资源中心', '数据治理', '其他'],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      statusList: [
        {
          label: '待接单',
          value: 'UN_ACCEPT'
        },
        {
          label: '处理中',
          value: 'ACCEPTED'
        },
        {
          label: '已完成',
          value: 'SOLVED'
        },
        {
          label: '已打分',
          value: 'SCORED'
        }
      ],
      loading: false,
      data: [],
      canScore: false,
      columnDataDefault: [
        {
          prop: 'id',
          label: '工单编号',
          width: '80'
        },
        {
          prop: 'module',
          label: '产品模块',
          width: '100'
        },
        // {
        //   prop: 'description',
        //   label: '问题描述',
        //   width: '150',
        //   tooltip: true
        // },
        {
          prop: 'type',
          label: '问题分类',
          width: '100'
        },
        {
          prop: 'title',
          label: '问题标题',
          width: '150',
          tooltip: true
        },
        {
          prop: 'taskId',
          label: '任务ID',
          width: '120',
          tooltip: true
        },
        // {
        //   prop: 'attachmentList',
        //   label: '附件链接',
        //   width: '200',
        //   attach: true
        // },
        {
          prop: 'createBy',
          label: '提交用户',
          width: '100'
        },
        {
          prop: 'feedbackLevel',
          label: '紧急程度',
          width: '90'
        },
        {
          prop: 'status',
          label: '状态',
          width: '100',
          format: row => {
            const obj = this.statusList.find(item => item.value === row.status);
            if (obj) {
              return obj.label;
            } else {
              return '-';
            }
          }
        },
        {
          prop: 'userGroup',
          label: '用户组',
          width: '130'
        },
        {
          prop: 'chargePerson',
          label: '值班人',
          width: '110'
        },
        {
          prop: 'handleBy',
          label: '处理人',
          width: '100'
        },
        {
          prop: 'createTime',
          label: '提交时间',
          width: '145',
          format: row => {
            if (row.createTime) {
              return this.$utils.parseTime(row.createTime);
            } else {
              return '-';
            }
          }
        }
      ],
      columnData: [],
      total: 0
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'userInfo']),

    typeList() {
      let list = [];
      if (this.params.module === '数据查询') {
        list = ['查询失败', '功能故障', '权限类', '产品功能/交互体验', '其他'];
      } else if (this.params.module === '数据开发') {
        list = ['任务失败类', '调度异常类', '任务配置类', '权限类', '产品建议', '其他'];
      } else if (this.params.module === '数据治理') {
        list = ['查询故障', '权限问题', '功能故障', '交互体验', '功能优化', '其他'];
      } else {
        list = ['任务失败类', '调度异常类', '任务配置类', '权限类', '产品建议', '查询失败', '功能故障', '产品功能/交互体验', '故障类', '运维类', '查询故障', '权限问题', '交互体验', '功能优化', '其他'];
      }
      return list;
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      // 获取是不是管理员
      if (this.isAdmin) {
        this.columnData = [
          ...this.columnDataDefault,
          {
            prop: 'firstAcceptDuration',
            label: '响应时间',
            width: '130'
          },
          {
            prop: 'firstCloseDuration',
            label: '解决时间',
            width: '130'
          }
        ];
      } else {
        this.columnData = [...this.columnDataDefault];
      }
      this.getList('init');
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList(type) {
      this.loading = true;
      Object.keys(this.params).forEach(item => {
        if (!this.params[item]) delete this.params[item];
      });
      getFeedbackList(this.params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
        this.loading = false;
        if (type === 'init' && this.params.feedbackId && !this.isAdmin && this.data[0].status === 'SOLVED') {
          this.$refs.scoreOrder.showWin(this.data[0]);
        }
      });
    },
    // openPro() {
    //   window.open('https://shimo.im/sheets/dPkpKPLWP7hENqOy/IDDYs', '_blank');
    // },
    create() {
      this.$router.push('/admin/order/create');
    },
    exportData() {
      const params = { ...this.params };
      delete params.pageNum;
      delete params.pageSize;
      exportFeedback({
        response: 'HttpServletResponse',
        ...params
      }).then(res => {
        this.$message({
          type: 'success',
          message: '下载成功'
        });
      });
    },
    changeTime(value) {
      if (value) {
        this.params.createStartTime = value[0];
        this.params.createEndTime = value[1];
      } else {
        this.params.createStartTime = '';
        this.params.createEndTime = '';
      }
    },
    see(row) {
      this.$refs.seeOrder.showWin(this.isAdmin, row.id);
    },
    accept(row) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const formData = new FormData();
      formData.append('feedbackId', row.id);
      acceptFeedback(formData, config).then(data => {
        this.$message({
          type: 'success',
          message: '受理成功'
        });
        this.getList();
      });
    },
    transfer(row) {
      this.$refs.transferOrder.showWin(row.id);
    },
    close(row) {
      this.$refs.closeOrder.showWin(this.isAdmin, row.id);
    },
    score(row) {
      this.$refs.scoreOrder.showWin(row);
    }
  }
};
</script>
<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    padding: 15px 15px 0;
    // position: relative;
    display: flex;
    align-items: flex-end;
    ::v-deep .search-label {
      display: inline-block;
      width: 56px;
      white-space: nowrap;
      text-align: justify;
      text-align-last: justify;
    }
    .search-box {
      width: 120px;
    }
    @media screen and (max-width: 1270px) {
      .search-box {
        width: 120px;
      }
    }
    @media screen and (min-width: 1625px) and (max-width: 1670px) {
      .search-box {
        width: 100px;
      }
    }
    @media screen and (max-width: 1625px) {
      .search-box {
        width: 150px;
      }
    }
    @media screen and (max-width: 1120px) {
      .search-box {
        width: 120px;
      }
    }
    .search-group {
      flex: 1;
    }
    .btns {
      width: 90px;
      text-align: right;
    }
    // .create {
    //   position: absolute;
    //   right: 15px;
    //   bottom: 1px;
    // }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  .el-date-editor.el-date-editor--daterange .el-range-separator {
    width: 10%;
  }
}
</style>
