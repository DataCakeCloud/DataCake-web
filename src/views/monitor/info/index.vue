<template>
  <el-card class="config-info box-card-container">
    <el-page-header class="header" content="配置详情" @back="goBack"></el-page-header>
    <el-form ref="ruleForm" :model="configData" :rules="rules" class="form-content" label-width="140px">
      <el-tabs>
        <el-tab-pane label="基本信息" class="tab-content">
          <el-form-item label="监控名称" prop="name">
            <el-input v-model="configData.name" placeholder="请输入监控名称，60个字符" class="tab-input" clearable maxlength="60" show-word-limit></el-input>
          </el-form-item>
          <el-form-item label="数据集" required>
            <el-row class="tab-input" :gutter="5">
              <el-col :span="7">
                <el-form-item prop="dataRegion" style="margin-bottom: 0">
                  <el-select v-model="configData.dataRegion" placeholder="请选择数据源" clearable disabled style="width: 100%" @change="changeRegion">
                    <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item prop="dataSet" style="margin-bottom: 0">
                  <el-select v-model="configData.dataSet" placeholder="请选择数据源集合" :title="configData.dataSet" disabled clearable filterable style="width: 100%" @change="changeDb">
                    <el-option v-for="item in dbList" :key="item.guid" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item prop="dataTable" style="margin-bottom: 0">
                  <el-select v-model="configData.dataTable" placeholder="请选择数据表" :title="configData.dataTable" disabled clearable filterable style="width: 100%">
                    <el-option v-for="item in tableList" :key="item.guid" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="等级" prop="alertLevel">
            <el-select v-model="configData.alertLevel" placeholder="请选择等级" class="tab-input" clearable>
              <el-option v-for="item in levelList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="负责人">
            <el-select v-model="configData.ownerName" placeholder="请输入负责人" clearable filterable remote :remote-method="remoteMethod" :disabled="Boolean(id)" :loading="ownerLoading" class="tab-input" popper-class="custom-popper">
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.name" :label="item.name">
                <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-tabs>
        <el-tab-pane label="监控规则" class="tab-content">
          <el-form-item label="监控周期" prop="checkInterval">
            <el-radio-group v-model="configData.checkInterval" class="tab-input">
              <el-radio :label="0">天</el-radio>
              <el-radio :label="1">小时</el-radio>
            </el-radio-group>
            <div class="tips">提示：目前仅支持天级别、小时级别周期的数据集。</div>
          </el-form-item>
          <el-form-item label="基线时间" prop="checkTime">
            <template v-if="configData.checkInterval === 0"> <el-input-number v-model="configData.checkHourTime" controls-position="right" :min="0" :max="23" style="width: 90px"> </el-input-number> 时 </template>
            <el-input-number v-model="configData.checkMinuteTime" controls-position="right" :min="0" :max="60" style="width: 90px"></el-input-number> 分
            <div class="tips">提示：监控开始的时间。</div>
          </el-form-item>
          <el-form-item label="success文件路径" prop="successFile">
            <el-input v-model="configData.successFile" type="textarea" rows="3" placeholder="请输入success文件路径" class="tab-input" clearable></el-input>
            <div class="tips">提示：此路径非常重要，请仔细核实后填写!</div>
            <div class="tips">填写示例：shareit.ads.ap-southeast-1/feature_store/midas/bucket_join_data/datepart={%Y%m%D}/_SUCCESS</div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-tabs>
        <el-tab-pane label="触达方式" class="tab-content">
          <el-form-item label="触达方式" prop="triggerType">
            <el-radio-group v-model="configData.triggerType" class="tab-input">
              <el-radio :label="0">钉钉群</el-radio>
              <el-radio :label="1">webhook</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="configData.triggerType === 0">
            <el-form-item label="钉钉群token" prop="alertGroupIds">
              <el-input v-model="configData.alertGroupIds" type="textarea" rows="3" placeholder="请输入钉钉群token" class="tab-input"></el-input>
              <a class="link" href="https://shimo.im/docs/rp3OVQDlyKu99bAm" target="blank">怎么获取token？</a>
              <div class="tips">示例：b597305058dcf7f566e05b63f350bb82cbe079ee54d2ec09f3a61631587b3b4c</div>
            </el-form-item>
            <el-form-item label="此群需要@">
              <el-select v-model="configData.owner" placeholder="请输入用户ID" clearable filterable remote :remote-method="remoteMethod2" :loading="ownerLoading2" class="tab-input" popper-class="custom-popper">
                <el-option v-for="item in ownerList2" :key="item.shareId" :value="item.mobile" :label="item.name">
                  <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.mobile }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="webhook接口" prop="webhookUrl">
              <el-input v-model="configData.webhookUrl" type="textarea" rows="3" placeholder="请输入webhook接口地址" class="tab-input"></el-input>
            </el-form-item>
          </template>
          <el-form-item style="margin-top: 40px">
            <el-button type="primary" :disabled="btnDisabled" @click="save">保存</el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>
