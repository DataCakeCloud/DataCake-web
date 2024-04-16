<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-show="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="regionForm" class="ruleForm" :model="seniorForm" label-width="140px">
          <el-form-item label="脚本类型" prop="commandType" :rules="[{ required: true, message: '请选择脚本类型', trigger: ['blur', 'change'] }]">
            <el-radio-group v-model="seniorForm.commandType" @change="commandTypeChange">
              <el-radio label="python">Python</el-radio>
              <el-radio label="shell">Shell</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item required>
            <template #label>
              <span>运行模式</span>
              <el-popover trigger="hover" placement="top" popper-class="tag-popper step3-run-popper">
                <p>支持本地模式与分布式模式；</p>
                <p>本地模式：通过固定路由提交到本地机器上执行；</p>
                <p>分布式模式：适用于海量数据处理的任务，提交到分布式集群上执行；</p>
                <i slot="reference" class="el-icon-info"></i>
              </el-popover>
            </template>
            <el-radio-group v-model="seniorForm.executeMode">
              <el-radio label="local">本地模式</el-radio>
              <el-radio label="distribution">分布式模式</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-tabs v-if="seniorForm.executeMode === 'distribution'">
            <el-tab-pane label="选择镜像">
              <el-form-item prop="image" class="imageConfig" :rules="[{ required: true, message: '请输入镜像地址', trigger: ['blur', 'change'] }]">
                <template #label>
                  <span>
                    镜像地址
                    <el-tooltip class="item" effect="dark" placement="bottom">
                      <template #content>
                        <div>
                          {{ `镜像提供了${seniorForm.commandType === 'python' ? 'Python' : 'Shell'}任务运行时所需的库、资源、配置等软件包。` }}
                          <el-button type="text">查看配置教程</el-button>
                        </div>
                      </template>
                      <i class="el-icon-info"></i>
                    </el-tooltip>
                  </span>
                </template>
                <el-input v-model="seniorForm.image" placeholder="请输入镜像地址"></el-input>
                <el-popover placement="bottom" width="500" popper-class="sql-popper" trigger="click">
                  <div class="tops_message">镜像详情</div>
                  <el-table :data="imageConfig" size="mini" :cell-style="{ padding: '4px 0' }">
                    <el-table-column min-width="240" property="package" label="Package"></el-table-column>
                    <el-table-column min-width="100" property="version" label="Version"></el-table-column>
                  </el-table>
                  <div class="bottom_tool" style="text-align: end; padding-top: 15px">
                    <el-button type="text">编辑</el-button>
                  </div>
                  <el-button slot="reference" class="imageConfig_btn" type="text" :disabled="lookImageBtn">查看镜像配置</el-button>
                </el-popover>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="选择依赖工件">
              <el-form ref="ruleForm" :model="ruleForm" label-width="140px">
                <div v-for="(item, index) in ruleForm.displayDependJars" :key="index" class="sqlapp-main-set-udf">
                  <el-form-item label="Script文件" style="margin-bottom: 10px">
                    <template #label>
                      <span>
                        依赖工件
                        <el-tooltip class="item" effect="dark" placement="bottom">
                          <template #content>
                            <div style="padding: 8px 0">
                              {{ `该工件在镜像中的路径为：/work/依赖文件名称。如果在${seniorForm.commandType === 'python' ? 'Python' : 'Shell'}脚本中需要依赖该工件，请直接引用上述路径。` }}
                            </div>
                          </template>
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                      </span>
                    </template>
                    <el-select v-model="item.artifactId" placeholder="依赖工件" filterable clearable @change="artifactChange($event, index)">
                      <el-option v-for="jar in artifactList" :key="jar.id" :label="jar.name" :value="jar.id"></el-option>
                    </el-select>
                    <el-select v-model="item.id" placeholder="工件版本" filterable clearable style="width: 300px; margin: 0 10px">
                      <el-option v-for="version1 in versionList[index]" :key="version1.id" :label="version1.displayVersion" :value="version1.id"></el-option>
                    </el-select>
                    <div class="action">
                      <el-button type="danger" size="mini" icon="el-icon-delete" style="margin-left: 10px" @click="deleteUdf(index)"></el-button>
                      <el-button v-show="index === ruleForm.displayDependJars.length - 1" type="primary" size="mini" icon="el-icon-plus" @click="addUdf"></el-button>
                    </div>
                    <div v-if="index === ruleForm.displayDependJars.length - 1" class="tip">
                      没有找到想要的文件？
                      <el-button type="text" size="mini" @click="$router.push('/task/artifact/detail')">上传工件</el-button>
                    </div>
                  </el-form-item>
                </div>
                <div v-if="ruleForm.displayDependJars.length == 0" style="text-align: center; margin-top: 10px">
                  <el-button type="primary" size="mini" icon="el-icon-plus" @click="addUdf"></el-button>
                </div>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <el-tabs class="process">
            <el-tab-pane :label="seniorForm.commandType === 'python' ? 'python脚本' : 'shell脚本'">
              <div class="editor_tool">
                <el-button plain size="mini" type="primary" @click="formatSql">格式化</el-button>
                <el-button plain size="mini" type="primary" @click="clearSql">清除</el-button>
              </div>
              <el-form-item prop="cmds" class="other-param" :rules="[{ required: true, message: '请输入执行命令', trigger: ['blur', 'change'] }]" label-width="0">
                <div class="editor_wrap">
                  <div class="required">*</div>
                  <div class="editor_type">
                    <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                    <!-- <el-radio-group v-model="seniorForm.sqlType" @change="sqlTypeChange">
                      <el-radio-button label="edit">编辑模式</el-radio-button>
                    </el-radio-group> -->
                  </div>
                  <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
                    <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '全屏'" @click="fullscreen = !fullscreen"></i>
                    <monaco-editor v-if="currentStep === 1" ref="monaco" :key="sqlKey + '' + currentStep" v-model="seniorForm.cmds" word-wrap="on" :language="seniorForm.commandType"></monaco-editor>
                  </div>
                </div>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
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
        :content="seniorForm.cmds"
        :region-list="regionList"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :code="ruleForm.templateCode" :run-mode-show="runModeShow" :is-show-mode="false" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
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
    <el-dialog title="拉取git代码库" :visible.sync="dialogVisible" width="550px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="closeGit">
      <el-form ref="gitForm" :model="gitForm" :rules="gitRules" label-width="110px">
        <el-form-item label="选择git跟目录" prop="projectName">
          <el-select v-model="gitForm.projectName" placeholder="选择git跟目录" clearable style="width: 100%">
            <el-option label="ads-bigdata-datastudio" value="ads-bigdata-datastudio"></el-option>
            <el-option label="ads-algo-datastudio" value="ads-algo-datastudio"></el-option>
            <el-option label="ecom-data-batch" value="ecom-data-batch"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="输入子路径" prop="filePath">
          <el-input v-model="gitForm.filePath" placeholder="请输入子路径"></el-input>
          <div class="tip">输入提示：输入git子路径，例如：/a/b/test.py</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="gitDisabled" @click="saveGit">拉取git仓库代码</el-button>
      </span>
    </el-dialog>

    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
    </el-info>
  </div>
