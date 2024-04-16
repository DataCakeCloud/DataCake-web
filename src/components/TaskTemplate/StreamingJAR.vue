<!--  Flink Jar 模板 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-show="currentStep === 1">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="ruleForm" label-width="100px">
          <el-form-item>
            <!-- :disabled="Boolean(queryId)" -->
            <el-radio-group v-model="ruleForm.typeCode" size="small">
              <el-radio-button label="ARTIFACT">选择上传Jar版本</el-radio-button>
              <el-radio-button label="ONLINE">输入Jar地址</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('task.region')" prop="region">
            <template #label>
              <span>{{ $t('task.region') }}</span>
              <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="ruleForm.region" class="area-select" :placeholder="$t('task.dbTip2')" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="ruleForm.typeCode === 'ARTIFACT'">
            <el-form-item label="Jar文件" prop="displayDependJars.0.artifactId" :rules="rules.artifactId">
              <el-select v-model="ruleForm.displayDependJars[0].artifactId" placeholder="请选择Jar文件" filterable @change="artifactChange">
                <el-option v-for="item in artifactList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Jar版本" prop="displayDependJars.0.id" :rules="rules.dependJars">
              <el-select v-model="ruleForm.displayDependJars[0].id" placeholder="请选择Jar版本" filterable>
                <el-option v-for="item in versionList" :key="item.id" :label="item.displayVersion" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <template v-if="ruleForm.typeCode === 'ONLINE'">
            <el-form-item label="Jar地址" prop="jarUrl">
              <el-input v-model="ruleForm.jarUrl" placeholder="请输入jar地址"></el-input>
            </el-form-item>
          </template>
          <el-form-item label="Main Class" prop="mainClass">
            <el-input v-model="ruleForm.mainClass" placeholder="请输入mainClass"></el-input>
          </el-form-item>
          <el-form-item label="Args">
            <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
              <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="fullscreen = !fullscreen"></i>
              <monaco-editor v-if="currentStep === 1" :key="currentStep" ref="monaco" v-model="ruleForm.mainClassArgs" word-wrap="on"></monaco-editor>
            </div>
          </el-form-item>
          <el-form-item label="Cluster" prop="flinkClusterId">
            <el-select v-model="ruleForm.flinkClusterId" filterable>
              <el-option v-for="item in clusterList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="clickSenior">高级设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :senior-form="seniorForm"
        :is-show-dispatch="seniorForm.isBatchTask"
        :is-show-input-btn="true"
        :is-show-output-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-jar="true"
