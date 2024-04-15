<template>
  <el-card class="moniter-detail box-card-container">
    <el-page-header class="header" content="监控详情" @back="goBack"></el-page-header>
    <div class="content">
      <el-descriptions :column="1" size="medium" class="description" border label-class-name="label">
        <el-descriptions-item label="监控名称">{{ data.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">SLA</el-descriptions-item>
        <el-descriptions-item label="数据集名称">{{ `${data.dataRegion}_${data.dataSet}_${data.dataTable}` || '-' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ data.ownerName || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-tabs class="detail-tab">
        <el-tab-pane label="数据概览">
          <el-date-picker v-model="dates" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
          <el-table v-loading="frameLoading" :data="overViewData" style="width: 100%; margin-top: 20px" highlight-current-row border>
            <el-table-column label="平均就绪时间(min)" prop="avgTime"> </el-table-column>
            <el-table-column label="失败天数占比" prop="failAlertPer"> </el-table-column>
            <el-table-column label="当日恢复天数占比" prop="recoverDay"> </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane v-loading="frameLoading" label="log列表">
          <el-date-picker v-model="datesLog" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
          <el-table v-loading="frameLoading" :data="logData" style="width: 100%; margin-top: 20px" highlight-current-row border>
            <el-table-column label="基线时间" prop="shouldFinishBefore"> </el-table-column>
            <el-table-column label="就绪时间" prop="realFinishTime"> </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                {{ scope.row.shouldAlert === 0 ? '成功' : '失败' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-card>
</template>
<script>
import * as tools from '@/utils/tools';
import { permission } from '@/api/taskDetail';
import { dataOverview, logList } from '@/api/sla';
import { parseTime } from '@/utils/';

export default {
  name: 'MonitorDetail',
  data() {
    return {
      data: {},
      frameLoading: false,
      permission: true,
      approving: false,
      dataUrl: '',
      logUrl: '',

      dates: [new Date().getTime() - 86400 * 20 * 1000, new Date().getTime()],
      datesLog: [new Date().getTime() - 86400 * 20 * 1000, new Date().getTime()],
      params: {
        start: parseTime(new Date().getTime() - 86400 * 20 * 1000, '{y}-{m}-{d} {h}:{i}:{s}'),
        end: parseTime(new Date().getTime(), '{y}-{m}-{d} {h}:{i}:{s}')
      },
      paramsLog: {
        start: parseTime(new Date().getTime() - 86400 * 20 * 1000, '{y}-{m}-{d} {h}:{i}:{s}'),
        end: parseTime(new Date().getTime(), '{y}-{m}-{d} {h}:{i}:{s}')
      },
      overViewData: [],
      logData: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  watch: {
    dates(val) {
      if (!val) return;
      this.params.start = parseTime(val[0], '{y}-{m}-{d} {h}:{i}:{s}');
      this.params.end = parseTime(val[1], '{y}-{m}-{d} {h}:{i}:{s}');

      this.dataOverview();
    },
    datesLog(val) {
      if (!val) return;
      this.paramsLog.start = parseTime(val[0], '{y}-{m}-{d} {h}:{i}:{s}');
      this.paramsLog.end = parseTime(val[1], '{y}-{m}-{d} {h}:{i}:{s}');

      this.logList();
    }
  },
  created() {
    this.data = JSON.parse(sessionStorage.getItem('monitorDetail'));
    this.params.name = this.data.name;
    this.paramsLog.name = this.data.name;
    this.dataOverview();
    this.logList();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'MonitorList' });
    },
    dataOverview() {
      this.frameLoading = true;
      dataOverview(this.params).then(res => {
        this.frameLoading = false;
        if (res.resultCode !== 0) {
          this.overViewData = [];
          return;
        }
        this.overViewData = res.data;
      });
    },
    logList() {
      this.frameLoading = true;
      logList(this.paramsLog).then(res => {
        this.frameLoading = false;
        if (res.resultCode !== 0) return;
        this.logData = res.data;
      });
    },
    formatLevel(value) {
      const obj = tools.levelList.find(item => item.value === value);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    clickPermission() {
      permission().then(data => {
        this.approving = true;
        localStorage.setItem('permission', '1');
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0 20px;
  }
}
.moniter-detail {
  .header {
    height: 50px;
    line-height: 50px;
  }
  .content {
    margin-top: 20px;
    .description {
      width: 40%;
      ::v-deep .el-descriptions-item__label {
        width: 100px;
        text-align: right;
      }
    }

    .detail-tab {
      margin-top: 20px;
    }
  }
  .frame {
    width: 100%;
    height: calc(100vh - 200px);
  }
}
</style>
