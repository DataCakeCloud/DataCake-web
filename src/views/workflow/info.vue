<template>
  <div class="info box-card-container">
    <div class="menu">
      <div class="menu-left">
        <router-link :to="{ path: '/task/workflow' }">工作流列表</router-link> / 工作流运维( <a :class="{ 'a-disabled': isDisabled }" @click="clickName">{{ $route.query.name }}</a> )
      </div>
    </div>
    <el-tabs v-model="tabItem" class="mt10">
      <el-tab-pane name="overview" label="工作流运行总览">
        <Overview v-if="tabItem === 'overview'" ref="ConsanguinityMap" />
      </el-tab-pane>
      <el-tab-pane name="detail" label="工作流运行明细">
        <Deatail v-if="tabItem === 'detail'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Overview from './components/info/overview';
import Deatail from './components/info/detail';
import { getWorkflowInfo } from '@/api/flow';
import { mapGetters } from 'vuex';

export default {
  name: 'Info',
  components: {
    Overview,
    Deatail
  },
  provide() {
    return {
      updateTabItem: this.updateTabItem
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data() {
    return {
      tabItem: 'overview',
      isDisabled: false
    };
  },
  created() {
    if (this.$route.query.tab === 2) {
      this.tabItem = 'detail';
    }
    this.getWorkflowInfo();
  },
  methods: {
    getWorkflowInfo() {
      getWorkflowInfo({
        workflowId: this.$route.query.id,
        version: this.$route.query.version
      }).then(res => {
        const row = res.data;
        if (!this.userInfo.isAdmin) {
          // 判断当前登录人是否在当前工作流的用户组中
          const groupListIds = row.groupList.map(item => item.id);
          const groupIds = this.userInfo.groupIds.split(',');
          const isContainGroup = groupIds.some(item => {
            return groupListIds.includes(Number(item));
          });
          if (row.owner === this.userInfo.userId || row.collaborators.includes(this.userInfo.userId) || isContainGroup) {
            this.isDisabled = false;
          } else {
            this.isDisabled = true;
          }
        } else {
          this.isDisabled = false;
        }
      });
    },
    updateTabItem(name) {
      this.tabItem = name;
    },
    clickName() {
      if (this.isDisabled) {
        return;
      }
      this.$router.push({
        path: '/workflow/add',
        query: { id: this.$route.query.id, version: this.$route.query.version }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.info {
  padding: 15px;
  .a-disabled {
    color: #b8b8b8;
    cursor: not-allowed;
  }
  .menu {
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    &-btn {
      margin-left: 12px;
    }
    &-left {
      color: #333;
      // font-size: $global-font-size-18;
    }
  }
}
</style>
