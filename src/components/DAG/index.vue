<template>
  <div v-if="shapes && relations" ref="middleCanvas" class="middleCanvas" @dragover="e => e.preventDefault()" @pointermove="moveLine" @pointerup="endLine()">
    <div class="tools">
      <el-button class="tool" size="mini" type="primary" @click="format">复原</el-button>
      <el-input-number v-model="layerPos.z" class="tool" size="mini" placeholder="缩放" :min="10" :max="300" :step="10" />
    </div>
    <Layer :x.sync="layerPos.x" :y.sync="layerPos.y" :z.sync="layerPos.z">
      <Shape v-for="(s, i) in depTree" :key="i" :x.sync="s.x" :y.sync="s.y" class="shape" @endonshape="endLine(s)">
        <Task :id="typeof options.titleKey === 'string' ? s[options.titleKey] : typeof options.titleKey === 'function' ? options.titleKey(s) : s[options.idKey]" :url="options.jumpUrl(s)" :class="nodeClass(s)" />
        <div class="port"></div>
        <div class="shape-actions" @pointerdown.stop.prevent>
          <slot :data="s" :dep="depTree" />
        </div>
      </Shape>
      <VLine v-for="(r, i) in lines" :key="`line-${i}`" :start="r.start" :end="r.end" :dashed="r.dashed" />
    </Layer>
  </div>
</template>

<script>
import VLine from './line';
import Shape from './shape';
import Task from './shape/task';
import Layer from './layout/layer';

// const sizeType = {
//   table: 35,
//   task: 105
// };

const size = 105;

