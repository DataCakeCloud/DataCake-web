<template>
  <Layout>
    <div class="retrieve-pwd-wrapper">
      <div class="tip">
        <div class="tip-title font-size-25">欢迎来到Ninebot大数据平台</div>
        <div class="tip-text font-size-15">继续修改密码</div>
      </div>
      <div class="title">{{ headerText }}</div>
      <el-divider></el-divider>
      <template v-if="$route.params.id === '1'">
        <el-form ref="form1" :model="params1" :rules="rules1" @submit.native.prevent>
          <el-form-item prop="tenantName">
            <el-input v-model="params1.tenantName" :placeholder="tenantNamePl" prefix-icon="el-icon-s-home" size="medium" @keyup.enter.native="handleNext2"></el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input v-model="params1.email" :placeholder="emailPl" prefix-icon="el-icon-user-solid" size="medium" @keyup.enter.native="handleNext2"></el-input>
          </el-form-item>
          <el-form-item prop="randomCode" class="form-item-custom">
            <el-input v-model="params1.randomCode" :placeholder="codePl" size="medium" @keyup.enter.native="handleNext2"></el-input>
            <identify-code :change-code.sync="identifyCode"></identify-code>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="auto" @click="handleNext2">下一步</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="$route.params.id === '2'">
        <el-steps :active="active" finish-status="success" simple class="steps">
          <el-step title="01 安全验证"></el-step>
          <el-step title="02 设置密码"></el-step>
        </el-steps>

        <el-form v-if="active === 1" ref="form2" :key="active" :model="params2" :rules="rules2" @submit.native.prevent>
          <el-form-item class="form-item-custom form-item-email">
            <svg-icon icon-class="email"></svg-icon>
            <span class="text">通过{{ params1.email }}</span>
            <el-button :loading="sendLoading" :disabled="sendLoading" @click="handleVerification">
              获取验证码
              <span v-text="timeNum < 60 && timeNum > 0 ? `(${timeNum})` : ''"></span>
            </el-button>
          </el-form-item>
          <el-form-item prop="code">
            <el-input v-model="params2.code" :placeholder="emailCodePl" size="medium" @keyup.enter.native="handleNext3"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="verificateLoading" :disabled="verificateLoading" type="primary" size="auto" @click="handleNext3">下一步</el-button>
          </el-form-item>
        </el-form>
        <el-form v-if="active === 2" ref="form3" :key="active" :model="params3" :rules="rules3" @submit.native.prevent>
          <el-form-item prop="password">
            <!-- <el-input v-model="params3.password" type="password" :placeholder="pwdPl" size="medium" @keyup.enter.native="handleSave"></el-input> -->

            <el-input v-model="params3.password" :placeholder="pwdPl" :type="pwdType" minlength="6" :suffix-icon="show" prefix-icon="el-icon-lock" size="medium" clearable @click.native="handleClick" @keyup.enter.native="handleSave"></el-input>
          </el-form-item>
          <el-form-item prop="confirmPwd">
            <!-- <el-input v-model="params3.confirmPwd" type="password" :placeholder="confirmPwdPl" size="medium" @keyup.enter.native="handleSave"></el-input> -->

            <el-input v-model="params3.confirmPwd" :placeholder="confirmPwdPl" :type="confirmPwdType" minlength="6" :suffix-icon="showConfirm" prefix-icon="el-icon-lock" size="medium" clearable @click.native="handleClickConfirm" @keyup.enter.native="handleSave"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="verificateLoading" :disabled="verificateLoading" type="primary" size="auto" @click="handleSave">下一步</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="$route.params.id === '3'">
        <div class="result">
          <svg-icon icon-class="success"></svg-icon>
          <span>您已成功设置密码，请使用新密码 <a href="javascript:;" @click="handleLogin">登录</a>！</span>
        </div>
      </template>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/LoginLayout';
import IdentifyCode from '../../components/Identify';
import { sendCode, checkCode, updatePassword } from '../../api/user';
import { encryptByDES } from '../../utils/';

