<template>
  <el-dialog title="密码修改" :visible.sync="dialogVisible" width="450px" :modal-append-to-body="false" @closed="handleClose">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="新密码" prop="password">
        <el-input :type="pwdType" v-model="ruleForm.password" @click.native="handleClick" :suffix-icon="showPassWord"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="password2">
        <el-input :type="confirmPwdType" v-model="ruleForm.password2" @click.native="handleClickConfirm" :suffix-icon="showConfirm"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <div class="box">
          <el-input type="text" v-model="ruleForm.code"></el-input>
          <el-button class="btn" :loading="sendLoading" :disabled="sendLoading" size="small" @click="handleVerification">
            获取验证码
            {{ sendLoading ? `( ${timeNum} )` : '' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { sendCode, updatePassword } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
import { encryptByDES } from '@/utils';

export default {
  name: 'SetPassword',
  data() {
    const passwordrules = (rule, value, callback) => {
      if (value !== this.ruleForm.password) callback(new Error('两次密码不一致'));
      callback();
    };
    return {
      dialogVisible: false,
      timeNum: 60,
      sendLoading: false,
      passwordReg: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,20}$/,
      ruleForm: {
        code: '',
        password: '',
        password2: ''
      },
      defaultFrom: {
        code: '',
        password: '',
        password2: ''
      },
      showPwd: true,
      showConfirmPwd: true,
      rules: {
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: this.validatePwd, trigger: 'blur' }
        ],
        password2: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { validator: passwordrules, trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    pwdType() {
      if (this.showPwd) return 'password';
      else return 'text';
    },
    confirmPwdType() {
      if (this.showConfirmPwd) return 'password';
      else return 'text';
    },
    showPassWord() {
      if (this.showPwd) return 'iconfont icon-icon-eye-close';
      else return 'iconfont icon-icon-eye';
    },
    showConfirm() {
      if (this.showConfirmPwd) return 'iconfont icon-icon-eye-close';
      else return 'iconfont icon-icon-eye';
    }
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
    validatePwd(rule, value, callback) {
      if (!this.passwordReg.test(value)) {
        callback(new Error('密码长度在8-20位,且必须包含英文,数字和特殊字符'));
      } else {
        callback();
      }
    },
    startTime() {
      this.sendLoading = true;
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
      if (this.ruleForm.password && this.ruleForm.password2 && this.ruleForm.password === this.ruleForm.password2 && this.passwordReg.test(this.ruleForm.password)) {
        const params = {
          tenantName: this.userInfo.tenantName,
          email: this.userInfo.email
        };
        this.startTime();
        sendCode(params)
          .then(res => {
            this.$message({
              type: 'success',
              message: '验证码发送成功,请往邮箱查看'
            });
          })
          .catch(err => {
            this.$message({
              type: 'error',
              message: '获取验证码失败,请重新获取'
            });
          });
      } else {
        this.$message({
          type: 'warning',
          message: '请先通过新密码和确认密码的校验'
        });
      }
    },
    show() {
      this.dialogVisible = true;
    },
    handleClose() {
      this.$refs.ruleForm.clearValidate();
      Object.assign(this.ruleForm, this.defaultFrom);
      this.sendLoading = false;
      this.showPwd = true;
      this.showConfirmPwd = true;
    },
    confirm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const params = {
            tenantName: this.userInfo.tenantName,
            email: this.userInfo.email,
            code: this.ruleForm.code,
            password: encryptByDES(this.ruleForm.password2)
          };
          updatePassword(params).then(res => {
            this.$alert('密码修改成功,请重新登陆?', '提示', {
              confirmButtonText: '确定',
              type: 'warning',
              callback: action => {
                this.$store.dispatch('user/FedLogOut').then(() => {
                  location.reload();
                });
              }
            });
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  .btn {
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>
