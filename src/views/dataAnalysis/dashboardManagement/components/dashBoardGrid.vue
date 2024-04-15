<template>
  <div ref="grid_box" :class="['grid_box', subHeight ? 'subHeight' : '', addPadding ? 'addPadding' : '']">
    <el-empty v-if="data.length === 0" description="暂无图表"></el-empty>
    <draggable
      v-else
      class="draggable"
      handle=".move_bar"
      group="player"
      animation="500"
      delay="0"
      :disabled="options.isDrag"
      ghost-class="ghost"
      chosen-class="chosen"
force-fallback
      :move="onMove"
      @start="onStart"
      @end="onEnd"
    >
      <el-card v-for="(data, index) in data" :key="data.id + '' + index" class="grid_item" :style="{ width: data.width, height: data.height + 'px' }">
        <dashBoardItem :data="data" :options="options" @delDashBoard="delDashBoard" />
        <i v-if="!options.isDrag" v-dragSize="data" class="el-icon-caret-bottom move_icon"></i>
      </el-card>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import dashBoardItem from './dashBoardItem.vue';

export default {
  components: {
    draggable,
    dashBoardItem
  },
  directives: {
    dragSize: {
      inserted: function(el, binding) {
        const dragDom = el;
        const sizeDom = el.parentElement.parentElement;
        dragDom.style.cursor = 'se-resize';
        dragDom.onmousedown = e => {
          document.body.style.cursor = 'se-resize';
          e.preventDefault();
          // 鼠标按下，计算当前元素距离可视区的距离
          const disX = e.clientX;
          const disY = e.clientY;
          const w = sizeDom.clientWidth;
          const h = sizeDom.clientHeight;
          var nw;
          var nh;
          document.onmousemove = function(e) {
            // 通过事件委托，计算移动的距离
            const l = e.clientX - disX;
            const r = e.clientY - disY;
            // 改变当前元素宽度，不可超过最小最大值
            nw = w + l < 200 ? 200 : w + l;
            nh = h + r < 200 ? 200 : h + r;
            sizeDom.style.width = `calc(${(nw / binding.value.contentWidth) * 100 >= 100 ? 100 : (nw / binding.value.contentWidth) * 100}% - 10px)`;
            sizeDom.style.height = `${nh}px`;
          };

          document.onmouseup = function(e) {
            document.body.style.cursor = 'default';
            binding.value.width = `calc(${(nw / binding.value.contentWidth) * 100 >= 100 ? 100 : (nw / binding.value.contentWidth) * 100}% - 10px)`;
            binding.value.height = nh;
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      },
      update: function(el, binding) {
        const dragDom = el;
        const sizeDom = el.parentElement.parentElement;
        dragDom.style.cursor = 'se-resize';
        dragDom.onmousedown = e => {
          document.body.style.cursor = 'se-resize';
          e.preventDefault();
          // 鼠标按下，计算当前元素距离可视区的距离
          const disX = e.clientX;
          const disY = e.clientY;
          const w = sizeDom.clientWidth;
          const h = sizeDom.clientHeight;
          var nw;
          var nh;
          document.onmousemove = function(e) {
            // 通过事件委托，计算移动的距离
            const l = e.clientX - disX;
            const r = e.clientY - disY;
            // 改变当前元素宽度，不可超过最小最大值
            nw = w + l < 200 ? 200 : w + l;
            nh = h + r < 200 ? 200 : h + r;
            sizeDom.style.width = `calc(${(nw / binding.value.contentWidth) * 100 >= 100 ? 100 : (nw / binding.value.contentWidth) * 100}% - 10px)`;
            sizeDom.style.height = `${nh}px`;
          };

          document.onmouseup = function(e) {
            document.body.style.cursor = 'default';
            binding.value.width = `calc(${(nw / binding.value.contentWidth) * 100 >= 100 ? 100 : (nw / binding.value.contentWidth) * 100}% - 10px)`;
            binding.value.height = nh;
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      }
    }
  },
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          isDrag: false
        };
      }
    },
    data: {
      type: Array,
      default: () => []
    },
    subHeight: {
      type: Boolean,
      default: false
    },
    addPadding: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      containerWidth: 0
    };
  },
  watch: {
    containerWidth(val) {
      this.data.forEach(item => {
        item.contentWidth = val;
      });
    },
    data(data) {
      data.forEach(item => {
        item.contentWidth = this.containerWidth;
      });
    }
  },
  mounted() {
    // 宽度
    const that = this;
    this.containerWidth = this.$refs.grid_box?.clientWidth || 0;
    window.onresize = function() {
      that.containerWidth = that.$refs.grid_box?.clientWidth || 0;
    };
  },
  methods: {
    delDashBoard(data) {
      const index = this.data.findIndex(item => item.id === data.id);
      if (index > -1) {
        this.data.splice(index, 1);
      }
    },
    onStart(e) {
      // 开始拖动时触发的事件
      // console.log('start:', e);
      // console.log('拖拽操作前的索引oldIndex:', e.oldIndex);
      // console.log('拖拽完成后的索引newIndex:', e.newIndex);
    },
    onEnd(e) {
      // 拖动完成时触发的事件
      // console.log('end:', e);
      // console.log('拖拽操作前的索引oldIndex:', e.oldIndex);
      // console.log('拖拽完成后的索引newIndex:', e.newIndex);
      const currentObj = this.data.splice(e.oldIndex, 1);
      this.data.splice(e.newIndex, 0, ...currentObj);
      const dragToObj = this.data.splice(e.newIndex + 1, 1);
      this.data.splice(e.oldIndex, 0, ...dragToObj);
    },
    onMove(e, originalEvent) {
      // 拖拽move事件回调
      // console.log('move:', e);
      // console.log('originalEvent:', originalEvent);
      // 不允许拖拽
      // if (e.draggedContext.element.num === 11) return false; // false表示阻止，true表示不阻止
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.grid_box {
  overflow: hidden;
  min-height: calc(100vh - 195px);
  &.subHeight {
    min-height: calc(100vh - 121px);
  }
  &.addPadding {
    padding-bottom: 400px;
  }
  margin-top: 10px;
  background-color: #f9f9fb;
  .draggable {
    display: flex;
    flex-wrap: wrap;
    .grid_item {
      margin: 0 10px 10px 0;
      position: relative;
      // ::v-deep .el-card__body {
      //   height: 100%;
      //   overflow: auto;
      // }
      .move_icon {
        position: absolute;
        right: 0;
        bottom: 0;
        transform: rotate(-45deg);
      }
    }
  }
  .el-empty {
    margin-top: 100px;
  }
}
.chosen {
  // 选择元素的样式
  background: #fbfbfb !important;
  color: #2c3b5e !important;
}
.ghost {
  // 目标位置占位符的样式及需要停靠位置的样式
  background: #f7f5f5 !important;
}
</style>
