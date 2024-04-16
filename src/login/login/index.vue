<template>
  <Layout>
    <el-form ref="form" :model="params" :rules="rules" label-position="top" class="login-form" @submit.native.prevent>
      <el-form-item>
        <div class="tip">
          <div class="tip-title font-size-25">欢迎来到大数据平台</div>
        </div>
      </el-form-item>
      <!-- <el-form-item prop="tenantName" label="租户名称">
        <svg-icon icon-class="home"></svg-icon>
        <el-input v-model="params.tenantName" :placeholder="tenantNamePl" prefix-icon="el-icon-s-home" size="medium" clearable @keyup.enter.native="login"></el-input>
      </el-form-item> -->
      <el-form-item prop="email" label="账号">
        <!-- <svg-icon icon-class="userLogin"></svg-icon> -->
        <el-input v-model="params.email" :placeholder="emailPl" prefix-icon="el-icon-user-solid" size="medium" clearable @keyup.enter.native="login"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <!-- <svg-icon icon-class="pwd"></svg-icon> -->
        <el-input v-model="params.password" :placeholder="pwdPl" :type="pwdType" minlength="6" :suffix-icon="show" prefix-icon="el-icon-lock" size="medium" clearable @click.native="handleClick" @keyup.enter.native="login"></el-input>
      </el-form-item>
      <!-- <el-form-item prop="select" class="form-item-custom form-item-agreement">
        <el-checkbox v-model="params.select"></el-checkbox>
        <span class="text">勾选并同意</span>
        <a href="" target="_blank">《用户注册协议》</a>
      </el-form-item> -->
      <el-form-item class="form-item-custom form-item-btn">
        <el-button :loading="loading" :disabled="loading" type="primary" size="auto" @click="login">立即登录</el-button>
      </el-form-item>
      <!-- <el-form-item class="form-item-custom">
        <router-link :to="`/retrieve-password/1/`">忘记/重置密码</router-link>
      </el-form-item> -->
    </el-form>
  </Layout>
</template>

<script>
import Layout from '../../components/LoginLayout';
import { utf8_to_b64, encryptByDES } from '../../utils/';
import { login } from '../../api/user';
import CryptoJS from 'crypto-js';
import { setToken } from '../../utils/auth';
export default {
  name: 'Login',
  components: {
    Layout
  },
  data() {
    const tenantNamePl = '请输入您的租户名称';
    const emailPl = '请输入您的账号';
    const pwdPl = '请输入至少 6 位密码';
    const validatePass = (rule, value, callback) => {
      if (value && value.length < 6) {
        callback(new Error(pwdPl));
      } else {
        callback();
      }
    };
    return {
      from: this.$route.query.from || '',
      loading: false,
      showPwd: true,
      params: {
        tenantName: 'xdf',
        email: '',
        password: ''
      },
      tenantNamePl,
      emailPl,
      pwdPl,

      rules: {
        tenantName: [{ required: true, message: tenantNamePl, trigger: 'blur' }],
        email: [
          { required: true, message: emailPl, trigger: 'blur' }
          // { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: pwdPl, trigger: 'blur' },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  computed: {
    pwdType() {
      if (this.showPwd) return 'password';
      else return 'text';
    },
    show() {
      if (this.showPwd) return 'iconfont icon-icon-eye-close';
      else return 'iconfont icon-icon-eye';
    }
  },
  // created() {
  //   const tenantName = localStorage.getItem('tenantName');
  //   if (tenantName) this.params.tenantName = tenantName;
  // },
  methods: {
    saveTenantName() {
      localStorage.setItem('tenantName', this.params.tenantName);
    },
    handleClick(e) {
      const target = e.target;
      if (target._prevClass.split(' ').includes('iconfont')) this.showPwd = !this.showPwd;
    },
    login() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true;
          const params = Object.assign({}, this.params, { password: encryptByDES(this.params.password) });
          login(params)
            .then(res => {
              this.loading = false;
              const data = res.data;
              window.sessionStorage.setItem('loginInfo', utf8_to_b64(JSON.stringify(params)));
              data.qrCodeLink && window.sessionStorage.setItem('MFA_QR', data.qrCodeLink);
              window.sessionStorage.setItem('MFA_IS_BIND', data.isBindmfa);
              // 本地保存租户信息
              this.saveTenantName();
              if (data.isMFA) {
                if (this.from) this.$router.push({ name: 'MFAVerify', query: { from: this.from }});
                else this.$router.push({ name: 'MFAVerify' });
              } else {
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
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
$login-bj-color: #7c6bdf;
::v-deep .el-form-item--small.el-form-item:last-child {
  margin-bottom: 0;
}
::v-deep .el-form-item--small {
  .el-form-item__label {
    padding: 0;
  }
}
::v-deep .el-form-item__content {
  display: flex;
  align-items: center;
}

::v-deep .el-button--primary {
  background-color: $login-bj-color !important;
  border-color: $login-bj-color !important;
}
.tip {
  margin: 0 0 20px;
}

.form-item-custom {
  /* padding-left: $margin-left; */

  &.form-item-agreement {
    .text {
      margin: 0 10px;
    }
  }

  &.form-item-btn {
    ::v-deep .el-form-item__content {
      justify-content: center;
    }
  }
}

::v-deep .el-form-item__error {
  /* margin-left: $margin-left; */
  margin-top: 5px;
}

::v-deep .el-button:not(.el-button--text) {
  width: 100%;
  margin-top: 10px;
}

::v-deep .svg-icon {
  width: 2em;
  height: 2em;
  margin-right: 20px;
  color: #999;
}
</style>
