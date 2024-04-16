<template>
  <el-card class="create box-card-container">
    <div class="head">
      <el-steps :active="active" align-center class="steps-head" process-status="finish" finish-status="success">
        <el-step title="选择问题所属产品" class="steps-item" @click.native="clickStep"></el-step>
        <el-step title="提交工单"></el-step>
      </el-steps>
    </div>
    <div class="content">
      <el-row v-show="active === 0" class="module-wrap" :gutter="20">
        <el-col v-for="item in moduleList" :key="item.value" :span="8">
          <div :class="['module-item', ruleForm.module === item.value ? 'active' : '']" @click="clickModule(item)"><svg-icon :icon-class="item.icon"></svg-icon> {{ item.label }}</div>
        </el-col>
      </el-row>
      <el-form v-show="active === 1" ref="ruleForm" :model="ruleForm" :rules="rules" label-width="120px">
        <el-form-item label="问题类型" prop="type">
          <el-row class="module-wrap" :gutter="20">
            <el-col v-for="item in typeList" :key="item.key" :span="8">
              <div :class="['module-item type', ruleForm.type === item.type ? 'active' : '']" @click="clickType(item.type)">
                <span class="solid-cicle"></span> {{ item.type }}
                <div class="tip">{{ item.description }}</div>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <div v-if="ruleForm.type !== '数据接入申请'">
          <el-form-item label="标题" prop="title">
            <el-input v-model="ruleForm.title" class="form-input" placeholder="请输入标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="任务ID" prop="taskId">
            <el-input v-model="ruleForm.taskId" class="form-input" placeholder="请输入任务ID，如没有任务ID，可输入“暂无”，最多输入50个字节" maxlength="50" clearable></el-input>
          </el-form-item>
          <el-form-item label="紧急程度" prop="feedbackLevel">
            <el-radio-group v-model="ruleForm.feedbackLevel">
              <el-radio v-for="(value, key) in feedbackLevelList" :key="key" :label="key">{{ value }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="ruleForm.description" class="form-input" type="textarea" rows="4" placeholder="请输入问题描述；支持Ctrl+V粘贴图片" maxlength="2000" clearable @paste.native="handlePaste"></el-input>
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload ref="upload" action="" :accept="accept" :on-change="fileChange" :on-exceed="fileExceed" :on-remove="fileRemove" :limit="3" :multiple="true" :auto-upload="false">
              <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              <div slot="tip" class="el-upload__tip">支持扩展名：.doc, .docx, .pdf, .jpg, .jpeg, .png；最多上传3个文件</div>
            </el-upload>
            <el-progress v-show="loading" style="margin-top: 10px; width: 400px" status="success" :text-inside="true" :stroke-width="20" :percentage="percentage"></el-progress>
          </el-form-item>
        </div>
        <div v-else>
          <el-tabs>
            <el-tab-pane label="申请人信息" class="base-form">
              <el-form-item label="工单发起人">
                {{ createBy }}
              </el-form-item>
              <el-form-item label="所属用户组">
                {{ userGroup.name }}
              </el-form-item>
              <el-form-item label="紧急程度" prop="feedbackLevel">
                <el-radio-group v-model="ruleForm.feedbackLevel">
                  <el-radio v-for="(value, key) in feedbackLevelList" :key="key" :label="key">{{ value }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="申请理由">
                <el-input v-model="ruleForm.description" type="textarea" placeholder="请输入申请理由，不超过200个字符"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-tabs>
            <el-tab-pane label="申请内容" class="base-form">
              <el-form-item label="标题"> {{ ruleForm.title }} </el-form-item>
              <el-form-item label="库选择" prop="database" required>
                <el-select key="database" v-model="ruleForm.database" filterable clearable class="area-select" placeholder="请选择库" @change="getTables">
                  <el-option v-for="item in dbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="表选择" prop="tables">
                <el-select key="tables" v-model="ruleForm.tables" multiple filterable clearable class="area-select" placeholder="请选择表">
                  <el-option v-for="item in tableList" :key="item.name" :label="item.name" :value="item.name"></el-option>
                </el-select>
                <div class="table-tips">
                  已添加 <span>{{ ruleForm.tables.length }}</span> 张表，最多可添加50张表
                </div>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-form-item>
          <el-button @click="active = 0">上一步</el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="save">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>
<script>
import { saveFeedback } from '@/api/feedback';
import { getDataSetList } from '@/api/task';
import * as tools from '@/utils/tools';
import EllipsisTooltip from '@/components/EllipsisTooltip';
export default {
  components: { EllipsisTooltip },
  data() {
    return {
      active: 0,
      moduleList: [
        {
          label: '数据分析（Query Analysis）',
          value: '数据查询',
          icon: 'dataQuery'
        },
        {
          label: '数据开发（Data Engineering）',
          value: '数据开发',
          icon: 'task'
        },
        // {
        //   label: '业务BI（Tableau）',
        //   value: '业务BI',
        //   icon: 'bi'
        // },
        // {
        //   label: '资源中心（Data Set）',
        //   value: '资源中心',
        //   icon: 'dataSet'
        // },
        {
          label: '数据治理（lakecat 暂未开通）',
          value: '数据治理',
          icon: 'template'
        }
        // {
        //   label: '其他（Others）',
        //   value: '其他',
        //   icon: 'more'
        // }
      ],
      dbList: [],
      tableList: [],
      ruleForm: {
        appName: 'ds-work',
        module: '',
        type: '',
        title: '',
        feedbackLevel: 'GENERAL',
        description: '',
        pageUri: '',
        taskId: '',
        attachmentList: [],
        radioInit: 3,
        database: '',
        tables: []
      },
      defaultRuleFrom: {
        appName: 'ds-work',
        module: '',
        type: '',
        title: '',
        feedbackLevel: 'GENERAL',
        description: '',
        pageUri: '',
        taskId: '',
        attachmentList: [],
        radioInit: 3,
        database: '',
        tables: []
      },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        taskId: [{ required: true, message: '请输入任务ID', trigger: 'blur' }],
        feedbackLevel: [{ required: true, message: '请选择紧急程度', trigger: 'blur' }],
        description: [{ required: true, message: '请输入问题说明', trigger: 'blur' }],
        database: [{ required: true, message: '请选择库', trigger: ['blur', 'change'] }],
        tables: [{ required: true, message: '请选择表', trigger: 'change' }]
      },
      feedbackLevelList: tools.feedbackLevelList,
      btnDisabled: false,
      loading: false,
      percentage: 0,
      regionList: []
    };
  },
  computed: {
    accept() {
      return '.doc, .docx, .pdf, .jpg, .jpeg, .png';
    },
    typeList() {
      let list = [];
      if (this.ruleForm.module === '数据查询') {
        list = [
          {
            type: '查询失败',
            description: '您在使用平台过程中,遇到的"查询任务失败"相关的问题'
          },
          {
            type: '功能故障',
            description: '您在使用平台过程中遇到的阻断或影响正常使用的缺陷类问题'
          },
          {
            type: '权限类',
            description: '您在使用平台过程中遇到的和权限有关的问题'
          },
          {
            type: '产品需求',
            description: '您觉得需要增加的功能或者待提升的交互体验'
          },
          {
            type: '其他',
            description: '您在使用平台过程中遇到的其他相关问题'
          }
        ];
      } else if (this.ruleForm.module === '数据开发') {
        list = [
          {
            type: '任务失败类',
            description: '您在使用平台过程中遇到的与任务执行失败、重算、执行不符合预期等相关的问题'
          },
          {
            type: '调度异常类',
            description: '您在使用平台过程中遇到的与任务调度相关的问题，例如：补数相关、超时未执行、未调起、未生成实例、前置依赖未就绪等'
          },
          {
            type: '任务配置类',
            description: '您在使用平台过程中遇到的和参数配置等原因导致的问题'
          },
          {
            type: '权限类',
            description: '您在使用平台过程中遇到的和权限有关的问题'
          },
          {
            type: '产品需求',
            description: '您对xx功能/页面在xx场景下的改进建议或体验类问题说明'
          },
          {
            type: '数据接入申请',
            description: '如果您需要申请接入DB数据源至Lakehouse中，可点此进行申请。'
          },
          {
            type: '其他',
            description: '您在使用平台过程中遇到的其他相关问题'
          }
        ];
      } else if (this.ruleForm.module === '数据治理') {
        list = [
          {
            type: '查询故障',
            description: '您在使用平台过程中，针对数据表、任务、存储路径遇到查询结果偏差大、查询失败等相关问题'
          },
          {
            type: '权限问题',
            description: '您在使用平台过程中，遇到登录失败、无法访问功能模块等权限类问题'
          },
          {
            type: '功能故障',
            description: '您在使用平台过程中，遇到功能失效或影响正常使用的故障类问题'
          },
          {
            type: '交互体验',
            description: '您在使用产品过程中，需要提升用户交互体验的优化项'
          },
          {
            type: '功能优化',
            description: '您在使用产品过程中，需要增加的功能需求'
          },
          {
            type: '其他',
            description: '您在使用平台过程中遇到的其他相关问题'
          }
        ];
      } else {
        list = [
          {
            type: '故障类',
            description: '您在使用平台过程中遇到的阻断或影响正常使用的缺陷类问题'
          },
          {
            type: '运维类',
            description: '您在使用平台过程中遇到的任务创建、执行、调度等相关的问题'
          },
          {
            type: '权限类',
            description: '您在使用平台过程中遇到的和权限有关的问题'
          },
          {
            type: '产品建议',
            description: '您对某功能/页面在什么场景下的改进建议或体验类问题说明'
          },
          {
            type: '其他',
            description: '您在使用平台过程中遇到的其他相关问题'
          }
        ];
      }
      return list;
    },
    createBy() {
      return this.$store.getters['userInfo'].userId;
    },
    userGroup() {
      return this.$store.getters['user/currentUserGroup'];
    }
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     vm.ruleForm.pageUri = `${window.location.origin}/#${from.path}`;
  //   });
  // },
  watch: {
    'ruleForm.type'(v) {
      if (v === '数据接入申请') {
        getDataSetList({ region: this.regionList[0].value, type: 'hive', metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' }).then(res => {
          this.dbList = res.data.data;
        });
        this.ruleForm.title = '数据接入申请';
      } else {
        this.ruleForm.title = '';
      }
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
  },
  methods: {
    clickStep() {
      this.active = 0;
      Object.assign(this.ruleForm, this.defaultRuleFrom);
    },
    clickModule(item) {
      if (item.value === '数据治理') {
        this.$message.warning('该功能暂未开通');
        return;
      }
      this.ruleForm.module = item.value;
      this.active = 1;
      this.$nextTick(() => {
        this.ruleForm.type = this.typeList[0].type;
      });
    },
    clickType(item) {
      this.ruleForm.type = item;
    },
    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items;
      let file = null;

      if (!items || items.length === 0) {
        this.$message.error('当前浏览器不支持粘贴');
        return;
      }
      // 搜索剪切板items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
      // 此时file就是我们的剪切板中的图片对象
      if (file) {
        this.$refs.upload.handleStart(file);
      }
    },
    fileChange(file, fileList) {
      this.ruleForm.attachmentList = fileList.map(item => item.raw);
    },
    fileRemove(file, fileList) {
      this.ruleForm.attachmentList = fileList.map(item => item.raw);
    },
    fileExceed() {
      this.$message({
        type: 'warning',
        message: '最多上传3个文件'
      });
    },
    onUploadProgress(ProgressEvent) {
      if (ProgressEvent.lengthComputable) {
        const num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
        this.percentage = num >= 98 ? 99 : num;
      }
    },
    getTables() {
      getDataSetList({ db: this.ruleForm.database, region: this.regionList[0].value, type: 'hive', metaFlag: 'AIRBYTE', templateCode: 'Mysql2Hive' }).then(res => {
        this.tableList = res.data.data;
      });
      this.ruleForm.tables = [];
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };
          const formData = new FormData();
          if (this.ruleForm.title === '数据接入申请') {
            formData.append('appName', this.ruleForm.appName);
            formData.append('module', this.ruleForm.module);
            formData.append('type', this.ruleForm.type);
            formData.append('createBy', this.createBy);
            formData.append('userGroup', this.userGroup.id || '');
            formData.append('feedbackLevel', this.ruleForm.feedbackLevel);
            formData.append('description', this.ruleForm.description);
            formData.append('title', this.ruleForm.title);
            formData.append('database', this.ruleForm.database);
            formData.append('tables', this.ruleForm.tables);
          } else {
            formData.append('appName', this.ruleForm.appName);
            formData.append('module', this.ruleForm.module);
            formData.append('title', this.ruleForm.title);
            formData.append('type', this.ruleForm.type);
            formData.append('description', this.ruleForm.description);
            formData.append('taskId', this.ruleForm.taskId);
            formData.append('feedbackLevel', this.ruleForm.feedbackLevel);
          }

          if (this.ruleForm.attachmentList.length) {
            config.onUploadProgress = ProgressEvent => {
              this.onUploadProgress(ProgressEvent);
            };
            this.ruleForm.attachmentList.forEach(item => {
              formData.append('attachmentList', item);
            });
          }
          this.btnDisabled = true;
          this.loading = true;
          saveFeedback(formData, config)
            .then(res => {
              this.$message({
                type: 'success',
                message: '工单已提交；尽快会有工程师联系您'
              });
              this.$router.push('/admin/order/list');
            })
            .finally(() => {
              this.loading = false;
              this.btnDisabled = false;
              this.percentage = 0;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.create {
  .head {
    background: #f5f6f9;
    padding: 15px 0 10px 0;
    .steps-head {
      width: 1000px;
      margin: 0 auto;
      ::v-deep .el-step__title {
        font-size: $global-font-size-14;
      }
      .steps-item {
        cursor: pointer;
      }
    }
  }
  .content {
    width: 1000px;
    margin: 20px auto;
    .module-wrap {
      margin-left: 0 !important;
      margin-right: 0 !important;
      .module-item {
        height: 56px;
        line-height: 56px;
        background: #f5f7fa;
        margin-bottom: 15px;
        padding: 0 18px;
        cursor: pointer;
        color: #596474;
        .solid-cicle {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #596474;
          position: relative;
          top: -3px;
        }
        &.active {
          color: #409eff;
          .solid-cicle {
            background: #409eff;
          }
          .tip {
            color: #409eff;
          }
        }
        &.type {
          height: 100px;
          line-height: normal;
          padding: 15px 18px;
          .tip {
            line-height: normal;
            margin-left: 8px;
            margin-top: 5px;
          }
        }
      }
    }
    .form-input {
      width: 500px;
    }
    .tip {
      font-size: $global-font-size-12;
      color: #aaa;
    }
  }
}
.table-tips {
  position: absolute;
  left: 63%;
  bottom: 0;
  span {
    color: #ff5656;
  }
}
.area-select {
  width: 60%;
}
</style>
