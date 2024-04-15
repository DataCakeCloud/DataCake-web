<template>
  <el-dialog title="血缘图" class="relation-dialog" :visible.sync="dialogVisible" width="900px" :append-to-body="true" :close-on-click-modal="false" @close="close">
    <el-radio-group v-model="radio" size="mini" class="radio-group" @change="changeRadio">
      <el-radio-button label="top">展示上游</el-radio-button>
      <el-radio-button label="bottom">展示下游</el-radio-button>
    </el-radio-group>
    <div id="myChart" v-loading="loading" style="width: 100%; height: 500px"></div>
  </el-dialog>
</template>
<script>
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { TreeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { getDependencies } from '@/api/task';
import * as tools from '@/utils/tools';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, TreeChart, CanvasRenderer]);

export default {
  name: 'WinRelationChart',
  data() {
    return {
      dialogVisible: false,
      currentId: '',
      myChart: null,
      loading: false,
      radio: 'bottom',
      legendList: [
        {
          name: '已创建',
          itemStyle: {
            color: '#8896B3'
          }
        },
        {
          name: '已上线',
          itemStyle: {
            color: 'rgba(146, 112, 202, 0.8)'
          }
        },
        {
          name: '执行中',
          itemStyle: {
            color: '#409EFF'
          }
        },
        {
          name: '成功',
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: '已取消',
          itemStyle: {
            color: '#E6A23C'
          }
        },
        {
          name: '失败',
          itemStyle: {
            color: '#FF5656'
          }
        },
        {
          name: '已下线',
          itemStyle: {
            color: '#dcdfe6'
          }
        }
      ],
      data: {
        id: 11128,
        isStreamingTemplateCode: false,
        name: 'DA_xiln_shareit_growth_data_shareit_new_media_behavior',
        statusCode: 'SUCCESS',
        children: [
          {
            id: 11122,
            isStreamingTemplateCode: false,
            name: 'DA_xiln_shareit_growth_data_shareit_old_media_behavior',
            statusCode: 'SUCCESS',
            children: [
              {
                id: 10009,
                isStreamingTemplateCode: false,
                name: 'beyla_dwd_daily_iceberg_meta',
                statusCode: 'FAILED',
                children: [
                  {
                    id: 10756,
                    isStreamingTemplateCode: false,
                    name: 'beyla_dwd_daily_iceberg_meta',
                    statusCode: 'SUCCESS'
                  }
                ]
              },
              {
                id: 10010,
                isStreamingTemplateCode: false,
                name: 'beyla_dwd_daily_iceberg_meta1',
                statusCode: 'OFFLINE'
              }
            ]
          },
          {
            id: 10008,
            isStreamingTemplateCode: false,
            name: 'beyla_dwd_daily_add_partation',
            statusCode: 'SUCCESS',
            children: [
              {
                id: 10007,
                isStreamingTemplateCode: false,
                name: 'beyla_dwd_daily_parquet',
                statusCode: 'RUNNING'
              }
            ]
          }
        ]
      }
    };
  },
  methods: {
    init() {
      // this.loading = true;
      // 获取血缘图数据
      // getDependencies(this.currentId).then(data => {
      //   this.initChart(data);
      //   this.loading = false;
      // });
      this.$nextTick(() => {
        const data = this.formatData([this.data]);
        this.initChart(data);
      });
    },
    formatData(data) {
      data.forEach(item => {
        item.itemStyle = {
          color: tools.taskStatusConfig[item.statusCode] || '#909399'
        };
        if (item.children && item.children.length > 0) {
          this.formatData(item.children);
        }
      });
      return data;
    },
    showWin(id) {
      this.dialogVisible = true;
      this.currentId = id;
      this.init();
    },
    changeRadio(value) {
      this.myChart.clear();
      this.myChart.setOption(this.setOption(this.formatData([this.data])));
    },
    initChart(data) {
      var chartDom = document.getElementById('myChart');
      this.myChart = echarts.init(chartDom);
      var option = this.setOption(data);
      option && this.myChart.setOption(option);

      this.myChart.on('click', params => {
        const { data } = params;
        if (params.event.target.culling === false) {
          // 点击label文字
          let href;
          if (data.isStreamingTemplateCode) {
            href = this.$router.resolve({
              path: '/task/info',
              query: {
                id: data.id
              }
            }).href;
          } else {
            href = this.$router.resolve({
              path: '/task/detail',
              query: {
                id: data.id,
                name: data.name
              }
            }).href;
          }
          window.open(href, '_blank');
        } else {
          // 点击节点
          if (!data.children || data.children.length === 0) {
            // 判断是否是最后一级节点
          }
        }
      });
    },
    setOption(data) {
      const option = {
        title: {
          text: `${this.data.name}血缘依赖图`,
          left: 'center'
        },
        tooltip: {
          formatter: params => {
            if (params.dataType === 'main') {
              const { data } = params;
              const status = tools.codeToText[data.statusCode] || '其他';
              let message = `${data.name}<br/>${status}`;
              if (data.createTime) {
                message += `<br/>开始时间：${data.createTime}`;
              }
              if (data.endTime) {
                message += `<br/>结束时间：${data.endTime}`;
              }
              return message;
            } else {
              return '';
            }
          }
        },
        series: [
          {
            type: 'tree',
            roam: true,
            symbolSize: 12,
            initialTreeDepth: -1,
            orient: this.radio === 'top' ? 'RL' : 'LR',
            label: {
              position: 'bottom',
              width: 150,
              overflow: 'truncate'
            },
            labelLayout: {
              hideOverlap: true
            },
            emphasis: {
              label: {
                color: '$c-primary'
              }
            },
            data: data
          }
        ]
      };
      return option;
    },
    close() {
      this.myChart.clear();
    }
  }
};
</script>
<style lang="scss" scoped>
.relation-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 0;
  }
  .radio-group {
    position: absolute;
    top: 80px;
    z-index: 100;
  }
}
</style>
