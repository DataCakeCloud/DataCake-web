<template>
  <ul class="axis">
    <li v-for="unit in units" :key="unit">
      <div v-if="unit === 1" class="axis-start-number">{{ getUnitLabel(0) }}</div>
      <div class="axis-number">{{ getUnitLabel(unit) }}</div>
      <div class="axis-unit"></div>
    </li>
  </ul>
  <!-- <div>{{ getUnitLabel(units + 1) }}</div> -->
</template>
<script>
import { parseTime } from '@/utils';

export default {
  name: 'Axis',
  props: {
    startTime: {
      type: Number,
      required: true
    },
    endTime: {
      type: Number,
      required: true
    },
    scale: {
      type: Number,
      // 默认刻度为30分钟
      default: 30
    },
    unitPixel: {
      type: Number,
      default: 150
    },
    minUnit: {
      type: Number,
      default: 6
    }
  },
  computed: {
    units() {
      const units = Math.ceil((this.endTime - this.startTime) / 60000 / this.scale);
      return units < this.minUnit ? this.minUnit : units;
    }
  },
  watch: {
    units: {
      handler: function(newVal) {
        this.$emit('unitsChange', newVal, this.unitPixel);
      },
      immediate: true
    }
  },
  methods: {
    getUnitLabel(unit) {
      return parseTime(this.startTime + unit * this.scale * 60000, '{h}:{i}');
    }
  }
};
</script>
<style>
.axis {
  margin: 0;
  list-style: none;
  /* overflow-y: auto; */
  display: inline-flex;
  align-items: flex-start;
  padding-inline-start: 0;
}
.axis li {
  position: relative;
}
.axis-unit {
  width: 150px;
  height: 20px;
  border-top: 5px solid #585659;
  border-right: 2px solid #585659;
}
.axis li:first-child .axis-unit {
  border-left: 2px solid #585659;
}
.axis-number {
  position: absolute;
  right: -1em;
  top: 20px;
}
.axis-start-number {
  position: absolute;
  left: -1em;
  top: 20px;
}
</style>
