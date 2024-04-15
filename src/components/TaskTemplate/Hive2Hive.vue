<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="content_wrap">
      <div class="step-content">
        <div v-if="currentStep === 1">
          <el-form ref="form" class="inline-form" :rules="rules" :inline="true" :model="seniorForm"> </el-form>
          <el-tabs class="process">
            <el-tab-pane>
              <template #label>
                <span class="label">
                  加工逻辑
                  <sql-smaple name="hive_sql" class="sqlSmaple"></sql-smaple>
                </span>
              </template>
              <div class="monaco-btns">
                <el-select v-model="seniorForm.engine" size="mini">
                  <el-option v-for="item in sqlOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                <!-- <el-radio-group v-model="seniorForm.sqlType" style="margin-right: 10px" @change="sqlTypeChange">
                  <el-radio-button label="edit">编辑模式</el-radio-button>
                  <el-radio-button label="git" @click.native="sqlTypeChange('git')">拉取git库</el-radio-button>
                </el-radio-group> -->
                <!-- <el-button type="primary" @click="gitPull">拉取git库</el-button> -->
                <el-button type="primary" @click="drawerVisible = true">高级设置</el-button>
              </div>
              <div class="editor_tool">
                <el-button plain size="mini" type="primary" :disabled="checkDisabled" @click="checkSql">校验</el-button>
                <el-button plain size="mini" type="primary" @click="formatSql">格式化</el-button>
                <el-button plain size="mini" type="primary" @click="clearSql">清除</el-button>
              </div>
              <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
                <span class="require">*</span>
                <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
                <!-- :read-only="seniorForm.sqlType === 'git'" -->
                <monaco-editor v-if="showEditor" ref="monaco" :key="`sqlKey${currentStep}`" v-model="content" v-loading="checkDisabled"></monaco-editor>
              </div>
              <!-- <div v-if="seniorForm.gitPath" class="mt10">git地址：{{ seniorForm.gitPath }}</div> -->
              <div v-if="alertMessage" class="mt10">校验结果：</div>
              <el-alert v-if="alertMessage" id="checkMsg" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
            </el-tab-pane>
          </el-tabs>
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
          :is-show-depend-refresh="true"
          :senior-form="seniorForm"
          @dependReresh="dependReresh"
        ></step-three>

        <!-- 预览 -->
        <ViewParams
          v-if="currentStep === 3"
          :info="info"
          :content="content"
          :region-list="regionList"
          :is-workflow="isWorkflow"
          :name-disabled="nameDisabled"
          :is-show-input-btn="true"
          :is-input-edit="true"
          :is-output-edit="true"
          :is-show-input-check="true"
          :is-show-output-check="true"
          :is-show-depend-refresh="true"
          @jumpStep="$event => (currentStep = $event)"
        />

        <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
          <senior-form ref="seniorForm" :is-show-mode="isShowMode" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
        </el-drawer>
      </div>
      <div class="btn-wrap">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
        <el-button type="primary" :loading="btnLoading" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" @click="nextStep">{{
          (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
        }}</el-button>
        <el-checkbox v-if="isShowPublish && currentStep >= 3" v-model="ruleForm.invokingStatus" class="task-checkbox">切换至该版本</el-checkbox>
      </div>
    </div>
    <!-- <el-dialog title="拉取git代码库" :visible.sync="dialogVisible" width="550px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="closeGit">
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
          <div class="tip">输入提示：输入git子路径，例如：/a/b/test.sql</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="gitDisabled" @click="saveGit">拉取git仓库代码</el-button>
      </span>
    </el-dialog> -->
    <valid-params
      ref="validParams"
      :code="ruleForm.templateCode"
      @save="
        params => {
          $emit('save', params);
        }
      "
    />

    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
    </el-info>
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import SqlTips from './components/SqlTips';
import SqlSmaple from './components/SqlSmaple';
import MonacoEditor from '@/components/MonacoEditor/index';
import StepThree from './components/StepThree';
import { check, getGitSql, getSqlTbls } from '@/api/task'; // getDataSetList,
import { getRegionAndSql } from '@/api/querydata';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SeniorForm,
    SqlTips,
    SqlSmaple,
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
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      showEditor: true,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      isPass: true,
      content: '', // `/* =====DEMO-针对目标表不存在，支持创建iceberg表===== */
      // ---先建表,此步骤为可选
      // CREATE TABLE IF NOT EXISTS test.zptest4(
      //   'name' STRING ,
      //   'age' STRING ,
      //   'dt' STRING
      // ) USING iceberg
      // PARTITIONED BY (dt)
      // LOCATION 's3://bdp.tmp.us-east-1/iceberg/zptest4' ;
      // ---写入逻辑
      // INSERT
      //   OVERWRITE TABLE test.zptest4 PARTITION(dt = '{{ yesterday_ds_nodash }}')
      // SELECT pageid, age, count(1)
      // FROM source_database.source_table_name
      // WHERE dt = '{{ yesterday_ds_nodash }}'
      // GROUP BY pageid, age`,
      dialogVisible: false,
      sqlOptions: [
        {
          value: 'hive',
          label: 'Hive sql'
        },
        {
          value: 'spark-3.2',
          label: 'Spark-3.2 sql'
        }
      ],
      gitForm: {
        projectName: 'ads-bigdata-datastudio',
        filePath: ''
      },
      gitRules: {
        projectName: [{ required: true, message: '请选择git跟目录', trigger: ['blur', 'change'] }],
        filePath: [{ required: true, message: '请输入子路径', trigger: ['blur', 'change'] }]
      },
      gitDisabled: false,
      ruleForm: {
        invokingStatus: true,
        content: '',
        templateCode: 'Hive2Hive',
        name: '',
        description: '',
        folderName: '',
        folderId: '',
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
          {
            metadata: {
              region: '',
              type: 'hive',
              source: '',
              db: '',
              table: ''
            },
            offset: -1
          }
        ],
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      rules: {
        sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }]
      },
      regionList: tools.regionList,
      seniorForm: {
        sqlType: 'edit',
        sourceRegion: '', // region
        gitPath: '',
        checkExpirationTime: 24,
        engine: 'spark-3.2',
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
        // params: [],
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      sqlKey: 0,
      fullscreen: false,
      canEdit: true,
      nameDisabled: false,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      copyMsg: null,
      btnLoading: false,
      unwatch: null,
      isEdit: false,
      isWorkflow: false
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
          if (this.unwatch) {
            this.unwatch();
          }
          this.getTaskInfo(value);
          this.isEdit = true;
        } else {
          this.watchContent();
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
    this.ruleForm.folderId = this.$route.query.folderId;
    // if (!this.seniorForm.group) {
    //   this.seniorForm.group = this.groupList[0];
    // }
    // tools.regionList.then(res => {
    //   this.regionList = res;
    //   if (!this.isEdit) {
    //     this.seniorForm.sourceRegion = res[0].value;
    //   }
    // });
    // if (this.copyId) {
    //   this.copyMsg = this.$message({
    //     showClose: true,
    //     duration: 0,
    //     type: 'warning',
    //     message: '复制任务时，请修改step3中的“生成数据集信息”，确保其唯一不重复，否则无法成功复制任务。'
    //   });
    // }
    if (this.$route.query.uuid) {
      this.getInfo();
    }
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      setTimeout(() => {
        if (!this.isEdit) {
          this.seniorForm.sourceRegion = res[0].value;
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
      if (type === 'git') {
        this.gitPull();
      } else {
        const content = `/* =====DEMO-针对目标表不存在，支持创建iceberg表===== */
---先建表,此步骤为可选
CREATE TABLE IF NOT EXISTS test.zptest4(
  name STRING ,
  age STRING ,
  dt STRING
) USING iceberg
PARTITIONED BY (dt)
LOCATION 's3://bdp.tmp.us-east-1/iceberg/zptest4' ;
---写入逻辑
INSERT
  OVERWRITE TABLE test.zptest4 PARTITION(dt = '{{ yesterday_ds_nodash }}')
SELECT pageid, age, count(1)
FROM source_database.source_table_name
WHERE dt = '{{ yesterday_ds_nodash }}'
GROUP BY pageid, age`;
        this.$refs.monaco && this.$refs.monaco.setCode(content);
      }
    },
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.isCheckSql = false;
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      // this.seniorForm = runtimeConfig;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      // 旧数据兼容
      if (runtimeConfig.gitPath && !runtimeConfig.sqlType) {
        this.seniorForm.sqlType = 'git';
      }
      // // 重置编辑器
      // if (this.seniorForm.sqlType === 'git') {
      //   this.showEditor = false;
      //   this.$nextTick(() => {
      //     this.showEditor = true;
      //   });
      // }
      this.sqlKey++;
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
      this.$set(this.ruleForm, 'online', data.online);
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      this.content = decodeURIComponent(window.atob(data.content));
      this.$refs.monaco && this.$refs.monaco.setCode(this.content);
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
      if (data.workflowId) {
        this.isWorkflow = true;
      }
      this.watchContent();
    },
    watchContent() {
      this.unwatch = this.$watch('content', function() {
        this.isPass = false;
      });
    },
    getInfo() {
      getRegionAndSql({
        uuid: this.$route.query.uuid
      }).then(res => {
        const data = res.data;
        this.seniorForm.sourceRegion = data.region;
        if (data.sql) {
          this.content = data.sql;
          this.$refs.monaco && this.$refs.monaco.setCode(this.content);
        }
      });
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
              this.content = decodeURIComponent(window.atob(data.content));
              this.$refs.monaco.setCode(this.content);
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
    checkSql() {
      if (!this.seniorForm.sourceRegion) {
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
          runtimeConfig: this.seniorForm,
          ...this.ruleForm
        })
          .then(res => {
            const data = res.data;
            const msg = filters.dataTime(new Date()) + '\n' + data + '\n';
            //    // this.alertMessage = msg + this.alertMessage;
            this.alertMessage = msg;
            this.alertMessage = msg;
            if (data.indexOf('成功') !== -1) {
              this.alertType = 'success';
              this.isPass = true;
            } else {
              this.alertType = 'error';
              this.isPass = false;
            }
            this.$nextTick(() => {
              window.scrollTo(0, document.documentElement.clientHeight);
              const div = document.getElementById('checkMsg');
              div && (div.scrollTop = 0);
            });
          })
          .finally(() => {
            this.checkDisabled = false;
          });
      }
    },
    formatSql() {
      this.$refs.monaco.formatSql();
    },
    clearSql() {
      this.$refs.monaco.setCode('');
      this.seniorForm.gitPath = '';
      this.sqlKey++;
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
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
        // 下一步
        this.$refs.form.validate(async valid => {
          if (valid) {
            if (this.content) {
              this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
              const formData = new FormData();
              formData.append('region', this.seniorForm.sourceRegion);
              formData.append('sql', window.btoa(encodeURIComponent(this.content)));
              this.btnLoading = true;
              getSqlTbls(formData)
                .then(res => {
                  const data = res.data;
                  if (data.inputTbls.length && !this.isEdit) {
                    this.ruleForm.inputDataset = [];
                    this.ruleForm.dependTypes = [];

                    if (!this.ruleForm.eventDepends) {
                      this.ruleForm.eventDepends = [];
                    }
                    this.ruleForm.eventDepends = this.ruleForm.eventDepends.filter(item => {
                      return !item._auto; // 上次自动生成的内部依赖删除
                    });
                    if (this.ruleForm.eventDepends.length > 0) {
                      this.ruleForm.dependTypes.push('event');
                    }
                    data.inputTbls.forEach(item => {
                      if (item.name) {
                        // 内部依赖
                        if (!this.ruleForm.dependTypes.includes('event')) {
                          this.ruleForm.dependTypes.push('event');
                        }
                        this.ruleForm.eventDepends.push({
                          _auto: true, // 自动生成的内部依赖
                          dependId: item.name,
                          dependGra: '',
                          dateCalculationParam: {},
                          unitOffset: 0,
                          useDateCalcuParam: false,
                          granularity: item.granularity,
                          taskId: item.id,
                          metadataId: item.metadataId
                        });
                      } else {
                        // 外部依赖
                        if (!this.ruleForm.dependTypes.includes('dataset')) {
                          this.ruleForm.dependTypes.push('dataset');
                        }
                        this.ruleForm.inputDataset.push({
                          metadata: {
                            region: this.seniorForm.sourceRegion,
                            type: 'hive',
                            source: '',
                            db: item.db || '',
                            table: item.tbl || ''
                          },
                          guid: '',
                          id: '',
                          granularity: 'daily',
                          // offset: item.offset === 'null' ? undefined : item.offset,
                          unitOffset: 0,
                          ready_time: '0 0 * * *',
                          useDateCalcuParam: false,
                          dateCalculationParam: {}
                        });
                      }
                    });
                  }
                  // 自动识别生成数据集表单
                  if (data.outputTbls.length) {
                    const Lastitem = data.outputTbls[data.outputTbls.length - 1];
                    this.ruleForm.outputDataset[0].metadata = {
                      region: this.seniorForm.sourceRegion,
                      type: 'hive',
                      source: '',
                      db: Lastitem.db || '',
                      table: Lastitem.tbl || ''
                    };
                    this.ruleForm.outputDataset[0].offset = Lastitem.offset === 'null' ? undefined : Lastitem.offset;
                  } else {
                    this.ruleForm.outputDataset[0].metadata = {
                      region: '',
                      type: 'hive',
                      source: '',
                      db: '',
                      table: ''
                    };
                    this.ruleForm.outputDataset[0].offset = -1;
                  }
                  if (data.context) {
                    this.$message({
                      type: 'warning',
                      message: data.context
                    });
                  }
                })
                .finally(() => {
                  this.btnLoading = false;
                  this.currentStep++;
                });

              this.ruleForm.inputDataset.forEach(item => {
                item.metadata.region = this.seniorForm.sourceRegion;
              });
              try {
                this.ruleForm.outputDataset.forEach(item => {
                  item.metadata.region = this.seniorForm.sourceRegion;
                });
              } catch (e) {
                console.log('');
              }
            } else {
              this.$message.error('请输入SQL');
            }
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
        // 保存

        if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
          this.$message.error('至少包含一个前置依赖');
          return false;
        }
        if (this.ruleForm.outputDataset.length > 1) {
          this.$message.error('生成数据集信息只能保留一条');
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
        // this.ruleForm.eventDepends.forEach(item => {
        //   if (!item.dependId) {
        //     eventFlag = true;
        //     this.$message.warning('任务依赖任务名称不能为空，请根据任务ID查询');
        //     return;
        //   }
        // });
        if (this.ruleForm.dependTypes.includes('event') && this.ruleForm.eventDepends.length === 0) {
          eventFlag = true;
          this.$message.warning('请至少添加一条内部依赖');
        }
        if (eventFlag) return;
        let inputFlag = false;
        this.ruleForm.inputDataset.forEach(item => {
          if (this.ruleForm.dependTypes.includes('dataset') && !item.useDateCalcuParam && item.unitOffset === undefined) {
            inputFlag = true;
            this.$message.warning('数据依赖偏移量不能为空');
            return;
          }
        });
        if (inputFlag) return;
        // if (!this.seniorForm.group) {
        //   this.seniorForm.group = this.groupList[0];
        // }
        if (!this.seniorForm.source) {
          this.seniorForm.source = this.source;
        }
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        const params = {
          ...tools.copyFn(this.ruleForm),
          runtimeConfig: {
            ...this.seniorForm,
            cost: this.ruleForm.cost
          }
        };
        delete params.cost;
        params.inputDataset.forEach(item => {
          item.id = '';
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
          if (!item.metadata.type) {
            item.metadata.type = 'hive';
          }
        });
        params.outputDataset.forEach(item => {
          item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
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
        // 处理生成标志
        if (!paramsVal.outputDataset[0].check) {
          paramsVal.outputDataset[0].fileName = '';
          paramsVal.outputDataset[0].location = '';
        }
        if (!paramsVal.outputDataset[0].id) {
          delete paramsVal.outputDataset[0].id;
        }
        if (paramsVal.outputDataset[0].metadata && !paramsVal.outputDataset[0].metadata.db) {
          delete paramsVal.outputDataset[0].metadata;
        }
        this.$refs.validParams.show(paramsVal);
      }
    },
    dependReresh() {
      this.$confirm('刷新后将会根据上一步中的配置重新识别前置依赖', '刷新提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const formData = new FormData();
          formData.append('region', this.seniorForm.sourceRegion);
          formData.append('sql', window.btoa(encodeURIComponent(this.content)));
          getSqlTbls(formData).then(res => {
            const data = res.data;
            if (data.inputTbls.length) {
              this.ruleForm.inputDataset = [];
              this.ruleForm.dependTypes = [];
              this.ruleForm.eventDepends = [];

              data.inputTbls.forEach(item => {
                if (item.name) {
                  // 内部依赖
                  if (!this.ruleForm.dependTypes.includes('event')) {
                    this.ruleForm.dependTypes.push('event');
                  }
                  this.ruleForm.eventDepends.push({
                    _auto: true, // 自动生成的内部依赖
                    dependId: item.name,
                    dependGra: '',
                    dateCalculationParam: {},
                    unitOffset: 0,
                    useDateCalcuParam: false,
                    granularity: item.granularity,
                    taskId: item.id,
                    metadataId: item.metadataId
                  });
                } else {
                  // 外部依赖
                  if (!this.ruleForm.dependTypes.includes('dataset')) {
                    this.ruleForm.dependTypes.push('dataset');
                  }
                  this.ruleForm.inputDataset.push({
                    metadata: {
                      region: this.seniorForm.sourceRegion,
                      type: 'hive',
                      source: '',
                      db: item.db || '',
                      table: item.tbl || ''
                    },
                    guid: '',
                    id: '',
                    granularity: 'daily',
                    // offset: item.offset === 'null' ? undefined : item.offset,
                    unitOffset: 0,
                    ready_time: '0 0 * * *',
                    useDateCalcuParam: false,
                    dateCalculationParam: {}
                  });
                }
              });
            }
            if (data.context) {
              this.$message({
                type: 'warning',
                message: data.context
              });
            }
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  .content_wrap {
    .btn-wrap {
      min-width: 1000px;
      width: calc(100% - 200px);
      margin: 0 auto;
      text-align: right;
      padding: 20px 0;
    }
    .step-content {
      // padding: 20px;
      min-height: calc(100vh - 255px);
      .process {
        margin-top: -10px;
        // ::v-deep .el-tabs__header {
        //   padding-top: 15px;
        // }
        .sqlSmaple {
          top: 7px;
          left: 52px;
          line-height: 14px;
          background-color: transparent;
          border: none;
        }
        ::v-deep .el-tabs__content {
          overflow: visible;
          .monaco-btns {
            position: absolute;
            right: 0;
            top: -45px;
          }
          .editor_tool {
            margin: -10px 0 5px 0;
          }
        }
      }
      .inline-form {
        background: #fff;
        border: 0;
        // margin-bottom: 30px;
        // margin-bottom: 0;
        // margin-bottom: 14px;
        // padding: 16px 0 0;
      }
      .git-wrap {
        margin-bottom: 35px;
        .label {
          display: inline-block;
          width: 62px;
          text-align: right;
          margin-right: 12px;
          font-weight: 500;
          color: #2c3b5e;
        }
        .git-input {
          width: 180px;
        }
      }
      .monaco-editor-wrap {
        // height: calc(100vh - 360px);
        height: calc(100vh - 386px);
        min-height: 350px;
        position: relative;
        // .monaco-btns {
        //   position: absolute;
        //   right: 0;
        //   top: -40px;
        // }
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
    }
  }
}
.tip {
  font-size: $global-font-size-12;
  color: #aaa;
  line-height: normal;
}
</style>
