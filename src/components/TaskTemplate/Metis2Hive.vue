<!--  Kafka -> Hive 模板 -->
<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="senior-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :model="ruleForm" :rules="rules" label-width="140px">
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="源种类" required>
                <el-radio-group v-model="seniorFormSql.runtimeConfig.sourceType">
                  <el-radio v-for="item in sourceTypeList" :key="item.value" :label="item.value" @change="changeSourceType">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="seniorFormSql.runtimeConfig.sourceType === 'metis'" label="源表名称" prop="inputDataset[0].metadata.table">
                <el-input v-model="ruleForm.inputDataset[0].metadata.table" placeholder="请输入源表名称"></el-input>
              </el-form-item>
              <template v-if="seniorFormSql.runtimeConfig.sourceType === 'kafka'">
                <el-form ref="form2" class="ruleForm" :model="seniorFormSql" :rules="rules" label-width="140px">
                  <el-form-item label="topic" prop="runtimeConfig.topic">
                    <el-input v-model="seniorFormSql.runtimeConfig.topic" placeholder="请输入topic"></el-input>
                  </el-form-item>
                  <el-form-item label="Kafka服务器地址" prop="runtimeConfig.bootstrapServerUri">
                    <el-input v-model="seniorFormSql.runtimeConfig.bootstrapServerUri" placeholder="请输入Kafka服务器地址"></el-input>
                  </el-form-item>
                </el-form>
              </template>
              <el-form-item label="显示元数据方式" prop="createType">
                <el-radio-group v-model="ruleForm.createType" @change="createTypeChange">
                  <el-radio v-for="item in createTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="分区键">
                <el-input v-model="ruleForm.partitionKeys" placeholder="请输入分区键"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <div class="big-width">
            <step-table v-if="ruleForm.createType === '0'" ref="columns" label="字段" name="columns" :data="columns" :type-list="typeList" :form-disabled="disabled" @add="add" @del="del"></step-table>
            <sql-box v-if="ruleForm.createType === '1'" label="SQL" :required="true" name="content" @format="format" @clear="clear">
              <sql-smaple class="metis-smaple" name="metis_sql"></sql-smaple>
              <monaco-editor :key="currentStep" ref="content" v-model="content" class="content"></monaco-editor>
            </sql-box>
          </div>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="Iceberg数据库" prop="outputDataset[0].metadata.db">
                <el-select
                  v-model="ruleForm.outputDataset[0].metadata.db"
                  placeholder="请选择Iceberg数据库"
                  :loading="tdbLoad"
                  clearable
                  filterable
                  @keyup.ctrl.67.native="copyHandler(ruleForm.outputDataset[0].metadata.db)"
                  @keydown.meta.67.native="copyHandler(ruleForm.outputDataset[0].metadata.db)"
                >
                  <el-option v-for="item in dbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Iceberg表名称" prop="outputDataset[0].metadata.table">
                <el-input v-model="ruleForm.outputDataset[0].metadata.table" placeholder="请输入Iceberg表名称"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :is-show-dispatch="false" :is-show-db="false" :is-show-offset="false" :rule-form="ruleForm"></step-three>

      <!-- 预览 -->
      <ViewParams v-if="currentStep === 3" :info="info" :content="content" :region-list="regionList" :is-show-dispatch="false" :is-show-db="false" :is-show-offset="false" @jumpStep="$event => (currentStep = $event)" />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-sql-form ref="seniorFormSql" :no-cluster="noCluster" :senior-form="seniorFormSql" new-reqion="true" :region="ruleForm.region" @close="drawerVisible = false"></senior-sql-form>
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
      ruleForm: {
        templateCode: 'Metis2Hive',
        region: '',
        createType: '0',
        partitionKeys: '',
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
        region: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        createType: [{ required: true, message: '请选择显示元数据方式', trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择源区域', trigger: ['blur', 'change'] }],
              source: [{ required: true, message: '请选择组名', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请输入源表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        outputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择Iceberg区域', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择Iceberg数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择Iceberg表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        runtimeConfig: {
          topic: [{ required: true, message: '请输入topic', trigger: ['blur', 'change'] }],
          bootstrapServerUri: [{ required: true, message: '请输入Kafka服务器地址', trigger: ['blur', 'change'] }]
        }
      },
      sourceLoad: false,
      tableLoad: false,
      pkLoad: false,
      tdbLoad: false,
      regionList: tools.regionList,
      sourceList: [],
      sourceTableList: [],
      sourceTypeList: [
        // { label: 'metis', value: 'metis' },
        { label: 'kafka', value: 'kafka' }
      ],
      createTypeList: [
        { label: '可视化模式', value: '0' },
        { label: 'SQL模式', value: '1' }
      ],
      columns: [],
      content: '',
      dbList: [],
      typeList: ['CHAR', 'VARCHAR', 'STRING', 'BOOLEAN', 'BYTES', 'DECIMAL', 'TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMP_LTZ', 'INTERVAL', 'RAW'],
      seniorFormSql: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          sourceType: 'metis',
          topic: '',
          bootstrapServerUri: '',
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
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      clusterList: [],
      canEdit: true,
      copyMsg: null,
      isEdit: false
    };
  },
  computed: {
    ...mapGetters(['isCloud']),
    info() {
      return Object.assign({}, this.ruleForm, this.seniorFormSql, { columns: this.columns });
    },
    disabled() {
      return this.currentStep === 3;
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
    }
  },
  created() {
    this.ruleForm.inputDataset[0].metadata.type = 'kafka';
    this.seniorFormSql.runtimeConfig.sourceType = 'kafka';
    this.seniorFormSql.runtimeConfig.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
  },
  mounted() {
    tools.regionList.then(res => {
      this.regionList = res;
      setTimeout(() => {
        if (!this.isEdit) {
          this.ruleForm.region = res[0].value;
          this.ruleForm.inputDataset[0].metadata.region = res[0].value;
          this.ruleForm.outputDataset[0].metadata.region = res[0].value;
          this.changeRegion(res[0].value);
          this.changeTargetRegion(res[0].value);
          this.changeSourceRegion(res[0].value);
        }
      }, 1000);
    });
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
      this.seniorFormSql.flinkClusterId = data.flinkClusterId;
      // this.seniorFormSql.runtimeConfig = runtimeConfig;
      Object.assign(this.seniorFormSql.runtimeConfig, runtimeConfig);
      if (runtimeConfig.content) {
        this.content = decodeURIComponent(window.atob(runtimeConfig.content));
        // this.$refs.content.setCode(this.content);
        this.ruleForm.createType = '1';
        if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: false,
            region: this.ruleForm.inputDataset[0].metadata.region,
            type: this.seniorFormSql.runtimeConfig.sourceType,
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
        if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: true,
            region: this.ruleForm.inputDataset[0].metadata.region,
            type: this.seniorFormSql.runtimeConfig.sourceType,
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
      this.changeTargetRegion(this.ruleForm.outputDataset[0].metadata.region, 'init');
      // if (this.seniorFormSql.runtimeConfig.sourceType === 'kafka') {
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
    changeSourceType(value) {
      this.ruleForm.inputDataset[0].metadata.type = value;
      this.sourceTableList = '';
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
        type: this.seniorFormSql.runtimeConfig.sourceType
      };
      if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
        params.metaFlag = 'AIRBYTE';
        params.templateCode = 'Metis2Hive';
        getDataSetList(params).then(res => {
          const data = res.data;
          if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
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
      if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
        getDataSetList({
          region: this.ruleForm.inputDataset[0].metadata.region,
          type: this.seniorFormSql.runtimeConfig.sourceType,
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
        if (this.seniorFormSql.runtimeConfig.sourceType === 'metis') {
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
        type: this.seniorFormSql.runtimeConfig.sourceType,
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
        type: this.seniorFormSql.runtimeConfig.sourceType,
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
              this.$message.error('请添加字段');
            }
            this.seniorFormSql.runtimeConfig.columns = this.columns;
            delete this.seniorFormSql.runtimeConfig.content;
          } else if (this.ruleForm.createType === '1') {
            if (this.content) {
              this.seniorFormSql.runtimeConfig.content = window.btoa(encodeURIComponent(this.content));
              delete this.seniorFormSql.runtimeConfig.columns;
              this.currentStep++;
            } else {
              this.$message.error('请输入SQL');
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
          this.$message.error('成本归属占比总额必须是100哦');
          return false;
        }
        if (!this.seniorFormSql.flinkClusterId) {
          this.seniorFormSql.flinkClusterId = this.clusterList[0].id;
        }
        if (!this.seniorFormSql.runtimeConfig.source) {
          this.seniorFormSql.runtimeConfig.source = this.source;
        }
        // this.seniorFormSql.runtimeConfig.partitionKeys = this.ruleForm.partitionKeys.join(',');
        this.seniorFormSql.runtimeConfig.partitionKeys = this.ruleForm.partitionKeys;
        const params = {
          ...tools.copyFn(this.ruleForm),
          ...tools.copyFn(this.seniorFormSql)
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
        params.folderId = this.$route.query.folderId;
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
