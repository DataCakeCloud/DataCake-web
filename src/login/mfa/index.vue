<template>
  <el-card class="mfa-container">
    <div class="mfa-box">
      <div class="title font-size-20">MFA Certification</div>
      <!-- <div v-if="isBindMfa === 1" ref="qrcode" class="qr-code"></div> -->
      <div v-loading="qrLoading">
        <img v-if="isBindMfa === '1'" :src="qrImg" alt="" class="qr-code" />
        <div v-else class="certification"></div>
      </div>
      <el-form class="form" :model="params" :rules="rules" @submit.native.prevent>
        <el-form-item>
          <p>多重验证</p>
          <p>请输入 MFA 码以完成登录</p>
        </el-form-item>
        <el-form-item prop="codeInput">
          <el-input v-model="params.codeInput" placeholder="MFA 验证码" @keyup.enter.native="handleEnter"></el-input>
        </el-form-item>
        <el-form-item class="form-item-custom form-item-btn">
          <el-button :loading="loading" :disabled="loading || params.codeInput.length < 6" type="primary" size="auto" @click="handleSubmit">提 交</el-button>
        </el-form-item>
      </el-form>

      <div class="mfa-help">
        <a href="https://shimo.im/docs/dUiGjP9r1zYLDQCH" target="_blank">MFA 帮助</a>
        <el-button v-if="isBindMfa === '0'" :loading="boundLoading || sendLoading" :disabled="boundLoading || sendLoading" type="text" class="unbound" @click="validUnbound">
          MFA 解绑
          <span v-text="timeNum < 60 && timeNum > 0 ? `(${timeNum})` : ''"></span>
        </el-button>
      </div>
    </div>

    <!-- 用户验证信息校验 -->
    <el-dialog :visible.sync="validVisible" width="400px" :close-on-click-modal="false" :append-to-body="true" class="valid_dialog" @close="validClose">
      <div class="content">
        <el-alert class="tips_emial" title="验证码已发送,请注意邮件查收" type="info" show-icon :closable="false"> </el-alert>
        <el-form ref="validForm" :model="validForm" label-width="120px">
          <el-form-item label="请输入验证码: " prop="code" :rules="[{ required: true, message: '请输入正确的验证码', trigger: 'blur' }]">
            <el-input v-model="validForm.code"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="validVisible = false">取 消</el-button>
        <el-button type="primary" @click="validSub">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { b64_to_utf8 } from '../../utils';
