<template>
  <el-dialog title="添加事件依赖" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" :rules="rules" label-width="150px">
      <el-form-item label="事件类型" prop="type">
        <el-select v-model="ruleForm.type" class="dialog-select" placeholder="请选择事件类型">
          <el-option label="任务成功" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联任务" prop="dependId">
        <el-select v-model="ruleForm.dependId" class="dialog-select" placeholder="请选择关联任务，支持模糊搜索" filterable remote :remote-method="remoteMethod" :loading="loading">
          <el-option v-for="item in dependIdList" :key="item.id" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="依赖关联任务周期" prop="dependGra">
        <el-select v-model="ruleForm.dependGra" class="dialog-select" placeholder="请选择依赖关联任务周期">
          <el-option v-for="item in dependGraList" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="日期设置" required>
        <div v-for="(value, key) in ruleForm.dateCalculationParam" :key="dataMap[key]">
          <span class="detail-label">{{ dataMap[key] }}</span>
          <el-form-item v-if="value.type === 'offset'" class="i-block" label="偏移" label-width="80px">
            <el-input-number v-model="value.offset" label="偏移"></el-input-number>
          </el-form-item>
          <el-form-item v-else class="i-block" :label="'指定' + dataMap[key]" label-width="80px">
            <el-select v-model="value.range" :placeholder="'请选择指定' + dataMap[key]" multiple filterable style="width: 212px">
              <el-option v-for="item in rangeList[key]" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <div>
              L + <el-input-number v-model="rangeL[key].value" size="mini" class="input-num" controls-position="right" :min="rangeL[key].min" :max="rangeL[key].max"></el-input-number>
              <i class="el-icon-circle-plus" @click="addRange(value, key)"></i>
            </div>
          </el-form-item>
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
import { searchName } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  name: 'AddEvent',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      btnDisabled: false,
      index: null,
      rangeL: {
        month: { value: 0, min: -11, max: 11 },
        day: { value: 0, min: -27, max: 27 },
        hour: { value: 0, min: -23, max: 23 },
        minute: { value: 0, min: -59, max: 59 }
      },
      defaultParam: {
        year: { type: 'offset', offset: 0, range: [] },
        month: { type: 'offset', offset: 0, range: [] },
        day: { type: 'offset', offset: 0, range: [] },
        hour: { type: 'range', offset: 0, range: [] },
        minute: { type: 'range', offset: 0, range: [] }
      },
      ruleForm: {
        type: 1,
        dependId: '',
        dependGra: 'daily',
        dateCalculationParam: {
          year: { type: 'offset', offset: 0, range: [] },
          month: { type: 'offset', offset: 0, range: [] },
          day: { type: 'offset', offset: 0, range: [] },
          hour: { type: 'range', offset: 0, range: [] },
          minute: { type: 'range', offset: 0, range: [] }
        }
      },
      rules: {
        type: [{ required: true, message: '请选择事件类型', trigger: ['blur', 'change'] }],
        dependId: [{ required: true, message: '请选择关联任务', trigger: ['blur', 'change'] }],
        dependGra: [{ required: true, message: '请选择依赖关联任务周期', trigger: ['blur', 'change'] }]
      },
      dependIdList: [],
      defaultDependGraList: ['minutely', 'hourly', 'daily', 'weekly', 'monthly'], // 顺序很重要，不要改
      dependGraList: [],
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
      }
    };
  },
  watch: {
    'ruleForm.dependGra': {
      handler(news) {
        if (news === 'weekly') {
          if (!this.ruleForm.dateCalculationParam.weekly) {
            this.ruleForm.dateCalculationParam = this.insertKey('week', { type: 'offset', offset: 0, range: [] }, this.ruleForm.dateCalculationParam, 2);
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
        // 详细设置 根据 依赖关联任务周期 的不同而显示不同，大于等于 依赖关联任务周期dependGra 显示偏移,type为offset，小于 依赖关联任务周期dependGra 显示指定,type为range
        const graIndex = this.defaultDependGraList.findIndex(item => item === news);
        const dateArr = Object.keys(this.dataMap);
        dateArr.forEach((item, index) => {
          if (this.ruleForm.dateCalculationParam[item]) {
            if (index < graIndex) {
              this.ruleForm.dateCalculationParam[item].type = 'range';
            } else {
              this.ruleForm.dateCalculationParam[item].type = 'offset';
            }
          }
        });
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    showWin(depGra, row, index) {
      const depGraIndex = this.defaultDependGraList.findIndex(item => item === depGra);
      this.dependGraList = this.defaultDependGraList.slice(depGraIndex);
      this.dialogVisible = true;
      if (row) {
        this.ruleForm = tools.copyFn(row);
        this.index = index;
      } else {
        this.ruleForm.dateCalculationParam = tools.copyFn(this.defaultParam);
        this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
        this.index = null;
        this.ruleForm.dependGra = this.dependGraList[0];
      }
    },
    insertKey(key, value, obj, pos) {
      return Object.keys(obj).reduce((ac, a, i) => {
        if (i === pos) ac[key] = value;
        ac[a] = obj[a];
        return ac;
      }, {});
    },
    remoteMethod(value) {
      if (value !== '') {
        this.loading = true;
        searchName(value).then(res => {
          const data = res.data;
          this.loading = false;
          if (data) {
            this.dependIdList = data;
          } else {
            this.dependIdList = [];
          }
        });
      } else {
        this.dependIdList = [];
      }
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
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const data = tools.copyFn(this.ruleForm);
          this.$emit('save', data, this.index);
          this.dialogVisible = false;
        }
      });
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
</style>
