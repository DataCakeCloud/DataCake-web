<!--  chenyh1 -->
<template>
  <div class="step">
    <el-steps :active="step" class="step-header" process-status="finish" finish-status="success" align-center>
      <el-step title="选择创建方式" description="定义数据集的基本信息"></el-step>
      <el-step title="填写SQL信息" description="填写创建SQL语句"></el-step>
      <el-step title="补充验证信息" description="补充必要信息"></el-step>
    </el-steps>
    <div class="step-container"><slot /></div>
    <div class="step-container step-container--full"><slot name="full" /></div>
    <div class="step-btns step-container">
      <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
      <el-button type="primary" @click="nextStep">{{ 2 > step ? '下一步' : '完成' }}</el-button>
    </div>
  </div>
</template>

<script>
import { trigger } from '@/utils/vue-helpers';
const required = true;

export default {
  props: {
    step: {
      type: Number,
      default: 0,
      required
    }
  },
  data() {
    return {};
  },
  methods: {
    @trigger('prevStep')
    prevStep() {
      // this.$router.go(-1);
    },
    @trigger('nextStep')
    nextStep() {}
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step {
  padding: 32px;
  &-header {
    padding-left: 50px;
    margin: 0 auto 16px;
    max-width: 650px;
  }
  &-container {
    max-width: 600px;
    margin: 0 auto 16px;
    &--full {
      max-width: 100%;
    }
  }
  &-btns {
    text-align: right;
  }
}
</style>
