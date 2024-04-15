<template>
  <el-card class="dashboard-card statis-card2">
    <div class="title">
      <span class="item">任务概况统计</span>
      <div class="title_right">
        <el-select v-if="isAdmin" v-model="userGroup" clearable placeholder="请选择用户组" size="mini" @change="handleChange">
          <el-option v-for="(item, index) in groups" :key="index" :label="item.name" :value="item.uuid"></el-option>
        </el-select>
        <el-select v-model="recent" placeholder="请选择时间周期" size="mini" style="width: 80px" @change="handleChange">
          <el-option v-for="(item, index) in viewList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <el-empty v-if="!totalOnline && !fail && !loading" description="无任务概况统计数据"></el-empty>
    <div v-else v-loading="loading" class="overview_2">
      <!-- <div class="view">
        <div v-if="!loading" class="s-left">
          <div class="big-text">
            <span>{{ score }}</span> 分
          </div>
          <div class="mini-text">任务平均分</div>
          <el-divider></el-divider>
          <div class="hori-text">
            <span>环比</span>
            <span class="ratio">{{ ratio }}</span>
          </div>
        </div>
        <div class="s-right">
          <el-empty v-if="!list.length || (list.length && !list[0].data.length && !list[1].data.length && !loading)" description="无任务概况统计图表数据" :image-size="90"></el-empty>
          <JobChart v-show="list.length && (list[0].data.length || list[1].data.length) && !loading" :list="list" :loading="loading"></JobChart>
        </div>
      </div> -->
      <div v-if="(totalOnline || success || fail) && !loading" class="data-view no_border">
        <div class="view-item">
          <div class="text el-icon-files">上线任务总数</div>
          <div class="data">{{ totalOnline || '-' }}</div>
        </div>
        <div class="view-item">
          <div class="text el-icon-success">成功率</div>
          <div class="data">{{ success || '-' }}</div>
        </div>
        <div class="view-item">
          <div class="text el-icon-error">失败率</div>
          <div class="data">{{ fail || '-' }}%</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
// import JobChart from './jobChart';
import { taskStatistics } from '@/api/dashboard';
import { mapGetters } from 'vuex';
export default {
  name: 'JobOverView',
  components: {
    // JobChart
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
      ratio: '8%',
      score: 98,
      totalOnline: 7483,
      success: '87.84%',
      fail: 334,
      list: [
        {
          name: '任务总数',
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
          name: '任务用量',
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
    this.taskStatistics();
  },
  methods: {
    taskStatistics() {
      if (!Object.keys(this.currentUserGroup).length) return;
      this.loading = true;
      const params = {
        recent: this.recent,
        userGroup: this.isAdmin ? this.userGroup : this.currentUserGroup.uuid
      };
      taskStatistics(params)
        .then(res => {
          const data = res.data;
          this.ratio = data.ratio;
          this.score = data.score;
          this.totalOnline = data.totalOnline;
          this.success = data.success;
          this.fail = data.fail;
          this.list = data.list || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleChange(val) {
      this.taskStatistics();
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped src="./view.scss"></style>
