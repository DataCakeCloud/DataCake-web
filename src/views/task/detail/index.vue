<!--  chenyh1 -->
<template>
  <el-card class="task-detail box-card-container">
    <el-page-header class="header bg-white" @back="goBack">
      <el-link slot="content" type="primary" :underline="false" class="header-name" :disabled="!templateCode" @click="edit">{{ name }}</el-link>
    </el-page-header>
    <el-tabs v-model="tabItem" type="card" class="mt10 eltabs">
      <el-tab-pane name="instance" label="实例信息">
        <div class="search-condition-wrap">
          <!-- <search-condition label="实例ID">
            <el-input v-model="params.instanceId" class="search-box" placeholder="请输入实例ID" clearable></el-input>
          </search-condition> -->
          <search-condition label="运行状态">
            <el-select v-model="params.state" class="search-box" placeholder="请选择运行状态" clearable>
              <el-option v-for="(value, key) in statusCodeList" :key="key" :label="value" :value="key"></el-option>
            </el-select>
          </search-condition>
          <search-condition label="执行入参时间">
            <el-date-picker v-model="timeRange" class="search-box" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" style="width: 350px" @change="changeTime">
            </el-date-picker>
          </search-condition>
          <el-button type="primary" size="small" @click="search">查询</el-button>
          <div class="right-btn">
            <el-button type="primary" size="small" :disabled="!((isAdmin || isOwner) && isOnline)" @click="batchClear">批量重算</el-button>
            <el-button type="danger" size="small" :disabled="!((isAdmin || isOwner) && isOnline)" @click="batchStop">批量停止</el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table ref="multipleTable" v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '0', height: '36px' }" height="calc(100vh - 300px)" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column type="index" label="序号" :index="indexMethod" width="50" align="center"></el-table-column>
            <el-table-column v-if="showId" prop="genie_job_id" label="实例ID" min-width="180" align="center">
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.genie_job_id" :content="scope.row.genie_job_id" :disabled="isTipDisabled">
                  <span class="ellipsis block jump" @click="jumpLog(scope.row)" @mouseenter="isShowTooltip">{{ scope.row.genie_job_id }}</span>
                </el-tooltip>
                <template v-else> - </template>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="运行状态" min-width="120" align="center">
              <template slot-scope="scope">
                <el-tag :color="stateColorFn(statusCodeList[scope.row.state])" effect="dark">{{ statusCodeList[scope.row.state] || scope.row.state }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="运行次数" min-width="80" align="center">
              <template slot-scope="scope">
                <el-button v-if="scope.row.try_number" type="text" @click="openRecord(scope.row)">{{ scope.row.try_number }}次</el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="execution_date" label="执行入参时间" min-width="180" align="center">
              <template slot-scope="scope">
                {{ scope.row.execution_date ? $utils.parseTime(scope.row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}') : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="start_date" label="任务开始时间" min-width="150" align="center">
              <template slot-scope="scope">
                {{ scope.row.start_date ? $utils.parseTime(scope.row.start_date) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="end_date" label="任务结束时间" min-width="150" align="center">
              <template slot-scope="scope">
                {{ scope.row.end_date ? $utils.parseTime(scope.row.end_date) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="任务耗时" min-width="140" align="center"> </el-table-column>
            <el-table-column fixed="right" label="操作" min-width="215" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" :style="{ color: isAdmin || isOwner ? '#e6a23c' : '#d1d7e6' }" :disabled="!(isAdmin || isOwner)" @click="checkError(scope.row)">检查上游</el-button>
                <el-button type="text" size="mini" :disabled="scope.row.state === 'waiting' || !((isAdmin || isOwner) && isOnline)" @click="repeatCalc(scope.row)">{{ scope.row.state === 'termination' ? '重新启动检查' : '重算' }}</el-button>
                <el-button type="text" size="mini" :style="{ color: (isAdmin || isOwner) && isOnline ? '#FF5656' : '#d1d7e6' }" :disabled="scope.row.state === 'termination' || !((isAdmin || isOwner) && isOnline)" @click="stop(scope.row)">停止</el-button>
                <el-button type="text" size="mini" :disabled="!isScanSparkUI || scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || isOwner) || !scope.row.spark_ui" @click="getUI(scope.row)">Spark UI</el-button>
                <el-button type="text" size="mini" :disabled="!isScanSqlCmd" @click="getSql(scope.row)">{{ templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览' }}</el-button>
                <!-- <el-dropdown>
                  <span class="btn-more">更多</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>
                      <el-button type="text" size="mini" :disabled="scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || isOwner) || !isScanKibana" @click="getLogs(scope.row)">Kibana日志</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button type="text" size="mini" :disabled="!isScanSqlCmd" @click="getSql(scope.row)">{{ templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览' }}</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown> -->
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange"> </el-pagination>
        </div>
      </el-tab-pane>
      <!-- <el-tab-pane label="成本统计">
        <div v-loading="costLoading">
          <iframe v-if="costUrl" class="frame" :src="costUrl" frameborder="0"></iframe>
          <div v-else>
            <h2>权限申请说明</h2>
            <p class="ml15">
              首次访问实例成本统计时，需要您点击此按钮进行访问报表认证鉴权！
              <span v-if="isShow" style="color: #909399">正在审批中，审批通过后请刷新页面重试。PS：可以在钉钉中查看审批进度</span>
              <el-button v-else type="text" @click="clickPermission">点击认证</el-button>
            </p>
          </div>
        </div>
      </el-tab-pane> -->
      <el-tab-pane name="data" label="数据血缘">
        <ConsanguinityMap v-if="tabItem === 'data'" ref="ConsanguinityMap" />
      </el-tab-pane>
      <el-tab-pane name="link" label="链路分析">
        <LinkAnalysis v-if="tabItem === 'link'" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="停止" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态" :disabled="statusDisabled">
            <el-option label="成功" :value="1"></el-option>
            <el-option label="失败" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="`${templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览'}-${version === 0 ? '最新' : 'V' + version}`" :visible.sync="dialogVisibleSql" :close-on-click-modal="false" width="800px">
      <div v-loading="sqlLoading" class="monaco-editor-wrap">
        <monaco-editor v-show="content" ref="monaco" v-model="content" :read-only="true"></monaco-editor>
        <el-empty v-show="!content" :image-size="100"></el-empty>
      </div>
    </el-dialog>
    <el-dialog title="重算" :visible.sync="dialogVisibleClear" :close-on-click-modal="false" width="500px">
      <el-form label-width="250px">
        <el-form-item label="重算任务是否在执行过程中检查上游:">
          <el-radio-group v-model="isCheckUpstream">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
          <el-popover placement="bottom" trigger="hover" popper-class="tag-popper" width="180">
            <div>主要用于自依赖任务顺序执行</div>
            <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff; position: relative; left: -366px"></i>
          </el-popover>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleClear = false">取 消</el-button>
        <el-button type="primary" @click="saveClear">确 定</el-button>
      </span>
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
          <span class="outline-color">下线</span>
        </div>
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
        <!-- <div class="reason">
          {{ errorData.reason }}
          <el-button v-if="errorData.reason && errorData.reason.indexOf('工单') > -1" type="text" class="ml15" @click="gotoOrder">跳转工单页面</el-button>
        </div>
        <div v-show="errorData.faultNodeList && errorData.faultNodeList.length">
          <div class="title">未就绪上游列表</div>
          <el-table :data="errorData.faultNodeList" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
            <el-table-column prop="dagId" label="未就绪上游任务/数据" min-width="160" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.dagId" :disabled="isTipDisabled">
                  <a v-if="!scope.row.external" class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row.dagId)">{{ scope.row.dagId }}</a>
                  <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.dagId }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="executionDate" label="实例日期" min-width="160" align="center"></el-table-column>
            <el-table-column prop="external" label="类型" min-width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.external ? '外部数据' : '内部数据' }}
              </template>
            </el-table-column>
            <el-table-column prop="downDagId" label="直接下游任务" min-width="150" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.downDagId" :disabled="isTipDisabled">
                  <a class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row.downDagId)">{{ scope.row.downDagId }}</a>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="checkPath" label="检查路径" min-width="180" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.checkPath" :disabled="isTipDisabled">
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.checkPath }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="owner" label="任务负责人" min-width="100" align="center"></el-table-column>
          </el-table>
        </div>
        <div v-show="errorData.successNodeList && errorData.successNodeList.length">
          <div class="title">已就绪直接上游列表</div>
          <el-table :data="errorData.successNodeList" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
            <el-table-column prop="dagId" label="已就绪上游任务/数据" min-width="180" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.dagId" :disabled="isTipDisabled">
                  <a v-if="!scope.row.external" class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row.dagId)">{{ scope.row.dagId }}</a>
                  <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.dagId }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="executionDate" label="实例日期" min-width="160" align="center"></el-table-column>
            <el-table-column prop="external" label="类型" min-width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.external ? '外部数据' : '内部数据' }}
              </template>
            </el-table-column>
            <el-table-column prop="checkPath" label="检查路径" min-width="150" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.checkPath" :disabled="isTipDisabled">
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.checkPath }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="successDate" label="检测成功时间" min-width="160" align="center"></el-table-column>
          </el-table>
        </div>
        <div v-show="errorData.faultCheckPathList && errorData.faultCheckPathList.length">
          <div class="title">检测超时的上游列表</div>
          <el-table :data="errorData.faultCheckPathList" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
            <el-table-column prop="metadataId" label="检测超时上游数据" min-width="180" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.metadataId" :disabled="isTipDisabled">
                  <a v-if="!scope.row.external" class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row.metadataId)">{{ scope.row.metadataId }}</a>
                  <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.metadataId }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="executionDate" label="实例日期" min-width="160" align="center"></el-table-column>
            <el-table-column prop="checkPath" label="检查路径" min-width="180" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.checkPath" :disabled="isTipDisabled">
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.checkPath }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div> -->
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
            // titleKey(data) {
            //   return data.recursion ? '... ...' : data.nodeId === errorData.coreTaskId ? data.taskId + '<br/>' + data.dagId + '<br/>' + data.executionDate + '(当前实例)' : data.taskId + '<br/>' + data.dagId + '<br/>' + data.executionDate;
            // },
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
        <el-table-column prop="state" label="运行状态" min-width="110" align="center">
          <template slot-scope="scope">
            <el-tag :color="stateColorFn(statusCodeList[scope.row.state])" effect="dark">{{ statusCodeList[scope.row.state] || scope.row.state }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="execution_date" label="执行入参时间" min-width="175" align="center">
          <template slot-scope="scope">
            {{ scope.row.execution_date ? $utils.parseTime(scope.row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="任务开始时间" min-width="135" align="center">
          <template slot-scope="scope">
            {{ scope.row.start_date ? $utils.parseTime(scope.row.start_date) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="end_date" label="任务结束时间" min-width="135" align="center">
          <template slot-scope="scope">
            {{ scope.row.end_date ? $utils.parseTime(scope.row.end_date) : '-' }}
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
            <el-button type="text" size="mini" :disabled="!isScanSparkUI || scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || isOwner) || !scope.row.spark_ui" @click="getUI(scope.row)">Spark UI</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.state === 'waiting' || scope.row.state === 'termination' || !(isAdmin || isOwner) || !isScanKibana" @click="getLogs(scope.row)">Kibana日志</el-button>
            <el-button type="text" size="mini" :disabled="!isScanSqlCmd" @click="getSql(scope.row)">{{ templateCode === 'PythonShell' ? '脚本预览' : 'SQL预览' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script>
import SearchCondition from '@/components/SearchCondition';
import { getTaskDetailPage, getServiceUi, getLogsUi, clearTask, stopTaskInstace, diagnoseError, permission, getExeSql, getRecord, getLogInfo } from '@/api/taskDetail'; // getUrl,
import MonacoEditor from '@/components/MonacoEditor/index';
import ConsanguinityMap from './components/consanguinityMap.vue';
import LinkAnalysis from './components/linkAnalysis.vue';
import DAG from '@/components/DAG';
import * as tools from '@/utils/tools';
import { mapGetters, mapMutations } from 'vuex';

export default {
  components: {
    // SearchGroup,
    // SearchItem
    SearchCondition,
    MonacoEditor,
    DAG,
    ConsanguinityMap,
    LinkAnalysis
  },
  data() {
    return {
      tabItem: 'instance',
      taskId: this.$route.query.id,
      name: this.$route.query.name,
      timeRange: [],
      params: {
        start_date: '',
        end_date: '',
        state: '',
        pageNum: 1,
        pageSize: 30,
        userId: this.$store.getters['userInfo'].id
      },
      total: 0,
      loading: false,
      tableData: [],
      statusCodeList: tools.offlineStateCode,
      dialogVisible: false,
      form: {
        name: '',
        executionDate: '',
        flinkUrl: '',
        status: 1
      },
      statusDisabled: false,
      multipleSelection: [],
      dialogVisibleCheck: false,
      dialogLoading: false,
      errorData: {},
      isTipDisabled: false,
      costLoading: false,
      costUrl: '',
      isShow: false,
      isOwner: true,
      isOnline: true,
      isScanSqlCmd: true,
      isScanKibana: true,
      isScanSparkUI: true,
      templateCode: '',
      workflowId: 0,
      dialogVisibleClear: false,
      isCheckUpstream: true,
      execution_date: '',
      showId: true,
      dialogVisibleSql: false,
      content: '',
      version: 1,
      currentCase: {
        name: this.$route.query.name,
        executionDate: ''
      },
      sqlLoading: false,
      dialogVisibleRecord: false,
      recordLoading: false,
      recordList: []
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'userInfo'])
  },
  created() {
    clearTimeout(this.initTimer);
    this.init();
    this.loading = true;
    this.params.instanceId = this.$route.query.instanceId;
    this.getList();
    this.initTimer = setInterval(() => {
      this.getList();
    }, 1000 * 20);
    this.$nextTick(() => {
      // 离开页面时 取消循环请求, 进入页面后重新请求
      document.addEventListener('visibilitychange', this.handelGetList);
    });
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
    // jumpLog(data) {
    //   if (!data.genie_job_url) return;
    //   // const config = {
    //   //   headers: {
    //   //     current_login_user: JSON.stringify(this.userInfo)
    //   //   }
    //   // };
    //   const url = data.genie_job_url;
    //   const isKs3 = url.startsWith('ks3://');
    //   const isS3 = url.startsWith('s3://');
    //   if (isKs3) {
    //     // getLogInfo({ url }, config).then(res => {
    //     //   const blob = new Blob([res], { type: 'text/plain;charset=utf-8' });
    //     //   const url = window.URL.createObjectURL(blob);
    //     //   window.open(url, '_blank');
    //     // });
    //     window.open('/api-gateway/ds_task/task/instanceLog?url=' + url, '_blank');
    //   } else if (isS3) {
    //     window.open('https://joblog.datacake.cloud/' + url.split('pipeline_log/')[1], '_blank');
    //   } else {
    //     window.open(url, '_blank');
    //   }
    // },
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
    init() {
      // 获取运行状态数据
      // getStatusCodeList().then(data => {
      //   this.statusCodeList = data;
      // });
      // 获取成本统计
      // this.costLoading = true;
      // getUrl({
      //   viewId: process.env.VUE_APP_VIEW_ID_COST,
      //   params: [{ key: 'jobName', value: this.$route.query.name }]
      // }).then(data => {
      //   if (data.permission) {
      //     this.costUrl = data.url;
      //     localStorage.removeItem('permission');
      //   } else {
      //     if (localStorage.getItem('permission') === 1) {
      //       this.isShow = true;
      //     } else {
      //       this.isShow = false;
      //     }
      //   }
      //   this.costLoading = false;
      // });
    },
    goBack() {
      if (this.workflowId) {
        this.$router.push('/task/workflow');
      } else {
        this.$router.push('/task/list');
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
    edit() {
      if (this.workflowId) {
        this.$router.push({
          path: '/workflow/add',
          query: { id: this.workflowId, version: this.$route.query.version, taskId: this.taskId }
        });
      } else {
        let path;
        if (this.$route.query.executeMode === 'local' && this.templateCode === 'Mysql2Hive') {
          path = tools.taskCodeToPath[this.templateCode] + '2';
        } else {
          path = tools.taskCodeToPath[this.templateCode];
        }
        this.$router.push({
          path: `/task/${path}`,
          query: {
            id: this.taskId
          }
        });
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
      getTaskDetailPage({
        taskId: this.taskId,
        name: this.name,
        ...this.params
        // taskId: 1
      }).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.result.total;
        this.tableData = data.result.list;
        this.isOwner = data.isOwnerOrCollaborator;
        this.isOnline = data.online;
        this.templateCode = data.templateCode;
        this.isScanSqlCmd = data.isScanSqlCmd;
        this.isScanKibana = data.isScanKibana;
        this.isScanSparkUI = data.isScanSparkUI;
        this.workflowId = data.workflowId;
        if (data.taskId) {
          this.taskId = data.taskId;
        }
        if (this.tableData && this.tableData[0] && this.tableData[0].flink_url) {
          this.showId = false;
        } else {
          this.showId = true;
        }
        const selectDate = this.multipleSelection.map(item => item.execution_date);
        this.tableData.forEach((item, index) => {
          if (selectDate.includes(item.execution_date)) {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(this.tableData[index], true);
            });
          }
        });
      });
    },
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
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
        executionDate: this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      }).then(res => {
        const data = res.data;
        this.recordList = data;
        this.recordLoading = false;
      });
    },
    getSql(row) {
      this.dialogVisibleSql = true;
      this.getList();
      this.version = row.version;
      this.sqlLoading = true;
      getExeSql({
        taskId: this.taskId,
        executionDate: this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
        version: row.version
      }).then(res => {
        const data = res.data;
        this.content = data;
        this.$refs.monaco.setCode(this.content);
        // if (data) {
        //   this.content = data;
        //   this.$refs.monaco.setCode(this.content);
        // }
        this.sqlLoading = false;
      });
    },
    getUI(row) {
      // 增加埋点
      this.$report({ userId: this.userInfo && this.userInfo.userId, time: Date.now(), event: { type: '查看SparkUI' }});

      this.getList();
      window.open(row.spark_ui);
      // const params = {
      //   id: this.taskId,
      //   genieJobId: row.genie_job_id,
      //   state: row.state
      // };
      // if (row.is_kyuubi_job) {
      //   params.logFileUrl = row.genie_job_url;
      // }
      // getServiceUi(params).then(res => {
      //   const data = res.data;
      //   const flinkUi = data;
      //   window.open(flinkUi);
      // });
    },
    getLogs(row) {
      // 增加埋点
      this.$report({ userId: this.userInfo && this.userInfo.userId, time: Date.now(), event: { type: '查看日志' }});

      this.getList();
      getLogsUi({
        id: this.taskId,
        executionDate: this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      }).then(res => {
        const data = res.data;
        const logs = data;
        window.open(logs);
      });
    },
    batchClear() {
      if (this.multipleSelection.length) {
        const date = this.multipleSelection.map(item => this.$utils.parseTime(item.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}')).join(',');
        // this.isCheckUpstream = false;
        // this.dialogVisibleClear = true;
        this.execution_date = date;
        this.$confirm('确定批量重算?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.saveClear();
          })
          .catch(() => {});
      } else {
        this.$message({
          type: 'warning',
          message: '请至少选择一个任务实例'
        });
      }
    },
    batchStop() {
      if (this.multipleSelection.length) {
        // const date = this.multipleSelection.map(item => this.$utils.parseTime(item.execution_date)).join(',');
        // if (row.flink_url) {
        //   this.form.flinkUrl = this.multipleSelection.map(item => this.$utils.parseTime(item.execution_date)).join(',');
        // } else {
        //   this.form.flinkUrl = '';
        // }
        const date = [];
        const flinkUrl = [];
        this.multipleSelection.forEach(item => {
          date.push(this.$utils.parseTime(item.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}'));
          if (item.flink_url) {
            flinkUrl.push(item.flink_url);
          }
        });
        this.form.name = this.name;
        this.form.executionDate = date.join(',');
        this.form.flinkUrl = flinkUrl.join(',');
        this.dialogVisible = true;
      } else {
        this.$message({
          type: 'warning',
          message: '请至少选择一个任务实例'
        });
      }
    },
    repeatCalc(row) {
      // this.isCheckUpstream = false;
      // this.dialogVisibleClear = true;
      this.execution_date = this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}');
      this.$confirm('确定重算?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.saveClear();
        })
        .catch(() => {});
    },
    saveClear() {
      clearTask({
        name: this.name,
        executionDate: this.execution_date,
        isCheckUpstream: this.isCheckUpstream
      }).then(data => {
        this.$message({
          type: 'success',
          message: '执行成功'
        });
        this.dialogVisibleClear = false;
        this.loading = true;
        this.$refs.multipleTable.clearSelection();
        this.getList();
      });
    },
    checkError(row) {
      this.getList();
      this.dialogVisibleCheck = true;
      this.dialogLoading = true;
      this.currentCase = {
        name: row.name,
        executionDate: this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}')
      };
      diagnoseError({
        name: row.name,
        executionDate: this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}'),
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
    gotoDetail(name) {
      const { href } = this.$router.resolve({
        path: '/task/detail',
        query: {
          name: name
        }
      });
      window.open(href, '_blank');
    },
    stop(row) {
      // if (row.state === 'waiting') {
      //   this.statusDisabled = true;
      //   this.form.status = 0;
      // } else {
      //   this.statusDisabled = false;
      //   this.form.status = 1;
      // }
      if (row.flink_url) {
        this.form.flinkUrl = row.flink_url;
      } else {
        this.form.flinkUrl = '';
      }
      this.form.name = row.name;
      this.form.executionDate = this.$utils.parseTime(row.execution_date, '{y}/{m}/{d} {h}:{i}:{s}.{b}');
      this.dialogVisible = true;
    },
    save() {
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
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.task-detail {
  .search-condition-wrap {
    line-height: 37px;
    // padding: 15px;
    position: relative;
    .right-btn {
      position: absolute;
      right: 5px;
      top: 5px;
    }
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
::v-deep .el-tag--dark {
  border: none;
}
::v-deep .el-tag--small {
  line-height: 24px !important;
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
