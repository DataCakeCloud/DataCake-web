<template>
  <div class="sql-tips">
    <div class="title1" style="margin-bottom: 5px">表达式中的tomorrow、yesterday等都是基于平台（入参时间execution_date）计算</div>
    <el-table :data="gridData" size="mini" :cell-style="{ padding: '4px 0' }">
      <el-table-column property="expression" label="参数">
        <template slot-scope="scope">
          <span>
            {{ scope.row.expression }}
            <el-tooltip effect="dark" content="点击复制" class="preview-header" placement="top">
              <i class="el-icon-copy-document" @click.stop="copyText(scope.row.expression)"></i>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column property="mean" label="含义"></el-table-column>
    </el-table>
    <div style="margin-top: 5px">其他情况请参考：</div>
    <div><a href="https://shimo.im/docs/pmkxQmWOO4COMKAN#anchor-vxmb" target="_blank">https://shimo.im/docs/pmkxQmWOO4COMKAN#anchor-vxmb</a></div>
    <!-- <div style="margin-top: 5px">我们推荐使用该写法</div>
    <div>说明：</div>
    <div>execution_date 表示任务的入参时间，小时任务为每小时的0分，天级别的任务为每天0点0分，周任务为每周一的0点0分，月度任务为每月1号的0点0分</div>
    <div>macros.timedelta(hours=8) 表示所需时间和入参时间的差值</div>
    <div>strftime("%Y%m%d") 表示需要什么格式，譬如现在获取的格式是 20200108 eg：如果需要2020-01-08 ，则可写成strftime("%Y-%m-%d")</div>
    <div>例子：</div>
    <div>{{ text }} <b>注意，符号一定要使用英文字符</b></div> -->
  </div>
</template>
<script>
import copy from 'copy-to-clipboard';
export default {
  name: 'SqlTips',
  data() {
    return {
      text: "{{ (execution_date - macros.timedelta(days=1)).strftime('%Y%m%d') }}",
      gridData: [
        // {
        //   expression: '{{ execution_date }}',
        //   mean: 'the execution_date, (datetime.datetime)'
        // },
        // {
        //   expression: '{{ prev_execution_date }}',
        //   mean: 'the previous execution date (if available)(datetime.datetime)'
        // },
        // {
        //   expression: '{{ next_execution_date }}',
        //   mean: 'the next execution date (datetime.datetime)'
        // }
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
          expression: '{{ yesterday_ds.strftime("%Y-%m-%d %H:%M:%S") }} ',
          mean: 'yesterday’s date as YYYY-MM-DD HH:mm:ss'
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
          expression: '{{ execution_date.strftime("%Y-%m-%d %H:%M:%S") }}',
          mean: 'the execution date as YYYY-MM-DD HH:MM:SS'
        }
        // {
        //   expression: '{{ ts }}',
        //   mean: 'same as execution_date.isoformat()'
        // },
        // {
        //   expression: '{{ ts_nodash }}',
        //   mean: 'same as ts without - and :'
        // },
        // {
        //   expression: '{{ execution_date }}',
        //   mean: 'the execution_date, (datetime.datetime)'
        // },
        // {
        //   expression: '{{ prev_execution_date }}',
        //   mean: 'the previous execution date (if available)(datetime.datetime)'
        // },
        // {
        //   expression: '{{ next_execution_date }}',
        //   mean: 'the next execution date (datetime.datetime)'
        // },
        // {
        //   expression: '{{ prev_2_execution_date }}',
        //   mean: `the previous  pre_execution_date (if available)(datetime.datetime) timezone: UTC+8, BEIJING`
        // },
        // {
        //   expression: '{{ ds_utc0 }}',
        //   mean: `the execution date as YYYY-MM-DD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ ds_nodash_utc0 }}',
        //   mean: `the execution date as YYYYMMDD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ yesterday_ds_utc0 }}',
        //   mean: `yesterday’s date as YYYY-MM-DD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ yesterday_ds_nodash_utc0 }}',
        //   mean: `yesterday’s date as YYYYMMDD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ tomorrow_ds_utc0 }}',
        //   mean: `tomorrow’s date as YYYY-MM-DD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ tomorrow_ds_nodash_utc0 }}',
        //   mean: `tomorrow’s date as YYYYMMDD timezone: UTC+0`
        // },
        // {
        //   expression: '{{ execution_date_utc0 }}',
        //   mean: `the execution_date, (datetime.datetime) timezone: UTC+0`
        // },
        // {
        //   expression: '{{ prev_execution_date_utc0 }}',
        //   mean: `the previous execution date (if available)(datetime.datetime) timezone: UTC+0`
        // },
        // {
        //   expression: '{{ next_execution_date_utc0 }}',
        //   mean: `the next execution date (datetime.datetime) timezone: UTC+0`
        // },
        // {
        //   expression: '{{ prev_2_execution_date_utc0 }}',
        //   mean: `the previous  pre_execution_date_utc0 (if available)(datetime.datetime) timezone: UTC+0`
        // }
      ]
    };
  },
  methods: {
    copyText(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.sql-tips {
  // display: inline-block;
  .reference-btn {
    font-size: $global-font-size-12;
    color: #e6a23c;
    cursor: pointer;
    margin-right: 10px;
  }
}
.el-icon-copy-document {
  cursor: pointer;
}
</style>
