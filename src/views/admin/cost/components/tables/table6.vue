<template>
  <el-table v-loading="loading" :data="body" style="width: 100%" highlight-current-row border @sort-change="handleSort">
    <el-table-column label="owner" prop="owner" align="center"> </el-table-column>
    <el-table-column label="任务数量" prop="jobNum" align="center" :sortable="'custom'"> </el-table-column>
    <el-table-column label="当日任务用量" prop="jobNameQuantity" align="center" :sortable="'custom'"> </el-table-column>
    <el-table-column label="用量周同比" prop="basisRatio" align="center" :sortable="'custom'"> </el-table-column>
    <el-table-column label="异常时间" prop="dt" align="center" :sortable="'custom'"> </el-table-column>
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
  },
  methods: {
    handleSort(column, prop, order) {
      this.$emit('handleSort', column);
    }
  }
};
</script>
