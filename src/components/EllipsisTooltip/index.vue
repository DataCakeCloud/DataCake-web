<template>
  <el-tooltip :content="text" :placement="placement" :disabled="isTipDisabled">
    <div class="ellipsis block" @mouseenter="isShowTooltip">{{ text }}</div>
  </el-tooltip>
</template>
<script>
export default {
  name: 'EllipsisTooltip',
  props: {
    text: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'top'
    }
  },
  data() {
    return {
      isTipDisabled: false
    };
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    }
  }
};
</script>
