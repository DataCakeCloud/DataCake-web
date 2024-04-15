<template>
  <el-card class="box-card-container">
    <div class="box-content">
      <LeftTree></LeftTree>
      <div class="box-r">
        <div class="r-l">
          <el-card ref="chartRef" class="r-l-t dashboard-card chart-card-box">
            <div slot="header">
              <el-button type="primary" @click="handleCreate">新建报告</el-button>
              <el-popover v-model="visible" placement="top" width="240">
                <el-input v-model="name" placeholder="请输入报告名称"></el-input>
                <div style="text-align: right; margin: 10px 0 0 0">
                  <el-button size="mini" type="text" @click="visible = false">取消</el-button>
                  <el-button :disabled="!name.length || saveLoading" :loading="saveLoading" type="primary" size="mini" @click="handleSaveConfirm">确定</el-button>
                </div>
                <el-button slot="reference" type="primary">保存</el-button>
              </el-popover>

              <el-popover v-model="saveAsvisible" placement="top" width="240">
                <el-input v-model="name" placeholder="请输入报告名称"></el-input>
                <div style="text-align: right; margin: 10px 0 0 0">
                  <el-button size="mini" type="text" @click="saveAsvisible = false">取消</el-button>
                  <el-button :disabled="!name.length || saveAsLoading" :loading="saveAsLoading" type="primary" size="mini" @click="handleSaveAsConfirm">确定</el-button>
                </div>
                <el-button slot="reference" type="primary">另存为</el-button>
              </el-popover>
            </div>
            <CustomForm :is-show="true" :filters="topParams" @updateParams="updateParams"></CustomForm>
            <FilterList :params="params" :query-group="queryGroup" @updateFilter="updateFilter"></FilterList>

            <el-divider></el-divider>

            <Chart :params="params" :list="list" :loading="loading"></Chart>
          </el-card>

          <Table :params="params" :list="list" :table-height="tableHeight" :loading="loading" @updateHeight="updateHeight" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></Table>
        </div>
        <div class="r-r">
          <SideFilter :params="params" :filters="sideFilter" @updateFilter="updateSideFilter" @handleQuery="getChartList"></SideFilter>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import LeftTree from '../components/leftTree';
import CustomForm from '../components/customForm';
import FilterList from './components/filter';
import Chart from './components/chart';
import SideFilter from './components/sideFilter';
import Table from './components/table';

import { homeRequest, reportSave, reportSaveAs, reportGetById } from '@/api/cost';

