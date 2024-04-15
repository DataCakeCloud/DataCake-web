<template>
  <el-card class="dashboard-card table-module">
    <div class="tool">
      <el-select v-if="isAdmin" v-model="userGroup" clearable placeholder="请选择用户组" size="mini" @change="handleChange">
        <el-option v-for="(item, index) in groups" :key="index" :label="item.name" :value="item.uuid"></el-option>
      </el-select>
      <el-button type="text" class="more" @click="handleMore">查看更多</el-button>
    </div>
    <el-tabs v-model="activeName" :class="[{ tabs: isAdmin }]" @tab-click="handleClick">
      <template v-for="(item, index) in tabList">
        <el-tab-pane :key="index" v-loading="item.loading" :label="item.text" :name="item.name">
          <div class="table-list table-title">
            <div class="table-id">执行 ID</div>
            <div class="table-start-time">开始时间</div>
            <div class="table-run-time">运行时间 (秒)</div>
            <div v-if="tabIndex === 0" class="table-times">扫描数据量</div>
            <div class="table-icon table-title-icon"></div>
          </div>
          <el-empty v-if="!item.list.length && !item.loading" description="无访问表数据"></el-empty>
          <template v-for="(subItem, subIndex) in item.list" v-else>
            <div v-if="subIndex < 10" :key="subIndex" class="table-list">
              <div class="table-id cell-ellipsis">{{ subItem.id }}</div>
              <div class="table-start-time">{{ subItem.createTime }}</div>
              <div class="table-run-time">{{ subItem.executeDuration }}</div>
              <div v-if="tabIndex === 0" class="table-times">
                <el-tag v-if="subItem.displayProcessedBytes" effect="dark" type="success">{{ subItem.displayProcessedBytes }}</el-tag>
              </div>
              <div class="table-icon" @click="handleQuery(subItem)"></div>
            </div>
            <el-divider v-if="subIndex < 10 && subIndex !== item.list.length - 1" :key="`${index}_${subIndex}_divider`"></el-divider>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { topScan, topExecution } from '@/api/dashboard';
export default {
  name: 'TopScanQuery',
  props: {
    groups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeName: 'first',
      tabIndex: 0,
      tabList: [
        {
          name: 'first',
          text: '扫描数据量 Top10',
          loading: false,
          list: []
        },
        {
          name: 'second',
          text: '查询时长 Top10',
          loading: false,
          list: []
        }
      ],
      userGroup: ''
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'currentUserGroup'])
  },
  created() {
    this.topScan();
  },
  methods: {
    topScan() {
      if (!Object.keys(this.currentUserGroup).length) return;
      this.tabList[this.tabIndex].loading = true;
      const params = {
        userGroup: this.isAdmin ? this.userGroup : this.currentUserGroup.uuid
      };
      topScan(params)
        .then(res => {
          const data = res.data;
          this.tabList[this.tabIndex].list = data;
        })
        .finally(() => {
          this.tabList[this.tabIndex].loading = false;
        });
    },
    topExecution() {
      this.tabList[this.tabIndex].loading = true;
      const params = {
        userGroup: this.isAdmin ? this.userGroup : this.currentUserGroup.uuid
      };
      topExecution(params)
        .then(res => {
          const data = res.data;
          this.tabList[this.tabIndex].list = data;
        })
        .finally(() => {
          this.tabList[this.tabIndex].loading = false;
        });
    },
    handleClick(tab, event) {
      this.tabIndex = parseInt(tab.index);
      this.getData(tab.index);
    },
    getData(index) {
      switch (index) {
        case '0':
          this.topScan();
          break;
        case '1':
          this.topExecution();
          break;
      }
    },
    handleChange() {
      this.getData(this.tabIndex.toString());
    },
    handleMore() {
      const href = `${this.$locationOrigin}/data-analysis/query?active=historyTab`;
      window.open(href, '_blank');
      // this.$router.push({
      //   name: 'DataQuery',
      //   query: { active: 'historyTab' }
      // });
    },
    handleQuery(item) {
      const href = `${this.$locationOrigin}/data-analysis/query?active=historyTab`;
      window.open(href, '_blank');
      // this.$router.push({
      //   name: 'DataQuery',
      //   query: { uuid: item.uuid }
      // });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped src="./top.scss"></style>
