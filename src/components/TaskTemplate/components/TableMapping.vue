<template>
  <div>
    <el-tabs>
      <el-tab-pane label="字段映射" class="trans_table">
        <el-row class="tab_content">
          <el-col :span="13">
            <div class="mb10">
              <el-button type="primary" size="mini" @click="showLeftAdd = true">添加</el-button>
              <el-select v-show="showLeftAdd" v-model="leftAddItem" placeholder="在当前选中表中选择字段" size="mini" @change="addLeftItem">
                <el-option v-for="item in leftAddList" :key="item.name" :value="item" :label="`${item.name}(${item.data_type})`"></el-option>
              </el-select>
              <el-button type="primary" size="mini" @click="refresh">刷新源表字段</el-button>
            </div>
            <el-table v-if="showLeftTable" key="leftTableKey" ref="leftTableRef" v-loading="tableObj.tableLeftLoading" :data="tableObj.leftColumns" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
              <el-table-column type="index" label="序号" width="80" align="center">
                <template #header>
                  序号
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    拖动列头图标可进行手动排序
                    <i slot="reference" class="el-icon-info"></i>
                  </el-popover>
                </template>
                <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column prop="name" label="源字段名称" min-width="120" align="center">
                <template slot-scope="scope">
                  <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                    <div class="name-box">
                      <el-input v-if="tableObj.isLeftEdit" v-model="scope.row.name" size="mini" placeholder="字段名称" @blur="changeName(scope.row.name, scope.$index)"></el-input>
                      <span v-else class="ellipsis block name-item" @mouseenter="isShowTooltip">
                        {{ scope.row.name || '-' }}
                      </span>
                      <span style="color: red" class="pk">{{ scope.row.isPK ? '(PK)' : '' }}</span>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="data_type" label="字段类型" align="center">
                <template slot-scope="scope">
                  <el-select v-if="tableObj.isLeftEdit" v-model="scope.row.data_type" placeholder="请选择字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                    <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                  </el-select>
                  <span v-else>{{ scope.row.data_type }}</span>
                </template>
              </el-table-column>
              <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input v-if="tableObj.isLeftEdit" v-model="scope.row.comment" size="mini" placeholder="字段描述"></el-input>
                  <span v-else>{{ scope.row.comment }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button v-if="tableObj.isRightCopy" type="text" @click="copyData(scope.row, scope.$index)">复制</el-button>
                  <el-button type="text" @click="delData(scope.row, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="funcs" min-width="100" align="center" class-name="table-func">
                <template slot-scope="scope">
                  <el-popover v-if="scope.$index < tableObj.rightColumns.length && scope.$index < tableObj.leftColumns.length" trigger="hover" placement="bottom" popper-class="tag-popper" :disabled="funDisabled">
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
            <div class="mb10">
              <el-button type="primary" size="mini" @click="rightAddBtn">添加</el-button>
              <el-select v-show="showRightAdd" v-model="rightAddItem" placeholder="在当前选中表中选择字段" size="mini" @change="addRightItem">
                <el-option v-for="item in rightAddList" :key="item.columnName" :value="item" :label="`${item.columnName}(${item.columnType})`"></el-option>
              </el-select>
              <el-button type="primary" size="mini" @click="autoSameName">同名映射</el-button>
            </div>
            <div>
              <el-table v-if="showRightTable" key="leftTableKey" ref="rightTableRef" v-loading="tableObj.tableRightLoading" :data="tableObj.rightColumns" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
                <el-table-column type="index" label="序号" width="80" align="center">
                  <template #header>
                    序号
                    <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                      拖动列头图标可进行手动排序
                      <i slot="reference" class="el-icon-info"></i>
                    </el-popover>
                  </template>
                  <template slot-scope="scope"> <i class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
                </el-table-column>
                <el-table-column prop="name" label="目标字段名称" min-width="135" align="center">
                  <template slot-scope="scope">
                    <el-input v-if="tableObj.isRightEdit" v-model="scope.row.columnName" size="mini" placeholder="字段名称"></el-input>
                    <span v-else>{{ scope.row.columnName }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="data_type" label="字段类型" align="center" min-width="110">
                  <template slot-scope="scope">
                    <!-- <el-input v-if="tableObj.isRightEdit" v-model="scope.row.columnType" size="mini" placeholder="字段类型"></el-input> -->
                    <el-select v-if="tableObj.isRightEdit" v-model="scope.row.columnType" placeholder="请选择目标字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                      <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                    <span v-else>{{ scope.row.columnType }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="columnType" label="安全级别" min-width="90" align="center">
                  <template slot-scope="scope">
                    <el-select v-if="tableObj.isRightEdit" v-model="scope.row.securityLevel" size="mini">
                      <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                    <template v-else>{{ scope.row.securityLevel || '-' }}</template>
                  </template>
                </el-table-column>
                <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-input v-if="tableObj.isRightEdit" v-model="scope.row.columnComment" size="mini" placeholder="字段描述"></el-input>
                    <span v-else>{{ scope.row.columnComment }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="70" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" @click="delDataRight(scope.row, scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <convert-func ref="convertFunc" @save="save"></convert-func>
    <el-dialog title="decimal类型自定义" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="closeForm">
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
    tableObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isTipDisabled: false,
      showLeftAdd: false,
      showRightAdd: false,
      showLeftTable: true,
      showRightTable: true,
      leftAddList: [],
      leftAddItem: '',
      rightAddList: [],
      rightAddItem: '',
      funDisabled: false,
      typeList: ['String', 'Boolean', 'Bigint', 'Date', 'Double', 'Float', 'Int', 'Tinyint', 'Timestamp'],
      decimalForm: {
        accuracy: 22,
        decimal: 6
      },
      dialogVisible: false,
      securityList: ['1级', '2级', '3级', '4级']
    };
  },
  watch: {
    'tableObj.isRightEdit'(v) {
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
        onStart: evt => {
          this.tableObj.dragLoading = true;
        },
        onUpdate: evt => {
          const targetRow = this.tableObj.leftColumns.splice(evt.oldIndex, 1)[0];
          this.tableObj.leftColumns.splice(evt.newIndex, 0, targetRow);
          // 防止表单数据过多，导致表单无法正确更新，所以重新加载表单
          this.showLeftTable = false;
        },
        onEnd: evt => {
          this.$nextTick(() => {
            this.showLeftTable = true;
          });
          // 重新加载表单后，重新绑定推拽事件
          setTimeout(() => {
            this.tableObj.dragLoading = false;
            this.rowDrop();
          });
        }
      });
      const el1 = this.$refs.rightTableRef.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable1 = Sortable.create(el1, {
        ghostClass: 'sortable-ghost',
        handle: '.el-icon-s-operation',
        onStart: evt => {
          this.tableObj.dragLoading = true;
        },
        onUpdate: evt => {
          const targetRow = this.tableObj.rightColumns.splice(evt.oldIndex, 1)[0];
          this.tableObj.rightColumns.splice(evt.newIndex, 0, targetRow);
          this.showRightTable = false;
        },
        onEnd: evt => {
          this.$nextTick(() => {
            this.showRightTable = true;
          });
          setTimeout(() => {
            this.tableObj.dragLoading = false;
            this.rowDrop();
          });
        }
      });
    },
    changeName(name, index) {
      this.tableObj.rightColumns[index].columnName = name;
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
    closeForm() {
      this.columns[this.currentIndex].columnType = 'DECIMAL(22,6)';
    },
    refresh() {
      this.$emit('refreshTable');
    },
    autoSameName() {
      this.tableObj.leftColumns.map((item, index) => {
        if (index <= this.tableObj.rightColumns.length - 1) {
          const rightIndex = this.tableObj.rightColumns.findIndex(rightItem => {
            return rightItem.columnName === item.name;
          });
          if (rightIndex !== -1) {
            const targetRow = JSON.parse(JSON.stringify(this.tableObj.rightColumns[rightIndex]));
            this.tableObj.rightColumns[rightIndex] = JSON.parse(JSON.stringify(this.tableObj.rightColumns[index]));
            this.tableObj.rightColumns[index] = targetRow;
            this.$forceUpdate();
          }
        }
      });
    },
    rightAddBtn() {
      if (this.tableObj.isRightEdit) {
        this.tableObj.rightColumns.push({});
      } else {
        this.showRightAdd = true;
      }
    },
    addLeftItem(row) {
      this.tableObj.leftColumns.push(row);
      this.showLeftAdd = false;
      this.leftAddItem = '';
      this.leftAddList.splice(
        this.leftAddList.findIndex(item => item.name === row.name),
        1
      );
    },
    addRightItem(row) {
      this.tableObj.rightColumns.push(row);
      this.showRightAdd = false;
      this.rightAddItem = '';
      this.rightAddList.splice(
        this.rightAddList.findIndex(item => item.name === row.name),
        1
      );
    },
    delDataRight(row, index) {
      if (!this.tableObj.isRightEdit) {
        this.rightAddList.push(row);
      }
      this.tableObj.rightColumns.splice(index, 1);
    },
    delData(row, index) {
      this.leftAddList.push(row);
      this.tableObj.leftColumns.splice(index, 1);
    },
    copyData(row, index) {
      const copyRow = JSON.parse(JSON.stringify(row));
      this.tableObj.leftColumns.splice(index + 1, 0, copyRow);
    },
    clickFunc(row, index) {
      this.$refs.convertFunc.showWin(row, index);
    },
    save(funcs, index) {
      this.$set(this.tableObj.leftColumns[index], 'funcs', funcs);
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
.pk {
  min-width: 30px;
}
</style>
