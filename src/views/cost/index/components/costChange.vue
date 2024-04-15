<template>
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.length && !loading" description="无成本变化数据" :image-size="120"></el-empty>
    <div v-show="list.length && !loading" id="changeChart" class="view"></div>
  </div>
</template>

<script>
import { chartResizeListen, parseDate, randomColor } from '@/utils/';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition]);

export default {
  name: 'ChangeChart',
  props: {
    loading: Boolean,
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      myChart: null,
      params: {
        startDate: parseDate(new Date().getTime() - 86400 * 5 * 1000),
        endDate: parseDate(new Date().getTime() - 86400 * 1000),
        departments: [],
        pus: [],
        costType: 'DP'
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
        legend: {
          type: 'scroll',
          orient: 'vertical',
          width: 105,
          right: 10,
          top: 20,
          bottom: 40,
          data: []
        },
        grid: {
          left: '1%',
          bottom: '3%',
          right: 125,
          top: '10%',
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
        const chartDom = document.getElementById('changeChart');
        this.myChart = echarts.init(chartDom);
      }

      this.render(val);
    }
  },
  methods: {
    render(val) {
      const legend = val.map(e => e.key);
      const colors = val.map(e => randomColor());
      let series;
      if (val[0].objData.length > 1) {
        series = val.map((e, i) => {
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
      } else {
        series = val.map((e, i) => {
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
      }

      const xAxis = val[0].objData.map(e => {
        const x = e.dt;
        return x;
      });

      this.option.color = colors;
      this.option.xAxis.data = xAxis;
      this.option.legend.data = legend;
      this.option.series = series;
      this.option && this.myChart.setOption(this.option, true);
      chartResizeListen(this, this.myChart, 'changeChart');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  height: 100%;
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
