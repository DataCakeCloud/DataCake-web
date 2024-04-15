<template>
  <div class="overview">
    <el-date-picker
      v-model="dateRange"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      value-format="yyyy-MM-dd HH:mm:ss"
      format="yyyy-MM-dd HH:mm:ss"
      :picker-options="pickerOptions"
      :default-time="['00:00:00', '23:59:59']"
      @change="getChart"
    ></el-date-picker>
    <el-card class="box-card">
      <div slot="header" class="header">
        <span class="title">
          实例运行汇总
          <el-tooltip effect="dark" popper-class="tooltip-width" placement="top" content="点击实例节点可查看任务运行详细信息">
            <i class="el-icon-info global-color-ca"></i>
          </el-tooltip>
        </span>
        <el-radio-group v-model="showType" size="mini" class="operate-btn">
          <el-radio-button label="Matrix"></el-radio-button>
          <el-radio-button label="Table"></el-radio-button>
        </el-radio-group>
      </div>
      <instance-map v-show="showType === 'Matrix'" ref="instanceMap" :date="dateRange"></instance-map>
      <instance-table v-show="showType === 'Table'" :date="dateRange"></instance-table>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="header">
        <span class="title">实例运行时长统计</span>
      </div>
      <div v-if="isShowChart" id="myChart" v-loading="chartLoading" style="width: 100%; height: 500px"></div>
      <el-empty v-else :image-size="200"></el-empty>
    </el-card>
  </div>
</template>
<script>
import InstanceMap from './components/InstanceMap';
import InstanceTable from './components/InstanceTable';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { getInstanceId, getLineChart } from '@/api/flow';
import * as filters from '@/filters';

echarts.use([TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition, DataZoomComponent]);

export default {
  name: 'Overview',
  components: {
    InstanceMap,
    InstanceTable
  },
  data() {
    return {
      dateRange: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        }
      },
      showType: 'Matrix',
      chartLoading: true,
      myChart: null,
      isShowChart: true
    };
  },
  created() {
    this.getDate();
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const chartDom = document.getElementById('myChart');
      this.myChart = echarts.init(chartDom);
      this.getChart(this.dateRange);
    },
    getDate() {
      getInstanceId({
        workflowID: this.$route.query.id,
        pageSize: 15,
        pageNum: 1
      }).then(res => {
        const data = res.data;
        const start = data.instanceTimestamps[data.instanceTimestamps.length - 1];
        const end = data.instanceTimestamps[0];
        this.dateRange = [filters.dataTime(start), filters.dataTime(end)];
      });
    },
    getChart(dateRange) {
      getLineChart({
        workflowID: this.$route.query.id,
        version: this.$route.query.version,
        // version: 1,
        startDate: dateRange && dateRange.length ? dateRange[0] : '',
        endDate: dateRange && dateRange.length ? dateRange[1] : ''
      })
        .then(res => {
          const data = res.data;
          if (data.no_data) {
            this.isShowChart = false;
          } else {
            this.isShowChart = true;
            this.myChart.setOption(this.setOption(data));
          }
        })
        .finally(() => {
          this.chartLoading = false;
        });
    },
    setOption(data) {
      let option = {};
      option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: data.taskNameList
        },
        dataZoom: {
          type: 'inside',
          realtime: true,
          start: 0,
          end: 100,
          xAxisIndex: [0, 1]
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '25%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.executionDates.map(item => this.$utils.parseTime(item))
        },
        yAxis: {
          name: '运行时长/min',
          type: 'value'
        },
        series: data.series.map(item => {
          return {
            name: item.taskName,
            type: 'line',
            data: item.durations
          };
        })
      };
      return option;
    }
  }
};
</script>
<style lang="scss" scoped>
.overview {
  .box-card {
    margin-top: 10px;
    .header {
      position: relative;
    }
    .title {
      font-weight: 700;
      font-size: $global-font-size-16;
    }
    .operate-btn {
      position: absolute;
      right: 0;
      top: -3px;
    }
  }
}
</style>
