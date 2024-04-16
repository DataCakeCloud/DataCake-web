<template>
  <RelationGraph ref="seeksRelationGraph" class="seeksRelationGraph" :options="graphOptions" :on-line-enter="enterLine" :on-line-leave="leaveLine">
    <div slot="node" slot-scope="{ node }">
      <slot name="node" :node="node">
        <div class="node">{{ node.text }}</div>
      </slot>
    </div>
  </RelationGraph>
</template>

<script>
// RelationGraph组件配置   http://relation-graph.com/
import RelationGraph from 'relation-graph';
export default {
  name: 'Diagram',
  components: {
    RelationGraph
  },
  props: {
    graphOptions: {
      type: Object,
      default: () => {
        return {
          defaultJunctionPoint: 'border', // 线执行节点位置
          disableZoom: true,
          layouts: []
        };
      }
    },
    nodeOptions: {
      type: Object,
      default: () => {
        return {
          idKey: 'nodeId',
          from: 'source',
          to: 'target',
          nodeWidth: '220',
          nodeHeight: '100',
          lineShape: 5, // line的样式
          nodeShape: 1 // node的形状
        };
      }
    },
    relationalData: {
      type: Object,
      default: () => {
        return {
          coreTaskId: '', // 根节点
          instance: [],
          relation: [] // 依赖关系
        };
      }
    },
    nodeStyleFn: {
      type: Function,
      default: () => ''
    }
  },
  computed: {
    graphJsonData() {
      const data = {};
      const { coreTaskId, instance = [], relation = [] } = this.relationalData;
      data.rootId = coreTaskId;

      const links = [];
      relation.forEach(item => {
        links.push({
          from: item[this.nodeOptions.from],
          to: item[this.nodeOptions.to],
          lineShape: this.nodeOptions.lineShape
        });
      });
      data.links = links;
      const nodes = [];
      instance.forEach(item => {
        nodes.push({
          id: item[this.nodeOptions.idKey],
          nodeShape: this.nodeOptions.nodeShape,
          data: item,
          width: this.nodeOptions.nodeWidth,
          height: this.nodeOptions.nodeHeight,
          styleClass: this.nodeStyleFn(item)
        });
      });
      data.nodes = nodes;
      return data;
    }
  },
  mounted() {
    this.showSeeksGraph();
  },
  methods: {
    enterLine(props, e) {
      console.log(props, e, 111);
    },
    leaveLine(props, e) {
      console.log(props, e, 222);
    },
    showSeeksGraph() {
      this.$refs.seeksRelationGraph.setJsonData(this.graphJsonData, seeksRGGraph => {
        // Called when the relation-graph is completed
      });
    },
    refresh() {
      this.$refs.seeksRelationGraph?.refresh();
    }
  }
};
</script>

<style scoped lang="scss">
.seeksRelationGraph {
  & ::v-deep .seeks-layout-center {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23d4d5d6' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E") !important;
  }
  ::v-deep {
    .rel-node-checked {
      box-shadow: 0px 0px 10px #fd8b37;
    }
    .c-mini-toolbar {
      .myFullscreen {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px 0;
        cursor: pointer;
        .c-mb-text {
          font-size: 12px;
        }
        i {
          padding-left: 3px;
        }
        &:hover {
          background-color: #2e4e8f;
          color: #fff;
        }
      }
    }
  }
}
</style>
