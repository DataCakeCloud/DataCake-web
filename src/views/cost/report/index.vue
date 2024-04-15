<template>
  <el-card class="box-card-container">
    <div class="box-content">
      <LeftTree></LeftTree>
      <div class="box-r">
        <div class="r-t">
          <el-form :inline="true" :model="params" label-position="left" label-width="80px">
            <el-form-item prop="lessee" label="报告名称">
              <el-input v-model="params.name" placeholder="请输入用户组名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <Table :body="body" :loading="loading" :params="params" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" @updateMultipleSelection="updateMultipleSelection" @updateList="getReportList"></Table>
      </div>
    </div>
  </el-card>
</template>

<script>
import { parseDate, getValue } from '@/utils/';
import { listDictionary, stat } from '@/api/cost';
import LeftTree from '../components/leftTree';
import Table from './components/table';

import { reportList } from '@/api/cost';

export default {
  name: 'CostCenter',
  components: {
    LeftTree,
    Table
  },
  data() {
    return {
      params: {
        name: '',
        page: 1,
        limit: 10,
        total: 0
      },
      loading: false,
      body: [],
      multipleSelection: []
    };
  },
  created() {
    this.getReportList();
  },
  methods: {
    getReportList() {
      this.loading = true;
      reportList(this.params).then(res => {
        this.loading = false;
        this.body = res.data;
        this.params.page = res.page;
        this.params.limit = res.limit;
        this.params.total = res.total;
      });
    },
    handleSizeChange(val) {
      this.params.limit = val;
      this.getReportList();
    },
    handleCurrentChange(val) {
      this.params.page = val;
      this.getReportList();
    },
    updateMultipleSelection(val) {
      this.multipleSelection = val;
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  ::v-deep .el-card__header {
    padding: 10px 20px;
  }
  ::v-deep .el-card__body {
    padding: 0;
  }

  .box-content {
    display: flex;
  }

  .box-r {
    flex: 1;
    padding: 10px 10px;
  }

  .r-t {
  }
}
</style>