export default {
  components: {
    Shape,
    Task,
    Layer,
    VLine
  },
  props: {
    relations: {
      type: Array,
      reauired: true,
      default() {
        return [];
      }
    },
    shapes: {
      type: Array,
      reauired: true,
      default() {
        return [];
      }
    },
    options: {
      type: Object,
      default() {
        return {
          idKey: 'id',
          sourceKey: 'source',
          targetKey: 'target',
          titleKey: 'id',
          jumpUrl: ''
        };
      }
    },
    nodeClass: {
      type: Function,
      default: () => {}
    }
  },

  data() {
    return {
      root: null,
      layerPos: { x: 0, y: 0, z: 100 }
    };
  },

  computed: {
    // 用来通过name找point的
    name2Shape() {
      return this.shapes.reduce(
        (result, shape) => ({
          ...result,
          [shape[this.options.idKey]]: shape[this.options.idKey] in result ? result[shape[this.options.idKey]] : shape
        }),
        {}
      );
    },

    // 根据relations确定依赖关系
    // depTree() {
    //   const tree = {};
    //   const sourceList = new Set();
    //   this.relations.forEach(({ [this.options.sourceKey]: source, [this.options.targetKey]: target }) => {
    //     sourceList.add(source);
    //     const s = tree[source] || (tree[source] = { x: -1, y: 0, deps: {}, des: {}, [this.options.idKey]: source });
    //     const t = tree[target] || (tree[target] = { x: -1, y: 0, deps: {}, des: {}, [this.options.idKey]: target });
    //     (s.children || (s.children = {}))[target] = t;
    //     (t.parents || (t.parents = {}))[source] = s;
    //   });
    //   const roots = [...sourceList].filter(id => !tree[id].parents);

    //   const lineDistance = 100;
    //   let ix = 0;

    //   const makeX = (ele, reached = [], initalX = 0) => {
    //     if (reached.includes(ele) || !this.name2Shape[ele[this.options.idKey]]) return;

    //     ix += size;
    //     const len = reached.length;
    //     const last = reached[len - 1];

    //     if (last) {
    //       Object.assign(ele.deps, last.deps);
    //       ele.deps[last[this.options.idKey]] = last;
    //     }

    //     if (ix + initalX > ele.x) {
    //       ele.latestParent = last ? last[this.options.idKey] : last;
    //       ele.x = ix + initalX;
    //     }

    //     Object.assign(ele.des, ele.children);

    //     reached.push(ele);
    //     ix += size + lineDistance;
    //     for (const childId in ele.children) {
    //       if (Object.hasOwnProperty.call(ele.children, childId)) {
    //         Object.assign(ele.des, makeX(ele.children[childId], reached, initalX));
    //       }
    //     }
    //     ix -= size * 2 + lineDistance;
    //     reached.pop();
    //     return ele.des;
    //   };

    //   const makeY = (ele, y = 0) => {
    //     for (const childId in ele.children) {
    //       if (Object.hasOwnProperty.call(ele.children, childId)) {
    //         const child = ele.children[childId];
    //         if (child.latestParent === ele[this.options.idKey]) {
    //           ele.firstChildren = child[this.options.idKey];
    //           const gutter = Object.keys(child.parents).length * 40 - 40;
    //           child.y = y + gutter;
    //           y = Math.max(makeY(child, y + gutter), y + gutter + 80);
    //         }
    //       }
    //     }
    //     return y;
    //   };

    //   roots.forEach(id => makeX(tree[id]));
    //   roots.reduce((lastY, id) => {
    //     tree[id].y = lastY;
    //     tree[id].firstChildren = Object.keys(tree[id].children)[0];
    //     return Math.max(makeY(tree[id], lastY), lastY + 80);
    //   }, 0);
    //   return tree;
    // },

    depTree() {
      // 配置
      const NODE_WIDTH = 105;
      const NODE_HEIGHT = 40;

      const NODE_SPACE = 40;
      const LAYER_SPACE = 200;

      const idParentMap = {};
      const idChildrenMap = {};

      const idNodeMap = {};
      this.shapes.forEach(s => {
        idNodeMap[s[this.options.idKey]] = s;
      });
      this.relations.forEach(({ [this.options.sourceKey]: source, [this.options.targetKey]: target, type }) => {
        // 排除自依赖情况
        if (source !== target) {
          idParentMap[source] = idNodeMap[target];
          idChildrenMap[target] = idChildrenMap[target] || [];
          idChildrenMap[target].push(idNodeMap[source]);
        }
      });

      const parentIdSet = new Set(Object.keys(idParentMap));
      const idKeys = Object.keys(idNodeMap);
      let rootKey;
      for (let i = 0; i < idKeys.length; ++i) {
        if (!parentIdSet.has(idKeys[i])) {
          rootKey = idKeys[i];
        }
      }

      let layer = 0;
      let queue1 = [idNodeMap[rootKey]];
      let queue2 = [];
      let tmpQueue;
      let fullQueue = [];
      let node;
      while (queue1.length > 0) {
        for (let j = 0; j < queue1.length; ++j) {
          node = queue1[j];
          node.level = layer;
          if (idChildrenMap[node[this.options.idKey]]) {
            const noChildrenId = [];
            const children = idChildrenMap[node[this.options.idKey]];
            for (let l = 0; l < children.length; ++l) {
              if (idChildrenMap[children[l][this.options.idKey]]) {
                queue2.push(children[l]);
              } else {
                noChildrenId.push(children[l]);
              }
            }
            queue2 = queue2.concat(noChildrenId);
          }
        }
        fullQueue = queue1.concat(fullQueue);
        tmpQueue = queue1;
        queue1 = queue2;
        queue2 = tmpQueue;
        queue2.length = 0;
        ++layer;
      }

      let x;
      let y;
      let curY;
      for (let k = 0; k < fullQueue.length; ++k) {
        node = fullQueue[k];
        x = (layer - node.level - 1) * (NODE_WIDTH + LAYER_SPACE);
        y = this.getPositionY(node, idChildrenMap);
        if (k === 0 || node.level !== fullQueue[k - 1].level) {
          curY = 0;
        }
        if (y === undefined) {
          y = curY + NODE_HEIGHT + NODE_SPACE;
        }
        curY = y;
        node.x = x;
        node.y = y;
      }
      /* eslint-disable */
      this.root = idNodeMap[rootKey];
      // this.format();
      return idNodeMap;
    },

    /**
     * 根据relations生成线的坐标等信息，过滤掉起始节点和结束节点不存在的线
     */
    lines() {
      return this.relations
        .map(({ [this.options.sourceKey]: source, [this.options.targetKey]: target, type }) => {
          const start = this.depTree[source];
          const end = this.depTree[target];
          if (!start || !end) {
            return;
          }
          const sx = start.x + size;
          const ex = end.x - size - 4;
          return {
            start: { x: sx, y: start.y },
            end: { x: ex, y: end.y },
            dashed: type === false
          };
        })
        .filter(obj => !!obj);
    }
  },

  mounted() {
    this.format();
  },

  methods: {
    // 根据建立依赖时候顺便建立的坐标格式化
    format() {
      // let minX = Infinity;
      // let minY = Infinity;

      // this.shapes.forEach(shape => {
      //   if (!this.depTree[shape[this.options.idKey]]) return;
      //   shape.x = this.depTree[shape[this.options.idKey]].x;
      //   shape.y = this.depTree[shape[this.options.idKey]].y;
      //   minX = Math.min(shape.x, minX);
      //   minY = Math.min(shape.y, minY);
      // });

      // if (minX === Infinity || minY === Infinity) return;

      // this.layerPos.x = minX;
      // this.layerPos.y = 120 - minY;
      // this.layerPos.z = 100;

      this.$nextTick(() => {
        let canvas = this.$refs.middleCanvas;
        if (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
          this.layerPos.x = canvas.clientWidth * 0.75 - this.root.x;
          this.layerPos.y = canvas.clientHeight * 0.5 - this.root.y;
        }
        this.layerPos.z = 100;
      });
    },

    // 连线结束时候触发
    endLine(e) {
      if (e && e.type === 'task' && this.startPort && !this.depTree[this.startPort.name].deps[e.name] && !this.depTree[this.startPort.name].des[e.name]) {
        const data = this.getDataSetData(this.startPort.name);
        if (this.name2Shape[e.name].task.inputDataset[0].metadata.type === data.metadata.type) {
          this.addRelation({ s: this.startPort.name, t: e.name });
          this.name2Shape[e.name].task.inputDataset.push(data);
        } else {
          this.$message.error(`${e.name}不接受${data.metadata.type}类型的输入`);
        }
      }
      this.startPort = null;
    },

    moveLine(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - this.layerPos.x;
      const y = e.clientY - rect.top - this.layerPos.y;
      this.curPos = {
        x,
        y
      };
    },

    getPositionY(node, idChildrenMap) {
      let result;
      if (node) {
        const children = idChildrenMap[node[this.options.idKey]];
        if (children && children.length) {
          let minY = children[0].y;
          let maxY = children[0].y;
          for (let i = 1; i < children.length; ++i) {
            if (children[i].y < minY) {
              minY = children[i].y;
            }
            if (children[i].y > maxY) {
              maxY = children[i].y;
            }
          }
          result = (minY + maxY) / 2;
        }
      }
      return result;
    }
  }
};
</script>

<style lang="scss" scoped>
.middleCanvas {
  flex: 1;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23d4d5d6' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
  height: 100%;
  position: relative;
  z-index: 90;
  overflow: hidden;
  .tool {
    margin: 6px;
    &s {
      z-index: 100;
      position: absolute;
      right: 20px;
      top: 20px;
      opacity: 0.5;
      border-radius: 999999px;
      display: flex;
      padding: 0 6px;
      transition: all 0.3s ease;

      &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.port {
  // cursor: grab;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #5f95ff;
  background: #fff;
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  &.disabled {
    background-color: #5f95ff;
  }
}

.shape {
  &-actions {
    display: none;
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translate(-50%, -50%);
    word-spacing: 6px;
    white-space: nowrap;
    padding: 4px 12px;
    border-radius: 9999px;
    background: #fff;
    i {
      cursor: pointer;
    }
    &:empty {
      display: none !important;
    }
  }
  .icon-primary {
    color: $c-primary;
  }
  .icon-error {
    color: $color-cb;
  }
  &:hover &-actions,
  .active &-actions {
    display: block;
  }
}
</style>
