<template>
  <div v-if="labelList.length > 0" class="label_wrap">
    <div v-for="(item, index) in labelList" :key="item.name" class="label_item">
      <div class="item_box" :style="styleFn(index)" @click="$emit('open', item, index)">
        <i class="el-icon-close close" @click.stop="$emit('close', index)"></i>
        <div class="text_box ellipsis" v-bind="titleFn(item)" @mousemove="isShowTooltip" @mouseleave="isTipDisabled = true">{{ item.ruleForm.name || item.labelName || '' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LabelList',
  props: {
    labelList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isTipDisabled: false,
      colorList: ['#0fabc0a8', '#99c926b5', '#c2d615bf', '#ffa12da6', '#6667aba6']
    };
  },
  methods: {
    styleFn(index) {
      const res = {
        backgroundColor: '#6667aba6'
      };
      const i = index % this.colorList.length;
      res['backgroundColor'] = this.colorList[i];
      return res;
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth && clientWidth > 100) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    titleFn(data) {
      const str = data.ruleForm.name || data.labelName || '';
      const res = {};
      if (!this.isTipDisabled) {
        res.title = str;
      }
      return res;
    }
  }
};
</script>

<style lang="scss" scoped>
.label_wrap {
  position: absolute;
  top: -5px;
  right: 0px;
  z-index: 15;
  width: 180px;
  max-height: 100%;
  overflow-y: auto;
  .label_item {
    margin: 5px 0;
    text-align: end;
    overflow: hidden;
    .item_box {
      float: right;
      display: flex;
      align-items: center;
      width: 90px;
      color: #fff;
      height: 30px;
      line-height: 30px;
      padding-left: 10px;
      // background: linear-gradient(45deg, transparent 10px, #6667ab 0) bottom left, linear-gradient(135deg, transparent 10px, #6667ab 0) top left;
      // background-color: #6667abd4;
      border-radius: 15px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      // background-size: 100% 50%;
      // background-repeat: no-repeat;
      cursor: pointer;
      transition: all 0.4s;
    }
    &:hover .item_box {
      width: 100%;
    }
    .text_box {
      width: calc(100% - 20px);
      padding: 0 5px;
      text-align: end;
    }
  }
}
</style>
