<template>
  <g>
    <path :d="d" marker-end="url(#normalTriangle)" fill="none" stroke="#5f95ff" stroke-width="2" :stroke-dasharray="dashed ? '3 2' : ''" />
    <path v-if="dragging" :d="dd" marker-end="url(#normalTriangle)" fill="none" stroke="#5f95ff" stroke-width="2" :stroke-dasharray="'3 2'" />
  </g>
</template>
<script>
const imLine = {};

export default {
  imLine,
  props: {
    start: {
      required: true,
      type: Object,
      default() {
        return { x: 0, y: 0 };
      }
    },
    end: {
      required: true,
      type: Object,
      default() {
        return { x: 0, y: 0 };
      }
    },
    dashed: {
      type: Boolean,
      default: false
    },
    darggable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dragging: false
    };
  },
  computed: {
    d() {
      const dx = Math.max(30, Math.abs(this.end.x - this.start.x) / 3);
      // const dy = (this.end.y - this.start.y) / 3;
      const dy = 0;
      return `M${this.start.x} ${this.start.y} C${this.start.x + dx},${this.start.y + dy} ${this.end.x - dx},${this.end.y - dy} ${this.end.x},${this.end.y}`;
    },
    dd() {
      const dx = Math.max(30, Math.abs(this.end.x - this.start.x) / 3);
      // const dy = (this.end.y - this.start.y) / 3;
      const dy = 0;
      return `M${this.start.x} ${this.start.y} C${this.start.x + dx},${this.start.y + dy} ${this.end.x - dx},${this.end.y - dy} ${this.end.x},${this.end.y}`;
    }
  },
  methods: {
    pointerDown(e) {
      this.dragging = true;
    },

    pointerMove(e) {
      const [ox, oy] = this.startPos;
      this.$emit('update:x', this.x + e.x - ox);
      this.$emit('update:y', this.y + e.y - oy);
      this.startPos = [e.x, e.y];
    },

    pointerUp(e) {
      this.dragging = false;
    }
  }
};
</script>
<style lang="scss" scoped>
// .shape {
//   position: absolute;
//   border-radius: 4px;
//   padding: 4px;
//   cursor: move;
//   border: 3px dashed transparent;
//   transform: translate(-50%, -50%);
//   &:hover,
//   &.actived {
//     border-color: #5f95ff;
//   }
//   &.disabled {
//     cursor: default;
//     border: none;
//   }
// }
</style>
