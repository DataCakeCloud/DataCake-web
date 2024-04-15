<template>
  <el-card>
    <el-page-header class="page-header" content="我的监控" @back="goBack"></el-page-header>
    <el-card class="box-card-container">
      <div slot="header" class="clearfix">
        <span>监控数量</span>
        <el-button type="text" style="float: right" @click="handleCreate">新建监控</el-button>
      </div>

      <el-empty v-if="!body.length && !loading" description="无报表数据"></el-empty>
      <el-table v-else v-loading="loading" :data="body" style="width: 100%" highlight-current-row border>
        <el-table-column label="监控名称" align="center">
          <template slot-scope="scope">
            <a href="javascript:;" @click="handleNameList(scope.row)">{{ scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column label="监控类型" align="center">
          <template slot-scope="scope">
            {{ $t('cost.typeList').find(e => e.value === scope.row.type)['name'] }}
          </template>
        </el-table-column>
        <el-table-column label="监控维度" align="center">
          <template slot-scope="scope">
            {{ $t('cost.dimensionList').find(e => e.value === scope.row.monitorLevel)['name'] }}
          </template>
        </el-table-column>
        <el-table-column label="通知频率" align="center">
          <template slot-scope="scope">
            {{ getFrep(scope.row.frep) }}
          </template>
        </el-table-column>
        <el-table-column label="通知方式" align="center"> 钉钉 </el-table-column>
        <el-table-column label="创建人" prop="createShareitId" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确认删除吗？" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row)">
              <el-button slot="reference" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CreateMonitor :visible.sync="createMonitorVisible" :edit-data="editData" @updateList="handleUpdate"></CreateMonitor>
  </el-card>
</template>

<script>
import CreateMonitor from './components/createMonitor';
import { jobList, jobDelete } from '@/api/cost';
import { parseDate } from '@/utils/';
import { mapGetters } from 'vuex';
export default {
  name: 'Monitor',
  components: {
    CreateMonitor
  },
  data() {
    return {
      loading: false,
      createMonitorVisible: false,
      demension: 'department',
      editData: {},
      body: [],
      params: {
        id: this.$route.query.id || null
      },
      logintime_monitor: Date.now(),
      staytime_monitor: Date.now()
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    this.jobList();
    this.$report({
      userId: this.userInfo.userId,
      logintime_monitor: this.logintime_monitor
    });
  },
  beforeRouteLeave(to, from, next) {
    this.$report({
      userId: this.userInfo.userId,
      staytime_monitor: Date.now() - this.staytime_monitor
    });

    next();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'CostCenter' });
    },
    handleCreate() {
      this.createMonitorVisible = true;
      this.editData = {};
    },
    handleUpdate() {
      this.jobList();
    },
    getFrep(item) {
      const arr = this.$t('cost.dayList').filter(e => item.find(ee => ee === e.value));
      const str = arr.map(e => e.name).join(',');
      return str;
    },
    jobList() {
      this.loading = true;
      jobList({ shareitId: this.userInfo.userId }).then(res => {
        this.loading = false;
        const data = res.data;
        this.body = data;
      });
    },
    handleNameList(row) {
      this.$router.push({
        name: 'CostMonitorDetail',
        query: {
          type: row.type,
          ratio: row.ratio,
          monitorLevel: row.monitorLevel,
          id: row.id,
          shareitId: row.createShareitId,
          departments: row.dpList || [],
          pus: row.puList || [],
          owners: row.ownerList || [],
          jobs: row.jobList || [],
          dates: parseDate(new Date().getTime() - 86400 * 1000)
        },
        owners: row.ownerList || [],
        departments: row.dpList || [],
        pus: row.puList || [],
        products: [],
        regions: []
      });
    },
    handleEdit(row) {
      this.createMonitorVisible = true;
      this.editData = row;
    },
    handleDelete(row) {
      jobDelete({ id: row.id }).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        this.jobList();
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.page-header {
  margin-bottom: 15px;
}
</style>
