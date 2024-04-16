<template>
  <div class="right-box">
    <el-tabs class="form-right">
      <el-tab-pane>
        <span slot="label">
          {{ $lang('选择目标') }}
          <el-popover placement="bottom" width="500" trigger="hover">
            <div>
              {{ $lang('1）下游目标表如果已经存在（包含表结构），则必须保证所选择的目标表结构涵盖上游表中的字段；') }}
              <br />
              {{ $lang('2）下游目标表如果不存在，则此处支持由用户自定义输入表名，输入后，后台将根据此库表+"字段转换映射"处的“目标表”信息去创建目标表；') }}
            </div>
            <i slot="reference" class="el-icon-info"></i>
          </el-popover>
        </span>
        <el-form-item label="目标数据源" prop="dataOriginType">
          <el-select v-model="configForm.destinationType" class="area-select" :placeholder="$t('task.dbTip3')" clearable @change="changeDestinationType">
            <el-option v-for="item in dataTargetList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$lang('数据源名称')" prop="destinationId">
          <el-select v-model="configForm.destinationId" filterable clearable @change="changeTargetName">
            <el-option v-for="item in destinationList" :key="item.actorId" :label="item.name" :value="item.actorId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$lang('库名')" prop="targetDb">
          <el-input v-model="configForm.targetDb" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item :label="$lang('表名')" prop="tableParams.targetTable">
          <span v-if="!configForm.tableParams.autoCreateTable">
            <el-select ref="targetTableSelect" v-model="configForm.tableParams.targetTable" class="lake-table-select" placeholder="选择表名称" no-match-text=" " default-first-option filterable clearable @change="changeTargetTable">
              <el-option v-for="item in targetTableList" :key="item.name" :label="item.name" :value="item.name"><ellipsis-tooltip :text="item.name" /></el-option>
            </el-select>
            <el-button type="text" size="mini" class="table-tips live-btn" @click="switchAutoTable()">{{ $lang('自定义表名') }}</el-button>
          </span>
          <span v-else>
            <el-input v-model="configForm.tableParams.targetTable" @blur="$emit('getLocation')"></el-input>
            <el-button type="text" size="mini" class="table-tips live-btn" @click="switchAutoTable()">{{ $lang('选择已有表') }}</el-button>
          </span>
        </el-form-item>
        <el-form-item prop="partitionsArr">
          <template #label>
            <span>{{ $lang('分区标识') }}</span>
            <el-tooltip class="item" effect="dark" :content="$lang('此字段标识了目标表是否每天保存一个全量数据，如果填写了分区字段，则每天往指定的分区字段中写入全量数据；否则，只保留最新一个全量数据')" placement="top">
              <i class="el-icon-info" style="cursor: pointer"></i>
            </el-tooltip>
          </template>
          <div v-for="(item, index) in configForm.partitionsArr" :key="index" class="partitions_item">
            <el-input v-model="item.name" :placeholder="$lang('分区名称')" clearable class="name" @change="changePartition"></el-input>
            <span class="mark">=</span>
            <el-input v-model="item.value" :placeholder="$lang('分区内容')" clearable class="value" @change="changePartition"></el-input>
            <i v-if="configForm.partitionsArr.length > 1" class="el-icon-delete" @click="deletePartitions(index)"></i>
            <i v-if="index === configForm.partitionsArr.length - 1 && configForm.partitionsArr.length < 3" class="el-icon-plus" :class="{ onlyAdd: configForm.partitionsArr.length === 1 }" @click="addPartitions"></i>
          </div>
          <span class="tips partitions-tips" @click="infoVisible = true">{{ $lang('参数提示') }}</span>
        </el-form-item>
        <!-- <el-form-item label="表描述">
          <el-tooltip class="item" effect="dark" :content="configForm.tableParams.tableComment" placement="top">
            <el-input v-model="configForm.tableParams.tableComment" placeholder="请输入表描述"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="安全级别">
          <el-tooltip class="item" effect="dark" :content="configForm.tableParams.tableLevel" placement="top">
            <el-select v-model="configForm.tableParams.tableLevel" placeholder="请选择安全级别">
              <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-tooltip>
        </el-form-item> -->
        <el-form-item label="preSql">
          <template #label>
            <span>{{ $lang('preSql') }}</span>
            <el-tooltip class="item" effect="dark" :content="$lang('预处理 SQL：这是在数据传输之前执行的 SQL 语句。它可以用来进行一些预处理操作，例如创建临时表、清理数据、设置变量等。presql通常用于准备数据传输所需的环境和条件。')" placement="top">
              <i class="el-icon-info" style="cursor: pointer"></i>
            </el-tooltip>
          </template>
          <div v-for="(item, index) in configForm.preArr" :key="index" class="tags mb10">
            <el-input v-model="item.value" class="tag-item"></el-input>
            <i v-if="configForm.preArr.length > 1" class="el-icon-delete" @click="deletePreSql(index)"></i>
            <i v-if="index === configForm.preArr.length - 1 && configForm.preArr.length < 5" class="el-icon-plus" :class="{ onlyAdd: configForm.preArr.length === 1 }" @click="addPreSql"></i>
          </div>
        </el-form-item>
        <el-form-item label="postSql">
          <template #label>
            <span>{{ $lang('postSql') }}</span>
            <el-tooltip class="item" effect="dark" :content="$lang('后处理 SQL：这是在数据传输之后执行的 SQL 语句。它可以用来进行一些后处理操作，例如合并数据、更新统计信息、触发其他任务等。postSql通常用于对传输后的数据进行进一步的处理和操作。')" placement="top">
              <i class="el-icon-info" style="cursor: pointer"></i>
            </el-tooltip>
          </template>
          <div v-for="(item, index) in configForm.postArr" :key="index" class="tags mb10">
            <el-input v-model="item.value" class="tag-item"></el-input>
            <i v-if="configForm.postArr.length > 1" class="el-icon-delete" @click="deletePostSql(index)"></i>
            <i v-if="index === configForm.postArr.length - 1 && configForm.postArr.length < 5" class="el-icon-plus" :class="{ onlyAdd: configForm.postArr.length === 1 }" @click="addPostSql"></i>
          </div>
        </el-form-item>
        <div v-if="configForm.dataTargetType === 'starRocks'">
          <el-form-item class="sync-num" label="每次同步最大数据量">
            <template #label>
              <span>{{ $lang('每次同步最大数据量') }}</span>
              <el-tooltip
                class="item"
                effect="dark"
                :content="
                  $lang(
                    '用于控制每次同步过程中传输的最大数据量。它指定了每个任务批次中可处理的数据行数或数据大小。如果将该值设置得太小，可能会导致频繁的读取或写入操作，增加了系统开销和网络传输开销。如果将该值设置得太大，可能会导致内存消耗过高，导致系统性能下降。因此，您需要根据实际场景和系统资源进行适当的调整。'
                  )
                "
                placement="top"
              >
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="configForm.tableParams.batchSize" :min="0"></el-input-number>
            Byte
          </el-form-item>
          <el-form-item class="sync-num" label="每次同步最大行数">
            <template #label>
              <span>{{ $lang('每次同步最大行数') }}</span>
              <el-tooltip class="item" effect="dark" :content="$lang('决定了每个任务执行时一次性读取和写入的数据行数。')" placement="top">
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="configForm.tableParams.maxBatchRows" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item class="sync-num" label="写入批次时间间隔">
            <template #label>
              <span>{{ $lang('每次同步最大行数') }}</span>
              <el-tooltip
                class="item"
                effect="dark"
                :content="
                  $lang(
                    '该参数决定了每个任务在写入数据之前等待的时间。设置较小的`写入批次时间间隔`值可以提高数据写入的速度，因为任务会更频繁地写入数据。然而，这也会增加系统的负载和资源消耗。相反，设置较大的值可以减少系统的负载和资源消耗，但会导致数据写入的速度变慢。选择合适的`写入批次时间间隔`取决于你的系统资源和目标数据源的特点。'
                  )
                "
                placement="top"
              >
                <i class="el-icon-info" style="cursor: pointer"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="configForm.tableParams.flushInterval" :min="0"></el-input-number>
          </el-form-item>
        </div>
      </el-tab-pane>
      <el-info v-model="infoVisible" :title="$lang('参数提示')">
        <sql-tips></sql-tips>
      </el-info>
    </el-tabs>
  </div>
