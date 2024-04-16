<template>
  <div class="left-box">
    <span class="source-img">
      <img :src="configForm.sourceIcon" alt="" />
    </span>
    <el-tabs class="form-left">
      <el-tab-pane :label="$lang('选择来源')">
        <el-form-item label="来源数据源" prop="dataOriginType">
          <el-select v-model="configForm.sourceType" class="area-select" :placeholder="$t('task.dbTip3')" clearable @change="changeSourceType">
            <el-option v-for="item in dataOriginList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$lang('数据源名称')" prop="sourceId" class="quick-item">
          <el-select v-model="configForm.sourceId" filterable clearable @change="changeSourceName">
            <el-option v-for="item in dataSourceList" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
          </el-select>
          <div class="quick-action table-tips live-btn">
            <el-button type="text" class="btn-text" size="mini" @click="$router.push({ name: 'sourceInstance' })">{{ $lang('新建数据源') }}</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$lang('库名')" prop="sourceDb">
          <el-input v-model="configForm.sourceDb" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item prop="tableParams.sourceTable" class="quick-item">
          <template #label>
            <span>{{ $lang('表名') }}</span>
            <i v-if="isLiveTable" class="el-icon-info" style="cursor: pointer" @click="handelInfo('liveTable', $lang('参数提示'))"></i>
          </template>
          <div class="table-box">
            <el-select v-if="!isLiveTable" v-model="configForm.tableParams.sourceTable" placeholder="选择表名称" clearable filterable @change="changeSourceTable">
              <el-option v-for="item in sourceTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
            </el-select>
            <el-input v-else v-model="configForm.tableParams.sourceTable" :placeholder="liveIpt" @blur="changeLiveTable"></el-input>
            <!-- <span>
              <span v-if="!isLiveTable" type="text" class="tips live-btn" @click="switchLiveTable()">输入动态表名</span>
              <span v-else>
                <el-button type="text" class="tips live-btn" @click="switchLiveTable()">选择已有表</el-button>
              </span>
            </span> -->
          </div>
          <span>
            <div v-if="!isLiveTable" class="quick-action table-tips live-btn btn-preview">
              <!-- <el-button type="text" class="btn-text" size="mini" @click="getPreviewData()">{{ $lang('数据预览') }}</el-button> -->
              <span>
                <img src="@/assets/preview_icon.png" alt="" @click="getPreviewData()" />
              </span>
            </div>
          </span>
        </el-form-item>
        <el-form-item v-if="configForm.sourceType !== 'mongodb'" :label="$lang('分片组件')" class="quick-item">
          <el-select v-model="configForm.splitPk" filterable clearable>
            <el-option v-for="item in selfParams.splitPkList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$lang('过滤条件')" prop="filterStr">
          <el-input v-model="configForm.tableParams.filterStr" placeholder="例如：column1='china' and column2>'yesterday_date'" type="textarea"></el-input>
          <span class="tips" @click="handelInfo('jinjia', $lang('参数提示'))">{{ $lang('参数提示') }}</span>
        </el-form-item>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="previewVisible" :append-to-body="true">
      <div slot="title">
        {{ previewTable }}{{ $lang('数据预览') }} <span class="preview-tip">{{ $lang('只显示limit 5的信息') }}</span>
      </div>
      <div v-loading="previewLoading">
        <el-table v-if="previewData.length && configForm.sourceType !== 'mongodb'" :data="previewData">
          <el-table-column v-for="(item, index) in Object.keys(previewData[0])" :key="index" :property="item" :label="item" min-width="150px" show-overflow-tooltip>
            <template slot="header">
              <el-tooltip effect="dark" :content="item" class="preview-header" placement="top">
                <span> {{ item }} </span>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row[item]" class="preview-table" placement="top">
                <span> {{ scope.row[item] }} </span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div v-else style="text-align: center">暂无预览数据</div>
        <div v-if="configForm.sourceType === 'mongodb'">{{ previewSql }}</div>
      </div>
    </el-dialog>
    <el-info v-model="infoObj.type" :title="infoObj.title">
      <sql-tips v-if="infoObj.msgType === 'jinjia'"></sql-tips>
      <origin-table-tips v-if="infoObj.msgType === 'originTable'"></origin-table-tips>
      <live-table-tips v-if="infoObj.msgType === 'liveTable'"></live-table-tips>
    </el-info>
  </div>
</template>
<script>
import EllipsisTooltip from '@/components/EllipsisTooltip';
import SqlTips from './SqlTips';
import { getDataSetList, getPreviewData, getLiveTable } from '@/api/task';

