<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-show="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="ruleForm" :model="configForm" :rules="rules" class="ruleForm" label-width="180px">
          <form-head :config-form="configForm"></form-head>
          <el-row>
            <el-col :span="12"><form-left ref="formLeft" :template-code="ruleForm.templateCode" :config-form="configForm" @get-columns="getColumns"></form-left></el-col>
            <el-col :span="12"><form-right :template-code="ruleForm.templateCode" :config-form="configForm"></form-right></el-col>
          </el-row>
        </el-form>
        <table-mapping :table-obj="tableObj" @refreshTable="getColumns"></table-mapping>
      </div>
      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
      </el-drawer>
      <step-three v-if="currentStep === 2" ref="stepThree" :current-step="currentStep" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="true" :is-show-input-check="true" :is-show-output-check="true" :rule-form="ruleForm"></step-three>
      <view-params v-if="currentStep === 3" :info="info" :region-list="regionList" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" @jumpStep="$event => (currentStep = $event)"></view-params>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <el-button type="primary" :disabled="tableObj.dragLoading || (!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2)))" @click="nextStep">{{
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
    ></valid-params>
  </div>
</template>
<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import FormHead from './components/FormHead';
import FormLeft from './components/FormLeft';
import FormRight from './components/FormRight';
import TableMapping from './components/TableMapping';
import StepThree from './components/StepThree';
import ViewParams from './components/viewParams';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams';
import { getDataSetList } from '@/api/task';

