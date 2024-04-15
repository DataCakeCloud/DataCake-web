<template>
  <div class="wrap">
    <div v-if="editAble" class="leftDrag">
      <el-collapse v-model="openTaskSheets">
        <el-collapse-item v-for="(taskSheet, i) in taskSheets" :key="i" :title="taskSheet.title" :name="taskSheet.title + i">
          <div v-for="(task, j) in taskSheet.list" :key="j" class="dragger" draggable @dragstart="dragStart(task)" @dragend="dragEnd">
            <el-tooltip :content="task.content" placement="right"><Task :task="task" /></el-tooltip>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="middleCanvas" @dragover="e => e.preventDefault()" @drop="drop" @pointermove="moveLine" @pointerup="endLine()">
      <div class="tools">
        <el-button class="tool" size="mini" type="primary" @click="format">格式化</el-button>
        <el-input-number v-model="layerPos.z" class="tool" size="mini" placeholder="缩放" :min="10" :max="300" />
      </div>
      <Layer :x.sync="layerPos.x" :y.sync="layerPos.y" :z.sync="layerPos.z">
        <Shape v-for="(s, i) in name2Shape" :key="i" :x.sync="s.x" :y.sync="s.y" :class="['shape', { active: !editAble }]" @endonshape="endLine(s)">
          <Task v-if="s.type === 'task'" :task="s.task" />
          <Source v-if="s.type === 'table'" :source="s" />
          <EventDep v-if="s.type === 'event'" :e="s" />
          <Crontab v-if="s.type === 'crontab'" :crontab="s" />
          <!-- <div class="port" :class="{ disabled: !editAble }" @pointerdown.stop.prevent="choosePort(s)"></div> -->
          <div class="port"></div>
          <div class="shape-actions" @pointerdown.stop.prevent>
            <template v-if="s.type === 'task' && editAble">
              <el-tooltip placement="bottom" content="修改">
                <i class="icon-primary el-icon-s-tools" @click="edit(s)" />
              </el-tooltip>
              <el-tooltip placement="bottom" content="删除">
                <i class="icon-error el-icon-delete-solid" @click="removeShape(s.name)" />
              </el-tooltip>
            </template>
            <slot :data="s" :dep="depTree[s.name]" />
          </div>
        </Shape>
        <VLine v-for="(d, i) in lines" :key="`line-${i}`" :start="d.start" :end="d.end" :dashed="d.dashed" />
      </Layer>
    </div>

    <el-drawer :title="dialogTitle" :modal="false" :visible="dialogVisable" :before-close="cancel" size="80%">
      <component :is="taskType" v-if="dialogVisable" :data="taskData" source="workflow" @save="save" @cancel="cancel" />
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { dataSetList, otherList } from '@/utils/tools';
import Layer from './layer';
import VLine from './line';
import Shape from './shape';
import Source from './source';
import Task from './task';
import Crontab from './crontab';
import EventDep from './eventDep';

const sizeType = {
  table: 35,
  event: 35,
  crontab: 35,
  task: 105
};

