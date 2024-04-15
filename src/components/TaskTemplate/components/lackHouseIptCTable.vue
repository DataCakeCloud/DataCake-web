<template>
  <div>
    <el-row>
      <el-col :span="13">
        <!-- v-if="configForm.sourceType !== 'mongodb'" -->
        <el-table ref="inputColumnsTable" v-loading="inputColumnsLoading" :data="inputColumns" stripe :cell-style="{ height: '45px', padding: '0px' }" style="font-size: 13px">
          <el-table-column type="index" width="60"> </el-table-column>
          <el-table-column prop="name" label="字段名称" min-width="100" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                <div class="name-box">
                  <span class="ellipsis block name-item" @mouseenter="isShowTooltip">
                    {{ scope.row.name || '-' }}
                  </span>
                  <span style="color: red">{{ scope.row.isPK ? '(PK)' : '' }}</span>
                  <span style="color: red">{{ scope.row.isNameChange ? '(变更)' : '' }}</span>
                  <span style="color: red">{{ scope.row.isDel ? '(删除)' : '' }}</span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="data_type" label="字段类型" min-width="90" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.data_type" :disabled="isTipDisabled">
                <span class="ellipsis block" @mouseenter="isShowTooltip">
                  <template v-if="configForm.sourceType === 'mongodb'">{{ scope.row.data_type || '-' }}</template>
                  <template v-else>
                    <span v-if="disabled">{{ scope.row.data_type || '-' }}</span>
                    <el-select v-else v-model="scope.row.data_type" placeholder="请选择目标字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                      <el-option v-for="item in mongoDbTypes" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                  </template>
                  <span style="color: red">{{ scope.row.isTypeChange ? '(变更)' : '' }}</span>
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="字段描述" min-width="100" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.comment" :disabled="isTipDisabled">
                <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.comment || '-' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="映射&转换" prop="funcs" min-width="100" align="center">
            <template slot-scope="scope">
              <el-popover v-if="scope.$index < columns.length && scope.$index < inputColumns.length" trigger="hover" placement="bottom" popper-class="tag-popper" :disabled="disabled">
                <div v-if="scope.row.funcs && scope.row.funcs.length > 0">
                  <span class="func-span">函数名</span>
                  <span class="func-span">参数</span>
                  <div v-for="(item, index) in scope.row.funcs" :key="index">
                    <span class="func-span">{{ item.funcName }}</span>
                    <span class="func-span">{{ item.funcParams.join(',') }}</span>
                  </div>
                </div>
                <div v-else>添加转换函数</div>
                <template slot="reference">
                  <func-icon @click.native="clickFunc(scope.row, scope.$index)"></func-icon>
                  <div v-if="scope.row.funcs && scope.row.funcs.length > 0" class="func-num">{{ scope.row.funcs.length }}</div>
                  <span v-if="scope.row.state === 'success'" class="state state-success">成功</span>
                  <span v-else-if="scope.row.state === 'fail'" class="state state-fail">失败</span>
                </template>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="11">
        <el-table ref="columnsTable" v-loading="columnsLoading" :data="columns" stripe :cell-style="{ height: '45px', padding: '0px' }" style="font-size: 13px">
          <el-table-column prop="columnName" label="字段名称" min-width="90" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.columnName" :disabled="isTipDisabled">
                <span v-if="disabled" class="ellipsis block" @mouseenter="isShowTooltip">
                  {{ scope.row.columnName || '-' }}
                </span>
                <span v-else class="ellipsis block" @mouseenter="isShowTooltip">
                  <el-input v-model="scope.row.columnName" placeholder="字段名称" size="mini" clearable></el-input>
                  <span style="color: red">{{ scope.row.isPK ? '(PK)' : '' }}</span>
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="columnType" label="字段类型" min-width="100" align="center">
            <template slot-scope="scope">
              <template v-if="disabled">{{ scope.row.columnType || '-' }}</template>
              <template v-else>
                <el-select v-model="scope.row.columnType" placeholder="请选择目标字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                  <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="columnType" label="安全级别" min-width="90" align="center">
            <template slot-scope="scope">
              <template v-if="disabled">{{ scope.row.securityLevel || '-' }}</template>
              <template v-else>
                <el-select v-model="scope.row.securityLevel" size="mini" @change="changeType(scope.$index, scope.row.columnType)">
                  <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <template v-if="disabled">
                <span>{{ scope.row.columnComment || '-' }}</span>
              </template>
              <template v-else>
                <el-input v-model="scope.row.columnComment" placeholder="字段描述" size="mini" clearable></el-input>
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="isSingle" label="操作" min-width="100" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <template>
                <el-button slot="reference" type="text" @click="addItem(scope)">复制</el-button>
                <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" title="确定删除此字段？" @confirm="deleteTableItem(scope.$index)">
                  <el-button slot="reference" type="text">删除</el-button>
                </el-popconfirm>

                <!-- <el-button type="text" :disabled="!canDelete" @click="deleteTableItem(scope.$index)">删除</el-button> -->
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog title="decimal类型自定义" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="resetForm">
      <div class="tip">decimal类型支持让用户自定义精度和小数位数</div>
      <el-form ref="decimalForm" :model="decimalForm" label-width="140px">
        <el-form-item label="精度" prop="accuracy" :rules="[{ required: true, message: '请输入精度', trigger: 'change' }]">
          <el-input-number v-model="decimalForm.accuracy" controls-position="right" :min="1" :max="38"></el-input-number>
        </el-form-item>
        <el-form-item label="小数位数" prop="decimal" :rules="[{ required: true, message: '请输入小数位数', trigger: 'change' }]">
          <el-input-number v-model="decimalForm.decimal" controls-position="right" :min="0" :max="decimalForm.accuracy"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDecimal">确 定</el-button>
      </span>
    </el-dialog>
    <convert-func ref="convertFunc" @save="save"></convert-func>
  </div>