export default {
  components: {
    StepsHead,
    SeniorForm,
    FormHead,
    FormLeft,
    FormRight,
    TableMapping,
    StepThree,
    ViewParams,
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
    return {
      currentStep: 1,
      copyId: this.$route.query.copyId,
      queryId: '',
      canEdit: true,
      isEdit: false,
      drawerVisible: false,
      tableObj: {
        isRightEdit: true,
        isLeftEdit: true,
        tableRightLoading: false,
        tableLeftLoading: false,
        leftColumns: [],
        rightColumns: [],
        dragLoading: false
      },
      ruleForm: {
        invokingStatus: true, // 是否切换至该版本
        templateCode: 'File2Lakehouse',
        name: '',
        folderName: '',
        folderId: '',
        description: '',
        dependTypes: [], // 依赖类型
        triggerParam: {
          // 调度配置
          type: 'cron',
          isIrregularSheduler: 1,
          outputGranularity: 'daily',
          crontabParam: {
            advancedSetting: false,
            range: [],
            interval: 5,
            startTime: '00:00',
            endTime: '23:59',
            fixedTime: '00:00'
          },
          crontab: ''
        },
        eventDepends: [], // 内部依赖
        inputDataset: [
          // 外部依赖
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
            unitOffset: 0,
            ready_time: '0 0 * * *',
            useDateCalcuParam: false,
            dateCalculationParam: {}
          }
        ],
        outputDataset: [
          // 生成数据集
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
          // 成本归属
          {
            key: '',
            value: '100'
          }
        ]
      },
      configForm: {
        sourceRegion: '',
        sourceType: '',
        executeMode: 'local',
        // 来源
        sourceId: '',
        sourceParam: {},
        // 目标字段
        destinationId: '',
        targetDb: 'stage',
        targetTable: '',
        partitions: [{ name: '', value: '' }],
        taskParam: {
          location: '',
          tableComment: '',
          tableLevel: '1级',
          bandwidth: 1
        }
      },
      rules: {
        sourceId: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        sourceType: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        destinationId: [{ required: true, message: '请选择数据源名称', trigger: ['blur', 'change'] }],
        targetDb: [{ required: true, message: '请选择数据库名称', trigger: ['blur', 'change'] }],
        targetTable: [{ required: true, message: '请输入目标表名称', trigger: ['blur', 'change'] }]
      },
      seniorForm: {
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        mysqlCdcType: 'init',
        checkExpirationTime: 24,
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
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: []
        batchParams: '',
        lifecycle: 'Ec2spot',
        location: ''
      },
      formLeftLoading: false,
      primaryKey: '',
      typeList: ['String', 'Boolean', 'Bigint', 'Date', 'Double', 'Float', 'Int', 'Tinyint', 'Timestamp'],
      isWorkflow: false,
      nameDisabled: false,
      regionList: tools.regionList
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm, this.configForm, { target_columns: this.tableObj.rightColumns, source_columns: this.tableObj.leftColumns });
    }
  },
  watch: {
    data: {
      handler(value) {
        if (Object.keys(value).length > 0) {
          this.isEdit = true;
          this.getTaskInfo(value);
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.ruleForm.folderId = this.$route.query.folderId;
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    this.seniorForm.owner = this.$store.getters.userInfo.userId;
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      this.configForm.sourceRegion = res[0].value;
      if (!this.isEdit) {
        this.configForm.sourceType = 'oss';
      }
    });
  },
  methods: {
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      // 获取configForm值
      this.configForm.sourceRegion = runtimeConfig.sourceRegion;
      this.configForm.sourceType = runtimeConfig.sourceType;
      this.configForm.sourceId = runtimeConfig.sourceId;
      this.configForm.destinationId = runtimeConfig.destinationId;
      this.configForm.targetDb = runtimeConfig.catalog.targetDb;
      this.configForm.targetTable = runtimeConfig.catalog.tables[0].targetTable;
      if (runtimeConfig.taskParam) {
        this.configForm.taskParam = runtimeConfig.taskParam;
      } else {
        // 历史数据没有taskParam的情况
        this.getLocation();
      }
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
      this.configForm.sourceParam = runtimeConfig.sourceParam;
      // 处理分区字段
      if (runtimeConfig.catalog.tables[0].partitions) {
        const partitionsArr = runtimeConfig.catalog.tables[0].partitions.split(',');
        partitionsArr.map((item, index) => {
          const splitIndex = item.indexOf('=');
          const partitionsName = item.substring(0, splitIndex);
          const partitionsValue = item.substring(splitIndex + 1);
          this.$set(this.configForm.partitions, index, {
            name: partitionsName,
            value: partitionsValue
          });
        });
      }

      // 处理高级设置字段
      Object.keys(this.seniorForm).forEach(key => {
        this.seniorForm[key] = runtimeConfig.advancedParameters[key];
      });
      this.seniorForm.alertModel = runtimeConfig.alertModel ? runtimeConfig.alertModel : this.seniorForm.alertModel;
      this.seniorForm.regularAlert = runtimeConfig.regularAlert ? runtimeConfig.regularAlert : this.seniorForm.regularAlert;
      // 处理字段映射数据
      this.columnsArr = Array.isArray(runtimeConfig.catalog.tables[0].columns) ? runtimeConfig.catalog.tables[0].columns : JSON.parse(runtimeConfig.catalog.tables[0].columns);
      // 编辑初始化时，表单数据延迟加载，防止因为表单数据过多导致整个页面卡住白屏
      this.tableObj.tableLeftLoading = true;
      this.tableObj.tableRightLoading = true;
      setTimeout(() => {
        this.columnsArr.forEach((item, index) => {
          // 最新源表有删除后，只取与源表长度相同的目标表
          this.tableObj.rightColumns.push({
            id: index,
            columnName: item.columnName,
            columnType: item.columnType,
            columnComment: item.columnComment,
            securityLevel: item.securityLevel
          });
          const obj = {
            id: index,
            name: item.name,
            data_type: item.data_type ? item.data_type : item.dataType,
            comment: item.comment,
            isPK: item.isPK
          };
          if (item.funcs) {
            obj.funcs = item.funcs;
          }
          if (item.isPK) {
            this.primaryKey = item.name;
          }
          this.tableObj.leftColumns.push(obj);
        });
        this.tableObj.tableLeftLoading = false;
        this.tableObj.tableRightLoading = false;
      }, 500);

      // 处理ruleForm字段
      this.ruleForm.name = data.name;
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      const outputDataset = JSON.parse(data.outputDataset);
      const inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      if (this.ruleForm.outputDataset && this.ruleForm.outputDataset.length > 0 && this.ruleForm.outputDataset[0].location) {
        this.$set(this.ruleForm.outputDataset[0], 'check', true);
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
      if (data.workflowId) {
        this.isWorkflow = true;
      }
    },
    getLocation() {
      let partationStr = '';
      this.configForm.partitions.map(item => {
        if (item.name) {
          partationStr += item.name + '=' + item.value + '/';
        }
      });
      partationStr = partationStr.substring(0, partationStr.length - 1);
      this.configForm.taskParam.location = `/stage/${this.configForm.userGroupName}/${this.configForm.targetTable}/${partationStr}`;
    },
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    getColumns() {
      this.tableObj.tableLeftLoading = true;
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: this.configForm.sourceType,
        actorId: this.configForm.sourceId,
        metaFlag: 'AIRBYTE',
        templateCode: this.ruleForm.templateCode,
        sourceParam: this.configForm.sourceParam
      })
        .then(res => {
          const { data } = res.data;
          if (data && data.length) {
            this.tableObj.rightColumns = [];
            this.tableObj.leftColumns = data[0].columns.map((item, index) => {
              if (item.isPK) {
                this.primaryKey = item.name;
              }
              item.id = index;
              this.tableObj.rightColumns.push(this.regColumItem(item));
              return {
                id: item.id,
                name: item.name,
                data_type: item.data_type,
                comment: item.comment,
                isPK: item.isPK
              };
            });
          } else {
            this.tableObj.leftColumns = [];
            this.tableObj.rightColumns = [];
          }
        })
        .finally(() => {
          this.tableObj.tableLeftLoading = false;
        });
    },
    formatType(Type) {
      const type = Type.toLowerCase();
      if (type === 'bigint' || type === 'bigserial' || type === 'integer' || type === 'smallint' || type === 'serial' || type === 'int' || type === 'numberic') {
        return 'Bigint';
      } else if (type === 'boolean') {
        return 'Boolean';
      } else {
        return 'String';
      }
    },
    regColumItem(item) {
      return {
        columnName: item.name,
        columnType: this.typeList.find(ele => ele === this.formatType(item.data_type)),
        columnComment: item.comment,
        securityLevel: '1级'
      };
    },
    localToParams() {
      const params = tools.copyFn(this.ruleForm);
      delete params.cost;
      // 处理分区信息
      let partitions = '';
      this.configForm.partitions.map(item => {
        const partitionsItem = item.name ? item.name + '=' + item.value : '';
        partitions += partitionsItem + ',';
      });
      partitions = partitions.substring(0, partitions.length - 1);
      params.runtimeConfig = {
        isNewFormat: true,
        sourceRegion: this.configForm.sourceRegion,
        executeMode: this.configForm.executeMode,
        sourceType: this.configForm.sourceType,
        sourceId: this.configForm.sourceId,
        destinationType: 'iceberg',
        destinationId: this.configForm.destinationId,
        taskParam: this.configForm.taskParam,
        sourceParam: this.configForm.sourceParam,
        alertModel: this.seniorForm.alertModel,
        regularAlert: this.seniorForm.regularAlert,
        catalog: {
          targetDb: this.configForm.targetDb,
          tables: [
            {
              autoCreateTable: true,
              targetTable: this.configForm.targetTable,
              partitions: partitions,
              columns: this.tableObj.rightColumns.map((item, index) => {
                return { ...this.tableObj.leftColumns[index], ...item };
              }),
              primaryKey: this.primaryKey
            }
          ]
        },
        advancedParameters: this.seniorForm,
        cost: this.ruleForm.cost
      };
      if (this.queryId) {
        params.id = this.queryId;
      }
      console.log(this.ruleForm, 555);
      return params;
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep() {
      if (this.currentStep === 1) {
        this.$refs.ruleForm.validate(formValid => {
          if (formValid) {
            if (!this.copyId && !this.isEdit) {
              this.ruleForm.name = `imp_${this.configForm.targetTable}`;
            }
            this.ruleForm.inputDataset[0].metadata = {
              region: this.configForm.sourceRegion,
              type: this.configForm.sourceType,
              source: '',
              db: '',
              table: ''
            };
            this.ruleForm.inputDataset[0].id = '';
            this.ruleForm.outputDataset[0].metadata = {
              region: this.configForm.sourceRegion,
              type: 'hive',
              source: '',
              db: this.configForm.targetDb,
              table: this.configForm.targetTable
            };
            this.ruleForm.outputDataset[0].id = '';
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
        // 处理传参数据
        const paramsVal = this.localToParams();
        this.$refs.validParams.show(paramsVal);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.step2 {
  .step-content {
    padding: 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 20px;
      // top: 15px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 83%;
        // margin: 0 auto 18px;
      }
    }
  }
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
}
</style>
