<template>
  <div>
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="params" label-position="left">
      <el-form-item prop="departments">
        <el-select v-model="params.departments" clearable filterable multiple collapse-tags placeholder="请选择部门" style="min-width: 230px" @change="handleChangeDp">
          <el-option v-for="(item, index) in departmentList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="regions">
        <el-select v-model="params.regions" multiple collapse-tags clearable placeholder="请选择区域" @change="handleChangeReg">
          <template v-for="(item, index) in regionList">
            <el-option :key="index" :label="item" :value="item"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="products">
        <el-select v-model="params.products" multiple collapse-tags clearable placeholder="请选择产品" @change="handleChangePro">
          <template v-for="(item, index) in productList">
            <el-option :key="index" :label="item" :value="item"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="owners">
        <el-select v-model="params.owners" filterable multiple collapse-tags clearable placeholder="请选择owner" @change="handleChangeOwner">
          <template v-for="(item, index) in ownerList">
            <el-option :key="index" :label="item" :value="item"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="jobNames">
        <el-tooltip class="item" effect="dark" content="请输入较为精确的任务名" placement="top">
          <el-select
            v-model="params.jobNames"
            :remote-method="getJobs"
            :loading="taskSelectLoading"
            multiple
            filterable
            collapse-tags
            remote
            reserve-keyword
            clearable
style="min-width: 300px"
            placeholder="请输入任务关键词"
            @change="handleChangeJobs"
          >
            <template v-for="(item, index) in jobList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-tooltip>
      </el-form-item>
      <el-form-item prop="dates">
        <CustomDate v-model="params.dates" @updateDate="updateDate"></CustomDate>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item prop="labelId" label="标签">
        <el-select v-model="params.labelId" placeholder="请选择标签" filterable clearable @change="handleChangeTag">
          <el-option v-for="item in allTagList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>

      <!-- 导出 -->
      <el-form-item>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-empty v-if="!body.length && !loading" description="暂无数据"></el-empty>
    <template v-else>
      <el-form label-position="top" class="custom-box">
        <el-form-item label="总览">
          <el-table v-loading="loading" :data="totalList" style="width: 100%" highlight-current-row border header-row-class-name="custom-table-head">
            <el-table-column label="任务总数" prop="totalJob" align="center"> </el-table-column>
            <el-table-column label="owner总数" prop="totalOwner" align="center"> </el-table-column>
            <el-table-column label="数据周期" prop="dataCycle" align="center"> </el-table-column>
            <template v-if="chartType === 1">
              <el-table-column label="任务总量" prop="totalJobNameQuantity" align="center"> </el-table-column>
              <el-table-column label="任务平均日用量" prop="averageDayJobNameQuantity" align="center"> </el-table-column>
            </template>
            <template v-else>
              <el-table-column label="任务总成本" prop="totalCost" align="center"> </el-table-column>
              <el-table-column label="任务平均日成本" prop="averageDayCost" align="center"> </el-table-column>
            </template>
          </el-table>
        </el-form-item>
        <el-form-item label="详单">
          <el-table v-loading="loading" :data="body" style="width: 100%" highlight-current-row border header-row-class-name="custom-table-head" @sort-change="handleSort">
            <el-table-column label="任务" prop="jobName" align="left" min-width="100">
              <template slot-scope="scope">
                <el-tooltip slot="label" effect="dark" :content="scope.row.jobName" placement="right">
                  <div class="cell-ellipsis" title="点击可复制" @click="handleCopy(scope.row.jobName)">{{ scope.row.jobName }}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="owner" prop="owner" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="任务创建时间" prop="jobCreateTime" align="center" min-width="90"> </el-table-column>
            <el-table-column label="账单日期" prop="dt" align="center" :sortable="'custom'" min-width="90"> </el-table-column>
            <template v-if="chartType === 1">
              <el-table-column label="任务用量" prop="jobNameQuantity" align="center" :sortable="'custom'"> </el-table-column>
              <el-table-column label="用量日增量" prop="dailyIncrementJobNameQuantity" align="center" :sortable="'custom'"> </el-table-column>
            </template>
            <template v-else>
              <el-table-column label="任务成本" prop="cost" align="center" :sortable="'custom'"> </el-table-column>
              <el-table-column label="成本日增量" prop="dailyIncrementCost" align="center" :sortable="'custom'"> </el-table-column>
            </template>
            <el-table-column :label="chartType === 1 ? '用量周同比' : '成本周同比'" prop="basisRatio" align="center" :sortable="'custom'">
              <template slot-scope="scope">
                <div v-html="getValue(scope.row.basisRatio)"></div>
              </template>
            </el-table-column>
            <el-table-column :label="chartType === 1 ? '用量日环比' : '成本日环比'" prop="relativeRatio" align="center" :sortable="'custom'" min-width="90">
              <template slot-scope="scope">
                <div v-html="getValue(scope.row.relativeRatio)"></div>
              </template>
            </el-table-column>
            <!-- <template v-if="chartType === 1">
              <el-table-column label="最近7日内用量" prop="cumulativejobNameQuantity7" align="center" :sortable="'custom'" min-width="90"> </el-table-column>
              <el-table-column label="最近30日内用量" prop="cumulativejobNameQuantity30" align="center" :sortable="'custom'" min-width="100"> </el-table-column>
            </template>
            <template v-else>
              <el-table-column label="最近7日内成本" prop="cumulativeCost7" align="center" :sortable="'custom'" min-width="90"> </el-table-column>
              <el-table-column label="最近30日内成本" prop="cumulativeCost30" align="center" :sortable="'custom'" min-width="100"> </el-table-column>
            </template> -->
          </el-table>
        </el-form-item>
      </el-form>
    </template>

    <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="params.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
  </div>
