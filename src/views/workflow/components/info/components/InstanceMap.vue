<template>
  <div class="instance-map">
    <div class="search_top">
      <!-- <div class="type">
        <el-tooltip effect="dark" content="刷新" placement="top">
          <span class="el-icon-refresh" @click="getData"></span>
        </el-tooltip>
        <span class="inner"><i />内部数据</span>
        <span class="outer"><i />外部数据</span>
      </div> -->
      <div class="legend">
        <btns v-for="item in btnsOptions" :key="item.text" :info="item" />
      </div>
    </div>
    <histogram v-if="analysisData && analysisData.tree" ref="histogram" v-loading="loading" :data="analysisData" @click-item="handelItem" />
    <el-empty v-else v-loading="loading" description="暂无数据"></el-empty>
    <!-- 停止 -->
    <el-dialog title="停止" :visible.sync="dialogVisible" :close-on-click-modal="false" width="30%">
      <el-form :model="form" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="成功" :value="1"></el-option>
            <el-option label="失败" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
    <!-- sql预览 -->
    <el-dialog :title="`SQL预览-V${version}`" :visible.sync="dialogVisibleSql" :close-on-click-modal="false" width="800px">
      <div class="monaco-editor-wrap">
        <monaco-editor ref="monaco" v-model="content" v-loading="sqlLoading" :read-only="true"></monaco-editor>
      </div>
    </el-dialog>
    <!-- 补数 -->
    <el-dialog title="补数" :visible.sync="dialogVisibleAddNum" width="600px" class="custom-dialog" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="ruleForm" v-loading="formLoading" :model="ruleForm" :rules="rules" label-width="120px">
        <el-form-item label="任务名称">
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
        <el-form-item label="补数方式" prop="type">
          <el-select v-model="ruleForm.type" class="dialog-select" placeholder="请选择补数方式">
            <el-option label="普通" :value="1"></el-option>
            <el-option label="深度" :value="2"></el-option>
          </el-select>
          <el-popover placement="bottom" trigger="hover" popper-class="tag-popper">
            <div>普通补数：只对当前任务的历史实例进行补数；</div>
            <div>深度补数：可选择当前任务的直接下游任务进行补数；</div>
            <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
          </el-popover>
        </el-form-item>
        <el-form-item v-if="ruleForm.type === 2" label="下游选择" prop="childIds">
          <el-tree-select ref="treeSelect" v-model="ruleForm.childIds" placeholder="请选择下游依赖" class="dialog-select" :styles="{ width: '100%' }" style="display: inline-block" :tree-params="treeParams" :select-params="selectParams" @check="checkChange"></el-tree-select>
          <el-checkbox v-model="allChecked" @change="changeAllCheck">全选</el-checkbox>
          <el-popover placement="bottom" trigger="hover" popper-class="tag-popper">
            <div>只能选择下游任务负责人为自己的任务</div>
            <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
          </el-popover>
        </el-form-item>
        <!-- <el-form-item label="通知下游负责人" required>
          <el-radio-group v-model="ruleForm.isSendNotify" class="dialog-select">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleAddNum = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="saveNum">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import btns from './btns';
import histogram from './histogram';
import { getExeSql, getLogsUi, stopTaskInstace } from '@/api/taskDetail';
import { getGridChart, clearTask } from '@/api/flow';
import MonacoEditor from '@/components/MonacoEditor/index';
import { getChildDependencies, backfill } from '@/api/task';

