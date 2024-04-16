<!--  chenyh1 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="senior-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" :key="formKey" class="ruleForm" :model="ruleForm" :rules="rules" label-width="140px">
          <el-form-item label="同步模式" required style="width: 700px; margin: 0 auto">
            <el-radio-group v-model="seniorFormSql.runtimeConfig.hudiMode" @change="changeMode">
              <el-radio label="INC">增量模式</el-radio>
              <el-radio label="ALL">全量模式</el-radio>
            </el-radio-group>
            <el-popover placement="bottom" width="770" trigger="hover">
              <div>
                1、请先确保您当前shareid账号具备cdc数据权限，可到“运维工单-申请Tidb/Mysql只读账号”，找对应库表的运维开通<br />
                2、请先确保本平台已配置Tidb对应的DataSource<br />
                3、请在kafkaops.ushareit.org平台申请kafka topic，命名和Tidb对应表相关<br />
                4、请找运维申请开通同步Tidb binlog日志(第1步的表) -> kafka(第3步的topic)<br />
                5、请确保Tidb/Mysql表中有create_time字段<br />
                6、请确保Tidb/Mysql表中有单一主键，不支持复合主键<br />
              </div>
              <el-button slot="reference" type="text" style="cursor: pointer">操作提示</el-button>
            </el-popover>
            <div class="tip">提示：同步模式：如果你是新建任务，那么先使用全量模式将数据导入，再使用增量模式将新增数据导入；如果需要回溯历史数据，请使用全量模式</div>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-divider content-position="left">TiDb</el-divider>
              <el-form-item label="源区域" prop="inputDataset[0].metadata.region">
                <el-select v-model="ruleForm.inputDataset[0].metadata.region" placeholder="请选择TiDb区域" clearable @change="changeSourceRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据源" prop="inputDataset[0].metadata.source">
                <el-select v-model="ruleForm.inputDataset[0].metadata.source" placeholder="请选择TiDb数据源" :loading="sourceLoad" clearable filterable @change="changeSource">
                  <el-option v-for="item in sourceList" :key="item.actorId" :label="item.name" :value="item.actorId"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据库" prop="inputDataset[0].metadata.db">
                <el-select v-model="ruleForm.inputDataset[0].metadata.db" placeholder="请选择TiDb数据库" :loading="dbLoad" clearable filterable>
                  <!--  @change="changeSourceDb" -->
                  <el-option v-for="item in sourceDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表名称" prop="inputDataset[0].metadata.table">
                <el-select v-model="ruleForm.inputDataset[0].metadata.table" placeholder="请选择TiDb表名称" :loading="tableLoad" clearable filterable @change="changeSourceTable">
                  <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <template v-if="seniorFormSql.runtimeConfig.hudiMode === 'INC'">
                <el-divider content-position="left">Kafka</el-divider>
                <!-- <el-form-item label="源区域" prop="inputDataset[1].metadata.region">
                  <el-select v-model="ruleForm.inputDataset[1].metadata.region" placeholder="请选择kafka区域" clearable @change="changeKafkaRegion">
                    <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="组名" prop="inputDataset[1].metadata.source">
                  <el-select v-model="ruleForm.inputDataset[1].metadata.source" placeholder="请选择Kafka组名" :loading="source1Load" clearable filterable @change="changeKafkaSource">
                    <el-option v-for="item in kafkaSourceList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="表名称" prop="inputDataset[1].metadata.table">
                  <el-select v-model="ruleForm.inputDataset[1].metadata.table" placeholder="请选择kafka表名称" :loading="table1Load" clearable filterable @change="changeKafkaTable">
                    <el-option v-for="item in kafkaTableList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </el-form-item> -->
                <el-form ref="form2" class="ruleForm" :model="seniorFormSql" :rules="rules" label-width="140px">
                  <el-form-item label="topic" prop="runtimeConfig.topic">
                    <el-input v-model="seniorFormSql.runtimeConfig.topic" placeholder="请输入topic"></el-input>
                  </el-form-item>
                  <el-form-item label="Kafka服务器地址" prop="runtimeConfig.bootstrapServerUri">
                    <el-input v-model="seniorFormSql.runtimeConfig.bootstrapServerUri" placeholder="请输入Kafka服务器地址"></el-input>
                  </el-form-item>
                </el-form>
              </template>
              <el-divider></el-divider>
              <el-form :model="seniorFormSql" :rules="seniorRules" label-width="140px">
                <el-form-item label="分区键" prop="runtimeConfig.partitionKeys">
                  <!-- <el-input v-model="seniorFormSql.runtimeConfig.partitionKeys" placeholder="请输入分区键" clearable></el-input> -->
                  <el-select v-model="seniorFormSql.runtimeConfig.partitionKeys" placeholder="请选择分区键" :loading="pkLoad" :allow-create="true" default-first-option clearable filterable>
                    <el-option v-for="item in primaryKeyList" :key="item.name" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="主键" prop="runtimeConfig.primaryKey">
                  <!-- <el-input v-model="seniorFormSql.runtimeConfig.primaryKey" placeholder="请输入主键" clearable></el-input> -->
                  <el-select v-model="seniorFormSql.runtimeConfig.primaryKey" placeholder="请选择主键" :loading="pkLoad" :allow-create="true" default-first-option clearable filterable>
                    <el-option v-for="item in primaryKeyList" :key="item.name" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <template v-if="seniorFormSql.runtimeConfig.hudiMode === 'ALL'">
                  <el-form-item label="分区上界">
                    <el-input-number v-model="seniorFormSql.runtimeConfig.lowerBound" :min="1"></el-input-number>
                    <span class="tip">提示：指定主键的上界值</span>
                  </el-form-item>
                  <el-form-item label="分区下界">
                    <el-input-number v-model="seniorFormSql.runtimeConfig.upperBound" :min="1"></el-input-number>
                    <span class="tip">提示：指定主键的下界值</span>
                  </el-form-item>
                </template>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="目标区域" prop="outputDataset[0].metadata.region">
                <el-select v-model="ruleForm.outputDataset[0].metadata.region" placeholder="请选择目标表区域" clearable @change="changeTargetRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="目标库" prop="outputDataset[0].metadata.db">
                <el-select v-model="ruleForm.outputDataset[0].metadata.db" placeholder="请选择目标库" :loading="tdbLoad" :allow-create="true" default-first-option filterable clearable>
                  <el-option v-for="item in targetDbList" :key="item.value" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表名称" prop="outputDataset[0].metadata.table">
                <el-input v-model="ruleForm.outputDataset[0].metadata.table" placeholder="请输入目标表名称" :loading="ttabLoad" @change="getSqlFn"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <el-tabs class="process">
          <el-tab-pane>
            <template #label>
              <span class="label">
                加工逻辑
                <sql-smaple name="metis_sql" class="sqlSmaple"></sql-smaple>
              </span>
            </template>
            <sql-box label="SQL" :required="true" name="content" @format="format" @clear="clear">
              <!-- <sql-smaple class="metis-smaple" name="metis_sql"></sql-smaple> -->
              <monaco-editor :key="currentStep" ref="content" v-model="content" v-loading="loading" :read-only="disabled" class="content"></monaco-editor>
            </sql-box>
          </el-tab-pane>
        </el-tabs>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :is-show-dispatch="false" :is-show-db="false" :is-show-offset="false" :rule-form="ruleForm2"></step-three>
      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-sql-form ref="seniorFormSql" :no-cluster="noCluster" :senior-form="seniorFormSql" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
      }}</el-button>
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
  </div>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import SqlBox from '@/views/dataSet/step/components/SqlBox';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlSmaple from './components/SqlSmaple';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, getClusterList, getSql } from '@/api/task';
