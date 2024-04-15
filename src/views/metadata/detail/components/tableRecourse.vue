<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">表血缘</div>
      </div>
    </div>
    <div class="detial-box">
      <div ref="myPage" v-loading="loading" class="recourse-box">
        <div class="recourse-tips">
          <el-alert title="点击连线可查看作业信息;点击表名跳转到对应的详情页面;" type="info" :closable="false" show-icon> </el-alert>
          <div class="tips-rh">
            <div class="tips-item">
              <i class="line"></i>
              <span class="el-icon-arrow-right"></span>
              <span class="tips-text">加工过程</span>
            </div>
          </div>
        </div>
        <div class="recourse-map">
          <el-empty v-if="!(graphData.nodes && graphData.nodes.length)" description="暂无数据"></el-empty>
          <Graph ref="flowContent" :data="graphData" :is-show-minmap="true" @node-click="nodeClick" @edge-click="edgeClick"></Graph>
        </div>
      </div>
    </div>
    <!-- 弹框 -->
    <MyDial v-bind="dialOption" :show-move-com="showMoveCom" @clickMask="clickMask">
      <div v-loading="lineDataLoading" class="dial-content">
        <div class="dial-item">
          <span class="label">任务ID: </span>
          <span class="value">
            {{ lineData.jobId || '-' }}
          </span>
        </div>
        <div v-if="lineData.jobName" class="dial-item">
          <span class="label">任务名称: </span>
          <span class="value task-name" @click="jump(lineData)">
            {{ lineData.jobName || '-' }}
          </span>
        </div>
        <div class="dial-item">
          <span class="label">最近执行时间: </span>
          <span class="value">{{ $utils.parseTime(lineData.startTime) || '-' }}</span>
        </div>
        <div class="dial-item">
          <span class="label">执行SQL: </span>
          <span class="value cell-ellipsis3 task-sql">{{ lineData.sql || '-' }}</span>
        </div>
      </div>
    </MyDial>
  </div>
</template>

<script>
import MyDial from '@/components/MyDial';
import { getLineageGraph, getLineageFact } from '@/api/metadata';
import Graph from '../../Graph';

