<template>
  <div v-loading.fullscreen="loading" class="container">
    <div class="menu">
      <div class="menu-left">{{ name }}</div>
      <div class="menu-right">
        <el-button :disabled="!editable" class="menu-btn" size="mini" type="primary" @click="save">保存</el-button>
        <el-popconfirm v-if="editable" class="menu-btn" title="是否保存当前工作流" @confirm="save" @cancel="close">
          <el-button slot="reference" size="mini">关闭</el-button>
        </el-popconfirm>
        <el-button v-else size="mini" @click="close">关闭</el-button>
      </div>
    </div>
    <flow-editor ref="flowEditor" class="wrap" :relations="relations" :shapes="formData.points">
      <template slot-scope="{ data }">
        <el-tooltip effect="dark" placement="bottom">
          <div v-if="data.type === 'table'" slot="content" class="data-tooltip">
            <div>数据集名称：{{ data.name }}</div>
            <div v-if="'isExternal' in data">数据集类型：{{ data.isExternal ? '外部' : '内部' }}</div>
            <div>关联任务：{{ data.produceDataSetTask }}</div>
            <!-- <div>关联任务：{{ getDepTaskName(dep) }}</div> -->
          </div>
          <div v-if="data.type === 'task'" slot="content" class="data-tooltip">
            <div>任务名称：{{ data.name }}</div>
            <div>任务类型：{{ data.task.templateCode }}</div>
          </div>
          <div v-if="data.type === 'event'" slot="content" class="data-tooltip">
            <div>任务依赖：{{ data.name }}</div>
          </div>
          <div v-if="data.type === 'crontab'" slot="content" class="data-tooltip">
            <div>定时任务：{{ data.crontab }}</div>
          </div>
          <i class="icon-info el-icon-info" />
        </el-tooltip>
      </template>
    </flow-editor>
    <el-dialog title="保存工作流" :visible.sync="dialogVisable" append-to-body>
      <el-form :model="formData" label-position="right" label-width="20%">
        <el-form-item prop="name" label="工作流名称" required><el-input v-model="formData.name" placeholder="请输入不超过100个字符" /></el-form-item>
        <el-form-item prop="description" label="描述"><el-input v-model="formData.description" type="textarea" placeholder="请输入不超过100个字符" /></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addWorkflow, editWorkflow, getWorkFlowById } from '@/api/workflow';
import flowEditor from './components/newFlow/flowEditor.vue';
import { mapGetters } from 'vuex';

export default {
  components: { flowEditor },
  data() {
    return {
      workflowId: this.$route.query.id,
      loading: false,
      name: '创建工作流',
      dialogVisable: false,
      relations: [],
      editable: true,
      formData: {
        name: '',
        description: '',
        tasks: [],
        points: []
        // firstPoints: []
      }
    };
  },
  computed: {
    ...mapGetters(['isAdmin'])
  },
  mounted() {
    if (this.$route.params.id || this.$route.query.cid) {
      this.getData();
    }
  },
  methods: {
    close() {
      this.$router.push('/task/list?tab=2');
    },

    save() {
      this.dialogVisable = true;
    },

    async submit() {
      const formData = Object.assign({}, this.formData);
      delete formData.points;
      const fn = formData.id ? editWorkflow : addWorkflow;
      formData.tasks = this.$refs.flowEditor.getTasks();
      if (this.$route.query.cid) {
        formData.tasks.forEach(task => {
          delete task.id;
        });
      }
      // this.formData.firstPoints = this.$refs.flowEditor.getFirstPoints();
      await fn(formData);
      this.dialogVisable = false;
      this.close();
    },

    async getData() {
      this.loading = true;
      const { points, relations, name, description, id, online, canEdit } = await (await getWorkFlowById({ id: this.$route.params.id || this.$route.query.cid })).data;
      this.editable = this.$route.query.cid || ((this.isAdmin || canEdit) && online === 0);
      this.relations = relations;
      this.filterShapes(points);
      this.formData.description = description;
      if (this.$route.query.cid) {
        this.formData.name = name + '_copy';
      } else {
        this.formData.name = name;
        this.formData.id = id;
        this.name = `${this.editable ? '编辑' : '查看'}${name}`;
      }
      this.$nextTick(() => {
        this.$refs.flowEditor.format();
        this.loading = false;
      });
    },

    filterShapes(points) {
      this.formData.points = [];
      points.forEach(shape => {
        if (shape.type === 'task') {
          shape.task.inputDataset = (typeof shape.task.inputDataset === 'string' ? JSON.parse(shape.task.inputDataset) : shape.task.inputDataset) || [];
          shape.task.outputDataset = (typeof shape.task.outputDataset === 'string' ? JSON.parse(shape.task.outputDataset) : shape.task.outputDataset) || [];

          if (this.$route.query.cid) {
            [...shape.task.inputDataset, ...shape.task.outputDataset].forEach(dataset => {
              delete dataset.id;
            });
            shape.task.name += '_copy';
            delete shape.task.id;
          }

          shape.task.runtimeConfig = (typeof shape.task.runtimeConfig === 'string' ? JSON.parse(shape.task.runtimeConfig) : shape.task.runtimeConfig) || [];

          shape.task.eventDepends = (typeof shape.task.eventDepends === 'string' ? JSON.parse(shape.task.eventDepends) : shape.task.eventDepends) || [];
          shape.task.triggerParam = (typeof shape.task.triggerParam === 'string' ? JSON.parse(shape.task.triggerParam) : shape.task.triggerParam) || [];

          if (!Array.isArray(shape.task.inputDataset)) shape.task.inputDataset = [shape.task.inputDataset];
          if (!Array.isArray(shape.task.outputDataset)) shape.task.outputDataset = [shape.task.outputDataset];
        }
        this.formData.points.push({
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
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  .menu {
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    &-btn {
      margin-left: 12px;
    }
    &-left {
      color: #333;
      font-size: $global-font-size-18;
    }
  }
}

.wrap {
  width: 100%;
  flex: 1;
}

.data-tooltip {
  line-height: 1.6;
  font-size: $global-font-size-12;
}
.icon-info {
  color: #333;
  cursor: pointer;
}
</style>
