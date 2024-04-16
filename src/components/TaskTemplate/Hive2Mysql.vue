<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">{{ $t('task.highSetting') }}</el-button>
        <el-form ref="form" class="ruleForm" :rules="rules" :model="ruleForm" label-width="150px">
          <el-form-item :label="$t('task.region')" prop="runtimeConfig.sourceRegion">
            <template #label>
              <span>{{ $t('task.region') }}</span>
              <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="ruleForm.runtimeConfig.sourceRegion" :placeholder="$t('task.dbTip2')" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-tabs>
            <el-tab-pane :label="$t('task.stepView8')">
              <el-form-item :label="$t('task.stepThree62')" prop="inputDataset[0].metadata.db">
                <el-select
                  v-model="ruleForm.inputDataset[0].metadata.db"
                  :title="ruleForm.inputDataset[0].metadata.db"
                  :allow-create="ruleForm.runtimeConfig.sourceRegion === 'sg1'"
                  default-first-option
                  :loading="dbLoad"
                  :placeholder="$t('task.stepThree63')"
                  clearable
                  filterable
                  @keyup.ctrl.67.native="copyHandler(ruleForm.inputDataset[0].metadata.db)"
                  @keydown.meta.67.native="copyHandler(ruleForm.inputDataset[0].metadata.db)"
                  @change="changeDb"
                >
                  <el-option v-for="item in sourceDbList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('task.stepThree64')" prop="inputDataset[0].metadata.table">
                <el-select
                  v-model="ruleForm.inputDataset[0].metadata.table"
                  :title="ruleForm.inputDataset[0].metadata.table"
                  :allow-create="ruleForm.runtimeConfig.sourceRegion === 'sg1'"
                  default-first-option
                  :loading="tableLoad"
                  :placeholder="$t('task.stepThree65')"
                  filterable
                  clearable
                  @keyup.ctrl.67.native="copyHandler(ruleForm.inputDataset[0].metadata.table)"
                  @keydown.meta.67.native="copyHandler(ruleForm.inputDataset[0].metadata.table)"
                  @change="changeTable"
                >
                  <el-option v-for="item in sourceTableList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <!-- <el-form-item :label="$t('task.DM3')">
                <el-input v-model="seniorForm.partitions" :title="seniorForm.partitions" :placeholder="$t('task.DM2')" clearable></el-input>
                <sql-tips></sql-tips>
              </el-form-item> -->
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <el-tabs>
          <el-tab-pane :label="$t('task.kfk13')">
            <el-form ref="seniorForm1" class="ruleForm" :rules="rules" :model="seniorForm" label-width="150px">
              <el-form-item :label="$t('task.stepView34')" prop="targetSource">
                <el-select v-model="seniorForm.targetSource" :title="seniorForm.targetSource" :placeholder="$t('task.dbValid3')" :loading="targetSourceLoad" clearable @change="changeTargetSource">
                  <el-option v-for="item in targetSourceList" :key="item.actorId" :value="item.actorId" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('task.stepView35')" prop="targetDB">
                <el-select v-model="seniorForm.targetDB" :title="seniorForm.targetDB" :placeholder="$t('task.stepThree63')" :loading="targetDbLoad" clearable filterable @keyup.ctrl.67.native="copyHandler(seniorForm.targetDB)" @keydown.meta.67.native="copyHandler(seniorForm.targetDB)">
                  <el-option v-for="item in targetDBList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('task.stepView36')" prop="targetTable" style="position: relative; margin-bottom: 30px">
                <!-- <el-input v-model="seniorForm.targetTable" :title="seniorForm.targetTable" placeholder="请输入表名称" clearable></el-input> -->
                <el-select
                  v-if="!seniorForm.existTargetTable"
                  v-model="seniorForm.targetTable"
                  :title="seniorForm.targetTable"
                  filterable
                  :placeholder="$t('task.stepThree65')"
                  :loading="targetTablebLoad"
                  clearable
                  @keyup.ctrl.67.native="copyHandler(seniorForm.targetTable)"
                  @keydown.meta.67.native="copyHandler(seniorForm.targetTable)"
                  @change="hoseTableChange"
                >
                  <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"> <ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
                <div v-else class="customTanle">
                  <el-input v-model="seniorForm.targetTable" :title="$t('task.HM1')" :placeholder="$t('task.HM1')"></el-input>
                </div>
                <div class="quickCreateTable">
                  <el-button v-if="!seniorForm.existTargetTable" type="text" icon="el-icon-circle-plus-outline" @click="customTanleChange(true)">{{ $t('task.HM2') }}</el-button>
                  <el-button v-else type="text" @click="customTanleChange(false)">{{ $t('task.HM3') }}</el-button>
                </div>
              </el-form-item>
              <el-form-item class="partitions" prop="partitions">
                <template #label>
                  <span>{{ $t('task.DM3') }}</span>
                  <el-tooltip class="item" effect="dark" :content="$t('task.HM4')" placement="top">
                    <i class="el-icon-warning-outline" style="cursor: pointer"></i>
                  </el-tooltip>
                </template>
                <!-- <div class="title_tips">
                  <div class="title">
                    <i class="el-icon-warning-outline"></i> {{$t('task.HC4')}}
                    <el-button type="text" icon="el-icon-refresh-right">{{$t('task.HC5')}}</el-button>
                  </div>
                </div> -->
                <!-- <div class="partitions_item">
                  <div class="name">{{$t('task.HC6')}}</div>
                  <div class="value" style="margin-left: 150px">{{$t('task.dbContent17')}}</div>
                </div> -->
                <div v-for="(item, index) in seniorForm.partitions" :key="index" class="partitions_item">
                  <el-input v-model="item.name" :placeholder="$t('task.dbContent16')" clearable class="name"></el-input>
                  <span class="mark">=</span>
                  <el-input v-model="item.value" :placeholder="$t('task.dbContent17')" clearable class="value"></el-input>
                  <!-- <i v-if="index === 0" class="el-icon-circle-plus-outline" @click="addPartitions"></i>
                  <i v-else class="el-icon-remove-outline" @click="delPartitions(index)"></i> -->
                </div>
                <span class="tips" @click="handelInfo('jinjia', $t('task.taskEditor6'))">{{ $t('task.taskEditor6') }}</span>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <el-tabs>
          <el-tab-pane :label="$t('task.tempTable1')" class="trans_table">
            <el-row class="tab_content">
              <el-col :span="13">
                <div class="mb10">
                  <el-button type="primary" size="mini" @click="showInput = true">{{ $t('task.addText') }}</el-button>
                  <el-select v-show="showInput" v-model="inputField" :placeholder="$t('task.dbTip17')" size="mini" @change="addInput">
                    <el-option v-for="item in inputFieldList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
                  </el-select>
                  <el-button type="primary" size="mini" @click="refresh">{{ $t('task.tempTable3') }}</el-button>
                </div>
                <el-table ref="inputColumnsTable" v-loading="tableLoading" :data="columns" row-key="name" stripe :row-style="{ height: '42px' }" style="font-size: 13px">
                  <el-table-column type="index" :label="$t('task.tempTable5')" width="80" align="center">
                    <template #header>
                      {{ $t('task.tempTable5') }}
                      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                        {{ $t('task.dbTip18') }}
                        <i slot="reference" class="el-icon-info"></i>
                      </el-popover>
                    </template>
                    <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
                  </el-table-column>
                  <el-table-column prop="name" :label="$t('task.tempTable6')" min-width="110" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="data_type" :label="$t('task.tempTable8')" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.data_type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('task.tempTable9')" min-width="100" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span>{{ scope.row.columnComment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('task.tempTable10')" width="70" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" @click="delData(scope.row, scope.$index)">{{ $t('task.taskDelet') }}</el-button>
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
                  <el-button type="primary" size="mini" @click="showOutput = true">{{ $t('task.addText') }}</el-button>
                  <el-select v-show="showOutput" v-model="outputField" :placeholder="$t('task.dbTip17')" size="mini" @change="addOutput">
                    <el-option v-for="item in outputFieldList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
                  </el-select>
                </div>
                <el-table ref="columnsTable" v-loading="tableRightLoading" :data="columns_right" row-key="name" stripe :row-style="{ height: '42px' }" style="font-size: 13px">
                  <el-table-column type="index" :label="$t('task.tempTable5')" width="80" align="center">
                    <template #header>
                      {{ $t('task.tempTable5') }}
                      <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                        {{ $t('task.dbTip18') }}
                        <i slot="reference" class="el-icon-info"></i>
                      </el-popover>
                    </template>
                    <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
                  </el-table-column>
                  <el-table-column prop="name" :label="$t('task.tempTable7')" min-width="120" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.name" size="mini" :placeholder="$t('task.stepView4')"></el-input>
                      <span v-else>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="data_type" :label="$t('task.tempTable8')" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.data_type" size="mini" :placeholder="$t('task.tempTable8')"></el-input>
                      <span v-else>{{ scope.row.data_type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('task.tempTable9')" min-width="100" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.columnComment" size="mini" :placeholder="$t('task.tempTable9')"></el-input>
                      <span v-else>{{ scope.row.columnComment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('task.tempTable10')" width="70" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" @click="delDataRight(scope.row, scope.$index)">{{ $t('task.taskDelet') }}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <!-- <el-tabs class="process">
          <div>
            <div class="editor_tool">
              <div class="editor-btn">
                <sql-smaple name="mysql_sql" class="sqlSmaple"></sql-smaple>
                <span>加工逻辑</span>
              </div>
              <div class="editor-btn" @click="checkSql">
                <i class="el-icon-success"></i>
                校验
              </div>
              <div class="editor-btn" @click="formatSql">
                <i class="el-icon-s-open"></i>
                格式化
              </div>
              <div class="editor-btn" @click="clearSql">
                <i class="el-icon-delete"></i>
                清除
              </div>
            </div>
            <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
              <span class="require">*</span>
              <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? $t('task.commonSmall') : $t('task.commonBig')" @click="switchFullscreen"></i>
              <monaco-editor :key="currentStep" ref="monaco" v-model="content" v-loading="checkDisabled" :rules="monacoRules" class="editor"></monaco-editor>
              <div class="editor-btn-box">
                <div>数据表</div>
                <div><span class="udf">udf</span>函数</div>
                <div @click="drawerVisible = true">{{$t('task.highSetting')}}</div>
              </div>
            </div>
            <div v-if="alertMessage" class="mt10">校验结果：</div>
            <el-alert v-if="alertMessage" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
          </div>
        </el-tabs> -->
        <TaskEditor ref="monaco" v-model="content" v-loading="checkDisabled" :editor-info="editorInfo" @editorEmit="editorEmit"></TaskEditor>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-output-edit="true" :is-show-input-check="true" :is-show-source="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :content="content"
        :region-list="regionList"
        :target-source-list="targetSourceList"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-source="true"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer :title="$t('task.highSetting')" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :is-edit="isEdit" :code="ruleForm.templateCode" :region="ruleForm.runtimeConfig.sourceRegion" :is-show-mode="isShowMode" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">{{ $t('task.taskCancel1') }}</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">{{ $t('task.kfk36') }}</el-button>
      <!-- <el-button v-if="isShowPublish && currentStep === 2" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? $t('task.kfk20') : copyId ? $t('task.kfk21') : $t('task.kfk22')
      }}</el-button>
      <el-checkbox v-if="isShowPublish && currentStep >= 3" v-model="ruleForm.invokingStatus" class="task-checkbox">{{ $t('task.dbContent23') }}</el-checkbox>
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
import { getDataSetList, check, getEngineList } from '@/api/task';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import Sortable from 'sortablejs';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';
// import editerTipsMixin from '@/utils/editerTipsMixin';
import TaskEditor from './components/TaskEditor.vue';
export default {
  components: {
    StepsHead,
    SeniorForm,
    // MonacoEditor,
    // SqlSmaple,
    TaskEditor,
    SqlTips,
    StepThree,
    FuncIcon,
    EllipsisTooltip,
    ValidParams,
    ViewParams
  },
  // mixins: [editerTipsMixin],
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
      editorInfo: {
        showDragBtn: false,
        showGitPull: false,
        sqlTip: 'mysql_sql',
        alertMessage: '',
        showRightBtn: false,
        editorDataLink: 'iceberg',
        editorDataDb: '',
        region: ''
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
      templateCode: 'Hive2Mysql',
      drawerVisible: false,
      currentStep: 1,
      content: '',
      ruleForm: {
        invokingStatus: true,
        folderName: '',
        content: '',
        templateCode: 'Hive2Mysql',
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
          //     type: 'mysql',
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
          sourceRegion: [{ required: true, message: this.$t('task.chooseRegion'), trigger: ['blur', 'change'] }]
        },
        inputDataset: [
          {
            metadata: {
              db: [{ required: true, message: this.$t('task.stepThree63'), trigger: ['blur', 'change'] }],
              table: [{ required: true, message: this.$t('task.stepThree65'), trigger: ['blur', 'change'] }]
            }
          }
        ],
        targetSource: [{ required: true, message: this.$t('task.dbValid3'), trigger: ['blur', 'change'] }],
        targetDB: [{ required: true, message: this.$t('task.stepThree63'), trigger: ['blur', 'change'] }],
        targetTable: [{ required: true, message: this.$t('task.HM6'), trigger: ['blur', 'change'] }],
        partitions: [
          { required: true, message: this.$t('task.dbValid3'), trigger: ['blur', 'change'] },
          { validator: this.partitionsRulesFn, trigger: ['blur', 'change'] }
        ]
      },
      engineList: {},
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
      typeList: ['VARCHAR(255)', 'TEXT', 'BIGINT', 'DOUBLE', 'TIMESTAMP'],
      seniorForm: {
        existTargetTable: false,
        engineConfig: '',
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
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: ['dingTalk'], notifyCollaborator: false, isChecked: true }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
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
      checkDisabled: false,
      copyMsg: null,
      isWorkflow: false,
      isEdit: false
    };
  },
  computed: {
    // 编辑器提示使用
    editorParams() {
      return {
        region: this.ruleForm.runtimeConfig.sourceRegion || '',
        catalog: 'iceberg'
      };
    },
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
          this.isEdit = true;
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
    },
    'ruleForm.runtimeConfig.sourceRegion'(val) {
      this.editorInfo.region = val;
    }
  },
  created() {
    console.log('---xdf-test---');
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    tools.regionList.then(res => {
      this.regionList = res;
    });
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
    if (!this.isEdit) {
      this.seniorForm.owner = this.$store.getters.userInfo.userId;
    }
    this.rowDrop();
  },
  destroyed() {
    this.copyMsg && this.copyMsg.close();
  },
  methods: {
    partitionsRulesFn(rule, val, callback) {
      if (!(val[0].name && val[0].value)) {
        callback(new Error(this.$t('task.HM5')));
      } else {
        callback();
      }
    },
    editorEmit(type) {
      switch (type) {
        case 'checkSql':
          this.checkSql();
          break;
        case 'clearSql':
          this.clearSql();
          break;
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
    // 格式化字段
    formatType(type) {
      let res = type;
      switch (type) {
        case 'string' || 'STRING':
          res = 'varchar(255)';
          break;
        case 'int' || 'INT':
          res = 'int';
          break;
        case 'double' || 'DOUBLE':
          res = 'double';
          break;
        case 'tinyint' || 'TINYINT':
          res = 'int';
          break;
        case 'smallint' || 'SMALLINT':
          res = 'int';
          break;
        case 'bigint' || 'BIGINT':
          res = 'bigint';
          break;
        case 'float' || 'FLOAT':
          res = 'float';
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
${this.$t('task.HM7')}
  ${tableNamesStr},\n
  '${this.seniorForm.partitions[0].value}' AS ${this.seniorForm.partitions[0].name}
FROM
${this.ruleForm.inputDataset[0].metadata.db}.${this.ruleForm.inputDataset[0].metadata.table}
WHERE
  dt = '{{ yesterday_ds_nodash }}'`;
      this.$refs.monaco.getMonaco()?.setCode(this.content);
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
        this.outputFieldList = [];
      } else {
        this.columns_right = [];
      }
    },
    // 添加分区信息
    addPartitions() {
      this.seniorForm.partitions.push({
        name: '',
        value: ''
      });
    },
    // 删除分区信息
    delPartitions(index) {
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
    async getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      this.seniorForm.existTargetTable = runtimeConfig.existTargetTable;
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      if (typeof this.seniorForm.partitions === 'string') {
        const partitionsList = this.seniorForm.partitions.split('=');
        this.seniorForm.partitions = [{ name: partitionsList[0], value: partitionsList[1] }];
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
      this.$nextTick(() => {
        this.$refs.monaco && this.$refs.monaco.getMonaco().setCode(this.content);
      });
      await this.changeRegion(this.ruleForm.runtimeConfig.sourceRegion, 'init');
      this.changeDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      this.changeTargetSource(this.seniorForm.targetSource, 'init');
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
        setData: dataTransfer => {
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
        setData: dataTransfer => {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.columns_right.splice(evt.oldIndex, 1)[0];
          this.columns_right.splice(evt.newIndex, 0, targetRow);
        }
      });
    },
    async changeRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
        this.seniorForm.targetSource = '';
        this.seniorForm.targetDB = '';
        this.seniorForm.targetTable = '';
      }
      this.targetSourceList = [];
      this.targetSourceLoad = true;
      getDataSetList({
        region: value,
        type: 'mysql',
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Mysql',
        owner: this.seniorForm.owner
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.targetSourceList = data.data;
        }
        this.targetSourceLoad = false;
      });
      this.sourceDbList = [];
      this.dbLoad = true;
      await getDataSetList({
        region: value,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Mysql'
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.sourceDbList = data.data;
        }
        this.dbLoad = false;
      });
      return Promise.resolve();
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
          region: this.ruleForm.runtimeConfig.sourceRegion,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Mysql'
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.sourceTableList = data.data;
          }
          this.tableLoad = false;
        });
      }
    },
    hoseTableChange(table) {
      if (table) {
        this.tableRightLoading = true;
        const data = {
          actorId: this.seniorForm.targetSource,
          region: this.ruleForm.runtimeConfig.sourceRegion,
          type: 'mysql',
          db: this.seniorForm.targetDB,
          table,
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Mysql',
          owner: this.seniorForm.owner
        };
        getDataSetList(data)
          .then(res => {
            const data = res.data;
            const columns = data.columns || [];
            this.columns_right = columns.map(item => {
              if (item.data_type === 'varchar') item.data_type = item.data_type + `(${item.size})`;
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
        templateCode: 'Hive2Mysql'
      }).then(res => {
        const data = res.data;
        if (data) {
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
                columnComment: item.comment
              };
            });
          }
          // 编辑器内容更改
          this.content = `/* =====DEMO===== */

${this.$t('task.HM8')}
SELECT
  ${tableNamesStr},\n
  '${this.seniorForm.partitions[0].value}' AS ${this.seniorForm.partitions[0].name}
FROM
${this.ruleForm.inputDataset[0].metadata.db}.${this.ruleForm.inputDataset[0].metadata.table}
WHERE
  dt = '{{ yesterday_ds_nodash }}'`;
          this.$refs.monaco.getMonaco().setCode(this.content);
          this.$nextTick(() => {
            this.formatSql();
          });
        } else {
          this.columns = [];
        }
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
        type: 'mysql',
        actorId: this.seniorForm.targetSource,
        db: this.seniorForm.targetDB,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Mysql',
        owner: this.seniorForm.owner
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.targetTableList = data.data;
        }
        this.targetTablebLoad = false;
      });
    },
    checkSql() {
      if (!this.ruleForm.runtimeConfig.sourceRegion) {
        this.$message({
          type: 'warning',
          message: this.$t('task.dbContent5')
        });
        return;
      }
      if (!this.content) {
        this.$message({
          type: 'warning',
          message: this.$t('task.kfk35')
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
            this.editorInfo.alertMessage = msg;
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
      this.$refs.monaco.getMonaco()?.formatSql();
    },
    clearSql() {
      this.$refs.monaco.getMonaco().setCode('');
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
    getEngine() {
      getEngineList({
        region: this.ruleForm.runtimeConfig.sourceRegion,
        template: this.ruleForm.templateCode
      }).then(res => {
        const data = res.data;
        const engineObj = data;
        for (const key in engineObj) {
          // 设置默认值
          if (!this.isEdit) {
            engineObj[key].forEach(item => {
              if (item.isdefault) {
                this.seniorForm.engineConfig = `${item.type}_${item.version}`;
              }
            });
          }
        }
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
              // 新增设置默认值
              if (!this.isEdit && !this.seniorForm.engineConfig) {
                // this.getEngine();
              }
              this.currentStep++;
            } else {
              this.$message.error(this.$t('task.kfk35'));
            }
          })
          .catch(() => {
            this.$message.error(this.$t('task.HM9'));
          });
      } else if (this.currentStep === 2 && this.source === 'task') {
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
          this.$message.error(this.$t('task.dbTip15'));
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
          this.$message.warning(this.$t('task.dbTip16'));
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
          if (item.granularityList) {
            delete item.granularityList;
          }
          if (item.checkPathList) {
            delete item.checkPathList;
          }
          delete item.isExternal;
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
      margin-top: 15px;
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
          display: flex;
          align-items: center;
          .editor-btn {
            cursor: pointer;
            margin-right: 15px;
            display: flex;
            align-items: center;
            .el-icon-success,
            .el-icon-s-open,
            .el-icon-delete,
            .el-icon-download {
              color: #108ee9;
              font-size: $global-font-size-16;
              cursor: pointer;
            }
          }
        }
      }
      .editor {
        width: calc(100% - 50px);
      }
      .editor-btn-box {
        height: 100%;
        width: 50px;
        writing-mode: tb-rl;
        position: absolute;
        right: 0;
        top: 0;
        line-height: 50px;
        text-align: center;
        display: flex;
        background-color: #f4f6f9;
        div {
          height: 100px;
          border-bottom: 1px solid #ccc;
          cursor: pointer;
          .udf {
            writing-mode: initial;
            line-height: 15px;
          }
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
      .customTanle {
        .el-button {
          padding: 7px 0px;
          font-size: 18px;
          vertical-align: middle;
        }
      }
      .partitions {
        position: relative;
        .tips {
          position: absolute;
          top: 0;
          right: -100px;
        }
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
            // margin-left: 20px;
            flex: 1;
          }
          .mark {
            margin: 0 20px;
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
      right: 65px;
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
.option-icon {
  height: 34px;
  vertical-align: middle;
  position: relative;
  left: -10px;
}
</style>
