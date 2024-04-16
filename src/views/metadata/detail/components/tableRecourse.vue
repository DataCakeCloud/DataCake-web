<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">表血缘</div>
      </div>
    </div>
    <div class="detial-box">
      <!-- <div class="select-box">
        <div class="select-item">
          <span>上游表深度</span>
          <el-select v-model="params.beforeDepth" placeholder="上游表深度" :disabled="loading" @change="handleChangeUpDeep">
            <template v-for="(item, index) in deepList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </div>
        <div class="select-item">
          <span>下游表深度</span>
          <el-select v-model="params.afterDepth" placeholder="下游表深度" :disabled="loading" @change="handleChangeDownDeep">
            <template v-for="(item, index) in deepList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </div>
      </div> -->
      <div ref="myPage" v-loading="loading" class="recourse-box">
        <div class="recourse-tips">
          <el-alert title="点击连线可查看作业信息;点击表名跳转到对应的详情页面;" type="info" :closable="false" show-icon> </el-alert>
          <div class="tips-rh">
            <div class="tips-item">
              <i class="line"></i>
              <span class="el-icon-arrow-right"></span>
              <span class="tips-text">加工过程</span>
            </div>
            <div class="tips-item">
              <svg-icon class="self_icon" icon-class="circulate"></svg-icon>
              <span class="tips-text">自依赖</span>
            </div>
          </div>
        </div>
        <div class="recourse-map">
          <el-empty v-if="!groupData.rootId" description="暂无数据"></el-empty>
          <SeeksRelationGraph ref="seeksRelationGraph" class="seeksRelationGraph" :options="graphOptions" :on-node-click="onNodeClick" :on-line-click="onLineClick">
            <div slot="node" slot-scope="{ node }" :class="['node_item', { current_item: node.data.id === groupData.rootId }, { [node.data.position]: node.data.isBoundary }]">
              <div class="content">
                <span v-if="node.data.id === groupData.rootId" class="lf-num">
                  {{ countLineNum(node.data, 'up') || 0 }}
                </span>
                <el-tooltip placement="top" :disabled="isTipDisabled" :enterable="false" :content="node.data.qn.split('.').slice(1).join('.') || '-'">
                  <div class="table_name ellipsis" @mouseenter="isShowTooltip">
                    {{ node.data.qn.split('.').slice(1).join('.') }}
                  </div>
                </el-tooltip>
                <svg-icon v-if="node.data.isSelfDepent" class="self_depent" icon-class="circulate" @click.stop="handelRelations(node.data, $event)"></svg-icon>
                <span v-if="node.data.id === groupData.rootId" class="rg-num">
                  {{ countLineNum(node.data, 'down') || 0 }}
                </span>
              </div>
              <i v-if="node.data.isBoundary" :class="['el-icon-circle-plus-outline', 'add_icon', node.data.position]" @click.stop="addNode(node.data)"></i>
            </div>
          </SeeksRelationGraph>
        </div>
      </div>
    </div>
    <!-- 弹框 -->
    <MyDial v-bind="dialOption" :show-move-com="showMoveCom" @clickMask="clickMask">
      <div v-loading="lineDataLoading" class="dial-content">
        <div v-for="(item, index) in lineDataList" :key="index" class="dial-box">
          <div class="dial-item">
            <span class="label">任务ID: </span>
            <span class="value">
              {{ item.jobId || '-' }}
            </span>
          </div>
          <div v-if="item.jobName" class="dial-item">
            <span class="label">任务名称: </span>
            <span class="value task-name" @click="jump(item)">
              {{ item.jobName || '-' }}
            </span>
          </div>
          <div class="dial-item">
            <span class="label">最近执行时间: </span>
            <span class="value">{{ $utils.parseTime(item.startTime) || '-' }}</span>
          </div>
          <div class="dial-item">
            <span class="label">执行SQL: </span>
            <span class="value cell-ellipsis3 task-sql">{{ item.sql || '-' }}</span>
          </div>
        </div>
      </div>
    </MyDial>
  </div>
</template>

<script>
import MyDial from '@/components/MyDial';
import { getLineageGraph, getLineageFact } from '@/api/metadata';
import SeeksRelationGraph from 'relation-graph';

