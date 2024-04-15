<template>
  <el-tooltip placement="top">
    <div slot="content">
      <div class="info-row">
        <label>ID：</label>
        <span>{{ id }}</span>
      </div>
      <div class="info-row">
        <label>名称：</label>
        <span>{{ label }}</span>
      </div>
      <div class="info-row">
        <label>状态：</label>
        <span>{{ kind }}</span>
      </div>
      <div class="info-row">
        <label>命名空间：</label>
        <span>{{ namespace }}</span>
      </div>
    </div>
    <div :class="['node-card', { highlight: highlight }]">
      <div :class="['card-info', success ? 'success' : 'error']">
        <i :class="['image', success ? 'success el-icon-success' : 'error el-icon-error']"></i>
        <div class="label">{{ label }}</div>
        <i class="image"></i>
      </div>
      <div class="card-wrapper"></div>
    </div>
  </el-tooltip>
</template>

<script>
export default {
  name: 'PodCard',
  inject: ['getGraph', 'getNode'],
  data() {
    const data = this.getNode().getData();
    return {
      id: data.id,
      label: data.workload.name,
      kind: data.workload.kind,
      namespace: data.workload.namespace,
      success: true,
      highlight: false
    };
  },
  mounted() {
    const self = this;
    const node = this.getNode();
    node.on('change:data', ({ current }) => {
      self.highlight = current.highlight;
      self.loading = false;
    });
  },
  methods: {
    handleLeaveHightlight() {
      const edges = this.getGraph().getEdges();
      const currentNode = this.getNode();
      edges.forEach(e => {
        if (e.getSourceNode() === currentNode) {
          e.getTargetNode().updateData({
            highlight: false
          });
          e.attr('line/stroke', '#C2C8D5');
          e.attr('line/strokeWidth', 1);
        }
        if (e.getTargetNode() === currentNode) {
          e.getSourceNode().updateData({
            highlight: false
          });
          e.attr('line/stroke', '#C2C8D5');
          e.attr('line/strokeWidth', 1);
        }
      });
      this.highlight = false;
    },

    handleEnterHightlight() {
      const edges = this.getGraph().getEdges();
      const currentNode = this.getNode();
      edges.forEach(e => {
        if (e.getSourceNode() === currentNode) {
          e.getTargetNode().updateData({
            highlight: true
          });
          e.attr('line/stroke', 'orange');
          e.attr('line/strokeWidth', 2);
        }
        if (e.getTargetNode() === currentNode) {
          e.getSourceNode().updateData({
            highlight: true
          });
          e.attr('line/stroke', 'orange');
          e.attr('line/strokeWidth', 2);
        }
      });
      this.highlight = true;
    },

    handleClick() {
      const graph = this.getGraph();
      const node = this.getNode();
      graph.__inner__.click(node);
    },

    handleHover() {
      const graph = this.getGraph();
      const node = this.getNode();
      this.__inner__.hover(graph, node);
    }
  }
};
</script>

<style lang="scss">
.info-row {
  margin: 5px 0;
  label {
    width: 10px;
  }
}
// .node-card:hover {
//   transform: scale(1.2);
//   box-shadow: 0 4px 8px 1px rgb(0 0 0 / 20%);
// }
.node-card.highlight {
  transform: scale(1.2);
  box-shadow: 0 4px 8px 1px rgb(0 0 0 / 40%);
  border-width: 2px;
  border-style: dashed;
  border-color: orange;
}
.node-card {
  width: 100%;
  height: 100%;
  border: 1px solid #c2c8d5;
  border-radius: 4px;
  box-shadow: 0 2px 5px 1px rgb(0 0 0 / 6%);
  overflow: hidden;
  background-color: rgb(255 235 59 / 21%);
  transition: all 0.2s ease-in-out;
  .card-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-left: 4px solid #52c41a;
    height: 36px;
    border-bottom: 1px solid #c2c8d5;
    background-color: #fff;
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      margin-right: 16px;
    }
    .image {
      flex-shrink: 0;
      margin: 0 8px;
    }
    .pointer {
      cursor: pointer;
    }
    .pointer:hover {
      color: #409eff;
      transform: scale(1.2);
    }
  }
  .success .card-info {
    border-left: 4px solid #52c41a;
  }
  .success.image {
    color: #52c41a;
  }
  .error .card-info {
    border-left: 4px solid #ff4d4f;
  }
  .error.image {
    color: #ff4d4f;
  }
}
</style>
