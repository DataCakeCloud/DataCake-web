<template>
  <el-card class="data-query box-card-container">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="数据查询" name="queryTab">
        <QueryTab class="tab-wrap" />
      </el-tab-pane>
      <el-tab-pane label="已保存的查询" name="saveTab">
        <saved-tab ref="saveTab" class="tab-wrap" />
      </el-tab-pane>
      <el-tab-pane label="历史查询" name="historyTab">
        <history-tab ref="historyTab" class="tab-wrap" />
      </el-tab-pane>
      <el-tab-pane label="定时任务" name="controlManager">
        <control-manager ref="controlManager" class="tab-wrap" />
      </el-tab-pane>
      <el-tab-pane label="分享列表" name="shareTab">
        <shareTab ref="shareTab" class="tab-wrap" />
      </el-tab-pane>
      <el-tab-pane v-if="permissionType" v-permission="permission" label="已生成的API" name="generateApi">
        <generate-api ref="generateApi" class="tab-wrap" />
      </el-tab-pane>
      <!-- <el-tab-pane label="加速表查询" name="AccelerateTab">
        <accelerate-tab ref="AccelerateTab" class="tab-wrap" />
      </el-tab-pane> -->
    </el-tabs>
  </el-card>
</template>

<script>
import QueryTab from '../components/queryTab.vue';
// import AccelerateTab from '../components/accelerateTab.vue';
import SavedTab from '../components/SavedTab.vue';
import HistoryTab from '../components/HistoryTab.vue';
import shareTab from '../components/shareTab.vue';
import generateApi from '../components/generateApi.vue';
import ControlManager from '../components/controlManager.vue';
import { EventBus, EventType } from '@/utils/eventbus';
import { whiteTenant } from '@/utils/config';
import { mapGetters } from 'vuex';

export default {
  components: {
    QueryTab,
    SavedTab,
    HistoryTab,
    shareTab,
    generateApi,
    ControlManager
    // AccelerateTab
  },
  data() {
    return {
      activeTab: 'queryTab',
      permissionType: true
    };
  },
  created() {
    EventBus.$on(EventType.switchQueryTab, row => {
      this.activeTab = 'queryTab';
    });

    const { active } = this.$route.query;
    if (active) this.changeActiveTab(active);
  },
  provide() {
    return {
      changeActiveTab: this.changeActiveTab
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    permission() {
      const res = {};
      res.condition = whiteTenant;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      res.callBack = this.permissionFn;
      return res;
    }
  },
  destroyed() {
    EventBus.$off(EventType.switchQueryTab);
  },
  methods: {
    permissionFn(res) {
      this.permissionType = res;
    },
    changeActiveTab(newActiveTab, query) {
      this.activeTab = newActiveTab;
      this.$nextTick(() => {
        if (query) {
          Object.assign(this.$refs[newActiveTab].params, query);
        }
        this.$refs[newActiveTab].search();
      });
    },
    handleClick(tab) {
      if (this.$refs[tab.name] && sessionStorage.getItem(`ds-${tab.name}-refresh`)) {
        this.$refs[tab.name].search();
        // 保存目录加载
        if (tab.name === 'saveTab') this.$refs[tab.name].getFolderList();
        sessionStorage.removeItem(`ds-${tab.name}-refresh`);
      }
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0;
  }
}
.data-query {
  ::v-deep .el-tabs__header {
    margin: 0;
    padding: 0 6px;
  }
  ::v-deep .el-tabs__content {
    overflow: visible;
  }
  .tab-wrap {
    // height: calc(100vh - 110px);
  }
}
</style>
<style lang="scss">
.data-query {
  // ::-webkit-scrollbar {
  //   width: 8px;
  //   height: 8px;
  //   background-color: #ebeef5;
  // }
  // ::-webkit-scrollbar-thumb {
  //   box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  //   -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  //   background-color: rgba(0, 0, 0, 0.1);
  //   border-radius: 5px;
  // }
  // ::-webkit-scrollbar-thumb:hover {
  //   background: rgba(91, 112, 228, 0.6);
  // }
  // ::-webkit-scrollbar-track {
  //   box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  //   border-radius: 5px;
  //   background: rgba(255, 255, 255, 1);
  // }
  // .invisible.scrollbar.horizontal.fade,
  // .visible.scrollbar.horizontal {
  //   height: 8px !important;
  // }
  .invisible.scrollbar.horizontal.fade:hover,
  .invisible.scrollbar.horizontal.fade:active,
  .visible.scrollbar.horizontal:active,
  .visible.scrollbar.horizontal:hover {
    background: #ebeef5 !important;
    .slider {
      background: rgba(55, 130, 255, 0.6);
    }
  }
  .invisible.scrollbar.vertical.fade,
  .visible.scrollbar.vertical,
  .decorationsOverviewRuler {
    width: 4px !important;
  }
  .invisible.scrollbar.vertical.fade,
  .visible.scrollbar.vertical,
  .decorationsOverviewRuler {
    background: #ebeef5 !important;
    &:hover {
      .slider {
        background: rgba(55, 130, 255, 0.6);
      }
    }
    &:active .slider {
      background: rgba(55, 130, 255, 0.6);
    }
  }
}
.table_overflow_tootip {
  max-height: 45vh;
  // overflow: auto;
}
</style>
