<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="regionForm" class="ruleForm" :model="seniorForm" label-width="100px">
          <el-form-item :label="$t('task.region')" prop="sourceRegion" :rules="[{ required: true, message: this.$t('task.HS24'), trigger: ['blur', 'change'] }]">
            <template #label>
              <span>{{ $t('task.region') }}</span>
              <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="seniorForm.sourceRegion" :placeholder="$t('task.dbTip2')" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="ruleForm" label-width="100px">
          <el-form-item label="文件类型" prop="type">
            <el-radio-group v-model="ruleForm.type" @change="changeRegion">
              <el-radio label="python"></el-radio>
              <el-radio label="jar"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <!--  :disabled="Boolean(queryId)" -->
            <el-radio-group v-model="ruleForm.typeCode" size="small" @change="typeChange">
              <el-radio-button label="ARTIFACT">选择上传版本</el-radio-button>
              <el-radio-button label="ONLINE">输入地址</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <template v-if="ruleForm.typeCode === 'ARTIFACT'">
            <el-form-item label="文件" prop="displayDependJars.0.artifactId" :rules="rules.artifactId">
              <el-select v-model="ruleForm.displayDependJars[0].artifactId" :placeholder="'请选择' + ruleForm.type + '文件'" filterable @change="artifactChange">
                <el-option v-for="item in artifactList" :key="item.id" :label="formatLabel(item.name, item.description)" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="版本" prop="displayDependJars.0.id" :rules="rules.dependJars">
              <el-select v-model="ruleForm.displayDependJars[0].id" :placeholder="'请选择' + ruleForm.type + '版本'" filterable>
                <el-option v-for="item in versionList" :key="item.id" :label="formatLabel(item.displayVersion, item.description)" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <template v-if="ruleForm.typeCode === 'ONLINE'">
            <el-form-item label="文件地址" prop="jarUrl">
              <el-input v-model="ruleForm.jarUrl" :placeholder="'请输入' + ruleForm.type + '文件地址'"></el-input>
            </el-form-item>
          </template>
          <el-form-item v-if="ruleForm.type === 'jar'" label="Main Class" prop="mainClass">
            <el-input v-model="ruleForm.mainClass" placeholder="请输入主类名"></el-input>
          </el-form-item>
          <el-form-item label="Args" class="other-param">
            <el-popover placement="bottom" width="400" trigger="hover">
              <div style="white-space: pre-wrap">{{ argsTip }}</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: 30px; position: relative"></i>
            </el-popover>
            <!-- <el-input v-model="ruleForm.mainClassArgs" type="textarea" placeholder="请输入Args"></el-input> -->
            <div :class="['monaco-editor-wrap', fullscreen ? 'monaco-fullscreen' : '']">
              <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="fullscreen = !fullscreen"></i>
              <monaco-editor :key="currentStep" ref="monaco" v-model="ruleForm.mainClassArgs" word-wrap="on"></monaco-editor>
              <!-- <div class="args-tip">
                {{ argsTip }}
              </div> -->
            </div>
            <!-- <div class="tip">提示：如需回车请输入“\”进行回车</div> -->
          </el-form-item>
        </el-form>
      </div>
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-show-output-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-jar="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :region="seniorForm.sourceRegion"
        :rule-form="ruleForm"
        :senior-form="seniorForm"
      ></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :version-list="versionList"
        :artifact-list="artifactList"
        :content="ruleForm.mainClassArgs"
        :region-list="regionList"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-show-output-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-jar="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :is-show-mode="isShowMode" :senior-form="seniorForm" :is-show-cloud="true" @close="drawerVisible = false"></senior-form>
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
import StepThree from './components/StepThree';
import MonacoEditor from '@/components/MonacoEditor/index';
import { getArtifactList, getVersionList } from '@/api/task'; // , getIam
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

