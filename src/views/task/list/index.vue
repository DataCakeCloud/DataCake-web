<template>
  <!-- <el-tabs v-model="tab">
    <el-tab-pane label="任务管理" name="1"> -->
  <List />
  <!-- </el-tab-pane>
    <el-tab-pane v-if="isAdmin" label="工作流管理" name="2">
      <Workflow />
    </el-tab-pane>
  </el-tabs> -->
</template>
<script>
import List from './list.vue';
// import Workflow from '@/views/workflow/list';
import { mapGetters } from 'vuex';

export default {
  components: { List },
  data() {
    return {
      tab: this.$route.query?.tab ? this.$route.query?.tab : '1'
    };
  },
  computed: {
    ...mapGetters(['isAdmin'])
  },
  watch: {
    tab() {
      this.$router.push(this.$route.path + '?tab=' + this.tab);
    }
  }
};
</script>
