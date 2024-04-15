<template>
  <div class="step2" :class="source === 'task' ? 'taskStep2' : ''">
    <steps-head :active="currentStep" :source="source" :direction="source === 'task' ? 'vertical' : 'horizontal'" @handelStep="handelStep"></steps-head>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <el-button class="senior-btn" type="primary" @click="drawerVisible = true">高级设置</el-button>
        <el-form ref="form2" class="ruleForm" :model="seniorForm" :rules="seniorRules" label-width="140px">
          <el-form-item label="区域" prop="sourceRegion" style="margin-bottom: 0">
            <template #label>
              <span>区域</span>
              <el-tooltip class="item" effect="dark" content="这里的区域指的是任务提交执行的集群所在的区域" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-select v-model="seniorForm.sourceRegion" placeholder="请选择区域" clearable>
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-tabs>
            <el-tab-pane label="Redshift参数设置">
              <el-form-item label="Redshift服务器" prop="redshiftAddr">
                <el-input v-model="seniorForm.redshiftAddr" placeholder="请输入aws redshift地址，比如：http://xxxx.ap_southeast-1.redshift.aws.com" clearable></el-input>
              </el-form-item>
              <el-form-item label="端口号" prop="redshiftPort">
                <el-input v-model="seniorForm.redshiftPort" placeholder="请输入端口号，比如：3306" clearable></el-input>
              </el-form-item>
              <el-form-item label="User" prop="redshiftUser">
                <el-input v-model="seniorForm.redshiftUser" placeholder="请输入aws iam_role信息" clearable></el-input>
              </el-form-item>
              <el-form-item label="库名" prop="redshiftDatabase">
                <el-input v-model="seniorForm.redshiftDatabase" placeholder="请输入库名" clearable></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <el-tabs class="process">
          <el-tab-pane>
            <template #label>
              <span class="label">
                加工逻辑
                <sql-smaple name="redshift_sql" class="sqlSmaple"></sql-smaple>
              </span>
            </template>
            <sql-box label="SQL" :required="true" :is-show-check="true" name="content" @check="checkSql" @format="format" @clear="clear">
              <!-- <div class="tip">在下方填写要执行sql语句，只支持写sql查询语句</div> -->
              <!-- <sql-smaple class="metis-smaple" name="redshift_sql"></sql-smaple> -->
              <monaco-editor :key="currentStep" ref="content" v-model="content" v-loading="checkDisabled" class="content"></monaco-editor>
            </sql-box>
            <div v-if="alertMessage" class="mt10 ml56">校验结果：</div>
            <el-alert v-if="alertMessage" class="check-msg ml56" type="info" :closable="false">{{ alertMessage }}</el-alert>
          </el-tab-pane>
        </el-tabs>
      </div>
      <step-three
        v-if="currentStep === 2"
        ref="stepThree"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :region="ruleForm.inputDataset[0].metadata.region"
        :rule-form="ruleForm"
        :senior-form="seniorForm"
      ></step-three>

      <!-- 预览 -->
      <ViewParams
        v-if="currentStep === 3"
        :info="info"
        :content="content"
        :region-list="regionList"
        :is-workflow="isWorkflow"
        :name-disabled="nameDisabled"
        :is-show-input-btn="true"
        :is-input-edit="true"
        :is-output-edit="true"
        :is-show-input-check="true"
        :is-show-output-check="true"
        :senior-form="seniorForm"
        @jumpStep="$event => (currentStep = $event)"
      />

      <el-drawer title="高级设置" :visible.sync="drawerVisible" :append-to-body="true" :with-header="false" direction="rtl">
        <senior-form ref="seniorForm" :is-show-mode="false" :senior-form="seniorForm" @close="drawerVisible = false"></senior-form>
      </el-drawer>
    </div>
    <div class="btn-wrap">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button v-if="isShowPublish || (!isShowPublish && currentStep !== 1)" @click="preStep">上一步</el-button>
      <!-- <el-button v-if="isShowPublish && currentStep === 2" type="primary" :disabled="!canEdit" @click="nextStep('start')">保存且发布</el-button> -->
      <el-button type="primary" :loading="btnLoading" :disabled="!canEdit && ((source === 'task' && currentStep === 3) || (source !== 'task' && currentStep === 2))" @click="nextStep">{{
        (source === 'task' && currentStep !== 3) || currentStep === 1 ? '下一步' : copyId ? '确认复制' : '保存'
      }}</el-button>
      <el-checkbox v-if="isShowPublish && currentStep >= 3" v-model="ruleForm.invokingStatus" class="task-checkbox">切换至该版本</el-checkbox>
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
import SeniorForm from './components/SeniorForm';
import SqlBox from '@/views/dataSet/step/components/SqlBox';
import MonacoEditor from '@/components/MonacoEditor/index';
import SqlSmaple from './components/SqlSmaple';
import StepThree from './components/StepThree';
import { getSqlTbls, check } from '@/api/task'; // getDataSetList,
import * as tools from '@/utils/tools';
import * as filters from '@/filters';
import ValidParams from '@/components/TaskTemplate/components/ValidParams.vue';
import ViewParams from './components/viewParams';

