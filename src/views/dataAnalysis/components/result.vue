<template>
  <div class="query-result">
    <div class="result-tips">
      <div class="tips_l">
        <div class="result">
          <i :class="[`${icon}-color`, icon, 'icon']"></i>
          <span :class="['text', { 'active-text': !logType }]" @click="hadelResult">结果</span>
          <!-- <span class="result_menu">
            <el-dropdown ref="expdropdown" v-permission="permission" placement="bottom-start" trigger="click" :hide-on-click="false" @command="resultCommand">
              <span class="title_icon">
                <svg-icon icon-class="extendedMenu" class="svg_extendedMenu" />
              </span>
              <el-dropdown-menu slot="dropdown" class="query_menu">
                <el-dropdown-item command="dataExplorationFn" :disabled="data.status !== 0">
                  数据探查
                  <i v-if="explorLoading" class="el-icon-loading"></i>
                  <span v-if="explorStatus === 'err'" style="display: inline-flex; align-items: center">
                    (探查失败)
                    <el-tooltip placement="right">
                      <div slot="content">数据获取失败,请重新执行后再试!</div>
                      <i class="el-icon-warning" style="margin-left: 6px; color: #e6a23c; transform: scale(1.2)" />
                    </el-tooltip>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="engine.startsWith('spark') && statusText" command="journalFn">
                  查看日志
                  <el-tooltip content="1.仅Spark引擎支持&quot;查看日志&quot;,但如果当前查询不是通过genie服务器完成的,也不支持&quot;查看日志&quot;。例：用户执行&quot;查看元数据&quot;、&quot;创建数据库/表&quot;等相关查询时,不支持&quot;查看日志&quot;,因为此部分查询不是通过genie服务器完成的" placement="right">
                    <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle" />
                  </el-tooltip>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span> -->
        </div>
        <div v-if="showLogBtn" class="log">
          <span :class="['log-btn', { 'active-text': logType }]" @click="logType = true">查看日志</span>
        </div>
        <!-- <div v-if="data.status === 0" class="chart_type">
          <div v-for="(item, index) in toolList" :key="index" :class="['chart_item', chartActive === index ? 'active' : '']" @click="chartActive = index">
            <span class="title">{{ item.title }}</span>
            <el-dropdown v-if="addChartType && data.status === 0" ref="expdropdown" placement="bottom-start" trigger="click">
              <span class="title_icon">
                <svg-icon icon-class="extendedMenu" class="svg_extendedMenu" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="item.chartGrade === '1'" @click.native="chartDrawerShow(item.type, index)">编 辑</el-dropdown-item>
                <el-dropdown-item @click.native="delChartTool(index)">删 除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div v-if="addChartType && data.status === 0" v-permission="permission" class="add_tool">
          <el-tooltip effect="dark" content="可视化图表" placement="top">
            <i class="el-icon-plus" @click.stop="chartDrawerShow('interval')"></i>
          </el-tooltip>
        </div> -->
      </div>
      <div class="tips_r">
        <i v-if="!queryActive" class="el-icon-search query_icon" @click="queryActive = true"></i>
        <el-input v-else v-model="keyword" v-autoFous="'input'" :class="['keyword', queryActive ? 'active' : '']" size="mini" prefix-icon="el-icon-search" placeholder="请输入行信息" @blur="queryActive = false"></el-input>
        <span v-if="!!statusText" class="statusText">
          <el-tooltip effect="dark" content="查询时长" placement="top">
            <span class="time">{{ data.executeDuration === undefined ? '-' : `${data.executeDuration}s` }}</span>
          </el-tooltip>
          <span class="line">|</span>
          <el-tooltip effect="dark" content="扫描量" placement="top">
            <span class="scanSize">{{ data.scanSize || '-' }}</span>
          </el-tooltip>
        </span>
      </div>
    </div>
    <div class="result-box">
      <!-- 结果查看 -->
      <div v-show="!logType">
        <!-- 未完成一次查询，未查询或者第一次查询未完成都显示暂无数据 -->
        <div v-show="data.status === -1 || data.status === 2 || data.status === 3" :class="['empty-box']">
          <div v-if="!progressObj.queryState" class="message">
            <div>暂无结果数据</div>
            <div>运行查询以查看结果</div>
          </div>
          <div v-else class="progress">
            <div class="title">查询进度</div>
            <div class="box">
              <div class="message">
                <template v-if="progressViewTime">
                  预计完成时间 <span>{{ formatEstimatedSecond(progressObj.estimatedSecond) }}</span>, </template>查询计算进度 <span>{{ progressFn(progressObj.progress) }}% </span>, 已扫描数据量 <span>{{ progressObj.physicalInputDataSize || '-' }}</span>
              </div>
              <myProgress :inner-bar-list="innerBarList" />
              <div v-if="progressObj.tipInfo" class="tips">
                <i class="el-icon-info"></i>
                {{ progressObj.tipInfo }}
              </div>
            </div>
          </div>
        </div>
        <!-- 只要查询成功不管有没有数据都显示表格 -->
        <div v-show="data.status === 0" class="success-box">
          <template v-if="!!data.message">
            <div class="el-icon-success-color">{{ data.message }}</div>
          </template>
          <template v-else>
            <!-- 结果区域展示 图表 chart -->
            <template v-if="!toolList[chartActive] || toolList[chartActive].type === 'table'">
              <template v-if="explorStatus !== 'success' || !explorationShow">
                <el-table v-if="!tableConfigType" :key="uuid" border :data="showData" stripe class="resultTable" :header-cell-style="{ padding: '0px 0' }" :cell-style="{ padding: '4px 0' }" @sort-change="sortChange">
                  <el-table-column type="index" :index="indexMethod" label="序号" width="70" align="center"></el-table-column>
                  <el-table-column v-for="item in data.meta" :key="item" min-width="180" sortable="custom" :prop="item" :label="formatLabel(item)">
                    <template slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="scope.row[item]" placement="bottom">
                        <div class="ellipsis" @mouseenter="isShowTooltip">{{ scope.row[item] }}</div>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
                <div v-else class="config_table">
                  <div v-if="tableSearhList.length > 0" class="search">
                    <div v-for="val in tableSearhList" :key="val.name" class="search_item">
                      <span class="name" :title="val.name">{{ val.name + ': ' }}</span>
                      <el-input v-model="val.value" :placeholder="val.name" size="mini" clearable></el-input>
                    </div>
                  </div>
                  <myTable :key="uuid" :table-data="tableData" :table-options="tableOptions" @sortChange="sortChange" />
                </div>
              </template>
              <template v-else>
                <DataExploration :show-data="showData" :meta="data.meta" :repeat-meta="data.repeat_meta" :probe-data="probeData" :prob-total="probTotal" />
              </template>
            </template>
            <template v-else>
              <div v-for="(item, index) in toolList" :key="item.title" class="chart_list">
                <chart v-if="index === chartActive" :key="item.config.chartOptions.chartId" :data="data" v-bind="chartOptionFn(item)" />
              </div>
            </template>
            <div v-if="!toolList[chartActive] || toolList[chartActive].type === 'table'" class="result-footer">
              <div class="result-footer-btn-box">
                <el-button type="text" class="result-footer-btn" :disabled="showData.length === 0" @click="copyData">复制</el-button>
                <el-tooltip content="仅支持复制当前页的结果数据" placement="top">
                  <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
                </el-tooltip>
                <el-dropdown v-permission="permission">
                  <span class="result-footer-btn">
                    下载
                    <i v-if="downloading" class="el-icon-loading" />
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :disabled="downloading" @click.native="downloadData('')">CSV</el-dropdown-item>
                    <el-dropdown-item :disabled="downloading" @click.native="downloadData('pdf')">PDF</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-tooltip placement="top">
                  <div slot="content">
                    结果数据仅展示前1000条数据，用户可通过下载操作，预览更多数据,当前查询共<span class="amount">{{ (data.result && data.result.length) || 0 }}</span>条记录
                  </div>
                  <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
                </el-tooltip>
                <template v-if="data.fileSize">({{ data.fileSize || '-' }})</template>
                <el-button type="text" class="result-footer-btn" @click="createCurTable">
                  创建临时表
                  <el-tooltip placement="top">
                    <div slot="content">{{ `创建的临时表默认存放到${regionLabel}区域下,temp_database此数据库中,存储时长默认为1个月!` }}</div>
                    <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
                  </el-tooltip>
                  <el-tooltip placement="top">
                    <div slot="content">定位</div>
                    <svg-icon icon-class="fixed" class="fixed" style="vertical-align: middle; margin-top: -3px" @click.stop="handelPosition" />
                  </el-tooltip>
                </el-button>
              </div>
              <el-pagination
                v-if="paginationType || !tableConfigType"
                background
                :total="filterData.length"
                :layout="paginationLayout"
                :current-page="pageNum"
                :page-size="pageSize"
                :pager-count="5"
                :page-sizes="[10, 20, 30, 50, 100, 500, 1000]"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              >
              </el-pagination>
            </div>
          </template>
        </div>
        <!-- 只要失败就显示错误 -->
        <div v-show="data.status === 1" class="error">
          <div class="error-box">
            <!-- <i class="el-icon-error el-icon-error-color"></i> {{ data.codeStr }} -->
            <!-- <div class="errot_btn">
              <el-button type="text" @click="$emit('correct', true, 'error')">【 使用SQL助手进行修正 】</el-button>
            </div> -->
            <div class="error-message">
              <div v-if="data.errorType" class="error_type">
                <p class="type">{{ data.errorType + ': ' }}</p>
              </div>
              <div class="error_content">
                <p v-if="data.errorZh" class="zh_message">{{ data.errorZh }}</p>
                <p class="message">{{ data.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Log v-show="logType" ref="Log" :uuid="uuid" :data="data" :query-sql="querySql" />
    </div>
    <chartDrawer ref="chartDrawer" :title="drawerTitle" :chart-type="chartType" :data="data" :engine="engine" @submit="submit" />
    <!-- 创建临时表 -->
    <el-dialog title="创建临时表" :visible.sync="cursorType" width="30%" :close-on-click-modal="false" @close="closeCursor">
      <el-form ref="cursorForm" :model="cursorForm">
        <el-form-item label="临时表名称" prop="tableName" label-width="110px" :rules="[{ required: true, message: '请输入临时表名称', trigger: ['blur', 'change'] }]">
          <el-input v-model="cursorForm.tableName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cursorType = false">取 消</el-button>
        <el-button type="primary" :loading="createTabloading" :disabled="createTabloading" @click="addCursorFn">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 创建临时表成功提示 -->
    <el-dialog title="创建成功" :visible.sync="tipsVisible" width="35%">
      <p>
        {{ tipsMessage }}
        <el-tooltip effect="dark" content="复制" placement="top" :enterable="false" style="margin-left: 10px; cursor: pointer">
          <i class="el-icon-document-copy" @click="copy(tipsMessage.split(',')[1])"></i>
        </el-tooltip>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="tipsVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { EventBus, EventType } from '@/utils/eventbus';
import { localSet } from '../util/index';
import { download, downloadFile, validOlap, lookJournal, dataExplore, createFromResult } from '@/api/querydata';
import copy from 'copy-to-clipboard';
import DataExploration from './DataExploration';
import chartDrawer from './chartDrawer.vue';
import myTable from './components/table.vue';
import chart from './components/chart.vue';
import myProgress from './components/progress.vue';
import Log from './components/log.vue';
import { mapGetters } from 'vuex';
import { numberType } from '@/views/dataAnalysis/util';

export default {
  components: {
    DataExploration,
    chartDrawer,
    myTable,
    chart,
    myProgress,
    Log
  },
  props: {
    uuid: {
      type: [Number, String],
      default: ''
    },
    data: {
      type: Object,
      default() {
        return {
          result: [],
          meta: [],
          status: -1, // -1未查询，0成功，1失败, 2取消, 3运行中
          executeDuration: 0, // 执行时间
          fileSize: '', // 文件大小
          scanSize: '',
          codeStr: '',
          message: '',
          repeat_meta: {}
        };
      }
    },
    running: {
      type: Boolean,
      default: false
    },
    engine: {
      type: String,
      default: ''
    },
    resultOption: {
      type: Object,
      default: () => {
        return {};
      }
    },
    progressObj: {
      type: Object,
      default: () => {
        return {};
      }
    },
    querySql: {
      type: String,
      default: ''
    }
  },
  inject: ['visible', 'positionTable'],
  data() {
    return {
      probTotal: 0,
      keyword: '',
      pageSize: 20,
      pageNum: 1,
      downloading: false,
      // engine: localStorage.getItem('ds-query-engine') || '',
      explorationShow: false,
      explorLoading: false,
      explorStatus: '',
      probeData: [],
      filterColumn: {},
      filterType: '',
      queryActive: false,
      chartActive: -1,
      drawerTitle: '图表配置',
      chartType: 'table',
      toolList: [],
      innerBarList: [],
      cursorType: false,
      cursorForm: {
        tableName: ''
      },
      createTabloading: false,
      progressViewTime: true,
      viewTime: true,
      tipsVisible: false,
      positionTableName: '',
      tipsMessage: '',
      isTipDisabled: false,
      logType: false,
      showLogBtn: false
    };
  },
  computed: {
    ...mapGetters(['region', 'regionList', 'catalog', 'userInfo', 'sqlOptions']),
    addChartType() {
      if (!this.engine) return false;
      return ['spark', 'presto'].some(item => this.engine.includes(item));
    },
    paginationLayout() {
      return this.visible() ? 'total, sizes, prev, pager, next' : 'total, sizes, prev, pager, next, jumper';
    },
    icon() {
      let icon = '';
      if (this.running) {
        icon = '';
      } else if (this.data.status === 0) {
        icon = 'el-icon-success';
      } else if (this.data.status === 1) {
        icon = 'el-icon-error';
      } else if (this.data.status === 2) {
        icon = 'el-icon-warning-outline';
      } else if (this.data.status === 3) {
        icon = '';
      }
      return icon;
    },
    statusText() {
      let text = '';
      if (this.running) {
        text = '正在运行';
      } else if (this.data.status === 0) {
        text = '已完成';
      } else if (this.data.status === 1) {
        text = '失败';
      } else if (this.data.status === 2) {
        text = '已取消';
      } else if (this.data.status === 3) {
        text = '正在运行';
      }
      return text;
    },
    tableSearhList() {
      if (this.tableConfigType) {
        return this.toolList[this.chartActive].config.tableSearhList || [];
      } else {
        return [];
      }
    },
    tableConfigType() {
      return this.toolList[this.chartActive] && this.toolList[this.chartActive].type === 'table' && this.toolList[this.chartActive].config;
    },
    tableOptions() {
      const currentObj = this.toolList[this.chartActive];
      if (!currentObj || currentObj.type !== 'table' || !currentObj.config) return {};
      return Object.assign({}, { align: currentObj.config.form.params.align, format: currentObj.config.form.params.format, pagination: currentObj.config.form.params.pagination, filterList: currentObj.config.filterList });
    },
    paginationType() {
      const tabConfig = this.toolList[this.chartActive]?.config;
      return !!(tabConfig && tabConfig.form.type === 'table' && tabConfig.form.params.pagination.paginationType);
    },
    tableData() {
      let result = [];
      const tabConfig = this.toolList[this.chartActive]?.config;
      if (tabConfig && tabConfig.form.type === 'table' && tabConfig.form.params.pagination.paginationType) {
        result = this.showData;
      } else {
        result = this.filterData;
      }

      return result;
    },
    filterData() {
      let data = this.data.result || [];
      if (this.keyword) {
        data = this.data.result.filter(item => {
          const meta = this.data.meta;
          const index = meta.findIndex(col => {
            let value = item[col];
            if (typeof value !== 'string') {
              value = String(value);
            }
            return value.includes(this.keyword);
          });
          return index > -1;
        });
      }

      //  筛选条件 (表格配置筛选条件)
      if (this.tableSearhList.length > 0 && this.tableSearhList.some(item => item.value.trim())) {
        const filterList = this.tableSearhList.filter(item => item.value.trim());
        const searchNames = filterList.map(item => item.valueKey);
        const searchValues = filterList.map(item => item.value);
        data = data.filter(item => {
          const res = [];
          searchNames.forEach((name, i) => {
            const typeObj = this.data.type.find(item => Object.keys(item)[0] === name);
            if (typeObj && numberType.includes(typeObj[Object.keys(typeObj)[0]])) {
              if (item[name] || item[name] === 0) res.push(item[name] === searchValues[i] * 1);
            } else {
              if (item[name]) res.push(item[name].includes(searchValues[i]));
            }
          });
          if (!res || res.length === 0) {
            return false;
          } else {
            return !res.some(item => !item);
          }
        });
      }

      if (this.filterType) {
        const resData = JSON.parse(JSON.stringify(data));
        return resData.sort(this.sortFun(this.filterColumn.prop, this.filterColumn.order === 'ascending'));
      } else {
        return data;
      }
    },
    showData() {
      const start = this.pageSize * (this.pageNum - 1);
      const end = start + this.pageSize;
      return this.filterData.slice(start, end);
    },
    regionLabel() {
      return this.regionList.find(item => item.name === this.region).name_zh || '当前区域';
    },
    permission() {
      const res = {};
      res.condition = 'external';
      res.instead = true;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      return res;
    }
  },
  watch: {
    progressViewTime(val) {
      if (!val) {
        setTimeout(() => {
          this.viewTime = false;
          this.progressViewTime = true;
        }, 1000 * 30);
      }
    },
    progressObj: {
      handler: function(newValue, oldValue) {
        if (newValue.queryState) {
          if (this.progressViewTime && newValue.estimatedSecond === 0 && this.viewTime) {
            this.progressViewTime = false;
          }
          let result = this.innerBarList;
          if (newValue.queryState === 'QUEUED' || newValue.queryState === 'PLANNING' || newValue.queryState === 'WAITING_FOR_RESOURCES') {
            result = [
              {
                color: 'linear-gradient(45deg, #cdf4ff, #5d92dd)',
                width: 100,
                text: '正在提交'
              }
            ];
          } else if (newValue.queryState === 'RUNNING') {
            // 添加提交状态
            if (!result.some(item => item.text === '正在提交')) {
              result.push({
                color: 'linear-gradient(45deg, #cdf4ff, #5d92dd)',
                width: 100,
                text: '正在提交'
              });
            }
            if (!result.some(item => item.text === '查询计算')) {
              result.push({
                color: 'linear-gradient(45deg, #f0f1de, #ffce74);',
                text: '查询计算'
              });
              const width = this.progressFn(newValue.progressType['RUNNING']);
              this.$set(result[result.length - 1], 'width', width > 0 ? width : 1);
            } else {
              const width = this.progressFn(newValue.progressType['RUNNING']);
              this.$set(result[result.length - 1], 'width', width > 0 ? width : 1);
            }
          } else if (newValue.queryState === 'FINISHIND' || newValue.queryState === 'FINISHED') {
            // 添加状态
            if (!result.some(item => item.text === '正在提交')) {
              result.push({
                color: 'linear-gradient(45deg, #cdf4ff, #5d92dd)',
                width: 100,
                text: '正在提交'
              });
            }
            if (!result.some(item => item.text === '查询计算')) {
              result.push({
                color: 'linear-gradient(45deg, #f0f1de, #ffce74);',
                width: 100,
                text: '查询计算'
              });
            } else {
              const index = result.findIndex(item => item.text === '查询计算');
              result[index].width = 100;
            }
            setTimeout(() => {
              if (!result.some(item => item.text === '结果获取')) {
                result.push({
                  color: 'linear-gradient(45deg, #eddef1, #715fd4);',
                  text: '结果获取',
                  width: 96
                });
              } else {
                const index = result.findIndex(item => item.text === '结果获取');
                result[index].width = 96;
              }
            }, 500);
          }
          this.$set(this, 'innerBarList', result);
        }

        if (!newValue.loading) {
          this.innerBarList = [];
        }
      },
      immediate: true,
      deep: true
    },
    'resultOption.toolList': {
      handler: function(data) {
        this.toolList = data || [];
      },
      immediate: true
    },
    engine(val) {
      this.toolList = [];
    },
    toolList: {
      handler: function(val) {
        if (this.data.name) localSet(this.region, { name: this.data.name, toolList: val });
      },
      deep: true
    },
    paginationType(val) {
      if (val) this.pageSize = this.toolList[this.chartActive].config.form.params.pagination.pageSize;
    },
    keyword() {
      this.pageNum = 1;
    }
  },
  created() {
    const sqlOptions = this.sqlOptions && this.sqlOptions[this.region];
    if (sqlOptions) {
      const logData = sqlOptions[this.data.name]?.logData;
      if (logData) {
        this.showLogBtn = true;
      }
    }
  },
  destroyed() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    handelExecute() {
      this.keyword = '';
      this.positionTableName = '';
      this.explorLoading = false;
      this.explorStatus = '';
      this.explorationShow = false;
      this.filterColumn = {};
      this.filterType = '';
      this.pageNum = 1;
      if (this.timer) clearInterval(this.timer);
    },
    hivehandelExecute() {
      this.progressViewTime = true;
      this.viewTime = true;
      this.logType = true;
      this.showLogBtn = true;
      this.$refs.Log?.handelExecute();
    },
    hadelResult() {
      this.chartActive = -1;
      this.logType = false;
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
    handelPosition() {
      const data = {
        db: 'temp_database',
        table: this.positionTableName
      };
      this.positionTable(data);
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    createCurTable() {
      this.cursorType = true;
      this.$nextTick(() => {
        this.$refs.cursorForm.clearValidate();
      });
    },
    copy(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message.success('已复制到剪贴板');
    },
    closeCursor() {
      this.cursorForm.tableName = '';
      this.$refs.cursorForm.clearValidate();
    },
    addCursorFn() {
      this.$refs.cursorForm.validate(valid => {
        if (valid) {
          // 增加埋点
          this.$report({ userId: this.userInfo && this.userInfo.userId, time: Date.now(), event: { type: 'createTable', message: this.cursorForm.tableName }});

          this.createTabloading = true;
          const param = {
            ...this.cursorForm,
            engine: this.engine,
            database: 'temp_database',
            comment: '',
            region: this.region,
            catalog: this.catalog,
            uuid: this.data.uuid,
            lifeCycle: 30
          };
          createFromResult(param)
            .then(res => {
              if (res.code === 0) {
                this.cursorType = false;
                this.tipsVisible = true;
                this.positionTableName = this.cursorForm.tableName;
                this.tipsMessage = `临时表已保存在${this.regionLabel}区域下, temp_database.${this.cursorForm.tableName}`;
              }
            })
            .finally(_ => {
              this.createTabloading = false;
            });
        }
      });
    },
    formatEstimatedSecond(data) {
      const menu = ['小于2分钟', '预计5分钟内', '大于五分钟'];
      return menu[data] || '-';
    },
    progressFn(progress) {
      if (!progress) return 0;
      return (progress.toFixed(2) * 100).toFixed(0);
    },
    chartOptionFn(data) {
      const result = {};
      const currentConfigObj = data.config;
      if (currentConfigObj) {
        Object.assign(result, { chartConfig: currentConfigObj.form, chartConfigOptions: currentConfigObj.chartOptions });
      }
      return result;
    },
    delChartTool(index) {
      this.toolList.splice(index, 1);
      this.chartActive = this.toolList.length - 1;
    },
    submit(data) {
      const index = data.form.index;
      if (index !== undefined) {
        this.toolList[index].config = data;
        this.$set(this.toolList, index, {
          title: data.form.title,
          type: data.form.type,
          config: data
        });
      } else {
        // 表格编辑 单独处理
        // const isTable = data.form.type === 'table';
        // if (isTable) {
        //   this.$set(this.toolList, '0', {
        //     title: data.form.title,
        //     type: data.form.type,
        //     config: data
        //   });
        //   return;
        // }

        // 添加chart
        this.toolList.push({
          title: data.form.title,
          type: data.form.type,
          config: data
        });
        this.chartActive = this.toolList.length - 1;
      }
    },
    chartDrawerShow(type, index) {
      if (this.data.result && this.data.result.length > 0) {
        this.chartType = type;
        this.$refs.chartDrawer.open();
        this.$parent?.setSql();
        // 数据回填
        const configData = this.toolList[index]?.config;
        if (configData) {
          configData.form.index = index;
          this.$nextTick(() => {
            this.$refs.chartDrawer.setData(configData);
          });
        }
      } else {
        this.$message({
          type: 'warning',
          message: '暂无数据'
        });
      }
    },
    resultCommand(command) {
      if (command === 'dataExplorationFn') this.dataExplorationFn();
      if (command === 'journalFn') this.journalFn();
    },
    // 数据探查状态
    dataExplorationFn(e) {
      if (this.explorLoading) return;
      if (this.explorStatus === 'err') {
        return;
      } else if (this.explorStatus === 'success') {
        this.explorationShow = true;
        this.$refs.expdropdown?.hide();
        return;
      }

      const dataLength = this.filterData.length;
      if (dataLength <= 0) {
        this.$message({
          type: 'warning',
          message: '暂无可探查的数据'
        });
        // e.target.click();
        return;
      }
      this.explorLoading = true;
      dataExplore({ uuid: this.uuid })
        .then(res => {
          if (res.data.status === 0) {
            this.probeData = res.data.probeData || [];
            this.probTotal = res.data.total;
            this.explorationShow = true;
            this.explorStatus = 'success';
            this.explorLoading = false;
            this.$refs.expdropdown?.hide();
          } else if (res.data.status === 1 || res.data.status === 2) {
            clearInterval(this.timer);
            // 文件下载中
            this.timer = setInterval(() => {
              dataExplore({ uuid: this.uuid })
                .then(val => {
                  if (val.data.status === 0) {
                    clearInterval(this.timer);
                    this.probeData = val.data.probeData || [];
                    this.probTotal = val.data.total;
                    this.explorationShow = true;
                    this.explorStatus = 'success';
                    this.explorLoading = false;
                    this.$refs.expdropdown?.hide();
                  }
                })
                .catch(() => {
                  clearInterval(this.timer);
                  this.explorStatus = 'err';
                  this.explorLoading = false;
                });
            }, 8000);
          }
        })
        .catch(() => {
          this.explorStatus = 'err';
          this.explorLoading = false;
        });
    },
    // 重复表头的处理
    formatLabel(label) {
      return this.data.repeat_meta[label] ? this.data.repeat_meta[label] : label;
    },
    // 查看日志
    journalFn() {
      lookJournal(this.uuid)
        .then(res => {
          if (res.data.url) {
            window.open(res.data.url, '_blank');
          } else {
            this.$message({
              type: 'error',
              message: '当前语句不能查看日志'
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          this.$refs.expdropdown?.hide();
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum;
    },
    copyData() {
      const title = this.data.meta.map(item => item).join('\t');
      const selection = this.showData
        .map(item => {
          let record = '';
          this.data.meta.forEach(meta => {
            record = record + item[meta] + '\t';
          });
          return record;
        })
        .join('\n');
      this.copy(`${title}\n${selection}`);
    },
    async downloadData(type) {
      if (this.uuid) {
        this.downloading = true;
        const config = {
          responseType: 'blob'
        };
        download({ uuid: this.uuid, type }, config)
          .then(res => {})
          .finally(() => {
            this.downloading = false;
          });
      }
    },
    indexMethod(index) {
      return (this.pageNum - 1) * this.pageSize + index + 1;
    },
    sortChange(column) {
      // this.page = 1 // return to the first page after sorting
      // this.total = this.tableData.length
      this.filterColumn = column;
      this.filterType = column.order;
      // this.filterData = this.filterData.sort(this.sortFun(column.prop, column.order === 'ascending'))
    },
    sortFun(attr, rev) {
      // 第一个参数传入info里的prop表示排的是哪一列，第二个参数是升还是降排序
      if (rev === undefined) {
        rev = 1;
      } else {
        rev = rev ? 1 : -1;
      }
      return function(a, b) {
        const reg = /^[0-9]+.?[0-9]*$/;
        a = a[attr];
        b = b[attr];
        if (reg.test(a) && reg.test(b)) {
          a = Number(a);
          b = Number(b);
        }
        if (a < b) {
          return rev * -1;
        }
        if (a > b) {
          return rev * 1;
        }
        return 0;
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.query-result {
  height: calc(100% - 10px);
  padding: 0 6px 4px 6px;
  .result-tips {
    display: flex;
    margin: 0 -6px;
    justify-content: space-between;
    align-items: center;
    padding: 0px 6px;
    border-bottom: 1px solid #e2e9f3;
    color: #606266;
    .tips_l {
      display: flex;
      align-items: center;
      .result {
        width: 75px;
        padding: 7px 5px;
        border-right: 1px solid #e2e9f3;
        display: flex;
        // justify-content: space-between;
        align-content: center;
        .text {
          // color: $c-primary;
          cursor: pointer;
          margin: 0 10px;
        }
        .result_menu {
          width: 10px;
        }
        .icon {
          margin-top: 1px;
        }
      }
      .chart_type {
        display: flex;
        max-width: 60vw;
        overflow: auto;
        &::-webkit-scrollbar {
          background-color: #fff;
        }
        &::-webkit-scrollbar-track,
        &::-webkit-scrollbar-thumb {
          visibility: hidden;
        }
        &:hover::-webkit-scrollbar-track,
        &:hover::-webkit-scrollbar-thumb {
          visibility: visible;
        }
        .chart_item {
          margin-left: 10px;
          padding: 4px 10px;
          cursor: pointer;
          display: flex;
          .title {
            white-space: nowrap;
          }
          &.active {
            border-bottom: 2px solid $c-primary;
          }
          .title_icon {
            .svg_extendedMenu {
              margin-bottom: -2px;
            }
          }
        }
      }
      .add_tool {
        margin-left: 10px;
        i {
          color: $c-primary;
          cursor: pointer;
        }
      }
      .log {
        .log-btn {
          margin-left: 10px;
          cursor: pointer;
        }
      }
      .active-text {
        color: $c-primary;
      }
    }
    .tips_r {
      display: flex;
      align-items: center;
      .query_icon {
        cursor: pointer;
      }
      svg {
        margin-left: 10px;
        margin-top: -2px;
        min-width: 14px;
      }
      .statusText {
        white-space: nowrap;
        .time {
          margin-left: 10px;
          cursor: pointer;
        }
        .scanSize {
          cursor: pointer;
        }
        .line {
          display: inline-block;
          margin-top: -2px;
          padding: 0 3px;
        }
      }
    }
  }
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    margin-top: 2px;
    border: 1px solid #e2e9f3;
    &.el-icon-loading-bg {
      background: #f1faff;
    }
    &.el-icon-success-bg {
      background: #f2f8f0;
    }
    & .journal {
      padding: 7px 5px;
    }
  }
  .el-icon-loading-color {
    color: #606266;
  }
  .el-icon-success-color {
    color: #67c23a;
  }
  .el-icon-warning-outline-color {
    color: #e6a23c;
  }
  .el-icon-error-color {
    color: $color-cb;
  }
  .result-box {
    height: calc(100% - 70px);
    margin-top: 10px;
    .empty-box {
      padding: 20px;
      text-align: center;
      // min-height: calc(100vh - 509px);
      height: 175px;
      color: #909399;
    }
    .success-box {
      height: 100%;
      .el-table {
        width: 100%;
        height: 100%;
        max-height: 710px;
        overflow: auto;
        border: none;
        ::v-deep .cell {
          line-height: 18px;
        }

        ::v-deep .el-table__header-wrapper {
          .cell {
            white-space: nowrap;
          }
        }
      }
      .config_table {
        .search {
          display: flex;
          flex-wrap: wrap;
          margin: 0 !important;
          .search_item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            margin-right: 10px;
            .name {
              display: inline-block;
              white-space: nowrap;
              margin-right: 5px;
            }
            .el-input {
              width: 140px;
              ::v-deep .el-input__inner {
                padding-left: 4px;
              }
            }
          }
        }
      }
    }
    .error {
      // min-height: calc(100vh - 550px);
      min-height: 174px;
      overflow: hidden;
      .error-box {
        margin: 20px 30px;
        padding: 20px;
        border: 1px solid $color-cb;
        background: #f2f2f2;
        .errot_btn {
          margin-top: -15px;
          margin-left: -8px;
        }
        .error-message {
          .error_type {
            margin-bottom: 16px;
            font-size: $global-font-size-16;
          }
          .message {
            word-break: break-all;
          }
        }
        // .error_content{
        //   padding-left: 18px;
        // }
      }
    }
    .result-footer {
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
      overflow-x: auto;
      &-btn-box {
        padding: 6px 0;
        // float: left;
        // padding-top: 12px;
      }
      &-btn {
        margin-left: 10px;
        padding: 0;
      }
      .el-pagination {
        padding: 6px 0 6px 15px;
      }
      .fixed {
        transform: rotate(45deg);
        color: $c-primary;
        cursor: pointer;
      }
    }
    .progress {
      width: 75%;
      text-align: left;
      font-size: $global-font-size-12;
      .title {
        font-size: $global-font-size-14;
        font-weight: 600;
      }
      .box {
        padding-left: 20px;
        .message {
          margin: 20px 0 25px 0;
          span {
            color: #000;
            font-weight: 400;
          }
        }
        .tips {
          margin-top: 20px;
        }
      }
    }
    ::v-deep {
      .log-content {
        margin: -10px -6px;
      }
    }
  }
}
.result-footer-btn {
  color: $c-primary;
}
</style>
