<!-- Hive -> Hive Cross Region 模板 -->
<template>
  <div class="step2HCCloud step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="ruleForm" :model="seniorForm" :rules="rules" class="ruleForm" label-width="130px">
          <el-form-item label="同步类型" prop="isTable">
            <template slot="label"> 同步类型<i class="el-icon-info" style="cursor: pointer" @click="syncTypeVisible = !syncTypeVisible"></i> </template>
            <el-radio-group v-model="seniorForm.isTable">
              <el-radio :label="true">表</el-radio>
              <el-radio :label="false">文件</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="源数据区域" prop="sourceRegion">
                <el-select v-model="seniorForm.sourceRegion" placeholder="请选择源数据区域" clearable @change="changeRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value" :disabled="seniorForm.isTable ? item.value === seniorForm.targetRegion || item.value === 'sg1' : false"></el-option>
                </el-select>
              </el-form-item>
              <template v-if="seniorForm.isTable">
                <el-form-item label="源数据库名称" prop="sourceDb">
                  <el-select
                    v-model="seniorForm.sourceDb"
                    placeholder="选择数据库"
                    :loading="dbLoad"
                    :allow-create="true"
                    default-first-option
                    filterable
                    clearable
                    @keyup.ctrl.67.native="copyHandler(seniorForm.sourceDb)"
                    @keydown.meta.67.native="copyHandler(seniorForm.sourceDb)"
                    @change="changeSourceDb"
                  >
                    <el-option v-for="item in sourceDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="sourceTable" label="源表名称" prop="sourceTable">
                  <el-select
                    v-model="seniorForm.sourceTable"
                    placeholder="选择表名称"
                    :loading="tableLoad"
                    :allow-create="true"
                    default-first-option
                    clearable
                    filterable
                    @keyup.ctrl.67.native="copyHandler(seniorForm.sourceTable)"
                    @keydown.meta.67.native="copyHandler(seniorForm.sourceTable)"
                    @change="changeSourceTable"
                  >
                    <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="partitions" label="分区信息">
                  <el-input v-model="seniorForm.partitions" :title="seniorForm.partitions" placeholder="请输入分区信息" clearable></el-input>
                  <span class="tips" @click="handelInfo('jinjia', '示例参数如下')">参数提示</span>
                </el-form-item>
              </template>
              <el-form-item v-else label="源路径" prop="sourcePath">
                <span slot="label">
                  源路径
                  <i class="el-icon-info primary" style="cursor: pointer" @click="handelInfo('sourceInfo', '源路径提示')"></i>
                </span>
                <el-input v-model="seniorForm.sourcePath" type="textarea" :title="seniorForm.sourcePath" :placeholder="placeholder1" clearable></el-input>
                <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
              </el-form-item>
              <el-form-item v-if="!seniorForm.isTable" class="check-box">
                <el-checkbox v-model="isFilter">过滤该目录下的文件</el-checkbox>
                <i class="el-icon-info primary" style="cursor: pointer" @click="handelInfo('filterInfo', '过滤文件提示')"></i>
              </el-form-item>
              <el-form-item v-if="!seniorForm.isTable && isFilter" key="filtersFile" prop="filtersFile">
                <div>
                  <el-input v-model="seniorForm.filtersFile" :placeholder="placeholder2" clearable></el-input>
                  <grammar-tips placement="right"></grammar-tips>
                </div>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="目标数据区域" prop="targetRegion">
                <el-select v-model="seniorForm.targetRegion" placeholder="请选择目标数据区域" clearable>
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value" :disabled="seniorForm.isTable ? item.value === seniorForm.sourceRegion || item.value === 'sg1' : false"></el-option>
                </el-select>
              </el-form-item>
              <template v-if="seniorForm.isTable">
                <el-form-item label="目标数据库名称">
                  <el-input v-model="seniorForm.targetDb" placeholder="基于来源库生成的目标库名称" disabled></el-input>
                </el-form-item>
                <el-form-item label="目标表名称">
                  <el-input v-model="seniorForm.targetTable" placeholder="基于来源表生成的目标表名称" disabled></el-input>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item key="targetPath-input" label="目标路径" prop="targetPath">
                  <span slot="label">
                    目标路径
                    <i class="el-icon-info primary" style="cursor: pointer" @click="handelInfo('targetInfo', '目标路径提示')"></i>
                  </span>
                  <el-input v-model="seniorForm.targetPath" type="textarea" :title="seniorForm.targetPath" :placeholder="placeholder3" clearable></el-input>
                  <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                </el-form-item>
                <el-form-item prop="deleteMode">
                  <span slot="label">
                    删除目标文件
                    <el-popover placement="left" width="370" trigger="hover">
                      <div class="step2HCCloud-tips">
                        <div>同步任务执行前，如果需要删除目标目录下与同步的源文件同名的文件，可以选择“是”，否则，选择“否”；</div>
                      </div>
                      <i slot="reference" class="el-icon-info primary" style="cursor: pointer"></i>
                    </el-popover>
                  </span>
                  <el-radio-group v-model="seniorForm.deleteMode">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </template>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :is-workflow="isWorkflow"
        :is-change-table="!queryId && !seniorForm.isTable"
        :name-disabled="nameDisabled"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :region="seniorForm.sourceRegion"
        :is-input-edit="!seniorForm.isTable"
        :rule-form="ruleForm"
        :senior-form="seniorForm"
      ></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :region-list="regionList"
        :is-workflow="isWorkflow"
        :is-change-table="!queryId && !seniorForm.isTable"
        :name-disabled="nameDisabled"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :is-input-edit="!seniorForm.isTable"
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

    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>

      <div v-else-if="infoObj.msgType === 'sourceInfo'" class="step2HCCloud-tips">
        <div>1）此处支持同步单一文件，也支持同步单一目录（即同步此目录下的全部文件）；</div>
        <div>2）同步单一文件时，需要在此栏中填写路径+指定的文件名（含扩展名），例如： s3://桶名/data/shier/singleFile.csv ，系统将读取指定的文件；注意，路径、文件名区分大小写；</div>
        <div>3）同步单一目录时，需要在路径中以“/”结尾；</div>
        <div>4）路径中支持填写任务运行参数，可支持的任务运行参数参考输入框后方'参数提示'；</div>
      </div>

      <div v-else-if="infoObj.msgType === 'filterInfo'" class="step2HCCloud-tips">
        <div>
          <div>1）当“源路径”输入的是一个目录时，如果需要过滤此目录下的文件，可勾选此项，并支持在下方输入框以正则的方式批量匹配要过滤的文件。例如：当只需要同步某个目录下除以“_Success”结尾文件以外的所有文件时，比如某目录下有以下几个文件，</div>
          <div>
            <img src="@/assets/h2hTipsImg.png" alt="" width="360" />
          </div>
          <div>在下方输入框中填写“.*_Success”或"ab_Success"，就能匹配到 ‘ab_Success’。同步此目录时，将 排除掉此输入框匹配到的文件。</div>
        </div>
      </div>

      <div v-else-if="infoObj.msgType === 'targetInfo'" class="step2HCCloud-tips">
        <div>
          <div>1）此栏支持填写任务运行参数，可支持的任务运行参数参考输入框后方'参数提示'；</div>
          <div>2）此栏请以斜杠结尾，如果没有，会自动识别为以斜杠为结尾的目录</div>
          <div>3）指定要同步到的目标路径应该是单一目录，比如：</div>
          <div>
            <img src="@/assets/dm-tips.png" alt="" width="360" />
          </div>
          <div>假设任务执行日期为2022年6月14日，对应要写入的目标目录为：/data/202206/，即“源路径”中指定的文件将会被同步到此目录下</div>
        </div>
      </div>
    </el-info>
    <el-info v-model="syncTypeVisible" title="同步类型">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <el-table :data="gridData" size="mini" :cell-style="{ padding: '4px 0' }">
          <el-table-column property="val1" label="同步类型" width="80px"></el-table-column>
          <el-table-column property="val2" label="默认执行集群所在区域"></el-table-column>
        </el-table>
      </div>
    </el-info>
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import SqlTips from './components/SqlTips';
import GrammarTips from './components/grammarTips';
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
    GrammarTips,
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
      syncTypeVisible: false,
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      placeholder1: '示例：s3://桶名称/{{ yesterday_ds }}.strftime("%Y%m%d")/',
      placeholder2: '示例：.*_SUCCESS',
      placeholder3: '示例：s3://桶名称/xx/{{ yesterday_ds }}.strftime("%Y%m%d")/',
      isFilter: false,
      columns: [],
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      currentStep: 1,
      ruleForm: {
        invokingStatus: true,
        templateCode: 'DataMigration',
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
        sourceRegion: [{ required: true, message: '请选择源数据区域', trigger: ['blur', 'change'] }],
        targetRegion: [{ required: true, message: '请选择目标数据区域', trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: '请选择源数据库名称', trigger: ['blur', 'change'] }],
        sourceTable: [{ required: true, message: '请选择源表名称', trigger: ['blur', 'change'] }],
        isTable: [{ required: true, message: '请选择任务类型', trigger: ['blur', 'change'] }],
        sourcePath: [{ required: true, message: '请输入源路径', trigger: ['blur', 'change'] }],
        targetPath: [{ required: true, message: '请输入目标路径', trigger: ['blur', 'change'] }],
        deleteMode: [{ required: true, message: '请选择是否删除目标文件', trigger: ['blur', 'change'] }],
        filtersFile: [{ required: true, message: '请输入过滤文件', trigger: ['blur', 'change'] }]
      },
      dbLoad: false,
      tableLoad: false,
      regionList: tools.regionList,
      sourceDbList: [],
      sourceTableList: [],
      drawerVisible: false,
      seniorForm: {
        isTable: true,
        sourceRegion: '',
        filtersFile: '',
        sourcePath: '',
        targetRegion: '',
        targetPath: '',
        sourceDb: '',
        sourceTable: '',
        partitions: "datepart={{ (execution_date - macros.timedelta(days=1)).strftime('%Y-%m-%d') }}",
        targetDb: '',
        targetTable: '',
        deleteMode: true,
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
      canEdit: true,
      nameDisabled: false,
      copyMsg: null,
      isWorkflow: false,
      gridData: [
        {
          val1: '表',
          val2: '华为新加坡'
        },
        {
          val1: '文件',
          val2: '如果数据跨云（源与目标数据不在相同云下），默认执行集群是在华为新加坡；如果数据不跨云，默认执行集群是在源数据所在区域'
        }
      ]
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
    typeChange(val) {
      if (val) {
        this.ruleForm.outputDataset = [
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
        ];
      }
    },
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
      this.columns = runtimeConfig.columns;
      delete runtimeConfig.cost;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      this.isFilter = Boolean(runtimeConfig.filtersFile);
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.changeRegion(this.seniorForm.sourceRegion, 'init');
      this.changeSourceDb(this.seniorForm.sourceDb, 'init');
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
      if (data.workflowId) {
        this.isWorkflow = true;
      }
    },
    changeRegion(value, name) {
      if (!name) {
        this.seniorForm.sourceDb = '';
        this.seniorForm.sourceTable = '';
      }
      if (value) {
        this.sourceDbList = [];
        this.dbLoad = true;
        getDataSetList({
          region: value,
          type: 'hive',
          metaFlag: 'AIRBYTE',
          templateCode: 'DataMigration'
        }).then(res => {
          const data = res.data;
          this.sourceDbList = data.data;
          this.dbLoad = false;
        });
      }
    },
    changeSourceDb(value, name) {
      if (!name) {
        this.seniorForm.sourceTable = '';
      }
      this.seniorForm.targetDb = value;
      this.sourceTableList = [];
      const sourceDbObj = this.sourceDbList.find(item => item.name === value);
      if (sourceDbObj) {
        this.tableLoad = true;
        getDataSetList({
          region: this.seniorForm.sourceRegion,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'DataMigration'
        }).then(res => {
          const data = res.data;
          this.sourceTableList = data.data;
          this.tableLoad = false;
        });
      }
    },
    changeSourceTable(value) {
      this.seniorForm.targetTable = value;
      const sourceTabelObj = this.sourceTableList.find(item => item.name === value);
      if (sourceTabelObj) {
        this.ruleForm.inputDataset[0].id = sourceTabelObj && sourceTabelObj.qualifiedName;
        this.ruleForm.inputDataset[0].guid = sourceTabelObj && sourceTabelObj.guid;
      } else {
        this.ruleForm.inputDataset[0].id = `${this.seniorForm.sourceDb}.${this.seniorForm.sourceTable}@${this.seniorForm.sourceRegion}`;
        this.ruleForm.inputDataset[0].guid = '';
      }
      if (value) {
        getDataSetList({
          region: this.seniorForm.sourceRegion,
          type: 'hive',
          db: this.seniorForm.targetDb,
          table: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'DataMigration'
        }).then(res => {
          const data = res.data;
          this.columns = data.columns.map(item => {
            return {
              columnComment: item.comment,
              columnName: item.name,
              columnType: item.type
            };
          });
        });
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
            if (this.ruleForm.outputDataset[0].metadata) {
              this.ruleForm.outputDataset[0].metadata.region = this.seniorForm.targetRegion;
              this.ruleForm.outputDataset[0].metadata.db = this.seniorForm.targetDb;
            }
            if (this.seniorForm.isTable && this.ruleForm.inputDataset[0].metadata) {
              this.ruleForm.inputDataset[0].metadata.db = this.seniorForm.sourceDb;
              this.ruleForm.inputDataset[0].metadata.table = this.seniorForm.sourceTable;
              if (this.ruleForm.outputDataset[0].metadata) {
                this.ruleForm.outputDataset[0].metadata.table = this.seniorForm.targetTable;
              }
            }
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
            cost: this.ruleForm.cost,
            columns: this.columns
          }
        };
        // 选择表或者文件时，清空另一种同步类型的数据
        if (this.seniorForm.isTable) {
          params.sourcePath = '';
          params.filtersFile = '';
          params.targetPath = '';
          params.deleteMode = true;
        } else {
          params.sourceDb = '';
          params.sourceTable = '';
          params.partitions = "datepart={{ (execution_date - macros.timedelta(days=1)).strftime('%Y-%m-%d') }}";
          params.targetDb = '';
          params.targetTable = '';
        }
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
        });
        params.outputDataset.forEach(item => {
          item.id = '';
        });
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
    padding: 20px;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 20px;
      // top: 5px;
      z-index: 10;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 750px;
        margin: 0 auto 18px;
      }
      .el-cascader,
      .el-select,
      .el-input {
        width: 70%;
      }
    }
  }
}
</style>
<style lang="scss">
.step2HCCloud .el-textarea {
  width: 70%;
}
.step2HCCloud .check-box {
  margin-bottom: 10px !important;
}
.step2HCCloud .check-box .el-form-item__content {
  line-height: 1;
}
.step2HCCloud-tips {
  div {
    margin-bottom: 10px;
  }
}
</style>
