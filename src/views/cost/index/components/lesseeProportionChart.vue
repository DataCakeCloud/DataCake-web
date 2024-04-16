<template>
  <div v-loading="loading" class="chart">
    <el-empty v-if="!list.length && !loading" description="无租户 / Group 占比数据" :image-size="100"></el-empty>
    <div v-show="list.length" id="lesseeProportionChart" class="view"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import { TitleComponent, ToolboxComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { chartResizeListen } from '@/utils/';

echarts.use([TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);
export default {
  name: 'LesseeProportionChart',
  props: {
    loading: Boolean,
    list: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '业务线'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : $ {c} 占比 ({d}%)'
        },
        grid: {
          left: '1%',
          right: '8%',
          bottom: '3%',
          top: '20%',
          containLabel: true
        },
        series: [
          {
            name: '访问占比',
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: {
              borderRadius: 5
            },
            data: []
          }
        ]
      }
    };
  },
  watch: {
    list(val) {
      if (!val.length) return;
      if (!this.myChart) {
        const chartDom = document.getElementById('lesseeProportionChart');
        this.myChart = echarts.init(chartDom);
      }

      this.render(val);
    },
    params: {
      handler(val) {
        this.option.title.text = val.roleView === 1 ? 'Group' : '业务线';
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    render(val) {
      const series =
        val.map(e => {
          return {
            value: e.value,
            name: e.key
          };
        }) || [];

      this.option.series[0].data = series;
      this.option && this.myChart.setOption(this.option, true);
      chartResizeListen(this, this.myChart, 'lesseeProportionChart');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.chart {
  position: relative;
  flex: 1;
  height: 100%;
  .view {
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 0;
    left: 10px;
  }
}
</style>