// 'Db2Hive',
const showTemplatesCode = ['Mysql2Hive', 'Hive2Hive', 'DataMigration', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Redis', 'Hive2Redshift', 'SPARKJAR', 'PythonShell', 'Hive2Sharestore'];
const comsCTX = require.context('@/components/TaskTemplate', false, /.vue$/, 'lazy');
const coms = {};
showTemplatesCode.forEach(code => {
  coms[code] = () => comsCTX(`./${code}.vue`);
});

const taskSheets = [...dataSetList, ...otherList].reduce((finalList, sheet) => {
  const list = sheet.list
    .filter(task => showTemplatesCode.includes(task.templateCode))
    .map(task => ({
      ...task,
      type: task.templateCode,
      logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg'
    }));
  if (list.length) return finalList.concat({ ...sheet, list });
  return finalList;
}, []);
// comsCTX.keys().forEach(comPath => {
//   comPath;
// });

export default {
  components: {
    Shape,
    Task,
    Layer,
    Source,
    VLine,
    Crontab,
    EventDep,
    ...coms
  },
  props: {
    editAble: {
      type: Boolean,
      default: true
    },
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
    }
  },
  data() {
    return {
      openTaskSheets: taskSheets.map((obj, i) => obj.title + i),
      taskSheets,
      layerPos: { x: 0, y: 0, z: 100 },
      startPort: null,
      curPos: null,
      dialogTitle: '',
      dialogVisable: false,
      taskData: {},
      taskType: 'step2HiveSQL'
    };
  },
  computed: {
    ...mapGetters(['isAdmin']),

    // 连线的线
    connecttingLine() {
      if (!this.startPort || !this.curPos) return [];
      return [
        {
          start: {
            x: this.startPort.x + sizeType[this.startPort.type],
            y: this.startPort.y
          },
          end: {
            x: this.curPos.x,
            y: this.curPos.y
          },
          dashed: true
        }
      ];
    },
    // 用来通过name找point的
    name2Shape() {
      return this.shapes.reduce(
        (result, shape) => ({
          ...result,
          [shape.name]: shape.name in result && result[shape.name].type === 'task' ? result[shape.name] : shape
        }),
        {}
      );
    },

    // 根据relations确定依赖关系
    depTree() {
      const tree = {};
      const sourceList = new Set();
      this.relations.forEach(({ source, target }) => {
        sourceList.add(source);
        const s = tree[source] || (tree[source] = { x: -1, y: 0, deps: {}, des: {}, name: source });
        const t = tree[target] || (tree[target] = { x: -1, y: 0, deps: {}, des: {}, name: target });
        (s.children || (s.children = {}))[target] = t;
        (t.parents || (t.parents = {}))[source] = s;
      });
      const roots = [...sourceList].filter(name => !tree[name].parents);

      const lineDistance = 100;
      let ix = 0;

      const makeX = (ele, reached = [], initalX = 0) => {
        if (reached.includes(ele) || !this.name2Shape[ele.name]) return;

        ix += sizeType[this.name2Shape[ele.name].type];
        const len = reached.length;
        const last = reached[len - 1];

        if (last) {
          Object.assign(ele.deps, last.deps);
          ele.deps[last.name] = last;
        }

        if (ix + initalX > ele.x) {
          ele.latestParent = last?.name;
          ele.x = ix + initalX;
        }

        Object.assign(ele.des, ele.children);

        reached.push(ele);
        ix += sizeType[this.name2Shape[ele.name].type] + lineDistance;
        for (const childName in ele.children) {
          if (Object.hasOwnProperty.call(ele.children, childName)) {
            Object.assign(ele.des, makeX(ele.children[childName], reached, initalX));
          }
        }
        ix -= sizeType[this.name2Shape[ele.name].type] * 2 + lineDistance;
        reached.pop();
        return ele.des;
      };

      const makeY = (ele, y = 0) => {
        for (const childName in ele.children) {
          if (Object.hasOwnProperty.call(ele.children, childName)) {
            const child = ele.children[childName];
            if (child.latestParent === ele.name) {
              ele.firstChildren = child.name;
              const gutter = Object.keys(child.parents).length * 40 - 40;
              child.y = y + gutter;
              y = Math.max(makeY(child, y + gutter), y + gutter + 80);
            }
          }
        }
        return y;
      };

      roots.forEach(name => makeX(tree[name]));
      roots.reduce((lastY, name) => {
        tree[name].y = lastY;
        tree[name].firstChildren = Object.keys(tree[name].children)[0];
        return Math.max(makeY(tree[name], lastY), lastY + 80);
      }, 0);

      return tree;
    },

    /**
     * 根据relations生成线的坐标等信息，过滤掉起始节点和结束节点不存在的线
     */
    lines() {
      return this.relations
        .map(({ source, target, type }) => {
          const start = this.name2Shape[source];
          const end = this.name2Shape[target];
          if (!start || !end) return;
          const sx = start.x + sizeType[start.type];
          const ex = end.x - sizeType[end.type] - 4;
          return {
            start: { x: sx, y: start.y },
            end: { x: ex, y: end.y },
            dashed: type === false
          };
        })
        .filter(obj => !!obj)
        .concat(this.connecttingLine);
    }
  },
  methods: {
    // 外面获取tasks的ID用的
    getTasks() {
      const result = this.shapes
        .filter(shape => shape.type === 'task')
        .map(obj => {
          // if (!obj.task.id) {
          //   this.$message(`${obj.task.name}未保存!`);
          //   throw new Error(`${obj.task.name}未保存!`);
          // }
          // return obj.task.id;
          return obj.task;
        });
      return result;
    },

    // 外面获取firstpoints用的
    getFirstPoints() {
      return Object.keys(this.depTree).filter(name => {
        const shape = this.name2Shape[name];
        return shape.type === 'task' && !this.depTree[this.depTree[name].latestParent]?.parents;
      });
    },

    // 根据建立依赖时候顺便建立的坐标格式化
    format() {
      let minX = Infinity;
      let minY = Infinity;

      this.shapes.forEach(shape => {
        if (!this.depTree[shape.name]) return;
        shape.x = this.depTree[shape.name].x;
        shape.y = this.depTree[shape.name].y;
        minX = Math.min(shape.x, minX);
        minY = Math.min(shape.y, minY);
      });

      if (minX === Infinity || minY === Infinity) return;

      this.layerPos.x = minX;
      this.layerPos.y = 120 - minY;
      this.layerPos.z = 100;
    },
    // 输入源连线时候触发
    choosePort(e) {
      if (!this.editAble) return;
      if (e.type === 'table') this.startPort = e;
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
    // 不一样的inputdataset和outputdataset生成的name不一样
    resolveDatasetType({ id, metadata: { type, region, source, db, table }}) {
      switch (type) {
        case 'mysql':
        case 'clickhouse':
          return `${type}.${region}.${source}.${db.trim()}.${table.trim()}`;
        case 'kafka':
          return `${type}.${region}.${source}.${table.trim()}`;
        case 'hive':
          return id || `${db}.${table.trim()}@${region}`;
        case 'metis':
          //                    return String.format("%s@%s@%s@%s@%s", source, db.trim(), table.trim(), region, type);
          // 解决元数据返回的table中本就包含source/db/region/type
          return table.trim();
        case 'redshift':
          return `redshift.${region}.${db.trim()}.${table.trim()}`;
        case 'tikv':
          return `tikv.${region}.${db}.${table}`;
        default:
          return 'Invalid type';
      }
    },
    // 根据name获取dataset的 这个地方有bug
    getDataSetData(name) {
      const dep = this.depTree[name];
      const dataSets = dep.latestParent ? this.name2Shape[dep.latestParent].task.outputDataset : this.name2Shape[dep.firstChildren].task.inputDataset;
      return dataSets.find(dataset => this.resolveDatasetType(dataset) === name);
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
    dragStart(task) {
      this.task = task;
    },
    dragEnd(e) {
      this.task = {};
    },
    // 创建节点 这个地方可能有bug 需要更新points(就是props里的shapes)和relations两边的数据 涉及到增删节点和边和更新旧节点数据 我应该没更新旧节点
    async drop(e) {
      this.isEdit = false;
      if (this.task) {
        let { x, y } = this.layerPos;
        x = e.layerX - x;
        y = e.layerY - y;

        const result = await new Promise((res, rej) => {
          this.dialogTitle = `创建${this.task.label}`;
          this.dialogVisable = true;
          this.taskType = this.task.type;
          this.taskP = { res, rej };
        });

        // db.table@region

        const name = result.name;
        result.canEdit = true; // 拖拽的任务，永远有编辑权限

        this.shapes.push({ name, type: 'task', task: result, x, y });
        const list = [];
        let i = -1;
        result.inputDataset.forEach(dataset => {
          const { isExternal } = dataset;
          const tableName = this.resolveDatasetType(dataset);
          if (!this.name2Shape[tableName]) this.shapes.push({ name: tableName, type: 'table', x: x - sizeType['task'] - sizeType['table'] - 20, y: y + ++i * 80, isExternal });
          list.push({ s: tableName, t: name });
        });
        result.eventDepends?.forEach?.(({ dependId }) => {
          if (!this.name2Shape[dependId]) this.shapes.push({ name: dependId, type: 'event', x: x - sizeType['task'] - sizeType['event'] - 20, y: y + ++i * 80, isExternal: false });
          list.push({ s: dependId, t: name, type: false });
        });
        if (e.triggerParam?.type === 'cron' && result.triggerParam?.crontab) {
          const shapeName = `${name}_crontab`;
          if (!this.name2Shape[result.triggerParam.crontab]) this.shapes.push({ name: shapeName, type: 'crontab', crontab: result.triggerParam.crontab, x: x - sizeType['task'] - sizeType['crontab'] - 20, y: y + ++i * 80, isExternal: false });
          list.push({ s: shapeName, t: name });
        }

        result.outputDataset.forEach(dataset => {
          const tableName = this.resolveDatasetType(dataset);
          if (!this.name2Shape[tableName]) this.shapes.push({ name: tableName, type: 'table', x: x + sizeType['task'] + sizeType['table'] + 20, y, isExternal: false });
          list.push({ s: name, t: tableName });
        });
        list.forEach(this.addRelation);
        this.cancel();
      }
    },

    addRelation({ s, t, type }) {
      if (this.relations.findIndex(({ source, target }) => source === s && target === t) > -1) return;
      this.relations.push({ source: s, target: t, type: type });
    },

    removeRelation({ s, t }) {
      const idx = this.relations.findIndex(({ source, target }) => source === s && target === t);
      if (idx > -1) this.relations.splice(idx, 1);
    },

    /**
     * 取消新增/编辑任务
     */
    removeShape(name) {
      const deps = [];
      Object.keys(this.depTree[name]?.parents || {}).forEach(s => {
        this.removeRelation({ s, t: name });
        deps.push(s);
      });
      Object.keys(this.depTree[name]?.children || {}).forEach(t => {
        this.removeRelation({ s: name, t });
        deps.push(t);
      });
      const idx = this.shapes.findIndex(shape => shape.name === name);
      const cur = this.shapes[idx];
      if (cur) this.shapes.splice(idx, 1);
      // if (cur?.type === 'table') {
      //   this.shapes.forEach(shape => {
      //     if (!shape.task) return;
      //     const index = shape.task.inputDataset.findIndex(({ metadata: { db, table, region } }) => `${db}.${table}@${region}` === cur.name);
      //     if (index > -1) shape.task.inputDataset.splice(index, 1);
      //     const index2 = shape.task.outputDataset.findIndex(({ metadata: { db, table, region } }) => `${db}.${table}@${region}` === cur.name);
      //     if (index2 > -1) shape.task.outputDataset.splice(index2, 1);
      //   });
      // }
      deps.forEach(dep => {
        if (Object.keys({ ...(this.depTree[dep]?.parents || {}), ...(this.depTree[dep]?.children || {}) }).length > 0) return;
        this.removeShape(dep);
      });
    },

    /**
     * 保存新增/编辑任务
     */
    async save(params) {
      if (!this.isEdit && this.name2Shape[params.name]) return this.$message.error('存在同名任务!');
      if (!params.runtimeConfig) params.runtimeConfig = {};
      // params.runtimeConfig.source = 'workflow';
      const result = params;
      // if (this.isEdit && params.id) await updateTask(params);
      // else {
      //   result = await addTask(params);
      //   if (result.inputDataset) result.inputDataset = JSON.parse(result.inputDataset);
      //   if (result.eventDepends) result.eventDepends = JSON.parse(result.eventDepends);
      //   if (result.triggerParam) result.triggerParam = JSON.parse(result.triggerParam);
      //   if (result.outputDataset) result.outputDataset = JSON.parse(result.outputDataset);
      // }
      this.taskP?.res?.(result);
      this.taskP = null;
    },

    /**
     * 取消新增/编辑任务
     */
    cancel() {
      this.taskP = null;
      this.dialogVisable = false;
      this.taskData = {};
    },

    // 编辑节点 这个地方可能有bug 需要更新points(就是props里的shapes)和relations两边的数据 涉及到增删节点和边和更新旧节点数据 我应该没更新旧节点
    async edit(s) {
      const e = s.task;
      this.isEdit = true;
      const params = await new Promise(async(res, rej) => {
        this.taskData = Object.assign({}, e, {
          inputDataset: (typeof e.inputDataset === 'object' ? JSON.stringify(e.inputDataset) : e.inputDataset) || '',
          outputDataset: (typeof e.outputDataset === 'object' ? JSON.stringify(e.outputDataset) : e.outputDataset) || '',
          runtimeConfig: (typeof e.runtimeConfig === 'object' ? JSON.stringify(e.runtimeConfig) : e.runtimeConfig) || '',
          eventDepends: (typeof e.eventDepends === 'object' ? JSON.stringify(e.eventDepends) : e.eventDepends) || '',
          triggerParam: (typeof e.triggerParam === 'object' ? JSON.stringify(e.triggerParam) : e.triggerParam) || ''
        });
        this.dialogTitle = `编辑${e.name}`;
        this.dialogVisable = true;
        this.taskType = e.templateCode;
        if (this.isAdmin) {
          this.taskData.canEdit = true;
        }
        this.taskP = { res, rej };
      });
      const { inputDataset, outputDataset, eventDepends, triggerParam, name, id } = params;
      // 在关系里，用任务的新名字替换掉老名字
      this.relations.forEach(r => {
        if (r.source === s.name) r.source = name;
        if (r.target === s.name) r.target = name;
      });

      s.name = name;
      e.name = name;
      e.id = id;

      const { x, y } = this.depTree[name];
      const ol = [];
      const list = [];

      e.inputDataset.forEach(dataset => {
        const tableName = this.resolveDatasetType(dataset);
        ol.push(`${tableName}::${name}::table`);
      });
      e.eventDepends.forEach(({ dependId }) => {
        ol.push(`${dependId}::${name}::event`);
      });
      if (e.triggerParam?.type === 'cron' && e.triggerParam?.crontab) {
        ol.push(`${name}_crontab::${name}::crontab`);
      }
      e.outputDataset.forEach(dataset => {
        const tableName = this.resolveDatasetType(dataset);
        ol.push(`${name}::${tableName}::table`);
      });
      let i = -1;
      inputDataset.forEach(dataset => {
        const { isExternal } = dataset;
        const tableName = this.resolveDatasetType(dataset);
        if (!this.name2Shape[tableName]) this.shapes.push({ name: tableName, type: 'table', x: x - sizeType['task'] - sizeType['table'] - 20, y: y + ++i * 80, isExternal });
        list.push(`${tableName}::${name}::table`);
      });
      eventDepends.forEach(({ dependId }) => {
        if (!this.name2Shape[dependId]) this.shapes.push({ name: dependId, type: 'event', x: x - sizeType['task'] - sizeType['event'] - 20, y: y + ++i * 80, isExternal: false });
        list.push(`${dependId}::${name}::event`);
      });
      if (triggerParam?.type === 'cron' && triggerParam?.crontab) {
        const cronname = `${name}_crontab`;
        if (!this.name2Shape[cronname]) this.shapes.push({ name: cronname, crontab: triggerParam.crontab, type: 'crontab', x: x - sizeType['task'] - sizeType['crontab'] - 20, y: y + ++i * 80, isExternal: false });
        list.push(`${cronname}::${name}::crontab`);
      }
      outputDataset.forEach(dataset => {
        const tableName = this.resolveDatasetType(dataset);
        if (!this.name2Shape[tableName]) this.shapes.push({ name: tableName, type: 'table', x: x + sizeType['task'] + sizeType['table'] + 20, y, isExternal: false });
        list.push(`${name}::${tableName}::table`);
      });

      const waitToDel = ol.filter(k => !list.includes(k));
      const waitToAdd = list.filter(k => !ol.includes(k));
      waitToAdd.forEach(k => {
        const [s, t, type] = k.split('::');
        this.addRelation({ s, t, type: type !== 'event' });
      });
      waitToDel.forEach(k => {
        const [s, t] = k.split('::');
        this.removeRelation({ s, t });
        if (!this.depTree[s]) this.removeShape(s);
        if (!this.depTree[t]) this.removeShape(t);
      });

      // 替换任务
      s.task = params;
      s.task.canEdit = true;
      // if (params.dependTypes) params.dependTypes = JSON.stringify(params.dependTypes);
      // if (params.inputDataset) params.inputDataset = JSON.stringify(params.inputDataset);
      // if (params.eventDepends) params.eventDepends = JSON.stringify(params.eventDepends);
      // if (params.triggerParam) params.triggerParam = JSON.stringify(params.triggerParam);
      // if (params.outputDataset) params.outputDataset = JSON.stringify(params.outputDataset);
      this.cancel();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  overflow: hidden;
  display: flex;

  .leftDrag {
    z-index: 100;
    position: relative;
    flex: 0 0 auto;
    height: 100%;
    overflow-y: auto;
    background: #fff;
    padding: 0 12px;
  }

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
}

.dragger + .dragger {
  margin-top: 24px;
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
    color: #5f95ff;
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
