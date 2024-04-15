<template>
  <el-steps :active="source === 'workflow' ? active - 1 : active" :class="['steps-head', source]" process-status="finish" finish-status="success" :direction="direction">
    <template v-if="source === 'workflow'">
      <el-step title="设置任务信息"></el-step>
      <el-step title="设置依赖信息"></el-step>
    </template>
    <template v-else>
      <el-step :class="[active >= 0 ? 'success_type' : '']" :title="title1" :description="description1" @click.native="handelStep(0)"></el-step>
      <el-step :class="[active >= 1 ? 'success_type' : '']" :title="title2" :description="description2" @click.native="handelStep(1)"></el-step>
      <el-step :class="[active >= 2 ? 'success_type' : '']" :title="title3" :description="description3" @click.native="handelStep(2)"></el-step>
      <el-step v-if="title4" :class="[active >= 3 ? 'success_type' : '']" :title="title4" :description="description4" @click.native="handelStep(3)"></el-step>
    </template>
  </el-steps>
</template>
<script>
export default {
  name: 'StepsHead',
  props: {
    active: {
      type: Number,
      default: 0
    },
    page: {
      type: String,
      default: 'task'
    },
    source: {
      type: String,
      default: 'task'
    },
    direction: {
      type: String,
      default: 'horizontal'
    }
  },
  data() {
    return {};
  },
  computed: {
    title1() {
      let message = '选模板';
      if (this.page === 'dataset') {
        message = '选择数据源';
      }
      return message;
    },
    description1() {
      let message = '选择所需模板';
      if (this.page === 'dataset') {
        message = '定义数据源的基本信息';
      }
      return message;
    },
    title2() {
      let message = '配置任务';
      if (this.page === 'dataset') {
        message = '创建表';
      }
      return message;
    },
    description2() {
      let message = '源与目标信息配置、字段映射、加工逻辑等';
      if (this.page === 'dataset') {
        message = '填写表信息';
      }
      return message;
    },
    title3() {
      let message = '配置调度';
      if (this.page === 'dataset') {
        message = '设置表信息';
      }
      return message;
    },
    description3() {
      let message = '调度Cron、前置依赖、生成数据集等';
      if (this.page === 'dataset') {
        message = '添加表维护信息';
      }
      return message;
    },
    title4() {
      let str = '';
      if (this.page === 'task') {
        str = '预览';
      }
      return str;
    },
    description4() {
      let str = '';
      if (this.page === 'task') {
        str = '预览结果和校验';
      }
      return str;
    }
  },
  methods: {
    handelStep(index) {
      if (index >= this.active) return;
      if (index < 1) {
        this.$router.push({ name: 'TaskStep1', query: this.$route.query });
      } else {
        this.$emit('handelStep', index);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.steps-head {
  width: 700px;
  &.workflow {
    margin: 20px auto 0;
    width: 500px;
  }
  .el-step {
    cursor: pointer;
  }
  &.task {
    min-width: 150px;
    ::v-deep {
      .el-step__description.is-success,
      .el-step__head.is-success,
      .el-step__title.is-success,
      .el-step__description.is-wait,
      .el-step__head.is-wait,
      .el-step__title.is-wait {
        color: #777d85; //414d5c
      }
      .el-step__line {
        background-color: #777d85;
      }
      .el-step__head.is-success,
      .el-step__head.is-wait {
        border-color: #777d85;
      }

      .success_type:hover {
        .el-step__description.is-success,
        .el-step__head.is-success,
        .el-step__title.is-success {
          color: $c-primary;
        }
        .el-step__head.is-success {
          border-color: $c-primary;
        }
      }
    }
  }
}
</style>
