<template>
  <el-dialog title="补数" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" v-loading="formLoading" :model="ruleForm" :rules="rules" label-width="120px">
      <el-form-item label="工作流名称">
        <span>{{ taskName }}</span>
      </el-form-item>
      <el-form-item label="起止时间" prop="timeRange">
        <el-date-picker
          :key="dateKey"
          v-model="ruleForm.timeRange"
          class="dialog-select"
          :popper-class="valueFormat === 'yyyy-MM-dd HH' ? 'time-hour' : ''"
          :type="dateType"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :value-format="valueFormat"
          :format="valueFormat"
          :picker-options="pickerOptions"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { backfill } from '@/api/flow';

export default {
  name: 'WinAddNum',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      ruleForm: {
        timeRange: []
      },
      rules: {
        timeRange: [{ required: true, message: '请选择起止时间', trigger: 'change' }]
      },
      dateKey: 0,
      dateType: 'datetimerange',
      valueFormat: 'yyyy-MM-dd HH:mm:ss',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        }
      },
      currentId: '',
      taskName: '',
      btnDisabled: false
    };
  },
  methods: {
    showWin(row) {
      this.currentId = row.id;
      this.taskName = row.name;
      this.dialogVisible = true;
      this.btnDisabled = false;
      this.dateKey++;
      if (row.granularity === 'hourly') {
        this.dateType = 'datetimerange';
        this.valueFormat = 'yyyy-MM-dd HH';
      } else if (row.granularity === 'minutely') {
        this.dateType = 'datetimerange';
        this.valueFormat = 'yyyy-MM-dd HH:mm';
      } else if (row.granularity === 'monthly') {
        this.dateType = 'monthrange';
        this.valueFormat = 'yyyy-MM';
      } else {
        this.dateType = 'daterange';
        this.valueFormat = 'yyyy-MM-dd';
      }
    },
    dateFormat() {
      if (this.valueFormat === 'yyyy-MM-dd HH:mm') {
        this.ruleForm.timeRange[0] += ':00';
        this.ruleForm.timeRange[1] += ':59';
      } else if (this.valueFormat === 'yyyy-MM-dd HH') {
        this.ruleForm.timeRange[0] += ':00:00';
        this.ruleForm.timeRange[1] += ':59:59';
      } else if (this.valueFormat === 'yyyy-MM-dd') {
        this.ruleForm.timeRange[0] += ' 00:00:00';
        this.ruleForm.timeRange[1] += ' 23:59:59';
      } else if (this.valueFormat === 'yyyy-MM') {
        const arr = this.ruleForm.timeRange[1].split('-');
        const day = new Date(arr[0], arr[1], 0).getDate();
        this.ruleForm.timeRange[0] += '-01 00:00:00';
        this.ruleForm.timeRange[1] += `-${day} 23:59:59`;
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          this.dateFormat();
          backfill({
            workflowID: this.currentId,
            startDate: this.ruleForm.timeRange[0],
            endDate: this.ruleForm.timeRange[1]
          })
            .then(res => {
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: '操作成功'
              });
              this.$emit('save');
              // this.$parent.getTaskListByPage();
            })
            .finally(() => {
              this.btnDisabled = false;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-select {
  width: 350px;
}
.other-param {
  position: relative;
  ::v-deep .el-popover__reference-wrapper {
    position: absolute;
    left: -90px;
  }
}
.custom-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 0;
  }
}
</style>
