<template>
  <div class="container">
    <div class="menu">
      菜单栏:
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary" @click="loadData">加载数据</el-button>
    </div>
    <div ref="wrap" class="wrap">
      <div v-if="editIsSHow" id="flowStencil" class="leftDrag"></div>
      <div id="flowContainer" class="middleCanvas" />
      <el-drawer :with-header="false" :destroy-on-close="true" :visible.sync="isShowConfig">
        <config-panel v-if="isShowConfig" :edit-is-s-how="editIsSHow" :cur-node="currentNode" @change="changeData" />
      </el-drawer>
    </div>
  </div>
</template>

<script>
import '@antv/x6-vue-shape';
import FlowGraph from './components/flow/js';
import ConfigPanel from './components/flow/config-panel.vue';

export default {
  components: {
    ConfigPanel
  },
  data() {
    return {
      editIsSHow: true,
      isShowConfig: false,
      currentNode: null,
      graph: null
    };
  },
  mounted() {
    this.initGraph();
  },
  created() {},
  methods: {
    initGraph() {
      const width = this.$refs.wrap.offsetWidth + 'px';
      const height = this.$refs.wrap.offsetHeight + 'px';
      FlowGraph.init(width, height, this.editIsSHow); // 渲染画布
      this.graph = FlowGraph.graph;
      this.initEvent();
    },
    initEvent() {
      // 鼠标单击空白页
      this.graph.on('blank:click', () => {
        this.isShowConfig = false;
        this.currentNode = null;
      });
      // 鼠标点击节点
      this.graph.on('node:dblclick', ({ node }) => {
        if (node.shape === 'taskNode') {
          this.currentNode = node;
          this.isShowConfig = true;
        }
      });
      // 连线触发事件
      this.graph.on('edge:connected', ({ edge }) => {
        const source = this.graph.getCellById(edge.source.cell); // 获取连线的source节点
        const target = this.graph.getCellById(edge.target.cell); // 获取连线的target节点
        // 如果source和target类型相同取消连线
        if (target.shape === source.shape) {
          return this.graph.removeEdge(edge.id);
        }
      });
    },
    // 右侧弹层保存后更新数据
    changeData(data) {
      this.currentNode.setData(data);
      this.isShowConfig = false;

      const pos = this.currentNode.position();
      this.addSourceNode({
        data: {
          label: data.source
        },
        x: pos.x - 100,
        y: pos.y
      });
    },
    addSourceNode(options) {
      // 增加数据集节点
      const sourceNode = this.graph.addNode({
        shape: 'sourceNode',
        ...options
      });
      // 自动将新增的数据集节点和任务节点连线
      this.graph.addEdge({
        shape: 'edge', // 指定使用何种图形，默认值为 'edge'
        source: { cell: sourceNode, port: 'right' },
        target: { cell: this.currentNode, port: 'left' },
        router: 'manhattan',
        attrs: {
          line: {
            stroke: '#5F95FF',
            strokeWidth: 1, // 线条宽度
            targetMarker: {
              // 箭头
              name: 'classic',
              size: 8
            }
          }
        }
      });
    },
    save() {
      const jsonData = this.graph.toJSON();
      localStorage.setItem('workflow-data', JSON.stringify(jsonData));
      this.$message('保存成功');
    },
    loadData() {
      let cellsJson = JSON.parse(localStorage.getItem('workflow-data'));
      if (cellsJson) {
        cellsJson = cellsJson.cells || [];
      } else {
        cellsJson = [];
      }
      const cells = [];
      cellsJson.forEach(item => {
        if (item.shape === 'edge') {
          cells.push(this.graph.createEdge(item));
        } else {
          delete item.component;
          cells.push(this.graph.createNode(item));
        }
      });
      this.graph.resetCells(cells);
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  .menu {
    height: 40px;
    line-height: 40px;
  }
}
.wrap {
  width: 100%;
  flex: 1;
  display: flex;

  .leftDrag {
    position: relative;
    width: 270px;
  }

  .middleCanvas {
    width: calc(100% - 270px);
    height: 100%;
  }
}

// 调整边界
.ant-drawer-body {
  padding: 0;
}

//解决左侧遮罩的问题
.x6-widget-dnd {
  z-index: 1000;
}

.x6-widget-stencil-content {
  background-color: #ffffff;
}
</style>
