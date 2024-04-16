<template>
  <div class="detail">
    <el-card class="box-card">
      <div slot="header" class="header">
        <span class="title">实例运行明细</span>
        <div class="operate">
          <span>选择例行实例：</span>
          <el-select v-model="executionDate" v-loadMore="{ fn: loadMore, selector: '.el-select-dropdown .el-select-dropdown__wrap' }" placeholder="请选择例行实例">
            <el-option v-for="item in executionDateList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </div>
      </div>
      <div class="status-wrap">
        <span v-for="item in btnsOptions" :key="item.text"><i :class="item.iconClass" :style="{ color: item.color }"></i>{{ item.text }}</span>
      </div>
      <div ref="graphWrap" v-loading="graphLoading" :class="['graph-wrap', `${fullscreen ? 'table-fullscreen' : ''}`]">
        <Slider ref="slider" style="top: 40px" @zoom="handleZoom"></Slider>
        <el-tooltip content="全屏" :open-delay="200" popper-class="tag-popper">
          <i class="el-icon-rank btn-icon" @click="fullscreenFn"></i>
        </el-tooltip>
        <Graph ref="graph" :data="workflowData" @node-click="handleNodeClick" @right-click="handleRightClick"></Graph>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="header">
        <span class="title">实例运行甘特图</span>
      </div>
      <instance-gantt :date="executionDate"></instance-gantt>
    </el-card>
    <task-detail ref="taskDetail"></task-detail>
  </div>
</template>
<script>
import InstanceGantt from './components/InstanceGantt';
import TaskDetail from './components/TaskDetail';
import Graph from '../Graph';
import Slider from '../Slider';
import { getInstanceId, getInstanceChart, clearTask, getBaseInfo } from '@/api/flow';
import { stopTaskInstace } from '@/api/taskDetail';
import * as filters from '@/filters';

