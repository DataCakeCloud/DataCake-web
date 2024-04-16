<template>
  <div class="system-box">
    <div class="sidebar">
      <ul>
        <li v-for="section in sections" :key="section.id" :class="{ active: section.id === activeSection }" @click="setActiveSection(section)">
          {{ section.title }}
        </li>
      </ul>
    </div>
    <div class="content">
      <el-form ref="ruleForm" class="step-three" :model="ruleForm" :rules="rules">
        <div id="section1">
          <el-tabs>
            <el-tab-pane label="登录配置">
              <el-form-item label="登录方式：" label-width="130px">
                <template #label>
                  <span>登录方式：<i class="el-icon-info" style="cursor: pointer" @click="loginModeVisible = !loginModeVisible"></i></span>
                </template>
                <el-radio-group v-model="ruleForm.login_mode" @change="changeLoginType">
                  <el-radio label="LDAP">LDAP账号</el-radio>
                  <el-radio label="DataCake">DataCake账号</el-radio>
                </el-radio-group>
              </el-form-item>
              <div v-if="showLoginBox" class="ldap-box">
                <el-form-item label="登录鉴权接口：" label-width="130px" prop="login_auth_interface">
                  <el-input v-model="ruleForm.login_auth_interface" type="textarea" class="text-box"></el-input>
                </el-form-item>
                <el-form-item label="接口描述：" label-width="130px">
                  <el-input v-model="ruleForm.interface_describe" type="textarea" class="text-box"></el-input>
                </el-form-item>
                <el-form-item label="启用MFA验证：" label-width="130px">
                  <el-radio-group v-model="ruleForm.is_enable_mfa">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div id="section2" class="section">
          <el-tabs>
            <el-tab-pane label="告警渠道配置">
              <el-form-item label="告警配置：" label-width="130px" prop="channel_info" class="other-param">
                <span class="check-text">
                  <el-checkbox v-model="channel_infoObj['enterprise_wechat'].check" style="margin-right: 3px" @change="checkBox('enterprise_wechat')"></el-checkbox>
                  <span class="tab" :class="{ activeText: alertTypeValue === 'enterprise_wechat' }" @click="checkAlertType('enterprise_wechat')">{{ '企业微信' }}</span>
                </span>
                <span class="check-text">
                  <el-checkbox v-model="channel_infoObj['dingding'].check" disabled style="margin-right: 3px" @change="checkBox('dingding')"></el-checkbox>
                  <span class="tab" :class="{ activeText: alertTypeValue === 'dingding' }" @click="checkAlertType('dingding')">{{ '钉钉' }}</span>
                </span>
                <span class="check-text">
                  <el-checkbox v-model="channel_infoObj['email'].check" style="margin-right: 3px" @change="checkBox('email')"></el-checkbox>
                  <span class="tab" :class="{ activeText: alertTypeValue === 'email' }" @click="checkAlertType('email')">{{ '邮件' }}</span>
                </span>
                <span class="check-text">
                  <el-checkbox v-model="channel_infoObj['phone'].check" disabled style="margin-right: 3px" @change="checkBox('phone')"></el-checkbox>
                  <span class="tab" :class="{ activeText: alertTypeValue === 'phone' }" @click="checkAlertType('phone')">{{ '电话' }}</span>
                </span>
                <div class="alert-method-box">
                  <el-form-item label="任务告警渠道" label-width="100px" size="mini">
                    <el-radio-group v-model="channel_infoObj[alertTypeValue].alert">
                      <el-radio :label="true">是</el-radio>
                      <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <div v-if="showTokenConf" class="token-tip">
                    <el-button type="text" @click="goWxToken">>>配置企业微信群token</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>
    <div class="btn-wrap">
      <el-button type="primary" @click="save()">保 存</el-button>
    </div>
    <el-info v-model="loginModeVisible" title="登录方式介绍">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <p><span style="font-weight: 550">LDAP账号登录：</span>鉴权时将调用当前租户的鉴权接口，需要租户admin配置鉴权API。</p>
        <p><span style="font-weight: 550">DataCake账号登录：</span>鉴权时无需调用外部API。</p>
      </div>
    </el-info>
  </div>
