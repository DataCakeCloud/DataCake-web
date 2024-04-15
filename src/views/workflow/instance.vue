<template>
  <div class="container">
    <el-card v-loading="loading" shadow="hover">
      <div slot="header">
        <span>{{ name }} 工作流：</span>
      </div>
      <div class="menu">
        <div class="menu-right">
          选择例行实例：<el-select v-model="exdate" placeholder="选择例行实例">
            <el-option v-for="i in instances" :key="i.execution_date" :value="i.value" :label="i.run_id" />
          </el-select>
          <!-- <el-button class="menu-btn" size="mini" type="primary" @click="copy">复制</el-button> -->
        </div>
      </div>
      <flow-editor ref="flowEditor" class="wrap readonly" :relations="relations" :shapes="points" :edit-able="false">
        <template slot-scope="{ data }">
          <!-- <i v-if="data.type === 'task'" class="icon-info el-icon-info" /> -->
          <!-- <div v-if="data.type === 'task'" class="el-tooltip__popper is-dark" style="transform: translate(-50%, 0)" x-placement="bottom">
            <div class="data-tooltip">
              <div slot="content" class="data-tooltip">
                <div>任务名称：{{ data.name }}</div>
                <div>执行状态：{{ data.task.taskInstance && data.task.taskInstance.state }}</div>
                <div>任务类型：{{ data.task.templateCode }}</div>
                <div>重试次数：{{ data.task.taskInstance && data.task.taskInstance.try_number }}</div>
                <div>入参时间：{{ data.task.taskInstance && formatTime(data.task.taskInstance.execution_date) }}</div>
                <div>开始时间：{{ data.task.taskInstance && formatTime(data.task.taskInstance.start_date) }}</div>
                <div>结束时间：{{ data.task.taskInstance && formatTime(data.task.taskInstance.end_date) }}</div>
              </div>
            </div>
            <div x-arrow="" class="popper__arrow" style="left: 50%"></div>
          </div> -->

          <el-tooltip v-if="data.type === 'task'" effect="dark" placement="bottom">
            <div slot="content" class="data-tooltip">
              <div>任务名称：{{ data.name }}</div>
              <div>执行状态：{{ data.task.taskInstance && data.task.taskInstance.state }}</div>
              <div>任务类型：{{ data.task.templateCode }}</div>
              <div>重试次数：{{ data.task.taskInstance && data.task.taskInstance.try_number }}</div>
              <div>入参时间：{{ data.task.taskInstance && formatTime2(data.task.taskInstance.execution_date) }}</div>
              <div>开始时间：{{ data.task.taskInstance && formatTime2(data.task.taskInstance.start_date) }}</div>
              <div>结束时间：{{ data.task.taskInstance && formatTime2(data.task.taskInstance.end_date) }}</div>
            </div>
            <i class="icon-info el-icon-info" />
          </el-tooltip>

          <el-tooltip v-if="data.type === 'table'" effect="dark" placement="bottom">
            <div slot="content" class="data-tooltip">
              <div>数据集名称：{{ data.name }}</div>
              <div v-if="'isExternal' in data">数据集类型：{{ data.isExternal ? '外部' : '内部' }}</div>
              <div>关联任务：{{ data.produceDataSetTask }}</div>
              <!-- <div>关联任务：{{ getDepTaskName(dep) }}</div>  -->
            </div>
            <i class="icon-info el-icon-info" />
          </el-tooltip>
        </template>
      </flow-editor>
    </el-card>

    <el-card v-loading="loading" class="margin-top-15" shadow="hover">
      <div slot="header">
        <span>{{ instanceName }} 实例运行视图：</span>
      </div>
      <Gantt :id="id" :data="displayWorkflowTaskRunningGraph" :name="name" :execution-date="exdate" :cb="getWorkFlow" />
    </el-card>
  </div>
</template>

<script>
import { getInstacne, getWorkFlowById } from '@/api/workflow';
import flowEditor from './components/newFlow/flowEditor';
import Gantt from '@/views/workflow/components/gantt';
import { parseTime } from '@/utils';

export default {
  components: { flowEditor, Gantt },
  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      instances: [],
      exdate: '',
      name: '',
      relations: [],
      points: [],
      displayWorkflowTaskRunningGraph: []
    };
  },
  computed: {
    instanceName() {
      return this.instances.find(e => e.value === this.exdate)?.run_id;
    }
  },
  watch: {
    exdate: 'getWorkFlow'
  },
  mounted() {
    this.getData();
  },
  methods: {
    formatTime(time) {
      return time ? parseTime(time, '{y}{m}{d}T{h}:{i}:{s}') : '';
    },

    formatTime2(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '';
    },

    async getData() {
      this.loading = true;
      this.instances = await (await getInstacne(this.id)).data;
      this.instances = this.instances.map(e => ({ ...e, value: this.formatTime(e.execution_date) }));
      if (this.instances.length) this.exdate = this.instances[0].value;
      else this.$message.warning('没有实例');
      this.loading = false;
    },
    async getWorkFlow() {
      this.loading = true;
      const { displayWorkflowTaskRunningGraph, points, relations, name } = await (await getWorkFlowById({ id: this.id, executionDate: this.exdate })).data;
      this.filterShapes(points);
      this.relations = relations;
      this.name = name;
      this.displayWorkflowTaskRunningGraph = displayWorkflowTaskRunningGraph;
      this.$nextTick(() => {
        this.$refs.flowEditor.format();
        this.loading = false;
      });
    },
    filterShapes(points) {
      this.points = [];
      points.forEach(shape => {
        if (shape.type === 'task') {
          shape.task.inputDataset = (typeof shape.task.inputDataset === 'string' ? JSON.parse(shape.task.inputDataset) : shape.task.inputDataset) || [];
          shape.task.outputDataset = (typeof shape.task.outputDataset === 'string' ? JSON.parse(shape.task.outputDataset) : shape.task.outputDataset) || [];
          shape.task.runtimeConfig = (typeof shape.task.runtimeConfig === 'string' ? JSON.parse(shape.task.runtimeConfig) : shape.task.runtimeConfig) || [];

          shape.task.eventDepends = (typeof shape.task.eventDepends === 'string' ? JSON.parse(shape.task.eventDepends) : shape.task.eventDepends) || [];
          shape.task.triggerParam = (typeof shape.task.triggerParam === 'string' ? JSON.parse(shape.task.triggerParam) : shape.task.triggerParam) || [];

          if (!Array.isArray(shape.task.inputDataset)) shape.task.inputDataset = [shape.task.inputDataset];
          if (!Array.isArray(shape.task.outputDataset)) shape.task.outputDataset = [shape.task.outputDataset];
        }
        this.points.push({
          ...shape,
          x: shape.x || 0,
          y: shape.y || 0
        });
      });
    },
    getDepTaskName(dep) {
      return Object.keys({
        ...(dep?.parents || {}),
        ...(dep?.children || {})
      });
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  // height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  .menu {
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
    &-btn {
      margin-left: 12px;
    }
  }
}

.wrap {
  width: 100%;
  height: 400px;
  flex: 0 0 50%;
}

.readonly {
  border: 1px solid #ddd;
}

.icon-info {
  color: #333;
  cursor: pointer;
}

.data-tooltip {
  line-height: 1.6;
  font-size: $global-font-size-12;
}

.margin-top-15 {
  margin-top: 15px;
}
</style>
