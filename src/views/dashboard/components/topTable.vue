<template>
  <el-card class="dashboard-card table-module">
    <el-button type="text" class="tool" @click="handleMore">查看更多</el-button>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <template v-for="(item, index) in tabList">
        <el-tab-pane :key="index" v-loading="item.loading" :label="item.text" :name="item.name">
          <div class="table-list table-title">
            <div class="table-name">表名称</div>
            <div class="table-owner">创建者</div>
            <div class="table-visite-times">访问次数</div>
            <div class="table-icon table-title-icon"></div>
          </div>
          <el-empty v-if="!item.list.length && !item.loading" description="无访问表数据"></el-empty>
          <template v-for="(subItem, subIndex) in item.list" v-else>
            <div v-if="subIndex < 10" :key="subIndex" class="table-list">
              <div class="table-name cell-ellipsis">{{ subItem.name }}</div>
              <div class="table-owner">{{ subItem.owner }}</div>
              <div class="table-visite-times">
                <el-tag effect="dark" type="success">{{ subItem.num }}</el-tag>
              </div>
              <div class="table-icon" @click="handleDetail(subItem)"></div>
            </div>
            <el-divider v-if="subIndex < 10 && subIndex !== item.list.length - 1" :key="`${index}_${subIndex}_divider`"></el-divider>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
  </el-card>
</template>

<script>
import { topTable } from '@/api/dashboard';
export default {
  name: 'TopTable',
  data() {
    return {
      activeName: 'first',
      tabIndex: 0,
      tabList: [
        {
          name: 'first',
          tabIndex: 0,
          loading: false,
          text: '我的高频访问 Top10',
          list: []
        },
        {
          name: 'second',
          tabIndex: 0,
          loading: false,
          text: '全局高频访问 Top10',
          list: []
        },
        {
          name: 'third',
          tabIndex: 0,
          loading: false,
          text: '我的表被高频访问 Top10',
          list: []
        }
      ]
    };
  },
  created() {
    this.topTable();
  },
  methods: {
    topTable() {
      this.tabList[this.tabIndex].loading = true;
      topTable({ type: this.tabIndex + 1 })
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
      this.topTable();
    },
    handleMore() {
      const href = `${this.$locationOrigin}/meta/list`;
      window.open(href, '_blank');
    },
    handleDetail(item) {
      const href = `${this.$locationOrigin}/meta/detail?id=${item.id}&region=${item.region}&databaseName=${item.dbName}&tableName=${item.name}`;
      window.open(href, '_blank');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped src="./top.scss"></style>
