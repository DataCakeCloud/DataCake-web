<template>
  <el-card class="box-card-container">
    <div class="dashboard-box">
      <div v-if="isCloud && userInfo.roles" class="box-left transition" :class="{ close: !guidanceMode }">
        <Guidance></Guidance>
      </div>
      <div class="box-right">
        <el-row :gutter="20">
          <el-col :span="18">
            <Banner></Banner>
          </el-col>
          <el-col :span="6">
            <DynamicState></DynamicState>
          </el-col>
        </el-row>
        <!-- 快捷入口 -->
        <QuickEntry></QuickEntry>

        <!-- 概况 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <QueryOverview :groups="groups"></QueryOverview>
          </el-col>
          <el-col :span="12">
            <JobOverview :groups="groups"></JobOverview>
            <!-- 资产 -->
            <DataProperty></DataProperty>
          </el-col>
        </el-row>

        <!-- <el-row :gutter="20">
          <el-col :span="7">
            <DataProperty></DataProperty>
          </el-col>
          <el-col :span="10">
            <KeyIndex></KeyIndex>
          </el-col>
          <el-col :span="7">
            <SynthetialMark></SynthetialMark>
          </el-col>
        </el-row> -->

        <!-- 表 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <TopTable></TopTable>
          </el-col>
          <el-col :span="12">
            <TopScanQuery :groups="groups"></TopScanQuery>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex';
import Guidance from './components/guidance';
import Banner from './components/banner';
import DynamicState from './components/dynamicState';
import QuickEntry from './components/quickEntry';
import JobOverview from './components/jobOverview';
import QueryOverview from './components/queryOverview';
import DataProperty from './components/dataProperty';
// import KeyIndex from './components/keyIndex';
// import SynthetialMark from './components/synthetialMark';
import TopTable from './components/topTable';
import TopScanQuery from './components/topScanQuery';
import { getGroupPage } from '@/api/jurisdiction';
export default {
  name: 'Dashboard',
  components: {
    Guidance,
    Banner,
    DynamicState,
    QuickEntry,
    JobOverview,
    QueryOverview,
    DataProperty,
    // KeyIndex,
    // SynthetialMark,
    TopTable,
    TopScanQuery
  },
  data() {
    return {
      groups: []
    };
  },
  computed: {
    ...mapGetters(['isCloud', 'guidanceMode', 'userInfo', 'isAdmin'])
  },
  created() {
    this.getGroupPage();
  },
  methods: {
    getGroupPage() {
      const { userGroup = [] } = this.userInfo || {};
      if (!this.isAdmin) {
        this.groups = userGroup;
      } else {
        const params = {
          tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
          name: '',
          pageNum: 1,
          pageSize: 10000
        };
        getGroupPage(params).then(data => {
          this.groups = data.data.list || [];
        });
      }
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.dashboard-box {
  display: flex;

  .box-left {
    flex: 0 0 300px;
    width: 300px;

    &.close {
      flex: 0 0 0;
      width: 0;
      height: 0;
    }
  }

  .box-right {
    flex: 1;
  }
}
</style>
