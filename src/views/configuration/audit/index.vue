<template>
  <div class="screen-box">
    <div class="tab-box">
      <el-tabs v-model="activeTab" @tab-click="tabClick">
        <el-tab-pane name="function">
          <span slot="label">
            <!-- <svg-icon icon-class="asstes2"></svg-icon> -->
            功能审计
          </span>
        </el-tab-pane>
        <el-tab-pane name="data">
          <span slot="label">
            <!-- <svg-icon icon-class="calculate2"></svg-icon> -->
            数据审计
          </span>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="main-box">
      <FunctionComp v-if="activeTab === 'function'"></FunctionComp>
      <dataComp v-else></dataComp>
    </div>
  </div>
</template>
<script>
import FunctionComp from './function.vue';
import dataComp from './data.vue';
export default {
  components: {
    FunctionComp,
    dataComp
  },
  data() {
    return {
      activeTab: 'function'
    };
  },
  created() {
    if (!this.$route.query.type) {
      this.$router.push({ query: { type: this.activeTab }});
    } else {
      this.activeTab = this.$route.query.type;
    }
  },
  methods: {
    tabClick() {
      this.$router.push({ query: { type: this.activeTab }});
    }
  }
};
</script>

<style lang="scss" scoped>
.screen-box {
  .tab-box {
    position: relative;
    .data-test {
      position: absolute;
      top: 12px;
      right: 70px;
      margin: auto;
      font-weight: 500;
      color: #74bfdd;
      cursor: pointer;
    }
  }
  .main-box {
    padding: 20px;
    padding-top: 0;
  }
  .active {
    color: #3782ff !important;
  }
}
</style>
<style>
.screen-box .tab-box .el-tabs__nav-wrap {
  padding-left: 20px;
}
</style>
