<template>
  <div class="query-tab-item">
    <div class="toolbar">
      <div class="toolbar-l">
        <span v-show="!running" class="toolbar-icon execute" @click="execute">
          <el-button type="success" class="execute" plain size="mini">
            <i class="el-icon-caret-right"></i>
            运 行
          </el-button>
        </span>
        <span v-show="running" class="toolbar-icon stop" style="display: relative">
          <el-button type="info" plain size="mini" class="stop" @click="cancel">
            <svg-icon icon-class="stop" class="icon" />
            终 止
          </el-button>
          <!-- <div class="popver" :class="isAccelerate ? 'isActive' : ''">
            您执行的查询将被加速,是否加速?
            <div class="footer">
              <el-button type="text" @click="handelAccelerate('cancel')">取消</el-button>
              <el-button type="text" @click="handelAccelerate('confirm')">加速</el-button>
            </div>
          </div> -->
        </span>
        <!-- <span class="toolbar-icon aisql" style="display: relative" @click="changeAIsqlType(true, 'init')">
          <el-button type="danger" plain size="mini" class="aisql">
            <svg-icon icon-class="assistant" class="icon assistant" />
            SQL助手
          </el-button>
        </span> -->
        <span class="toolbar-icon format" @click="formatSql">
          <el-button type="warning" plain size="mini" class="formatBtn">格式化</el-button>
        </span>
        <!-- <span v-if="engFunctionShow" class="toolbar-icon" @click="transGrammar">
          <el-button type="primary" plain size="mini" class="transBtn"> 语法转换 </el-button>
        </span> -->
        <span class="toolbar-icon">
          <el-button type="danger" plain size="mini" class="controlBtn" :disabled="!controlType" @click="hnadelcontrol">
            定时调度
            <el-tooltip content="请您编写带有动态时间参数的一条SQL，成功运行后即可设置定时任务" placement="top" :enterable="false">
              <svg-icon icon-class="help" class="svg_help" style="vertical-align: text-top" />
            </el-tooltip>
          </el-button>
        </span>
        <span v-permission="permission1" class="toolbar-menu">
          <el-dropdown ref="toolbarMenu" placement="bottom-start" trigger="click" :hide-on-click="false" @command="handletoolBarCommand">
            <span class="title_icon"><svg-icon icon-class="extendedMenu" class="svg_extendedMenu" /></span>
            <el-dropdown-menu slot="dropdown" class="query_menu">
              <!-- <el-dropdown-item v-if="engFunctionShow" command="dispatchFn" :disabled="disabledBtn">
                定时调度
                <el-tooltip content="支持用户在'数据分析'平台编写的SparkSql脚本(仅支持SparkSql)触达至'数据开发'平台完成调度运行" placement="right" :enterable="false">
                  <svg-icon icon-class="help" class="svg_help" />
                </el-tooltip>
              </el-dropdown-item> -->
              <el-dropdown-item :disabled="!showScan" command="DataScanning">
                <span v-if="!scanningStatus">
                  预估扫描数据量
                  <i v-if="scanningLoading" class="el-icon-loading"></i>
                </span>
                <span v-else>
                  扫描数据量
                  <span v-if="scanningStatus === 'err'" style="display: inline-flex; align-items: center">
                    (获取失败)
                    <svg-icon icon-class="err" style="margin-left: 6px"></svg-icon>
                  </span>
                  <span v-else>{{ `(${scanningStatus})` }}</span>
                </span>
              </el-dropdown-item>
              <el-dropdown-item v-permission="permission" command="apiPopoverFn" :disabled="disabledBtn">
                {{ apiHistoryForm.path ? '更新API' : '生成API' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </div>
      <div class="toolbar-r">
        <div class="engine_select">
          <span class="label">查询引擎: </span>
          <el-select v-model="engine" placeholder="请选择引擎" size="mini" :disabled="engineDisabledType">
            <el-option v-for="item in engineList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </div>
        <span class="toolbar-icon" @click="save">
          <el-button type="primary" class="toolbar-save icon" size="mini">
            <svg-icon icon-class="save" class="icon" />
            保 存
          </el-button>
        </span>
        <el-button type="primary" :class="['toolbar-icon', 'toolbar-share', showShare ? '' : 'disabled']" :disabled="!showShare" size="mini" @click="shareBtn">
          <svg-icon icon-class="share" class="icon" />
          分 享
        </el-button>
      </div>
    </div>
    <!-- <el-alert v-if="accelerateTips" title="警告提示的文案" class="accelerate_alert" type="warning">
      <template #title>
        <div class="accelerate_tips">
          <div class="message">{{ `该查询符合查询的加速条件,加速后查询速度提升150%,你是否需要申请加速?` }}</div>
          <button class="btn" @click="accelerateFn">加 速</button>
        </div>
      </template>
    </el-alert> -->
    <div :key="data.name" ref="sqlBox" class="sql-box" :style="sqlBoxStyle">
      <i v-if="!AIsqlType" class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
      <el-popover v-if="!AIsqlType" placement="left-start" trigger="click" width="700" popper-class="QE_popper">
        <div class="tips_box">
          <div class="jinjia">
            <div class="title">时间参数规则</div>
            <div class="tips_text">
              <!-- <div style="margin-top: 5px">我们推荐使用该写法</div> -->
              <div>例子：</div>
              <div>{{ text }} <b>注意，符号一定要使用英文字符</b></div>
              <!-- <span slot="reference" class="reference-btn">提示</span> -->
              <div>说明：</div>
              <div>execution_date 表示任务的入参时间，小时任务为每小时的0分，天级别的任务为每天0点0分，周任务为每周一的0点0分，月度任务为每月1号的0点0分</div>
              <div>macros.timedelta(hours=8) 表示所需时间和入参时间的差值</div>
              <div>strftime("%Y%m%d") 表示需要什么格式，譬如现在获取的格式是 20200108 eg：如果需要2020-01-08 ，则可写成strftime("%Y-%m-%d")</div>
            </div>
            <el-table :data="gridData" size="mini" :cell-style="{ padding: '4px 0' }">
              <el-table-column min-width="235" property="expression" label="JINJA表达式"></el-table-column>
              <el-table-column min-width="420" property="mean" label="含义"></el-table-column>
            </el-table>
          </div>
          <div class="title">快捷方式</div>
          <el-table :data="quickData" size="mini" :cell-style="{ padding: '4px 0' }">
            <el-table-column min-width="235" property="action" label="操作"></el-table-column>
            <el-table-column min-width="420" property="keyword" label="快捷键"></el-table-column>
          </el-table>
        </div>
        <span slot="reference" class="tips">
          <svg-icon class="keyboard" icon-class="keyboard" />
        </span>
      </el-popover>

      <!-- 上下选择器 -->
      <div v-if="!AIsqlType && downType" class="selection_btn">
        <i class="el-icon-upload2 icon" @click="handelCurrent('sub')"></i>
        <i class="el-icon-download icon" @click="handelCurrent('add')"></i>
      </div>

      <div class="editor_wrap">
        <div class="editor" :class="[transfEditorType ? 'transf' : '', AIsqlType ? 'aIshow' : '']">
          <div v-if="transfEditorType" class="editor_item">
            <div class="title">Ares（原始SQL）</div>
            <monaco-editor
              ref="transfMonaco"
              :key="data.grade + ''"
              v-model="oldQuerySql"
              :execute-type="!transfEditorType"
              render-line-highlight="all"
              :scroll-beyond-last-line="false"
              :style="{ paddingBottom: (keyList.length > 0 ? 31 * Math.ceil(keyList.length / 8) : 0) + 'px' }"
              :custom-theme="customTheme"
              :read-only="data.grade !== undefined && data.grade !== 1"
            ></monaco-editor>
            <div class="tool">
              <i class="el-icon-close" @click="closeEditor"></i>
            </div>
          </div>
          <div class="editor_item">
            <div class="title">Spark（转换后SQL）</div>
            <monaco-editor
              ref="monaco"
              :key="data.grade + ''"
              v-model="querySql"
              class="content"
              :style="{ paddingBottom: (keyList.length > 0 ? 31 * Math.ceil(keyList.length / 8) : 0) + 'px' }"
              render-line-highlight="all"
              :down-type.sync="downType"
              :execute-type="!transfEditorType"
              :scroll-beyond-last-line="false"
              :custom-theme="customTheme"
              :read-only="data.grade !== undefined && data.grade !== 1"
              @save="save"
              @exec="$emit('keyDownExecute', activeTabName)"
              @edit-position="editPosition"
              @handelExecute="execute"
            ></monaco-editor>
          </div>
        </div>
        <AIsql v-if="AIsqlType" ref="AIsql" class="ai_sql" :region="region" :catalog="catalog" :data="data" @close="changeAIsqlType(false)" />
      </div>
      <div v-if="keyList.length > 0" class="variable">
        <div class="row">
          <div v-for="item in sqlKeyObj.keyList" :key="item.key" class="col">
            <div class="label">
              <el-tooltip class="item" effect="light" :content="item.key" placement="top" popper-class="sqlParamsClass" :disabled="item.key.length < 8">
                <span>{{ item.key }}</span>
              </el-tooltip>
            </div>
            <el-input v-model.trim="item.value" :disabled="!!item.disabled" placeholder="请输入参数值" :class="redKey.includes(item.key) ? 'redInput' : ''" size="mini"></el-input>
          </div>
        </div>
      </div>
    </div>
    <div v-if="unExecuteType" class="result">
      <div class="drag" @mousedown="dragEagle">
        <i class="bar" />
      </div>
      <result ref="result" :uuid="uuid" :data="result" :running="running" :engine="engine" :result-option="resultOption" :progress-obj="progressObj" @correct="changeAIsqlType" />
    </div>
    <el-dialog v-if="dialogVisible" title="保存查询" width="700px" :close-on-click-modal="false" :append-to-body="true" :visible.sync="dialogVisible" @close="closeDialog" @opened="openDialog">
      <el-form ref="form" :model="form" label-width="100px" :rules="rules">
        <el-form-item label="查询名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入查询名称"></el-input>
        </el-form-item>
        <el-form-item label="文件夹" prop="folderName">
          <el-select ref="selectTree" v-model="form.folderName" placeholder="请选择文件夹" style="width: 100%">
            <el-option hidden value=""></el-option>
            <customTree :tree-data="folderList" :default-props="defaultProps" :is-contextmenu="true" :depth="3" :no-drag="noDrag" @node-click="handelClickMove" @moveFile="moveFile" @delFile="delFile" @resetFolderName="resetFolderName" @addFile="addFile"></customTree>
          </el-select>
        </el-form-item>
        <el-form-item label="查询描述" prop="description">
          <el-input v-model="form.description" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="预览SQL">
          <div style="height: 100px">
            <monaco-editor ref="saveMonaco" v-model="querySql" :read-only="true"></monaco-editor>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit('determine')">保 存</el-button>
        <el-button v-if="form.submited" type="primary" @click="submit('saveAS')">另存为</el-button>
      </div>
    </el-dialog>
    <el-dialog class="apiDial" :title="apiHistoryForm.path ? '更新API' : '生成API'" :visible.sync="apiDialogStatus" width="30%">
      <div v-if="apiPathShow" class="apiDial_box">
        <el-form ref="apiForm" :model="apiForm" :rules="apiFormRules" label-width="90px" class="demo-ruleForm">
          <el-form-item label="API名称:" prop="title">
            <el-input v-model="apiForm.title" size="mini"></el-input>
          </el-form-item>
        </el-form>
        <div class="floor">
          <el-button @click="cancelApi">取消</el-button>
          <el-button v-if="!apiHistoryForm.path" type="primary" @click="saveApi('add')">保存</el-button>
          <el-button v-else type="primary" @click="saveApi('update')">保存</el-button>
        </div>
      </div>
      <div v-else class="apiDial_box">
        <div class="apiTips_title">
          <i class="el-icon-warning-outline"></i>
          {{ `API已${apiHistoryForm.path ? '更新' : '保存'}至'已生成的API'列表中` }}
        </div>
        <div class="tips-path">
          <span>API Path : {{ newApiPath }}}</span>
          <el-tooltip effect="dark" content="复制" placement="top" :enterable="false">
            <i class="el-icon-document-copy" @click="copyPath(newApiPath)"></i>
          </el-tooltip>
        </div>
        <div class="floor">
          <el-button @click="apiDialogStatus = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
    <shareDialog ref="shareDialog" :grade="data.grade" :share-url="shareUrl" @submitFn="shaerSubmit" />
    <div v-if="smartEngineObj && smartEngineObj.smartEngineType" class="smartEngine">
      <div class="title">引擎推荐</div>
      <div class="box">
        <div class="content">{{ `根据智能引擎，我们推荐您使用${smartEngine}引擎来运行` }}</div>
        <div class="footer">
          <el-checkbox v-model="cpmType" class="tipsbtn">一天内不再弹窗</el-checkbox>
          <el-button size="mini" @click="smartEngineFn(false)">仍要原引擎</el-button>
          <el-button type="primary" size="mini" @click="smartEngineFn(true)">接受推荐</el-button>
        </div>
      </div>
    </div>

    <!-- 定时调度 -->
    <ControlDial ref="controlDial" @submit="controlSubmit" />
  </div>
</template>

<script>
import customTree from '@/components/customTree';
import MonacoEditor from '@/components/MonacoEditor/AnalysisCopy';
import shareDialog from './shareDialog';
import ControlDial from './components/controlDial';
import Result from './result.vue';
import AIsql from './AIsql';
import { localGetItem } from '@/utils/customStorage';

import {
  cancel,
  add,
  getDataById,
  update,
  dataScanSize,
  addDataServiceApi,
  updateDataServiceApi,
  addDispatchMsg,
  sqlTransfer,
  accelerateType,
  accRequirements,
  creatAcceleration,
  getFileSize,
  addShare,
  getJinjaTime,
  getProgress,
  addFolder,
  editFolderName,
  delFolder,
  folderMove,
  savedQueryList,
  getSaveFolderTree,
  createControl
} from '@/api/querydata';
import { uuidStamp } from '@/utils/config';
import { localSet, setLocalCpmType, getLocalCpmType, removeEndStrSql } from '../util/index';
import copy from 'copy-to-clipboard';
import { getFormatUrl, strToBase64, base64ToStr, getStrByte } from '@/utils';
import { mapGetters, mapMutations } from 'vuex';
import { jianjiaData } from '@/utils/config';
import { whiteTenant } from '@/utils/config';

function getfolderName(data, children, id) {
  for (const i in data) {
    if (data[i].id === id) return data[i].name;
    if (data[i][children]) {
      const res = getfolderName(data[i][children], children, id);
      if (res) return res;
    }
  }
}

export default {
  components: {
    MonacoEditor,
    Result,
    customTree,
    shareDialog,
    AIsql,
    ControlDial
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    activeTabName: {
      type: String,
      default: ''
    }
  },
  data() {
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输查询名称'));
      } else {
        const str = getStrByte(value, 30);
        if (str !== value) callback('长度不能超过30个字符');
        callback();
      }
    };
    return {
      controlSql: '',
      downType: false,
      AIsqlType: false,
      cpmType: false,
      regionSave: '',
      engine: this.data.engine || '',
      shareUrl: '',
      executeType: false,
      isDatabend: false,
      sql_base64: '',
      accelerateTips: false,
      isAccelerate: false,
      timerInter: null,
      newApiPath: '',
      customTheme: {
        rules: [
          // { token: 'string.key.json', foreground: 'A31515' },
          // { token: 'string.value.json', foreground: '0451A5' },
          { token: 'string.sql', foreground: 'b81515' },
          // { token: 'keyword.json', foreground: '0451A5' },
          // { token: 'keyword.sql', foreground: '840a7c', fontStyle: 'bold' },
          { token: 'operator.sql', foreground: '0000ff' },
          // { token: 'keyword.block.sql', foreground: '840a7c', fontStyle: 'bold' },
          // { token: 'keyword.choice.sql', foreground: '840a7c', fontStyle: 'bold' },
          // { token: 'delimiter.parenthesis.sql', foreground: '5186df' },
          { token: 'predefined.sql', foreground: '925e26' }
        ],
        colors: {
          // 相关颜色属性配置
          'editor.lineHighlightBackground': '#e8f2ff',
          'sideBar.background': '#330000' // 侧边栏背景色
        }
      },
      apiHistoryForm: {},
      apiDialogStatus: false,
      apiPathShow: true,
      apiForm: {
        title: ''
      },
      apiFormRules: {
        title: [
          { required: true, message: '请输入API名称', trigger: 'blur' },
          { pattern: /^(?!_)[\u4e00-\u9fa5a-zA-Z0-9_]+$/, message: '格式错误', trigger: 'blur' }
        ]
      },
      redKey: [],
      sqlKeyObj: {
        regRes: [],
        keyList: []
      },
      editPositionData: {
        lineNumber: 1,
        column: 1
      },
      showShare: false, // 分享按钮的状态
      running: false,
      uuid: this.data.result?.uuid || '',
      queryId: '',
      querySql: this.data.querySql,
      resultOption: {
        toolList: this.data.toolList
      },
      result: this.data.result || {
        result: [],
        meta: [],
        status: -1, // -1:未查询，0成功，1失败, 2取消
        executeDuration: 0, // 执行时间
        fileSize: '', // 文件大小
        scanSize: '',
        codeStr: '',
        message: ''
      },
      height: 0,
      offsetHeight: 160,
      startY: 0,
      fullscreen: false,
      dialogVisible: false,
      form: {
        submited: this.data.submited || null,
        title: '',
        description: '',
        folderName: '',
        folderID: null
      },
      rules: {
        title: [{ validator: validateName, trigger: 'blur' }]
      },
      scanningLoading: false,
      scanningStatus: '',
      defaultProps: {
        children: 'child',
        label: 'name'
      },
      catalogDisabledList: ['ch_', 'mysql_'],
      engineDisabled: false,
      text: "{{ (execution_date - macros.timedelta(days=1)).strftime('%Y%m%d') }}",
      quickData: [
        {
          action: '运行查询',
          keyword: 'Ctrl + Enter'
        },
        {
          action: '保存查询',
          keyword: 'Ctrl + S'
        },
        {
          action: '格式化SQL',
          keyword: 'Ctrl + Alt + L'
        },
        {
          action: '回退',
          keyword: 'Ctrl + Z'
        },
        {
          action: '搜索',
          keyword: 'Ctrl + F'
        }
      ],
      gridData: [
        {
          expression: '{{ ds }}',
          mean: 'the execution date as YYYY-MM-DD'
        },
        {
          expression: '{{ ds_nodash }}',
          mean: 'the execution date as YYYYMMDD'
        },
        {
          expression: '{{ yesterday_ds }}',
          mean: 'yesterday’s date as YYYY-MM-DD'
        },
        {
          expression: '{{ yesterday_ds_nodash }}',
          mean: 'yesterday’s date as YYYYMMDD'
        },
        {
          expression: '{{ tomorrow_ds }}',
          mean: 'tomorrow’s date as YYYY-MM-DD'
        },
        {
          expression: '{{ tomorrow_ds_nodash }}',
          mean: 'tomorrow’s date as YYYYMMDD'
        },
        {
          expression: '{{ ts }}',
          mean: 'same as execution_date.isoformat()'
        },
        {
          expression: '{{ ts_nodash }}',
          mean: 'same as ts without - and :'
        },
        {
          expression: '{{ execution_date }}',
          mean: 'the execution_date, (datetime.datetime)'
        },
        {
          expression: '{{ prev_execution_date }}',
          mean: 'the previous execution date (if available)(datetime.datetime)'
        },
        {
          expression: '{{ next_execution_date }}',
          mean: 'the next execution date (datetime.datetime)'
        },
        {
          expression: '{{ prev_2_execution_date }}',
          mean: `the previous  pre_execution_date (if available)(datetime.datetime) timezone: UTC+8, BEIJING`
        },
        {
          expression: '{{ ds_utc0 }}',
          mean: `the execution date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ ds_nodash_utc0 }}',
          mean: `the execution date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ yesterday_ds_utc0 }}',
          mean: `yesterday’s date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ yesterday_ds_nodash_utc0 }}',
          mean: `yesterday’s date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ tomorrow_ds_utc0 }}',
          mean: `tomorrow’s date as YYYY-MM-DD timezone: UTC+0`
        },
        {
          expression: '{{ tomorrow_ds_nodash_utc0 }}',
          mean: `tomorrow’s date as YYYYMMDD timezone: UTC+0`
        },
        {
          expression: '{{ execution_date_utc0 }}',
          mean: `the execution_date, (datetime.datetime) timezone: UTC+0`
        }
        // {
        //   expression: '{{ prev_execution_date_utc0 }}',
        //   mean: `the previous execution date (if available)(datetime.datetime) timezone: UTC+0`
        // },
        // {
        //   expression: '{{ next_execution_date_utc0 }}',
        //   mean: `the next execution date (datetime.datetime) timezone: UTC+0`
        // },
        // {
        //   expression: '{{ prev_2_execution_date_utc0 }}',
        //   mean: `the previous  pre_execution_date_utc0 (if available)(datetime.datetime) timezone: UTC+0`
        // }
      ],
      smartEngineObj: {
        smartEngineType: false
      },
      progressObj: {},
      transfEditorType: false,
      oldQuerySql: this.data.ildQuerySql || ''
    };
  },
  computed: {
    controlType() {
      let result = false;
      result = this.data.result?.status;
      const sqlNum = this.querySql?.split(';').filter(str => str).length;
      return result === 0 && sqlNum === 1 && this.keyList.length;
    },
    noDrag() {
      const data = this.folderList[0];
      return data ? [data[this.defaultProps.label]] : [];
    },
    permission1() {
      const res = {};
      res.condition = 'external';
      res.instead = true;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      return res;
    },
    permission() {
      const res = {};
      res.condition = whiteTenant;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      return res;
    },
    sqlBoxStyle() {
      const res = {};
      let height;
      let otherHeight = 0;
      if (this.unExecuteType) otherHeight = 220;
      if (this.height) {
        height = this.height + 'px';
      } else {
        height = `calc(100vh - ${160 + otherHeight}px)`;
      }
      res.height = height;
      return JSON.parse(JSON.stringify(res));
    },
    unExecuteType() {
      let type;
      type = this.data.result?.status;
      type = type === undefined ? null : type === -1 ? null : type === 0 ? true : type;
      return !!type;
    },
    smartEngine() {
      if (this.smartEngineObj && this.smartEngineObj.smartEngineType) {
        const currentEngineObj = this.engineList.find(item => item.value === this.smartEngineObj.smartEngine);
        const engineText = currentEngineObj ? currentEngineObj.label : this.smartEngineObj.smartEngine;
        return engineText || 'XXX';
      } else {
        return 'XXX';
      }
    },
    engineDisabledType() {
      return this.engineDisabled || (this.smartEngineObj && this.smartEngineObj.smartEngineType);
    },
    // accelerateEngineState() {
    //   const accelerateEngineList = ['spark-', 'presto_', 'ares_'];
    //   return accelerateEngineList.some(val => this.engine.startsWith(val));
    // },
    engFunctionShow() {
      const engListShow = ['spark-', 'presto_'];
      return engListShow.some(val => this.engine.includes(val));
    },
    disabledBtn() {
      const resData = this.result;
      return !(resData.status === 0);
    },
    showScan() {
      return this.engine.startsWith('ares_') || this.engine.startsWith('presto_');
    },
    keyList() {
      const newVal = this.querySql || '';
      const reg = /\{\{[^(?!\{\{|\{)]+\}\}/g;
      let regRes = newVal.match(reg);
      regRes = regRes || [];
      if (regRes.length > 0) {
        let res = regRes.map(item => {
          const end = item.indexOf('}}');
          const str = item.slice(2, end).trim();
          return str || '';
        });
        res = res.filter(item => item);
        res = Array.from(new Set(res));
        const resList = res.map(key => {
          return {
            key,
            value: ''
          };
        });
        this.$set(this.sqlKeyObj, 'regRes', regRes);
        return resList;
      } else {
        return [];
      }
    },
    ...mapGetters(['sqlList', 'sqlOptions', 'userInfo', 'folderList', 'engineList', 'region', 'catalog'])
  },
  watch: {
    oldQuerySql(val) {
      localSet(this.region, { name: this.data.name, oldQuerySql: val });
    },
    engine(val) {
      // jinjia表达式处理
      // if (!this.engine.startsWith('spark-')) {
      //   this.sqlKeyObj.keyList.forEach(item => {
      //     item.disabled = false;
      //   });
      // } else {
      //   this.sqlKeyObj.keyList.forEach(item => {
      //     if (jianjiaData.includes(item.key)) {
      //       item.disabled = true;
      //       // item.value = '';
      //     } else {
      //       item.disabled = false;
      //     }
      //   });
      // }
      if (this.activeTabName === this.data.name) {
        if (this.retain) return;
        this.showShare = false;
        localSet(this.region, { name: this.data.name, title: this.data.title, querySql: this.querySql, uuid: this.uuid, engine: val, toolList: undefined, catalog: this.catalog });
        this.data.result = undefined;
        this.$store.commit('SET_SQLLIST', { key: this.region, list: { engine: this.engine, name: this.data.name, once: true, status: -1 }});
        this.initList();
      }
    },
    catalog: {
      handler: function(newVal) {
        this.$nextTick(() => {
          if (this.activeTabName === this.data.name) {
            if (this.retain) {
              this.engine = this.engine ? this.engine : this.engineList[0]?.value ? this.engineList[0].value : '';
            } else {
              const loaclEngine = this.data.engine;
              if (loaclEngine && this.engineList.some(item => item.value === loaclEngine)) {
                // loacal保存的engine
                // 原tab关联engine切换catalog后使用原engine,如果当前catalog下不存在原关联的engine,则使用当前catalog的第一个engine
                this.engine = loaclEngine;
              } else {
                this.engine = this.engineList[0] ? this.engineList[0].value : this.engine;
              }
            }
            localSet(this.region, { name: this.data.name, engine: this.engine, catalog: newVal });
          }
          this.engineDisabled = this.catalogDisabledList.some(item => this.engine.includes(item));
        });
      },
      immediate: true
    },
    uuid() {
      this.apiPathShow = true;
      // this.accelerateTips = false;
      // this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'accelerateTips', value: false });
    },
    keyList: {
      handler: function(newVal) {
        const fromKeyList = this.sqlKeyObj.keyList.map(({ key }) => key);
        const comKeyList = this.keyList.map(({ key }) => key);
        if (fromKeyList.length <= 0) {
          this.$set(this.sqlKeyObj, 'keyList', newVal);
        } else {
          if (fromKeyList.length === comKeyList.length) {
            // 修改
            comKeyList.forEach((key, index) => {
              if (!fromKeyList.includes(key)) this.sqlKeyObj.keyList[index].key = key;
            });
          } else {
            // 增
            const filterObje = [];
            this.keyList.forEach((item, index) => {
              if (!fromKeyList.includes(item.key)) filterObje.push([index, item]);
            });
            if (filterObje.length > 0) {
              filterObje.forEach(item => {
                this.sqlKeyObj.keyList.splice(item[0], 0, item[1]);
              });
            }

            // 减
            const delIndexList = [];
            this.sqlKeyObj.keyList.forEach((item, index) => {
              if (!comKeyList.includes(item.key)) delIndexList.unshift(index);
            });
            if (delIndexList.length > 0) {
              delIndexList.forEach(index => {
                this.sqlKeyObj.keyList.splice(index, 1);
              });
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    'sqlKeyObj.keyList': {
      handler: function() {
        this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'keyList', value: this.sqlKeyObj.keyList });
        // jinjia表达式处理
        // this.sqlKeyObj.keyList.forEach(item => {
        //   if (jianjiaData.includes(item.key)) {
        //     item.disabled = true;
        //     // item.value = '';
        //   } else {
        //     item.disabled = false;
        //   }
        // });
      },
      deep: true
    },
    querySql() {
      localSet(this.region, { name: this.data.name, title: this.data.title, querySql: this.querySql, uuid: this.uuid, engine: this.engine });
      if (this.showScan) {
        this.scanningLoading = false;
        this.scanningStatus = '';
      }
    },
    data: {
      handler: function(newVal) {
        if (newVal.result) {
          this.result = newVal.result;
          this.running = this.result.running;
          if (newVal.result.keyList) this.sqlKeyObj.keyList = newVal.result.keyList;
          // if (newVal.result.status === 0) {
          //   this.accelerateTips = this.sqlOptions && this.sqlOptions[this.engine] && this.sqlOptions[this.engine][newVal.name]?.accelerateTips;
          // }

          if (newVal.result.status !== 3 && newVal.result.status !== undefined) {
            // presto进度
            if (this.engine.startsWith('presto')) {
              clearInterval(this.proGressTime);
              clearTimeout(this.progressSetTime);
              this.progressObj = { loading: false };
              this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { loading: false }});
            }

            // 结果显示
            this.$refs.result?.hadelResult();
          }
        }
      }
    },
    // progressObj: {
    //   handler: function(data) {
    //     if (data.loading && data.stroe) {
    //       const startDate = data.startDate;
    //       const endDate = data.endDate || new Date().getTime();
    //       if ((endDate - startDate) / 1000 >= 2) {
    //         this.progressFn();
    //       } else {
    //         this.awaitProgressFn(endDate - startDate);
    //       }
    //     }
    //   },
    //   immediate: true,
    //   deep: true
    // },
    activeTabName: {
      handler: function(val) {
        if (val === this.data.name && this.data.catalog) this.SET_CATALOG(this.data.catalog);
      },
      immediate: true
    }
  },
  mounted() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    this.regionSave = this.region;

    if (this.data.oldQuerySql) {
      this.transfEditorType = true;
      this.$nextTick(() => {
        this.$refs.transfMonaco.setCode(this.data.oldQuerySql);
      });
    }

    const sqlOptions = this.sqlOptions && this.sqlOptions[this.region];
    if (sqlOptions) {
      this.sqlKeyObj.keyList = sqlOptions[this.data.name]?.keyList || [];
      // this.accelerateTips = sqlOptions[this.data.name]?.accelerateTips;
      this.smartEngineObj = sqlOptions[this.data.name]?.smartEngineObj || {};
      const progressObj = sqlOptions[this.data.name]?.progressObj || {};
      this.progressObj = { ...progressObj, stroe: true };
    }
  },
  destroyed() {
    // 清楚loding的状态
    if (this.data.result) {
      const { running } = this.data.result;
      if (running && this.regionSave) this.$store.commit('SET_SQLLIST', { key: this.regionSave, list: { engine: this.engine, running: true, name: this.data.name, once: false, status: 3 }});
    }
    // 清楚定时器
    clearInterval(this.timer);
    clearInterval(this.timerTow);
    clearInterval(this.timerInter);
    clearInterval(this.proGressTime);
    clearTimeout(this.progressSetTime);
  },
  inject: ['initList', 'changeActiveTab', 'changeWidth', 'visible'],
  methods: {
    ...mapMutations(['SET_CATALOG', 'SET_FOLDERLIST']),
    // 定时调度sql处理  处理掉非jinjia表达式的变量
    formatControlSql(sql) {
      let nullType = false;
      this.sqlKeyObj.keyList.forEach((item, index) => {
        if (!item.value && !jianjiaData.includes(item.key) && !nullType) {
          nullType = true;
        }
        const currentKey = this.sqlKeyObj.regRes.find(val => val.slice(2, -2).trim() === item.key);
        if (!jianjiaData.includes(item.key)) sql = sql.split(currentKey).join(item.value);
      });
      if (nullType) {
        this.$message({
          type: 'warning',
          message: '请填写参数值'
        });
      }
      return { sql, nullType };
    },
    controlSubmit(data, callback) {
      const params = {
        ...data,
        region: this.region,
        originSql: window.btoa(encodeURIComponent(this.controlSql)),
        userName: this.userInfo.userName,
        engine: this.data.engine,
        catalog: this.data.catalog,
        database: localGetItem('ds-query-database') || ''
      };
      createControl(params).then(res => {
        console.log(res, 'ss');
        if (res.code === 0) {
          callback();
          this.$message.success('调度成功');
          sessionStorage.setItem('ds-controlManager-refresh', 1);
        }
      });
    },
    hnadelcontrol() {
      const { sql, nullType } = this.formatControlSql(this.querySql);
      if (nullType) return;
      this.controlSql = sql || '';
      this.$refs.controlDial?.show();
    },
    handelCurrent(type) {
      this.$refs.monaco?.handelCurrent(type);
    },
    addFile(addFolderObj, oldFolderObj) {
      const params = {
        name: addFolderObj.addFileName,
        level: oldFolderObj ? oldFolderObj.level + 1 : 1,
        parent_id: oldFolderObj ? oldFolderObj.id : this.folderList[0]?.id,
        is_active: 1,
        is_query: 0
      };
      addFolder(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '新建成功'
          });
          this.getFolderList();
        }
      });
    },
    // 更改文件夹名
    resetFolderName(data) {
      const params = {
        id: data.id + '',
        name: data[this.defaultProps.label]
      };
      editFolderName(params).then(res => {
        this.$message({
          type: 'success',
          message: '修改成功'
        });
        this.handelClickMove(data);
        this.getFolderList();
      });
    },
    // 删除文件夹
    async delFile(data) {
      const params = {
        info: '',
        title: '',
        query_sql: '',
        engine: '',
        folderID: data.id,
        pageSize: 30,
        pageNum: 1
      };
      const { data: resData } = await savedQueryList(params);
      if (resData.list && resData.list.length > 0) {
        this.$message({
          type: 'warning',
          message: '该文件夹下存在保存的sql,请先删除保存的sql再进行该操作'
        });
        return;
      }
      delFolder({ id: data.id + '' }).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        if (this.form.folderID === data.id) {
          this.form.folderID = '';
          this.form.folderName = '';
        }
        this.getFolderList();
      });
    },
    moveFile(moveFileObj, moveToFileObject) {
      const params = {
        id: moveFileObj.id + '',
        parent_id: moveToFileObject.id ? moveToFileObject.id + '' : null,
        is_query: '0'
      };
      this.folderMove(params);
    },
    folderMove(data) {
      folderMove(data)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          });
        })
        .finally(() => {
          this.getFolderList();
        });
    },
    getFolderList() {
      getSaveFolderTree().then(res => {
        const data = res.data || [];
        this.SET_FOLDERLIST(data);
      });
    },
    // 关闭转换的sql框
    closeEditor() {
      this.transfEditorType = false;
      this.oldQuerySql = '';
    },
    // 等待处理进度条
    // awaitProgressFn(date) {
    //   setTimeout(() => {
    //     this.$set(this.progressObj, 'dialog', true);
    //     this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { ...this.progressObj, dialog: true }});
    //     this.progressFn();
    //   }, date);
    // },
    // 进度条处理
    // progressFn() {
    //   if (this.progressObj.stroe) this.progressObj.stroe = false;
    //   if (this.progressObj.loading) {
    //     const params = {
    //       step: this.progressObj['step'] ? this.progressObj['step'] : 1,
    //       uuid: this.uuid || this.data.uuid,
    //       query_id: this.progressObj['query_id'] ? this.progressObj['query_id'] : ''
    //     };
    //     getProgress(params).then(res => {
    //       if (res.code === 0) {
    //         clearInterval(this.proGressTime);
    //         if (!this.progressObj.loading) return;
    //         if (res.data.query_id) {
    //           params.query_id = res.data.query_id;
    //           params.step = params.step + 1;
    //         }
    //         if (res.data.estimatedSecond) {
    //           params.step = params.step + 1;
    //         }
    //         const result = { ...res.data, step: params.step };
    //         if (res.data.queryState) {
    //           result['progressType'] = result['progressType'] ? result['progressType'] : {};
    //           result['progressType'][res.data.queryState] = res.data.progress;
    //         }
    //         this.$set(this, 'progressObj', { ...this.progressObj, ...result });
    //         this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: Object.assign(this.progressObj, result) });
    //         this.proGressTime = setInterval(() => {
    //           getProgress(params)
    //             .then(res => {
    //               if (!this.progressObj.loading) {
    //                 clearInterval(this.proGressTime);
    //                 return;
    //               }
    //               if (res.data.query_id) {
    //                 params.query_id = res.data.query_id;
    //                 params.step = params.step + 1;
    //               }
    //               if (res.data.estimatedSecond) {
    //                 params.step = params.step + 1;
    //               }
    //               const result = { ...res.data, step: params.step };
    //               if (res.data.queryState) {
    //                 result['progressType'] = result['progressType'] ? result['progressType'] : {};
    //                 result['progressType'][res.data.queryState] = res.data.progress;
    //               }
    //               this.$set(this, 'progressObj', { ...this.progressObj, ...result });
    //               this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: Object.assign(this.progressObj, result) });
    //             })
    //             .catch(() => {
    //               clearInterval(this.proGressTime);
    //             });
    //         }, 1000 * 4);
    //       }
    //     });
    //   }
    // },
    async setSql() {
      if (this.engine.startsWith('spark-') || this.engine.startsWith('presto_')) {
        // spack引擎 jianjia表达式sql处理 (chart使用)
        if (this.sqlKeyObj.keyList.some(val => jianjiaData.includes(val.key))) {
          this.result.editSql = this.querySql;
        } else {
          this.result.editSql = (await this.farmatSqlFn(this.querySql)).sql;
        }
      }
    },
    shaerSubmit(data) {
      const params = {
        ...data,
        sharer: this.userInfo.userId,
        // region: this.region,
        // catalog: this.catalog,
        shareUrl: this.shareUrl,
        name: this.data.title.startsWith('query') ? '' : this.data.title
      };
      addShare(params).then(res => {
        this.$message({
          type: 'success',
          message: '分享成功'
        });
      });
    },
    handelClickMove(data) {
      this.form.folderName = data[this.defaultProps.label];
      this.form.folderID = data.id;
      this.$refs.selectTree.visible = false;
      this.$forceUpdate();
    },
    handletoolBarCommand(command) {
      if (command === 'dispatchFn') this.dispatchFn();
      else if (command === 'DataScanning') this.DataScanning();
      else if (command === 'apiPopoverFn') this.apiPopoverFn();
    },
    // 是否加速
    // handelAccelerate(type) {
    //   this.isAccelerate = false;
    //   if (type === 'confirm') {
    //     this.isDatabend = true;
    //   } else if (type === 'cancel') {
    //     this.isDatabend = false;
    //   }
    // },
    // api操作按钮
    apiPopoverFn() {
      this.apiDialogStatus = true;
      if (this.apiHistoryForm.path) {
        this.apiForm.title = this.apiHistoryForm.title;
      }
    },
    // 格式化语法
    transGrammar() {
      if (!this.engFunctionShow) return;
      if (!this.querySql) {
        this.$message({
          type: 'warning',
          message: '请先输入SQL!'
        });
        return;
      }

      if (this.transfEditorType) {
        this.handelTransSql();
        return;
      }

      // 首次转换增加提示
      const msg = '您确定将Ares语法转换为Spark语法吗？';
      const h = this.$createElement;
      this.$msgbox({
        title: '语法转换',
        message: h('p', null, [h('div', { style: 'margin-bottom:5px;' }, msg)]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.handelTransSql();
      });
    },
    handelTransSql() {
      // 语法转换
      const engineSparkOk = this.engine.includes('spark-');
      let querySql = this.transfEditorType ? this.oldQuerySql : this.querySql;
      querySql = removeEndStrSql(querySql);
      try {
        const formData = new FormData();
        formData.append('sql', strToBase64(querySql));
        sqlTransfer(formData).then(res => {
          if (res.data.res !== 'SUCCESS') {
            this.$notify({
              title: this.$t('common.error'),
              type: 'error',
              dangerouslyUseHTMLString: true,
              message: res.data.message + `<br />SQL脚本存在语法错误，无法完成转换!`,
              duration: 5 * 1000
            });
            return;
          }
          this.transfEditorType = true;
          const oldSql = querySql;
          if (engineSparkOk) {
            this.$refs.monaco.setCode(base64ToStr(res.data.sparkSql));
            this.formatSql();
            this.$message({
              type: 'success',
              message: '语法转换成功'
            });
          } else {
            const regionSelect = this.engineList.find(item => item.value.includes('spark-'))?.value;
            if (regionSelect) {
              this.$message({
                type: 'success',
                message: '语法转换成功'
              });
              this.engine = regionSelect;
              this.$refs.monaco.setCode(base64ToStr(res.data.sparkSql));
              this.$refs.monaco.formatSql();
            }
          }

          // 原sql回填
          this.$nextTick(() => {
            this.$refs.transfMonaco.setCode(oldSql);
          });
        });
      } catch (error) {
        this.$notify({
          title: this.$t('common.error'),
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: `SQL脚本存在语法错误，无法完成转换!`,
          duration: 5 * 1000
        });
      }
    },
    copyPath(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: 'API Path已复制到剪贴板'
      });
    },
    cancelApi() {
      this.apiDialogStatus = false;
      this.$refs.apiForm && this.$refs.apiForm.resetFields();
    },
    saveApi(type) {
      if (this.engineList.length > 0 && !this.engineList.some(item => item.value === this.engine)) {
        this.$message({
          type: 'warning',
          message: '请切换引擎或数据源'
        });
        return;
      }
      const that = this;
      const paramList = this.sqlKeyObj.keyList.map(({ key }) => key);
      const data = {
        id: this.apiHistoryForm.id,
        title: this.apiForm.title,
        engine: this.engine,
        region: this.region,
        catalog: this.catalog,
        querySql: this.querySql,
        uuid: this.uuid,
        param: paramList.join(',')
      };
      const submitApi = type === 'add' ? addDataServiceApi : updateDataServiceApi;
      const implementFn = data => {
        submitApi(data).then(res => {
          const data = res.data.data;
          if (data === '1') {
            that.$message({
              type: 'warning',
              message: 'API 名称重复'
            });
          } else {
            that.newApiPath = data;
            that.apiForm.title = '';
            that.apiPathShow = false;
            sessionStorage.setItem('ds-generateApi-refresh', 1);
          }
        });
      };
      if (type === 'update') {
        data.title = this.apiHistoryForm.title;
        implementFn(data);
      } else {
        this.$refs.apiForm.validate(valid => {
          if (valid) {
            delete data.id;
            implementFn(data);
          }
        });
      }
    },
    dispatchFn() {
      const data = {
        uuid: this.uuid,
        engine: this.engine,
        querySql: this.querySql
      };
      addDispatchMsg(data).then(res => {
        window.open(`${this.$locationOrigin}/task/step2HiveSQL?uuid=` + this.uuid);
      });
    },
    async farmatSqlFn(sql) {
      let nullType = false;
      if (this.keyList.length <= 0) {
        return {
          sql,
          nullType
        };
      }
      this.redKey = [];
      const reg = /\{\{[^(?!\{\{|\{)]+\}\}/g;
      const regRes = sql.match(reg)?.map(v => v.slice(2, -2).trim()) || [];
      const keyList = this.sqlKeyObj.keyList.filter(item => regRes.includes(item.key));
      // jinja 表达式处理
      // const jianjiaKeyList = this.sqlKeyObj.keyList.filter(item => item.disabled).map(item => item.key);
      // if (jianjiaKeyList.length > 0) {
      //   const res = await getJinjaTime({ jinja: jianjiaKeyList.join(',') });
      //   Object.keys(res.data).forEach(key => {
      //     const index = this.sqlKeyObj.keyList.findIndex(item => item.key === key);
      //     if (index > -1) this.sqlKeyObj.keyList[index].value = res.data[key];
      //   });
      // }
      // 非空判断
      nullType = keyList.some(item => item.value === '');

      keyList.forEach((item, index) => {
        if (!item.value) {
          this.redKey.push(item.key);
        }
        const currentKey = this.sqlKeyObj.regRes.find(val => val.slice(2, -2).trim() === item.key);
        sql = sql.split(currentKey).join(item.value);
      });
      if (nullType) {
        this.$message({
          type: 'warning',
          message: '请填写参数值'
        });
      }
      return { sql, nullType };
    },
    editPosition(position) {
      this.editPositionData = position;
    },
    // 扫描数据量
    async DataScanning(e) {
      if (this.scanningLoading) return;
      let message = '';
      if (!this.engine) {
        message = '请先选择引擎!';
      } else if (!this.querySql) {
        message = '请先输入SQL!';
      }
      if (message) {
        this.$message({
          type: 'warning',
          message
        });
        return;
      }
      this.scanningLoading = true;
      const selectionSql = this.$refs.monaco.getSelection();
      const resSql = selectionSql || this.querySql;
      const resObje = await this.farmatSqlFn(resSql);
      if (resObje.nullType) return;
      const data = {
        uuid: uuidStamp(),
        engine: this.engine,
        querySql: resObje.sql
      };
      dataScanSize(data)
        .then(res => {
          this.scanningStatus = res.data.scanSize;
          // this.$refs.toolbarMenu?.hide()
        })
        .catch(() => {
          this.scanningStatus = 'err';
        });
    },
    // 分享
    shareBtn() {
      const resText = getFormatUrl('uuid', this.uuid, location.hash);
      this.shareUrl = resText;
      // copy(resText, {
      //   format: 'text/plain'
      // });
      // this.$message({
      //   type: 'success',
      //   message: '分享链接已复制到剪贴板'
      // });
      this.$refs.shareDialog?.open();
    },
    dragEagle(e) {
      var targetDiv = this.$refs.sqlBox;
      this.offsetHeight = targetDiv.offsetHeight;
      this.startY = e.clientY;
      document.addEventListener('mousemove', this.moveHandler);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.moveHandler);
      });
    },
    moveHandler(e) {
      e.preventDefault();
      if (e.clientY <= 200) {
        return;
      }
      const docH = document.documentElement.clientHeight;
      if (docH - e.clientY <= 40) {
        return;
      }
      const distY = e.clientY - this.startY;
      const heightRes = this.offsetHeight + distY;
      if (heightRes > document.documentElement.clientHeight + 200 || heightRes < 200) return;
      this.height = heightRes;
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
      this.changeWidth(!this.fullscreen);
    },
    changeAIsqlType(type, handelType) {
      if (type === this.AIsqlType) {
        if (type && handelType === 'error') {
          this.$nextTick(() => {
            const data = {
              msg: this.data?.result?.message || '',
              sql: this.querySql
            };
            this.$refs.AIsql?.init(2, data);
          });
        }
        return;
      }
      this.AIsqlType = type;
      if (this.AIsqlType) {
        const data = {};
        const dd = handelType === 'init' ? 1 : 2;
        if (dd === 2) {
          data.msg = this.data?.result?.message || '';
          data.sql = this.querySql;
        }
        this.$nextTick(() => {
          this.$refs.AIsql?.init(dd, data);
        });
      }
    },
    formatSql() {
      if (this.data.grade === 3) {
        return this.$message.warning('该查询你只有查看权限');
      }
      this.$refs.monaco.formatSql();
    },
    // 申请加速
    // accelerateFn() {
    //   const params = {
    //     share_id: this.userInfo.userId,
    //     sql_base64: this.sql_base64
    //   };
    //   creatAcceleration(params).then(res => {
    //     if (res.data.result === 'success') {
    //       this.$message({
    //         type: 'success',
    //         message: '加速成功'
    //       });
    //       this.accelerateTips = false;
    //       this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'accelerateTips', value: false });
    //       this.changeActiveTab('AccelerateTab');
    //     } else {
    //       this.$message({
    //         type: 'error',
    //         message: '申请失败'
    //       });
    //     }
    //   });
    // },
    async execute(e, sql) {
      if (this.transfEditorType) this.transfEditorType = false;
      if (this.data.grade === 3) {
        return this.$message.warning('该查询你只有查看权限');
      }
      if (this.running) return;
      let message = '';
      if (!this.engine) {
        message = '请先选择引擎!';
      } else if (!this.catalog) {
        message = '请先选择数据源!';
      } else if (!this.querySql) {
        message = '请先输入SQL!';
      } else if (this.engineList.length > 0 && !this.engineList.some(item => item.value === this.engine)) {
        message = '请切换引擎或数据源!';
      }
      if (message) {
        this.$message({
          type: 'warning',
          message
        });
        return;
      }
      const selectionSql = this.$refs.monaco.getSelection();
      const resSql = sql || selectionSql || this.querySql;
      const resObje = await this.farmatSqlFn(resSql);
      if (resObje.nullType) return;
      const farmatSql = removeEndStrSql(resObje.sql);

      const querySql = farmatSql;
      // 多条sql提示
      // if (querySql.split(';').filter(str => str.trim()).length > 1 && !this.engine.startsWith('spark-')) {
      //   this.$message({
      //     type: 'warning',
      //     message: '识别到您运行的代码中含有多条SQL，请选择您要执行的SQL运行!'
      //   });
      //   return;
      // }

      // 变量替换
      const param = {};
      this.sqlKeyObj.keyList.forEach(item => {
        param[item.key] = item.value;
      });

      this.running = true;
      // 分享按钮状态的处理
      if (this.showShare) this.showShare = false;
      this.uuid = uuidStamp();
      const data = {
        name: this.data.name,
        uuid: this.uuid,
        engine: this.engine,
        catalog: this.catalog,
        database: localGetItem('ds-query-database') || '',
        querySql,
        querySqlParam: Object.keys(param).length > 0 ? resSql : '',
        param,
        region: this.region
      };

      // 保存的查询  不需要推荐引擎   关闭短期内不再弹窗的不需要推荐引擎    spark引擎的不需要推荐
      const cpmType = getLocalCpmType();
      const sparkEngine = this.engine?.includes('spark');
      if (this.form.submited || this.data.submited || cpmType) data.confirmedSmart = 1;
      if (sparkEngine) data.confirmedSmart = 0;

      // this.$delete(this.data, 'result');
      this.$store.commit('SET_SQLLIST', { key: this.region, list: { engine: this.engine, running: true, name: this.data.name, once: true, status: 3 }});
      this.initList();
      this.$nextTick(() => {
        this.$set(this.result, 'executeDuration', 0);
        this.result.status = 3;
        this.result.fileSize = '';
        this.result.scanSize = '';
        this.timer = setInterval(() => {
          this.result.executeDuration += 1;
        }, 1000);
      });
      localSet(this.region, { name: this.data.name, title: this.data.title, querySql: this.querySql, uuid: this.uuid, engine: this.engine, catalog: this.catalog });

      // 结果展示区触发
      this.$nextTick(() => {
        this.handelExecute();
      });

      // 一键加速
      // if (this.accelerateEngineState) {
      //   try {
      //     this.sql_base64 = this.$utils.strToBase64(farmatSql);
      //     const params = {
      //       share_id: this.userInfo.userId,
      //       sql_base64: this.sql_base64
      //     };
      //     // 提示是否加速
      //     const result = await (await accelerateType(params)).data;
      //     if (result.result === 'yes') {
      //       this.isAccelerate = true;
      //       this.isDatabend = true;
      //       this.accTime = setTimeout(() => {
      //         this.isAccelerate = false;
      //         this.performance(data);
      //       }, 2000);
      //     } else {
      //       this.performance(data);
      //     }
      //   } catch (error) {
      //     this.performance(data);
      //   }
      // } else {
      //   // 非加速
      //   this.performance(data);
      // }

      // 非加速
      this.performance(data);

      // presto引擎进度
      // if (this.engine.startsWith('presto') && !this.engine.includes('huawei')) {
      //   const startDate = new Date().getTime();
      //   this.progressObj = { startDate, loading: true, step: 1 };
      //   this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { startDate, loading: true, step: 1 }});
      //   this.progressSetTime = setTimeout(() => {
      //     this.$set(this.progressObj, 'endDate', new Date().getTime());
      //     this.progressFn();
      //   }, 1000 * 2);
      // }
    },
    // sql执行接口
    performance(data) {
      // 清楚原有chart
      this.resultOption.toolList = undefined;

      this.executeType = true;
      data.isDatabend = this.isDatabend ? 0 : 1;
      this.$store
        .dispatch('saveSqueryList', data)
        .then(res => {
          const ress = res.data;
          this.result = { executeDuration: this.result.executeDuration, ...res };

          // 加速申请
          // if (this.accelerateEngineState && res.executeDuration >= 30 && res.status === 0) {
          //   const params = {
          //     share_id: this.userInfo.userId,
          //     sql_base64: this.sql_base64
          //   };
          //   accRequirements(params).then(val => {
          //     if (val.data?.result === 'yes') {
          //       // this.accTableName = val.table_name || 'XXX';
          //       this.accelerateTips = true;
          //       this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'accelerateTips', value: true });
          //       // 切换引擎状态会丢失  重新刷数据然后watch判断
          //       this.initList();
          //     }
          //   });
          // }
          // mysql引擎优化  单独获取下载量
          if (this.engine.startsWith('mysql_')) {
            clearInterval(this.timerInter);

            getFileSize({ uuid: this.uuid })
              .then(data => {
                if (data.data.ready === 0) {
                  res.fileSize = data.data.fileSize;
                  this.$store.commit('SET_SQLLIST', { key: this.region, list: res });
                } else {
                  this.timerInter = setInterval(() => {
                    getFileSize({ uuid: this.uuid })
                      .then(data => {
                        if (data.data.ready === 0) {
                          clearInterval(this.timerInter);
                          res.fileSize = data.data.fileSize;
                          this.$store.commit('SET_SQLLIST', { key: this.region, list: res });
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        clearInterval(this.timerInter);
                      });
                  }, 5000);
                }
              })
              .catch(err => {
                console.log(err);
              });
          }
          // presto进度
          if (this.engine.startsWith('presto')) {
            clearInterval(this.proGressTime);
            clearTimeout(this.progressSetTime);
            this.progressObj = { loading: false };
            this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { loading: false }});
          }

          // 状态改变
          this.executeType = false;
          this.isDatabend = false;
          this.showShare = true;
          this.running = false;
          this.initList();
        })
        .catch(error => {
          // presto进度
          // if (this.engine.startsWith('presto')) {
          //   clearInterval(this.proGressTime);
          //   clearTimeout(this.progressSetTime);
          //   this.progressObj = { loading: false };
          //   this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { loading: false }});
          // }
          // 智能引擎推荐
          if (error.data === 1001) {
            localSet(data.region, { name: this.data.name, uuid: '' });
            this.$store.commit('SET_SQLLIST', { key: data.region, list: { engine: data.engine, running: true, name: this.data.name, once: true, status: 3 }});
            const engine = error.message.slice(error.message.lastIndexOf(':') + 2);
            data.name = this.data.name;
            this.$set(this.smartEngineObj, 'smartEngineType', true);
            this.$set(this.smartEngineObj, 'smartEngine', engine);
            this.$set(this.smartEngineObj, 'params', data);
            this.$store.commit('SET_SQLOPTIONS', { region: data.region, name: data.name, key: 'smartEngineObj', value: { smartEngineType: true, smartEngine: engine, params: data }});
          } else {
            this.result.status = 1;
            this.result.codeStr = error.codeStr;
            this.result.message = error.message;
            // 无数据权限
            if (error.data === 403) {
              this.$alert(error.message, '提示(暂无数据权限)', {
                confirmButtonText: '去申请数据权限',
                callback: action => {
                  // this.$router.push('/');
                  if (action === 'confirm') {
                    // 获取表名  跳转元数据
                    if (error.errorZh) {
                      const start = error.errorZh.indexOf('：');
                      const end = error.errorZh.indexOf(' ');
                      if (start > 0) {
                        const name = error.errorZh.slice(start + 1, end);
                        window.open(`${this.$locationOrigin}/meta/list?tableName=${name}`);
                        return;
                      }
                    }
                    window.open(`${this.$locationOrigin}/meta/list`);
                  }
                }
              });
            }
            // 状态改变
            this.executeType = false;
            this.isDatabend = false;
            this.showShare = true;
            this.running = false;
            this.initList();
          }
        })
        .finally(() => {
          sessionStorage.setItem('ds-historyTab-refresh', 1);
          clearInterval(this.timer);
        });
    },
    handelExecute() {
      this.$refs.result?.handelExecute();
      if (this.engine.includes('hive')) {
        this.$refs.result?.hivehandelExecute();
      }
    },
    // 智能引擎
    smartEngineFn(type) {
      if (this.cpmType) setLocalCpmType(this.cpmType);
      this.$set(this.result, 'executeDuration', 0);
      this.timer = setInterval(() => {
        this.result.executeDuration += 1;
      }, 1000);

      // 改变状态缓存智能引擎状态
      this.smartEngineObj.smartEngineType = false;
      this.$store.commit('SET_SQLOPTIONS', { region: this.smartEngineObj.params.region, name: this.smartEngineObj.params.name, key: 'smartEngineObj', value: { smartEngineType: false }});

      // 切换推荐引擎
      if (type) {
        this.retain = true;
        setTimeout(() => {
          this.retain = false;
        }, 200);
        this.engine = this.smartEngineObj.smartEngine;
      }

      const engine = type ? this.smartEngineObj.smartEngine : this.smartEngineObj.params.engine;
      this.uuid = uuidStamp();
      const data = {
        ...this.smartEngineObj.params,
        engine,
        uuid: this.uuid,
        confirmedSmart: 1
      };
      localSet(data.region, { name: this.smartEngineObj.params.name, uuid: this.uuid, engine });
      if (type) this.$store.commit('SET_SQLLIST', { key: data.region, list: { engine: data.engine, running: true, name: data.name, once: true, status: 3 }});

      // presto引擎进度
      // if (data.engine.startsWith('presto') && !this.engine.includes('huawei')) {
      //   const startDate = new Date().getTime();
      //   this.progressObj = { startDate, loading: true, step: 1 };
      //   this.$store.commit('SET_SQLOPTIONS', { region: data.region, name: data.name, key: 'progressObj', value: { startDate, loading: true, step: 1 }});
      //   this.progressSetTime = setTimeout(() => {
      //     this.$set(this.progressObj, 'endDate', new Date().getTime());
      //     this.progressFn();
      //   }, 1000 * 2);
      // }

      this.performance(data);
    },
    cancel() {
      if (this.uuid) {
        // 加速判断中取消
        if (this.isAccelerate) {
          this.isAccelerate = false;
          clearTimeout(this.accTime);
          const data = {};
          data.uuid = this.uuid;
          data.running = false;
          data.engine = this.engine;
          data.once = true;
          data.name = this.data.name;
          data.message = '已取消';
          data.status = 2;
          this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
          this.initList();
          return;
        }
        // 未真正执行点击取消跳出
        // if (!this.executeType) return;
        cancel(this.uuid).then(res => {
          const data = res.data;
          const sqlObj = this.sqlList[this.engine] || {};
          const uuidList = [];
          Object.keys(sqlObj).forEach(key => {
            uuidList.push(sqlObj[key].uuid);
          });
          if (uuidList.includes(this.uuid)) return;
          data.uuid = this.uuid;
          data.running = false;
          data.once = true;
          data.engine = this.engine;
          data.name = this.data.name;
          if (this.timer) clearTimeout(this.timer);
          this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
          this.$store.commit('SET_CANCELLEDlIST', { uuid: this.uuid, type: 'add' });
          this.showShare = true;
          this.initList();
        });
      }
    },
    // clear() {
    //   this.$refs.monaco.setCode('');
    // },
    save() {
      this.dialogVisible = true;
      if (!this.data.title.startsWith('query')) this.form.title = this.data.title;
    },
    openDialog() {
      this.$refs.saveMonaco.setCode(this.querySql);
    },
    closeDialog() {
      this.$refs.form.resetFields();
    },
    submit(choice) {
      if (this.engineList.length > 0 && !this.engineList.some(item => item.value === this.engine)) {
        this.$message({
          type: 'warning',
          message: '请切换引擎或数据源'
        });
        return;
      }
      const param = {};
      this.sqlKeyObj.keyList.forEach(item => {
        param[item.key] = item.value;
      });
      const params = {
        ...this.form,
        querySql: this.querySql,
        engine: this.engine,
        region: this.region,
        catalog: this.catalog,
        param
      };
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form && this.form.submited) {
            if (choice === 'determine') {
              params.id = this.form.submited;
              update(params).then(res => {
                this.$message({
                  type: 'success',
                  message: '保存成功'
                });
                localSet(this.region, { name: this.data.name, title: this.form.title });
                this.data.title = this.form.title;
              });
            } else if (choice === 'saveAS') {
              delete params.id;
              add(params).then(res => {
                this.$message({
                  type: 'success',
                  message: '保存成功'
                });
                localSet(this.region, { name: this.data.name, title: this.form.title });
                this.data.title = this.form.title;
              });
            }
          } else {
            add(params).then(res => {
              this.$message({
                type: 'success',
                message: '保存成功'
              });
              localSet(this.region, { name: this.data.name, title: this.form.title });
              this.data.title = this.form.title;
            });
          }
          this.dialogVisible = false;
          sessionStorage.setItem('ds-saveTab-refresh', 1);
        }
      });
    },
    insertContent(content) {
      this.$refs.monaco.insertContent(content);
    },
    changeData(data) {
      this.form = data;
      const querySql = data.querySqlParam || data.querySql;
      this.$refs.monaco.setCode(querySql);
      const catalog = data.catalog || '';
      if (catalog) this.SET_CATALOG(catalog);
      // 权限
      if (data.grade) {
        localSet(this.region, { name: this.data.name, grade: data.grade });
      }
      this.$nextTick(() => {
        this.engine = data.engine;
      });
      const saveObj = { name: this.data.name, title: this.data.title, querySql: data.querySql, engine: data.engine || this.engine };
      if (data.uuid) saveObj.uuid = data.uuid;
      if (data.catalog) saveObj.catalog = data.catalog;
      localSet(this.region, saveObj);
      if (data.uuid) {
        // 原有chart数据清楚
        this.resultOption.toolList = undefined;
        // 运行状态处理
        this.retain = true;
        setTimeout(() => {
          this.retain = false;
        }, 500);
        // api跳转
        if (data.path) {
          this.apiHistoryForm = data;
          this.apiPathShow = true;
        }

        clearInterval(this.timer);
        this.uuid = data.uuid;
        this.running = true;
        this.$store.commit('SET_SQLLIST', { key: this.region, list: { engine: data.engine || this.engine, status: 3, name: this.data.name, once: true, running: true }});
        this.initList();
        // this.result.executeDuration = 0;
        this.$nextTick(() => {
          this.$set(this.result, 'executeDuration', 0);
          this.timer = setInterval(() => {
            this.result.executeDuration += 1;
          }, 1000);
        });
        getDataById(this.uuid)
          .then(res => {
            const ress = res.data;
            if (ress.status !== 3) {
              clearInterval(this.timer);
              this.running = false;

              this.result = { executeDuration: this.result.executeDuration, ...ress };
              ress.name = this.data.name;
              ress.once = true;
              ress.running = false;
              if (ress.param && Object.keys(ress.param).length > 0) {
                const keyList = [];
                Object.keys(ress.param).forEach(key => {
                  keyList.push({
                    key,
                    value: ress.param[key]
                  });
                });
                ress.keyList = keyList;
              }
              this.$store.commit('SET_SQLLIST', { key: this.region, list: ress });
              this.showShare = true;
              this.initList();
              return;
            } else {
              // presto引擎进度
              // if (data.engine.startsWith('presto') && !this.engine.includes('huawei')) {
              //   const startDate = new Date().getTime();
              //   this.progressObj = { startDate, loading: true, step: 1 };
              //   this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'progressObj', value: { startDate, loading: true, step: 1 }});
              //   this.progressSetTime = setTimeout(() => {
              //     this.$set(this.progressObj, 'endDate', new Date().getTime());
              //     this.progressFn();
              //   }, 1000 * 2);
              // }
              this.$nextTick(() => {
                this.handelExecute();
              });
            }
            // 执行中的状态循环请求
            this.timerTow = setInterval(() => {
              getDataById(this.uuid)
                .then(res => {
                  const ress = res.data;
                  if (ress.status !== 3) {
                    clearInterval(this.timer);
                    clearInterval(this.timerTow);
                    this.running = false;

                    if (this.result.status !== 3) return;
                    this.result = { executeDuration: this.result.executeDuration, ...ress };
                    ress.name = this.data.name;
                    ress.once = true;
                    ress.running = false;
                    if (ress.param && Object.keys(ress.param).length > 0) {
                      const keyList = [];
                      Object.keys(ress.param).forEach(key => {
                        keyList.push({
                          key,
                          value: ress.param[key]
                        });
                      });
                      ress.keyList = keyList;
                    }
                    this.$store.commit('SET_SQLLIST', { key: this.region, list: ress });
                    this.showShare = true;
                    this.initList();
                  }
                })
                .catch(() => {
                  clearInterval(this.timer);
                  clearInterval(this.timerTow);
                });
            }, 8000);
          })
          .catch(err => {
            clearInterval(this.timer);
            clearInterval(this.timerTow);
            const data = {};
            data.status = 1;
            data.message = err.message || '查询出错';
            this.running = false;

            this.result = { executeDuration: this.result.executeDuration, ...data };
            data.name = this.data.name;
            data.once = true;
            data.engine = this.engine;
            data.running = false;
            this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
            localSet(this.region, { name: this.data.name, title: this.data.title, querySql: data.querySql, uuid: data.uuid, engine: data.engine });
            this.showShare = true;
            this.initList();
          });
      } else {
        this.form.submited = data.id;
        localSet(this.region, { name: this.data.name, submited: this.form.submited });
        // 处理保存文件名称
        if (data.folderID) {
          this.form.folderName = getfolderName(this.folderList, this.defaultProps['children'], data.folderID);
        }
        this.data.status = 0;
        const paramObj = data.param ? data.param : {};
        if (Object.keys(paramObj).length > 0) {
          const keyList = [];
          Object.keys(paramObj).forEach(key => {
            keyList.push({
              key,
              value: paramObj[key]
            });
          });
          this.sqlKeyObj.keyList = keyList;
        }
      }
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.smartEngine {
  width: 30vw;
  // height: 45vh;
  border: 1px solid #e2e9f3;
  border-radius: 5px;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
  background-color: #fff;
  position: fixed;
  top: 250px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  .title {
    font-size: $global-font-size-14;
    font-weight: 600;
    margin-bottom: 15px;
  }
  .box {
    padding: 0 15px;
    .content {
      margin-bottom: 15px;
    }
    .footer {
      text-align: end;
      .tipsbtn {
        ::v-deep .el-checkbox__label {
          font-size: $global-font-size-12;
          padding: 0 10px 0 3px;
        }
      }
    }
  }
}
.QE_popper {
  .tips_box {
    max-height: 45vh;
    overflow: auto;
    .title {
      font-size: $global-font-size-14;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .el-table {
      margin-bottom: 15px;
    }
    .tips_text {
      margin-bottom: 10px;
    }
  }
}
.disabled {
  cursor: not-allowed !important;
  opacity: 0.5;
}
.query_menu {
  .svg_help {
    pointer-events: auto;
  }
}
.query-tab-item {
  height: 100%;
  .toolbar {
    display: flex;
    height: 30px;
    padding: 4px 10px;
    justify-content: space-between;
    align-items: center;
    .toolbar-l,
    .toolbar-r {
      display: flex;
      align-items: center;
    }
    .toolbar-l {
      .toolbar-icon {
        font-size: $global-font-size-14;
        display: flex;
        align-items: center;
        margin-right: 10px;
        cursor: pointer;
        .popver {
          visibility: hidden;
          position: absolute;
          top: 37px;
          left: 0;
          display: inline-block;
          z-index: 100;
          width: 150px;
          background: #fff;
          border: 1px solid #ebeef5;
          box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
          border-radius: 4px;
          padding: 5px;
          font-size: $global-font-size-12;
          &::before {
            content: '';
            display: inline-block;
            width: 0;
            height: 0;
            border: 8px solid transparent;
            border-bottom-color: #fff;
            position: absolute;
            top: -16px;
            left: 12px;
            z-index: 100;
          }
          .footer {
            margin-top: 3px;
            text-align: end;
            .el-button--text {
              font-size: $global-font-size-12;
              padding: 0;
              color: #909399;
              &:last-child {
                margin-left: 5px;
                color: #5c99ff;
              }
            }
          }
        }
        .isActive {
          visibility: visible;
        }
        .execute {
          background-color: #ecf9ec;
          color: #41c143;
          &:hover {
            background-color: #ecf9ec;
            color: #41c143;
          }
        }
        .stop {
          background-color: #f4f6f9;
          color: #93a1c2;
          &:hover {
            background-color: #f4f6f9;
            color: #93a1c2;
          }
          .icon {
            color: #93a1c2;
            vertical-align: bottom;
          }
        }
        .aisql {
          background-color: #ececf5;
          color: #8a7dd5;
          border-color: #c6bfe8;
          &:hover {
            background-color: #ececf5;
            color: #8a7dd5;
            border-color: #8a7dd5;
          }
          .icon {
            color: #8a7dd5;
            vertical-align: bottom;
            transform: scale(1.3);
          }
        }
        .formatBtn {
          background-color: #fff6e8;
          color: #ffa61d;
          &:hover {
            background-color: #fff6e8;
            color: #ffa61d;
          }
        }
        .transBtn {
          &:hover {
            background-color: #ebf3ff;
            color: $c-primary;
          }
        }
        .controlBtn {
          &:hover {
            background-color: #fee;
            color: #ff5656;
          }
          &.is-disabled:hover {
            color: #ff9a9a;
          }
        }
        .assistant {
          transform: scale(1.7) !important;
        }
      }
      .toolbar-menu {
        display: flex;
        align-items: center;
        .svg_extendedMenu {
          margin-top: 4px;
        }
      }
    }
    .toolbar-r {
      margin-right: 7px;
      position: relative;
      display: flex;
      align-items: center;
      font-size: $global-font-size-14;
      .toolbar-icon {
        margin-left: 8px;
        cursor: pointer;
        svg {
          vertical-align: bottom;
          margin-right: 4px;
        }
      }
      .toolbar-save {
        vertical-align: bottom;
        background-color: $c-primary;
        border-color: $c-primary;
      }
      .toolbar-share {
        background-color: #9587de;
        border-color: #9587de;
        color: #fff;
      }
      .engine_select {
        display: flex;
        align-items: center;
        .label {
          margin-right: 5px;
        }
      }
    }
  }
  .accelerate_alert {
    padding: 2px 16px;
    .accelerate_tips {
      display: flex;
      align-items: center;
      font-size: $global-font-size-14;
      color: #876b3c;
      .message {
        flex: 1;
      }
      .btn {
        height: 26px;
        width: 60px;
        display: inline-block;
        padding: 2px 12px;
        background-color: #e0bc7a;
        border: none;
        border-radius: 21px;
        color: #3e321e;
        margin-left: 20px;
        margin-right: 5px;
        cursor: pointer;
      }
    }
    ::v-deep .el-icon-close {
      color: #876b3c;
      top: 10px;
    }
  }
  .sql-box {
    position: relative;
    .editor_wrap {
      height: 100%;
      display: flex;
      .editor {
        width: 100%;
        display: flex;
        height: 100%;
        &.aIshow {
          width: 50%;
        }
        .editor_item {
          width: 100%;
          position: relative;
          border: 1px solid #e4e7ed;
          border-left: 0;
          .monaco-editor {
            border: 0;
          }
          .title {
            height: 0;
          }
          .tool {
            height: 0;
          }
        }
        &.transf {
          .editor_item {
            width: 50%;
            padding-top: 30px;
          }
          .title {
            position: absolute;
            top: 0;
            z-index: 100;
            font-weight: 550;
            padding: 7px 0 5px 12px;
          }
          .tool {
            position: absolute;
            right: 10px;
            top: 6px;
            font-size: $global-font-size-16;
            cursor: pointer;
            z-index: 1000;
          }
        }
      }
      .ai_sql {
        width: 50%;
      }
    }
    &.table-fullscreen {
      overflow-y: hidden;
    }
    .btn-full-screen {
      right: 16px;
      z-index: 100;
    }
    .selection_btn {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 45px;
      display: flex;
      flex-direction: column;
      z-index: 100;
      border: 1px solid #e2e9f3;
      padding: 3px;
      border-radius: 3px;
      box-shadow: 2px 2px 8px 0 rgba(0, 0, 0, 0.2);
      .icon {
        padding: 6px 2px;
      }
      .el-icon-upload2 {
        border-bottom: 1px solid #e2e9f3;
      }
    }
    .variable {
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: $global-font-size-12;
      width: 100%;
      padding: 0 5px;
      // margin-bottom: 10px;
      .row {
        display: flex;
        flex-wrap: wrap;
        padding: 3px 10px;
        padding-left: 0;
        padding-bottom: 0;
      }
      .col {
        width: calc((100% - 40px) / 6);
        display: flex;
        margin-bottom: 3px;
        margin-left: 5px;
        background-color: #f2f2f2;
        .label {
          display: inline-block;
          width: 65px;
          line-height: 24px;
          text-align: center;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .redInput {
          ::v-deep .el-input__inner {
            border-color: #d34f4f;
          }
        }
        ::v-deep .el-input__inner {
          padding: 0 3px;
        }
      }
    }
    .tips {
      cursor: pointer;
      position: absolute;
      top: 28px;
      right: 18px;
      z-index: 100;
      transform: scale(2);
    }
  }
  .result {
    position: relative;
    .drag {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      height: 20px;
      line-height: 10px;
      cursor: row-resize;
      text-align: center;
      .bar {
        display: inline-block;
        height: 3px;
        width: 25px;
        background-color: #c0c0c0;
      }
    }
  }
}
.apiDial {
  ::v-deep .el-dialog__body {
    padding: 10px 20px 15px 20px;
    .apiDial_box {
      .apiTips_title {
        margin-top: -10px;
        margin-bottom: 10px;
      }
      .tips-path {
        text-indent: 2em;
        line-height: 20px;
        i {
          display: inline;
          margin-left: 15px;
        }
      }
      .floor {
        text-align: end;
      }
    }
  }
}
</style>
<style lang="scss">
.sqlParamsClass {
  padding: 5px;
}
.el-message-box {
  .el-message-box__title {
    font-size: $global-font-size-16;
  }
}
.svg_extendedMenu {
  transform: scale(1.2);
}
</style>
