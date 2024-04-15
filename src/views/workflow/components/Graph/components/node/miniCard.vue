<template>
  <div :class="['node-card', task.isHistoryTask ? 'dash-border' : '']">
    <div :class="['icon', getIcon(task.templateCode)]">{{ getIcon(task.templateCode) }}</div>
    <div class="content">
      <el-tooltip effect="dark" :content="task.name" placement="bottom">
        <div class="label">{{ task.name }}</div>
      </el-tooltip>
      <!-- <div class="code">{{ task.templateCode }}</div> -->
    </div>
  </div>
  <!-- </el-tooltip> -->
</template>
<script>
import taskConfig from '../../../flowPanel/js/taskConfig';

export default {
  name: 'Card',
  inject: ['getGraph', 'getNode'],
  data() {
    const data = this.getNode().getData();
    return {
      task: data
    };
  },
  mounted() {
    const self = this;
    const node = this.getNode();
    node.on('change:data', ({ current }) => {
      self.highlight = current.highlight;
      self.success = current.success;
      self.loading = current.loading;
    });
  },
  methods: {
    getIcon(code) {
      let icon = '';
      taskConfig.forEach(item => {
        item.list.forEach(child => {
          if (child.templateCode === code) {
            icon = item.icon;
            return;
          }
        });
      });
      return icon;
    },
    onContextmenu(event, data) {
      const graph = this.getGraph();
      const items = [
        {
          label: '复制节点',
          onClick: () => {
            graph.__inner__.click('copyNode', data);
          }
        },
        {
          label: '移除节点',
          onClick: () => {
            graph.__inner__.click('removeNode', data);
          }
        },
        {
          label: '运行节点',
          onClick: () => {
            graph.__inner__.click('runNode', data);
          },
          disabled: data.id.indexOf('addTask') > -1
        },
        {
          label: '运行节点及下游',
          onClick: () => {
            graph.__inner__.click('runNodeDown', data);
          },
          disabled: data.id.indexOf('addTask') > -1
        },
        {
          label: '运行至该节点',
          onClick: () => {
            graph.__inner__.click('runNodeUp', data);
          },
          disabled: data.id.indexOf('addTask') > -1
        },
        {
          label: '查看日志',
          onClick: () => {
            graph.__inner__.click('watchLog', data);
          },
          disabled: data.id.indexOf('addTask') > -1
        }
      ];
      if (!data.isHistoryTask) {
        this.$contextmenu({
          items,
          event,
          zIndex: 2100,
          minWidth: 50
        });
        event.preventDefault();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.info-row {
  margin: 5px 0;
  label {
    width: 10px;
  }
}

.node-card {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 1px solid #c2c8d5;
  border-radius: 4px;
  padding: 15px;
  padding-left: 30px;
  color: #333;
  position: relative;
  &.dash-border {
    border-style: dashed;
    border-width: 2px;
  }
  .icon {
    position: absolute;
    left: 5px;
    border: 2px solid #edab61;
    width: 24px;
    height: 20px;
    text-align: center;
    font-size: 12px;
    &.DI {
      border-color: #edab61;
      color: #edab61;
    }
    &.DT {
      border-color: #74e74a;
      color: #74e74a;
    }
    &.DD {
      border-color: #459445;
      color: #459445;
    }
    &.O {
      border-color: #bb66cb;
      color: #bb66cb;
    }
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .code {
    position: absolute;
    bottom: 5px;
    background: #f2f6fc;
    color: #606266;
    padding: 5px 8px;
    border-radius: 4px;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