</template>
<script>
import SqlTips from './components/SqlTips';
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import StepThree from './components/StepThree';
import MonacoEditor from '@/components/MonacoEditor/otherEditor';
import { getArtifactList, getVersionList, getGitSql } from '@/api/task'; // , getIam
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SeniorForm,
    StepThree,
    MonacoEditor,
    ValidParams,
    SqlTips,
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
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      isEdit: false,
      runModeShow: false,
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      dialogVisible: false,
      btnLoading: false,
      currentStep: 1,
      queryId: '',
      copyId: this.$route.query.copyId,
      ruleForm: {
        invokingStatus: true,
        templateCode: 'PythonShell',
        name: '',
        folderName: '',
        folderId: '',
        description: '',
        displayDependJars: [{ artifactId: '', id: '' }],
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
          //     type: 'hive',
          //     source: '',
          //     db: '',
          //     table: ''
          //   },
          //   offset: -1
          // }
        ],
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
        type: [{ required: true, message: '请选择任务类型', trigger: ['blur', 'change'] }]
      },
      regionList: tools.regionList,
      artifactList: [],
      versionList: [],
      drawerVisible: false,
      fullscreen: false,
      argsTip: `--demo--
--这是一串带代码我想在这折行请手动输入“\\”
--job_name test.--ads_table \\
--dt {{ (execution_date - macros.timedelta(days=1)).strftime("%Y%m%d") }}`,
      seniorForm: {
        checkExpirationTime: 24,
        executeMode: 'local',
        sqlType: 'edit',
        commandType: 'python',
        sourceRegion: '',
        image: '',
        cmds: '',
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
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: []
        batchParams: ''
      },
      canEdit: true,
      nameDisabled: false,
      copyMsg: null,
      isWorkflow: false,
      gitForm: {
        projectName: 'ads-bigdata-datastudio',
        filePath: ''
      },
      gitRules: {
        projectName: [{ required: true, message: '请选择git跟目录', trigger: ['blur', 'change'] }],
        filePath: [{ required: true, message: '请输入子路径', trigger: ['blur', 'change'] }]
      },
      gitDisabled: false,
      sqlKey: 0,
      oldPythonObj: {},
      oldShellObj: {}
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm);
    },
    lookImageBtn() {
      let res = true;
      res = tools.imageAddress[this.seniorForm.sourceRegion] !== this.seniorForm.image;
      return !!res;
    },
    imageConfig() {
      return tools.imageConfig || [];
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
          this.changeRegion(res[0].value);
        }
      }, 1000);
    });
  },
  destroyed() {
    this.copyMsg && this.copyMsg.close();
  },
  methods: {
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.msgType = msgType;
      this.infoObj.title = title;
    },
    sqlTypeChange(type) {
      this.clearSql();
      this.$refs.regionForm.clearValidate('cmds');
      if (type === 'git') {
        this.gitPull();
      }
    },
    commandTypeChange(val) {
      const saveObj = Object.assign(
        {},
        {
          sourceRegion: this.seniorForm.sourceRegion,
          image: this.seniorForm.image,
          cmds: this.seniorForm.cmds,
          displayDependJars: this.ruleForm.displayDependJars
        }
      );
      if (val === 'python') {
        this.oldShellObj = saveObj;
      } else {
        this.oldPythonObj = saveObj;
      }
      this.seniorForm.image = '';
      this.ruleForm.displayDependJars = [{ artifactId: '', id: '' }];
      this.clearSql();
      // 回显旧数据
      const oldObj = val === 'python' ? this.oldPythonObj : this.oldShellObj;
      if (Object.keys(oldObj).length <= 0) return;
      this.$nextTick(() => {
        this.seniorForm.image = oldObj.image;
        this.ruleForm.displayDependJars = oldObj.displayDependJars;
        this.$refs.monaco.setCode(oldObj.cmds);
        console.log(oldObj, 33333);
      });
    },
    formatSql() {
      // this.$refs.monaco.formatSql();
    },
    clearSql() {
      this.$refs.monaco.setCode('');
      this.seniorForm.gitPath = '';
      this.sqlKey++;
    },
    gitPull() {
      this.dialogVisible = true;
      if (this.seniorForm.gitPath) {
        this.gitForm.projectName = this.seniorForm.gitPath.substring(0, this.seniorForm.gitPath.indexOf('/'));
        this.gitForm.filePath = this.seniorForm.gitPath.substring(this.seniorForm.gitPath.indexOf('/'));
      }
    },
    saveGit() {
      this.$refs.gitForm.validate(valid => {
        if (valid) {
          this.gitDisabled = true;
          getGitSql({
            projectName: this.gitForm.projectName,
            filePath: this.gitForm.filePath
          })
            .then(res => {
              const data = res.data;
              this.seniorForm.cmds = decodeURIComponent(window.atob(data.content));
              this.$refs.monaco.setCode(this.seniorForm.cmds);
              if (data.conf) {
                this.seniorForm.batchParams = data.conf;
              } else {
                this.seniorForm.batchParams = '';
              }
              this.seniorForm.gitPath = this.gitForm.projectName + this.gitForm.filePath;
              this.sqlKey++;
              this.dialogVisible = false;
            })
            .finally(() => {
              this.gitDisabled = false;
            });
        }
      });
    },
    closeGit() {
      this.$refs.gitForm.resetFields();
    },
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    init() {
      // 获取Jar文件数据
      getArtifactList({
        region: this.seniorForm.sourceRegion
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
      // 兼容旧数据脚本类型
      if (!runtimeConfig.commandType) {
        this.seniorForm.commandType = 'shell';
      }
      if (runtimeConfig.gitPath && !runtimeConfig.sqlType) {
        this.seniorForm.sqlType = 'git';
      }
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.$refs.monaco && this.$refs.monaco.setCode(runtimeConfig.cmds);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
      if (this.ruleForm.outputDataset && this.ruleForm.outputDataset.length > 0 && this.ruleForm.outputDataset[0].location) {
        this.$set(this.ruleForm.outputDataset[0], 'check', true);
      }
      this.sqlKey++;
      this.init();
      if (data.displayDependJars && data.displayDependJars.length) {
        this.ruleForm.displayDependJars = data.displayDependJars.map(item => {
          return {
            artifactId: item.artifactId,
            id: item.id
          };
        });
        this.ruleForm.displayDependJars.forEach((item, index) => {
          if (item.artifactId) {
            this.artifactChange(item.artifactId, index);
          }
        });
      } else {
        this.$set(this.ruleForm, 'displayDependJars', [{ artifactId: '', id: '' }]);
      }
      if (this.seniorForm.gitPath) {
        this.gitForm.projectName = this.seniorForm.gitPath.substring(0, this.seniorForm.gitPath.indexOf('/'));
        this.gitForm.filePath = this.seniorForm.gitPath.substring(this.seniorForm.gitPath.indexOf('/'));
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
    changeRegion(value) {
      this.seniorForm.image = tools.imageAddress[value] || '-';
      this.ruleForm.displayDependJars.forEach(item => {
        item.artifactId = '';
        item.id = '';
      });
      this.artifactList = [];
      this.versionList = [];
      this.init();
    },
    artifactChange(value, index) {
      getVersionList({
        artifactId: value,
        region: this.seniorForm.sourceRegion
      }).then(res => {
        const data = res.data;
        this.$set(this.versionList, index, data);
      });
    },
    deleteUdf(index) {
      this.ruleForm.displayDependJars.splice(index, 1);
    },
    addUdf() {
      const length = this.ruleForm.displayDependJars.length;
      if (length > 0 && !this.ruleForm.displayDependJars[length - 1].id) {
        this.$message({
          type: 'warning',
          message: '请先选择当前的Version！'
        });
        return;
      } else {
        this.ruleForm.displayDependJars.push({ artifactId: '', id: '' });
      }
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    modeChange(val) {
      this.runModeShow = val !== 'local';
    },
    async nextStep(text) {
      if (this.currentStep === 1) {
        // 跳转到第三步
        let count = 0;
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            count++;
          }
        });
        this.$refs.regionForm.validate(valid => {
          if (valid) {
            count++;
          }
        });
        if (count === 2) {
          this.ruleForm.inputDataset.forEach(item => {
            item.metadata.region = this.seniorForm.sourceRegion;
          });
          // this.ruleForm.outputDataset.forEach(item => {
          //   item.metadata.region = this.seniorForm.sourceRegion;
          // });
          this.currentStep++;
        }
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
        // 保存
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
          item.id = '';
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
          // item.id = `${item.metadata.db}.${item.metadata.table}@${item.metadata.region}`;
          if (item.completePath) {
            delete item.completePath;
          }
          if (this.copyId) {
            delete item.id;
            delete item.metadata;
          }
        });
        if (params.type === 'python') {
          delete params.mainClass;
        }
        delete params.type;
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
    padding: 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 0;
      // top: 15px;
    }
    .ruleForm {
      width: 80%;
      margin: 0 0 0 8%;
      .el-form-item {
        .el-select,
        .el-input {
          width: calc(100% - 160px);
        }
        .imageConfig {
          position: relative;
          &_btn {
            position: absolute;
            right: 160px;
            transform: translateX(calc(100% + 10px));
          }
        }
      }
      .sqlapp-main-set-udf {
        position: relative;
        &:last-child {
          padding-bottom: 20px;
        }
        ::v-deep .el-form-item__content {
          display: flex;
          .tip {
            position: absolute;
            left: 0;
            bottom: -25px;
          }
        }
        .action {
          width: 150px;
          display: flex;
          flex-shrink: 0;
        }
      }
      .process {
        ::v-deep .el-tabs__content {
          overflow: visible;
        }
        .other-param {
          position: relative;
          width: 100%;
          .editor_wrap {
            position: relative;
            .editor_type {
              position: absolute;
              right: 0;
              top: -77px;
              text-align: end;
            }
            .required {
              position: absolute;
              left: -10px;
              color: red;
              top: -8px;
            }
          }
        }
        .editor_tool {
          margin: -10px 0 5px 0;
        }
      }
    }
  }
  .monaco-editor-wrap {
    height: 250px;
  }
  .tip {
    font-size: $global-font-size-12;
    color: #aaa;
    line-height: normal;
  }
}
</style>
<style lang="scss">
.sql-popper {
  .tops_message {
    font-size: $global-font-size-14;
    font-weight: 550;
    margin-bottom: 10px;
  }
}
</style>
