<!--  chenyh1 -->
<template>
  <el-card class="task-detail box-card-container">
    <div name="instance" label="实例信息">
      <div class="search-condition-wrap">
        <div class="search-group">
          <search-item width="120px" :span="8" label="任务名称" class="custom-search">
            <el-autocomplete v-model.trim="params.name" class="search-input" size="small" popper-class="suggest-input" :fetch-suggestions="querySearch" value-key="name" placeholder="任务名称" :trigger-on-focus="false" clearable @keyup.enter.native="search">
              <template slot-scope="{ item }">
                <el-tooltip effect="dark" :content="item.name" placement="left-end">
                  <div>{{ item.name }}</div>
                </el-tooltip>
              </template>
            </el-autocomplete>
          </search-item>
          <search-item width="120px" label="执行入参时间" :span="8" class="custom-search">
            <el-date-picker
              v-model="timeRange"
              class="search-input"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
              style="width: 350px"
              :picker-options="pickerOptions"
              @change="changeTime"
            >
            </el-date-picker>
          </search-item>
          <search-item width="120px" label="运行状态" :span="8" class="custom-search">
            <el-select v-model="params.state" class="search-input" placeholder="请选择运行状态" clearable>
              <el-option v-for="(value, key) in statusCodeList" :key="key" :label="value" :value="key"></el-option>
            </el-select>
          </search-item>
          <search-item width="120px" :span="8" label="任务类型" class="custom-search">
            <el-select v-model="params.template_code" class="search-input" size="small" placeholder="任务类型" clearable @change="search">
              <el-option-group v-for="(group, key) in templateCodeList" :key="key" :label="key">
                <el-option v-for="item in group" :key="item.code" :label="item.value" :value="item.code"></el-option>
              </el-option-group>
            </el-select>
          </search-item>
          <search-item width="120px" label="调度类型" :span="8" class="custom-search">
            <el-select v-model="params.schedule_type" class="search-input" placeholder="请选择调度类型" clearable>
              <el-option v-for="(item, key) in dispatchTypeList" :key="key" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </search-item>
          <search-item width="120px" label="调度周期" :span="8" class="custom-search">
            <el-select v-model="params.cycle" class="search-input" placeholder="请选择调度周期" clearable>
              <el-option v-for="(item, key) in dispatchTimeList" :key="key" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </search-item>
          <search-item width="120px" :span="8" label="负责人" class="custom-search">
            <el-select
              v-model="params.owner"
              placeholder="请输入负责人"
              size="small"
              clearable
              filterable
              remote
              allow-create
              default-first-option
              :remote-method="remoteMethod"
