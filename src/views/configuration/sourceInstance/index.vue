<!--  chenyh1 -->
<template>
  <div class="bg-white">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="数据源" name="source">
        <TabPane :active-name="activeName"></TabPane>
      </el-tab-pane>
      <!-- <el-tab-pane label="输出源实例" name="destination">
        <TabPane :active-name="activeName"></TabPane>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import TabPane from './components/TabPane';
export default {
  components: {
    TabPane
    // detail
  },
  data() {
    return {
      activeName: 'source'
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {}
};
</script>
<style lang="scss" scoped></style>
