<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div v-loading="contentLoading" class="step-content">
      <div v-show="currentStep === 1">
        <el-button class="open-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="ruleForm" :model="configForm" :rules="rules" class="ruleForm" label-width="180px">
          <div class="form-head">
            <el-form-item label="数据源类型" prop="sourceType">
              <el-select v-model="configForm.sourceType" class="area-select" placeholder="请选择数据源" clearable @change="changeDataOrigin">
                <el-option v-for="item in dataOriginList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="表类型选择" prop="table_type" required>
              <el-radio-group v-model="configForm.table_type" @change="typeChange">
                <el-radio label="single">单表</el-radio>
                <el-radio v-if="configForm.sourceType === 'mysql'" label="more" :disabled="true">整库/多表</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="数据同步方式" prop="syncType">
              <template slot="label"> 数据同步方式<i class="el-icon-info" style="cursor: pointer" @click="syncTypeVisible = !syncTypeVisible"></i> </template>
              <el-radio-group v-model="configForm.syncType" :disabled="!!queryId" @change="syncTypeChange">
                <el-radio :label="1">全量</el-radio>
                <el-radio v-if="configForm.sourceType === 'mysql'" :disabled="true" :label="2">实时</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item required>
              <template #label>
                <span>运行模式<i class="el-icon-info" style="cursor: pointer" @click="modeVisible = !modeVisible"></i></span>
              </template>
              <el-radio-group v-model="configForm.executeMode" @change="modeChange">
                <el-radio label="local">本地模式</el-radio>
                <el-radio label="distribution" :disabled="true">分布式模式</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <el-row>
            <el-col :span="12">
              <el-tabs>
                <el-tab-pane label="选择来源">
                  <el-form-item :label="`${formatOriginLabel()}数据源名称`" prop="sourceId" class="quick-item">
                    <el-select v-model="configForm.sourceId" placeholder="数据源名称" :loading="sourceLoad" filterable clearable @change="changeSourceName">
                      <el-option v-for="item in dataSourceList" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
                    </el-select>
                    <span v-if="!configForm.sourceRegion" class="tips">* 请先选择区域</span>
                    <div class="quick-action">
                      <el-button type="text" class="btn-text" @click="$router.push({ name: 'sourceInstance' })">新建数据源</el-button>
                    </div>
                  </el-form-item>
                  <el-form-item :label="`${formatOriginLabel()}库名`" prop="sourceDb">
                    <el-input v-model="configForm.sourceDb" :disabled="true"></el-input>
                    <span class="tips">
                      <el-tooltip effect="dark" placement="right">
                        <template #content> 点击刷新 </template>
                        <i :class="['title_tips live-btn', refreshingDb ? 'el-icon-loading' : 'el-icon-refresh']" @click="refreshDbBtn()"></i>
                      </el-tooltip>
                    </span>
                  </el-form-item>
                  <el-form-item v-if="configForm.table_type === 'single'" prop="sourceTable" class="quick-item">
                    <template #label>
                      <span>{{ formatOriginLabel() }}表名</span>
                      <i v-if="isLiveTable" class="el-icon-info" style="cursor: pointer" @click="handelInfo('liveTable', '参数提示')"></i>
                    </template>
                    <div class="table-box">
                      <el-select v-if="!isLiveTable" v-model="configForm.sourceTable" placeholder="选择表名称" :loading="tableLoad" clearable filterable @change="changeSourceTable">
                        <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                      </el-select>
                      <el-input v-else v-model="configForm.sourceTable" :placeholder="liveIpt" @blur="changeLiveTable"></el-input>
                      <span class="tips">
                        <!-- <el-tooltip effect="dark" placement="right">
                          <template #content> 点击刷新 </template>
                          <i :class="['title_tips live-btn', refreshingTable ? 'el-icon-loading' : 'el-icon-refresh']" @click="refreshTableBtn()"></i>
                        </el-tooltip> -->
                        <span v-if="!isLiveTable" type="text" class="live-btn" @click="switchLiveTable()">输入动态表名</span>
                        <span v-else>
                          <el-button type="text" class="live-btn" @click="switchLiveTable()">选择已有表</el-button>
                          <!-- <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span> -->
                        </span>
                      </span>
                    </div>
                    <span>
                      <div v-if="!isLiveTable" class="quick-action">
                        <el-button type="text" class="btn-text" @click="getPreviewData()">数据预览</el-button>
                      </div>
                      <!-- <div v-else class="quick-action live-tip">支持输入系统参数，系统参数可参照后方"提示"</div> -->
                    </span>
                  </el-form-item>
                  <el-form-item v-if="configForm.sourceType !== 'mongodb'" label="分片组件" class="quick-item">
                    <el-select v-model="configForm.splitPk" placeholder="数据源名称" filterable clearable>
                      <el-option v-for="item in splitPkList" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="configForm.table_type === 'single'" label="过滤条件" prop="filterStr">
                    <el-input v-model="configForm.filterStr" :placeholder="filterIpt" type="textarea"></el-input>
                    <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                  </el-form-item>
                </el-tab-pane>
              </el-tabs>
            </el-col>
            <el-col :span="12">
              <el-tabs>
                <el-tab-pane>
                  <span slot="label">
                    选择目标
                    <el-popover placement="bottom" width="500" trigger="hover">
                      <div>
                        1）下游目标表如果已经存在（包含表结构），则必须保证所选择的目标表结构涵盖上游表中的字段；<br />
                        2）下游目标表如果不存在，则此处支持由用户自定义输入表名，输入后，后台将根据此库表+"字段转换映射"处的“目标表”信息去创建目标表；
                      </div>
                      <i slot="reference" class="el-icon-info"></i>
                    </el-popover>
                  </span>
                  <el-form-item label="数据源名称" prop="destinationId" class="quick-item">
                    <el-select v-model="configForm.destinationId" placeholder="数据源名称" filterable clearable>
                      <el-option v-for="item in destinationList" :key="item.sourceId" :label="item.name" :value="item.sourceId"></el-option>
                    </el-select>
                    <span v-if="!configForm.sourceRegion" class="tips">* 请先选择区域</span>
                  </el-form-item>
                  <el-form-item label="LakeHouse库名" prop="targetDb">
                    <el-select
                      ref="dbSelect"
                      v-model="configForm.targetDb"
                      disabled
                      class="lake-table-select"
                      placeholder="选择数据库名称"
                      no-match-text=" "
                      :loading="tdbLoad"
                      default-first-option
                      filterable
