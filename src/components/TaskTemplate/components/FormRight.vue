<template>
  <el-tabs class="form-right">
    <el-tab-pane>
      <span slot="label">
        选择目标
        <el-popover placement="bottom" width="500" trigger="hover">
          <div>
            1）下游目标表如果已经存在（包含表结构），则必须保证所选择的目标表结构涵盖上游表中的字段；<br />
            2）下游目标表如果不存在，则此处支持由用户自定义输入表名，输入后，后台将根据此库表+"字段转换映射"处的“目标表”信息去创建目标表；
          </div>
          <i slot="reference" class="el-icon-info"></i>
        </el-popover>
      </span>
      <el-form-item label="数据源名称" prop="destinationId">
        <el-select v-model="configForm.destinationId" placeholder="数据源名称" filterable clearable>
          <el-option v-for="item in destinationList" :key="item.sourceId" :label="item.name" :value="item.sourceId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="LakeHouse库名" prop="targetDb">
        <el-select ref="dbSelect" v-model="configForm.targetDb" disabled placeholder="选择数据库名称" no-match-text=" " default-first-option filterable clearable>
          <el-option v-for="item in targetDbList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
          <div class="dy-box dy-box-less"></div>
          <div class="dy-box">
            <div>
              <el-button type="text">+没找到？请联系admin或到元数据页面建库</el-button>
            </div>
          </div>
        </el-select>
      </el-form-item>
      <el-form-item label="LakeHouse表名" prop="targetTable">
        <el-input v-model="configForm.targetTable" placeholder="请输入表名" @blur="getLocation"></el-input>
      </el-form-item>
      <el-form-item label="分区标识">
        <template #label>
          <span>分区标识</span>
          <el-tooltip class="item" effect="dark" content="此字段标识了目标表是否每天保存一个全量数据，如果填写了分区字段，则每天往指定的分区字段中写入全量数据；否则，只保留最新一个全量数据" placement="top">
            <i class="el-icon-info" style="cursor: pointer"></i>
          </el-tooltip>
        </template>
        <div v-for="(item, index) in configForm.partitions" :key="index" class="partitions_item">
          <el-input v-model="item.name" placeholder="分区名称" clearable class="name" @change="changePartition"></el-input>
          <span class="mark">=</span>
          <el-input v-model="item.value" placeholder="分区内容" clearable class="value" @change="changePartition"></el-input>
          <i v-if="configForm.partitions.length > 1" class="el-icon-delete" @click="deletePartitions(index)"></i>
          <i v-if="index === configForm.partitions.length - 1 && configForm.partitions.length < 3" class="el-icon-plus" :class="{ onlyAdd: configForm.partitions.length === 1 }" @click="addPartitions"></i>
        </div>
        <span class="tips partitions-tips" @click="infoVisible = true">参数提示</span>
      </el-form-item>
      <el-form-item label="表描述" class="targetTable">
        <el-tooltip class="item" effect="dark" :content="configForm.taskParam.tableComment" placement="top">
          <el-input v-model="configForm.taskParam.tableComment" placeholder="请输入表描述"></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="安全级别" class="targetTable">
        <el-tooltip class="item" effect="dark" :content="configForm.taskParam.tableLevel" placement="top">
          <el-select v-model="configForm.taskParam.tableLevel" placeholder="请选择安全级别">
            <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="Location" class="targetTable">
        <el-tooltip class="item" effect="dark" :content="configForm.taskParam.location" placement="top">
          <el-input v-model="configForm.taskParam.location" placeholder="请输入Location"></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item class="sync-num" label="读写速率" required> <el-input-number v-model="configForm.taskParam.bandwidth" :min="1"></el-input-number> M</el-form-item>
    </el-tab-pane>
    <el-info v-model="infoVisible" title="参数提示">
      <sql-tips></sql-tips>
    </el-info>
  </el-tabs>
</template>
<script>
import SqlTips from './SqlTips';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList, getSourceOrDestination } from '@/api/task';

export default {
  name: 'FormRight',
  components: {
    SqlTips,
    EllipsisTooltip
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
      infoVisible: false,
      destinationList: [],
      targetDbList: [],
      securityList: ['1级', '2级', '3级', '4级']
    };
  },
  watch: {
    'configForm.sourceRegion'(value) {
      if (value) {
        this.getDestinationId();
        // this.getTargetDbList();
      }
    }
  },
  methods: {
    changePartition() {
      this.getLocation();
    },
    getDestinationId() {
      const params = {
        pageNum: 1,
        pageSize: 10,
        sourceName: 'iceberg',
        region: this.configForm.sourceRegion,
        sortKey: 'createTime',
        sortOrder: 'desc'
      };
      getSourceOrDestination(params).then(res => {
        this.destinationList = res.data.list;
        if (!this.configForm.destinationId) {
          this.configForm.destinationId = this.destinationList[0].sourceId;
        }
      });
    },
    getTargetDbList() {
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: this.templateCode
      }).then(res => {
        const data = res.data;
        this.targetDbList = data.data;
      });
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
    addPartitions() {
      this.configForm.partitions.push({ value: '', name: '' });
    },
    deletePartitions(index) {
      this.configForm.partitions.splice(index, 1);
    }
  }
};
</script>
<style lang="scss" scoped>
.form-right {
  .sync-num {
    ::v-deep .el-input-number--small {
      width: 50%;
    }
  }
  .el-select,
  .el-input {
    width: 100%;
  }
  .partitions_item {
    position: relative;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
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
  }
}
</style>
