<template>
  <div class="sql-tips">
    <div class="title" style="margin-bottom: 5px">
      注：当您触发“刷新源表字段”后，下方列表字段将获取源表最新schema信息。如果源表字段发生过变更，将会标记"变更"提示，此时，您需要根据此变更标记去修改目标表相应的字段（如果已经提前处理目标表schema则无需关注），处理目标表schema后，再保存此任务，下次运行将会正常同步。
      <p class="next-line">当前平台侧尚不支持DDL变更后自动同步，若源表schema与目标表schema不一致，写入目标表的策略如下所示：</p>
    </div>
    <el-table :data="gridData" size="mini" :header-cell-style="{ 'text-align': 'center' }">
      <el-table-column prop="expression" label="来源端发生的表结构变化" align="center" max-width="120"></el-table-column>
      <el-table-column label="目标数据库同步策略">
        <el-table-column prop="mean" label="任务不修改的情况下" align="center" max-width="130">
          <template slot-scope="scope">
            <div>
              {{ scope.row.mean1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mean" label="任务修改的情况下" min-width="200px">
          <template slot-scope="scope">
            <div>
              {{ scope.row.mean2 }}
            </div>
            <div>
              {{ scope.row.mean3 }}
            </div>
            <div>
              {{ scope.row.mean4 }}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'SqlTips',
  data() {
    return {
      text: "{{ (execution_date - macros.timedelta(days=1)).strftime('%Y%m%d') }}",
      gridData: [
        {
          expression: '表字段删除',
          mean1: '执行会报错',
          mean2: '如果想让任务仍然执行成功，您需要：',
          mean3: '1）通过"数据分析"模块手动执行sql以删除LakeHouse表同名字段；',
          mean4: '2）修改任务，进入step2点击"刷新源表字段"后，"字段映射"会展示最新的源表schema（目标字段自动与源表映射一致），保存任务例行即可；'
        },
        {
          expression: '表字段新增',
          mean1: '正常执行',
          mean2: '如果想要同步新增的源字段，您需要：',
          mean3: '1）修改任务，进入step2点击"刷新源表字段"后，"字段映射"会展示最新的源表schema（目标字段自动与源表映射一致），保存任务例行即可；'
        },
        {
          expression: '表字段修改',
          mean1: '执行会报错',
          mean2: '如果想让任务仍然执行成功，您需要：',
          mean3: '1）通过"数据分析"模块手动执行sql以修改LakeHouse表同名字段，使其与源表字段保持一致；',
          mean4: '2）修改任务，进入step2点击"刷新源表字段"后，"字段映射"会展示最新的源表schema（目标字段自动与源表映射一致），保存任务例行即可；'
        }
      ]
    };
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
  .next-line {
    text-indent: 2em;
  }
}
</style>
