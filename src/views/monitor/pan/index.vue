<template>
  <el-card class="monitor-pan box-card-container">
    <el-tabs>
      <el-tab-pane label="SLA">
        <p class="pan-tip">
          <span class="sub-title">数据截止 {{ $utils.parseTime(data.nowTime) }}</span>
          <el-button type="text" class="btn-text" @click="refresh">刷新</el-button>
        </p>
        <div>
          <label class="label">等级</label>
          <el-select v-model="level" placeholder="请选择等级" clearable @change="changeLevel">
            <el-option v-for="item in levelList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </div>
        <h3>今日指标</h3>
        <el-row v-loading="todayLoading">
          <el-col :span="6" class="quota-item" @click.native="gotoList([2])">
            <el-popover width="300" trigger="hover">
              <div>未恢复监控总数：当日发生过失败且目前仍未恢复的监控数。<br />未恢复监控占比：未恢复监控总数/失败监控总数。</div>
              <i slot="reference" class="el-icon-info quota-icon"></i>
            </el-popover>
            <h1 class="red">{{ data.missNotSuccessToday }}</h1>
            <el-progress :percentage="misPercentage" class="global-color-cb"></el-progress>
            <p class="quota-text">当日未恢复监控总数/占比</p>
          </el-col>
          <el-col :span="6" class="quota-item" @click.native="gotoList([2, 3])">
            <el-popover width="320" trigger="hover">
              <div>失败监控总数：当日发生过失败的监控数。<br />失败监控占比：失败监控总数/监控总数。</div>
              <i slot="reference" class="el-icon-info quota-icon"></i>
            </el-popover>
            <h1 class="red">{{ data.missAndLate }}</h1>
            <el-progress :percentage="failPercentage" class="global-color-cb"></el-progress>
            <p class="quota-text">当日失败监控总数/占比</p>
          </el-col>
          <el-col :span="6" class="quota-item" @click.native="openDialog">
            <el-popover width="300" trigger="hover">
              <div>失败但仍未恢复监控总数：发生过失败，但目前仍未恢复的监控总数。</div>
              <i slot="reference" class="el-icon-info quota-icon"></i>
            </el-popover>
            <h1 class="red">{{ data.missNotSuccessTillNow }}</h1>
            <p style="margin-top: 48px">失败但仍未恢复监控总数</p>
          </el-col>
          <el-col :span="6" class="quota-item">
            <el-popover width="300" trigger="hover">
              <div>监控监控总数：当前所有SLA监控监控总数，包含：已停止监控。</div>
              <i slot="reference" class="el-icon-info quota-icon"></i>
            </el-popover>
            <h1>{{ data.total }}</h1>
            <p class="quota-text">监控总数</p>
          </el-col>
        </el-row>
        <h3>监控趋势图</h3>
        <div class="date-picker">
          <el-date-picker v-model="dates" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
        </div>
        <div id="chart-view" v-loading="chartLoading" class="stastic-view"></div>

        <h3>失败监控TOP10</h3>
        <el-table v-loading="top10Loading" :data="top10Data" highlight-current-row border>
          <el-table-column label="名字" prop="itemName" min-width="200"> </el-table-column>
          <el-table-column label="数据集名" prop="dataSet"> </el-table-column>
          <el-table-column label="数据源" prop="dataRegion"> </el-table-column>
          <el-table-column label="数据表名" prop="dataTable" min-width="150"> </el-table-column>
          <el-table-column label="报警等级" prop="alertLevel"> </el-table-column>
          <el-table-column label="报警次数" prop="sumAlert"> </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="失败但仍未恢复监控列表" :visible.sync="dialogVisible" :close-on-click-modal="false" width="50%">
      <el-table v-loading="dialogLoading" :data="diaLogTableData" highlight-current-row border>
        <el-table-column label="名字" prop="name" min-width="200"> </el-table-column>
        <el-table-column label="基线日期" prop="shouldFinishBefore"> </el-table-column>
        <el-table-column label="报警类型" prop="type"> </el-table-column>
        <el-table-column label="级别" prop="level"> </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>
<script>
import * as tools from '@/utils/tools';
import { parseTime } from '@/utils/';
import { permission } from '@/api/taskDetail';
import { getSummary, failedMonitorTop, failedButUnrecovered, monitorStatistic } from '@/api/sla';

import * as echarts from 'echarts/core';
import { ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, BarChart, LineChart, CanvasRenderer, UniversalTransition]);

import { chartResizeListen } from '@/utils/';

