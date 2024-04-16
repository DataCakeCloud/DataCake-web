<template>
  <el-card class="box-card-container">
    <div class="box-content">
      <LeftTree></LeftTree>
      <div class="box-r">
        <div class="r-t">
          <!-- <CustomForm @updateParams="updateParams"></CustomForm> -->
          <CustomForm :filters="topParams" @updateParams="updateParams"></CustomForm>
        </div>
        <div class="r-b">
          <div class="r-b-l">
            <!-- 摘要 & 占比 -->
            <div class="r-b-l-t">
              <CostInfo :params="params" :info="info" :loading="infoLoading"></CostInfo>
              <el-card class="c-proportions dashboard-card chart-card-box">
                <div slot="header">成本占比（每月累计 / T - 2）</div>
                <div class="chart-view">
                  <ProductProportionChart :list="productProportionList" :loading="productProportionLoading"></ProductProportionChart>
                  <!-- <div style="width: 0; position: absolute; top: 20px; bottom: 20px; left: 50%; transform: translateX(-50%); margin: 0 10px; border-right: 1px solid #e1e1e1"></div> -->
                  <LesseeProportionChart :list="lesseeProportionList" :loading="lesseeProportionLoading" :params="params"></LesseeProportionChart>
                </div>
              </el-card>
            </div>

            <el-card class="r-b-l-b dashboard-card chart-card-box">
              <div slot="header" class="clearfix">
                <span>成本变化</span>
                <el-button type="text" style="position: absolute; top: 0; right: 10px" icon="el-icon-link" @click="handleAnalysis">成本分析</el-button>
              </div>
              <CostChange :list="costChangingList" :loading="costChangingLoading"></CostChange>
            </el-card>
          </div>
          <div class="r-b-r">
            <el-card class="r-b-r-card dashboard-card chart-card-box">
              <div slot="header">
                成本波动
                <el-tooltip class="item" effect="dark" placement="top">
                  <template slot="content">
                    <p>成本波动指的是总成本的波动，例如当前月比上月总成本减少了$1000，T-2比T-3总成本增加了$800</p>
                  </template>
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </div>
              <CostFluctuationChart :list="costFluctuationList" :loading="costFluctuationLoading"></CostFluctuationChart>
            </el-card>

            <el-card class="r-b-r-card r-b-r-b dashboard-card">
              <div slot="header">最近访问报告</div>
              <VisiteReport :list="reportHistoryList" :loading="reportHistoryLoading"></VisiteReport>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import LeftTree from '../components/leftTree';
import CustomForm from '../components/customForm';
import CostInfo from './components/costInfo';
import ProductProportionChart from './components/productProportionChart';
import LesseeProportionChart from './components/lesseeProportionChart';
import CostChange from './components/costChange';
import CostFluctuationChart from './components/costFluctuationChart';
import VisiteReport from './components/visiteReport';

import { homeRequest, reportHistory } from '@/api/cost';

export default {
  name: 'CostCenter',
  components: {
    LeftTree,
    CustomForm,
    CostInfo,
    ProductProportionChart,
    LesseeProportionChart,
    CostChange,
    CostFluctuationChart,
    VisiteReport
  },
  data() {
    return {
      infoLoading: false,
      lesseeProportionLoading: false,
      productProportionLoading: false,
      costChangingLoading: false,
      costFluctuationLoading: false,
      reportHistoryLoading: false,
      productProportionList: [],
      lesseeProportionList: [],
      costChangingList: [],
      costFluctuationList: [],
      reportHistoryList: [],
      info: {},
      params: {}
    };
  },
  computed: {
    topParams() {
      const f = window.sessionStorage.getItem('topParams');
      const filter = (f !== null && f !== 'undefined' && JSON.parse(f)) || {};
      return filter;
    }
  },
  methods: {
    getCostInfo(params) {
      this.infoLoading = true;
      homeRequest(params).then(res => {
        this.infoLoading = false;
        this.info = res.data;
      });
    },
    getProductProportion(params) {
      this.productProportionLoading = true;
      homeRequest(params).then(res => {
        this.productProportionLoading = false;
        this.productProportionList = res.data;
      });
    },
    getLesseeProportion(params) {
      this.lesseeProportionLoading = true;
      homeRequest(params).then(res => {
        this.lesseeProportionLoading = false;
        this.lesseeProportionList = res.data;
      });
    },
    getCostChanging(params) {
      this.costChangingLoading = true;
      homeRequest(params).then(res => {
        this.costChangingLoading = false;
        this.costChangingList = res.data;
      });
    },
    getCostFluctuation(params) {
      this.costFluctuationLoading = true;
      homeRequest(params).then(res => {
        this.costFluctuationLoading = false;
        this.costFluctuationList = res.data;
      });
    },
    getReportHistory() {
      this.reportHistoryLoading = true;
      reportHistory().then(res => {
        this.reportHistoryLoading = false;
        this.reportHistoryList = res.data;
      });
    },
    updateParams(params) {
      this.params = Object.assign({}, params);

      // 累计成本
      this.getCostInfo({
        reportType: 1,
        homeDayType: params.homeDayType,
        roleView: params.roleView,
        tenantName: params.tenantName
      });

      // 计费项占比
      this.getProductProportion({
        reportType: 2,
        homeDayType: params.homeDayType,
        roleView: params.roleView,
        tenantName: params.tenantName
      });

      // 租户 / Group占比
      this.getLesseeProportion({
        reportType: 3,
        homeDayType: params.homeDayType,
        roleView: params.roleView,
        tenantName: params.tenantName
      });

      // 波动
      this.getCostFluctuation({
        reportType: 4,
        homeDayType: params.homeDayType,
        roleView: params.roleView,
        tenantName: params.tenantName
      });

      // 变化
      this.getCostChanging({
        reportType: 5,
        homeDayType: params.homeDayType,
        roleView: params.roleView,
        tenantName: params.tenantName
      });

      // 报告历史
      this.getReportHistory();
    },
    handleAnalysis() {
      this.$router.push({ name: 'NewCostAnalysis' });
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
    padding: 0 10px 10px;
  }

  .r-t {
    display: flex;
    margin-top: 10px;
    position: relative;
  }
  .r-b {
    display: flex;
  }

  .r-b-l {
    flex: 2.5;
    margin: 0 10px 0 0;
  }

  .r-b-r {
    flex: 1;

    .r-b-r-card {
      height: calc((100vh - $s-navbar-height - 81px) / 2);

      &.r-b-r-b {
        margin-top: 10px;

        ::v-deep .el-card__body {
          padding: 0 10px;
        }
      }
    }

    ::v-deep .el-card__body {
      height: 89%;
    }
  }

  .r-b-l-t {
    display: flex;
    height: 250px;

    ::v-deep .el-card__body {
      height: 85%;
    }
  }

  .r-b-l-b {
    position: relative;
    margin-top: 10px;
    height: calc(100vh - 376px);
    ::v-deep .el-card__body {
      height: 91.5%;
    }
  }

  .c-proportions {
    flex: 1;
  }

  .chart-card-box {
    overflow: unset;
  }

  .chart-view {
    position: relative;
    display: flex;
    justify-content: space-between;
    height: 100%;
  }
}
</style>
