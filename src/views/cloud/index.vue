<template>
  <el-card class="box-card-container">
    <div slot="header">云资源</div>
    <el-row type="flex" justify="space-between">
      <el-form :model="params" :inline="true">
        <el-form-item prop="name">
          <el-input v-model="params.name" placeholder="请输入名称或Principal"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新建云资源</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <Table :body="body" :loading="loading" :params="params" @edit="handleEdit" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" @updateList="getList"></Table>

    <AddResource :visible.sync="addResourceVisible" :edit-data="editData" :loading="addLoading" @updateList="updateList"></AddResource>
  </el-card>
</template>

<script>
import Table from './components/table';
import { resourceSearch, resourceGetOne } from '@/api/cluster';
import { mapGetters } from 'vuex';
import AddResource from './components/addResource';

export default {
  name: 'Cloud',
  components: {
    AddResource,
    Table
  },
  data() {
    return {
      addResourceVisible: false,
      addLoading: false,
      text: '要让 DataCake 在您的云商账户中启动集群，您必须创建一个跨账户 IAM 角色以授予对 DataCake 的访问权限',
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
      resourceGetOne({ id: row.id }).then(res => {
        this.addLoading = false;
        this.editData = res.data;
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    getList() {
      this.loading = true;
      resourceSearch(this.params).then(res => {
        const data = res.data;
        this.loading = false;
        this.body = data.list || [];
        this.params.total = data.total;
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
