<template>
  <el-dialog title="血缘图" class="relation-dialog" :visible.sync="dialogVisible" width="1000px" :append-to-body="true" :close-on-click-modal="false" @close="close">
    <el-alert class="custom-alert" show-icon>
      <div>节点操作说明： 1）当节点上/下游依赖数大于0时，节点可点击展开；2）展开的节点线段呈现黑色高亮；3）点击任务名称跳转到详情</div>
    </el-alert>
    <div :class="['chart-wrap', `${fullscreen ? 'table-fullscreen' : ''}`]">
      <div class="condition right">
        <span class="label">选择中心实例时间</span>
        <el-date-picker v-model="executionDate" size="mini" :type="dateType" placeholder="请选择日期时间" :value-format="valueFormat" default-time="23:00:00" :picker-options="pickerOptions" :style="{ width: dateWidth, 'margin-bottom': '5px' }" @change="changeDate"></el-date-picker><br />
        <span class="label">血缘深度</span>
        <el-select v-model="level" size="mini" placeholder="请选择血缘深度" style="width: 85px; margin-bottom: 5px" @change="changeLevel"> <el-option v-for="item in levelList" :key="item.value" :label="item.lable" :value="item.value"></el-option> </el-select><br />
        <span class="label">血缘依赖</span>
        <el-select v-model="upDown" size="mini" placeholder="请选择血缘依赖" style="width: 85px" @change="changeUpDown">
          <el-option label="上下游" :value="0"></el-option>
          <el-option label="上游" :value="1"></el-option>
          <el-option label="下游" :value="2"></el-option>
        </el-select>
      </div>
      <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
      <div id="myChart" v-loading="loading" style="width: 100%; height: 500px"></div>
      <div class="zoom-btn">
        <i class="icon-zoom el-icon-zoom-in" @click="zoomClick('in')"></i><br />
        <i class="icon-zoom el-icon-zoom-out" @click="zoomClick('out')"></i>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { getDependencies, getDatasetInfo } from '@/api/task';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GraphChart, CanvasRenderer]);

