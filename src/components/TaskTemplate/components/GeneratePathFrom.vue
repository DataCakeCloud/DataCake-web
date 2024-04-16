<template>
  <el-form ref="ruleForm" :model="ruleForm" label-width="100px" :disabled="disabled">
    <el-form-item label="是否生成标志:">
      <el-switch v-model="ruleForm.check" @change="checkChange"></el-switch>
    </el-form-item>
    <el-form-item v-show="ruleForm.check" label="标志路径:">
      <el-input v-model="ruleForm.location" type="textarea" style="width: 60%" rows="3" placeholder="请输入路径" :disabled="!ruleForm.check" clearable></el-input>
    </el-form-item>
    <el-form-item v-show="ruleForm.check" label="检查文件名:">
      <el-input v-model="ruleForm.fileName" style="width: 60%" placeholder="请输入文件名" :disabled="!ruleForm.check" clearable></el-input>
    </el-form-item>
  </el-form>
</template>
<script>
import { checkSuccess } from '@/api/task';

export default {
  name: 'GeneratePathFrom',
  props: {
    ruleForm: {
      type: Object,
      default: () => {
        return {
          fileName: '_SUCCESS',
          check: false,
          location: ''
        };
      }
    },
    name: {
      type: String,
      default: 'task_name'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCheck: false
    };
  },
  watch: {
    name(val) {
      if (this.isCheck) {
        this.$set(this.ruleForm, 'location', '');
      }
    }
  },
  methods: {
    checkChange(val) {
      this.isCheck = val;
      if (val && !this.ruleForm.location) {
        this.$set(this.ruleForm, 'location', '');
      }
      if (val && !this.ruleForm.fileName) {
        const fileName = this.ruleForm.fileName ? this.ruleForm.fileName : '_SUCCESS';
        this.$set(this.ruleForm, 'fileName', fileName);
      }
      if (!val) {
        this.$set(this.ruleForm, 'location', '');
      }
      this.$forceUpdate();
    },
    checkPath() {
      const formData = new FormData();
      formData.append('path', this.ruleForm.location);
      return checkSuccess(formData).then(data => {
        return data.data;
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>
