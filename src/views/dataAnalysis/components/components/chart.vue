<template>
  <div class="wrapper" :style="{ height: chartConfigOptions.chartHeight + 'px' }">
    <div :id="chartConfigOptions.chartId" class="container"></div>
    <el-empty v-if="!chartType" class="empty" description="暂无数据"></el-empty>
  </div>
</template>

<script>
import mixin from '@/utils/chartMixin';
import DataSet from '@antv/data-set';
import { numberType } from '@/views/dataAnalysis/util';
const { DataView } = DataSet;
export default {
  name: 'Chart',
  mixins: [mixin],
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    chartConfig: {
      type: Object,
      default: () => {
        return {};
      }
    },
    chartConfigOptions: {
      type: Object,
      default: () => {
        return {
          chartHeight: 300,
          autoFit: true
        };
      }
    }
  },
  data() {
    return {
      chartOption: {
        id: this.chartConfigOptions.chartId,
        autoFit: true,
        axisX: '',
        axisY: '',
        chartHeight: this.chartConfigOptions.chartHeight,
        padding: this.chartConfigOptions.padding || []
      },
      chartType: false
    };
  },
  computed: {
    chartData() {
      const result = this.data.result;
      // 字段类型处理
      if (this.data.type) {
        result.forEach(item => {
          Object.keys(item).forEach(key => {
            const currentTypeObj = this.data.type.find(v => v[key]);
            if (currentTypeObj && numberType.includes(currentTypeObj[Object.values(currentTypeObj)[0]])) {
              item[key] = Number(item[key]);
            }
          });

          if (this.data.type.length !== Object.keys(item).length) {
            this.data.type.forEach(type => {
              if (!item[Object.keys(type)[0]] && numberType.includes(type[Object.keys(type)[0]])) {
                item[Object.keys(type)[0]] = 0;
              }
            });
          }
        });
      }
      return result;
    }
  },
  watch: {
    chartConfig: {
      handler: function(newData, oldData) {
        Object.assign(this.chartOption, newData);
        const deleteKey = ['title', 'describe'];
        const responsiveType = deleteKey.some(key => {
          return newData[key] !== oldData[key];
        });
        if (responsiveType) return;
        this.setOption();
      },
      deep: true
    }
  },
  mounted() {
    this.initChart();
    // this.setChartData(this.chartData);
    Object.assign(this.chartOption, this.chartConfig);
    this.setOption();
  },
  methods: {
    customOption(chart, geom) {
      const type = this.chartOption.type;
      if (type === 'line') {
        if (this.chartOption.legend) {
          chart.legend({
            position: 'bottom',
            offsetY: type === 'line' ? 8 : 4,
            marker: (name, index, item) => {
              return {
                symbol: 'square',
                style: {
                  fill: item.style.stroke
                  // stroke:'#fff',
                  // lineWidth: 4,
                }
              };
            }
          });
        } else {
          chart.legend(this.chartOption.legend);
        }
      }
    },
    setOption() {
      const type = this.chartOption.type;
      // 矩形树图  处理数据
      if (type === 'polygon') {
        if (!this.chartOption.dimension || !this.chartOption.norm) return;
        const chartDataCopy = JSON.parse(JSON.stringify(this.chartData));
        const chartDataOnceName = Array.from(new Set(chartDataCopy.map(item => item[this.chartOption.dimension])));
        const chartData = [];
        chartDataOnceName.forEach(item => {
          const obj = {
            [this.chartOption.dimension]: item,
            [this.chartOption.norm]: 0
          };
          chartDataCopy.forEach(val => {
            if (val[this.chartOption.dimension] === item) {
              if (isNaN(Number(val[this.chartOption.norm]))) {
                obj[this.chartOption.norm] = obj[this.chartOption.norm] + 0;
              } else {
                obj[this.chartOption.norm] = obj[this.chartOption.norm] + Number(val[this.chartOption.norm]);
              }
            }
          });
          chartData.push(obj);
        });

        this.$emit('normNumChange', chartData.length);

        for (let i = 0; i < chartData.length - 1; i++) {
          // i表示趟数
          for (let j = 0; j < chartData.length - 1 - i; j++) {
            // 还未排序的数量
            if (chartData[j + 1][this.chartOption.norm] > chartData[j][this.chartOption.norm]) {
              // 与相邻元素比较
              [chartData[j], chartData[j + 1]] = [chartData[j + 1], chartData[j]]; // ES新特性
            }
          }
        }

        let sliceData = null;
        const endIndex = this.chartOption.viewNum ? this.chartOption.viewNum : chartData.length;
        sliceData = chartData.slice(0, endIndex);

        if (this.chartOption.viewNum && this.chartOption.viewNum !== chartData.length) {
          const otherObj = {};
          const otherList = chartData.slice(endIndex);
          let otherVal = 0;
          otherList.forEach(item => {
            if (isNaN(Number(item[this.chartOption.norm]))) {
              otherVal = otherVal + 0;
            } else {
              otherVal = otherVal + Number(item[this.chartOption.norm]);
            }
          });
          otherObj[this.chartOption.dimension] = '其他';
          otherObj[this.chartOption.norm] = otherVal;
          sliceData.push(otherObj);
        }
        const data = {
          name: 'root',
          children: sliceData.map(item => {
            return {
              name: item[this.chartOption.dimension],
              value: item[this.chartOption.norm]
            };
          })
        };
        const dv = new DataView();
        dv.source(data, {
          type: 'hierarchy'
        }).transform({
          field: 'value',
          type: 'hierarchy.treemap',
          tile: 'treemapResquarify'
        });
        // 将 DataSet 处理后的结果转换为 G2 接受的数据
        const nodes = [];
        for (const node of dv.getAllNodes()) {
          if (node.data.name === 'root') {
            continue;
          }
          const eachNode = {
            name: node.data.name,
            x: node.x,
            y: node.y,
            value: node.data.value
          };

          nodes.push(eachNode);
        }
        this.setChartData(nodes);
      }
      if (type === 'polygon') {
        if (!this.chartOption.dimension || !this.chartOption.norm) return;
      } else {
        if (!this.chartOption.axisX.value || !this.chartOption.axisY.value) return;

        // 数据处理
        if (this.chartOption.group || this.chartOption.dimension) {
          const onceX = Array.from(new Set(this.chartData.map(item => item[this.chartOption.axisX.value] + '')));
          const computedRes = [];
          onceX.forEach(key => {
            const keyResult = []; // 相同的x值的数据
            this.chartData.forEach(item => {
              if (item[this.chartOption.axisX.value] === key || item[this.chartOption.axisX.value] === Number(key)) {
                keyResult.push(item);
              } else {
                return;
              }
            });

            const cueerntKey = this.chartOption.group || this.chartOption.dimension;
            const keyList = Array.from(new Set(keyResult.map(item => item[cueerntKey] + '')));
            keyList.forEach((k, i, arr) => {
              const eqkeyList = keyResult.filter(item => item && item[cueerntKey] === k);
              if (eqkeyList.length > 0) {
                const maxDataItem = eqkeyList.reduce((res, cur) => {
                  return res[this.chartOption.axisY.value] > cur[this.chartOption.axisY.value] ? res : cur;
                });
                computedRes.push(maxDataItem);
              }
            });
          });
          computedRes.sort((a, b) => {
            if (isNaN(new Date(a[this.chartOption.axisX.value]).getTime())) {
              return a[this.chartOption.axisX.value] - b[this.chartOption.axisX.value];
            } else {
              return new Date(a[this.chartOption.axisX.value]).getTime() - new Date(b[this.chartOption.axisX.value]).getTime();
            }
          });

          // 折线图单独处理 维度头尾的数据
          // if(this.chartOption.dimension) {
          //   let startX
          //     let endX
          //   let typeObj = this.data.type.find(item=>Object.keys(item)[0] === this.chartOption.axisX.value)
          //   if(numberType.includes(typeObj[Object.keys(typeObj)[0]])) {
          //     startX = 0
          //     endX = Math.max(...this.chartData.map(item=>item[this.chartOption.axisX.value]))
          //   }else {
          //     startX = this.chartData[0][this.chartOption.axisX.value]
          //     endX = this.chartData[this.chartData.length-1][this.chartOption.axisX.value]
          //   }
          //   let oncedimension = Array.from(new Set(computedRes.map(item=>item[this.chartOption.dimension]+'')))
          //   // let obj = {}
          //   oncedimension.forEach(val=>{
          //     let dimensionList = computedRes.filter(item=>item[this.chartOption.dimension] === val || item[this.chartOption.dimension] === Number(val))
          //     let startType = dimensionList.some(item=>item[this.chartOption.axisX.value] === startX)
          //     let endType = dimensionList.some(item=>item[this.chartOption.axisX.value] === endX)
          //     if(!startType) {
          //       computedRes.push({
          //         [this.chartOption.axisX.value]:startX,
          //         [this.chartOption.dimension]:val,
          //         [this.chartOption.axisY.value]:0
          //       })
          //     }
          //     if(!endType) {
          //       computedRes.push({
          //         [this.chartOption.axisX.value]:endX,
          //         [this.chartOption.dimension]:val,
          //         [this.chartOption.axisY.value]:0
          //       })
          //     }
          //   })
          // }
          this.setChartData(computedRes);
        } else {
          // 数据去重
          const onceAxiosLabel = [];
          const result = [];
          for (let index = this.chartData.length - 1; index >= 0; index--) {
            if (!onceAxiosLabel.includes(this.chartData[index][this.chartOption.axisX.value])) {
              onceAxiosLabel.push(this.chartData[index][this.chartOption.axisX.value]);
              result.push(this.chartData[index]);
            }
          }
          result.sort((a, b) => {
            if (isNaN(new Date(a[this.chartOption.axisX.value]).getTime())) {
              return a[this.chartOption.axisX.value] - b[this.chartOption.axisX.value];
            } else {
              return new Date(a[this.chartOption.axisX.value]).getTime() - new Date(b[this.chartOption.axisX.value]).getTime();
            }
          });
          this.setChartData(result);
        }
      }
      this.setChartOption(type, this.customOption);
      this.renderChart();
      this.chartType = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  .container {
    width: 100%;
  }
  .empty {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
