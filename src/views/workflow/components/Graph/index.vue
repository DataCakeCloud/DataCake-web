<template>
  <div style="display: flex">
    <div id="graph" style="flex: 1"></div>
    <div v-if="isShowMinmap" id="minmap"></div>
  </div>
</template>

<script>
import { DagreLayout } from '@antv/layout';
import { Graph, Node, Path } from '@antv/x6';
import { DataUri } from '@antv/x6';
import Card from './components/node/card';
import PodCard from './components/node/podCard';
import InstanceCard from './components/node/instanceCard';
import MiniCard from './components/node/miniCard';
import config from './components/node/config';
import '@antv/x6-vue-shape';

export default {
  name: 'Graph',
  props: {
    width: {
      type: Number,
      default: 4000
    },
    height: {
      type: Number,
      default: 4000
    },
    data: {
      type: Object,
      required: true
    },
    isShowMinmap: {
      type: Boolean,
      default: true
    },
    layoutBegin: {
      type: Array,
      default: () => {
        return [400, 100];
      }
    },
    ranksep: {
      type: Number,
      default: 40
    },
    nodesep: {
      type: Number,
      default: 80
    }
  },
  data() {
    return {
      graph: null,
      rowMargin: 60,
      colMargin: 40,
      DAGlayout: new DagreLayout({
        begin: this.layoutBegin, // 布局的对齐位置
        type: 'dagre', // 采用的布局方式
        rankdir: 'TB', // 布局的方向
        // align: 'UL', // 节点对齐方式，默认中间对齐
        ranksep: this.ranksep, // 层间距
        nodesep: this.nodesep, // 节点间距
        controlPoints: false // 是否保留布局连线的控制点
      }),
      edgesList: []
    };
  },
  watch: {
    data() {
      this.render();
    }
  },
  created() {
    try {
      Graph.registerEdge(
        'light-edge',
        {
          inherit: 'edge',
          connector: {
            name: 'rounded',
            args: {}
          },
          source: {
            port: 'port2'
          },
          target: {
            port: 'port1'
          },
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 1,
              // strokeDasharray: '5 5', // 虚线
              targetMarker: {
                tagName: 'path',
                strokeWidth: 1,
                d: 'M 5 -2.5 0 0 5 2.5 Z'
              }
            },
            text: {
              fontSize: 10,
              fill: '#666'
            },
            rect: {
              fill: 'transparent'
            }
          }
        },
        true
      );
      Graph.registerEdge(
        'light-dash-edge',
        {
          inherit: 'edge',
          connector: {
            name: 'smooth',
            args: {}
          },
          source: {
            port: 'port2'
          },
          target: {
            port: 'port1'
          },
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 1,
              strokeDasharray: '5 5', // 虚线
              targetMarker: {
                tagName: 'path',
                strokeWidth: 1,
                d: 'M 5 -2.5 0 0 5 2.5 Z'
              }
            },
            text: {
              fontSize: 10,
              fill: '#666'
            },
            rect: {
              fill: 'transparent'
            }
          }
        },
        true
      );
      const nodeConfig = {
        inherit: 'vue-shape',
        width: config.WIDTH,
        height: config.HEIGHT,
        component: Card,
        ports: {
          groups: {
            top: {
              position: 'top',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5f95ff',
                  strokeWidth: 1,
                  fill: '#fff'
                }
              }
            },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5f95ff',
                  strokeWidth: 1,
                  fill: '#fff'
                }
              }
            }
          },
          items: [
            {
              id: 'port1',
              group: 'top'
            },
            {
              id: 'port2',
              group: 'bottom'
            }
          ]
        }
      };
      Graph.registerNode('card', nodeConfig);
      Graph.registerNode('mini-card', {
        inherit: 'vue-shape',
        width: 100,
        height: 60,
        component: MiniCard
      });
      Graph.registerNode('pod-card', {
        ...nodeConfig,
        component: PodCard
      });
      Graph.registerNode('instance-card', {
        inherit: 'vue-shape',
        width: config.WIDTH,
        height: config.HEIGHT,
        component: InstanceCard
      });
      Graph.registerConnector(
        'algo-connector',
        (s, e) => {
          const offset = 4;
          const deltaY = Math.abs(e.y - s.y);
          const control = Math.floor((deltaY / 3) * 2);

          const v1 = { x: s.x, y: s.y + offset + control };
          const v2 = { x: e.x, y: e.y - offset - control };

          return Path.normalize(
            `M ${s.x} ${s.y}
          L ${s.x} ${s.y + offset}
          C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
          L ${e.x} ${e.y}
          `
          );
        },
        true
      );
    } catch (error) {
      // console.log(error);
    }
  },
  methods: {
    init(width, height) {
      const container = document.getElementById('graph');
      this.graph = new Graph({
        container,
        autoResize: true,
        scroller: {
          enabled: true,
          pannable: true
        },
        // background: {
        //   color: '#1b1b1b',
        //   // image: '@/assets/bk.png',
        //   // repeat: 'watermark',
        //   opacity: 0.2
        // },
        interacting(cellView) {
          const data = cellView.cell.getData();
          if (data && data.disableMove) {
            return false;
          }
          return true;
        },
        minimap: {
          enabled: true,
          container: document.getElementById('minmap')
        },
        grid: {
          size: 10, // 网格大小 10px
          visible: true // 渲染网格背景
        },
        width: width || this.width,
        height: height || this.height,
        panning: {
          enabled: true
          // eventTypes: ['leftMouseDown', 'mouseWheel']
        },
        mousewheel: {
          enabled: true,
          modifiers: 'ctrl',
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5
        },
        connecting: {
          snap: {
            radius: 50
          },
          allowBlank: false,
          allowLoop: false,
          allowNode: false,
          highlight: true,
          router: {
            name: 'manhattan'
            // args: {
            //   padding: 90
            // }
          },
          connector: 'algo-connector',
          // connectionPoint: 'anchor',
          anchor: 'center',
          validateMagnet({ magnet }) {
            if (magnet) {
              return magnet.getAttribute('port-group') !== 'top';
            }
            return true;
          },
          validateConnection({ targetMagnet }) {
            if (targetMagnet) {
              return targetMagnet.getAttribute('port-group') !== 'bottom';
            }
            return true;
          },
          createEdge: () => {
            return this.graph.createEdge({
              shape: 'light-edge',
              zIndex: -1
            });
          }
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#fff',
                stroke: '#31d0c6',
                strokeWidth: 4
              }
            }
          }
        }
        // background: { color: '#0d2550' }
      });
      this.graph.__inner__ = {
        click: this.handleClick,
        hover: this.handleHover,
        edgesList: this.edgesList
      };

      // 注册事件
      this.graph.on('node:click', ({ e, x, y, node, view }) => {
        if (e.target.className.indexOf('expand-btn') === -1) {
          // 当按下Ctrl键的时候，不触发点击左键的点击事件
          if (!e.ctrlKey) {
            this.$emit('node-click', node);
          }
        }
      });
      this.graph.on('edge:click', ({ e, x, y, node, edge, view }) => {
        this.$emit('edge-click', edge);
      });
      this.graph.on('edge:mouseenter', ({ e, x, y, node, edge, view }) => {
        edge.setAttrs({
          line: {
            stroke: '#5f95ff',
            strokeWidth: 4,
            targetMarker: {
              strokeWidth: 6
            }
          }
        });
        this.$emit('edge-mouseenter', edge);
      });
      this.graph.on('edge:mouseleave', ({ e, x, y, node, edge, view }) => {
        edge.setAttrs({
          line: {
            stroke: '#C2C8D5',
            strokeWidth: 1,
            targetMarker: {
              strokeWidth: 1
            }
          }
        });
        this.$emit('edge-mouseleave', edge);
      });
      this.graph.on('edge:connected', ({ isNew, edge }) => {
        if (isNew) {
          // 对新创建的边进行插入数据库等持久化操作
          const source = edge.getSourceCell().getData();
          const target = edge.getTargetCell().getData();
          // 当source是历史节点的时候，连线时虚线
          if (source.isHistoryTask) {
            edge.setAttrs({
              line: {
                strokeDasharray: '5 5'
              }
            });
          }
          this.$emit('edge-connect', source, target);
        }
      });

      // 边的右键菜单
      this.graph.on('edge:contextmenu', ({ e, x, y, edge, view }) => {
        this.$contextmenu({
          items: [
            {
              label: '删除连线',
              onClick: () => {
                const source = edge.getSource();
                const target = edge.getTarget();
                this.graph.removeEdge(edge);
                this.$emit('edge-remove', source.cell, target.cell);
              }
            }
          ],
          event: e,
          zIndex: 2100,
          minWidth: 50
        });
        e.preventDefault();
      });

      // 鼠标进入节点
      this.graph.on('node:mouseenter', ({ e, x, y, node, edge, view }) => {
        const ports = container.querySelectorAll('.x6-port-body');
        this.showPorts(ports, true);
      });
      // 鼠标离开节点
      this.graph.on('node:mouseleave', ({ cell, view }) => {
        const ports = container.querySelectorAll('.x6-port-body');
        this.showPorts(ports, false);
      });
      this.render();
    },
    render() {
      let newModel = '';
      newModel = this.DAGlayout.layout(this.data);
      this.edgesList = newModel.edges;
      this.graph.fromJSON(newModel);
    },
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        const port = ports[i];
        port.style.visibility = show ? 'visible' : 'hidden';
      }
    },
    getNodes() {
      return this.graph.getNodes();
    },

    getEdges() {
      return this.graph.getEdges();
    },

    handleClick(name, node, flag) {
      this.$emit('right-click', name, node, flag);
    },

    removeEdge(edgeId) {
      this.graph.removeEdge(edgeId);
    },
    zoomFn(operate) {
      if (operate === 'add') {
        this.graph.zoom(0.1);
      } else if (operate === 'reduce') {
        this.graph.zoom(-0.1);
      }
    },
    dispose() {
      this.graph.dispose();
    },
    exportPng() {
      this.graph.toPNG(
        dataUri => {
          // 下载
          DataUri.downloadDataUri(dataUri, 'chart.png');
        },
        {
          copyStyles: true,
          stylesheet: Card,
          padding: 20
        }
      );
    },

    handleHover(graph, node) {},
    /**
     * 子图布局算法
     */
    // subGraphLayout(node, subGraphData) {
    //   // 1. 子图的DAG布局
    //   const newModel = this.DAGlayout.layout(subGraphData);

    //   // 2. 计算子图的边界范围
    //   let top, bottom, left, right;
    //   newModel.nodes.forEach(n => {
    //     if (top === undefined || top > n.y) {
    //       top = n.y;
    //     }
    //     if (bottom === undefined || bottom < n.y) {
    //       bottom = n.y;
    //     }
    //     if (left === undefined || left > n.x) {
    //       left = n.x;
    //     }
    //     if (right === undefined || right < n.x) {
    //       right = n.x;
    //     }
    //   });
    //   let width = right - left + 1 + config.WIDTH + this.rowMargin * 2;
    //   const height = bottom - top + 1 + config.HEIGHT + this.colMargin * 2;
    //   if (width < config.WIDTH) {
    //     width = config.WIDTH;
    //   }

    //   // 3. 计算展开子图后，受影响的节点，并位移相关节点
    //   const nodes = this.graph.getNodes();
    //   const parents = [];
    //   let p = node;
    //   while (p && p.id) {
    //     parents.push(p.id);
    //     p = p.getParent();
    //   }
    //   let position, size;
    //   const x = node.getPosition().x;
    //   const y = node.getPosition().y;
    //   nodes.forEach(n => {
    //     if (parents.indexOf(n.id) === -1) {
    //       if (this.isOverlap(n, x, y, width, height)) {
    //         position = this.getPosition(n, x, y, width, height);
    //         size = n.getSize();
    //         if (position === 1) {
    //           n.translate(n.getPosition().x, y - size.height - 1 + this.colMargin * 2 + config.HEIGHT);
    //         } else if (position === 2) {
    //           n.translate(n.getPosition().x, y + height + 1 + this.colMargin * 2 + config.HEIGHT);
    //         } else if (position === 3) {
    //           n.translate(x - size.width - 1 + this.rowMargin * 2 - config.WIDTH, n.getPosition().y);
    //         } else {
    //           n.translate(x + width + config.WIDTH + 1 + this.rowMargin * 2, n.getPosition().y);
    //         }
    //       }
    //     }
    //   });

    //   // 4. 展开子图，同时平移子图
    //   node.resize(width, height);
    //   newModel.nodes.forEach(n => {
    //     n.x = n.x + x;
    //     n.y = n.y + y + config.HEIGHT;
    //     node.addChild(this.graph.addNode(n));
    //   });
    //   newModel.edges.forEach(e => {
    //     node.addChild(this.graph.addEdge(e));
    //   });
    // },

    /**
     * 判断两个节点是否重叠
     * 思路：A节点的四个端点都不在B节点内，则不重叠，否则重叠
     * @param {*} node
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     */
    isOverlap(node, x, y, width, height) {
      const nodeX = node.getPosition().x;
      const nodeY = node.getPosition().y;
      let tmpX = nodeX;
      let tmpY = nodeY;
      const width1 = node.getSize().width;
      const height1 = node.getSize().height;
      const x1 = x + width;
      const y1 = y + height;
      if (x <= tmpX && tmpX <= x1 && y <= tmpY && tmpY <= y1) {
        return true;
      }
      tmpX = nodeX + width1;
      if (x <= tmpX && tmpX <= x1 && y <= tmpY && tmpY <= y1) {
        return true;
      }
      tmpX = nodeX;
      tmpY = nodeY + height1;
      if (x <= tmpX && tmpX <= x1 && y <= tmpY && tmpY <= y1) {
        return true;
      }
      tmpX = nodeX + width1;
      tmpY = nodeY + height1;
      if (x <= tmpX && tmpX <= x1 && y <= tmpY && tmpY <= y1) {
        return true;
      }
      return false;
    },

    /**
     * 判断A节点位置在B节点的方位，用1,2,3,4表示上下左右
     * 规则：
     * 1. 如果A节点中心在B节点内，只左移或者右移，A中心节点在B中心节点左，左移，反之右移；
     * 2. 如果A节点中心不在B节点内，在B左边框左，则左移，以此类推
     * @param {*} node
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     */
    getPosition(node, x, y, width, height) {
      const nodeX = node.getPosition().x;
      const nodeY = node.getPosition().y;
      const x1 = (nodeX + nodeX + node.getSize().width) / 2;
      const y1 = (nodeY + nodeY + node.getSize().height) / 2;
      const x2 = (x + x + width) / 2;
      // const y2 = (y + y + height) / 2;
      if (x <= nodeX && nodeX <= x + width && y <= nodeY && nodeY <= y + width) {
        if (x1 <= x2) {
          return 3;
        } else {
          return 4;
        }
      } else {
        if (x1 < x) {
          return 3;
        } else if (x1 > x + width) {
          return 4;
        } else if (y1 < y) {
          return 1;
        } else {
          return 2;
        }
      }
    },

    /**
     * 递归展示节点
     * @param {*} node
     */
    toggle(node, collapsed) {
      node.resize(config.WIDTH, config.HEIGHT);
      const cells = node.getChildren();
      if (cells) {
        cells.forEach(cell => {
          if (collapsed) {
            cell.hide();
          } else {
            cell.show();
          }
          if (cell instanceof Node) {
            this.toggle(cell, collapsed);
          }
        });
      }
    },

    /**
     * 递归展示节点
     * @param {*} node
     */
    show(node) {
      this.$emit('nodeShow', node);
      this.toggle(node, false);
    },

    delEdge(delEdge) {
      delEdge.forEach(val => {
        this.graph.removeEdge(val.id);
      });
    },
    /**
     * 递归隐藏节点
     * @param {*} node
     */
    hide(node) {
      this.$emit('nodeHide', node);
      this.toggle(node, true);
    },

    addEdgeFunc(node, addEdgeData) {
      this.graph.addEdges(addEdgeData);
      this.$forceUpdate();
    }
  },
  beforeUnmount() {
    Graph.unregister('card');
    Graph.unregister('light-edge');
  }
};
</script>

<style lang="scss" scoped>
#minmap {
  position: absolute;
  bottom: 5px;
  right: 10px;
  border: 1px solid #eee;
}
</style>