export default {
  name: 'Detail',
  components: {
    Graph,
    InstanceGantt,
    TaskDetail,
    Slider
  },
  data() {
    return {
      executionDate: '',
      executionDateList: [],
      dateParams: {
        workflowID: this.$route.query.id,
        pageSize: 15,
        pageNum: 1
      },
      dateCount: 0,
      btnsOptions: [
        { text: '检查上游', color: '#d7bdf2', iconClass: 'el-icon-warning-outline' },
        { text: '排队中', color: '#87e0f0', iconClass: 'el-icon-more' },
        { text: '运行中', color: '#5b70e4', iconClass: 'el-icon-refresh-right' },
        { text: '成功', color: '#67c23a', iconClass: 'el-icon-circle-check' },
        { text: '失败', color: '#f10d15', iconClass: 'el-icon-circle-close' }
      ],
      graphLoading: false,
      workflowData: {
        nodes: [],
        edges: []
      },
      fullscreen: false
    };
  },
  watch: {
    executionDate(value) {
      if (value) {
        this.getChart();
      }
    }
  },
  created() {
    const executionDate = localStorage.getItem('executionDate');
    if (executionDate) {
      this.executionDate = executionDate;
    }
    this.init();
  },
  mounted() {
    const graphWidth = this.$refs.graphWrap.offsetWidth;
    const graphHeight = this.$refs.graphWrap.offsetHeight;
    this.$refs.graph.init(graphWidth, graphHeight);
    this.$nextTick(() => {
      document.addEventListener('keyup', e => {
        if (e.keyCode === 27) {
          this.fullscreen = false;
          this.$refs.graph && this.$refs.graph.dispose();
          this.$nextTick(() => {
            const graphWidth = this.$refs.graphWrap.offsetWidth;
            const graphHeight = this.$refs.graphWrap.offsetHeight;
            this.$refs.graph.init(graphWidth, graphHeight);
          });
        }
      });
    });
  },
  methods: {
    init() {
      this.getDate();
    },
    loadMore() {
      if (this.dateCount > this.executionDateList.length) {
        this.dateParams.pageNum++;
        this.getDate();
      }
    },
    fullscreenFn() {
      this.fullscreen = !this.fullscreen;
      this.$refs.graph.dispose();
      this.$nextTick(() => {
        const graphWidth = this.$refs.graphWrap.offsetWidth;
        const graphHeight = this.$refs.graphWrap.offsetHeight;
        this.$refs.graph.init(graphWidth, graphHeight);
        this.$message('按ESC可退出全屏');
      });
    },
    getDate() {
      getInstanceId(this.dateParams).then(res => {
        const data = res.data;
        this.dateCount = data.count;
        data.instanceTimestamps.forEach(item => {
          this.executionDateList.push(filters.dataTime(item));
        });
        if (!this.executionDate) {
          this.executionDate = this.executionDateList[0];
        }
      });
    },
    getChart() {
      this.graphLoading = true;
      getInstanceChart({
        workflowID: this.$route.query.id,
        // version: this.$route.query.version,
        executionDate: this.executionDate
      })
        .then(res => {
          const data = res.data;
          this.workflowData = {
            nodes: [],
            edges: []
          };
          data.nodeList.forEach(item => {
            this.workflowData.nodes.push({
              id: item.taskId + '',
              shape: 'instance-card',
              data: {
                id: item.taskId + '',
                name: item.taskName,
                state: item.state,
                templateCode: item.templateCode,
                isHistoryTask: item.isOutside
              }
            });
          });
          data.relation.forEach(item => {
            this.workflowData.edges.push({
              source: item.source + '',
              target: item.target + '',
              shape: item.sourceIsOutside ? 'light-dash-edge' : 'light-edge'
            });
          });
          this.$refs.graph.render();
        })
        .finally(() => {
          this.graphLoading = false;
        });
    },
    handleZoom(operate) {
      this.$refs.graph.zoomFn(operate);
    },
    handleNodeClick(node) {
      const data = node.getData();
      getBaseInfo({
        workflowID: this.$route.query.id,
        executionDate: this.executionDate,
        taskName: data.name,
        taskID: data.id
      }).then(res => {
        const data = res.data;
        this.$refs.taskDetail.showWin(data);
      });
    },
    handleRightClick(name, data) {
      this[name](data);
    },
    executeTaxk(data, type) {
      const params = {
        name: data.name,
        executionDate: this.executionDate,
        status: type
      };
      stopTaskInstace(params).then(res => {
        this.dialogVisible = false;
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        this.getChart();
      });
    },
    clearTaskFn(tasks) {
      const params = {
        workflowID: this.$route.query.id,
        executionDate: this.executionDate,
        tasks
      };
      clearTask(params).then(res => {
        this.$message.success('重算成功');
        this.getChart();
      });
    },
    // 重算
    repeat(data) {
      const tasks = [{ taskName: data.name, taskID: data.id }];
      this.clearTaskFn(tasks);
    },
    // 置为成功
    setSuccess(data) {
      this.executeTaxk(data, 1);
    },
    // 置为失败
    setFail(data) {
      this.executeTaxk(data, 0);
    },
    // 重算至该节点
    repeatNodeUp(data) {
      const taskIds = this.findNodes(data.id, 'target');
      const tasks = this.getTasks(taskIds);
      this.clearTaskFn(tasks);
    },
    // 重算节点及下游
    repeatNodeDown(data) {
      const taskIds = this.findNodes(data.id, 'source');
      const tasks = this.getTasks(taskIds);
      this.clearTaskFn(tasks);
    },
    getTasks(taskIds) {
      return this.workflowData.nodes
        .filter(item => taskIds.includes(item.id))
        .map(item => {
          return {
            taskName: item.data.name,
            taskID: item.data.id
          };
        });
    },
    findNodes(currentId, name) {
      const name2 = name === 'source' ? 'target' : 'source';
      const targetIds = [currentId];
      const edges = this.workflowData.edges;
      function getTarget(sourceArr) {
        sourceArr.forEach(sourceId => {
          var targetIdArr = edges
            .filter(item => {
              return item[name] === sourceId && item.shape === 'light-edge';
            })
            .map(item => item[name2]);
          if (targetIdArr.length) {
            targetIds.push(...targetIdArr);
            getTarget(targetIdArr);
          }
        });
      }
      getTarget([currentId]);
      return targetIds;
    }
  }
};
</script>
<style lang="scss" scoped>
.detail {
  .box-card {
    margin-top: 10px;
    // max-height: 600px;
    position: relative;
    .header {
      position: relative;
    }
    .title {
      font-weight: 700;
      font-size: $global-font-size-16;
    }
    .operate {
      position: absolute;
      right: 0;
      top: -7px;
    }
  }
  .graph-wrap {
    height: 400px;
    position: relative;
    .btn-icon {
      position: absolute;
      right: 10px;
      top: -20px;
      z-index: 10;
      font-size: $global-font-size-16;
      margin-right: 10px;
      cursor: pointer;
      transform: rotate(-45deg);
    }
  }
  .status-wrap {
    text-align: center;
    margin-bottom: 10px;
    span {
      margin: 0 5px;
    }
  }
}
</style>
