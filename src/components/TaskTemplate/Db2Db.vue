<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-show="currentStep === 2">
        <el-button class="open-btn" type="primary" @click="highSettingsVisible = true">{{ $lang('高级设置') }}</el-button>
        <el-form ref="configForm" :model="configForm" :rules="configRules" class="configForm" label-width="150px">
          <form-head :config-form="configForm"></form-head>
          <el-row>
            <el-col :span="12">
              <component :is="formLeft" :config-form="configForm" :self-params="selfParams" :table-obj="tableObj" @getLeftColumns="getLeftColumns" @getLocation="getLocation" />
            </el-col>
            <el-col :span="12">
              <component :is="formRight" ref="formRight" :config-form="configForm" :self-params="selfParams" :table-obj="tableObj" @getRightColumns="getRightColumns" @getLocation="getLocation" />
            </el-col>
          </el-row>
          <Step2Table :config-form="configForm" :table-obj="tableObj" :self-params="selfParams" @getLeftColumns="getLeftColumns" @getRightColumns="getRightColumns" @refreshTargetTableList="refreshTargetTableList"></Step2Table>
          <Step2Rules :config-form="configForm" />
        </el-form>
      </div>
      <el-drawer :title="$lang('高级设置')" :visible.sync="highSettingsVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :senior-form="seniorForm" :region="configForm.sourceRegion" :code="configForm.templateCode" @close="highSettingsVisible = false"></senior-form>
      </el-drawer>
      <step-three v-if="currentStep === 3" ref="stepThree" :current-step="currentStep" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" :rule-form="ruleForm"></step-three>
      <view-params v-if="currentStep === 4" :info="info" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" @jumpStep="$event => (currentStep = $event)"></view-params>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">{{ $lang('取消') }}</el-button>
      <el-button @click="preStep">{{ $lang('上一步') }}</el-button>
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 4) || (source !== 'task' && currentStep === 3))" @click="nextStep">{{
        (source === 'task' && currentStep !== 4) || currentStep === 2 ? $lang('下一步') : copyId ? $lang('确认复制') : $lang('保存')
      }}</el-button>
      <el-checkbox v-if="currentStep >= 4" v-model="ruleForm.invokingStatus" class="task-checkbox">{{ $lang('切换至该版本') }}</el-checkbox>
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
import StepsHead from '@/components/StepsHead/indexConfig.vue';
import SeniorForm from './components/SeniorForm';
import FormHead from './components/Step2FormHead';
import Step2Rules from './components/Step2Rules.vue';
import Step2Table from './components/Step2Table.vue';
import StepThree from './components/StepThree';
import ViewParams from './components/viewParams';
import ValidParams from '@/components/TaskTemplate/components/ValidParams';
import { getDataSetList, getTypeMapListFn, getEngineList } from '@/api/task';
import { resourceSearch } from '@/api/cluster';
export default {
  components: {
    StepsHead,
    SeniorForm,
    FormHead,
    Step2Rules,
    Step2Table,
    StepThree,
    ViewParams,
    ValidParams
  },
  props: {
    editData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    source: {
      type: String,
      default: 'task'
    }
  },
  data() {
    return {
      formLeft: '',
      formRight: '',
      currentStep: 2,
      copyId: this.$route.query.copyId,
      queryId: '',
      canEdit: true,
      highSettingsVisible: false,
      selfParams: {
        // 不需要传参的前端使用变量
        isEdit: false,
        isRightRDB: false,
        typeMapList: [],
        regionList: [],
        formLeftName: 'Step2FormLeft2',
        formRightName: 'Step2FormRight2',
        splitPkList: [],
        isSameMap: false, // 左右表单字段类型是否完全同步
        initRightColums: [], // 编辑或直接从接口中获取，比较执行变更
        editLeftColums: [] // 用于源表刷新时判断字段变更
      },
      // 第二步配置化页面的变量对象
      configForm: {
        isNewTemplate: true,
        doTableActive: false,
        dataOriginType: '',
        dataTargetType: '',
        owner: '',
        executeMode: 'local',
        executeEngine: 'seatunnel',
        sourceRegion: '',
        sourceType: '',
        sourceIcon: '',
        destinationType: '',
        targetIcon: '',
        templateCode: 'DataIntegration',
        sourceId: '',
        sourceName: '',
        destinationId: '',
        destinationName: '',
        sourceParam: {},
        sinkParam: {
          provider: {
            fileType: '',
            path: '',
            fieldDelimiter: ''
          }
        },
        sourceDb: '',
        targetDb: '',
        splitPk: '',
        partitionsArr: [{ name: '', value: '' }],
        sourcePartitionsArr: [{ name: '', value: '' }],
        preArr: [{ value: '' }],
        postArr: [{ value: '' }],
        taskParam: {
          writeMode: 'overwrite',
          isLimit: true,
          taskParallelism: 1,
          bandwidth: 10
          // batchSize: 104857600,
          // maxBatchRows: 500000,
          // flushInterval: 30000
        },
        // 第二步是有参数，传参时runtimeconfig的table属性中的参数放入tableParams
        tableParams: {
          filterStr: '',
          primaryKey: '',
          autoCreateTable: false,
          partitions: '',
          sourcePartitions: '',
          targetTable: '',
          sourceTable: '',
          location: '',
          tableComment: '',
          tableLevel: '1级'
        }
      },
      configRules: {
        sourceRegion: [{ required: true, message: this.$lang('请选择区域'), trigger: ['blur', 'change'] }],
        sourceId: [{ required: true, message: this.$lang('请选择数据源'), trigger: ['blur', 'change'] }],
        destinationId: [{ required: true, message: this.$lang('请选择数据源名称'), trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: this.$lang('请选择数据库名称'), trigger: ['blur', 'change'] }],
        targetDb: [{ required: true, message: this.$lang('请选择数据库名称'), trigger: ['blur', 'change'] }],
        sinkParam: {
          provider: {
            fileType: [{ required: true, message: this.$lang('请选择文件格式'), trigger: ['blur', 'change'] }],
            path: [{ required: true, message: this.$lang('请输入目录路径'), trigger: ['blur', 'change'] }],
            fieldDelimiter: [{ required: true, message: this.$lang('请输入列分隔符'), trigger: ['blur', 'change'] }]
          }
        },
        tableParams: {
          sourceTable: [{ required: true, message: this.$lang('请选择表名称'), trigger: ['blur', 'change'] }],
          targetTable: [{ required: true, message: this.$lang('请输入目标表名称'), trigger: ['blur', 'change'] }]
        }
        // partitionsArr: [
        //   { required: true, message: this.$t('task.dbValid3'), trigger: ['blur', 'change'] },
        //   { validator: this.partitionsRulesFn, trigger: ['blur', 'change'] }
        // ],
        // sourcePartitionsArr: [
        //   { required: true, message: this.$t('task.dbValid3'), trigger: ['blur', 'change'] },
        //   { validator: this.partitionsRulesFn, trigger: ['blur', 'change'] }
        // ]
      },
      tableObj: {
        showDoTable: false,
        isLeftEdit: false,
        isRightEdit: true,
        isLeftDrag: true,
        isRightDrag: false,
        tableLeftLoading: false,
        tableRightLoading: false,
        leftColumns: [],
        rightColumns: []
      },
      seniorForm: {
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        mysqlCdcType: 'init',
        owner: '',
        collaborators: [],
        dsGroups: [],
        group: '',
        resourceLevel: 'standard',
        executionTimeout: 0,
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        batchParams: '',
        lifecycle: 'Ec2spot',
        location: ''
      },
      ruleForm: {
        invokingStatus: true, // 是否切换至该版本
        templateCode: 'DataIntegration',
        name: '',
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
      formLeftLoading: false,
      typeList: ['String', 'Boolean', 'Bigint', 'Date', 'Double', 'Float', 'Int', 'Tinyint', 'Timestamp'],
      isWorkflow: false,
      nameDisabled: false
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm, this.configForm, { target_columns: this.tableObj.rightColumns, source_columns: this.tableObj.leftColumns });
    }
  },
  watch: {
    editData: {
      handler(value) {
        if (Object.keys(value).length > 0) {
          this.selfParams.isEdit = true;
          this.getTaskInfo(value);
        }
      },
      deep: true,
      immediate: true
    },
    'tableObj.leftColumns': {
      handler(value) {
        if (value.length) {
          this.selfParams.splitPkList = value.map(item => {
            return item.name;
          });
        }
      },
      deep: true,
      immediate: true
    },
    // isPartition 标识表单字段是否跟分区字段一样，若跟分区字段一样，则在表单中不显示
    'configForm.partitionsArr': {
      handler(val) {
        if (val.length) {
          this.tableObj.rightColumns.forEach(item => {
            if (val.find(cp => cp.name.trim() === (item.columnName || item.name).trim())) {
              this.$set(item, 'isPartition', true);
            } else {
              this.$set(item, 'isPartition', false);
            }
          });
        }
      },
      deep: true,
      immediate: true
    },
    'configForm.sourcePartitionsArr': {
      handler(val) {
        if (val.length) {
          this.tableObj.leftColumns.forEach(item => {
            if (val.find(cp => cp.name.trim() === (item.columnName || item.name).trim())) {
              this.$set(item, 'isPartition', true);
            } else {
              this.$set(item, 'isPartition', false);
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    resourceSearch().then(res => {
      this.selfParams.regionList = res.data.list.map(item => {
        return { label: item.description, value: item.regionAlias, storage: item.storage, catalogName: item.catalogName };
      });
    });
    this.getInitInfo();
    this.seniorForm.owner = this.$store.getters.userInfo.userId;
    this.configForm.owner = this.seniorForm.owner;
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    // 新增设置计算引擎默认值
    if (!this.isEdit && !this.seniorForm.engineConfig) {
      // this.getEngine();
    }
  },
  methods: {
    getInitInfo() {
      // const sourceType = this.$route.query.info.split('.')[0];
      // const destinationType = this.$route.query.info.split('.')[1];
      // this.configForm.sourceType = sourceType;
      // this.configForm.destinationType = destinationType;
      // this.configForm.sourceRegion = this.$route.query.info.split('.')[2];
      // 选择来源组件
      this.formLeft = () => import('./components/Step2FormLeft2');
      // 选择目标组件
      this.formRight = () => import('./components/Step2FormRight2');
      // // 是否使用接口返回的字段映射关系
      // if (sourceType === destinationType || this.isStorage(sourceType) || this.isStorage(destinationType)) {
      //   this.selfParams.isSameMap = true;
      // } else {
      //   this.selfParams.isSameMap = false;
      //   this.getTypeMapList();
      // }
    },
    getTypeMapList() {
      getTypeMapListFn({
        sourceType: this.configForm.sourceType,
        destinationType: this.configForm.destinationType
      }).then(res => {
        const mapData = JSON.parse(res.data);
        // 将对象的key转换为小写
        for (var key in mapData) {
          var lowerkey = key.toLowerCase();
          mapData[lowerkey] = mapData[key];
        }
        this.selfParams.typeMapList = mapData;
      });
    },
    partitionsRulesFn(rule, val, callback) {
      if (!(val[0].name && val[0].value)) {
        callback(new Error(this.$t('task.HM5')));
      } else {
        callback();
      }
    },
    isRDB(type) {
      const RDBList = ['mysql', 'oracle', 'doris', 'sqlserver', 'postgres', 'mongodb', 'clickhouse', 'redshift'];
      return RDBList.find(item => item === type);
    },
    isStorage(type) {
      const StorageList = ['s3', 'obs'];
      return StorageList.find(item => item === type);
    },
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      // 获取configForm值
      const runtimeConfigConfirm = JSON.parse(data.runtimeConfig);
      this.configForm = { ...this.configForm, ...runtimeConfigConfirm };
      delete this.configForm.catalog;
      delete this.configForm.advancedParameters;
      delete this.configForm.cost;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      // 处理分区字段
      // if (runtimeConfig.catalog.tables[0].partitions) {
      //   const partitionsArr = runtimeConfig.catalog.tables[0].partitions.split(',');
      //   partitionsArr.map((item, index) => {
      //     const splitIndex = item.indexOf('=');
      //     const partitionsName = item.substring(0, splitIndex);
      //     const partitionsValue = item.substring(splitIndex + 1);
      //     this.$set(this.configForm.partitionsArr, index, {
      //       name: partitionsName,
      //       value: partitionsValue
      //     });
      //   });
      // }
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
            data_type: item.data_type,
            comment: item.comment,
            isPK: item.isPK
          };
          if (item.funcs) {
            obj.funcs = item.funcs;
          }
          if (item.isPK) {
            this.configForm.tableParams.primaryKey = item.name;
          }
          this.tableObj.leftColumns.push(obj);
        });
        this.selfParams.editLeftColums = JSON.parse(JSON.stringify(this.tableObj.leftColumns));
        this.selfParams.initRightColums = JSON.parse(JSON.stringify(this.tableObj.rightColumns));
        this.tableObj.tableLeftLoading = false;
        this.tableObj.tableRightLoading = false;
      }, 500);

      // 处理ruleForm字段
      this.ruleForm.name = data.name;
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
        this.configForm.owner = this.seniorForm.owner;
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
      this.getInitInfo();
    },
    getEngine() {
      getEngineList({
        region: this.configForm.sourceRegion,
        template: this.ruleForm.templateCode
      }).then(res => {
        const data = res.data;
        const engineObj = data;
        for (const key in engineObj) {
          engineObj[key].forEach(item => {
            if (item.isdefault) {
              this.seniorForm.engineConfig = `${item.type}_${item.version}`;
            }
          });
        }
      });
    },
    getLocation() {
      // let partationStr = '/';
      // this.configForm.partitionsArr.map(item => {
      //   if (item.name) {
      //     partationStr += item.name + '=' + item.value + '/';
      //   }
      // });
      // partationStr = partationStr.substring(0, partationStr.length - 1);
      let storage;
      this.selfParams.regionList.some(item => {
        if (item.value === this.configForm.sourceRegion) {
          if (item.storage.endsWith('/')) {
            storage = item.storage.splice(0, -1);
          } else {
            storage = item.storage;
          }
          return true;
        }
      });
      this.configForm.tableParams.location = `${storage}/${this.configForm.targetDb}/${this.configForm.tableParams.targetTable}`;
    },
    refreshTargetTableList() {
      this.$refs.formRight.refreshTargetTableList && this.$refs.formRight.refreshTargetTableList();
    },
    getLeftColumns(type) {
      this.tableObj.leftColumns = [];
      if (type === 'clearLeftColumns') {
        return;
      }
      let params = {
        region: this.configForm.sourceRegion,
        metaFlag: 'AIRBYTE'
      };
      if (this.selfParams.formLeftName === 'Step2FormLeft1' || this.selfParams.formLeftName === 'Step2FormLeft2') {
        params = Object.assign(params, {
          type: this.configForm.sourceType,
          actorId: this.configForm.sourceId,
          db: this.configForm.sourceDb,
          table: this.configForm.tableParams.sourceTable,
          templateCode: this.ruleForm.templateCode
        });
      } else if (this.selfParams.formLeftName === 'Step2FormLeft3') {
        params = Object.assign(params, {
          type: this.configForm.sourceType,
          actorId: this.configForm.sourceId,
          templateCode: this.ruleForm.templateCode,
          table: this.configForm.sourceParam.provider.fileType,
          sourceParam: this.configForm.sourceParam
        });
      }
      this.tableObj.tableLeftLoading = true;
      getDataSetList({
        ...params
      })
        .then(res => {
          // const data = res.data.data[0];
          const data = res.data;
          if (data) {
            this.tableObj.leftColumns = data.columns.map((item, index) => {
              // this.tableObj.rightColumns.push(this.regColumItem(item));
              if (item.isPK) {
                this.configForm.tableParams.primaryKey = item.name;
              }
              if (this.selfParams.editLeftColums[index] && this.selfParams.editLeftColums[index].name !== item.name) {
                item.isNameChange = true;
              }
              if (this.configForm.sourcePartitionsArr.find(cp => cp.name.trim() === (item.columnName || item.name).trim())) {
                item.isPartition = true;
              } else {
                item.isPartition = false;
              }
              item.id = index;
              return {
                id: item.id,
                name: item.name,
                data_type: item.data_type || item.type,
                comment: item.comment,
                isPK: item.isPK,
                isNameChange: item.isNameChange,
                isPartition: item.isPartition
              };
            });
          }
        })
        .finally(() => {
          this.tableObj.tableLeftLoading = false;
        });
    },
    getRightColumns(type) {
      this.tableObj.rightColumns = [];
      if (type === 'clearRightColumns') {
        return;
      }
      let params = {
        region: this.configForm.sourceRegion,
        metaFlag: 'AIRBYTE'
      };
      if (this.selfParams.formRightName === 'Step2FormRight1' || this.selfParams.formRightName === 'Step2FormRight2') {
        params = Object.assign(params, {
          clearCache: true,
          actorId: this.configForm.destinationId,
          type: this.configForm.destinationType,
          templateCode: this.ruleForm.templateCode,
          db: this.configForm.targetDb,
          table: this.configForm.tableParams.targetTable
        });
      } else if (this.selfParams.formRightName === 'Step2FormRight3') {
        params = Object.assign(params, {
          clearCache: true,
          actorId: this.configForm.destinationId,
          type: this.configForm.destinationType,
          templateCode: this.ruleForm.templateCode,
          sinkParam: this.configForm.sinkParam
        });
      }
      this.tableObj.tableRightLoading = true;
      getDataSetList({
        ...params
      }).then(res => {
        this.tableObj.rightColumns = res.data.columns.map((item, index) => {
          if (this.configForm.partitionsArr.find(cp => cp.name.trim() === (item.columnName || item.name).trim())) {
            item.isPartition = true;
          } else {
            item.isPartition = false;
          }
          return this.regColumItem(item);
        });
        this.selfParams.initRightColums = JSON.parse(JSON.stringify(this.tableObj.rightColumns));
        this.tableObj.tableRightLoading = false;
        // 延迟加载，保证选择目标表后执行变更按钮初始化置灰
        this.$nextTick(() => {
          this.configForm.doTableActive = false;
        });
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
        columnType: item.data_type || item.type,
        // columnType: this.selfParams.isSameMap ? item.data_type || item.type : this.selfParams.typeMapList[(item.data_type || item.type).split('(')[0].toLowerCase()] || this.selfParams.typeMapList.default,
        columnComment: item.comment,
        securityLevel: '1级',
        isPartition: item.isPartition
      };
    },
    filterPartitionColunm(list) {
      return list.filter(v => !v.isPartition);
    },
    localToParams() {
      const params = JSON.parse(JSON.stringify(this.ruleForm));
      delete params.cost;
      if (!this.configForm.postArr[0].value) {
        this.configForm.postList = [];
      } else {
        this.configForm.postList = this.configForm.postArr;
      }
      if (!this.configForm.preArr[0].value) {
        this.configForm.preList = [];
      } else {
        this.configForm.preList = this.configForm.preArr;
      }
      params.runtimeConfig = {
        ...this.configForm,
        catalog: {
          targetDb: this.configForm.targetDb,
          sourceDb: this.configForm.sourceDb,
          tables: [
            {
              ...this.configForm.tableParams,
              columns: this.filterPartitionColunm(this.tableObj.rightColumns).map((item, index) => {
                return { ...this.filterPartitionColunm(this.tableObj.leftColumns)[index], ...item };
              })
            }
          ]
        },
        advancedParameters: this.seniorForm,
        cost: this.ruleForm.cost
      };
      if (this.queryId) {
        params.id = this.queryId;
      }
      return params;
    },
    handelStep(step) {
      if (step < 2) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = step;
      }
    },
    preStep() {
      if (this.currentStep === 2) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep() {
      if (this.currentStep === 2) {
        this.$refs.configForm.validate(formValid => {
          if (formValid) {
            if (!this.ruleForm.name) {
              this.ruleForm.name = `imp_${this.configForm.tableParams.targetTable}`;
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
              table: this.configForm.tableParams.targetTable
            };
            this.ruleForm.outputDataset[0].id = '';
            this.currentStep++;
          }
        });
      } else if (this.currentStep === 3 && this.source === 'task') {
        // 进入第四步预览之前，处理configForm数据，以便于预览取值几传参
        // 处理分区信息
        let partitionsStr = '';
        this.configForm.partitionsArr.map(item => {
          const partitionsItem = item.name ? item.name + '=' + item.value : '';
          partitionsStr += partitionsItem + '#';
        });
        this.configForm.tableParams.partitions = partitionsStr.substring(0, partitionsStr.length - 1);
        let sourcePartitionsStr = '';
        this.configForm.sourcePartitionsArr.map(item => {
          const partitionsItem = item.name ? item.name + '=' + item.value : '';
          sourcePartitionsStr += partitionsItem + '#';
        });
        this.configForm.tableParams.sourcePartitions = sourcePartitionsStr.substring(0, sourcePartitionsStr.length - 1);
        this.configForm.preSql = this.configForm.preArr.map(item => item.value)[0];
        this.configForm.postSql = this.configForm.postArr.map(item => item.value)[0];
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            if (this.$refs.stepThree.validateAlert()) {
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
          this.$message.error(this.$lang('成本归属占比总额必须是100哦'));
          return false;
        }
        let eventFlag = false;
        if (this.ruleForm.dependTypes.includes('event') && this.ruleForm.eventDepends.length === 0) {
          eventFlag = true;
          this.$message.warning(this.$lang('请至少添加一条内部依赖'));
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
    .configForm {
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
