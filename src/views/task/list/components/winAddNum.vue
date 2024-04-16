<template>
  <el-dialog :title="$t('task.taskList15')" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" v-loading="formLoading" :model="ruleForm" :rules="rules" label-width="130px">
      <el-form-item :label="$t('task.taskList2')">
        <span>{{ taskName }}</span>
      </el-form-item>
      <el-form-item :label="$t('task.duringTime')" prop="timeRange">
        <el-date-picker
          :key="dateKey"
          v-model="ruleForm.timeRange"
          class="dialog-select"
          :popper-class="valueFormat === 'yyyy-MM-dd HH' ? 'time-hour' : ''"
          :type="dateType"
          :range-separator="$t('task.to')"
          :start-placeholder="$t('task.startTime')"
          :end-placeholder="$t('task.endTime')"
          :value-format="valueFormat"
          :format="valueFormat"
          :picker-options="pickerOptions"
          :default-time="['00:00:00', '23:59:59']"
          @change="changeDate"
        ></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('task.taskList32')" prop="type">
        <el-select v-model="ruleForm.type" class="dialog-select" placeholder="请选择补数方式">
          <el-option :label="$t('task.taskList33')" :value="1"></el-option>
          <el-option :label="$t('task.taskList34')" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="检查上游依赖" required>
        <el-radio-group v-model="ruleForm.isCheckDependency" class="dialog-select">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
        <el-popover placement="bottom" trigger="hover" popper-class="tag-popper" width="220">
          <div>默认打开检查上游，此时如果上游任务没有全部就绪，那么不会调起补数任务；如果需要无视上游补数，例如重刷历史数据、启动新上线任务等场景，关闭检查上游后补数。</div>
          <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff; position: relative; left: -225px"></i>
        </el-popover>
      </el-form-item>
      <el-form-item v-if="ruleForm.type === 2" :label="$t('task.taskList35')" prop="childIds">
        <!-- <el-cascader v-model="ruleForm.childIds" class="dialog-select" :options="childDepsList" :props="defaultProps" placeholder="请选择下游依赖"></el-cascader> -->
        <el-tree-select ref="treeSelect" v-model="ruleForm.childIds" :placeholder="$t('task.taskList37')" class="dialog-select" :styles="{ width: '100%' }" style="display: inline-block" :tree-params="treeParams" :select-params="selectParams" @check="checkChange"></el-tree-select>
        <el-checkbox v-model="allChecked" @change="changeAllCheck">{{ $t('task.taskList36') }}</el-checkbox>
        <el-popover placement="bottom" trigger="hover" popper-class="tag-popper">
          <div>{{ $t('task.taskList38') }}</div>
          <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
        </el-popover>
      </el-form-item>
      <el-form-item :label="$t('task.taskList39')" required>
        <el-radio-group v-model="ruleForm.isSendNotify" class="dialog-select">
          <el-radio :label="true">{{ $t('task.taskTrue') }}</el-radio>
          <el-radio :label="false">{{ $t('task.taskFalse') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="showTip" class="show-tip">
        <i class="el-icon-info"></i>
        <span> 过去半年的实例已经被归档，对于补数任务，您现在有选择不再检查上游的选项。如果在使用深度补数时，下游任务遇到无法成功检查的问题，请随时联系管理员，我们将协助您恢复部分已经归档的数据。 </span>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('task.taskCancel') }}</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">{{ $t('task.taskOk') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getChildDependencies, backfill, getDatasetInfo } from '@/api/task';
