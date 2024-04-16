<template>
  <el-card class="dashboard-card syn-module">
    <div class="title">
      <span class="item">关键指标</span>
      <el-tooltip class="item" effect="dark" placement="top">
        <template slot="content">
          <div class="key-list">
            <p v-for="(item, index) in keyList" :key="index">{{ item }}</p>
          </div>
        </template>
        <i class="el-icon-info"></i>
      </el-tooltip>
    </div>
    <el-empty v-if="!list.length && !loading" description="无关键指标数据"></el-empty>
    <div v-else v-loading="loading" class="chart-box">
      <div id="keyIndexChart" class="chart"></div>
      <div class="chart-list">
        <template v-for="(item, index) in list">
          <div :key="index" class="list-item">
            <span class="name">
              <cite
                :style="{
                  display: 'inline-block',
                  position: 'relative',
                  top: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  marginRight: '5px',
                  border: `3px solid ${item.color}`
                }"
              >
              </cite>
              {{ item.name }}
            </span>
            <span class="value">{{ item.value }}</span>
          </div>
        </template>
      </div>
    </div>
  </el-card>
</template>

<script>
import { key } from '@/api/dashboard';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, LegendComponent, PieChart, GridComponent, CanvasRenderer, LabelLayout]);
import { chartResizeListen } from '@/utils/';
const total = 100;
export default {
  name: '',
  data() {
    return {
      loading: false,
      colors: ['#96bfcd', '#b5e450', '#819965', '#9eb0b1'],
      radius: [
        ['80%', '85%'],
        ['60%', '65%'],
        ['40%', '45%'],
        ['20%', '25%']
      ],
      list: [],
      keyList: this.$t('dashboard.keyList'),
      option: {
        tooltip: {
          show: false,
          trigger: 'item',
          formatter: '{a} : {c} ({d})'
        },
        color: ['rgb(255,159,127)', 'rgb(50,197,233)'],
        grid: {
          left: '3%',
          right: '2%',
          containLabel: true
        },
        series: []
      }
    };
  },
  created() {
    this.key();
  },
  mounted() {
    var chartDom = document.getElementById('keyIndexChart');
    this.myChart = echarts.init(chartDom);
  },
  methods: {
    key() {
      this.loading = true;
      key()
        .then(res => {
          const data = res.data;
          const list = data.map((e, i) => {
            const item = { ...e, color: this.colors[i], radius: this.radius[i] };
            return item;
          });
          const series = list.map(e => {
            const obj = {
              name: e.name,
              type: 'pie',
              radius: e.radius,
              label: {
                show: false,
                position: 'center'
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              },
              data: [
                {
                  name: `${e.name}: ${e.value}`,
                  value: parseInt(e.value),
                  itemStyle: {
                    color: e.color
                  }
                },
                {
                  value: total - parseInt(e.value),
                  itemStyle: {
                    // color: 'transparent'
                    color: '#333',
                    opacity: 0.1
                  }
                }
              ]
            };
            return obj;
          });
          this.option.series = series;
          this.list = list;
          this.option && this.myChart && this.myChart.setOption(this.option, true);
          chartResizeListen(this, this.myChart, 'keyIndexChart');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
@import './title.scss';
.syn-module {
  margin-top: 20px;
  position: relative;
}
::v-deep .el-icon-info {
  color: $c-primary;
}
::v-deep .el-empty {
  padding-bottom: 50px;
  // position: absolute;
  // top: 60px;
  // left: 0;
  // right: 0;
  // bottom: 0;
  // z-index: 1000;
  // background: #fff;
}
.chart-box {
  display: flex;
  align-items: center;
}
.chart {
  flex: 1;
  height: 300px;
  margin-right: 20px;
}
.chart-list {
  flex: 1.5;
}
.list-item {
  display: flex;
  justify-content: space-between;
  line-height: 35px;
  font-size: $global-font-size-16;
  font-weight: 500;
}

.key-list {
  p {
    line-height: 23px;
    margin-bottom: 5px;
    &:last-child {
      margin: 0;
    }
  }
}
</style>