</template>
<script>
import { getConfig, updateConfig } from '@/api/system.js';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      sections: [
        {
          id: 'section1',
          title: '登录配置'
        },
        {
          id: 'section2',
          title: '告警渠道配置'
        }
      ],
      loginModeVisible: false,
      showTokenConf: false,
      activeSection: 'enterprise_wechat',
      showLoginBox: true,
      alertTypeValue: 'enterprise_wechat',
      radioTest: 3,
      alertConf: [
        { label: '企业微信', value: 'enterprise_wechat' },
        { label: '钉钉', value: 'dingding' },
        { label: '邮件', value: 'email' },
        { label: '电话', value: 'phone' }
      ],
      channel_infoObj: {
        email: {
          check: false,
          alert: true
        },
        enterprise_wechat: {
          check: false,
          alert: true
        },
        phone: {
          check: false,
          alert: true
        },
        dingding: {
          check: false,
          alert: true
        }
      },
      ruleForm: {
        login_mode: 'LDAP',
        is_enable_mfa: false,
        login_auth_interface: '',
        interface_describe: '',
        channel_info: []
      },
      rules: {
        login_auth_interface: [{ required: true, message: '请填写登陆鉴权接口', trigger: ['blur', 'change'] }],
        channel_info: [{ required: true, message: '请选择告警渠道', trigger: ['blur', 'change'] }]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    systemParams() {
      return this.$store.getters['user/systemConf'];
    }
  },
  watch: {
    systemParams: {
      handler(v) {
        if (v.config) {
          this.ruleForm = JSON.parse(v.config);
          this.getChannelObj(this.ruleForm.channel_info);
          this.showLoginBox = this.ruleForm.login_mode === 'LDAP';
        }
      },
      deep: true
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.activeSection = 'section1';
    if (this.systemParams.config) {
      this.ruleForm = JSON.parse(this.systemParams.config);
      this.getChannelObj(this.ruleForm.channel_info);
      this.showLoginBox = this.ruleForm.login_mode === 'LDAP';
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    goWxToken() {
      this.$router.push({ name: 'SystemWxToken' });
    },
    handleScroll() {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      for (let i = 0; i < this.sections.length; i++) {
        const currentSection = this.sections[i];
        const sectionTop = document.getElementById(currentSection.id).offsetTop;
        if (scrollPosition >= sectionTop) {
          this.activeSection = currentSection.id;
        }
      }
    },
    setActiveSection(section) {
      this.activeSection = section.id;
      document.getElementById(section.id).scrollIntoView();
    },
    checkAlertType(val) {
      this.alertTypeValue = val;
      this.showTokenLink();
    },
    getChannelObj(channelArr) {
      channelArr.map(item => {
        this.channel_infoObj[Object.keys(item)[0]].check = true;
        this.channel_infoObj[Object.keys(item)[0]].alert = item[Object.keys(item)[0]].isAlarmConfiguration;
        this.showTokenLink();
      });
    },
    showTokenLink() {
      if (this.alertTypeValue === 'enterprise_wechat' && this.channel_infoObj['enterprise_wechat'].check) {
        this.showTokenConf = true;
      } else {
        this.showTokenConf = false;
      }
    },
    checkBox(val) {
      this.ruleForm.channel_info = [];
      this.alertTypeValue = val;
      this.showTokenLink();
      for (const key in this.channel_infoObj) {
        if (this.channel_infoObj[key].check) {
          const item = {};
          item[key] = {
            isAlarmConfiguration: this.channel_infoObj[key].alert
          };
          this.ruleForm.channel_info.push(item);
        } else {
          const index = this.ruleForm.channel_info.findIndex(item => Object.keys(item)[0] === key);
          if (index > -1) {
            this.ruleForm.channel_info.splice(index, 1);
          }
        }
      }
    },
    changeLoginType() {
      this.showLoginBox = this.ruleForm.login_mode === 'LDAP';
      if (!this.showLoginBox) {
        this.ruleForm.is_enable_mfa = false;
      }
    },
    save() {
      this.$refs.ruleForm.validate(formValid => {
        if (formValid) {
          const saveparams = JSON.parse(JSON.stringify(this.systemParams));
          // this.ruleForm.channel_info = []
          saveparams.config = this.ruleForm;
          updateConfig(saveparams).then(res => {
            if (res.code === 0) {
              // 获取系统配置
              getConfig({ id: this.userInfo.tenantId }).then(res => {
                this.$store.commit('user/SET_SYSTEMCONF', res.data);
              });
              this.$message({
                type: 'success',
                message: '保存成功'
              });
            }
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.sidebar {
  min-height: 300px;
  width: 14% !important;
  position: fixed;
  top: 60px;
  z-index: 100;
  border: 1px solid #eee;
  padding: 10px;
  padding-left: 20px;
  border-radius: 10px;
  -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
}
.sidebar ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.sidebar li {
  padding: 10px;
  cursor: pointer;
}
.sidebar li.active {
  background-color: rgb(208, 234, 246);
  border-right: 2px solid #3782ff;
  a {
    color: #3782ff !important;
  }
}
.content {
  padding-left: calc(14% + 40px) !important;
  width: 100%;
  padding-top: 20px;
}
.content h2 {
  margin-top: 30px;
}
.content p {
  line-height: 1.8;
}
.a-tag {
  text-decoration: none;
}
a {
  color: #2c3b5e !important;
}
.ldap-box {
  width: 58%;
  margin-left: 80px;
  margin-top: 10px;
  padding: 15px 15px;
  padding-right: 30px;
  border: 1px solid #e4e7ed;
}
.text-box .el-textarea__inner {
  height: 80px;
}
.btn-wrap {
  width: 40%;
  margin: 0 auto;
  text-align: right;
  padding: 20px 0;
}
.section {
  margin-top: 20px;
}

.alert-method-box {
  width: 30%;
  margin-left: 15px;
  margin-top: 10px;
  padding: 15px 15px;
  border: 1px solid #e4e7ed;
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
  ::v-deep .el-form-item__label {
    font-weight: 400;
  }
  .el-form-item {
    margin: 5px 0;
  }
  .check-time-box {
    display: flex;
  }
  .check-time-group {
    margin-left: 10px;
    span {
      margin-left: 10px;
    }
  }
  .token-tip {
  }
}
.other-param {
  .check-text {
    margin-left: 15px;
    cursor: pointer;
  }
  .activeText {
    color: #3782ff;
    position: relative;
  }
  .activeText::before {
    content: '';
    position: absolute;
    width: 100%;
    border-bottom: 2px solid #3782ff;
    bottom: -5px;
  }
}
</style>
