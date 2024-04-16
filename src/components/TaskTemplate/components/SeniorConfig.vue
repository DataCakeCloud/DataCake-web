<template>
  <el-dialog title="高级配置" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" label-width="120px">
      <el-form-item v-if="!['weekly', 'monthly'].includes(granularity)" label="是否配置周">
        <el-checkbox v-model="isConfigWeek" @change="changeWeek"></el-checkbox>
      </el-form-item>
      <el-form-item v-for="(value, key) in ruleForm.dateCalculationParam" :key="dataMap[key]" :label="dataMap[key] + ' 设置'" required>
        <el-radio-group v-model="value.type" :disabled="['month', 'week'].includes(key)">
          <el-radio label="offset">偏移模式</el-radio>
          <el-radio label="range">指定模式</el-radio>
        </el-radio-group>
        <div>
          <el-popover v-if="value.type === 'offset'" placement="bottom" width="371" trigger="click" @show="showPoppver(value)">
            <div>
              <el-radio-group v-model="isSingleOffset">
                <el-radio :label="true">单一偏移</el-radio>
                <el-radio :label="false">连续偏移</el-radio>
              </el-radio-group>
              <div style="margin-top: 15px">
                <span>偏移量：</span>
                <el-input-number v-if="isSingleOffset" v-model="singleOffset" size="mini" label="描述文字"></el-input-number>
                <template v-else>
                  <el-input-number v-model="minRangeValue" size="mini" controls-position="right" :min="-168" :max="maxRangeValue"></el-input-number> ~
                  <el-input-number v-model="maxRangeValue" size="mini" controls-position="right" :min="minRangeValue" :max="168"></el-input-number>
                </template>
              </div>
            </div>
            <div class="popover-footer">
              <el-button size="mini" @click="closePopover">取消</el-button>
              <el-button type="primary" size="mini" @click="savePopover(value)">确定</el-button>
            </div>
            <span slot="reference" class="popover-text">{{ value.unitOffset }}</span>
          </el-popover>
          <template v-else>
            <el-select v-model="value.range" :placeholder="'请选择指定' + dataMap[key]" multiple filterable style="width: 212px">
              <el-option v-for="item in rangeList[key]" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <div>
              L + <el-input-number v-model="rangeL[key].value" size="mini" class="input-num" controls-position="right" :min="rangeL[key].min" :max="rangeL[key].max"></el-input-number>
              <i class="el-icon-circle-plus" @click="addRange(value, key)"></i>
            </div>
          </template>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import * as tools from '@/utils/tools';