:is-show-offset="false"
        :rule-form="ruleForm"
      ></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :region-list="regionList"
        :info="info"
        :content="ruleForm.mainClassArgs"
        :version-list="versionList"
        :cluster-list="clusterList"
        :artifact-list="artifactList"
        :is-show-dispatch="seniorForm.isBatchTask"
        :is-show-input-btn="true"
        :is-show-output-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-jar="true"
        :is-show-offset="false"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :with-header="false" direction="rtl" :size="500" :before-close="confirm">
        <el-button type="primary" class="drawer-btn" @click="confirm">确认</el-button>
        <el-tabs type="card">
          <el-tab-pane label="高级设置" class="senior-set">
            <el-form ref="seniorForm" :model="seniorForm" :rules="seniorRules" label-width="120px">
              <el-form-item label="flink job类型" required>
                <el-radio-group v-model="seniorForm.isBatchTask">
                  <el-radio :label="true">批</el-radio>
                  <el-radio :label="false">流</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="seniorForm.isBatchTask" label="邮箱" prop="emails">
                <el-input v-model="seniorForm.emails" placeholder="输入告警邮件发送邮箱" class="senior-input" clearable></el-input>
              </el-form-item>
              <el-form-item label="负责人">
                <el-select
                  v-model="seniorForm.owner"
                  placeholder="请输入负责人"
                  clearable
                  filterable
                  remote
                  :remote-method="
                    query => {
                      remoteMethod(query, 'ownerList');
                    }
                  "
                  :loading="loading"
                  popper-class="custom-popper"
                  class="senior-input"
                >
                  <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
                    <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户组" prop="dsGroups" :rules="[{ required: true, message: '请选择用户组', trigger: ['blur', 'change'] }]">
                <el-select v-model="seniorForm.dsGroups" disabled placeholder="请选择用户组" multiple filterable>
                  <el-option v-for="item in userGroupList" :key="item.id" :value="item.id" :label="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Parallelism">
                <el-input-number v-model="seniorForm.parallelism" :min="1" :max="500" label="描述文字"></el-input-number>
              </el-form-item>
              <el-form-item label="TM CPU">
                <el-input-number v-model="seniorForm.tmCpu" :min="0.1" :precision="1" :step="1"></el-input-number> 核
                <el-tooltip class="item" effect="dark" content="kubernetes.taskmanager.cpu" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="TM Memory">
                <el-input-number v-model="seniorForm.tmMemory" :min="1" :step="1"></el-input-number> G
                <el-tooltip class="item" effect="dark" content="taskmanager.memory.process.size" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="超时时间"> <el-input-number v-model="seniorForm.checkpointTimeout"></el-input-number> 秒 </el-form-item>

              <el-form-item label="报警类型" class="other-param">
                <el-popover placement="left" width="320" trigger="hover">
                  <div>指定当任务实例处于“成功”、“失败”、“重试”、“开始”状态时，以怎样的报警方式进行通知。注："失败"指实例最终运行失败，“重试”则指实例在指定重试次数内每次重启时。</div>
                  <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
                </el-popover>
                <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'failure' }" :value="seniorForm.alertModel.failure.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('failure')">失败</el-checkbox>
                <div v-if="alertTypeValue" class="alert-method-box">
                  <el-form-item label="报警方式" label-width="70px" size="mini">
                    <el-checkbox-group v-model="seniorForm.alertModel[alertTypeValue].alertType">
                      <el-checkbox v-for="(item, k) in alertList" :key="k" :label="item.value" style="margin-right: 10px !important">{{ item.label }}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <div>
                    <div v-if="seniorForm.alertModel[alertTypeValue].alertType.includes('enterprise_wechat')">
                      <el-form-item
                        label="微信群token："
                        label-width="130px"
                        size="mini"
                        :prop="`alertModel.${alertTypeValue}.wechatRobotKey`"
                        style="margin-top: 20px"
                        :rules="[
                          {
                            required: true,
                            message: '请填写微信群token',
                            trigger: ['blur', 'change']
                          }
                        ]"
                      >
                        <el-input v-model="seniorForm.alertModel[alertTypeValue].wechatRobotKey" type="textarea"></el-input>
                      </el-form-item>
                      <el-form-item
                        label="此群需要@："
                        label-width="130px"
                        size="mini"
                        :prop="`alertModel.${alertTypeValue}.wechatReceivers`"
                        style="margin-top: 20px"
                        :rules="[
                          {
                            required: true,
                            message: '请选择微信群@对象',
                            trigger: ['blur', 'change']
                          }
                        ]"
                      >
                        <el-select
                          v-model="seniorForm.alertModel[alertTypeValue].wechatReceivers"
                          placeholder="请选择@对象"
                          size="small"
                          clearable
                          filterable
                          remote
                          multiple
                          reserve-keyword
                          value-key="shareId"
                          :remote-method="
                            query => {
                              remoteMethod(query, 'sendList');
                            }
                          "
                          :loading="loading"
                          popper-class="custom-popper"
                          style="width: 100%"
                        >
                          <el-option v-for="item in sendList" :key="item.shareId" :value="item" :label="item.shareId">
                            <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                    <div v-if="seniorForm.alertModel[alertTypeValue].alertType.includes('email')">
                      <el-form-item
                        label="邮件接收人："
                        label-width="130px"
                        size="mini"
                        :prop="`alertModel.${alertTypeValue}.emailReceivers`"
                        style="margin-top: 20px"
                        :rules="[
                          {
                            required: true,
                            message: '请选择邮件接收人',
                            trigger: ['blur', 'change']
                          }
                        ]"
                      >
                        <el-select
                          v-model="seniorForm.alertModel[alertTypeValue].emailReceivers"
                          placeholder="请选择邮件接收人"
                          size="small"
                          clearable
                          filterable
                          remote
                          reserve-keyword
                          multiple
                          value-key="shareId"
                          :remote-method="
                            query => {
                              remoteMethod(query, 'sendList');
                            }
                          "
                          :loading="loading"
                          popper-class="custom-popper"
                          style="width: 100%"
                        >
                          <el-option v-for="item in sendList" :key="item.shareId" :value="item" :label="item.shareId">
                            <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-divider></el-divider>
              <el-form-item label="其他参数">
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="addParam"></el-button>
              </el-form-item>
              <div class="param-wrap">
                <div v-for="(item, index) in seniorForm.params" :key="index" class="param-item">
                  <el-input v-model="item.key" placeholder="key" style="width: 180px"></el-input> :
                  <el-input v-model="item.value" placeholder="value" style="width: 120px"></el-input>
                  <i class="el-icon-delete" @click="deleteParam(index)"></i>
                </div>
              </div>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <!-- <el-button v-if="isShowPublish && currentStep === 2 && seniorForm.isBatchTask" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
      }}</el-button>
      <el-checkbox v-if="isShowPublish && currentStep >= 2 && seniorForm.isBatchTask" v-model="ruleForm.invokingStatus" :disabled="disabled" class="task-checkbox">切换至该版本</el-checkbox>
    </div>
    <valid-params ref="validParams" :code="ruleForm.templateCode" @save="save" />
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import StepThree from './components/StepThree';
import MonacoEditor from '@/components/MonacoEditor/index';
// getClusterAuto, getClusterNotauto,
import { getArtifactList, getVersionList, getUserList, getIam, getClusterList } from '@/api/task.js';
import { getGroup } from '@/api/jurisdiction';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

