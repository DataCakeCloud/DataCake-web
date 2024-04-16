<!--  Kafka -> Hive 模板 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="senior-btn" type="primary" @click="drawerVisible = true">{{ $t('task.highSetting') }}</el-button>
        <el-form ref="form" class="ruleForm" :model="ruleForm" :rules="rules" label-width="140px">
          <div class="form-head">
            <el-form-item :label="$t('task.region')" prop="region">
              <template #label>
                <span>{{ $t('task.region') }}</span>
                <el-tooltip class="item" effect="dark" :content="$t('task.dbTip1')" placement="top">
                  <i class="el-icon-info" style="cursor: pointer"></i>
                </el-tooltip>
              </template>
              <el-select v-model="ruleForm.region" class="area-select" :placeholder="$t('task.dbTip2')" clearable @change="changeRegion">
                <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <el-tabs>
            <el-tab-pane :label="$t('task.stepView8')">
              <template v-if="seniorForm.runtimeConfig.sourceType === 'kafka'">
                <el-form-item label="kafka数据源名称" prop="actorId">
                  <el-select v-model="seniorForm.runtimeConfig.actorId" :placeholder="$t('task.kfk2')" clearable @change="changeKafkaSource">
                    <el-option v-for="item in kafkaSourceList" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
                  </el-select>
                </el-form-item>
                <el-form ref="form2" class="ruleForm" :model="seniorForm" :rules="rules" label-width="140px">
                  <el-form-item label="topic" prop="runtimeConfig.topic">
                    <!-- <el-input v-model="seniorForm.runtimeConfig.topic" :placeholder="$t('task.kfk5')"></el-input> -->
                    <el-select v-model="seniorForm.runtimeConfig.topic" filterable allow-create default-first-option placeholder="请输入topic" clearable @change="changeTopic">
                      <el-option v-for="item in topicList" :key="item.name" :label="item.name" :value="item.name"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="消费者组" prop="runtimeConfig.consumerGroup">
                    <el-input v-model="seniorForm.runtimeConfig.consumerGroup" placeholder="请输入"></el-input>
                  </el-form-item>
                  <el-form-item label="起始消费位置" prop="runtimeConfig.startConumerPosition">
                    <el-select v-model="seniorForm.runtimeConfig.startConumerPosition" placeholder="请选择" clearable>
                      <el-option v-for="item in positionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
              </template>
              <el-form-item :label="$t('task.kfk8')" prop="createType">
                <el-radio-group v-model="ruleForm.createType" @change="createTypeChange">
                  <el-radio v-for="item in createTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('task.stepView62')">
                <!-- <el-select v-model="ruleForm.partitionKeys" placeholder="请选择分区键" :loading="pkLoad" clearable filterable multiple>
                  <el-option v-for="item in columns" :key="item.name" :label="item.name" :value="item.name"></el-option>
                </el-select> -->
                <el-input v-model="ruleForm.partitionKeys"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <div class="big-width">
            <step-table v-if="ruleForm.createType === '0'" ref="columns" :label="$t('task.kfk9')" name="columns" :data="columns" :type-list="typeList" :form-disabled="disabled" @add="add" @del="del"></step-table>
            <sql-box v-if="ruleForm.createType === '1'" label="SQL" :required="true" name="content" @format="format" @clear="clear">
              <sql-smaple class="metis-smaple" name="metis_sql"></sql-smaple>
              <monaco-editor :key="currentStep" ref="content" v-model="content" class="content"></monaco-editor>
            </sql-box>
          </div>
          <el-tabs>
            <el-tab-pane :label="$t('task.kfk13')">
              <el-form-item label="lakehouse类型" required>
                <el-radio-group v-model="seniorForm.runtimeConfig.lakehouseType">
                  <el-radio v-for="item in lakehouseTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('task.kfk14')" prop="outputDataset[0].metadata.region">
                <el-select v-model="ruleForm.outputDataset[0].metadata.region" :placeholder="$t('task.kfk15')" clearable @change="changeTargetRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('task.kfk16')" prop="outputDataset[0].metadata.db">
                <el-select v-model="ruleForm.outputDataset[0].metadata.db" :placeholder="$t('task.kfk17')" :loading="tdbLoad" clearable filterable @keyup.ctrl.67.native="copyHandler(ruleForm.outputDataset[0].metadata.db)" @keydown.meta.67.native="copyHandler(ruleForm.outputDataset[0].metadata.db)">
                  <el-option v-for="item in dbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('task.kfk18')" prop="outputDataset[0].metadata.table">
                <el-input v-model="ruleForm.outputDataset[0].metadata.table" :placeholder="$t('task.kfk19')"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :senior-form="seniorForm.runtimeConfig" :is-show-dispatch="false" :is-show-db="false" :is-show-offset="false" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :content="content" :region-list="regionList" :is-show-dispatch="false" :is-show-db="false" :is-show-offset="false" @jumpStep="$event => (currentStep = $event)" />

      <el-drawer :title="$t('task.highSetting')" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-sql-form ref="seniorForm" :no-cluster="noCluster" :senior-form="seniorForm" new-reqion="true" :region="ruleForm.region" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">{{ $t('task.taskCancel1') }}</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">{{ $t('task.kfk36') }}</el-button>
      <el-button type="primary" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" :loading="btnLoading" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? $t('task.kfk20') : copyId ? $t('task.kfk21') : $t('task.kfk22')
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
import StepTable from '@/views/dataSet/step/components/StepTable';
import SqlBox from '@/views/dataSet/step/components/SqlBox';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlSmaple from './components/SqlSmaple';
import SeniorSqlForm from './components/SeniorSqlForm';
import StepThree from './components/StepThree';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, getDisplayDdl, getClusterList } from '@/api/task';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    StepTable,
    SqlBox,
    MonacoEditor,
    SqlSmaple,
    SeniorSqlForm,
    StepThree,
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
    return {
      btnLoading: false,
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      noCluster: false,
      currentStep: 1,
      kafkaSourceList: [],
      topicList: [],
      ruleForm: {
        templateCode: 'Metis2Hive',
        region: '',
        createType: '0',
        partitionKeys: '',
        folderName: '',
        folderId: '',
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
              type: 'metis',
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
        region: [{ required: true, message: this.$t('task.chooseRegion'), trigger: ['blur', 'change'] }],
        createType: [{ required: true, message: this.$t('task.kfk23'), trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: this.$t('task.kfk24'), trigger: ['blur', 'change'] }],
              source: [{ required: true, message: this.$t('task.kfk25'), trigger: ['blur', 'change'] }],
              table: [{ required: true, message: this.$t('task.kfk26'), trigger: ['blur', 'change'] }]
            }
          }
        ],
        outputDataset: [
          {
            metadata: {
              region: [{ required: true, message: this.$t('task.kfk27'), trigger: ['blur', 'change'] }],
              db: [{ required: true, message: this.$t('task.kfk28'), trigger: ['blur', 'change'] }],
              table: [{ required: true, message: this.$t('task.kfk29'), trigger: ['blur', 'change'] }]
            }
          }
        ],
        runtimeConfig: {
          consumerGroup: [{ required: true, message: '请输入消费者组', trigger: ['blur', 'change'] }],
          startConumerPosition: [{ required: true, message: '请选择起始消费位置', trigger: ['blur', 'change'] }],
          topic: [{ required: true, message: this.$t('task.kfk30'), trigger: ['blur', 'change'] }],
          bootstrapServerUri: [{ required: true, message: this.$t('task.kfk31'), trigger: ['blur', 'change'] }]
        }
      },
      sourceLoad: false,
      tableLoad: false,
      pkLoad: false,
      tdbLoad: false,
      regionList: tools.regionList,
      sourceList: [],
      sourceTableList: [],
      positionList: [
        {
          label: 'group-offsets',
          value: 'group-offsets'
        },
        {
          label: 'earliest-offset',
          value: 'earliest-offset'
        },
        {
          label: 'latest-offset',
          value: 'latest-offset'
        }
      ],
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
      sourceTypeList: [
        // { label: 'metis', value: 'metis' },
        { label: 'kafka', value: 'kafka' }
      ],
      createTypeList: [
        { label: this.$t('task.kfk32'), value: '0' }
        // { label: this.$t('task.kfk33'), value: '1' }
      ],
      columns: [],
      content: '',
      dbList: [],
      typeList: ['CHAR', 'VARCHAR', 'STRING', 'BOOLEAN', 'BYTES', 'DECIMAL', 'TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMP_LTZ', 'INTERVAL', 'RAW'],
      seniorForm: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          checkExpirationTime: 24,
          actorId: '',
          lakehouseType: 'ICEBERG',
          sourceType: 'kafka',
          topic: '',
          bootstrapServerUri: '',
          startConumerPosition: '',
          consumerGroup: '',
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
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      clusterList: [],
      canEdit: true,
      copyMsg: null
    };
  },
  computed: {
    ...mapGetters(['isCloud']),
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm, { columns: this.columns });
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
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    console.log('---new kafka---');
    // if (this.isCloud) {
    //   this.sourceTypeList = [
    //     // { label: 'metis', value: 'metis' },
    //     { label: 'kafka', value: 'kafka' }
    //   ];
    // }
    tools.regionList.then(res => {
      this.regionList = res;
    });
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
    createTypeChange(val) {
      if (val === '0') {
        this.content = '';
        this.$refs.content?.setCode('');
      }
    },
    handelStep(toIndex) {
      if (toIndex < 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep = toIndex;
      }
    },
    getCluster() {
      const params = {
        region: this.ruleForm.region
      };
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
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      this.ruleForm.region = runtimeConfig.region;
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
      this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
      // this.ruleForm.partitionKeys = runtimeConfig.partitionKeys ? runtimeConfig.partitionKeys.split(',') : [];
      this.ruleForm.partitionKeys = runtimeConfig.partitionKeys;
      this.seniorForm.flinkClusterId = data.flinkClusterId;
      // this.seniorForm.runtimeConfig = runtimeConfig;
      Object.assign(this.seniorForm.runtimeConfig, runtimeConfig);
      if (runtimeConfig.content) {
        this.content = decodeURIComponent(window.atob(runtimeConfig.content));
        // this.$refs.content.setCode(this.content);
        this.ruleForm.createType = '1';
        if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: false,
            region: this.ruleForm.inputDataset[0].metadata.region,
            type: this.seniorForm.runtimeConfig.sourceType,
            datasource: this.ruleForm.inputDataset[0].metadata.source,
            db: this.ruleForm.inputDataset[0].metadata.db,
            table: this.ruleForm.inputDataset[0].metadata.table,
            metaFlag: 'AIRBYTE'
          }).then(res => {
            const data = res.data;
            if (data.columns) {
              this.columns = data.columns;
            } else {
              this.columns = [];
            }
          });
        }
      } else {
        this.columns = runtimeConfig.columns;
        this.ruleForm.createType = '0';
        if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: true,
            region: this.ruleForm.inputDataset[0].metadata.region,
            type: this.seniorForm.runtimeConfig.sourceType,
            datasource: this.ruleForm.inputDataset[0].metadata.source,
            db: this.ruleForm.inputDataset[0].metadata.db,
            table: this.ruleForm.inputDataset[0].metadata.table,
            metaFlag: 'AIRBYTE'
          }).then(res => {
            const data = res.data;
            this.content = data.columns;
            if (this.$refs.content) {
              this.$refs.content.setCode(data.columns);
            }
          });
        }
      }
      if (data.displayDependJars && data.displayDependJars.length) {
        this.seniorForm.displayDependJars = data.displayDependJars.map(item => {
          return {
            artifactId: item.artifactId,
            id: item.id,
            region: item.region
          };
        });
      } else {
        this.seniorForm.displayDependJars = [{ artifactId: '', id: '' }];
      }
      this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region, 'init');
      this.changeTargetRegion(this.ruleForm.outputDataset[0].metadata.region, 'init');
      // if (this.seniorForm.runtimeConfig.sourceType === 'kafka') {
      //   this.changeSource(this.ruleForm.inputDataset[0].metadata.source, 'init');
      // }
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
        this.seniorForm.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
    },
    changeRegion(val) {
      if (val) {
        this.getCluster();
        this.getKafkaList();
      }
    },
    getKafkaList() {
      getDataSetList({
        region: this.ruleForm.region,
        type: 'kafka',
        metaFlag: 'AIRBYTE',
        templateCode: 'Metis2Hive'
      }).then(res => {
        this.kafkaSourceList = res.data.data || [];
      });
    },
    changeKafkaSource() {
      getDataSetList({
        region: this.ruleForm.region,
        actorId: this.seniorForm.runtimeConfig.actorId,
        type: 'kafka',
        metaFlag: 'AIRBYTE',
        templateCode: 'Metis2Hive'
      }).then(res => {
        this.topicList = res.data.data || [];
      });
    },
    changeTopic() {
      getDataSetList({
        region: this.ruleForm.region,
        type: 'kafka',
        db: this.seniorForm.runtimeConfig.topic,
        actorId: this.seniorForm.runtimeConfig.actorId,
        metaFlag: 'AIRBYTE',
        templateCode: 'Metis2Hive'
      }).then(res => {
        this.columns = res.data.data || [];
      });
    },
    changeSourceType(value) {
      this.ruleForm.inputDataset[0].metadata.type = value;
      // this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region);
      // this.ruleForm.inputDataset[0].metadata.source = '';
      // this.ruleForm.inputDataset[0].metadata.table = '';
      this.sourceTableList = '';
      // this.changeSource();
    },
    changeSourceRegion(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.source = '';
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      this.sourceList = [];
      this.sourceLoad = true;
      this.tableLoad = true;
      const params = {
        region: value,
        type: this.seniorForm.runtimeConfig.sourceType
      };
      if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
        params.metaFlag = 'AIRBYTE';
        params.templateCode = 'Metis2Hive';
        getDataSetList(params).then(res => {
          const data = res.data;
          if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
            this.sourceTableList = data.data;
          } else {
            this.sourceList = data.data;
          }
          this.sourceLoad = false;
          this.tableLoad = false;
        });
      }
    },
    changeSource(value, name) {
      if (!name) {
        this.ruleForm.inputDataset[0].metadata.table = '';
      }
      this.sourceTableList = [];
      this.tableLoad = true;
      if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
        getDataSetList({
          region: this.ruleForm.inputDataset[0].metadata.region,
          type: this.seniorForm.runtimeConfig.sourceType,
          datasource: value
        }).then(res => {
          const data = res.data;
          this.sourceTableList = data.data;
          this.tableLoad = false;
        });
      }
    },
    changeTable(value) {
      const obj = this.sourceTableList.find(item => {
        let name = item.name;
        if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
          name = item.qualifiedName;
        }
        return name === value;
      });
      this.ruleForm.inputDataset[0].guid = obj.guid;
      this.ruleForm.inputDataset[0].id = obj.qualifiedName;
      this.pkLoad = true;
      getDisplayDdl({
        guid: obj.guid,
        isSql: false,
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: this.seniorForm.runtimeConfig.sourceType,
        datasource: this.ruleForm.inputDataset[0].metadata.source,
        db: this.ruleForm.inputDataset[0].metadata.db,
        table: this.ruleForm.inputDataset[0].metadata.table,
        metaFlag: 'AIRBYTE'
      }).then(res => {
        const data = res.data;
        if (data.columns) {
          this.columns = data.columns;
        } else {
          this.columns = [];
        }
        this.ruleForm.outputDataset[0].metadata.table = data.table;
        this.pkLoad = false;
      });
      getDisplayDdl({
        guid: obj.guid,
        isSql: true,
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: this.seniorForm.runtimeConfig.sourceType,
        datasource: this.ruleForm.inputDataset[0].metadata.source,
        db: this.ruleForm.inputDataset[0].metadata.db,
        table: this.ruleForm.inputDataset[0].metadata.table,
        metaFlag: 'AIRBYTE'
      }).then(res => {
        const data = res.data;
        if (data.columns) {
          this.content = data.columns;
          if (this.$refs.content) {
            this.$refs.content.setCode(data.columns);
          }
        } else {
          this.content = '';
          if (this.$refs.content) {
            this.$refs.content.setCode('');
          }
        }
        this.ruleForm.outputDataset[0].metadata.table = data.table;
      });
    },
    changeTargetRegion(value, name) {
      if (!name) {
        this.ruleForm.outputDataset[0].metadata.db = '';
      }
      this.dbList = [];
      this.tdbLoad = true;
      getDataSetList({
        region: value,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: 'Metis2Hive'
      }).then(res => {
        const data = res.data;
        this.dbList = data.data;
        this.tdbLoad = false;
      });
    },
    add(name) {
      this[name].push({
        name: '',
        type: '',
        comment: ''
      });
    },
    del(name, index) {
      this[name].splice(index, 1);
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
          // if (formValid) {
          if (this.ruleForm.createType === '0') {
            if (this.columns.length) {
              this.$refs.columns.$refs.ruleForm.validate(valid => {
                if (valid) {
                  this.currentStep++;
                }
              });
            } else {
              this.$message.error(this.$t('task.kfk34'));
            }
            this.seniorForm.runtimeConfig.columns = this.columns;
            delete this.seniorForm.runtimeConfig.content;
          } else if (this.ruleForm.createType === '1') {
            if (this.content) {
              this.seniorForm.runtimeConfig.content = window.btoa(encodeURIComponent(this.content));
              delete this.seniorForm.runtimeConfig.columns;
              this.currentStep++;
            } else {
              this.$message.error(this.$t('task.kfk35'));
            }
          }
          this.ruleForm.inputDataset[0].id = '';
          this.ruleForm.outputDataset[0].id = '';
          // }
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
        this.ruleForm.cost.forEach(item => {
          propor += parseInt(item.value);
        });
        if (propor !== 100) {
          this.$message.error(this.$t('task.dbTip15'));
          return false;
        }
        if (!this.seniorForm.flinkClusterId) {
          this.seniorForm.flinkClusterId = this.clusterList[0].id;
        }
        if (!this.seniorForm.runtimeConfig.source) {
          this.seniorForm.runtimeConfig.source = this.source;
        }
        // this.seniorForm.runtimeConfig.partitionKeys = this.ruleForm.partitionKeys.join(',');
        this.seniorForm.runtimeConfig.partitionKeys = this.ruleForm.partitionKeys;
        const params = {
          ...tools.copyFn(this.ruleForm),
          ...tools.copyFn(this.seniorForm)
        };
        params.runtimeConfig.cost = this.ruleForm.cost;
        params.runtimeConfig.region = this.ruleForm.region;
        delete params.cost;
        delete params.partitionKeys;
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
    padding: 0 20px 20px;
    min-height: calc(100vh - 255px);
    position: relative;
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
        ::v-deep .el-tabs__content {
          width: auto;
        }
      }
    }
    .senior-input {
      width: 200px;
    }
  }
}
</style>
