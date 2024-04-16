<template>
  <el-drawer :visible.sync="drawer" :append-to-body="true" direction="rtl" :show-close="false" size="800">
    <div slot="title" class="title">
      版本信息
      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
        记录所保存的历史版本信息，以及针对任务所进行的上/下线、补数/重算这类操作信息
        <i slot="reference" class="el-icon-info"></i>
      </el-popover>
    </div>
    <div style="margin-bottom: 10px; padding-left: 20px">
      操作类型:
      <el-select v-model="params.eventCode" size="mini" style="width: 125px; margin-left: 10px" clearable placeholder="请选择" @change="handleCurrentChange(1)">
        <el-option v-for="item in eventCodeList" :key="item" :label="item" :value="item"> </el-option>
      </el-select>
    </div>
    <el-table v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }">
      <el-table-column prop="eventVersion" label="版本号" min-width="100" align="center">
        <template slot-scope="scope">
          <el-tooltip v-if="scope.row.eventVersion" content="跳转到当前版本的编辑页面" :open-delay="200" popper-class="tag-popper">
            <a class="link" @click="edit(scope.row.eventVersion)">V{{ scope.row.eventVersion }}{{ scope.row.currentVersion ? `-当前版本` : '' }}</a>
          </el-tooltip>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" min-width="140">
        <template slot-scope="scope">{{ $utils.parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="eventCode" label="操作类型" min-width="100"></el-table-column>
      <el-table-column prop="createBy" label="操作人" min-width="100"></el-table-column>
      <el-table-column prop="eventMessage" label="描述" min-width="200"></el-table-column>
      <el-table-column label="操作" min-width="80">
        <template slot-scope="scope">
          <el-button v-if="scope.row.eventVersion" :disabled="scope.row.currentVersion" type="text" size="mini" @click="switchVer(scope.row)">切换</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      :total="total"
      :current-page="params.pageNum"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="params.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-bottom: 15px"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </el-drawer>
</template>
<script>
import { getVersion, switchVersion, getEventCode } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  name: 'WinVersionList',
  data() {
    return {
      drawer: false,
      templateCode: '',
      loading: false,
      tableData: [],
      total: 0,
      eventCodeList: [],
      params: {
        eventCode: '',
        eventId: '',
        pageNum: 1,
        pageSize: 20,
        module: 'task'
      }
    };
  },
  methods: {
    showWin(row) {
      this.drawer = true;
      this.templateCode = row.templateCode;
      this.params.eventId = row.id;
      this.params.pageNum = 1;
      this.params.pageSize = 20;
      // this.params.module = JSON.parse(row.runtimeConfig).source || 'task';
      this.getList();
      this.getEventCodeList();
    },
    getList() {
      this.loading = true;
      getVersion(this.params).then(res => {
        this.loading = false;
        const data = res.data;
        this.total = data.total;
        this.tableData = data.list;
      });
    },
    getEventCodeList() {
      getEventCode().then(res => {
        this.eventCodeList = res.data;
      });
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getList();
    },
    switchVer(row) {
      this.$confirm(`确定切换为当前版本?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          switchVersion({
            taskId: this.params.eventId,
            version: row.eventVersion
          }).then(data => {
            this.$message({
              type: 'success',
              message: '切换成功'
            });
            this.getList();
          });
        })
        .catch(() => {});
    },
    edit(version) {
      const path = tools.taskCodeToPath[this.templateCode];
      const href = this.$router.resolve({
        path: `/task/${path}`,
        query: {
          id: this.params.eventId,
          version: version
        }
      }).href;
      window.open(href, '_blank');
    }
  }
};
</script>
<style lang="scss" scoped>
.title {
  font-size: $global-font-size-16;
  color: #333;
  .el-icon-info {
    font-size: $global-font-size-14;
    color: #409eff;
  }
}
</style>
