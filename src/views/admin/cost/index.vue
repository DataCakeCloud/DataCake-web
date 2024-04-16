<template>
  <div class="box-card-container">
    <el-card class="card-list">
      <div slot="header" class="clearfix">
        <span class="header-name">{{ chartType === 1 ? '用量' : '成本' }}-部门及PU维度</span>
        <a href="javascript:;" style="margin-left: 20px" @click="handleMonitor">监控管理</a>
        <el-radio-group v-model="chartType" style="float: right" @change="handleChangeType">
          <el-radio-button :label="1">用量模式</el-radio-button>
          <el-radio-button v-if="role.includes('CostCenter_dosage_cost')" :label="2">成本模式</el-radio-button>
        </el-radio-group>
        <div class="tips" style="float: right; margin: 12px 10px 0 0; color: #999">Tips：因涉及各业务成本，需进行成本管控，如需查看成本，请邮件到业务owner审批，抄送zhuzhe和linyang</div>
      </div>

      <CustomForm @updateChart="handleUpdate"></CustomForm>
      <Chart :chart-type="chartType" :params="params"></Chart>
    </el-card>
    <el-row :gutter="5">
      <el-col :span="15">
        <el-card class="card-list" style="min-height: 750px">
          <div slot="header" class="clearfix">
            <span class="header-name">分PU/分部门{{ chartType === 1 ? '用量' : '成本' }}占比</span>
          </div>
          <el-radio-group v-if="chartType === 1" v-model="demension" size="small" class="menu" @change="updateProporParams">
            <template v-for="(item, index) in quantityProportionList">
              <el-radio-button :key="index" :label="index">{{ item.text }}</el-radio-button>
            </template>
          </el-radio-group>
          <el-radio-group v-else v-model="demension" size="small" class="menu" @change="updateProporParams">
            <template v-for="(item, index) in costProportionList">
              <el-radio-button :key="index" :label="index">{{ item.text }}</el-radio-button>
            </template>
          </el-radio-group>
          <!-- 环形图 -->
          <ProportionChart :chart-type="chartType" :params="proporParams"></ProportionChart>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card class="card-list" style="min-height: 750px">
          <div slot="header" class="clearfix">
            <span class="header-name">分PU{{ chartType === 1 ? '用量' : '成本' }}构成</span>
          </div>
          <QuantityTable :chart-type="chartType"></QuantityTable>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="card-list">
      <div slot="header" class="clearfix">
        <span class="header-name">{{ chartType === 1 ? '用量' : '成本' }}详情</span>
      </div>
      <Detail :chart-type="chartType"></Detail>
    </el-card>
  </div>
</template>

