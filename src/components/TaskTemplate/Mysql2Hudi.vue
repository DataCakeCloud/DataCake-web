<!-- 批量入仓(DB -> Hive) 模板 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div v-loading="contentLoading" class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="ruleForm" :model="configForm" :rules="rules" class="ruleForm" label-width="120px">
          <el-form-item label="区域" prop="sourceRegion">
            <el-select v-model="configForm.sourceRegion" placeholder="请选择区域" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="数据源名称" prop="connectionName">
                <el-select v-model="configForm.connectionName" placeholder="数据源名称" :loading="sourceLoad" filterable clearable @change="changeConnectionName">
                  <el-option v-for="item in connectionNameList" :key="item.actorId" :label="item.name" :value="item.actorId"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
                <span v-if="!configForm.sourceRegion" class="tips">* 请先选择区域</span>
              </el-form-item>
              <el-form-item label="数据库" prop="sourceDb">
                <el-select v-model="configForm.sourceDb" placeholder="选择数据库" :loading="dbLoad" filterable clearable>
                  <!--  @change="changeSourceDb" -->
                  <el-option v-for="item in sourceDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表名称" prop="sourceTable">
                <el-select v-model="configForm.sourceTable" placeholder="选择表名称" :loading="tableLoad" clearable filterable @change="changeSourceTable">
                  <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="数据库名称">
                <el-select v-model="configForm.targetDb" placeholder="选择数据库名称" :loading="tdbLoad" :allow-create="true" default-first-option filterable clearable @change="changeTargetDb">
                  <el-option v-for="item in targetDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
                <span v-if="!configForm.sourceRegion" class="tips">* 请先选择区域</span>
              </el-form-item>
              <!-- <el-form-item label="层级" prop="layer">
                <el-input v-model="configForm.layer" placeholder="填写分区信息" disabled clearable></el-input>
              </el-form-item>
              <el-form-item label="主题" prop="theme">
                <el-input v-model="configForm.theme" placeholder="填写主题" clearable></el-input>
              </el-form-item> -->
              <!-- <el-form-item label="目标表名称" prop="targetTablePart">
                <el-input v-model="configForm.layer" class="small-input" disabled></el-input>
                <el-input v-model="configForm.theme" class="small-input" value="主题" disabled></el-input>
                <el-input v-model="configForm.targetTablePart" value="ods" placeholder="填写目标表名称" clearable style="width: 208px"></el-input>
                <el-input v-model="configForm.syncTypeText" class="small-input" disabled></el-input>
                <el-input v-model="configForm.granularity" class="small-input" disabled></el-input>
              </el-form-item> -->
              <el-form-item label="目标表名称">
                <el-select v-model="configForm.targetTable" placeholder="选择目标表名称" :loading="ttabLoad" :allow-create="true" default-first-option filterable clearable>
                  <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据同步方式" prop="syncType">
                <el-radio-group v-model="configForm.syncType">
                  <el-radio :label="1">全量同步</el-radio>
                  <!-- <el-radio :label="2">增量同步</el-radio> -->
                </el-radio-group>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <el-tabs>
          <el-tab-pane v-loading="tableLoading" label="字段转换映射">
            <el-row>
              <el-col :span="13">
                <el-table :data="columns" stripe :cell-style="{ height: '42px' }">
                  <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
                  <el-table-column prop="name" label="输入表字段" min-width="120" align="center" :show-overflow-tooltip="true"></el-table-column>
                  <el-table-column prop="data_type" label="字段类型" min-width="120" align="center"></el-table-column>
                  <el-table-column prop="funcs" min-width="120" align="center" class-name="table-func">
                    <template slot-scope="scope">
                      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                        <div v-if="scope.row.funcs && scope.row.funcs.length > 0">
                          <span class="func-span">函数名</span>
                          <span class="func-span">参数</span>
                          <div v-for="(item, index) in scope.row.funcs" :key="index">
                            <span class="func-span">{{ item.funcName }}</span>
                            <span class="func-span">{{ item.funcParams.join(',') }}</span>
                          </div>
                        </div>
                        <div v-else>添加转换函数</div>
                        <template slot="reference">
                          <func-icon @click.native="clickFunc(scope.row, scope.$index)"></func-icon>
                          <div v-if="scope.row.funcs && scope.row.funcs.length > 0" class="func-num">{{ scope.row.funcs.length }}</div>
                        </template>
                      </el-popover>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="11">
                <el-table :data="columns" stripe :cell-style="{ height: '42px' }">
                  <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
                  <el-table-column prop="columnName" label="输出表字段" min-width="120" align="center" :show-overflow-tooltip="true"></el-table-column>
                  <el-table-column prop="columnType" label="字段类型" min-width="120" align="center">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.columnType" placeholder="请选择目标字段类型" size="mini" clearable>
                        <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="字段描述" min-width="100" align="center">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.columnComment" placeholder="字段描述" size="mini" clearable></el-input>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :name-disabled="nameDisabled" :is-show-input-check="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :region-list="regionList" :name-disabled="nameDisabled" :is-show-input-check="true" @jumpStep="$event => (currentStep = $event)" />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-sql-form ref="seniorFormSql" :is-show-batch="true" :senior-form="seniorFormSql" @close="drawerVisible = false"></senior-sql-form>
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
    <convert-func ref="convertFunc" @save="save"></convert-func>
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
// import SeniorForm from './components/SeniorForm';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import FuncIcon from '@/components/FuncIcon';
import ConvertFunc from './components/ConvertFunc';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList } from '@/api/task';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    // SeniorForm,
    SeniorSqlForm,
    StepThree,
    FuncIcon,
    ConvertFunc,
    EllipsisTooltip,
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
      formLoading: false,
      contentLoading: false,
      tableLoading: false,
      currentStep: 1,
      queryId: '',
      copyId: this.$route.query.copyId,
      ruleForm: {
        invokingStatus: true,
        templateCode: 'Mysql2Hudi',
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
          {
            dependId: '',
            dependGra: '',
            dateCalculationParam: {},
            unitOffset: 0,
            useDateCalcuParam: false,
            granularity: '',
            taskId: ''
          }
        ],
        inputDataset: [
          {
            metadata: {
              region: '',
              type: 'mysql',
              source: '',
              db: '',
              table: ''
            },
            guid: '',
            id: '',
            granularity: 'daily',
            // offset: -1,
            unitOffset: -1,
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
      configForm: {
        sourceRegion: '',
        // 数据源
        connectionName: '',
        sourceDb: '',
        sourceTable: '',
        // 目标表
        targetDb: '',
        targetTable: '',
        // layer: 'ods',
        // theme: '',
        // targetTablePart: '',
        // syncTypeText: 'all',
        syncType: 1,
        // 数据源用户信息
        connectionUrl: '',
        dbUser: '',
        dbPassword: ''
      },
      rules: {
        sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        connectionName: [{ required: true, message: '请选择数据源名称', trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: '请选择数据库名称', trigger: ['blur', 'change'] }],
        sourceTable: [{ required: true, message: '请选择表名称', trigger: ['blur', 'change'] }],
        targetDb: [{ required: true, message: '请选择数据库名称', trigger: ['blur', 'change'] }],
        theme: [{ required: true, message: '请输入主题', trigger: ['blur', 'change'] }],
        targetTablePart: [{ required: true, message: '请输入目标表名称', trigger: ['blur', 'change'] }],
        targetTable: [{ required: true, message: '请输入目标表名称', trigger: ['blur', 'change'] }],
        name: [{ required: true, message: '请输入name', trigger: ['blur', 'change'] }],
        syncType: [{ required: true, message: '请选择数据同步方式', trigger: ['blur', 'change'] }]
      },
      sourceLoad: false,
      dbLoad: false,
      tableLoad: false,
      tdbLoad: false,
      ttabLoad: false,
      regionList: tools.regionList,
      typeList: ['STRING', 'BIGINT', 'DECIMAL(22,6)', 'TIMESTAMP'],
      targetDbList: [],
      targetTableList: [],
      connectionNameList: [],
      sourceDbList: [],
      sourceTableList: [],
      columns: [],
      drawerVisible: false,
      seniorFormSql: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointTimeout: 100,
          checkpointMode: 'AT_LEAST_ONCE',
          isBatchTask: true,
          emails: '',
          alertMethod: ['dingTalk'],
          alertType: [2],
          alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
          // 高级设置
          owner: '',
          collaborators: [],
          dsGroups: [],
          parallelism: 1,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: []
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      canEdit: true,
      nameDisabled: false,
      copyMsg: null
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorFormSql, { target_columns: this.columns, source_columns: this.columns });
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
    this.seniorFormSql.runtimeConfig.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
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
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    getTaskInfo(data) {
      this.contentLoading = true;
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.seniorFormSql.flinkClusterId = data.flinkClusterId;
      Object.assign(this.seniorFormSql.runtimeConfig, runtimeConfig);
      // this.configForm = runtimeConfig;
      this.seniorFormSql.flinkClusterId = data.flinkClusterId;
      if (data.displayDependJars && data.displayDependJars.length) {
        this.seniorFormSql.displayDependJars = data.displayDependJars.map(item => {
          return {
            artifactId: item.artifactId,
            id: item.id,
            region: item.region
          };
        });
      } else {
        this.seniorFormSql.displayDependJars = [{ artifactId: '', id: '' }];
      }
      for (const i in this.configForm) {
        this.configForm[i] = runtimeConfig[i];
      }
      this.columns = runtimeConfig.columns;
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      this.changeRegion(this.configForm.sourceRegion, 'init');
      this.changeConnectionName(this.configForm.connectionName, 'init');
      // this.changeSourceDb(this.configForm.sourceDb, 'init');
      this.changeTargetDb(this.configForm.targetDb, 'init');
      this.contentLoading = false;
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
        this.ruleForm.name = data.name + '-copy';
        this.nameDisabled = false;
        this.seniorFormSql.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
    },
    changeRegion(value, name) {
      if (!name) {
        this.configForm.connectionName = '';
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
        this.configForm.targetDb = '';
      }
      if (value) {
        this.formLoading = true;
        this.targetDbList = [];
        this.connectionNameList = [];
        this.sourceLoad = true;
        this.tdbLoad = true;
        getDataSetList({
          region: value,
          type: 'hive',
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hudi'
        }).then(data => {
          this.targetDbList = data.data;
          this.tdbLoad = false;
        });
        getDataSetList({
          region: value,
          type: 'mysql',
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hudi'
        }).then(data => {
          this.connectionNameList = data.data;
          this.formLoading = false;
          this.sourceLoad = false;
        });
      }
    },
    changeConnectionName(value, name) {
      if (!name) {
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
      }
      if (value) {
        const currentObj = this.connectionNameList.find(item => item.actorId === value);
        if (currentObj && currentObj.parameters) {
          this.configForm.connectionUrl = currentObj.parameters.url;
          this.configForm.dbUser = currentObj.parameters.username;
          this.configForm.dbPassword = currentObj.parameters.password;
        }
        if (currentObj) {
          this.sourceDbList = [{ name: currentObj.db }];
          this.configForm.sourceDb = currentObj.db;
        }

        // this.formLoading = true;
        // this.sourceDbList = [];
        // this.dbLoad = true;
        // getDataSetList({
        //   region: this.configForm.sourceRegion,
        //   type: 'mysql',
        //   datasource: value
        // }).then(data => {
        //   this.sourceDbList = data.data;
        //   this.formLoading = false;
        //   this.dbLoad = false;
        // });
        this.formLoading = true;
        this.sourceTableList = [];
        this.tableLoad = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: 'mysql',
          actorId: this.configForm.connectionName,
          db: this.configForm.sourceDb,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hudi'
        }).then(data => {
          this.sourceTableList = data.data;
          this.formLoading = false;
          this.tableLoad = false;
        });
      }
    },
    changeSourceDb(value, name) {
      if (!name) {
        this.configForm.sourceTable = '';
      }
      if (value) {
        this.formLoading = true;
        this.sourceTableList = [];
        this.tableLoad = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: 'mysql',
          datasource: this.configForm.connectionName,
          db: value
        }).then(data => {
          this.sourceTableList = data.data;
          this.formLoading = false;
          this.tableLoad = false;
        });
      }
    },
    changeSourceTable(value) {
      if (value) {
        const currentObj = this.sourceTableList.find(item => item.name === value);
        if (currentObj) {
          this.ruleForm.inputDataset[0].id = currentObj.qualifiedName;
          this.ruleForm.inputDataset[0].guid = currentObj.guid;
        }
        this.tableLoading = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: 'mysql',
          actorId: this.configForm.connectionName,
          db: this.configForm.sourceDb,
          table: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hudi'
        }).then(res => {
          const data = res.data;
          // this.sourceTableList = data.data;
          if (data.columns) {
            this.columns = data.columns.map(item => {
              return {
                name: item.name,
                data_type: item.data_type,
                columnName: item.name,
                columnType: this.typeList.find(ele => ele === item.data_type.toUpperCase()) || this.typeList[0],
                columnComment: item.comment
              };
            });
          }
          this.tableLoading = false;
        });
      }
    },
    changeTargetDb(value, name) {
      if (!name) {
        this.configForm.targetTable = '';
      }
      const selectedObj = this.targetDbList.find(item => item.name === value);
      if (value && selectedObj) {
        this.formLoading = true;
        this.targetTableList = [];
        this.ttabLoad = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hudi'
        }).then(data => {
          this.targetTableList = data.data;
          this.formLoading = false;
          this.ttabLoad = false;
        });
      }
    },
    clickFunc(row, index) {
      this.$refs.convertFunc.showWin(row, index);
    },
    save(funcs, index) {
      this.$set(this.columns[index], 'funcs', funcs);
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
        // 第二步
        this.$refs.ruleForm.validate(formValid => {
          if (formValid) {
            this.currentStep++;
            this.ruleForm.inputDataset[0].metadata = {
              region: this.configForm.sourceRegion,
              type: 'mysql',
              source: this.configForm.connectionName,
              db: this.configForm.sourceDb,
              table: this.configForm.sourceTable
            };
            // this.configForm.targetTable = `${this.configForm.layer}_${this.configForm.theme}_${this.configForm.targetTablePart}_${this.configForm.syncTypeText}_${this.configForm.granularity}`;
            this.ruleForm.outputDataset[0].metadata = {
              region: this.configForm.sourceRegion,
              type: 'hive',
              source: '',
              db: this.configForm.targetDb,
              table: this.configForm.targetTable
            };
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
        if (!this.seniorFormSql.runtimeConfig.source) {
          this.seniorFormSql.runtimeConfig.source = this.source;
        }
        const params = {
          ...tools.copyFn(this.ruleForm),
          ...this.seniorFormSql,
          runtimeConfig: {
            ...this.seniorFormSql.runtimeConfig,
            ...this.configForm,
            columns: this.columns,
            cost: this.ruleForm.cost
          }
        };
        delete params.cost;
        params.inputDataset.forEach(item => {
          item.id = '';
        });
        params.outputDataset.forEach(item => {
          item.id = '';
        });
        if (this.$store.getters.userInfo && !this.seniorFormSql.owner) {
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
    .open-btn {
      position: absolute;
      right: 20px;
      // top: 15px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 700px;
        margin: 0 auto 18px;
      }
      .el-select,
      .el-input {
        width: 480px;
      }
      .small-input {
        width: 64px;
      }
    }
    .func-num {
      position: absolute;
      height: 14px;
      width: 14px;
      background: #2fbfa0;
      color: #fff;
      top: 8px;
      left: 50%;
      border-radius: 50%;
      font-size: $global-font-size-12;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(0.6);
    }
  }
}
</style>
