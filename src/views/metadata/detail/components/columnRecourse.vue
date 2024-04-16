<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">字段血缘</div>
      </div>
    </div>
    <div class="detial-box">
      <div class="select-box">
        <div class="select-lf">
          <div class="select-item">
            <span>中心字段</span>
            <el-select v-model="tableName" :disabled="loading" @change="getLineageGraph">
              <template v-for="(item, index) in colums">
                <el-option :key="index" :label="item.name" :value="item.name"></el-option>
              </template>
            </el-select>
          </div>
          <!-- <div class="select-item">
            <span>上游深度</span>
            <el-select v-model="params.beforeDepth" placeholder="上游深度" :disabled="loading" @change="getLineageGraph">
              <template v-for="(item, index) in deepList">
                <el-option :key="index" :label="item" :value="item"></el-option>
              </template>
            </el-select>
          </div>
          <div class="select-item">
            <span>下游深度</span>
            <el-select v-model="params.afterDepth" placeholder="下游深度" :disabled="loading" @change="getLineageGraph">
              <template v-for="(item, index) in deepList">
                <el-option :key="index" :label="item" :value="item"></el-option>
              </template>
            </el-select>
          </div> -->
        </div>
      </div>
      <div ref="myPage" v-loading="loading" class="recourse-box">
        <div class="recourse-tips">
          <el-alert title="点击连线可查看作业信息;点击表名跳转到对应的详情页面;" type="info" :closable="false" show-icon> </el-alert>
          <div class="tips-rh">
            <div class="tips-item">
              <i class="round"></i>
              <span class="tips-text">字段</span>
            </div>
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
                <div class="box_item">
                  <span class="node_title">hive: </span>
                  <el-tooltip placement="top" :disabled="isTipDisabled" :enterable="false" :content="node.data.qn.split('.').slice(1, 3).join('.') || '-'">
                    <div class="node_text ellipsis table-name" @mouseenter="isShowTooltip" @click="jumpTable(node.data)">
                      {{ node.data.qn.split('.').slice(1, 3).join('.') || '-' }}
                    </div>
                  </el-tooltip>
                  <el-tag v-if="node.data.isSelfDepent" class="is-slef" @click.stop="handelRelations(node.data, $event)">
                    <svg-icon icon-class="circulate"></svg-icon>
                  </el-tag>
                </div>
                <div class="box_item">
                  <span class="node_title node_title_icon round"></span>
                  <el-tooltip placement="top" :disabled="isTipDisabled" :content="node.data.qn.split('.')[3] || '-'">
                    <div class="node_text ellipsis" @mouseenter="isShowTooltip">
                      {{ node.data.qn.split('.')[3] || '-' }}
                    </div>
                  </el-tooltip>
                </div>
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
            <span class="value task-sql cell-ellipsis3">{{ item.sql || '-' }}</span>
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
  name: 'ColumnRecourse',
  components: {
    SeeksRelationGraph,
    MyDial
  },
  props: {
    colums: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      deepList: [1, 2, 3, 4, 5],
      tableName: '',
      params: {
        region: this.$route.query.region,
        dbName: this.$route.query.databaseName,
        tableName: this.$route.query.tableName,
        objectType: 'COLUMN',
        lineageType: 'FIELD_DEPEND_FIELD',
        beforeDepth: 1,
        afterDepth: 1
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
            max_per_width: 380,
            min_per_height: 130,
            centerOffset_x: 300
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
        defaultNodeWidth: '240',
        defaultNodeHeight: '65',
        defaultLineShape: 6,
        defaultLineColor: '#3782ff',
        defaultNodeColor: '#ffffff'
      },
      currentJobFactId: null,
      lineDataList: [],
      lineDataLoading: false,
      groupData: {},
      dialOption: {
        top: '0',
        left: '0'
      },
      showMoveCom: false,
      isTipDisabled: true
    };
  },
  watch: {
    colums: {
      handler: function(data) {
        if (data && data.length && !this.tableName) {
          this.tableName = data[0].name;
          this.getLineageGraph();
        }
      },
      immediate: true
    }
  },
  created() {
    // this.getLineageGraph();
  },
  methods: {
    addNode(data) {
      const [region, dbName, tableName, column] = data.qn.split('.') || [];
      const params = {
        region,
        dbName,
        tableName: tableName + '.' + column,
        objectType: 'COLUMN',
        lineageType: 'FIELD_DEPEND_FIELD'
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
    jumpTable(data) {
      if (this.groupData.rootId === data.id) return;
      const [region, databaseName, tableName] = data.qn.split('.');
      window.open(`${this.$locationOrigin}/meta/detail?region=${region}&databaseName=${databaseName}&tableName=${tableName}&type=columnRecourse`);
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
      const currentJobFactId = this.groupData.links.find(item => item.from === data.id && item.to === data.id).jobFactId;
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
    getMetaDetail(item) {
      return `${this.$locationOrigin}/meta/detail?id=${item.tableId}&region=${item.region}&databaseName=${item.databaseName}&tableName=${item.tableName}`;
    },
    getTaskDetail(item) {
      // task/detail?id=197&name=dws_beyla_device_active_agg_inc_daily
      return `${this.$locationOrigin}/task/detail?id=${item.taskId}&name=${item.taskName}`;
    },
    getLineageGraph() {
      const params = {
        ...this.params
      };
      if (this.tableName) {
        params.tableName = params.tableName + '.' + this.tableName;
      } else {
        return;
      }
      this.loading = true;
      getLineageGraph(params)
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
        item.isSelfDepent = item.id + '' === selfLineData.from;
        item.isBoundary = item.id !== rootId;
        item.position = links.some(val => val.from === item.id + '') ? 'up' : 'down';
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
  margin-top: 10px;
  padding: 0 10px;
}
.select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .select-lf {
    display: flex;
    align-items: center;
    .select-item {
      margin-right: 20px;
      span {
        margin-right: 5px;
      }
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
    height: calc(100vh - 230px);
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
      border: 2px solid $c-primary !important;
      padding: 5px 10px;
      border-radius: 8px;
      color: #333;
      height: 100%;
      &.current_item {
        border-top-width: 6px !important;
        box-shadow: 0 0 10px #5f5e5e;
        .table-name {
          color: #000 !important;
          cursor: default !important;
        }
      }
      &.up {
        margin-left: 25px;
      }
      &.down {
        margin-right: 25px;
      }
      .box_item {
        display: flex;
        align-items: center;
        &:not(:last-child) {
          margin-bottom: 8px;
        }
        .node_title_icon {
          width: 1em;
          height: 1em;
          margin-top: 1px;
        }
        .node_text {
          flex: 1;
          text-align: start;
          padding-left: 5px;
          &.table-name {
            cursor: pointer;
            color: $c-primary;
          }
        }
        .is-slef {
          cursor: pointer;
          .svg-icon {
            margin-top: 5px;
          }
        }
      }
      .add_icon {
        cursor: pointer;
        color: #666;
        position: absolute;
        font-size: $global-font-size-20;
        bottom: 19px;
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
.round {
  border-radius: 50%;
  background-color: #f69c27;
  overflow: hidden;
}
</style>
<style lang="scss">
.dial-content {
  max-width: 400px;
  max-height: 300px;
  padding: 10px;
  overflow: auto;
  background-color: rgba(33, 46, 71, 0.9);
  border-radius: 5px;
  color: #fff;
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
</style>
