<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div v-loading="contentLoading" class="step-content">
      <div v-show="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">{{ $t('task.highSetting') }}</el-button>
        <el-form ref="ruleForm" :model="configForm" :rules="rules" class="ruleForm" label-width="230px">
          <div class="form-head">
            <el-form-item prop="sourceRegion">
              <template #label>
                <span>{{ $t('task.region') }}</span>
                <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
                  <i class="el-icon-info" style="cursor: pointer"></i>
                </el-tooltip>
              </template>
              <el-select v-model="configForm.sourceRegion" class="area-select" :placeholder="$t('task.dbTip2')" clearable @change="changeRegion">
                <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('task.dbToLakehouse2')" prop="dataOriginType">
              <el-select v-model="configForm.dataOriginType" class="area-select" :placeholder="$t('task.dbTip3')" clearable @change="changeDataOrigin">
                <el-option v-for="item in dataOriginList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('task.dbToLakehouse3')" prop="table_type">
              <el-radio-group v-model="configForm.table_type" @change="typeChange">
                <el-radio label="single">{{ $t('task.dbContent1') }}</el-radio>
                <el-radio v-if="configForm.dataOriginType === 'mysql'" label="more">{{ $t('task.dbContent2') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('task.dbToLakehouse4')" prop="syncType">
              <template slot="label"> {{ $t('task.dbToLakehouse4') }}<i class="el-icon-info" style="cursor: pointer" @click="syncTypeVisible = !syncTypeVisible"></i> </template>
              <el-radio-group v-model="configForm.syncType" @change="syncTypeChange">
                <el-radio :label="1">{{ $t('task.dbContent3') }}</el-radio>
                <el-radio v-if="configForm.dataOriginType === 'mysql'" :disabled="configForm.table_type == 'more'" :label="2">{{ $t('task.dbContent4') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <el-row>
            <el-col :span="12">
              <el-tabs>
                <el-tab-pane :label="$t('task.dbContent8')">
                  <el-form-item :label="`${formatOriginLabel()} ${$t('task.dbToLakehouse5')}`" prop="connectionName" class="quick-item">
                    <el-select v-model="configForm.connectionName" :placeholder="$t('task.place_dbToLakehouse5')" :loading="sourceLoad" filterable clearable @change="changeConnectionName">
                      <el-option v-for="item in connectionNameList" v-show="item.actorId !== disabledId" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
                    </el-select>
                    <span v-if="!configForm.sourceRegion" class="tips">* {{ $t('task.dbContent5') }}</span>
                    <div class="quick-action">
                      <el-button type="text" @click="$router.push({ name: 'sourceInstance' })">{{ $t('task.dbContent6') }}</el-button>
                    </div>
                  </el-form-item>
                  <el-form-item :label="`${formatOriginLabel()} ${$t('task.dbToLakehouse6')}`" prop="sourceDb">
                    <el-input v-model="configForm.sourceDb" :disabled="true"></el-input>
                  </el-form-item>
                  <el-form-item v-if="configForm.table_type === 'single'" :label="`${formatOriginLabel()} ${$t('task.dbToLakehouse7')}`" prop="sourceTable" class="quick-item">
                    <el-select v-model="configForm.sourceTable" :placeholder="$t('task.dbTip4')" :loading="tableLoad" clearable filterable @change="changeSourceTable">
                      <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                    </el-select>
                    <div class="quick-action">
                      <el-button type="text" @click="getPreviewData()">{{ $t('task.dbContent7') }}</el-button>
                    </div>
                  </el-form-item>
                </el-tab-pane>
              </el-tabs>
            </el-col>
            <el-col :span="12">
              <el-tabs>
                <el-tab-pane>
                  <span slot="label">
                    {{ $t('task.dbContent9') }}
                    <el-popover placement="bottom" width="500" trigger="hover">
                      <div>
                        1）{{ $t('task.dbContent10') }}<br />
                        2）{{ $t('task.dbContent11') }}
                      </div>
                      <i slot="reference" class="el-icon-info"></i>
                    </el-popover>
                  </span>
                  <el-form-item label="lakehouse类型" required>
                    <el-radio-group v-model="configForm.lakehouseType">
                      <el-radio v-for="item in lakehouseTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item :label="'LakeHouse ' + $t('task.dbToLakehouse6')" prop="targetDb">
                    <el-select
                      ref="dbSelect"
                      v-model="configForm.targetDb"
                      class="lake-table-select"
                      :placeholder="$t('task.dbContent12')"
                      no-match-text=" "
                      :loading="tdbLoad"
                      default-first-option
                      filterable
                      clearable
@visible-change="tapDbVisible"
                      @change="changeLakeHouseDb"
                    >
                      <el-option v-for="item in targetDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                      <!-- <el-option class="dy-height" :disabled="true" value="" label=""></el-option> -->
                      <div class="dy-box dy-box-less"></div>
                      <div class="dy-box">
                        <div>
                          <el-button type="text">{{ $t('task.dbContent13') }}</el-button>
                        </div>
                        <!-- <div v-if="!showDbInpt" @click="tapAddDb">
                          <el-button type="text">+ 没找到？自定义一个库名</el-button>
                        </div>
                        <div v-else class="dy-inpt-box">
                          <el-form ref="addDbForm" :model="addDbForm" :rules="addDbRules">
                            <el-form-item prop="dbItemName">
                              <el-input v-model="addDbForm.dbItemName"></el-input>
                            </el-form-item>
                          </el-form>
                          <i class="el-icon-success" @click="addDbItem"></i>
                          <i class="el-icon-error" @click="clearDbInpt"></i>
                        </div> -->
                      </div>
                    </el-select>
                    <span v-if="!configForm.sourceRegion" class="tips">* {{ $t('task.dbContent5') }}</span>
                  </el-form-item>
                  <el-form-item v-if="configForm.table_type === 'single'" :label="'LakeHouse ' + $t('task.dbToLakehouse7')" prop="targetTable" class="targetTable">
                    <!-- <el-input v-model="configForm.targetTable" @blur="changeTargetTable('single')"></el-input> -->
                    <el-select v-if="!autoCreateTable" ref="targetTableSelect" v-model="configForm.targetTable" class="lake-table-select" placeholder="选择表名称" no-match-text=" " default-first-option filterable clearable @change="changeTargetTable('single')">
                      <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                      <!-- 下拉选项中增加去建表 -->
                      <!-- <div value="" class="dy-box dy-box-less"></div>
                      <div class="dy-box">
                        <div>
                          <a :href="createMetaUrl" target="_blank">+没找到？创建自定义表</a>
                        </div>
                      </div> -->
                    </el-select>
                    <el-input v-else v-model="configForm.targetTable"></el-input>
                    <span>
                      <span v-if="!autoCreateTable" type="text" class="tips live-btn" @click="switchAutoTable()">{{ $t('task.dbTableInpt') }}</span>
                      <span v-else>
                        <el-button type="text" class="tips live-btn" @click="switchAutoTable()">{{ $t('task.dbTableSelect') }}</el-button>
                      </span>
                    </span>
                  </el-form-item>
                  <el-form-item v-else :label="$t('task.dbTip5')" prop="targetTablePart" class="targetTable">
                    <el-input v-model="configForm.targetTablePart" :disabled="isEdit" @input="changeTargetTable('more')"></el-input>
                    <!-- <div style="font-size: 12px; color: #666666">输入后，下方目标表-表名跟随变化</div> -->
                  </el-form-item>
                  <el-form-item v-if="configForm.syncType !== 2" :label="$t('task.dbToLakehouse8')" prop="seniorFormRules">
                    <template #label>
                      <span>{{ $t('task.dbToLakehouse8') }}</span>
                      <el-tooltip class="item" effect="dark" :content="$t('task.dbContent15')" placement="top">
                        <i class="el-icon-info" style="cursor: pointer"></i>
                      </el-tooltip>
                    </template>
                    <div class="partitions_item">
                      <el-tooltip class="item" effect="dark" :content="partitionsName" :disabled="!isTargetTableExit" placement="top">
                        <el-input v-model="partitionsName" :placeholder="$t('task.dbContent16')" clearable class="name" @input="partitionsChange(partitionsName)"></el-input>
                      </el-tooltip>
                      <span class="mark">=</span>
                      <el-tooltip class="item" effect="dark" :content="partitionsValue" :disabled="!isTargetTableExit" placement="top">
                        <el-input v-model="partitionsValue" :placeholder="$t('task.dbContent17')" clearable class="value"></el-input>
                      </el-tooltip>
                    </div>
                    <span class="tips" @click="handelInfo('jinjia', $t('task.dbContent18'))">{{ $t('task.dbContent18') }}</span>
                  </el-form-item>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-form>
        <div>
          <div v-if="configForm.table_type !== 'single'" class="table-title">
            <span class="table-span1">
              <span class="icon-box">
                <span class="icon-table">{{ $t('task.dbContent19') }}</span><i v-if="configForm.syncType === 1" class="el-icon-info" @click="handelInfo('originTable', $t('task.dbContent20'))"></i>
              </span>
              <div class="refresh" :class="{ 'refresh-select': selectItemShow }">
                <el-input v-if="configForm.table_type === 'more'" v-model="moretableName" :placeholder="$t('task.dbTip6')" clearable @keyup.enter.native="searchMoreTable"></el-input>
                <el-button v-if="configForm.table_type === 'single'" type="primary" size="mini" @click="addTableItem">{{ $t('task.tempTable2') }}</el-button>
                <el-select v-if="selectItemShow" v-model="tableAddItem" size="mini" class="add-select" :placeholder="$t('task.dbTip7')" clearable @change="selectTableItem">
                  <el-option v-for="item in singleTableSelect" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <el-button v-if="isEdit || configForm.table_type === 'single'" type="primary" size="mini" class="refresh-btn" @click="refreshTable(configForm.table_type)">{{ $t('task.tempTable3') }}</el-button>
              </div>
            </span>
            <span class="table-span2">{{ $t('task.tempTable21') }}</span>
            <span class="table-span3">{{ $t('task.tempTable22') }}</span>
          </div>
          <div v-if="configForm.table_type === 'single'">
            <TableMapping :left-columns="inputColumns" :right-columns="columns" :is-right-edit="autoCreateTable" :table-right-loading="tableRightLoading" :table-left-loading="tableLeftLoading" @refreshTable="changeSourceTable(configForm.sourceTable)"></TableMapping>
            <!-- <ipt-c-table ref="singleTable" :input-columns="inputColumns" :columns="columns" :type-list="typeList" :config-form="configForm" :input-columns-loading="tableLeftLoading" :columns-loading="tableRightLoading" :is-single="true" @deleteTableItem="deleteTableItem"></ipt-c-table> -->
          </div>
          <div v-else>
            <el-row>
              <el-table ref="moreInputColumns" v-loading="moreInputColumnsLoading" :data="moreInputColumns" stripe :cell-style="{ height: '42px', padding: '0px' }" @expand-change="expandChange" @selection-change="selectMoreTable">
                <el-table-column type="selection" width="35" :selectable="selectable"> </el-table-column>
                <el-table-column type="expand" width="30">
                  <template slot-scope="scope">
                    <div class="more-table">
                      <ipt-c-table :key="scope.$index" v-loading="moreInputLoadingArr[scope.$index]" :input-columns="scope.row.inputColumns" :columns="scope.row.columns" :type-list="typeList"></ipt-c-table>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('task.dbToLakehouse6')" align="center">
                  <template>
                    <el-tooltip :content="configForm.sourceDb" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ configForm.sourceDb || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" :label="$t('task.dbToLakehouse7')" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.name || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('task.dbTable1')" align="center" width="80px">
                  <template slot-scope="scope">
                    <el-button type="text" @click="getPreviewData(scope.row.name, scope.$index)">{{ 'task.dbContent7' }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('task.dbToLakehouse7')" align="center" min-width="100">
                  <div class="func-icon">
                    <!-- <div class="func-icon-code">&lt;/&gt;</div> -->
                    <div class="func-icon-line">
                      <div class="circle left"></div>
                      <div class="circle right"></div>
                    </div>
                  </div>
                </el-table-column>
                <el-table-column :label="$t('task.dbToLakehouse6')" min-width="100" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.lakeHouseDbName" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.lakeHouseDbName || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" :label="$t('task.dbTable2')" min-width="100" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.preMoreTableName || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
          </div>
        </div>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :region-list="regionList" :target-source-list="connectionNameList" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" @jumpStep="$event => (currentStep = $event)" />

      <el-drawer :title="$t('task.highSetting')" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form v-if="configForm.syncType === 1" ref="seniorForm" :is-edit="isEdit" :code="ruleForm.templateCode" :region="configForm.sourceRegion" :is-show-mode="isShowMode" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
        <senior-sql-form v-else ref="seniorForm" :no-cluster="noCluster" :senior-form="seniorFormSql" :region="configForm.sourceRegion" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">{{ $t('task.taskCancel') }}</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">{{ $t('task.kfk36') }}</el-button>
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? $t('task.kfk20') : copyId ? $t('task.dbCopy') : $t('task.dbSave')
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
    <CreateTable :create-table-data="createTableData" @createTableEmit="createTableEmit"></CreateTable>
    <el-info v-model="syncTypeVisible" :title="$t('task.dbTip8')">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <div style="font-weight: 550">1、{{ $t('task.dbTip8') }}</div>
        <div>{{ $t('task.dbTip9') }}</div>
        <div style="margin-top: 10px; font-weight: 550">2、{{ $t('task.dbTip10') }}</div>
        <div>{{ $t('task.dbTip11') }}</div>
      </div>
    </el-info>
    <el-dialog :visible.sync="previewVisible" :append-to-body="true">
      <div slot="title" class="preview-title">
        {{ previewTable }}{{ $t('task.dbTip12') }} <span class="preview-tip">{{ $t('task.dbTip13') }}</span>
      </div>
      <el-table v-if="previewData.length" :data="previewData">
        <el-table-column v-for="(item, index) in Object.keys(previewData[0])" :key="index" :property="item" :label="item" min-width="150px" show-overflow-tooltip>
          <template slot="header">
            <el-tooltip effect="dark" :content="item" class="preview-header" placement="top">
              <span> {{ item }} </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span> {{ scope.row[item] }} </span>
            <!-- <el-tooltip effect="dark" :content="scope.row[item]" class="preview-table" placement="top">
              <span> {{ scope.row[item] }} </span>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
      <origin-table-tips v-if="infoObj.msgType === 'originTable'"></origin-table-tips>
    </el-info>
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import SqlTips from './components/SqlTips';
import OriginTableTips from './components/OriginTableTips';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, getPreviewData, getClusterList, getEngineList, getName } from '@/api/task';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import IptCTable from './components/lackHouseIptCTable.vue';
import ViewParams from './components/viewParams';
import TableMapping from './components/TableMappingOld.vue';
import CreateTable from './components/createTable.vue';
export default {
  components: {
    StepsHead,
    SeniorForm,
    SeniorSqlForm,
    StepThree,
    SqlTips,
    OriginTableTips,
    EllipsisTooltip,
    ValidParams,
    IptCTable,
    ViewParams,
    TableMapping,
    CreateTable
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
      dataOriginList: [
        { label: 'MySQL', value: 'mysql' },
        { label: 'Oracle', value: 'oracle' },
        { label: 'SQL Server', value: 'sqlserver' },
        { label: 'Doris', value: 'doris' }
      ],
      disabledId: '',
      engineList: {},
      selectItemShow: false,
      autoCreateTable: false,
      singleTableSelect: [],
      tableAddItem: '',
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      partitionsName: '',
      partitionsValue: '',
      isEdit: false,
      isTargetTableExit: false,
      columnsArr: [],
      noCluster: false,
      initTable: '',
      expands: [],
      createMetaUrl: '',
      syncTypeVisible: false,
      previewVisible: false,
      previewData: [],
      btnLoading: false,
      formLoading: false,
      contentLoading: false,
      tableLoading: false,
      currentStep: 1,
      queryId: '',
      copyId: this.$route.query.copyId,
      hasTableName: false,
      showDbInpt: false,
      moreTableList: [], // 多选时选中项
      moretableName: '',
      previewTable: '',
      addDbForm: {
        dbItemName: ''
      },
      lakehouseTypeList: [
        {
          label: 'ICEBERG',
          value: 'ICEBERG'
        },
        {
          label: 'PAIMON',
          value: 'PAIMON'
        }
      ],
      initInputDataset: [
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
      initOutputDataset: [
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
      ruleForm: {
        isLakeHouseReal: false,
        isLakeHouseMore: false,
        invokingStatus: true,
        templateCode: 'Mysql2Hive',
        name: '',
        description: '',
        folderName: '',
        folderId: '',
        dependTypes: ['dataset'],
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
        partitions: [{}],
        dataOriginType: 'mysql',
        seniorFormRules: '',
        lakehouseType: 'ICEBERG',
        isTableList: true, // 区分旧的mysql->hive模版和新的mysql->lackhouse模版,true为新模版
        table_type: 'single',
        sourceRegion: '',
        // 数据源
        connectionName: '',
        sourceDb: '',
        sourceTable: '',
        // 目标表
        existTargetTable: false,
        exitDatabase: true,
        targetDb: '',
        targetTable: '',
        layer: 'ods',
        theme: '',
        targetTablePart: '',
        syncTypeText: 'all',
        syncType: 1,
        // 数据源用户信息
        connectionUrl: '',
        dbUser: '',
        dbPassword: ''
      },
      addDbRules: {
        dbItemName: [
          { required: true, message: this.$t('task.dbValid1'), trigger: ['blur', 'change'] },
          { validator: this.addDbValidate, trigger: ['blur', 'change'] }
        ]
      },
      rules: {
        sourceRegion: [{ required: true, message: this.$t('task.dbValid2'), trigger: ['blur', 'change'] }],
        dataOriginType: [{ required: true, message: this.$t('task.dbValid3'), trigger: ['blur', 'change'] }],
        connectionName: [{ required: true, message: this.$t('task.dbValid4'), trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: this.$t('task.dbValid5'), trigger: ['blur', 'change'] }],
        sourceTable: [{ required: true, message: this.$t('task.dbValid6'), trigger: ['blur', 'change'] }],
        targetDb: [{ required: true, message: this.$t('task.dbValid5'), trigger: ['blur', 'change'] }],
        theme: [{ required: true, message: this.$t('task.dbValid8'), trigger: ['blur', 'change'] }],
        seniorFormRules: [{ validator: this.seniorFormRulesFn, trigger: ['blur', 'change'] }],
        targetTable: [
          { required: true, message: this.$t('task.dbValid9'), trigger: ['blur', 'change'] },
          { validator: this.validate, trigger: ['blur', 'change'] }
        ],
        targetTablePart: [
          { required: false, message: this.$t('task.dbValid10'), trigger: ['blur', 'change'] },
          { validator: this.tablePreValidate, trigger: ['blur', 'change'] }
        ],
        name: [{ required: true, message: this.$t('task.dbValid11'), trigger: ['blur', 'change'] }],
        syncType: [{ required: true, message: this.$t('task.dbValid12'), trigger: ['blur', 'change'] }]
      },
      sourceLoad: false,
      dbLoad: false,
      tableLoad: false,
      tdbLoad: false,
      ttabLoad: false,
      regionList: tools.regionList,
      typeList: ['STRING', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL(22,6)', `DECIMAL${this.$t('task.dbValid13')}`, 'BINARY', 'VARBINARY'],
      targetDbList: [],
      targetTableList: [],
      connectionNameList: [],
      sourceDbList: [],
      sourceTableList: [],
      primaryKey: '',
      addColumns: [],
      tableLeftLoading: false,
      inputColumns: [],
      tableRightLoading: false,
      columns: [],
      initMoreInputColumns: [], // 存储搜索时的数据初始值
      moreInputColumns: [],
      moreInputLoadingArr: [],
      moreInputColumnsLoading: false,
      drawerVisible: false,
      tables: [],
      seniorFormSql: {
        isLakeHouseReal: false,
        displayDependJars: [{ artifactId: '', id: '' }],
        flinkClusterId: '',
        runtimeConfig: {
          sourceType: 'mysql',
          topic: '',
          bootstrapServerUri: '',
          mysqlCdcType: 'initial',
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointTimeout: 100,
          checkpointMode: 'AT_LEAST_ONCE',
          // {{$t('task.highSetting')}}
          owner: '',
          collaborators: [],
          dsGroups: [],
          parallelism: 1,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: [],
          alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: ['dingTalk'], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }}
        }
      },
      seniorForm: {
        // partitions: 'dt={{ yesterday_ds }}',
        engineConfig: '',
        checkExpirationTime: 24,
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        mysqlCdcType: 'initEdit',
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
        // params: []
        batchParams: '',
        lifecycle: 'Ec2spot'
      },
      canEdit: true,
      nameDisabled: false,
      copyMsg: null,
      isMatched: false,
      showInput: false,
      inputField: '',
      inputFieldList: [],
      showOutput: false,
      outputField: '',
      outputFieldList: [],
      isTipDisabled: false,
      isWorkflow: false,
      createTableData: {
        visible: false
      }
    };
  },
  computed: {
    info() {
      if (this.configForm.syncType === 1) {
        return Object.assign({}, this.ruleForm, this.seniorForm, this.configForm, { target_columns: this.columns, source_columns: this.inputColumns, moreTableList: this.moreTableList });
      } else {
        return Object.assign({}, this.ruleForm, this.seniorFormSql.runtimeConfig, this.configForm, { target_columns: this.columns, source_columns: this.inputColumns, moreTableList: this.moreTableList });
      }
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
      if (this.configForm.sourceRegion === 'sg2') {
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
    'configForm.targetDb'(v) {
      this.moreInputColumns.forEach(item => {
        item.lakeHouseDbName = v;
      });
      this.initMoreInputColumns.forEach(item => {
        item.lakeHouseDbName = v;
      });
    },
    partitionsValue(val) {
      this.configForm.partitions[0].value = val;
    },
    partitionsName(val) {
      this.configForm.partitions[0].name = val;
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (!this.isEdit) {
      this.seniorForm.owner = this.seniorFormSql.runtimeConfig.owner = this.$store.getters.userInfo.userId;
    }
    this.createMetaUrl = `${process.env.VUE_APP_DATACAKE_FRONTEND}/meta/step`;
    // if (this.configForm.syncType === 2) {
    //   this.getCluster();
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
  destroyed() {
    this.copyMsg && this.copyMsg.close();
  },
  methods: {
    validate(rule, value, callback) {
      const reg = /^[a-z]+[a-z0-9-_]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t('task.dbValid14')));
      } else if (this.hasTableName) {
        // callback(new Error('表名称已存在，请重新输入'));
        callback();
      } else {
        callback();
      }
    },
    addDbValidate(rule, value, callback) {
      const reg = /^[a-z]+[a-z0-9-_]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t('task.dbValid14')));
      } else {
        callback();
      }
    },
    seniorFormRulesFn(rule, value, callback) {
      const reg = /^[a-z{\s]+[a-z0-9-_}\s]*$/;
      if (value && (!reg.test(value) || value.length > 20)) {
        callback(new Error(this.$t('task.dbValid14')));
      } else {
        callback();
      }
    },
    tablePreValidate(rule, value, callback) {
      const reg = /^[a-z]+[a-z0-9-_]*$/;
      if (value && (!reg.test(value) || value.length > 20)) {
        callback(new Error(this.$t('task.dbValid14')));
      } else {
        callback();
      }
    },

    stopTest(e) {
      e.stopPropagation();
    },
    getCluster() {
      getClusterList().then(res => {
        const data = res.data;
        if (data && data.length) {
          this.clusterList = data;
        } else {
          this.drawerVisible = true;
          this.noCluster = true;
        }
      });
    },
    partitionsChange(val) {
      this.configForm.seniorFormRules = val;
    },
    async getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.isEdit = true;
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      // this.configForm = runtimeConfig;
      this.configForm = Object.assign(this.configForm, runtimeConfig);
      this.initTable = runtimeConfig.sourceTable;
      this.autoCreateTable = runtimeConfig.autoCreateTable;
      this.configForm.seniorFormRules = '';
      const splitIndex = runtimeConfig.tables[0].partitions.indexOf('=');
      this.partitionsName = runtimeConfig.tables[0].partitions.substr(0, splitIndex);
      this.partitionsValue = runtimeConfig.tables[0].partitions.substr(splitIndex + 1);
      this.configForm.partitions = [{}];
      this.changeLakeHouseDb(this.configForm.targetDb, 'initEdit');
      if (runtimeConfig.tables[0].partitions) {
        this.$set(this.configForm.partitions, 0, {
          name: this.partitionsName,
          value: this.partitionsValue
        });
      }
      if (this.configForm.syncType === 1) {
        // this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
        Object.keys(this.seniorForm).forEach(key => {
          this.seniorForm[key] = runtimeConfig[key];
        });
        if (!this.seniorForm.alertModel) {
          this.seniorForm.alertModel = { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: ['dingTalk'], notifyCollaborator: false, isChecked: true }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }};
        }
        if (!this.seniorForm.regularAlert) {
          this.seniorForm.regularAlert = this.initRegularAlert;
        }
      } else {
        this.seniorFormSql.flinkClusterId = data.flinkClusterId;
        // Object.assign(this.seniorFormSql.runtimeConfig, runtimeConfig);
        Object.keys(this.seniorFormSql.runtimeConfig).forEach(key => {
          this.seniorFormSql.runtimeConfig[key] = runtimeConfig[key];
        });
        this.seniorFormSql.isLakeHouseReal = data.isLakeHouseReal;
        this.seniorFormSql.displayDependJars = data.displayDependJars;
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
      }
      this.configForm.existTargetTable = runtimeConfig.tables[0].existTargetTable;
      this.syncTypeChange();
      this.typeChange('initEdit');
      this.ruleForm.name = data.name;
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.seniorFormSql.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      this.configForm.dataOriginType = this.configForm.dataOriginType ? this.configForm.dataOriginType : 'mysql';
      // 处理表单数据
      if (runtimeConfig.table_type === 'single') {
        this.columnsArr = Array.isArray(runtimeConfig.tables[0].columns) ? runtimeConfig.tables[0].columns : JSON.parse(runtimeConfig.tables[0].columns);
        this.columnsArr.forEach((item, index) => {
          // 最新源表有删除后，只取与源表长度相同的目标表
          if (item.columnName) {
            this.columns.push({
              columnName: item.columnName,
              columnType: item.columnType,
              columnComment: item.columnComment
            });
          }
          if (item.name) {
            const obj = {
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
            this.inputColumns.push(obj);
          }
        });
      } else {
        // 多表
        runtimeConfig.tables.forEach(item => {
          item.name = item.sourceTable;
          item.preMoreTableName = item.targetTable;
          item.inputColumns = item.columns.map(item1 => {
            const obj = {
              name: item1.name,
              data_type: item1.data_type,
              comment: item1.comment,
              isPK: item1.isPK
            };
            if (item1.funcs) {
              obj.funcs = item1.funcs;
            }
            return obj;
          });
          const pkIndex = item.columns.findIndex(item1 => {
            return item1.isPK === true;
          });
          if (pkIndex > -1) {
            item.primaryKey = item.columns[pkIndex].name;
          } else {
            item.primaryKey = '';
          }
        });
        this.moreInputColumns = runtimeConfig.tables;
        this.initMoreInputColumns = JSON.parse(JSON.stringify(runtimeConfig.tables));
        this.$nextTick(() => {
          this.$refs.moreInputColumns.toggleAllSelection();
        });
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
      await this.changeRegion(this.configForm.sourceRegion, 'initEdit');
      this.changeConnectionName(this.configForm.connectionName, 'initEdit');
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
      if (data.workflowId) {
        this.isWorkflow = true;
      }
      this.isMatched = true;
      this.configForm.table_type = runtimeConfig.table_type;
      this.targetTableExit();
    },
    async refreshTable(type) {
      // 对比新请求的数据和回显数据，给inputColumn数据加上标识（pk,变更）
      if (type === 'more') {
        const oldMoreInputColumns = JSON.parse(JSON.stringify(this.initMoreInputColumns));
        oldMoreInputColumns.map(async(item, homeIndex) => {
          this.moreInputColumns[homeIndex].addColumns = [];
          this.moreInputColumns[homeIndex].inputColumns = [];
          this.moreInputLoadingArr[homeIndex] = true;
          await this.changeSourceTable(item.name, homeIndex); // 跟新每一个
          this.moreInputLoadingArr[homeIndex] = false;
          const newInputColumns = this.moreInputColumns[homeIndex].inputColumns;
          let onlyAddFlag = true; // 判断源表数据是否只有新增，没有修改，删除

          const oldInputColumns = oldMoreInputColumns[homeIndex].inputColumns.map((item, index) => {
            const sameOldIndex = newInputColumns.findIndex(newItem => {
              return newItem.name === item.name;
            });
            if (sameOldIndex === -1) {
              onlyAddFlag = false;
            }
            const obj = {
              name: item.name,
              data_type: item.data_type ? item.data_type : item.dataType,
              comment: item.comment
            };
            if (item.funcs) {
              obj.funcs = item.funcs;
            }
            return obj;
          });
          newInputColumns.map((item, index) => {
            const sameNewIndex = oldInputColumns.findIndex(oldItem => {
              return oldItem.name === item.name;
            });
            if (sameNewIndex > -1) {
              if (item.data_type !== oldInputColumns[sameNewIndex].data_type) {
                item.isTypeChange = true;
              }
            } else {
              item.isNameChange = true;
              if (onlyAddFlag) {
                this.moreInputColumns[homeIndex].addColumns.push({ ...item, ...this.regColumItem(item) });
              }
            }
          });
          this.formatColumns({ index: homeIndex });
        });
      } else {
        this.singleTableSelect = [];
        this.selectItemShow = false;
        this.addColumns = [];
        this.inputColumns = [];
        this.tableLeftLoading = true;
        this.tableRightLoading = true;
        const newInputColumns = await (
          await getDataSetList({
            region: this.configForm.sourceRegion,
            type: this.configForm.dataOriginType,
            actorId: this.configForm.connectionName,
            db: this.configForm.sourceDb,
            table: this.configForm.sourceTable,
            metaFlag: 'AIRBYTE',
            templateCode: 'Mysql2Hive',
            owner: this.seniorForm.owner
          })
        ).data.columns;
        if (this.configForm.sourceTable !== this.initTable) {
          // 切换了表名
          this.columnsArr = [];
          this.columns = newInputColumns.map(item => {
            this.columnsArr.push({
              ...item,
              ...this.regColumItem(item)
            });
          });
        }

        this.tableLeftLoading = false;
        this.tableRightLoading = false;
        let onlyAddFlag = true; // 判断源表数据是否只有新增，没有修改，删除
        const oldInputColumns = this.columnsArr.map((item, index) => {
          const sameOldIndex = newInputColumns.findIndex(newItem => {
            return newItem.name === item.name;
          });
          if (sameOldIndex === -1) {
            onlyAddFlag = false;
          }
          const obj = {
            name: item.name,
            data_type: item.data_type ? item.data_type : item.dataType,
            comment: item.comment
          };
          if (item.funcs) {
            obj.funcs = item.funcs;
          }
          return obj;
        });
        newInputColumns.map((item, index) => {
          const sameNewIndex = oldInputColumns.findIndex(oldItem => {
            return oldItem.name === item.name;
          });
          if (sameNewIndex > -1) {
            if (item.data_type !== oldInputColumns[sameNewIndex].data_type) {
              item.isTypeChange = true;
            }
          } else {
            item.isNameChange = true;
            if (onlyAddFlag) {
              this.addColumns.push({ ...item, ...this.regColumItem(item) });
            }
          }
          this.inputColumns.push(item);
        });
        this.formatColumns({});
      }
    },
    formatOriginLabel() {
      let label = '';
      switch (this.configForm.dataOriginType) {
        case 'mysql':
          label = 'MySQL';
          break;
        case 'oracle':
          label = 'Oracle';
          break;
        case 'sqlserver':
          label = 'SQL Server';
          break;
        case 'doris':
          label = 'Doris';
          break;
      }
      return label;
    },
    switchAutoTable() {
      this.autoCreateTable = !this.autoCreateTable;
      this.configForm.partitions = [{ name: '', value: '' }];
      if (this.autoCreateTable) {
        this.configForm.targetTable = `datacake_${this.configForm.sourceDb}_${this.configForm.sourceTable}`.toLowerCase();
        this.formatColumns({});
      } else {
        this.configForm.targetTable = '';
        this.columns = [];
      }
    },
    // 将search接口返回的列表中，没有当前id的数据追加到返回到列表中
    addListItem(id, list) {
      const flag = list.some(item => {
        if (item.actorId === id) {
          return true;
        }
      });
      if (!flag) {
        this.disabledId = id;
        getName({ sourceId: id }).then(res => {
          const name = res.data.name;
          list.push({ actorId: id, name: name });
        });
      }
    },
    // 判断目标表是否存在
    targetTableExit() {
      getDataSetList({
        db: this.configForm.targetDb,
        table: this.configForm.targetTable,
        metaFlag: 'AIRBYTE',
        region: this.configForm.sourceRegion,
        type: 'hive',
        templateCode: 'Mysql2Hive',
        judgeTable: true
      }).then(res => {
        this.isTargetTableExit = res.data.isTalbeExist;
      });
    },
    changeDataOrigin(v) {
      this.changeRegion(this.configForm.sourceRegion);
      if (this.isEdit) {
        this.targetTableExit();
      }
    },
    deleteTableItem(itemIndex) {
      const selectObj = {
        label: this.inputColumns[itemIndex].name,
        value: JSON.stringify([this.inputColumns[itemIndex], this.columns[itemIndex]])
      };
      this.singleTableSelect.push(selectObj);
      this.inputColumns.splice(itemIndex, 1);
      this.columns.splice(itemIndex, 1);
    },
    addTableItem() {
      this.selectItemShow = true;
      this.tableAddItem = '';
    },
    selectTableItem(v) {
      this.inputColumns.push(JSON.parse(v)[0]);
      this.columns.push(JSON.parse(v)[1]);
      const selectIndex = this.singleTableSelect.findIndex(item => {
        return item.value === v;
      });
      this.singleTableSelect.splice(selectIndex, 1);
      this.selectItemShow = false;
    },
    changeLakeHouseDb(value, initEdit) {
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate();
      });
      if (!initEdit) {
        this.configForm.targetTable = '';
        this.columns = [];
      }
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: 'hive',
        db: value,
        metaFlag: 'AIRBYTE',
        templateCode: 'Hive2Doris'
      }).then(res => {
        const data = res.data;
        if (data.data) {
          this.targetTableList = data.data;
        }
      });
    },
    selectable() {
      return !this.disabled;
    },
    searchMoreTable() {
      this.moreInputColumns = this.initMoreInputColumns.filter(item => {
        return this.moretableName ? item.name.indexOf(this.moretableName) !== -1 : true;
      });
    },
    selectMoreTable(val) {
      this.moreTableList = val;
    },
    expandChange(row, rowList) {
      const isExpend = rowList.some(item => {
        if (item && row) {
          return item.name === row.name;
        }
      });
      const tableIndex = this.moreInputColumns.findIndex(item => {
        if (item && row) {
          return item.name === row.name;
        }
      });
      if (isExpend && !this.moreInputColumns[tableIndex].inputColumns) {
        this.changeSourceTable(row.name, tableIndex);
      }
    },
    syncTypeChange() {
      this.ruleForm.isLakeHouseReal = this.seniorFormSql.isLakeHouseReal = this.configForm.syncType === 2;
    },
    typeChange(initEdit) {
      this.ruleForm.isLakeHouseMore = this.configForm.table_type === 'more';
      if (!initEdit) {
        this.configForm.connectionName = '';
        this.configForm.targetDb = '';
        this.configForm.targetTable = '';
        this.configForm.targetTable = '';
        this.changeConnectionName();
      }
      if (this.ruleForm.isLakeHouseMore) {
        this.ruleForm.outputDataset = [{}];
        this.configForm.syncType = 1;
        this.syncTypeChange();
      }
    },
    tapAddDb() {
      this.showDbInpt = true;
      this.clearDbInpt();
    },
    tapDbVisible() {
      this.configForm.targetDb = this.configForm.targetDb.toLowerCase();
      this.showDbInpt = false;
    },
    addDbItem() {
      this.$refs.addDbForm.validate(validate => {
        if (validate) {
          this.configForm.targetDb = this.addDbForm.dbItemName;
          this.$refs.dbSelect.blur();
        }
      });
    },
    clearDbInpt() {
      this.addDbForm.dbItemName = '';
    },
    changeTargetTable(type) {
      if (type === 'single') {
        this.configForm.targetTable = this.configForm.targetTable.toLowerCase();
        this.hasTableName = this.sourceTableList.some(item => {
          return this.configForm.targetTable === item.name;
        });
        this.tableRightLoading = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: 'hive',
          db: this.configForm.targetDb,
          table: this.configForm.targetTable,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive'
        }).then(res => {
          this.tableRightLoading = false;
          // 处理分区标识
          let partitionsName = '';
          if (res.data.partitionKeys && res.data.partitionKeys.length) {
            partitionsName = res.data.partitionKeys[0].name;
          } else {
            partitionsName = '';
          }
          this.configForm.partitions = [{ name: '', value: '' }];
          this.$set(this.configForm.partitions, 0, {
            name: partitionsName,
            value: ''
          });
          // 处理目标表数据
          if (res.data.columns) {
            this.columns = res.data.columns.map(item => {
              return this.regColumItem(item, true);
            });
          }
        });
      } else {
        this.moreInputColumns.forEach(item => {
          item.preMoreTableName = (this.configForm.targetTablePart + item.name).toLowerCase();
        });
        this.initMoreInputColumns.forEach(item => {
          item.preMoreTableName = (this.configForm.targetTablePart + item.name).toLowerCase();
        });
      }

      this.$forceUpdate();
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
    regColumItem(item, isSelected) {
      return {
        columnName: item.name,
        columnType: isSelected ? item.type : this.typeList.find(ele => ele === this.formatType(item.data_type).toUpperCase()) || this.typeList[0],
        columnComment: item.comment
      };
    },
    formatColumns(obj = {}) {
      if (obj.type === 'refresh') {
        // const _columns = []
        // this.inputColumns.forEach((item, index) => {
        //   if (item.isNameChange) {
        //     _columns[index] = this.regColumItem(item);
        //   } else {
        //     _columns[index] = this.columns.find(item1 => {
        //       if (item1) {
        //         return item1.columnName === item.name;
        //       }
        //     });
        //   }
        // });
      } else {
        this.columns = this.inputColumns.map(item => {
          return this.regColumItem(item);
        });
      }
      if (obj.index !== undefined) {
        this.moreInputColumns[obj.index].columns = this.columns;
        // 解决嵌套表单不显示问题
        this.$refs.moreInputColumns.toggleRowExpansion();
        this.$nextTick(() => {
          this.$refs.moreInputColumns.toggleRowExpansion();
        });
      }
    },
    async changeRegion(value, initEdit) {
      if (this.isEdit) {
        this.targetTableExit();
      }
      if (!initEdit) {
        this.configForm.connectionName = '';
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
        this.configForm.targetDb = '';
        this.configForm.targetTable = '';
        this.sourceTableList = [];
        this.moreInputColumns = [];
        this.inputColumns = [];
        this.columns = [];
      }
      if (value) {
        this.formLoading = true;
        this.targetDbList = [];
        this.connectionNameList = [];
        this.sourceLoad = true;
        this.tdbLoad = true;
        const sourceData = await (await getDataSetList({ region: value, owner: this.seniorForm.owner, type: this.configForm.dataOriginType, metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' })).data;
        this.connectionNameList = sourceData.data || [];
        if (this.configForm.connectionName) {
          this.addListItem(this.configForm.connectionName, this.connectionNameList);
        }
        this.formLoading = false;
        this.sourceLoad = false;
        const targetData = await (await getDataSetList({ region: value, type: 'hive', metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' })).data;
        this.targetDbList = targetData.data || [];
        this.tdbLoad = false;
      }
    },
    createTable() {
      this.createTableData.visible = true;
      this.createTableData.dbName = this.configForm.targetDb;
      this.createTableData.region = this.configForm.sourceRegion;
    },
    createTableEmit(name) {
      this.configForm.targetTable = name;
      this.autoCreateTable = true;
      this.configForm.partitions = [{ name: '', value: '' }];
      this.formatColumns({});
    },
    changeConnectionName(value, initEdit) {
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate();
      });
      if (!initEdit) {
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
        this.moreInputColumns = [];
        this.inputColumns = [];
        this.columns = [];
      }
      if (value) {
        const currentObj = this.connectionNameList.find(item => item.actorId === value);
        if (currentObj && currentObj.parameters) {
          this.configForm.connectionUrl = currentObj.parameters.url;
          this.configForm.dbUser = currentObj.parameters.username;
          this.configForm.dbPassword = currentObj.parameters.password;
        }
        this.sourceDbList = [{ name: currentObj.db }];
        this.configForm.sourceDb = currentObj.db;
        this.formLoading = true;
        this.sourceTableList = [];
        this.tableLoad = true;
        this.moreInputColumnsLoading = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: this.configForm.dataOriginType,
          actorId: this.configForm.connectionName,
          db: this.configForm.sourceDb,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive',
          owner: this.seniorForm.owner
        }).then(res => {
          this.moreInputColumnsLoading = false;
          const data = res.data;
          if (!initEdit) {
            this.moreInputColumns = data.data;
            this.initMoreInputColumns = JSON.parse(JSON.stringify(this.moreInputColumns));
            this.ruleForm.inputDataset = this.initInputDataset;
            this.ruleForm.outputDataset = this.initOutputDataset;
            this.changeTargetTable(this.configForm.table_type);
          }
          this.sourceTableList = data.data;
          this.formLoading = false;
          this.tableLoad = false;
        });
      }
    },
    async changeSourceTable(value, tableIndex) {
      this.isMatched = false;
      if (value) {
        // this.configForm.targetTable = ('datacake_' + value).toLowerCase();
        const currentObj = this.sourceTableList.find(item => item.name === value);
        if (currentObj) {
          this.ruleForm.inputDataset[0].id = currentObj.qualifiedName;
          this.ruleForm.inputDataset[0].guid = currentObj.guid;
        }
        if (tableIndex !== undefined) {
          this.$set(this.moreInputLoadingArr, tableIndex, true);
        }
        this.tableLeftLoading = true;
        if (this.autoCreateTable) {
          this.tableRightLoading = true;
        }
        await getDataSetList({
          region: this.configForm.sourceRegion,
          type: this.configForm.dataOriginType,
          actorId: this.configForm.connectionName,
          db: this.configForm.sourceDb,
          table: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive',
          owner: this.seniorForm.owner
        }).then(res => {
          const data = res.data;
          if (data.columns) {
            this.inputColumns = data.columns.map(item => {
              if (item.isPK) {
                this.primaryKey = item.name;
              }
              return {
                name: item.name,
                data_type: item.data_type,
                comment: item.comment,
                isPK: item.isPK
              };
            });
            // this.inputColumns = this.inputColumns.sort((val1, val2) => {
            //   if (val1.name.toLowerCase() > val2.name.toLowerCase()) {
            //     return 1;
            //   } else {
            //     return -1;
            //   }
            // });
            if (this.autoCreateTable) {
              this.formatColumns({});
              this.tableRightLoading = false;
            }
            if (tableIndex !== undefined) {
              this.moreInputColumns[tableIndex].inputColumns = this.inputColumns;
              this.moreInputColumns[tableIndex].primaryKey = this.primaryKey;
              this.$set(this.moreInputLoadingArr, tableIndex, false);
              this.formatColumns({ index: tableIndex });
            }
          }
          this.tableLeftLoading = false;
        });
      }
    },
    formatType(type) {
      switch (type) {
        case 'tinyint':
          return 'int';
        case 'smallint':
          return 'int';
        case 'mediumint':
          return 'bigint';
        case 'numeric':
          return 'decimal(20, 4)';
        case 'decimal':
          return 'decimal(20, 4)';
        default:
          return type;
      }
    },
    save(funcs, index) {
      this.$set(this.inputColumns[index], 'funcs', funcs);
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    getEngine() {
      getEngineList({
        region: this.configForm.sourceRegion,
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
    async nextStep(text) {
      if (this.currentStep === 1) {
        // 第二步
        if (this.configForm.table_type === 'more' && this.moreTableList.length < 2) {
          this.$message({
            type: 'warning',
            message: this.$t('task.dbTip14')
          });
          return;
        }
        this.$refs.ruleForm.validate(formValid => {
          if (formValid) {
            // 处理runtimeConfig中table
            if (this.configForm.table_type === 'single') {
              // 处理columns
              const baseColumns = this.columns.length > this.inputColumns.length ? this.columns : this.inputColumns;
              const columns = baseColumns.map((item, index) => {
                return { ...this.inputColumns[index], ...this.columns[index] };
              });
              this.ruleForm.inputDataset[0].metadata = {
                region: this.configForm.sourceRegion,
                type: this.configForm.dataOriginType,
                source: this.configForm.connectionName,
                db: this.configForm.sourceDb,
                table: this.configForm.sourceTable
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
              this.tables = [
                {
                  sourceTable: this.configForm.sourceTable,
                  partitions: this.configForm.partitions[0].name ? this.configForm.partitions[0].name + '=' + this.configForm.partitions[0].value : '',
                  targetTable: this.configForm.targetTable,
                  targetTablePart: this.configForm.targetTablePart,
                  existTargetTable: this.configForm.existTargetTable,
                  columns: columns,
                  primaryKey: this.primaryKey,
                  addColumns: this.addColumns
                }
              ];
            } else {
              this.tables = [];
              this.ruleForm.inputDataset = [
                {
                  metadata: {
                    region: '',
                    type: this.configForm.dataOriginType,
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
              ];
              this.moreTableList.map(async(item, index) => {
                // 处理第三步外部依赖表单
                // 新增时
                if (index > 0) {
                  const initInputDataset = JSON.parse(JSON.stringify(this.ruleForm.inputDataset[0]));
                  initInputDataset.metadata.table = item.name;
                  initInputDataset.metadata.region = this.configForm.sourceRegion;
                  initInputDataset.metadata.source = this.configForm.connectionName;
                  initInputDataset.metadata.db = this.configForm.sourceDb;
                  this.ruleForm.inputDataset.push(initInputDataset);
                } else {
                  this.ruleForm.inputDataset[0].metadata.table = item.name;
                  this.ruleForm.inputDataset[0].metadata.db = this.configForm.sourceDb;
                  this.ruleForm.inputDataset[0].metadata.region = this.configForm.sourceRegion;
                  this.ruleForm.inputDataset[0].metadata.source = this.configForm.connectionName;
                }
                const tableIndex = this.moreInputColumns.findIndex(item1 => {
                  return item1.name === item.name;
                });
                if (!item.columns) {
                  await this.changeSourceTable(item.name, tableIndex);
                }
                this.tables.push({
                  sourceTable: item.name,
                  partitions: this.configForm.partitions[0].name ? this.configForm.partitions[0].name + '=' + this.configForm.partitions[0].value : '',
                  targetTable: (this.configForm.targetTablePart + item.name).toLowerCase(),
                  targetTablePart: this.configForm.targetTablePart,
                  existTargetTable: this.configForm.existTargetTable,
                  primaryKey: item.primaryKey,
                  addColumns: this.moreInputColumns[tableIndex].addColumns,
                  columns: this.moreInputColumns[tableIndex].columns.map((item2, index) => {
                    return { ...this.moreInputColumns[tableIndex].inputColumns[index], ...item2 };
                  })
                });
              });
              if (this.ruleForm.inputDataset.length > 1) {
                // 编辑时处理第三步外部依赖表单
                this.ruleForm.inputDataset = this.ruleForm.inputDataset.filter(item => {
                  return (
                    this.moreTableList.findIndex(tableItem => {
                      return tableItem.name === item.metadata.table;
                    }) >= 0
                  );
                });
              }
              this.configForm.targetTable = this.configForm.targetTablePart + this.moreTableList.slice(-1)[0].name; // 第三步
            }
            // 新增设置默认值
            if (!this.isEdit && !this.seniorForm.engineConfig) {
              // this.getEngine();
            }
            this.currentStep++;
          }
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
        if (this.ruleForm.dependTypes.includes('event') && this.ruleForm.eventDepends.length === 0) {
          eventFlag = true;
          this.$message.warning(this.$t('task.dbTip16'));
        }
        if (eventFlag) return;
        if (!this.seniorForm.source) {
          this.seniorForm.source = this.source;
        }
        const exitDatabaseFlag = this.targetDbList.some(item => {
          return item.name === this.configForm.targetDb;
        });
        if (!exitDatabaseFlag) {
          this.configForm.exitDatabase = false;
        }
        // 处理params
        let params = {};
        if (this.configForm.syncType === 1) {
          // 全量
          if (!this.ruleForm.outputDataset[0].check && this.configForm.table_type === 'more') {
            this.ruleForm.outputDataset = [{}];
          }
          params = {
            ...tools.copyFn(this.ruleForm),
            runtimeConfig: {
              ...this.configForm,
              ...this.seniorForm,
              tables: this.tables,
              cost: this.ruleForm.cost
            }
          };
        } else {
          this.seniorFormSql.runtimeConfig = Object.assign(
            {
              ...this.configForm,
              cost: this.ruleForm.cost
            },
            { ...tools.copyFn(this.seniorFormSql.runtimeConfig) }
          );
          this.seniorFormSql.runtimeConfig.tables = this.tables;
          params = {
            runtimeConfig: {
              ...this.configForm,
              tables: this.tables,
              cost: this.ruleForm.cost,
              mysqlCdcType: this.seniorFormSql.runtimeConfig.mysqlCdcType
            },
            ...tools.copyFn(this.ruleForm),
            ...tools.copyFn(this.seniorFormSql)
          };
        }
        delete params.cost;
        delete params.runtimeConfig.partitions;
        params.inputDataset.forEach(item => {
          if (item.granularityList) {
            delete item.granularityList;
          }
          if (item.checkPathList) {
            delete item.checkPathList;
          }
        });
        if (this.queryId) {
          params.id = this.queryId;
        }
        if (!params.runtimeConfig.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        // 拷贝params，处理传参
        const paramsVal = JSON.parse(JSON.stringify(params));
        paramsVal.runtimeConfig.autoCreateTable = this.autoCreateTable;
        // 处理定时告警数据
        if (paramsVal.runtimeConfig.regularAlert && !paramsVal.runtimeConfig.regularAlert.isChecked) {
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
    },
    getPreviewData(sourceTable, index) {
      this.previewData = [];
      getPreviewData({
        type: this.configForm.dataOriginType,
        metaFlag: 'AIRBYTE',
        templateCode: 'Mysql2Hive',
        region: this.configForm.sourceRegion,
        actorId: this.configForm.connectionName,
        db: this.configForm.sourceDb,
        table: sourceTable || this.configForm.sourceTable
      }).then(async res => {
        this.previewVisible = true;
        this.previewTable = sourceTable || this.configForm.sourceTable;
        let inputColumns;
        if (!sourceTable) {
          inputColumns = this.inputColumns;
        } else {
          if (this.moreInputColumns[index].inputColumns) {
            inputColumns = this.moreInputColumns[index].inputColumns;
          } else {
            await this.changeSourceTable(sourceTable, index);
            inputColumns = this.moreInputColumns[index].inputColumns;
          }
        }
        res.data.results.map(item1 => {
          const previewItem = {};
          inputColumns.map(item2 => {
            previewItem[item2.name] = item1[item2.name];
          });
          this.previewData.push(previewItem);
        });
      });
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
      right: 20px;
      // top: 15px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 83%;
        // margin: 0 auto 18px;
      }
      .el-select,
      .el-input {
        width: 100%;
      }
      .small-input {
        width: 64px;
      }
      ::v-deep .el-form-item__content {
        position: relative;
      }
      .sql_tips,
      .tips {
        position: absolute;
        top: 0;
        right: -10px;
        transform: translateX(100%);
      }
      .quick-item {
        margin-bottom: 30px;
        .quick-action {
          position: absolute;
          right: 0;
        }
      }
      .targetTable {
        margin-bottom: 30px;
        .quickCreateTable {
          position: absolute;
          right: 0;
        }
      }
    }
    .space-between {
      display: flex;
      justify-content: space-between;
    }
    .table-btns {
      position: absolute;
      right: 0;
      z-index: 10;
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
    .state {
      font-size: $global-font-size-12;
      position: absolute;
      top: 4px;
      left: calc(50% + 25px);
      &::before {
        position: absolute;
        left: -6px;
        top: 0;
        bottom: 0;
        margin: auto;
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
      }
      &.state-success {
        &::before {
          background: #67c23a;
        }
      }
      &.state-fail {
        &::before {
          background: $color-cb;
        }
      }
    }
  }
}
.partitions_item {
  &:not(:last-child) {
    margin-bottom: 10px;
  }
  display: flex;
  align-items: center;
  .name {
    max-width: 100px;
  }
  .value {
    flex: 1;
  }
  .mark {
    margin: 0 10px;
  }
  i {
    margin-left: 10px;
    color: $c-primary;
    font-size: 22px;
    cursor: pointer;
  }
}
.tip {
  font-size: $global-font-size-12;
  color: #aaa;
  position: relative;
  top: -20px;
}
.area-select {
  width: 200px !important;
}
.preview-tip {
  font-size: 12px;
  color: #666;
}
.dy-height {
  height: 50px;
}
.dy-box {
  position: absolute;
  bottom: 0;
  text-align: center;
  background-color: #fff;
  width: 100%;
  a {
    padding: 5px 0;
    display: block;
  }
}
.dy-box-less {
  position: relative;
  height: 30px;
}
.form-head {
  .el-form-item {
    width: 100%;
    display: flex;
    justify-content: center;
    ::v-deep .el-form-item__content {
      margin-left: 10px !important;
      width: 200px;
    }
  }
}
.dy-inpt-box {
  display: flex;
  // padding-left: 15px;
  // padding-bottom: 10px;
  .el-form {
    width: 85%;
    .el-form-item {
      margin-bottom: 0 !important;
    }
    ::v-deep .el-form-item__error {
      position: relative !important;
      text-align: left;
    }
  }
  .el-icon-success {
    color: #3782ffed;
    font-size: 20px;
    margin: 0 5px;
    line-height: 35px;
  }
  .el-icon-error {
    color: #aaa;
    font-size: 20px;
    margin: 0 5px;
    line-height: 35px;
  }
}
.table-title {
  border-bottom: 2px solid #dadfeb;
  color: #3782ff;
  font-size: 14px;
  line-height: 38px;
  font-weight: 500;
  position: relative;
  height: 40px;
  margin-bottom: 15px;
  span {
    position: absolute;
  }
  .table-span1 {
    display: flex;
    position: relative;
    .inpt {
      left: 60px;
      width: 15%;
      position: absolute;
    }
    .icon-table {
      width: 30px;
      border-bottom: 2px solid #3782ff;
    }
    i {
      position: absolute;
      left: 30px;
      top: 12px;
      cursor: pointer;
    }
    .refresh {
      left: 60px;
      bottom: -30px;
      position: absolute;
      display: flex;
      align-items: center;
      .add-select {
        margin-left: 5px;
      }
      .refresh-btn {
        margin-left: 15px;
        min-width: auto !important;
      }
    }
    .refresh-select {
      bottom: -35px;
    }
  }
  .table-span2 {
    left: 45%;
    border-bottom: 2px solid #3782ff;
  }
  .table-span3 {
    left: 65%;
    border-bottom: 2px solid #3782ff;
  }
}
.more-table {
  width: 90%;
  margin: 0 auto;
}
.func-icon {
  width: 100%;
  min-width: 80px;
  min-height: 24px;
  color: $c-primary;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 5px;
  .func-icon-code {
    text-align: center;
    cursor: pointer;
  }
  .func-icon-line {
    position: relative;
    border-top: 1px solid $c-primary;
    // top: -5px;
    .circle {
      position: absolute;
      top: -4px;
      width: 6px;
      height: 6px;
      box-shadow: 0 1px 2px 0 #dbdde9;
      background-color: $c-primary;
      border-radius: 50%;
    }
    .left {
      left: 0;
    }
    .right {
      right: 0;
    }
  }
}
.preview-header {
  word-break: initial;
}
.preview-table {
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}
.preview-title {
  max-width: 70%;
}
.option-icon {
  height: 34px;
  vertical-align: middle;
  position: relative;
  left: -10px;
}
.live-btn {
  margin-left: 5px;
  color: #3782ff;
}
</style>