</template>

<script>
import CustomDate from './customDate';
import { parseDate, getValue } from '@/utils/';
import { listDictionary, stat } from '@/api/cost';
import { getLabelList } from '@/api/task';
import copy from 'copy-to-clipboard';
import { mapGetters } from 'vuex';
export default {
  name: 'CostDetail',
  components: {
    CustomDate
  },
  props: {
    chartType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      loading: false,
      taskSelectLoading: false,
      departmentList: [],
      ownerList: [],
      jobList: [],
      regionList: [],
      productList: [],
      body: [],
      totalList: [],
      allTagList: [],
      defaultParams: {},
      params: {
        departments: [],
        costQueryPus: [],
        regions: [],
        products: [],
        owners: [],
        jobNames: [],
        dates: [parseDate(new Date().getTime() - 86400 * 1000)],
        needCumulativeCost: true,
        labelId: null,
        sort: '',
        order: '',
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'params.dates'(val) {
      this.getTableList();
    },
    chartType(val) {
      this.getTableList();
    }
  },
  created() {
    this.defaultParams = JSON.parse(JSON.stringify(this.params));
    this.getDep();
    this.getReg();
    this.getPro();
    this.getOwner();
    this.getTableList();
    this.getLabelList();
  },
  methods: {
    getLabelList(name) {
      getLabelList(name).then(res => {
        const data = res.data;
        if (data) {
          this.allTagList = [...data.current, ...data.others];
        }
      });
    },
    getValue(val) {
      return getValue(val);
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getTableList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getTableList();
    },
    handleSort(column) {
      this.params.sort = column.order || '';
      this.params.order = column.prop;

      this.getTableList();
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
    handleChangeDp(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_departmentfliter: Date.now()
      });
      if (!val.length) {
        this.params.regions = [];
        this.params.products = [];
        this.params.owners = [];
        this.params.jobNames = [];
      }

      this.params.labelId = null;
      this.getReg();
      this.getPro();
      this.getOwner();
      this.getTableList();
    },
    handleChangeReg(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_regionfliter: Date.now()
      });
      if (!val.length) {
        this.params.products = [];
        this.params.owners = [];
        this.params.jobNames = [];
      }
      this.params.labelId = null;
      this.getPro();
      this.getOwner();
      this.getTableList();
    },
    handleChangePro(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_productfliter: Date.now()
      });
      if (!val.length) {
        this.params.owners = [];
        this.params.jobNames = [];
      }
      this.params.labelId = null;
      this.getOwner();
      this.getTableList();
    },
    handleChangeOwner(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_ownerfliter: Date.now()
      });
      if (!val.length) {
        this.params.jobNames = [];
      }
      this.params.labelId = null;
      this.getTableList();
    },
    handleChangeJobs(val) {
      this.$report({
        userId: this.userInfo.userId,
        taskname_taskfliter: val,
        clicktime_taskfliter: Date.now()
      });
      this.params.labelId = null;
      this.getTableList();
    },
    handleChangeJob(val) {
      this.getTableList();
    },
    handleChangeTag(val) {
      this.params = JSON.parse(JSON.stringify(this.defaultParams));
      this.params.labelId = val;
    },
    handleExport() {
      const regions = (this.params.regions.length && this.params.regions.map(e => `&regions=${e}`).join('')) || '';
      const products = (this.params.products.length && this.params.products.map(e => `&products=${e}`).join('')) || '';
      const owners = (this.params.owners.length && this.params.owners.map(e => `&owners=${e}`).join('')) || '';
      const dates = (this.params.dates.length && this.params.dates.map(e => `&dates=${e}`).join('')) || '';
      const jobNames = (this.params.jobNames.length && this.params.jobNames.map(e => `&jobNames=${e}`).join('')) || '';
      const labelId = (this.params.labelId && `&labelId=${this.params.labelId}`) || '';
      const href = `${process.env.VUE_APP_API_GATEWAY_PATH}ds_task/cost/excel?costType=JOB${regions}${products}${owners}${dates}${jobNames}${labelId}&model=${this.chartType}${jobNames}`;
      window.open(href, '_blank');
    },
    getDep() {
      const params = {
        type: 1
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.departmentList = data;
      });
    },
    getReg() {
      const params = {
        type: 5,
        departments: this.params.departments
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.regionList = data;
      });
    },
    getPro() {
      const params = {
        type: 6,
        departments: this.params.departments,
        regions: this.params.regions
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.productList = data;
      });
    },

    getOwner() {
      const params = {
        type: 3,
        departments: this.params.departments,
        regions: this.params.regions,
        products: this.params.products
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.ownerList = data;
      });
    },
    getJobs(val) {
      const params = {
        type: 4,
        departments: this.params.departments,
        regions: this.params.regions,
        products: this.params.products,
        owners: this.params.owners,
        name: val
      };
      this.taskSelectLoading = true;
      listDictionary(params).then(res => {
        this.taskSelectLoading = false;
        const data = res.data;
        this.jobList = data;
      });
    },
    updateDate(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_detailtimer: Date.now()
      });
      this.params.dates = [val];
    },
    getTableList() {
      const params = Object.assign({}, this.params, { costType: 'JOB' });
      params.dates = params.dates.length ? params.dates : [parseDate(new Date().getTime() - 86400 * 1000)];
      this.loading = true;
      stat(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (Array.isArray(data) && !data.length) {
          this.totalList = [];
          this.body = [];
          return;
        }
        this.totalList = [data.list[0].costTotalVo];
        this.body = data.list;
        this.params.pageNum = data.pageNum;
        this.params.pageSize = data.pageSize;
        this.params.total = data.total;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-box {
  ::v-deep .custom-table-head {
    th {
      /* color: #333;
      font-size: $global-font-size-16; */
    }
    .cell {
      /* padding: 0; */
    }
    .caret-wrapper {
      /* width: 18px; */
    }

    .sort-caret {
      /* left: 2px; */
    }
  }
}
</style>