export default {
  name: 'TableRecourse',
  components: {
    SeeksRelationGraph,
    MyDial
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
      upRelation: null,
      downRelation: null,
      isShowCodePanel: false,
      graphOptions: {
        disableZoom: true,
        // allowShowDownloadButton: false, // 下载图片按钮是否隐藏
        moveToCenterWhenRefresh: true,
        useAnimationWhenRefresh: true,
        // disableLineClickEffect: true, // 禁止选中之后的效果
        zoomToFitWhenRefresh: false,
        defaultJunctionPoint: 'lr',
        defaultExpandHolderPosition: 'bottom',
        layouts: [
          {
            label: '中心',
            layoutName: 'tree',
            layoutClassName: 'seeks-layout-center',
            defaultJunctionPoint: 'border',
            from: 'left',
            max_per_width: 360,
            min_per_height: 100
          }
        ],
        defaultLineMarker: {
          markerWidth: 20,
          markerHeight: 20,
          refX: 6,
          refY: 6,
          data: 'M2,2 L10,6 L2,10 L6,6 L2,2'
        },
        defaultLineWidth: 2,
        defaultNodeShape: 1,
        defaultNodeWidth: '200',
        defaultNodeHeight: '36',
        defaultLineShape: 6,
        defaultLineColor: '#3782ff',
        defaultNodeColor: '#ffffff'
      },
      showMoveCom: false,
      dialOption: {
        top: '0',
        left: '0'
      },
      lineDataList: [],
      lineDataLoading: false,
      isTipDisabled: true,
      groupData: {}
    };
  },
  created() {
    this.getLineageGraph();
  },
  methods: {
    countLineNum(data, type) {
      if (type === 'up') {
        return this.groupData.links.filter(item => item.to === data.id).length;
      } else {
        return this.groupData.links.filter(item => item.from === data.id).length;
      }
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
        const currentData = this.groupData.nodes.find(item => item.id === data.id);
        currentData.isBoundary = false;

        // 没有数据
        if (!nodes) return;

        // 格式化数据
        links.forEach(item => {
          item.from = item.from.toString();
          item.to = item.to.toString();
          item.data = JSON.parse(JSON.stringify(item));
        });
        const index = data.links?.findIndex(item => item.from === item.to);
        if (index > -1) data.links[index].isHide = true;
        nodes.forEach(item => {
          item.id = item.id.toString();
          item.position = data.position;
          item.data = item;
          // 设置node 关系
          const currentIndex = this.groupData.nodes.findIndex(val => val.id === item.id);
          if (currentIndex === -1) {
            item.isBoundary = true;
            this.groupData.nodes.push(item);
          }
        });

        this.groupData.nodes.forEach(node => {
          // 删除插件生成的数据
          delete node.flated;
        });

        // 添加新增关系
        links.forEach(item => {
          const currentIndex = this.groupData.links.findIndex(val => val.from === item.from && val.to === item.to);
          if (currentIndex === -1) {
            this.groupData.links.push(item);
          }
        });

        this.$refs.seeksRelationGraph.setJsonData(this.groupData, seeksRGGraph => {
          // this.$refs.seeksRelationGraph.focusRootNode();
        });
      });
    },
    jump(data) {
      window.open(`${this.$locationOrigin}/task/detail?id=${data.jobId}&name=${data.jobName}`, '_blank');
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
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
    handelRelations(data, e) {
      const currentJobFactId = this.groupData.links.find(item => item.from === data.id.toString() && item.to === data.id.toString()).jobFactId;
      this.setDialPosition(e);
      this.showMoveCom = true;
      this.getLineageFact(currentJobFactId);
    },
    getLineageFact(jobFactId, lineNum = 0) {
      this.lineDataList = [];
      this.lineDataLoading = true;
      const params = {
        jobFactId
      };
      getLineageFact(params)
        .then(res => {
          this.$set(this.lineDataList, lineNum, res.data || {});
        })
        .finally(_ => {
          this.lineDataLoading = false;
        });
    },
    getTaskDetail(item) {
      // task/detail?id=197&name=dws_beyla_device_active_agg_inc_daily
      return `${this.$locationOrigin}/task/detail?id=${item.taskId}&name=${item.taskName}`;
    },
    handleChangeUpDeep() {
      this.getLineageGraph();
    },
    handleChangeDownDeep() {
      this.getLineageGraph();
    },
    getLineageGraph() {
      this.loading = true;
      getLineageGraph(this.params)
        .then(res => {
          const data = res.data || {};
          data.rootId += '';
          this.setNodeData(data);
          this.groupData = data;
          this.$refs.seeksRelationGraph.setJsonData(this.groupData, seeksRGGraph => {
            this.$refs.seeksRelationGraph.focusRootNode();
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    setNodeData(data = {}) {
      const { nodes, links, rootId } = data;
      links?.forEach(item => {
        item.from = item.from.toString();
        item.to = item.to.toString();
        item.data = JSON.parse(JSON.stringify(item));
      });
      const index = links?.findIndex(item => item.from === item.to);
      let selfLineData = {};
      if (index > -1) {
        selfLineData = links[index];
        links[index].isHide = true;
      }
      nodes?.forEach(item => {
        item.id = item.id.toString();
        item.data = item;
        item.isSelfDepent = item.id === selfLineData.from;
        item.isBoundary = item.id !== rootId;
        item.position = links.some(val => val.from === item.id) ? 'up' : 'down';
      });
      data.nodes = nodes || [];
      data.links = links || [];
    },
    refresh() {
      if (!this.groupData.rootId) return;
      this.$nextTick(() => {
        this.$refs.seeksRelationGraph?.refresh();
      });
    },
    onNodeClick(nodeObject, e) {
      if (Array.from(e.target?.classList || []).includes('add_icon')) return;
      if (this.groupData.rootId === nodeObject.data.id) return;
      const [region, databaseName, tableName] = nodeObject.data.qn.split('.');
      window.open(`${this.$locationOrigin}/meta/detail?region=${region}&databaseName=${databaseName}&tableName=${tableName}&type=tableRecourse`);
      console.log('onNodeClick:', nodeObject);
    },
    onLineClick(lineObject, node, e) {
      console.log('onLineClick:', lineObject, node, e);
      const relations = node.relations;
      const jobFactIdList = relations.map(item => item.data.jobFactId);
      if (!jobFactIdList.every(item => item)) {
        console.log(node, e, '数据错误');
        return;
      }
      this.setDialPosition(e);
      this.showMoveCom = true;
      jobFactIdList.forEach((id, i) => {
        this.getLineageFact(id, i);
      });
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
.seeksRelationGraph {
  ::v-deep {
    .node_item {
      position: relative;
      height: 100%;
      background-color: #fff !important;
      border: 1px solid #d1d7e6 !important;
      border-radius: 15px;
      padding: 2px;
      &.current_item {
        background-color: $c-primary !important;
        .content {
          .lf-num,
          .rg-num {
            background-color: #fff;
            color: #000;
          }
          .table_name {
            cursor: default;
            color: #fff;
          }
        }
      }
      &.up {
        margin-left: 25px;
      }
      &.down {
        margin-right: 25px;
      }
      .content {
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .lf-num,
        .rg-num {
          display: inline-block;
          padding: 0 5px;
          height: 20px;
          line-height: 18px;
          border: 1px solid $c-primary;
          border-radius: 10px;
          color: #000;
          flex-shrink: 0;
        }
        .lf-num {
          margin-right: 5px;
        }
        .rg-num {
          margin-left: 5px;
        }
      }
      .table_name {
        color: $c-primary;
        padding: 0 2px;
        text-align: center;
        width: 100%;
        cursor: pointer;
      }
      .self_depent {
        font-size: $global_font_size-18;
        cursor: pointer;
        // color: #ffe900;
      }
      .add_icon {
        cursor: pointer;
        color: #666;
        position: absolute;
        bottom: 6px;
        font-size: $global-font-size-20;
        &.up {
          left: -25px;
        }
        &.down {
          right: -25px;
        }
      }
    }
    .rel-node.rel-node-type-node,
    .rel-node.rel-node-checked {
      border: none !important;
      box-shadow: none !important;
      padding: 0;
    }
    .rel-node-peel {
      .c-btn-open-close {
        z-index: -1;
        & > span {
          background-color: $c-primary !important;
        }
      }
    }
    .c-rg-line:hover {
      cursor: pointer;
      stroke-width: 4px !important;
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
  .dial-box {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
    .dial-item:not(:last-child) {
      margin-bottom: 10px;
    }
    .dial-item {
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
    }
    .label {
      margin-right: 5px;
      white-space: nowrap;
    }
  }
}
.seeksRelationGraph {
  .c-rg-line-checked {
    stroke-dasharray: 0 !important;
  }
}
</style>
