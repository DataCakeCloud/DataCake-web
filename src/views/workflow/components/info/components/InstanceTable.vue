<template>
  <div class="instance-table">
    <el-table v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }">
      <el-table-column type="index" label="序号" :index="indexMethod" width="50" align="center"></el-table-column>
      <el-table-column prop="instanceID" label="工作流实例ID" min-width="120" align="center">
        <template slot-scope="scope">
          <a @click="goDetail(scope.row)">{{ scope.row.instanceID }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="instanceState" label="运行状态" min-width="100" align="center">
        <template slot-scope="scope">
          {{ statusCodeList[scope.row.instanceState] || scope.row.instanceState }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="state" label="运行次数" min-width="80" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.try_number" class="primary pointer" @click="openRecord(scope.row)">{{ scope.row.try_number }}次</span>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="executionDate" label="例行时间" min-width="180" align="center">
        <template slot-scope="scope">
          {{ scope.row.executionDate ? $utils.parseTime(scope.row.executionDate, '{y}/{m}/{d} {h}:{i}:{s}.{b}') : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始时间" min-width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.startDate ? $utils.parseTime(scope.row.startDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="endDate" label="结束时间" min-width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.endDate ? $utils.parseTime(scope.row.endDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="执行耗时" min-width="100" align="center">
        <template slot-scope="scope">{{ (scope.row.duration * 1000) | duration }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="100" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="goDetail(scope.row)">查看运行详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange"> </el-pagination>
  </div>
</template>
<script>
import * as tools from '@/utils/tools';
import { getInstanceList } from '@/api/flow';

export default {
  name: 'InstanceTable',
  props: {
    date: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  inject: ['updateTabItem'],
  data() {
    return {
      params: {
        workflowID: this.$route.query.id,
        startDate: '',
        endDate: '',
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      loading: false,
      tableData: [],
      statusCodeList: tools.offlineStateCode
    };
  },
  watch: {
    date(value) {
      if (value && value.length) {
        this.params.startDate = value[0];
        this.params.endDate = value[1];
        this.getList();
      }
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getInstanceList(this.params)
        .then(res => {
          const data = res.data;
          this.tableData = data.instanceList;
          this.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.loading = true;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.loading = true;
      this.getList();
    },
    goDetail(row) {
      this.updateTabItem('detail');
    }
  }
};
</script>
<style lang="scss" scoped></style>
