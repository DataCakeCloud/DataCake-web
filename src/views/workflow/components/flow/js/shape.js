// 节点样式设置
import '@antv/x6-vue-shape';
import { Graph } from '@antv/x6';
import Task from '../task.vue';
import SourceNode from '../source.vue';

const widthNode = 200;
const heightNode = 30;
// 连接桩样式
const ports = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    }
  },
  items: [
    {
      id: 'left',
      group: 'left'
    },
    {
      id: 'right',
      group: 'right'
    }
  ]
};
export const sourceNode = Graph.registerNode('sourceNode', {
  inherit: 'vue-shape',
  width: 40,
  height: 40,
  component: {
    template: `<source-node />`,
    components: {
      SourceNode
    }
  },
  resizing: {
    enabled: true
  },
  ports: { ...ports }
});
// 矩形,两个矩形叠加,形成效果
export const basicsNode = Graph.registerNode('taskNode', {
  inherit: 'vue-shape',
  width: widthNode,
  height: heightNode,
  resizing: {
    enabled: false
  },
  ports: { ...ports },
  component: {
    template: `<Task />`,
    components: {
      Task
    }
  }
});
