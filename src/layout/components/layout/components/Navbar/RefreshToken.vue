<template>
  <div class="token-box" :class="{ 'box-active': !timeVisible }">
    <el-dialog title="用户Token" :visible.sync="dialogVisible" width="450px" :modal-append-to-body="false">
      <el-form ref="ruleForm" label-width="100px" class="token-ruleForm">
        <el-form-item label="Token" prop="password">
          <el-input v-model="token" disabled placeholder="点击刷新获取token" type="password"></el-input>
        </el-form-item>
        <el-form-item label="过期时间" prop="password" v-if="token">
          <el-input v-model="deadline" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="refresh">刷新</el-button>
        <el-button type="primary" @click="copy">复制</el-button>
      </span>
      <div class="time-box" v-if="timeVisible">
        <el-dialog :visible.sync="timeVisible" width="350px" :close-on-click-modal="false" :modal-append-to-body="false">
          <el-form label-width="80px">
            <el-form-item label="刷新周期" prop="password">
              <el-radio-group v-model="effectiveTime">
                <el-radio :label="7">7天</el-radio>
                <el-radio :label="30">30天</el-radio>
                <el-radio :label="90">90天</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="timeVisible = false">取 消</el-button>
            <el-button size="mini" type="primary" @click="confirmToken">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import copy from 'copy-to-clipboard';
import { updateToken, getToken } from '@/api/user';
import { async } from '@antv/x6/lib/registry/marker/async';
export default {
  name: 'SetPassword',
  data() {
    return {
      dialogVisible: false,
      timeVisible: false,
      effectiveTime: 7,
      token: '',
      deadline: ''
    };
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.getToken();
    },
    refresh() {
      this.timeVisible = true;
    },
    copy() {
      copy(this.token, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    confirmToken() {
      const params = {
        effectiveTime: this.effectiveTime
      };
      updateToken(params).then(async res => {
        if (res.code === 0) {
          this.timeVisible = false;
          await this.getToken();
          this.$message({
            type: 'success',
            message: '刷新成功'
          });
        }
      });
    },
    getToken() {
      return new Promise((resolve, rej) => {
        getToken().then(res => {
          if (res.code === 0) {
            this.token = res.data.datacakeToken;
            this.deadline = res.data.deadline;
            resolve('success');
          }
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box-active {
  ::v-deep .el-dialog__wrapper {
    background-color: rgba(0, 0, 0, 0.4);
  }
}
.time-box {
  position: fixed;
  ::v-deep .el-dialog__body {
    padding-bottom: 0;
  }
}
</style>