export default {
  name: 'InstanceMap',
  components: {
    btns,
    histogram,
    MonacoEditor
  },
  props: {
    date: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false,
      btnsOptions: [
        { text: '检查上游', color: '#d7bdf2' },
        { text: '排队中', color: '#87e0f0' },
        { text: '运行中', color: '#5b70e4' },
        { text: '成功', color: '#67c23a' },
        { text: '失败', color: '#f10d15' }
      ],
      analysisData: {},
      startDate: '',
      endDate: '',
      content: '',
      version: '',
      sqlLoading: false,
      dialogVisibleSql: false,
      dialogVisible: false,
      form: {
        flinkUrl: '',
        status: 1
      },
      taskItem: {},
      mapStatus: 1,
      stopData: {},
      isCheckUpstream: true,
      dialogVisibleAddNum: false,
      formLoading: false,
      ruleForm: {
        timeRange: [],
        type: 1,
        childIds: [],
        isCheckDependency: true,
        isSendNotify: false
      },
      rules: {
        timeRange: [{ required: true, message: '请选择起止时间', trigger: 'change' }],
        type: [{ required: true, message: '请选择补数方式', trigger: 'change' }],
        childIds: [{ required: true, message: '请选择下游选择', trigger: 'change' }]
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
  watch: {
    date(value) {
      this.startDate = value ? value[0] : '';
      this.endDate = value ? value[1] : '';
      this.getData();
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getData();
    },
    getData() {
      this.loading = true;
      this.analysisData = {};
      const params = {
        workflowID: this.$route.query.id,
        version: this.$route.query.version,
        // version: 1,
        startDate: this.startDate,
        endDate: this.endDate
      };
      getGridChart(params)
        .then(res => {
          const data = res.data;
          this.analysisData = data;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    save() {
      const data = {
        name: this.stopData.taskName,
        executionDate: this.$utils.parseTime(this.stopData.executionDate, '{y}-{m}-{d} {h}:{i}:{s}'),
        ...this.form
      };
      stopTaskInstace(data).then(res => {
        this.dialogVisible = false;
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        this.getData();
      });
    },
    // 查看日志
    getLogs(data) {
      getLogsUi({
        id: data.taskID,
        executionDate: this.$utils.parseTime(data.executionDate, '{y}-{m}-{d} {h}:{i}:{s}')
      }).then(res => {
        const data = res.data;
        const logs = data;
        window.open(logs);
      });
    },
    // sql预览
    getSql(row) {
      this.dialogVisibleSql = true;
      this.version = row.version;
      this.sqlLoading = true;
      getExeSql({
        taskId: row.taskID,
        executionDate: this.$utils.parseTime(row.executionDate, '{y}-{m}-{d} {h}:{i}:{s}'),
        version: row.version
      })
        .then(res => {
          const data = res.data;
          if (data) {
            this.content = data;
            this.$refs.monaco.setCode(this.content);
          }
        })
        .finally(() => {
          this.sqlLoading = false;
        });
    },
    // 停止
    stop(data) {
      this.stopData = data;
      this.dialogVisible = true;
    },
    // 重算
    repeatCalc(row) {
      this.$confirm('确定重算?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.saveClear(row);
        })
        .catch(() => {});
    },
    saveClear(data) {
      const params = {
        workflowID: this.$route.query.id,
        executionDate: this.$utils.parseTime(data.executionDate, '{y}-{m}-{d} {h}:{i}:{s}'),
        tasks: [{ taskName: data.taskName, taskID: data.taskID }]
      };
      clearTask(params).then(res => {
        this.$message.success('重算成功');
        this.getData();
      });
    },
    addNum(data) {
      this.currentId = data.taskID;
      this.taskName = data.taskName;
      this.getDep();
      if (data.granularity) {
        this.getDateType(data.granularity);
      }
      this.dialogVisibleAddNum = true;
      this.btnDisabled = false;
      this.dateKey++;
    },
    getDep() {
      this.formLoading = true;
      // 获取下游依赖数据
      getChildDependencies(this.currentId)
        .then(res => {
          const data = res.data;
          this.treeParams.data = this.filterData([data]);
        })
        .finally(() => {
          this.formLoading = false;
        });
    },
    getDateType(data) {
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
    saveNum() {
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
              this.dialogVisibleAddNum = false;
              this.$message({
                type: 'success',
                message: '操作成功'
              });
              this.getData();
            })
            .finally(() => {
              this.btnDisabled = false;
            });
        }
      });
    },
    handelItem(type, data, mapStatus) {
      this.taskItem = data;
      this.mapStatus = mapStatus;
      switch (type) {
        case 'repeatCalc':
          this.repeatCalc(data);
          break;
        case 'stop':
          if (data.flink_url) {
            this.form.flinkUrl = data.flink_url;
          } else {
            this.form.flinkUrl = '';
          }
          this.stop(data);
          break;
        case 'getSql':
          this.getSql(data);
          break;
        case 'getLogs':
          this.getLogs(data);
          break;
        case 'addNum':
          this.addNum(data);
          break;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.instance-map {
  .search_top {
    padding: 0 0 20px 20px;
    text-align: center;
    .legend {
      display: inline-block;
      span {
        &:not(:first-child) {
          margin-left: 15px;
        }
      }
    }
    .type {
      display: flex;
      position: absolute;
      span {
        display: flex;
        align-items: center;
        &:not(:first-child) {
          margin-left: 15px;
        }
      }
      i {
        display: inline-block;
        width: 22px;
        height: 22px;
        border: 2px solid #555;
        border-radius: 50%;
        margin-right: 5px;
      }
      .outer i {
        border-style: dashed;
      }
      .el-icon-refresh {
        font-size: $global-font-size-24;
        cursor: pointer;
        margin-left: -22px;
        color: $color-ca;
      }
    }
  }
}
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
