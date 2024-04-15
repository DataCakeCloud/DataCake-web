<template>
  <el-card class="box-card-container">
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="params" label-position="top" label-width="80px">
      <el-row type="flex" justify="space-between">
        <div>
          <el-form-item prop="id">
            <el-input v-model="params.id" placeholder="请输入监控ID" clearable></el-input>
          </el-form-item>
          <el-form-item prop="ruleType">
            <el-select v-model="params.ruleType" :clearable="true" placeholder="请选择规则类别">
              <template v-for="(item, index) in ruleTypeList">
                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">确定</el-button>
          </el-form-item>
        </div>
        <div>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">添加模板</el-button>
          </el-form-item>
        </div>
      </el-row>
    </el-form>

    <!-- 列表数据 -->
    <el-empty v-if="!body.length && !loading" description="无报表数据"></el-empty>
    <div v-else v-loading="loading">
      <el-table ref="reportTable" :data="body" :height="'calc(100vh - 250px)'" highlight-current-row border>
        <el-table-column prop="id" label="规则模板ID" align="center"> </el-table-column>
        <el-table-column label="模板类型" align="center">
          <template slot-scope="scope">
            {{ ruleTypeList.find(e => e.value === scope.row.ruleType)['name'] }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="模板名称" align="center"> </el-table-column>
        <el-table-column prop="description" label="描述" align="center" width="400"> </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleConfigDqc(scope.row)">配置监控</el-button>
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red" title="确定删除吗？" @confirm="handleDelete(scope.row)">
              <el-button slot="reference" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="params.pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>

    <TemplateDetail :visible.sync="detailVisible" :detail-data="detailData"></TemplateDetail>
  </el-card>
</template>

<script>
import { templatePages, templateDelete } from '@/api/dqc';
import TemplateDetail from './dialogs/templateDetail';
export default {
  name: 'DqcRuleList',
  components: {
    TemplateDetail
  },
  data() {
    return {
      detailVisible: false,
      detailData: {},
      loading: false,
      body: [],
      defaultParams: {
        id: null,
        ruleType: null,
        pageNo: 1,
        pageSize: 10
      },
      params: {
        id: null,
        ruleType: null,
        pageNo: 1,
        pageSize: 10
      },
      total: 0,
      ruleTypeList: this.$t('dqc.ruleTypeList')
    };
  },
  created() {
    this.handleSearch();
  },
  methods: {
    templatePages(params) {
      this.loading = true;
      templatePages(params).then(res => {
        this.loading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        this.body = data.list;
        this.params.pageNo = data.pageNum;
        this.params.pageSize = data.pageSize;
        this.total = data.total;
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.handleSearch();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.handleSearch();
    },
    handleReset() {
      this.params = Object.assign({}, this.defaultParams);
      this.handleSearch();
    },
    handleSearch() {
      const params = Object.assign({}, this.params);
      this.templatePages(params);
    },
    handleAdd() {
      // this.$router.push('/dqc/ruleModel');
      this.$router.push({ name: 'DqcRuleModelConfig' });
    },
    handleConfigDqc(row) {
      // this.$router.push(`/dqc/config?ruleId=${row.id}`);
      this.$router.push({ name: 'DqcConfig', query: { ruleId: row.id }});
    },
    handleDetail(row) {
      this.detailVisible = true;
      this.detailData = row;
    },
    handleEdit(row) {
      // this.$router.push(`/dqc/ruleModel?id=${row.id}`);
      this.$router.push({ name: 'DqcRuleModelConfig', query: { id: row.id }});
    },
    handleDelete(row) {
      templateDelete({ id: row.id }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        this.$message({
          type: 'success',
          message: '删除成功'
        });
      });
    }
  }
};
</script>
