<!--  chenyh1 -->
<template>
  <el-card class="step2 box-card-container">
    <steps-head :active="currentStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="senior-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form" class="ruleForm" :model="ruleForm" :rules="rules" label-width="140px">
          <el-tabs>
            <el-tab-pane label="数据源">
              <el-form-item label="源区域" prop="inputDataset[0].metadata.region">
                <el-select v-model="ruleForm.inputDataset[0].metadata.region" placeholder="请选择源区域" clearable @change="changeSourceRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="源种类" prop="sourceType">
                <el-radio-group v-model="seniorForm.runtimeConfig.sourceType" :rules="[{ required: true, message: '请选择源种类', trigger: ['blur', 'change'] }]">
                  <el-radio v-for="item in sourceTypeList" :key="item.value" :label="item.value" @change="changeSourceType">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="seniorForm.runtimeConfig.sourceType === 'kafka'" label="组名" prop="inputDataset[0].metadata.source">
                <el-select v-model="ruleForm.inputDataset[0].metadata.source" placeholder="请选择组名" clearable filterable @change="changeSource">
                  <el-option v-for="item in sourceList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="源表名称" prop="inputDataset[0].metadata.table">
                <el-select v-model="ruleForm.inputDataset[0].metadata.table" placeholder="请选择源表名称" clearable filterable @change="changeTable">
                  <el-option v-for="item in sourceTableList" :key="item.guid" :label="seniorForm.runtimeConfig.sourceType === 'metis' ? item.qualifiedName : item.name" :value="seniorForm.runtimeConfig.sourceType === 'metis' ? item.qualifiedName : item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="显示元数据方式" prop="createType">
                <el-radio-group v-model="ruleForm.createType">
                  <el-radio v-for="item in createTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="消费者组">
                <el-input v-model="ruleForm.groupId" placeholder="请输入消费者组" clearable></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <div class="big-width">
            <step-table v-if="ruleForm.createType === '0'" ref="columns" label="字段" name="columns" :data="columns" :type-list="typeList" @add="add" @del="del"></step-table>
            <sql-box v-if="ruleForm.createType === '1'" label="SQL" :required="true" name="content" @format="format" @clear="clear">
              <!-- <sql-smaple class="metis-smaple" name="metis_sql"></sql-smaple> -->
              <monaco-editor ref="content" v-model="content" class="content"></monaco-editor>
            </sql-box>
          </div>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="ClickHouse区域" prop="outputDataset[0].metadata.region">
                <el-select v-model="ruleForm.outputDataset[0].metadata.region" placeholder="请选择ClickHouse区域" clearable @change="changeTargetRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ClickHouse数据源" prop="outputDataset[0].metadata.source">
                <el-select v-model="ruleForm.outputDataset[0].metadata.source" placeholder="请选择ClickHouse数据源" clearable filterable @change="changeTargetSource">
                  <el-option v-for="item in targetSourceList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ClickHouse数据库" prop="outputDataset[0].metadata.db">
                <el-select v-model="ruleForm.outputDataset[0].metadata.db" placeholder="请选择ClickHouse数据库" clearable filterable @change="changeTargetdb">
                  <el-option v-for="item in dbList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ClickHouse表名称" prop="outputDataset[0].metadata.table">
                <el-select v-model="ruleForm.outputDataset[0].metadata.table" placeholder="请选择ClickHouse表名称" clearable filterable>
                  <el-option v-for="item in tableList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <!-- <step-three v-if="currentStep === 2" ref="stepThree" :is-show-db="false" :is-show-offset="false" :rule-form="ruleForm"></step-three>
      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-sql-form ref="seniorForm" :senior-form="seniorForm" @close="drawerVisible = false"></senior-sql-form>
      </el-drawer> -->
    </div>
    <div class="btn-wrap">
      <el-button @click="$router.go(-1)">取消</el-button>
      <el-button @click="preStep">上一步</el-button>
      <el-button type="primary" :disabled="!canEdit && currentStep === 2" @click="nextStep">{{ currentStep === 1 ? '下一步' : '保存' }}</el-button>
    </div>
  </el-card>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import StepTable from '@/views/dataSet/step/components/StepTable';
