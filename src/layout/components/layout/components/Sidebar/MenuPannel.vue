<template>
  <div class="menu-pannel" :style="{ width: vWidth > 1600 ? '30%' : '40%' }" :class="{ 'is-active': fixedPannel.opened && fixedPannel.modalOpened }">
    <div class="waterpull-container">
      <template v-for="router in filteredRouters">
        <section v-if="!router.hidden && hasShowingChildren(router)" class="section" :key="router.path">
          <div class="header" :style="{ width: language === 'zh' ? '120px' : '200px' }">
            <svg-icon v-if="router.meta && router.meta.icon" :icon-class="router.meta && router.meta.icon" />
            <span v-if="router.meta" class="title">{{ $t('route.' + router.meta.title) }}</span>
          </div>
          <ul class="menu">
            <template v-for="item in router.children">
              <li
                v-if="!item.hidden"
                class="item"
                :key="item.path"
                @click="close()"
                :class="{
                  active: isActive(resolvePath(item.path, router.path), item.path)
                }"
              >
                <app-link :to="resolvePath(item.path, router.path)">
                  <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta && item.meta.icon" />
                  <span class="title">
                    <span :class="item.meta.isHot ? 'hot' : ''">
                      {{ $t('route.' + item.meta.title) }}
                    </span>
                  </span>
                </app-link>
                <!-- <svg
                  t="1646641706518"
                  :style="{
                    cursor: navbarOptions.rightFixedRouter.includes(
                      resolvePath(item.path, router.path)
                    )
                      ? 'no-drop'
                      : 'pointer',
                  }"
                  class="fixed-icon"
                  :class="{ active: isFixedRouter(item, router) }"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4815"
                  width="200"
                  height="200"
                  @click="fixMenu(item, router)"
                >
                  <path
                    d="M334.72 612.16L127.36 404.736l85.12-85.184 177.536 71.488 275.968-214.4-72.32-72.32 85.248-85.12 82.944 82.88 0.192-0.128L928 267.84l-0.192 0.256 82.944 82.944-85.12 85.184-72.32-72.256L638.848 640l71.488 177.408-85.12 85.184-207.488-207.36-255.36 255.296-82.944-82.944 255.36-255.36z"
                    fill="currentColor"
                    p-id="4816"
                  ></path>
                </svg> -->
              </li>
            </template>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import weakStore, { toggleFixedRouter, isFixedRouter, close } from '../../../utils/weakStore';
import Link from './Link';
import { mapGetters } from 'vuex';
import { isExternal } from '../../../utils/validate.js';
import path from 'path';

export default {
  components: {
    AppLink: Link
  },
  props: {
    navbarOptions: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    ...mapGetters(['routers']),
    language() {
      return this.$store.getters.language;
    },
    filteredRouters() {
      if (!this.keyWord) return this.routers;
      const reg = new RegExp(this.keyWord.replace(/ +/gi, '|'), 'i');
      const results = [];
      this.routers.forEach(router => {
        if (router.hidden || !this.hasShowingChildren(router)) return;
        if (router.meta && reg.test(this.$t('route.' + router.meta.title))) {
          results.push(router);
        } else {
          const children = [];
          router.children.forEach(route => {
            if (route.meta && reg.test(this.$t('route.' + route.meta.title))) {
              children.push(route);
            }
          });
          if (children.length) {
            results.push({ ...router, children });
          }
        }
      });
      return results;
    }
  },
  data() {
    return { ...weakStore, keyWord: '', vWidth: 1600 };
  },
  mounted() {
    let that = this;
    window.onresize = function () {
      let Dom = document.documentElement || document.body;
      that.vWidth = Dom.offsetWidth;
    };
    window.onresize();
  },
  methods: {
    close,
    isActive(path, otherPath) {
      if (this.$route.path.includes('lakecat2') && otherPath === 'lakecat2') return true;
      return this.$route.path === path;
    },
    hasShowingChildren(router) {
      return router.children?.some?.(route => !route.hidden);
    },
    resolvePath(routePath, basePath) {
      if (isExternal(routePath)) {
        return routePath;
      }
      if (isExternal(basePath)) {
        return basePath;
      }
      return path.resolve(basePath, routePath);
    },
    fixMenu(item, router) {
      let path = this.resolvePath(item.path, router?.path || '/');
      if (this.navbarOptions.rightFixedRouter.includes(path)) return;
      toggleFixedRouter(path);
      let fixedRouterNum = this.navbarOptions.fixedRouterNum;
      if (this.fixedRouter.length > fixedRouterNum + 1 && this.fixedRouter.includes(path))
        this.$message({
          type: 'warning',
          customClass: 'messageIndex',
          message: `顶部菜单最多支持${fixedRouterNum}个,当前菜单已添加到左侧菜单栏中`
        });
    },
    isFixedRouter(item, router) {
      return isFixedRouter(this.resolvePath(item.path, router?.path || '/'));
    }
  }
};
</script>

<style>
.messageIndex {
  z-index: 3001 !important;
}
</style>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
.menu-pannel {
  font-family: PingFangSC-Medium;
  font-size: 13px;
  position: fixed;
  left: 0;
  top: $s-navbar-height;
  // min-width: 745px;
  height: calc(100% - #{$s-navbar-height});
  overflow: auto;
  padding: 24px 0 0 24px;
  background: $c-sidebar-bg;
  border-right: 1px solid $c-divider;
  transform-origin: 0 0;
  transform: scaleX(0);
  &.is-active {
    transition-delay: 0.3s;
    transition-duration: 0.7s;
    transform: scaleX(1);
  }
  .waterpull-container {
    .section {
      display: flex;
      break-inside: avoid;
      overflow: hidden;
      color: #333;
      align-items: start;
      .header {
        display: flex;
        align-items: center;
        padding: 20px 0;
        &:hover .fixed-icon {
          visibility: visible;
        }
        .svg-icon {
          flex: 0 0 1.4em;
          margin-right: 20px;
        }

        .title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
        }
      }
      .menu {
        display: flex;
        flex-wrap: wrap;
        flex: 1;
        list-style-type: none;
        margin: 0;
        padding: 10px 0;
        border-bottom: 2px solid $c-divider;
        .item {
          width: calc(100% / 3);
          margin: 12px 0;
          padding: 0 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          &.active {
            color: $c-primary;
          }
          &:hover .fixed-icon {
            visibility: visible;
          }
          .fixed-icon {
            width: 1em;
            height: 1em;
            color: #333;
            min-width: 14px;
            margin-left: 32px;
            visibility: hidden;
            cursor: pointer;
            &.active {
              color: $c-primary;
              visibility: visible;
            }
          }
          a {
            display: flex !important;
            align-items: center;
            width: 90% !important;
            overflow: visible !important;
            color: inherit;
            &:hover {
              color: $c-primary;
            }
            .svg-icon {
              min-width: 1em;
            }
          }
          .svg-icon {
            margin-right: 10px !important;
          }
          .title {
            // padding-right: 28px;
            .hot {
              position: relative;
              &::after {
                content: 'New';
                position: absolute;
                right: -35px;
                color: #f7f9ff;
                background-color: red;
                transform: scale(0.8);
                padding: 0 3px;
                text-shadow: 1px 1px 2px #f7f9ff;
                z-index: -1;
              }
            }
          }
        }
      }
    }
  }
}
.menu-search {
  padding-bottom: 24px;
}
</style>