clearable
                      @change="changeLakeHouseDb"
                    >
                      <el-option v-for="item in targetDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                      <div class="dy-box dy-box-less"></div>
                      <div class="dy-box">
                        <div>
                          <el-button type="text">+没找到？请联系admin或到元数据页面建库</el-button>
                        </div>
                      </div>
                    </el-select>
                    <span v-if="!configForm.sourceRegion" class="tips">* 请先选择区域</span>
                  </el-form-item>
                  <el-form-item v-if="configForm.table_type === 'single'" label="LakeHouse表名" prop="targetTable" class="targetTable">
                    <el-select v-if="!autoCreateTable" ref="targetTableSelect" v-model="configForm.targetTable" class="lake-table-select" placeholder="选择表名称" no-match-text=" " default-first-option filterable clearable @change="changeTargetTable('single')">
                      <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                    </el-select>
                    <!-- :disabled="isTargetTableExit && !copyId" -->
                    <el-input v-else v-model="configForm.targetTable" @blur="changeTargetTable('single')"></el-input>
                    <span v-if="!(isTargetTableExit && !copyId)">
                      <span v-if="!autoCreateTable" type="text" class="tips live-btn" @click="switchAutoTable()">自定义表名</span>
                      <span v-else>
                        <el-button type="text" class="tips live-btn" @click="switchAutoTable()">选择已有表</el-button>
                      </span>
                    </span>
                  </el-form-item>
                  <el-form-item v-else label="LakeHouse表名前缀(可选)" prop="targetTablePart" class="targetTable">
                    <el-input v-model="configForm.targetTablePart" :disabled="isEdit" @input="changeTargetTable('more')"></el-input>
                    <!-- <div style="font-size: 12px; color: #666666">输入后，下方目标表-表名跟随变化</div> -->
                  </el-form-item>
                  <el-form-item v-if="configForm.syncType !== 2" label="分区标识" prop="partitionsRules">
                    <template #label>
                      <span>分区标识</span>
                      <el-tooltip class="item" effect="dark" content="此字段标识了目标表是否每天保存一个全量数据，如果填写了分区字段，则每天往指定的分区字段中写入全量数据；否则，只保留最新一个全量数据" placement="top">
                        <i class="el-icon-info" style="cursor: pointer"></i>
                      </el-tooltip>
                    </template>
                    <div v-for="(item, index) in configForm.partitions" :key="index" class="partitions_item">
                      <el-input v-model="item.name" placeholder="分区名称" clearable class="name"></el-input>
                      <span class="mark">=</span>
                      <el-input v-model="item.value" placeholder="分区内容" clearable class="value"></el-input>
                      <i v-if="configForm.partitions.length > 1" class="el-icon-delete" @click="deletePartitions(index)"></i>
                      <i v-if="index === configForm.partitions.length - 1 && configForm.partitions.length < 3" class="el-icon-plus" :class="{ onlyAdd: configForm.partitions.length === 1 }" @click="addPartitions"></i>
                    </div>
                    <span class="tips partitions-tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
                  </el-form-item>
                  <el-form-item label="表描述" class="targetTable">
                    <el-tooltip class="item" effect="dark" :content="ruleForm.taskParam.tableComment" placement="top">
                      <el-input v-model="ruleForm.taskParam.tableComment"></el-input>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item label="安全级别" class="targetTable">
                    <el-tooltip class="item" effect="dark" :content="ruleForm.taskParam.tableLevel" placement="top">
                      <el-select v-model="ruleForm.taskParam.tableLevel">
                        <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
                      </el-select>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item label="Location" class="targetTable">
                    <el-tooltip class="item" effect="dark" :content="ruleForm.taskParam.location" placement="top">
                      <el-input v-model="ruleForm.taskParam.location" disabled></el-input>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item class="sync-num" label="读写速率" required> <el-input-number v-model="ruleForm.taskParam.bandwidth" :min="1"></el-input-number> M </el-form-item>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-form>
        <div>
          <div v-if="autoCreateTable" class="table-title">
            <span class="table-span1">
              <span class="icon-box"> <span class="icon-table">源表</span><i v-if="configForm.syncType === 1" class="el-icon-info" @click="handelInfo('originTable', '源表schema变更的几种情况说明')"></i> </span>
              <div class="refresh" :class="{ 'refresh-select': selectItemShow }">
                <el-input v-if="configForm.table_type === 'more'" v-model="moretableName" placeholder="搜索表名" clearable @keyup.enter.native="searchMoreTable"></el-input>
                <el-button v-if="configForm.table_type === 'single'" type="primary" size="mini" @click="addTableItem">添加</el-button>
                <el-select v-if="selectItemShow" v-model="tableAddItem" size="mini" class="add-select" placeholder="在当前选中表中选择字段" clearable @change="selectTableItem">
                  <el-option v-for="item in singleTableSelect" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <el-button v-if="isEdit || configForm.table_type === 'single'" type="primary" size="mini" class="refresh-btn" @click="refreshTable(configForm.table_type)">刷新源表字段</el-button>
              </div>
            </span>
            <span class="table-span2">映射</span>
            <span class="table-span3">目标表</span>
          </div>
          <div v-if="configForm.table_type === 'single'">
            <ipt-c-table
              v-if="autoCreateTable"
              ref="singleTable"
              :input-columns="inputColumns"
              :columns="columns"
              :type-list="typeList"
              :config-form="configForm"
              :input-columns-loading="inputColumnsLoading"
              :columns-loading="columnsLoading"
              :is-single="true"
              @deleteTableItem="deleteTableItem"
            ></ipt-c-table>
            <table-mapping v-else :table-obj="tableObj" @refreshTable="refreshTable(configForm.table_type)"></table-mapping>
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
                <el-table-column label="库名" align="center">
                  <template>
                    <el-tooltip :content="configForm.sourceDb" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ configForm.sourceDb || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="表名" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.name || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column label="预览" align="center" width="80px">
                  <template slot-scope="scope"> <el-button type="text" @click="getPreviewData(scope.row.name, scope.$index)">数据预览</el-button> </template>``
                </el-table-column>
                <el-table-column label="映射&转换" align="center" min-width="100">
                  <div class="func-icon">
                    <!-- <div class="func-icon-code">&lt;/&gt;</div> -->
                    <div class="func-icon-line">
                      <div class="circle left"></div>
                      <div class="circle right"></div>
                    </div>
                  </div>
                </el-table-column>
                <el-table-column label="库名" min-width="100" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.lakeHouseDbName" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.lakeHouseDbName || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="表名" min-width="100" align="center">
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
      <step-three v-if="currentStep === 2" ref="stepThree" :current-step="currentStep" :senior-form="seniorForm" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :region-list="regionList" :target-source-list="dataSourceList" :is-workflow="isWorkflow" :name-disabled="nameDisabled" :is-show-input-check="true" :is-show-output-check="true" @jumpStep="$event => (currentStep = $event)" />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form v-if="configForm.syncType === 1" ref="seniorForm" :is-show-mode="isShowMode" :run-mode-show="runModeShow" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
        <senior-sql-form v-else ref="seniorForm" :no-cluster="noCluster" :senior-form="seniorFormSql" :region="configForm.sourceRegion" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
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
    <el-info v-model="syncTypeVisible" title="数据同步方式介绍">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <div style="font-weight: 550">1、全量同步方式介绍</div>
        <div>将源端所有数据周期性全量拉取到LakeHouse，任务例行过程中，如果源发生DDL类变更，需及时关注任务运行状态。</div>
        <div style="margin-top: 10px; font-weight: 550">2、实时同步方式介绍</div>
        <div>先将源端所有数据一次性全量拉取到LakeHouse后，再实时地将增量数据拉取到LakeHouse中；整库/多表方式下不支持一键实时选项；此方式需要您提前开启MySQL客户端的Binlog设置。</div>
      </div>
    </el-info>
    <el-info v-model="modeVisible" title="运行模式介绍">
      <div style="padding: 0 16px; font-size: 14px; line-height: 24px; color: #606266">
        <p>支持本地模式与分布式模式；</p>
        <p><span style="font-weight: 550">本地模式：</span>通过固定路由提交到本地机器上执行；</p>
        <p><span style="font-weight: 550">分布式模式：</span>适用于海量数据处理的任务，提交到分布式集群上执行；</p>
      </div>
    </el-info>
    <el-dialog :visible.sync="previewVisible" :append-to-body="true">
      <div slot="title">{{ previewTable }}的数据预览 <span class="preview-tip">只显示limit 5的信息</span></div>
      <el-table v-if="previewData.length" :data="previewData">
        <el-table-column v-for="(item, index) in Object.keys(previewData[0])" :key="index" :property="item" :label="item" min-width="150px">
          <template slot="header">
            <el-tooltip effect="dark" :content="item" class="preview-header" placement="top">
              <span> {{ item }} </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-tooltip effect="dark" :content="scope.row[item]" class="preview-table" placement="top">
              <span> {{ scope.row[item] }} </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
      <origin-table-tips v-if="infoObj.msgType === 'originTable'"></origin-table-tips>
      <live-table-tips v-if="infoObj.msgType === 'liveTable'"></live-table-tips>
    </el-info>
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import SqlTips from './components/SqlTips';
import LiveTableTips from './components/LiveTableTips';
import OriginTableTips from './components/OriginTableTips';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, getPreviewData, getClusterList, getSourceOrDestination, getLiveTable } from '@/api/task';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import IptCTable from './components/lackHouseIptCTable.vue';
import TableMapping from './components/TableMapping';
import ViewParams from './components/viewParams';

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
    TableMapping,
    ViewParams,
    LiveTableTips
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
    var tableValidate = (rule, value, callback) => {
      this.targetTableList.map(item => {
        if (item.name.toLowerCase() === this.configForm.targetTable.toLocaleLowerCase() && !this.isEdit && this.autoCreateTable) {
          callback(new Error('目标表名已存在'));
          return;
        }
      });
      callback();
      // const reg = /^[a-z]+[a-z0-9-_]*$/;
      // if (!reg.test(value)) {
      //   callback(new Error('只能包含a-z,0-9或-或_；开始需为字符'));
      // } else if (this.hasTableName) {
      //   callback(new Error('表名称已存在，请重新输入'));
      // } else {
      //   callback();
      // }
    };
    var addDbValidate = (rule, value, callback) => {
      const reg = /^[a-z]+[a-z0-9-_]*$/;
      if (!reg.test(value)) {
        callback(new Error('只能包含a-z,0-9或-或_；开始需为字符'));
      } else {
        callback();
      }
    };
    var tablePreValidate = (rule, value, callback) => {
      const reg = /^[a-z]+[a-z0-9-_]*$/;
      if (value && (!reg.test(value) || value.length > 20)) {
        callback(new Error('只能包含a-z,0-9或-或_；开始需为字符'));
      } else {
        callback();
      }
    };
    var filterValidate = (rule, value, callback) => {
      callback();
      // const reg = /^[a-zA-Z0-9_-]+(<=|>=|!=|=|<|>)[a-zA-Z0-9_-]+$/;
      // if (value && (!reg.test(value) || value.length > 20)) {
      //   callback(new Error('输入内容不符合校验规则-'));
      // } else {
      //   callback();
      // }
    };
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
        { label: 'Doris', value: 'doris' },
        { label: 'Postgres', value: 'postgres' },
        { label: 'MongoDB', value: 'mongodb' },
        { label: 'Hana', value: 'hana' }
      ],
      refreshingTable: false,
      refreshingDb: false,
      destinationList: [],
      runModeShow: false,
      liveIpt: "如：tablename_{{ execution_date.strftime('%Y%m%d') }}",
      filterIpt: "如：column1='china' and column2>'yesterday_date'",
      isLiveTable: false,
      autoCreateTable: true,
      selectItemShow: false,
      singleTableSelect: [],
      tableAddItem: '',
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      partitionsValue: '',
      isEdit: false,
      isTargetTableExit: false,
      columnsArr: [],
      noCluster: false,
      initTable: '',
      expands: [],
      splitPkList: [],
      syncTypeVisible: false,
      modeVisible: false,
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
      moreTableList: [], // 多选时选中项
      moretableName: '',
      previewTable: '',
      securityList: ['1级', '2级', '3级', '4级'],
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
          // 高级设置
          owner: '',
          collaborators: [],
          dsGroups: [],
          parallelism: 1,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: [],
          alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }}
        }
      },
      seniorForm: {
        // partitions: 'dt={{ yesterday_ds }}',
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        mysqlCdcType: 'init',
        owner: '',
        checkExpirationTime: 24,
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
      ruleForm: {
        isLakeHouseReal: false,
        isLakeHouseMore: false,
        invokingStatus: true,
        templateCode: 'Mysql2Hive',
        name: '',
        folderName: '',
        folderId: '',
        description: '',
        dependTypes: [],
        taskParam: {
          location: '',
          tableComment: '',
          tableLevel: '1级',
          bandwidth: 1
        },
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
        partitions: [{ name: '', value: '' }],
        executeMode: 'local',
        sourceType: 'mysql',
        isTableList: true, // 区分旧的mysql->hive模版和新的mysql->lackhouse模版,true为新模版
        table_type: 'single',
        sourceRegion: '',
        // 数据源
        sourceId: '',
        destinationId: '',
        sourceDb: '',
        sourceTable: '',
        // 目标表
        existTargetTable: false,
        exitDatabase: true,
        targetDb: 'stage',
        targetTable: '',
        layer: 'ods',
        theme: '',
        targetTablePart: '',
        syncTypeText: 'all',
        syncType: 1,
        // 数据源用户信息
        connectionUrl: '',
        dbUser: '',
        dbPassword: '',
        filterStr: '',
        splitPk: ''
      },
      addDbRules: {
        dbItemName: [
          { required: true, message: '请输入库名', trigger: ['blur', 'change'] },
          { validator: addDbValidate, trigger: ['blur', 'change'] }
        ]
      },
      rules: {
        sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        sourceType: [{ required: true, message: '请选择数据源', trigger: ['blur', 'change'] }],
        sourceId: [{ required: true, message: '请选择数据源名称', trigger: ['blur', 'change'] }],
        destinationId: [{ required: true, message: '请选择数据源名称', trigger: ['blur', 'change'] }],
        sourceDb: [{ required: true, message: '请选择数据库名称', trigger: ['blur', 'change'] }],
        sourceTable: [{ required: true, message: '请选择表名称', trigger: ['blur', 'change'] }],
        targetDb: [{ required: true, message: '请选择数据库名称', trigger: ['blur', 'change'] }],
        theme: [{ required: true, message: '请输入主题', trigger: ['blur', 'change'] }],
        targetTable: [
          { required: true, message: '请输入目标表名称', trigger: ['blur', 'change'] },
          { validator: tableValidate, trigger: ['blur', 'change'] }
        ],
        targetTablePart: [
          { required: false, message: '请输入LakeHouse表名前缀', trigger: ['blur', 'change'] },
          { validator: tablePreValidate, trigger: ['blur', 'change'] }
        ],
        filterStr: [{ validator: filterValidate, trigger: ['blur'] }],
        name: [{ required: true, message: '请输入name', trigger: ['blur', 'change'] }],
        syncType: [{ required: true, message: '请选择数据同步方式', trigger: ['blur', 'change'] }],
        'taskParam.bandwidth': [{ required: true, message: '请填写读写速率', trigger: ['blur', 'change'] }]
      },
      sourceLoad: false,
      dbLoad: false,
      tableLoad: false,
      tdbLoad: false,
      ttabLoad: false,
      userGroupName: '',
      regionList: tools.regionList,
      typeList: ['String', 'Boolean', 'Bigint', 'Date', 'Double', 'Float', 'Int', 'Tinyint', 'Timestamp'],
      targetDbList: [],
      targetTableList: [],
      dataSourceList: [],
      sourceTableList: [],
      primaryKey: '',
      originComment: '',
      tableObj: {
        isRightEdit: false,
        isLeftEdit: false,
        isRightCopy: true,
        tableRightLoading: false,
        tableLeftLoading: false,
        leftColumns: [],
        rightColumns: [],
        dragLoading: false
      },
      addColumns: [],
      inputColumnsLoading: false,
      inputColumns: [],
      columnsLoading: false,
      columns: [],
      initMoreInputColumns: [], // 存储搜索时的数据初始值
      moreInputColumns: [],
      moreInputLoadingArr: [],
      moreInputColumnsLoading: false,
      drawerVisible: false,
      tables: [],
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
      isWorkflow: false
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
          this.isEdit = true;
          this.getTaskInfo(value);
        }
      },
      deep: true,
      immediate: true
    },
    inputColumns: {
      handler(value) {
        // this.$set(this.configForm, 'splitPk', '');
        if (value.length) {
          this.splitPkList = value.map(item => {
            return item.name;
          });
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
    'configForm.partitions': {
      handler(value) {
        this.getLocation();
      },
      deep: true
    }
  },
  created() {
    this.ruleForm.folderId = this.$route.query.folderId;
    this.seniorForm.owner = this.$store.getters.userInfo.userId;
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    this.seniorFormSql.runtimeConfig.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      this.configForm.sourceRegion = res[0].value;
      this.changeLakeHouseDb('stage');
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
    async getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      this.isLiveTable = runtimeConfig.catalog.tables[0].dynamicTable;
      // 获取configForm值
      this.configForm.sourceRegion = runtimeConfig.sourceRegion;
      this.configForm.sourceType = runtimeConfig.sourceType;
      this.configForm.sourceId = runtimeConfig.sourceId;
      this.configForm.destinationId = runtimeConfig.destinationId;
      this.configForm.table_type = runtimeConfig.catalog.table_type;
      this.configForm.syncType = runtimeConfig.catalog.sync_mode;
      this.configForm.sourceDb = runtimeConfig.catalog.sourceDb;
      // this.configForm.targetDb = runtimeConfig.catalog.targetDb;
      this.configForm.sourceTable = runtimeConfig.catalog.tables[0].sourceTable;
      this.configForm.targetTable = runtimeConfig.catalog.tables[0].targetTable;
      this.configForm.targetTablePart = runtimeConfig.catalog.tables[0].targetTablePart;
      this.initTable = this.configForm.sourceTable;
      this.configForm.filterStr = runtimeConfig.catalog.tables[0].filterStr;
      this.configForm.bandwidth = runtimeConfig.catalog.tables[0].bandwidth;
      this.configForm.splitPk = runtimeConfig.catalog.tables[0].splitPk;
      this.configForm.executeMode = runtimeConfig.executeMode;
      if (data.folderId) {
        this.ruleForm.folderId = data.folderId;
      }
      // 处理分区字段
      const partitionsArr = runtimeConfig.catalog.tables[0].partitions.split('#');
      partitionsArr.map((item, index) => {
        const splitIndex = item.indexOf('=');
        const partitionsName = item.substring(0, splitIndex);
        const partitionsValue = item.substring(splitIndex + 1);
        this.$set(this.configForm.partitions, index, {
          name: partitionsName,
          value: partitionsValue
        });
      });
      if (this.configForm.syncType === 1) {
        Object.keys(this.seniorForm).forEach(key => {
          this.seniorForm[key] = runtimeConfig.advancedParameters[key];
        });
        this.seniorForm.alertModel = runtimeConfig.alertModel ? runtimeConfig.alertModel : this.seniorForm.alertModel;
        this.seniorForm.regularAlert = runtimeConfig.regularAlert ? runtimeConfig.regularAlert : this.seniorForm.regularAlert;
      } else {
        this.seniorFormSql.flinkClusterId = data.flinkClusterId;
        Object.keys(this.seniorFormSql.runtimeConfig).forEach(key => {
          this.seniorFormSql.runtimeConfig[key] = runtimeConfig.advancedParameters[key];
        });
        this.seniorFormSql.isLakeHouseReal = data.isLakeHouseReal;
        if (data.displayDependJars && data.displayDependJars.length) {
          this.seniorFormSql.displayDependJars = data.displayDependJars;
        } else {
          this.seniorFormSql.displayDependJars = [{ artifactId: '', id: '' }];
        }
      }
      this.configForm.existTargetTable = runtimeConfig.catalog.tables[0].existTargetTable;
      this.syncTypeChange();
      this.typeChange('init');
      this.ruleForm.name = data.name;
      this.ruleForm.oldAlertList = data.oldAlertList;
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        // this.nameDisabled = false;
        this.seniorForm.owner = this.seniorFormSql.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      this.configForm.sourceType = this.configForm.sourceType ? this.configForm.sourceType : 'mysql';
      // 处理表单数据
      if (runtimeConfig.catalog.table_type === 'single') {
        this.columnsArr = Array.isArray(runtimeConfig.catalog.tables[0].columns) ? JSON.parse(JSON.stringify(runtimeConfig.catalog.tables[0].columns)) : JSON.parse(runtimeConfig.catalog.tables[0].columns);
        this.columnsArr.forEach((item, index) => {
          // 最新源表有删除后，只取与源表长度相同的目标表
          if (item.columnName) {
            this.columns.push({
              columnName: item.columnName,
              columnType: item.columnType,
              columnComment: item.columnComment,
              securityLevel: item.securityLevel
            });
          }
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
          if (obj.name) {
            this.inputColumns.push(obj);
          }
        });
      } else {
        // 多表
        runtimeConfig.catalog.tables.forEach(item => {
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
        this.moreInputColumns = runtimeConfig.catalog.tables;
        this.initMoreInputColumns = JSON.parse(JSON.stringify(runtimeConfig.catalog.tables));
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
      await this.changeRegion(this.configForm.sourceRegion, 'init');
      await this.changeSourceName(this.configForm.sourceId, 'init');
      if (runtimeConfig.taskParam) {
        this.ruleForm.taskParam = runtimeConfig.taskParam;
      } else {
        // 历史数据没有taskParam的情况
        this.getLocation();
      }
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
      this.targetTableExit();
      this.autoCreateTable = runtimeConfig.catalog.tables[0].autoCreateTable;
      if (!this.autoCreateTable) {
        this.tableObj.leftColumns = this.inputColumns;
        this.tableObj.rightColumns = this.columns;
      }
    },
    async refreshTable(type) {
      // 对比新请求的数据和回显数据，给inputColumn数据加上标识（pk,变更）
      if (type === 'more') {
        const oldMoreInputColumns = JSON.parse(JSON.stringify(this.initMoreInputColumns));
        oldMoreInputColumns.map(async(item, homeIndex) => {
          this.moreInputColumns[homeIndex].addColumns = [];
          this.moreInputColumns[homeIndex].inputColumns = [];
          this.moreInputLoadingArr[homeIndex] = true;
          await this.changeSourceTable(item.name, homeIndex); // 更新每一个
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
        this.inputColumnsLoading = true;
        this.columnsLoading = true;
        const newInputColumns = await (
          await getDataSetList({
            region: this.configForm.sourceRegion,
            type: this.configForm.sourceType,
            actorId: this.configForm.sourceId,
            db: this.configForm.sourceDb,
            table: this.configForm.sourceTable,
            metaFlag: 'AIRBYTE',
            templateCode: 'Mysql2Hive',
            clearcache: true
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

        this.inputColumnsLoading = false;
        this.columnsLoading = false;
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
    refreshTableBtn() {
      this.refreshingTable = true;
      this.changeSourceTable(this.configForm.sourceTable, '', 'refresh');
    },
    refreshDbBtn() {
      this.refreshingDb = true;
      this.changeSourceName(this.configForm.sourceId, 'refresh', 'refresh');
    },
    formatOriginLabel() {
      let label = '';
      switch (this.configForm.sourceType) {
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
        case 'postgres':
          label = 'Postgres';
          break;
        case 'mongodb':
          label = 'MongoDB';
          break;
        case 'hana':
          label = 'Hana';
          break;
      }
      return label;
    },
    getLocation() {
      let partationStr = '/';
      this.configForm.partitions.map(item => {
        if (item.name) {
          partationStr += item.name + '=' + item.value + '/';
        }
      });
      partationStr = partationStr.substring(0, partationStr.length - 1);
      this.ruleForm.taskParam.location = `/stage/${this.userGroupName}/${this.configForm.targetTable}${partationStr}`;
    },
    modeChange(val) {
      this.runModeShow = val !== 'local';
    },
    deletePartitions(index) {
      this.configForm.partitions.splice(index, 1);
    },
    addPartitions() {
      this.configForm.partitions.push({ value: '', name: '' });
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
    changeLakeHouseDb(value) {
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
    switchLiveTable() {
      this.isLiveTable = !this.isLiveTable;
      this.configForm.sourceTable = '';
    },
    switchAutoTable() {
      this.autoCreateTable = !this.autoCreateTable;
      this.configForm.partitions = [{ name: '', value: '' }];
      if (this.autoCreateTable) {
        this.configForm.targetTable = `stage_${this.configForm.sourceDb}_${this.configForm.sourceTable}_df`.toLowerCase();
        this.formatColumns({});
        this.$refs.ruleForm.validate();
        // this.getLocation()
      } else {
        this.$refs.ruleForm.clearValidate();
        this.configForm.targetTable = '';
      }
    },
    async changeLiveTable() {
      getLiveTable({ content: this.configForm.sourceTable }).then(res => {
        if (this.configForm.sourceId) {
          this.changeSourceTable(res.data).then(data => {
            if (!data.length) {
              this.$message({
                type: 'warning',
                message: '未能获取到该动态表的schema信息，可能导致任务读数失败，请检查"MySQL表名"输入项。'
              });
            }
          });
        }
      });
    },
    typeChange(init) {
      this.ruleForm.isLakeHouseMore = this.configForm.table_type === 'more';
      // this.$refs.ruleForm.clearValidate();
      if (!init) {
        this.configForm.sourceId = '';
        // this.configForm.targetDb = '';
        this.configForm.targetTable = '';
        this.configForm.targetTable = '';
        this.changeSourceName();
      }
      if (this.ruleForm.isLakeHouseMore) {
        this.ruleForm.outputDataset = [{}];
        this.configForm.syncType = 1;
        this.syncTypeChange();
      }
    },
    changeTargetTable(type) {
      if (type === 'single') {
        // this.targetTableList.map(item => {
        //   if (item.name.toLowerCase() === this.configForm.targetTable.toLocaleLowerCase() && !this.isEdit) {
        //     this.$message({
        //       type: 'error',
        //       message: '目标表名已存在'
        //     });
        //   }
        // });
        this.getLocation();
        this.hasTableName = this.sourceTableList.some(item => {
          return this.configForm.targetTable === item.name;
        });
        if (!this.autoCreateTable) {
          this.tableObj.tableRightLoading = true;
          getDataSetList({
            region: this.configForm.sourceRegion,
            type: 'hive',
            db: this.configForm.targetDb,
            table: this.configForm.targetTable,
            metaFlag: 'AIRBYTE',
            templateCode: 'Mysql2Hive'
          }).then(res => {
            this.ruleForm.taskParam.tableComment = res.data.description || this.originComment;
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
            this.ruleForm.taskParam.tableLevel = res.data.securityLevel;
            this.ruleForm.taskParam.location = res.data.location;
            this.ruleForm.taskParam.tableComment = res.data.description || this.originComment;
            // 处理目标表数据
            if (res.data.columns) {
              this.columns = res.data.columns.map(item => {
                return this.regColumItem(item, true);
              });
              this.tableObj.rightColumns = this.columns;
              this.tableObj.tableRightLoading = false;
            }
          });
        }
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
    formatType(Type) {
      const type = Type.toLowerCase().split(' ')[0];
      if (type === 'tinyint' || type === 'bigint' || type === 'bigserial' || type === 'integer' || type === 'smallint' || type === 'serial' || type === 'int' || type === 'numberic') {
        return 'Bigint';
      } else if (type === 'boolean') {
        return 'Boolean';
      } else {
        return 'String';
      }
    },
    regColumItem(item, isSelected) {
      return {
        columnName: item.name.toLowerCase(),
        columnType: isSelected ? item.type : this.typeList.find(ele => ele.toLowerCase() === this.formatType(item.data_type).toLowerCase()) || this.typeList[0],
        columnComment: item.comment,
        securityLevel: '1级'
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
      if (obj.index) {
        this.moreInputColumns[obj.index].columns = this.columns;
        // 解决嵌套表单不显示问题
        this.$refs.moreInputColumns.toggleRowExpansion();
        this.$nextTick(() => {
          this.$refs.moreInputColumns.toggleRowExpansion();
        });
      }
    },
    async changeRegion(value, init) {
      if (this.isEdit) {
        this.targetTableExit();
      }
      if (!init) {
        this.configForm.sourceId = '';
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
        // this.configForm.targetDb = '';
        this.configForm.targetTable = '';
        this.sourceTableList = [];
        this.moreInputColumns = [];
        this.inputColumns = [];
        this.configForm.splitPk = '';
        this.columns = [];
      }
      if (value) {
        this.formLoading = true;
        this.targetDbList = [];
        this.dataSourceList = [];
        this.sourceLoad = true;
        this.tdbLoad = true;
        const sourceData = await (await getDataSetList({ region: value, type: this.configForm.sourceType, metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' })).data;
        this.dataSourceList = sourceData.data || [];
        this.formLoading = false;
        this.sourceLoad = false;
        // const targetData = await (await getDataSetList({ region: value, type: 'hive', metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' })).data;
        // this.targetDbList = targetData.data || [];
        this.tdbLoad = false;
        this.getDestinationId();
      }
    },

    // 获取sourceId
    getDestinationId() {
      const params = {
        pageNum: 1,
        pageSize: 10,
        sourceName: 'iceberg',
        region: this.configForm.sourceRegion,
        sortKey: 'createTime',
        sortOrder: 'desc'
      };
      getSourceOrDestination(params).then(res => {
        this.destinationList = res.data.list;
        this.configForm.destinationId = this.destinationList[0].sourceId;
      });
    },

    changeSourceName(value, init, isRfresh) {
      if (!init) {
        this.configForm.sourceDb = '';
        this.configForm.sourceTable = '';
        this.moreInputColumns = [];
        this.inputColumns = [];
        this.configForm.splitPk = '';
        this.columns = [];
      }
      if (value) {
        this.dataSourceList.forEach(item => {
          if (item.actorId === value) {
            this.userGroupName = item.userGroupName;
          }
        });
        this.getLocation();
        const currentObj = this.dataSourceList.find(item => item.actorId === value);
        if (currentObj && currentObj.parameters) {
          this.configForm.connectionUrl = currentObj.parameters.url;
          this.configForm.dbUser = currentObj.parameters.username;
          this.configForm.dbPassword = currentObj.parameters.password;
        }
        this.configForm.sourceDb = currentObj.db;
        this.formLoading = true;
        this.sourceTableList = [];
        this.tableLoad = true;
        this.moreInputColumnsLoading = true;
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: this.configForm.sourceType,
          actorId: this.configForm.sourceId,
          db: this.configForm.sourceDb,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive',
          clearCache: !!isRfresh
        }).then(res => {
          this.moreInputColumnsLoading = false;
          const data = res.data;
          if (!init) {
            this.moreInputColumns = data.data;
            this.initMoreInputColumns = JSON.parse(JSON.stringify(this.moreInputColumns));
            this.ruleForm.inputDataset = this.initInputDataset;
            this.ruleForm.outputDataset = this.initOutputDataset;
          }
          // this.changeTargetTable(this.configForm.table_type);
          this.sourceTableList = data.data;
          this.formLoading = false;
          this.tableLoad = false;
          this.refreshingDb = false;
        });
      }
    },
    async changeSourceTable(value, tableIndex, isRefresh) {
      this.isMatched = false;
      if (value) {
        // this.configForm.targetTable = ('datacake_' + this.configForm.sourceTable).toLowerCase();
        // this.targetTableList.map(item => {
        //   if (item.name.toLowerCase() === this.configForm.targetTable.toLocaleLowerCase() && !this.isEdit) {
        //     this.$message({
        //       type: 'error',
        //       message: '目标表名已存在'
        //     });
        //   }
        // });
        // 获取源表描述
        const commentItem = this.sourceTableList.find(item => item.name === value);
        this.originComment = commentItem.comment;
        this.ruleForm.taskParam.tableComment = commentItem.comment;
        const currentObj = this.sourceTableList.find(item => item.name === this.configForm.sourceTable);
        if (currentObj) {
          this.ruleForm.inputDataset[0].id = currentObj.qualifiedName;
          this.ruleForm.inputDataset[0].guid = currentObj.guid;
        }
        if (tableIndex) {
          this.$set(this.moreInputLoadingArr, tableIndex, true);
        }
        this.inputColumnsLoading = true;
        this.tableObj.tableLeftLoading = true;
        await getDataSetList({
          region: this.configForm.sourceRegion,
          type: this.configForm.sourceType,
          actorId: this.configForm.sourceId,
          db: this.configForm.sourceDb,
          table: value,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive',
          clearCache: !!isRefresh
        })
          .then(res => {
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
              if (tableIndex !== undefined) {
                this.moreInputColumns[tableIndex].inputColumns = this.inputColumns;
                this.moreInputColumns[tableIndex].primaryKey = this.primaryKey;
                this.$set(this.moreInputLoadingArr, tableIndex, false);
              }
              this.tableObj.leftColumns = this.inputColumns;
              if (this.autoCreateTable) {
                this.formatColumns({ index: tableIndex });
              }
            }
            this.inputColumnsLoading = false;
            this.tableObj.tableLeftLoading = false;
            if (this.autoCreateTable) {
              this.configForm.targetTable = `stage_${this.configForm.sourceDb}_${this.configForm.sourceTable}_df`.toLowerCase();
            }
            this.getLocation();
          })
          .catch(() => {});
        return Promise.resolve(this.inputColumns);
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
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    getPreviewData(sourceTable, index) {
      this.previewData = [];
      getPreviewData({
        type: this.configForm.sourceType,
        metaFlag: 'AIRBYTE',
        templateCode: 'Mysql2Hive',
        region: this.configForm.sourceRegion,
        actorId: this.configForm.sourceId,
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
          // 兼容有时后端返回字段为大写的情况
          for (const key in item1) {
            item1[key.toLowerCase()] = item1[key];
          }
          const previewItem = {};
          inputColumns.map(item2 => {
            previewItem[item2.name] = item1[item2.name];
          });
          this.previewData.push(previewItem);
        });
      });
    },
    // 将本地对象转换成传参对象
    localToParams(params) {
      // 拷贝params，处理传参
      const paramsVal = JSON.parse(JSON.stringify(params));
      const runtimeConfig = {
        isNewFormat: true,
        sourceRegion: this.configForm.sourceRegion,
        executeMode: this.configForm.executeMode,
        sourceType: this.configForm.sourceType,
        sourceId: this.configForm.sourceId,
        destinationType: 'iceberg',
        destinationId: this.configForm.destinationId,
        taskParam: this.ruleForm.taskParam,
        catalog: {
          table_type: this.configForm.table_type,
          sync_mode: this.configForm.syncType,
          sourceDb: this.configForm.sourceDb,
          targetDb: this.configForm.targetDb,
          tables: this.tables
        },
        advancedParameters: this.configForm.syncType === 1 ? this.seniorForm : this.seniorFormSql.runtimeConfig,
        alertModel: this.seniorForm.alertModel,
        regularAlert: this.seniorForm.regularAlert,
        cost: this.ruleForm.cost
      };
      paramsVal.runtimeConfig = runtimeConfig;
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
      return paramsVal;
    },
    async nextStep(text) {
      if (this.currentStep === 1) {
        // 第二步
        if (this.configForm.table_type === 'more' && this.moreTableList.length < 2) {
          this.$message({
            type: 'warning',
            message: '至少选择2项表映射'
          });
          return;
        }
        this.$refs.ruleForm.validate(formValid => {
          if (formValid) {
            if (!this.copyId && !this.isEdit) {
              this.ruleForm.name = `imp_${this.configForm.targetTable}`;
            }
            // 处理分区信息
            let partitions = '';
            this.configForm.partitions.map(item => {
              const partitionsItem = item.name ? item.name + '=' + item.value : '';
              partitions += partitionsItem + '#';
            });
            partitions = partitions.substring(0, partitions.length - 1);
            // 处理runtimeConfig中table
            if (this.configForm.table_type === 'single') {
              this.ruleForm.inputDataset[0].metadata = {
                region: this.configForm.sourceRegion,
                type: this.configForm.sourceType,
                source: this.configForm.sourceId,
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
              let columns = [];
              if (this.columns.length > this.inputColumns.length) {
                columns = this.columns.map((item, index) => {
                  return { ...this.inputColumns[index], ...item };
                });
              } else {
                columns = this.inputColumns.map((item, index) => {
                  return { ...this.columns[index], ...item };
                });
              }
              this.tables = [
                {
                  dynamicTable: this.isLiveTable,
                  autoCreateTable: this.autoCreateTable,
                  sourceTable: this.configForm.sourceTable,
                  partitions: partitions,
                  targetTable: this.configForm.targetTable,
                  targetTablePart: this.configForm.targetTablePart,
                  existTargetTable: this.configForm.existTargetTable,
                  filterStr: this.configForm.filterStr,
                  bandwidth: this.configForm.bandwidth,
                  splitPk: this.configForm.splitPk,
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
                    type: this.configForm.sourceType,
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
                  initInputDataset.metadata.source = this.configForm.sourceId;
                  initInputDataset.metadata.db = this.configForm.sourceDb;
                  this.ruleForm.inputDataset.push(initInputDataset);
                } else {
                  this.ruleForm.inputDataset[0].metadata.table = item.name;
                  this.ruleForm.inputDataset[0].metadata.db = this.configForm.sourceDb;
                  this.ruleForm.inputDataset[0].metadata.region = this.configForm.sourceRegion;
                  this.ruleForm.inputDataset[0].metadata.source = this.configForm.sourceId;
                }
                const tableIndex = this.moreInputColumns.findIndex(item1 => {
                  return item1.name === item.name;
                });
                if (!item.columns) {
                  await this.changeSourceTable(item.name, tableIndex);
                }
                this.tables.push({
                  sourceTable: item.name,
                  partitions: partitions,
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
            ...tools.copyFn(this.ruleForm)
          };
        } else {
          params = {
            ...tools.copyFn(this.ruleForm),
            oldAlertList: this.seniorFormSql.oldAlertList,
            isLakeHouseReal: this.seniorFormSql.isLakeHouseReal,
            displayDependJars: this.seniorFormSql.displayDependJars,
            flinkClusterId: this.seniorFormSql.flinkClusterId
          };
        }
        delete params.cost;
        // delete params.runtimeConfig.partitions;
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
      width: 50%;
    }
  }
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
        .preview-btn {
          right: 100px;
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
  .partitions_item {
    position: relative;
  }
  .partitions-tips {
    right: -25px !important;
  }
  .el-icon-delete {
    position: absolute;
    top: 0;
    right: -20px;
    font-size: 16px;
    line-height: 32px;
    color: #ff5656;
    cursor: pointer;
  }
  .el-icon-plus {
    position: absolute;
    top: 0;
    right: -40px;
    margin-left: 5px;
    font-size: 16px;
    line-height: 32px;
    color: #3782ff;
  }
  .onlyAdd {
    right: -20px;
  }
  .table-pre {
    display: flex;
    margin-bottom: 15px;
    div {
      width: 500px;
      display: flex;
      align-items: center;
      span {
        min-width: 60px;
      }
    }
    .level-box {
      width: 200px;
      margin-left: 30px;
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
}
.dy-box-less {
  position: relative;
  height: 35px;
}
.form-head {
  .el-form-item {
    width: 100%;
    display: flex;
    justify-content: center;
    ::v-deep .el-form-item__content {
      margin-left: 10px !important;
      width: 230px;
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
    left: 56%;
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
.table-box {
  display: flex;
}
.live-btn {
  margin-left: 5px;
  color: #3782ff;
}
.live-tip {
  color: rgb(210, 215, 229);
  left: 0;
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
.btn-text {
  font-size: 12px;
}
</style>
