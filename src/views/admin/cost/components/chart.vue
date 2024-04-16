<template>
  <!-- <div id="quantityChart" v-loading="loading" class="chart"></div> -->
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.length && !loading" description="无用量变化趋势数据"></el-empty>
    <div v-show="list.length && !loading" id="quantityChart" class="view"></div>
  </div>
</template>

<script>
import { stat } from '@/api/cost';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition]);

import { chartResizeListen } from '@/utils/';

export default {
  name: 'QuantityChart',
  props: {
    chartType: {
      type: Number,
      default: 1
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      myChart: null,
      list: [],
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
                  name: e.seriesName,
                  value: e.value
                };
                return item;
              })
              .sort((a, b) => b.value - a.value);
            let tipStr = '';
            tips.forEach(e => {
              tipStr += `
                <div style="display: flex; justify-content: space-between;">
                  <span style="margin-right: 20px;">${e.marker}${e.name}</span> <span>${e.value}</span>
                </div>
              `;
            });

            return tipStr;
          }
        },
        color: [],
        legend: {
          data: [],
          top: 30
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '3%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          max: function(value) {
            return value.max;
          }
        },
        series: []
      }
    };
  },
  watch: {
    params: {
      handler(val) {
        if (this.chartType === 1) this.option.title.text = '用量变化趋势';
        else this.option.title.text = '成本变化趋势';
        this.stat();
      },
      deep: true
    },
    chartType(val) {
      if (val === 1) this.option.title.text = '用量变化趋势';
      else this.option.title.text = '成本变化趋势';
      this.stat();
    }
  },
  mounted() {
    var chartDom = document.getElementById('quantityChart');
    this.myChart = chartDom && echarts.init(chartDom);
  },
  methods: {
    randomColor() {
      return '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
    },
    stat() {
      this.loading = true;
      const params = Object.assign({}, this.params);
      this.list = [];
      stat(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (!Array.isArray(data) || !data.length) return;
        this.list = data;
        const obj = {};
        const list = [];
        data.forEach((e, i) => {
          const item = {
            name: e.statName,
            value: data.filter(ee => ee.statName === e.statName)
          };
          if (!obj[e.statName]) {
            list.push(item);
            obj[e.statName] = item;
          }
        });

        const legend = list.map(e => e.name);
        const colors = list.map(e => this.randomColor());
        const series = list.map((e, i) => {
          const obj = {
            name: e.name,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: colors[i]
            },
            data: e.value.map(ee => (this.chartType === 1 ? ee.jobNameQuantity : ee.cost))
          };
          return obj;
        });

        const xAxis = list[0].value.map(e => {
          const x = e.dt;
          return x;
        });

        this.option.color = colors;
        this.option.xAxis.data = xAxis;
        this.option.legend.data = legend;
        this.option.series = series;
        this.option && this.myChart.setOption(this.option, true);
        chartResizeListen(this, this.myChart, 'quantityChart');
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  width: 100%;
  height: 550px;
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
