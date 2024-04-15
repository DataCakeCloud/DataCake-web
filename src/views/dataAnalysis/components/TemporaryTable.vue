<template>
  <div class="tableContext">
    <el-drawer v-loading="loading" :visible="drawer" :direction="direction" :before-close="handleClose" size="650px" element-loading-text="创建中...." :wrapper-closable="false" element-loading-spinner="el-icon-loading" :close-on-press-escape="false">
      <template #title>
        <div class="title">
          <span>
            创建临时表
            <el-tooltip placement="left">
              <template #content>
                1.'创建临时表'可以帮助用户创建数据表并将本地的数据上传至存储服务器,进而完成查询任务<br />
                2.用户创建的临时表会根据区域进行存储,例:用户在Presto AWS美东创建的临时表,那么只要是带有'AWS美东'区域的引擎下面就可以查找到此临时表<br />
                3.创建的临时表默认存放到temp_database数据库中<br />
                4.对于已创建的临时表,支持通过sql语句进行编辑修改和删除
              </template>
              <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
            </el-tooltip>
          </span>
        </div>
      </template>
      <div class="main">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="110px" class="demo-ruleForm">
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
              <template slot="title">
                基础信息
                <span class="line"></span>
              </template>
              <el-form-item label="区域: ">
                <span>{{ regionName }}</span>
                <p class="tipsClass" style="margin-bottom: -14px; margin-top: -10px">系统会根据"区域"创建临时表,带有此"区域"的引擎下 都会创建此临时表</p>
              </el-form-item>
              <el-form-item label="数据库: ">
                <span>temp_database <span class="tipsClass">(创建的临时表默认存放到此数据库中)</span></span>
              </el-form-item>
              <el-form-item label="数据表: " prop="tableName">
                <el-input v-model="ruleForm.tableName" placeholder="支持英文、数字以及下划线,不能以下划线开头" style="width: 320px"></el-input>
              </el-form-item>
              <el-form-item label="数据格式: ">
                <el-select v-model="ruleForm.storeFormat">
                  <el-option label="CSV" value="csv"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="存储时长: ">
                <el-select v-model="ruleForm.lifeCycle">
                  <el-option v-for="(item, index) in lifeCycleList" :key="index" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="描述: " prop="comment">
                <el-input v-model="ruleForm.comment" type="textarea" maxlength="256" rows="3" show-word-limit></el-input>
              </el-form-item>
            </el-collapse-item>
            <el-collapse-item name="2" class="collapse">
              <template slot="title">
                上传数据
                <span class="line"></span>
              </template>
              <p class="tipsClass">&nbsp;&nbsp;&nbsp;&nbsp;上传数据,可以帮助用户解析表结构并完成数据存储,数据将存放到系统默认的目录中</p>
              <el-form-item class="upload" prop="field">
                <template #label>
                  <span>
                    选择文件
                    <el-tooltip content="上传数据前,请您确保单元格中不存在回车换行,否则建表之后,会出现数据乱行的情况" placement="top-start">
                      <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
                    </el-tooltip>
                    :
                  </span>
                </template>
                <el-upload ref="rebateUpload" class="upload-demo" action="" :accept="accept" :on-remove="fileRemove" :limit="1" :file-list="ruleForm.field" :on-exceed="fileExceed" :on-change="fileChange" :auto-upload="false">
                  <el-button size="mini" type="primary">点击上传</el-button>
                  <div slot="tip" class="el-upload__tip">仅支持上传 .csv 文件格式的数据,上传数据量最大为50MB</div>
                </el-upload>
                <!-- <el-button size="mini" class="cancel" :disabled="percentageStatus !== 1" @click="cancelFile">取消上传</el-button> -->
              </el-form-item>
              <el-form-item v-show="running && percentage > 0" :label="`${percentageText}: `" prop="desc">
                <el-progress :percentage="percentage" style="margin-top: 8px"></el-progress>
              </el-form-item>
            </el-collapse-item>
            <el-collapse-item name="3" class="collapse">
              <template slot="title" class="title">
                <span>数据表结构</span>
                <span class="line"></span>
              </template>
              <p class="tipsClass">&nbsp;&nbsp;&nbsp;&nbsp;解析出来的表结构,字段类型默认显示为string,需要用户调整为正确的字段类型</p>
              <el-table :data="ruleForm.meta" style="width: 100%" border>
                <el-table-column label="字段名称">
                  <template slot-scope="scope">
                    <el-form-item :prop="'meta.' + scope.$index + '.name'" :rules="[{ pattern: /^(?!_)[a-zA-Z0-9(?_)]+$/, message: '英文、数字、下划线,不能以下画线开头', trigger: 'change' }]">
                      <el-input v-model="scope.row.name"></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="字段类型">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.type" style="width: 100%">
                      <el-option v-for="(item, index) in options" :key="index" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                    <!-- <el-autocomplete v-model="scope.row.type" class="inline-input" style="width: 100%" :fetch-suggestions="querySearch"></el-autocomplete> -->
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-form>
        <div class="btnClass">
          <div class="btn">
            <el-button type="primary" @click="submit">确 定</el-button>
            <el-button @click="clearDrawer">取 消</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { nameCheck, uploadFile, createTempTable } from '@/api/querydata';
