<!--  chenyh1 -->
<template>
  <el-card class="step2 box-card-container">
    <steps-head :active="currentStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-form ref="form" class="inline-form" :rules="rules" :inline="true" :model="seniorForm">
          <el-form-item label="区域" prop="sourceRegion">
            <el-select v-model="seniorForm.sourceRegion" placeholder="请选择区域" clearable>
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div :class="['monaco-editor-wrap', fullscreen ? 'table-fullscreen' : '']">
          <div class="monaco-btns">
            <span class="tips" @click="handelInfo('jinjia', '参数提示')">参数提示</span>
            <el-button type="primary" @click="gitPull">拉取git库</el-button>
            <el-button type="primary" :disabled="checkDisabled" @click="checkSql">校验</el-button>
            <el-button type="primary" @click="formatSql">格式化</el-button>
            <el-button type="primary" @click="clearSql">清除</el-button>
            <el-button type="primary" @click="drawerVisible = true">高级设置</el-button>
          </div>
          <sql-smaple name="hive_sql"></sql-smaple>
          <span class="require">*</span>
          <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
          <monaco-editor ref="monaco" :key="sqlKey" v-model="content" v-loading="checkDisabled" :read-only="Boolean(seniorForm.gitPath)"></monaco-editor>
        </div>
        <!-- <div v-if="seniorForm.gitPath" class="mt10">git地址：{{ seniorForm.gitPath }}</div> -->
        <div v-if="alertMessage" class="mt10">校验结果：</div>
        <el-alert v-if="alertMessage" class="check-msg" type="info" :closable="false">{{ alertMessage }}</el-alert>
      </div>
      <step-three v-if="currentStep === 2" ref="stepThree" :name-disabled="nameDisabled" :is-show-input-btn="true" :is-input-edit="true" :is-output-edit="true" :is-show-input-check="true" :is-show-output-check="true" :region="seniorForm.sourceRegion" :rule-form="ruleForm"></step-three>
      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$router.go(-1)">取消</el-button>
      <el-button @click="preStep">上一步</el-button>
      <el-button v-if="currentStep === 2" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button>
      <el-button type="primary" :loading="btnLoading" :disabled="!canEdit && currentStep === 2" @click="nextStep">{{ currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存' }}</el-button>
    </div>
    <el-dialog title="拉取git代码库" :visible.sync="dialogVisible" width="550px" :close-on-click-modal="false" @close="closeGit">
      <el-form ref="gitForm" :model="gitForm" :rules="gitRules" label-width="110px">
        <el-form-item label="选择git跟目录" prop="projectName">
          <el-select v-model="gitForm.projectName" placeholder="选择git跟目录" clearable style="width: 100%">
            <el-option label="ads-bigdata-datastudio" value="ads-bigdata-datastudio"></el-option>
            <el-option label="ads-algo-datastudio" value="ads-algo-datastudio"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="输入子路径" prop="filePath">
          <el-input v-model="gitForm.filePath" placeholder="请输入子路径"></el-input>
          <div class="tip">输入提示：输入git子路径，例如：/a/b/test.sql</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="gitDisabled" @click="saveGit">拉取git仓库代码</el-button>
      </span>
    </el-dialog>

    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
    </el-info>
  </el-card>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import SeniorForm from './components/SeniorForm';
import SqlTips from './components/SqlTips';
import SqlSmaple from './components/SqlSmaple';
import MonacoEditor from '@/components/MonacoEditor/index';
import StepThree from './components/StepThree';
import { getTaskInfo, addTask, updateTask, check, getGitSql, getSqlTbls, addAndStart, updateAndStart } from '@/api/task'; // getDataSetList,
import * as tools from '@/utils/tools';
import * as filters from '@/filters';

export default {
  components: {
    StepsHead,
    SeniorForm,
    SqlTips,
    SqlSmaple,
    MonacoEditor,
    StepThree
  },
  data() {
    return {
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      queryId: this.$route.query.id,
      copyId: this.$route.query.copyId,
      version: this.$route.query.version,
      drawerVisible: false,
      currentStep: 1,
      content: '',
      dialogVisible: false,
      gitForm: {
        projectName: 'ads-bigdata-datastudio',
        filePath: ''
      },
      gitRules: {
        projectName: [{ required: true, message: '请选择git跟目录', trigger: ['blur', 'change'] }],
        filePath: [{ required: true, message: '请输入子路径', trigger: ['blur', 'change'] }]
      },
      gitDisabled: false,
      ruleForm: {
        content: '',
        templateCode: 'Hive2Hive',
        name: '',
        description: '',
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
              type: 'hive',
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
            },
            offset: -1
          }
        ],
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      rules: {
        sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }]
      },
      regionList: tools.regionList,
      seniorForm: {
        sourceRegion: '', // region
        gitPath: '',
        owner: '',
        collaborators: [],
        group: '',
        resourceLevel: 'standard',
        executionTimeout: 0,
        retryInterval: 600,
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        alertType: [2],
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        startDate: '',
        endDate: '',
        // params: [],
        batchParams: ''
      },
      sqlKey: 0,
      fullscreen: false,
      canEdit: true,
      nameDisabled: false,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      copyMsg: null,
      btnLoading: false
    };
  },
  computed: {
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
    }
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (this.queryId || this.copyId) {
      this.getTaskInfo();
    } else {
      if (!this.seniorForm.group) {
        this.seniorForm.group = this.groupList[0];
      }
      this.content = `/* =====DEMO===== */

--添加 insert overwrite
--注意时间变量，具体可查看"提示"
INSERT
  OVERWRITE TABLE db.table_name PARTITION(dt = '{{ yesterday_ds_nodash }}')
SELECT
  app_token,
  nation,
  count(distinct beyla_id)
FROM
  source_database.source_table_name
WHERE
  dt = '{{ yesterday_ds_nodash }}'
GROUP BY
  app_token,
  nation`;
      // this.$refs.monaco.setCode(this.content);
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
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.msgType = msgType;
      this.infoObj.title = title;
    },
    getTaskInfo() {
      const params = {
        id: this.queryId || this.copyId
      };
      if (this.version) {
        params.version = this.version;
      }
      getTaskInfo(params).then(res => {
        const data = res.data;
        this.nameDisabled = data.online === 1;
        const runtimeConfig = JSON.parse(data.runtimeConfig);
        if (runtimeConfig.cost) {
          this.ruleForm.cost = runtimeConfig.cost;
        }
        delete runtimeConfig.cost;
        // this.seniorForm = runtimeConfig;
        this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
        this.sqlKey++;
        this.ruleForm.name = data.name;
        this.ruleForm.description = data.description;
        const inputDataset = JSON.parse(data.inputDataset);
        const outputDataset = JSON.parse(data.outputDataset);
        this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
        this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
        this.content = decodeURIComponent(window.atob(data.content));
        this.$refs.monaco.setCode(this.content);
        if (this.seniorForm.gitPath) {
          this.gitForm.projectName = this.seniorForm.gitPath.substring(0, this.seniorForm.gitPath.indexOf('/'));
          this.gitForm.filePath = this.seniorForm.gitPath.substring(this.seniorForm.gitPath.indexOf('/'));
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
          this.ruleForm.name = data.name + '_copy';
          this.nameDisabled = false;
          this.seniorForm.owner = this.$store.getters.userInfo.userId;
        } else {
          this.canEdit = data.canEdit;
        }
      });
    },
    gitPull() {
      this.dialogVisible = true;
      if (this.seniorForm.gitPath) {
        this.gitForm.projectName = this.seniorForm.gitPath.substring(0, this.seniorForm.gitPath.indexOf('/'));
        this.gitForm.filePath = this.seniorForm.gitPath.substring(this.seniorForm.gitPath.indexOf('/'));
      }
    },
    saveGit() {
      this.$refs.gitForm.validate(valid => {
        if (valid) {
          this.gitDisabled = true;
          getGitSql({
            projectName: this.gitForm.projectName,
            filePath: this.gitForm.filePath
          })
            .then(res => {
              const data = res.data;
              this.content = decodeURIComponent(window.atob(data.content));
              this.$refs.monaco.setCode(this.content);
              if (data.conf) {
                this.seniorForm.batchParams = data.conf;
              } else {
                this.seniorForm.batchParams = '';
              }
              this.seniorForm.gitPath = this.gitForm.projectName + this.gitForm.filePath;
              this.sqlKey++;
              this.dialogVisible = false;
            })
            .finally(() => {
              this.gitDisabled = false;
            });
        }
      });
    },
    closeGit() {
      this.$refs.gitForm.resetFields();
    },
    checkSql() {
      if (!this.seniorForm.sourceRegion) {
        this.$message({
          type: 'warning',
          message: '请先选择区域'
        });
        return;
      }
      if (!this.content) {
        this.$message({
          type: 'warning',
          message: '请输入SQL'
        });
      } else {
        this.checkDisabled = true;
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        check({
          runtimeConfig: this.seniorForm,
          ...this.ruleForm
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
      this.seniorForm.gitPath = '';
      this.sqlKey++;
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    preStep() {
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    nextStep(text) {
      if (this.currentStep === 1) {
        // 下一步
        this.$refs.form.validate(valid => {
          if (valid) {
            if (this.content) {
              this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
              if (!this.queryId) {
                const formData = new FormData();
                formData.append('sql', window.btoa(encodeURIComponent(this.content)));
                this.btnLoading = true;
                getSqlTbls(formData)
                  .then(res => {
                    const data = res.data;
                    if (data.inputTbls.length) {
                      this.ruleForm.inputDataset = [];
                      data.inputTbls.forEach(item => {
                        this.ruleForm.inputDataset.push({
                          metadata: {
                            region: this.seniorForm.sourceRegion,
                            type: 'hive',
                            source: '',
                            db: item.db || '',
                            table: item.tbl || ''
                          },
                          guid: '',
                          id: '',
                          granularity: 'daily',
                          // offset: item.offset === 'null' ? undefined : item.offset,
                          unitOffset: item.offset === 'null' ? undefined : item.offset,
                          ready_time: '0 0 * * *'
                        });
                      });
                    }
                    if (data.outputTbls.length) {
                      this.ruleForm.outputDataset = [];
                      data.outputTbls.forEach(item => {
                        this.ruleForm.outputDataset.push({
                          metadata: {
                            region: this.seniorForm.sourceRegion,
                            type: 'hive',
                            source: '',
                            db: item.db || '',
                            table: item.tbl || ''
                          },
                          offset: item.offset === 'null' ? undefined : item.offset
                        });
                      });
                    }
                    if (data.context) {
                      this.$message({
                        type: 'warning',
                        message: data.context
                      });
                    }
                  })
                  .finally(() => {
                    this.btnLoading = false;
                    this.currentStep++;
                  });
              } else {
                this.currentStep++;
              }
              this.ruleForm.inputDataset.forEach(item => {
                item.metadata.region = this.seniorForm.sourceRegion;
              });
              this.ruleForm.outputDataset.forEach(item => {
                item.metadata.region = this.seniorForm.sourceRegion;
              });
            } else {
              this.$message.error('请输入SQL');
            }
          }
        });
      } else {
        // 保存
        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
              this.$message.error('至少包含一个前置依赖');
              return false;
            }
            if (this.ruleForm.outputDataset.length > 1) {
              this.$message.error('生成数据集信息只能保留一条');
              return false;
            }
            let propor = 0;
            this.ruleForm.cost.forEach(item => {
              propor += parseInt(item.value);
            });
            if (propor !== 100) {
              this.$message.error('成本归属占比总额必须是100哦');
              return false;
            }
            if (!this.seniorForm.group) {
              this.seniorForm.group = this.groupList[0];
            }
            this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
            const params = {
              ...this.ruleForm,
              runtimeConfig: {
                ...this.seniorForm,
                cost: this.ruleForm.cost
              }
            };
            delete params.cost;
            params.inputDataset.forEach(item => {
              if (item.sourceTableList) {
                delete item.sourceTableList;
              }
              if (item.granularityList) {
                delete item.granularityList;
              }
              delete item.isExternal;
              if (!item.metadata.type) {
                item.metadata.type = 'hive';
              }
            });
            params.outputDataset.forEach(item => {
              if (item.sourceTableList) {
                delete item.sourceTableList;
              }
            });
            if (this.$store.getters.userInfo && !this.seniorForm.owner) {
              params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
            }
            let actionUrl;
            if (this.queryId) {
              // 修改
              params.id = this.queryId;
              if (text === 'start') {
                actionUrl = updateAndStart(params);
              } else {
                actionUrl = updateTask(params);
              }
            } else {
              // 新增
              if (text === 'start') {
                actionUrl = addAndStart(params);
              } else {
                actionUrl = addTask(params);
              }
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
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
  .step-content {
    // padding: 20px;
    min-height: calc(100vh - 255px);
    .inline-form {
      background: #fff;
      border: 0;
      // margin-bottom: 30px;
      // margin-bottom: 0;
      margin-bottom: 14px;
      padding: 16px 0 8px;
    }
    .git-wrap {
      margin-bottom: 35px;
      .label {
        display: inline-block;
        width: 62px;
        text-align: right;
        margin-right: 12px;
        font-weight: 500;
        color: #2c3b5e;
      }
      .git-input {
        width: 180px;
      }
    }
    .monaco-editor-wrap {
      // height: calc(100vh - 360px);
      height: calc(100vh - 386px);
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
.tip {
  font-size: $global-font-size-12;
  color: #aaa;
  line-height: normal;
}
</style>
