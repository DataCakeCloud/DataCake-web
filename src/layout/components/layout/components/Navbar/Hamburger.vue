<template>
  <div :class="{ 'is-active': sidebar.opened }" class="hamburger-container" @click="toggleClick">
    <svg class="hamburger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <path
        d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
      />
    </svg>
    <span class="hamburger-text">{{ closeText }}</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'language']),
    closeText() {
      return this.language === 'zh' ? '收起侧边栏' : 'Close the sidebar';
    }
  },
  methods: {
    toggleClick() {
      if (this.$store._actions.ToggleSideBar) {
        this.$store.dispatch('ToggleSideBar');
      } else if (this.$store._actions['app/toggleSideBar']) {
        this.$store.dispatch('app/toggleSideBar');
      } else {
        console.log('请配置vuex/action的ToggleSideBar或app/toggleSideBar方法！');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$hover-effect: rgba(0, 0, 0, 0.1);
.hamburger-container {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #eaf0f7;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;
  color: #303133;

  &:hover {
    background: $hover-effect;
  }
  padding: 0 12px;
  .hamburger {
    width: 18px;
    display: inline-block;
    vertical-align: middle;
    transform: rotate(0deg);
    transition: all 0.3s;
  }
  .hamburger-text {
    opacity: 0;
    transition: all 0.3s;
    width: 0;
    overflow: hidden;
  }
  &.is-active {
    .hamburger {
      transform: rotate(180deg);
    }
    .hamburger-text {
      opacity: 1;
      width: inherit;
      padding-left: 3px;
    }
  }
}
</style>
