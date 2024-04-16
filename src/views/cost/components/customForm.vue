<template>
  <div class="box">
    <el-form :inline="true" :model="params" label-position="top" label-width="80px">
      <template v-if="isShow">
        <el-form-item prop="date">
          <el-date-picker
            ref="datePicker"
            v-model="dates"
            class="calendar"
            start-placeholder="请选择开始日期"
            range-separator="至"
            end-placeholder="请选择结束日期"
            :picker-options="pickerOptions"
            type="daterange"
            style="width: 230px"
unlink-panels
            @change="handleChange"
          > </el-date-picker>
        </el-form-item>
        <el-form-item prop="dtType">
          <el-select v-model="params.dtType" clearable placeholder="选择时间模式" style="width: 80px" @change="handleChange">
            <el-option v-for="(item, index) in dateTypeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="chartType">
          <el-select v-model="params.chartType" clearable placeholder="选择图表模式" style="width: 100px" @change="handleChange">
            <el-option v-for="(item, index) in chartTypeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="relateCost">
          <el-tooltip class="item" effect="dark" placement="top">
            <template slot="content">
              <p>· 间接成本：考虑其他数据开发任务分摊过来的成本，即考虑成本分摊，以DE平台成本归属配置为标准</p>
              <p>· 直接成本：任务开发产生的成本，不考虑成本归属。即不考虑分摊</p>
            </template>
            <!-- <i class="el-icon-info"></i> -->
            <!-- <el-radio-group v-model="params.relateCost" size="small" @change="handleChange">
            <template v-for="(item, index) in isCostList">
              <el-radio-button :key="index" :label="item.value">{{ item.name }}</el-radio-button>
            </template>
          </el-radio-group> -->
          </el-tooltip>
        </el-form-item>
      </template>
      <el-form-item prop="roleView">
        <el-radio-group v-if="!isCloud || userInfo.isSupperAdmin" v-model="params.roleView" size="small" @change="handleChange">
          <template v-for="(item, index) in angleList">
            <el-radio-button :key="index" :label="item.value">{{ item.name }}</el-radio-button>
          </template>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="params.roleView === 1" prop="tenantName">
        <el-select v-model="params.tenantName" clearable placeholder="所有租户" style="width: 110px" @change="handleChange">
          <template v-for="(item, index) in tenantList">
            <el-option :key="index" :label="item.name" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <template v-if="!isShow">
        <el-form-item prop="homeDayType">
          <el-radio-group v-model="params.homeDayType" size="small" @change="handleChange">
            <template v-for="(item, index) in homeDayTypeList">
              <el-radio-button :key="index" :label="item.value">{{ item.name }}</el-radio-button>
            </template>
          </el-radio-group>
        </el-form-item>
      </template>
    </el-form>
    <div class="t-tip">温馨提示：每天15:00产出T-2数据。</div>
  </div>
</template>

<script>
import { parseDate } from '@/utils/';
import { costListDictionary } from '@/api/cost';
import { mapGetters } from 'vuex';
let range = 1;
export default {
  name: 'CustomForm',
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Object,
      default: () => {}
    },
    pickerType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dateTypeList: this.$t('cost.dateTypeList'),
      angleList: [
        {
          name: '平台',
          value: 0
        },
        {
          name: '租户',
          value: 1
        }
      ],
      chartTypeList: [
        {
          name: ' 柱状图',
          value: 0
        },
        {
          name: '堆叠图',
          value: 1
        },
        {
          name: '折线图',
          value: 2
        }
      ],
      isCostList: [
        {
          name: '间接成本',
          value: 0
        },
        {
          name: '直接成本',
          value: 1
        }
      ],
      homeDayTypeList: this.$t('cost.homeDayTypeList'),
      tenantList: this.$t('cost.lesseeList'),
      params: {
        reportType: 6,
        startDate: '',
        endDate: '',
        dtType: 0,
        chartType: 0,
        roleView: 0,
        relateCost: 1,
        tenantName: '',
        homeDayType: new Date().getDate() < 5 ? 3 : 2
      },
      shortcuts: this.$t('cost.shortcuts'),
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
              range = 2;
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
              range = 3;
            }
          }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud']),
    dates: {
      get() {
        let time;
        if (this.pickerType) {
          time = this.shortcuts.find(e => e.id === this.pickerType);
          if (time.id !== 1) return time.time();
          else return [this.params.startDate, this.params.endDate];
        }
        const range = this.shortcuts[0].time();
        return range;
      },
      set(val) {
        this.shortcuts[0].time = function() {
          return val;
        };
      }
    }
  },
  watch: {
    filters: {
      handler(val) {
        if (Object.keys(val).length) {
          this.params = val;
          this.dates = [val.startDate, val.endDate];
        }
      },
      deep: true
    },
    dates: {
      handler(val) {
        this.params.startDate = parseDate(new Date(val[0]));
        this.params.endDate = parseDate(new Date(val[1]));
      },
      immediate: true
    }
  },
  created() {
    this.handleChange();

    this.getTenantList();
  },
  methods: {
    getTenantList() {
      const params = {
        requestType: 2,
        name: ''
      };
      costListDictionary(params).then(res => {
        this.tenantList = this.tenantList.concat(res.data);
      });
    },
    handleChangeTimeType() {
      this.handleChange();
    },
    handleChangeChartType() {
      this.handleChange();
    },
    handleChangeTime() {
      this.handleChange();
    },
    handleChange() {
      const picker = this.shortcuts.find(e => e.id === range);
      this.$emit('updateParams', this.params, picker);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.el-form--inline {
  ::v-deep .el-form-item {
    margin-right: 0;
  }
}
.box {
  display: flex;
  .t-tip {
    color: #e6a23c;
    font-size: 12px;
    margin-top: 12px;
    margin-left: 5px;
  }
}
</style>
