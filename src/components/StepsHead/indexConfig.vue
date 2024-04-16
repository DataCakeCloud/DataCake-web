<template>
  <el-steps :active="source === 'workflow' ? active - 2 : active - 1" :class="['steps-head', source]" process-status="finish" finish-status="success" :direction="direction">
    <template v-if="source === 'workflow'">
      <el-step :title="$t('task.taskStep1')"></el-step>
      <el-step :title="$t('task.taskStep2')"></el-step>
    </template>
    <template v-else>
      <el-step :class="[active >= 1 ? 'success_type' : '']" :title="title1" :description="description1" @click.native="handelStep(1)"></el-step>
      <el-step :class="[active >= 2 ? 'success_type' : '']" :title="title2" :description="description2" @click.native="handelStep(2)"></el-step>
      <el-step :class="[active >= 3 ? 'success_type' : '']" :title="title3" :description="description3" @click.native="handelStep(3)"></el-step>
      <el-step v-if="title4" :class="[active >= 4 ? 'success_type' : '']" :title="title4" :description="description4" @click.native="handelStep(4)"></el-step>
    </template>
  </el-steps>
</template>
<script>
export default {
  name: 'StepsHead',
  props: {
    active: {
      type: Number,
      default: 1
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
      let message = this.$t('task.taskStep3');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep4');
      }
      return message;
    },
    description1() {
      let message = this.$t('task.taskStep5');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep6');
      }
      return message;
    },
    title2() {
      let message = this.$t('task.taskStep7');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep8');
      }
      return message;
    },
    description2() {
      let message = this.$t('task.taskStep9');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep10');
      }
      return message;
    },
    title3() {
      let message = this.$t('task.taskStep11');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep12');
      }
      return message;
    },
    description3() {
      let message = this.$t('task.taskStep13');
      if (this.page === 'dataset') {
        message = this.$t('task.taskStep14');
      }
      return message;
    },
    title4() {
      let str = '';
      if (this.page === 'task') {
        str = this.$t('task.taskStep15');
      }
      return str;
    },
    description4() {
      let str = '';
      if (this.page === 'task') {
        str = this.$t('task.taskStep16');
      }
      return str;
    }
  },
  methods: {
    handelStep(index) {
      if (index >= this.active) return;
      this.$emit('handelStep', index);
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
    min-height: 430px !important;
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
