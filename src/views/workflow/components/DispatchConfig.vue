<template>
  <div class="dispatch-config">
    <!-- <div class="mb10">Schedule</div> -->
    <!-- <el-input v-model="crontab" disabled></el-input> -->
    <div class="schedule-wrap">
      <template>
        <!-- <el-select v-if="data.granularity === 'minutely'" v-model="data.cronConfig.fromMinute" style="width: 120px"> -->
        <el-select v-if="data.granularity === 'minutely'" v-model="fromMinute" :disabled="isShowCron" style="width: 120px">
          <el-option v-for="item in fromMinuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <!-- <el-select v-else-if="data.granularity === 'hourly'" v-model="data.cronConfig.fromHour" style="width: 120px"> -->
        <el-select v-else-if="data.granularity === 'hourly'" v-model="fromHour" :disabled="isShowCron" style="width: 120px">
          <el-option v-for="item in fromHourList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <span v-else>每</span>
      </template>
      <el-select v-model="data.granularity" :disabled="isShowCron" style="width: 100px" @change="changeGranularity">
        <el-option v-for="item in granularityList" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <div v-show="(data.granularity === 'minutely' && fromMinute > 1) || (data.granularity === 'hourly' && fromHour === 1)" style="display: inline-block">
        {{ data.granularity === 'minutely' ? '从' : '在' }}
        <el-select v-if="data.granularity === 'minutely'" v-model="data.cronConfig.fromMinute" :disabled="isShowCron">
          <el-option v-for="item in forMinuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select v-if="data.granularity === 'hourly'" v-model="data.cronConfig.minute" :disabled="isShowCron">
          <el-option v-for="item in forMinuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <template v-if="data.granularity === 'weekly'">
        的
        <el-select v-model="data.cronConfig.dayOfWeek" :disabled="isShowCron" style="width: 100px">
          <el-option v-for="item in weekList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      <template v-if="data.granularity === 'monthly'">
        的 第
        <el-select v-model="data.cronConfig.dayOfMonth" :disabled="isShowCron" style="width: 100px">
          <el-option v-for="item in dayList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      <template v-if="!['minutely', 'hourly'].includes(data.granularity) || (data.granularity === 'hourly' && fromHour !== 1)">
        {{ data.granularity === 'hourly' ? '从' : '在' }}
        <el-select v-if="data.granularity === 'hourly'" v-model="data.cronConfig.fromHour" :disabled="isShowCron" style="width: 100px">
          <el-option v-for="item in hourList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select v-else v-model="data.cronConfig.hour" :disabled="isShowCron" style="width: 100px">
          <el-option v-for="item in hourList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        :
        <el-select v-model="data.cronConfig.minute" :disabled="isShowCron" style="width: 100px">
          <el-option v-for="item in minuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      开始调度
    </div>
    <el-checkbox v-model="isShowCron" class="mt10" @change="changeCron">显示cron表达式</el-checkbox>
    <span v-if="isShowCron" class="cron">
      {{ crontab ? crontab : '' }}
    </span>
  </div>
</template>
<script>
import { getCron } from '@/api/flow';

export default {
  name: 'DispatchConfig',
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    const minuteList = [];
    for (let i = 0; i < 60; i++) {
      minuteList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
    const dayList = [];
    for (let i = 1; i < 32; i++) {
      dayList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
    return {
      isShowCron: false,
      fromMinute: 5,
      fromHour: 1,
      crontab: '',
      fromMinuteList: [
        // { label: 'Every 1', value: 1 },
        // { label: 'Every 2', value: 2 },
        // { label: 'Every 3', value: 3 },
        // { label: 'Every 4', value: 4 },
        { label: '每 5', value: 5 },
        { label: '每 6', value: 6 },
        { label: '每 10', value: 10 },
        { label: '每 12', value: 12 },
        { label: '每 15', value: 15 },
        { label: '每 20', value: 20 },
        { label: '每 30', value: 30 }
      ],
      fromHourList: [
        { label: '每 1', value: 1 },
        { label: '每 2', value: 2 },
        { label: '每 3', value: 3 },
        { label: '每 4', value: 4 },
        { label: '每 5', value: 5 },
        { label: '每 6', value: 6 },
        { label: '每 8', value: 8 },
        { label: '每 12', value: 12 }
      ],
      granularityList: [
        { label: '分钟', value: 'minutely' },
        { label: '小时', value: 'hourly' },
        { label: '天', value: 'daily' },
        { label: '周', value: 'weekly' },
        { label: '月', value: 'monthly' }
      ],
      minuteList: minuteList,
      weekList: [
        { label: '星期一', value: 1 },
        { label: '星期二', value: 2 },
        { label: '星期三', value: 3 },
        { label: '星期四', value: 4 },
        { label: '星期五', value: 5 },
        { label: '星期六', value: 6 },
        { label: '星期日', value: 7 }
      ],
      dayList: dayList
    };
  },
  computed: {
    forMinuteList() {
      const list = [];
      let length = 0;
      if (this.data.granularity === 'minutely') {
        // length = this.data.cronConfig.fromMinute;
        length = this.fromMinute;
      } else if (this.data.granularity === 'hourly') {
        length = 60;
      }
      for (let i = 0; i < length; i++) {
        list.push({ label: `小时的第 ${i} 分钟`, value: i });
      }
      return list;
    },
    hourList() {
      const list = [];
      let length = 0;
      if (this.data.granularity === 'hourly') {
        // length = this.data.cronConfig.fromHour;
        length = this.fromHour;
      } else {
        length = 24;
      }
      for (let i = 0; i < length; i++) {
        list.push({ label: i < 10 ? '0' + i : i, value: i });
      }
      return list;
    }
  },
  watch: {
    data: {
      handler(data) {
        if (data.granularity === 'minutely' && this.fromMinute > 1) {
          this.fromMinute = data.cronConfig.minute;
        }
        if (data.granularity === 'hourly') {
          this.fromHour = data.cronConfig.hour;
        }
      },
      immediate: true,
      deep: true
    },
    fromMinute(value) {
      if (this.data.granularity === 'minutely' && value > 1) {
        this.data.cronConfig.minute = value;
      }
    },
    fromHour(value) {
      if (this.data.granularity === 'hourly') {
        this.data.cronConfig.hour = value;
      }
    }
  },
  methods: {
    changeGranularity(value) {
      if (value === 'minutely') {
        this.data.cronConfig.minute = 5;
        this.data.cronConfig.fromMinute = 0;
      } else if (value === 'hourly') {
        this.data.cronConfig.hour = 1;
        this.data.cronConfig.minute = 0;
      } else {
        this.data.cronConfig.hour = 0;
        this.data.cronConfig.minute = 0;
      }
    },
    changeCron(value) {
      if (value) {
        if (this.data.granularity === 'minutely' && this.fromMinute > 1) {
          this.data.cronConfig.minute = this.fromMinute;
        }
        if (this.data.granularity === 'hourly') {
          this.data.cronConfig.hour = this.fromHour;
        }
        getCron({
          granularity: this.data.granularity,
          ...this.data.cronConfig
        }).then(res => {
          const data = res.data;
          this.crontab = data;
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
