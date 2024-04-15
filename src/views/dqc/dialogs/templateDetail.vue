<template>
  <el-dialog v-loading="loading" title="规则详情" :visible="visible" width="35%" center :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <el-descriptions :column="1">
      <el-descriptions-item label="模板名">{{ detail.name }}</el-descriptions-item>
      <el-descriptions-item label="规则类型">{{ detail.ruleType }}</el-descriptions-item>
      <el-descriptions-item label="SQL条件">{{ detail.sqlCondition }}</el-descriptions-item>
      <el-descriptions-item label="SQL表达式">{{ detail.sqlStatement }}</el-descriptions-item>
      <el-descriptions-item label="检验类型">{{ detail.checkType }}</el-descriptions-item>
      <el-descriptions-item label="检验方式">{{ detail.checkAction }}</el-descriptions-item>
      <el-descriptions-item label="描述">{{ detail.description }}</el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { templateInfo } from '@/api/dqc';
export default {
  name: 'Edit',
  props: {
    detailData: {
      type: Object,
      default: () => {}
    },
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      detail: {},
      loading: false,
      dialogVisiable: this.visible,
      checkTypeList: this.$t('dqc.checkTypeList'),
      fieldTypeList: this.$t('dqc.fieldTypeList')
    };
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
      if (this.dialogVisiable) this.templateInfo();
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    templateInfo() {
      this.loading = true;
      templateInfo({ id: this.detailData.id }).then(res => {
        this.loading = false;
        if (res.resultCode !== 0) return;
        const data = res.data;
        this.detail = data;
      });
    },
    cancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>
