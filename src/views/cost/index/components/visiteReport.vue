<template>
  <div class="table">
    <el-empty v-if="!list.length && !loading" description="无访问报告数据"></el-empty>
    <template v-else>
      <div class="table-list table-title">
        <div class="table-name list-item">名称</div>
        <div class="table-owner list-item">创建者</div>
        <div class="table-visite-times list-item">上次访问时间</div>
      </div>
      <el-divider></el-divider>
      <div v-loading="loading" class="list-box">
        <template v-for="(item, index) in list">
          <div :key="index" class="table-list">
            <div class="list-table-name table-name cell-ellipsis list-item" @click="handleLink(item)">{{ item.reportName }}</div>
            <div class="table-owner cell-ellipsis list-item">{{ item.createUser }}</div>
            <div class="table-visite-times list-item">{{ item.visitTime }}</div>
          </div>
          <el-divider v-if="index !== list.length - 1" :key="`${index}_${index}_divider`"></el-divider>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { reportHistory } from '@/api/cost';
export default {
  name: '',
  props: {
    loading: Boolean,
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleLink(item) {
      this.$router.push({ name: 'NewCostAnalysis', query: { id: item.reportId }});
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.table-title {
  height: 20px;
  margin-top: 10px;
  align-items: center;
}
.list-box {
  padding: 0 10px;
  height: calc(30vh);
  overflow-y: auto;
}
::v-deep .el-divider--horizontal {
  margin: 10px 0;
}
.table-list {
  display: flex;
  align-items: center;

  .list-item {
    text-align: center;
  }

  .list-table-name {
    color: $c-primary;
  }

  .table-name,
  .table-owner {
    flex: 1;
  }

  .table-visite-times {
    flex: 2;
  }
}
</style>
