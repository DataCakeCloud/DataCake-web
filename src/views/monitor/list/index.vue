<template>
  <el-card class="monitor-list box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="名称">
        <el-input v-model.trim="params.name" class="search-box" placeholder="请输入监控名/数据集名" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <search-condition label="状态">
        <el-select v-model="params.status" class="search-box" placeholder="请选择状态" clearable multiple>
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </search-condition>
      <search-condition label="等级">
        <el-select v-model="params.alertLevel" class="search-box" placeholder="请选择等级" clearable>
          <el-option v-for="item in levelList" :key="item.value" :value="item.value" :label="item.label"></el-option>
        </el-select>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="create">新增监控</el-button>
      <el-alert class="custom-alert" show-icon :closable="false">
        <div slot="title">结果共 {{ total }} 个， 最近运行 <span :class="['status-tag', 'success']">已成功</span> {{ successNum }} 个， <span :class="['status-tag', 'failed']">未恢复</span> {{ notRecoveredNum }} 个， <span :class="['status-tag', 'canceled']">已恢复</span> {{ recoveredNum }} 个</div>
      </el-alert>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 250px)'" :total="total" :is-show-index="false" :page-num="params.pageNo" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column prop="status" label="监控状态" min-width="120">
          <template #header>监控状态<status-tips></status-tips></template>
          <template slot-scope="scope">
            <span v-if="scope.row.status === 0" class="status-tag notStart">未开始</span>
            <span v-else-if="scope.row.status === 1" class="status-tag success">已成功</span>
            <span v-else-if="scope.row.status === 2" class="status-tag failed">未恢复</span>
            <span v-else-if="scope.row.status === 3" class="status-tag canceled">已恢复</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="active" label="启停状态" min-width="100">
          <template #header>启停状态</template>
          <template slot-scope="scope">
            <span v-if="scope.row.active === 0" class="status-tag notStart">关闭</span>
            <span v-else-if="scope.row.active === 1" class="status-tag success">开启</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="100">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="config(scope.row)">配置</el-button>
            <el-button type="text" size="mini" @click="detail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" :style="{ color: scope.row.active === 1 ? '#FF5656' : '' }" @click="active(scope.row)">{{ scope.row.active === 1 ? '停止' : '启动' }}</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <win-add-monitor ref="monitorDialog"></win-add-monitor>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import StatusTips from './components/StatusTips';
import WinAddMonitor from './components/WinAddMonitor';
import * as tools from '@/utils/tools';
import { slaPages, activeItem } from '@/api/sla';

export default {
  name: 'MonitorList',
  components: {
    SearchCondition,
    TablePage,
    StatusTips,
    WinAddMonitor
  },
  data() {
    return {
      params: {
        alertLevel: '',
        status: [],
        pageNo: 1,
        pageSize: 10
      },
      stateList: [
        {
          label: '未开始',
          value: 0
        },
        {
          label: '已成功',
          value: 1
        },
        {
          label: '未恢复',
          value: 2
        },
        {
          label: '已恢复',
          value: 3
        }
      ],
      levelList: tools.levelList,
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'id',
          label: '监控ID',
          width: '80'
        },
        {
          prop: 'name',
          label: '监控名字',
          width: '250',
          tooltip: true
        },
        {
          prop: 'dataRegion',
          label: '数据 region',
          width: '100',
          tooltip: true
        },
        {
          prop: 'dataTable',
          label: '数据表名',
          width: '150',
          tooltip: true
        },
        {
          prop: 'owner',
          label: '被 @ 用户的手机号',
          width: '200'
        },
        {
          prop: 'ownerName',
          label: '被 @ 用户的名字',
          width: '150'
        },
        // {
        //   prop: 'source',
        //   label: '数据来源',
        //   width: '100'
        // },
        // {
        //   prop: 'successFile',
        //   label: 'sucess文件路径',
        //   width: '300'
        // },
        {
          prop: 'taskName',
          label: '关联任务名',
          width: '100'
        }
        // {
        //   prop: 'alertGroupIds',
        //   label: '报警通知钉钉群的 token',
        //   width: '200'
        // }
      ],
      total: 0,
      successNum: 0,
      notRecoveredNum: 0,
      recoveredNum: 0
    };
  },
  created() {
    let params = sessionStorage.getItem('monitorParams');
    if (params) {
      params = JSON.parse(params);
      this.params.status = params.state;
      this.params.alertLevel = params.level;
    }
    this.getList();
  },
  beforeRouteEnter(to, from, next) {
    if (from.path !== '/monitor/pan' && from.path !== '/monitor/info' && from.path !== '/monitor/detail') {
      sessionStorage.removeItem('monitorParams');
    }
    next();
  },
  methods: {
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNo = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = true;
      const params = Object.assign({}, this.params);
      params.status = params.status && params.status.join(',');
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      slaPages(params).then(res => {
        this.loading = false;
        if (res.resultCode !== 0) return;
        const data = res.data;
        this.loading = false;
        this.total = data.totalNum;
        this.successNum = data.successNum;
        this.notRecoveredNum = data.notRecoveryNum;
        this.recoveredNum = data.recoveryNum;
        this.tableData = data.pageInfo.list;
      });
    },
    search() {
      this.params.pageNo = 1;
      this.getList();
    },
    create() {
      this.$refs.monitorDialog.showWin();
    },
    stateFormat(state) {
      const obj = this.stateList.find(item => item.value === state);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    config(row) {
      this.$router.push({
        name: 'MonitorConfigInfo',
        query: {
          id: row.id
        }
      });
      sessionStorage.setItem('monitorParams', JSON.stringify(this.params));
      sessionStorage.setItem('configInfo', JSON.stringify(row));
    },
    detail(row) {
      this.$router.push({
        name: 'minitorDetail',
        query: {
          id: row.id
        }
      });
      sessionStorage.setItem('monitorParams', JSON.stringify(this.params));
      sessionStorage.setItem('monitorDetail', JSON.stringify(row));
    },
    active(row) {
      const flag = row.active === 1 ? 0 : 1;
      const text = row.active === 1 ? '停止' : '启动';
      this.$confirm(`确定${text}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        activeItem({
          id: row.id,
          active: flag
        }).then(data => {
          this.$message({
            type: 'success',
            message: '操作成功'
          });
          this.getList();
        });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0;
  }
}
.monitor-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    padding: 15px 15px 0;
    position: relative;
    .search-box {
      width: 150px;
      &.el-select {
        width: 120px;
      }
    }
    .create {
      position: absolute;
      right: 15px;
      top: 20px;
    }
    .custom-alert {
      margin-bottom: 0;
    }
  }
  .status-tag {
    font-size: $global-font-size-12;
    padding: 2px 6px;
    border-radius: 20px;
    background: #fff;
    cursor: pointer;
    &.success {
      color: #67c23a;
      border: 1px solid #67c23a;
    }
    &.failed {
      color: $color-cb;
      border: 1px solid $color-cb;
    }
    &.canceled {
      color: #e6a23c;
      border: 1px solid #e6a23c;
    }
    &.notStart {
      color: #909399;
      border: 1px solid #909399;
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
</style>
