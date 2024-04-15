<template>
  <el-card class="dashboard-card syn-module">
    <div class="title">
      <span class="item">综合评分</span>
      <!-- close-delay="100000" -->
      <el-tooltip class="item" effect="dark" placement="top">
        <template slot="content">
          <p>综合评分：基于近30天的数据，能力现状表示您现在各项指标的能力现状；</p>
        </template>
        <i class="el-icon-info"></i>
      </el-tooltip>
    </div>
    <el-empty v-if="!list.length && !loading" description="无综合评分数据"></el-empty>
    <div id="synthetialMarkChart" v-loading="loading" class="chart"></div>
  </el-card>
</template>

<script>
import { score } from '@/api/dashboard';
import * as echarts from 'echarts/core';
import { LegendComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { RadarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LegendComponent, TooltipComponent, GridComponent, RadarChart, CanvasRenderer]);
import { chartResizeListen } from '@/utils/';

export default {
  name: 'SynthetialMark',
  data() {
    return {
      loading: false,
      myChart: null,
      list: [],
      option: {
        legend: {
          data: [],
          bottom: '2%'
        },
        tooltip: {
          show: true
        },
        radar: {
          axisName: {
            formatter: function(params) {
              let newParamsName = '';
              const paramsNameNumber = params.length;
              const provideNumber = 4;
              const rowNumber = Math.ceil(paramsNameNumber / provideNumber);
              if (paramsNameNumber > provideNumber) {
                /** 循环每一行,p表示行 */
                for (let p = 0; p < rowNumber; p++) {
                  let tempStr = '';
                  const start = p * provideNumber;
                  const end = start + provideNumber;

                  if (p === rowNumber - 1) {
                    tempStr = params.substring(start, paramsNameNumber);
                  } else {
                    tempStr = params.substring(start, end) + '\n';
                  }
                  newParamsName += tempStr;
                }
              } else {
                newParamsName = params;
              }
              // 将最终的字符串返回
              return newParamsName;
            }
          },
          nameGap: 5,
          indicator: [
            {
              name: '访问热度',
              max: 1
            },
            {
              name: '查询频率',
              max: 1
            },
            {
              name: '问题反馈',
              max: 1
            },
            {
              name: '任务质量',
              max: 1
            },
            {
              name: '数据完善度',
              max: 1
            }
          ]
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [],
                name: '能力现状'
              },
              {
                value: [],
                name: '平台现状'
              }
            ]
          }
        ]
      }
    };
  },
  created() {
    this.score();
  },
  mounted() {
    var chartDom = document.getElementById('synthetialMarkChart');
    this.myChart = echarts.init(chartDom);
  },
  methods: {
    score() {
      this.loading = true;
      score()
        .then(res => {
          const data = res.data;
          const legend = data.series.map(e => e.name);
          const indicator = data.indicator;
          const series = data.series.map((e, i) => {
            const item = {
              ...e,
              value: i === 1 ? e.value.map(ee => (ee < 0.5 ? 0.7 : ee)) : e.value
            };
            return item;
          });
          this.option.indicator = indicator;
          this.option.legend.data = legend;
          this.option.series[0].data = series;
          this.list = series || [];

          this.option && this.myChart && this.myChart.setOption(this.option, true);
          chartResizeListen(this, this.myChart, 'synthetialMarkChart');
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
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #fff;
}
.chart {
  height: 300px;
}
</style>
