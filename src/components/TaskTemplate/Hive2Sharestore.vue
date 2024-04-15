<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="ruleForm" :key="formKey" :model="seniorForm" :rules="rules" class="ruleForm" label-width="200px">
          <el-form-item label="输出数据类型" prop="isSharestore">
            <el-radio-group v-model="seniorForm.isSharestore" @change="formKey++">
              <el-radio :label="true">ShareStore</el-radio>
              <el-radio :label="false">TiKV</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="区域" prop="sourceRegion" class="region-box">
            <template #label>
              <span>区域</span>
              <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="seniorForm.sourceRegion" placeholder="请选择区域" @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-tabs class="tabs-box">
            <el-tab-pane label="数据源">
              <!--  v-if="!seniorForm.isSharestore" -->
              <el-form-item label="数据源类型" prop="isHive">
                <el-radio-group v-model="seniorForm.isHive" @change="formKey++">
                  <el-radio :label="true">hive表</el-radio>
                  <el-radio :label="false">S3/Obs文件</el-radio>
                </el-radio-group>
              </el-form-item>
              <!-- !seniorForm.isSharestore &&  -->
              <el-form-item v-if="!seniorForm.isHive" label="S3/Obs路径" prop="s3ObsPath">
                <el-input v-model="seniorForm.s3ObsPath" placeholder="请输入S3/Obs文件路径" :title="seniorForm.s3ObsPath"></el-input>
                <div class="tip">例如：s3://shareit.tmp.ap-southeast-1/Default/BDP/dmp/dmp_to_sharestore</div>
              </el-form-item>
              <template v-else>
                <el-form-item label="源数据库名称" prop="sourceDb">
                  <el-select v-model="seniorForm.sourceDb" placeholder="选择数据库" :loading="dbLoad" :allow-create="true" default-first-option filterable clearable @change="changeSourceDb">
                    <el-option v-for="item in sourceDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="源表名称" prop="sourceTable">
                  <el-select v-model="seniorForm.sourceTable" placeholder="选择表名称" :loading="tableLoad" :allow-create="true" default-first-option clearable filterable @change="changeSourceTable">
                    <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                  </el-select>
                  <el-button type="text" size="mini" @click="showColumns">查看schema</el-button>
                </el-form-item>
              </template>
              <el-form-item v-if="!(!seniorForm.isSharestore && seniorForm.isHive)" label="分区信息">
                <el-input v-model="seniorForm.partitions" placeholder="填写分区信息"></el-input>
                <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标表">
              <template v-if="seniorForm.isSharestore">
                <el-form-item label="sharestore连接地址" prop="restEndpoint">
                  <el-input v-model="seniorForm.restEndpoint" placeholder="http://test.sharestore.cbs.sg1.helix/admin/v2/" clearable></el-input>
                </el-form-item>
                <el-form-item label="sharestore集群名称" prop="clusterLoad">
                  <el-input v-model="seniorForm.clusterLoad" placeholder="sharestore-read-test" clearable></el-input>
                </el-form-item>
                <el-form-item label="sharestore的zookeeper地址" prop="zkStr">
                  <el-input v-model="seniorForm.zkStr" placeholder="172.26.94.185:2181" clearable></el-input>
                </el-form-item>
                <el-form-item label="目标表名(segment)" prop="segmentLoad">
                  <el-input v-model="seniorForm.segmentLoad" placeholder="sprs_bdp_user_profile" clearable></el-input>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="tikv连接地址" prop="pdaddr">
                  <el-input v-model="seniorForm.pdaddr" placeholder="填写tikv连接地址" clearable></el-input>
                </el-form-item>
                <el-form-item label="目标表名" prop="segment">
                  <el-input v-model="seniorForm.segment" placeholder="填写目标表名" clearable></el-input>
                </el-form-item>
                <el-form-item label="tikv类型">
                  <el-select v-model="seniorForm.kvType" placeholder="请选择tikv类型" clearable>
                    <el-option label="binary" value="binary"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <!-- <el-tabs v-if="seniorForm.isSharestore">
          <el-tab-pane label="字段映射">
            <el-table v-loading="tableLoading" :data="columns" stripe>
              <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
              <el-table-column prop="name" label="源字段名称" min-width="120" align="center" :formatter="formatter"></el-table-column>
              <el-table-column prop="type" label="源字段类型" min-width="120" align="center" :formatter="formatter"></el-table-column>
              <el-table-column prop="comment" label="字段描述" min-width="100" align="center" :formatter="formatter"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs> -->
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-output-edit="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :region-list="regionList" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-output-edit="true" @jumpStep="$event => (currentStep = $event)" />

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
    <el-dialog title="查看schema" :visible.sync="dialogVisible" width="800px" :append-to-body="true" :modal-append-to-body="false">
      <el-table v-loading="tableLoading" :data="columns" stripe>
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="源字段名称" min-width="120" align="center" :formatter="formatter"></el-table-column>
        <el-table-column prop="type" label="源字段类型" min-width="120" align="center" :formatter="formatter"></el-table-column>
        <el-table-column prop="comment" label="字段描述" min-width="100" align="center" :formatter="formatter"></el-table-column>
      </el-table>
    </el-dialog>
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
import StepThree from './components/StepThree';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList } from '@/api/task';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SeniorForm,
    SqlTips,
    StepThree,
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
    const validatePath = (rule, value, callback) => {
      if (value.indexOf(':') === -1) {
        callback(new Error('请输入正确的S3/Obs文件路径，以 s3: 或 obs: 开头'));
      } else {
        callback();
      }
    };
    return {
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      btnLoading: false,
      tableLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      currentStep: 1,
      ruleForm: {
        invokingStatus: true,
        templateCode: 'Hive2Sharestore',
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
        isSharestore: [{ required: true, message: '请选择输出数据类型', trigger: ['blur', 'change'] }],
        isHive: [{ required: true, message: '请选择数据源类型', trigger: ['blur', 'change'] }],
        s3ObsPath: [
          { required: true, message: '请输入S3/Obs文件路径', trigger: ['blur', 'change'] },
          { validator: validatePath, trigger: ['blur', 'change'] }
        ],
        sourceRegion: [{ required: true, message: '请选择数据集区域', trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: '请选择源数据库名称', trigger: ['blur', 'change'] }],
        sourceTable: [{ required: true, message: '请选择源表名称', trigger: ['blur', 'change'] }],
        restEndpoint: [{ required: true, message: '请输入sharestore连接地址', trigger: ['blur', 'change'] }],
        clusterLoad: [{ required: true, message: '请输入sharestore集群名称', trigger: ['blur', 'change'] }],
        zkStr: [{ required: true, message: '请输入sharestore的zookeeper地址', trigger: ['blur', 'change'] }],
        segmentLoad: [{ required: true, message: '请输入目标表名', trigger: ['blur', 'change'] }],
        pdaddr: [{ required: true, message: '请输入tikv连接地址', trigger: ['blur', 'change'] }],
        segment: [{ required: true, message: '请输入目标表名', trigger: ['blur', 'change'] }]
      },
      dbLoad: false,
      tableLoad: false,
      columns: [],
      regionList: tools.regionList,
      sourceDbList: [],
      sourceTableList: [],
      drawerVisible: false,
      seniorForm: {
        isSharestore: true,
        isHive: true,
        s3ObsPath: '',
        sourceRegion: '',
        sourceDb: '',
        sourceTable: '',
        partitions: 'dt={{ ds }}',
        restEndpoint: '',
        clusterLoad: '',
        zkStr: '',
        segmentLoad: '',
        pdaddr: '',
        segment: '',
        kvType: '',
        // 高级设置
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
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      formKey: 0,
      canEdit: true,
      nameDisabled: false,
      copyMsg: null,
      isWorkflow: false,
      dialogVisible: false
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
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // if (!this.seniorForm.group) {
    //   this.seniorForm.group = this.groupList[0];
    // }
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
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
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.msgType = msgType;
      this.infoObj.title = title;
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
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      if (this.seniorForm.isSharestore || (!this.seniorForm.isSharestore && this.seniorForm.isHive)) {
        this.changeRegion(this.seniorForm.sourceRegion, 'init');
        this.changeSourceDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      }
      if (this.ruleForm.inputDataset[0].guid) {
        this.getColumns(this.ruleForm.inputDataset[0].guid);
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
        templateCode: 'Hive2Sharestore'
      }).then(res => {
        const data = res.data;
        this.sourceDbList = data.data;
        this.dbLoad = false;
      });
    },
    changeSourceDb(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      const selectedObj = this.sourceDbList.find(item => item.name === value);
      if (selectedObj) {
        this.tableLoad = true;
        getDataSetList({
          region: this.seniorForm.sourceRegion,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Sharestore'
        }).then(res => {
          const data = res.data;
          this.sourceTableList = data.data;
          this.tableLoad = false;
        });
      }
    },
    changeSourceTable(value) {
      const sourceTabelObj = this.sourceTableList.find(item => item.name === value);
      if (sourceTabelObj) {
        this.ruleForm.inputDataset[0].id = sourceTabelObj && sourceTabelObj.qualifiedName;
        this.ruleForm.inputDataset[0].guid = sourceTabelObj && sourceTabelObj.guid;
        // this.getColumns(value);
      } else {
        this.ruleForm.inputDataset[0].guid = '';
        this.ruleForm.inputDataset[0].id = '';
      }
    },
    showColumns() {
      this.dialogVisible = true;
      this.getColumns(this.seniorForm.sourceTable);
    },
    getColumns(table) {
      this.tableLoading = true;
      getDataSetList({
        region: this.seniorForm.sourceRegion,
        type: 'hive',
        db: this.seniorForm.sourceDb,
        table: table,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Sharestore'
      }).then(res => {
        const data = res.data;
        if (data) {
          this.columns = data.columns;
        }
        this.tableLoading = false;
      });
    },
    formatter(row, column, cellValue, index) {
      if (cellValue === '' || cellValue === null) {
        return '-';
      } else {
        return cellValue;
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
      if (this.currentStep === 1) {
        // 下一步
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.ruleForm.inputDataset[0].metadata.region = this.seniorForm.sourceRegion;
            // this.ruleForm.outputDataset[0].metadata.region = this.seniorForm.sourceRegion;
            if (!this.seniorForm.isSharestore && !this.seniorForm.isHive) {
              const dbTblArr = this.seniorForm.s3ObsPath.split(':');
              this.ruleForm.inputDataset[0].metadata.db = dbTblArr[0];
              this.ruleForm.inputDataset[0].metadata.table = window.btoa(dbTblArr[1]);
            } else {
              this.ruleForm.inputDataset[0].metadata.db = this.seniorForm.sourceDb;
              this.ruleForm.inputDataset[0].metadata.table = this.seniorForm.sourceTable;
            }
            // if (this.seniorForm.isSharestore) {
            //   this.ruleForm.outputDataset[0].metadata.table = this.seniorForm.segmentLoad;
            //   this.ruleForm.outputDataset[0].metadata.type = 'hive';
            // } else {
            //   this.ruleForm.outputDataset[0].metadata.table = this.seniorForm.segment;
            //   this.ruleForm.outputDataset[0].metadata.type = 'tikv';
            // }
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
        // 保存

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
        // if (!this.seniorForm.group) {
        //   this.seniorForm.group = this.groupList[0];
        // }
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
        // if (this.copyId) {
        //   params.outputDataset = [];
        // }
        // params.outputDataset.forEach(item => {
        //   item.id = '';
        // });
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
    padding: 0 20px 20px;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 0;
      // top: 15px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 700px;
        margin: 0 auto 18px;
      }
      .el-cascader,
      .el-select,
      .el-input {
        width: 425px;
      }
    }
    .tip {
      font-size: $global-font-size-12;
      color: #aaa;
      line-height: normal;
    }
  }
}
// .tabs-box {
//   margin-top: 50px;
// }
// .region-box {
//   position: fixed;
//   top: 115px;
// }
</style>
