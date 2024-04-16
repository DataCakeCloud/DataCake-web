<template>
  <el-card class="audit-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="请求用户">
        <el-select
          v-model="params.userName"
          placeholder="请求用户"
          size="small"
          clearable
          filterable
          remote
          allow-create
          default-first-option
          :remote-method="remoteMethod"
:loading="ownerLoading"
          class="search-box"
          popper-class="custom-popper"
          @change="search"
        >
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
            <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </search-condition>
      <search-condition label="请求时间">
        <el-date-picker
          v-model="timeRange"
          class="search-box"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
          :picker-options="pickerOptions"
          style="width: 360px"
          @change="changeTime"
        ></el-date-picker>
      </search-condition>
      <search-condition label="请求模块">
        <el-select v-model="params.source" placeholder="请选择" @change="changeSource">
          <el-option v-for="item in sourceSelectList" :key="item.value" :label="item.label" :value="item.value" clearable> </el-option>
        </el-select>
      </search-condition>
      <search-condition label="事件名称">
        <el-select
          v-model="params.eventUri"
          placeholder="事件名称"
          size="small"
          clearable
          filterable
          multiple
          remote
          default-first-option
          :remote-method="remoteMethodApi"
:loading="ownerLoading"
          class="search-box"
          popper-class="custom-popper"
          @change="search"
        >
          <el-option v-for="item in eventList" :key="item.code" :value="item.code" :label="item.value">
            <div style="max-width: 420px; word-break: break-all">{{ item.value }}</div>
          </el-option>
        </el-select>
      </search-condition>
      <search-condition label="请求API">
        <el-input v-model.trim="params.uri" class="search-box" placeholder="请输入请求API" clearable></el-input>
      </search-condition>
      <search-condition label="请求参数">
        <el-input v-model.trim="params.params" class="search-box" placeholder="请输入参数" clearable></el-input>
      </search-condition>
      <div class="btn-box">
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <!-- <el-button type="primary" size="small" @click="exportData">导出</el-button> -->
      </div>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage"> </table-page>
    </div>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { functionListApi, exportAuditList, getEventList } from '@/api/audit';
import { getUserList } from '@/api/task';

export default {
  components: {
    SearchCondition,
    TablePage
  },
  data() {
    var that = this;
    return {
      params: {
        uri: '',
        userName: '',
        source: '',
        eventUri: [],
        params: '',
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      timeRange: [],
      pickerOneDate: new Date().getTime(),
      pickerOptions: {
        // 获取选择的第一个时间
        onPick: obj => {
          const startDate = obj.minDate.getTime();
          that.pickerOneDate = startDate;
        },
        disabledDate(time) {
          if (that.pickerOneDate) {
            // 自己配置选择几天，我这是6天
            const maxTime = that.pickerOneDate + 7 * 24 * 3600 * 1000 - 1;
            const minTime = that.pickerOneDate - 6 * 24 * 3600 * 1000 - 1;
            const nowTime = new Date();
            nowTime.setHours(23, 59, 59, 999);
            return time.getTime() > maxTime || time.getTime() < minTime || time.getTime() > nowTime.getTime();
          }
        }
      },
      loading: false,
      tableData: [],
      sourceSelectList: [
        {
          value: 'ds_task',
          label: '数据开发'
        },
        {
          value: 'metadata',
          label: '元数据'
        },
        {
          value: 'pipeline',
          label: '调度'
        },
        {
          value: 'qe',
          label: 'SQL查询'
        }
        // {
        //   value: 'cluster-service',
        //   label: '云资源管理'
        // }
      ],
      columnData: [
        {
          prop: 'userName',
          label: '请求用户',
          width: '150',
          tooltip: true
        },
        {
          prop: 'requestTime',
          label: '请求时间',
          width: '170',
          format: row => {
            return this.$utils.parseTime(row.requestTime, '{y}-{m}-{d} {h}:{i}:{s}');
          }
        },
        {
          prop: 'resultMessage',
          label: '返回消息',
          longData: true
        },
        {
          prop: 'source',
          label: '请求模块',
          width: '150',
          longData: true
        },
        {
          prop: 'eventName',
          label: '事件名称',
          width: '150',
          longData: true,
          tooltip: true
        },
        {
          prop: 'uri',
          label: '请求API',
          width: '150',
          longData: true,
          tooltip: true
        },
        {
          prop: 'param',
          label: '请求参数',
          width: '150',
          longData: true,
          formatTipJSON: true
        },
        {
          prop: 'responseTime',
          label: '响应时间',
          width: '170',
          format: row => {
            return this.$utils.parseTime(row.responseTime, '{y}-{m}-{d} {h}:{i}:{s}');
          }
        },
        {
          prop: 'costTime',
          label: '响应耗时(ms)',
          width: '120'
        },
        {
          prop: 'resultCode',
          label: '返回状态码',
          width: '120',
          format: row => {
            return String(row.resultCode);
          }
        }
        // {
        //   prop: '返回数据',
        //   label: '返回数据',
        //   width: '200',
        //   longData: true
        // }
      ],
      total: 0,
      ownerList: [],
      eventList: [],
      ownerLoading: false
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.timeRange[0] = new Date().getTime() - 24 * 3600 * 1000;
      this.timeRange[1] = new Date().getTime();
      this.getList();
    },
    getList() {
      this.loading = true;
      this.params.startTime = this.timeRange[0];
      this.params.endTime = this.timeRange[1];
      Object.keys(this.params).forEach(item => {
        if (!this.params[item]) delete this.params[item];
      });
      functionListApi(this.params)
        .then(res => {
          const data = res.data;
          this.tableData = data.list;
          this.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    changeSource() {
      this.search();
      this.remoteMethodApi();
    },
    remoteMethodApi(query) {
      this.ownerLoading = true;
      getEventList({ name: query || '', source: this.params.source }).then(res => {
        this.ownerLoading = false;
        const data = res.data;
        this.eventList = data;
      });
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    exportData() {
      exportAuditList(this.params).then(res => {
        const data = res.data;
        this.download(data);
      });
    },
    download(list) {
      import('@/utils/export2Excel').then(excel => {
        const tHeader = ['TraceId', 'Path', 'Methods', 'Params', 'UserId', 'requestTime', 'responseTime', 'costTime', 'code', 'message', 'data']; // 写Excel表头
        const filterVal = [
          {
            name: 'traceId'
          },
          {
            name: 'source'
          },
          {
            name: 'uri'
          },
          {
            name: 'params'
          },
          {
            name: 'userName'
          },
          {
            name: 'requestTime',
            isFormat: true
          },
          {
            name: 'responseTime',
            isFormat: true
          },
          {
            name: 'costTime'
          },
          {
            name: 'resultCode'
          },
          {
            name: 'resultMessage'
          },
          {
            name: 'resultData'
          }
        ];
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '模板' // 这里定义导出模板的名称
        });
        // this.downloadLoading = false //导出模板框消失
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j.isFormat) {
            return this.$utils.parseTime(v[j.name]);
          } else {
            return v[j.name];
          }
        })
      );
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    changeTime(value) {
      if (value) {
        this.params.startTime = value[0];
        this.params.endTime = value[1];
      }
      this.search();
    }
  }
};
</script>
<style lang="scss" scoped>
.audit-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    .search-box {
      width: 140px;
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
}
.btn-box {
  margin-top: 10px;
  display: inline-block;
}
</style>
