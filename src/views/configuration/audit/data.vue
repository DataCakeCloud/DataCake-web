<template>
  <el-card>
    <div class="search-condition-wrap">
      <search-condition label="数据">
        <!-- { checkStrictly: true } -->
        <Cascader :props="cascaderProps" filterable clearable popper-class="cascaderParent" @change="changeData"></Cascader>
        <!-- <el-cascader :props="cascaderProps" filterable clearable popper-class="cascaderParent" @change="changeData"></el-cascader> -->
      </search-condition>
      <search-condition label="操作用户">
        <el-select
          v-model="params.userId"
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
      <search-condition label="操作类型">
        <el-select v-model="typeOperations" multiple placeholder="请选择" @change="search">
          <el-option v-for="item in typeSelectList" :key="item.value" :label="item.label" :value="item.value" clearable> </el-option>
        </el-select>
      </search-condition>
      <search-condition label="操作时间">
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
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <!-- <el-button type="primary" size="small" @click="exportData">导出</el-button> -->
    </div>
    <div class="table-wrap">
      <el-table :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" height="calc(100vh - 260px)">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="table.tableName" label="数据" align="center"></el-table-column>
        <el-table-column prop="userId" label="操作用户" align="center"></el-table-column>
        <el-table-column prop="userGroup" label="用户组" align="center"></el-table-column>
        <el-table-column label="操作类型" align="center">
          <template slot-scope="scope">
            <span>{{ formatOpTypes(scope.row.opTypes) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作时间" align="center">
          <template slot-scope="scope">
            <span>{{ $utils.parseTime(scope.row.createTimestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statement" label="执行语句" align="center" show-overflow-tooltip></el-table-column>
      </el-table>
      <div class="pagination">
        <el-button :disabled="!previousMarker" icon="el-icon-arrow-left" @click="handleCurrentChange('pre')"></el-button>
        <el-button :disabled="!nextMarker" icon="el-icon-arrow-right" @click="handleCurrentChange('next')"></el-button>
      </div>
    </div>
  </el-card>
</template>
<script>
import * as tools from '@/utils/tools';
import SearchCondition from '@/components/SearchCondition';
import Cascader from '@/components/elementui/cascader';
import { getUserList } from '@/api/task';
import { dataListApi, exportAuditList } from '@/api/audit';
import { getTableList, getDbList, clearCache } from '@/api/querydata.js';
export default {
  components: {
    SearchCondition,
    Cascader
  },
  data() {
    var that = this;
    return {
      dataOptions: [
        {
          value: 'hive',
          label: 'Hive',
          children: []
        }
      ],
      typeSelectList: [
        {
          value: 'READ',
          label: '查询'
        },
        {
          value: 'ALTER_TABLE',
          label: '编辑'
        },
        {
          value: 'DROP_TABLE',
          label: '删除'
        },
        {
          value: 'DESC_TABLE',
          label: '描述'
        },
        {
          value: 'WRITE',
          label: '插入'
        }
      ],
      typeOperations: [],
      ownerList: [],
      ownerLoading: false,
      params: {
        table: '',
        database: '',
        catalogName: '',
        pageNum: 1,
        pageSize: 20
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
      nextMarker: '',
      previousMarker: '',
      total: 0,
      region: '',
      cascaderProps: {
        checkStrictly: true,
        lazy: true,
        lazyLoad: this.cascaderLoad
      }
    };
  },
  created() {
    this.init();
    tools.regionList.then(res => {
      this.region = res[0].value;
    });
  },
  methods: {
    init() {
      // this.getList();
    },
    async cascaderLoad(node, resolve) {
      const { level } = node;
      if (!level) {
        resolve(this.dataOptions);
      } else if (level === 1) {
        await clearCache();
        this.dbList = await (await getDbList({ region: this.region, catalog: 'hive', engine: '' })).data;
        const nodes = this.dbList.map(item => {
          return {
            value: item,
            label: item,
            leaf: false
          };
        });
        resolve(nodes);
      } else {
        await clearCache();
        this.dbList = await (await getTableList({ region: this.region, engine: '', catalog: 'hive', database: node.value })).data;
        const nodes = this.dbList.map(item => {
          return {
            value: item,
            label: item,
            leaf: true
          };
        });
        resolve(nodes);
      }
    },
    formatOpTypes(list) {
      let str = '';
      list.forEach(item => {
        const typeObj = this.typeSelectList.find(typeItem => {
          return typeItem.value === item;
        });
        if (typeObj) {
          str += typeObj.label + ',';
        }
      });
      str = str.slice(0, -1);
      return str;
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
    changeData(val) {
      if (val.length === 2) {
        this.params.database = val[1];
        this.params.table = '';
        this.search();
      } else {
        this.params.database = val[1];
        this.params.table = val[2];
        this.search();
      }
    },
    handleCurrentChange(type) {
      // this.params.pageToken = type === 'next' ? this.nextMarker : this.previousMarker;
      if (type === 'next') {
        this.params.nextMarker = this.nextMarker;
        this.params.previousMarker = '';
      } else {
        this.params.nextMarker = '';
        this.params.previousMarker = this.previousMarker;
      }
      this.getList();
    },
    getList() {
      this.loading = true;
      this.params.startTime = this.timeRange[0];
      this.params.endTime = this.timeRange[1];
      this.params.catalogName = this.region;
      if (this.typeOperations.length) {
        this.params.operations = this.typeOperations;
      } else {
        this.params.operations = ['READ', 'ALTER_TABLE', 'DROP_TABLE', 'DESC_TABLE', 'WRITE'];
      }
      Object.keys(this.params).forEach(item => {
        if (!this.params[item]) delete this.params[item];
      });
      dataListApi(this.params)
        .then(res => {
          const data = res.data;
          this.tableData = data.objects;
          this.nextMarker = data.nextMarker || '';
          this.previousMarker = data.previousMarker || '';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    search() {
      if (!this.params.database) {
        this.$message({
          type: 'warning',
          message: '请先选择数据库',
          duration: 1500
        });
        return;
      }
      this.params.nextMarker = '';
      this.params.previousMarker = '';
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
        // const filterVal = ['traceId', 'uri', 'type', 'params', 'userId', 'requestTime', 'responseTime', 'costTime', 'resultCode', 'resultMessage', 'resultData']; // 写从后端查询出来的字段名称一一对应
        const filterVal = [
          {
            name: 'traceId'
          },
          {
            name: 'uri'
          },
          {
            name: 'type'
          },
          {
            name: 'params'
          },
          {
            name: 'userId'
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
    changeTime(value) {
      this.params.requestStartTime = value[0];
      this.params.requestEndTime = value[1];
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
    padding: 15px;
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
.pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
<style>
.cascaderParent .el-cascader-panel .el-scrollbar-box:first-child .el-radio {
  display: none !important;
}
</style>
