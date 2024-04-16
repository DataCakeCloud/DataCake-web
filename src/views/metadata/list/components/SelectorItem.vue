<template>
  <div class="selector-item">
    <label class="sl-label">{{ label }}：</label>
    <div :class="['sl-value', isOpen ? 'extend' : '']">
      <slot></slot>
    </div>
    <span v-if="isShow" class="sl-ext" @click="isOpen = !isOpen">{{ isOpen ? '收起' : '展开' }} <i :class="isOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i></span>
  </div>
</template>
<script>
export default {
  name: 'SelectorItem',
  props: {
    label: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isOpen: false
    };
  }
};
</script>
<style lang="scss" scoped>
.selector-item {
  padding: 10px;
  display: flex;
  border-bottom: 1px dashed #dcdfe6;
  .sl-label {
    font-weight: normal;
    width: 80px;
    padding: 5px;
  }
  .sl-value {
    flex: 1;
    color: #445782;
    height: 31.4px;
    overflow: hidden;
    &.extend {
      height: auto;
    }
  }
  .sl-ext {
    padding-top: 5px;
    width: 50px;
    cursor: pointer;
    color: $c-primary;
  }
}
</style>
