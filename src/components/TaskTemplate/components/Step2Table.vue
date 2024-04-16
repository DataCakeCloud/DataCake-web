<!-- 注意 ！！！ 表单数据data绑定时进行filter，去掉分区与分区标识相同的字段 -->
<template>
  <div>
    <el-tabs>
      <el-tab-pane :label="$lang('字段映射')" class="trans_table">
        <el-row class="tab_content">
          <el-col :span="13">
            <div class="mb10">
              <span>来源</span>
              <el-button type="text" @click="getLeftColumns"> <i class="el-icon-refresh-right"></i>{{ $lang('刷新') }}</el-button>
              <el-button type="text" class="auto-map" @click="autoMap">
                {{ $lang('映射') }}
                <!-- <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                  <div class="map-box">
                    <div>映射说明：</div>
                    <div>
                      {{ $lang('● 如果目标表名为自定义表名，此时点击"映射"按钮后，源字段将填充到目标字段处；') }}
                    </div>
                    <div>
                      {{ $lang('● 如果目标表名为存量表，此时点击"映射"按钮后，将自动识别源字段名称与目标字段名称的diff，来重新渲染目标字段，举例：') }}
                    </div>
                    <div class="align-text">
                      {{ $lang('○ 源字段为a、b、c，目标字段为a1、b1、c1，则目标表字段将重新填充为a、b、c；') }}
                    </div>
                    <div class="align-text">
                      {{ $lang('○ 源字段为a、b、c，目标字段为a、b1、c，则目标表字段将重新填充为a、b、c') }}
                    </div>
                  </div>
                  <i slot="reference" class="el-icon-info"></i>
                </el-popover> -->
                <i class="el-icon-info" @click="modeVisible = !modeVisible"></i>
              </el-button>
            </div>
            <el-table v-if="showLeftTable" key="leftTableKey" ref="leftTableRef" v-loading="tableObj.tableLeftLoading" :data="tableObj.leftColumns.filter(v => !v.isPartition)" row-key="id" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
              <el-table-column type="index" width="80" align="center">
                <template #header>
                  {{ $lang('序号') }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ $lang('拖动列头图标可进行手动排序') }}
                    <i slot="reference" class="el-icon-info"></i>
                  </el-popover>
                </template>
                <template slot-scope="scope"> <i v-if="tableObj.isLeftDrag" class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column prop="name" :label="$lang('源字段名称')" min-width="120" align="left">
                <template slot-scope="scope">
                  <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                    <div class="name-box">
                      <!-- 点击添加一行时，name为下拉选择 -->
                      <div class="name-inpt">
                        <el-input v-if="tableObj.isLeftEdit" v-model="tableObj.leftColumns[findLeftIndex(scope.row)].name" size="mini" :placeholder="$lang('字段名称')" @blur="changeName(scope.row.name, scope.$index)"></el-input>
                        <div v-else>
                          <el-select v-if="scope.row.itemSelect" v-model="tableObj.leftColumns[findLeftIndex(scope.row)].name" :placeholder="$lang('请选择')" size="mini">
                            <el-option v-for="item in initLeftNameList" :key="item" :value="item" :label="item"></el-option>
                          </el-select>
                          <span v-else class="ellipsis name-item" @mouseenter="isShowTooltip">
                            {{ scope.row.name || '-' }}
                          </span>
                        </div>
                        <span style="color: red">{{ scope.row.isPK ? '(PK)' : '' }}</span>
                        <span style="color: red">{{ scope.row.isNameChange ? $lang('(变更)') : '' }}</span>
                      </div>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段类型')" align="left">
                <template slot-scope="scope">
                  <!-- <el-select v-if="tableObj.isLeftEdit && !scope.row.itemSelect" v-model="scope.row.data_type" placeholder="请选择字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                    <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                  </el-select> -->
                  <el-input v-if="tableObj.isLeftEdit || scope.row.itemSelect" v-model="tableObj.leftColumns[findLeftIndex(scope.row)].data_type" size="mini"></el-input>
                  <span v-else>{{ scope.row.data_type }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段描述')" min-width="100" align="left" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input v-if="tableObj.isLeftEdit || scope.row.itemSelect" v-model="tableObj.leftColumns[findLeftIndex(scope.row)].comment" size="mini"></el-input>
                  <span v-else>{{ scope.row.comment }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('操作')" width="70" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="delData(scope.row, scope.$index)">{{ $lang('删除') }}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="funcs" min-width="100" align="center" class-name="table-func">
                <template slot-scope="scope">
                  <el-popover v-if="scope.$index < tableObj.rightColumns.length && scope.$index < tableObj.leftColumns.length" trigger="hover" placement="bottom" popper-class="tag-popper" :disabled="funDisabled">
                    <div v-if="scope.row.funcs && scope.row.funcs.length > 0">
                      <span class="func-span">{{ $lang('函数名') }}</span>
                      <span class="func-span">{{ $lang('参数') }}</span>
                      <div v-for="(item, index) in scope.row.funcs" :key="index">
                        <span class="func-span">{{ item.funcName }}</span>
                        <span class="func-span">{{ item.funcParams.join(',') }}</span>
                      </div>
                    </div>
                    <div v-else>{{ $lang('添加转换函数') }}</div>
                    <template slot="reference">
                      <func-icon @click.native="clickFunc(scope.row, findLeftIndex(scope.row))"></func-icon>
                      <div v-if="scope.row.funcs && scope.row.funcs.length > 0" class="func-num">{{ scope.row.funcs.length }}</div>
                      <span v-if="scope.row.state === 'success'" class="state state-success">{{ $lang('成功') }}</span>
                      <span v-else-if="scope.row.state === 'fail'" class="state state-fail">{{ $lang('失败') }}</span>
                    </template>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="text" @click="addColumn('left')">{{ $lang('添加一行') }}</el-button>
          </el-col>
          <el-col :span="11">
            <div class="mb10">
              <span class="table-text">目标</span>
              <!-- <el-button v-if="canDotable" class="create-table" type="primary" size="mini" :disabled="!configForm.doTableActive" @click="doChangeTable"><i class="el-icon-caret-right" />{{ configForm.tableParams.autoCreateTable ? $lang('执行建表') : $lang('执行变更') }}</el-button> -->
            </div>
            <el-table v-if="showRightTable" key="leftTableKey" ref="rightTableRef" v-loading="tableObj.tableRightLoading" :data="tableObj.rightColumns.filter(v => !v.isPartition)" row-key="id" stripe :row-style="{ height: '45px' }" style="font-size: 13px">
              <el-table-column type="index" width="80" align="center">
                <template #header>
                  {{ $lang('序号') }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ $lang('拖动列头图标可进行手动排序') }}
                    <i slot="reference" class="el-icon-info"></i>
                  </el-popover>
                </template>
                <template slot-scope="scope"> <i v-if="tableObj.isRightDrag" class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column prop="name" :label="$lang('目标字段名称')" min-width="135" align="center">
                <template slot-scope="scope">
                  <el-input v-if="tableObj.isRightEdit" v-model="tableObj.rightColumns[findRightIndex(scope.row)].columnName" size="mini"></el-input>
                  <span v-else>{{ scope.row.columnName }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段类型')" align="center" min-width="110">
                <template slot-scope="scope">
                  <!-- <el-select v-if="tableObj.isRightEdit" v-model="scope.row.columnType" placeholder="请选择目标字段类型" size="mini" clearable @change="changeType(scope.$index, scope.row.columnType)">
                    <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                  </el-select> -->
                  <el-input v-if="tableObj.isRightEdit" v-model="tableObj.rightColumns[findRightIndex(scope.row)].columnType" size="mini" clearable></el-input>
                  <span v-else>{{ scope.row.columnType }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="columnType" :label="$lang('安全级别')" min-width="90" align="center">
                <template slot-scope="scope">
                  <el-select v-if="tableObj.isRightEdit" v-model="tableObj.rightColumns[findRightIndex(scope.row)].securityLevel" size="mini">
                    <el-option v-for="item in securityList" :key="item" :value="item" :label="item"></el-option>
                  </el-select>
                  <template v-else>{{ scope.row.securityLevel || '-' }}</template>
                </template>
              </el-table-column>
              <el-table-column :label="$lang('字段描述')" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input v-if="tableObj.isRightEdit" v-model="tableObj.rightColumns[findRightIndex(scope.row)].columnComment" size="mini"></el-input>
                  <span v-else>{{ scope.row.columnComment }}</span>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="text" @click="addColumn('right')">{{ $lang('添加一行') }}</el-button>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <convert-func ref="convertFunc" @save="save"></convert-func>
    <el-dialog :title="$lang('decimal类型自定义')" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="closeForm">
      <div class="tip">{{ $lang('decimal类型支持让用户自定义精度和小数位数') }}</div>
      <el-form ref="decimalForm" :model="decimalForm" label-width="140px">
        <el-form-item :label="$lang('精度')" prop="accuracy" :rules="[{ required: true, message: $lang('请输入精度'), trigger: 'change' }]">
          <el-input-number v-model="decimalForm.accuracy" controls-position="right" :min="1" :max="38"></el-input-number>
        </el-form-item>
        <el-form-item :label="$lang('小数位数')" prop="decimal" :rules="[{ required: true, message: $lang('请输入小数位数'), trigger: 'change' }]">
          <el-input-number v-model="decimalForm.decimal" controls-position="right" :min="0" :max="decimalForm.accuracy"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $lang('取 消') }}</el-button>
        <el-button type="primary" @click="saveDecimal">{{ $lang('确 定') }}</el-button>
      </span>
    </el-dialog>
    <Step2DoTable :table-obj="tableObj" :config-form="configForm" :self-params="selfParams" @getRightColumns="getRightColumns" @refreshTargetTableList="refreshTargetTableList" />
    <el-info v-model="modeVisible" :title="$lang('映射说明')">
      <div class="map-box">
        <div>
          {{ $lang('● 如果目标表名为自定义表名，此时点击"映射"按钮后，源字段将填充到目标字段处；') }}
        </div>
        <div>
          {{ $lang('● 如果目标表名为存量表，此时点击"映射"按钮后，将自动识别源字段名称与目标字段名称的diff，来重新渲染目标字段，举例：') }}
        </div>
        <div class="align-text">
          {{ $lang('○ 源字段为a、b、c，目标字段为a1、b1、c1，则目标表字段将重新填充为a、b、c；') }}
        </div>
        <div class="align-text">
          {{ $lang('○ 源字段为a、b、c，目标字段为a、b1、c，则目标表字段将重新填充为a、b、c') }}
        </div>
      </div>
    </el-info>
  </div>
</template>
<script>
import Sortable from 'sortablejs';
import FuncIcon from '@/components/FuncIcon';
import ConvertFunc from './ConvertFunc.vue';
import Step2DoTable from './Step2DoTable.vue';
export default {
  components: {
    FuncIcon,
    ConvertFunc,
    Step2DoTable
  },
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
      isTipDisabled: false,
      modeVisible: false,
      showLeftAdd: false,
      showRightAdd: false,
      showLeftTable: true,
      showRightTable: true,
      funDisabled: false,
      initLeftNameList: [],
      typeList: ['String', 'Boolean', 'Bigint', 'Date', 'Double', 'Float', 'Int', 'Tinyint', 'Timestamp'],
      canDotable: true,
      decimalForm: {
        accuracy: 22,
        decimal: 6
      },
      dialogVisible: false,
      securityList: [this.$lang('1级'), this.$lang('2级'), this.$lang('3级'), this.$lang('4级')]
    };
  },
  watch: {
    'tableObj.leftColumns': {
      handler(v) {
        this.initLeftNameList = [];
        v.forEach(item => {
          if (!item.itemSelect) {
            this.initLeftNameList.push(item.name);
          }
        });
      },
      deep: true,
      immediate: true
    },
    'tableObj.rightColumns': {
      handler(v) {
        if (v.length && this.activeFn()) {
          this.configForm.doTableActive = true;
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.configForm.destinationType === 's3' || this.configForm.destinationType === 'obs' || this.configForm.destinationType === 'mongodb') {
      this.canDotable = false;
    }
    this.rowDrop();
  },
  methods: {
    findLeftIndex(column) {
      if (this.tableObj.leftColumns) {
        return this.tableObj.leftColumns.findIndex(item => item.name === column.name);
      } else {
        return 0;
      }
    },
    findRightIndex(column) {
      if (this.tableObj.rightColumns) {
        return this.tableObj.rightColumns.findIndex(item => item.columnName === column.columnName);
      } else {
        return 0;
      }
    },
    activeFn() {
      return this.configForm.targetDb && this.configForm.tableParams.targetTable && this.configForm.destinationType === 'hive';
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
    rowDrop() {
      if (this.tableObj.isLeftDrag) {
        const el = this.$refs.leftTableRef.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
        this.sortable = Sortable.create(el, {
          ghostClass: 'sortable-ghost',
          handle: '.el-icon-s-operation',
          setData(dataTransfer) {
            dataTransfer.setData('Text', '');
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
              this.rowDrop();
            });
          }
        });
      }
      if (this.tableObj.isRightDrag) {
        const el1 = this.$refs.rightTableRef.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
        this.sortable1 = Sortable.create(el1, {
          ghostClass: 'sortable-ghost',
          handle: '.el-icon-s-operation',
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
              this.rowDrop();
            });
          }
        });
      }
    },
    formatType(Type) {
      const type = Type.toLowerCase();
      if (type === 'bigint' || type === 'bigserial' || type === 'integer' || type === 'smallint' || type === 'serial' || type === 'int' || type === 'numberic') {
        return 'Bigint';
      } else if (type === 'boolean') {
        return 'Boolean';
      } else {
        return 'String';
      }
    },
    regColumItem(item) {
      return {
        columnName: item.name,

        // columnType: item.data_type ? this.typeList.find(ele => ele === this.formatType(item.data_type)) : this.typeList[0],
        columnType: this.selfParams.isSameMap ? item.data_type || item.type : this.selfParams.typeMapList[(item.data_type || item.type).split('(')[0].toLowerCase()] || this.selfParams.typeMapList.default,
        columnComment: item.comment,
        securityLevel: '1级',
        isPartition: item.isPartition
      };
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
    getLeftColumns() {
      this.$emit('getLeftColumns');
    },
    getRightColumns() {
      this.$emit('getRightColumns');
    },
    refreshTargetTableList() {
      this.$emit('refreshTargetTableList');
    },
    // 普通映射
    autoMap() {
      this.configForm.doTableActive = true;
      this.tableObj.rightColumns = [];
      this.tableObj.leftColumns.forEach((item, index) => {
        if (!item.isPartition) {
          this.tableObj.rightColumns.push(this.regColumItem(item));
        }
      });
      this.selfParams.initRightColums = this.tableObj.rightColumns;
    },
    addColumn(type) {
      if (type === 'left') {
        this.tableObj.leftColumns.push({ itemSelect: true });
      } else {
        this.tableObj.rightColumns.push({});
      }
    },
    delData(row, index) {
      this.tableObj.leftColumns.splice(index, 1);
    },
    clickFunc(row, index) {
      this.$refs.convertFunc.showWin(row, index);
    },
    doChangeTable() {
      this.tableObj.showDoTable = true;
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
.mb10 {
  height: 24px;
  position: relative;
  .auto-map {
    position: absolute;
    right: 5%;
  }
  .table-text {
    position: absolute;
    bottom: 0;
  }
  .create-table {
    position: absolute;
    right: 0;
  }
}
.name-inpt {
  width: 100%;
  display: flex;
  ::v-deep .el-select {
    width: 100%;
  }
}
.map-box {
  padding: 0 16px;
  font-size: 14px;
  line-height: 24px;
  color: #606266;
}
.align-text {
  text-indent: 2em;
}
</style>
