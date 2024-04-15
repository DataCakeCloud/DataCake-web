<template>
  <el-dialog :title="operation === 'turnoff' ? '下线提示' : '删除提示'" :visible.sync="dialogVisible" width="700px">
    <div v-loading="loading">
      <template v-if="tableData.length">
        <div class="mb10">您确认要{{ operation === 'turnoff' ? '下线' : '删除' }}该工作流吗？以下是该工作流下的任务正在被依赖的信息：</div>
        <el-table :data="tableData" stripe border class="custom-table" :cell-style="{ padding: '10px 0' }" style="width: 100%">
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
      </template>
      <div v-else>您确认要{{ operation === 'turnoff' ? '下线' : '删除' }}该工作流吗？</div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { turnOffWorkflow, deleteWorkflow, getDowntasks } from '@/api/flow';

export default {
  name: 'WinDelTip',
  data() {
    return {
      dialogVisible: false,
      operation: '', // turnoff 下线，del 删除
      loading: false,
      tableData: [],
      notify: true,
      data: {},
      btnDisabled: false
    };
  },
  methods: {
    showWin(row, operation) {
      this.dialogVisible = true;
      this.operation = operation;
      this.data = row;
      this.loading = true;
      getDowntasks({
        workflowId: row.id
      }).then(res => {
        const data = res.data;
        this.tableData = data;
        if (this.tableData.length === 0) {
          this.notify = false;
        }
        this.loading = false;
      });
    },
    save() {
      this.btnDisabled = true;
      let action;
      if (this.operation === 'turnoff') {
        action = turnOffWorkflow({
          workflowId: this.data.id,
          // workflowVersionId: this.data.workflowVersionId,
          notify: this.notify
        });
      } else if (this.operation === 'del') {
        action = deleteWorkflow({
          workflowId: this.data.id,
          notify: this.notify
        });
      }
      action
        .then(res => {
          this.$message.success('操作成功');
          this.$emit('save');
          this.dialogVisible = false;
        })
        .finally(() => {
          this.btnDisabled = false;
        });
    }
  }
};
</script>
