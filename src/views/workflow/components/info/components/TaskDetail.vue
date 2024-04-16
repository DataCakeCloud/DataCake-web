<template>
  <el-drawer :visible.sync="drawer" :title="data.name" :append-to-body="true" direction="rtl" :show-close="false">
    <div class="info-wrap">
      <h3>基础信息</h3>
      <div><span>任务名称：</span>{{ data.taskName || '-' }}</div>
      <div><span>任务ID：</span>{{ data.taskID || '-' }}</div>
      <div><span>任务owner：</span>{{ data.owner || '-' }}</div>
      <div><span>更新时间：</span>{{ data.updateTime | dataTime }}</div>
      <div><span>实例ID：</span>{{ data.taskinstanceID || '-' }}</div>
      <div><span>运行状态：</span>{{ data.state || '-' }}</div>
      <div><span>运行次数：</span>{{ data.tryNumber }}</div>
      <div><span>执行入参时间：</span>{{ data.executionDate | dataTime }}</div>
      <div><span>任务开始时间：</span>{{ data.startDate | dataTime }}</div>
      <div><span>任务结束时间：</span>{{ data.endDate | dataTime }}</div>
      <div><span>任务耗时：</span>{{ (data.duration * 1000) | duration }}</div>
      <el-button type="primary" size="mini" @click="clickGenie(data.genieJobUrl)">查看genie日志</el-button>
    </div>
    <div class="info-wrap">
      <h3>调度信息</h3>
      <div>{{ data.crontab }}</div>
    </div>
    <div class="info-wrap">
      <h3>集群资源配置</h3>
      <div><span>集群类型：</span>{{ data.clusterType }}</div>
      <div><span>集群资源大小：</span>{{ data.clusterResources }}</div>
    </div>
    <div class="info-wrap">
      <h3>报警策略</h3>
      <div>
        <span>报警类型：</span>
        <span v-for="item in data.alertType" :key="item">{{ alertTypeText[item] }}</span>
      </div>
      <div>
        <span>报警方式：</span>
        <span v-for="item in data.alertMethod" :key="item">{{ alertMethodText[item] }}</span>
      </div>
    </div>
  </el-drawer>
</template>
<script>
export default {
  name: 'TaskDetail',
  data() {
    return {
      drawer: false,
      data: {},
      alertTypeText: {
        1: '成功',
        2: '失败',
        4: '开始'
      },
      alertMethodText: {
        dingTalk: '钉钉',
        phone: '电话'
      }
    };
  },
  methods: {
    showWin(data) {
      this.drawer = true;
      this.data = data;
    },
    clickGenie(url) {
      window.open(url);
    }
  }
};
</script>
<style lang="scss" scoped>
.info-wrap {
  color: #333;
  padding: 10px;
  div {
    color: #2c3b5e;
    margin: 10px 0;
  }
}
</style>
