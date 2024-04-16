<template>
  <div class="content">
    <div v-if="resType == '0'" class="warp-text warp">
      <div v-for="(item, index) in resStatistics" :key="index" class="item">
        <el-tooltip effect="dark" :content="item.key" placement="top">
          <span class="key ellipsis-line">{{ item.key }}</span>
        </el-tooltip>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>
    <div v-else-if="resType === '2'" class="warp">
      <div :class="'myCharts' + tabNam + runDom" class="itemCharts"></div>
    </div>
    <div v-else-if="resType === '1'" class="warp warp-line">
      <div :class="'myCharts' + tabNam + runDom" class="itemCharts"></div>
      <el-popover placement="bottom" width="100" trigger="hover" :disabled="resStatistics.length === 0">
        <div v-for="(item, index) in resStatistics" :key="index">{{ item.key + ':' + item.value }}</div>
        <el-button slot="reference" type="text" class="result-footer-btn message">详细</el-button>
      </el-popover>
    </div>
    <div v-else class="warp warp-empty">
      <p>该数据类型暂不支持探查</p>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart, BarChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout, GridComponent, BarChart]);

export default {
  name: 'TableTitle',
  props: {
    scope: {
      type: Object,
      default() {
        return {};
      }
    },
    tabNam: {
      type: String,
      default: ''
    }
  },
  data() {
    const runDom = Number.parseInt(Math.random() * 1000000);
    return {
      option: {
        tooltip: {
          trigger: 'item'
          // confine: true
        },
        legend: {
          show: false
        },
        series: [
          {
            type: '',
            radius: [],
            center: [],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {}
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      },
      runDom: runDom
    };
  },
  computed: {
    resStatistics() {
      const data = this.scope.statistics || {};
      const res = [];
      if (this.resType === '0') {
        Object.keys(data).forEach(key => {
          // if (key === 'null') return;
          res.push({ key: key === 'otherField' ? 'otherValue' : key, value: data[key] });
        });
      } else if (this.resType === '1') {
        Object.keys(data).forEach(key => {
          if (key === 'null' || key === 'histogram') return;
          res.push({ key: key, value: data[key] });
        });
      }
      function compare(p) {
        // 这是比较函数
        return function(m, n) {
          var a = m[p];
          var b = n[p];
          return b - a; // 升序
        };
      }
      res.sort(compare('value'));

      if (this.resType === '0' && !res.some(item => item.key === 'integer')) {
        res.forEach(item => {
          item.value += '%';
        });
      } else if (this.resType === '0') {
        const index = res.findIndex(item => item.key === 'integer');
        res.splice(index, 1);
      }

      if (res.some(item => item.key === 'otherValue')) {
        const index = res.findIndex(item => item.key === 'otherValue');
        const otherValue = res.find(item => item.key === 'otherValue') || {};
        res.splice(index, 1);
        if (otherValue.value) res.push(otherValue);
      }
      if (res.some(item => item.key === 'null')) {
        const index = res.findIndex(item => item.key === 'null');
        const nullItem = res.find(item => item.key === 'null') || {};
        res.splice(index, 1);
        if (nullItem.value) res.push(nullItem);
      }
      return res;
    },
    resType() {
      const typeObj = {
        0: ['string', 'char', 'varchar', 'date'],
        1: ['integer', 'double', 'float'],
        2: ['boolean']
      };
      // 其他类型
      let res = 3;
      Object.keys(typeObj).forEach(key => {
        if (typeObj[key].includes(this.scope.type)) res = key;
      });
      return res;
    }
  },
  created() {},
  mounted() {
    if (this.resType === '1' || this.resType === '2') this.initChart();
  },
  methods: {
    initChart() {
      const chartDom = document.querySelector(`.myCharts${this.tabNam}${this.runDom}`);
      const myChart = chartDom && echarts.init(chartDom);
      this.setOption();
      this.option && myChart?.setOption(this.option);
    },
    setOption() {
      // 元饼图的处理
      if (this.resType === '2') {
        this.option.series[0].type = 'pie';
        this.option.series[0].radius = ['0%', '90%'];
        this.option.series[0].center = ['50%', '50%'];
        this.option.tooltip.formatter = function(params) {
          return params.data.name + ':' + params.percent + '%';
        };
        const res = [];
        const obj = this.scope.statistics || {};
        Object.keys(obj).forEach(key => {
          res.push({ value: obj[key], name: key });
        });
        // if (obj.null) res.push({ value: obj.null, name: 'null' });
        this.option.series[0].data = res;
        // this.option.series[0].data = [
        //   { value: 1048, name: 'Search Engine' },
        //   { value: 735, name: 'Direct' }
        // ];
      } else if (this.resType === '1') {
        const dataWarp = this.scope.statistics || {};
        const keyList = [];
        const valueList = [];
        dataWarp.histogram &&
          dataWarp.histogram.forEach(item => {
            const key = Object.keys(item)[0];
            const value = item[key];
            keyList.push(key);
            valueList.push(value);
          });
        if (keyList.length <= 3 && keyList.length > 1) {
          for (let i = 0; i < 2; i++) {
            keyList.splice(keyList.length - 1, 0, '_');
            valueList.splice(valueList.length - 1, 0, 0);
          }
        }
        if (dataWarp.null) {
          keyList.push('null');
          valueList.push(dataWarp.null);
        }
        this.option.tooltip = {
          trigger: 'axis',
          // extraCssText: 'width:170px;height:60px;word-wrap:break-word;',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: 12
          },
          position: function(point, params, dom, rect, size) {
            // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
            // 提示框位置
            var x = point[0] || 0; // x坐标位置
            // var y = point[1] || 0; // y坐标位置
            var y = 30 + Math.random() * 10;
            return [x + 20, y];
          },
          formatter: function(params) {
            let str = '<span style="display:inline-block;max-width:150px;white-space: nowrap;white-space: normal;">' + params[0].name + '</span>' + '<br />';
            params.forEach(item => {
              str += '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:' + item.color + '"></span>' + 'count' + ' : ' + item.value + '<br />';
            });
            return str;
          }
        };
        this.option.xAxis = [
          {
            type: 'category',
            data: keyList,
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              interval: 100000,
              margin: 10,
              showMinLabel: true,
              showMaxLabel: true,
              formatter: function(value, index) {
                if (index === 0) {
                  return value && (value.split('-')[0].split('.')[0] || '0');
                } else if (value === 'null') {
                  return value;
                } else if (index === keyList.length - 1) {
                  const res = value && value.split('-')[1].split('.')[0];
                  // if(res.length >7) return res.slice(0,5)+'\n'+res.slice(5,res.length)
                  return res;
                }
              }
            }
          }
        ];
        // 柱状图
        this.option.grid = {
          left: '6%',
          right: '13%',
          bottom: '-3%',
          top: '11%',
          containLabel: true
        };
        this.option.yAxis = [
          {
            type: 'value',
            axisLabel: {
              formatter: function() {
                return '';
              }
            },
            splitLine: {
              // y轴网格线
              show: false
            }
          }
        ];
        this.option.series = [
          {
            type: 'bar',
            barWidth: keyList.length > 1 ? '60%' : '30%',
            data: valueList
          }
        ];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100px;
  font-size: $global-font-size-13;
  border-left: 1px solid #e2e9f3;
  .warp {
    width: 100%;
    height: 100%;
    .itemCharts {
      width: 100%;
      height: 100%;
    }
    .message {
      padding: 0;
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: $global-font-size-12;
    }
  }
  .warp-text {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .item {
      display: flex;
      justify-content: space-between;
      padding: 0px 8px;
      line-height: 25px;
      .value {
        display: inline-block;
        width: 50px;
        text-align: end;
        color: #5f9bff;
      }
    }
    .colorRed {
      color: red;
    }
  }
  .warp-empty {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .warp-line {
    padding: 10px;
    .warp-content {
      height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .item {
      display: flex;
      line-height: 26px;
      .value {
        width: 50px;
        display: inline-block;
        text-align: end;
      }
    }
  }
}
.ellipsis-line {
  display: inline-block;
  width: 105px;
  overflow: hidden;
  text-overflow: ellipsis; //文本溢出显示省略号
  white-space: nowrap; //文本不会换行
}
</style>
