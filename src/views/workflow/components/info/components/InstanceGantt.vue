<template>
  <div class="instance-gantt">
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
    <ganttChart v-if="ganttData && ganttData.tree" v-loading="ganttLoading" :data="ganttData" @click-item="handelItem" />
    <el-empty v-else v-loading="ganttLoading" description="暂无数据"></el-empty>
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
import btns from './btns';
import ganttChart from './ganttChart';
import { getInstanceGantt } from '@/api/flow';
import { getExeSql, getLogsUi, stopTaskInstace } from '@/api/taskDetail';
import { clearTask } from '@/api/flow';
import MonacoEditor from '@/components/MonacoEditor/index';

export default {
  name: 'InstanceGantt',
  components: {
    btns,
    ganttChart,
    MonacoEditor
  },
  props: {
    date: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ganttLoading: false,
      btnsOptions: [
        { text: '检查上游', color: '#d7bdf2' },
        { text: '排队中', color: '#87e0f0' },
        { text: '运行中', color: '#5b70e4' },
        { text: '成功', color: '#67c23a' },
        { text: '失败', color: '#f10d15' }
      ],
      ganttData: {},
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
      stopData: {},
      isCheckUpstream: true
    };
  },
  watch: {
    date(value) {
      if (value) {
        this.getData();
      }
    }
  },
  created() {
    if (this.date) {
      this.getData();
    }
  },
  methods: {
    // init() {
    //   this.getData();
    // },
    getData() {
      this.ganttLoading = true;
      this.ganttData = {};
      const params = {
        workflowID: this.$route.query.id,
        // version: this.$route.query.version,
        executionDate: this.date
      };
      getInstanceGantt(params)
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
    save() {
      const data = {
        name: this.stopData.taskName,
        executionDate: this.$utils.parseTime(this.stopData.executionDate, '{y}-{m}-{d} {h}:{i}:{s}'),
        ...this.form
      };
      stopTaskInstace(data).then(res => {
        const data = res.data;
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
      // clearTask({
      //   name: data.taskName,
      //   executionDate: this.$utils.parseTime(data.executionDate, '{y}-{m}-{d} {h}:{i}:{s}'),
      //   isCheckUpstream: this.isCheckUpstream
      // }).then(res => {
      //   this.$message({
      //     type: 'success',
      //     message: '执行成功'
      //   });
      //   this.getData();
      // });
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
    handelItem(type, data) {
      this.taskItem = data;
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
    }
  }
};
</script>
<style lang="scss" scoped>
.instance-gantt {
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
</style>