:loading="ownerLoading"
              class="search-input"
              popper-class="custom-popper"
              @change="search('createBy')"
            >
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
                <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
            <div class="check-content">
              <el-checkbox v-if="isShowSelf" v-model="checked" class="custom-checkbox" style="margin-left: 5px" @change="changeCheck">只看自己</el-checkbox>
            </div>
          </search-item>
          <span class="btns">
            <el-button type="primary" size="small" icon="el-icon-search" @click="search"></el-button>
            <el-button type="primary" size="small" :disabled="batchClearLoading" @click="batchClear">批量重算</el-button>
            <el-button type="danger" size="small" @click="batchStop">批量停止</el-button>
          </span>
        </div>
      </div>

      <!-- <div class="right-opertate">
        <el-button type="primary" size="small" :disabled="batchClearLoading" @click="batchClear">批量重算</el-button>
        <el-button type="danger" size="small" @click="batchStop">批量停止</el-button>
      </div> -->
      <div class="table-wrap">
        <el-table ref="multipleTable" v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '0', height: '36px' }" height="calc(100vh - 200px)" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" :selectable="selectableFn"></el-table-column>
          <el-table-column label="任务ID" width="80" align="center" prop="taskId"></el-table-column>
          <el-table-column label="任务名称" min-width="220" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.name" placement="top" :disabled="isTipDisabled">
                <a class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row)">{{ scope.row.name }}</a>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="负责人" align="center" prop="owner" min-width="100"></el-table-column>
          <el-table-column v-if="showId" prop="genie_job_id" label="实例ID" min-width="180" align="center">
            <template slot-scope="scope">
              <el-tooltip v-if="scope.row.genie_job_id" :content="scope.row.genie_job_id" :disabled="isTipDisabled">
                <span class="ellipsis block jump" @click="jumpLog(scope.row)" @mouseenter="isShowTooltip">{{ scope.row.genie_job_id }}</span>
              </el-tooltip>
              <template v-else> - </template>
            </template>
          </el-table-column>
          <el-table-column prop="execution_date" label="执行入参时间" min-width="180" align="center">
            <template slot-scope="scope">
              {{ scope.row.execution_date ? $utils.parseTime(Number(scope.row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="state" label="运行状态" min-width="120" align="center">
            <template slot-scope="scope">
              <el-tag :color="stateColorFn(statusCodeList[scope.row.state])" effect="dark">{{ statusCodeList[scope.row.state] || scope.row.state }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="任务类型" min-width="180" align="center">
            <template slot-scope="scope">
              {{ formatTemplateCode(scope.row.template_code) }}
            </template>
          </el-table-column>
          <el-table-column prop="state" label="运行次数" min-width="80" align="center">
            <template slot-scope="scope">
              <el-button v-if="scope.row.try_number" type="text" @click="openRecord(scope.row)">{{ scope.row.try_number }}次</el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="task_type" label="调度类型" align="center">
            <template slot-scope="scope">
              {{ formatTaskType(scope.row.task_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="granularity" label="调度周期" align="center">
            <template slot-scope="scope">
              {{ formatGranularity(scope.row.granularity) }}
            </template>
          </el-table-column>
          <el-table-column prop="start_date" label="任务开始时间" min-width="160" align="center">
            <template slot-scope="scope">
              {{ scope.row.start_date ? $utils.parseTime(Number(scope.row.start_date)) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="end_date" label="任务结束时间" min-width="160" align="center">
            <template slot-scope="scope">
              {{ scope.row.end_date ? $utils.parseTime(Number(scope.row.end_date)) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="任务耗时" min-width="140" align="center"> </el-table-column>
          <el-table-column fixed="right" label="操作" min-width="230" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" :style="{ color: isAdmin || scope.row.isOwnerOrCollaborator ? '#e6a23c' : '#d1d7e6' }" :disabled="!(isAdmin || scope.row.isOwnerOrCollaborator)" @click="checkError(scope.row)">检查上游</el-button>
              <el-button type="text" size="mini" :disabled="scope.row.state === 'waiting' || !((isAdmin || scope.row.isOwnerOrCollaborator) && scope.row.online)" @click="repeatCalc(scope.row)">{{ scope.row.state === 'termination' ? '重新启动检查' : '重算' }}</el-button>
              <el-button
                type="text"
                size="mini"
                :style="{ color: (isAdmin || scope.row.isOwnerOrCollaborator) && scope.row.online ? '#FF5656' : '#d1d7e6' }"
                :disabled="scope.row.state === 'termination' || !((isAdmin || scope.row.isOwnerOrCollaborator) && scope.row.online)"
                @click="stop(scope.row)"
              >停止</el-button>
              <el-button type="text" size="mini" :disabled="!scope.row.isScanSparkUI || scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || scope.row.isOwnerOrCollaborator) || !scope.row.spark_ui" @click="getUI(scope.row)">Spark UI</el-button>
              <el-button type="text" size="mini" :disabled="!scope.row.isScanSqlCmd" @click="getSql(scope.row)">{{ scope.row.templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange"> </el-pagination>
      </div>
    </div>
    <el-dialog title="停止" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择" :disabled="statusDisabled">
            <el-option label="成功" :value="1"></el-option>
            <el-option label="失败" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="batchStopLoading" @click="save">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="`${templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览'}-${version === 0 ? '最新' : 'V' + version}`" :visible.sync="dialogVisibleSql" :close-on-click-modal="false" width="800px">
      <div v-loading="sqlLoading" class="monaco-editor-wrap">
        <monaco-editor v-show="content" ref="monaco" v-model="content" :read-only="true"></monaco-editor>
        <el-empty v-show="!content" :image-size="100"></el-empty>
      </div>
    </el-dialog>
    <el-dialog title="检查上游" :visible.sync="dialogVisibleCheck" class="error-dialog" width="70%">
      <div slot="title" style="font-size: $global-font-size-16">
        检查上游
        <el-tooltip effect="dark" content="边框实线与虚线用以区分内部or外部数据；背景灰色代表任务下线；边框颜色用以区分当前实例状态" placement="bottom">
          <i class="el-icon-info" style="color: #409eff"></i>
        </el-tooltip>
      </div>
      <div class="text-center mb10">当前实例：{{ currentCase.name }}&nbsp;&nbsp;&nbsp; {{ currentCase.executionDate }}</div>
      <div class="legend">
        <div style="position: absolute">
          <span class="inside-color">内部数据</span>
          <el-tooltip effect="dark" content="代表非本平台产出的数据" placement="bottom">
            <span class="outside-color">外部数据</span>
          </el-tooltip>
        </div>
        <span class="outline-color">下线</span>
        <span class="waiting-color">检查上游</span>
        <span class="waiting-queue">排队中</span>
        <span class="running-color">运行中</span>
        <span class="success-color">成功</span>
        <span class="failed-color">失败</span>
        <div style="position: absolute; right: 0; bottom: 0">
          <div class="dashed"></div>
          <i class="el-icon-caret-right dash-caret"></i>
          中间有省略节点
        </div>
      </div>
      <div v-loading="dialogLoading">
        <DAG
          v-if="errorData.instance && errorData.instance.length && errorData.relation && errorData.relation.length"
          class="dag"
          :shapes="errorData.instance"
          :relations="errorData.relation"
          :options="{
            idKey: 'nodeId',
            sourceKey: 'source',
            targetKey: 'target',
            titleKey: titleKey,
            jumpUrl(data) {
              return !data.recursion && !data.external ? '/task/detail' : '';
            }
          }"
          :node-class="nodeClass"
        >
          <template slot-scope="{ data }">
            <el-tooltip effect="dark" placement="bottom">
              <div slot="content" class="data-tooltip">
                <div v-if="data.recursion">该节点代表该依赖链路上被省略的中间实例</div>
                <template v-else>
                  <div v-if="!data.external">任务名称：{{ data.dagId }}</div>
                  <div>{{ data.external ? '数据' : '实例' }}日期：{{ data.executionDate }}</div>
                  <div>数据集类型：{{ data.external ? '外部' : '内部' }}</div>
                  <div>数据集名称：{{ data.metadataId }}</div>
                  <template v-if="data.external">
                    <div>检查路径：{{ data.checkPath || '-' }}</div>
                    <div>完成时间：{{ data.successDate || '-' }}</div>
                  </template>
                  <template v-else>
                    <div>任务负责人：{{ data.owner || '-' }}</div>
                    <div>任务开始时间：{{ data.start_date || '-' }}</div>
                    <div>任务结束时间：{{ data.end_date || '-' }}</div>
                  </template>
                </template>
              </div>
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
        </DAG>
        <div v-else class="no-data">未检查到上游实例</div>
      </div>
    </el-dialog>
    <el-dialog title="运行记录" :visible.sync="dialogVisibleRecord" width="1120px">
      <el-table v-loading="recordLoading" :data="recordList" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
        <el-table-column type="index" label="运行次数" width="85" align="center"></el-table-column>
        <el-table-column prop="genie_job_id" label="实例ID" min-width="160" align="center">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.genie_job_id" :content="scope.row.genie_job_id" :disabled="isTipDisabled">
              <span class="ellipsis block jump" @click="jumpLog(scope.row)" @mouseenter="isShowTooltip">{{ scope.row.genie_job_id }}</span>
            </el-tooltip>
            <template v-else> - </template>
          </template>
        </el-table-column>
        <el-table-column prop="execution_date" label="执行入参时间" min-width="175" align="center">
          <template slot-scope="scope">
            {{ scope.row.execution_date ? $utils.parseTime(Number(scope.row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="state" label="运行状态" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag :color="stateColorFn(statusCodeList[scope.row.state])" effect="dark">{{ statusCodeList[scope.row.state] || scope.row.state }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="任务开始时间" min-width="135" align="center">
          <template slot-scope="scope">
            {{ scope.row.start_date ? $utils.parseTime(Number(scope.row.start_date)) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="end_date" label="任务结束时间" min-width="135" align="center">
          <template slot-scope="scope">
            {{ scope.row.end_date ? $utils.parseTime(Number(scope.row.end_date)) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="任务耗时" min-width="120" align="center"></el-table-column>
        <el-table-column prop="task_type" label="调度类型" min-width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.task_type === 'backCalculation'">补数</span>
            <span v-else-if="scope.row.task_type === 'clear_backCalculation'">重算</span>
            <span v-else-if="scope.row.task_type === 'pipeline'">正常调度</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="操作" min-width="190" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" :disabled="!scope.row.isScanSparkUI || scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || scope.row.isOwnerOrCollaborator) || !scope.row.spark_ui" @click="getUI(scope.row)">Spark UI</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || scope.row.isOwnerOrCollaborator) || !scope.row.isScanKibana" @click="getLogs(scope.row)">Kibana日志</el-button>
            <el-button type="text" size="mini" :disabled="!scope.row.isScanSqlCmd" @click="getSql(scope.row)">{{ scope.row.templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title="$t('taskInfo.repeat')" :visible.sync="dialogVisibleClear" :close-on-click-modal="false" width="500px">
      <el-form label-width="250px">
        <el-form-item :label="$t('taskInfo.repeatTips')">
          <el-radio-group v-model="isCheckUpstream">
            <el-radio :label="true">{{ $t('common.yes') }}</el-radio>
            <el-radio :label="false">{{ $t('common.no') }}</el-radio>
          </el-radio-group>
          <el-popover placement="bottom" trigger="hover" popper-class="tag-popper" width="180">
            <div>{{ $t('taskInfo.relyTips') }}</div>
            <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff; position: relative; left: -366px"></i>
          </el-popover>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleClear = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveClear">{{ $t('common.sure') }}</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import SearchItem from '@/components/SearchItem/index.vue';
import { getTemplateList, searchName, getUserList } from '@/api/task';
import { getOfflineDetailPage, getLogsUi, clearTask, stopTaskInstace, diagnoseError, permission, getExeSql, getRecord, batchClearFn, batchStopFn } from '@/api/taskDetail'; // getUrl,
import MonacoEditor from '@/components/MonacoEditor/index';
import DAG from '@/components/DAG';
import * as tools from '@/utils/tools';
import { parseTime } from '@/utils';
import { mapGetters, mapMutations } from 'vuex';
const timer = parseTime(new Date(), '{y}-{m}-{d}');

export default {
  components: {
    SearchItem,
    MonacoEditor,
    DAG
  },
  data() {
    return {
      tabItem: 'instance',
      timeRange: [timer + ' 00:00:00', timer + ' 23:59:59'],
      templateCode: '',
      params: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        state: '', // 任务状态
        start_date: '',
        end_date: '',
        cycle: '', // 周期
        schedule_type: '', // 调度类型
        template_code: '',
        userId: JSON.parse(sessionStorage.getItem('userInfo')).id
      },
      total: 0,
      loading: false,
      tableData: [],
      ownerList: [],
      isShowSelf: false,
      statusCodeList: {
        waiting: '检查上游',
        termination: '终止检查上游',
        // waiting_queue: '等待调度队列资源中',
        waiting_queue: '排队中',
        running: '运行中',
        up_for_retry: '等待重试',
        failed: '失败',
        success: '成功'
      },
      templateCodeList: {},
      dispatchTypeList: [
        { label: '正常调度', value: 'pipeline' },
        { label: '重跑', value: 'clear_backCalculation' },
        { label: '补数', value: 'backCalculation' }
      ],
      dispatchTimeList: [
        { label: '月', value: 'monthly' },
        { label: '周', value: 'weekly' },
        { label: '天', value: 'daily' },
        { label: '小时', value: 'hourly' },
        { label: '分钟', value: 'minutely' }
      ],
      dialogVisible: false,
      form: {
        name: '',
        executionDate: '',
        flinkUrl: '',
        status: 1
      },
      clearRow: {},
      ownerLoading: false,
      statusDisabled: false,
      multipleSelection: [],
      keyWordResults: [],
      dialogVisibleCheck: false,
      dialogLoading: false,
      errorData: {},
      isTipDisabled: false,
      costLoading: false,
      costUrl: '',
      isShow: false,
      isCheckUpstream: true,
      execution_date: '',
      showId: true,
      dialogVisibleSql: false,
      dialogVisibleClear: false,
      batchSelecttion: false,
      content: '',
      version: 1,
      currentCase: {
        name: this.$route.query.name,
        executionDate: ''
      },
      sqlLoading: false,
      dialogVisibleRecord: false,
      recordLoading: false,
      recordList: [],
      isBatchStop: false, // 标识是否批量重算
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() >= new Date(new Date(new Date().toLocaleDateString()).getTime() + 1000 * 60 * 60 * 24);
        }
      },
      batchClearLoading: false,
      batchStopLoading: false
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'userInfo'])
  },
  created() {
    clearTimeout(this.initTimer);
    this.loading = true;
    this.params.instanceId = this.$route.query.instanceId;
    this.changeTime(this.timeRange);
    this.getList();
    this.initTimer = setInterval(() => {
      this.getList();
    }, 1000 * 20);
    this.$nextTick(() => {
      // 离开页面时 取消循环请求, 进入页面后重新请求
      document.addEventListener('visibilitychange', this.handelGetList);
    });
    this.getTemplateList();
  },
  destroyed() {
    document.removeEventListener('visibilitychange', this.handelGetList);
    clearTimeout(this.initTimer);
    this.REMOVE_TASKPAGEOPTIONS();
  },
  methods: {
    ...mapMutations(['REMOVE_TASKPAGEOPTIONS']),
    stateColorFn(state) {
      let stateColor;
      switch (state) {
        case '检查上游':
          stateColor = 'rgb(215, 189, 242)';
          break;
        case '排队中':
          stateColor = 'rgb(135, 224, 240)';
          break;
        case '运行中':
          stateColor = 'rgb(55, 130, 255)';
          break;
        case '成功':
          stateColor = 'rgb(103, 194, 58)';
          break;
        case '失败':
          stateColor = 'rgb(241, 13, 21)';
          break;
        case '终止检查上游':
          stateColor = 'rgb(241, 13, 21)';
          break;
        case '等待重试':
          stateColor = '#e6a23c';
          break;
        default:
          break;
      }
      return stateColor;
    },
    formatTaskType(data) {
      let type;
      switch (data) {
        case 'pipeline':
          type = '正常调度';
          break;
        case 'clear_backCalculation':
          type = '重跑';
          break;
        case 'backCalculation':
          type = '补数';
          break;
      }
      return type;
    },
    formatGranularity(data) {
      let granularity;
      switch (data) {
        case 'monthly':
          granularity = '月';
          break;
        case 'weekly':
          granularity = '周';
          break;
        case 'daily':
          granularity = '天';
          break;
        case 'hourly':
          granularity = '小时';
          break;
        case 'minutely':
          granularity = '分钟';
          break;
      }
      return granularity;
    },
    formatTemplateCode(data) {
      let code;
      Object.keys(this.templateCodeList).some(key => {
        return this.templateCodeList[key].some(item => {
          code = item.value;
          return item.code === data;
        });
      });
      return code;
    },
    selectableFn(row, rowIndex) {
      return (this.isAdmin || row.isOwnerOrCollaborator) && row.online;
    },
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },

    querySearch(queryString, cb) {
      searchName(queryString).then(res => {
        const data = res.data;
        if (data) {
          this.keyWordResults = data;
        } else {
          this.keyWordResults = [];
        }
        cb(this.keyWordResults);
      });
    },
    getTemplateList() {
      // 获取任务类型数据
      getTemplateList().then(res => {
        const data = res.data;
        data.sort.forEach(item => {
          this.templateCodeList[item.code] = data[item.code];
        });
        this.$forceUpdate();
      });
    },
    jumpLog(data) {
      if (!data.genie_job_url) return;
      const url = data.genie_job_url;
      window.open('/api-gateway/ds_task/task/instanceLog?url=' + url, '_blank');
    },
    handelGetList() {
      if (!document.hidden) {
        clearTimeout(this.initTimer);
        this.getList();
        this.initTimer = setInterval(() => {
          this.getList();
        }, 1000 * 20);
      } else {
        clearTimeout(this.initTimer);
      }
    },
    titleKey(data) {
      let title = data.recursion ? '... ...' : data.dagId + '<br/>' + data.executionDate;
      if (data.nodeId === this.errorData.coreTaskId) {
        title += '(当前实例)';
      }
      if (data.taskId) {
        title = data.taskId + '<br/>' + title;
      }
      return title;
    },
    nodeClass(data) {
      // let className = data.ready ? 'success-color' : 'warning-color';
      let className;
      if (data.state === 'waiting' || data.state === 'waiting_queue') {
        className = 'waiting-color';
      } else if (data.state === 'waiting_queue') {
        className = 'waiting-queue';
      } else if (data.state === 'running' || data.state === 'up_for_retry') {
        className = 'running-color';
      } else if (data.state === 'success') {
        className = 'success-color';
      } else if (data.state === 'failed' || data.state === 'termination') {
        className = 'failed-color';
      }
      if (data.online === false) {
        className += ' outline-color';
      }
      if (data.nodeId === this.errorData.coreTaskId) {
        // className += data.ready ? ' success-bg' : ' warning-bg';
        className += ' bold';
      }
      if (data.recursion) {
        className += ' width100';
      }
      if (data.external) {
        className += ' dash-border';
      }
      return className;
    },
    gotoDetail(row) {
      if (row.isStreamingTemplateCode) {
        const Link = this.$router.resolve({
          path: '/task/info',
          query: {
            id: row.id
          }
        });
        window.open(Link.href, '_blank');
      } else {
        // 离线任务
        const Link = this.$router.resolve({
          path: '/task/detail',
          query: {
            id: row.id,
            name: row.name
          }
        });
        window.open(Link.href, '_blank');
      }
    },
    clickPermission() {
      permission().then(data => {
        this.isShow = true;
        localStorage.setItem('permission', '1');
      });
    },
    getList() {
      Object.keys(this.params).forEach(item => {
        if (!this.params[item]) delete this.params[item];
      });
      getOfflineDetailPage({
        ...this.params
      }).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.total;
        this.tableData = data.list;
        if (this.tableData && this.tableData[0] && this.tableData[0].flink_url) {
          this.showId = false;
        } else {
          this.showId = true;
        }
        // const selectDate = this.multipleSelection.map(item => item.execution_date);
        // this.tableData.forEach((item, index) => {
        //   if (selectDate.includes(item.execution_date)) {
        //     this.$nextTick(() => {
        //       this.$refs.multipleTable.toggleRowSelection(this.tableData[index], true);
        //     });
        //   }
        // });
      });
    },
    handleSelectionChange(value) {
      this.multipleSelection = value;
    },
    reset() {
      this.timeRange = [];
      this.params = {
        start_date: '',
        end_date: '',
        state: '',
        pageNum: 1,
        pageSize: 10
      };
      this.getList();
    },
    search() {
      this.params.pageNum = 1;
      this.loading = true;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.loading = true;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.loading = true;
      this.getList();
    },
    changeTime(value) {
      if (value) {
        this.params.start_date = value[0];
        this.params.end_date = value[1];
      } else {
        this.params.start_date = '';
        this.params.end_date = '';
      }
      this.search();
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
    openRecord(row) {
      this.dialogVisibleRecord = true;
      this.recordLoading = true;
      getRecord({
        taskName: row.name,
        executionDate: this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      }).then(res => {
        const data = res.data;
        this.recordList = data;
        this.recordLoading = false;
      });
    },
    getSql(row) {
      this.templateCode = row.templateCode;
      this.dialogVisibleSql = true;
      this.getList();
      this.version = row.version;
      this.sqlLoading = true;
      getExeSql({
        taskId: row.taskId,
        executionDate: this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
        version: row.version
      }).then(res => {
        const data = res.data;
        this.content = data;
        this.$refs.monaco.setCode(this.content);
        this.sqlLoading = false;
      });
    },
    getUI(row) {
      // 增加埋点
      this.$report({ userId: this.userInfo && this.userInfo.userId, time: Date.now(), event: { type: '查看SparkUI' }});

      this.getList();
      window.open(row.spark_ui);
    },
    getLogs(row) {
      // 增加埋点
      this.$report({ userId: this.userInfo && this.userInfo.userId, time: Date.now(), event: { type: '查看日志' }});

      this.getList();
      getLogsUi({
        id: row.taskId,
        executionDate: this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      }).then(res => {
        const data = res.data;
        const logs = data;
        window.open(logs);
      });
    },
    batchClear() {
      if (this.multipleSelection.length) {
        this.dialogVisibleClear = true;
        this.batchSelecttion = true;
        // this.$confirm('确定批量重算?', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // })
        //   .then(() => {
        //     const clearData = this.multipleSelection.map(item => {
        //       return {
        //         name: item.name,
        //         execution_date: this.$utils.parseTime(Number(item.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
        //         isCheckUpstream: this.isCheckUpstream
        //       };
        //     });
        //     this.batchClearLoading = true;
        //     batchClearFn(clearData)
        //       .then(data => {
        //         this.$message({
        //           type: 'success',
        //           message: '执行成功'
        //         });
        //         this.loading = true;
        //         this.$refs.multipleTable.clearSelection();
        //         this.getList();
        //       })
        //       .finally(() => {
        //         this.batchClearLoading = false;
        //       });
        //   })
        //   .catch(() => {});
      } else {
        this.$message({
          type: 'warning',
          message: '请至少选择一个任务实例'
        });
      }
    },
    batchStop() {
      if (this.multipleSelection.length) {
        this.isBatchStop = true;
        this.dialogVisible = true;
      } else {
        this.$message({
          type: 'warning',
          message: '请至少选择一个任务实例'
        });
      }
    },
    repeatCalc(row) {
      this.execution_date = this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}');
      this.dialogVisibleClear = true;
      this.clearRow = row;
      // this.$confirm('确定重算?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     this.saveClear(row);
      //   })
      //   .catch(() => {});
    },
    saveClear(row) {
      if (this.batchSelecttion) {
        const clearData = this.multipleSelection.map(item => {
          return {
            name: item.name,
            execution_date: this.$utils.parseTime(Number(item.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
            isCheckUpstream: this.isCheckUpstream
          };
        });
        this.batchClearLoading = true;
        batchClearFn(clearData)
          .then(data => {
            this.$message({
              type: 'success',
              message: '执行成功'
            });
            this.loading = true;
            this.$refs.multipleTable.clearSelection();
            this.getList();
          })
          .finally(() => {
            this.batchClearLoading = false;
            this.dialogVisibleClear = false;
            this.batchSelecttion = false;
          });
      } else {
        clearTask({
          name: this.clearRow.name,
          executionDate: this.execution_date,
          isCheckUpstream: this.isCheckUpstream
        }).then(data => {
          this.$message({
            type: 'success',
            message: '执行成功'
          });
          this.loading = true;
          this.dialogVisibleClear = false;
          this.$refs.multipleTable.clearSelection();
          this.getList();
        });
      }
    },
    checkError(row) {
      this.getList();
      this.dialogVisibleCheck = true;
      this.dialogLoading = true;
      this.currentCase = {
        name: row.name,
        executionDate: this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      };
      diagnoseError({
        name: row.name,
        executionDate: this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
        state: row.state
      }).then(res => {
        const data = res.data;
        this.errorData = data;
        this.dialogLoading = false;
      });
    },
    gotoOrder() {
      const { href } = this.$router.resolve({
        path: '/admin/order/create'
      });
      window.open(href, '_blank');
    },
    stop(row) {
      if (row.flink_url) {
        this.form.flinkUrl = row.flink_url;
      } else {
        this.form.flinkUrl = '';
      }
      this.form.name = row.name;
      this.form.executionDate = this.$utils.parseTime(Number(row.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}');
      this.isBatchStop = false;
      this.dialogVisible = true;
    },
    save() {
      if (!this.isBatchStop) {
        stopTaskInstace(this.form).then(data => {
          this.dialogVisible = false;
          this.$message({
            type: 'success',
            message: '执行成功'
          });
          this.loading = true;
          this.$refs.multipleTable.clearSelection();
          this.getList();
        });
      } else {
        const stopData = this.multipleSelection.map(item => {
          return {
            name: item.name,
            execution_date: this.$utils.parseTime(Number(item.execution_date), '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
            flinkUrl: item.flinkUrl || '',
            status: this.form.status
          };
        });
        this.batchStopLoading = true;
        batchStopFn(stopData)
          .then(data => {
            this.dialogVisible = false;
            this.$message({
              type: 'success',
              message: '执行成功'
            });
            this.loading = true;
            this.$refs.multipleTable.clearSelection();
            this.getList();
          })
          .finally(() => {
            this.batchStopLoading = false;
          });
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.task-detail {
  .search-condition-wrap {
    display: flex;
    align-items: flex-end;
    .search-group {
      flex: 1;
      // margin-right: 70px;
    }
    .custom-search {
      margin: 3px 0;
      ::v-deep .search-item {
        margin-bottom: 0;
      }
    }
    .search-input {
      width: 100% !important;
    }
  }
  .btns {
    margin-top: 8px;
    float: right;
    // display: flex;
    // flex-wrap: wrap;
    .btn-box {
      display: inline-block;
    }
    // float: right;
    .btn {
      margin-right: 10px;
      margin-left: 0;
    }
  }
  ::v-deep .el-tag--dark {
    border: none;
  }
  ::v-deep .el-tag--small {
    line-height: 24px !important;
  }
  .header {
    padding: 0 15px;
    line-height: 40px;
    .header-name {
      font-size: $global-font-size-18;
    }
  }
  .eltabs {
    ::v-deep .el-tabs__content {
      padding: 10px 15px;
    }
  }
  .table-wrap {
    padding: 10px 0 0;
    .el-pagination {
      padding-top: 10px;
    }
  }
  .frame {
    width: 100%;
    height: calc(100vh - 200px);
  }
  .btn-more {
    font-size: $global-font-size-12;
    cursor: pointer;
  }
}
.right-opertate {
  margin-top: 20px;
}
.monaco-editor-wrap {
  height: 400px;
}
.error-dialog {
  ::v-deep .el-dialog {
    height: 90%;
    min-width: 1020px;
    .el-dialog__body {
      padding-top: 10px;
    }
  }
  .reason {
    white-space: pre-line;
  }
  .title {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: $global-font-size-16;
    font-weight: bold;
  }
  .dag {
    width: 100%;
    height: calc(90vh - 180px);
    border: 1px solid #ddd;
  }
  .legend {
    position: relative;
    text-align: center;
    margin-bottom: 5px;
    span {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 0 5px;
    }
    .inside-color {
      border: 2px solid #909399;
    }
    .outside-color {
      border: 2px dashed #909399;
    }
    .dashed {
      display: inline-block;
      width: 40px;
      border-top: 2px dashed $c-primary;
      position: relative;
      bottom: 4px;
    }
    .dash-caret {
      color: $c-primary;
      position: relative;
      left: -8px;
    }
  }
  .no-data {
    height: 500px;
    line-height: 500px;
    border: 1px solid #ddd;
  }
}
</style>
<style lang="scss">
.success-color {
  background-color: #fff !important;
  border: 2px solid #67c23a !important;
  .label {
    color: #333 !important;
  }
}
.waiting-color {
  background-color: #fff !important;
  border: 2px solid #d7bdf2 !important;
  .label {
    color: #333 !important;
  }
}
.waiting-queue {
  background-color: #fff !important;
  border: 2px solid #87e0f0 !important;
  .label {
    color: #333 !important;
  }
}
.running-color {
  background-color: #fff !important;
  border: 2px solid $c-primary !important;
  .label {
    color: #333 !important;
  }
}
.failed-color {
  background-color: #fff !important;
  border: 2px solid #f10d15 !important;
  .label {
    color: #333 !important;
  }
}
.warning-color {
  background-color: #fff !important;
  border: 2px solid #f3dd07 !important;
  .label {
    color: #333 !important;
  }
}
.outline-color {
  background-color: #f4f4f5 !important;
  border: 2px solid #909399 !important;
  .label {
    color: #333 !important;
  }
}
.success-bg {
  background-color: #f0f9eb !important;
}
.warning-bg {
  background-color: #fdf6ec !important;
}
.bold {
  font-weight: bold !important;
}
.dash-border {
  border-style: dashed !important;
}
// .width100 {
//   width: 100px !important;
// }
.task-detail .el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar {
  height: 8px;
}
.custom-table {
  .jump {
    cursor: pointer;
    color: $c-primary;
  }
}
</style>
