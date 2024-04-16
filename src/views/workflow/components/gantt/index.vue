<template>
  <div>
    <ul class="legend">
      <li v-for="s in $t('workflow.status')" :key="s.value">
        <i :class="['icon', 'status', 'task-state', s.value]"></i>
        <span>{{ s.name }}</span>
      </li>
    </ul>
    <div class="gantt-wrapper">
      <div class="tree-wrapper">
        <DAGTree :trees="trees" />
      </div>
      <div class="axis-wrapper">
        <div class="axis-scroll-wrapper">
          <Axis :start-time="startTime" :end-time="endTime" />
          <Waterfall :id="id" :execution-date="executionDate" :start-time="startTime" :end-time="endTime" :instances="instances" :name="name" :cb="cb" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DAGTree from './DAGTree';
import Axis from './Axis';
import Waterfall from './Waterfall';

export default {
  name: '',
  components: {
    DAGTree,
    Axis,
    Waterfall
  },
  props: {
    id: {
      type: String,
      required: true
    },
    executionDate: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    cb: {
      type: Function
    }
  },
  computed: {
    startTime() {
      let time = 0;
      this.instances.forEach(ins => {
        if (ins.taskInstance && ins.taskInstance.start_date && (time === 0 || time > ins.taskInstance.start_date)) {
          time = ins.taskInstance.start_date;
        }
      });
      // 取上一个最近的半小时刻度
      return Math.floor(time / 1800000) * 1800000;
    },
    endTime() {
      let time = 0;
      this.instances.forEach(ins => {
        if (ins.taskInstance && ins.taskInstance.end_date && (time === 0 || time < ins.taskInstance.end_date)) {
          time = ins.taskInstance.end_date;
        }
      });
      // 取下一个最近的半小时刻度
      return Math.ceil(time / 1800000) * 1800000;
    },
    instances() {
      const result = [];
      this.dfs(this.data, node => {
        result.push(node.task);
      });
      return result;
    },
    trees() {
      const a = this.makeTree(this.data, node => {
        const n = Object.create(null);
        n.name = node.task.name;
        return n;
      });
      return a;
    }
  },
  methods: {
    dfs(data, fn) {
      if (data && data.length) {
        for (let i = 0; i < data.length; ++i) {
          fn(data[i]);
          this.dfs(data[i].children, fn);
        }
      }
    },

    makeTree(data, fn) {
      const result = [];
      if (data && data.length) {
        for (let i = 0; i < data.length; ++i) {
          const tree = fn(data[i]);
          tree.children = this.makeTree(data[i].children, fn);
          result.push(tree);
        }
      }
      return result;
    }
  }
};
</script>
<style lang="scss">
.axis-wrapper {
  overflow-y: auto;
}
.axis-scroll-wrapper {
  display: inline-block;
  padding: 0 15px;
}
.gantt-wrapper {
  display: flex;
  align-items: end;
}
.legend {
  list-style: none;
  display: flex;
  border-bottom: 1px solid #555;
  padding: 0 0 30px 0;
  justify-content: center;
  li {
    margin: 0 10px;
    & * {
      vertical-align: middle;
    }
  }
}
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 1px solid #555;
}
.status {
  border: 1px solid #555;
}
</style>
