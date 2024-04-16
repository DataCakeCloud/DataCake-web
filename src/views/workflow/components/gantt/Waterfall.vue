<template>
  <div>
    <ul class="waterfall">
      <li>
        <div :class="['instance', 'circle', 'task-state', status]" :style="{ left: `${getInstanceShitf(minStartTime)}px` }" @click="handleWorkflow"></div>
      </li>
      <li v-for="(task, i) in instances" :key="task.id">
        <el-tooltip v-if="task.taskInstance && task.taskInstance.start_date" class="item" effect="dark" placement="right">
          <div slot="content">
            <div>
              <span>名称：</span>
              <span>{{ task.taskInstance.name }}</span>
            </div>
            <div>
              <span>状态：</span>
              <span>{{ task.taskInstance.state }}</span>
            </div>
            <div>
              <span>类型：</span>
              <span>{{ task.templateCode }}</span>
            </div>
            <!-- <div>
              <span>重试次数：</span>
              <span>{{ task.taskInstance.state }}</span>
            </div> -->
            <div>
              <span>入参时间：</span>
              <span>{{ formatTime(task.taskInstance.execution_date) }}</span>
            </div>
            <div>
              <span>开始时间：</span>
              <span>{{ formatTime(task.taskInstance.start_date) }}</span>
            </div>
            <div>
              <span>结束时间：</span>
              <span>{{ formatTime(task.taskInstance.end_date) }}</span>
            </div>
          </div>
          <div :class="['instance', 'bar', 'task-state', task.taskInstance.state]" :style="{ left: `${getInstanceShitf(task.taskInstance.start_date)}px`, width: `${getInstanceWidth(task.taskInstance.start_date, task.taskInstance.end_date)}px` }" @click="handleInstance(i)"></div>
        </el-tooltip>
      </li>
    </ul>

    <!-- 工作流实例操作对话框  -->
    <el-dialog :title="`${name} on ${formatTime(startTime)}`" :visible.sync="workflowDialogVisible" width="30%">
      <el-card shadow="hover">
        <el-button class="mark-btn" type="primary" @click="mark(true)">Mark Success</el-button>
        <el-button class="mark-btn" type="primary" @click="mark(false)">Mark Failed</el-button>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button @click="workflowDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 任务实例操作对话框  -->
    <el-dialog :title="`${instanceName} on ${instanceTime}`" :visible.sync="instanceDialogVisible">
      <el-card class="margin-bottom-5" shadow="hover">
        <el-button class="mark-btn" type="primary" @click="clear(radio1)">Clear</el-button>
        <el-radio-group v-model="radio1">
          <el-radio-button :label="true">Upstream</el-radio-button>
          <el-radio-button :label="false">Downstream</el-radio-button>
        </el-radio-group>
      </el-card>
      <el-card class="margin-bottom-5" shadow="hover">
        <el-button class="mark-btn" type="primary" @click="mark(true, instanceName, radio2)">Mark Success</el-button>
        <el-radio-group v-model="radio2">
          <el-radio-button :label="true">Upstream</el-radio-button>
          <el-radio-button :label="false">Downstream</el-radio-button>
        </el-radio-group>
      </el-card>
      <el-card class="margin-bottom-5" shadow="hover">
        <el-button class="mark-btn" type="primary" @click="mark(false, instanceName, radio3)">Mark Failed</el-button>
        <el-radio-group v-model="radio3">
          <el-radio-button :label="true">Upstream</el-radio-button>
          <el-radio-button :label="false">Downstream</el-radio-button>
        </el-radio-group>
      </el-card>
      <el-table :data="historyData" border style="width: 100%">
        <el-table-column prop="date" label="入参时间" width="180" />
        <el-table-column prop="date" label="类型" min-width="50" />
        <el-table-column prop="date" label="起始时间" width="180" />
        <el-table-column prop="date" label="结束时间" width="180" />
        <el-table-column prop="date" label="操作人" min-width="50" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="instanceDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { parseTime } from '@/utils';
import { mark, clear } from '@/api/workflow';

export default {
  name: 'Waterfall',
  props: {
    id: {
      type: String,
      required: true
    },
    executionDate: {
      type: String,
      required: true
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
      required: true
    },
    cb: {
      type: Function
    }
  },
  data() {
    return {
      minCircleWidth: 20,
      minStartTime: 0,
      index: 0,
      workflowDialogVisible: false,
      instanceDialogVisible: false,
      radio1: false,
      radio2: false,
      radio3: false,
      historyData: []
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
      this.instanceDialogVisible = true;
    },
    handleWorkflow() {
      this.workflowDialogVisible = true;
    },
    mark(isSuccess, taskName, isUpstream) {
      const params = { id: this.id, executionDate: this.executionDate, isSuccess };
      if (taskName) {
        params.taskName = taskName;
        if (isUpstream) {
          params.isUpstream = true;
          params.isDownstream = false;
        } else {
          params.isUpstream = false;
          params.isDownstream = true;
        }
      }
      mark(params)
        .then(result => {
          this.$notify({
            title: '成功',
            message: '标记成功！',
            type: 'success'
          });
          if (this.cb) {
            this.cb();
          }
        })
        .catch(error => {
          console.error(error);
          this.$notify({
            title: '失败',
            message: '标记失败！',
            type: 'error'
          });
        })
        .finally(_ => {
          this.instanceDialogVisible = false;
          this.workflowDialogVisible = false;
        });
    },
    clear(isUpstream) {
      const params = { id: this.id, executionDate: this.executionDate, taskName: this.instanceName };
      if (isUpstream) {
        params.isUpstream = true;
        params.isDownstream = false;
      } else {
        params.isUpstream = false;
        params.isDownstream = true;
      }
      clear(params)
        .then(result => {
          this.$notify({
            title: '成功',
            message: '重跑成功！',
            type: 'success'
          });
          if (this.cb) {
            this.cb();
          }
        })
        .catch(error => {
          console.error(error);
          this.$notify({
            title: '失败',
            message: '重跑失败！',
            type: 'error'
          });
        })
        .finally(_ => {
          this.instanceDialogVisible = false;
          this.workflowDialogVisible = false;
        });
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
