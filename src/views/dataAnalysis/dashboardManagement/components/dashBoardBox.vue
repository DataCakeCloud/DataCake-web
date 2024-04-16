<template>
  <div ref="dashBoardBox" class="container">
    <div class="tool_top">
      <div class="tool_left">
        <div class="title">
          <div v-if="!nameType" class="name_content">
            <span class="name">{{ info.name }}</span>
            <i v-if="type !== 'look'" class="el-icon-edit icon" @click="nameType = true"></i>
          </div>
          <el-input v-else v-model="info.name" v-autoFous placeholder="仪表盘名称" maxlength="10" clearable size="mini" @blur="nameType = false"></el-input>
        </div>
        <div class="owner">
          <i class="el-icon-user"></i>
          <span>{{ info.createBy }}</span>
        </div>
      </div>
      <div class="tool_right">
        <el-date-picker v-if="type === 'look'" v-model="info.time" class="w130" type="date" :disabled="disabledSchedule" :picker-options="pickerOptions" value-format="yyyyMMdd" placeholder="选择日期" size="mini" @change="timeChange"> </el-date-picker>
        <span v-if="type === 'add' || type === 'edit'">
          定时刷新
          <el-switch v-model="info.is_schedule" @change="scheduleChange"></el-switch>
        </span>
        <el-button v-if="type !== 'look'" type="success" size="mini" @click="addChartBtn">添加图表</el-button>
        <el-button v-if="type === 'look' && !isShare" type="primary" size="mini" @click="editDashboar">
          <i class="el-icon-edit"></i>
          编 辑
        </el-button>
        <el-button v-if="type !== 'look'" type="warning" size="mini" @click="cancelDashboard"> 取 消 </el-button>
        <el-button v-if="type !== 'look'" type="primary" class="toolbar-save icon" size="mini" @click="addDashBoardSub">
          <svg-icon v-if="!submitLoading" icon-class="save" class="icon" />
          <i v-else class="el-icon-loading"></i>
          保 存
        </el-button>
        <el-button v-if="type === 'look' && !isShare" type="danger" size="mini" @click="delDashBoard">
          <i class="el-icon-delete icon"></i>
          删 除
        </el-button>
        <el-button v-if="type === 'look' && !isShare" type="primary" size="mini" class="share" @click="share">
          <svg-icon icon-class="share" class="icon" />
          分 享
        </el-button>
      </div>
    </div>
    <el-input v-if="!(type === 'look' && !info.describe)" v-model="info.describe" :disabled="type === 'look'" type="textarea" :rows="3" placeholder="请输入仪表盘描述"> </el-input>
    <div class="content">
      <dashBoardGrid :options="gridOptions" :data="dashBoardData" :sub-height="type === 'look' && !info.describe" :add-padding="type !== 'look' && dashBoardData.length > 0" />
    </div>
    <el-dialog v-loading="addChartLoading" class="addChartDial" title="添加图表" :visible.sync="addChartType" width="60%" @close="addChartClose">
      <div class="search">
        <el-input v-model="params.title" class="search_input" size="mini" placeholder="图表名称" @keydown.native.enter="getChartTable">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="getChartTable"></i>
        </el-input>
      </div>
      <el-table ref="chartTable" v-loading="chartTableLoading" class="table" :data="chartData" style="width: 100%" :header-cell-style="{ padding: '3px 0' }">
        <el-table-column type="selection" width="55" :selectable="selectable"></el-table-column>
        <el-table-column prop="name" label="图表名称" sortable min-width="180" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createBy" label="创建人" width="140"> </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <span>{{ $utils.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="图表类型" width="100">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.type === 'table'" icon-class="chartTable" class="chartTable"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'line'" icon-class="chartLine" class="chartLine"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'interval' || scope.row.type === 'stack'" icon-class="chartColumn" class="chartColumn"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'polygon'" icon-class="rectChart" class="rectChart"></svg-icon>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-sizes="[10, 20, 50, 100]" :current-page="params.pageNum" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addChartType = false">取 消</el-button>
        <el-button type="primary" @click="addChartSubmit"> 确 定 </el-button>
      </span>
    </el-dialog>
    <el-dialog class="addChartDial" title="调度时间" :visible.sync="scheduleType" width="40%" @close="closeDispatch">
      <div class="chartDialBox">
        <el-alert title="若开启定时刷新，将会在数据开发中运行定时任务" type="warning" show-icon :closable="false"> </el-alert>
        <div class="form_item">
          <div class="label">定时调度时间:</div>
          <div class="item_item">
            <span class="symbolText"> 每 </span>
            <el-select v-model="dispashForm.cycle" style="width: 100px" disabled>
              <el-option v-for="item in cycleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <span class="symbolText"> 在 </span>
            <el-select v-model="dispashForm.hourly" style="width: 100px">
              <el-option v-for="item in hourlyList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <span class="symbolText"> : </span>
            <el-select v-model="dispashForm.minute" style="width: 100px">
              <el-option v-for="item in minuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <span class="symbolText"> 开始调度 </span>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="scheduleType = false">取 消</el-button>
        <el-button type="primary" @click="confirmTime">确 定</el-button>
      </span>
    </el-dialog>
    <dashBoardShare ref="dashBoardShare" @submitFn="shareSubmit" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getChartList, getChartData, addDashboard, updateDashboard, shareDashboard, delDashboard, getDataById } from '@/api/querydata';
