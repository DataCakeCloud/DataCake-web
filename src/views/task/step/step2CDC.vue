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
              <el-form-item label="CDC区域" prop="inputDataset[0].metadata.region">
                <el-select v-model="ruleForm.inputDataset[0].metadata.region" placeholder="请选择CDC区域" clearable @change="changeSourceRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="CDC数据源" prop="inputDataset[0].metadata.source">
                <el-select v-model="ruleForm.inputDataset[0].metadata.source" placeholder="请选择CDC数据源" clearable filterable @change="changeSource">
                  <el-option v-for="item in sourceList" :key="item.value" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="CDC数据库" prop="inputDataset[0].metadata.db">
                <el-select v-model="ruleForm.inputDataset[0].metadata.db" placeholder="请选择CDC数据库" clearable filterable @change="changeSourceDb">
                  <el-option v-for="item in sourceDbList" :key="item.value" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="CDC表名称" prop="inputDataset[0].metadata.table">
                <el-select v-model="ruleForm.inputDataset[0].metadata.table" placeholder="请选择CDC表名称" clearable filterable @change="changeSourceTable">
                  <el-option v-for="item in sourceTableList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="主键" prop="primaryKey">
                <el-select v-model="ruleForm.primaryKey" placeholder="请选择主键" clearable filterable multiple @change="changeKey">
                  <el-option v-for="item in primaryKeyList" :key="item.name" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="目标表">
              <el-form-item label="Iceberg区域" prop="outputDataset[0].metadata.region">
                <el-select v-model="ruleForm.outputDataset[0].metadata.region" placeholder="请选择Iceberg区域" clearable @change="changeTargetRegion">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Iceberg数据库" prop="outputDataset[0].metadata.db">
                <el-select v-model="ruleForm.outputDataset[0].metadata.db" placeholder="请选择Iceberg数据库" clearable filterable>
                  <el-option v-for="item in dbList" :key="item.guid" :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Iceberg表名称" prop="outputDataset[0].metadata.table">
                <el-input v-model="ruleForm.outputDataset[0].metadata.table" placeholder="请输入Iceberg表名称"></el-input>
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
      <el-button type="primary" :disabled="!canEdit && currentStep === 2" @click="nextStep">{{ currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存' }}</el-button>
    </div>
  </el-card>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import { getDataSetList, getTaskInfo, addTask, updateTask, getDisplayDdl, getClusterList } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  components: {
    StepsHead
    // SeniorSqlForm,
    // StepThree
  },
  data() {
    return {
      queryId: this.$route.query.id,
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      ruleForm: {
        templateCode: 'MysqlCDC2Hive',
        primaryKey: [],
        dependTypes: [],
        triggerParam: {
          type: 'data',
          isIrregularSheduler: 1,
          outputGranularity: 'daily',
          crontabParam: {
            cycle: 'minutely',
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
            primaryKey: '',
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
        createType: [{ required: true, message: '请选择显示元数据方式', trigger: ['blur', 'change'] }],
        primaryKey: [{ required: true, message: '请选择主键', trigger: ['blur', 'change'] }],
        inputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择Metis区域', trigger: ['blur', 'change'] }],
              source: [{ required: true, message: '请选择Metis数据源', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择Metis数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请选择Metis表名称', trigger: ['blur', 'change'] }]
            }
          }
        ],
        outputDataset: [
          {
            metadata: {
              region: [{ required: true, message: '请选择Iceberg区域', trigger: ['blur', 'change'] }],
              db: [{ required: true, message: '请选择Iceberg数据库', trigger: ['blur', 'change'] }],
              table: [{ required: true, message: '请输入Iceberg表名称', trigger: ['blur', 'change'] }]
            }
          }
        ]
      },
      regionList: tools.regionList,
      sourceList: [],
      sourceDbList: [],
      sourceTableList: [],
      primaryKeyList: [],
      dbList: [],
      seniorForm: {
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointTimeout: 100,
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
      canEdit: true,
      copyMsg: null
    };
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (this.queryId || this.taskId) {
      this.getTaskInfo();
    } else {
      this.getCluster();
    }
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
        id: this.queryId || this.taskId
      }).then(res => {
        const data = res.data;
        const runtimeConfig = JSON.parse(data.runtimeConfig);
        if (runtimeConfig.cost) {
          this.ruleForm.cost = runtimeConfig.cost;
        }
        delete runtimeConfig.cost;
        this.ruleForm.name = data.name;
        this.ruleForm.description = data.description;
        this.ruleForm.inputDataset = JSON.parse(data.inputDataset);
        this.ruleForm.inputDataset[0].metadata.type = 'mysql';
        this.ruleForm.outputDataset = JSON.parse(data.outputDataset);
        this.ruleForm.primaryKey = this.ruleForm.inputDataset[0].primaryKey.split(',');
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
        this.changeSourceTable(this.ruleForm.inputDataset[0].metadata.table, this.ruleForm.inputDataset[0].guid);
        this.changeSourceRegion(this.ruleForm.inputDataset[0].metadata.region);
        this.changeSource(this.ruleForm.inputDataset[0].metadata.source);
        this.changeSourceDb(this.ruleForm.inputDataset[0].metadata.db);
        this.changeTargetRegion(this.ruleForm.outputDataset[0].metadata.region);
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
          this.seniorForm.owner = this.$store.getters.userInfo.userId;
        } else {
          this.canEdit = data.canEdit;
        }
      });
    },
    changeSourceRegion(value) {
      this.sourceList = [];
      getDataSetList({
        region: value,
        type: 'mysql'
      }).then(data => {
        this.sourceList = data.data;
      });
    },
    changeSource(value) {
      this.sourceDbList = [];
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: 'mysql',
        datasource: value
      }).then(data => {
        this.sourceDbList = data.data;
      });
    },
    changeSourceDb(value) {
      this.sourceTableList = [];
      getDataSetList({
        region: this.ruleForm.inputDataset[0].metadata.region,
        type: 'mysql',
        datasource: this.ruleForm.inputDataset[0].metadata.source,
        db: value
      }).then(data => {
        this.sourceTableList = data.data;
      });
    },
    changeSourceTable(value, guid) {
      let id;
      if (guid) {
        id = guid;
      } else {
        const obj = this.sourceTableList.find(item => item.name === value);
        id = obj.guid;
        this.ruleForm.inputDataset[0].guid = id;
        this.ruleForm.inputDataset[0].id = obj.qualifiedName;
      }
      getDisplayDdl({
        guid: id,
        // guid: '118c9655-5163-4016-92a6-a242b286c355',
        isSql: false
      }).then(res => {
        const data = res.data;
        this.primaryKeyList = data.columns;
        if (!guid && data.table) {
          this.ruleForm.outputDataset[0].metadata.table = data.table;
        }
      });
    },
    changeKey(value) {
      this.ruleForm.inputDataset[0].primaryKey = value.join(',');
    },
    changeTargetRegion(value) {
      this.dbList = [];
      getDataSetList({
        region: value,
        type: 'hive'
      }).then(data => {
        this.dbList = data.data;
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
        this.$refs.form.validate(formValid => {
          if (formValid) {
            this.currentStep++;
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
            const params = {
              ...tools.copyFn(this.ruleForm),
              ...tools.copyFn(this.seniorForm)
            };
            params.runtimeConfig.cost = this.ruleForm.cost;
            delete params.cost;
            delete params.primaryKey;
            if (this.ruleForm.createType === '0') {
              params.runtimeConfig.columns = this.columns;
            } else if (this.ruleForm.createType === '1') {
              params.content = window.btoa(encodeURIComponent(this.content));
            }
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
    width: 1000px;
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
  }
}
</style>
