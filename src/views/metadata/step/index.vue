<template>
  <el-card class="box-card-container step">
    <div class="step-out clearfix">
      <sql-box label="SQL" :required="true" name="tableSchema" @check="check" @format="format" @clear="clear">
        <monaco-editor ref="tableSchema" v-model="tableSchema" v-loading="sqlCheckLoading" class="content"></monaco-editor>
      </sql-box>
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" :class="['ruleForm', 'step-form', 'step-content-form']" label-width="120px">
        <!-- <el-form-item label="创建区域" prop="region">
          <el-select v-model="ruleForm.region" placeholder="请选择创建区域" clearable @change="getDbList">
            <el-option v-for="item in regionList" :key="item.value" :disabled="item.value === 'sg1'" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="TableFormat" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择TableFormat" clearable disabled>
            <el-option label="Hive" value="hive"></el-option>
            <el-option label="iceberg" value="iceberg" disabled></el-option>
            <el-option label="clickhouse" value="clickhouse" disabled></el-option>
            <el-option label="mysql" value="mysql" disabled></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择库" prop="dbName">
          <el-select v-model="ruleForm.dbName" placeholder="请选择库" filterable clearable @visible-change="handleFocus">
            <el-option v-for="item in dbList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
          <div v-if="isAddDB" class="marks">没找到您想要的数据库？<el-button :loading="createLoading" type="text" @click="create">去创建</el-button></div>
        </el-form-item>
        <el-form-item label="表名(英文)" prop="name">
          <el-input v-model="ruleForm.name" placeholder="表名支持有英文小写、下划线、数字，不允许数字作为表名开头" clearable @focus="handleFocus" @blur="handleBlur"></el-input>
        </el-form-item>
        <!-- <el-form-item label="别名">
          <el-input v-model="ruleForm.cnName" placeholder="业务描述（事实）-使用中文填写" clearable></el-input>
        </el-form-item> -->
        <el-form-item label="安全级别:">
          <el-select v-model="ruleForm.securityLevel" placeholder="请选择安全级别" clearable filterable>
            <el-option v-for="item in securityLevelList" :key="item" :value="item" :label="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="ruleForm.description" type="textarea" placeholder="不允许使用英文分号 (;)，英文冒号 (:)" clearable></el-input>
        </el-form-item>
        <!-- <el-form-item label="Location" prop="location">
          <el-input v-model="ruleForm.location" type="textarea" placeholder="可通过区域、库、表名请求推荐Location或者自输" clearable></el-input>
          <el-button v-if="!isCloud" type="primary" @click="handleLocation">生成</el-button>
        </el-form-item> -->
        <!-- <el-form-item label="数据归集业务组:">
          <el-select v-model="ruleForm.subject" placeholder="请输入数据归集业务组" clearable filterable>
            <el-option v-for="item in groupOptions" :key="item.id" :value="item.uuid" :label="item.name"> </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item v-if="ruleForm.sdFileFormat === 'textfile'" label="分隔符">
          <el-input v-model="ruleForm.fileDelimiter" placeholder="请输入分隔符"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <div class="tagList">
            <div class="labels_box">
              <div v-for="(item, index) in ruleForm.listTag" :key="index" class="labels_item">
                <div class="box">
                  <el-input v-model="item.name" placeholder="请输入标签" clearable></el-input>
                </div>
                <i class="el-icon-circle-close" @click="setLabels('sub', index)"></i>
              </div>
            </div>
            <el-button type="text" icon="el-icon-plus" @click="setLabels('add')">新建标签</el-button>
          </div>
        </el-form-item>
        <!-- <el-form-item label="授权对象" prop="showObj">
          <div class="form_item">
            <el-select v-model="effectScope" placeholder="选择生效范围" style="width: 100px" @change="handleScope">
              <el-option v-for="(item, index) in scopeList" :key="index" :label="item.name" :value="item.value"></el-option>
            </el-select>

            <el-select
              v-if="effectScope === 1"
              v-model="scopes"
              placeholder="请输入用户ID, 最多20个"
              clearable
              filterable
              multiple
              remote
              :remote-method="remoteMethod"
              :loading="ownerLoading"
