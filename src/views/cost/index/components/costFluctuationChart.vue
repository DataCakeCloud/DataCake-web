<template>
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.length && !loading" description="无成本波动数据" :image-size="120"></el-empty>
    <div v-show="list.length" id="costFluctuationChart" class="view"></div>
  </div>
</template>

<script>
import { chartResizeListen, toQian, extension } from '@/utils/';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]);
export default {
  name: 'CostFluctuationChart',
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
      option: {
        tooltip: {
          trigger: 'item',
          // 提示文字
          formatter: function(params) {
            const str = `
              <p>计费项：${params.name}</p>
              <p>成本波动：$ ${toQian(params.value)}</p>
            `;
            return str;
          }
        },
        grid: {
          // 让图表占满容器
          top: 10,
          right: 15,
          left: 110,
          bottom: 30
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}',
            interval: 0, // 横轴信息全部显示
            rotate: 15 // -15度角倾斜显示
          },
          position: 'bottom',
          splitLine: {
            show: false
          }
        },
        yAxis: [
          {
            type: 'category',
            position: 'left',
            axisLine: { show: false },
            triggerEvent: true, // 鼠标悬浮显示全部
            axisLabel: {
              show: true,
              align: 'left',
              overflow: 'truncate',
              margin: 90,
              formatter: function(params) {
                var val = '';
                // 判断长度
                if (params.length > 5) {
                  // 替换原字符
                  val = params.substr(0, 5) + '...';
                  // 返回
                  return val;
                } else {
                  // 否则返回原string
                  return params;
                }
              }
            },
            axisTick: { show: true },
            splitLine: { show: true },
            data: []
          }
        ],
        series: [
          {
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'inside',
              formatter: params => {
                return toQian(params.data);
              }
            },
            data: [],
            itemStyle: {
              normal: {
                color: function(params) {
                  if (params.value < 0) {
                    // 根据真实数值正负显示不同柱形颜色
                    return '#E47373';
                  } else {
                    return '#27CDA2';
                  }
                }
              }
            }
          }
        ]
      }
    };
  },
  watch: {
    list(val) {
      if (!val.length) return;
      if (!this.myChart) {
        const chartDom = document.getElementById('costFluctuationChart');
        this.myChart = echarts.init(chartDom);

        extension(this.myChart);
      }

      this.render(val);
    }
  },
  methods: {
    render(val) {
      const yAxis = [];
      const series = [];
      val.forEach(e => {
        yAxis.unshift(e.key);
        series.unshift(e.value);
      });

      this.option.yAxis[0].data = yAxis;
      this.option.series[0].data = series;
      this.option && this.myChart.setOption(this.option, true);
      chartResizeListen(this, this.myChart, 'costFluctuationChart');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  position: relative;
  height: 100%;
  .view {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
