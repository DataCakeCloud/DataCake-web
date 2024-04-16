<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :rules="rules" :model="ruleForm" label-width="140px">
          <el-form-item label="区域" prop="runtimeConfig.sourceRegion">
            <template #label>
              <span>区域</span>
              <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="ruleForm.runtimeConfig.sourceRegion" placeholder="请选择区域" clearable class="source-region">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="代码位置" prop="runtimeConfig.codeAddr">
            <el-input v-model="ruleForm.runtimeConfig.codeAddr" placeholder="请输入代码位置" clearable class="input-ele"></el-input>
          </el-form-item>
          <el-form-item label="训练参数文件" prop="runtimeConfig.paramFile">
            <el-input v-model="ruleForm.runtimeConfig.paramFile" placeholder="请输入训练参数文件" clearable class="input-ele"></el-input>
          </el-form-item>
          <el-form-item label="执行命令" prop="runtimeConfig.executeCommand">
            <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
              <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="fullscreen = !fullscreen"></i>
              <monaco-editor :key="currentStep" ref="monaco" v-model="ruleForm.runtimeConfig.executeCommand" word-wrap="on"></monaco-editor>
            </div>
            <!-- <div class="tip">{{ tipTxt }}</div> -->
          </el-form-item>
          <div class="form-item-line">
            <el-form-item label="CPU资源" prop="runtimeConfig.cpu" class="line-one">
              <el-input v-model.number="ruleForm.runtimeConfig.cpu" type="number" placeholder="请输入CPU资源" class="input-ele"></el-input>
              核
            </el-form-item>
            <el-form-item label="内存资源" prop="runtimeConfig.memory" class="line-one">
              <el-input v-model.number="ruleForm.runtimeConfig.memory" type="number" placeholder="请输入cpu资源" class="input-ele"></el-input>
              GB
            </el-form-item>
            <el-form-item label="GPU资源" prop="runtimeConfig.gpu" class="line-one">
              <el-input v-model.number="ruleForm.runtimeConfig.gpu" type="number" placeholder="请输入GPU资源" class="input-ele"></el-input>
              卡
            </el-form-item>
          </div>
        </el-form>
      </div>
      <!--  :is-show-source="true" -->
      <!-- <step-three v-if="currentStep === 2" ref="stepThree" :name-disabled="nameDisabled" :is-output-edit="true" :is-show-input-check="true" :rule-form="ruleForm"></step-three> -->
      <step-three v-if="currentStep === 2" ref="stepThree" :name-disabled="nameDisabled" :is-show-input-btn="true" :is-input-edit="true" :is-output-edit="true" :is-show-input-check="true" :is-show-output-check="true" :region="ruleForm.runtimeConfig.sourceRegion" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :content="ruleForm.runtimeConfig.executeCommand"
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
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      ruleForm: {
        templateCode: 'TfJob',
        runtimeConfig: {
          sourceRegion: '',
          codeAddr: '',
          paramFile: '',
          executeCommand: '',
          cpu: '',
          memory: '',
          gpu: ''
        },
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
        eventDepends: [],
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
          codeAddr: [{ required: true, message: '请输入代码位置', trigger: ['blur'] }],
          paramFile: [{ required: true, message: '请输入训练参数文件', trigger: ['blur'] }],
          executeCommand: [{ required: true, message: '请输入执行命令', trigger: ['blur', 'change'] }],
          cpu: [{ required: true, message: '请输入CPU资源', trigger: ['blur'] }],
          memory: [{ required: true, message: '请输入内存资源', trigger: ['blur'] }],
          gpu: [{ required: true, message: '请输入GPU资源', trigger: ['blur'] }]
        }
      },
      regionList: tools.regionList,
      seniorForm: {
        partitions: 'datepart={{ yesterday_ds }}',
        owner: '',
        collaborators: [],
        dsGroups: [],
        group: '',
        resourceLevel: 'standard',
        executionTimeout: 0,
        retryInterval: 600,
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        alertMethod: ['dingTalk'],
        alertType: [2],
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
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
      tipTxt: `--demo--
--这是一串带代码我想在这折行请手动输入“\\”
--job_name test.--ads_table \\
--dt {{ (execution_date - macros.timedelta(days=1)).strftime("%Y%m%d") }}`
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
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    tools.regionList.then(res => {
      this.regionList = res;
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

      this.$set(this.ruleForm, 'online', data.online);
      for (const key in this.ruleForm.runtimeConfig) {
        this.ruleForm.runtimeConfig[key] = runtimeConfig[key];
      }
      this.$refs.monaco && this.$refs.monaco.setCode(runtimeConfig.executeCommand);
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
            this.currentStep++;
          })
          .catch(() => {
            this.$message.info('请完善信息!');
          });
      } else if (this.currentStep === 2 && this.source === 'task') {
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.currentStep++;
            this.$nextTick(() => {
              document.documentElement.scrollTo(0, 0);
            });
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
        // this.$emit('save', params, text);
        this.$refs.validParams.show(params);
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
      width: 700px;
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
        top: -38px;
        left: 138px;
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
      width: 70%;
      margin: 0 0 0 8%;
      ::v-deep .el-form-item {
        margin-bottom: 18px;
      }
      .el-cascader,
      .el-select,
      .el-input {
        width: 70%;
      }
    }
    .line-one {
      ::v-deep .el-form-item__content {
        display: flex;
      }
    }
    .monaco-editor-wrap {
      // height: calc(100vh - 430px);
      height: 230px;
      position: relative;
      // margin-top: 40px;
      .monaco-btns {
        position: absolute;
        right: 0;
        top: -40px;
      }
    }
    .form-item-line {
      width: 550px;
      margin: 0 auto;
      margin-right: 0;
      display: flex;
      justify-content: space-between;
      ::v-deep .el-form-item__label {
        width: 80px !important;
      }
      ::v-deep .el-form-item__content {
        margin-left: 80px !important;
      }
      ::v-deep .el-form-item {
        margin-left: 10px;
      }
      ::v-deep input[type='number'] {
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
        }
        -moz-appearance: textfield;
      }
    }
    .tip {
      white-space: pre-wrap;
      z-index: 0;
      color: green;
      line-height: 21px;
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
