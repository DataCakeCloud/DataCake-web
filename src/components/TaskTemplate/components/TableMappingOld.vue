<template>
  <div>
    <el-tabs>
      <el-tab-pane :label="$t('task.tempTable1')" class="trans_table">
        <el-row class="tab_content">
          <el-col :span="13">
            <div class="mb10">
              <el-button type="primary" size="mini" @click="showLeftAdd = true">{{ $t('task.tempTable2') }}</el-button>
              <el-select v-show="showLeftAdd" v-model="leftAddItem" :placeholder="$t('task.dbTip7')" size="mini" @change="addLeftItem">
                <el-option v-for="item in leftAddList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
              </el-select>
              <el-button type="primary" size="mini" @click="refresh">{{ $t('task.tempTable3') }}</el-button>
            </div>
            <el-table ref="leftTableRef" v-loading="tableLeftLoading" :data="leftColumns" row-key="name" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
              <el-table-column type="index" width="80" align="center">
                <template #header>
                  {{ $t('task.tempTable5') }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ $t('task.dbTip18') }}
                    <i slot="reference" class="el-icon-info"></i>
                  </el-popover>
                </template>
                <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('task.tempTable6')" min-width="110" align="center">
                <template slot-scope="scope">
                  <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                    <div class="name-box">
                      <span class="ellipsis block name-item" @mouseenter="isShowTooltip">
                        {{ scope.row.name || '-' }}
                      </span>
                      <span style="color: red">{{ scope.row.isPK ? '(PK)' : '' }}</span>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="data_type" :label="$t('task.tempTable8')" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.data_type }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('task.tempTable9')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row.comment }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('task.tempTable10')" width="70" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="delData(scope.row, scope.$index)">{{ $t('task.taskDelet') }}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="funcs" min-width="100" align="center" class-name="table-func">
                <template slot-scope="scope">
                  <el-popover v-if="scope.$index < rightColumns.length && scope.$index < leftColumns.length" trigger="hover" placement="bottom" popper-class="tag-popper" :disabled="funDisabled">
                    <div v-if="scope.row.funcs && scope.row.funcs.length > 0">
                      <span class="func-span">{{ $t('task.dbTable3') }}</span>
                      <span class="func-span">{{ $t('task.dbTable4') }}</span>
                      <div v-for="(item, index) in scope.row.funcs" :key="index">
                        <span class="func-span">{{ item.funcName }}</span>
                        <span class="func-span">{{ item.funcParams.join(',') }}</span>
                      </div>
                    </div>
                    <div v-else>{{ $t('task.dbTable5') }}</div>
                    <template slot="reference">
                      <func-icon @click.native="clickFunc(scope.row, scope.$index)"></func-icon>
                      <div v-if="scope.row.funcs && scope.row.funcs.length > 0" class="func-num">{{ scope.row.funcs.length }}</div>
                      <span v-if="scope.row.state === 'success'" class="state state-success">{{ $t('task.dbTable6') }}</span>
                      <span v-else-if="scope.row.state === 'fail'" class="state state-fail">{{ $t('task.dbTable7') }}</span>
                    </template>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="11">
            <div class="mb10">
              <el-button type="primary" size="mini" @click="rightAddBtn">{{ $t('task.tempTable2') }}</el-button>
              <el-select v-show="showRightAdd" v-model="rightAddItem" :placeholder="$t('task.dbTip17')" size="mini" @change="addRightItem">
                <el-option v-for="item in rightAddList" :key="item.columnName" :value="item" :label="`${item.columnName}(${item.columnType})`"></el-option>
              </el-select>
              <el-button type="primary" size="mini" @click="autoSameName">{{ $t('task.tempTable4') }}</el-button>
            </div>
            <el-table ref="rightTableRef" v-loading="tableRightLoading" :data="rightColumns" row-key="columnName" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
              <el-table-column type="index" width="80" align="center">
                <template #header>
                  {{ $t('task.tempTable5') }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ $t('task.dbTip18') }}
                    <i slot="reference" class="el-icon-info"></i>
                  </el-popover>
                </template>
                <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('task.tempTable7')" min-width="120" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input v-if="isRightEdit" v-model="scope.row.columnName" size="mini"></el-input>
                  <span v-else>{{ scope.row.columnName }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="data_type" :label="$t('task.dbTip19')" align="center">
                <template slot-scope="scope">
                  <!-- <el-input v-if="isRightEdit" v-model="scope.row.columnType" size="mini" :placeholder="$t('task.tempTable8')"></el-input> -->
                  <el-select v-if="isRightEdit" v-model="scope.row.columnType" :placeholder="$t('task.dbTip20')" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                    <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                  </el-select>
                  <span v-else>{{ scope.row.columnType }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('task.tempTable9')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input v-if="isRightEdit" v-model="scope.row.columnComment" size="mini"></el-input>
                  <span v-else>{{ scope.row.columnComment }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('task.tempTable10')" width="70" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="delDataRight(scope.row, scope.$index)">{{ $t('task.taskDelet') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <convert-func ref="convertFunc" @save="save"></convert-func>
    <el-dialog :title="$t('task.ipt4')" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="closeForm">
      <div class="tip">{{ $t('task.dbTip21') }}</div>
      <el-form ref="decimalForm" :model="decimalForm" label-width="140px">
        <el-form-item :label="$t('task.dbTable8')" prop="accuracy" :rules="[{ required: true, message: $t('task.dbTable9'), trigger: 'change' }]">
          <el-input-number v-model="decimalForm.accuracy" controls-position="right" :min="1" :max="38"></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('task.dbTable10')" prop="decimal" :rules="[{ required: true, message: $t('task.dbTable11'), trigger: 'change' }]">
          <el-input-number v-model="decimalForm.decimal" controls-position="right" :min="0" :max="decimalForm.accuracy"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('task.taskCancel') }}</el-button>
        <el-button type="primary" @click="saveDecimal">{{ $t('task.taskOk') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Sortable from 'sortablejs';
import FuncIcon from '@/components/FuncIcon';
import ConvertFunc from './ConvertFunc';
export default {
  components: {
    FuncIcon,
    ConvertFunc
  },
  props: {
    leftColumns: {
      type: Array,
      default: () => []
    },
    rightColumns: {
      type: Array,
      default: () => []
    },
    isRightEdit: {
      // true是直接从源表同步目标表，false是从接口请求目标表
      type: Boolean,
      default: () => false
    },
    tableRightLoading: {
      type: Boolean,
      default: () => false
    },
    tableLeftLoading: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      isTipDisabled: false,
      showLeftAdd: false,
      showRightAdd: false,
      leftAddList: [],
      leftAddItem: '',
      rightAddList: [],
      rightAddItem: '',
      funDisabled: false,
      typeList: ['STRING', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL(22,6)', 'DECIMAL(自定义)', 'BINARY', 'VARBINARY'],
      decimalForm: {
        accuracy: 22,
        decimal: 6
      },
      dialogVisible: false
    };
  },
  watch: {
    isRightEdit(v) {
      this.rightAddList = [];
    }
  },
  mounted() {
    this.rowDrop();
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    rowDrop() {
      const el = this.$refs.leftTableRef.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        setData(dataTransfer) {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.leftColumns.splice(evt.oldIndex, 1)[0];
          this.leftColumns.splice(evt.newIndex, 0, targetRow);
        }
      });
      const el1 = this.$refs.rightTableRef.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable1 = Sortable.create(el1, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        setData(dataTransfer) {
          dataTransfer.setData('Text', '');
        },
        onEnd: evt => {
          const targetRow = this.rightColumns.splice(evt.oldIndex, 1)[0];
          this.rightColumns.splice(evt.newIndex, 0, targetRow);
        }
      });
    },
    changeType(index, value) {
      this.currentIndex = index;
      if (value === `DECIMAL${this.$t('task.dbValid13')}`) {
        this.dialogVisible = true;
      }
    },
    saveDecimal() {
      this.dialogVisible = false;
      setTimeout(() => {
        this.columns[this.currentIndex].columnType = `DECIMAL(${this.decimalForm.accuracy},${this.decimalForm.decimal})`;
      }, 100);
    },
    closeForm() {
      this.columns[this.currentIndex].columnType = 'DECIMAL(22,6)';
    },
    refresh() {
      this.$emit('refreshTable');
    },
    autoSameName() {
      this.leftColumns.map((item, index) => {
        if (index <= this.rightColumns.length - 1) {
          const rightIndex = this.rightColumns.findIndex(rightItem => {
            return rightItem.columnName === item.name;
          });
          if (rightIndex !== -1) {
            const targetRow = JSON.parse(JSON.stringify(this.rightColumns[rightIndex]));
            this.rightColumns[rightIndex] = JSON.parse(JSON.stringify(this.rightColumns[index]));
            this.rightColumns[index] = targetRow;
            this.$forceUpdate();
          }
        }
      });
    },
    rightAddBtn() {
      if (this.isRightEdit) {
        this.rightColumns.push({});
      } else {
        this.showRightAdd = true;
      }
    },
    addLeftItem(row) {
      this.leftColumns.push(row);
      this.showLeftAdd = false;
      this.leftAddItem = '';
      this.leftAddList.splice(
        this.leftAddList.findIndex(item => item.name === row.name),
        1
      );
    },
    addRightItem(row) {
      this.rightColumns.push(row);
      this.showRightAdd = false;
      this.rightAddItem = '';
      this.rightAddList.splice(
        this.rightAddList.findIndex(item => item.name === row.name),
        1
      );
    },
    delDataRight(row, index) {
      if (!this.isRightEdit) {
        this.rightAddList.push(row);
      }
      this.rightColumns.splice(index, 1);
    },
    delData(row, index) {
      this.leftAddList.push(row);
      this.leftColumns.splice(index, 1);
    },
    clickFunc(row, index) {
      this.$refs.convertFunc.showWin(row, index);
    },
    save(funcs, index) {
      this.$set(this.leftColumns[index], 'funcs', funcs);
    }
  }
};
</script>
<style lang="scss" scoped>
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

.name-box {
  display: flex;
  align-items: center;
  justify-content: center;
  .name-item {
    max-width: 80%;
  }
}
.tip {
  margin-bottom: 15px;
}
</style>