export default {
  name: 'AddEvent',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      btnDisabled: false,
      index: null,
      outKey: 'inputDataset',
      isConfigWeek: false,
      granularity: 'daliy',
      rangeL: {
        month: { value: 0, min: -11, max: 11 },
        day: { value: 0, min: -27, max: 27 },
        hour: { value: 0, min: -23, max: 23 },
        minute: { value: 0, min: -59, max: 59 }
      },
      defaultParam: {
        month: { type: 'offset', unitOffset: 0, range: [] },
        // week: { type: 'offset', unitOffset: 0, range: [] },
        day: { type: 'offset', unitOffset: 0, range: [] },
        hour: { type: 'offset', unitOffset: 0, range: [] },
        minute: { type: 'offset', unitOffset: 0, range: [] }
      },
      defaultParamKey: [],
      ruleForm: {
        dateCalculationParam: {
          month: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] },
          hour: { type: 'offset', unitOffset: 0, range: [] },
          minute: { type: 'offset', unitOffset: 0, range: [] }
        }
      },
      dataMap: {
        minute: '分钟',
        hour: '小时',
        day: '日',
        week: '周',
        month: '月',
        year: '年'
      }, // 顺序很重要，不要改
      rangeList: {
        day: Array.from({ length: 31 }, (v, k) => k + 1),
        hour: Array.from({ length: 24 }, (v, k) => k),
        minute: Array.from({ length: 60 }, (v, k) => k)
      },
      isSingleOffset: true,
      singleOffset: 0,
      minRangeValue: -1,
      maxRangeValue: 1
    };
  },
  methods: {
    showWin(key, row, index) {
      this.dialogVisible = true;
      this.outKey = key;
      this.index = index;
      this.granularity = row.granularity;
      this.isConfigWeek = false;
      if (row.granularity === 'minutely') {
        this.defaultParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] },
          hour: { type: 'offset', unitOffset: 0, range: [] },
          minute: { type: 'offset', unitOffset: 0, range: [] }
        };
      } else if (row.granularity === 'hourly') {
        this.defaultParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] },
          hour: { type: 'offset', unitOffset: 0, range: [] }
        };
      } else if (row.granularity === 'daily') {
        this.defaultParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] }
        };
      } else if (row.granularity === 'weekly') {
        this.defaultParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] }
        };
      } else if (row.granularity === 'monthly') {
        this.defaultParam = {
          month: { type: 'offset', unitOffset: 0, range: [] }
        };
      }
      this.defaultParamKey = Object.keys(this.defaultParam);
      if (row.useDateCalcuParam) {
        this.ruleForm.dateCalculationParam = tools.copyFn(row.dateCalculationParam);
        if (Object.keys(row.dateCalculationParam).includes('week')) {
          this.isConfigWeek = true;
        }
        this.resetDateC(row.granularity);
      } else {
        this.ruleForm.dateCalculationParam = tools.copyFn(this.defaultParam);
      }
    },
    resetDateC(granularity) {
      const keys = Object.keys(this.ruleForm.dateCalculationParam);
      if (granularity === 'hourly') {
        if (keys.includes('minute')) {
          delete this.ruleForm.dateCalculationParam.minute;
        }
        if (!keys.includes('month')) {
          this.$set(this.ruleForm.dateCalculationParam, 'month', { type: 'offset', unitOffset: 0, range: [] });
        }
        if (!keys.includes('day')) {
          this.$set(this.ruleForm.dateCalculationParam, 'day', { type: 'offset', unitOffset: 0, range: [] });
        }
        if (!keys.includes('hour')) {
          this.$set(this.ruleForm.dateCalculationParam, 'hour', { type: 'offset', unitOffset: 0, range: [] });
        }
      } else if (granularity === 'daily') {
        if (keys.includes('minute')) {
          delete this.ruleForm.dateCalculationParam.minute;
        }
        if (keys.includes('hour')) {
          delete this.ruleForm.dateCalculationParam.hour;
        }
        if (!keys.includes('month')) {
          this.$set(this.ruleForm.dateCalculationParam, 'month', { type: 'offset', unitOffset: 0, range: [] });
        }
        if (!keys.includes('day')) {
          this.$set(this.ruleForm.dateCalculationParam, 'day', { type: 'offset', unitOffset: 0, range: [] });
        }
      } else if (granularity === 'weekly') {
        if (keys.includes('minute')) {
          delete this.ruleForm.dateCalculationParam.minute;
        }
        if (keys.includes('hour')) {
          delete this.ruleForm.dateCalculationParam.hour;
        }
        if (keys.includes('day')) {
          delete this.ruleForm.dateCalculationParam.day;
        }
        if (!keys.includes('month')) {
          this.$set(this.ruleForm.dateCalculationParam, 'month', { type: 'offset', unitOffset: 0, range: [] });
        }
        if (!keys.includes('week')) {
          this.$set(this.ruleForm.dateCalculationParam, 'week', { type: 'offset', unitOffset: 0, range: [] });
        }
      } else if (granularity === 'monthly') {
        if (keys.includes('minute')) {
          delete this.ruleForm.dateCalculationParam.minute;
        }
        if (keys.includes('hour')) {
          delete this.ruleForm.dateCalculationParam.hour;
        }
        if (keys.includes('day')) {
          delete this.ruleForm.dateCalculationParam.day;
        }
        if (keys.includes('week')) {
          delete this.ruleForm.dateCalculationParam.week;
          this.isConfigWeek = false;
        }
        if (!keys.includes('month')) {
          this.$set(this.ruleForm.dateCalculationParam, 'month', { type: 'offset', unitOffset: 0, range: [] });
        }
      }
    },
    insertKey(key, value, obj, pos) {
      const object = Object.keys(obj).reduce((ac, a, i) => {
        if (i === pos) ac[key] = value;
        ac[a] = obj[a];
        return ac;
      }, {});
      return object;
    },
    changeWeek(value) {
      if (value) {
        if (!this.ruleForm.dateCalculationParam.week) {
          this.ruleForm.dateCalculationParam = this.insertKey('week', { type: 'offset', unitOffset: 0, range: [] }, this.ruleForm.dateCalculationParam, 1);
        }
        this.rangeList.day = Array.from({ length: 7 }, (v, k) => k + 1);
        this.rangeL.day.min = -6;
        this.rangeL.day.max = 6;
      } else {
        this.rangeList.day = Array.from({ length: 31 }, (v, k) => k + 1);
        this.rangeL.day.min = -27;
        this.rangeL.day.max = 27;
        delete this.ruleForm.dateCalculationParam.week;
      }
    },
    // changeType(value, key) {
    //   const currentIndex = this.defaultParamKey.indexOf(key);
    //   if (currentIndex < this.defaultParamKey.length - 1) {
    //     for (let i = currentIndex + 1; i < this.defaultParamKey.length; i++) {
    //       if (value === 'range') {
    //         this.$delete(this.ruleForm.dateCalculationParam, this.defaultParamKey[i]);
    //       } else if (value === 'offset') {
    //         this.$set(this.ruleForm.dateCalculationParam, this.defaultParamKey[i], this.defaultParam[this.defaultParamKey[i]]);
    //       }
    //     }
    //   }
    // },
    showPoppver(row) {
      const unitOffset = row.unitOffset.toString();
      if (unitOffset.indexOf('~') > -1) {
        const arr = unitOffset.split('~');
        this.minRangeValue = Number(arr[0]);
        this.maxRangeValue = Number(arr[1]);
        this.isSingleOffset = false;
      } else {
        this.singleOffset = Number(row.unitOffset);
        this.isSingleOffset = true;
      }
    },
    savePopover(row) {
      if (this.isSingleOffset) {
        row.unitOffset = this.singleOffset;
      } else {
        row.unitOffset = `${this.minRangeValue}~${this.maxRangeValue}`;
      }
      this.closePopover();
    },
    closePopover() {
      document.body.click();
    },
    addRange(value, key) {
      const currentNum = this.rangeL[key].value;
      const Lval = currentNum < 0 ? `L${currentNum}` : `L+${currentNum}`;
      value.range.push(Lval);
    },
    // resetForm() {
    //   this.$refs.ruleForm.resetFields();
    // },
    save() {
      const values = Object.values(this.ruleForm.dateCalculationParam);
      if (values.some(item => item.type === 'offset' && item.unitOffset === undefined)) {
        this.$message.warning('偏移模式设置不能为空');
        return;
      }
      if (values.some(item => item.type === 'range' && item.range.length === 0)) {
        this.$message.warning('指定模式设置不能为空');
        return;
      }
      const data = tools.copyFn(this.ruleForm.dateCalculationParam);
      this.$emit('save', this.outKey, data, this.index);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.ruleForm {
  .dialog-select {
    width: 80%;
  }
  .detail-label {
    display: inline-block;
    width: 30px;
    vertical-align: top;
  }
  .input-num {
    width: 65px;
  }
  ::v-deep .el-input-number.is-controls-right .el-input__inner {
    padding-right: 25px;
    padding-left: 5px;
  }
  .el-icon-circle-plus {
    cursor: pointer;
    color: $c-primary;
    margin-left: 10px;
  }
}
.popover-text {
  cursor: pointer;
  display: inline-block;
  width: 90px;
  text-align: center;
  padding: 3px 0;
  border: 1px solid #d1d7e6;
  border-radius: 4px;
  line-height: normal;
  min-height: 25px;
}
.popover-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
