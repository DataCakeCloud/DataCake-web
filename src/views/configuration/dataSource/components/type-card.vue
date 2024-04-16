<template>
  <div class="card" @click="select">
    {{ data.label }}
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      require: true
    },
    value: {
      type: String
    }
  },
  methods: {
    select() {
      this.$emit('input', this.data.type);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.card {
  display: inline-block;
  width: 140px;
  height: 90px;
  text-align: center;
  line-height: 90px;
  margin: 26px 26px 26px 0;
  border: 2px solid #f2f6fc;
  cursor: pointer;
}
</style>
