<template>
  <el-table v-loading="loading" :data="tableData" border class="table_info">
    <el-table-column prop="dbName" label="库名" width="150"></el-table-column>
    <el-table-column prop="tableName" label="表名" width="150"></el-table-column>
    <el-table-column prop="level" label="表敏感级别" width="100"></el-table-column>
    <el-table-column prop="prove" label="敏感字段" width="200">
      <template slot-scope="scope">
        <el-tooltip :content="scope.row.prove || '-'" :disabled="isTipDisabled">
          <span :class="['ellipsis', 'block', scope.row.prove ? 'red_text' : '']" @mouseenter="isShowTooltip">{{ scope.row.prove || '-' }}</span>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="分类"></el-table-column>
    <el-table-column prop="commit" label="表描述"></el-table-column>
    <el-table-column prop="owner" label="数据库负责人" width="150"></el-table-column>
  </el-table>
</template>
<script>
import { column } from '@/api/metadata';

export default {
  name: 'TableInfo',
  props: {
    tableIdList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tableData: [],
      loading: false,
      isTipDisabled: false
    };
  },
  watch: {
    tableIdList: {
      handler: function(newVal) {
        newVal.forEach((item, i) => {
          if (!this.tableData.some(dd => dd.id === item.id)) this.getColumn(item, i);
        });
        this.tableData.forEach((item, i) => {
          if (!newVal.map(i => i.id).includes(item.id)) {
            this.tableData.splice(i, 1);
          }
        });
        if (!newVal?.length) {
          this.tableData = [];
        }
      },
      immediate: true
    }
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    getColumn(data, index) {
      if (!data) return;
      this.loading = true;
      const params = {
        region: data.region,
        tableName: data.table_name,
        dbName: data.db_name
      };
      return column(params)
        .then(res => {
          const columnsList = res.data.columnsList || [];
          const result = {
            id: data.id,
            dbName: data.db_name,
            tableName: data.table_name,
            type: '-',
            commit: data.description || '-',
            owner: data.owner || '-',
            prove: columnsList.map(item => item.name).join(','),
            level: data.tableLevel ? data.tableLevel : '-'
          };
          this.$set(this.tableData, index, result);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.table_info {
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
