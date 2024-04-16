<template>
  <el-tabs class="form-left">
    <el-tab-pane label="选择来源">
      <el-form-item label="数据源名称" prop="sourceId" class="quick-item">
        <el-select v-model="configForm.sourceId" placeholder="数据源名称" filterable clearable>
          <el-option v-for="item in dataSourceList" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
        </el-select>
        <div class="quick-action">
          <el-button type="text" class="btn-text" size="mini" @click="$router.push({ name: 'sourceInstance' })">新建数据源</el-button>
        </div>
        <!-- File2Lakehouse模版的icon提示 -->
        <i v-if="templateCode === 'File2Lakehouse'" class="el-icon-info path-info" @click="infoVisible = !infoVisible"></i>
      </el-form-item>
      <vue-form v-model="configForm.sourceParam" v-loading="loading" :schema="schema" :form-props="formProps" class="vue-form">
        <div slot-scope="{ formData, formRefFn }" style="margin-left: 180px; margin-top: -6px">
          <el-button v-if="Object.keys(schema).length" type="text" size="mini" @click="getField(formData, formRefFn)">获取源表字段</el-button>
        </div>
      </vue-form>
    </el-tab-pane>
    <el-info v-model="infoVisible" title="文件路径">
      <div>对于要同步的文件路径可以是目录或文件：</div>
      <div>1）同步一个目录：</div>
      <div>
        如果这个目录是动态的，则在指定目录时可使用包含jinjia表达式的动态表达式，例如“s3://桶/路径/dt={ (execution_date-macros.timedelta(days=2)).strftime('%Y%m%d')}/”（末尾别忘了加上"/"）；同时，也可以在jinjia表达式的基础上，在目录/文件的路径中包含通配符，例如：s3://桶/路径/country=*/{
        (execution_date-macros.timedelta(days=1)).strftime('%Y%m%d')}.csv；
      </div>
      <div>如果这个目录是静态的，则直接指定具体目录，如："s3://桶/路径/xxxx/"，按周期全量同步该静态目录下的全部文件；</div>
      <div>2）同步一个文件：</div>
      <div>如果是需要周期同步一个动态文件，则可以指定一个包含jinjia表达式的文件路径，例如，“s3://桶/路径/xx_{execution_date}.csv”；</div>
      <div>如果是需要周期同步一个静态文件(文件名不变，文件内容可能变化)，则可以指定一个具体的文件路径，例如：“s3://桶/路径/xxxx.csv”；</div>
      <div>注：其他文件格式亦同；</div>
      <div>支持的常见通配符如下：</div>
      <img src="@/assets/path_info.png" width="100%" />
    </el-info>
  </el-tabs>
</template>
<script>
import VueForm from '@lljj/vue-json-schema-form';
import { getDataSetList, getTemplate } from '@/api/task';

export default {
  name: 'FormLeft',
  components: {
    VueForm
  },
  props: {
    configForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    templateCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataSourceList: [],
      loading: false,
      schema: {},
      formProps: { labelPosition: 'right', labelWidth: '180px', labelSuffix: ' ' },
      infoVisible: false
    };
  },
  watch: {
    'configForm.sourceType'(value) {
      this.changeType(value);
    },
    'configForm.sourceId'(val) {
      if (val) {
        this.dataSourceList.forEach(item => {
          if (item.actorId === val) {
            this.configForm.userGroupName = item.userGroupName;
            this.getLocation();
          }
        });
      }
    }
  },
  methods: {
    changeType(value) {
      if (value) {
        this.getSourceList(value);
        this.getSchema(value);
      } else {
        this.dataSourceList = [];
        this.schema = {};
      }
    },
    getLocation() {
      let partationStr = '';
      this.configForm.partitions.map(item => {
        if (item.name) {
          partationStr += item.name + '=' + item.value + '/';
        }
      });
      partationStr = partationStr.substring(0, partationStr.length - 1);
      this.configForm.taskParam.location = `/stage/${this.configForm.userGroupName}/${this.configForm.targetTable}/${partationStr}`;
    },
    getSourceList(sourceType) {
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: sourceType,
        metaFlag: 'AIRBYTE',
        templateCode: this.templateCode
      }).then(res => {
        const data = res.data;
        this.dataSourceList = data.data;
      });
    },
    getSchema(sourceType) {
      this.loading = true;
      getTemplate({
        modelName: sourceType,
        modelType: 'model'
      })
        .then(res => {
          const data = res.data;
          if (data) {
            const dataObj = JSON.parse(data);
            this.schema = dataObj || {};
          } else {
            this.schema = {};
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getField(formData, formRefFn) {
      const formObj = formRefFn();
      formObj.validate(valid => {
        if (valid) {
          this.$emit('get-columns');
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.form-left {
  .el-select,
  .el-input {
    width: 100%;
  }
  .quick-item {
    margin-bottom: 30px;
    .quick-action {
      position: absolute;
      right: 0;
    }
  }
  .path-info {
    position: absolute;
    left: -95px;
    bottom: -103px;
    cursor: pointer;
  }
  .vue-form {
    width: 83%;
    ::v-deep .el-form-item {
      width: 100% !important;
    }
    ::v-deep .el-select,
    .el-input {
      width: 100%;
    }
    ::v-deep .appendCombining_box {
      padding: 0;
      background: #fff;
      box-shadow: none;
      margin-bottom: 0;
      ::v-deep .el-form-item {
        width: 100%;
      }
    }
  }
}
</style>
