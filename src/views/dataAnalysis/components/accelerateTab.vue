<template>
  <div class="accelerate-box">
    <div class="condition-box">
      <el-input v-model="params.filter" class="condition-input" placeholder="请输入加速表名或申请人" size="mini" clearable @keyup.enter.native="search">
        <i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer" @click="search"></i>
      </el-input>
    </div>
    <div class="query-list">
      <el-table ref="multipleTable" v-loading="loading" :data="list" style="width: 100%" height="calc(100vh - 180px)" tooltip-effect="dark table_overflow_tootip" :cell-style="{ padding: '0px', height: '36px' }" @selection-change="handleSelectionChange">
        <el-table-column type="index" label="序号" :index="indexMethod" width="55" align="center"> </el-table-column>
        <el-table-column label="申请加速ID" width="120" prop="acc_id" show-overflow-tooltip></el-table-column>
        <el-table-column label="加速表名称" min-width="300" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.acc_table_name.length > 55" class="item" effect="dark" placement="top-start">
              <div slot="content">{{ scope.row.acc_table_name }}</div>
              <div class="btn">{{ scope.row.acc_table_name }}</div>
            </el-tooltip>
            <div v-else class="btn">{{ scope.row.acc_table_name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="acc_table_begin" label="加速时间最大值条件" width="160" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="region" label="所属数据区域" width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="create_by" label="申请人" width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="create_time" label="申请时间" width="200" show-overflow-tooltip :formatter="formatter"></el-table-column>
        <el-table-column prop="acc_status" label="申请状态" width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="acc_count" label="加速后查询次数" width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="deleteBtn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-pagination background :total="total" :current-page="params.offset" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.limit" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccelerationList, deleteAcceleration } from '@/api/querydata';

export default {
  data() {
    return {
      params: {
        filter: '',
        limit: 30,
        offset: 1
      },
      total: 0,
      list: [],
      loading: false
    };
  },
  computed: {},
  created() {
    this.search();
  },
  methods: {
    indexMethod(index) {
      return (this.params.offset - 1) * this.params.limit + index + 1;
    },
    formatter(row, colum) {
      const data = row[colum.property];
      return this.$utils.parseTime(data, '{y}-{m}-{d} {h}:{i}:{s}');
    },
    deleteBtn(data) {
      this.$confirm('确定要删除该加速表?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          deleteAcceleration({ acc_id: data.acc_id }).then(res => {
            if (res.data.result === 'SUCCESS') {
              this.$message({
                type: 'success',
                message: '删除成功'
              });
              this.getList();
            } else {
              this.$message({
                type: 'error',
                message: res.data.message || '删除失败'
              });
            }
          });
        })
        .catch(() => {});
    },
    getList() {
      this.loading = true;
      getAccelerationList(this.params)
        .then(res => {
          this.list = res.result;
          this.total = res.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    search() {
      this.params.offset = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.offset = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.limit = val;
      this.params.offset = 1;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
};
</script>

<style lang="scss" scoped>
.accelerate-box {
  height: 100%;
  padding: 10px;
  .condition-box {
    margin-bottom: 10px;
    overflow: hidden;
    .condition-input {
      width: 300px;
      float: right;
    }
  }
  .query-list {
    .footer {
      .el-pagination {
        padding-top: 10px;
      }
    }
  }
}
</style>