import { setToken } from '../../utils/auth';
import { checkMFACode, unbundlingMFA, login, sendCode, checkCode } from '../../api/user';
// import * as QRCode from 'easyqrcodejs';
export default {
  name: 'Login',
  data() {
    const checkCodeInput = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('MFA 验证码不能为空'));
      }
      setTimeout(() => {
        console.log(Number(value));
        if (isNaN(Number(value))) {
          callback(new Error('请输入数字'));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      sendLoading: false,
      timeNum: 60,
      validVisible: false,
      validForm: {
        code: ''
      },
      from: this.$route.query.from || '',
      loading: false,
      boundLoading: false,
      qrLoading: false,
      loginInfo: JSON.parse(b64_to_utf8(window.sessionStorage.getItem('loginInfo'))),
      params: {
        codeInput: ''
      },
      qrImg: window.sessionStorage.getItem('MFA_QR'),
      isBindMfa: window.sessionStorage.getItem('MFA_IS_BIND'),
      options: {
        text: window.sessionStorage.getItem('MFA_QR'),
        width: 195,
        height: 195
      },
      rules: {
        codeInput: [{ validator: checkCodeInput, trigger: ['blur', 'change'] }]
      }
    };
  },
  methods: {
    handleEnter() {
      if (!this.params.codeInput) {
        this.$message({
          type: 'warning',
          message: '验证码不能为空'
        });
        return;
      }
      this.handleSubmit();
    },
    handleSubmit() {
      const params = Object.assign({}, this.loginInfo, { codeInput: this.params.codeInput });
      this.loading = true;
      checkMFACode(params)
        .then(res => {
          // const domain = process.env.VUE_APP_ENV === 'cloud-aws-development' ? 'localhost' : '.datacake.cloud';
          const domain = process.env.VUE_APP_ENV === 'cloud-aws-development' ? 'localhost' : window.location.host;
          this.loading = false;
          if (res.code !== 0) return;
          const data = res.data;
          window.sessionStorage.setItem('datacake_token', data.token);
          window.sessionStorage.setItem('MFA_IS_BIND', 0);
          // 如果注册过云资源，跳转首页 isHasCloudResource 0有 1 没有
          if (data.isHasCloudResource === '0') {
            if (!this.from) {
              setToken(data.token, { domain });
              // window.location.replace(process.env.VUE_APP_DATACAKE_FRONTEND_ORIGIN);
              window.location.reload();
            } else {
              window.location.replace(`${this.from}?t=${data.token}`);
            }
          } else {
            this.$router.push({ name: 'Guidance' });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    startTime() {
      clearInterval(this.timer);
      this.timeNum = 59;
      this.timer = setInterval(() => {
        this.timeNum--;
        if (this.timeNum <= 0) {
          this.sendLoading = false;
          clearInterval(this.timer);
        }
      }, 1000);
    },
    validClose() {
      this.validForm.code = '';
    },
    validSub() {
      this.$refs.validForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, { tenantName: this.loginInfo.tenantName, email: this.loginInfo.email }, this.validForm);
          checkCode(params).then(res => {
            if (res.code !== 0) return;
            this.validVisible = false;
            this.handleUnbound();
          });
        }
      });
    },
    validUnbound() {
      // 向邮件发送验证码
      const params = Object.assign({}, { tenantName: this.loginInfo.tenantName, email: this.loginInfo.email });
      this.sendLoading = true;
      this.startTime();
      sendCode(params)
        .then(res => {
          this.validVisible = true;
          // this.sendLoading = false;
        })
        .finally(() => {
          // this.sendLoading = false;
        });
    },
    handleUnbound() {
      this.boundLoading = true;
      unbundlingMFA(this.loginInfo)
        .then(res => {
          this.boundLoading = false;
          if (res.code !== 0) return;

          // login
          window.sessionStorage.setItem('MFA_IS_BIND', 1);
          this.$message({
            type: 'success',
            message: 'MFA 解绑成功'
          });

          this.$nextTick(_ => {
            // 解绑后重新登录获取对应的二维码
            this.qrLoading = true;
            login(this.loginInfo)
              .then(res => {
                this.qrLoading = false;
                const data = res.data;

                this.qrImg = data.qrCodeLink;
                data.qrCodeLink && window.sessionStorage.setItem('MFA_QR', data.qrCodeLink);
                this.isBindMfa = data.isBindmfa;
              })
              .finally(() => {
                this.qrLoading = false;
              });
            // window.location.reload();
          });
        })
        .finally(() => {
          this.boundLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
$login-bj-color: #7c6bdf;
::v-deep .el-button--primary {
  background-color: $login-bj-color !important;
  border-color: $login-bj-color !important;
}
.mfa-container {
  position: fixed;
  top: 100px;
  bottom: 100px;
  width: 650px;
  left: 50%;
  transform: translateX(-50%);

  .mfa-box {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;

    width: 350px;
    padding: 20px 0;
  }

  .title {
    /* margin-top: 0px; */
    color: $c-primary;
    font-weight: 900;
  }

  .qr-code {
    margin-top: 30px;
  }

  .certification {
    width: 150px;
    height: 150px;
    margin: 30px auto 0;
    background: url(../../assets/certification.png) no-repeat;
    background-size: cover;
  }

  .form {
    margin-top: 30px;

    .el-button:not(.el-button--text) {
      width: 100%;
    }
  }
  .unbound {
    margin-left: 10px;
  }
}

@media (min-width: 1024px) and (max-width: 1280px) {
  .mfa-container {
    top: 50px;
    bottom: 50px;
  }
}

@media (max-width: 1024px) {
  .mfa-container {
    top: 20px;
    bottom: 20px;
  }
}
.valid_dialog {
  ::v-deep .el-dialog__body {
    padding: 35px 20px 0 20px;
    .content {
      .tips_emial {
        background-color: rgba(0, 0, 0, 0);
        margin-top: -48px;
        margin-bottom: 10px;
        padding: 4px;
      }
    }
  }
}
</style>