import { parseTime } from '@/utils';
export default {
  name: 'WinAddNum',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      showTip: false,
      ruleForm: {
        timeRange: [],
        type: 1,
        childIds: [],
        isCheckDependency: true,
        isSendNotify: true
      },
      rules: {
        timeRange: [{ required: true, message: this.$t('task.taskList40'), trigger: 'change' }],
        type: [{ required: true, message: this.$t('task.taskList41'), trigger: 'change' }],
        childIds: [{ required: true, message: this.$t('task.taskList42'), trigger: 'change' }]
      },
      dateKey: 0,
      dateType: 'datetimerange',
      valueFormat: 'yyyy-MM-dd HH:mm:ss',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        }
      },
      childDepsList: [],
      defaultProps: {
        value: 'id',
        label: 'name'
      },
      treeParams: {
        'expand-on-click-node': false,
        'check-on-click-node': true,
        // 'filterable': true,
        'check-strictly': true,
        'node-key': 'id',
        data: [],
        props: {
          children: 'children',
          label: 'name',
          value: 'id'
          // disabled: (data, node) => {
          //   return !data.isCurrent;
          // }
          // disabled: 'disabled'
        }
      },
      selectParams: {
        'collapse-tags': true,
        placeholder: '请选择下游依赖'
      },
      allChecked: false,
      currentId: '',
      taskName: '',
      btnDisabled: false
    };
  },
  methods: {
    init(outputGuids) {
      this.formLoading = true;
      // 获取下游依赖数据
      getChildDependencies(this.currentId).then(res => {
        const data = res.data;
        this.treeParams.data = this.filterData([data]);
      });
      // 获取该任务的粒度
      getDatasetInfo({
        // type: '',
        // region: '',
        // source: '',
        // db: '',
        // tbl: '',
        // qualifyname: outputGuids,
        taskId: this.currentId
      })
        .then(res => {
          const data = res.data;
          if (data) {
            if (data.granularity === 'hourly') {
              this.dateType = 'datetimerange';
              this.valueFormat = 'yyyy-MM-dd HH';
            } else if (data.granularity === 'minutely') {
              this.dateType = 'datetimerange';
              this.valueFormat = 'yyyy-MM-dd HH:mm';
            } else if (data.granularity === 'monthly') {
              this.dateType = 'monthrange';
              this.valueFormat = 'yyyy-MM';
            } else {
              this.dateType = 'daterange';
              this.valueFormat = 'yyyy-MM-dd';
            }
          }
        })
        .finally(() => {
          this.formLoading = false;
        });
    },
    changeDate(val) {
      const startTime = Date.parse(val[0].replace(/-/g, '/'));
      const endTime = Date.parse(val[1].replace(/-/g, '/'));
      const tagTime = new Date().getTime() - 183 * 24 * 60 * 60 * 1000;
      if (startTime < tagTime || endTime < tagTime) {
        this.showTip = true;
      }
    },
    filterData(data) {
      data.forEach(item => {
        // item.disabled = !item.isCurrent;
        if (item.children && item.children.length > 0) {
          this.filterData(item.children);
        } else {
          item.children = undefined;
        }
      });
      return data;
    },
    showWin(row) {
      this.currentId = row.id;
      this.taskName = row.name;
      this.init(row.outputGuids);
      this.dialogVisible = true;
      this.btnDisabled = false;
      this.showTip = false;
      this.dateKey++;
    },
    checkChange(data, treeStatus) {
      const selected = treeStatus.checkedKeys.indexOf(data.id);
      if (selected !== -1) {
        // 如果选中，则所有父节点全部选中
        this.selectedParent(data);
      } else {
        // 如果取消选中，则所有子节点都取消选中
        if (data.children && data.children.length) {
          this.cancelSelectedChild(data.children);
        }
      }
    },
    selectedParent(data) {
      const node = this.$refs.treeSelect.$refs.tree.getNode(data);
      if (node.parent.key !== undefined) {
        this.$refs.treeSelect.$refs.tree.setChecked(node.parent, true);
        this.$refs.treeSelect.ids = this.$refs.treeSelect.$refs.tree.getCheckedKeys();
        this.selectedParent(node.parent);
      }
    },
    cancelSelectedChild(list) {
      list.forEach(item => {
        this.$refs.treeSelect.$refs.tree.setChecked(item, false);
        this.$refs.treeSelect.ids = this.$refs.treeSelect.$refs.tree.getCheckedKeys();
        if (item.children && item.children.length) {
          this.cancelSelectedChild(item.children);
        }
      });
    },
    changeAllCheck(value) {
      if (value) {
        this.setAllCheck(this.treeParams.data);
        this.ruleForm.childIds = this.$refs.treeSelect.$refs.tree.getCheckedKeys();
      } else {
        this.$refs.treeSelect.$refs.tree.setCheckedKeys([]);
        this.$refs.treeSelect.ids = [];
        this.ruleForm.childIds = [];
      }
    },
    setAllCheck(data) {
      data.forEach(item => {
        // if (item.isCurrent) {
        this.$refs.treeSelect.$refs.tree.setChecked(item, true);
        this.$refs.treeSelect.ids = this.$refs.treeSelect.$refs.tree.getCheckedKeys();
        if (item.children && item.children.length > 0) {
          this.setAllCheck(item.children);
        }
        // }
      });
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
      this.allChecked = false;
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          this.dateFormat();
          backfill({
            id: this.currentId,
            startDate: this.ruleForm.timeRange[0],
            endDate: this.ruleForm.timeRange[1],
            childIds: this.ruleForm.childIds.join(','),
            isCheckDependency: this.ruleForm.isCheckDependency,
            isSendNotify: this.ruleForm.isSendNotify
          })
            .then(data => {
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
.show-tip {
  padding-left: 25px;
  color: #e6a23c;
  display: flex;
  span {
    margin-left: 5px;
  }
}
</style>
