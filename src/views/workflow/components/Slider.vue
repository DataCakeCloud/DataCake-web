<template>
  <div class="slider-wrap">
    <i :class="['el-icon-plus', 'pointer', value >= 200 ? 'not-allowed' : '']" @click="add"></i>
    <el-slider v-model="value" class="slider" vertical :step="10" :min="10" :max="200" :format-tooltip="format" height="200px"> </el-slider>
    <i :class="['el-icon-minus', 'pointer', value <= 10 ? 'not-allowed' : '']" @click="reduce"></i>
  </div>
</template>
<script>
export default {
  name: 'Slider',
  data() {
    return {
      value: 100
    };
  },
  watch: {
    value(value, oldValue) {
      if (value > oldValue) {
        this.$emit('zoom', 'add');
      } else {
        this.$emit('zoom', 'reduce');
      }
    }
  },
  methods: {
    format(value) {
      return value + '%';
    },
    add() {
      this.value += 10;
    },
    reduce() {
      this.value -= 10;
    }
  }
};
</script>
<style lang="scss" scoped>
.slider-wrap {
  position: absolute;
  top: 150px;
  right: 10px;
  background: #f5fafe;
  padding: 10px 0;
  text-align: center;
  z-index: 10;
  .slider {
    margin: 10px 0;
  }
  .not-allowed {
    cursor: not-allowed;
  }
}
</style>