export default {
  name: 'WinRelationChart',
  data() {
    return {
      dialogVisible: false,
      currentId: '',
      currentName: '',
      myChart: null,
      bigChart: null,
      loading: false,
      upDown: 0,
      level: 2,
      executionDate: 'datetime',
      dateType: 'yyyy-MM-dd HH',
      valueFormat: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        }
      },
      dateWidth: '172px',
      positionTop: '168px',
      levelList: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
        { label: '8', value: 8 }
      ],
      chartData: {},
      legendList: [
        {
          name: '检查上游',
          state: 'waiting',
          itemStyle: {
            color: '#9270ca'
          }
        },
        {
          name: '终止检查上游',
          state: 'termination',
          itemStyle: {
            color: '#8896b3'
          }
        },
        {
          // name: '等待调度队列资源中',
          name: '排队中',
          state: 'waiting_queue',
          itemStyle: {
            color: '#41f3d8'
          }
        },
        {
          name: '任务运行中',
          state: 'running',
          itemStyle: {
            color: '#409eff'
          }
        },
        {
          name: '任务等待重试',
          state: 'up_for_retry',
          itemStyle: {
            color: '#e6a23c'
          }
        },
        {
          name: '任务失败',
          state: 'failed',
          itemStyle: {
            color: '#FF5656'
          }
        },
        {
          name: '任务成功',
          state: 'success',
          itemStyle: {
            color: '#67c23a'
          }
        }
      ],
      fullscreen: false
    };
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
  },
  methods: {
    init() {
      this.loading = true;
      // 获取血缘图数据
      this.executionDate = filters.dataTime(new Date());
      getDependencies({
        id: this.currentId,
        level: this.level,
        upDown: this.upDown,
        executionDate: this.executionDate
      }).then(res => {
        const data = res.data;
        this.chartData = this.formatData(data);
        this.initChart(this.chartData);
        this.loading = false;
      });
    },
    showWin(row) {
      this.dialogVisible = true;
      this.currentId = row.id;
      this.currentName = row.name;
      this.loading = true;
      getDatasetInfo({
        type: '',
        region: '',
        source: '',
        db: '',
        tbl: '',
        qualifyname: row.outputGuids
      }).then(res => {
        const data = res.data;
        if (data) {
          if (data.granularity === 'hourly') {
            this.dateType = 'datetime';
            this.valueFormat = 'yyyy-MM-dd HH';
            this.dateWidth = '172px';
          } else if (data.granularity === 'monthly') {
            this.dateType = 'month';
            this.valueFormat = 'yyyy-MM';
            this.dateWidth = '125px';
          } else {
            this.dateType = 'date';
            this.valueFormat = 'yyyy-MM-dd';
            this.dateWidth = '125px';
          }
        }
        this.init();
      });
    },
    reRender() {
      this.myChart.clear();
      this.loading = true;
      getDependencies({
        id: this.currentId,
        level: this.level,
        upDown: this.upDown,
        executionDate: this.executionDate
      }).then(res => {
        const data = res.data;
        this.chartData = this.formatData(data);
        this.myChart.setOption(this.setOption(this.chartData));
        this.loading = false;
      });
    },
    changeLevel(value) {
      this.reRender();
    },
    changeUpDown(value) {
      this.reRender();
    },
    changeDate(value) {
      this.reRender();
    },
    formatData(data, str) {
      const obj = {};
      if (!str) {
        obj.currentObj = data.instanceList.find(item => item.id === data.coreTaskId);
      }
      obj.optData = data.instanceList.map(item => {
        let status = item.state;
        const createTime = item.start_date ? this.$utils.parseTime(item.start_date) : '';
        const endTime = item.end_date ? this.$utils.parseTime(item.end_date) : '';
        // if (item.isStreamingTemplateCode) {
        //   status = item.taskInstance ? item.taskInstance.statusCode : item.statusCode;
        //   createTime = item.taskInstance ? this.$utils.parseTime(item.taskInstance.createTime) : '';
        //   endTime = item.taskInstance ? this.$utils.parseTime(item.taskInstance.updateTime) : '';
        // } else {
        //   status = item.taskInstance ? item.taskInstance.state : item.statusCode;
        //   createTime = item.taskInstance ? this.$utils.parseTime(item.taskInstance.start_date) : '';
        //   endTime = item.taskInstance ? this.$utils.parseTime(item.taskInstance.end_date) : '';
        // }
        status = status ? status.toLowerCase() : '';
        let color;
        const currentLegend = this.legendList.find(item => item.state === status);
        if (currentLegend) {
          color = currentLegend.itemStyle.color;
        } else {
          color = '#909399';
        }
        return {
          id: item.id,
          taskId: item.task_id || '',
          name: item.dag_id,
          table: item.table || '',
          statusCode: status,
          createTime: createTime || '无',
          endTime: endTime || '无',
          // templateCode: item.templateCode,
          down: item.num_of_downstream,
          up: item.num_of_upstream,
          executionDate: this.$utils.parseTime(item.execution_date),
          // isStreamingTemplateCode: item.isStreamingTemplateCode,
          // category: this.legendList.findIndex(item => item.name === tools.offlineStateCode[status]),
          symbol: 'circle', // emptyCircle
          symbolSize: !str && item.id === data.coreTaskId ? 40 : 20,
          itemStyle: {
            color: color,
            shadowColor: !str && item.id === data.coreTaskId ? 'rgba(0, 0, 0, 0.6)' : '',
            shadowBlur: !str && item.id === data.coreTaskId ? 10 : 0
          }
        };
      });
      obj.optLinks = data.relation.map(item => {
        const obj = {
          source: item.source,
          target: item.target
        };
        if (str) {
          obj.lineStyle = {
            color: '#000'
          };
        }
        return obj;
      });
      return obj;
    },
    initChart(obj) {
      var chartDom = document.getElementById('myChart');
      this.myChart = echarts.init(chartDom);
      var option = this.setOption(obj);
      option && this.myChart.setOption(option);

      this.myChart.on('click', params => {
        if (params.dataType === 'node') {
          const { data } = params;
          if (params.event.target.culling === false) {
            // 点击label文字
            // let href;
            // if (data.isStreamingTemplateCode) {
            //   href = this.$router.resolve({
            //     path: '/task/info',
            //     query: {
            //       id: data.id
            //     }
            //   }).href;
            // } else {
            const href = this.$router.resolve({
              path: '/task/detail',
              query: {
                id: data.taskId,
                name: data.name
              }
            }).href;
            // }
            window.open(href, '_blank');
          } else {
            const positions = this.myChart.getModel().getSeriesByIndex(0).getData()._itemLayouts;
            this.loading = true;
            // 点击节点
            getDependencies({
              id: data.taskId,
              level: this.level,
              upDown: this.upDown,
              executionDate: data.executionDate
            })
              .then(res => {
                const data = res.data;
                if (data && data.instanceList.length && data.relation.length) {
                  this.myChart.clear();
                  this.chartData.optLinks.forEach(item => {
                    if (item.lineStyle) {
                      delete item.lineStyle;
                    }
                  });
                  const currentObj = this.formatData(data, 'new');
                  // tasks 去重
                  const oldTaskIds = this.chartData.optData.map((item, index) => {
                    item.fixed = true;
                    item.x = positions[index][0];
                    item.y = positions[index][1];
                    return item.id;
                  });
                  currentObj.optData.forEach(item => {
                    if (!oldTaskIds.includes(item.id)) {
                      this.chartData.optData.push(item);
                    }
                  });
                  // links 去重
                  currentObj.optLinks.forEach(item => {
                    const filterSource = this.chartData.optLinks.filter(link => link.source === item.source);
                    if (filterSource) {
                      const filterTarget = filterSource.find(link => link.target === item.target);
                      if (!filterTarget) {
                        this.chartData.optLinks.push(item);
                      }
                    } else {
                      this.chartData.optLinks.push(item);
                    }
                  });
                  this.myChart.setOption(this.setOption(this.chartData));
                } else {
                  this.$message({
                    type: 'warning',
                    message: '暂无依赖任务'
                  });
                }
              })
              .finally(() => {
                this.loading = false;
              });
          }
        }
      });
    },
    setOption(obj) {
      const option = {
        title: {
          text: `${this.currentName}血缘依赖图`,
          left: 'center',
          textStyle: {
            width: 900,
            overflow: 'truncate'
          }
        }, // data: this.legendList.map(item => item.name)
        legend: {
          show: true,
          top: 40,
          selectedMode: false
        },
        tooltip: {
          enterable: true,
          extraCssText: 'user-select: text',
          formatter: params => {
            if (params.dataType === 'node') {
              const { data } = params;
              // let href;
              // if (data.isStreamingTemplateCode) {
              //   href = `/#/task/info?id=${data.id}`;
              // } else {
              // const href = `/#/task/detail?id=${data.taskId}&name=${data.name}`;
              const href = `/task/detail?id=${data.taskId}&name=${data.name}`;
              // }
              const status = tools.offlineStateCode[data.statusCode] || '其他';
              let message = `上游依赖数：${data.up}，下游依赖数：${data.down}<br/>`;
              message += `任务名：<a href="${this.$locationOrigin}${href}" target="_blank" style="color:$c-primary">${data.name}</a><br/>
              任务ID：${data.taskId}<br/>表名：${data.table}<br/>状态：${status}`;
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
            // id: 'serie0',
            type: 'graph',
            layout: 'force',
            force: {
              layoutAnimation: false,
              repulsion: 500,
              // gravity: 0.01,
              edgeLength: [10, 50]
            },
            symbolSize: 20,
            roam: true,
            // draggable: true,
            label: {
              show: true,
              position: 'bottom',
              color: '#333',
              width: 140,
              overflow: 'truncate'
            },
            // labelLayout: {
            //   hideOverlap: true
            // },
            emphasis: {
              label: {
                color: '$c-primary'
              }
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 8],
            categories: this.legendList,
            data: obj.optData,
            links: obj.optLinks,
            lineStyle: {
              opacity: 0.5,
              width: 2,
              curveness: 0
            }
          }
        ]
      };
      return option;
    },
    zoomClick(param) {
      const preZoom = this.myChart.getOption().series[0].zoom;
      let zoom = 0;
      if (param === 'in') {
        zoom = preZoom + 0.5;
      } else {
        zoom = preZoom - 0.5;
        if (zoom <= 0) {
          this.$message({
            type: 'warning',
            message: '不能再缩小了哦'
          });
          return false;
        }
      }
      const positions = this.myChart.getModel().getSeriesByIndex(0).getData()._itemLayouts;
      this.chartData.optData.forEach((item, index) => {
        item.fixed = true;
        item.x = positions[index][0];
        item.y = positions[index][1];
      });
      this.myChart.setOption({
        series: {
          zoom: zoom,
          data: this.chartData.optData
        }
      });
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
      let width, height;
      if (this.fullscreen) {
        width = document.body.clientWidth - 10 + 'px';
        height = document.body.clientHeight - 10 + 'px';
      } else {
        width = '960px';
        height = '500px';
      }
      this.myChart.resize({
        width,
        height
      });
    },
    close() {
      this.myChart.clear();
      this.myChart.off('click');
      this.level = 2;
      this.upDown = 0;
    }
  }
};
</script>
<style lang="scss" scoped>
.relation-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 0;
  }
  .chart-wrap {
    position: relative;
  }
  .condition {
    position: absolute;
    top: 65px;
    z-index: 100;
    .label {
      display: inline-block;
      width: 112px;
      text-align: right;
    }
  }
  .right {
    right: 20px;
  }
  .zoom-btn {
    position: absolute;
    z-index: 100;
    bottom: 10px;
    right: 15px;
    .icon-zoom {
      font-size: $global-font-size-24;
      cursor: pointer;
      margin-bottom: 5px;
      &:hover {
        color: #409eff;
      }
    }
  }
}
</style>
