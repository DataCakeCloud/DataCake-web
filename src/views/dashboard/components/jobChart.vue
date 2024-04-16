<template>
  <div id="jobChart" class="chart"></div>
</template>

<script>
import * as echarts from 'echarts/core';
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition]);

import { chartResizeListen } from '@/utils/';
export default {
  name: 'JobChart',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      myChart: null,
      chartDom: null,
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        color: ['#31ccf4', '#00ae7f'],
        legend: {
          data: [],
          bottom: '1%'
        },
        grid: {
          top: '15%',
          left: '5%',
          right: '5%',
          bottom: '16%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisPointer: {
              type: 'shadow'
            },
            splitLine: {
              show: false
            },
            axisLine: {
              show: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            min: function(value) {
              return value.min;
            },
            max: 50,
            splitNumber: 5,
            interval: 10,
            axisLabel: {
              formatter: '{value}'
            },
            splitLine: {
              show: false
            },
            axisLine: {
              show: false
            }
          },
          {
            type: 'value',
            name: '',
            min: function(value) {
              return value.min;
            },
            max: 300,
            splitNumber: 5,
            interval: 60,
            axisLabel: {
              formatter: '{value}'
            },
            splitLine: {
              show: false
            },
            axisLine: {
              show: false
            }
          }
        ],
        series: []
      }
    };
  },
  watch: {
    list: {
      handler(val) {
        this.render();
      }
    }
  },
  methods: {
    render() {
      if (!this.list.length) return;
      if (!this.myChart) {
        this.chartDom = document.getElementById('jobChart');
        this.myChart = this.chartDom && echarts.init(this.chartDom);
      }
      const xAxis = this.list[0].data.map(e => e.dt.substr(5));
      const legend = this.list.map(e => e.name);
      const lMax = Math.max(...this.list[0].data.map(e => e.num));
      const rMax = Math.max(...this.list[1].data.map(e => e.num));
      const series = this.list.map((e, i) => {
        if (i === 1) {
          return {
            name: e.name,
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ae7f' },
                { offset: 0.5, color: '#e5f8f4' },
                { offset: 0.75, color: '#d7f6e9' },
                { offset: 1, color: '#e0f9f0' }
              ])
            },
            yAxisIndex: 1,
            emphasis: {
              focus: 'series'
            },
            data: e.data.map(ee => ee.num)
          };
        }
        const obj = {
          name: e.name,
          type: 'line',
          symbol: 'none',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#31ccf4' },
              { offset: 0.5, color: '#cef4e5' },
              { offset: 1, color: '#ddd' }
            ])
          },
          yAxisIndex: 0,
          emphasis: {
            focus: 'series'
          },
          data: e.data.map(ee => ee.num)
        };
        return obj;
      });
      this.option.xAxis[0].data = xAxis;
      this.option.legend.data = legend;
      this.option.series = series;
      this.option.yAxis[0].name = legend[0];
      this.option.yAxis[0].max = Math.ceil(Math.ceil(lMax) / 5) * 5;
      this.option.yAxis[0].interval = Math.ceil(Math.ceil(lMax) / 5);
      this.option.yAxis[1].name = legend[1];
      this.option.yAxis[1].max = Math.ceil(Math.ceil(rMax) / 5) * 5;
      this.option.yAxis[1].interval = Math.ceil(Math.ceil(rMax) / 5);

      this.option && this.myChart && this.myChart.setOption(this.option, true);
      chartResizeListen(this, this.myChart, 'jobChart');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
