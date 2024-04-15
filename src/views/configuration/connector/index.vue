<!--  chenyh1 -->
<template>
  <el-card class="box-card-container">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="输入源连接器" name="source">
        <TabPaneDefinitions :active-name="activeName"></TabPaneDefinitions>
      </el-tab-pane>
      <el-tab-pane label="输出源连接器" name="destination">
        <TabPaneDefinitions :active-name="activeName"></TabPaneDefinitions>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import TabPaneDefinitions from './components/TabPaneDefinitions';
export default {
  components: {
    TabPaneDefinitions
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
