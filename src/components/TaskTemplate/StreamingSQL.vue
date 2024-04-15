<!--  Flink SQL 模板 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-show="currentStep === 1">
        <el-form ref="form" class="inline-form" :inline="true" :model="form" :rules="dataRules" label-width="82px">
          <el-form-item label="输入数据集">
            <el-cascader ref="inputDataset" v-model="form.inputDataset[0].completePath" placeholder="请选择数据集" :title="ruleForm.inputDataset.name" :show-all-levels="false" :options="options" :props="props" clearable filterable @change="handleChange($event, 'inputDataset')"> </el-cascader>
          </el-form-item>
          <el-form-item label="输出数据集">
            <el-cascader ref="outputDataset" v-model="form.outputDataset[0].completePath" placeholder="请选择数据集" :title="ruleForm.outputDataset.name" :show-all-levels="false" :options="options" :props="props" clearable filterable @change="handleChange($event, 'outputDataset')"></el-cascader>
          </el-form-item>
        </el-form>
        <el-tabs class="process">
          <el-tab-pane>
            <template #label>
              <span class="label">
                加工逻辑
                <sql-smaple name="flink_sql" class="sqlSmaple"></sql-smaple>
              </span>
            </template>
            <div class="monaco-btns">
              <span class="tips" @click="handelInfo('jinjia', '示例参数如下：')">参数提示</span>
              <el-button type="primary" @click="drawerVisible = true">高级设置</el-button>
            </div>
            <div class="editor_tool">
              <el-button plain size="mini" type="primary" :disabled="checkDisabled" @click="checkSql">校验</el-button>
              <el-button plain size="mini" type="primary" @click="formatSql">格式化</el-button>
              <el-button plain size="mini" type="primary" @click="clearSql">清除</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
          <span class="require">*</span>
          <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
          <monaco-editor v-if="currentStep === 1" :key="currentStep" ref="monaco" v-model="content" v-loading="checkDisabled"></monaco-editor>
        </div>
        <div v-if="alertMessage" class="mt10">校验结果：</div>
        <el-alert v-if="alertMessage" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :is-show-dispatch="seniorFormSql.runtimeConfig.isBatchTask" :is-show-input-btn="true" :is-show-output-btn="true" :is-input-edit="true" :is-output-edit="true" :is-jar="true" :is-show-offset="false" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :region-list="regionList"
        :info="info"
        :content="content"
        :is-show-dispatch="seniorFormSql.runtimeConfig.isBatchTask"
        :is-show-input-btn="true"
        :is-show-output-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-jar="true"
        :is-show-offset="false"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl" :size="500" :before-close="handleClose">
        <!--  :is-show-model="true" -->
        <senior-sql-form ref="seniorFormSql" :no-cluster="noCluster" :is-show-batch="true" :senior-form="seniorFormSql" :region="form.region" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <!-- <el-button v-if="isShowPublish && currentStep === 2 && seniorFormSql.runtimeConfig.isBatchTask" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
      }}</el-button>
      <el-checkbox v-if="isShowPublish && currentStep >= 2 && seniorFormSql.isBatchTask" v-model="ruleForm.invokingStatus" :disabled="disabled" class="task-checkbox">切换至该版本</el-checkbox>
    </div>
    <valid-params ref="validParams" :code="ruleForm.templateCode" @save="save" />

    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
    </el-info>
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlTips from './components/SqlTips';
import SqlSmaple from './components/SqlSmaple';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import { getDataSetList, getDdl, getClusterList, check } from '@/api/task'; // getClusterNotauto
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SqlTips,
    SqlSmaple,
    MonacoEditor,
    SeniorSqlForm,
    StepThree,
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
    return {
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      regionList: tools.regionList,
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      noCluster: false,
      currentStep: 1,
      fullscreen: false,
      options: [
        {
          value: 'ue1',
          label: 'AWS 美东',
          children: [
            // {
            //   value: 'kafka',
            //   label: 'kafka'
            // },
            {
              value: 'mysql',
              label: 'MySql'
            },
            // {
            //   value: 'es',
            //   label: 'ES'
            // },
            {
              value: 'hive',
              label: 'Iceberg'
            },
            {
              value: 'clickhouse',
              label: 'ClickHouse'
            }
            // , {
            //   value: 'sharestore',
            //   label: 'ShareStore'
            // }, {
            //   value: 'cassandra',
            //   label: 'Cassandra'
            // }
          ]
        },
        {
          value: 'sg1',
          label: 'AWS 新加坡',
          children: [
            // {
            //   value: 'kafka',
            //   label: 'kafka'
            // },
            {
              value: 'mysql',
              label: 'MySql'
            },
            {
              value: 'hive',
              label: 'Iceberg'
            },
            {
              value: 'clickhouse',
              label: 'ClickHouse'
            }
          ]
        },
        {
          value: 'sg2',
          label: '华为 新加坡',
          children: [
            // {
            //   value: 'kafka',
            //   label: 'kafka'
            // },
            {
              value: 'mysql',
              label: 'MySql'
            },
            {
              value: 'hive',
              label: 'Iceberg'
            },
            {
              value: 'clickhouse',
              label: 'ClickHouse'
            }
          ]
        }
      ],
      props: {
        lazy: true,
        lazyLoad: this.getDataSetData
      },
      content: '',
      form: {
        region: '',
        inputDataset: [
          {
            completePath: [],
            metadata: {
              region: '',
              type: '',
              source: '',
              db: '',
              table: ''
            },
            guid: '',
            id: '',
            granularity: 'daily',
            // offset: -1,
            unitOffset: -1,
            ready_time: '0 0 * * *',
            useDateCalcuParam: false,
            dateCalculationParam: {}
          }
        ],
        outputDataset: [
          {
            completePath: [],
            metadata: {
              region: '',
              type: '',
              source: '',
              db: '',
              table: ''
            },
            guid: '',
            id: ''
          }
        ]
      },
      ruleForm: {
        invokingStatus: true,
        templateCode: 'StreamingSQL',
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
        eventDepends: [],
        // 输入数据集
        inputDataset: [],
        // 输出数据集
        outputDataset: [],
        content: '',
        name: '',
        description: '',
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      dataRules: {
        region: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            completePath: [{ required: true, message: '请选择输入数据集', trigger: ['blur', 'change'] }]
          }
        ],
        outputDataset: [
          {
            completePath: [{ required: true, message: '请选择输出数据集', trigger: ['blur', 'change'] }]
          }
        ]
      },
      seniorFormSql: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointTimeout: 100,
          checkpointMode: 'AT_LEAST_ONCE',
          // isAutoScaleMode: false,
          isBatchTask: false,
          emails: '',
          alertMethod: ['dingTalk'],
          alertType: [2],
          alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
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
          isAutoScaleMode: false,
          strategyList: []
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      clusterList: [],
      canEdit: true,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      copyMsg: null,
      contentObj: {
        inputDataset: '',
        outputDataset: ''
      },
      isEdit: false
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorFormSql);
    },
    disabled() {
      return this.currentStep === 3;
    }
  },
  watch: {
    data: {
      handler(value) {
        if (Object.keys(value).length > 0) {
          this.getTaskInfo(value);
          this.isEdit = true;
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
      this.options = JSON.parse(JSON.stringify(res));
      this.options.map(item => {
        item.children = [
          {
            value: 'mysql',
            label: 'MySql'
          },
          {
            value: 'hive',
            label: 'Iceberg'
          },
          {
            value: 'clickhouse',
            label: 'ClickHouse'
          }
        ];
      });
      if (!this.isEdit) {
        this.form.region = res[0].value;
        this.changeRegion(res[0].value);
      }
    });
    this.seniorFormSql.runtimeConfig.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
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
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      this.form.region = runtimeConfig.region;
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset.forEach(item => {
        if (item.metadata.table === '') {
          this.$set(item, 'isMetadataSel', false);
        } else {
          this.$set(item, 'isMetadataSel', true);
        }
      });

      if (data.content) {
        this.content = decodeURIComponent(window.atob(data.content));
        this.$refs.monaco && this.$refs.monaco.setCode(this.content);
      }
      if (this.ruleForm.inputDataset.length) {
        this.form.inputDataset = this.ruleForm.inputDataset;
        this.$refs.inputDataset.inputValue = '';
        if (this.ruleForm.inputDataset[0].metadata && this.ruleForm.inputDataset[0].metadata.table) {
          this.$refs.inputDataset.inputValue = this.ruleForm.inputDataset[0].metadata.table;
        }
      }
      if (this.ruleForm.outputDataset.length) {
        this.ruleForm.outputDataset.forEach(item => {
          // if (item.metadata.table === '') {
          //   this.$set(item, 'isMetadataSel', false);
          // } else {
          //   this.$set(item, 'isMetadataSel', true);
          // }
          if (item.metadata && item.metadata.table !== '') {
            this.$set(item, 'isMetadataSel', true);
          } else {
            this.$set(item, 'isMetadataSel', false);
          }
        });
        this.form.outputDataset = this.ruleForm.outputDataset;
        this.$refs.outputDataset.inputValue = '';
        if (this.ruleForm.outputDataset[0].metadata && this.ruleForm.outputDataset[0].metadata.table) {
          this.$refs.outputDataset.inputValue = this.ruleForm.outputDataset[0].metadata.table;
        }
      }
      this.seniorFormSql.flinkClusterId = data.flinkClusterId;
      // this.seniorFormSql.runtimeConfig = runtimeConfig;
      Object.assign(this.seniorFormSql.runtimeConfig, runtimeConfig);
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
      if (data.dependTypes) {
        this.ruleForm.dependTypes = JSON.parse(data.dependTypes);
      }
      if (data.triggerParam) {
        Object.assign(this.ruleForm.triggerParam, JSON.parse(data.triggerParam));
      }
      if (data.eventDepends) {
        this.ruleForm.eventDepends = JSON.parse(data.eventDepends);
      }
      if (this.copyId) {
        this.ruleForm.name = data.name + '-copy';
        this.seniorFormSql.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
    },
    changeRegion(val) {
      if (val) {
        this.getCluster();
      }
    },
    getCluster() {
      const params = {
        region: this.form.region
      };
      // getClusterNotauto
      getClusterList(params).then(res => {
        const data = res.data;
        if (data && data.length) {
          this.clusterList = data;
        } else {
          this.drawerVisible = true;
          this.noCluster = true;
        }
      });
    },
    getDataSetData(node, resolve) {
      const { level } = node;
      const children = node.children;
      node.children = [];
      if (level === 1) {
        // 第一级
        resolve(children);
      } else if (level === 2) {
        // 第二级
        const parentValue = node.parent.value;
        const params = {
          region: parentValue,
          type: node.value
        };
        if (node.value === 'hive' || node.value === 'mysql' || node.value === 'metis' || node.value === 'clickhouse') {
          params.metaFlag = 'AIRBYTE';
          params.templateCode = this.ruleForm.templateCode;
        }
        getDataSetList(params).then(res => {
          const data = res.data;
          let nodes = [];
          if (data) {
            nodes = data.data.map(item => ({
              label: node.value === 'metis' ? item.qualifiedName : item.name,
              value: node.value === 'metis' ? item : node.value === 'mysql' || node.value === 'clickhouse' ? item.actorId : item.name,
              leaf: node.value === 'metis'
            }));
          }
          resolve(nodes);
        });
      } else if (level === 3) {
        const pValue = node.parent.value;
        const gPValue = node.parent.parent.value;
        if (pValue === 'mysql' || pValue === 'clickhouse') {
          const params = {
            region: gPValue,
            type: pValue,
            actorId: node.value,
            metaFlag: 'AIRBYTE',
            templateCode: this.ruleForm.templateCode
          };
          // if (pValue === 'mysql') {
          //   params.actorId = node.value;
          //   params.metaFlag = 'AIRBYTE';
          //   params.templateCode = this.ruleForm.templateCode;
          // } else {
          //   params.datasource = node.value;
          // }
          getDataSetList(params).then(res => {
            const data = res.data;
            let nodes = [];
            if (data) {
              nodes = data.data.map(item => ({
                label: item.name,
                value: item.name
              }));
            }
            resolve(nodes);
          });
        } else {
          let name = 'db';
          if (pValue === 'kafka') {
            name = 'datasource';
          }
          const params = {
            region: gPValue,
            type: pValue,
            [name]: node.value
          };
          if (pValue === 'hive' || pValue === 'mysql' || pValue.value === 'metis' || pValue.value === 'clickhouse') {
            params.metaFlag = 'AIRBYTE';
            params.templateCode = this.ruleForm.templateCode;
          }
          getDataSetList(params).then(res => {
            const data = res.data;
            let nodes = [];
            if (data) {
              nodes = data.data.map(item => ({
                label: item.name,
                value: item,
                leaf: true
              }));
            }
            resolve(nodes);
          });
        }
      } else if (level === 4) {
        const pValue = node.parent.value;
        const gPValue = node.parent.parent.value;
        const ggPValue = node.parent.parent.parent.value;
        const name = 'db';
        let source = 'datasource';
        if (gPValue === 'mysql' || gPValue === 'clickhouse') {
          source = 'actorId';
        }
        const params = {
          region: ggPValue,
          type: gPValue,
          [source]: pValue,
          [name]: node.value
        };
        if (gPValue === 'hive' || gPValue === 'mysql' || gPValue === 'metis' || gPValue === 'clickhouse') {
          params.metaFlag = 'AIRBYTE';
          params.templateCode = this.ruleForm.templateCode;
        }
        getDataSetList(params).then(res => {
          const data = res.data;
          let nodes = [];
          if (data) {
            nodes = data.data.map(item => ({
              label: item.name,
              value: item,
              leaf: true
            }));
          }
          resolve(nodes);
        });
      }
    },
    handleChange(arr, name) {
      if (arr && arr.length) {
        const value = arr.slice(-1)[0];
        const guid = value.guid;
        const region = arr[0];
        const type = arr[1];
        let source = '';
        let db = '';
        if (type === 'mysql' || type === 'clickhouse') {
          source = arr[2];
          db = arr[3];
        } else if (type === 'kafka') {
          source = arr[2];
        } else if (type === 'hive') {
          db = arr[2];
        }
        const table = type === 'metis' ? value.qualifiedName : value.name;
        this.form[name][0].id = value.qualifiedName;
        this.form[name][0].guid = guid;
        this.form[name][0].metadata = {
          region,
          type,
          source,
          db,
          table
        };
        const params = {
          guid,
          region,
          type,
          source,
          db,
          table,
          metaFlag: 'AIRBYTE'
        };
        // if (type === 'hive' || type === 'mysql') {
        //   params.metaFlag = 'AIRBYTE';
        // }
        if (type === 'mysql' || type === 'clickhouse') {
          delete params.source;
          params.actorId = source;
        }
        // getDdl({ guid }).then(data => {
        getDdl(params).then(res => {
          const data = res.data;
          this.contentObj[name] = data;
          this.$refs.monaco.setCode(this.contentObj.inputDataset + this.contentObj.outputDataset);
        });
      }
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    checkSql() {
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
          ...this.seniorFormSql
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
              window.scrollTo(0, document.documentElement.clientHeight);
            });
          })
          .finally(() => {
            this.checkDisabled = false;
          });
      }
    },
    formatSql() {
      this.$refs.monaco.formatSql();
    },
    clearSql() {
      this.$refs.monaco.setCode('');
      this.contentObj.inputDataset = '';
      this.contentObj.outputDataset = '';
      this.form.inputDataset[0].completePath = '';
      this.form.outputDataset[0].completePath = '';
    },
    handleClose() {
      this.drawerVisible = false;
      // this.$refs.seniorFormSql.confirm();
    },
    preStep() {
      // this.$router.push('/task/step1');
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep(text) {
      if (this.currentStep === 1) {
        // 跳转到第三步
        if (this.content) {
          if (this.form.inputDataset[0].completePath && this.form.inputDataset[0].completePath.length) {
            this.ruleForm.inputDataset = this.form.inputDataset;
          }
          if (this.form.outputDataset[0].completePath && this.form.outputDataset[0].completePath.length) {
            this.ruleForm.outputDataset = this.form.outputDataset;
          }
          if (this.form.region) {
            this.currentStep++;
          } else {
            this.$message.error('请选择区域');
          }
        } else {
          this.$message.error('请输入SQL');
        }
        if (!this.queryId) {
          if (this.seniorFormSql.runtimeConfig.isBatchTask) {
            this.ruleForm.dependTypes = ['event'];
            this.ruleForm.eventDepends = [
              {
                dependId: '',
                dependGra: '',
                dateCalculationParam: {},
                unitOffset: 0,
                useDateCalcuParam: false,
                granularity: '',
                taskId: ''
              }
            ];
          } else {
            this.ruleForm.dependTypes = ['dataset'];
            this.ruleForm.eventDepends = [];
          }
        }
      } else if (this.currentStep === 2 && this.source === 'task') {
        this.ruleForm.region = this.form.region;
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.currentStep++;
            this.$nextTick(() => {
              document.documentElement.scrollTo(0, 0);
            });
          }
        });
      } else {
        // 保存

        if (this.seniorFormSql.runtimeConfig.isBatchTask) {
          // 批任务
          if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
            this.$message.error('至少包含一个前置依赖');
            return false;
          }
          if (!this.ruleForm.outputDataset.length) {
            this.$message.error('至少包含一个生成数据集');
            return false;
          }
        }
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
        if (!this.seniorFormSql.flinkClusterId) {
          this.seniorFormSql.flinkClusterId = this.clusterList[0].id;
        }
        if (!this.seniorFormSql.runtimeConfig.source) {
          this.seniorFormSql.runtimeConfig.source = this.source;
        }
        if (this.content) {
          this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        }
        const params = {
          ...tools.copyFn(this.ruleForm),
          ...this.seniorFormSql
        };
        params.runtimeConfig.cost = this.ruleForm.cost;
        params.runtimeConfig.region = this.ruleForm.region;
        delete params.cost;
        params.inputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
        });
        params.outputDataset.forEach(item => {
          if (item.completePath) {
            delete item.completePath;
          }
        });
        if (this.$store.getters.userInfo && !params.runtimeConfig.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        params.folderId = this.$route.query.folderId;
        this.$refs.validParams.show(params);
      }
    },
    save(params) {
      if (this.seniorFormSql.isBatchTask) {
        this.$emit('save', params, 'start');
      } else {
        this.$emit('save', params);
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  .form-head {
    width: 700px;
    margin: 0 auto;
  }
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
  .step-content {
    min-height: calc(100vh - 255px);
    .inline-form {
      background: #fff;
      border: 0;
      padding: 16px 0 8px;
      position: relative;
      left: -23px;
    }
    .monaco-editor-wrap {
      height: calc(100vh - 375px);
      min-height: 350px;
      position: relative;
      .monaco-btns {
        position: absolute;
        right: 0;
        top: -40px;
      }
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
  }
}
::v-deep {
  .el-form-item--small.el-form-item {
    margin-bottom: 0;
  }
}
</style>