var validateMainClass = (rule, value, callback) => {
  const reg = /^([\w-])+(\.[\w-]+)*$/i;
  const reg2 = /\s*{{[^{}]+}}\s*/i;
  if (!reg.test(value) && !reg2.test(value)) {
    callback(new Error('请输入正确的Main Class'));
  } else {
    callback();
  }
};
export default {
  components: {
    StepsHead,
    SeniorForm,
    StepThree,
    MonacoEditor,
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
      argsTip: `--提示-- \\
--这是一串代码我想在这折行请手动输入“\\” \\
--job_name test.--ads_table \\
--dt {{ (execution_date - macros.timedelta(days=1)).strftime("%Y%m%d") }}`,
      btnLoading: false,
      currentStep: 1,
      queryId: '',
      copyId: this.$route.query.copyId,
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      ruleForm: {
        invokingStatus: true,
        templateCode: 'SPARKJAR',
        name: '',
        folderName: '',
        folderId: '',
        description: '',
        // typeCode: 'ARTIFACT',
        typeCode: 'ONLINE',
        type: 'python',
        displayDependJars: [{ artifactId: '', id: '' }],
        jarUrl: '',
        mainClass: '',
        mainClassArgs: '',
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
        inputDataset: [],
        outputDataset: [],
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      rules: {
        artifactId: [{ required: true, message: '请选择文件', trigger: ['blur', 'change'] }],
        dependJars: [{ required: true, message: '请选择文件版本', trigger: ['blur', 'change'] }],
        jarUrl: [{ required: true, message: '请输入地址', trigger: ['blur', 'change'] }],
        type: [{ required: true, message: '请选择任务类型', trigger: ['blur', 'change'] }],
        mainClass: [
          { required: true, message: '请输入主类名', trigger: ['blur', 'change'] },
          { validator: validateMainClass, trigger: ['blur', 'change'] }
        ]
      },
      regionList: tools.regionList,
      artifactList: [],
      versionList: [],
      drawerVisible: false,
      fullscreen: false,
      seniorForm: {
        checkExpirationTime: 24,
        sourceRegion: '',
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
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: []
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      canEdit: true,
      nameDisabled: false,
      copyMsg: null,
      isWorkflow: false,
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
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
    },
    isShowMode() {
      if (this.seniorForm.sourceRegion === 'sg2') {
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
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    this.ruleForm.folderId = this.$route.query.folderId;
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      setTimeout(() => {
        if (!this.isEdit) {
          this.seniorForm.sourceRegion = res[0].value;
          // this.changeRegion(res[0].value);
        }
      }, 1000);
    });
  },
  destroyed() {
    this.copyMsg && this.copyMsg.close();
  },
  methods: {
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    init(code) {
      // 获取Jar文件数据
      getArtifactList({
        typeCode: code || 'PYTHON',
        region: this.seniorForm.sourceRegion
      }).then(res => {
        const data = res.data;
        this.artifactList = data;
      });
    },
    artifactChange(value) {
      getVersionList({
        artifactId: value,
        region: this.seniorForm.sourceRegion
      }).then(res => {
        const data = res.data;
        this.versionList = data;
      });
    },
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
      this.ruleForm.typeCode = data.typeCode;
      this.ruleForm.jarUrl = data.jarUrl;
      if (data.mainClass) {
        this.ruleForm.type = 'jar';
        this.ruleForm.mainClass = data.mainClass;
      }
      this.ruleForm.mainClassArgs = data.mainClassArgs;
      this.$refs.monaco && this.$refs.monaco.setCode(data.mainClassArgs);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
      if (this.ruleForm.outputDataset && this.ruleForm.outputDataset.length > 0 && this.ruleForm.outputDataset[0].location) {
        this.$set(this.ruleForm.outputDataset[0], 'check', true);
      }
      // this.ruleForm.inputDataset.forEach(item => {
      //   if (item.metadata.table === '') {
      //     this.$set(item, 'isMetadataSel', false);
      //   } else {
      //     this.$set(item, 'isMetadataSel', true);
      //   }
      // });
      // this.ruleForm.outputDataset.forEach(item => {
      //   if (item.metadata.table === '') {
      //     this.$set(item, 'isMetadataSel', false);
      //   } else {
      //     this.$set(item, 'isMetadataSel', true);
      //   }
      // });
      if (this.ruleForm.inputDataset.length) {
        this.ruleForm.inputDataset.forEach(item => {
          if (item.metadata && item.metadata.table !== '') {
            this.$set(item, 'isMetadataSel', true);
          } else {
            this.$set(item, 'isMetadataSel', false);
          }
        });
      }
      if (this.ruleForm.outputDataset.length) {
        this.ruleForm.outputDataset.forEach(item => {
          if (item.metadata && item.metadata.table !== '') {
            this.$set(item, 'isMetadataSel', true);
          } else {
            this.$set(item, 'isMetadataSel', false);
          }
        });
      }
      this.init(this.ruleForm.type.toUpperCase());
      if (data.displayDependJars && data.displayDependJars.length) {
        this.artifactChange(data.displayDependJars[0].artifactId);
        this.ruleForm.displayDependJars = data.displayDependJars.map(item => {
          return {
            artifactId: item.artifactId,
            id: item.id
          };
        });
      } else {
        this.$set(this.ruleForm, 'displayDependJars', [{ artifactId: '', id: '' }]);
      }
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
      if (data.isCopy) {
        this.copyId = data.isCopy;
      }
      if (data.workflowId) {
        this.isWorkflow = true;
      }
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
    },
    changeRegion() {
      this.ruleForm.displayDependJars[0].artifactId = '';
      this.ruleForm.displayDependJars[0].id = '';
      this.ruleForm.jarUrl = '';
      this.artifactList = [];
      this.versionList = [];
      this.ruleForm.mainClass = '';
      this.init(this.ruleForm.type.toUpperCase());
    },
    typeChange() {
      this.changeRegion();
    },
    formatLabel(name, des) {
      if (des) {
        return `${name}（${des}）`;
      } else {
        return name;
      }
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    async nextStep(text) {
      if (this.currentStep === 1) {
        // 跳转到第三步
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.currentStep++;
          }
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
        if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
          this.$message.error('至少包含一个前置依赖');
          return false;
        }
        let propor = 0;
        this.ruleForm.cost.forEach(item => {
          propor += parseInt(item.value);
        });
        if (propor !== 100) {
          this.$message.error('成本归属占比总额必须是100哦');
          return false;
        }
        let eventFlag = false;
        if (this.ruleForm.dependTypes.includes('event') && this.ruleForm.eventDepends.length === 0) {
          eventFlag = true;
          this.$message.warning('请至少添加一条内部依赖');
        }
        if (eventFlag) return;
        const params = { ...tools.copyFn(this.ruleForm) };
        params.inputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
          if (item.granularityList) {
            delete item.granularityList;
          }
          if (item.checkPathList) {
            delete item.checkPathList;
          }
          delete item.isExternal;
        });
        params.outputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
          if (this.copyId) {
            delete item.id;
            delete item.metadata;
          }
        });
        if (params.type === 'python') {
          params.mainClass = '';
        }
        delete params.type;
        if (!this.seniorForm.source) {
          this.seniorForm.source = this.source;
        }
        params.runtimeConfig = this.seniorForm;
        params.runtimeConfig.cost = this.ruleForm.cost;
        delete params.cost;
        if (this.$store.getters.userInfo && !this.seniorForm.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        // 拷贝params，处理传参
        const paramsVal = JSON.parse(JSON.stringify(params));
        paramsVal.folderId = this.ruleForm.folderId;
        // 处理定时告警数据
        if (!paramsVal.runtimeConfig.regularAlert.isChecked) {
          delete paramsVal.runtimeConfig.regularAlert;
        }
        Object.keys(paramsVal.runtimeConfig.alertModel).forEach(item => {
          if (!paramsVal.runtimeConfig.alertModel[item].isChecked) {
            paramsVal.runtimeConfig.alertModel[item] = this.initAlertModel;
          }
        });
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
    padding: 20px;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 0;
      // top: 15px;
    }
    .ruleForm {
      width: 70%;
      margin: 0 0 0 8%;
      .el-select {
        width: 100%;
      }
    }
    .tip {
      font-size: $global-font-size-12;
      color: #aaa;
      line-height: normal;
    }
  }
  .monaco-editor-wrap {
    height: 250px;
  }
  .args-tip {
    white-space: pre-wrap;
    position: relative;
    top: -40px;
    z-index: 0;
    color: green;
    line-height: 21px;
  }
  .other-param {
    position: relative;
    ::v-deep .el-popover__reference-wrapper {
      position: absolute;
      left: -88px;
    }
  }
}
// 工作流 任务模板样式
.workflowStep2.step2 {
  .step-content {
    .ruleForm {
      width: 85%;
    }
    .open-btn {
      right: -35px;
    }
  }
}
</style>
