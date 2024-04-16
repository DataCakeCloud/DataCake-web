<template>
  <el-table v-loading="loading" :data="body" style="width: 100%" highlight-current-row border>
    <el-table-column label="任务ID" prop="jobId" align="center" width="100"> </el-table-column>
    <el-table-column label="任务名称" prop="jobName" align="center" min-width="200"> </el-table-column>
    <el-table-column label="部门" prop="departmentName" align="center"> </el-table-column>
    <el-table-column label="owner" prop="owner" align="center"> </el-table-column>
    <el-table-column label="创建时间" prop="dt" align="center" :sortable="'custom'"> </el-table-column>
    <el-table-column label="当日任务用量" prop="jobNameQuantity" align="center"> </el-table-column>
    <el-table-column label="操作" align="center" fixed="right">
      <template slot-scope="scope">
        <a v-if="scope.row.jobId" :href="`${$locationOrigin}/task/detail?id=${scope.row.jobId}&name=${scope.row.jobName}`" target="_blank">任务详情</a>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    body: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  }
};
</script>
