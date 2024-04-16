<template>
  <el-dialog :title="configForm.tableParams.autoCreateTable ? $lang('执行建表') : $lang('执行变更')" :visible.sync="tableObj.showDoTable" width="80%">
    <div v-loading="dialogLoading">
      <div class="dialog-box">
        <el-row v-if="!configForm.tableParams.autoCreateTable" class="tab_content">
          <el-col :span="11">
            <div class="table-title">{{ $lang('目标表当前Schema信息') }}</div>
            <el-table key="initRightColums" :data="selfParams.initRightColums" style="font-size: 10px" max-height="300px">
              <el-table-column type="index" width="50" align="center">
                <template #header> {{ $lang('序号') }} </template>
                <template slot-scope="scope">{{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column :label="$lang('字段名称')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnName }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段类型')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnType }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段描述')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnComment }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="2" class="icon-col">
            <el-button class="icon-btn" type="primary" size="mini" :disabled="true">{{ $lang('执行后') }}<i class="el-icon-caret-right"></i></el-button>
          </el-col>
          <el-col :span="11">
            <div class="table-title">{{ $lang('执行变更后的目标Schema信息') }}</div>
            <el-table key="rightColumns" :data="tableObj.rightColumns" style="font-size: 10px" max-height="300px">
              <el-table-column type="index" width="50" align="center">
                <template #header> {{ $lang('序号') }} </template>
                <template slot-scope="scope">{{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column :label="$lang('字段名称')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnName }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段类型')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnType }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段描述')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.columnComment }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <div class="table-sql">
          <div class="table-title">{{ $lang('执行语句：') }}</div>
          <div class="editor-box">
            <monaco-editor ref="monaco" v-model="sqlContent" :rules="monacoRules" :init-keywords="editorKeywords"></monaco-editor>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="tableObj.showDoTable = false">{{ $lang('取 消') }}</el-button>
        <el-button type="primary" @click="save">{{ $lang('确 定') }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import editerTipsMixin from '@/utils/editerTipsMixin';
import MonacoEditor from '@/components/MonacoEditor/index';
import { getCreateTableSql, getChangeTableSql, doTableSql, doHiveTableSql } from '@/api/task';
export default {
  components: { MonacoEditor },
  mixins: [editerTipsMixin],
  props: {
    tableObj: {
      type: Object,
      default: () => {}
    },
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
      dialogLoading: false,
      sqlContent: '',
      editorKeywords: [] // 编辑器提示的关键字
    };
  },
  watch: {
    'tableObj.showDoTable'(val) {
      if (val) {
        this.dialogLoading = false;
        this.getSql();
      }
    }
  },
  methods: {
    filterPartitionColunm(list) {
      return list.filter(v => !v.isPartition);
    },
    getSql() {
      // 处理分区信息
      let partitionsStr = '';
      this.configForm.partitionsArr.map(item => {
        const partitionsItem = item.name ? item.name + '=' + item.value : '';
        partitionsStr += partitionsItem + '#';
      });
      this.configForm.tableParams.partitions = partitionsStr.substring(0, partitionsStr.length - 1);
      let sourcePartitionsStr = '';
      this.configForm.sourcePartitionsArr.map(item => {
        const partitionsItem = item.name ? item.name + '=' + item.value : '';
        sourcePartitionsStr += partitionsItem + '#';
      });
      this.configForm.tableParams.sourcePartitions = sourcePartitionsStr.substring(0, sourcePartitionsStr.length - 1);
      const params = {
        catalog: {
          tableType: this.configForm.destinationType,
          targetDb: this.configForm.targetDb,
          tables: [
            {
              ...this.configForm.tableParams,
              columns: this.filterPartitionColunm(this.tableObj.rightColumns).map((item, index) => {
                return { ...this.filterPartitionColunm(this.tableObj.leftColumns)[index], ...item };
              })
            }
          ]
        },
        region: this.configForm.sourceRegion,
        owner: this.configForm.owner
      };
      if (this.configForm.tableParams.autoCreateTable) {
        getCreateTableSql(params).then(res => {
          this.$refs.monaco.setCode(res.data);
          this.$nextTick(() => {
            this.$refs.monaco.formatSql();
          });
        });
      } else {
        getChangeTableSql(params).then(res => {
          this.$refs.monaco.setCode(res.data);
          this.$nextTick(() => {
            this.$refs.monaco.formatSql();
          });
        });
      }
    },
    save() {
      this.dialogLoading = true;
      if (this.configForm.destinationType === 'hive') {
        const params = {
          region: this.configForm.sourceRegion,
          owner: this.configForm.owner,
          sql: this.sqlContent
        };
        doHiveTableSql(params).then(res => {
          this.$message({
            type: 'success',
            message: this.configForm.tableParams.autoCreateTable ? '执行建表成功！' : '执行变更成功！'
          });
          this.dialogLoading = false;
          this.tableObj.showDoTable = false;
          this.configForm.doTableActive = false;
          this.configForm.tableParams.autoCreateTable = false;
          this.$emit('getRightColumns');
          this.$emit('refreshTargetTableList');
        });
      } else {
        const params = {
          region: this.configForm.sourceRegion,
          type: this.configForm.destinationType,
          actorId: this.configForm.destinationId,
          db: this.configForm.targetDb,
          metaFlag: 'AIRBYTE',
          templateCode: this.configForm.templateCode,
          owner: this.configForm.owner,
          createTableSql: this.sqlContent
        };
        doTableSql(params).then(res => {
          this.$message({
            type: 'success',
            message: this.configForm.tableParams.autoCreateTable ? '执行建表成功！' : '执行变更成功！'
          });
          this.dialogLoading = false;
          this.tableObj.showDoTable = false;
          this.configForm.doTableActive = false;
          this.configForm.tableParams.autoCreateTable = false;
          this.$emit('getRightColumns');
          this.$emit('refreshTargetTableList');
        });
      }
    }
  }
};
</script>
<style scoped lang="scss">
.icon-col {
  display: flex;
  justify-content: center;
  .icon-btn {
    margin-top: 100%;
  }
}
.table-title {
  margin-bottom: 10px;
  font-weight: bold;
}
::v-deep .el-dialog__header {
  border-bottom: 1px solid #e2e9f3;
}
.table-sql {
  margin-top: 15px;
  .editor-box {
    height: 300px;
  }
}
.dialog-box {
  max-height: 80vh;
  overflow-y: auto;
  margin-bottom: 15px;
}
.dialog-footer {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
