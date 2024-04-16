<template>
  <el-card v-loading="loading" class="c-desc dashboard-card">
    <div slot="header">成本摘要</div>
    <div class="info-content">
      <div class="time-range">{{ timeRange }}</div>
      <p class="title">总成本</p>
      <p class="num font-size-30">$ {{ info.value }}</p>
      <p v-if="!isNaN(parseInt(info.basic))" class="tip font-size-12">环比 <span v-html="getValue(info.basic)"></span></p>
    </div>
  </el-card>
</template>

<script>
import { getLastMonthAndDay, getValue, parseDate } from '@/utils/';
export default {
  name: 'CostInfo',
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    info: {
      type: [Object, Number]
    },
    loading: Boolean
  },
  computed: {
    timeRange() {
      let timeRange = '';
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
      const curDay = date.getDate();
      const day = date.getDate() - 2 < 10 ? '0' + (date.getDate() - 2) : date.getDate() - 2;
      const lastMonthLastDay = getLastMonthAndDay().split(' ~ ')[1]; // 上个月最后一天
      const time = new Date(lastMonthLastDay).getTime(); // 上个月最后一天的时间戳
      const dayMinus2 = parseInt(curDay) === 1 ? parseDate(time - 1000 * 60 * 60 * 24) : parseInt(curDay) === 2 ? lastMonthLastDay : `${year}-${month}-${day}`;
      switch (this.params.homeDayType) {
        case 1:
          timeRange = `${year}-${month}`;
          break;
        case 2:
          timeRange = dayMinus2;
          break;
        default:
          timeRange = getLastMonthAndDay();
          break;
      }
      return timeRange;
    }
  },
  methods: {
    getValue(val) {
      if (!val) return '';
      return getValue(val);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.c-desc {
  flex: 0 0 200px;
  margin-right: 10px;

  ::v-deep .el-card__body {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .time-range {
    position: absolute;
    top: 20px;
  }
  .info-content {
    text-indent: 10px;
    p {
      line-height: 35px;

      .num {
        font-weight: 500;
      }

      .tip {
        color: #666;
      }
    }
  }
}
</style>
