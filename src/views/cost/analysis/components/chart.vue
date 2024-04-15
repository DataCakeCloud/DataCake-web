<template>
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.length && !loading" description="无成本变化数据" :image-size="120"></el-empty>
    <div v-show="list.length && !loading" id="costAnalysisChart" class="view"></div>
  </div>
</template>

<script>
import { chartResizeListen, randomColor } from '@/utils/';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart, BarChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, BarChart, CanvasRenderer, UniversalTransition]);

export default {
  name: 'CostAnalysisChart',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default: () => {}
    },
    loading: Boolean
  },
  data() {
    return {
      myChart: null,
      barOption: {
        tooltip: {
          trigger: 'axis',
          confine: true,
          axisPointer: {
            type: 'shadow'
          },
          formatter(params) {
            const tips = params
              .map(e => {
                const item = {
                  marker: e.marker,
                  seriesName: e.seriesName,
                  name: e.name,
                  value: e.value
                };
                return item;
              })
              .sort((a, b) => b.value - a.value);
            let tipStr = '';
            tips.forEach(e => {
              tipStr += `
                <div style="display: flex; justify-content: space-between;">
                  <span style="margin-right: 20px;">${e.marker}${e.seriesName} ${e.name}</span> <span>$ ${e.value}</span>
                </div>
              `;
            });

            return tipStr;
          }
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          top: '2%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: false
            }
          }
        ],
        series: []
      },
      option: {
        title: {
          left: 'center',
          text: ''
        },
        tooltip: {
          trigger: 'axis',
          confine: true,
          formatter(params) {
            const tips = params
              .map(e => {
                const item = {
                  marker: e.marker,
                  name: e.name,
                  seriesName: e.seriesName,
                  value: e.value
                };
                return item;
              })
              .sort((a, b) => b.value - a.value);
            let tipStr = '';
            tips.forEach(e => {
              tipStr += `
                <div style="display: flex; justify-content: space-between;">
                  <span style="margin-right: 20px;">${e.marker}${e.seriesName} ${e.name}</span> <span>$ ${e.value}</span>
                </div>
              `;
            });

            return tipStr;
          }
        },
        color: [],
        grid: {
          left: '1%',
          bottom: '3%',
          right: '5%',
          top: '2%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false
          },
          max: function(value) {
            return value.max;
          }
        },
        series: []
      }
    };
  },
  watch: {
    list(val) {
      if (!val.length) return;
      if (!this.myChart) {
        const chartDom = document.getElementById('costAnalysisChart');
        this.myChart = echarts.init(chartDom);
      }

      this.render(val);
    }
  },
  methods: {
    render(val) {
      const list = JSON.parse(JSON.stringify(val));
      if (list.length > 1) {
        list.shift();
      }
      const colors = list.map(e => randomColor());
      const lineSeries = list.map((e, i) => {
        const obj = {
          name: e.key,
          type: 'line',
          // smooth: true,
          symbol: 'none',
          lineStyle: {
            color: colors[i]
          },
          data: e.objData.map(ee => ee.value)
        };
        return obj;
      });
      const xAxis = list[0].objData.map(e => {
        const x = e.dt.substr(5);
        return x;
      });
      const barSeries = list.map((e, i) => {
        const obj = {
          name: e.key,
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: colors[i]
          },
          data: e.objData.map(ee => ee.value)
        };
        return obj;
      });
      const adBarSeries = list.map((e, i) => {
        const obj = {
          name: e.key,
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          data: e.objData.map(ee => ee.value)
        };
        return obj;
      });

      if (this.params.chartType === 0) {
        this.barOption.xAxis[0].data = xAxis;
        this.barOption.series = barSeries;
        this.barOption && this.myChart.setOption(this.barOption, true);
      } else if (this.params.chartType === 1) {
        this.barOption.xAxis[0].data = xAxis;
        this.barOption.series = adBarSeries;
        this.barOption && this.myChart.setOption(this.barOption, true);
      } else {
        this.option.color = colors;
        this.option.xAxis.data = xAxis;
        this.option.series = lineSeries;
        this.option && this.myChart.setOption(this.option, true);
      }

      chartResizeListen(this, this.myChart, 'costAnalysisChart');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  height: calc(100vh / 3);
  position: relative;
  .view {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
