<template>
  <div class="version-list">
    <el-table :data="data" border style="width: 100%">
      <el-table-column prop="displayVersion" label="版本" align="center"></el-table-column>
      <el-table-column prop="region" label="区域" align="center">
        <template slot-scope="scope">
          {{ formatRegion(scope.row.region) }}
        </template>
      </el-table-column>
      <el-table-column prop="displayFileSize" label="大小" align="center"></el-table-column>
      <el-table-column prop="description" :label="$t('common.description')" align="center"> </el-table-column>
      <el-table-column prop="updateTime" :label="$t('common.updateTime')" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime | dataTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.modeCode == 'ONLINE'" type="primary" @click="review(scope.row.id)">预览</el-button>
          <el-button v-else type="primary" :icon="scope.row.downloading ? 'el-icon-loading' : 'el-icon-download'" @click="download(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :total="total" :current-page="params.pageNum" :page-size="params.pageSize" :page-sizes="[10, 20, 30, 50, 100]" layout="->, total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
  </div>
</template>

<script>
import { getArtifactVersionPage, downloadArtifactVersion } from '@/api/artifact.js';
import * as tools from '@/utils/tools';

export default {
  data() {
    return {
      params: {
        artifactId: '',
        pageNum: 1,
        pageSize: 10
      },
      data: [],
      total: 0,
      regionList: tools.regionList
    };
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.params.artifactId = this.$route.query.id;
    this.getVersionPage();
  },
  methods: {
    formatRegion(value) {
      const obj = this.regionList.find(item => item.value === value);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getVersionPage();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getVersionPage();
    },
    getVersionPage() {
      getArtifactVersionPage(this.params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
      });
    },
    download(row) {
      const url = process.env.VUE_APP_API_GATEWAY_PATH + `ds_task/artifactversion/download?artifactVersionId=${row.id}&tenantId=${this.$store.getters.userInfo.tenantId}`;
      window.location.href = url;
      return;
      // this.$set(row, 'downloading', true);
      // downloadArtifactVersion(row.id).finally(() => {
      //   row.downloading = false;
      // });
    },
    review(id) {
      this.$router.push({
        path: '/task/artifact/detail',
        query: {
          versionId: id
        }
      });
    }
  }
};
</script>
