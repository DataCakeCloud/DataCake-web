<template>
  <el-card class="box-card-container">
    <div slot="header">数据挂载</div>
    <el-row type="flex" justify="space-between">
      <el-form :model="params" :inline="true">
        <el-form-item prop="name">
          <el-input v-model="params.name" placeholder="请输入挂载名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="handleAdd">添加数据</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <Table :body="body" :loading="loading" :params="params" @edit="handleEdit" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" @updateList="getList"></Table>

    <AddData :visible.sync="addResourceVisible" :edit-data="editData" :loading="addLoading" @updateList="updateList"></AddData>
  </el-card>
</template>

<script>
import Table from './components/table';
import AddData from './components/addData';
import { dataSearch, dataGetOne } from '@/api/cluster';
import { mapGetters } from 'vuex';

export default {
  name: 'Cloud',
  components: {
    AddData,
    Table
  },
  data() {
    return {
      addResourceVisible: false,
      addLoading: false,
      loading: false,
      editData: {},
      body: [],
      params: {
        name: '',
        total: 0,
        pageNum: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    this.getList();
  },
  methods: {
    handleAdd() {
      this.editData = {};
      this.addResourceVisible = true;
    },
    handleEdit(row) {
      this.addLoading = true;
      this.addResourceVisible = true;
      dataGetOne({ id: row.id }).then(res => {
        this.addLoading = false;
        this.editData = res.data;
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getReportList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getReportList();
    },
    getList() {
      this.loading = true;
      dataSearch(this.params).then(res => {
        this.loading = false;
        this.body = res.data.list || [];
        this.params.total = res.data.total;
      });
    },
    updateList() {
      this.getList();
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.tip {
  margin-bottom: 20px;
}
</style>
