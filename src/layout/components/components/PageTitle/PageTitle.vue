<template>
  <div class="page-titlebar">
    <el-button v-if="showBack" class="back-button" type="text" @click="back">
      <img src="../../assets/icons/back.svg" alt="back" class="back-img" />
    </el-button>
    <span class="title">
      {{ title || defaultTitle }}
    </span>
    <div class="right-actions">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    },
    backRouter: [String, Object],
    backAction: [Function]
  },
  computed: {
    defaultTitle() {
      if (this.$route && this.$route.meta && this.$route.meta.title) {
        return this.$t(`route.${this.$route.meta.title}`);
      }
      return '';
    }
  },
  methods: {
    back() {
      if (this.backAction && typeof this.backAction === 'function') {
        this.backAction();
      } else if (this.backRouter) {
        this.$router.push(this.backRouter);
      } else {
        this.$router.back();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';
.page-titlebar {
  height: 64px;
  padding: 11.5px 0;
  border-bottom: solid 1px $c-divider;
  margin-bottom: 18px;
  .back-img {
    width: 28px;
    height: 28px;
    vertical-align: middle;
    margin-top: -6px;
  }
  .back-button,
  .title {
    min-width: unset;
    height: 38px;
    line-height: 38px;
    font-size: 28px;
    font-weight: 500;
    color: $c-title;
    display: inline-block;
  }
  .back-button {
    padding: 0;
    margin-right: 4px;
  }
  & > .right-actions {
    float: right;
    line-height: 38px;
  }
}
</style>
