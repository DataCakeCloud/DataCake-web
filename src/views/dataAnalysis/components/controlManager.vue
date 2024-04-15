<template>
  <div class="controlMan-box">
    <div class="condition-box">
      <div class="condition-search">
        <div class="condition_item">
          <span class="search_text">名称: </span>
          <el-input v-model="params.taskName" size="mini" class="condition-input" placeholder="查询名称" clearable @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition_item">
          <span class="search_text">SQL: </span>
          <el-input v-model="params.originSql" size="mini" class="condition-input" placeholder="查询sql" clearable @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition_item">
          <span class="search_text">执行人: </span>
          <el-input v-model="params.userName" size="mini" class="condition-input" placeholder="执行人" clearable @keyup.enter.native="search"></el-input>
        </div>
      </div>
      <div class="reset_btn">
        <el-button size="mini" @click="resetSearch">重置</el-button>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
      </div>
    </div>
    <div class="query-list">
      <el-table v-loading="loading" border :data="list" stripe style="width: 100%" height="calc(100vh - 178px)" tooltip-effect="dark table_overflow_tootip" :cell-style="{ padding: '0px', height: '36px' }">
        <el-table-column type="index" label="序号" width="50" :index="indexMethod"></el-table-column>
        <el-table-column prop="taskName" label="名称" min-width="100">
          <template slot-scope="{ row }">
            <el-button type="text" @click="jump(row)">{{ row.taskName || '-' }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="originSql" label="查询" min-width="250">
          <template slot-scope="{ row }">
            <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="row.originSql" placement="bottom">
              <div class="ellipsis" @mouseenter="isShowTooltip">{{ row.originSql }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="执行人" width="120"></el-table-column>
        <el-table-column label="创建时间" min-width="100">
          <template slot-scope="scope">
            {{ $utils.parseTime(scope.row.createTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="调度周期" width="100">
          <template slot-scope="scope">
            {{ formatLabel(scope.row.schedule, cycleList) }}
          </template>
        </el-table-column>
        <el-table-column label="最近运行状态" min-width="120">
          <template slot-scope="scope">
            <el-popover v-for="(item, index) in scope.row.taskInstances" :key="index" trigger="hover" placement="bottom">
              <p>执行时间：{{ item.execution_date ? $utils.parseTime(item.execution_date) : '-' }}</p>
              <p>执行状态：{{ offlineStateCode[item.state] || '-' }}</p>
              <p>开始时间：{{ item.start_date ? $utils.parseTime(item.start_date) : '-' }}</p>
              <p>结束时间：{{ item.end_date ? $utils.parseTime(item.end_date) : '-' }}</p>
              <p>耗时：{{ item.duration || '-' }}</p>
              <span slot="reference" :class="['circle', 'task-state', item.state]"></span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 0" size="mini" type="text" @click="suspendBtn(scope.row, 1)">上线</el-button>
            <el-button v-if="scope.row.status === 1" size="mini" type="text" @click="suspendBtn(scope.row, 0)">下线</el-button>
            <el-button :disabled="scope.row.status === 1" size="mini" type="text" @click="suspendBtn(scope.row, 2)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { controlHistory, suspendControl } from '@/api/querydata';
import { getTaskInstance } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  data() {
    return {
      cycleList: [
        { label: '分钟', value: 'minutely' },
        { label: '小时', value: 'hourly' },
        { label: '天', value: 'daily' },
        { label: '周', value: 'weekly' },
        { label: '月', value: 'monthly' }
      ],
      list: [],
      loading: false,
      total: 0,
      params: {
        taskId: null,
        taskName: '',
        originSql: '',
        userName: '',
        status: '',
        pageSize: 30,
        pageNum: 1
      },
      offlineStateCode: tools.offlineStateCode,
      isTipDisabled: false
    };
  },
  inject: ['changeActiveTab'],
  created() {
    this.getList();
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    jump(data) {
      this.changeActiveTab('historyTab', { task_id: +data.taskId });
    },
    formatLabel(val, data) {
      return data.find(item => item.value === val)?.label || '-';
    },
    resetSearch() {
      this.params = {
        taskId: null,
        taskName: '',
        originSql: '',
        userName: '',
        pageSize: 30,
        pageNum: 1
      };
      this.getList();
    },
    suspendBtn(data, newStatus) {
      if (newStatus === 2) {
        this.delBtn(data);
        return;
      }
      suspendControl({
        taskId: data.taskId,
        newStatus
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功');
          this.getList();
        }
      });
    },
    delBtn(data) {
      this.$confirm('您要确定是否要删除该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        suspendControl({ taskId: data.taskId, newStatus: 2 }).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功');
            this.getList();
          }
        });
      });
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getList();
    },
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    getTaskInstance(list) {
      const idList = list.map(({ taskId }) => taskId);
      getTaskInstance({
        ids: idList.join(',')
      }).then(res => {
        const data = res.data || {};
        for (const i in data) {
          const currentObj = list.find(item => item.taskId === Number(i));
          if (currentObj) {
            this.$set(currentObj, 'taskInstances', data[i]?.slice(-7));
          }
        }
      });
    },
    getList() {
      this.loading = true;
      controlHistory({ ...this.params, taskId: +this.params.taskId })
        .then(res => {
          this.list = res.list || [];
          this.total = res.total || 0;
          this.getTaskInstance(this.list);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.controlMan-box {
  height: 100%;
  padding: 10px;
  .condition-box {
    position: relative;
    margin-bottom: 10px;
    .condition-search {
      display: flex;
      flex-wrap: nowrap;
      .condition_item {
        &:not(:first-child) {
          margin-left: 10px;
        }
        .search_text {
          margin-right: 4px;
        }
        .condition-input {
          width: 160px;
        }
      }
    }
    .reset_btn {
      position: absolute;
      top: 0;
      right: 5px;
    }
  }
  .query-list {
    .status {
      font-size: $global-font-size-12;
      &0 {
        color: #67c23a;
      }
      &1 {
        color: $color-cb;
      }
      &2 {
        color: #909399;
      }
      &3 {
        color: #5f9bff;
      }
    }
    .el-table {
      border-left: 0;
      border-right: 0;
    }
    .circle {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 4px;
      background: #dcdfe6;
    }
    .content {
      display: flex;
      align-items: center;
      .tag {
        margin-left: 3px;
        display: inline-flex;
        background-color: #f5ca49;
        color: #fff;
        font-size: $global-font-size-12;
        justify-content: center;
        align-items: center;
        line-height: 16px;
        border-radius: 3px;
        span {
          white-space: nowrap;
          transform: scale(0.8);
        }
      }
    }
    ::v-deep .el-radio__label {
      padding-left: 0;
    }
    .footer {
      margin-top: 10px;
      text-align: end;
      .el-pagination {
        padding: 0;
      }
    }
  }
}
</style>
