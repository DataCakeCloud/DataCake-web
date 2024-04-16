<template>
  <el-dropdown trigger="hover" class="tenant_wrap" placement="bottom-start">
    <span class="el-dropdown-link">
      <svg calss="icon" t="1681206176556" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2668" width="20" height="20">
        <path
          d="M479.957333 29.525333a43.989333 43.989333 0 0 1 55.402667-5.12l2.922667 2.154667 3.178666 2.858667L992.512 467.2c16.832 16.853333 16.832 43.818667 0 60.650667-14.784 14.762667-37.845333 16.64-55.466667 4.949333l-3.029333-2.197333-3.242667-2.88 0.021334 355.114666c0.512 68.757333-53.205333 126.186667-122.368 133.546667l-4.970667 0.426667-4.906667 0.256-4.906666 0.085333H229.866667c-72.490667 0-132.010667-54.293333-137.28-124.352l-0.277334-4.906667-0.085333-4.949333-0.021333-356.202667-1.088 1.109334c-13.909333 13.909333-35.178667 16.384-52.330667 6.848l-3.157333-1.92-3.050667-2.218667-3.093333-2.709333a42.730667 42.730667 0 0 1-4.757334-54.890667l2.24-2.986667 2.688-2.922666L476.48 33.472c1.066667-1.386667 2.24-2.688 3.477333-3.946667z m31.018667 90.752l-331.882667 322.133334v440.533333c0 24.469333 18.922667 44.906667 43.562667 47.914667l3.413333 0.32 3.306667 0.085333h563.776c25.642667 0 46.762667-18.346667 49.877333-41.898667l0.298667-3.242666 0.106667-3.178667-0.021334-439.978667L510.976 120.277333z"
          p-id="2669"
          fill="currentColor"
        ></path>
        <path
          d="M512 336.725333a167.765333 167.765333 0 0 1 119.125333 285.909334l-4.074666 3.968-0.896 0.789333 2.176 1.258667a229.290667 229.290667 0 0 1 112.725333 185.386666l0.234667 6.314667 0.085333 6.016a37.632 37.632 0 0 1-75.264 0 154.112 154.112 0 1 0-308.224 0 37.632 37.632 0 0 1-75.264 0c0-80.384 41.728-153.28 107.904-194.602667l5.12-3.114666 2.176-1.258667-0.853333-0.789333a167.296 167.296 0 0 1-52.352-110.656l-0.298667-5.845334-0.085333-5.610666A167.765333 167.765333 0 0 1 512 336.725333z m0 75.242667a92.522667 92.522667 0 1 0 0 185.024 92.522667 92.522667 0 0 0 0-185.024z"
          p-id="2670"
          fill="currentColor"
        ></path>
      </svg>
      {{ userInfo.tenantName || '-' }}
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item divided @click.native="showTenantInfo">
        <i class="el-icon-setting"></i>
        租户信息
      </el-dropdown-item>
    </el-dropdown-menu>
    <el-dialog title="租户设置" class="tenant_dialog" :visible.sync="dialogVisible" width="600px" :modal-append-to-body="false" @closed="handleClose">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="租户名称" prop="tenantName">
          <el-input type="text" v-model="ruleForm.tenantName" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员邮箱" prop="email">
          <el-input type="text" v-model="ruleForm.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="租户描述" prop="description">
          <div v-if="isAdmin" class="aksk_tool">
            <span></span>
            <el-tooltip class="item" effect="dark" content="保存" placement="top">
              <i v-if="desLoading" class="el-icon-loading icon"></i>
              <svg-icon v-else @click="saveDes" icon-class="save" class="icon" />
            </el-tooltip>
          </div>
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="ruleForm.description"> </el-input>
        </el-form-item>
        <el-form-item label="开发者aksk" prop="aksk">
          <div class="aksk_tool">
            <el-tooltip class="item" effect="dark" content="仅功能角色admin具有生成aksk的权限；其他角色的用户仅可复制" placement="top">
              <i class="el-icon-info icon"></i>
            </el-tooltip>
            <div class="tool-right">
              <el-button class="icon btn" v-if="isAdmin" type="text" @click="getAksk">
                <i v-if="akskLoading" class="el-icon-loading icon"></i>
                <span v-else>更新</span>
              </el-button>
              <el-tooltip class="item" effect="dark" content="复制" placement="top">
                <i class="el-icon-document-copy icon" @click="copyUrl(ruleForm.aksk)"></i>
              </el-tooltip>
            </div>
          </div>
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="ruleForm.aksk" disabled> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
        <!-- <el-button type="primary" @click="confirm">确 定</el-button> -->
      </span>
    </el-dialog>
  </el-dropdown>
</template>

<script>
import copy from 'copy-to-clipboard';
import { mapGetters } from 'vuex';
import { getUserAksk, updateUserAksk } from '@/api/user';

export default {
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        tenantName: '',
        email: '',
        description: '',
        aksk: ''
      },
      defaultFrom: {
        tenantName: '',
        email: '',
        description: '',
        aksk: ''
      },
      rules: {},
      akskLoading: false,
      desLoading: false
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    isAdmin() {
      let roles = this.userInfo.roles || '';
      return roles.includes('root');
    }
  },
  methods: {
    tenantInfo(params) {
      const fn = params ? updateUserAksk : getUserAksk;
      fn(params)
        .then(res => {
          const data = res.data || {};
          this.ruleForm.aksk = `ak: ${data.ak}\nsk: ${data.sk}`;
          this.ruleForm.description = data.description;
          this.ruleForm.email = data.email;
          if (params) {
            this.$message.success('操作成功');
          }
        })
        .finally(() => {
          this.akskLoading = false;
          this.desLoading = false;
        });
    },
    saveDes() {
      this.desLoading = true;
      this.tenantInfo({
        type: 1,
        description: this.ruleForm.description
      });
    },
    getAksk() {
      this.akskLoading = true;
      this.tenantInfo({
        type: 2
      });
    },
    copyUrl(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    showTenantInfo() {
      this.dialogVisible = true;
      this.ruleForm.tenantName = this.userInfo.tenantName;

      this.tenantInfo();
    },
    handleClose() {
      this.$refs.ruleForm.clearValidate();
      Object.assign(this.ruleForm, this.defaultFrom);
    }
  }
};
</script>

<style lang="scss" scoped>
.tenant_dialog {
  ::v-deep .el-dialog__body {
    padding-bottom: 0px;
  }
}
.tenant_wrap {
  padding-top: 1px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #fff;

  .icon {
    transform: translateY(-2px);
    margin-right: 5px;
  }
}
.demo-ruleForm {
  .aksk_tool {
    height: 16px;
    margin: 10px 0;
    color: $c-primary;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon {
      cursor: pointer;
      &.btn {
        margin-right: 5px;
        padding: 0;
      }
    }
  }
}
</style>
