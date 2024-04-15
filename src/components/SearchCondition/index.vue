<template>
  <div class="search-condition">
    <span :class="['label', labelClass, justify ? 'justify' : '']">{{ label }}</span>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'SearchCondition',
  props: {
    label: {
      type: String,
      default: ''
    },
    justify: {
      type: Boolean,
      default: false
    },
    labelClass: {
      type: String,
      default: ''
    }
  }
};
</script>
<style lang="scss" scoped>
.search-condition {
  display: inline-block;
  margin-top: 5px;
  .label {
    margin-left: 10px;
  }
  .justify {
    display: inline-block;
    width: 47px;
    text-align: justify;
    text-align-last: justify;
  }
}
</style>
