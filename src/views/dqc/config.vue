<template>
  <el-card v-loading="detailLoading" class="box-card-container">
    <el-page-header class="header" content="配置DQC" @back="goBack"></el-page-header>
    <el-form ref="form" :model="params" :rules="rules" class="form-content" label-width="120px">
      <el-tabs type="border-card" class="box-tab">
        <el-tab-pane label="规则配置">
          <el-form-item label="监控名称" prop="name">
            <el-input v-model="params.name" placeholder="请输入监控名称，60个字符" clearable maxlength="60" show-word-limit style="width: 100%"></el-input>
          </el-form-item>
          <el-form-item prop="project" label="选择业务">
            <el-select v-model="params.project" placeholder="请选择业务" clearable style="width: 100%">
              <template v-for="(item, index) in projectList">
                <el-option :key="index" :label="item" :value="item"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item prop="sourceType" label="数据源类型">
            <el-radio-group v-model="params.sourceType">
              <template v-for="(item, index) in dataSourceList">
                <el-radio :key="index" :label="item.value">{{ item.name }}</el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="params.sourceType === 'hive'" label="关联SLA">
            <el-autocomplete
              v-model.trim="params.slaName"
              :fetch-suggestions="slaList"
              value-key="name"
              placeholder="输入关联SLA，支持输入词模糊搜索，只能添加一个"
              :trigger-on-focus="false"
              clearable
              style="width: 100%"
              @select="handleSelectSla"
              @keyup.enter.native="search"
              @change="handleClearSla"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item v-if="params.sourceType === 'clickhouse'" label="选择数据集" :rules="{ required: true }">
            <el-row :gutter="5">
              <el-col :span="5">
                <el-form-item prop="dataRegion" style="margin-bottom: 0">
                  <el-select v-model="params.dataRegion" placeholder="请选择区域" clearable filterable style="width: 100%" allow-create @change="changeDataSource">
                    <el-option v-for="item in dataRegionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item prop="dataSource" style="margin-bottom: 0">
                  <el-select v-model="params.dataSource" placeholder="请选择数据源名称" clearable filterable allow-create style="width: 100%" :disabled="!params.dataRegion" @change="changeDataRegion" @clear="handleClearRegion">
                    <el-option v-for="item in dataSourceNameList" :key="item.name" :label="item.name" :value="item.actorId"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item prop="dataSet" style="margin-bottom: 0">
                  <el-select v-model="params.dataSet" placeholder="请选择数据库" clearable filterable allow-create style="width: 100%" :disabled="!params.dataSource" @change="changeDataSet">
                    <el-option v-for="item in dataSetList" :key="item.name" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item prop="dataTable" style="margin-bottom: 0">
                  <el-select v-model="params.dataTable" placeholder="请选择数据表" clearable filterable allow-create style="width: 100%" :disabled="!params.dataSet">
                    <el-option v-for="item in tableList" :key="item.name" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item v-if="params.sourceType === 'hive'" label="选择数据集" :rules="{ required: true }">
            <el-row :gutter="5">
              <el-col :span="7">
                <el-form-item prop="dataRegion" style="margin-bottom: 0">
                  <el-select v-model="params.dataRegion" placeholder="请选择区域" clearable filterable allow-create style="width: 100%" @change="changeDataRegion" @clear="handleClearRegion">
                    <el-option v-for="item in dataRegionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item prop="dataSet" style="margin-bottom: 0">
                  <el-select v-model="params.dataSet" placeholder="请选择数据库" clearable filterable allow-create style="width: 100%" :disabled="searchSlaStatus || !params.dataRegion" @change="changeDataSet">
                    <el-option v-for="item in dataSetList" :key="item.name" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item prop="dataTable" style="margin-bottom: 0">
                  <el-select v-model="params.dataTable" placeholder="请选择数据表" clearable filterable allow-create style="width: 100%" :disabled="searchSlaStatus || !params.dataSet">
                    <el-option v-for="item in tableList" :key="item.name" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="监控周期" prop="checkInterval">
            <el-radio-group v-model="params.checkInterval">
              <el-radio :label="0">天</el-radio>
              <el-radio :label="1">小时</el-radio>
            </el-radio-group>
            <div class="tips">提示：目前仅支持天级别、小时级别周期的数据集。</div>
          </el-form-item>
          <el-form-item label="基线时间" prop="checkTime">
            <template v-if="params.checkInterval === 0"> <el-input-number v-model="params.checkHourTime" controls-position="right" :min="0" :max="23" style="width: 90px"> </el-input-number> 时 </template>
            <el-input-number v-model="params.checkMinuteTime" controls-position="right" :min="0" :max="60" style="width: 90px"></el-input-number> 分
            <div class="tips">提示：监控开始的时间。</div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <div class="rule-module">
        <div class="add-rules" @click="handleAddRule"><i class="el-icon-circle-plus"></i></div>
        <el-tabs type="border-card" class="rules-tab box-tab">
          <el-tab-pane label="设置条件">
            <template v-for="(item, index) in params.rules.ruleList">
              <el-card :key="`rules_${index}`" class="rule-card">
                <div slot="header" class="clearfix">
                  <span>{{ `条件${index + 1}` }}</span>
                  <div v-if="index !== 0" class="minus-rules" @click="handleMinusRule(index)"><i class="el-icon-remove"></i></div>
                </div>
                <el-form-item label="规则模板" :rules="{ required: true }">
                  <el-row :gutter="5">
                    <el-col :span="4">
                      <el-form-item :prop="'rules.ruleList.' + index + '.ruleType'" :rules="{ required: true, message: '请选择规则类型', trigger: 'change' }" style="margin-bottom: 0">
                        <el-select v-model="item.ruleType" placeholder="请选择规则类型" clearable @change="handleChangeRuleType($event, index)">
                          <template v-for="(subItem, subIndex) in ruleTypeList">
                            <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                          </template>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="4">
                      <el-form-item :prop="'rules.ruleList.' + index + '.ruleFrom'" :rules="{ required: true, message: '请选择模板', trigger: 'change' }" style="margin-bottom: 0">
                        <el-select v-model="item.ruleFrom" placeholder="请选择规则来源" disabled clearable>
                          <template v-for="(subItem, subIndex) in ruleFromList">
                            <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                          </template>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="15">
                      <el-form-item :prop="'rules.ruleList.' + index + '.templateId'" :rules="{ required: true, message: '请选择模板', trigger: 'change' }" style="margin-bottom: 0">
                        <el-tooltip class="item" effect="dark" content="请选择规则类型后请求模板列表" placement="top-start">
                          <el-select v-model="item.templateId" placeholder="请选择模板" clearable @change="handleChangeTemplate($event, index)">
                            <template v-for="(subItem, subIndex) in item.templateList">
                              <el-option :key="subIndex" :label="subItem.name" :value="subItem.id"></el-option>
                            </template>
                          </el-select>
                        </el-tooltip>
                        <span>没找到模板？<a href="javascript:;" @click="handleCreate">去新建</a></span>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>

                <template v-for="(subItem, subIndex) in item.fieldList">
                  <el-form-item :key="subIndex" label="参数定义" :rules="{ required: true }">
                    <el-row :gutter="5">
                      <el-col :span="4">
                        <el-form-item style="margin-bottom: 0">
                          <el-input v-model="subItem.templateField" disabled placeholder="请输入参数名" clearable></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item :prop="'rules.ruleList.' + index + '.fieldList.' + subIndex + '.tableField'" :rules="{ required: true, message: '请选择参数', trigger: 'change' }" style="margin-bottom: 0">
                          <!-- <el-tooltip class="item" effect="dark" content="选择数据表请求参数类型列表" placement="top-start"> -->
                          <el-select v-model="subItem.tableField" :clearable="true" filterable allow-create placeholder="请选择参数">
                            <template v-for="(grandItem, grandIndex) in tableFieldList">
                              <el-option :key="grandIndex" :label="grandItem.name" :value="grandItem.name"></el-option>
                            </template>
                          </el-select>
                          <!-- </el-tooltip> -->
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form-item>
                </template>

                <div v-if="item.templateId" v-loading="item.ruleLoading">
                  <el-form-item label="Sql表达式" :prop="'rules.ruleList.' + index + '.sqlStatement'" :rules="{ required: true, message: '请输入Sql表达式', trigger: 'change' }">
                    <el-input v-model="item.sqlStatement" type="textarea" placeholder="请输入Sql表达式" clearable style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="过滤条件">
                    <el-input v-model="item.sqlCondition" type="textarea" placeholder="请输入过滤条件" clearable style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="校验类型" :prop="'rules.ruleList.' + index + '.checkType'" :rules="{ required: true, message: '请选择校验类型', trigger: 'change' }">
                    <el-select v-model="item.checkType" placeholder="请选择校验类型" clearable style="width: 100%" @change="handleCheckType($event, index)">
                      <template v-for="(subItem, subIndex) in checkTypeList">
                        <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="校验方式" :prop="'rules.ruleList.' + index + '.checkAction'" :rules="{ required: true, message: '请选择校验方式', trigger: 'change' }">
                    <el-select v-model="item.checkAction" clearable placeholder="请选择校验方式" style="width: 100%" :disabled="!item.checkType">
                      <template v-for="(subItem, subIndex) in item.checkActionList">
                        <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                </div>
                <el-form-item label="比较方式" :prop="'rules.ruleList.' + index + '.checkOperator'" :rules="{ required: true, message: '请选择比较方式', trigger: 'change' }">
                  <el-select v-model="item.checkOperator" clearable placeholder="请选择比较方式" style="width: 100%" :disabled="!item.checkType">
                    <template v-for="(subItem, subIndex) in item.checkOperatorList">
                      <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                    </template>
                  </el-select>
                </el-form-item>

                <el-form-item v-if="item.checkType === 'NUMBER'" label="阈值" :prop="'rules.ruleList.' + index + '.checkValue.fixedValue'" :rules="{ required: true, message: '请选择阈值', trigger: 'change' }">
                  <el-input v-model="item.checkValue.fixedValue"></el-input>
                </el-form-item>
                <el-form-item v-if="item.checkType === 'RATIO'" label="波动值比较" :prop="'rules.ruleList.' + index + '.slideValue'" :rules="{ required: true, message: '请滑动波动值比较', trigger: 'change' }">
                  <el-slider v-model="item.slideValue" range :show-tooltip="true" :marks="marks" @change="handleSlideValue($event, index)"> </el-slider>
                </el-form-item>
                <el-form-item v-if="item.checkType === 'RATIO'"></el-form-item>
                <el-form-item v-if="item.checkType === 'RATIO'" label="橙色阈值">
                  <el-input v-model="item.checkValue.min" disabled style="width: 25%">
                    <template slot="append">%</template>
                  </el-input>
                  <el-input v-model="item.checkValue.max" disabled style="width: 25%">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>

                <el-form-item label="强弱规则" :prop="'rules.ruleList.' + index + '.ruleMandatory'">
                  <el-radio-group v-model="item.ruleMandatory">
                    <template v-for="(subItem, subIndex) in ruleMandatoryList">
                      <el-radio :key="subIndex" :label="subItem.value">{{ subItem.name }}</el-radio>
                    </template>
                  </el-radio-group>
                </el-form-item>
              </el-card>
              <el-form-item v-if="index < params.rules.ruleList.length - 1" :key="`operator_${index}`">
                <el-select v-model="item.operators" style="width: 70px; position: relative; left: -170px">
                  <template v-for="(subItem, subIndex) in ruleOperatorsList">
                    <el-option :key="subIndex" :label="subItem.name" :value="subItem.value"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </template>

            <el-form-item prop="description" label="描述">
              <el-input v-model="params.description" type="textarea" placeholder="请输入描述" clearable style="width: 100%"></el-input>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-tabs type="border-card" class="box-tab">
        <el-tab-pane label="告警配置">
          <el-form-item label="钉钉群token" prop="alertGroupIds">
            <el-input v-model="params.alertGroupIds" type="textarea" rows="3" placeholder="请输入钉钉群token"></el-input>
            <a class="link" href="https://shimo.im/docs/rp3OVQDlyKu99bAm" target="blank">怎么获取token？</a>
            <div class="tips">示例：b597305058dcf7f566e05b63f350bb82cbe079ee54d2ec09f3a61631587b3b4c</div>
          </el-form-item>
          <el-form-item label="此群需要@">
            <el-select v-model="mobile" placeholder="请输入用户ID" clearable filterable remote :remote-method="remoteMethod" :loading="ownerLoading" popper-class="custom-popper" @change="handleChangeOwner">
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.mobile" :label="item.name">
                <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.mobile }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-tabs type="border-card" class="box-tab">
        <el-tab-pane label="任务关联">
          <el-form-item label="添加关联任务" prop="taskName">
            <el-autocomplete
              v-model.trim="params.taskName"
              :fetch-suggestions="querySearch"
              value-key="name"
              placeholder="输入关联任务，支持下拉联想，模糊搜索"
              :trigger-on-focus="false"
              clearable
              style="width: 100%"
              @select="handleSelect"
              @keyup.enter.native="search"
              @change="handleClear"
            ></el-autocomplete>

            <el-table v-if="taskTable.length" v-loading="taskLoading" style="margin-top: 20px" :data="taskTable" highlight-current-row border>
              <el-table-column label="任务ID" align="center" prop="id" width="150"> </el-table-column>
              <el-table-column label="任务名称" align="center" prop="name"> </el-table-column>
              <el-table-column label="责任人" align="center" prop="createBy"> </el-table-column>
            </el-table>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-tabs type="border-card" class="box-tab">
        <el-tab-pane label="启停状态">
          <el-form-item label="启停状态" prop="active">
            <el-radio-group v-model="params.active">
              <template v-for="(item, index) in activeList">
                <el-radio :key="index" :label="item.value">{{ item.name }}</el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <el-form-item style="margin-top: 40px">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="btnDisabled" :disabled="btnDisabled" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { getDataSetList, getUserList, getDisplayDdl, searchName, getTaskInfo } from '@/api/task';
