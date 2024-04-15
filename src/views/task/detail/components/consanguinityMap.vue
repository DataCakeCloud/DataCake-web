<template>
  <div ref="wrap" class="wrap">
    <div class="search_top">
      <div class="item">
        <span class="lable">实例时间 : </span>
        <el-select v-model="params.execution_date" v-loadMore="{ fn: loadMore, selector: '.el-select-dropdown .el-select-dropdown__wrap' }" :disabled="loading" placeholder="当前任务对应的实例时间" @change="getData">
          <el-option v-for="item in options" :key="item" :label="item" :value="item"> </el-option>
        </el-select>
      </div>
      <div class="item">
        <!-- <span class="lable">上/下游 : </span> -->
        <el-radio-group v-model="params.upDown" :disabled="loading" size="mini" @change="getData">
          <el-radio-button :label="1">上 游</el-radio-button>
          <el-radio-button :label="2">下 游</el-radio-button>
        </el-radio-group>
      </div>
      <div class="item">
        <span class="lable">血缘深度 : </span>
        <el-input-number v-model="depth" :disabled="loading" :min="1" :max="10" @change="depthChange"></el-input-number>
      </div>
    </div>
    <div class="content">
      <div class="tool">
        <div class="lf">
          <el-tooltip effect="dark" content="刷新" placement="top">
            <i class="el-icon-refresh" @click="getData"></i>
          </el-tooltip>
          <span class="inner">内部数据</span>
          <span class="outer">外部数据</span>
        </div>
        <div class="legend">
          <i>
            <btns v-for="item in btnsOptions" :key="item.text" :info="item" />
          </i>
        </div>
      </div>
      <div class="content_box">
        <Diagram v-if="errorData.instance && errorData.instance.length" ref="Diagram" :graph-options="graphOptions" :relational-data="errorData" :node-style-fn="nodeClass">
          <div slot="node" slot-scope="{ node }">
            <el-tooltip effect="dark" placement="top">
              <div slot="content" class="data-tooltip">
                <div v-if="!node.data.isExternal">任务名称：{{ node.data.dagId }}</div>
                <div>数据集类型：{{ node.data.isExternal ? '外部' : '内部' }}</div>
                <div>数据集名称：{{ node.data.metadataId }}</div>
                <template v-if="node.data.isExternal">
                  <div>检查路径：{{ node.data.checkPath || '-' }}</div>
                  <div>就绪时间：{{ node.data.successDate || '-' }}</div>
                </template>
                <template v-else>
                  <!-- <div>任务负责人：{{ node.data.owner || '-' }}</div> -->
                  <div>任务开始时间：{{ node.data.start_date || '-' }}</div>
                  <div>任务结束时间：{{ node.data.end_date || '-' }}</div>
                </template>
              </div>
              <div class="DAG_box" @contextmenu.prevent="onContextmenu($event, node.data)">
                <div v-if="node.data.recursion">该节点代表该依赖链路上被省略的中间实例</div>
                <template v-else>
                  <div class="title" @click="handelTitle(jumpUrl(node.data), node.data.task_id, node.data.dagId)">
                    <span>{{ node.data.dagId || '.... ....' }}</span>
                    <svg-icon v-bind="titleIcon(node.data)"></svg-icon>
                  </div>
                  <div>
                    任务id:
                    {{ node.data.task_id || '-' }}
                    <span v-if="node.data.nodeId === errorData.coreTaskId">(当前实例)</span>
                  </div>
                  <div>{{ node.data.isExternal ? '数据日期' : '实例日期' }}: {{ node.data.executionDate || '-' }}</div>
                  <div>{{ nodeState(node.data).title }}: {{ nodeState(node.data).executionDate }}</div>
                  <div class="ellipsis">{{ node.data.isExternal ? '数据集owner' : '任务owner' }}: {{ node.data.owner || '-' }}</div>
                </template>
              </div>
            </el-tooltip>
          </div>
        </Diagram>
        <el-empty v-else v-loading="loading" description="暂无数据"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import Diagram from '@/components/Diagram';
import btns from './components/btns.vue';
import { mapGetters, mapMutations } from 'vuex';
import { getSnapshotList, getLineageData } from '@/api/taskDetail2'; // getUrl,
import { clearTask, stopTaskInstace, diagnoseError } from '@/api/taskDetail'; // getUrl,

