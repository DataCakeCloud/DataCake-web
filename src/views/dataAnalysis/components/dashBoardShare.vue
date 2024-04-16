<template>
  <el-dialog title="分享" :visible.sync="dialogVisible" width="30%" class="dashBoardDialg" @close="close">
    <el-form ref="form" class="form" :model="form" label-width="80px">
      <el-form-item label="分享给:" prop="shareeEmail" :rules="[{ required: true, message: '请选择被分享者', trigger: 'change' }]">
        <el-select
          v-model="form.shareeEmail"
          filterable
          placeholder="请输入用户邮箱"
          :remote-method="
            query => {
              remoteMethod(query);
            }
          "
          remote
          :reserve-keyword="false"
          :loading="loadingSelect"
        >
          <el-option v-for="val in options" :key="val.value" :label="val.label" :value="val.value" @click.native="handelClick(val)"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { userPage } from '@/api/jurisdiction';

export default {
  name: 'DashBoardShare',
  data() {
    return {
      dialogVisible: false,
      loadingSelect: false,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      options: [],
      form: {
        sharee: '',
        shareeEmail: '',
        grade: ''
      }
    };
  },
  methods: {
    handelClick(data) {
      this.form.sharee = data.name;
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submitFn', JSON.parse(JSON.stringify(this.form)));
          this.dialogVisible = false;
        }
      });
    },
    open() {
      this.dialogVisible = true;
    },
    close() {
      this.$refs.form.resetFields();
      this.options = [];
    },
    async remoteMethod(query, index) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userPage({ name: query, tenantId: this.tenantId })).data;
        this.loadingSelect = false;
        this.options = data.list.length > 0 ? data.list.map(item => ({ label: item.email, value: item.email, name: item.name })) : [];
      } else {
        this.options = [];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dashBoardDialg {
  ::v-deep .el-dialog__body {
    padding: 10px 20px;
  }
  .form {
    .el-select {
      width: 100%;
    }
  }
}
</style>