import { slaList, slaInfo } from '@/api/sla';
import { templatePages, MetricAdd, MetricInfo, MetricUpdate, templateInfo } from '@/api/dqc';
import * as tools from '@/utils/tools';

export default {
  name: 'DqcConfigInfo',
  data() {
    return {
      ownerLoading: false,
      taskLoading: false,
      detailLoading: false,
      ruleLoading: false,
      id: this.$route.query.id,
      ruleId: this.$route.query.ruleId,
      mobile: '',
      guid: '',
      rules: {
        name: [{ required: true, message: '请输入监控名称', trigger: ['blur', 'change'] }],
        project: [{ required: true, message: '请选择业务', trigger: ['blur', 'change'] }],
        sourceType: [{ required: true, message: '请选择数据源类型', trigger: ['blur', 'change'] }],
        dataRegion: [{ required: true, message: '请选择区域', trigger: 'change' }],
        dataSource: [{ required: true, message: '请选择数据源名称', trigger: 'change' }],
        dataSet: [{ required: true, message: '请选择数据库', trigger: 'change' }],
        dataTable: [{ required: true, message: '请选择数据表', trigger: 'change' }],
        checkInterval: [{ required: true, message: '请选择监控周期', trigger: 'change' }],
        checkTime: [{ required: true, message: '请选择基线时间', trigger: 'change' }],
        description: [{ required: true, message: '请输入描述', trigger: 'change' }],
        alertGroupIds: [{ required: true, message: '请输入钉钉群token', trigger: ['blur', 'change'] }]
      },
      searchSlaStatus: false,
      projectList: this.$t('dqc.projectList'),
      dataSourceList: this.$t('dqc.dataSourceList'),
      ruleTypeList: this.$t('dqc.ruleTypeList'),
      ruleFromList: this.$t('dqc.ruleFromList'),
      checkTypeList: this.$t('dqc.checkTypeList'),
      checkActionLists: this.$t('dqc.checkActionList'),
      checkOperatorLists: this.$t('dqc.checkOperatorList'),
      ruleMandatoryList: this.$t('dqc.ruleMandatoryList'),
      activeList: this.$t('dqc.activeList'),
      ruleOperatorsList: this.$t('dqc.ruleOperatorsList'),
      slaLists: [],
      templateList: [],
      tableFieldList: [],
      taskTable: [],
      marks: {
        0: '0%',
        100: {
          style: {
            fontSize: '12px',
            width: '150px',
            textAlign: 'center'
          },
          label: this.$createElement('span', '100%')
        }
      },

      dataRegionList: [],
      dataSourceNameList: [],
      dataSetList: [],
      tableList: [],
      ownerList: [],
      btnDisabled: false,

      params: {
        name: '',
        project: '',
        sourceType: 'clickhouse',
        slaName: null,
        slaId: null,
        taskId: null,
        taskName: null,
        active: 1,
        alertGroupIds: '',
        alertLevel: 1,
        checkHourTime: null,
        checkInterval: 0,
        checkMinuteTime: null,
        checkTime: '',
        dataSource: '',
        dataRegion: '',
        dataSet: '',
        dataTable: '',
        dataGuid: '',
        owner: '',
        ownerName: '',
        rules: {
          ruleOperators: [],
          ruleList: [
            {
              ruleType: '',
              templateId: null,
              ruleFrom: 'PLATFORM',
              checkType: '',
              checkOperator: '',
              checkAction: '',
              ruleMandatory: 'WEAK',
              sqlStatement: '',
              sqlCondition: '',
              operators: 'AND',
              ruleLoading: false,
              fieldList: [
                {
                  templateField: '',
                  tableField: ''
                }
              ],
              checkValue: {
                fixedValue: '',
                min: '',
                max: ''
              },
              slideValue: [0, 100],
              checkActionList: [],
              checkOperatorList: [],
              templateList: []
            }
          ]
        }
      },

      ruleItem: {
        ruleType: '',
        templateId: null,
        ruleFrom: 'PLATFORM',
        checkType: '',
        checkOperator: '',
        checkAction: '',
        ruleMandatory: 'WEAK',
        sqlStatement: '',
        sqlCondition: '',
        operators: 'AND',
        ruleLoading: false,
        fieldList: [
          {
            templateField: '',
            tableField: ''
          }
        ],
        checkValue: {
          fixedValue: '',
          min: '',
          max: ''
        },
        slideValue: [0, 100],
        checkActionList: [],
        checkOperatorList: [],
        templateList: []
      }
    };
  },
  watch: {
    'params.sourceType'(val) {
      if (this.id) return;
      this.params.dataRegion = '';
      this.params.dataSource = '';
      this.params.dataSet = '';
      this.params.dataTable = '';
    },
    'params.dataTable'(val) {
      if (!val) return;
      if (this.searchSlaStatus) return;
      // if (!this.id) {
      //   const guid = this.tableList.length ? this.tableList.find(e => e.name === val)['guid'] : '';
      //   if (!guid) return;
      //   this.params.dataGuid = guid;
      //   this.guid = guid;
      //   this.getDataSetColumns();
      // } else {
      //   if (this.params.dataGuid) {
      //     this.guid = this.params.dataGuid;
      //     this.getDataSetColumns();
      //   }
      // }
      this.getDataSetColumns();
    },
    'params.checkInterval'(val) {
      this.params.checkTime = '';
      if (val === 1) {
        this.params.checkHourTime = null;
        this.params.checkMinuteTime = null;
      }
    },
    'params.checkHourTime'(val) {
      let h = null;
      if (val === undefined) h = 0;
      else h = val;
      this.params.checkTime = `${parseInt(h) < 10 ? '0' + h : h}:${!this.params.checkMinuteTime ? '00' : this.params.checkMinuteTime < 10 ? '0' + this.params.checkMinuteTime : this.params.checkMinuteTime}`;
    },
    'params.checkMinuteTime'(val) {
      let m = null;
      if (val === undefined) m = 0;
      else m = val;
      this.params.checkTime = `${!this.params.checkHourTime ? '00' : this.params.checkHourTime < 10 ? '0' + this.params.checkHourTime : this.params.checkHourTime}:${parseInt(m) < 10 ? '0' + m : m}`;
    }
  },
  created() {
    tools.regionList.then(res => {
      this.dataRegionList = res;
    });
    if (this.ruleId) {
      // 更新规则
      this.templateInfo();
    }
    if (this.id) {
      this.metricInfo();
    }
  },
  methods: {
    // 模板详情
    templateInfo() {
      this.params.rules.ruleList[0].ruleLoading = true;
      templateInfo({ id: this.ruleId }).then(res => {
        this.params.rules.ruleList[0].ruleLoading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        const ruleItem = Object.assign({}, this.params.rules.ruleList[0], data);
        ruleItem.checkActionList = this.checkActionLists[ruleItem.checkType];
        ruleItem.checkOperatorList = this.checkOperatorLists[ruleItem.checkType];
        if (ruleItem.ruleType === 'FIELD') ruleItem.fieldList[0].templateField = ruleItem.ruleType;
        ruleItem.templateId = ruleItem.id;
        ruleItem.id = null;

        if (ruleItem.checkValue.min && ruleItem.checkValue.max) {
          ruleItem.slideValue = [ruleItem.checkValue.min, ruleItem.checkValue.max];
        }
        templatePages({ id: null, ruleType: ruleItem.ruleType, pageNo: 1, pageSize: 100000000 }).then(res => {
          if (res.resultCode !== 0) {
            this.$message({
              type: 'error',
              message: res.msg || '服务端错误'
            });
            return;
          }
          const data = res.data;
          ruleItem.templateList = data.list;
          this.$set(this.params.rules.ruleList, [0], ruleItem);
        });
      });
    },
    // 配置详情
    metricInfo() {
      this.detailLoading = true;
      MetricInfo({ id: this.id }).then(res => {
        this.detailLoading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        const checkTime = data.checkTime.split(':');
        const hour = checkTime[0];
        const min = checkTime[1];
        data.slaName = null;
        data.sourceType = data.sourceType.toLowerCase();

        data.rules.ruleList.forEach((ele, i) => {
          ele.checkActionList = this.checkActionLists[ele.checkType];
          ele.checkOperatorList = this.checkOperatorLists[ele.checkType];
          if (typeof ele.checkValue.min === 'number' && typeof ele.checkValue.max === 'number') {
            ele.slideValue = [ele.checkValue.min, ele.checkValue.max];
          }
          if (i < data.rules.ruleList.length - 1) {
            ele.operators = this.ruleOperatorsList.find(e => e.value === data.rules.ruleOperators[i])['value'];
          }
        });

        if (data.slaId) this.getSlaInfo(data.slaId);

        this.params = Object.assign({}, this.params, data);
        this.params.checkHourTime = parseInt(hour);
        this.params.checkMinuteTime = parseInt(min);
        this.mobile = data.ownerName;
        if (this.params.taskId) {
          this.getTaskInfo(this.params.taskId);
        }

        // ruleType
        const templateList = [];
        this.params.rules.ruleList.forEach((ele, i) => {
          const request = templatePages({ id: ele.templateId, ruleType: ele.ruleType, pageNo: 1, pageSize: 100000000 });

          templateList.push(request);
        });
        Promise.all(templateList).then(res => {
          res.forEach((ele, i) => {
            if (ele.resultCode !== 0) {
              this.$message({
                type: 'error',
                message: res.msg || '服务器错误'
              });
              return;
            }
            const list = ele.data.list;
            this.$set(this.params.rules.ruleList[i], 'templateList', list);
          });
        });
      });
    },
    getSlaInfo(id) {
      slaInfo({ id }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        this.params.slaName = data.name;
        this.params.dataGuid = data.dataGuid;
      });
    },
    templatePages() {
      templatePages({ pageNo: 1, pageSize: 100000000 }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        this.templateList = data.list;
      });
    },
    getDataSetColumns() {
      const params = {
        region: this.params.dataRegion,
        type: this.params.sourceType,
        db: this.params.dataSet,
        table: this.params.dataTable,
        metaFlag: 'AIRBYTE'
      };
      if (this.params.sourceType === 'clickhouse') {
        params.actorId = this.params.dataSource;
      }
      getDataSetList(params).then(res => {
        const data = res.data;
        this.tableFieldList = data.columns;
      });
    },
    slaList(name, cb) {
      slaList({ name }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data || [];
        cb(data);
      });
    },
    handleSelectSla(item) {
      this.params.dataRegion = item.dataRegion;
      this.params.dataSet = item.dataSet;
      this.params.dataTable = item.dataTable;
      this.params.slaId = item.id;
      if (!this.params.dataRegion && !this.params.dataSet && !this.params.dataTable) {
        this.searchSlaStatus = false;
      } else {
        this.searchSlaStatus = true;
      }

      // if (item.dataGuid) {
      //   this.guid = item.dataGuid;
      //   this.getDataSetColumns();
      // }
      this.getDataSetColumns();
      const checkTime = item.checkTime.split(':');
      this.params.checkHourTime = checkTime[0];
      this.params.checkMinuteTime = checkTime[1];
    },
    handleClearSla() {
      this.searchSlaStatus = false;
      this.params.dataRegion = '';
      this.params.dataSet = '';
      this.params.dataTable = '';
    },
    querySearch(queryString, cb) {
      searchName(queryString).then(res => {
        const data = res.data;
        let arr = [];
        if (data) {
          arr = data;
          this.slaLists = arr;
        } else {
          arr = [];
        }
        cb(arr);
      });
    },
    getTaskInfo(id) {
      this.taskLoading = true;
      getTaskInfo({ id }).then(res => {
        this.taskLoading = false;
        const data = res.data;
        const arr = [];
        arr.push(res);
        this.taskTable = arr;
      });
    },
    handleSelect(val) {
      this.getTaskInfo(val.id);
      this.params.taskId = val.id;
    },
    handleClear() {
      this.taskTable = [];
    },
    goBack() {
      // if (!this.ruleId) this.$router.push('/dqc/list');
      // else this.$router.push('/dqc/ruleList');
      if (!this.ruleId) this.$router.push({ name: 'DqcList' });
      else this.$router.push({ name: 'DqcRuleList' });
      // DqcList
    },
    handleCheckType(val, index) {
      this.params.rules.ruleList[index].checkActionList = this.checkActionLists[val];
      this.params.rules.ruleList[index].checkAction = '';
      this.params.rules.ruleList[index].checkOperator = '';
      this.params.rules.ruleList[index].checkOperatorList = this.checkOperatorLists[val];
    },
    handleAddRule() {
      if (this.params.rules.ruleList.length > 2) {
        this.$message({
          type: 'warning',
          message: '最多添加3个条件'
        });
        return;
      }
      const ruleItem = JSON.parse(JSON.stringify(this.ruleItem));
      this.params.rules.ruleList.push(ruleItem);
    },
    handleMinusRule(index) {
      this.params.rules.ruleList.splice(index, 1);
    },
    handleSlideValue(val, index) {
      this.params.rules.ruleList[index].checkValue.min = val[0];
      this.params.rules.ruleList[index].checkValue.max = val[1];
    },
    changeDataSource(value) {
      this.dataSourceNameList = [];
      if (value) {
        getDataSetList({
          region: this.params.dataRegion,
          type: this.params.sourceType,
          metaFlag: 'AIRBYTE'
        }).then(res => {
          if (res.data) {
            this.dataSourceNameList = res.data.data;
          }
        });
      }
    },
    changeDataRegion(value) {
      this.dataSetList = [];
      if (this.params.sourceType === 'clickhouse') {
        if (value) {
          const selectedObj = this.dataSourceNameList.find(item => item.actorId === value);
          if (selectedObj) {
            this.dataSetList = [{ name: selectedObj.db }];
            this.params.dataSet = selectedObj.db;
          }
          getDataSetList({
            region: this.params.dataRegion,
            type: this.params.sourceType,
            actorId: value,
            db: this.params.dataSet,
            metaFlag: 'AIRBYTE'
          }).then(res => {
            if (res.data) {
              this.tableList = res.data.data;
            }
          });
        }
      } else {
        if (value) {
          this.searchSlaStatus = false;
          getDataSetList({
            region: value,
            type: this.params.sourceType,
            metaFlag: 'AIRBYTE'
          }).then(res => {
            if (res.data) {
              this.dataSetList = res.data.data;
            }
          });
        }
      }
    },
    changeDataSet(value) {
      this.tableList = [];
      if (this.params.sourceType === 'clickhouse') {
        // if (value) {
        //   getDataSetList({
        //     region: this.params.dataRegion,
        //     type: this.params.sourceType,
        //     datasource: this.params.dataSource,
        //     db: value
        //   }).then(res => {
        //     if (res.data) {
        //       this.tableList = res.data;
        //     }
        //   });
        // }
      } else {
        if (value) {
          getDataSetList({
            region: this.params.dataRegion,
            type: this.params.sourceType,
            db: value,
            metaFlag: 'AIRBYTE'
          }).then(res => {
            if (res.data) {
              this.tableList = res.data.data;
            }
          });
        }
      }
    },
    handleClearRegion() {
      if (this.params.sourceType === 'clickhouse') {
        this.params.dataSet = '';
        this.params.dataTable = '';
      } else {
        this.params.dataSet = '';
        this.params.dataTable = '';
      }
    },
    handleChangeRuleType(val, index) {
      const v = val.toLowerCase();
      this.params.rules.ruleList[index].fieldList.forEach(ele => {
        ele.templateField = v;
      });

      // ruleType
      this.params.rules.ruleList[index].templateId = null;
      templatePages({ id: null, ruleType: val, pageNo: 1, pageSize: 100000000 }).then(res => {
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        this.params.rules.ruleList[index].templateList = data.list;
      });
    },
    handleChangeTemplate(val, index) {
      this.params.rules.ruleList[index].ruleLoading = true;
      templateInfo({ id: val }).then(res => {
        this.params.rules.ruleList[index].ruleLoading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        const ruleItem = Object.assign({}, this.params.rules.ruleList[index], data);
        if (ruleItem.ruleType === 'FIELD') ruleItem.fieldList[0].templateField = ruleItem.ruleType;
        ruleItem.templateId = ruleItem.id;
        ruleItem.checkOperatorList = this.checkOperatorLists[ruleItem.checkType];
        ruleItem.checkActionList = this.checkActionLists[ruleItem.checkType];
        ruleItem.id = null;
        this.$set(this.params.rules.ruleList, [index], ruleItem);
      });
    },
    handleCreate() {
      // this.$router.push('/dqc/ruleModel');
      this.$router.push({ name: 'DqcRuleModelConfig' });
    },
    remoteMethod(query, shareId) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
          if (shareId) {
            const obj = this.ownerList.find(item => item.shareId === shareId);
            this.params.ownerPhone = obj ? obj.Mobile : '';
          }
        });
      } else {
        this.ownerList = [];
      }
    },
    handleChangeOwner(val) {
      this.params.owner = val;
      this.params.ownerName = this.ownerList.find(e => e.mobile === val)['name'];
    },
    save() {
      const params = JSON.parse(JSON.stringify(this.params));
      params.rules.ruleOperators = [];
      params.rules.ruleList.forEach((e, i) => {
        if (i === params.rules.ruleList.length - 1) return;
        params.rules.ruleOperators.push(e.operators);
      });

      params.sourceType = params.sourceType.toUpperCase();
      this.$refs.form.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          if (!this.id) {
            MetricAdd(params)
              .then(res => {
                if (res.resultCode !== 0) {
                  this.$message({
                    type: 'error',
                    message: res.msg || '服务端错误'
                  });
                  return;
                }
                this.$message({
                  type: 'success',
                  message: '新增监控成功'
                });
                // this.$router.push('/dqc/list');
                this.$router.push({ name: 'DqcList' });
              })
              .finally(() => {
                this.btnDisabled = false;
              });
          } else {
            MetricUpdate(params)
              .then(res => {
                if (res.resultCode !== 0) {
                  this.$message({
                    type: 'error',
                    message: res.msg || '服务端错误'
                  });
                  return;
                }
                this.$message({
                  type: 'success',
                  message: '编辑监控配置成功'
                });
                // this.$router.push('/dqc/list');
                this.$router.push({ name: 'DqcList' });
              })
              .finally(() => {
                this.btnDisabled = false;
              });
          }
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.box-card-container {
  padding: 0 0 0 1%;
  ::v-deep .el-card__body {
    padding-top: 0;
  }
}
.header {
  padding: 0 15px;
  line-height: 50px;
  border-bottom: 1px solid #dcdfe6;
}
.link {
  font-size: $global-font-size-12;
  margin-left: 15px;
}
.tips {
  color: #909399;
}
.rule-module {
  position: relative;
}
.rule-card {
  margin-bottom: 20px;
  ::v-deep .el-card__body {
    padding: 20px;
  }
}
.add-rules {
  position: absolute;
  top: 4px;
  right: 25px;
  z-index: 1000;

  i {
    font-size: $global-font-size-30;
  }
}
.minus-rules {
  float: right;
  i {
    font-size: $global-font-size-30;
  }
}
.box-tab {
  margin-bottom: 20px;
}
.rules-tab {
  ::v-deep .el-tabs__content {
    overflow: unset;
  }
}
</style>
