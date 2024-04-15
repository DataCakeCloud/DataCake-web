<template>
  <div class="wrap">
    <div class="content">
      <!-- <el-empty description="暂无数据"></el-empty> -->
      <el-card>
        <div slot="header">
          <div class="title">实例运行表视图</div>
        </div>
        <div class="search_top">
          <div class="type">
            <el-tooltip effect="dark" content="刷新" placement="top">
              <span class="el-icon-refresh" @click="getData"></span>
            </el-tooltip>
            <span class="inner"><i />内部数据</span>
            <span class="outer"><i />外部数据</span>
          </div>
          <div class="legend">
            <btns v-for="item in btnsOptions" :key="item.text" :info="item" />
          </div>
          <div class="search">
            <div class="item">
              <span class="label">实例时间 : </span>
              <el-select v-model="params.execution_date" v-loadMore="{ fn: loadMore, selector: '.el-select-dropdown .el-select-dropdown__wrap' }" placeholder="当前任务对应的实例时间" :disabled="loading" @change="searchDateChange">
                <el-option v-for="item in options" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </div>
            <div class="item">
              <span class="label">最近N个 : </span>
              <el-select v-model="params.num" placeholder="请选择" :disabled="loading" @change="searchDateChange">
                <el-option v-for="item in comNumOptions" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </div>
          </div>
        </div>
        <histogram v-if="analysisData && analysisData.tree" ref="histogram" v-loading="loading" :data="analysisData" @click-item="handelItem" />
        <el-empty v-else v-loading="loading" description="暂无数据"></el-empty>
      </el-card>
      <el-card>
        <div slot="header">
          <div class="title">实例运行甘特图</div>
        </div>
        <div class="search_top">
          <div class="type">
            <el-tooltip effect="dark" content="刷新" placement="top">
              <span class="el-icon-refresh" @click="getGanttData"></span>
            </el-tooltip>
            <span class="inner"><i />内部数据</span>
            <span class="outer"><i />外部数据</span>
          </div>
          <div class="legend">
            <btns v-for="item in btnsOptions" :key="item.text" :info="item" />
          </div>
          <div class="search">
            <div class="item">
              <span class="label">实例时间 : </span>
              <el-select v-model="ganttExecutionDate" v-loadMore="{ fn: loadMore, selector: '.el-select-dropdown .el-select-dropdown__wrap' }" placeholder="当前任务对应的实例时间" :disabled="ganttLoading" @change="ganttDateChange">
                <el-option v-for="item in options" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </div>
          </div>
        </div>
        <ganttChart v-if="ganttData && ganttData.tree" v-loading="ganttLoading" :data="ganttData" @click-item="handelItem" />
        <el-empty v-else v-loading="ganttLoading" description="暂无数据"></el-empty>
      </el-card>
    </div>
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
  </div>
</template>

<script>
import btns from './components/btns.vue';
import MonacoEditor from '@/components/MonacoEditor/index';
import histogram from './components/histogram.vue';
import ganttChart from './components/ganttChart.vue';
import { clearTask, getExeSql, getLogsUi, stopTaskInstace } from '@/api/taskDetail'; // getUrl,
import { getSnapshotList, getTaskDateList, getAnalysisData } from '@/api/taskDetail2';
import { mapGetters, mapMutations } from 'vuex';

