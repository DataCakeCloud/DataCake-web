<template>
  <el-popover trigger="hover" placement="bottom">
    <div>
      （1）未开始：本周期内，监控尚未启动（而非调度任务未启动）。<br />
      （2）已成功：本周期内，第一次监控，结果为已成功。<br />
      （3）未恢复：本周期内，最新一次监控，结果为失败。<br />
      （4）已恢复：本周期内，该监控曾经失败，但是最新一次监控结果为成功。<br />
      注：<br />
      1. 本周期以0点开始，状态重置。比如监控基线是9点，则在此之前状态应该都是未开始。<br />
      2. 本周期内，只要出现成功的监控，将不再监控。该监控的状态，在本周期内也将锁定。<br />
      3. 查询如果是执行中，状态为当天的上一次的状态。
    </div>
    <i slot="reference" class="el-icon-question"></i>
  </el-popover>
</template>
<script>
export default {
  name: 'MonitorStatusTips',
  data() {
    return {};
  }
};
</script>
<style lang="scss" scoped></style>