export default {
  name: 'TableRecourse',
  components: {
    MyDial,
    Graph
  },
  props: {
    activeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      deepList: [1, 2, 3, 4, 5],
      params: {
        region: this.$route.query.region,
        dbName: this.$route.query.databaseName,
        tableName: this.$route.query.tableName,
        beforeDepth: 1,
        afterDepth: 1,
        objectType: 'TABLE',
        lineageType: 'TABLE_DEPEND_TABLE'
      },
      showMoveCom: false,
      dialOption: {
        top: '0',
        left: '0'
      },
      lineData: {},
      lineDataLoading: false,
      graphData: {
        nodes: [],
        edges: []
      },
      once: true,
      graphWidth: 0,
      graphHeight: 0
    };
  },
  watch: {
    activeName(name) {
      if (name === 'tableRecourse' && this.once) {
        this.init();
      } else if (name === 'tableRecourse') {
        const Dom = this.$refs.flowContent.$el.querySelector('.x6-graph-scroller.x6-graph-scroller-pannable');
        if (Dom) {
          Dom.style.width = this.graphWidth + 'px';
          Dom.style.height = this.graphHeight + 'px';
        }
      }
    }
  },
  mounted() {
    if (this.activeName === 'tableRecourse') {
      this.init();
    }
  },
  methods: {
    init() {
      this.once = false;
      this.graphWidth = this.$refs.flowContent.$el.offsetWidth;
      this.graphHeight = this.$refs.flowContent.$el.offsetHeight;
      this.$refs.flowContent.init(this.graphWidth, this.graphHeight);
      this.getLineageGraph();
    },
    edgeClick(e, relations) {
      const jobFactId = relations.data.jobFactId;
      if (!jobFactId) {
        console.log(relations, e, '数据错误');
        return;
      }
      this.setDialPosition(e);
      this.showMoveCom = true;
      this.getLineageFact(jobFactId);
    },
    nodeClick(e, node) {
      const targetClassList = Array.from(e.target.classList);
      if (targetClassList.includes('add_icon')) {
        this.addNode(node.data);
      } else if (targetClassList.includes('table_name')) {
        !node.data.isRootId && this.jumpTable(node.data);
      }
    },
    getData() {
      this.activeName === 'tableRecourse' && this.getLineageGraph();
    },
    addNode(data) {
      const [region, dbName, tableName] = data.qn.split('.') || [];
      const params = {
        region,
        dbName,
        tableName,
        objectType: 'TABLE',
        lineageType: 'TABLE_DEPEND_TABLE'
      };
      if (data.position === 'up') {
        params.beforeDepth = 1;
        params.afterDepth = 0;
      } else {
        params.afterDepth = 1;
        params.beforeDepth = 0;
      }
      getLineageGraph(params).then(res => {
        const { nodes, links } = res.data || {};

        // 去除当前节点的边界条件
        const currentData = this.graphData.nodes.find(item => item.id === data.id);
        currentData.isBoundary = false;
        currentData.data.isBoundary = false;

        // 没有数据
        if (!nodes) {
          // 重新渲染更新边界按钮
          this.$refs.flowContent?.render();
          return;
        }

        // 格式化数据
        links.forEach(item => {
          const result = {};
          result.source = item.from.toString();
          result.target = item.to.toString();
          result.shape = 'light-edge';
          result.data = Object.assign(result, item);
          if (this.graphData.edges.some(v => v.source === result.source && v.target === result.target)) {
            return;
          } else {
            if (result.source === result.target) {
              return;
            }
            this.graphData.edges.push(result);
          }
        });
        nodes.forEach(item => {
          item.id = item.id.toString();
          item.shape = 'table-node';
          item.width = 280;
          item.height = 52;
          item.position = data.position;
          item.isRootId = false;
          item.isBoundary = true;
          item.data = { ...item };

          // 设置node 关系
          const currentIndex = this.graphData.nodes.findIndex(val => val.id === item.id);
          if (currentIndex === -1) {
            this.graphData.nodes.push(item);
          }
        });

        this.$refs.flowContent?.render();
      });
    },
    jump(data) {
      window.open(`${this.$locationOrigin}/task/detail?id=${data.jobId}&name=${data.jobName}`, '_blank');
    },
    clickMask() {
      this.showMoveCom = false;
    },
    setDialPosition(e) {
      let top = e.clientY + 20;
      let left = e.clientX + 20;
      const { clientHeight, clientWidth } = document.documentElement;
      if (clientHeight - top - 300 < 0) {
        top = top + (clientHeight - top - 300);
      }
      if (clientWidth - left - 400 < 0) {
        left = left + (clientWidth - left - 400);
      }

      this.dialOption.top = top + 'px';
      this.dialOption.left = left + 'px';
    },
    getLineageFact(jobFactId) {
      this.lineData = {};
      this.lineDataLoading = true;
      const params = {
        jobFactId
      };
      getLineageFact(params)
        .then(res => {
          this.lineData = res.data || {};
        })
        .finally(_ => {
          this.lineDataLoading = false;
        });
    },
    getTaskDetail(item) {
      // task/detail?id=197&name=dws_beyla_device_active_agg_inc_daily
      return `${this.$locationOrigin}/task/detail?id=${item.taskId}&name=${item.taskName}`;
    },
    getLineageGraph() {
      this.loading = true;
      getLineageGraph(this.params)
        .then(res => {
          const data = res.data || {};
          data.rootId += '';
          data.edges = data.links.map(item => {
            item.source = item.from.toString();
            item.target = item.to.toString();
            item.shape = 'light-edge';
            item.data = { ...item };
            return item;
          });
          data.nodes.forEach(item => {
            item.id += '';
            item.shape = 'table-node';
            item.width = 280;
            item.height = 52;
            item.isRootId = item.id === data.rootId;
            item.upNum = data.edges.filter(val => val.target === item.id).length;
            item.downNum = data.edges.filter(val => val.source === item.id).length;
            item.isBoundary = item.id !== data.rootId;
            item.position = data.edges.some(val => val.source === item.id) ? 'up' : 'down';
            item.data = { ...item };
          });
          this.graphData = {
            edges: data.edges,
            nodes: data.nodes
          };
        })
        .finally(() => {
          this.loading = false;
        });
    },
    jumpTable(data) {
      const [region, databaseName, tableName] = data.qn.split('.');
      window.open(`${this.$locationOrigin}/meta/detail?region=${region}&databaseName=${databaseName}&tableName=${tableName}&type=tableRecourse`);
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
.detial-box {
  padding: 0 10px;
}
.select-box {
  display: flex;
  align-items: center;
  .select-item {
    margin-right: 20px;
    span {
      margin-right: 5px;
    }
  }
}
.recourse-box {
  .recourse-tips {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    .el-alert {
      display: inline-flex;
      width: auto;
      border: 1px solid #91d5ff;
      background: #e6f7ff !important;
      color: #666 !important;
      padding: 4px;
      ::v-deep {
        .el-alert__icon {
          color: #108ee9;
        }
      }
    }
    .tips-rh {
      display: flex;
      .tips-item {
        display: flex;
        align-items: center;
        margin-left: 20px;
        color: $c-primary;
      }
      .tips-text {
        margin-left: 5px;
        color: #333;
      }
      i {
        display: inline-block;
        width: 14px;
        height: 14px;
      }
      .line {
        width: 60px;
        height: 1px;
        background-color: $c-primary;
      }
      .el-icon-arrow-right {
        margin-left: -5px;
      }
    }
  }
  .recourse-map {
    height: calc(100vh - 190px);
    border: 1px solid #ebebeb;
    position: relative;
    .el-empty {
      position: absolute;
      width: 100%;
      top: 20px;
      left: 0;
      z-index: 11;
    }
  }
}
.tip-list {
  .list-item {
    display: flex;
    line-height: 23px;
  }

  .sub-title {
    min-width: 100px;
    font-weight: 500;
  }

  .sub-list {
    width: 150px;

    li {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="scss">
.dial-content {
  min-width: 400px;
  min-height: 100px;
  max-width: 400px;
  max-height: 300px;
  padding: 10px;
  overflow: auto;
  background-color: rgba(33, 46, 71, 0.9);
  border-radius: 5px;
  color: #fff;
  margin-bottom: -10px;
  .dial-item {
    margin-bottom: 10px;
    display: flex;
    .cell-ellipsis3 {
      display: -webkit-box;
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .task-name {
      cursor: pointer;
      color: #00baff;
    }
    .task-sql {
      background-color: #828000;
      padding: 5px;
      border-radius: 5px;
      line-height: 20px;
    }
    .label {
      margin-right: 5px;
      white-space: nowrap;
    }
  }
}
</style>
