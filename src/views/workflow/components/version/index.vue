<template>
  <el-drawer :visible.sync="drawer" :append-to-body="true" direction="rtl" :show-close="false" size="800">
    <div slot="title" class="title">
      版本信息
      <!-- <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
        记录所保存的历史版本信息，以及针对任务所进行的上/下线、补数/重算这类操作信息
        <i slot="reference" class="el-icon-info"></i>
      </el-popover> -->
    </div>
    <el-table v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }">
      <el-table-column prop="version" label="版本号" min-width="100">
        <template slot-scope="scope">
          <el-tooltip v-if="scope.row.version" content="跳转到当前版本的编辑页面" :open-delay="200" popper-class="tag-popper">
            <a class="link" @click="edit(scope.row)">v{{ scope.row.version }}{{ scope.row.isCurrentVersion ? `-当前版本` : '' }}</a>
          </el-tooltip>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="140">
        <template slot-scope="scope">{{ $utils.parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.name" placement="top" :disabled="isTipDisabled">
            <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.description || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="80">
        <template slot-scope="scope">
          <el-button :disabled="scope.row.isCurrentVersion" type="text" size="mini" @click="switchVer(scope.row)">切换</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      :total="total"
      :current-page="params.pageNo"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="params.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-bottom: 15px"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
    <el-dialog title="切换版本提示" :visible.sync="dialogVisible" width="700px" append-to-body>
      <div class="mb10">您确认要切换至该工作流版本吗？以下是缺少的任务正在被依赖的信息：</div>
      <el-table v-loading="loading" :data="relyData" stripe border class="custom-table" :cell-style="{ padding: '10px 0' }" style="width: 100%">
        <el-table-column prop="curTaskName" label="任务名称" min-width="150"></el-table-column>
        <el-table-column prop="downTaskName" label="下游任务" min-width="150"></el-table-column>
        <el-table-column prop="downTaskOwner" label="下游任务owner" min-width="100"></el-table-column>
      </el-table>
      <div class="mt10">
        <span>通知下游任务owner：</span>
        <el-radio-group v-model="notify">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
      </span>
    </el-dialog>
  </el-drawer>
</template>
<script>
import { getWorkflowVersion, turnOnWorkflow, getDelTasks } from '@/api/flow';
// import * as tools from '@/utils/tools';

export default {
  name: 'WorkflowVersionList',
  data() {
    return {
      drawer: false,
      //   templateCode: '',
      loading: false,
      tableData: [],
      total: 0,
      params: {
        workflowId: '',
        pageNo: 1,
        pageSize: 20
      },
      isTipDisabled: false,
      currentStatus: 0,
      currentTaskIds: [],
      dialogVisible: false,
      deleteLoading: false,
      relyData: [],
      notify: true,
      rowData: {},
      btnDisabled: false
    };
  },
  methods: {
    showWin(row) {
      this.drawer = true;
      this.currentStatus = row.status;
      this.currentTaskIds = row.taskIds;
      this.params.workflowId = row.id;
      this.params.pageNo = 1;
      this.params.pageSize = 20;
      this.getList();
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    getList() {
      this.loading = true;
      getWorkflowVersion(this.params).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.total;
        this.tableData = data.list;
      });
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNo = 1;
      this.getList();
    },
    showDeleteDialog(removeTaskIds) {
      this.dialogVisible = true;
      this.deleteLoading = true;
      getDelTasks({
        taskIds: removeTaskIds.join(',')
      }).then(res => {
        const data = res.data;
        this.relyData = data;
        if (this.relyData.length === 0) {
          this.notify = false;
        }
        this.deleteLoading = false;
      });
    },
    save() {
      this.btnDisabled = true;
      turnOnWorkflow({
        workflowId: this.rowData.workflowId,
        workflowVersionId: this.rowData.workflowVersionId,
        notify: this.notify
      })
        .then(res => {
          this.$message({
            type: 'success',
            message: '切换成功'
          });
          this.drawer = false;
          this.dialogVisible = false;
          this.getList();
          this.$emit('save');
        })
        .finally(() => {
          this.btnDisabled = false;
        });
    },
    switchVer(row) {
      const lackTaskIds = [];
      this.currentTaskIds.forEach(item => {
        if (!row.taskIds.includes(item)) {
          lackTaskIds.push(item);
        }
      });
      // 只有当前工作流处于上线状态，并且切换的版本比当前运行的版本任务少了，才弹窗提示是否通知
      if (this.currentStatus === 1 && lackTaskIds.length) {
        this.showDeleteDialog(lackTaskIds);
        this.rowData = row;
      } else {
        this.$confirm(`确定切换为当前版本?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            // switchVersion({
            turnOnWorkflow({
              workflowId: row.workflowId,
              version: row.version,
              notify: false
            }).then(res => {
              this.$message({
                type: 'success',
                message: '切换成功'
              });
              this.drawer = false;
              this.getList();
              this.$emit('save');
            });
          })
          .catch(() => {});
      }
    },
    edit(row) {
      const href = this.$router.resolve({
        path: '/workflow/add',
        query: { id: row.workflowId, version: row.version }
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