export default {
  name: 'MonitorPan',
  data() {
    return {
      dates: [new Date().getTime() - 86400 * 20 * 1000, new Date().getTime()],
      level: '',
      levelList: tools.levelList,
      dialogVisible: false,
      data: {},
      todayLoading: false,
      permission: true,
      frameLoading: false,
      chartLoading: false,
      countUrl: '',
      approving: false,
      failedUrl: '',
      dialogLoading: false,
      top10Loading: false,

      params: {
        start: parseTime(new Date().getTime() - 86400 * 20 * 1000, '{y}-{m}-{d} {h}:{i}:{s}'),
        end: parseTime(new Date().getTime(), '{y}-{m}-{d} {h}:{i}:{s}')
      },

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
      },
      diaLogTableData: [],
      top10Data: [],
      chart: null,
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: []
        },
        grid: {
          left: '2%',
          right: '0%',
          bottom: '0%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            min: 0,
            max: 50,
            splitNumber: 5,
            interval: 10,
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '',
            min: 0,
            max: 300,
            splitNumber: 5,
            interval: 60,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: []
      }
    };
  },
  computed: {
    misPercentage() {
      if (this.data.missNotSuccessToday && this.data.missAndLate) {
        return Number(((this.data.missNotSuccessToday / this.data.missAndLate) * 100).toFixed(2));
      } else {
        return 0;
      }
    },
    failPercentage() {
      if (this.data.missAndLate && this.data.total) {
        return Number(((this.data.missAndLate / this.data.total) * 100).toFixed(2));
      } else {
        return 0;
      }
    }
  },
  watch: {
    dates(val) {
      if (!val) return;
      this.params.start = parseTime(val[0], '{y}-{m}-{d} {h}:{i}:{s}');
      this.params.end = parseTime(val[1], '{y}-{m}-{d} {h}:{i}:{s}');

      this.monitorStatistic();
      this.failedMonitorTop();
    }
  },
  created() {
    this.getSum();
    this.monitorStatistic();
    this.failedMonitorTop();
  },
  mounted() {
    this.$nextTick(_ => {
      var chartDom = document.getElementById('chart-view');
      this.chart = echarts.init(chartDom);
    });
  },
  methods: {
    getSum(level) {
      this.todayLoading = true;
      getSummary({ level })
        .then(res => {
          this.data = res.data;
        })
        .finally(() => {
          this.todayLoading = false;
        });
    },
    monitorStatistic() {
      this.chartLoading = true;
      monitorStatistic(this.params).then(res => {
        this.chartLoading = false;
        if (res.resultCode !== 0) return;
        const data = res.data;
        const dataKeys = Object.keys(data);
        const keys = Object.keys(data.name);
        const names = Object.values(data.name);
        const xAxis = dataKeys.splice(dataKeys.length - 2, 1);
        const series = keys.map((e, index) => {
          const type = index !== keys.length - 1 ? 'bar' : 'line';
          if (index === keys.length - 1) {
            return {
              name: data.name[e],
              type: type,
              symbol: 'none',
              smooth: true,
              yAxisIndex: 1,
              data: data[e]
            };
          }
          return {
            name: data.name[e],
            type: type,
            data: data[e]
          };
        });
        const left = Math.max(...data[keys[1]]);
        const right = Math.max(...data[keys[keys.length - 1]]);

        const lMax = left + left / 10;
        const rMax = right + right / 10;

        this.option.yAxis[0].max = Math.ceil(Math.ceil(lMax) / 5) * 5;
        this.option.yAxis[0].interval = Math.ceil(Math.ceil(lMax) / 5);
        this.option.yAxis[0].name = names[1];
        this.option.yAxis[1].max = Math.ceil(Math.ceil(rMax) / 5) * 5;
        this.option.yAxis[1].interval = Math.ceil(Math.ceil(rMax) / 5);
        this.option.yAxis[1].name = names[names.length - 1];

        this.option.xAxis[0].data = data[xAxis];
        this.option.legend.data = names;
        this.option.series = series;
        this.chart.setOption(this.option, true);
        chartResizeListen(this, this.chart, 'chart-view');
      });
    },
    failedMonitorTop() {
      this.top10Loading = true;
      failedMonitorTop(this.params).then(res => {
        this.top10Loading = false;
        if (res.resultCode !== 0) return;
        const data = res.data;
        this.top10Data = data.failTop;
      });
    },
    gotoList(state) {
      const params = {
        level: this.level,
        state: state
      };
      sessionStorage.setItem('monitorParams', JSON.stringify(params));
      this.$router.push({ name: 'MonitorList' });
    },
    openDialog() {
      this.dialogVisible = true;
      this.dialogLoading = true;

      failedButUnrecovered().then(res => {
        this.dialogLoading = false;
        if (res.resultCode !== 0) return;

        const data = res.data;
        this.diaLogTableData = data.failButUnrecoveredList;
      });
    },
    changeLevel(value) {
      this.getSum(value);
    },
    refresh() {
      this.getSum(this.level);
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
    padding: 15px 20px;
  }
}
.monitor-pan {
  .pan-tip {
  }
  h3 {
    line-height: 40px;
    margin: 10px 0;
  }

  .pan-tip {
    margin-bottom: 10px;
  }

  .label {
    font-weight: normal;
    margin-right: 10px;
  }
  .quota-item {
    border: 1px solid #ddd;
    padding: 10px 30px;
    text-align: center;
    height: 150px;
    position: relative;
    &:nth-child(-n + 3) {
      cursor: pointer;
      &:hover {
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
        border: 0;
      }
    }
    h1 {
      &.red {
        color: $color-cb;
      }
    }
    .quota-icon {
      position: absolute;
      right: 20px;
      top: 30px;
      color: #445782;
      cursor: pointer;
      font-size: $global-font-size-18;
    }
  }
  .frame {
    width: 100%;
    height: calc(100vh - 200px);
  }
}

.stastic-view {
  height: 450px;
}

.date-picker {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.quota-item {
  position: relative;
}

.quota-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 15px;
}
</style>
