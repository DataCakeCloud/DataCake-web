<template>
  <div>
    <ul class="waterfall">
      <!-- <li>
        <div :class="['instance', 'circle', 'task-state', status]" :style="{ left: `${getInstanceShitf(minStartTime)}px` }" @click="handleWorkflow"></div>
      </li> -->
      <li v-for="(task, i) in instances" :key="task.id" class="task-state">
        <el-tooltip v-if="task && task.startDate" class="item" effect="dark" placement="right" popper-class="task_tootip">
          <template #content>
            <div class="tootip-content">
              <div>
                <span>I D:</span>
                <span>{{ task.taskID || '-' }}</span>
              </div>
              <div>
                <span>名称:</span>
                <span>{{ task.taskName || '-' }}</span>
              </div>
              <div>
                <span>实例时间:</span>
                <span>{{ task.executionDate ? $utils.parseTime(task.executionDate, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
              </div>
              <div>
                <span>开始时间:</span>
                <span>{{ task.startDate ? $utils.parseTime(task.startDate, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
              </div>
              <div>
                <span>结束时间:</span>
                <span>{{ task.endDate ? $utils.parseTime(task.endDate, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
              </div>
              <!-- <div>
                <span>负责人:</span>
                <span>{{ task.owner || '-' }}</span>
              </div> -->
            </div>
            <div slot="footer" class="tootip-footer" style="margintop: 10px">
              <el-button type="primary" :disabled="task.state === 'waiting' || task.state === 'waiting_queue'" @click="$emit('click-item', 'repeatCalc', task)">重 算</el-button>
              <el-button type="primary" @click="$emit('click-item', 'stop', task)">停 止</el-button>
              <el-button type="primary" :disabled="!template_code_list.includes(task.template_code)" @click="$emit('click-item', 'getSql', task)">SQL</el-button>
              <el-button type="primary" @click="$emit('click-item', 'getLogs', task)">日 志</el-button>
            </div>
          </template>
          <div :class="['instance', 'bar', 'task-state', task.state]" :style="{ left: `${getInstanceShitf(task.startDate)}px`, width: `${getInstanceWidth(task.startDate, task.endDate)}px` }" @click="handleInstance(i)"></div>
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>
<script>
import { parseTime } from '@/utils';

export default {
  name: 'Waterfall',
  props: {
    id: {
      type: String,
      default: ''
    },
    executionDate: {
      type: String,
      default: ''
    },
    instances: {
      type: Array,
      required: true
    },
    startTime: {
      type: Number,
      required: true
    },
    endTime: {
      type: Number,
      required: true
    },
    scale: {
      type: Number,
      // 默认刻度为30分钟
      default: 30
    },
    unitPixel: {
      type: Number,
      default: 150
    },
    status: {
      type: String,
      default: 'no_status'
    },
    name: {
      type: String,
      default: ''
    },
    cb: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      minCircleWidth: 20,
      minStartTime: 0,
      index: 0,
      workflowDialogVisible: false,
      template_code_list: ['Hive2Hive', 'Hive2Mysql', 'Hive2Clickhouse', 'SPARKJAR']
    };
  },
  computed: {
    instanceName() {
      return this.instances[this.index]?.taskInstance?.name;
    },
    instanceTime() {
      return this.formatTime(this.instances[this.index]?.taskInstance?.start_date);
    }
  },
  watch: {
    instances: {
      handler() {
        let minTime = 0;
        for (let i = 0; i < this.instances.length; ++i) {
          if (this.instances[i].taskInstance && this.instances[i].taskInstance.start_date && (i === 0 || this.instances[i].taskInstance.start_date < minTime)) {
            minTime = this.instances[i].taskInstance.start_date;
          }
        }
        this.minStartTime = minTime;
      },
      immediate: true
    }
  },
  mounted() {
    // const dom = document.documentElement.querySelector('.task-state .instance.bar');
    // dom?.scrollIntoView({ inline: 'start' });
  },
  methods: {
    getInstanceShitf(time) {
      return ((time - this.startTime) / this.scale / 60000).toFixed(1) * this.unitPixel;
    },
    getInstanceWidth(startTime, endTime) {
      endTime = endTime || Date.now();
      let width = ((endTime - startTime) / this.scale / 60000).toFixed(1) * this.unitPixel;
      width = width < this.minCircleWidth ? this.minCircleWidth : width;
      return width;
    },
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '';
    },
    handleInstance(index) {
      this.index = index;
    },
    handleWorkflow() {
      this.workflowDialogVisible = true;
    }
  }
};
</script>
<style lang="scss">
.waterfall {
  padding-inline-start: 0;
  list-style: none;
  li {
    position: relative;
    padding: 5px 0;
    border: 1px solid #000;
    height: 30px;
  }
  li:nth-child(n + 2) {
    border-top: 0;
  }
}
.instance {
  height: 20px;
  position: relative;
  cursor: pointer;
}
.bar {
  // border-radius: 10px;
  // background-color: green;
}
.circle {
  width: 20px;
  border-radius: 10px;
  // background-color: green;
}
.mark-btn {
  margin-right: 20px;
}
.margin-bottom-5 {
  margin-bottom: 5px;
}
</style>
<style lang="scss" scoped>
.task_tootip {
  .tootip-content {
    & > div {
      margin-bottom: 1px;
    }
  }
  .tootip-footer {
    margin-top: 6px;
  }
}
</style>
