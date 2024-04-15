<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">产出来源</div>
      </div>
    </div>
    <el-empty v-if="!sourceInfo.taskName" description="No Data" :size="80"></el-empty>
    <div v-else v-loading="loading" class="list-item">
      <p v-if="sourceInfo.taskName">
        <span class="sub-title">任务名称</span>
        <span
          class="sub-text"
        ><a :href="getTaskUrl(sourceInfo)" target="_blank">{{ sourceInfo.taskName }}</a></span>
      </p>
      <p>
        <span class="sub-title">计算资源</span>
        <span v-if="sourceInfo.computingGovTags && sourceInfo.computingGovTags.length" class="sub-text">
          <template v-for="(item, index) in sourceInfo.computingGovTags">
            <el-popover ref="popover" :key="index" placement="bottom" popper-class="tag-popper-tip" width="300" trigger="hover" :content="tagSourceText[item]">
              <el-tag :key="index" slot="reference" :type="tagConfig[item] || ''" effect="plain">{{ item }}</el-tag>
            </el-popover>
          </template>
        </span>
        <span v-else> - </span>
      </p>
    </div>
  </div>
</template>

<script>
import { tableOutputInfo } from '@/api/metadata';

export default {
  name: 'Source',
  data() {
    return {
      query: this.$route.query,
      loading: false,
      sourceInfo: {},
      tagConfig: this.$t('data.tagConfig'),
      tagSourceText: this.$t('data.tagSourceText')
    };
  },
  created() {
    this.tableOutputInfo();
  },
  methods: {
    getTaskUrl(params) {
      return `${this.$locationOrigin}/task/detail?id=${params.taskId}&name=${params.taskName}`;
    },
    getUrl(params) {
      return `${this.$locationOrigin}/lakecat/calculate-platform?id=${params.govJobId}&name=${params.taskName}`;
    },
    tableOutputInfo() {
      this.loading = true;
      const params = {
        databaseName: this.query.databaseName,
        region: this.query.region,
        tableName: this.query.tableName
      };
      tableOutputInfo(params).then(res => {
        this.loading = false;
        const data = res.data;
        if (!data) return;
        this.sourceInfo = data;
      });
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
.list-item {
  p {
    display: flex;
    align-items: center;
    margin: 0 0 8px 10px;
    line-height: 20px;
  }

  .tip {
    line-height: 18px;
    font-size: $global-font-size-12;
    color: #999;
  }

  .sub-title {
    display: inline-block;
    margin-right: 5px;
    flex: 0 0 65px;
  }
  .sub-text {
    flex: 1;
    word-break: break-all;
  }

  ::v-deep {
    .el-tag {
      margin: 0 5px 5px 0;
    }
  }
}
</style>
