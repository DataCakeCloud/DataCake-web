<template>
  <div>
    <!-- <el-empty v-if="!body.length && !loading" description="暂无数据"></el-empty> -->
    <el-table v-loading="loading" :data="body" highlight-current-row border height="calc(100vh - 300px)">
      <el-table-column label="挂载名称" prop="name" align="left" min-width="100"></el-table-column>
      <el-table-column label="云资源名称" prop="cloudResourceName" align="left" min-width="100"></el-table-column>
      <el-table-column label="地区" prop="cloudResourceRegion" align="center" min-width="90"> </el-table-column>
      <el-table-column label="路径" prop="path" align="center" min-width="200"> </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" min-width="90">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" align="center" min-width="90">
        <template slot-scope="scope">
          {{ parseTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确认删除吗？" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row)">
            <el-button slot="reference" type="text" :loading="deleteLoading">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="params.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
  </div>
</template>

<script>
import { parseTime } from '@/utils/';
import { dataDelete } from '@/api/cluster';
export default {
  name: 'CloudList',
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    body: {
      type: Array,
      default: () => []
    },
    loading: Boolean
  },
  data() {
    return {
      deleteLoading: false
    };
  },
  methods: {
    parseTime(time) {
      const date = new Date(time).getTime();
      return parseTime(date, '{y}-{m}-{d}');
    },
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val);
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val);
    },
    handleEdit(row) {
      this.$emit('edit', row);
    },
    handleDelete(row) {
      this.deleteLoading = true;
      dataDelete({ id: row.id }).then(data => {
        this.deleteLoading = false;
        if (data.code !== 0) return;
        this.$message({
          type: 'success',
          message: '删除成功'
        });

        this.$emit('updateList');
      });
    }
  }
};
</script>
