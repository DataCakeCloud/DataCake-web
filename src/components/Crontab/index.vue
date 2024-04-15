<template>
  <el-popover popper-class="crontab-popover" trigger="click">
    <el-form v-model="data" :inline="true" class="crontab-form">
      <el-form-item label="频率">
        <el-select v-model="data.timeUnit" filterable class="time-unit-select" placeholder="请选择执行频率" :disabled="unitDisabled" @change="changeTimeUnit">
          <el-option v-for="item in $t('data.timeUnits')" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="data.timeUnit === 'weekly'" label="星期">
        <el-select v-model="data.weekday" class="crontab-select" filterable placeholder="请选择星期" :disabled="data.timeUnit === 'hourly' || data.timeUnit === 'daily'" @change="change">
          <el-option v-for="item in $t('data.weekdays')" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="data.timeUnit === 'monthly'" label="日期">
        <el-select v-model="data.day" class="crontab-select" filterable placeholder="请选择日期" :disabled="data.timeUnit === 'hourly' || data.timeUnit === 'daily'" @change="change">
          <el-option v-for="item in $t('data.days')" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="data.timeUnit !== 'hourly'" label="小时">
        <el-select v-model="data.hour" class="crontab-select" filterable placeholder="请选择小时" @change="change">
          <el-option v-for="item in $t('data.hours')" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分钟">
        <el-select v-model="data.minute" class="crontab-select" filterable placeholder="请选择分钟" @change="change">
          <el-option v-for="item in $t('data.minutes')" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-input slot="reference" :value="value" :class="inputClass" />
  </el-popover>
</template>

<script>
export default {
  name: 'Crontab',
  props: {
    // value: { type: Object, required: true },
    timeUnit: { type: String, required: true },
    value: { type: String, default: '' },
    unitDisabled: { type: Boolean, default: false },
    inputClass: { type: String, default: '' }
  },
  data() {
    return {
      data: {
        timeUnit: this.$t('data.timeUnits')[0]['value'],
        minute: this.$t('data.minutes')[0]['value'],
        hour: this.$t('data.hours')[0]['value'],
        day: this.$t('data.days')[0]['value'],
        weekday: this.$t('data.weekdays')[0]['value']
      }
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler() {
        if (this.value) {
          // const expressions = this.value.crontab.split(' ');
          // this.data.timeUnit = this.value.timeUnit;
          const expressions = this.value.split(' ');
          // this.data.timeUnit = this.timeUnit;
          this.data.minute = expressions[0];
          this.data.hour = expressions[1];
          this.data.day = expressions[2];
          this.data.weekday = expressions[4];
        }
      }
    },
    timeUnit: {
      immediate: true,
      deep: true,
      handler() {
        this.data.timeUnit = this.timeUnit;
      }
    }
  },
  methods: {
    changeTimeUnit() {
      if (this.data.timeUnit === 'hourly') {
        this.data.hour = '*';
        this.data.day = '*';
        this.data.weekday = '*';
      } else if (this.data.timeUnit === 'daily') {
        this.data.hour = '00';
        this.data.day = '*';
        this.data.weekday = '*';
      } else if (this.data.timeUnit === 'weekly') {
        this.data.hour = '00';
        this.data.day = '*';
        this.data.weekday = '1';
      } else if (this.data.timeUnit === 'monthly') {
        this.data.hour = '00';
        this.data.day = '01';
        this.data.weekday = '*';
      }
      this.change();
    },

    change() {
      // this.$emit('input', { timeUnit: this.data.timeUnit, crontab: [this.data.minute, this.data.hour, this.data.day, '*', this.data.weekday].join(' ') });
      this.$emit('input', [this.data.minute, this.data.hour, this.data.day, '*', this.data.weekday].join(' '));
      this.$emit('unit', this.data.timeUnit);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.crontab-form {
  margin-bottom: 0;
  padding: 0;
  background-color: inherit;
  border-radius: 0;
  border: 0;
  box-sizing: border-box;
  .el-form--inline .el-form-item {
    margin-right: 4px;
    margin-bottom: 0;
  }
}
.crontab-popover {
  max-width: 700px;
  min-width: 400px;
}
.time-unit-select {
  width: 100px !important;
}
.crontab-select {
  width: 100px !important;
}
</style>
