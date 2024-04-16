<template>
  <div class="form-head">
    <!-- <el-form-item required>
      <template #label>
        <span>{{ $lang('运行模式') }}<i class="el-icon-info" style="cursor: pointer" @click="modeVisible = !modeVisible"></i></span>
      </template>
      <el-radio-group v-model="configForm.executeMode">
        <el-radio label="local">{{ $lang('本地模式') }}</el-radio>
        <el-radio label="distribution">{{ $lang('分布式模式') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-info v-model="modeVisible" :title="$lang('运行模式介绍')">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <p>{{ $lang('支持本地模式与分布式模式；') }}</p>
        <p>
          <span style="font-weight: 550">{{ $lang('本地模式：') }}</span>{{ $lang('通过固定路由提交到本地机器上执行；') }}
        </p>
        <p>
          <span style="font-weight: 550">{{ $lang('分布式模式：') }}</span>{{ $lang('适用于海量数据处理的任务，提交到分布式集群上执行；') }}
        </p>
      </div>
    </el-info> -->
    <el-form-item :label="$t('task.region')" prop="sourceRegion">
      <template #label>
        <span>{{ $t('task.region') }}</span>
        <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
          <i class="el-icon-info" style="cursor: pointer"></i>
        </el-tooltip>
      </template>
      <el-select v-model="configForm.sourceRegion" class="area-select" :placeholder="$t('task.dbTip2')" clearable>
        <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>
<script>
import * as tools from '@/utils/tools';
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
    return {
      regionList: tools.regionList,
      modeVisible: false
    };
  },
  watch: {
    'configForm.executeMode': {
      handler(val) {
        this.configForm.executeEngine = val === 'local' ? 'seatunnel' : 'spark';
      },
      immediate: true
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
  }
};
</script>
<style lang="scss" scoped>
.form-head {
  margin: 15px 0;
  .el-form-item {
    width: 100%;
    display: flex;
    justify-content: center;
    ::v-deep .el-form-item__content {
      margin-left: 10px !important;
      width: 230px;
    }
  }
}
</style>
