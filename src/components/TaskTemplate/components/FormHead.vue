<template>
  <div class="form-head">
    <el-form-item label="数据源类型" prop="sourceType">
      <el-select v-model="configForm.sourceType" class="area-select" placeholder="请选择数据源" clearable @change="changeType">
        <el-option v-for="item in dataOriginList" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
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
    return {
      dataOriginList: [
        // { label: 'HDFS', value: 'hdfs' },
        // { label: 'KS3', value: 'ks3' },
        { label: 'OSS', value: 'oss' },
        { label: 'S3', value: 's3' }
      ]
    };
  },
  methods: {
    changeType() {
      this.configForm.sourceId = '';
      this.configForm.sourceParam = {};
    }
  }
};
</script>
<style lang="scss" scoped>
.form-head {
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
