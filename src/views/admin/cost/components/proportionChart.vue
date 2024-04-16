<template>
  <!-- <div id="proportionChart" v-loading="loading" class="chart"></div> -->
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.PU.length && !list.DP.length && !loading" description="无分PU/分部门用量占比数据"></el-empty>
    <div v-show="list.PU.length && list.DP.length && !loading" id="proportionChart" class="view"></div>
  </div>
</template>

<script>
import { stat } from '@/api/cost';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

import { chartResizeListen } from '@/utils/';

export default {
  name: 'ProportionChart',
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
      list: {
        PU: [],
        DP: []
      },
      option: {
        tooltip: {
          trigger: 'item',
          formatter(params) {
            const str = `${params.name}：${params.value[0]} (${params.value[1]})`;
            return str;
          }
        },
        grid: {
          // top: '10%'
        },
        series: [
          {
            name: '部门',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              formatter: function(params) {
                return `${params.name}\n${params.value[0]}`;
              },
              position: 'inner',
              fontSize: 14
            },
            labelLine: {
              show: false
            },
            data: []
          },
          {
            name: '部门',
            type: 'pie',
            radius: ['45%', '60%'],
            labelLine: {
              length: 30
            },
            label: {
              formatter: ` {b|{b}：}{@[0]} ({@[1]}) `,
              backgroundColor: '#F6F8FC',
              borderColor: '#8C8D8E',
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                  color: '#6E7079',
                  lineHeight: 22,
                  align: 'center'
                },
                hr: {
                  borderColor: '#8C8D8E',
                  width: '100%',
                  borderWidth: 1,
                  height: 0
                },
                b: {
                  color: '#4C5058',
                  fontSize: 12,
                  fontWeight: 'bold',
                  lineHeight: 33
                },
                per: {
                  color: '#fff',
                  backgroundColor: '#4C5058',
                  padding: [3, 4],
                  borderRadius: 4
                }
              }
            },
            data: []
          }
        ]
      }
    };
  },
  watch: {
    params: {
      handler(val) {
        this.stat();
      },
      deep: true,
      immediate: true
    },
    chartType(val) {
      this.stat();
    }
  },
  mounted() {
    var chartDom = document.getElementById('proportionChart');
    this.myChart = chartDom && echarts.init(chartDom);
  },
  methods: {
    stat() {
      this.loading = true;
      const params = Object.assign({}, this.params);
      this.list = {
        PU: [],
        DP: []
      };
      stat(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (Array.isArray(data) && !data.length) return;
        this.list = data;
        const s1 = data.PU.map(e => {
          return {
            value: [this.chartType === 1 ? e.jobNameQuantity : e.cost, e.proportion],
            name: e.statName
          };
        });

        const s2 = data.DP.map(e => {
          return {
            value: [this.chartType === 1 ? e.jobNameQuantity : e.cost, e.proportion],
            name: e.statName
          };
        });

        this.option.series[0].data = s1;
        this.option.series[1].data = s2;
        this.option && this.myChart.setOption(this.option, true);
        chartResizeListen(this, this.myChart, 'proportionChart');
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  height: 600px;
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
