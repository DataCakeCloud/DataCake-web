import { Graph, Addon, FunctionExt, Shape } from '@antv/x6';
import taskConfig from './taskConfig';
import './shape';
export default class FlowGraph {
  // editIsSHow//是否只读,false只读,true操作
  static init(width, height, editIsSHow) {
    this.graph = new Graph({
      container: document.getElementById('flowContainer'),
      width: width,
      height: height,
      keyboard: true,
      clipboard: true,
      // 背景
      grid: {
        size: 10,
        visible: true,
        type: 'mesh',
        args: [
          {
            color: '#cccccc',
            thickness: 1
          },
          {
            color: '#5F95FF',
            thickness: 1,
            factor: 4
          }
        ]
      },
      // 节点是否移动
      interacting: {
        nodeMovable: editIsSHow
      },
      // 滚动画布
      scroller: {
        enabled: true
      },
      // ctrl+滚轮缩放
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        minScale: 0.5,
        maxScale: 2
      },
      // 点选/框选。
      selecting: {
        enabled: editIsSHow,
        multiple: false,
        rubberband: editIsSHow, // 框选
        movable: true,
        showNodeSelectionBox: true
      },
      // 连接线
      connecting: {
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        snap: true, // 自动吸附
        createEdge() {
          return new Shape.Edge({
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
            },
            router: {
              name: 'manhattan'
            },
            zIndex: 0
          });
        },
        validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet, ...e }) {
          if (sourceView === targetView) {
            return false;
          }
          if (!sourceMagnet) {
            return false;
          }
          if (!targetMagnet) {
            return false;
          }
          return true;
        }
      },
      // 连接桩可连接样式设置
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            padding: 4,
            attrs: {
              strokeWidth: 4,
              stroke: 'rgba(223,234,255)'
            }
          }
        }
      },
      // 对齐线
      snapline: {
        enabled: true,
        resizing: true
      },
      // 是否允许调整大小
      resizing: {
        enabled: false
      }
    });
    if (editIsSHow) {
      this.initStencil(); // 左侧选择标题拖拽
      this.initShape(); // 左侧选择节点导入
      this.initEvent(); // 初始事件
    }
    return this.graph;
  }
  // 左侧选择标题拖拽
  static initStencil() {
    this.stencil = new Addon.Stencil({
      title: '任务类型',
      stencilGraphWidth: 240,
      stencilGraphHeight: 210,
      collapsable: true,
      target: this.graph,
      groups: taskConfig.map((item, index) => {
        return {
          name: `group${index}`,
          title: item.title,
          graphHeight: 50 * item.list.length
        };
      }),
      layoutOptions: {
        columns: 1,
        columnWidth: 200,
        rowHeight: 40
      }
    });
    const stencilContainer = document.querySelector('#flowStencil');
    stencilContainer.appendChild(this.stencil.container);
  }
  // 左侧选择节点导入
  static initShape() {
    const { graph } = this;
    taskConfig.forEach((item, index) => {
      const tasks = item.list.map(data => {
        return graph.createNode({
          shape: 'taskNode',
          data
        });
      });
      this.stencil.load(tasks, `group${index}`);
    });
  }
  // 节点操作
  static initEvent() {
    const { graph } = this;
    const container = document.getElementById('flowContainer');
    // 鼠标进入节点
    graph.on('node:mouseenter', () => {
      const ports = container.querySelectorAll('.x6-port-body');
      this.showPorts(ports, true);
    });
    // 鼠标离开节点
    graph.on('node:mouseleave', ({ cell, view }) => {
      const ports = container.querySelectorAll('.x6-port-body');
      this.showPorts(ports, false);
    });
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.copy(cells);
      }
      return false;
    });
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.cut(cells);
      }
      return false;
    });
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 50 });
        graph.cleanSelection();
        graph.select(cells);
      }
      return false;
    });

    // undo redo
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.history.canUndo()) {
        graph.history.undo();
      }
      return false;
    });
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      if (graph.history.canRedo()) {
        graph.history.redo();
      }
      return false;
    });
    // select all
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = graph.getNodes();
      if (nodes) {
        graph.select(nodes);
      }
    });
    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells().filter(cell => ['taskNode', 'sourceNode'].includes(cell.shape));
      if (cells.length) {
        graph.removeCells(cells);
      }
    });
  }
  // 连接桩隐藏处理
  static showPorts(ports, show) {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      const port = ports[i];
      port.style.visibility = show ? 'visible' : 'hidden';
    }
  }
  // 载入数据
  static initGraphShape(item) {
    this.graph.fromJSON(item);
  }
  // 销毁
  static destroy() {
    this.graph.dispose();
  }
}