export default {
  name: 'FormLeft1',
  components: {
    EllipsisTooltip,
    SqlTips
  },
  props: {
    configForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    selfParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    tableObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      dataOriginList: [{ label: 'Oracle', value: 'oracle' }],
      dataSourceList: [],
      sourceTableList: [],
      isLiveTable: false,
      previewTable: '',
      previewVisible: false,
      previewLoading: false,
      previewData: [],
      previewSql: ''
    };
  },
  watch: {
    'configForm.sourceRegion'(val) {
      // 清空选项
      this.configForm.sourceId = '';
      this.changeSourceName();
    },
    'configForm.sourceId'(val) {
      if (val) {
        this.dataSourceList.forEach(item => {
          if (item.actorId === val) {
            this.configForm.userGroupName = item.userGroupName;
            this.configForm.sourceName = item.name;
            this.$emit('getLocation');
          }
        });
      }
    }
  },
  created() {
    if (this.selfParams.isEdit) {
      this.$nextTick(() => {
        this.changeSourceName(this.configForm.sourceId);
      });
    }
  },
  methods: {
    changeSourceType() {
      this.getSourceList();
    },
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.msgType = msgType;
      this.infoObj.title = title;
    },
    addPartitions() {
      this.configForm.sourcePartitionsArr.push({ value: '', name: '' });
    },
    deletePartitions(index) {
      this.configForm.sourcePartitionsArr.splice(index, 1);
    },
    switchLiveTable() {
      this.isLiveTable = !this.isLiveTable;
      this.configForm.tableParams.sourceTable = '';
    },
    async changeLiveTable() {
      getLiveTable({ content: this.configForm.tableParams.sourceTable }).then(res => {
        if (this.configForm.sourceId) {
          this.changeSourceTable(res.data).then(data => {
            if (!data.length) {
              this.$message({
                type: 'warning',
                message: '未能获取到该动态表的schema信息，可能导致任务读数失败，请检查"MySQL表名"输入项。'
              });
            }
          });
        }
      });
    },
    getSourceList() {
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: this.configForm.sourceType,
        metaFlag: 'AIRBYTE',
        templateCode: this.configForm.templateCode
      }).then(res => {
        const data = res.data;
        this.dataSourceList = data.data;
        if (this.selfParams.isEdit) {
          const findItem = this.dataSourceList.find(item => item.actorId === this.configForm.sourceId);
          if (!findItem && this.configForm.sourceName) {
            this.dataSourceList.push({
              actorId: this.configForm.sourceId,
              name: this.configForm.sourceName
            });
          }
        }
      });
    },
    changeSourceName(value) {
      if (!this.selfParams.isEdit) {
        this.configForm.sourceDb = '';
        this.configForm.tableParams.sourceTable = '';
        this.configForm.splitPk = '';
        this.$emit('getLeftColumns', 'clearLeftColumns');
      }
      if (value) {
        const currentObj = this.dataSourceList.find(item => item.actorId === value);
        if (currentObj) {
          this.configForm.sourceDb = currentObj.db;
        }
        this.sourceTableList = [];
        getDataSetList({
          region: this.configForm.sourceRegion,
          type: this.configForm.sourceType,
          actorId: this.configForm.sourceId,
          db: this.configForm.sourceDb,
          metaFlag: 'AIRBYTE',
          templateCode: 'Mysql2Hive'
        }).then(res => {
          const data = res.data;
          this.sourceTableList = data.data;
        });
      }
    },
    getPreviewData() {
      this.previewData = [];
      this.previewSql = '';
      this.previewVisible = true;
      this.previewLoading = true;
      getPreviewData({
        type: this.configForm.sourceType,
        metaFlag: 'AIRBYTE',
        templateCode: 'Mysql2Hive',
        region: this.configForm.sourceRegion,
        actorId: this.configForm.sourceId,
        db: this.configForm.sourceDb,
        table: this.configForm.tableParams.sourceTable
      }).then(async res => {
        this.previewTable = this.configForm.tableParams.sourceTable;
        this.previewLoading = false;
        res.data.results.map(item1 => {
          // 兼容有时后端返回字段为大写的情况
          for (const key in item1) {
            item1[key.toLowerCase()] = item1[key];
          }
          const previewItem = {};
          this.tableObj.leftColumns.map(item2 => {
            previewItem[item2.name] = item1[item2.name];
          });
          this.previewData.push(previewItem);
        });
        this.previewSql = JSON.stringify(res.data.results, null, 2);
      });
    },
    async changeSourceTable() {
      this.$emit('getLeftColumns');
    }
  }
};
</script>
<style lang="scss" scoped>
.left-box {
  position: relative;
  .source-img {
    position: absolute;
    left: 65px;
    top: 6px;
    img {
      width: 25px;
    }
  }
}
.form-left {
  .el-select,
  .el-input {
    width: 100%;
  }
  .quick-item {
    position: relative;
    .quick-action {
      position: absolute;
      right: -5px;
    }
  }
  .partitions_item {
    position: relative;
    display: flex;
    align-items: center;
    .name {
      max-width: 100px;
    }
    .value {
      flex: 1;
    }
    .mark {
      margin: 0 10px;
    }
    .onlyAdd {
      right: -20px;
    }
  }
  .tip {
    font-size: $global-font-size-12;
    color: #aaa;
    position: relative;
    top: -20px;
  }
  .partitions-tips {
    position: absolute;
    bottom: -16px;
    left: 132px;
  }
  .tags {
    display: flex;
    position: relative;
    i .tag-item {
      flex: 1;
      margin-right: 10px;
    }
  }
  .onlyAdd {
    right: -20px !important;
  }
  .el-icon-delete {
    position: absolute;
    top: 0;
    right: -20px;
    font-size: 16px;
    line-height: 32px;
    color: #ff5656;
    cursor: pointer;
  }
  .el-icon-plus {
    position: absolute;
    top: 0;
    right: -40px;
    margin-left: 5px;
    font-size: 16px;
    line-height: 32px;
    color: #3782ff;
    cursor: pointer;
  }
  .tips {
    position: absolute;
    top: 0;
    right: -5px;
    transform: translateX(100%);
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
.table-tips {
  position: absolute;
  top: 0;
  right: -10px;
  transform: translateX(100%);
}
.live-btn {
  margin-left: 5px;
  color: #3782ff;
  cursor: pointer;
}
.btn-preview {
  right: 0px !important;
}
</style>
