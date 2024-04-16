<script>
import Line from '../line';

export default {
  props: {
    x: {
      required: true,
      type: Number,
      default: 0
    },
    y: {
      required: true,
      type: Number,
      default: 0
    },
    z: {
      required: true,
      type: Number,
      default: 0
    }
  },
  beforeDestroy() {
    this.freeEvts();
  },
  methods: {
    scroll(e) {
      const { deltaY, deltaX } = e;
      e.preventDefault();
      e.stopPropagation();
      this.$emit('update:x', this.x - deltaX);
      this.$emit('update:y', this.y - deltaY);
    },
    pointerdown(e) {
      if (this.disabled) return;
      this.addEvts();
      this.startPos = [e.x, e.y];
    },
    pointermove(e) {
      const [ox, oy] = this.startPos;
      this.$emit('update:x', this.x + e.x - ox);
      this.$emit('update:y', this.y + e.y - oy);
      this.startPos = [e.x, e.y];
    },
    pointerup() {
      this.freeEvts();
      this.startPos = null;
    },
    addEvts() {
      document.addEventListener('pointermove', this.pointermove, true);
      document.addEventListener('pointerup', this.pointerup, true);
    },
    freeEvts() {
      document.removeEventListener('pointermove', this.pointermove, true);
      document.removeEventListener('pointerup', this.pointerup, true);
    }
  },
  render(h) {
    const lines = [];
    const els = [];
    this.$slots.default?.forEach(vm => {
      if (vm.componentOptions && vm.componentOptions.Ctor === Line._Ctor[0]) lines.push(vm);
      else els.push(vm);
    });
    return (
      <div class='layer' on={{ wheel: this.scroll.bind(this), pointerdown: this.pointerdown.bind(this) }}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' class='lines-painter' transform={`scale(${this.z / 100}) translate(${this.x}, ${this.y})`}>
          <defs>
            <marker id='normalTriangle' viewBox='0 0 20 20' refX='0' refY='10' markerWidth='3.5' markerHeight='3.5' orient='auto'>
              <path d='M 0 0 L 20 10 L 0 20 z' fill='#5f95ff' />
            </marker>
          </defs>
          {lines /** 后面研究下怎么把attr插进去 */}
        </svg>
        <div
          class='inner'
          style={{
            transform: `scale(${this.z / 100}) translate(${this.x}px, ${this.y}px)`
          }}
        >
          {els}
        </div>
        <div class='map'>
          <div
            class='inner'
            style={{
              transform: `scale(.5) translate(${this.x}px, ${this.y}px)`
            }}
          >
            {els}
          </div>
        </div>
      </div>
    );
  }
};
</script>

<style lang="scss" scoped>
.layer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  &:active {
    cursor: grabbing;
  }
}
.inner {
  position: relative;
}
.inner,
.lines-painter {
  transform-origin: 0 0;
}
.lines-painter {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
}
.map {
  position: absolute;
  right: 10px;
  bottom: 10px;
  height: 200%;
  width: 200%;
  background: #eee;
  transform-origin: 100% 100%;
  transform: scale(0.05);
  overflow: hidden;
  box-sizing: border-box;
  padding-left: 50%;
  padding-top: 50%;
  user-select: none;
  pointer-events: none;
  border: 1px solid #000;
}
</style>
