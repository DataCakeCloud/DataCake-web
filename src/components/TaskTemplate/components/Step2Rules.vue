<template>
  <el-tabs class="step2-rules">
    <el-tab-pane :label="$lang('同步规则配置')">
      <!-- <el-form-item :label="$lang('主键冲突')" required>
        <el-radio-group v-model="configForm.taskParam.writeMode">
          <el-radio label="overwrite">{{ $lang('insert overwrite(覆盖写入)') }}</el-radio>
          <el-radio label="append">{{ $lang('insert into(追加写入)') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="sync-num" label="任务并行度" required> <el-input-number v-model="configForm.taskParam.taskParallelism" :min="1" :max="30"></el-input-number></el-form-item> -->
      <el-form-item :label="$lang('限制同步速率')" required>
        <template #label>
          <span>{{ $lang('限制同步速率') }}</span>
          <el-tooltip class="item" effect="dark" :content="$lang('它指定了每秒钟从源数据源读取和写入到目标数据源的数据量。')" placement="top">
            <i class="el-icon-info" style="cursor: pointer"></i>
          </el-tooltip>
        </template>
        <el-radio-group v-model="configForm.taskParam.isLimit">
          <el-radio :label="false">{{ $lang('否') }}</el-radio>
          <el-radio :label="true">{{ $lang('是') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="configForm.taskParam.isLimit" class="sync-num" label="同步速率" required> <el-input-number v-model="configForm.taskParam.bandwidth" :min="1"></el-input-number> MB/S </el-form-item>
      <!-- <el-form-item class="sync-num" label="每次同步最大数据量" required> <el-input-number v-model="configForm.taskParam.batchSize" :min="1"></el-input-number> Byte </el-form-item> -->
      <!-- <el-form-item class="sync-num" label="每次同步最大行数" required> <el-input-number v-model="configForm.taskParam.maxBatchRows" :min="1"></el-input-number></el-form-item> -->
      <!-- <el-form-item class="sync-num" label="写入批次时间间隔" required> <el-input-number v-model="configForm.taskParam.flushInterval" :min="1"></el-input-number> 秒 </el-form-item> -->
    </el-tab-pane>
  </el-tabs>
</template>
<script>
export default {
  name: 'FormHead',
  props: {
    configForm: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {};
  }
};
</script>

<style scoped lang="scss">
.step2-rules {
  margin-top: 20px;
  .sync-num {
    ::v-deep .el-input-number--small {
      width: 30%;
    }
  }
}
</style>
