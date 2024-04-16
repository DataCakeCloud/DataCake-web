<template>
  <el-card class="dashboard-card statis-card">
    <div class="title">
      <span class="item">查询概况统计</span>
      <div class="title_right">
        <el-select v-if="isAdmin" v-model="userGroup" clearable placeholder="请选择用户组" size="mini" @change="handleChange">
          <el-option v-for="(item, index) in groups" :key="index" :label="item.name" :value="item.uuid"></el-option>
        </el-select>
        <el-select v-model="recent" placeholder="请选择时间周期" size="mini" style="width: 80px" @change="handleChange">
          <el-option v-for="(item, index) in viewList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <el-empty v-if="!num && (!list.length || (list.length && !list[0].data.length && !list[1].data.length)) && !loading" description="无查询概况统计数据"></el-empty>
    <div v-else v-loading="loading" class="overview">
      <div class="view">
        <div v-if="!loading" class="s-left">
          <div class="big-text">
            <span>{{ num }}</span> 个
          </div>
          <div class="mini-text">查询任务数</div>
          <el-divider></el-divider>
          <div class="hori-text">
            <span>环比</span>
            <span class="ratio">{{ ratio }}</span>
          </div>
        </div>
        <div class="s-right">
          <el-empty v-if="!list.length || (list.length && !list[0].data.length && !list[1].data.length && !loading)" description="无查询概况统计图表数据" :image-size="90"></el-empty>
          <QueryChart v-show="list.length && (list[0].data.length || list[1].data.length) && !loading" :list="list"></QueryChart>
        </div>
      </div>
      <div v-if="(totalDuration.avg || totalDuration.P90 || success || scan.avg || scan.P90) && !loading" class="data-view">
        <div class="view-item">
          <div class="text el-icon-files">任务时长 (s)</div>
          <div class="s-data">
            <span>AVG: {{ totalDuration.avg }}</span>
            <span>P90: {{ totalDuration.P90 }}</span>
          </div>
        </div>
        <div class="view-item">
          <div class="text el-icon-success">成功率</div>
          <div class="data">{{ success }}</div>
        </div>
        <div class="view-item">
          <div class="text el-icon-search">扫描量 (MB)</div>
          <div class="s-data">
            <span>AVG: {{ scan.avg }}</span>
            <span>P90: {{ scan.P90 }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import QueryChart from './queryChart';
import { queryStatistics } from '@/api/dashboard';
import { mapGetters } from 'vuex';
export default {
  name: 'QueryOverView',
  components: {
    QueryChart
  },
  props: {
    groups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      viewList: this.$t('dashboard.viewList'),
      userGroup: '',
      recent: 0,
      num: 94,
      success: '98%',
      ratio: '53%',
      totalDuration: {
        P90: 42.93,
        avg: 28.11
      },
      scan: {
        P90: 692.32,
        avg: 8797.56
      },
      list: [
        {
          name: '查询任务数',
          data: [
            {
              dt: '2022-09-09',
              num: 2022
            },
            {
              dt: '2022-09-08',
              num: 2023
            },
            {
              dt: '2022-09-10',
              num: 3444
            },
            {
              dt: '2022-09-11',
              num: 3345
            }
          ]
        },
        {
          name: '扫描数据量',
          data: [
            {
              dt: '2022-09-09',
              num: 2022
            },
            {
              dt: '2022-09-08',
              num: 2023
            },
            {
              dt: '2022-09-10',
              num: 8338
            },
            {
              dt: '2022-09-11',
              num: 7464
            }
          ]
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'currentUserGroup'])
  },
  created() {
    this.queryStatistics();
  },
  methods: {
    queryStatistics() {
      if (!Object.keys(this.currentUserGroup).length) return;
      this.loading = true;
      const params = {
        recent: this.recent,
        userGroup: this.isAdmin ? this.userGroup : this.currentUserGroup?.uuid || ''
      };
      queryStatistics(params)
        .then(res => {
          const data = res.data;
          this.ratio = data.ratio;
          this.num = data.num;
          this.totalDuration = data.totalDuration;
          this.scan = data.scan;
          this.success = data.success;
          this.list = data.list;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleChange(val) {
      this.queryStatistics();
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped src="./view.scss"></style>
