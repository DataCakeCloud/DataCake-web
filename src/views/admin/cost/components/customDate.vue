<template>
  <div>
    <el-select :value="value" multiple collapse-tags :clearable="true" placeholder="请选择日期" @change="handleChange">
      <template v-for="(item, index) in dateList">
        <el-option :key="index" :label="item" :value="item"></el-option>
      </template>
    </el-select>
    <el-popover placement="right" width="400" trigger="click">
      <el-date-picker ref="datePicker" v-model="dates" class="calendar" :picker-options="pickerOptions" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="请选择开始日期" end-placeholder="请选择结束日期"> </el-date-picker>
      <i slot="reference" class="el-icon-date"></i>
    </el-popover>
  </div>
</template>

<script>
import { parseDate, getDays } from '@/utils/';
export default {
  name: 'CustomDate',
  props: {
    value: {
      type: [Array, String]
    }
  },
  data() {
    const dateList = getDays([parseDate(new Date().getTime() - 86400 * 30 * 1000), parseDate(new Date().getTime())]).reverse();
    return {
      dateList: dateList,
      dates: [parseDate(new Date().getTime() - 86400 * 30 * 1000), parseDate(new Date().getTime())],
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
  watch: {
    dates: {
      handler(val) {
        this.dateList = getDays([parseDate(new Date(val[0]).getTime()), parseDate(new Date(val[1]).getTime())]).reverse();

        this.$emit('updateDate', this.dateList[0]);
      }
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val);
    }
  }
};
</script>