import SqlBox from '@/views/dataSet/step/components/SqlBox';
import MonacoEditor from '@/components/MonacoEditor/index';
import { getDataSetList, getTaskInfo, addTask, updateTask, getDisplayDdl, getClusterList } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  components: {
    StepsHead,
    StepTable,
    SqlBox,
    MonacoEditor
    // SqlSmaple,
    // SeniorSqlForm,
    // StepThree
  },
  data() {
    return {
      queryId: this.$route.query.id,
      drawerVisible: false,
      currentStep: 1,
      ruleForm: {
        templateCode: 'Metis2Clickhouse',
        createType: '0',
        groupId: '',
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
              type: 'clickhouse',
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
        createType: [{ required: true, message: '请选择显示元数据方式', trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择源区域', trigger: ['blur', 'change'] }],
              source: [{ required: true, message: '请选择组名', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择源表名称', trigger: ['blur', 'change'] }]
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
        ]
      },
      regionList: tools.regionList,
      sourceList: [],
      sourceTableList: [],
      sourceTypeList: [
        {
          label: 'metis',
          value: 'metis'
        },
        {
          label: 'kafka',
          value: 'kafka'
        }
      ],
      createTypeList: [
        {
          label: '可视化模式',
          value: '0'
        },
        {
          label: 'SQL模式',
          value: '1'
        }
      ],
      columns: [],
      content: '',
      dbList: [],
      targetSourceList: [],
      tableList: [],
      typeList: ['CHAR', 'VARCHAR', 'STRING', 'BOOLEAN', 'BYTES', 'DECIMAL', 'TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMP_LTZ', 'INTERVAL', 'RAW'],
      seniorForm: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          sourceType: 'metis',
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointMode: 'AT_LEAST_ONCE',
          // 高级设置
          owner: '',
          collaborators: [],
          parallelism: 1,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: []
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      },
      canEdit: true
    };
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (this.queryId) {
      this.getTaskInfo();
    } else {
      this.getCluster();
    }
  },
  methods: {
    getCluster() {
      getClusterList().then(res => {
        const data = res.data;
        if (data) {
          this.seniorForm.flinkClusterId = data[0].id;
        }
      });
    },
    getTaskInfo() {
      getTaskInfo({
        id: this.queryId
      }).then(res => {
        const data = res.data;
        this.canEdit = data.canEdit;
        const runtimeConfig = JSON.parse(data.runtimeConfig);
        if (runtimeConfig.cost) {
          this.ruleForm.cost = runtimeConfig.cost;
        }
        delete runtimeConfig.cost;
        this.ruleForm.name = data.name;
        this.ruleForm.description = data.description;
        this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
        this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
        this.ruleForm.groupId = runtimeConfig.groupId || '';
        if (runtimeConfig.content) {
          this.content = decodeURIComponent(window.atob(runtimeConfig.content));
          // this.$refs.content.setCode(this.content);
          this.ruleForm.createType = '1';
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: false
          }).then(res => {
            const data = res.data;
            if (data.columns) {
              this.columns = data.columns;
            } else {
              this.columns = [];
            }
          });
        } else {
          this.columns = runtimeConfig.columns;
          this.ruleForm.createType = '0';
          getDisplayDdl({
            guid: this.ruleForm.inputDataset[0].guid,
            isSql: true
          }).then(res => {
            const data = res.data;
            this.content = data.columns;
            if (this.$refs.content) {
              this.$refs.content.setCode(data.columns);
            }
          });
        }
        this.seniorForm.flinkClusterId = data.flinkClusterId;
        // this.seniorForm.runtimeConfig = runtimeConfig;
        Object.assign(this.seniorForm.runtimeConfig, runtimeConfig);
        if (data.displayDependJars && data.displayDependJars.length) {
          this.seniorForm.displayDependJars = data.displayDependJars.map(item => {
            return {
              artifactId: item.artifactId,
              id: item.id
            };
          });
        } else {
          this.seniorForm.displayDependJars = [{ artifactId: '', id: '' }];
        }
        this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region);
        this.changeTargetRegion(this.ruleForm.outputDataset[0].metadata.region);
        this.changeTargetSource(this.ruleForm.outputDataset[0].metadata.source);
        this.changeTargetdb(this.ruleForm.outputDataset[0].metadata.db);
        if (this.seniorForm.runtimeConfig.sourceType === 'kafka') {
          this.changeSource(this.ruleForm.inputDataset[0].metadata.source);
        }
      });
    },
    changeSourceType(value) {
      this.ruleForm.inputDataset[0].metadata.type = value;
      this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region);
      this.ruleForm.inputDataset[0].metadata.source = '';
      this.ruleForm.inputDataset[0].metadata.table = '';
      this.sourceTableList = '';
    },
    changeSourceRegion(value) {
      this.sourceTableList = [];
      this.sourceList = [];
      getDataSetList({
        region: value,
        type: this.seniorForm.runtimeConfig.sourceType
      }).then(data => {
        if (this.seniorForm.runtimeConfig.sourceType === 'metis') {
          this.sourceTableList = data.data;
        } else {
          this.sourceList = data.data;
        }
      });
    },
    changeSource(value) {
      this.sourceTableList = [];
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: this.seniorForm.runtimeConfig.sourceType,
        datasource: value
      }).then(data => {
        this.sourceTableList = data.data;
      });
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
      getDisplayDdl({
        guid: obj.guid,
        // guid: '118c9655-5163-4016-92a6-a242b286c355',
        isSql: false
      }).then(res => {
        const data = res.data;
        if (data.columns) {
          this.columns = data.columns;
        } else {
          this.columns = [];
        }
        // this.ruleForm.outputDataset[0].metadata.table = data.table;
      });
      getDisplayDdl({
        guid: obj.guid,
        isSql: true
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
        // this.ruleForm.outputDataset[0].metadata.table = data.table;
      });
    },
    changeTargetRegion(value) {
      this.targetSourceList = [];
      getDataSetList({
        region: value,
        type: 'clickhouse'
      }).then(data => {
        this.targetSourceList = data.data;
      });
    },
    changeTargetSource(value) {
      this.dbList = [];
      getDataSetList({
        region: this.ruleForm.outputDataset[0].metadata.region,
        type: 'clickhouse',
        datasource: value
      }).then(data => {
        this.dbList = data.data;
      });
    },
    changeTargetdb(value) {
      this.tableList = [];
      getDataSetList({
        region: this.ruleForm.outputDataset[0].metadata.region,
        type: 'clickhouse',
        datasource: this.ruleForm.outputDataset[0].metadata.source,
        db: value
      }).then(data => {
        this.tableList = data.data;
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
        this.$refs.form.validate(formValid => {
          if (formValid) {
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
              this.seniorForm.runtimeConfig.columns = this.columns;
              delete this.seniorForm.runtimeConfig.content;
            } else if (this.ruleForm.createType === '1') {
              if (this.content) {
                this.seniorForm.runtimeConfig.content = window.btoa(encodeURIComponent(this.content));
                delete this.seniorForm.runtimeConfig.columns;
                this.currentStep++;
              } else {
                this.$message.error('请输入SQL');
              }
            }
          }
        });
      } else {
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            let propor = 0;
            this.ruleForm.cost.forEach(item => {
              propor += parseInt(item.value);
            });
            if (propor !== 100) {
              this.$message.error('成本归属占比总额必须是100哦');
              return false;
            }
            this.seniorForm.runtimeConfig.groupId = this.ruleForm.groupId;
            const params = {
              ...tools.copyFn(this.ruleForm),
              ...tools.copyFn(this.seniorForm)
            };
            params.runtimeConfig.cost = this.ruleForm.cost;
            delete params.cost;
            delete params.groupId;
            if (this.$store.getters.userInfo && !params.runtimeConfig.owner) {
              params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
            }
            let actionUrl;
            if (this.queryId) {
              // 修改
              params.id = this.queryId;
              actionUrl = updateTask(params);
            } else {
              // 新增
              actionUrl = addTask(params);
            }
            actionUrl.then(data => {
              this.$router.push('/task/list');
            });
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step2 {
  .steps-head {
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
    padding: 20px;
    min-height: calc(100vh - 255px);
    // width: 1000px;
    margin: 0 auto;
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
