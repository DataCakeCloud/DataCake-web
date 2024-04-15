<template>
  <el-card class="task-info box-card-container">
    <div class="info-header">
      <!-- <span class="name">data-dump-main-sg1-test</span> -->
      <el-page-header class="name" :content="info.name" @back="goBack"></el-page-header>
      <div class="status" :style="{ background: statusConfig[info.statusCode && info.statusCode.toUpperCase()] }">{{ info.statusCode }}</div>
    </div>
    <div>
      <el-button type="primary" @click="updateHandler">Update</el-button>
      <el-button-group style="flex: 1; padding-left: 200px">
        <el-button :disabled="startDisabled" @click="showStartDialog">Start</el-button>
        <el-tooltip content="保存savepoint并停止job，后续可以从savepoint启动，恢复任务" placement="top">
          <el-button :disabled="suspendDisabled" @click="stopHandler">Suspend</el-button>
        </el-tooltip>
        <el-tooltip content="终止任务，不触发savepoint" placement="top">
          <el-button :disabled="cancelDisabled" @click="cancelHandler">Cancel</el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    <div class="mt10">
      <el-button-group>
        <el-button :disabled="suspendDisabled" @click="savePoint">Savepoint</el-button>
        <el-button :disabled="flinkUiDisabled" @click="getFlinkUi">Flink UI</el-button>
      </el-button-group>
    </div>
    <el-tabs v-model="activeTabName" class="info-tabs" type="border-card" @tab-click="tabClick">
      <el-tab-pane label="Jobs" name="Jobs">
        <el-table v-loading="jobsLoading" :data="jobsData" stripe style="width: 100%" :cell-style="{ padding: '0', height: '36px' }" height="calc(100vh - 405px)">
          <el-table-column prop="id" label="ID" min-width="100" align="center"></el-table-column>
          <el-table-column prop="clusterName" label="Cluster" min-width="100" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="snapshotName" label="State" min-width="180" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="createBy" label="CreateBy" min-width="130" align="center"></el-table-column>
          <el-table-column prop="createTime" label="CreateTime" min-width="130" align="center">
            <template slot-scope="scope">
              {{ $utils.parseTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="TerminateTime" min-width="180" align="center">
            <template slot-scope="scope">
              {{ $utils.parseTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="statusCode" label="Status" min-width="100" align="center"></el-table-column>
        </el-table>
        <el-pagination background :total="jobsTotal" :current-page="jobsPageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="jobsPageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="jobsSizeChange" @current-change="jobsCurrentChange"> </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="Snapshots" name="Snapshots">
        <el-table v-loading="snapshotsLoading" :data="snapshotsData" stripe style="width: 100%" :cell-style="{ padding: '10px 0' }" height="calc(100vh - 405px)">
          <el-table-column prop="name" label="Name" min-width="180" align="center"></el-table-column>
          <el-table-column prop="description" label="Description" min-width="180" align="center"></el-table-column>
          <el-table-column prop="createBy" label="CreateBy" min-width="180" align="center"></el-table-column>
          <el-table-column prop="createTime" label="CreateTime" min-width="180" align="center">
            <template slot-scope="scope">
              {{ $utils.parseTime(scope.row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background :total="snapshotsTotal" :current-page="snapshotsPageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="snapshotsPageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="snapshotsSizeChange" @current-change="snapshotsCurrentChange"> </el-pagination>
      </el-tab-pane>
      <!-- <el-tab-pane label="Metrics" name="Metrics">
        <iframe v-if="metricsUi" class="frame" :src="metricsUi" frameborder="0"></iframe>
      </el-tab-pane>
      <el-tab-pane label="Logs" name="Logs">
        <iframe v-if="logsUi" class="frame" :src="logsUi" frameborder="0"></iframe>
      </el-tab-pane> -->
    </el-tabs>
    <win-start ref="winStart" @save="init"></win-start>
    <win-save-point ref="winSavePoint" @save="init"></win-save-point>
  </el-card>
</template>
<script>
import WinStart from './components/WinStart';
import WinSavePoint from './components/WinSavePoint';
import { getTaskInfo } from '@/api/task';
import { getTaskDetailPage, getTaskSnapshotsPage, getMetricsUi, getLogsUi, getServiceUi, stopTask, cancelTask } from '@/api/taskDetail';
import * as consts from '@/utils/tools';

export default {
  name: 'TaskInfo',
  components: {
    WinStart,
    WinSavePoint
  },
  data() {
    return {
      queryId: this.$route.query.id,
      // 任务详细信息
      info: {},
      activeTabName: 'Jobs',
      snapshotsFlag: true,
      metricsFlag: true,
      logsFlag: true,
      statusConfig: consts.statusConfig,
      // jobs
      jobsLoading: false,
      jobsData: [],
      jobsTotal: 0,
      jobsPageNum: 1,
      jobsPageSize: 10,
      // snapshots
      snapshotsLoading: false,
      snapshotsData: [],
      snapshotsTotal: 0,
      snapshotsPageNum: 1,
      snapshotsPageSize: 10,
      metricsUi: '',
      logsUi: ''
      // startDisabled: false,
      // suspendDisabled: false,
      // cancelDisabled: false,
      // flinkUiDisabled: false
    };
  },
  computed: {
    // start、delete状态
    startDisabled() {
      const status = ['CREATED', 'FAILED', 'CANCELED', 'SUSPENDED', 'FINISHED'];
      if (status.includes(this.info.statusCode)) {
        return false;
      }
      return true;
    },
    // suspend 、savepoint状态
    suspendDisabled() {
      const status = ['RUNNING'];
      if (status.includes(this.info.statusCode)) {
        return false;
      }
      return true;
    },
    cancelDisabled() {
      const status = ['RUNNING', 'RESTARTING', 'RECONCILING', 'INITIALIZING'];
      if (status.includes(this.info.statusCode)) {
        return false;
      }
      return true;
    },
    flinkUiDisabled() {
      const status = ['CREATED'];
      if (status.includes(this.info.statusCode)) {
        return true;
      }
      return false;
    }
  },
  created() {
    this.init();
    this.initTimer = setInterval(() => {
      getTaskInfo({
        id: this.queryId
      }).then(res => {
        const data = res.data;
        this.info = data;
      });
    }, 5000);
  },
  destroyed() {
    clearInterval(this.initTimer);
  },
  methods: {
    init() {
      getTaskInfo({
        id: this.queryId
      }).then(res => {
        const data = res.data;
        this.info = data;
      });
      this.getJobsList();
      this.activeTabName = 'Jobs';
      this.snapshotsFlag = true;
      this.metricsFlag = true;
      this.logsFlag = true;
    },
    goBack() {
      this.$router.push('/task/list');
    },
    getJobsList() {
      this.jobsLoading = true;
      getTaskDetailPage({
        taskId: this.queryId,
        pageNum: this.jobsPageNum,
        pageSize: this.jobsPageSize
        // taskId: 1
      }).then(res => {
        this.jobsLoading = false;
        const data = res.data;
        if (data.result) {
          this.jobsTotal = data.result.total;
          this.jobsData = data.result.list;
        } else {
          this.jobsTotal = 0;
          this.jobsData = [];
        }
      });
    },
    getSnapshotsList() {
      this.snapshotsLoading = true;
      getTaskSnapshotsPage({
        taskId: this.queryId,
        pageNum: this.snapshotsPageNum,
        pageSize: this.snapshotsPageSize
        // taskId: 1
      }).then(res => {
        const data = res.data;
        this.snapshotsLoading = false;
        this.snapshotsTotal = data.total;
        this.snapshotsData = data.list;
      });
    },
    updateHandler() {
      const path = consts.taskCodeToPath[this.info.templateCode];
      this.$router.push({
        path: `/task/${path}`,
        query: {
          id: this.queryId
        }
      });
    },
    showStartDialog() {
      this.$refs.winStart.showWin(this.queryId);
    },
    stopHandler() {
      this.$confirm('确定停止?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          stopTask({
            id: this.queryId
          }).then(data => {
            this.init();
          });
        })
        .catch(() => {});
    },
    cancelHandler() {
      this.$confirm('确定取消?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          cancelTask({
            id: this.queryId
          }).then(data => {
            this.init();
          });
        })
        .catch(() => {});
    },
    savePoint() {
      this.$refs.winSavePoint.showWin(this.queryId);
    },
    getFlinkUi() {
      getServiceUi({ id: this.queryId, genieJobId: '' }).then(res => {
        const data = res.data;
        const flinkUi = data;
        window.open(flinkUi);
      });
    },
    tabClick() {
      if (this.activeTabName === 'Jobs') {
        this.getJobsList();
      } else if (this.activeTabName === 'Snapshots' && this.snapshotsFlag) {
        // 第一次点击 Snapshots
        this.getSnapshotsList();
        // this.snapshotsFlag = false;
      } else if (this.activeTabName === 'Metrics' && this.metricsFlag) {
        // 第一次点击 Metrics
        getMetricsUi({ id: this.queryId, genieJobId: '' }).then(res => {
          const data = res.data;
          this.metricsUi = data;
          this.metricsFlag = false;
        });
      } else if (this.activeTabName === 'Logs' && this.logsFlag) {
        // 第一次点击 Metrics
        getLogsUi({ id: this.queryId, executionDate: 'null' }).then(res => {
          const data = res.data;
          this.logsUi = data;
          this.logsFlag = false;
        });
      }
    },
    jobsCurrentChange(val) {
      this.jobsPageNum = val;
      this.getJobsList();
    },
    jobsSizeChange(val) {
      this.jobsPageSize = val;
      this.jobsPageNum = 1;
      this.getJobsList();
    },
    snapshotsCurrentChange(val) {
      this.snapshotsPageNum = val;
      this.getSnapshotsList();
    },
    snapshotsSizeChange(val) {
      this.snapshotsPageSize = val;
      this.snapshotsPageNum = 1;
      this.getSnapshotsList();
    }
  }
};
</script>
<style lang="scss" scoped>
.task-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  .info-header {
    position: relative;
    margin-bottom: 10px;
    .name {
      height: 50px;
      line-height: 50px;
    }
    .status {
      position: absolute;
      top: 0;
      right: 10px;
      color: #fff;
      background: #c0c4cc;
      width: 100px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      border-radius: 4px;
    }
  }
  .info-tabs {
    margin-top: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    .frame {
      width: 100%;
      height: calc(100vh - 360px);
    }
    ::v-deep .el-tabs__content {
      padding: 10px 15px;
    }
    .el-pagination {
      padding-top: 10px;
    }
  }
}
</style>
