<template>
  <el-table v-loading="loading" :data="tableData" border class="prove_table">
    <el-table-column prop="level" label="级别" width="70">
      <template slot-scope="scope">
        <span :class="[scope.row.isRed ? 'red_text' : '']">{{ scope.row.dataLevel || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="factor" label="定级要素" width="200">
      <template slot-scope="scope">
        <span :class="[scope.row.isRed ? 'red_text' : '']">{{ scope.row.definingElements || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="commit" label="常用字段">
      <template slot-scope="scope">
        <span :class="[scope.row.isRed ? 'red_text' : '']">{{ scope.row.commonFields || '-' }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { sensitivityLevel } from '@/api/metadata';

export default {
  name: 'ProveTable',
  data() {
    return {
      tableData: [],
      loading: false
    };
  },
  created() {
    this.sensitivityLevel();
  },
  methods: {
    sensitivityLevel() {
      this.loading = true;
      sensitivityLevel()
        .then(res => {
          this.tableData = res.data || [];
          this.tableData.forEach(item => {
            if (['3', '4'].some(v => item.dataLevel.includes(v))) {
              this.$set(item, 'isRed', true);
            }
          });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.prove_table {
  border: 1px solid #e2e9f3 !important;
  ::v-deep .el-table__header-wrapper {
    .el-table__cell {
      padding: 4px 0 !important;
    }
  }
  .red_text {
    color: red;
  }
}
</style>