import { getCrontab } from '@/api/task';
import dashBoardGrid from './dashBoardGrid.vue';
import dashBoardShare from '../../components/dashBoardShare.vue';

export default {
  components: {
    dashBoardGrid,
    dashBoardShare
  },
  data() {
    return {
      isShare: false,
      submitLoading: false,
      type: 'look',
      dispashForm: {
        hourly: 0,
        minute: 0,
        cycle: 'daily'
      },
      info: {
        name: '',
        createBy: '',
        time: '',
        is_schedule: false,
        describe: '',
        crontab: ''
      },
      scheduleType: false,
      oldInfo: {},
      oldDashBoardData: [],
      nameType: false,
      addChartType: false,
      chartTableLoading: false,
      params: {
        title: '',
        pageSize: 20,
        pageNum: 1,
        type: 'my'
      },
      total: 0,
      chartData: [],
      dashBoardData: [],
      pickerOptions: {
        disabledDate: time => {
          return time > new Date();
        }
      },
      addChartLoading: false,
      folderObj: {},
      disabledSchedule: false,
      cycleList: [
        {
          label: '天',
          value: 'daily'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    gridOptions() {
      return {
        isDrag: this.type === 'look'
      };
    },
    hourlyList() {
      const res = [];
      for (let index = 0; index <= 23; index++) {
        res.push({
          label: index < 10 ? '0' + index : index + '',
          value: index
        });
      }
      return res;
    },
    minuteList() {
      const res = [];
      for (let index = 0; index <= 60; index++) {
        res.push({
          label: index < 10 ? '0' + index : index + '',
          value: index
        });
      }
      return res;
    }
  },
  methods: {
    selectable(data) {
      const oldDashIdList = this.dashBoardData.map(item => item.id);
      return !oldDashIdList.includes(data.id);
    },
    delDashBoard() {
      this.$confirm('确定要删除该看板吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        delDashboard({ id: this.info.id + '' }).then(res => {
          if (res.code === 0) {
            this.$parent?.getDashboardTree();
            this.$parent.empty = true;
            this.$message({
              type: 'success',
              message: '操作成功'
            });
          }
        });
      });
    },
    timeChange(val) {
      this.dashBoardData.forEach(item => {
        item.resData = undefined;
        this.getDashData(this.dashBoardData, { id: item.id, bidt: val, status: item.status, uuid: item.uuid });
      });
    },
    resetData() {
      this.info = {
        name: '',
        createBy: '',
        time: '',
        is_schedule: false,
        describe: '',
        crontab: ''
      };
      this.dashBoardData = [];
    },
    initData(data) {
      this.type = 'look';
      this.isShare = data.isShare;
      this.info.describe = data.describeDash;
      this.info.name = data.name;
      this.info.createBy = data.createBy;
      this.info.time = data.time;
      this.info.id = data.id;
      this.info.crontab = data.crontab;
      this.info.classid = data.classId;
      this.info.is_schedule = !!data.isSchedule;
      this.dashBoardData = JSON.parse(data.params);

      // 更新chart使用新的配置对象
      this.dashBoardData.forEach(item => {
        const index = data.chartlist.findIndex(val => val.id === item.id);
        if (index > -1) {
          item.param = JSON.parse(data.chartlist[index].param);
          item['status'] = data.chartlist[index].status;
        }
      });

      if (data.isSchedule === 0) {
        this.disabledSchedule = true;
        this.dashBoardData.forEach(item => {
          this.getDashData(this.dashBoardData, { id: item.id, bidt: this.$utils.parseTime(item.createTime, '{y}{m}{d}'), status: item.status, uuid: item.uuid });
        });
      } else {
        this.disabledSchedule = false;
        this.info.time = this.$utils.parseTime(new Date().getTime(), '{y}{m}{d}');
        this.dashBoardData.forEach(item => {
          this.getDashData(this.dashBoardData, { id: item.id, bidt: this.info.time, status: item.status, uuid: item.uuid });
        });
      }
    },
    getDashData(dataList, data) {
      let resData = [];
      let params = {};
      let fn = getChartData;
      const currentIndex = dataList.findIndex(item => item.id === data.id);
      if (data.status !== 'success') {
        if (this.info.is_schedule) {
          if (this.$utils.parseTime(dataList[currentIndex].createTime, '{y}{m}{d}') === this.info.time) {
            // 不成功  调度的   chart创建时间等于选择的时间 获取QE历史数据
            fn = getDataById;
            params = data.uuid;

            // 展示时间处理
            dataList[currentIndex].viewTime = dataList[currentIndex].createTime;
          } else {
            // 不成功  调度的   直接数据为空
            this.$set(dataList, currentIndex, { ...dataList[currentIndex], resData, viewTime: null });
            return;
          }
        } else {
          // 不成功 非调度 的获取QE历史数据
          fn = getDataById;
          params = data.uuid;

          // 展示时间处理
          dataList[currentIndex].viewTime = dataList[currentIndex].createTime;
        }
      } else {
        // 成功的获取调度数据
        params.id = data.id;
        params.bidt = data.bidt;

        // 展示时间处理
        if (this.info.is_schedule) {
          const strEndTime = this.info.crontab
            .split(' ')
            .filter((v, i) => i <= 1)
            .reverse()
            .join(':');
          dataList[currentIndex].viewTime = data.bidt + ` ${strEndTime}`;
        } else {
          dataList[currentIndex].viewTime = dataList[currentIndex].createTime;
        }
      }
      fn(params)
        .then(res => {
          if (data.status !== 'success') {
            resData = res.data?.result || [];
          } else {
            resData = res.data;
          }
        })
        .finally(() => {
          dataList.forEach((item, index) => {
            if (item.id === data.id) {
              this.$set(dataList, index, { ...item, resData });
            }
          });
        });
    },
    addDashBoardSub() {
      if (this.submitLoading) return;
      if (!this.info.name) {
        this.$message({
          type: 'warning',
          message: '请输入看板名称'
        });
        return;
      }
      this.submitLoading = true;
      const params = {
        ...this.info,
        classid: this.folderObj.id + '',
        params: JSON.stringify(this.dashBoardData.map(item => ({ ...item, resData: undefined, param: {}, viewTime: null }))),
        chart_id: this.dashBoardData.map(item => item.id + '')
      };
      if (this.info.is_schedule) {
        params.is_schedule = '1';
      } else {
        params.is_schedule = '0';
      }
      let fn = addDashboard;
      if (this.info.id) {
        fn = updateDashboard;
        params.id += '';
        params.classid = this.info.classid + '';
      }
      fn(params)
        .then(res => {
          if (res.code === 0) {
            this.type = 'look';
            if (!this.info.is_schedule) {
              this.disabledSchedule = true;
              this.info.time = '';
            } else {
              this.disabledSchedule = false;
            }
            if (res.data) {
              this.info.id = res.data.id;
              this.info.classid = res.data.classId;
            }
            this.$message({
              type: 'success',
              message: '保存成功'
            });
            this.$parent?.getDashboardTree();
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
    shareSubmit(data) {
      const params = {
        sharer: this.userInfo.userId,
        sharee: data.sharee,
        shareeEmail: data.shareeEmail,
        shareid: this.info.id + '',
        shareUrl: this.$locationOrigin + `/data-analysis/dashboardManagement?dashBoardId=${this.info.id}`
      };
      shareDashboard(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '操作成功'
          });
        }
      });
    },
    share() {
      this.$refs.dashBoardShare.open();
    },
    // 新建仪表盘
    addDashboard(event, node, data) {
      this.folderObj = data;
      this.type = 'add';
      this.info = {
        name: '',
        createBy: this.userInfo.userId,
        time: '',
        reset: false,
        content: ''
      };
      this.dashBoardData = [];
      this.nameType = true;
    },
    addChartSubmit() {
      this.addChartLoading = true;

      const selectList = this.$refs.chartTable.selection.map(item => {
        // item.width = item.type === 'table' ? this.containerWidth - 5 : (this.containerWidth - 15) / 2;
        item.width = item.type === 'table' ? 'calc(100% - 10px)' : 'calc(50% - 10px)';
        this.$set(item, 'height', 400);
        item.resData = undefined;
        item.param = JSON.parse(item.param);
        item.columnList = JSON.parse(item.columnList);
        return item;
      });
      this.dashBoardData.push(...selectList);
      this.dashBoardData
        .filter(res => !res.resData)
        .forEach(item => {
          this.getDashData(this.dashBoardData, { id: item.id, bidt: item.uuid_time, status: item.status, uuid: item.uuid });
        });
      this.addChartType = false;
      this.addChartLoading = false;
    },
    closeDispatch() {
      if (!this.info.crontab) {
        this.dispashForm.hourly = 0;
        this.dispashForm.minute = 0;
        this.dispashForm.cycle = 'daily';
        this.info.is_schedule = false;
      }
    },
    confirmTime() {
      getCrontab({
        // cycle: crontabParam.cycle,
        cycle: 'daily',
        range: [],
        interval: 5,
        startTime: '00:00',
        endTime: '23:59',
        fixedTime: `${this.dispashForm.hourly < 10 ? `0${this.dispashForm.hourly}` : this.dispashForm.hourly}:${this.dispashForm.minute < 10 ? `0${this.dispashForm.minute}` : this.dispashForm.minute}`
      })
        .then(data => {
          this.info.crontab = data.data;
        })
        .finally(() => {
          this.scheduleType = false;
        });
    },
    scheduleChange(val) {
      this.scheduleType = val;
      if (!val) {
        this.info.crontab = '';
      }
    },
    editDashboar() {
      this.type = 'edit';
      this.oldInfo = JSON.parse(JSON.stringify(this.info));
      this.oldDashBoardData = JSON.parse(JSON.stringify(this.dashBoardData));
      this.nameType = true;
    },
    cancelDashboard() {
      if (this.type === 'add') {
        this.$parent.empty = true;
      }
      this.type = 'look';
      if (Object.keys(this.oldInfo).length > 0) this.info = this.oldInfo;
      if (this.oldDashBoardData.length > 0) this.dashBoardData = this.oldDashBoardData;
      this.nameType = false;
    },
    addChartBtn() {
      this.addChartType = true;
      this.getChartTable();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getChartTable();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getChartTable();
    },
    addChartClose() {
      this.params.title = '';
      this.params.pageSize = 20;
      this.params.pageNum = 1;
      this.chartData = [];
    },
    getChartTable() {
      this.chartTableLoading = true;
      getChartList(this.params)
        .then(res => {
          this.chartData = res.data.list;
          this.total = res.data.total;
        })
        .finally(() => {
          this.chartTableLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  .chartLine,
  .rectChart,
  .chartColumn {
    transform: scale(1.4);
  }
  .w130 {
    width: 130px;
  }
  .tool_top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f9f9fb;
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 10px;
    .tool_left {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        .name_content {
          .name {
            font-size: $global-font-size-16;
          }
        }
        .el-icon-edit {
          color: $c-primary;
        }
      }
      .owner {
        margin-left: 15px;
        color: $color-c3;
        .el-icon-user {
          font-size: $global-font-size-18;
        }
      }
    }
    .tool_right {
      .el-button {
        svg {
          margin-bottom: -1px;
        }
      }
      .share {
        background-color: #9587de;
        border-color: #9587de;
      }
    }
  }
  .content {
    min-height: calc(100% - 116px);
    .el-empty {
      margin-top: 150px;
    }
  }
  .addChartDial {
    ::v-deep .el-dialog__body {
      padding-top: 0px;
      padding-bottom: 10px;
      .dispatchForm {
        width: 280px;
        margin: 0 auto -20px;
      }
      .el-alert {
        padding: 4px;
        margin-bottom: 10px;
        ::v-deep .el-alert__title {
          font-size: $global-font-size-12;
        }
      }
      .form_item {
        display: flex;
        align-items: center;
        padding-left: 30px;
        .label {
          white-space: nowrap;
        }
        .item_item {
          display: flex;
          align-items: center;
          .symbolText {
            margin: 0 4px;
            white-space: nowrap;
          }
        }
      }
    }
    .search {
      margin-bottom: 10px;
      text-align: end;
      .search_input {
        width: 260px;
      }
    }
    .table {
      ::v-deep .el-table__body-wrapper {
        max-height: 450px;
        overflow: auto;
      }
    }
  }
}
</style>
