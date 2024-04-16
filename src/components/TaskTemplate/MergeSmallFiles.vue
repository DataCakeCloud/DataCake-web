<!--  chenyh1 -->
<template>
  <div class="step2">
    <!-- <div class="setp_left">
      <el-steps :active="currentStep" class="steps-head" process-status="finish" finish-status="success" direction="vertical">
        <el-step title="选择创建方式" description="定义数据集的基本信息" @click.native="handelStep"></el-step>
        <el-step title="设置任务信息" description="填写任务所需要的必要信息"></el-step>
      </el-steps>
    </div> -->
    <div class="step_right">
      <div class="step-content">
        <div v-show="currentStep === 1">
          <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
          <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="ruleForm" label-width="100px">
            <div class="tips">提示：切勿合并iceberg表</div>
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="ruleForm.name" placeholder="名字只能包含a-z,A-Z,0-9或-或_；开始结尾需为字符，最多60个字符" :disabled="nameDisabled" :maxlength="60"></el-input>
              <el-popover placement="bottom" trigger="hover" popper-class="tag-popper">
                <div>只有下线任务才可以修改任务名称</div>
                <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff; position: absolute; top: 8px; right: -20px"></i>
              </el-popover>
            </el-form-item>
            <el-form-item label="区域" prop="inputDataset[0].metadata.region">
              <template #label>
                <span>区域</span>
                <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                  <i class="el-icon-info" style="cursor: pointer"></i>
                </el-tooltip>
              </template>
              <el-select v-model="ruleForm.inputDataset[0].metadata.region" placeholder="请选择区域" clearable @change="changeRegion">
                <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="pathType">
              <el-radio-group v-model="ruleForm.pathType" disabled>
                <el-radio label="table">数据表</el-radio>
                <el-radio label="file">文件路径</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="ruleForm.pathType === 'table'">
              <el-form-item label="数据库" prop="inputDataset[0].metadata.db">
                <el-select v-model="ruleForm.inputDataset[0].metadata.db" :title="ruleForm.inputDataset[0].metadata.db" placeholder="请选择数据库" :loading="dbLoad" :allow-create="true" default-first-option clearable filterable @change="changeDb">
                  <el-option v-for="item in sourceDbList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表名称" prop="inputDataset[0].metadata.table">
                <el-select v-model="ruleForm.inputDataset[0].metadata.table" :title="ruleForm.inputDataset[0].metadata.table" placeholder="请选择表名称" :loading="tableLoad" :allow-create="true" default-first-option filterable clearable>
                  <el-option v-for="item in sourceTableList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
            </template>
            <el-form-item label="任务类型" prop="type">
              <el-radio-group v-model="ruleForm.type">
                <!-- <el-radio label="python"></el-radio> -->
                <el-radio label="jar"></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="地址" prop="jarUrl">
              <el-input v-model="ruleForm.jarUrl" placeholder="请输入地址" disabled></el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-drawer title="高级设置" :visible.sync="drawerVisible" :with-header="false" direction="rtl">
          <senior-form ref="seniorForm" :is-show-mode="isShowMode" :senior-form="seniorForm" :is-show-cloud="true" @close="drawerVisible = false"></senior-form>
        </el-drawer>
      </div>
      <div class="btn-wrap">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button v-if="isShowPublish || (!isShowPublish && currentStep === 2)" @click="preStep">上一步</el-button>
        <!-- <el-button v-if="isShowPublish && currentStep === 2" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
        <el-button type="primary" :disabled="!canEdit && currentStep === 2" :loading="btnLoading" @click="nextStep">{{ copyId ? '确认复制' : '保存' }}</el-button>
        <el-checkbox v-if="isShowPublish" v-model="ruleForm.invokingStatus" class="task-checkbox">切换至该版本</el-checkbox>
      </div>
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
import SeniorForm from './components/SeniorForm';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getArtifactList, getDataSetList, getJarUrl } from '@/api/task'; // , getIam
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';