export default {
  name: 'RetrievePassword',
  components: {
    Layout,
    IdentifyCode
  },
  data() {
    const tenantNamePl = '请输入您的租户名称';
    const emailPl = '请输入您的账号';
    const codePl = '请输入验证码';
    const emailCodePl = '请输入邮箱收到的验证码';
    const pwdPl = '请输入密码';
    const confirmPwdPl = '请确认密码';
    return {
      timeNum: 60,
      sendLoading: false,
      verificateLoading: false,
      updateLoading: false,
      showPwd: true,
      showConfirmPwd: true,
      identifyCode: '',
      tenantNamePl,
      codePl,
      emailPl,
      emailCodePl,
      pwdPl,
      confirmPwdPl,
      active: 1,
      params1: {
        tenantName: '',
        email: '',
        randomCode: ''
      },
      params2: {
        code: ''
      },
      params3: {
        password: '',
        confirmPwd: ''
      },
      rules1: {
        tenantName: [{ required: true, message: tenantNamePl, trigger: 'blur' }],
        email: [
          { required: true, message: emailPl, trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        randomCode: [
          { required: true, message: codePl, trigger: 'blur' },
          { validator: this.validateCode, trigger: ['blur', 'change'] }
        ]
      },
      rules2: {
        code: [{ required: true, message: emailCodePl, trigger: 'blur' }]
      },
      rules3: {
        password: [
          { required: true, message: pwdPl, trigger: 'blur' },
          { validator: this.validatePwd, trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: confirmPwdPl, trigger: 'blur' },
          { validator: this.valiteConfirmPwd, trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  computed: {
    pwdType() {
      if (this.showPwd) return 'password';
      else return 'text';
    },
    confirmPwdType() {
      if (this.showConfirmPwd) return 'password';
      else return 'text';
    },
    show() {
      if (this.showPwd) return 'iconfont icon-icon-eye-close';
      else return 'iconfont icon-icon-eye';
    },
    showConfirm() {
      if (this.showConfirmPwd) return 'iconfont icon-icon-eye-close';
      else return 'iconfont icon-icon-eye';
    },
    headerText() {
      let str = '';
      switch (this.$route.params.id) {
        case '1':
          str = '请输入您要找回密码的账号';
          break;
        case '2':
          str = `您正在找回 ${this.params1.email} 的密码`;
          break;
        default:
          str = `您正在找回 ${this.params1.email} 的密码`;
          break;
      }

      return str;
    }
  },
  destroyed() {
    clearInterval(this.timer);
  },
  methods: {
    handleClick(e) {
      const target = e.target;
      if (target._prevClass.split(' ').includes('iconfont')) this.showPwd = !this.showPwd;
    },
    handleClickConfirm(e) {
      const target = e.target;
      if (target._prevClass.split(' ').includes('iconfont')) this.showConfirmPwd = !this.showConfirmPwd;
    },
    validateCode(rule, value, callback) {
      if (value.toLowerCase() !== this.identifyCode.toLowerCase()) {
        callback(new Error('验证码不正确，重新输入验证码'));
      } else {
        callback();
      }
    },
    validatePwd(rule, value, callback) {
      const reg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,20}$/;
      if (!reg.test(value)) {
        callback(new Error('密码长度在8-20位,且必须包含英文,数字和特殊字符'));
      } else {
        callback();
      }
    },
    valiteConfirmPwd(rule, value, callback) {
      if (value !== this.params3.password) {
        callback(new Error('密码不相同，请重新输入'));
      } else {
        callback();
      }
    },
    handleNext2() {
      this.$refs.form1.validate(valid => {
        if (valid) {
          this.$router.push({ params: { id: '2' }});
        }
      });
    },
    handleNext3() {
      this.$refs.form2.validate(valid => {
        if (valid) {
          const params = Object.assign({}, { tenantName: this.params1.tenantName, email: this.params1.email }, this.params2);
          this.verificateLoading = true;
          checkCode(params)
            .then(res => {
              this.verificateLoading = false;

              if (res.code !== 0) return;
              this.active = 2;
            })
            .finally(() => {
              this.verificateLoading = false;
            });
        }
      });
    },
    handleSave() {
      this.$refs.form3.validate(valid => {
        if (valid) {
          const params = Object.assign({}, { tenantName: this.params1.tenantName, email: this.params1.email, password: encryptByDES(this.params3.password), code: this.params2.code });
          this.updateLoading = true;
          updatePassword(params)
            .then(res => {
              this.updateLoading = false;
              if (res.code !== 0) return;
              this.$router.push({ params: { id: '3' }});
            })
            .finally(() => {
              this.updateLoading = false;
            });
        }
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
    handleVerification() {
      // 向邮件发送验证码
      const params = Object.assign({}, { tenantName: this.params1.tenantName, email: this.params1.email });
      this.sendLoading = true;
      this.startTime();
      sendCode(params)
        .then(res => {
          // this.sendLoading = false;
        })
        .finally(() => {
          // this.sendLoading = false;
        });
    },
    handleLogin() {
      this.$router.push({ name: 'Login' });
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
.retrieve-pwd-wrapper {
  border: none;
  .tip {
    margin: 0 0 40px;
  }
  .tip-text {
    color: #666;
    margin-top: 10px;
  }

  .steps {
    margin-bottom: 24px;
  }

  .form-item-custom {
    ::v-deep .el-form-item__content {
      display: flex;
      align-items: center;
    }

    ::v-deep .el-input {
      margin-right: 10px;
    }

    &.form-item-email {
      ::v-deep .svg-icon {
        width: 2em;
        height: 2em;
      }

      .text {
        margin: 0 10px;
      }
    }
  }

  ::v-deep .el-button--primary {
    width: 100%;
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 150px;

    ::v-deep .svg-icon {
      width: 2em;
      height: 2em;

      margin-right: 5px;
    }
  }
}
</style>
