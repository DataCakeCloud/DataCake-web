<template>
  <div class="offset-tips">
    <div>
      <div class="title1">偏移量设置说明：</div>
      <div>1）含义：</div>
      <div>当前任务的执行入参时间与上游任务(即下表每行的任务)的执行入参时间相差多少个周期(月/周/天/时)；</div>
      <div>2）效果：</div>
      <div>当前任务入参时间 + 偏移量 * 被依赖任务的周期 = 被依赖任务的入参时间。</div>
      <div>3）举例（如下图）:</div>
      <div>当前任务B依赖任务A，今天为 11月18日，入参时间为 11月18日，</div>
      <ul style="margin-left: 5px; list-style-type: none">
        <li>-- 如果偏移量为0，A 任务入参时间 = 11月18日 + 0 = 11月18日</li>
        <li>-- 如果偏移量为-1，A任务入参时间 = 11月18日 -1 = 11月17日</li>
      </ul>
    </div>
    <img src="@/assets/offset_tips.png" alt="偏移量" style="width: 550px" /><br />
    <el-button type="text" size="mini" @click="link">更多配置请参考</el-button>
  </div>
</template>
<script>
export default {
  name: 'OffsetTips',
  data() {
    return {};
  },
  methods: {
    link() {
      window.open('https://shimo.im/docs/pmkxQmWOO4COMKAN#anchor-rUMI', '_blank');
    }
  }
};
</script>
<style lang="scss" scoped>
.offset-tips {
  display: inline-block;
  .reference-btn {
    font-size: $global-font-size-12;
    color: #e6a23c;
    cursor: pointer;
    margin-right: 10px;
  }
}
.offset-text {
  white-space: pre-wrap;
}
</style>
