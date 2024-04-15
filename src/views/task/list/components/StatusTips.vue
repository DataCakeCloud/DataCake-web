<template>
  <el-popover trigger="hover" placement="bottom">
    <!-- <el-table :data="codeList" size="mini" :cell-style="{ padding: '4px 0' }">
      <el-table-column min-width="260" property="code" label="code"></el-table-column>
      <el-table-column min-width="100" property="explain" label="含义"></el-table-column>
    </el-table> -->
    <img src="@/assets/status2.png" alt="状态图" style="height: 400px" />
    <i slot="reference" class="el-icon-info"></i>
  </el-popover>
</template>
<script>
export default {
  name: 'StatusTips',
  data() {
    return {
      codeList: [
        {
          code: 'CREATED',
          explain: '已创建'
        },
        {
          code: 'INITIALIZING/SCHEDULED',
          explain: '已上线'
        },
        // {
        //   code: 'RESTARTING',
        //   explain: '作业处于重新启动中'
        // },
        {
          code: 'RUNNING',
          explain: '执行中'
        },
        {
          code: 'CANCELLED',
          explain: '已取消'
        },
        {
          code: 'SUCCESS/SUSPENDED/FINISHED',
          explain: '成功'
        },
        // {
        //   code: 'CANCELLING',
        //   explain: '作业处于取消中'
        // },
        {
          code: 'FAILED',
          explain: '失败'
        }
      ]
    };
  }
};
</script>
<style lang="scss" scoped></style>