import axios from 'axios';

export default {
  name: 'TemporaryTable',
  props: {
    direction: {
      type: String,
      default: 'rtl'
    },
    drawer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 表名重复校验
    const repeatTableRules = (rule, tableName, callback) => {
      const params = {
        database: this.ruleForm.database,
        engine: '',
        region: this.region,
        catalog: this.catalog,
        tableName
      };
      nameCheck(params)
        .then(res => {
          if (res.data === '0') {
            callback();
          } else if (res.data === '1') {
            callback(new Error('表名重复，请更换'));
          }
        })
        .catch(() => {});
    };
    // 文件必填校验
    const repeatfield = (rule, files, callback) => {
      if (this.ruleForm.field.length <= 0) callback(new Error('请选择上传文件'));
      callback();
    };
    return {
      percentage: 0,
      percentageStatus: 0,
      loading: false,
      running: false,
      cancelFileType: false,
      activeNames: ['1', '2', '3'],
      ruleForm: {
        database: 'temp_database',
        tableName: '',
        lifeCycle: 1,
        comment: '',
        storeFormat: 'csv',
        field: [],
        location: '',
        meta: []
      },
      rules: {
        tableName: [
          { required: true, message: '请输入表名称', trigger: 'blur' },
          { pattern: /^(?!_)[a-zA-Z0-9_]+$/, message: '仅支持英文、数字、以及下划线,不能以下画线开头的格式', trigger: 'blur' }, // let reg = new RegExp('^(?!_)[a-zA-Z0-9_]+$')
          { validator: repeatTableRules, trigger: 'blur' }
        ],
        field: [{ required: true, validator: repeatfield, trigger: 'change' }]
      },
      lifeCycleList: [
        { value: 1, label: '一个月' },
        { value: 3, label: '三个月' },
        { value: 6, label: '六个月' }
      ],
      options: [
        { label: 'string', value: 'string' },
        { label: 'tinyint', value: 'tinyint' },
        { label: 'smallint', value: 'smallint' },
        { label: 'int', value: 'int' },
        { label: 'bigint', value: 'bigint' },
        { label: 'boolean', value: 'boolean' },
        { label: 'float', value: 'float' },
        { label: 'double', value: 'double' },
        { label: 'decimal(20,4)', value: 'decimal(20,4)' }
        // { label: 'array', value: 'array' },
        // { label: 'map', value: 'map' },
        // { label: 'timestamp', value: 'timestamp' },
        // { label: 'date', value: 'date' }
      ]
    };
  },
  computed: {
    ...mapGetters(['engineList', 'regionList', 'region', 'catalog']),
    accept() {
      // return '.xls, .xlsx, .csv';
      return '.csv';
    },
    percentageText() {
      return ['初始化状态', '正在上传', '已取消', '已完成'][this.percentageStatus];
    },
    regionName() {
      if (this.regionList.length > 0) {
        const str = this.regionList.find(item => item.name === this.region)?.name_zh;
        return str;
      }
      return '';
    }
  },
  methods: {
    submit() {
      this.$refs.ruleForm.validate((vali, ruleObj) => {
        const rulesRes = Object.keys(ruleObj).some(key => key.includes('meta'));
        if (rulesRes) {
          this.$message({
            type: 'warning',
            message: '字段名称仅支持英文、数字、以及下划线,不能以下画线开头的格式'
          });
        }
        if (vali) {
          // 已取消文件的处理
          if (this.cancelFileType) {
            this.$message({
              type: 'warning',
              message: '请重新上传文件'
            });
            return;
          }
          this.loading = true;
          const params = {
            engine: '',
            region: this.region,
            catalog: this.catalog,
            database: this.ruleForm.database,
            tableName: this.ruleForm.tableName,
            comment: this.ruleForm.comment,
            location: this.ruleForm.location,
            meta: this.ruleForm.meta
          };
          createTempTable(params)
            .then(res => {
              this.clearDrawer();
              this.loading = false;
              this.$parent.refreshConfig();
              this.$message({
                type: 'success',
                message: `您创建的数据表存储到了"${this.regionName}"区域>temp_database中`
              });
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
    cancelFile() {
      this.cancel && this.cancel();
      this.$message({
        type: 'warning',
        message: '已取消,重新上传文件的话请先删除当前文件',
        duration: 4000
      });
      this.cancelFileType = true;
    },
    fileChange(file, fileList) {
      const self = this;
      const CancelToken = axios.CancelToken;

      const res = this.beforeAvatarUpload(file);
      if (!res) this.ruleForm.field = fileList.splice(fileList.length - 1, 1);
      if (!res) return;
      this.ruleForm.field = fileList;
      this.$refs.ruleForm.validateField('field');
      this.running = true;
      const FormDatas = new FormData();
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data;'
        },
        timeout: 600000,
        cancelToken: new CancelToken(function executor(c) {
          // executor 函数接收一个 cancel 函数作为参数
          self.cancel = c;
        })
      };
      config.onUploadProgress = ProgressEvent => {
        this.onUploadProgress(ProgressEvent);
      };
      const data = {
        lifeCycle: this.ruleForm.lifeCycle,
        engine_key: '',
        region: this.region,
        catalog: this.catalog,
        storeFormat: this.ruleForm.storeFormat,
        file: file.raw
      };
      Object.keys(data).forEach(key => {
        FormDatas.append(key, data[key]);
      });
      uploadFile(FormDatas, config)
        .then(res => {
          this.percentage = 100;
          this.percentageStatus = 3;
          this.ruleForm.meta = res.data.meta;
          this.ruleForm.location = res.data.location;
          this.cancelFileType = false;
        })
        .catch(() => {
          this.percentageStatus = 2;
          this.cancelFileType = true;
        });
    },
    onUploadProgress(ProgressEvent) {
      if (ProgressEvent && ProgressEvent.lengthComputable) {
        const fileSize = Math.round(ProgressEvent.total / 1024 / 1024);
        if (fileSize <= 1) {
          const num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
          this.percentage = num > 99 ? 99 : num;
        } else {
          let num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
          num = Math.round(((51 - fileSize) / 50) * num);
          this.percentage = num > 99 ? 99 : num;
        }
      }
    },
    beforeAvatarUpload(file) {
      this.percentageStatus = 1;
      // const isJPG = file.type === 'text/csv';
      const isLt2M = file.size / 1024 / 1024 < 50;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.warning('上传文件不能超过 50MB!');
      }
      // return isJPG && isLt2M;
      return isLt2M;
    },
    fileExceed(files) {
      this.cancel && this.cancel();
      this.$refs['rebateUpload'].clearFiles(); // 清除文件
      this.ruleForm.meta = [];
      setTimeout(() => {
        this.percentageStatus = 1;
      });
      this.percentage = 0;
      this.$set(this.ruleForm.field[0], 'raw', files[0]);
      this.$set(this.ruleForm.field[0], 'name', files[0].name);
      this.$set(this.ruleForm.field[0], 'size', files[0].size);
      this.$set(this.ruleForm.field[0], 'status', 'ready');
      this.$set(this.ruleForm.field[0], 'percentage', 0);
      this.$set(this.ruleForm.field[0], 'uid', files[0].uid);
      this.$refs['rebateUpload'].handleStart(files[0]); // 选择文件后的赋值方法
      // this.$message({
      //   type: 'warning',
      //   message: '最多上传1个文件'
      // });
    },
    fileRemove(file, fileList) {
      this.cancel && this.cancel();
      this.percentageStatus = 0;
      this.percentage = 0;
      this.running = false;
      this.ruleForm.meta = [];
      this.ruleForm.field = fileList;
      this.$refs.ruleForm.validateField('field');
    },
    handleClose(done) {
      this.clearDrawer();
      done();
    },
    clearDrawer() {
      this.cancel && this.cancel();
      this.percentageStatus = 0;
      this.running = false;
      this.cancelFileType = false;
      this.ruleForm.database = 'temp_database';
      this.ruleForm.tableName = '';
      this.ruleForm.lifeCycle = 1;
      this.ruleForm.storeFormat = 'csv';
      this.ruleForm.comment = '';
      this.ruleForm.field = [];
      this.ruleForm.location = '';
      this.ruleForm.meta = [];
      this.$refs.ruleForm.clearValidate();
      this.$emit('update:drawer', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.tableContext {
  .el-drawer__wrapper {
    ::v-deep .el-drawer__header {
      margin-bottom: 0px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e9f3;
    }
  }
  .main {
    height: calc(100% - 45px);
    padding: 0 25px;
    overflow-y: auto;
    .btnClass {
      text-align: end;
      margin-top: 20px;
    }
    .el-form {
      ::v-deep .el-form-item--small {
        margin-bottom: 14px;
      }
      ::v-deep .el-input {
        .el-input__inner {
          height: 24px;
          line-height: 24px;
        }
      }
      .upload {
        position: relative;
        .cancel {
          position: absolute;
          top: 4px;
          left: 80px;
        }
        .el-upload__tip {
          color: #909399;
          margin: 0;
        }
        ::v-deep .el-upload-list {
          .el-icon-close {
            display: block;
          }
          .el-list-leave-active {
            transition: all 0s !important;
          }
        }
      }
    }
    .el-drawer {
      ::v-deep .el-drawer__header {
        margin-bottom: 10px;
      }
    }
    .collapse {
      position: relative;
      .tipsClass {
        position: absolute;
        top: 30px;
        left: 0;
      }
    }
    .el-table {
      border-right: 1px solid#e2e9f3;
      ::v-deep .el-form-item--small {
        margin-bottom: 0;
        .el-form-item__content {
          margin-left: 0 !important;
        }
      }
      ::v-deep .el-table__cell {
        padding: 2px 0px;
      }
      ::v-deep .el-input--small .el-input__icon {
        line-height: 24px;
      }
      // ::v-deep th{
      //   border-right: 1px solid #e2e9f3 !important;
      //   // border-top: none !important;
      // }
      // ::v-deep .el-table__row td {
      //   border-right: 1px solid #e2e9f3 !important;
      // }
    }
    .el-collapse {
      border-top: none;
      padding-top: 10px;
      .el-collapse-item {
        ::v-deep .el-collapse-item__wrap {
          border-bottom: none;
        }
        ::v-deep .el-collapse-item__content {
          padding-bottom: 0px;
          padding-top: 20px;
        }
        ::v-deep .el-collapse-item__header {
          border-bottom: none;
          height: 38px;
          line-height: 38px;
        }
        &:first-child {
          ::v-deep .el-collapse-item__content {
            padding-top: 0px;
          }
        }
      }
    }
  }
  .tipsClass {
    color: #909399;
    font-size: $global-font-size-12;
    margin: 0;
    padding: 0;
    margin-bottom: 5px;
  }
  .line {
    display: inline-block;
    width: 80%;
    height: 1px;
    background: #e1e5ef;
    margin: 0 auto;
  }
  ::v-deep .el-loading-mask {
    left: calc(100% - 650px);
    background-color: rgba(2555, 255, 255, 0.6);
    .el-loading-text {
      font-size: $global-font-size-14;
    }
    i {
      font-size: $global-font-size-18;
    }
  }
}
</style>
