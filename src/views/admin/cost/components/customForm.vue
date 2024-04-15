<template>
  <el-form :inline="true" :model="params" label-position="top" label-width="80px">
    <el-form-item prop="owner">
      <el-radio-group v-model="params.costType" size="small" @change="handleCost">
        <template v-for="(item, index) in costTypeList">
          <el-radio-button :key="index" :label="item.value">{{ item.label }}</el-radio-button>
        </template>
      </el-radio-group>
    </el-form-item>
    <el-select v-if="params.costType === 'DP'" v-model="params.departments" :clearable="true" filterable multiple collapse-tags :placeholder="`选择${text}`" @change="handleChangeDp">
      <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
    </el-select>
    <el-select v-if="params.costType === 'PU'" v-model="params.pus" :clearable="true" filterable multiple collapse-tags :placeholder="`选择${text}`" @change="handleChangePu">
      <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
    </el-select>
    <el-form-item prop="date">
      <el-date-picker
        ref="datePicker"
        v-model="dates"
        class="calendar"
        start-placeholder="请选择开始日期"
        end-placeholder="请选择结束日期"
        :picker-options="pickerOptions"
        type="daterange"
        align="right"
        unlink-panels
range-separator="至"
        @change="handleChangeTime"
      > </el-date-picker>
    </el-form-item>
  </el-form>
</template>

<script>
import { listDictionary } from '@/api/cost';
import { parseDate } from '@/utils/';
import { mapGetters } from 'vuex';
export default {
  name: 'CustomForm',
  data() {
    return {
      costTypeList: [
        {
          label: '部门',
          value: 'DP',
          text: '部门',
          type: 1
        },
        {
          label: 'PU',
          value: 'PU',
          text: 'pu',
          type: 2
        }
      ],
      trendList: [],
      dictType: 1,
      params: {
        startDate: '',
        endDate: '',
        departments: [],
        pus: [],
        costType: 'DP'
      },
      text: '部门',
      dates: [parseDate(new Date().getTime() - 86400 * 30 * 1000), parseDate(new Date().getTime() - 86400 * 1000)],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    dates: {
      handler(val) {
        this.params.startDate = parseDate(new Date(val[0]).getTime());
        this.params.endDate = parseDate(new Date(val[1]).getTime());
      },
      immediate: true
    }
  },
  created() {
    this.listDictionary();
    this.handleChange();
  },
  methods: {
    listDictionary() {
      const params = {
        type: this.dictType
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.trendList = data;
      });
    },
    handleCost(val) {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_dpualter: Date.now()
      });
      this.dictType = this.costTypeList.find(e => e.value === val)['type'];
      this.text = this.costTypeList.find(e => e.value === val)['text'];
      this.listDictionary();
      this.handleChange();
    },
    handleChangeDp() {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_dpufliter: Date.now()
      });
      this.handleChange();
    },
    handleChangePu() {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_dpufliter: Date.now()
      });
      this.handleChange();
    },
    handleChangeTime() {
      this.$report({
        userId: this.userInfo.userId,
        clicktime_dputimer: Date.now()
      });
      this.handleChange();
    },
    handleChange() {
      this.$emit('updateChart', this.params);
    }
  }
};
</script>
