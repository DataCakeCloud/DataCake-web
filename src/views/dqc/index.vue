<template>
  <el-card class="box-card-container">
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="params" label-position="top" label-width="80px">
      <el-row type="flex" justify="space-between">
        <div>
          <el-form-item prop="id">
            <el-input v-model="params.id" placeholder="请输入监控ID" clearable></el-input>
          </el-form-item>
          <el-form-item prop="dataTable">
            <el-input v-model="params.dataTable" placeholder="请输入表名称" clearable></el-input>
          </el-form-item>
          <el-form-item prop="createBy">
            <el-input v-model="params.createBy" placeholder="请输入负责人" clearable></el-input>
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="params.status" :clearable="true" placeholder="请选择监控状态">
              <template v-for="(item, index) in statusList">
                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item prop="ruleType">
            <el-select v-model="params.ruleType" :clearable="true" placeholder="请选择规则类别">
              <template v-for="(item, index) in ruleTypeList">
                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item prop="active">
            <el-select v-model="params.active" :clearable="true" placeholder="请选择启停状态">
              <template v-for="(item, index) in activeList">
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
            <el-button type="primary" @click="handleAdd">新增监控</el-button>
          </el-form-item>
        </div>
      </el-row>
    </el-form>

    <!-- 列表数据 -->
    <el-empty v-if="!body.length && !loading" description="无报表数据"></el-empty>
    <div v-else v-loading="loading">
      <el-table ref="reportTable" :data="body" :height="'calc(100vh - 250px)'" highlight-current-row border>
        <el-table-column label="ID" align="center" width="50">
          <template slot-scope="scope">
            {{ scope.row.metricInfo.id }}
          </template>
        </el-table-column>
        <el-table-column label="监控名称" align="left" min-width="200">
          <template slot-scope="scope">
            <el-tooltip slot="label" effect="dark" :content="scope.row.metricInfo.name" placement="right">
              <div class="cell-ellipsis" title="点击可复制" @click="handleCopy(scope.row.metricInfo.name)">{{ scope.row.metricInfo.name }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="表" align="center" min-width="270">
          <template slot-scope="scope">
            <a class="cell-ellipsis" href="javascript:;" @click="handleConfig(scope.row)">{{ scope.row.metricInfo.dataTable }}</a>
          </template>
        </el-table-column>
        <el-table-column label="数据源" align="center" min-width="200">
          <template slot-scope="scope">
            {{ `${scope.row.metricInfo.sourceType}/${scope.row.metricInfo.dataSet}@${scope.row.metricInfo.dataRegion}` }}
          </template>
        </el-table-column>
        <el-table-column label="监控状态" align="center" width="100">
          <template slot-scope="scope">
            {{ statusList.find(e => e.value === scope.row.status)['name'] }}
          </template>
        </el-table-column>
        <el-table-column label="规则模板ID" align="center">
          <template slot-scope="scope">
            <div v-html="getRuleIds(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column label="监控周期" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.metricInfo.checkInterval === 0 ? '天' : '小时' }}
          </template>
        </el-table-column>
        <el-table-column label="基线时间" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.metricInfo.checkTime }}
          </template>
        </el-table-column>
        <el-table-column label="最近开始时间-最近结束时间" align="center" min-width="280">
          <template slot-scope="scope"> {{ scope.row.lastCheckStartTime }} - {{ scope.row.lastCheckFinishTime }} </template>
        </el-table-column>
        <el-table-column label="监控owner" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.metricInfo.ownerName }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDqcReport(scope.row)">监控报告</el-button>
            <el-button v-if="scope.row.metricInfo.active === 0" type="text" @click="handleOpenClose(scope.row)">开启</el-button>
            <el-button v-if="scope.row.metricInfo.active === 1" type="text" @click="handleOpenClose(scope.row)">关闭</el-button>
            <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red" title="确定删除吗？" @confirm="handleDelete(scope.row)">
              <el-button slot="reference" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="params.pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>

    <Report :visible.sync="reportVisible" :report-data="reportData"></Report>
  </el-card>
</template>

<script>
import { MetricPages, MetricDelete, MetricActive } from '@/api/dqc';
import Report from './dialogs/report';
import copy from 'copy-to-clipboard';
export default {
  name: 'DqcList',
  components: {
    Report
  },
  data() {
    return {
      loading: false,
      reportVisible: false,
      reportData: {},
      body: [],
      defaultParams: {
        id: null,
        dataTable: null,
        createBy: null,
        status: null,
        ruleType: null,
        active: null,
        pageNo: 1,
        pageSize: 10
      },
      params: {
        id: null,
        dataTable: null,
        createBy: null,
        status: null,
        ruleType: null,
        active: null,
        pageNo: 1,
        pageSize: 10
      },
      total: 0,
      statusList: this.$t('dqc.statusList'),
      ruleTypeList: this.$t('dqc.ruleTypeList'),
      activeList: this.$t('dqc.activeList')
    };
  },
  created() {
    this.handleSearch();
  },
  methods: {
    MetricPages(params) {
      this.loading = true;
      MetricPages(params).then(res => {
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
    handleCopy(val) {
      copy(val, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '任务名称已复制到剪贴板'
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.handleSearch();
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.handleSearch();
    },
    handleReset() {
      this.params = Object.assign({}, this.defaultParams);
      this.handleSearch();
    },
    handleSearch() {
      const params = Object.assign({}, this.params);
      this.MetricPages(params);
    },
    handleAdd() {
      // this.$router.push('/dqc/config');
      this.$router.push({ name: 'DqcConfig' });
    },
    handleConfig(row) {
      // this.$router.push(`/dqc/config?id=${row.metricInfo.id}`);
      this.$router.push({ name: 'DqcConfig', query: { id: row.metricInfo.id }});
    },
    getRuleIds(row) {
      const ids = row.templateIds;
      const arr = ids
        .map(e => {
          return `<a href="/monitor/ruleModel?id=${e}">${e}</a>`;
        })
        .join(', ');

      return arr;
    },
    handleDelete(row) {
      MetricDelete({ id: row.metricInfo.id }).then(res => {
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
        this.handleSearch();
      });
    },
    handleDqcReport(row) {
      this.reportVisible = true;
      this.reportData = row.metricInfo;
    },
    handleOpenClose(row) {
      const act = row.metricInfo.active;
      const id = row.metricInfo.id;
      const active = act === 0 ? 1 : 0;
      MetricActive({ id, active }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        this.$message({
          type: 'success',
          message: `${active === 0 ? '关闭' : '开启'}成功`
        });
        this.handleSearch();
      });
    }
  }
};
</script>
