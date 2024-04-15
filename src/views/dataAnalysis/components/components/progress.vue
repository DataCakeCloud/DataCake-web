<template>
  <div class="wrapper">
    <div class="content">
      <div class="outbar">
        <div v-for="item in styleOption" :key="item.text" class="innerbar" :style="styleFn(item)">
          <div class="bar"></div>
          <div class="bartext">{{ item.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    innerBarList: {
      type: Array,
      default: () => []
    },
    styleOption: {
      type: Array,
      default: () => [
        { color: 'linear-gradient(45deg, #cdf4ff, #5d92dd)', width: 20, text: '正在提交' },
        { color: 'linear-gradient(45deg, #f0f1de, #ffce74)', width: 60, text: '查询计算' },
        { color: 'linear-gradient(45deg, #eddef1, #715fd4)', width: 20, text: '结果获取' }
      ]
    }
  },
  data() {
    return {};
  },
  watch: {
    innerBarList: {
      handler(data) {
        data.forEach((item, i) => {
          this.$set(this.styleOption[i], 'bgcWidth', item.width);
        });
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    styleFn(item) {
      const res = {};
      res['width'] = item.width + '%';
      if (item.bgcWidth) {
        res['background-image'] = item.color;
        res['background-size'] = item.bgcWidth + '%';
        res['background-repeat'] = 'no-repeat';
      }
      return res;
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  .content {
    height: 35px;
    .outbar {
      height: 10px;
      border-radius: 5px;
      background-color: #ebeef5;
      .innerbar {
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        &:first-child {
          border-radius: 5px 0 0 5px;
        }
        height: 100%;
        float: left;
        transition: all 0.4s linear;
        background-size: 0;
        .bar {
          height: 100%;
          width: 100%;
        }
        .bartext {
          margin-top: 6px;
          font-size: $global-font-size-12;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
