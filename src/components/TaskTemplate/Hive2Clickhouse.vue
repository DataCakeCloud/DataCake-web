<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :rules="rules" :model="ruleForm" label-width="140px">
          <el-form-item label="区域" prop="runtimeConfig.sourceRegion">
            <template #label>
              <span>区域</span>
              <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="ruleForm.runtimeConfig.sourceRegion" placeholder="请选择区域" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="数据库" prop="inputDataset[0].metadata.db">
                <el-select
                  v-model="ruleForm.inputDataset[0].metadata.db"
                  :title="ruleForm.inputDataset[0].metadata.db"
                  placeholder="请选择数据库"
                  :loading="dbLoad"
                  :allow-create="true"
                  default-first-option
                  clearable
                  filterable
                  @keyup.ctrl.67.native="copyHandler(ruleForm.inputDataset[0].metadata.db)"
                  @keydown.meta.67.native="copyHandler(ruleForm.inputDataset[0].metadata.db)"
                  @change="changeDb"
                >
                  <el-option v-for="item in sourceDbList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表名称" prop="inputDataset[0].metadata.table">
                <el-select
                  v-model="ruleForm.inputDataset[0].metadata.table"
                  :title="ruleForm.inputDataset[0].metadata.table"
                  placeholder="请选择表名称"
                  :loading="tableLoad"
                  :allow-create="true"
                  default-first-option
                  filterable
                  clearable
                  @keyup.ctrl.67.native="copyHandler(ruleForm.inputDataset[0].metadata.table)"
                  @keydown.meta.67.native="copyHandler(ruleForm.inputDataset[0].metadata.table)"
                  @change="changeTable"
                >
                  <el-option v-for="item in sourceTableList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <el-tabs>
          <el-tab-pane label="目标表">
            <el-form ref="seniorForm1" class="ruleForm" :rules="rules" :model="seniorForm" label-width="140px">
              <el-form-item label="ClickHouse数据源" prop="targetSource">
                <el-select v-model="seniorForm.targetSource" :title="seniorForm.targetSource" placeholder="请选择数据源" :loading="targetSourceLoad" clearable @change="changeTargetSource">
                  <el-option v-for="item in targetSourceList" :key="item.actorId" :value="item.actorId" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ClickHouse数据库" prop="targetDB">
                <el-select v-model="seniorForm.targetDB" :title="seniorForm.targetDB" placeholder="请选择数据库" :loading="targetDbLoad" clearable filterable @keyup.ctrl.67.native="copyHandler(seniorForm.targetDB)" @keydown.meta.67.native="copyHandler(seniorForm.targetDB)">
                  <el-option v-for="item in targetDBList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ClickHouse表名称" prop="targetTable">
                <!-- <el-input v-model="seniorForm.targetTable" :title="seniorForm.targetTable" placeholder="请输入表名称" clearable></el-input> -->
                <el-select
                  v-if="!seniorForm.existTargetTable"
                  v-model="seniorForm.targetTable"
                  :title="seniorForm.targetTable"
                  filterable
                  placeholder="请选择表名称"
                  :loading="targetTablebLoad"
                  clearable
                  @keyup.ctrl.67.native="copyHandler(seniorForm.targetTable)"
                  @keydown.meta.67.native="copyHandler(seniorForm.targetTable)"
                  @change="hoseTableChange"
                >
                  <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /> </el-option>
                </el-select>
                <div v-else>
                  <el-input v-model="seniorForm.targetTable" title="只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符" placeholder="只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符"></el-input>
                </div>
                <div v-if="!seniorForm.existTargetTable" class="quickCreateTable">
                  <el-button type="text" icon="el-icon-circle-plus-outline" @click="customTanleChange(true)">快速建表</el-button>
                </div>
              </el-form-item>
              <el-form-item v-if="seniorForm.existTargetTable" label="cluster" prop="cluster" required style="margin-bottom: 20px">
                <el-input v-model="seniorForm.cluster" placeholder="请输入cluster"></el-input>
                <div v-if="seniorForm.existTargetTable" class="quickCreateTable">
                  <el-button type="text" @click="customTanleChange(false)">返 回</el-button>
                </div>
              </el-form-item>
              <el-form-item label="分区信息" class="partitions" prop="partitions">
                <div class="title_tips">
                  <div class="title">
                    <i class="el-icon-warning-outline"></i> 根据所选库表,自动获取
                    <el-button type="text" icon="el-icon-refresh-right">获 取</el-button>
                  </div>
                  <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                </div>
                <div class="partitions_item">
                  <div class="name">分区</div>
                  <div class="value" style="margin-left: 150px">分区内容</div>
                </div>
                <div v-for="(item, index) in seniorForm.partitions" :key="index" class="partitions_item">
                  <el-input v-model="item.name" placeholder="分区名称" clearable class="name"></el-input>
                  <el-input v-model="item.value" placeholder="分区内容" clearable class="value"></el-input>
                  <i v-if="index === 0" class="el-icon-circle-plus-outline" @click="addPartitions"></i>
                  <i v-else class="el-icon-remove-outline" @click="delPartitions(index)"></i>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <el-tabs>
          <el-tab-pane label="字段映射" class="trans_table">
            <el-row class="tab_content">
              <el-col :span="13">
                <div class="mb10">
                  <el-button type="primary" size="mini" @click="showInput = true">添加</el-button>
                  <el-select v-show="showInput" v-model="inputField" placeholder="在当前选中表中选择字段" size="mini" @change="addInput">
                    <el-option v-for="item in inputFieldList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
                  </el-select>
                  <el-button type="primary" size="mini" @click="refresh">刷新源表字段</el-button>
                </div>
                <el-table ref="inputColumnsTable" v-loading="tableLoading" :data="columns" class="table_left" stripe :row-style="{ height: '42px' }" row-key="name" style="font-size: 13px">
                  <el-table-column type="index" label="序号" width="80" align="center">
                    <template #header>
                      序号
                      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                        拖动列头图标可进行手动排序
                        <i slot="reference" class="el-icon-info"></i>
                      </el-popover>
                    </template>
                    <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
                  </el-table-column>
                  <el-table-column prop="name" label="源表字段" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="data_type" label="字段类型" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.data_type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span>{{ scope.row.columnComment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="80" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" @click="delData(scope.row, scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="100" align="center" class-name="table-func" fixed="right">
                    <template slot-scope="scope">
                      <func-icon v-if="scope.$index < columns.length && scope.$index < columns_right.length" :showicon="false"></func-icon>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="11">
                <div class="mb10">
                  <el-button type="primary" size="mini" @click="showOutput = true">添加</el-button>
                  <el-select v-show="showOutput" v-model="outputField" placeholder="在当前选中表中选择字段" size="mini" @change="addOutput">
                    <el-option v-for="item in outputFieldList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
                  </el-select>
                </div>
                <el-table ref="columnsTable" v-loading="tableRightLoading" :data="columns_right" row-key="name" stripe class="table_right" :row-style="{ height: '42px' }" style="font-size: 13px">
                  <el-table-column type="index" label="序号" width="80" align="center">
                    <template #header>
                      序号
                      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                        拖动列头图标可进行手动排序
                        <i slot="reference" class="el-icon-info"></i>
                      </el-popover>
                    </template>
                    <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
                  </el-table-column>
                  <el-table-column prop="name" label="目标表字段" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.name" size="mini" placeholder="填写字段名称"></el-input>
                      <span v-else>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="data_type" label="字段类型" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.data_type" size="mini" placeholder="填写字段类型"></el-input>
                      <span v-else>{{ scope.row.data_type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="字段描述" min-width="100" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.columnComment" size="mini" placeholder="填写字段描述"></el-input>
                      <span v-else>{{ scope.row.columnComment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="80" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" @click="delDataRight(scope.row, scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <el-tabs class="process">
          <el-tab-pane>
            <template #label>
              <span class="label">
                加工逻辑
                <sql-smaple name="clickhouse_sql" class="sqlSmaple"></sql-smaple>
              </span>
            </template>
            <div class="monaco-btns">
              <el-button type="primary" :disabled="checkDisabled" @click="checkSql">校验</el-button>
              <el-button type="primary" @click="formatSql">格式化</el-button>
              <el-button type="primary" @click="clearSql">清除</el-button>
            </div>
            <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
              <span class="require">*</span>
              <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
              <monaco-editor :key="currentStep" ref="monaco" v-model="content" v-loading="checkDisabled"></monaco-editor>
            </div>
            <div v-if="alertMessage" class="mt10">校验结果：</div>
            <el-alert v-if="alertMessage" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!--  :is-show-source="true" -->
      <step-three v-if="currentStep === 2" ref="stepThree" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-output-edit="true" :is-show-input-check="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :region-list="regionList" :content="content" :is-workflow="isWorkflow" :target-source-list="targetSourceList" :name-disabled="nameDisabled" :is-output-edit="true" :is-show-input-check="true" @jumpStep="$event => (currentStep = $event)" />

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
    </el-info>
  </div>
</template>

<script>
import FuncIcon from '@/components/FuncIcon';
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlSmaple from './components/SqlSmaple';
import SqlTips from './components/SqlTips';
import StepThree from './components/StepThree';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, check } from '@/api/task';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import Sortable from 'sortablejs';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SeniorForm,
    MonacoEditor,
    SqlSmaple,
    SqlTips,
    StepThree,
    FuncIcon,
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
    var partitionsRulesFn = (rule, val, callback) => {
      if (!(val[0].name && val[0].value)) {
        callback(new Error('请填写分区标识'));
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
      outputField: '',
      outputFieldList: [],
      showOutput: false,
      inputField: '',
      inputFieldList: [],
      showInput: false,
      btnLoading: false,
      tableLoading: false,
      tableRightLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      content: '',
      ruleForm: {
        invokingStatus: true,
        content: '',
        templateCode: 'Hive2Clickhouse',
        runtimeConfig: {
          sourceRegion: ''
        },
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
        // 输入数据集
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
          //     type: 'clickhouse',
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
        runtimeConfig: {
          sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }]
        },
        inputDataset: [
          {
            metadata: {
              db: [{ required: true, message: '请选择数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        targetSource: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        targetDB: [{ required: true, message: '请选择数据库', trigger: ['blur', 'change'] }],
        targetTable: [{ required: true, message: '请输入表名称', trigger: ['blur', 'change'] }],
        partitions: [
          { required: true, message: '请选择数据源', trigger: ['blur', 'change'] },
          { validator: partitionsRulesFn, trigger: ['blur', 'change'] }
        ]
      },
      dbLoad: false,
      tableLoad: false,
      targetSourceLoad: false,
      targetDbLoad: false,
      targetTablebLoad: false,
      regionList: tools.regionList,
      sourceDbList: [],
      sourceTableList: [],
      targetSourceList: [],
      targetDBList: [],
      targetTableList: [],
      columns: [],
      columns_right: [],
      typeList: ['String', 'Int32', 'Int64', 'Float64', 'Date'],
      seniorForm: {
        existTargetTable: false,
        cluster: '',
        targetSource: '',
        targetDB: '',
        targetTable: '',
        partitions: [{ name: 'datepart', value: '{{ yesterday_ds }}' }],
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
      fullscreen: false,
      canEdit: true,
      nameDisabled: false,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      copyMsg: null,
      isWorkflow: false
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm, { source_columns: this.columns, target_columns: this.columns_right });
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
      if (this.ruleForm.runtimeConfig.sourceRegion === 'sg2') {
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
    },
    currentStep(val) {
      if (val === 1) {
        this.$nextTick(_ => {
          this.rowDrop();
        });
      }
    }
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
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
  mounted() {
    this.rowDrop();
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
    // 格式化字段
    formatType(type) {
      let res = type;
      switch (type) {
        case 'string' || 'STRING':
          res = 'String';
          break;
        case 'int' || 'INT':
          res = 'Int32';
          break;
        case 'double' || 'DOUBLE':
          res = 'Float64';
          break;
        case 'tinyint' || 'TINYINT':
          res = 'Int8';
          break;
        case 'float' || 'FLOAT':
          res = 'Float32';
          break;
      }
      return res;
    },
    // 元数据更改  sql更改
    columnsChange(val) {
      let tableNamesStr = '';
      val.forEach((item, index, arr) => {
        const end = index === arr.length - 1 ? '' : ',\n';
        tableNamesStr += item.name + end;
      });
      this.content = `/* =====DEMO===== */

--注意时间变量和as转换,具体可查看"提示"
SELECT
  ${tableNamesStr}
FROM
${this.ruleForm.inputDataset[0].metadata.db}.${this.ruleForm.inputDataset[0].metadata.table}
WHERE
  dt = '{{ yesterday_ds_nodash }}'`;
      this.$refs.monaco?.setCode(this.content);
      this.$nextTick(() => {
        this.formatSql();
      });
    },
    // 自定义建表状态
    customTanleChange(type) {
      this.seniorForm.existTargetTable = type;
      this.seniorForm.targetTable = type ? (this.ruleForm.inputDataset[0].metadata.table ? 'datacake_' + this.ruleForm.inputDataset[0].metadata.table : '') : '';
      if (type) {
        if (this.columns.length > 0) {
          this.columns_right = this.columns.map(item => {
            return {
              ...item,
              data_type: this.formatType(item.data_type),
              isAdd: true
            };
          });
        }
      } else {
        this.seniorForm.cluster = '';
        this.columns_right = [];
      }
    },
    // 添加分区信息
    addPartitions() {
      if (this.disabled) return;
      this.seniorForm.partitions.push({
        name: '',
        value: ''
      });
    },
    // 删除分区信息
    delPartitions(index) {
      if (this.disabled) return;
      this.seniorForm.partitions.splice(index, 1);
    },
    // 刷新原表字段
    refresh() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const table = this.ruleForm.inputDataset[0].metadata.table;
          this.getColumns(table);
        }
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
      if (typeof this.seniorForm.partitions === 'string') {
        const res = [];
        this.seniorForm.partitions.split(',').forEach(item => {
          const itemList = item.split('=');
          res.push({ name: itemList[0], value: itemList.slice(1).join('=') });
        });
        this.seniorForm.partitions = res;
      }
      if (this.seniorForm.cluster) {
        this.seniorForm.existTargetTable = true;
        this.seniorForm.targetTable = runtimeConfig.targetTable;
      }
      this.columns_right = runtimeConfig.columns;
      this.columns = runtimeConfig.sourceColumns || [];
      // 兼容旧数据问题
      if (!runtimeConfig.sourceColumns) {
        this.columns = runtimeConfig.columns;
        this.columns_right = [];
        this.$nextTick(() => {
          this.hoseTableChange(this.seniorForm.targetTable);
        });
      }
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.ruleForm.content = data.content;
      this.$set(this.ruleForm, 'online', data.online);
      this.ruleForm.runtimeConfig.sourceRegion = runtimeConfig.sourceRegion;
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      this.content = decodeURIComponent(window.atob(data.content));
      this.$refs.monaco && this.$refs.monaco.setCode(this.content);
      // new Promise((resolve, reject) => {
      //   this.changeRegion(this.ruleForm.runtimeConfig.sourceRegion, 'init', resolve);
      // }).then((data) => {
      //   this.changeDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      //   this.changeTargetSource(this.seniorForm.targetSource, 'init')
      //   this.changeTargetDB(this.seniorForm.targetDB, 'init')
      // })
      this.changeRegion(this.ruleForm.runtimeConfig.sourceRegion, 'init');
      this.changeDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      this.changeTargetSource(this.seniorForm.targetSource, 'init');
      // this.changeTargetDB(this.seniorForm.targetDB, 'init');
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
    rowDrop() {
      const el = this.$refs.inputColumnsTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.columns.splice(evt.oldIndex, 1)[0];
          this.columns.splice(evt.newIndex, 0, targetRow);
        }
      });
      const el1 = this.$refs.columnsTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable1 = Sortable.create(el1, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.columns_right.splice(evt.oldIndex, 1)[0];
          this.columns_right.splice(evt.newIndex, 0, targetRow);
          this.isMatched = false;
        }
      });
    },
    changeRegion(value, name, resolve) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
        this.seniorForm.targetSource = '';
        this.seniorForm.targetDB = '';
        this.seniorForm.targetTable = '';
      }
      this.sourceDbList = [];
      this.dbLoad = true;
      this.targetSourceList = [];
      this.targetSourceLoad = true;
      Promise.allSettled([
        getDataSetList({
          region: value,
          type: 'hive',
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Clickhouse'
        }),
        getDataSetList({
          region: value,
          type: 'clickhouse',
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Clickhouse'
        })
      ]).then(result => {
        if (result[0].status === 'fulfilled') {
          this.sourceDbList = result[0].value.data.data;
        }
        if (result[1].status === 'fulfilled') {
          this.targetSourceList = result[1].value.data.data;
        }
        this.dbLoad = false;
        this.targetSourceLoad = false;
        resolve && resolve();
      });
    },
    changeDb(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      // const selectedObj = this.sourceDbList.find(item => item.name === value);
      // if (!selectedObj) return;
      this.tableLoad = true;
      getDataSetList({
        region: this.ruleForm.runtimeConfig.sourceRegion,
        type: 'hive',
        db: value,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Clickhouse'
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.sourceTableList = data.data;
        }
        this.tableLoad = false;
      });
    },
    hoseTableChange(table) {
      if (table) {
        this.tableRightLoading = true;
        const data = {
          actorId: this.seniorForm.targetSource,
          region: this.ruleForm.runtimeConfig.sourceRegion,
          type: 'clickhouse',
          db: this.seniorForm.targetDB,
          table,
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Clickhouse'
        };
        getDataSetList(data)
          .then(res => {
            const data = res.data;
            const columns = data.columns || [];
            this.columns_right = columns.map(item => {
              return {
                ...item,
                columnComment: item.comment,
                isAdd: false
              };
            });
          })
          .finally(() => {
            this.tableRightLoading = false;
          });
      }
    },
    changeTable(value) {
      const selectedObj = this.sourceTableList.find(item => item.name === value);
      if (selectedObj) {
        this.getColumns(value);
        this.ruleForm.inputDataset[0].guid = selectedObj.guid;
        this.ruleForm.inputDataset[0].id = selectedObj.qualifiedName;
      } else {
        this.ruleForm.inputDataset[0].guid = '';
        this.ruleForm.inputDataset[0].id = '';
      }
    },
    getColumns(table) {
      this.tableLoading = true;
      getDataSetList({
        region: this.ruleForm.runtimeConfig.sourceRegion,
        type: 'hive',
        db: this.ruleForm.inputDataset[0].metadata.db,
        table: table,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Clickhouse'
      })
        .then(res => {
          const data = res.data;
          let tableNamesStr = '';
          if (data && data.columns) {
            this.columns = data.columns.map((item, index, arr) => {
              const end = index === arr.length - 1 ? '' : ',\n';
              tableNamesStr += item.name + end;
              return {
                name: item.name,
                data_type: item.type,
                columnName: item.name,
                columnType: this.typeList.find(ele => ele === item.type.toUpperCase()) || this.typeList[0],
                columnComment: item.comment,
                func: ''
              };
            });
          }
          // 编辑器内容更改
          this.content = `/* =====DEMO===== */

        --注意时间变量和as转换,具体可查看"提示"
        SELECT
          ${tableNamesStr}
        FROM
        ${this.ruleForm.inputDataset[0].metadata.db}.${this.ruleForm.inputDataset[0].metadata.table}
        WHERE
          dt = '{{ yesterday_ds_nodash }}'`;
          this.$refs.monaco.setCode(this.content);
          this.$nextTick(() => {
            this.formatSql();
          });
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    changeTargetSource(value, name) {
      if (!name) {
        this.seniorForm.targetDB = '';
      }
      const selectedObj = this.targetSourceList.find(item => item.actorId === value);
      if (selectedObj) {
        this.targetDBList = [{ name: selectedObj.db }];
        this.seniorForm.targetDB = selectedObj.db;
      }
      this.targetTablebLoad = true;
      getDataSetList({
        region: this.ruleForm.runtimeConfig.sourceRegion,
        type: 'clickhouse',
        actorId: this.seniorForm.targetSource,
        db: this.seniorForm.targetDB,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Clickhouse'
      }).then(res => {
        const data = res.data;
        if (data) {
          this.targetTableList = data.data;
        }
        this.targetTablebLoad = false;
      });
    },
    changeTargetDB(value, name) {
      if (!name) {
        this.seniorForm.targetTable = '';
      }
      this.targetTablebLoad = true;
      getDataSetList({
        region: this.ruleForm.runtimeConfig.sourceRegion,
        type: 'clickhouse',
        datasource: this.seniorForm.targetSource,
        db: value
      }).then(res => {
        const data = res.data;
        if (data) {
          this.targetTableList = data.data;
        }
        this.targetTablebLoad = false;
      });
    },
    checkSql() {
      if (!this.ruleForm.runtimeConfig.sourceRegion) {
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
          ...this.ruleForm,
          runtimeConfig: {
            ...this.seniorForm,
            ...this.ruleForm.runtimeConfig,
            columns: this.columns_right.map(item => {
              return {
                ...item,
                columnName: item.name,
                columnType: item.data_type
              };
            })
          }
        })
          .then(res => {
            const data = res.data;
            const msg = filters.dataTime(new Date()) + '\n' + data + '\n';
            // this.alertMessage = msg + this.alertMessage;
            this.alertMessage = msg;
            if (data.indexOf('正常') !== -1) {
              this.alertType = 'success';
            } else {
              this.alertType = 'error';
            }
            this.$nextTick(() => {
              window.scrollTo(0, 200);
            });
          })
          .finally(() => {
            this.checkDisabled = false;
          });
      }
    },
    formatSql() {
      this.$refs.monaco?.formatSql();
    },
    clearSql() {
      this.$refs.monaco.setCode('');
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    addInput(row) {
      this.columns.push(row);
      this.columnsChange(this.columns);
      this.showInput = false;
      this.inputField = '';
      this.inputFieldList.splice(
        this.inputFieldList.findIndex(item => item.name === row.name),
        1
      );
    },
    addOutput(row) {
      this.columns_right.push(row);
      this.showOutput = false;
      this.outputField = '';
      this.outputFieldList.splice(
        this.outputFieldList.findIndex(item => item.name === row.name),
        1
      );
    },
    delDataRight(row, index) {
      this.outputFieldList.push(row);
      this.columns_right.splice(index, 1);
    },
    delData(row, index) {
      this.inputFieldList.push(row);
      this.columns.splice(index, 1);
      this.columnsChange(this.columns);
    },
    checkForm(form) {
      return new Promise((resolve, reject) => {
        const dd = form === 'seniorForm' && this.$refs.seniorForm.$refs[form] ? this.$refs.seniorForm.$refs[form] : this.$refs[form];
        dd.validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
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
        const list = [];
        list.push(this.checkForm('form'), this.checkForm('seniorForm1'));
        if (this.$refs.seniorForm) {
          list.push(this.checkForm('seniorForm'));
        }
        Promise.all(list)
          .then(() => {
            if (this.content) {
              this.ruleForm.inputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              // this.ruleForm.outputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              this.currentStep++;
              this.ruleForm.content = this.content;
            } else {
              this.$message.error('请输入SQL');
            }
          })
          .catch(() => {
            this.$message.error('请完善信息！');
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
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        const params = {
          ...tools.copyFn(this.ruleForm),
          runtimeConfig: {
            ...this.seniorForm,
            ...this.ruleForm.runtimeConfig,
            columns: this.columns_right.map(item => {
              return {
                ...item,
                columnName: item.name,
                columnType: item.data_type
              };
            }),
            sourceColumns: this.columns,
            cost: this.ruleForm.cost
          }
        };
        delete params.cost;
        params.inputDataset.forEach(item => {
          item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
        });
        // if (this.copyId) {
        //   params.outputDataset = [];
        // } else {
        //   params.outputDataset.forEach(item => {
        //     if (item.sourceTableList) {
        //       delete item.sourceTableList;
        //     }
        //     if (item.granularityList) {
        //       delete item.granularityList;
        //     }
        //     if (item.checkPathList) {
        //       delete item.checkPathList;
        //     }
        //   });
        // }
        params.outputDataset.forEach(item => {
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

        const { targetSource } = this.seniorForm;
        const findObj = this.targetSourceList.find(item => item.actorId === targetSource);
        if (findObj) {
          const { parameters } = findObj;
          const obj = {
            dbPassword: parameters.password,
            dbUser: parameters.username,
            connectionUrl: parameters.url
          };
          // params.runtimeConfig = { ...params.runtimeConfig, ...obj };
          Object.assign(params.runtimeConfig, obj);
        }
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
    padding: 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .process {
      ::v-deep .el-tabs__header {
        padding-top: 15px;
      }
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
          top: -55px;
        }
      }
    }
    .trans_table {
      overflow: auto;
      .tab_content {
        min-width: 1000px;
        .el-table {
          ::v-deep .cell {
            white-space: nowrap;
          }
        }
      }
    }
    .open-btn {
      position: absolute;
      right: -5px;
      // top: 15px;
      z-index: 2;
    }
    .inline-form {
      background: #fff;
      border: 0;
      margin-bottom: 0;
      padding: 0;
      width: calc(100% - 300px);
      .el-input,
      .el-select {
        width: 214px;
      }
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 70%;
        margin: 0 auto 18px;
      }
      .el-cascader,
      .el-select,
      .el-input {
        width: 100%;
      }
      .quickCreateTable {
        position: absolute;
        right: 0;
      }
      .partitions {
        .title_tips {
          display: flex;
          align-content: center;
          justify-content: space-between;
        }
        .partitions_item {
          &:not(:last-child) {
            margin-bottom: 10px;
          }
          display: flex;
          align-items: center;
          .name {
            max-width: 150px;
          }
          .value {
            margin-left: 20px;
            flex: 1;
          }
          i {
            margin-left: 10px;
            color: $c-primary;
            font-size: 22px;
            cursor: pointer;
          }
        }
      }
    }
    .monaco-editor-wrap {
      // height: calc(100vh - 430px);
      height: 300px;
      position: relative;
      // margin-top: 50px;
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
</style>
