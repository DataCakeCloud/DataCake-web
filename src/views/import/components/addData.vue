<template>
  <el-dialog v-loading="loading" :title="!Object.keys(editData).length ? '新建数据' : '编辑数据'" :visible="visible" width="40%" :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <el-form ref="form" :model="params" :rules="rules">
      <el-form-item prop="name" label="名称">
        <el-input v-model.trim="params.name" placeholder="输入名称"></el-input>
      </el-form-item>
      <el-form-item prop="dataSource" label="数据源">
        <el-select v-model="params.dataSource" clearable placeholder="选择数据源" style="width: 100%">
          <el-option v-for="(item, index) in dataSourceList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="cloudResourceId" label="所属云资源名称">
        <el-select v-model="params.cloudResourceId" clearable placeholder="选择所属云资源名称" style="width: 100%">
          <el-option v-for="(item, index) in cloudResourceList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <!-- <div class="tip">择 S3 存储桶路径和大多数工作区所在的区域</div> -->
      </el-form-item>
      <el-form-item prop="path" label="存储路径">
        <el-input v-model.trim="params.path" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="<桶>/<路径>，支持多个','分隔"></el-input>
        <div style="color: 666">添加的桶名称，需要提前进行授权，可参考 <a href="https://shimo.im/docs/KlkKVxR7PwUYxdqd" target="_blank">授权桶权限方法</a></div>
      </el-form-item>
      <el-form-item label="Principal">
        <el-input v-model="roleName" disabled suffix-icon="el-icon-document-copy" style="visibility: hidden"></el-input>
        <div style="margin-top: -30px">{{ roleName }} <i class="el-icon-document-copy" @click="handleCopy"></i></div>
      </el-form-item>
      <el-form-item v-if="showProgress">
        <el-progress :percentage="percentage" :text-inside="true" :stroke-width="26" :color="customColorMethod"></el-progress>
        <div style="color: 666">提示：正在校验区域信息和当前桶是否在同一区域；并且确认 datacake 平台是否获得该桶的读写删权限</div>
      </el-form-item>
      <div v-if="!!addDataErrorMessage" class="error_message">
        {{ '错误: ' + addDataErrorMessage }}
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button :loading="submitLoading" type="primary" @click="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { dataAdd, dataUpdate, resourceSearch } from '@/api/cluster';
import copy from 'copy-to-clipboard';

export default {
  name: 'AddResource',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: Boolean,
    editData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      addDataErrorMessage: '',
      submitLoading: false,
      dialogVisiable: this.visible,
      roleName: 'arn:aws:iam::404486105145:root',
      dataSourceList: [
        {
          name: '对象存储',
          value: 's3'
        }
      ],
      percentage: 10,
      showProgress: false,
      cloudResourceList: [],
      params: {
        name: '',
        dataSource: '',
        cloudResourceId: '',
        path: ''
      },
      defaultParams: {
        name: '',
        dataSource: '',
        cloudResourceId: '',
        path: ''
      },
      rules: {
        name: [{ required: true, message: '请输入数据挂载名称', trigger: ['blur'] }],
        dataSource: [{ required: true, message: '请选择数据源', trigger: ['blur'] }],
        cloudResourceId: [{ required: true, message: '请选择所属云资源名称', trigger: ['blur'] }],
        path: [{ required: true, message: '请输入存储桶路径', trigger: ['blur'] }]
      }
    };
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
      if (!this.dialogVisiable) {
        this.percentage = 10;
      }
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    },
    editData: {
      handler(val) {
        this.submitLoading = false;
        this.params = Object.assign({}, this.params, val);
        if (!Object.keys(val).length) {
          // this.params.name = '';
          // this.params.dataSource = '';
          // this.params.cloudResourceId = '';
          // this.params.path = '';
          this.params = Object.assign({}, this.defaultParams);
          this.addDataErrorMessage = '';
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getList();
  },
  methods: {
    customColorMethod(percentage) {
      if (percentage < 30) {
        return '#909399';
      } else if (percentage < 70) {
        return '#e6a23c';
      } else {
        return '#67c23a';
      }
    },
    increase() {
      let timer = null;
      timer = setInterval(_ => {
        if (!this.submitLoading) {
          clearInterval(timer);

          // 错误的话  隐藏进度条
          if (this.addDataErrorMessage) {
            this.percentage = 0;
            this.showProgress = false;
            return;
          }

          this.percentage = 100;

          setTimeout(e => {
            this.showProgress = false;
            this.$emit('update:visible', false);
            this.$emit('updateList');
          }, 800);
          return;
        }
        this.percentage += 3;
        if (this.percentage > 90) {
          this.percentage = 90;
        }
      }, 500);
    },
    getList() {
      resourceSearch({}).then(res => {
        this.cloudResourceList = res.data.list;
      });
    },
    handleChangeProvider() {
      this.getRegion();
    },
    handleChangeRegion(val) {},
    handleCopy() {
      copy(this.roleName, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: 'RoleName 已复制到剪贴板'
      });
    },
    cancel() {
      this.$emit('update:visible', false);
      this.addDataErrorMessage = '';
    },
    ok() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.showProgress = true;
          this.addDataErrorMessage = '';
          this.increase();
          let params = Object.assign({}, this.params);
          if (Object.keys(this.editData).length) {
            params = Object.assign({}, params, { id: this.editData.id });
            dataUpdate(params)
              .then(res => {
                this.submitLoading = false;
                if (res.code !== 0) return;
                this.$message({
                  type: 'success',
                  message: '编辑数据成功'
                });
                this.$emit('update:visible', false);
                this.$emit('updateList');
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else {
            dataAdd(params)
              .then(res => {
                this.submitLoading = false;
                if (res.code !== 0) return;
                this.$message({
                  type: 'success',
                  message: '添加数据成功'
                });
                this.$emit('update:visible', false);
                this.$emit('updateList');
              })
              .catch(err => {
                this.addDataErrorMessage = err.data || '';
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.error_message {
  color: $color-cb;
}
</style>
