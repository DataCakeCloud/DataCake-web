<template>
  <el-dialog v-loading="loading" :title="!Object.keys(editData).length ? '新建云资源' : '编辑云资源'" :visible="visible" width="48%" :close-on-click-modal="false" @update:visible="dialogVisiable = $event" @close="close">
    <el-form ref="form" :model="params" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item prop="name" label="云资源名称">
            <el-input v-model="params.name" clearable placeholder="请输入容易识别的云资源名称" maxlength="50" show-word-limit :disabled="Object.keys(editData).length > 0"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item prop="provider" label="云商信息">
            <el-select v-model="params.provider" clearable placeholder="选择云商" style="width: 100%" :disabled="Object.keys(editData).length > 0" @change="handleChangeProvider">
              <el-option v-for="(item, index) in providerList" :key="index" :disabled="item.value === 'huaweicloud'" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item prop="region" label="区域信息" class="custom-form-item">
            <el-tooltip class="item" content="一个区域只能被一个云资源使用" effect="dark" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
            <el-select v-model="params.region" clearable filterable placeholder="选择区域" style="width: 100%" :disabled="Object.keys(editData).length > 0" @change="handleChangeRegion">
              <el-option v-for="(item, index) in regionList" :key="index" :label="item.description" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Principal">
        <el-input v-model="roleName" disabled suffix-icon="el-icon-document-copy" style="visibility: hidden"></el-input>
        <div style="margin-top: -30px">
          {{ roleName }}
          <i class="el-icon-document-copy" @click="handleCopy"></i>
          <a href="https://shimo.im/docs/KlkKVxR7PwUYxdqd" target="_blank" style="margin-left: 10px">如何获取云资源信息</a>
        </div>
      </el-form-item>
      <el-form-item prop="storage" label="存储桶名称">
        <el-input v-model.trim="params.storage" placeholder="存储桶名称"></el-input>
      </el-form-item>
      <template v-if="userInfo && userInfo.tenantName === 'bdp'">
        <el-form-item prop="roleName" label="服务角色" label-width="80px">
          <el-select v-model="params.roleName" clearable placeholder="服务角色" style="width: 65%">
            <el-option v-for="item in clouseterRoles" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="vpcId" label="VPC" label-width="80px">
          <el-select v-model="params.vpcId" clearable placeholder="VPC" style="width: 65%" @change="handelChangeVpcs">
            <el-option v-for="item in clouseterVpcs" :key="item.vpcId" :label="item.vpcName" :value="item.vpcId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="subnetIdsList" label="子网" label-width="80px">
          <el-select v-model="params.subnetIdsList" multiple collapse-tags clearable placeholder="子网" style="width: 65%">
            <el-option v-for="item in clouseterSubnets" :key="item.subnetId" :label="item.subnetId" :value="item.subnetId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="securityGroupIdsList" label="安全组" label-width="80px">
          <el-select v-model="params.securityGroupIdsList" multiple collapse-tags clearable placeholder="安全组" style="width: 65%">
            <el-option v-for="item in clouseterGroups" :key="item.groupId" :label="item.groupName" :value="item.groupId"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item v-if="showProgress">
        <el-progress :percentage="percentage" :text-inside="true" :stroke-width="26" :color="customColorMethod"></el-progress>
        <div style="color: 666">提示：正在校验区域信息和当前桶是否在同一区域；并且确认 datacake 平台是否获得该桶的读写删权限</div>
      </el-form-item>
      <div v-if="!!addResourceErrorMessage" class="error_message">
        {{ '错误: ' + addResourceErrorMessage }}
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button :loading="submitLoading" :disabled="submitLoading" type="primary" @click="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getRegion, resourceAdd, resourceUpdate, getClousterRoles, getClousterVpcs, getClousterSubnets, getClousterGroups } from '@/api/cluster';
import copy from 'copy-to-clipboard';
import { mapGetters } from 'vuex';

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
    const validateName = (rule, value, callback) => {
      const reg = /^[a-zA-Z][a-zA-Z0-9\-]*$/;
      if (!reg.test(value)) {
        callback(new Error('英文字母为首，中划线与数字的组合'));
      }
      callback();
    };
    const formatStorage = (rule, value, callback) => {
      if (!value.includes('://')) {
        callback(new Error('请补全对象存储协议名'));
      }
      callback();
    };
    return {
      addResourceErrorMessage: '',
      submitLoading: false,
      dialogVisiable: this.visible,
      roleName: 'arn:aws:iam::404486105145:root',
      providerList: [
        {
          name: 'AWS',
          value: 'aws'
        },
        {
          name: 'HuaweiCloud',
          value: 'huaweicloud'
        }
      ],
      percentage: 10,
      showProgress: false,
      regionList: [],
      params: {
        name: '',
        provider: '',
        region: '',
        storage: '',
        type: 'full-managed',
        roleName: '',
        vpcId: '',
        subnetIdsList: [],
        securityGroupIdsList: []
      },
      defaultParams: {
        name: '',
        provider: '',
        region: '',
        storage: '',
        type: 'full-managed',
        roleName: '',
        vpcId: '',
        subnetIdsList: [],
        securityGroupIdsList: []
      },
      rules: {
        name: [
          { required: true, message: '请输入云资源名称', trigger: ['blur'] },
          { validator: validateName, trigger: ['blur'] }
        ],
        provider: [{ required: true, message: '请选择云商', trigger: ['blur'] }],
        region: [{ required: true, message: '请选择区域', trigger: ['blur'] }],
        storage: [
          { required: true, message: '请输入桶名称', trigger: ['blur'] },
          { validator: formatStorage, trigger: 'blur' }
        ],
        roleName: [{ required: true, message: '请选择服务角色', trigger: ['blur'] }],
        vpcId: [{ required: true, message: '请选择VPC', trigger: ['blur'] }],
        subnetIdsList: [{ required: true, type: 'array', message: '请选择子网', trigger: ['blur'] }],
        securityGroupIdsList: [{ required: true, type: 'array', message: '请选择安全组', trigger: ['blur'] }]
      },
      clouseterRoles: [],
      clouseterVpcs: [],
      clouseterSubnets: [],
      clouseterGroups: []
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'params.vpcId': {
      handler() {
        this.params.subnetIdsList = [];
        this.params.securityGroupIdsList = [];
      }
    },
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
        this.params = Object.assign({}, this.params, val);
        this.$nextTick(() => {
          this.$set(this.params, 'subnetIdsList', val.subnetIdsList);
          this.$set(this.params, 'securityGroupIdsList', val.securityGroupIdsList);
        });
        this.submitLoading = false;
        if (!Object.keys(val).length) {
          // this.params.name = '';
          // this.params.provider = '';
          // this.params.region = '';
          // this.params.storage = '';

          // this.params = JSON.parse(JSON.stringify(this.defaultParams));
          this.params = Object.assign({}, this.defaultParams);
        } else {
          this.getRegion();
          this.getClousterRoles();
          this.getClousterVpcs();
          this.getClousterGroups();
          this.getClousterSubnets();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handelChangeVpcs() {
      this.getClousterGroups();
      this.getClousterSubnets();
    },
    getClousterGroups() {
      if (!this.params.provider || !this.params.region || !this.params.vpcId || this.userInfo?.tenantName !== 'bdp') return;
      this.clouseterGroups = [];
      const params = {
        cloud: this.params.provider,
        region: this.params.region,
        vpcId: this.params.vpcId
      };
      getClousterGroups(params).then(res => {
        this.clouseterGroups = res.data || [];
      });
    },
    getClousterSubnets() {
      if (!this.params.provider || !this.params.region || !this.params.vpcId || this.userInfo?.tenantName !== 'bdp') return;
      this.clouseterSubnets = [];
      const params = {
        cloud: this.params.provider,
        region: this.params.region,
        vpcId: this.params.vpcId
      };
      getClousterSubnets(params).then(res => {
        this.clouseterSubnets = res.data || [];
      });
    },
    getClousterVpcs() {
      if (!this.params.provider || !this.params.region || this.userInfo?.tenantName !== 'bdp') return;
      this.clouseterVpcs = [];
      const params = {
        cloud: this.params.provider,
        region: this.params.region
      };
      getClousterVpcs(params).then(res => {
        this.clouseterVpcs = res.data || [];
      });
    },
    getClousterRoles() {
      if (!this.params.provider || !this.params.region || this.userInfo?.tenantName !== 'bdp') return;
      this.clouseterRoles = [];
      const params = {
        cloud: this.params.provider,
        region: this.params.region
      };
      getClousterRoles(params).then(res => {
        this.clouseterRoles = res.data || [];
      });
    },
    close() {
      this.$refs['form'].clearValidate();
      this.addResourceErrorMessage = '';
      this.clouseterRoles = [];
      this.clouseterVpcs = [];
      this.clouseterSubnets = [];
      this.clouseterGroups = [];
    },
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
          if (this.addResourceErrorMessage) {
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
    getRegion() {
      getRegion({ provider: this.params.provider }).then(res => {
        this.regionList = res.data;
      });
    },
    handleChangeProvider() {
      this.getRegion();
      this.getClousterRoles();
      this.getClousterVpcs();
      this.params.roleName = '';
      this.params.vpcId = '';
    },
    handleChangeRegion(val) {
      this.getClousterRoles();
      this.getClousterVpcs();
      this.params.roleName = '';
      this.params.vpcId = '';
    },
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
    },
    ok() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.showProgress = true;
          this.addResourceErrorMessage = '';
          this.increase();
          let params = Object.assign({}, this.params, {
            description: this.providerList.find(e => e.value === this.params.provider)['name'] + ' ' + this.regionList.find(e => e.name === this.params.region)['description'],
            securityGroupIds: this.params.securityGroupIdsList?.join(','),
            subnetIds: this.params.subnetIdsList?.join(',')
          });
          if (this.userInfo.tenantName !== 'bdp') {
            delete params.securityGroupIdsList;
            delete params.subnetIdsList;
            delete params.vpcId;
          }
          if (Object.keys(this.editData).length) {
            params = Object.assign({}, params, { id: this.editData.id });
            resourceUpdate(params)
              .then(res => {
                this.submitLoading = false;
                if (res.code !== 0) return;
                this.$message({
                  type: 'success',
                  message: '编辑云资源成功'
                });
              })
              .catch(err => {
                this.addResourceErrorMessage = err.message || '';
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else {
            resourceAdd(params)
              .then(res => {
                this.submitLoading = false;
                if (res.code !== 0) return;
                this.$message({
                  type: 'success',
                  message: '添加云资源成功'
                });

                // 手动请求下菜单
                this.$store.dispatch('user/InitCloudRouters');

                this.$confirm('恭喜你已经完成云资源创建, 接下来是否要使用 S3 的数据进行接入（数据挂载）?', '下一步提示', {
                  distinguishCancelAndClose: true,
                  confirmButtonText: '去首页看看',
                  cancelButtonText: '数据挂载',
                  type: 'success'
                })
                  .then(() => {
                    window.localStorage.getItem('guidanceMode') !== null && window.localStorage.removeItem('guidanceMode');
                    this.$router.push({ name: 'Dashboard' });
                  })
                  .catch(action => {
                    if (action === 'cancel') this.$router.push({ name: 'ImportData' });
                  });
              })
              .catch(err => {
                this.addResourceErrorMessage = err.message || '';
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
