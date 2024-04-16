<template>
  <el-dialog title="预览" :visible.sync="dialogVisible" width="650px" class="check-path" :append-to-body="true" :modal-append-to-body="false">
    <div v-loading="loading">
      <div class="title">最近一次调度日期：{{ data.lastExecutionDate }}</div>
      <el-table :data="data.dependDate" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
        <el-table-column prop="executionDate" label="实例日期" min-width="160" align="center" :formatter="formatter">
          <template #header>
            实例日期
            <el-tooltip popper-class="custom-tip" effect="light" content="外部数据没有实例日期" placement="bottom">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="dataDate" label="数据日期" min-width="160" align="center" :formatter="formatter"></el-table-column>
        <el-table-column prop="checkPath" label="检查路径" min-width="160" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.checkPath" :disabled="isTipDisabled">
              <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.checkPath || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script>
import { preview } from '@/api/task';

export default {
  name: 'PreviewDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isTipDisabled: false,
      data: {}
    };
  },
  methods: {
    showWin(params) {
      // this.loading = true;
      this.dialogVisible = true;
      preview(params).then(res => {
        const data = res.data;
        this.data = data;
        this.loading = false;
      });
    },
    formatter(row, column, cellValue, index) {
      if (cellValue === '' || cellValue === null) {
        return '-';
      } else {
        return cellValue;
      }
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.title {
  font-size: $global-font-size-14;
  color: #333;
  margin-bottom: 20px;
}
</style>
