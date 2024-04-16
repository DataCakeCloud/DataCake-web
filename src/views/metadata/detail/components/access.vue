<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">访问信息</div>
      </div>
    </div>
    <el-table v-loading="loading" :data="visiteList" class="table-box" stripe>
      <el-table-column v-for="(item, key) in columnData" :key="key" :prop="item.prop" :label="item.label" :min-width="item.width">
        <template slot-scope="scope">
          <el-tooltip :content="`${item.format ? item.format(scope.row) : scope.row[item.prop]}`" :disabled="isTipDisabled">
            <span class="ellipsis block" @mouseenter="isShowTooltip">{{ item.format ? item.format(scope.row) : scope.row[item.prop] || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { tableProfileInfo } from '@/api/metadata';

export default {
  name: 'Access',
  data() {
    return {
      columnData: [
        {
          prop: 'userId',
          label: '访问用户',
          width: '130'
        },
        {
          prop: 'sumCount',
          label: '访问次数',
          width: '130'
        },
        {
          prop: 'recentlyVisitedTimestamp',
          label: '最近访问时间',
          width: '150',
          format: row => {
            return this.$utils.parseTime(row.recentlyVisitedTimestamp);
          }
        }
      ],
      visiteList: [],
      loading: false,
      query: this.$route.query,
      isTipDisabled: true
    };
  },
  created() {
    this.tableProfileInfo();
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    tableProfileInfo() {
      this.loading = true;
      const params = {
        databaseName: this.query.databaseName,
        region: this.query.region,
        tableName: this.query.tableName,
        recentlyDays: 50
      };
      tableProfileInfo(params)
        .then(res => {
          const data = res.data;
          if (!Array.isArray(data) || !data.length) return;
          this.visiteList = data;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
</style>
