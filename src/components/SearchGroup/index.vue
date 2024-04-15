<template>
  <div class="search-group bg-white">
    <!--  :style="{'height': searchBoxHeght}" -->
    <div id="search-box">
      <slot></slot>
      <div class="btn-wrap">
        <el-button @click="$emit('reset')">重置</el-button>
        <!--  v-track:click="{currentUrl: $route.path, behavior: '点击查询按钮'}" -->
        <el-button type="primary" :loading="loading" @click="$emit('search')">查询</el-button>
        <el-button v-if="exportFlag" type="primary" @click="$emit('export')">导出</el-button>
        <el-button v-if="showFoldBtn" type="text" @click="closeSearch">
          {{ text }}
          <i :class="showAll ? 'el-icon-arrow-up ' : 'el-icon-arrow-down'"></i>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchGroup',
  props: {
    showFoldBtn: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    isShowAll: {
      type: Boolean,
      default: true
    },
    exportFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showAll: this.isShowAll
    };
  },
  computed: {
    text() {
      if (this.showAll) {
        return '收起';
      } else {
        return '展开';
      }
    }
    // searchBoxHeght() {
    //   if (this.showAll) {
    //     return 'auto';
    //   } else {
    //     return 40 + 'px';
    //   }
    // }
  },
  methods: {
    closeSearch() {
      this.showAll = !this.showAll;
      this.$emit('changeHeight', this.showAll);
    }
  }
};
</script>
<style lang="scss" scoped>
.search-group {
  padding: 15px 10px;
  #search-box {
    overflow: hidden;
  }
  .btn-wrap {
    float: right;
  }
}
</style>
