<template>
  <div class="quantity-view">
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="params" label-position="top" label-width="80px" class="form-quantity">
      <el-form-item prop="pus">
        <el-select v-model="pus" filterable :clearable="true" placeholder="请选择pu" @change="handleChangePu">
          <template v-for="(item, index) in puList">
            <el-option :key="index" :label="item" :value="item"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item prop="date">
        <CustomDate v-model="params.dates" @updateDate="updateDate"></CustomDate>
      </el-form-item>
      <el-form-item>
        <el-radio-group v-model="demension" style="margin-left: 10px" @change="handlePolymerizatio">
          <el-radio label="departmentName">部门聚合</el-radio>
          <el-radio label="dt">时间聚合</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- 列表数据 -->
    <el-empty v-if="!body.length && !loading" description="无数据"></el-empty>
    <template v-else>
      <el-table v-if="demension === 'departmentName'" v-loading="loading" :data="body" style="width: 100%" height="530" highlight-current-row border :span-method="objectSpanMethod" cell-class-name="pu-overview" header-row-class-name="custom-table-head">
        <el-table-column label="部门" prop="departmentName" align="center" min-width="150" class-name="col-dp"> </el-table-column>
        <el-table-column label="日期" prop="dt" align="center"> </el-table-column>
        <template v-if="chartType === 1">
          <el-table-column label="日用量" prop="jobNameQuantity" align="center"> </el-table-column>
          <el-table-column label="总用量" prop="totaljobNameQuantityDp" align="center" class-name="col-total"></el-table-column>
        </template>
        <template v-else>
          <el-table-column label="日成本" prop="cost" align="center"> </el-table-column>
          <el-table-column label="总成本" prop="totalCostDp" align="center" class-name="col-total"></el-table-column>
        </template>
      </el-table>
      <el-table v-else v-loading="loading" :data="body" style="width: 100%" height="530" highlight-current-row border :span-method="objectSpanMethod" cell-class-name="pu-overview" header-row-class-name="custom-table-head">
        <el-table-column label="日期" prop="dt" align="center" class-name="col-dp"> </el-table-column>
        <el-table-column label="部门" prop="departmentName" align="center"> </el-table-column>
        <template v-if="chartType === 1">
          <el-table-column label="日用量" prop="jobNameQuantity" align="center"> </el-table-column>
          <el-table-column label="总用量" prop="totaljobNameQuantity" align="center" class-name="col-total"></el-table-column>
        </template>
        <template v-else>
          <el-table-column label="日成本" prop="cost" align="center"> </el-table-column>
          <el-table-column label="总成本" prop="totalCost" align="center" class-name="col-total"></el-table-column>
        </template>
      </el-table>
    </template>
  </div>
</template>

<script>
import { listDictionary, stat } from '@/api/cost';
import { parseDate, getDays } from '@/utils/';
import CustomDate from './customDate';
import { mapGetters } from 'vuex';
export default {
  name: 'QuantityView',
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
      demension: 'departmentName',
      puList: [],
      body: [],
      body1: [],
      body2: [],
      dictType: 2,
      total: 0,
      pus: '',
      originData: [],
      params: {
        pus: [],
        dates: [parseDate(new Date().getTime() - 86400 * 1000)],
        costType: 'PU',
        puAndDp: true
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'params.dates'(val) {
      this.stat();
    },
    chartType(val) {
      this.stat();
    }
  },
  created() {
    this.listDictionary();
    this.stat();
  },
  methods: {
    getSevendays() {
      const arr = [];
      for (let i = 8; i > 0; i--) {
        arr.push(parseDate(new Date().getTime() - 86400 * i * 1000));
      }
      return arr;
    },
    handlePolymerizatio(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_unionalter: Date.now()
      });
      this.body = this.excuteData(val);
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (this.body.length < 2) return;
      if (columnIndex === 0 || columnIndex === 3) {
        if (!row.span) {
          return {
            rowspan: 0,
            colspan: 0
          };
        } else {
          return row.span;
        }
      }
    },
    handleChangePu(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_pufliter: Date.now()
      });
      if (!val) this.params.pus = [];
      else this.params.pus = [val];

      this.stat();
    },
    listDictionary() {
      const params = {
        type: this.dictType
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.puList = data;
      });
    },
    excuteData(type) {
      const data = JSON.parse(this.originData);
      if (data.length < 2) return data;
      if (this.chartType === 1) data.sort((a, b) => (a[type] > b[type] ? -1 : a[type] === b[type] ? b.jobNameQuantity - a.jobNameQuantity : 1));
      else data.sort((a, b) => (a[type] > b[type] ? -1 : a[type] === b[type] ? b.cost - a.cost : 1));
      let count = 1;
      let index = 0;
      for (let i = 1; i < data.length; ++i) {
        if (i === data.length - 1) {
          if (data[i][type] === data[i - 1][type]) {
            data[index].span = {
              rowspan: ++count,
              colspan: 1
            };
          } else {
            data[index].span = {
              rowspan: count,
              colspan: 1
            };
            data[i].span = {
              rowspan: 1,
              colspan: 1
            };
          }
        } else if (data[i][type] !== data[i - 1][type]) {
          data[index].span = {
            rowspan: count,
            colspan: 1
          };
          count = 1;
          index = i;
        } else {
          count++;
        }
      }
      return data;
    },
    updateDate(val) {
      this.params.dates = [val];
    },
    stat() {
      const params = Object.assign({}, this.params);
      const dates = (params.dates = params.dates.length ? params.dates : [parseDate(new Date().getTime() - 86400 * 1000)]);
      this.loading = true;
      stat(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (!Array.isArray(data)) return;
        this.originData = JSON.stringify(data);
        this.body = this.excuteData(this.demension);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.quantity-view {
  ::v-deep .el-table__cell {
    font-size: $global-font-size-12;
    padding: 0;
  }

  .form-quantity {
    padding: 16px 8px 8px;
  }
  ::v-deep .col-dp {
    border-right: 1px solid #e2e9f3 !important;
  }
  ::v-deep .col-total {
    border-left: 1px solid #e2e9f3 !important;
  }

  ::v-deep .custom-table-head {
    th {
      color: #333;
      font-size: $global-font-size-14;
      padding: 8px 0;
    }
  }
}
</style>