popper-class="custom-popper"
              style="width: 65%; margin-left: 20px"
            >
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
                <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.deptFullPath }}</div>
              </el-option>
            </el-select>
            <el-select v-if="effectScope === 2" v-model="scopes" placeholder="请选择用户组" style="width: 74%; margin-left: 20px" multiple clearable>
              <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.uuid"></el-option>
            </el-select>
            <el-button class="form_btn" type="text" @click="$router.push('/jurisdiction/dataRole')">数据角色</el-button>
          </div>
        </el-form-item>
        <el-form-item label="授权信息">
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
          <el-checkbox-group v-model="checkedOpes" class="checkbox-group" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="item in permissions" :key="item" :label="item">{{ item }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="权限保留周期">
          <el-radio-group v-model="cycle">
            <el-radio v-for="(item, index) in cycleList" :key="index" :label="item.value">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item> -->
      </el-form>
    </div>
    <div class="step-btns">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" :loading="btnDisabled" :disabled="btnDisabled" @click="nextStep">完成</el-button>
    </div>
    <create-db ref="createDb" :region-list="regionList" @addDbOk="getDbList"></create-db>
  </el-card>
</template>
<script>
import SqlBox from './components/SqlBox';
import CreateDb from './components/CreateDb';
import MonacoEditor from '@/components/MonacoEditor/index';
import { resourceSearch } from '@/api/cluster';
import { getDbList, checkSql, addTable, dict, route, checkCreate, doAuth, batchGrantPrivilegeToUser } from '@/api/metadata';
import { getUserList } from '@/api/task';
import { getGroupPage } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';

const validateName = (rule, value, callback) => {
  const reg = /^(_?[a-z])([a-z0-9]|_[a-z0-9]_?)*$/;
  if (!reg.test(value)) {
    callback(new Error('表名支持有英文小写、下划线、数字，不允许数字作为表名开头'));
  } else {
    callback();
  }
};

function setSchema(dbName, tableName) {
  return `
-- CREATE TABLE TEMPLATE
-- 左侧必填：创建区域、数据源类型、库名、表名、location
-- SQL窗口定义schema和分区即可，选填：字段 COMMENT 注释，表  COMMENT 注释
-- location 自定义示例："s3://bucket/../databaseName/tableName"
-- 由于增加了库名、表名自动匹配功能，因此建议您完成SQL语句的填写，再校验右侧库、表名称是否正确
CREATE TABLE IF NOT EXISTS ${dbName || 'dbname'}.${tableName || 'tablename'} (
  id string COMMENT 'ID' ,
  name string COMMENT '名称'
)
row format delimited
fields terminated by '\/t'
STORED AS orc
    `;
}

export default {
  components: {
    // StepsHead,
    SqlBox,
    CreateDb,
    MonacoEditor
  },
  data() {
    return {
      cycleList: this.$t('data.cycle'),
      cycle: '5',
      effectScope: 2,
      scopes: [],
      ownerList: [],
      groupOptions: [],
      scopeList: [
        // {
        //   name: '个人',
        //   value: 1
        // },
        {
          name: '用户组',
          value: 2
        }
      ],
      ownerLoading: false,
      checkedOpes: [],
      permissions: ['查询数据', '修改表', '删除表', '描述表', '插入数据'],
      securityLevelList: ['一级', '二级', '三级', '四级'],
      checkAll: false,
      isIndeterminate: true,
      createLoading: false,
      isManualAction: false,
      commentRegexp: /\/\*.*?\*\/|--.*?\n/gs,
      codeRegexp: /create\s+(?:temporary\s)?\s*(?:external\s)?\s*table\s+(?:if\s)?\s*(?:not\s)?\s*(?:exists\s)?\s*(`?[a-zA-Z_0-9]+)`?\.?(`?([a-zA-Z_0-9]+)`?)?\s*\(/i,
      nameRegexp: /(`?[a-zA-Z_0-9]+)`?\.?(`?([a-zA-Z_0-9]+)`?)?\s*\(/,
      dbNamePattern: '$dbname',
      tableNamePattern: '$tablename',
      sqlCheckLoading: false,
      fileFormatTip: `
        parquet的压缩比率较高，分区过滤和列修建可以帮助我们大幅节省磁盘IO，减轻对服务器的压力。如果您的数据字段较多，但实际应用中读取其中部分字段，parquet将是一个非常好的选择。为了提升部门数据效率、降低数据成本，本平台建议您使用parquet文件类型进行建表。
      `,
      ruleForm: {
        region: 'ue1',
        type: 'hive',
        dbName: 'dbname',
        subject: '',
        updateType: '',
        interval: '',
        // cnName: '',
        name: 'tablename',
        description: '',
        // location: '',
        sdFileFormat: 'parquet',
        fileDelimiter: '',
        lifecycle: 30,
        hierarchical: '',
        department: '',
        pu: '',
        application: '',
        listTag: [
          {
            name: ''
          }
        ],
        securityLevel: '',
        userGroupUUid: ''
      },
      rules: {
        region: [{ required: true, message: '请选择创建区域', trigger: ['blur', 'change'] }],
        type: [{ required: true, message: '请选择数据源类型', trigger: ['blur', 'change'] }],
        dbName: [{ required: true, message: '请选择库', trigger: ['blur', 'change'] }],
        // location: [{ required: true, message: '请输入 Location', trigger: ['blur', 'change'] }],
        sdFileFormat: [{ required: true, message: '请选择sdFileFormat', trigger: ['blur', 'change'] }],
        updateType: [{ required: true, message: '请选择表类型', trigger: ['blur', 'change'] }],
        interval: [{ required: true, message: '请选择更新频次', trigger: ['blur', 'change'] }],
        name: [
          { required: true, message: '请输入英文名' },
          { validator: validateName, trigger: ['blur', 'change'] }
        ]
      },
      regionList: [
        { label: 'AWS 美东', value: 'ue1' },
        { label: 'AWS 新加坡', value: 'sg1' },
        { label: '华为 新加坡', value: 'sg2' }
      ],
      dbList: [{ id: 1, name: 'sdk_ddl_my_database' }],
      sdFileFormatList: [],
      updateTypeList: [],
      frequencyList: [],
      hierarchypeList: [],
      departmentList: [],
      puList: [],
      appTip: '指表的生产方，即归属于哪个应用，不代表使用方',
      applicationList: [
        { value: 'SHAREIT_A' },
        { value: 'SHAREIT_I' },
        { value: 'SHAREK' },
        { value: 'SLITE_A' },
        { value: 'FUNU' },
        { value: 'LAKI' },
        { value: 'WATCHIT' },
        { value: 'LIKEIT' },
        { value: 'BUZZNEWS' },
        { value: 'STAR_LIVE' },
        { value: 'LIKEIT_L' },
        { value: 'GAMESHARE_A' },
        { value: 'MAXPLAYER_A' },
        { value: 'PLAYIT_A' },
        { value: 'SHAREIT_W' },
        { value: 'GAMESHARE_B' },
        { value: 'MAXFILE_A' },
        { value: 'WALL_PAP' },
        { value: 'NEWS_BEES' }
      ],
      tableSchema: setSchema(),
      codes: setSchema('$dbname', '$tablename'),
      btnDisabled: false
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud', 'currentUserGroup']),
    isAddDB() {
      return ['dpm'].includes(this.currentUserGroup.name);
    }
  },
  watch: {
    'ruleForm.dbName'(newVal, oldVal) {
      if (!newVal) {
        if (oldVal === 'dbname') return;
        // this.isManualAction = true;
        return;
      }
      if (newVal !== oldVal && this.isManualAction) {
        this.$refs['tableSchema'].setCode(this.codes.replace(this.dbNamePattern, newVal).replace(this.tableNamePattern, this.ruleForm.name));
        this.isManualAction = false;
      }
    },
    'ruleForm.name'(newVal, oldVal) {
      if (!newVal) {
        if (oldVal === 'tablename') return;
        this.isManualAction = true;
      }
      if (newVal !== oldVal && this.isManualAction) {
        this.$refs['tableSchema'].setCode(this.codes.replace(this.dbNamePattern, this.ruleForm.dbName).replace(this.tableNamePattern, newVal));
      }
    },
    tableSchema(newVal, oldVal) {
      if (newVal !== oldVal && !this.isManualAction) {
        const codes = newVal;
        // 删除注释
        const result = codes.match(this.codeRegexp);
        if (result && result.length >= 3) {
          const subResult = result[0].match(this.nameRegexp);
          if (subResult && subResult.length) {
            const left = codes.slice(0, result.index + subResult.index);
            const right = codes.slice(result.index + subResult.index + subResult[0].length - 1);
            this.codes = left + this.dbNamePattern + '.' + this.tableNamePattern + right;
          }

          if (result[2]) {
            this.ruleForm.dbName = result[1];
            this.ruleForm.name = result[2];
          } else {
            this.ruleForm.dbName = '';
            this.ruleForm.name = result[1];
          }
        }

        if (!newVal) {
          this.codes = newVal || '';
        }
      }
    }
  },
  created() {
    this.init();
    this.getGroupPage();

    // 用户组的默认数据库
    if (this.currentUserGroup?.defaultHiveDbName) {
      this.ruleForm.dbName = this.currentUserGroup.defaultHiveDbName;
    }
    if (this.$route.query.dbName) {
      this.ruleForm.dbName = this.$route.query.dbName;
      this.isManualAction = true;
    }
  },
  methods: {
    handleScope(val) {
      this.scopes = [];
    },
    remoteMethod(query, shareId) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    getGroupPage() {
      const params = {
        userId: this.userInfo.userId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.permissions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length;
    },
    handleCheckAllChange(val) {
      this.checkedOpes = val ? this.permissions : [];
      this.isIndeterminate = false;
    },
    setLabels(type, index) {
      if (type === 'add') {
        this.ruleForm.listTag.push({
          name: ''
        });
      } else {
        this.ruleForm.listTag.splice(index, 1);
      }
    },
    handleFocus(bl) {
      if (bl) this.isManualAction = true;
    },
    handleBlur(e) {
      this.isManualAction = false;
    },
    init() {
      if (!this.isCloud) {
        this.getDbList();
      }
      this.getFileFormatList();
      if (this.isCloud) {
        this.dbList = [];
        this.getRegion();
      }
    },
    getRegion() {
      resourceSearch().then(res => {
        const data = res.data;
        this.regionList = data.list.map(item => {
          return { label: item.description || item.regionAlias, value: item.regionAlias };
        });
        if (this.regionList.length) {
          const selectRegion = this.$route.query.region || 'ue1';
          this.ruleForm.region = this.regionList.find(item => item.value === selectRegion)?.value || this.regionList[0].value;
          this.getDbList();
        } else {
          this.ruleForm.region = '';
        }
      });
    },
    getDbList() {
      this.dbList = [];
      getDbList({
        region: this.ruleForm.region
      }).then(res => {
        const data = res.data;
        if (data) {
          this.dbList = data;
        } else {
          this.dbList = [];
        }
      });
    },
    getFileFormatList() {
      const params = {
        dictType: 'SD_FileFormat'
      };
      dict(params).then(res => {
        const data = res.data;
        this.sdFileFormatList = data;
      });
    },
    handleLocation(val) {
      const params = {
        owner: this.userInfo.userId,
        region: this.ruleForm.region,
        dbName: this.ruleForm.dbName,
        tableName: this.ruleForm.name
      };
      const index = Object.values(params).findIndex(e => !e);

      if (index !== -1) {
        this.$message({
          type: 'warning',
          message: '区域、数据库、表名不为空以请求Location'
        });
        return;
      }
      route(params).then(res => {
        const data = res.data;
        this.ruleForm.location = data.path;
      });
    },
    create() {
      if (this.ruleForm.region) {
        const params = {
          catalogName: this.ruleForm.region || '',
          operation: 'CREATE_DATABASE',
          projectId: this.userInfo.tenantName,
          qualifiedName: `${this.ruleForm.region}`,
          region: this.ruleForm.region
        };
        this.createLoading = true;
        doAuth(params).then(res => {
          this.createLoading = false;
          const data = res.data;
          if (!data) {
            this.$message({
              type: 'warning',
              message: '您暂无权限，请联系管理员申请权限'
            });
            return;
          }
          this.$refs.createDb.showWin(this.ruleForm.region);
        });
      } else {
        this.$message({
          type: 'warning',
          message: '请先选择创建区域'
        });
      }
    },
    check(name) {
      if (this[name]) {
        this.sqlCheckLoading = true;
        checkSql({
          region: this.ruleForm.region,
          sql: window.btoa(encodeURIComponent(this.tableSchema))
        })
          .then(res => {
            this.sqlCheckLoading = false;
            this.$message({
              type: 'success',
              message: '校验通过'
            });
          })
          .finally(() => {
            this.sqlCheckLoading = false;
          });
      } else {
        this.$message({
          type: 'warning',
          message: '请先输入SQL'
        });
      }
    },
    format(name) {
      this.$refs[name].formatSql();
    },
    clear(name) {
      this.$refs[name].setCode('');
    },
    cancel() {
      this.$router.push({ name: 'MetaData' });
    },
    querySearch(queryString, cb) {
      var restaurants = this.applicationList;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return restaurant => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    nextStep() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;

          if (!this.tableSchema) {
            this.$message.error('请输入SQL');
            this.btnDisabled = false;
            return;
          }
          if (this.dbList.length && !this.dbList.includes(this.ruleForm.dbName)) {
            this.$message.warning('请选择正确的数据库');
            this.btnDisabled = false;
            return;
          }
          // 先校验下有无创建表的权限
          checkCreate({
            ...this.ruleForm,
            owner: this.userInfo.userId,
            sql: window.btoa(encodeURIComponent(this.tableSchema))
          })
            .then(res => {
              const data = res.data;
              if (!data) {
                this.btnDisabled = false;
                return;
              }

              const params = {
                ...this.ruleForm,
                owner: this.userInfo.userId,
                region: this.ruleForm.region,
                sql: window.btoa(encodeURIComponent(this.tableSchema)),
                userGroupUUid: this.ruleForm.subject ? this.ruleForm.subject : this.currentUserGroup.uuid
              };
              addTable({ ...params })
                .then(res => {
                  if (res.code === 0) {
                    const data = res.data;
                    // 授权
                    // this.handelAuthorized();
                    this.$router.push({
                      name: 'MetaDataDetail',
                      query: {
                        id: data.id,
                        region: data.region,
                        databaseName: data.dbName,
                        tableName: data.name
                      }
                    });
                  }
                })
                .finally(() => {
                  this.btnDisabled = false;
                });
            })
            .catch(() => {
              this.btnDisabled = false;
            });
        }
      });
    },
    handelAuthorized() {
      if (this.scopes.length) {
        // if (!this.checkedOpes.length) {
        //   this.$message({
        //     type: 'warning',
        //     message: '数据表已创建,但是没有选择授权信息,'
        //   });
        //   return;
        // }

        const params = {
          owner: this.userInfo.userId,
          type: this.effectScope,
          flag: 1,
          cycle: this.cycle,
          roleInputs: {
            objectName: [`${this.ruleForm.region}.${this.ruleForm.dbName}.${this.ruleForm.name}`],
            scope: this.scopes,
            operation: this.checkedOpes
          }
        };
        batchGrantPrivilegeToUser(params).then(res => {});
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step {
  // min-height: calc(100vh - 70px);
  ::v-deep .steps-head {
    width: 40%;
    margin: 0 auto;
  }
  .step-out {
    // margin-top: 20px;
  }

  .step-form {
    width: 35%;
    margin: 0 auto;
    &.step-content-form {
      float: left;
      width: 32%;
      ::v-deep .el-select {
        width: 100%;
      }
    }
    ::v-deep .el-select {
      width: 90%;
    }
    .form_item {
      display: flex;
      align-items: center;
      .form_btn {
        margin-left: 10px;
      }
    }
    .el-radio-group,
    .el-checkbox-group {
      display: inline-flex;
      align-items: center;
      &.checkbox-group {
        padding-left: 20px;
      }
      label {
        margin-right: 20px !important;
        height: 26px;
        line-height: 26px;
        padding: 0;
      }
    }
    .tagList {
      .labels_box {
        .labels_item {
          display: flex;
          align-items: center;
          &:not(:last-child) {
            margin-bottom: 10px;
          }
          .box {
            width: 100%;
          }
          i {
            padding: 5px 0 5px 10px;
            font-size: $global-font-size-18;
            cursor: pointer;
            color: #e47470;
          }
        }
      }
    }
  }
  ::v-deep .sql-box {
    width: 65%;
    margin-right: 3%;
    float: left;
    overflow: hidden;

    .sql-tip {
      position: absolute;
      top: -18px;
      font-size: $global-font-size-12;
      color: #e6a23c;
      left: 60px;
    }

    .sql-box-content {
      height: calc(100vh - 286px);
    }

    @media (max-width: 1600px) {
      .sql-box-content {
        height: calc(100vh - 290px);
      }
    }
  }
  .step-btns {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .marks {
    font-size: $global-font-size-12;
    color: #888;
  }
}
</style>