export default {
  components: {
    Diagram,
    btns
  },
  props: {
    checkUpParams: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      graphOptions: {
        defaultJunctionPoint: 'border',
        disableZoom: true,
        moveToCenterWhenRefresh: true,
        useAnimationWhenRefresh: true,
        zoomToFitWhenRefresh: false,
        // allowShowDownloadButton:false, 是否显示下载按钮
        layouts: [
          {
            label: '中心',
            layoutName: 'tree',
            layoutClassName: 'seeks-layout-center',
            from: 'left',
            max_per_width: 370,
            min_per_height: 160,
            centerOffset_x: 0
          }
        ],
        defaultLineShape: 2,
        defaultNodeShape: 1,
        defaultLineWidth: 2,
        defaultLineColor: '#5f95ff',
        defaultLineMarker: {
          markerWidth: 18,
          markerHeight: 18,
          refX: 6,
          refY: 6,
          data: 'M2,2 L10,6 L2,10 L6,6 L2,2'
        }
      },
      name: this.$route.query.name,
      taskId: this.$route.query.id,
      isCheckUpstream: true,
      params: {
        execution_date: '',
        upDown: 1
      },
      depth: 3,
      options: [],
      btnsOptions: [
        { text: '下线', color: '#909399' },
        { text: '检查上游', color: '#d7bdf2' },
        { text: '排队中', color: '#87e0f0' },
        { text: '运行中', color: '#3782ff' },
        { text: '成功', color: '#67c23a' },
        { text: '失败', color: '#f10d15' }
      ],
      errorData: {},
      debounceDepthFn: null,
      loading: false,
      execution_date: '',
      endDateType: false,
      contentWidth: 0
    };
  },
  computed: {
    ...mapGetters(['taskPageOptions']),
    treeNodeWidth() {
      let resultWidth = 0;
      if (this.params.upDown === 1) {
        // 上游
        const width = this.contentWidth ? (this.contentWidth / 20) * 13 : 800;
        resultWidth = width;
      } else {
        // 下游
        // let width = this.contentWidth ? this.contentWidth / 30 * 1 : 50;
        resultWidth = 50;
      }
      return resultWidth;
    }
  },
  watch: {
    treeNodeWidth: {
      handler(data) {
        this.graphOptions.layouts[0].centerOffset_x = data;
        const Diagram = this.$refs.Diagram;
        if (Diagram) {
          // Diagram.showSeeksGraph()
        }
      },
      immediate: true
    }
  },
  async created() {
    this.debounceDepthFn = this.$utils.debounce(this.getData, 500);
    if (this.taskPageOptions[`data${this.name}`]) {
      Object.keys(this.taskPageOptions[`data${this.name}`]).forEach(key => {
        if (key === 'debounceDepthFn' || key === 'loading') return;
        this[key] = this.taskPageOptions[`data${this.name}`][key];
        if (key === 'errorData' && !this.taskPageOptions[`data${this.name}`][key].coreTaskId && this.options.length) this.getData();
      });
    } else {
      const res = await await this.getSnapshotList();
      if (!res || res.length === 0) return;
      this.getData();
    }
  },
  mounted() {
    this.contentWidth = this.$refs.wrap?.clientWidth || 0;
    window.onresize = () => {
      this.contentWidth = this.$refs.wrap?.clientWidth || this.contentWidth || 0;
    };
  },
  destroyed() {
    this.SET_TASKPAGEOPTIONS({
      tabs: `data${this.name}`,
      ...this._data
    });
  },
  methods: {
    ...mapMutations(['SET_TASKPAGEOPTIONS']),
    jumpUrl(data) {
      return !data.recursion && !data.isExternal ? '/task/detail' : '';
    },
    executeTaxk(data, type) {
      const params = {
        name: data.dagId,
        executionDate: data.executionDate,
        status: type
      };
      stopTaskInstace(params).then(res => {
        this.dialogVisible = false;
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        const taskStatus = type ? 'success' : 'failed';
        data.state = taskStatus;
        this.$refs.Diagram.showSeeksGraph();
      });
    },
    // 重算
    repeatCalc(data) {
      this.$confirm('确定重算?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.saveClear(data);
        })
        .catch(() => {});
    },
    saveClear(data) {
      clearTask({
        name: data.dagId,
        executionDate: this.$utils.parseTime(data.executionDate),
        isCheckUpstream: this.isCheckUpstream
      }).then(res => {
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        this.dialogVisibleClear = false;
        data.state = 'waiting';
        this.$refs.Diagram.showSeeksGraph();
      });
    },
    // 右键实例
    onContextmenu(event, data) {
      const items = [
        {
          label: '重算',
          disabled: data.state === 'waiting' || data.state === 'waiting_queue',
          onClick: () => {
            this.repeatCalc(data);
          }
        },

        {
          label: '置为成功',
          onClick: () => {
            this.executeTaxk(data, 1);
          }
        },
        {
          label: '置为失败',
          onClick: () => {
            this.executeTaxk(data, 0);
          }
        }
      ];
      this.$contextmenu({
        items,
        event,
        zIndex: 2200,
        minWidth: 50
      });
      event.preventDefault();
    },
    // 实例title跳转
    handelTitle(url, id, name) {
      if (!id || !name) return;
      const href = this.$router.resolve({
        path: url,
        query: {
          id,
          name
        }
      }).href;
      window.open(href, '_blank');
    },
    // 时间下拉框加载更多
    loadMore() {
      this.execution_date = this.options.length > 0 ? this.options[this.options.length - 1] : '';
      this.getSnapshotList();
    },
    // 获取实例日期列表
    getSnapshotList() {
      if (this.endDateType) return;
      const params = {
        name: this.name,
        execution_date: this.execution_date
      };
      return getSnapshotList(params).then(res => {
        const data = res.data;
        if (!this.execution_date) {
          this.options = data || [];
          this.params.execution_date = this.options[0];
          if (data && data.length < 20) this.endDateType = true;
          return data;
        } else {
          this.options.push(...data);
          this.execution_date = data[data.length - 1];
          if (data && data.length < 20) this.endDateType = true;
          return data;
        }
      });
    },
    // 深度改变
    depthChange() {
      if (this.options.length === 0) return;
      this.debounceDepthFn && this.debounceDepthFn();
    },
    // 实例图标处理
    titleIcon(data) {
      let res = {};
      if (!data.online) {
        res = {
          'icon-class': 'taskWaiting',
          style: 'color:#909399'
        };
      } else if (data.state === 'failed' || data.state === 'termination') {
        res = {
          'icon-class': 'taskError',
          style: 'color:#f10d15'
        };
      } else if (data.state === 'success') {
        res = {
          'icon-class': 'taskSuccess',
          style: 'color:#67c23a'
        };
      } else if (data.state === 'waiting') {
        res = {
          'icon-class': 'taskWaiting',
          style: 'color:#d7bdf2'
        };
      } else if (data.state === 'waiting_queue') {
        res = {
          'icon-class': 'taskWaiting',
          style: 'color:#87e0f0'
        };
      } else if (data.state === 'running' || data.state === 'up_for_retry') {
        res = {
          'icon-class': 'taskInfo',
          style: 'color:$c-primary'
        };
      }
      return res;
    },
    nodeState(data) {
      const stateData = { title: '-', executionDate: '-' };
      if (data.state === 'waiting' || data.state === 'waiting_queue') {
        stateData.title = data.isExternal ? '未就绪 ' : '检查上游';
        stateData.executionDate = data.duration || '-';
      } else if (data.state === 'running' || data.state === 'up_for_retry') {
        stateData.title = '运行中';
        stateData.executionDate = data.duration || '-';
      } else if (data.state === 'success') {
        stateData.title = data.isExternal ? '已就绪 ' : '执行成功';
        stateData.executionDate = data.duration || '-';
      } else if (data.state === 'failed' || data.state === 'termination') {
        stateData.title = '执行失败';
        stateData.executionDate = data.duration || '-';
      }
      return stateData;
    },
    nodeClass(data) {
      // let className = data.ready ? 'success-color' : 'warning-color';
      let className;
      if (!data.online) {
        className = 'offline-color';
      } else if (data.state === 'waiting') {
        className = 'waiting-color';
      } else if (data.state === 'waiting_queue') {
        className = 'waiting-queue';
      } else if (data.state === 'running' || data.state === 'up_for_retry') {
        className = 'running-color';
      } else if (data.state === 'success') {
        className = 'success-color';
      } else if (data.state === 'failed' || data.state === 'termination') {
        className = 'failed-color';
      }
      if (data.nodeId === this.errorData.coreTaskId) {
        className += ' bold';
      }
      // if (data.recursion) {
      //   className += ' width100';
      // }
      if (data.isExternal) {
        className += ' dash-border';
      }
      return className;
    },
    getData() {
      this.loading = true;
      this.errorData = {};
      if (!this.checkUpParams.name) {
        getLineageData({
          name: this.name,
          // state: 'waiting',
          ...this.params,
          depth: this.depth
        })
          .then(res => {
            const data = res.data;
            this.errorData = data || {};
            this.$refs.Diagram?.showSeeksGraph();
          })
          .finally(() => {
            this.loading = false;
            this.$refs.dag?.format();
          });
      } else {
        diagnoseError({ ...this.checkUpParams }).then(res => {
          const data = res.data;
          this.errorData = data;
          this.$refs.Diagram?.showSeeksGraph();
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  .search_top {
    display: flex;
    justify-content: end;
    .item {
      margin-left: 10px;
      line-height: 32px;
    }
  }
  .content {
    // min-height: calc(100vh - 233px);
    margin: 15px -12px -12px -12px;
    padding: 10px;
    border: 1px solid #eaf0f7;
    position: relative;
    .tool {
      position: absolute;
      top: 10px;
      width: 100%;
      span {
        display: inline-block;
        border: 2px solid #686868;
        padding: 4px 8px;
        border-radius: 5px;
      }
      .lf {
        float: left;
        display: flex;
        align-content: center;
        .outer {
          margin-left: 10px;
          border-style: dashed;
        }
        .el-icon-refresh {
          font-size: $global-font-size-24;
          cursor: pointer;
          margin-right: 15px;
          line-height: 28px;
          color: $c-primary;
        }
      }
      .legend {
        text-align: center;
        i {
          font-style: normal;
          display: inline-block;
          transform: translateX(-100px);
        }
        span {
          &:not(:last-child) {
            margin-right: 10px;
          }
        }
      }
    }
    .content_box {
      min-height: 650px;
      height: calc(100vh - 255px);
      padding-top: 32px;
      ::v-deep .c-mini-toolbar {
        margin-top: 20px !important;
      }
      .el-empty {
        width: 100%;
        padding: 60px 0;
      }
    }
  }
}
.DAG_box {
  width: 100%;
  overflow: hidden;
  cursor: move;
  .title {
    display: flex;
    width: 100%;
    font-size: $global-font-size-14;
    font-weight: 700;
    border-bottom: 1px solid #bababc;
    color: #000;
    cursor: pointer;
    padding-bottom: 2px;
    text-align: left;
    span {
      display: inline-block;
      width: 90%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  & > div {
    font-size: $global-font-size-12;
    text-align: left;
    padding: 0 4px;
    color: #83807f;
    margin-top: 3px;
    &:last-child {
      margin-bottom: 3px;
    }
  }
}
.data-tooltip {
  & > div:not(:first-child) {
    margin-top: 4px;
  }
}
</style>
<style lang="scss" scoped>
::v-deep .success-color {
  background-color: #fff !important;
  border: 2px solid #67c23a !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .waiting-color {
  background-color: #fff !important;
  border: 2px solid #d7bdf2 !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .waiting-queue {
  background-color: #fff !important;
  border: 2px solid #87e0f0 !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .running-color {
  background-color: #fff !important;
  border: 2px solid $c-primary !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .failed-color {
  background-color: #fff !important;
  border: 2px solid #f10d15 !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .offline-color {
  background-color: #fff !important;
  border: 2px solid #909399 !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .warning-color {
  background-color: #fff !important;
  border: 2px solid #f3dd07 !important;
  border-top-width: 6px !important;
  padding: 0;
  .label {
    color: #333 !important;
  }
}
::v-deep .success-bg {
  background-color: #f0f9eb !important;
}
::v-deep .warning-bg {
  background-color: #fdf6ec !important;
}
::v-deep .bold {
  font-weight: bold !important;
}
::v-deep .dash-border {
  border-style: dashed !important;
  border-top-style: solid !important;
}
</style>