export default {
  components: {
    StepsHead,
    SeniorForm,
    SqlBox,
    MonacoEditor,
    SqlSmaple,
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
      queryId: '',
      copyId: this.$route.query.copyId,
      drawerVisible: false,
      currentStep: 1,
      content: '', // `/* =====DEMO===== */
      initAlertModel: { alertType: [], notifyCollaborator: false },
      initRegularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
      // ---示例
      // ---创建临时表
      // CREATE temp TABLE XXXXX (day varchar(64), hour varchar(64),
      // country varchar(200),... ) WITH OIDS ;
      // ---指定S3路径、iam_role信息及存储格式
      // copy XXXXX from 's3://XXXX/XXXX/dt=2022032904'
      // iam_role 'arn:aws:iam::848318613114:role/XXXXXX'
      // FORMAT AS PARQUET statupdate on;
      // ---写入redshift下游表
      // delete from db.tableXXXX where dt='2022032904';
      // insert into db.tableXXXX (day,hour,country,...) select .... from XXXXX;
      // drop table XXXXX;
      // commit;`,
      ruleForm: {
        invokingStatus: true,
        content: '',
        templateCode: 'Hive2Redshift',
        name: '',
        description: '',
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
        eventDepends: [
          // {
          //   dependId: '',
          //   dependGra: '',
          //   dateCalculationParam: {},
          //   unitOffset: 0,
          //   useDateCalcuParam: false,
          //   granularity: '',
          //   taskId: ''
          // }
        ],
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
            unitOffset: 0,
            ready_time: '0 0 * * *',
            useDateCalcuParam: false,
            dateCalculationParam: {}
          }
        ],
        outputDataset: [
          // {
          //   metadata: {
          //     region: '',
          //     type: 'hive',
          //     source: '',
          //     db: '',
          //     table: ''
          //   },
          //   offset: -1
          // }
        ],
        cost: [
          {
            key: '',
            value: '100'
          }
        ]
      },
      regionList: tools.regionList,
      seniorForm: {
        sourceRegion: '',
        redshiftAddr: '',
        redshiftPort: '',
        redshiftUser: '',
        redshiftDatabase: '',
        // 高级设置参数
        owner: '',
        collaborators: [],
        dsGroups: [],
        group: '',
        resourceLevel: 'standard',
        executionTimeout: 0,
        retryInterval: 600,
        retries: 1,
        maxActiveRuns: 1,
        emails: '',
        clusterSla: 'normal',
        alertModel: { success: { alertType: [], notifyCollaborator: false }, failure: { alertType: [], notifyCollaborator: false, isChecked: false }, retry: { alertType: [], notifyCollaborator: false }, start: { alertType: [], notifyCollaborator: false }},
        regularAlert: { offset: 0, graularity: '', checkTime: '', triggerCondition: 'notStart', alertType: [], notifyCollaborator: false, isChecked: false },
        acrossCloud: 'common',
        startDate: '',
        endDate: '',
        // params: [],
        batchParams: ''
      },
      seniorRules: {
        sourceRegion: [{ required: true, message: '请选择区域', trigger: ['blur', 'change'] }],
        redshiftAddr: [{ required: true, message: '请输入Redshift服务器', trigger: ['blur', 'change'] }],
        redshiftPort: [{ required: true, message: '请输入端口号', trigger: ['blur', 'change'] }],
        redshiftUser: [{ required: true, message: '请输入aws iam_role信息', trigger: ['blur', 'change'] }],
        redshiftDatabase: [{ required: true, message: '请输入库名', trigger: ['blur', 'change'] }]
      },
      fullscreen: false,
      canEdit: true,
      nameDisabled: false,
      alertType: '',
      alertMessage: '',
      checkDisabled: false,
      copyMsg: null,
      btnLoading: false,
      isEdit: false,
      isWorkflow: false
    };
  },
  computed: {
    info() {
      return Object.assign({}, this.ruleForm, this.seniorForm);
    },
    disabled() {
      return this.currentStep === 3;
    },
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
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
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    // if (!this.seniorForm.group) {
    //   this.seniorForm.group = this.groupList[0];
    // }
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.seniorForm.dsGroups = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
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
    getTaskInfo(data) {
      if (!this.copyId) {
        this.queryId = data.id;
      }
      this.nameDisabled = data.online === 1;
      const runtimeConfig = JSON.parse(data.runtimeConfig);
      if (runtimeConfig.cost) {
        this.ruleForm.cost = runtimeConfig.cost;
      }
      delete runtimeConfig.cost;
      // this.seniorForm = runtimeConfig;
      this.seniorForm = Object.assign(this.seniorForm, runtimeConfig);
      this.ruleForm.name = data.name;
      this.ruleForm.description = data.description;
      this.$set(this.ruleForm, 'online', data.online);
      const inputDataset = JSON.parse(data.inputDataset);
      const outputDataset = JSON.parse(data.outputDataset);
      this.ruleForm.inputDataset = inputDataset.length ? inputDataset : this.ruleForm.inputDataset;
      this.ruleForm.outputDataset = outputDataset.length ? outputDataset : this.ruleForm.outputDataset;
      if (this.ruleForm.outputDataset && this.ruleForm.outputDataset.length > 0 && this.ruleForm.outputDataset[0].location) {
        this.$set(this.ruleForm.outputDataset[0], 'check', true);
      }
      this.content = decodeURIComponent(window.atob(data.content));
      this.$nextTick(() => {
        this.$refs.content && this.$refs.content.setCode(this.content);
      });
      if (data.dependTypes) {
        this.ruleForm.dependTypes = JSON.parse(data.dependTypes);
      }
      if (data.triggerParam) {
        Object.assign(this.ruleForm.triggerParam, JSON.parse(data.triggerParam));
      }
      if (data.eventDepends) {
        this.ruleForm.eventDepends = JSON.parse(data.eventDepends);
      }
      if (this.copyId || data.isCopy) {
        this.ruleForm.name = data.name + '_copy';
        this.nameDisabled = false;
        this.seniorForm.owner = this.$store.getters.userInfo.userId;
      } else {
        this.canEdit = data.canEdit;
      }
      if (data.isCopy) {
        this.copyId = data.isCopy;
      }
      if (data.workflowId) {
        this.isWorkflow = true;
      }
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
          ...this.ruleForm,
          runtimeConfig: {
            ...this.seniorForm,
            cost: this.ruleForm.cost
          }
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
    format(name) {
      this.$refs[name].formatSql();
    },
    clear(name) {
      this.$refs[name].setCode('');
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
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
      if (this.currentStep === 1) {
        this.$router.push('/task/step1');
      } else {
        this.currentStep--;
      }
    },
    async nextStep(text) {
      if (this.currentStep === 1) {
        // 下一步
        const list = [];
        list.push(this.checkForm('form2'));
        Promise.all(list).then(() => {
          if (this.content) {
            if (!this.isEdit) {
              const formData = new FormData();
              formData.append('region', this.seniorForm.sourceRegion);
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
                        unitOffset: 0,
                        ready_time: '0 0 * * *',
                        useDateCalcuParam: false,
                        dateCalculationParam: {}
                      });
                    });
                  }
                  // if (data.outputTbls.length) {
                  //   this.ruleForm.outputDataset = [];
                  //   data.outputTbls.forEach(item => {
                  //     this.ruleForm.outputDataset.push({
                  //       metadata: {
                  //         region: this.seniorForm.sourceRegion,
                  //         type: 'hive',
                  //         source: '',
                  //         db: item.db || '',
                  //         table: item.tbl || ''
                  //       },
                  //       offset: item.offset === 'null' ? undefined : item.offset
                  //     });
                  //   });
                  // }
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
            // this.ruleForm.outputDataset.forEach(item => {
            //   item.metadata.region = this.seniorForm.sourceRegion;
            // });
          } else {
            this.$message.error('请输入SQL');
          }
        });
      } else if (this.currentStep === 2 && this.source === 'task') {
        if (this.ruleForm.outputDataset[0] && this.ruleForm.outputDataset[0].check) {
          const pathRules = await this.$refs.stepThree.$refs.GeneratePathFrom.checkPath();
          if (!pathRules) {
            this.$message.error('标志路径输入格式有误');
            return;
          }
        } else if (this.ruleForm.outputDataset[0]) {
          delete this.ruleForm.outputDataset[0].location;
          delete this.ruleForm.outputDataset[0].fileName;
          delete this.ruleForm.outputDataset[0].check;
        }

        this.$refs.stepThree.$refs.ruleForm.validate(valid => {
          if (valid) {
            if (this.$refs.stepThree.validateType()) {
              this.currentStep++;
              this.$nextTick(() => {
                document.documentElement.scrollTo(0, 0);
              });
            }
          }
        });
      } else {
        // 保存
        if (this.source === 'workflow') {
          if (this.ruleForm.outputDataset[0] && this.ruleForm.outputDataset[0].check) {
            const pathRules = await this.$refs.stepThree.$refs.GeneratePathFrom.checkPath();
            if (!pathRules) {
              this.$message.error('标志路径输入格式有误');
              return;
            }
          } else if (this.ruleForm.outputDataset[0]) {
            delete this.ruleForm.outputDataset[0].location;
            delete this.ruleForm.outputDataset[0].fileName;
            delete this.ruleForm.outputDataset[0].check;
          }
        }

        if (this.ruleForm.dependTypes.includes('dataset') && !this.ruleForm.inputDataset.length) {
          this.$message.error('至少包含一个前置依赖');
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
        let eventFlag = false;
        // this.ruleForm.eventDepends.forEach(item => {
        //   if (!item.dependId) {
        //     eventFlag = true;
        //     this.$message.warning('任务依赖任务名称不能为空，请根据任务ID查询');
        //     return;
        //   }
        // });
        if (this.ruleForm.dependTypes.includes('event') && this.ruleForm.eventDepends.length === 0) {
          eventFlag = true;
          this.$message.warning('请至少添加一条内部依赖');
        }
        if (eventFlag) return;
        let inputFlag = false;
        this.ruleForm.inputDataset.forEach(item => {
          if (this.ruleForm.dependTypes.includes('dataset') && !item.useDateCalcuParam && item.unitOffset === undefined) {
            inputFlag = true;
            this.$message.warning('数据依赖偏移量不能为空');
            return;
          }
        });
        if (inputFlag) return;
        // if (!this.seniorForm.group) {
        //   this.seniorForm.group = this.groupList[0];
        // }
        if (!this.seniorForm.source) {
          this.seniorForm.source = this.source;
        }
        this.ruleForm.content = window.btoa(encodeURIComponent(this.content));
        const params = {
          ...tools.copyFn(this.ruleForm),
          runtimeConfig: {
            ...this.seniorForm,
            cost: this.ruleForm.cost
          }
        };
        delete params.cost;
        params.inputDataset.forEach(item => {
          // item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
          if (item.granularityList) {
            delete item.granularityList;
          }
          if (item.checkPathList) {
            delete item.checkPathList;
          }
          delete item.isExternal;
          if (!item.metadata.type) {
            item.metadata.type = 'hive';
          }
        });
        params.outputDataset.forEach(item => {
          // item.id = '';
          if (item.sourceTableList) {
            delete item.sourceTableList;
          }
          if (this.copyId) {
            delete item.id;
            delete item.metadata;
          }
        });
        if (this.$store.getters.userInfo && !this.seniorForm.owner) {
          params.runtimeConfig.owner = this.$store.getters.userInfo.userId;
        }
        // 处理内外部依赖数据
        if (!this.ruleForm.dependTypes.includes('dataset')) {
          params.inputDataset = [
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
              unitOffset: 0,
              ready_time: '0 0 * * *',
              useDateCalcuParam: false,
              dateCalculationParam: {}
            }
          ];
        }
        if (!this.ruleForm.dependTypes.includes('event')) {
          params.outputDataset = [{}];
        }
        if (this.queryId) {
          params.id = this.queryId;
        }
        // 拷贝params，处理传参
        const paramsVal = JSON.parse(JSON.stringify(params));
        // 处理定时告警数据
        if (!paramsVal.runtimeConfig.regularAlert.isChecked) {
          delete paramsVal.runtimeConfig.regularAlert;
        }
        Object.keys(paramsVal.runtimeConfig.alertModel).forEach(item => {
          if (!paramsVal.runtimeConfig.alertModel[item].isChecked) {
            paramsVal.runtimeConfig.alertModel[item] = this.initAlertModel;
          }
        });
        // 处理生成标志
        if (!paramsVal.outputDataset[0].check) {
          paramsVal.outputDataset[0].fileName = '';
          paramsVal.outputDataset[0].location = '';
        }
        if (!paramsVal.outputDataset[0].id) {
          delete paramsVal.outputDataset[0].id;
        }
        this.$refs.validParams.show(paramsVal);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.step2 {
  .btn-wrap {
    min-width: 1000px;
    width: calc(100% - 200px);
    margin: 0 auto;
    text-align: right;
    padding: 20px 0;
  }
  .step-content {
    padding: 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .senior-btn {
      position: absolute;
      right: 20px;
      z-index: 10;
    }
    .metis-smaple {
      left: 60px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 700px;
        margin: 0 auto 18px;
      }
      .el-select,
      .el-input {
        width: 70%;
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
    .process {
      // ::v-deep .el-tabs__header {
      // }
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
    .check-msg {
      width: calc(100% - 56px);
      margin-top: 5px;
      white-space: pre-line;
      max-height: 200px;
      overflow-y: auto;
      ::v-deep .el-alert__content {
        max-height: 200px;
      }
    }
    .ml56 {
      margin-left: 56px;
    }
  }
}
.tip {
  font-size: $global-font-size-12;
  color: #666;
  line-height: normal;
  position: absolute;
  top: -20px;
  left: 60px;
}
</style>