export default {
  name: 'CostAnalysis',
  components: {
    LeftTree,
    CustomForm,
    FilterList,
    Chart,
    Table,
    SideFilter
  },
  data() {
    return {
      id: this.$route.query.id,
      loading: false,
      visible: false,
      saveAsvisible: false,
      name: '',
      params: {
        page: 1,
        limit: 20,
        total: 0
      },
      timeRange: null,
      queryGroup: 0,
      filterStr: '',
      sideFilter: {},
      topParams: {},
      saveLoading: false,
      saveAsLoading: false,
      filterList: this.$t('cost.filterList'),
      list: [],
      clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
      tableHeight: '0px'
    };
  },
  created() {
    if (this.id) this.getReportDetail();
  },
  mounted() {
    this.excuteHeight();
  },
  methods: {
    handleSizeChange(val) {
      this.params.limit = val;
      this.getChartList();
    },
    handleCurrentChange(val) {
      this.params.page = val;
      this.getChartList();
    },
    excuteHeight() {
      this.$nextTick(_ => {
        const rect = this.$refs.chartRef.$el.getBoundingClientRect();
        const h = rect.height;
        this.tableHeight = this.clientHeight - h - 125 + 'px';
      });
    },
    getReportDetail() {
      reportGetById({ id: parseInt(this.id) }).then(res => {
        const data = res.data;
        this.name = data.name;
        this.filterStr = data.filterStr;
        this.topParams = JSON.parse(data.topParams);
        this.sideFilter = JSON.parse(data.sideFilter);
        this.queryGroup = data.queryGroup;

        const filters = {};
        this.filterList.forEach(e => {
          if (this.sideFilter[e.field].length) filters[e.field] = this.sideFilter[e.field].map(ee => ee.id);
          else filters[e.field] = this.sideFilter[e.field];
        });

        this.params = Object.assign({}, this.params, this.topParams, filters, { queryGroup: this.queryGroup });
        this.getChartList();
      });
    },
    getChartList() {
      this.loading = true;
      homeRequest(this.params).then(res => {
        this.loading = false;
        this.list = res.data;
        this.params.page = res.page;
        this.params.limit = res.limit;
        this.params.total = res.total;
      });
    },
    // 更新顶部 params
    updateParams(params, picker) {
      window.sessionStorage.setItem('topParams', JSON.stringify(params));
      this.topParams = Object.assign({}, params);
      this.params = Object.assign({}, this.params, params, { page: 1, queryGroup: this.queryGroup });
      this.timeRange = picker.id;

      this.getChartList();
    },
    // 更新 groupby
    updateFilter(item) {
      window.sessionStorage.setItem('queryGroup', item.value);
      this.params = Object.assign({}, this.params, { page: 1, queryGroup: item.value });
      this.queryGroup = item.value;

      this.getChartList();
    },
    // 更新右侧筛选
    updateSideFilter(params, filters, filterStr) {
      window.sessionStorage.setItem('sideFilter', JSON.stringify(filters));
      this.params = Object.assign({}, this.params, params, { page: 1 });
      this.filterStr = filterStr;
      this.sideFilter = filters;

      // this.getChartList();
    },
    updateHeight(ele) {
      if (ele) this.tableHeight = '90%';
      else this.excuteHeight();
    },
    handleCreate() {
      window.open(window.location.href, '_blank');
    },
    handleSave() {
      this.visible = true;
    },
    handleSaveConfirm() {
      if (!this.queryGroup) {
        this.$message({
          type: 'error',
          message: '请选择分组数据'
        });
        return;
      }
      if (!Object.keys(this.sideFilter).length) {
        this.$message({
          type: 'error',
          message: '请选择筛选分组数据'
        });
        return;
      }
      this.saveLoading = true;
      const query = this.$route.query;
      let params = {
        name: this.name,
        topParams: JSON.stringify(this.topParams),
        queryGroup: this.queryGroup,
        sideFilter: JSON.stringify(this.sideFilter),
        timeRange: this.timeRange,
        dtType: this.params.dtType,
        filterStr: this.filterStr
      };
      if (query.id) {
        params = {
          id: query.id,
          name: this.name,
          topParams: JSON.stringify(this.topParams),
          queryGroup: this.queryGroup,
          sideFilter: JSON.stringify(this.sideFilter),
          timeRange: this.timeRange,
          dtType: this.params.dtType,
          filterStr: this.filterStr
        };
      }

      // 保存
      reportSave(params).then(res => {
        this.saveLoading = false;
        if (res.code !== 0) return;
        this.$message({
          type: 'success',
          message: '保存报告成功'
        });
      });
    },
    handleSaveAsConfirm() {
      this.saveAsLoading = true;
      const params = {
        name: this.name,
        topParams: JSON.stringify(this.topParams),
        queryGroup: this.queryGroup,
        sideFilter: JSON.stringify(this.sideFilter),
        timeRange: this.timeRange,
        dtType: this.params.dtType,
        filterStr: this.filterStr
      };

      // 另存为
      reportSaveAs(params).then(res => {
        this.saveAsLoading = false;
        if (res.code !== 0) return;
        this.$message({
          type: 'success',
          message: '另存为报告成功'
        });
      });
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
    display: flex;
    flex: 1;
    padding: 10px;
  }

  .chart-card-box {
    overflow: unset;
  }

  .r-l-t {
    margin-bottom: 10px;
    ::v-deep .el-card__body {
      padding: 10px 10px 0;
    }
  }

  .r-l {
    flex: 1;
    width: 0;
    margin-right: 10px;
  }
  .r-r {
    flex: 0 0 300px;
  }

  .chart-view {
    height: 100%;
  }
}
</style>
