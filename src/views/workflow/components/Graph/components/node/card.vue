<template>
  <!-- <el-tooltip placement="top">
    <div slot="content">
      <div class="info-row">
        <label>名称：</label>
        <span>{{ task.name }}</span>
      </div>
    </div> -->
  <div :class="['node-card', task.isHistoryTask ? 'dash-border' : '']" @contextmenu.prevent="onContextmenu($event, task)">
    <!-- <div :class="['icon', getIcon(task.templateCode)]">
      {{ getIcon(task.templateCode) }}
    </div> -->
    <div class="icon-box">
      <img :src="icon[getIcon(task.templateCode)]" style="width: 40px" />
    </div>
    <div class="content">
      <el-tooltip class="item" effect="dark" :content="task.name" placement="top">
        <div class="label">{{ task.name }}</div>
      </el-tooltip>
      <div class="code">{{ templateLabel }}</div>
      <el-tooltip effect="dark" placement="bottom" :content="offlineStateCode[task.state]">
        <i v-if="task.state" :class="['state', stateObj[task.state] ? stateObj[task.state].iconClass : '']" :style="{ color: stateObj[task.state] ? stateObj[task.state].color : '' }"></i>
      </el-tooltip>
    </div>
  </div>
  <!-- </el-tooltip> -->
</template>
<script>
import taskConfig from '../../../flowPanel/js/taskConfig';
import * as tools from '@/utils/tools';

export default {
  name: 'Card',
  inject: ['getGraph', 'getNode'],
  data() {
    const data = this.getNode().getData();
    return {
      task: data,
      templateLabel: '',
      icon: {
        DI: require('@/assets/DI.png'),
        DD: require('@/assets/DD.png'),
        DT: require('@/assets/DT.png'),
        Ot: require('@/assets/Ot.png')
      },
      stateObj: {
        waiting: { iconClass: 'el-icon-warning-outline', color: '#d7bdf2' },
        waiting_queue: { iconClass: 'el-icon-more', color: '#87e0f0' },
        running: { iconClass: 'el-icon-refresh-right', color: '#5b70e4' },
        success: { iconClass: 'el-icon-circle-check', color: '#67c23a' },
        failed: { iconClass: 'el-icon-circle-close', color: '#f10d15' }
      },
      offlineStateCode: tools.offlineStateCode,
      isRunNode: data.isRunNode || false,
      isRunNodeDown: data.isRunNodeDown || false,
      isRunNodeUp: data.isRunNodeUp || false
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
            this.templateLabel = child.label;
            return;
          }
        });
      });
      return icon;
    },
    onContextmenu(event, data) {
      const graph = this.getGraph();
      const id = data.id + '';
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
          label: `${this.isRunNode ? '停止' : '运行'}节点`,
          onClick: () => {
            this.isRunNode = !this.isRunNode;
            graph.__inner__.click('runNode', data, this.isRunNode);
          },
          disabled: id.indexOf('addTask') > -1
        },
        {
          label: `${this.isRunNodeDown ? '停止' : '运行'}节点及下游`,
          onClick: () => {
            this.isRunNodeDown = !this.isRunNodeDown;
            graph.__inner__.click('runNodeDown', data, this.isRunNodeDown);
          },
          disabled: id.indexOf('addTask') > -1
        },
        {
          label: `${this.isRunNodeUp ? '停止' : '运行'}至该节点`,
          onClick: () => {
            this.isRunNodeUp = !this.isRunNodeUp;
            graph.__inner__.click('runNodeUp', data, this.isRunNodeUp);
          },
          disabled: id.indexOf('addTask') > -1
        },
        {
          label: '查看日志',
          onClick: () => {
            graph.__inner__.click('watchLog', data);
          },
          disabled: id.indexOf('addTask') > -1
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
  // padding: 15px;
  // padding-left: 30px;
  color: #333;
  position: relative;
  cursor: pointer;
  display: flex;
  .content {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
  }
  .icon-box {
    height: 100%;
    border-right: 1px solid #c2c8d5;
    display: flex;
    align-items: center;
    padding: 0 8px;
  }
  &:hover {
    box-shadow: 0 4px 8px 1px rgb(0 0 0 / 40%);
  }
  &:active {
    cursor: move;
  }
  &.dash-border {
    border-style: dashed;
    border-width: 2px;
  }
  .icon {
    position: absolute;
    left: 5px;
    top: 15px;
    border: 2px solid #edab61;
    width: 24px;
    height: 22px;
    text-align: center;
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
    &.Ot {
      border-color: #bb66cb;
      color: #bb66cb;
    }
  }
  .label {
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    position: absolute;
    top: 5px;
    left: 5px;
    width: calc(100% - 10px);
  }
  .code {
    position: absolute;
    bottom: 5px;
    background: #f2f6fc;
    color: #606266;
    padding: 3px;
    border-radius: 4px;
    width: fit-content;
  }
  .state {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
}
</style>