</template>
<script>
import SqlTips from './SqlTips';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getDataSetList } from '@/api/task';

export default {
  name: 'FormRight1',
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
    selfParams: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      dataTargetList: [
        { label: 'StarRocks', value: 'starrocks' },
        { label: 'Hologres', value: 'hologres' }
      ],
      infoVisible: false,
      targetTableList: [],
      destinationList: [],
      targetDbList: [],
      securityList: [this.$lang('1级'), this.$lang('2级'), this.$lang('3级'), this.$lang('4级')]
    };
  },
  watch: {
    'configForm.sourceRegion'(val) {
      this.configForm.destinationId = '';
      this.changeTargetName();
    },
    'configForm.destinationId'(val) {
      if (val) {
        this.destinationList.forEach(item => {
          if (item.actorId === val) {
            this.configForm.destinationName = item.name;
          }
        });
      }
    }
  },
  created() {
    if (this.selfParams.isEdit) {
      this.$nextTick(() => {
        this.changeTargetName(this.configForm.destinationId, 'isEdit');
      });
    }
  },
  methods: {
    changeDestinationType() {
      this.getDestinationList();
    },
    switchAutoTable() {
      this.configForm.tableParams.autoCreateTable = !this.configForm.tableParams.autoCreateTable;
      this.configForm.partitionsArr = [{ name: '', value: '' }];
      this.configForm.doTableActive = false;
      if (this.configForm.tableParams.autoCreateTable) {
        this.configForm.tableParams.targetTable = `datacake_`;
      } else {
        this.configForm.tableParams.targetTable = '';
      }
      this.$emit('getLocation');
      this.$emit('getRightColumns', 'clearRightColumns');
    },
    refreshTargetTableList() {
      this.changeTargetName(this.configForm.destinationId, 'isDoTable');
    },
    getDestinationList() {
      getDataSetList({
        region: this.configForm.sourceRegion,
        type: this.configForm.destinationType,
        metaFlag: 'AIRBYTE',
        templateCode: this.configForm.templateCode
      }).then(res => {
        const data = res.data;
        this.destinationList = data.data;
        if (this.selfParams.isEdit) {
          const findItem = this.destinationList.find(item => item.actorId === this.configForm.destinationId);
          if (!findItem && this.configForm.destinationName) {
            this.destinationList.push({
              actorId: this.configForm.destinationId,
              name: this.configForm.destinationName
            });
          }
        }
      });
    },
    changeTargetName(value, type) {
      if (!type) {
        this.configForm.targetDb = '';
        this.configForm.tableParams.targetTable = '';
        this.configForm.splitPk = '';
        this.$emit('getRightColumns', 'clearRightColumns');
      }
      if (value) {
        const currentObj = this.destinationList.find(item => item.actorId === value);
        if (currentObj) {
          this.configForm.targetDb = currentObj.db;
        }
        this.targetTableList = [];
        getDataSetList({
          clearCache: true,
          region: this.configForm.sourceRegion,
          type: this.configForm.destinationType,
          actorId: this.configForm.destinationId,
          db: this.configForm.targetDb,
          metaFlag: 'AIRBYTE',
          templateCode: this.configForm.templateCode
        }).then(res => {
          const data = res.data;
          this.targetTableList = data.data;
        });
      }
    },
    changeTargetTable() {
      this.$emit('getRightColumns');
      this.$emit('getLocation');
    },
    changePartition() {
      // this.$emit('getLocation');
    },
    addPartitions() {
      this.configForm.partitionsArr.push({ value: '', name: '' });
    },
    deletePartitions(index) {
      this.configForm.partitionsArr.splice(index, 1);
    },
    addPreSql() {
      this.configForm.preArr.push({ value: '' });
    },
    deletePreSql(index) {
      this.configForm.preArr.splice(index, 1);
    },
    addPostSql() {
      this.configForm.postArr.push({ value: '' });
    },
    deletePostSql(index) {
      this.configForm.postArr.splice(index, 1);
    }
  }
};
</script>
<style lang="scss" scoped>
.right-box {
  position: relative;
  .source-img {
    position: absolute;
    left: 83px;
    top: 7px;
    img {
      width: 25px;
    }
  }
}
.form-right {
  .el-select,
  .el-input {
    width: 100%;
  }
  .partitions_item {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 18px;
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
    right: -25px;
    transform: translateX(100%);
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
}
</style>
