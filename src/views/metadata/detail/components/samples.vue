<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">数据样本</div>
      </div>
      <div class="tool-rh">
        <span class="tip"><a :href="getUrl()" target="_blank">>>数据查询</a></span>
      </div>
    </div>
    <el-table v-loading="loading" :data="preview" class="table-box" stripe>
      <el-table-column v-for="(value, key) in preview[0]" :key="key" :prop="key" :label="key" min-width="120">
        <template slot-scope="scope">
          <el-tooltip :content="`${scope.row[key]}`" :disabled="isTipDisabled">
            <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row[key] || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getData } from '@/api/metadata';
export default {
  name: 'Preview',
  data() {
    return {
      query: this.$route.query,
      loading: false,
      isTipDisabled: false,
      preview: []
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getUrl() {
      return `${this.$locationOrigin}/data-analysis/query`;
    },
    getData() {
      this.loading = true;
      const params = {
        region: this.query.region,
        table: `${this.query.databaseName}.${this.query.tableName}`
      };
      getData(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (!Array.isArray(data) || !data.length) return;
        this.preview = data;
      });
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
.tool {
  .tip {
    font-size: $global-font-size-12;
    float: right;
    color: #999;
  }
}
</style>
