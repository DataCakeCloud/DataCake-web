<template>
  <el-popover class="sql-tips" popper-class="h2hsql-tips" :placement="placement" width="700" trigger="click">
    <div class="reg-box">
      <div style="font-weight: bold">Tips:</div>
      <div><span>.</span> - 除换行符以外的所有字符。</div>
      <div><span>^</span> - 字符串开头。</div>
      <div><span>$</span> - 字符串结尾。</div>
      <div><span>\d</span>,<span>\w</span>,<span>\s</span> - 匹配数字、字符、空格。</div>
      <div><span>\D</span>,<span>\W</span>,<span>\S</span> - 匹配非数字、非字符、非空格。</div>
      <div><span>[abc]</span> - 匹配 a、b 或 c 中的一个字母。</div>
      <div><span>[a-z]</span> - 匹配 a 到 z 中的一个字母。</div>
      <div><span>[^abc]</span> - 匹配除了 a、b 或 c 中的其他字母。</div>
      <div><span>aa|bb</span> - 匹配 aa 或 bb。</div>
      <div><span>?</span> - 0 次或 1 次匹配。</div>
      <div><span>*</span> - 匹配 0 次或多次。</div>
      <div><span>+</span> - 匹配 1 次或多次。</div>
      <div><span>{n}</span> - 匹配 n次。</div>
      <div><span>{n,}</span> - 匹配 n次以上。</div>
      <div><span>{m,n}</span> - 最少 m 次，最多 n 次匹配。</div>
      <div><span>(</span>expr<span>)</span> - 捕获 expr 子模式,以 <span>\1</span> 使用它。</div>
      <div><span>(?:</span>expr<span>)</span> - 忽略捕获的子模式。</div>
      <div><span>(?=</span>exprr<span>)</span> - 正向预查模式 expr。</div>
      <div><span>(?!</span>expr<span>)</span> - 负向预查模式 expr。</div>
    </div>
    <span slot="reference" class="reference-btn">语法参考</span>
    <!-- <div style="margin-bottom: 5px">jinja 表达式中的tomorrow、yesterday等都是基于execution_date（入参时间）计算</div>
    <el-table :data="gridData" size="mini" :cell-style="{ padding: '4px 0' }">
      <el-table-column min-width="235" property="expression" label="JINJA表达式"></el-table-column>
      <el-table-column min-width="420" property="mean" label="含义"></el-table-column>
    </el-table>
    <div style="margin-top: 5px">我们推荐使用该写法</div>
    <div>例子：</div>
    <div>{{ text }} <b>注意，符号一定要使用英文字符</b></div>
    <span slot="reference" class="reference-btn">语法参考</span>
    <div>说明：</div>
    <div>execution_date 表示任务的入参时间，小时任务为每小时的0分，天级别的任务为每天0点0分，周任务为每周一的0点0分，月度任务为每月1号的0点0分</div>
    <div>macros.timedelta(hours=8) 表示所需时间和入参时间的差值</div>
    <div>strftime("%Y%m%d") 表示需要什么格式，譬如现在获取的格式是 20200108 eg：如果需要2020-01-08 ，则可写成strftime("%Y-%m-%d")</div> -->
  </el-popover>
</template>
<script>
export default {
  name: 'SqlTips',
  props: {
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  data() {
    return {
      text: "{{ (execution_date - macros.timedelta(days=1)).strftime('%Y%m%d') }}",
      gridData: [
        {
          expression: '{{ ds }}',
          mean: 'the execution date as YYYY-MM-DD'
        },
        {
          expression: '{{ ds_nodash }}',
          mean: 'the execution date as YYYYMMDD'
        },
        {
          expression: '{{ yesterday_ds }}',
          mean: 'yesterday’s date as YYYY-MM-DD'
        },
        {
          expression: '{{ yesterday_ds_nodash }}',
          mean: 'yesterday’s date as YYYYMMDD'
        },
        {
          expression: '{{ tomorrow_ds }}',
          mean: 'tomorrow’s date as YYYY-MM-DD'
        },
        {
          expression: '{{ tomorrow_ds_nodash }}',
          mean: 'tomorrow’s date as YYYYMMDD'
        },
        {
          expression: '{{ ts }}',
          mean: 'same as execution_date.isoformat()'
        },
        {
          expression: '{{ ts_nodash }}',
          mean: 'same as ts without - and :'
        },
        {
          expression: '{{ execution_date }}',
          mean: 'the execution_date, (datetime.datetime)'
        },
        {
          expression: '{{ prev_execution_date }}',
          mean: 'the previous execution date (if available)(datetime.datetime)'
        },
        {
          expression: '{{ next_execution_date }}',
          mean: 'the next execution date (datetime.datetime)'
        },
        {
          expression: '{{ prev_2_execution_date }}',
          mean: `the previous  pre_execution_date (if available)(datetime.datetime) timezone: UTC+8, BEIJING`
        },
        {
          expression: '{{ ds_utc0 }}',
          mean: `the execution date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ ds_nodash_utc0 }}',
          mean: `the execution date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ yesterday_ds_utc0 }}',
          mean: `yesterday’s date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ yesterday_ds_nodash_utc0 }}',
          mean: `yesterday’s date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ tomorrow_ds_utc0 }}',
          mean: `tomorrow’s date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ tomorrow_ds_nodash_utc0 }}',
          mean: `tomorrow’s date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ execution_date_utc0 }}',
          mean: `the execution_date, (datetime.datetime) timezone: UTC+0`
        },
        {
          expression: '{{ prev_execution_date_utc0 }}',
          mean: `the previous execution date (if available)(datetime.datetime) timezone: UTC+0`
        },
        {
          expression: '{{ next_execution_date_utc0 }}',
          mean: `the next execution date (datetime.datetime) timezone: UTC+0`
        },
        {
          expression: '{{ prev_2_execution_date_utc0 }}',
          mean: `the previous  pre_execution_date_utc0 (if available)(datetime.datetime) timezone: UTC+0`
        }
      ]
    };
  }
};
</script>
<style scoped lang="scss">
.sql-tips .reference-btn {
  font-size: $global-font-size-12;
  color: #e6a23c;
  cursor: pointer;
  margin-right: 10px;
}
.reg-box {
  div {
    margin-bottom: 5px;
    span {
      color: #e6a23c;
    }
  }
}
</style>
<style lang="scss">
.h2hsql-tips {
  width: 360px !important;
}
</style>