import * as tools from '@/utils/tools';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';

export default {
  components: {
    StepsHead,
    SeniorSqlForm,
    StepThree,
    SqlBox,
    MonacoEditor,
    SqlSmaple,
    EllipsisTooltip,
    ValidParams
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
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      noCluster: false,
      currentStep: 1,
      content: '',
      loading: false,
      ruleForm2: {},
      ruleForm: {
        templateCode: 'Db2Hive',
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
            unitOffset: -1,
            ready_time: '0 0 * * *',
            useDateCalcuParam: false,
            dateCalculationParam: {}
          }
          // {
          //   metadata: {
          //     region: '',
          //     type: 'kafka',
          //     source: '',
          //     db: '',
          //     table: ''
          //   },
          //   guid: '',
          //   id: '',
          //   granularity: 'daily',
          //   // offset: -1,
          //   unitOffset: -1,
          //   ready_time: '0 0 * * *'
          // }
        ],
        outputDataset: [
          {
            metadata: {
              region: '',
              type: 'hive',
              source: '',
              db: '',
              table: ''
            }
          }
        ],
        name: '',
        description: '',
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      rules: {
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择TiDb区域', trigger: ['blur', 'change'] }],
              source: [{ required: true, message: '请选择TiDb数据源', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择TiDb数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择TiDb表名称', trigger: ['blur', 'change'] }]
            }
          },
          {
            metadata: {
              region: [{ required: true, message: '请选择Kafka区域', trigger: ['blur', 'change'] }],
              source: [{ required: true, message: '请选择Kafka组名', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择Kafka表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        outputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择目标区域', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择目标库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请输入目标表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        runtimeConfig: {
          topic: [{ required: true, message: '请输入topic', trigger: ['blur', 'change'] }],
          bootstrapServerUri: [{ required: true, message: '请输入Kafka服务器地址', trigger: ['blur', 'change'] }]
        }
      },
      seniorRules: {
        runtimeConfig: {
          primaryKey: [{ required: true, message: '请输入主键', trigger: ['blur', 'change'] }],
          partitionKeys: [{ required: true, message: '请输入分区键', trigger: ['blur', 'change'] }]
        }
      },
      sourceLoad: false,
      dbLoad: false,
      tableLoad: false,
      source1Load: false,
      table1Load: false,
      pkLoad: false,
      tdbLoad: false,
      ttabLoad: false,
      regionList: tools.regionList,
      sourceList: [],
      sourceDbList: [],
      sourceTableList: [],
      primaryKeyList: [],
      targetDbList: [],
      kafkaSourceList: [],
      kafkaTableList: [],
      seniorFormSql: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          // 同步模式
          hudiMode: 'INC',
          topic: '',
          bootstrapServerUri: '',
          primaryKey: '',
          partitionKeys: '',
          lowerBound: 1,
          upperBound: 1,
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 600,
          checkpointTimeout: 2400,
          checkpointMode: 'AT_LEAST_ONCE',
          // 高级设置
          owner: '',
          collaborators: [],
          dsGroups: [],
          parallelism: 4,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: []
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      clusterList: [],
      canEdit: true,
      formKey: 0,
      copyMsg: null
    };
  },
  computed: {
    disabled() {
      return this.currentStep === 3;
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
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.seniorFormSql.runtimeConfig.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
    // this.getCluster();
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
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
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
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.content = decodeURIComponent(window.atob(runtimeConfig.content));
      this.$nextTick(() => {
        this.$refs.content && this.$refs.content.setCode(this.content);
      });
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.inputDataset[0].metadata.type = 'mysql';
      // if (this.ruleForm.inputDataset.length === 1) {
      //   this.ruleForm.inputDataset.push({
      //     metadata: {
      //       region: '',
      //       type: 'kafka',
      //       source: '',
      //       db: '',
      //       table: ''
      //     },
      //     guid: '',
      //     id: '',
      //     granularity: 'daily',
      //     offset: -1,
      //     ready_time: '0 0 * * *'
      //   });
      // }
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
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
      this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region, 'init');
      this.changeSource(this.ruleForm.inputDataset[0].metadata.source, 'init');
      // this.changeSourceDb(this.ruleForm.inputDataset[0].metadata.db, 'init');
      // this.changeKafkaRegion(this.ruleForm.inputDataset[1].metadata.region, 'init');
      // this.changeKafkaSource(this.ruleForm.inputDataset[1].metadata.source, 'init');
      this.changeTargetRegion(this.ruleForm.outputDataset[0].metadata.region, 'init');
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
    changeMode(value) {
      this.formKey++;
      if (value === 'INC') {
        this.seniorFormSql.runtimeConfig.checkpoint = 1;
      } else {
        this.seniorFormSql.runtimeConfig.checkpoint = 0;
      }
    },
    changeSourceRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.source = '';
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceList = [];
      this.sourceLoad = true;
      getDataSetList({
        region: value,
        type: 'mysql',
        metaFlag: 'AIRBYTE',
        templateCode: 'Db2Hive'
      }).then(res => {
        const data = res.data;
        this.sourceList = data.data;
        this.sourceLoad = false;
      });
    },
    changeSource(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.db = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      const currentObj = this.sourceList.find(item => item.actorId === value);
      if (currentObj) {
        this.sourceDbList = [{ name: currentObj.db }];
        this.ruleForm.inputDataset[0].metadata.db = currentObj.db;
      }
      // this.sourceDbList = [];
      // this.dbLoad = true;
      // getDataSetList({
      //   region: this.ruleForm.inputDataset[0].metadata.region,
      //   type: 'mysql',
      //   datasource: value
      // }).then(data => {
      //   this.sourceDbList = data.data;
      //   this.dbLoad = false;
      // });
      this.sourceTableList = [];
      this.tableLoad = true;
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: 'mysql',
        actorId: this.ruleForm.inputDataset[0].metadata.source,
        db: this.ruleForm.inputDataset[0].metadata.db,
        metaFlag: 'AIRBYTE',
        templateCode: 'Db2Hive'
      }).then(res => {
        const data = res.data;
        this.sourceTableList = data.data;
        this.tableLoad = false;
      });
    },
    changeSourceDb(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      this.tableLoad = true;
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: 'mysql',
        datasource: this.ruleForm.inputDataset[0].metadata.source,
        db: value
      }).then(res => {
        const data = res.data;
        this.sourceTableList = data.data;
        this.tableLoad = false;
      });
    },
    changeSourceTable(value) {
      // const obj = this.sourceTableList.find(item => item.name === value);
      // this.ruleForm.inputDataset[0].guid = obj.guid;
      // this.ruleForm.inputDataset[0].id = obj.qualifiedName;
      this.getSqlFn();
      this.pkLoad = true;
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: 'mysql',
        actorId: this.ruleForm.inputDataset[0].metadata.source,
        db: this.ruleForm.inputDataset[0].metadata.db,
        table: value,
        metaFlag: 'AIRBYTE',
        templateCode: 'Db2Hive'
      }).then(res => {
        const data = res.data;
        this.primaryKeyList = data.columns;
        this.pkLoad = false;
      });
    },
    changeKafkaRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[1].metadata.source = '';
        this.ruleForm.inputDataset[1].metadata.table = '';
      }
      this.KafkaSourceList = [];
      this.source1Load = true;
      getDataSetList({
        region: value,
        type: 'kafka'
      }).then(res => {
        const data = res.data;
        this.kafkaSourceList = data.data;
        this.source1Load = false;
      });
    },
    changeKafkaSource(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[1].metadata.table = '';
      }
      this.kafkaTableList = [];
      this.table1Load = true;
      getDataSetList({
        region: this.ruleForm.inputDataset[1].metadata.region,
        type: 'kafka',
        datasource: value
      }).then(res => {
        const data = res.data;
        this.kafkaTableList = data.data;
        this.table1Load = false;
      });
    },
    changeKafkaTable(value) {
      const obj = this.kafkaTableList.find(item => item.name === value);
      this.ruleForm.inputDataset[1].guid = obj.guid;
      this.ruleForm.inputDataset[1].id = obj.qualifiedName;
      this.getSqlFn();
    },
    changeTargetRegion(value, name) {
      if (!name) {
        this.ruleForm.outputDataset[0].metadata.db = '';
      }
      this.targetDbList = [];
      this.tdbLoad = true;
      getDataSetList({
        region: value,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: 'Db2Hive'
      }).then(res => {
        const data = res.data;
        this.targetDbList = data.data;
        this.tdbLoad = false;
      });
    },
    getSqlFn() {
      // const tidbGuid = this.ruleForm.inputDataset[0].guid;
      const actorId = this.ruleForm.inputDataset[0].metadata.source;
      const table = this.ruleForm.inputDataset[0].metadata.table;
      const sinkName = this.ruleForm.outputDataset[0].metadata.table;
      const hudiMode = this.seniorFormSql.runtimeConfig.hudiMode;
      // const kafkaGuid = this.ruleForm.inputDataset[1].guid;
      const topic = this.seniorFormSql.runtimeConfig.topic;
      const partitionKey = this.seniorFormSql.runtimeConfig.partitionKeys;
      const params = {
        // tidbGuid,
        actorId,
        table,
        sinkName,
        hudiMode,
        partitionKey
      };
      let flag = table && sinkName && partitionKey;
      if (hudiMode === 'INC') {
        params.topic = topic;
        // flag = table && kafkaGuid && sinkName && partitionKey;
        flag = table && topic && sinkName && partitionKey;
      } else {
        params.topic = '';
      }
      if (flag) {
        this.loading = true;
        getSql(params)
          .then(res => {
            const data = res.data;
            this.content = data.sql;
            this.$refs.content.setCode(this.content);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    format(name) {
      this.$refs[name].formatSql();
    },
    clear(name) {
      this.$refs[name].setCode('');
    },
    checkForm(form) {
      return new Promise((resolve, reject) => {
        this.$refs[form].validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    preStep() {
      // this.$router.push('/task/step1');
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep() {
      if (this.currentStep === 1) {
        // 第二步
        const list = [];
        list.push(this.checkForm('form'));
        if (this.$refs.form2) {
          list.push(this.checkForm('form2'));
        }
        Promise.all(list).then(() => {
          // this.$refs.form.validate(formValid => {
          //   if (formValid) {
          this.ruleForm2 = tools.copyFn(this.ruleForm);
          if (this.seniorFormSql.runtimeConfig.hudiMode === 'ALL') {
            // delete this.ruleForm2.inputDataset[1];
            this.ruleForm2.inputDataset.pop();
          }
          this.currentStep++;
          //   }
        });
      } else if (this.currentStep === 2 && this.source === 'task') {
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.currentStep++;
            this.$nextTick(() => {
              document.documentElement.scrollTo(0, 0);
            });
          }
        });
      } else {
        let propor = 0;
        this.ruleForm2.cost.forEach(item => {
          propor += parseInt(item.value);
        });
        if (propor !== 100) {
          this.$message.error('成本归属占比总额必须是100哦');
          return false;
        }
        if (!this.seniorFormSql.flinkClusterId) {
          this.seniorFormSql.flinkClusterId = this.clusterList[0].id;
        }
        if (!this.seniorFormSql.runtimeConfig.source) {
          this.seniorFormSql.runtimeConfig.source = this.source;
        }
        const params = {
          ...tools.copyFn(this.ruleForm2),
          ...this.seniorFormSql
        };
        params.inputDataset.forEach(item => {
          item.id = '';
        });
        params.outputDataset.forEach(item => {
          item.id = '';
        });
        params.runtimeConfig.cost = this.ruleForm2.cost;
        delete params.cost;
        params.runtimeConfig.content = window.btoa(encodeURIComponent(this.content));
        // if (params.runtimeConfig.hudiMode === 'INC') {
        //   delete params.inputDataset[1];
        // }
        if (this.$store.getters.userInfo && !params.runtimeConfig.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        // this.$emit('save', params);
        this.$refs.validParams.show(params);
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
    padding: 0 20px 20px;
    min-height: calc(100vh - 255px);
    position: relative;
    .process {
      ::v-deep .el-tabs__header {
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
        .sql-box {
          position: relative;
          .sql-box-btn {
            position: absolute;
            top: -50px;
            right: 0;
          }
        }
      }
    }
    .metis-smaple {
      left: 60px;
      top: -30px;
    }
    .senior-btn {
      position: absolute;
      right: 50px;
      z-index: 2;
    }
    .ruleForm {
      ::v-deep .el-tabs__content {
        width: 700px;
        margin: 0 auto;
      }
      .el-select,
      .el-input {
        width: 70%;
      }
      .big-width {
        width: 1000px;
        position: relative;
        left: -150px;
        padding: 0 20px;
      }
    }
    .senior-input {
      width: 200px;
    }
    .tip {
      font-size: $global-font-size-12;
      color: #aaa;
      line-height: normal;
    }
  }
}
</style>
