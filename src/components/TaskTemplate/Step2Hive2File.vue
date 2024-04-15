<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :rules="rules" :model="ruleForm" label-width="140px">
          <el-tabs>
            <el-tab-pane label="数据源">
              <div class="sql-line">
                <sql-box label="SQL" :required="true" width-style="50" :is-show-check="true" name="content" @check="checkSql" @format="format" @clear="clearSql">
                  <!-- <div class="tip">在下方填写要执行sql语句，只支持写sql查询语句</div> -->
                  <sql-smaple class="metis-smaple" name="redis_sql"></sql-smaple>
                  <monaco-editor :key="currentStep" ref="content" v-model="content" v-loading="checkDisabled" class="content"></monaco-editor>
                </sql-box>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标设置">
              <el-form-item label="目标类型" prop="runtimeConfig.targetType">
                <el-radio-group v-model="ruleForm.runtimeConfig.targetType">
                  <el-radio label="email">email</el-radio>
                  <el-radio label="s3" disabled>s3</el-radio>
                  <el-radio label="obs" disabled>obs</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="主题" prop="runtimeConfig.subject">
                <el-input v-model="ruleForm.runtimeConfig.subject" placeholder="请输入主题" clearable class="input-ele"></el-input>
              </el-form-item>
              <el-form-item label="正文" prop="runtimeConfig.text">
                <el-input v-model="ruleForm.runtimeConfig.text" type="textarea" :rows="4" placeholder="正文" clearable></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="runtimeConfig.email">
                <el-input v-model="ruleForm.runtimeConfig.email" placeholder="请输入邮箱,多个邮箱之间用英文逗号分开" clearable class="input-ele"></el-input>
              </el-form-item>
              <el-form-item label="附件格式" prop="runtimeConfig.format">
                <el-input v-model="ruleForm.runtimeConfig.format" placeholder="请输入附件格式" clearable disabled class="input-ele"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <div v-if="alertMessage" class="mt10">校验结果：</div>
        <el-alert v-if="alertMessage" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
      </div>
      <!--  :is-show-source="true" -->
      <!-- <step-three v-if="currentStep === 2" ref="stepThree" :name-disabled="nameDisabled" :is-output-edit="true" :is-show-input-check="true" :rule-form="ruleForm"></step-three> -->
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :senior-form="seniorForm"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :region="ruleForm.runtimeConfig.sourceRegion"
        :rule-form="ruleForm"
      ></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :content="content"
        :region-list="regionList"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :is-show-mode="isShowMode" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <!-- <el-button v-if="isShowPublish && currentStep === 2" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
      }}</el-button>
      <el-checkbox v-if="isShowPublish && currentStep >= 3" v-model="ruleForm.invokingStatus" class="task-checkbox">切换至该版本</el-checkbox>
    </div>
    <valid-params
      ref="validParams"
      :code="ruleForm.templateCode"
      @save="
        params => {
          $emit('save', params);
        }
      "
    />
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlSmaple from './components/SqlSmaple';
import SqlBox from '@/views/dataSet/step/components/SqlBox';
import SqlTips from './components/SqlTips';
import StepThree from './components/StepThree';
import { getDataSetList, check } from '@/api/task';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

var validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'));
    return;
  }
  const valueArr = value.split(',');
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (valueArr.some(val => !reg.test(val))) {
    callback(new Error('请输入正确的邮箱格式,多个邮箱之间用英文逗号分开'));
  } else {
    callback();
  }
};
export default {
  components: {
    StepsHead,
    SeniorForm,
    MonacoEditor,
    SqlSmaple,
    SqlBox,
    StepThree,
    ValidParams,
    ViewParams
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isShowPublish: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      default: 'task'
    }
  },
  data() {
    return {
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      content: '',
      ruleForm: {
        templateCode: 'Hive2File',
        folderName: '',
        folderId: '',
        runtimeConfig: {
          sourceRegion: '',
          sql: '',
          targetType: 'email',
          subject: '',
          text: '',
          email: '',
          format: 'csv'
        },
        content: '',
        invokingStatus: true,
        name: '',
        description: '',
        dependTypes: [],
        triggerParam: {
          type: 'data',
          isIrregularSheduler: 1,
          outputGranularity: 'daily',
          crontabParam: {
            // cycle: 'minutely',
            range: [],
            interval: 5,
            startTime: '00:00',
            endTime: '23:59',
            fixedTime: '00:00'
          },
          crontab: ''
        },
        eventDepends: [
          // {
          //   dependId: '',
          //   dependGra: '',
          //   dateCalculationParam: {},
          //   unitOffset: 0,
          //   useDateCalcuParam: false,
          //   granularity: '',
          //   taskId: ''
          // }
        ],
        // 输入数据集
        inputDataset: [
          {
            metadata: {
              region: '',
              type: 'hive',
              source: '',
              db: '',
              table: ''
            },
            guid: '',
            id: '',
            granularity: 'daily',
            // offset: -1,
            unitOffset: 0,
            ready_time: '0 0 * * *',
            useDateCalcuParam: false,
            dateCalculationParam: {}
          }
        ],
        outputDataset: [
          // {
          //   metadata: {
          //     region: '',
          //     type: 'clickhouse',
          //     source: '',
          //     db: '',
          //     table: ''
          //   },
          //   offset: -1
          // }
        ],
        cost: [
          // 核对
          {
            key: '',
            value: '100'
          }
        ]
      },
      rules: {
        runtimeConfig: {
          sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
          targetType: [{ required: true, message: '请选择目标类型', trigger: ['change'] }],
          subject: [{ required: true, message: '请输入主题', trigger: ['blur'] }],
          text: [{ required: true, message: '请输入正文', trigger: ['blur'] }],
          email: [
            { required: true, validator: validateEmail, trigger: ['blur'] }
            // { validator: validateEmail, trigger: ['blur', 'change'] }
          ],
          format: [{ required: true, message: '请输入附件格式', trigger: ['blur'] }]
        }
      },
      regionList: tools.regionList,
      seniorForm: {
        partitions: 'datepart={{ yesterday_ds }}',
        owner: '',
        collaborators: [],
        checkExpirationTime: 24,
        dsGroups: [],
        group: '',
        resourceLevel: 'standard',
        executionTimeout: 0,
        retryInterval: 600,
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: []
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      fullscreen: false,
      canEdit: true,
      nameDisabled: false,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      isEdit: false
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm);
    },
    disabled() {
      return this.currentStep === 3;
    },
    isShowMode() {
      if (this.ruleForm.runtimeConfig.sourceRegion === 'sg2') {
        return false;
      } else {
        return true;
      }
    }
  },
  watch: {
    data: {
      handler(value) {
        if (Object.keys(value).length > 0) {
          this.getTaskInfo(value);
          this.isEdit = true;
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.ruleForm.folderId = this.$route.query.folderId;
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      setTimeout(() => {
        if (!this.isEdit) {
          this.ruleForm.runtimeConfig.sourceRegion = res[0].value;
        }
      });
    });
  },
  methods: {
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    // 处理接口请求回来的模版数据
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.ruleForm.content = data.content;
      this.content = decodeURIComponent(window.atob(data.content));
      this.$nextTick(() => {
        this.$refs.content && this.$refs.content.setCode(this.content);
      });
      this.$set(this.ruleForm, 'online', data.online);
      for (const key in this.ruleForm.runtimeConfig) {
        this.ruleForm.runtimeConfig[key] = runtimeConfig[key];
      }
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;

      if (data.dependTypes) {
        this.ruleForm.dependTypes = JSON.parse(data.dependTypes);
      }
      if (data.triggerParam) {
        Object.assign(this.ruleForm.triggerParam, JSON.parse(data.triggerParam));
      }
      if (data.eventDepends) {
        this.ruleForm.eventDepends = JSON.parse(data.eventDepends);
      }
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
    },

    checkSql() {
      if (!this.ruleForm.runtimeConfig.sourceRegion) {
        this.$message({
          type: 'warning',
          message: '请先选择区域'
        });
        return;
      }
      if (!this.content) {
        this.$message({
          type: 'warning',
          message: '请输入SQL'
        });
      } else {
        this.checkDisabled = true;
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        check({
          ...this.ruleForm,
          runtimeConfig: {
            ...this.seniorForm,
            ...this.ruleForm.runtimeConfig
          }
        })
          .then(res => {
            const data = res.data;
            const msg = filters.dataTime(new Date()) + '\n' + data + '\n';
            // this.alertMessage = msg + this.alertMessage;
            this.alertMessage = msg;
            if (data.indexOf('正常') !== -1) {
              this.alertType = 'success';
            } else {
              this.alertType = 'error';
            }
            this.$nextTick(() => {
              window.scrollTo(0, 200);
            });
          })
          .finally(() => {
            this.checkDisabled = false;
          });
      }
    },
    format(name) {
      this.$refs[name].formatSql();
    },
    clearSql(name) {
      this.$refs[name].setCode('');
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    checkForm(form) {
      return new Promise((resolve, reject) => {
        const dd = form === 'seniorForm' && this.$refs.seniorForm.$refs[form] ? this.$refs.seniorForm.$refs[form] : this.$refs[form];
        dd.validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep(text) {
      if (this.currentStep === 1) {
        const list = [];
        list.push(this.checkForm('form'));
        if (this.$refs.seniorForm) {
          list.push(this.checkForm('seniorForm'));
        }
        Promise.all(list)
          .then(() => {
            if (this.content) {
              // if (!this.copyId) {
              //   this.ruleForm.name = `exp_${this.seniorForm.targetDB}_${this.seniorForm.targetTable}`;
              // }
              // this.ruleForm.inputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              // this.ruleForm.outputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              this.currentStep++;
            } else {
              this.$message.error('请输入SQL');
            }
          })
          .catch(() => {
            this.$message.info('请完善信息!');
          });
      } else if (this.currentStep === 2 && this.source === 'task') {
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            if (this.$refs.stepThree.validateType()) {
              this.currentStep++;
              this.$nextTick(() => {
                document.documentElement.scrollTo(0, 0);
              });
            }
          }
        });
      } else {
        // if (!this.seniorForm.source) {
        //   this.seniorForm.source = this.source;
        // }
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        const params = {
          ...tools.copyFn(this.ruleForm),
          runtimeConfig: {
            ...this.seniorForm,
            ...this.ruleForm.runtimeConfig,
            cost: this.ruleForm.cost
          }
        };
        params.inputDataset.forEach(item => {
          item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
        });
        // if (this.copyId) {
        //   params.outputDataset = [];
        // } else {
        //   params.outputDataset.forEach(item => {
        //     // item.id = '';
        //     if (item.sourceTableList) {
        //       delete item.sourceTableList;
        //     }
        //     if (item.granularityList) {
        //       delete item.granularityList;
        //     }
        //     if (item.checkPathList) {
        //       delete item.checkPathList;
        //     }
        //   });
        // }
        params.outputDataset.forEach(item => {
          // item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
          if (item.granularityList) {
            delete item.granularityList;
          }
          if (item.checkPathList) {
            delete item.checkPathList;
          }
        });
        if (this.$store.getters.userInfo && !this.seniorForm.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        // 拷贝params，处理传参
        const paramsVal = JSON.parse(JSON.stringify(params));
        // 处理定时告警数据
        if (!paramsVal.runtimeConfig.regularAlert.isChecked) {
          delete paramsVal.runtimeConfig.regularAlert;
        }
        Object.keys(paramsVal.runtimeConfig.alertModel).forEach(item => {
          if (!paramsVal.runtimeConfig.alertModel[item].isChecked) {
            paramsVal.runtimeConfig.alertModel[item] = this.initAlertModel;
          }
        });
        paramsVal.folderId = this.ruleForm.folderId;
        // 处理生成标志
        if (!paramsVal.outputDataset[0].check) {
          paramsVal.outputDataset[0].fileName = '';
          paramsVal.outputDataset[0].location = '';
        }
        if (!paramsVal.outputDataset[0].id) {
          delete paramsVal.outputDataset[0].id;
        }
        this.$refs.validParams.show(paramsVal);
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
  .step-content {
    padding: 0 0 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .sql-line {
      width: 100%;
      margin: 0 auto;
      // padding-left: 10px;
      ::v-deep .sql-box .sql-box-content .label {
        // text-align: left;
        padding-right: 20px;
      }
      ::v-deep .sql-box .sql-box-btn {
        margin-bottom: 10px;
      }
      ::v-deep .sql-smaple {
        top: -35px;
        right: 250px;
      }
    }
    .open-btn {
      position: absolute;
      right: 20px;
      // top: 15px;
      z-index: 2;
    }
    .inline-form {
      background: #fff;
      border: 0;
      margin-bottom: 0;
      padding: 0;
      width: calc(100% - 300px);
      .el-input,
      .el-select {
        width: 214px;
      }
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 700px;
        margin: 0 auto 18px;
      }
      .el-cascader,
      .el-select,
      .el-input {
        width: 70%;
      }
    }
    .monaco-editor-wrap {
      // height: calc(100vh - 430px);
      height: 300px;
      position: relative;
      margin-top: 40px;
      .monaco-btns {
        position: absolute;
        right: 0;
        top: -40px;
      }
    }
    .btn-full-screen {
      right: 14px;
    }
    .table-fullscreen {
      overflow-y: hidden;
    }
    .senior-input {
      width: 200px;
    }
    .check-msg {
      margin-top: 5px;
      white-space: pre-line;
      max-height: 200px;
      overflow-y: auto;
      ::v-deep .el-alert__content {
        max-height: 200px;
      }
    }
    .source-region {
      width: 100% !important;
    }
    .input-ele {
      width: 100% !important;
    }
  }
}
</style>