</template>

<script>
import FuncIcon from '@/components/FuncIcon';
import ConvertFunc from './ConvertFunc';
import { getDataSetList } from '@/api/task';
export default {
  components: {
    ConvertFunc,
    FuncIcon
  },
  props: {
    isSingle: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inputColumns: {
      type: Array,
      default: () => {
        return [];
      }
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      }
    },
    typeList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    configForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    inputColumnsLoading: {
      type: Boolean,
      default: false
    },
    columnsLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isTipDisabled: false,
      dialogVisible: false,
      currentIndex: 0,
      decimalForm: {
        accuracy: 22,
        decimal: 6
      },
      securityList: ['1级', '2级', '3级', '4级'],
      mongoDbTypes: ['int', 'long', 'double', 'string', 'array', 'date', 'boolean', 'bytes']
    };
  },
  computed: {
    canDelete() {
      return this.configForm.targetDb && this.configForm.table_type;
    }
  },
  methods: {
    deleteTableItem(itemIndex) {
      this.$emit('deleteTableItem', itemIndex);
      // getDataSetList({
      //   db: this.configForm.targetDb,
      //   table: this.configForm.targetTable,
      //   metaFlag: 'AIRBYTE',
      //   region: this.configForm.sourceRegion,
      //   type: 'hive',
      //   templateCode: 'Mysql2Hive',
      //   judgeTable: true
      // }).then(res => {
      //   const targetData = res.data;
      //   let deleteFlag = true; // 判断字段能不能删除
      //   if (targetData.isTalbeExist) {
      //     const originTable = JSON.parse(JSON.stringify(this.inputColumns));
      //     originTable.splice(itemIndex, 1);
      //     targetData.columns.forEach(item => {
      //       const isIndex = originTable.findIndex(item1 => {
      //         return item1.name === item.name;
      //       });
      //       if (isIndex < 0) {
      //         deleteFlag = false;
      //       }
      //     });
      //   }
      //   if (deleteFlag) {
      //     this.$emit('deleteTableItem', itemIndex);
      //   } else {
      //     this.$confirm('删除该同步字段后，同步的字段schema与目标表schema不一致，将导致任务运行失败，因此不允许删除该字段。如若需要删除，请先到目标表中进行字段删除操作。', '删除提示', {
      //       confirmButtonText: '关闭',
      //       showCancelButton: false,
      //       type: 'warning',
      //       center: true,
      //       customClass: 'deleteConfirm'
      //     });
      //   }
      // });
    },
    addItem(Scope) {
      // 在下一行增加跟本行相同的一行
      const scope = JSON.parse(JSON.stringify(Scope));
      const inputItem = JSON.parse(JSON.stringify(this.inputColumns)).slice(scope.$index, scope.$index + 1)[0];
      const item = JSON.parse(JSON.stringify(this.columns)).slice(scope.$index, scope.$index + 1)[0];
      this.inputColumns.splice(scope.$index + 1, 0, inputItem);
      this.columns.splice(scope.$index + 1, 0, item);
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    changeType(index, value) {
      this.currentIndex = index;
      if (value === 'DECIMAL(自定义)') {
        this.dialogVisible = true;
      }
    },
    saveDecimal() {
      this.dialogVisible = false;
      setTimeout(() => {
        this.columns[this.currentIndex].columnType = `DECIMAL(${this.decimalForm.accuracy},${this.decimalForm.decimal})`;
      }, 100);
    },
    resetForm() {
      this.columns[this.currentIndex].columnType = 'DECIMAL(22,6)';
    },
    clickFunc(row, index) {
      if (!this.disabled) {
        this.$refs.convertFunc.showWin(row, index);
      }
    },
    save(funcs, index) {
      this.$set(this.inputColumns[index], 'funcs', funcs);
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
    padding: 20px 0;
    min-height: calc(100vh - 255px);
    position: relative;
    .open-btn {
      position: absolute;
      right: 20px;
      // top: 15px;
    }
    .ruleForm {
      ::v-deep .el-form-item {
        width: 70%;
        // margin: 0 auto 18px;
      }
      .el-select,
      .el-input {
        width: 100%;
      }
      .small-input {
        width: 64px;
      }
      ::v-deep .el-form-item__content {
        position: relative;
      }
      .sql_tips,
      .tips {
        position: absolute;
        top: 0;
        right: -10px;
        transform: translateX(100%);
      }
      .quick-item {
        margin-bottom: 30px;
        .quick-action {
          position: absolute;
          right: 0;
        }
      }
      .targetTable {
        margin-bottom: 30px;
        .quickCreateTable {
          position: absolute;
          right: 0;
        }
      }
    }
    .space-between {
      display: flex;
      justify-content: space-between;
    }
    .table-btns {
      position: absolute;
      right: 0;
      z-index: 10;
    }
    .func-num {
      position: absolute;
      height: 14px;
      width: 14px;
      background: #2fbfa0;
      color: #fff;
      top: 8px;
      left: 50%;
      border-radius: 50%;
      font-size: $global-font-size-12;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(0.6);
    }
    .state {
      font-size: $global-font-size-12;
      position: absolute;
      top: 4px;
      left: calc(50% + 25px);
      &::before {
        position: absolute;
        left: -6px;
        top: 0;
        bottom: 0;
        margin: auto;
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
      }
      &.state-success {
        &::before {
          background: #67c23a;
        }
      }
      &.state-fail {
        &::before {
          background: $color-cb;
        }
      }
    }
  }
  .name-item {
    max-width: 68%;
  }
  .name-box {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
<style>
.deleteConfirm .el-message-box__message p {
  text-align: justify;
}
</style>