<script>
import { parseDate, getFirstDay, getCurrentSeason, getCurrentWeek } from '@/utils/';
import CustomForm from './components/customForm';
import ProportionChart from './components/proportionChart';
import Chart from './components/chart';
import QuantityTable from './components/quantityTable';
import Detail from './components/detail';
import { mapGetters } from 'vuex';
export default {
  name: 'CostCenter',
  components: {
    CustomForm,
    ProportionChart,
    Chart,
    QuantityTable,
    Detail
  },
  data() {
    return {
      activeName: 'first',
      chartType: 1,
      demension: 0,
      defaultParams: {
        dates: [], // 时间列表
        startDate: '', // 开始时间
        endDate: '', // 结束时间
        jobNames: [], // 任务名称列表
        owners: [], // owners
        pus: [], // pu列表
        products: [], // 产品列表
        shareitId: '', // 登录人的shareitId
        costType: '', // DP,PU,OWNER,JOB,PRODUCT
        costQueryPus: [], // 成本账单查下查询pu
        groupby: null, // 0或者空 按时间  1按部门  2按pu
        needCumulativeCost: false, // 是否需要累计成本
        regions: [], // 地区
        departments: [] // 部门
      },
      params: {},
      proporParams: {
        groupby: 1,
        both: true,
        startDate: parseDate(new Date().getTime() - 86400 * 1000),
        endDate: parseDate(new Date().getTime() - 86400 * 1000)
      },
      quantityProportionList: [
        {
          text: '日用量占比',
          groupby: 1,
          startDate: parseDate(new Date().getTime() - 86400 * 1000),
          endDate: parseDate(new Date().getTime() - 86400 * 1000)
        },
        {
          text: '周用量占比',
          groupby: 1,
          startDate: parseDate(getCurrentWeek()[0]),
          endDate: parseDate(new Date().getTime())
        },
        {
          text: '月用量占比',
          groupby: 1,
          startDate: getFirstDay(),
          endDate: parseDate(new Date().getTime())
        },
        {
          text: '季度用量占比',
          groupby: 1,
          startDate: parseDate(getCurrentSeason()[0]),
          endDate: parseDate(new Date().getTime())
        }
      ],
      costProportionList: [
        {
          text: '日成本占比',
          groupby: 1,
          startDate: parseDate(new Date().getTime() - 86400 * 1000),
          endDate: parseDate(new Date().getTime() - 86400 * 1000)
        },
        {
          text: '周成本占比',
          groupby: 1,
          startDate: parseDate(getCurrentWeek()[0]),
          endDate: parseDate(new Date().getTime())
        },
        {
          text: '月成本占比',
          groupby: 1,
          startDate: getFirstDay(),
          endDate: parseDate(new Date().getTime())
        },
        {
          text: '季度成本占比',
          groupby: 1,
          startDate: parseDate(getCurrentSeason()[0]),
          endDate: parseDate(new Date().getTime())
        }
      ],
      logintime_dosage: Date.now(),
      staytime_dosage: Date.now()
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    role() {
      return (this.userInfo.roles && this.userInfo.roles.split(',')) || [];
    }
  },
  created() {
    this.$report({
      userId: this.userInfo.userId,
      logintime_dosage: this.logintime_dosage
    });
  },
  methods: {
    handleBill() {
      this.$router.push({ name: 'CostBill' });
    },
    handleMonitor() {
      this.$report({
        userId: this.userInfo.userId
      });
      this.$router.push({ name: 'CostMonitor' });
    },
    updateProporParams(i) {
      this.$report({
        userId: this.userInfo.userId
      });
      if (this.chartType === 1) {
        this.proporParams = Object.assign({}, this.proporParams, {
          startDate: this.quantityProportionList[i].startDate,
          endDate: this.quantityProportionList[i].endDate
        });
      } else {
        this.proporParams = Object.assign({}, this.proporParams, {
          startDate: this.costProportionList[i].startDate,
          endDate: this.costProportionList[i].endDate
        });
      }
    },
    handleUpdate(params) {
      // 更新折线图
      this.params = Object.assign({}, params);
    },
    handleChangeType() {
      // 更新环形图
      this.demension = 0;
      if (this.chartType === 1) {
        this.proporParams = Object.assign({}, this.proporParams, {
          startDate: this.quantityProportionList[0].startDate,
          endDate: this.quantityProportionList[0].endDate
        });
        this.$report({
          userId: this.userInfo.userId,
          staytime_cost: Date.now() - this.staytime_dosage
        });
      } else {
        this.$report({
          userId: this.userInfo.userId,
          logintime_cost: Date.now(),
          staytime_dosage: Date.now() - this.staytime_dosage
        });
        this.proporParams = Object.assign({}, this.proporParams, {
          startDate: this.costProportionList[0].startDate,
          endDate: this.costProportionList[0].endDate
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.card-list {
  margin-bottom: 5px;
  ::v-deep .el-tag {
    margin-left: 10px;
    cursor: pointer;
  }
  .header-name {
    color: #000;
    font-weight: 500;
    font-size: $global-font-size-16;
  }
}
.menu {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  /* margin-bottom: 20px; */
}
</style>