var validatePass = (rule, value, callback) => {
  const reg = /^[a-zA-Z]([-a-zA-Z0-9]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)*$/;
  if (!reg.test(value)) {
    callback(new Error('名字只能包含a-z,A-Z,0-9或-；开始需为字符'));
  } else {
    callback();
  }
};
var validateMainClass = (rule, value, callback) => {
  const reg = /^([\w-])+(\.[\w-]+)*$/i;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的Main Class'));
  } else {
    callback();
  }
};
export default {
  components: {
    StepsHead,
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
      btnLoading: false,
      currentStep: 1,
      regionList: tools.regionList,
      alertList: [],
      isEdit: false,
      ruleForm: {
        region: '',
        folderName: '',
        invokingStatus: true,
        templateCode: 'StreamingJAR',
        typeCode: 'ARTIFACT',
        displayDependJars: [{ artifactId: '', id: '' }],
        jarUrl: '',
        mainClass: '',
        mainClassArgs: `--demo--
--这是一串带代码我想在这折行请手动输入“\\”
--job_name test.--ads_table \\
--dt {{ (execution_date - macros.timedelta(days=1)).strftime("%Y%m%d") }}`,
        flinkClusterId: '',
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
        region: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        name: [
          { required: true, message: '请输入应用名称', trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        artifactId: [{ required: true, message: '请选择Jar文件', trigger: ['blur', 'change'] }],
        dependJars: [{ required: true, message: '请选择Jar文件版本', trigger: ['blur', 'change'] }],
        jarUrl: [{ required: true, message: '请输入Jar地址', trigger: ['blur', 'change'] }],
        mainClass: [
          { required: true, message: '请输入主类名', trigger: ['blur', 'change'] },
          { validator: validateMainClass, trigger: ['blur', 'change'] }
        ],
        flinkClusterId: [{ required: true, message: '请选择Cluster', trigger: ['blur', 'change'] }]
      },
      artifactList: [],
      versionList: [],
      clusterList: [],
      autoClusterList: [],
      notautoClusterList: [],
      drawerVisible: false,
      fullscreen: false,
      seniorForm: {
        isBatchTask: false,
        checkExpirationTime: 24,
        emails: '',
        alertMethod: ['dingTalk'],
        alertType: [2],
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        owner: '',
        // isAutoScaleMode: false,
        collaborators: [],
        dsGroups: [],
        parallelism: 1,
        huaweiIam: '',
        awsIam: '',
        tmCpu: 1,
        tmMemory: 4,
        checkpointTimeout: 100,
        params: [],
        isAutoScaleMode: false,
        strategyList: []
      },
      seniorRules: {
        emails: [{ required: true, message: '请输入邮箱', trigger: ['blur', 'change'] }]
      },
      ownerList: [],
      sendList: [],
      collaboratorsList: [],
      huaweiList: [],
      awsList: [],
      userGroupList: [],
      loading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      canEdit: true,
      copyMsg: null,
      checkList: [],
      scaleMode: {
        operator: {
          name: 'OPERATOR_PROCESS_STRATEGY',
          topic: '',
          kafkaCluster: '',
          coolingTime: 120,
          minimumPercentage: 1.5,
          minPar: 1,
          maxPar: 512
        },
        kafka: {
          name: 'KAFKA_LAG_STRATEGY',
          topic: '',
          kafkaCluster: '',
          consumer_group: '',
          delayTime: 1800,
          expandProportion: 1.5,
          minDelayCount: 1000,
          maxDelayCount: 200000,
          coolingTime: 120,
          minPar: 1,
          maxPar: 512
        },
        periodic: {
          name: 'PERIODIC_STRATEGY',
          periodicList: [
            {
              startTime: 0,
              endTime: 24,
              par: 1
            }
          ]
        }
      },
      modeRules: {
        operator: {
          topic: [{ required: true, message: '请输入topic名称', trigger: ['blur', 'change'] }],
          kafkaCluster: [{ required: true, message: '请输入KAFKA集群', trigger: ['blur', 'change'] }],
          coolingTime: [{ required: true, message: '请输入冷却时间', trigger: ['blur', 'change'] }],
          minimumPercentage: [{ required: true, message: '请输入扩缩容忍度', trigger: ['blur', 'change'] }],
          minPar: [{ required: true, message: '请输入最小并行度', trigger: ['blur', 'change'] }],
          maxPar: [{ required: true, message: '请输入最大并行度', trigger: ['blur', 'change'] }]
        },
        kafka: {
          topic: [{ required: true, message: '请输入topic名称', trigger: ['blur', 'change'] }],
          kafkaCluster: [{ required: true, message: '请输入KAFKA集群', trigger: ['blur', 'change'] }],
          consumer_group: [{ required: true, message: '请输入消费者组', trigger: ['blur', 'change'] }],
          delayTime: [{ required: true, message: '请输入延迟时间', trigger: ['blur', 'change'] }],
          expandProportion: [{ required: true, message: '请输入扩缩比例', trigger: ['blur', 'change'] }],
          minDelayCount: [{ required: true, message: '请输入最小延迟条数', trigger: ['blur', 'change'] }],
          maxDelayCount: [{ required: true, message: '请输入最大延迟条数', trigger: ['blur', 'change'] }],
          coolingTime: [{ required: true, message: '请输入冷却时间', trigger: ['blur', 'change'] }],
          minPar: [{ required: true, message: '请输入最小并行度', trigger: ['blur', 'change'] }],
          maxPar: [{ required: true, message: '请输入最大并行度', trigger: ['blur', 'change'] }]
        }
      },
      alertTypeValue: ''
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm);
    },
    disabled() {
      return this.currentStep === 3;
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
    if (this.ruleForm.oldAlertList?.length && !this.$route.query.copyId) {
      this.alertList = this.seniorForm.oldAlertList;
    } else {
      const systemAlertList = JSON.parse(this.$store.getters['user/systemConf'].config)?.alarm_channel;
      systemAlertList.map(item => {
        switch (item) {
          case 'enterprise_wechat':
            this.alertList.push({ label: '企业微信', value: 'enterprise_wechat' });
            break;
          case 'email':
            this.alertList.push({ label: '邮件', value: 'email' });
            break;
        }
      });
      this.ruleForm.oldAlertList = this.alertList;
    }
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    this.init();
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      setTimeout(() => {
        if (!this.isEdit) {
          this.ruleForm.region = res[0].value;
          this.changeRegion(res[0].value);
        }
      });
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
    init() {
      // getClusterAuto().then(data => {
      //   this.autoClusterList = data;
      // });
      // getClusterNotauto().then(data => {
      //   this.notautoClusterList = data;
      //   this.clusterList = data;
      // });
      // 获取huawei aws
      getIam().then(res => {
        const data = res.data;
        if (data) {
          this.huaweiList = data.huawei;
          this.awsList = data.aws;
        }
      });
      getGroup().then(res => {
        const data = res.data;
        this.userGroupList = data;
      });
    },
    getJarFile() {
      // 获取Jar文件数据
      getArtifactList({
        typeCode: 'JAR',
        region: this.ruleForm.region
      }).then(res => {
        const data = res.data;
        this.artifactList = data;
      });
    },
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      this.ruleForm.region = runtimeConfig.region;
      this.getCluster();
      this.getJarFile();
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      this.ruleForm.typeCode = data.typeCode;
      this.ruleForm.oldAlertList = data.oldAlertList;
      this.ruleForm.jarUrl = data.jarUrl;
      this.ruleForm.mainClass = data.mainClass;
      this.ruleForm.mainClassArgs = data.mainClassArgs;
      this.$refs.monaco && this.$refs.monaco.setCode(data.mainClassArgs);
      this.ruleForm.flinkClusterId = data.flinkClusterId;
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset) || [];
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset) || [];
      // this.ruleForm.inputDataset.forEach(item => {
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
      if (this.seniorForm.collaborators.length) {
        this.seniorForm.collaborators.map(item => {
          getUserList(item).then(res => {
            const data = res.data;
            this.collaboratorsList.push(...data);
          });
        });
      }
      if (this.seniorForm.isAutoScaleMode) {
        this.clusterList = this.autoClusterList;
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
      if (this.copyId) {
        this.ruleForm.name = data.name + '-copy';
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      this.checkList = this.seniorForm.strategyList.map(item => {
        const key = item.name.split('_')[0].toLowerCase();
        this.scaleMode[key] = item;
        return item.name;
      });
    },
    getCluster() {
      const params = {
        region: this.ruleForm.region
      };
      // 获取 Cluster 下拉框数据
      getClusterList(params).then(res => {
        const data = res.data;
        this.clusterList = data;
      });
    },
    changeRegion(val) {
      if (val) {
        this.ruleForm.flinkClusterId = '';
        this.ruleForm.displayDependJars = [{ artifactId: '', id: '' }];
        this.getCluster();
        this.getJarFile();
      }
    },
    changeModel(value) {
      if (value) {
        this.clusterList = this.autoClusterList;
      } else {
        this.clusterList = this.notautoClusterList;
      }
    },
    clickSenior() {
      this.drawerVisible = true;
      if (!this.seniorForm.owner) {
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      }
      this.remoteMethod(this.seniorForm.owner, 'ownerList');
      this.remoteMethod('', 'sendList');
    },
    artifactChange(value) {
      getVersionList({
        artifactId: value,
        region: this.ruleForm.region
      }).then(res => {
        const data = res.data;
        this.versionList = data;
      });
    },
    remoteMethod(query, list) {
      this.loading = true;
      getUserList(query).then(res => {
        this.loading = false;
        const data = res.data;
        this[list] = data;
      });
    },
    addParam() {
      const length = this.seniorForm.params.length;
      if (length > 0 && !this.seniorForm.params[length - 1].key) {
        this.$message({
          type: 'warning',
          message: '请先输入当前参数的key！'
        });
        return;
      } else {
        this.seniorForm.params.push({ key: '', value: '' });
      }
    },
    deleteParam(index) {
      this.seniorForm.params.splice(index, 1);
    },
    addPeriod(endTime) {
      this.scaleMode.periodic.periodicList.push({
        startTime: endTime + 1,
        endTime: 24,
        par: 1
      });
    },
    removePeriod() {
      this.scaleMode.periodic.periodicList.pop();
    },
    checkForm(form) {
      return new Promise((resolve, reject) => {
        this.$refs[form].validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    confirm() {
      const list = [this.checkForm('seniorForm')];
      if (this.checkList.length) {
        list.push(this.checkForm('scaleMode'));
      }
      Promise.all(list)
        .then(() => {
          this.seniorForm.strategyList = [];
          if (this.seniorForm.isAutoScaleMode && this.checkList.length > 0) {
            if (this.checkList.includes('OPERATOR_PROCESS_STRATEGY')) {
              this.seniorForm.strategyList.push(this.scaleMode.operator);
            }
            if (this.checkList.includes('KAFKA_LAG_STRATEGY')) {
              this.seniorForm.strategyList.push(this.scaleMode.kafka);
            }
            if (this.checkList.includes('PERIODIC_STRATEGY')) {
              const last = this.scaleMode.periodic.periodicList.at(-1);
              if (last.endTime !== 24) {
                this.$message.warning('周期性策略 时间区间结束时间必须为24');
                return;
              } else {
                this.seniorForm.strategyList.push(this.scaleMode.periodic);
              }
            }
          }
          this.drawerVisible = false;
        })
        .catch(() => {
          this.$message.warning('高级设置中有必填项未填写哦～');
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
        // 跳转到第三步
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            if (!this.queryId) {
              if (this.seniorForm.isBatchTask) {
                this.ruleForm.dependTypes = ['event'];
                this.ruleForm.eventDepends = [
                  {
                    dependId: '',
                    dependGra: '',
                    dateCalculationParam: {},
                    unitOffset: 0,
                    useDateCalcuParam: false,
                    granularity: '',
                    taskId: ''
                  }
                ];
              } else {
                this.ruleForm.dependTypes = ['dataset'];
                this.ruleForm.eventDepends = [];
              }
            }
            this.currentStep++;
          }
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
        // 保存

        if (this.seniorForm.isBatchTask) {
          // 批任务
          if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
            this.$message.error('至少包含一个前置依赖');
            return false;
          }
          if (!this.ruleForm.outputDataset.length) {
            this.$message.error('至少包含一个生成数据集');
            return false;
          }
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
        if (!this.seniorForm.source) {
          this.seniorForm.source = this.source;
        }
        const params = {
          ...tools.copyFn(this.ruleForm),
          runtimeConfig: {
            ...this.seniorForm,
            cost: this.ruleForm.cost
          }
        };
        delete params.cost;
        params.inputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
        });
        params.outputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
        });
        if (this.$store.getters.userInfo && !params.runtimeConfig.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        params.runtimeConfig.region = this.ruleForm.region;
        params.folderId = this.$route.query.folderId;
        this.$refs.validParams.show(params);
      }
    },
    save(params) {
      if (this.seniorForm.isBatchTask) {
        this.$emit('save', params, 'start');
      } else {
        this.$emit('save', params);
      }
    },
    checkAlertType(type) {
      if (this.alertTypeValue === type) {
        this.alertTypeValue = '';
        return;
      }
      this.alertTypeValue = type;
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
    padding: 0 20px 20px;
    min-height: calc(100vh - 255px);
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
    .senior-set {
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }
    .param-wrap {
      // overflow-y: auto;
      padding: 0 15px;
      // max-height: calc(100vh - 450px);
      .param-item {
        margin-bottom: 10px;
        .el-icon-delete {
          color: $color-cb;
          cursor: pointer;
          margin-left: 5px;
        }
      }
    }
    .senior-input {
      width: 200px;
    }
  }
  .monaco-editor-wrap {
    height: 250px;
  }
}
.other-param {
  position: relative;
  ::v-deep .el-popover__reference-wrapper {
    position: absolute;
    left: -88px;
  }
}
.active-checkbox {
  border-bottom: 2px solid #67c23a;
}
.alert-method-box {
  margin-right: 2px;
  padding: 0 8px;
  border: 1px solid #e4e7ed;
  padding-bottom: 20px;
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
  ::v-deep .el-form-item__label {
    font-weight: 400;
  }
}
</style>
