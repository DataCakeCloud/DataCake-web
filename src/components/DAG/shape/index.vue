<template>
  <div class="shape" :class="{ active: active, disabled: disabled }" :style="styl" @pointerdown.stop.prevent="chooseShape" @pointerup.stop.prevent="endOnShape">
    <slot />
  </div>
</template>

<script>
const currShape = { target: null };

export default {
  props: {
    x: {
      type: Number,
      required: true,
      default: 0
    },
    y: {
      type: Number,
      required: true,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currShape,
      tx: 0,
      ty: 0
    };
  },
  computed: {
    styl() {
      return `top:${this.y}px;left:${this.x}px;`;
    },
    active() {
      return currShape.target === this;
    }
  },
  beforeDestroy() {
    if (currShape.target === this) currShape.target = null;
  },
  methods: {
    endOnShape() {
      if (this.disabled) return;
      if (currShape.target === this) this.releaseShape();
      else this.$emit('endonshape');
    },
    chooseShape(e) {
      if (this.disabled) return;
      this.addEvts();
      currShape.target = this;
      this.startPos = [e.x, e.y];
    },
    moveShape(e) {
      const [ox, oy] = this.startPos;
      this.$emit('update:x', this.x + e.x - ox);
      this.$emit('update:y', this.y + e.y - oy);
      this.startPos = [e.x, e.y];
    },
    releaseShape() {
      this.freeEvts();
      currShape.target = null;
      this.startPos = null;
    },
    addEvts() {
      document.addEventListener('pointermove', this.moveShape, true);
      document.addEventListener('pointerup', this.releaseShape, true);
    },
    freeEvts() {
      document.removeEventListener('pointermove', this.moveShape, true);
      document.removeEventListener('pointerup', this.releaseShape, true);
    }
  }
};
</script>

<style lang="scss" scoped>
.shape {
  position: absolute;
  border-radius: 4px;
  padding: 4px;
  // cursor: move;
  border: 3px dashed transparent;
  transform: translate(-50%, -50%);
  &:hover,
  &.active {
    border-color: #5f95ff;
  }
  &.disabled {
    cursor: default;
    border: none;
  }
}
</style>