export default {
  components: {
    btns,
    histogram,
    ganttChart,
    MonacoEditor
  },
  data() {
    return {
      ganttExecutionDate: '',
      ganttLoading: false,
      loading: false,
      maxNum: null,
      name: this.$route.query.name,
      taskId: this.$route.query.id,
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
      params: {
        execution_date: '',
        num: 10
      },
      options: [],
      numOptions: [5, 10, 25, 50, 100],
      btnsOptions: [
        { text: '检查上游', color: '#d7bdf2' },
        { text: '排队中', color: '#87e0f0' },
        { text: '运行中', color: '#3782ff' },
        { text: '成功', color: '#67c23a' },
        { text: '失败', color: '#f10d15' }
      ],
      execution_date: '',
      endDateType: false,
      isCheckUpstream: true,
      analysisData: {},
      ganttData: {},
      mapStatus: 1,
      stopData: {}
    };
  },
  computed: {
    ...mapGetters(['taskPageOptions']),
    comNumOptions() {
      const maxNum = this.maxNum || 0;
      const data = JSON.parse(JSON.stringify(this.numOptions));
      data.forEach((val, index, arr) => {
        if (maxNum > val) {
          if (index === arr.length - 1) arr.push(maxNum);
        } else {
          arr.length = index + 1;
          arr.splice(index, 1, maxNum);
        }
      });
      return data;
    }
  },
  watch: {
    comNumOptions: {
      handler: function(newVal) {
        if (newVal.length <= 2) this.params.num = newVal[newVal.length - 1];
      },
      deep: true
    }
  },
  async mounted() {
    if (this.taskPageOptions[`link${this.name}`]) {
      Object.keys(this.taskPageOptions[`link${this.name}`]).forEach(key => {
        this[key] = this.taskPageOptions[`link${this.name}`][key];
        if (key === 'analysisData' && !this.taskPageOptions[`link${this.name}`][key].list && this.options.length) this.getData();
        if (key === 'ganttData' && !this.taskPageOptions[`link${this.name}`][key].list && this.options.length) this.getGanttData();
      });
    } else {
      await this.getTaskHisNum();
      const res = await await this.getSnapshotList();
      if (!res || res.length === 0) return;
      this.getData();
      this.getGanttData();
    }
  },
  destroyed() {
    this.SET_TASKPAGEOPTIONS({
      tabs: `link${this.name}`,
      ...this._data
    });
  },
  methods: {
    ...mapMutations(['SET_TASKPAGEOPTIONS']),
    // 改变列表数据状态
    changeDataFn(data, trem, tType, value, vType) {
      if (!Array.isArray(data)) return;
      data.forEach(item => {
        item.forEach(val => {
          val.forEach(v => {
            if (v[tType] === trem) {
              v[vType] = value;
            }
          });
        });
      });
      return data;
    },
    searchDateChange() {
      if (this.options.length === 0) return;
      this.getData();
    },
    ganttDateChange() {
      this.getGanttData();
    },
    // 时间下拉框加载更多
    loadMore() {
      this.execution_date = this.options.length > 0 ? this.options[this.options.length - 1] : '';
      this.getSnapshotList();
    },
    // 获取实例日期列表
    getSnapshotList() {
      if (this.endDateType) return;
      const params = {
        name: this.name,
        execution_date: this.execution_date
      };
      return getSnapshotList(params).then(res => {
        const data = res.data;
        if (!this.execution_date) {
          this.options = data || [];
          this.params.execution_date = this.options[0];
          this.ganttExecutionDate = this.options[0];
          if (data && data.length < 20) this.endDateType = true;
          return data;
        } else {
          this.options.push(...data);
          this.execution_date = data[data.length - 1];
          if (data && data.length < 20) this.endDateType = true;
          return data;
        }
      });
    },
    getTaskHisNum() {
      return getTaskDateList({ name: this.name }).then(res => {
        const data = res.data;
        this.maxNum = data || 0;
      });
    },
    save() {
      const changeData = this.mapStatus === 1 ? this.analysisData.list : this.ganttData.list;
      const data = {
        name: this.stopData.dagId,
        executionDate: this.stopData.executionDate,
        ...this.form
      };
      stopTaskInstace(data).then(data => {
        this.dialogVisible = false;
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        const value = this.form.status ? 'success' : 'failed';
        const resData = this.changeDataFn(changeData, this.stopData.nodeId, 'nodeId', value, 'state');
        if (this.mapStatus === 1) {
          this.analysisData.list = resData;
        } else {
          this.ganttData.list = resData;
        }
      });
    },
    // 查看日志
    getLogs(data) {
      getLogsUi({
        id: data.task_id,
        executionDate: data.executionDate
      }).then(res => {
        const data = res.data;
        const logs = data;
        window.open(logs);
      });
    },
    // sql预览
    getSql(row) {
      this.dialogVisibleSql = true;
      this.version = row.version || 1;
      this.sqlLoading = true;
      getExeSql({
        taskId: row.task_id,
        executionDate: row.executionDate,
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
      const changeData = this.mapStatus === 1 ? this.analysisData.list : this.ganttData.list;
      clearTask({
        name: data.dagId,
        executionDate: data.executionDate,
        isCheckUpstream: this.isCheckUpstream
      }).then(res => {
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        const resData = this.changeDataFn(changeData, data.nodeId, 'nodeId', 'waiting', 'state');
        if (this.mapStatus === 1) {
          this.analysisData.list = resData;
        } else {
          this.ganttData.list = resData;
        }
      });
    },
    // 直方图点击每一项
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
      }
    },
    getGanttData() {
      this.ganttLoading = true;
      this.ganttData = {};
      const params = {
        name: this.name,
        gantt: 1,
        num: 1,
        execution_date: this.ganttExecutionDate
      };
      getAnalysisData(params)
        .then(res => {
          const data = res.data;
          this.ganttData = data;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.ganttLoading = false;
        });
    },
    getData() {
      this.loading = true;
      this.analysisData = {};
      const params = {
        name: this.name,
        gantt: 0,
        ...this.params
      };
      getAnalysisData(params)
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
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  .content {
    // min-height: calc(100vh - 233px);
    margin: 0 -6px -6px -6px;
    // padding: 10px;
    // border: 1px solid #eaf0f7;
    .el-card:not(:first-child) {
      margin-top: 20px;
    }
    .el-card {
      &::v-deep .el-card__header {
        .title {
          font-weight: 700;
          font-size: $global-font-size-16;
        }
      }
      &::v-deep .el-card__body {
        padding-top: 10px;
      }
      .search_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0 20px 20px;
        .search {
          flex: 1;
          display: flex;
          justify-content: end;
          padding-left: 10px;
          .item:not(:first-child) {
            margin-left: 15px;
          }
          .item {
            white-space: nowrap;
            ::v-deep .el-select {
              width: calc(100% - 70px);
            }
          }
        }
        .legend {
          display: flex;
          span {
            &:not(:first-child) {
              margin-left: 15px;
            }
          }
        }
        .type {
          flex: 1;
          display: flex;
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
            color: $c-primary;
          }
        }
      }
    }
  }
  .taskDialog {
    ::v-deep .el-dialog__body {
      padding: 10px 20px;
    }
    .dialog-footer {
      text-align: center;
    }
    .el-descriptions {
      ::v-deep .el-descriptions--small {
        font-size: $global-font-size-14;
      }
    }
  }
}
.monaco-editor-wrap {
  height: 400px;
}
</style>
