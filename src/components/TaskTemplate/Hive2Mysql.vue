<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :rules="rules" :model="ruleForm" label-width="140px">
          <!-- <el-form-item label="区域" prop="runtimeConfig.sourceRegion">
            <template #label>
              <span>区域</span>
              <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="ruleForm.runtimeConfig.sourceRegion" placeholder="请选择区域" clearable @change="changeRegion">
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item> -->
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
            <el-radio-group v-model="ruleForm.executeMode">
              <el-radio label="local">本地模式</el-radio>
              <el-radio label="distribution" :disabled="true">分布式模式</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="数据源名称" prop="sourceId" class="quick-item">
                <el-select v-model="ruleForm.sourceId" placeholder="数据源名称" filterable clearable>
                  <el-option v-for="item in sourceList" :key="item.sourceId" :label="item.name" :value="item.sourceId"></el-option>
                </el-select>
                <!-- <span v-if="!ruleForm.runtimeConfig.sourceRegion" class="tips">* 请先选择区域</span> -->
              </el-form-item>
              <el-form-item label="数据库" prop="inputDataset[0].metadata.db">
                <el-select
                  v-model="ruleForm.inputDataset[0].metadata.db"
                  :title="ruleForm.inputDataset[0].metadata.db"
                  :allow-create="ruleForm.runtimeConfig.sourceRegion === 'sg1'"
                  default-first-option
                  :loading="dbLoad"
                  placeholder="请选择数据库"
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
                  :allow-create="ruleForm.runtimeConfig.sourceRegion === 'sg1'"
                  default-first-option
                  :loading="tableLoad"
                  placeholder="请选择表名称"
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

            <el-form-item class="partitionsBox">
              <template #label>
                <!-- <span>分区信息</span> -->
                <el-tooltip class="item" effect="dark" content="sql处理结果集默认以“overwrite”的方式往mysql表写入，此字段标识了mysql表相应地会被清空的数据" placement="top">
                  <i class="el-icon-warning-outline" style="cursor: pointer"></i>
                </el-tooltip>
              </template>

              <div v-for="(item, index) in seniorForm.partitions" :key="index" class="partitions_item">
                <el-input v-model="item.name" placeholder="分区名称" clearable class="name"></el-input>
                <span class="mark">=</span>
                <el-input v-model="item.value" placeholder="分区内容" clearable class="value"></el-input>
                <i v-if="seniorForm.partitions.length > 1" class="el-icon-delete" @click="deletePartitions(index)"></i>
                <i v-if="index === seniorForm.partitions.length - 1 && seniorForm.partitions.length < 3" class="el-icon-plus" :class="{ onlyAdd: seniorForm.partitions.length === 1 }" @click="addPartitions"></i>
              </div>
              <span class="tips partitions-tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
            </el-form-item>
          </el-tabs>
        </el-form>
        <el-tabs>
          <el-tab-pane label="目标表">
            <el-form ref="seniorForm1" class="ruleForm" :rules="rules" :model="seniorForm" label-width="140px">
              <el-form-item label="Mysql数据源" prop="destinationId">
                <el-select v-model="seniorForm.destinationId" :title="seniorForm.destinationId" placeholder="请选择数据源" :loading="targetSourceLoad" clearable @change="changeTargetSource">
                  <el-option v-for="item in targetSourceList" :key="item.actorId" :value="item.actorId" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Mysql数据库" prop="targetDB">
                <el-select v-model="seniorForm.targetDB" :title="seniorForm.targetDB" placeholder="请选择数据库" :loading="targetDbLoad" clearable filterable @keyup.ctrl.67.native="copyHandler(seniorForm.targetDB)" @keydown.meta.67.native="copyHandler(seniorForm.targetDB)">
                  <el-option v-for="item in targetDBList" :key="item.name" :value="item.name" :label="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Mysql表名称" prop="targetTable" style="position: relative; margin-bottom: 30px">
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
                  <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"> <ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
                <div v-else class="customTanle">
                  <el-input v-model="seniorForm.targetTable" title="只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符" placeholder="只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符"></el-input>
                </div>
                <div class="quickCreateTable">
                  <el-button v-if="!seniorForm.existTargetTable" disabled type="text" icon="el-icon-circle-plus-outline" @click="customTanleChange(true)">快速建表</el-button>
                  <el-button v-else type="text" @click="customTanleChange(false)">返 回</el-button>
                </div>
              </el-form-item>
              <el-form-item class="partitionsBox" prop="targetPartition">
                <template #label>
                  <span>分区信息</span>
                  <el-tooltip class="item" effect="dark" content="sql处理结果集默认以“overwrite”的方式往mysql表写入，此字段标识了mysql表相应地会被清空的数据" placement="top">
                    <i class="el-icon-warning-outline" style="cursor: pointer"></i>
                  </el-tooltip>
                </template>
                <div v-for="(item, index) in seniorForm.targetPartition" :key="index" class="partitions_item">
                  <el-input v-model="item.name" placeholder="分区名称" clearable class="name"></el-input>
                  <span class="mark">=</span>
                  <el-input v-model="item.value" placeholder="分区内容" clearable class="value"></el-input>
                </div>
                <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
              </el-form-item>
              <el-form-item class="partitionsBox" label="preSql">
                <div v-for="(item, index) in preList" :key="index" class="tags mb10 partitions_item">
                  <el-input v-model="item.value" placeholder="请输入Key" class="tag-item"></el-input>
                  <i v-if="preList.length > 1" class="el-icon-delete" @click="deletePreSql(index)"></i>
                  <i v-if="index === preList.length - 1 && preList.length < 5" class="el-icon-plus" :class="{ onlyAdd: preList.length === 1 }" @click="addPreSql"></i>
                </div>
              </el-form-item>
              <el-form-item class="partitionsBox" label="postSql">
                <div v-for="(item, index) in postList" :key="index" class="tags mb10 partitions_item">
                  <el-input v-model="item.value" placeholder="请输入Key" class="tag-item"></el-input>
                  <i v-if="postList.length > 1" class="el-icon-delete" @click="deletePostSql(index)"></i>
                  <i v-if="index === postList.length - 1 && postList.length < 5" class="el-icon-plus" :class="{ onlyAdd: postList.length === 1 }" @click="addPostSql"></i>
                </div>
              </el-form-item>
              <el-form-item label="主键冲突" required>
                <el-radio-group v-model="seniorForm.exportMode">
                  <el-radio label="insert" class="exportEadio">写入前保留已有数据(insert)</el-radio>
                  <el-radio label="update" class="exportEadio">写入并更新已有数据(update)</el-radio>
                  <el-radio label="replace" class="exportEadio">写入并替换已有数据(replace)</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item class="sync-num" label="读写速率" required> <el-input-number v-model="ruleForm.bandwidth" :min="1"></el-input-number> M </el-form-item>
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
                <el-table ref="inputColumnsTable" v-loading="tableLoading" :data="columns" row-key="name" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
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
                  <el-table-column prop="name" label="源字段名称" min-width="110" align="center">
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
                  <el-table-column label="操作" width="70" align="center">
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
                <el-table ref="columnsTable" v-loading="tableRightLoading" :data="columns_right" row-key="name" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
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
                  <el-table-column prop="name" label="目标字段名称" min-width="120" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.name" size="mini" placeholder="字段名称"></el-input>
                      <span v-else>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="data_type" label="字段类型" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.data_type" size="mini" placeholder="字段类型"></el-input>
                      <span v-else>{{ scope.row.data_type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="字段描述" min-width="100" align="center">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.isAdd" v-model="scope.row.columnComment" size="mini" placeholder="字段描述"></el-input>
                      <span v-else>{{ scope.row.columnComment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="70" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" @click="delDataRight(scope.row, scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <el-tabs v-if="showEditModel" class="process">
          <el-tab-pane>
            <template #label>
              <span class="label">
                加工逻辑
                <sql-smaple name="mysql_sql" class="sqlSmaple"></sql-smaple>
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
import { getDataSetList, check, getSourceOrDestination } from '@/api/task';
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
      preList: [{ value: '' }],
      postList: [{ value: '' }],
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
        executeMode: 'local',
        sourceId: '',
        invokingStatus: true,
        content: '',
        folderName: '',
        folderId: '',
        templateCode: 'Hive2Mysql',
        bandwidth: 10,
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
        sourceId: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        destinationId: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        targetDB: [{ required: true, message: '请选择数据库', trigger: ['blur', 'change'] }],
        targetTable: [{ required: true, message: '请输入表名称', trigger: ['blur', 'change'] }]
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
      typeList: ['VARCHAR(255)', 'TEXT', 'BIGINT', 'DOUBLE', 'TIMESTAMP'],
      seniorForm: {
        exportMode: 'insert',
        existTargetTable: false,
        destinationId: '',
        targetDB: '',
        targetTable: '',
        checkExpirationTime: 24,
        partitions: [{ name: 'datepart', value: '{{ yesterday_ds }}' }],
        targetPartition: [{ name: 'datepart', value: '{{ yesterday_ds }}' }],
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
      isWorkflow: false,
      isEdit: false,
      showEditModel: false,
      sourceList: []
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
    'ruleForm.executeMode'(v) {
      if (v === 'distribution') {
        this.showEditModel = true;
      } else {
        this.showEditModel = false;
      }
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
    if (!this.seniorForm.owner) {
      this.seniorForm.owner = this.$store.getters.userInfo.userId;
    }
    this.rowDrop();
    tools.regionList.then(res => {
      this.regionList = res;
      this.ruleForm.runtimeConfig.sourceRegion = res[0].value;
      setTimeout(() => {
        if (!this.isEdit) {
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

--注意时间变量和as转换,具体可查看"提示"11
SELECT
  ${tableNamesStr},\n
  '${this.seniorForm.partitions[0].value}' AS ${this.seniorForm.partitions[0].name}
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
        this.outputFieldList = [];
      } else {
        this.columns_right = [];
      }
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
      // 还原runtimeConfig数据
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      this.seniorForm = runtimeConfig.advancedParameters;
      this.ruleForm.runtimeConfig.sourceRegion = runtimeConfig.sourceRegion;
      this.ruleForm.executeMode = runtimeConfig.executeMode;
      this.seniorForm.destinationId = runtimeConfig.destinationId;
      this.ruleForm.sourceId = runtimeConfig.sourceId;
      this.ruleForm.inputDataset[0].metadata.db = runtimeConfig.catalog.sourceDb;
      this.seniorForm.targetDB = runtimeConfig.catalog.sourceDb;
      this.ruleForm.inputDataset[0].metadata.table = runtimeConfig.catalog.tables[0].sourceTable;
      this.seniorForm.targetTable = runtimeConfig.catalog.tables[0].targetTable;
      this.seniorForm.existTargetTable = runtimeConfig.catalog.tables[0].existTargetTable;
      this.ruleForm.bandwidth = runtimeConfig.taskParam?.bandwidth || '10';
      this.columns_right = [];
      runtimeConfig.catalog.tables[0].columns.map(item => {
        item.data_type = item.columnType;
        item.name = item.columnName;
        if (item.name) {
          this.columns_right.push(item);
        }
      });
      this.columns = runtimeConfig.catalog.tables[0].sourceColumns || [];
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      // 处理分区字段
      const partitionsArr = runtimeConfig.catalog.tables[0].partitions.split(',');
      partitionsArr.map((item, index) => {
        const splitIndex = item.indexOf('=');
        const partitionsName = item.substring(0, splitIndex);
        const partitionsValue = item.substring(splitIndex + 1);
        this.$set(this.seniorForm.partitions, index, {
          name: partitionsName,
          value: partitionsValue
        });
      });
      if (runtimeConfig.catalog.tables[0].targetPartition) {
        const splitIndex = runtimeConfig.catalog.tables[0].targetPartition.indexOf('=');
        this.partitionsName = runtimeConfig.catalog.tables[0].targetPartition.substr(0, splitIndex);
        this.partitionsValue = runtimeConfig.catalog.tables[0].targetPartition.substr(splitIndex + 1);
        this.seniorForm.targetPartition = [{}];
        this.$set(this.seniorForm.targetPartition, 0, {
          name: this.partitionsName,
          value: this.partitionsValue
        });
      }
      this.preList = runtimeConfig.preSql.map(item => {
        return { value: item };
      });
      this.postList = runtimeConfig.postSql.map(item => {
        return { value: item };
      });
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
      await this.changeRegion(this.ruleForm.runtimeConfig.sourceRegion, 'init');
      this.changeDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      this.changeTargetSource(this.seniorForm.destinationId, 'init');
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
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
    },
    rowDrop() {
      const el = this.$refs.inputColumnsTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        setData(dataTransfer) {
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
        setData(dataTransfer) {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.columns_right.splice(evt.oldIndex, 1)[0];
          this.columns_right.splice(evt.newIndex, 0, targetRow);
        }
      });
    },
    addPreSql() {
      this.preList.push({ value: '' });
    },
    deletePreSql(index) {
      this.preList.splice(index, 1);
    },
    addPostSql() {
      this.postList.push({ value: '' });
    },
    deletePostSql(index) {
      this.postList.splice(index, 1);
    },
    deletePartitions(index) {
      this.seniorForm.partitions.splice(index, 1);
    },
    addPartitions() {
      this.seniorForm.partitions.push({ value: '', name: '' });
    },
    async changeRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
        this.seniorForm.destinationId = '';
        this.seniorForm.targetDB = '';
        this.seniorForm.targetTable = '';
      }
      this.targetSourceList = [];
      this.targetSourceLoad = true;
      getDataSetList({
        region: value,
        type: 'mysql',
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Mysql'
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.targetSourceList = data.data;
        }
        this.targetSourceLoad = false;
      });
      this.sourceDbList = [];
      this.dbLoad = true;
      this.getSourceId();
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
          actorId: this.seniorForm.destinationId,
          region: this.ruleForm.runtimeConfig.sourceRegion,
          type: 'mysql',
          db: this.seniorForm.targetDB,
          table,
          metaFlag: 'AIRBYTE',
          templateCode: 'Hive2Mysql'
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

--注意时间变量和as转换,具体可查看"提示"22
SELECT
  ${tableNamesStr},\n
  '${this.seniorForm.partitions[0].value}' AS ${this.seniorForm.partitions[0].name}
FROM
${this.ruleForm.inputDataset[0].metadata.db}.${this.ruleForm.inputDataset[0].metadata.table}
WHERE
  dt = '{{ yesterday_ds_nodash }}'`;
          this.$refs.monaco?.setCode(this.content);
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
        actorId: this.seniorForm.destinationId,
        db: this.seniorForm.targetDB,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Mysql'
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
      this.$refs.monaco?.setCode('');
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
    // 获取sourceId
    getSourceId() {
      const params = {
        pageNum: 1,
        pageSize: 10,
        sourceName: 'iceberg',
        region: this.ruleForm.runtimeConfig.sourceRegion,
        sortKey: 'createTime',
        sortOrder: 'desc'
      };
      getSourceOrDestination(params).then(res => {
        this.sourceList = res.data.list;
      });
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    // 将本地对象转换成传参对象
    localToParams(params) {
      // 拷贝params，处理传参
      const paramsVal = JSON.parse(JSON.stringify(params));
      // 处理分区信息
      let partitions = '';
      this.seniorForm.partitions.map(item => {
        const partitionsItem = item.name ? item.name + '=' + item.value : '';
        partitions += partitionsItem + ',';
      });
      partitions = partitions.substring(0, partitions.length - 1);
      const runtimeConfig = {
        isNewFormat: true,
        sourceRegion: this.ruleForm.runtimeConfig.sourceRegion,
        executeMode: this.ruleForm.executeMode,
        sourceType: 'iceberg',
        sourceId: this.ruleForm.sourceId,
        destinationType: 'mysql',
        destinationId: this.seniorForm.destinationId,
        catalog: {
          sourceDb: this.ruleForm.inputDataset[0].metadata.db,
          targetDb: this.seniorForm.targetDB,
          tables: [
            {
              partitions: partitions,
              targetPartition: this.seniorForm.targetPartition[0].name || this.seniorForm.targetPartition[0].value ? this.seniorForm.targetPartition[0].name + '=' + this.seniorForm.targetPartition[0].value : '',
              sourceTable: this.ruleForm.inputDataset[0].metadata.table,
              targetTable: this.seniorForm.targetTable,
              columns: this.columns.map((item, index) => {
                return {
                  ...item,
                  columnComment: this.columns_right[index] ? this.columns_right[index].columnComment : '',
                  columnName: this.columns_right[index] ? this.columns_right[index].name : '',
                  columnType: this.columns_right[index] ? this.columns_right[index].data_type : ''
                };
              }),
              sourceColumns: this.columns,
              existTargetTable: this.seniorForm.existTargetTable
            }
          ]
        },
        advancedParameters: this.seniorForm,
        alertModel: this.seniorForm.alertModel,
        regularAlert: this.seniorForm.regularAlert,
        cost: this.ruleForm.cost,
        preSql: this.preList.map(item => item.value),
        postSql: this.postList.map(item => item.value),
        taskParam: {
          bandwidth: this.ruleForm.bandwidth
        }
      };
      paramsVal.runtimeConfig = runtimeConfig;
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
      paramsVal.folderId = this.ruleForm.folderId;
      return paramsVal;
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
              if (!this.copyId && !this.isEdit) {
                this.ruleForm.name = `exp_${this.seniorForm.targetDB}_${this.seniorForm.targetTable}`;
              }
              this.ruleForm.inputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              // this.ruleForm.outputDataset[0].metadata.region = this.ruleForm.runtimeConfig.sourceRegion;
              this.currentStep++;
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
          ...tools.copyFn(this.ruleForm)
          // runtimeConfig: {
          //   ...this.seniorForm,
          //   ...this.ruleForm.runtimeConfig,
          //   columns: this.columns_right.map(item => {
          //     return {
          //       ...item,
          //       columnName: item.name,
          //       columnType: item.data_type,
          //       columnComment: item.columnComment
          //     };
          //   }),
          //   sourceColumns: this.columns,
          //   cost: this.ruleForm.cost
          // }
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
        const { destinationId } = this.seniorForm;
        const findObj = this.targetSourceList.find(item => item.actorId === destinationId);
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
        // // 拷贝params，处理传参
        // const paramsVal = JSON.parse(JSON.stringify(params));
        // // 处理定时告警数据
        // if (!paramsVal.runtimeConfig.regularAlert.isChecked) {
        //   delete paramsVal.runtimeConfig.regularAlert;
        // }
        // Object.keys(paramsVal.runtimeConfig.alertModel).forEach(item => {
        //   if (!paramsVal.runtimeConfig.alertModel[item].isChecked) {
        //     paramsVal.runtimeConfig.alertModel[item] = this.initAlertModel;
        //   }
        // });
        // // 处理生成标志
        // if (!paramsVal.outputDataset[0].check) {
        //   paramsVal.outputDataset[0].fileName = '';
        //   paramsVal.outputDataset[0].location = '';
        // }
        // if (!paramsVal.outputDataset[0].id) {
        //   delete paramsVal.outputDataset[0].id;
        // }
        const paramsVal = this.localToParams(params);
        this.$refs.validParams.show(paramsVal);
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  .sync-num {
    ::v-deep .el-input-number--small {
      width: 30%;
    }
  }
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
  .partitionsBox,
  .partitions_item {
    position: relative;
  }
  .partitions-tips {
    right: -75px !important;
  }
  .el-icon-delete {
    position: absolute;
    top: 0;
    right: -20px;
    line-height: 32px;
    color: #ff5656 !important;
    font-size: 16px !important;
    cursor: pointer;
  }
  .el-icon-plus {
    position: absolute;
    top: 0;
    right: -40px;
    font-size: 16px !important;
    margin-left: 5px;
    line-height: 32px;
    color: #3782ff;
    cursor: pointer;
  }
  .onlyAdd {
    right: -20px;
  }
  .exportEadio {
    // display: block;
    // margin-top: 8px;
    margin-right: 20px !important;
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
      .customTanle {
        .el-button {
          padding: 7px 0px;
          font-size: 18px;
          vertical-align: middle;
        }
      }
      .partitionsBox {
        position: relative;
        .tips {
          position: absolute;
          top: 0;
          right: -50px;
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
