<template>
  <el-card class="box-card-container">
    <el-page-header class="page-header" content="监控详情" @back="goBack"></el-page-header>
    <el-card>
      <div slot="header" class="clearfix">
        <span>监控维度：{{ $t('cost.dimensionList').find(e => e.value === monitorLevel)['name'] }}</span>
      </div>
      <!-- 筛选条件 -->
      <el-form :inline="true" :model="params" label-position="left" label-width="120px">
        <el-form-item v-if="type !== 1" prop="ratio" label="用量告警阈值:">{{ params.ratio }}%</el-form-item>
        <el-form-item prop="departments">
          <el-select v-if="monitorLevel === 1" v-model="params.departments" multiple collapse-tags :clearable="true" placeholder="请选择部门" @change="noticeList">
            <template v-for="(item, index) in trendList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="pus">
          <el-select v-if="monitorLevel === 2" v-model="params.pus" multiple collapse-tags :clearable="true" placeholder="请选择pu" @change="noticeList">
            <template v-for="(item, index) in trendList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="owners">
          <el-select v-if="monitorLevel === 3" v-model="params.owners" multiple collapse-tags :clearable="true" placeholder="请选择owner" @change="noticeList">
            <template v-for="(item, index) in trendList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="jobs">
          <el-select v-if="monitorLevel === 4" v-model="params.jobs" multiple collapse-tags :clearable="true" placeholder="请选择任务" style="min-width: 500px" @change="noticeList">
            <template v-for="(item, index) in trendList">
              <el-option :key="index" :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="dates">
          <CustomDate v-model="params.dates" @updateDate="updateDate"></CustomDate>
        </el-form-item>
      </el-form>
      <!-- 列表数据 -->
      <el-empty v-if="!body.length && !loading" description="无报表数据"></el-empty>
      <template v-else>
        <Table1 v-if="type === 1 && monitorLevel === 1" :loading="loading" :body="body"></Table1>
        <Table2 v-if="type === 1 && monitorLevel === 2" :loading="loading" :body="body"></Table2>
        <Table3 v-if="type === 1 && monitorLevel === 3" :loading="loading" :body="body"></Table3>
        <Table4 v-if="type === 2 && monitorLevel === 1" :loading="loading" :body="body" @handleSort="handleSort"></Table4>
        <Table5 v-if="type === 2 && monitorLevel === 2" :loading="loading" :body="body" @handleSort="handleSort"></Table5>
        <Table6 v-if="type === 2 && monitorLevel === 3" :loading="loading" :body="body" @handleSort="handleSort"></Table6>
        <Table7 v-if="type === 2 && monitorLevel === 4" :loading="loading" :body="body" @handleSort="handleSort"></Table7>
        <Table8 v-if="type === 3 && monitorLevel === 1" :loading="loading" :body="body" @handleSort="handleSort"></Table8>
        <Table9 v-if="type === 3 && monitorLevel === 2" :loading="loading" :body="body" @handleSort="handleSort"></Table9>
        <Table10 v-if="type === 3 && monitorLevel === 3" :loading="loading" :body="body" @handleSort="handleSort"></Table10>
        <Table11 v-if="type === 3 && monitorLevel === 4" :loading="loading" :body="body" @handleSort="handleSort"></Table11>
        <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </template>
    </el-card>
  </el-card>
</template>

<script>
import { noticeList, listDictionary } from '@/api/cost';
import CustomDate from './customDate';
import { parseDate } from '@/utils/';
import { mapGetters } from 'vuex';
import Table1 from './tables/table1';
import Table2 from './tables/table2';
import Table3 from './tables/table3';
import Table4 from './tables/table4';
import Table5 from './tables/table5';
import Table6 from './tables/table6';
import Table7 from './tables/table7';
import Table8 from './tables/table8';
import Table9 from './tables/table9';
import Table10 from './tables/table10';
import Table11 from './tables/table11';
export default {
  name: 'MonitorDetail',
  components: {
    CustomDate,
    Table1,
    Table2,
    Table3,
    Table4,
    Table5,
    Table6,
    Table7,
    Table8,
    Table9,
    Table10,
    Table11
  },
  data() {
    const query = this.$route.query;
    return {
      loading: false,
      body: [],
      trendList: [],
      total: 0,
      type: parseInt(query.type),
      monitorLevel: parseInt(query.monitorLevel),
      params: {
        id: parseInt(query.id) || null,
        ratio: query.ratio,
        shareitId: query.shareitId,
        dates: [query.dates] || [parseDate(new Date().getTime() - 86400 * 1000)],
        owners: query.owners || [],
        departments: query.departments || [],
        pus: query.pus || [],
        jobs: query.jobs || [],
        sort: '',
        order: '',
        pageNum: 1,
        pageSize: 10
      },
      logintime_detail: Date.now(),
      staytime_detail: Date.now()
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'params.dates'(val) {
      if (!val.length) return;
      this.noticeList();
    }
  },
  created() {
    this.listDictionary();
    this.noticeList();

    this.$report({
      userId: this.userInfo.userId,
      logintime_detail: this.logintime_detail,
      type: this.$t('cost.typeList').find(e => e.value === this.type)['name'],
      monitorLevel: this.$t('cost.dimensionList').find(e => e.value === this.monitorLevel)['name']
    });
  },
  beforeRouteLeave(to, from, next) {
    this.$report({
      userId: this.userInfo.userId,
      staytime_detail: Date.now() - this.staytime_detail,
      type: this.$t('cost.typeList').find(e => e.value === this.type)['name'],
      monitorLevel: this.$t('cost.dimensionList').find(e => e.value === this.monitorLevel)['name']
    });

    next();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'CostMonitor' });
    },
    listDictionary() {
      const params =
        this.monitorLevel === 4
          ? {
            id: this.params.id,
            type: this.monitorLevel,
            name: this.userInfo.userId || ''
          }
          : {
            id: this.params.id,
            type: this.monitorLevel
          };
      listDictionary(params).then(res => {
        const data = res.data;
        this.trendList = data || [];
      });
    },
    noticeList() {
      this.loading = true;
      const params = Object.assign({}, this.params);
      params.dates = params.dates.length ? params.dates : [parseDate(new Date().getTime() - 86400 * 1000)];
      noticeList(params).then(res => {
        this.loading = false;
        const data = res.data;
        this.body = data.list;
        this.params.pageNum = data.pageNum;
        this.params.pageSize = data.pageSize;
        this.total = data.total;
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.noticeList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.noticeList();
    },
    handleSort(column) {
      this.params.sort = column.order || '';
      this.params.order = column.prop;

      this.noticeList();
    },
    updateDate(val) {
      this.params.dates = [val];
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.page-header {
  margin-bottom: 15px;
}
</style>
