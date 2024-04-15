<template>
  <div v-if="showMoveCom">
    <div class="layout-box" :style="{ top: top, left: left, right: right }">
      <!-- @mouseup.stop -->
      <div class="showMoveCom" :style="{ transform: traslateVal }">
        <slot></slot>
      </div>
    </div>
    <div class="mask" @click="clickMask"></div>
  </div>
</template>
<script>
export default {
  props: {
    showMoveCom: {
      type: Boolean,
      default: false
    },
    traslateVal: {
      type: String,
      default: 'translateX(0px)'
    },
    top: {
      type: String,
      default: 'NaN'
    },
    bottom: {
      type: String,
      default: 'NaN'
    },
    left: {
      type: String,
      default: 'NaN'
    },
    right: {
      type: String,
      default: 'NaN'
    }
  },
  methods: {
    clickMask(e) {
      this.$emit('clickMask');
    }
  }
};
</script>
<style scoped>
@keyframes moveToshow {
  100% {
    transform: translateX(0px);
    transform: translateY(0px);
  }
}
.showMoveCom {
  animation: moveToshow 0.3s linear forwards;
}
.layout-box {
  border-radius: 4px;
  position: fixed;
  width: fit-content;
  height: fit-content;
  overflow: hidden;
  z-index: 7000;
}
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: transparent;
  z-index: 6600;
}
</style>