<script>
import { getDataSetList, getUserList } from '@/api/task';
import { addItem, slaInfo, updateItem } from '@/api/sla';
import * as tools from '@/utils/tools';

export default {
  name: 'MonitorConfigInfo',
  data() {
    return {
      ownerLoading: false,
      ownerLoading2: false,
      id: this.$route.query.id,
      rules: {
        name: [{ required: true, message: '请输入监控名称', trigger: ['blur', 'change'] }],
        type: [{ required: true, message: '请选择类型', trigger: ['blur', 'change'] }],
        dataRegion: [{ required: true, message: '请选择分区', trigger: 'change' }],
        dataSet: [{ required: true, message: '请选择数据集合', trigger: 'change' }],
        dataTable: [{ required: true, message: '请选择数据表', trigger: 'change' }],
        alertLevel: [{ required: true, message: '请选择等级', trigger: 'change' }],
        checkInterval: [{ required: true, message: '请选择监控周期', trigger: 'change' }],
        checkTime: [{ required: true, message: '请选择基线时间', trigger: 'change' }],
        successFile: [{ required: true, message: '请输入success文件路径', trigger: ['blur', 'change'] }],
        alertGroupIds: [{ required: true, message: '请输入钉钉群token', trigger: ['blur', 'change'] }],
        triggerType: [{ required: true, message: '请选择触发方式', trigger: 'change' }],
        webhookUrl: [{ required: true, message: '请输入webhook接口地址', trigger: ['blur', 'change'] }]
      },
      taskName: '',
      regionList: tools.regionList,
      dbList: [],
      tableList: [],
      levelList: tools.levelList,
      ownerList: [],
      ownerList2: [],
      btnDisabled: false,

      configData: {
        active: 0,
        alertGroupIds: '',
        alertLevel: 1,
        checkTime: '',
        checkHourTime: '',
        checkInterval: 0,
        checkMinuteTime: '',
        dataRegion: '',
        dataSet: '',
        dataTable: '',
        dataGuid: '',
        name: '',
        triggerType: 0,
        webhookUrl: '',
        owner: '',
        ownerName: '',
        successFile: ''
      }
    };
  },
  watch: {
    'params.checkInterval'(val) {
      this.params.checkTime = '';
      if (val === 1) {
        this.params.checkHourTime = null;
        this.params.checkMinuteTime = null;
      }
    },
    'configData.checkHourTime'(val) {
      // this.$forceUpdate();
      let h = null;
      if (val === undefined) h = 0;
      else h = val;
      this.configData.checkTime = `${parseInt(h) < 10 ? '0' + h : h}:${!this.configData.checkMinuteTime ? '00' : this.configData.checkMinuteTime < 10 ? '0' + this.configData.checkMinuteTime : this.configData.checkMinuteTime}`;
    },
    'configData.checkMinuteTime'(val) {
      // this.$forceUpdate();
      let m = null;
      if (val === undefined) m = 0;
      else m = val;
      this.configData.checkTime = `${!this.configData.checkHourTime ? '00' : this.configData.checkHourTime < 10 ? '0' + this.configData.checkHourTime : this.configData.checkHourTime}:${parseInt(m) < 10 ? '0' + m : m}`;
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (this.id) this.getSlaInfo();
    else this.initInfo();
  },
  methods: {
    initInfo() {
      const sla = JSON.parse(sessionStorage.getItem('SLA'));
      this.configData.dataRegion = sla.region;
      this.configData.dataSet = sla.db;
      this.configData.dataTable = sla.table;
      this.configData.dataGuid = sla.guid;
    },
    getSlaInfo() {
      slaInfo({ id: this.id }).then(res => {
        if (res.resultCode !== 0) return;
        const data = res.data;
        const checkTime = data.checkTime.split(':');
        const hour = data.checkInterval === 1 ? 0 : checkTime[0];
        const min = checkTime[1];
        this.configData = data;

        this.configData.checkHourTime = parseInt(hour);
        this.configData.checkMinuteTime = parseInt(min);
      });
    },
    goBack() {
      this.$router.push({ name: 'MonitorList' });
    },
    // handleInterval(val) {
    //   this.configData.checkTime = '';
    //   if (val === 1) {
    //     this.configData.checkHourTime = '';
    //   }
    // },
    // checkHourTime(val) {
    //   this.$forceUpdate();
    //   let h = null;
    //   if (val === undefined) h = 0;
    //   else h = val;
    //   this.configData.checkTime = `${parseInt(h) < 10 ? '0' + h : h}:${!this.configData.checkMinuteTime ? '00' : this.configData.checkMinuteTime < 10 ? '0' + this.configData.checkMinuteTime : this.configData.checkMinuteTime}`;
    // },
    // checkMinuteTime(val) {
    //   this.$forceUpdate();
    //   let m = null;
    //   if (val === undefined) m = 0;
    //   else m = val;
    //   this.configData.checkTime = `${!this.configData.checkHourTime ? '00' : this.configData.checkHourTime < 10 ? '0' + this.configData.checkHourTime : this.configData.checkHourTime}:${parseInt(m) < 10 ? '0' + m : m}`;
    // },
    changeRegion(value) {
      this.dbList = [];
      if (value) {
        getDataSetList({
          region: value,
          type: 'hive'
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.dbList = data.data;
          }
        });
      }
    },
    changeDb(value) {
      this.tableList = [];
      if (value) {
        getDataSetList({
          region: this.ruleForm.region,
          type: 'hive',
          db: value
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.tableList = data.data;
          }
        });
      }
    },
    remoteMethod(query, shareId) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
          if (shareId) {
            const obj = this.ownerList.find(item => item.shareId === shareId);
            this.ruleForm.ownerName = obj ? obj.name : '';
          }
        });
      } else {
        this.ownerList = [];
      }
    },
    remoteMethod2(query, shareId) {
      if (query !== '') {
        this.ownerLoading2 = true;
        getUserList(query).then(res => {
          this.ownerLoading2 = false;
          const data = res.data;
          this.ownerList2 = data;
          if (shareId) {
            const obj = this.ownerList2.find(item => item.shareId === shareId);
            this.ruleForm.ownerPhone = obj ? obj.Mobile : '';
          }
        });
      } else {
        this.ownerList2 = [];
      }
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.configData);
          this.btnDisabled = true;
          if (!this.id) {
            addItem(params)
              .then(res => {
                if (res.resultCode !== 0) return;
                this.$message({
                  type: 'success',
                  message: '添加配置成功'
                });
                this.$router.push({ name: 'MonitorList' });
              })
              .finally(() => {
                this.btnDisabled = false;
              });
          } else {
            updateItem(params)
              .then(res => {
                if (res.resultCode !== 0) return;
                this.$message({
                  type: 'success',
                  message: '编辑配置成功'
                });
                this.$router.push({ name: 'MonitorList' });
              })
              .finally(() => {
                this.btnDisabled = false;
              });
          }
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0 20px;
  }
}
.config-info {
  .header {
    height: 50px;
    line-height: 50px;
  }
  .form-content {
    .tab-content {
      .tab-input {
        width: 70%;
      }
      .link {
        font-size: $global-font-size-12;
        margin-left: 15px;
      }
      .tips {
        color: #909399;
      }
    }
  }
}
</style>
