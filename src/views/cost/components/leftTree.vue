<template>
  <el-card :class="['left-tree', 'transition', !isOpen ? 'close' : '']">
    <div slot="header" class="clearfix">
      <span v-if="isOpen">成本中心</span>
      <span :class="[isOpen ? 'el-icon-s-unfold' : 'el-icon-s-fold', 'close-btn', 'transition']" @click="handleOpen"></span>
    </div>
    <ul :class="['list', { 'no-text': !isOpen }]">
      <template v-for="(item, index) in list">
        <li v-if="item.permission" :key="index" :class="['item', { active: $route.name === item.name }]" @click="handleLink(item)">
          <svg-icon :icon-class="item.icon"></svg-icon>
          <span v-show="isOpen && item.show" class="text">{{ item.text }}</span>
        </li>
      </template>
    </ul>
  </el-card>
</template>

<script>
export default {
  name: 'LeftTree',
  data() {
    return {
      isOpen: window.sessionStorage.getItem('costLeftTreeOpen') !== null ? JSON.parse(window.sessionStorage.getItem('costLeftTreeOpen')) : true,
      list: [
        {
          name: 'NewCostCenter',
          text: '首页',
          icon: 'cost',
          show: true,
          permission: true
        },
        {
          name: 'NewCostAnalysis',
          text: '成本分析',
          icon: 'analysis',
          show: true,
          permission: true
        },
        {
          name: 'NewCostBill',
          text: '账单',
          icon: 'bill',
          show: true,
          permission: true
        },
        {
          name: 'NewCostReport',
          text: '报告管理',
          icon: 'report',
          show: true,
          permission: true
        },
        // {
        //   name: 'NewCostMonitor',
        //   text: '监控管理',
        //   icon: 'monitor',
        //   show: true,
        //   permission: true
        // },
        {
          name: 'group',
          text: '业务架构配置',
          icon: 'group',
          show: true,
          permission: true
        }
      ]
    };
  },
  created() {},
  methods: {
    handleOpen() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        const timer = setTimeout(_ => {
          this.list.forEach(e => {
            e.show = true;
          });
          clearTimeout(timer);
        }, 150);
      } else {
        this.list.forEach(e => {
          e.show = false;
        });
      }
      window.sessionStorage.setItem('costLeftTreeOpen', this.isOpen);
    },
    handleLink(item) {
      this.$router.push({ name: item.name });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.left-tree {
  flex: 0 0 150px;
  width: 150px;
  height: calc(100vh - 45px);
  border: none;
  border-radius: 0;

  ::v-deep .el-card__header {
    position: relative;
  }

  &.close {
    flex: 0 0 50px;
    width: 50px;

    .close-btn {
      transform: rotate(0deg);
      position: static;
    }
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    transform: rotate(180deg);
  }
  .no-text {
    .item {
      /* justify-content: center;
      padding: 0;
      text-indent: 0; */
    }
  }
  .item {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    height: 50px;
    padding-left: 20px;
    text-indent: 10px;
    cursor: pointer;

    &:hover {
      color: $c-primary;
    }

    &.active {
      color: $c-primary;
    }
  }
}
</style>