export default {
  components: {
    SeniorForm,
    EllipsisTooltip,
    ValidParams
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
    const validatePass = (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符'));
      } else {
        callback();
      }
    };
    return {
      btnLoading: false,
      currentStep: 1,
      queryId: '',
      copyId: this.$route.query.copyId,
      ruleForm: {
        invokingStatus: true,
        templateCode: 'MergeSmallFiles',
        name: '',
        description: '',
        // typeCode: 'ARTIFACT',
        pathType: 'table',
        type: 'jar',
        displayDependJars: [{ artifactId: '', id: '' }],
        jarUrl: '',
        mainClass: '',
        mainClassArgs: '',
        dependTypes: [],
        triggerParam: {
          type: 'cron',
          isIrregularSheduler: 1,
          outputGranularity: 'monthly',
          crontabParam: {
            // cycle: 'minutely',
            range: [1],
            fixedTime: '00:00'
          },
          crontab: '00 00 1 * *'
        },
        eventDepends: [],
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
          {
            metadata: {
              region: '',
              type: 'hive',
              source: '',
              db: '',
              table: ''
            },
            id: '',
            offset: -1
          }
        ],
        cost: [
          {
            key: 'Share_it_Product',
            value: '100'
          }
        ]
      },
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        jarUrl: [{ required: true, message: '请输入地址', trigger: ['blur', 'change'] }],
        type: [{ required: true, message: '请选择任务类型', trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择数据集区域', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择表名称', trigger: ['blur', 'change'] }]
            }
          }
        ]
      },
      dbLoad: false,
      tableLoad: false,
      regionList: tools.regionList,
      sourceDbList: [],
      sourceTableList: [],
      drawerVisible: false,
      seniorForm: {
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
        alertType: [2],
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: []
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      canEdit: true,
      nameDisabled: false,
      copyMsg: null
    };
  },
  computed: {
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
    },
    isShowMode() {
      if (this.ruleForm.inputDataset[0].metadata.region === 'sg2') {
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
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    this.$watch(
      function() {
        return this.ruleForm.inputDataset[0].metadata.region;
      },
      function(value) {
        this.seniorForm.sourceRegion = value;
        this.ruleForm.outputDataset[0].metadata.region = value;
      }
    );
    this.init();
    // if (!this.seniorForm.group) {
    //   this.seniorForm.group = this.groupList[0];
    // }
    // if (this.copyId) {
    //   this.copyMsg = this.$message({
    //     showClose: true,
    //     duration: 0,
    //     type: 'warning',
    //     message: '复制任务时，请修改step3中的“生成数据集信息”，确保其唯一不重复，否则无法成功复制任务。'
    //   });
    // }
  },
  destroyed() {
    this.copyMsg && this.copyMsg.close();
  },
  methods: {
    handelStep() {
      this.$router.push('/task/step1');
    },
    init() {
      // 获取Jar文件数据
      getArtifactList({
        typeCode: 'JAR'
      }).then(res => {
        const data = res.data;
        this.artifactList = data;
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
      this.ruleForm.pathType = data.pathType;
      this.ruleForm.jarUrl = data.jarUrl;
      if (data.mainClass) {
        this.ruleForm.type = 'jar';
        this.ruleForm.mainClass = data.mainClass;
      }
      this.ruleForm.mainClassArgs = data.mainClassArgs;
      this.$refs.monaco && this.$refs.monaco.setCode(data.mainClassArgs);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
      if (data.dependTypes) {
        this.ruleForm.dependTypes = JSON.parse(data.dependTypes);
      }
      if (data.triggerParam) {
        Object.assign(this.ruleForm.triggerParam, JSON.parse(data.triggerParam));
      }
      if (data.eventDepends) {
        this.ruleForm.eventDepends = JSON.parse(data.eventDepends);
      }
      this.changeRegion(this.ruleForm.inputDataset[0].metadata.region, 'init');
      this.changeDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
    },
    changeRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceDbList = [];
      this.dbLoad = true;
      getDataSetList({
        region: value,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: 'MergeSmallFiles'
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.sourceDbList = data.data;
        }
        this.dbLoad = false;
      });
      getJarUrl({
        region: value
      }).then(res => {
        const data = res.data;
        this.ruleForm.jarUrl = data;
      });
    },
    changeDb(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      const selectedObj = this.sourceDbList.find(item => item.name === value);
      if (selectedObj) {
        this.tableLoad = true;
        getDataSetList({
          region: this.ruleForm.inputDataset[0].metadata.region,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'MergeSmallFiles'
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.sourceTableList = data.data;
          }
          this.tableLoad = false;
        });
      }
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
    nextStep(text) {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.ruleForm.outputDataset[0].id = this.ruleForm.name;
          const params = { ...this.ruleForm };
          // if (!this.seniorForm.group) {
          //   this.seniorForm.group = this.groupList[0];
          // }
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
          // this.$emit('save', params, text);
          this.$refs.validParams.show(params);
        }
      });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  // .setp_left {
  //   height: 45vh;
  //   min-height: 300px;
  //   width: 17% !important;
  //   // min-width: 250px;
  //   padding-left: 20px;
  //   position: fixed;
  //   z-index: 100;
  // }
  .step_right {
    // padding-left: 17%;
    padding-top: 30px;
    .tips {
      margin-bottom: 10px;
      margin-left: 100px;
    }
    .btn-wrap {
      width: 90%;
      margin: 0 auto;
      text-align: right;
      padding: 20px 0;
    }
    .step-content {
      padding: 0 20px 20px;
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
    }
    .monaco-editor-wrap {
      height: 150px;
    }
  }
}
</style>
