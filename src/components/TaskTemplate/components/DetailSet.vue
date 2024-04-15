<template>
  <el-dialog :visible.sync="dialogVisible" title="设置数据路径" width="650px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" class="detail-set">
    <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" label-width="140px">
      <el-form-item label="检查依赖方式">
        <el-radio-group v-model="ruleForm.checkType">
          <el-radio :label="1">检查路径</el-radio>
          <el-radio :label="2">就绪时间</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="ruleForm.checkType === 1">
        <el-form-item label="路径:" class="tip-wrap">
          <el-popover placement="left" width="280" trigger="hover">
            <div>示例路径如下：<br />s3://AAA/BBB/CCC/dt=[[%Y-%m-%d]]/_SUCCESS</div>
            <i slot="reference" class="el-icon-info tips-icon" style="left: -60px"></i>
          </el-popover>
          <el-input v-model="ruleForm.check_path" type="textarea" rows="5" placeholder="请输入当前数据所在路径" class="dialog-input" clearable @change="changeCheckPath"></el-input>
          <div class="senior-wrap">
            <!--  v-show="isShowSenior" -->
            <el-button size="mini" type="text" @click="seniorConfig('detailSet', ruleForm)">高级配置</el-button>
            <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
              高级配置是对上述文件路径表达式进一步进行设置，以指定多个连续/离散的文件路径作为依赖；
              <i slot="reference" class="el-icon-info global-color-ca"></i>
            </el-popover>
            <div class="popover-text">
              <div v-if="ruleForm.useDateCalcuParam">
                <span v-for="(value, key) in ruleForm.dateCalculationParam" :key="key"> {{ value.type === 'range' && value.range.length === 0 ? '' : dataMap[key] + ':' }} {{ value.type === 'offset' ? `偏移${value.unitOffset};` : value.range.length ? `指定${value.range.join(',')};` : '' }} </span>
              </div>
              <span v-else class="i-block">{{ ruleForm.unitOffset }}</span>
            </div>
          </div>
          <template v-if="checkPath && checkPath.length">
            <div>输入提示：可使用下方推荐值填充</div>
            <div class="path-wrap">
              <div v-for="item in checkPath" :key="item" :class="['path-item', item === ruleForm.check_path ? 'active' : '']" @click="clickPath(item)">{{ item }}</div>
            </div>
          </template>
        </el-form-item>
      </template>
      <el-form-item v-if="ruleForm.checkType === 2" label="就绪时间:" class="tip-wrap">
        <!-- <el-popover placement="left" width="200" trigger="hover">
          <div>当前依赖就绪时间</div>
          <i slot="reference" class="el-icon-info tips-icon" style="left: -88px"></i>
        </el-popover>
        <Crontab ref="crontab" v-model="ruleForm.ready_time" :time-unit="ruleForm.granularity" input-class="crontab-class" @unit="changeUnit" /> -->
        <el-time-picker v-if="isTimePicker" v-model="ruleForm.success_time" class="crontab-class" placeholder="请选择就绪时间" format="HH:mm" value-format="HH:mm" clearable></el-time-picker>
        <template v-else>
          <el-select v-model="ruleForm.success_time" class="cron-input" placeholder="请选择就绪时间" clearable>
            <el-option v-for="item in minuteList" :key="item.value" :label="item.label" :value="item.label"></el-option>
          </el-select>
          分
        </template>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </span>
    <!-- <senior-config ref="seniorConfig" @save="saveConfig"></senior-config> -->
    <offset-config ref="offsetConfig" @save="saveOffset"></offset-config>
  </el-dialog>
</template>
<script>
// import Crontab from '@/components/Crontab';
// import SeniorConfig from './SeniorConfig';
import OffsetConfig from './OffsetConfig';

export default {
  name: 'DetailSet',
  components: {
    // Crontab,
    // SeniorConfig,
    OffsetConfig
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      // granularity: 'daily',
      dataMap: {
        minute: '分钟',
        hour: '小时',
        day: '日',
        week: '周',
        month: '月',
        year: '年'
      },
      granularityList: [],
      ruleForm: {
        checkType: 1,
        index: 0,
        isExternal: 1, // 1:外部数据 0:内部数据
        check_path: '',
        detailed_gra: '',
        detailed_dependency: '',
        granularity: 'daily',
        ready_time: '0 0 * * *',
        success_time: '',
        unitOffset: 0,
        useDateCalcuParam: false,
        dateCalculationParam: {}
      },
      isSingleOffset: true,
      singleOffset: 0,
      minRangeValue: -1,
      maxRangeValue: 1,
      checkPath: [],
      isRange: false,
      // minRangeValue: -168,
      // maxRangeValue: 168,
      hoursList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', 'L'],
      daysOfMonthList: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', 'L'],
      daysOfWeekList: ['1', '2', '3', '4', '5', '6', '7', 'L'],
      weeksOfMonthList: ['1', '2', '3', '4', 'L'],
      optionDisabled: false,
      outputGranularity: 'daily',
      preViewParams: {},
      isShowSenior: false,
      minuteList: []
    };
  },
  computed: {
    dependList() {
      if (this.ruleForm.detailed_gra === 'hourly') {
        return this.hoursList;
      } else if (this.ruleForm.detailed_gra === 'weekly') {
        return this.weeksOfMonthList;
      } else if (this.granularity === 'weekly') {
        return this.daysOfWeekList;
      } else {
        return this.daysOfMonthList;
      }
    },
    isTimePicker() {
      if (this.outputGranularity === 'daily' || this.outputGranularity === 'weekly' || this.outputGranularity === 'monthly') {
        return true;
      } else {
        return false;
      }
    }
  },
  // watch: {
  //   'ruleForm.granularity'(val) {
  //     this.$nextTick(() => {
  //       this.$refs.crontab.changeTimeUnit();
  //     });
  //   }
  // },
  created() {
    for (let i = 0; i < 60; i++) {
      this.minuteList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
  },
  methods: {
    // params 预览接口需要的参数
    showWin(index, row, outputGranularity, params) {
      this.resetForm();
      this.dialogVisible = true;
      this.outputGranularity = outputGranularity;
      this.preViewParams = params;
      this.ruleForm.index = index;
      // this.ruleForm.isExternal = row.isExternal;
      this.ruleForm.granularity = row.granularity || 'daily';
      this.checkPath = row.checkPathList;
      this.ruleForm.unitOffset = row.unitOffset;
      this.ruleForm.useDateCalcuParam = row.useDateCalcuParam;
      this.ruleForm.dateCalculationParam = row.dateCalculationParam;
      // if (row.isExternal) {
      if (row.success_time) {
        this.ruleForm.checkType = 2;
        // 当调度周期时天/周/月，而原success_time的值为只显示分钟时，需拼接上00:
        if (this.isTimePicker && row.success_time.indexOf(':') === -1) {
          this.ruleForm.success_time = '00:' + row.success_time;
        } else {
          this.ruleForm.success_time = row.success_time;
        }
      } else {
        this.ruleForm.checkType = 1;
        this.ruleForm.check_path = row.check_path;
        this.changeCheckPath(row.check_path);
        if (row.detailed_gra) {
          this.ruleForm.detailed_gra = row.detailed_gra;
        }
        this.ruleForm.detailed_dependency = row.detailed_dependency || '';
      }
      // } else {
      //   this.ruleForm.activeName = 'first';
      //   this.ruleForm.detailed_gra = row.detailed_gra;
      //   this.ruleForm.detailed_dependency = row.detailed_dependency || '';
      // }
      if (this.ruleForm.detailed_gra === 'hourly' && this.ruleForm.detailed_dependency[0].indexOf('~') > -1) {
        this.isRange = true;
        const valueArr = this.ruleForm.detailed_dependency[0].split('~');
        this.minRangeValue = Number(valueArr[0].substring(1));
        this.maxRangeValue = Number(valueArr[1].substring(1));
        this.ruleForm.detailed_dependency = '';
      }
    },
    changeCheckPath(value) {
      const reg = new RegExp('\\[\\[.*?]]');
      if (reg.test(value)) {
        this.isShowSenior = true;
      } else {
        this.isShowSenior = false;
      }
      this.preViewParams.dataDepend.check_path = value;
    },
    clickPath(item) {
      if (item === this.ruleForm.check_path) {
        this.ruleForm.check_path = '';
      } else {
        this.ruleForm.check_path = item;
      }
      this.changeCheckPath(this.ruleForm.check_path);
    },
    changeCheck(value, name) {
      if (value) {
        this.ruleForm[name] = false;
      }
    },
    changeDep(value) {
      if (value.length && value.includes('All')) {
        this.optionDisabled = true;
        this.ruleForm.detailed_dependency = ['All'];
      }
    },
    radioChange(text) {
      this.ruleForm.detailed_gra === text ? (this.ruleForm.detailed_gra = '') : (this.ruleForm.detailed_gra = text);
    },
    changeUnit(data) {
      this.ruleForm.granularity = data;
    },
    showPoppver() {
      if (!this.ruleForm.useDateCalcuParam) {
        const unitOffset = this.ruleForm.unitOffset.toString();
        if (unitOffset.indexOf('~') > -1) {
          const arr = unitOffset.split('~');
          this.minRangeValue = Number(arr[0]);
          this.maxRangeValue = Number(arr[1]);
          this.isSingleOffset = false;
        } else {
          this.singleOffset = Number(this.ruleForm.unitOffset);
          this.isSingleOffset = true;
        }
      }
    },
    savePopover() {
      if (this.isSingleOffset) {
        this.$set(this.ruleForm, 'unitOffset', this.singleOffset);
      } else {
        this.$set(this.ruleForm, 'unitOffset', `${this.minRangeValue}~${this.maxRangeValue}`);
      }
      this.$set(this.ruleForm, 'useDateCalcuParam', false);
      this.closePopover();
    },
    closePopover() {
      document.body.click();
    },
    seniorConfig(key, row) {
      // this.$refs.seniorConfig.showWin(key, row);
      this.$refs.offsetConfig.showWin(key, row, this.outputGranularity, this.preViewParams);
    },
    saveOffset(key, data) {
      // this.$set(this.ruleForm, 'dateCalculationParam', data);
      // this.$set(this.ruleForm, 'useDateCalcuParam', true);
      this.$set(this.ruleForm, 'granularity', data.granularity);
      this.$set(this.ruleForm, data.key, data.value);
      this.$set(this.ruleForm, 'useDateCalcuParam', data.useDateCalcuParam);
    },
    resetForm() {
      this.ruleForm = {
        checkType: 1,
        index: 0,
        isExternal: 1, // 1:外部数据 0:内部数据
        check_path: '',
        detailed_gra: '',
        detailed_dependency: '',
        granularity: 'daily',
        ready_time: '0 0 * * *',
        success_time: '',
        unitOffset: 0,
        useDateCalcuParam: false,
        dateCalculationParam: {}
      };
      this.isRange = false;
      this.isShowSenior = false;
    },
    save() {
      if (this.isRange) {
        const min = this.minRangeValue < 0 ? `L${this.minRangeValue}` : `L+${this.minRangeValue}`;
        const max = this.maxRangeValue < 0 ? `L${this.maxRangeValue}` : `L+${this.maxRangeValue}`;
        this.ruleForm.detailed_dependency = [`${min}~${max}`];
      }
      // if (this.ruleForm.isExternal) {
      //   if (this.ruleForm.check || this.ruleForm.checkCustom) {
      //     this.$emit('save', this.ruleForm);
      //     this.dialogVisible = false;
      //   } else {
      //     this.$message({
      //       type: 'warning',
      //       message: '检查路径和完成时间必须选择一种哦'
      //     });
      //   }
      // } else {
      // 如果设置为检查路径，并且没有高级配置，去掉granularity的值
      if (this.ruleForm.checkType === 1 && !this.isShowSenior) {
        this.ruleForm.granularity = '';
      }
      this.$emit('save', this.ruleForm);
      this.dialogVisible = false;
      // }
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-set {
  // ::v-deep .el-dialog__body {
  //   padding-top: 0;
  // }
  .dialog-input {
    width: 90%;
  }
  .tip-wrap {
    position: relative;
    .tips-icon {
      cursor: pointer;
      color: #409eff;
      top: 9px;
      position: absolute;
    }
  }
  .path-wrap {
    border: 1px solid #eee;
    padding: 0 10px;
    max-height: 300px;
    overflow-y: auto;
    .path-item {
      line-height: normal;
      border: 1px solid #ddd;
      margin: 10px 0;
      padding: 3px 5px;
      border-radius: 4px;
      cursor: pointer;
      &.active {
        background: #409eff;
        color: #fff;
      }
    }
  }
  .popover-text {
    // cursor: pointer;
    display: inline-block;
    width: 338px;
    text-align: center;
    padding: 3px 0;
    border: 1px solid #d1d7e6;
    border-radius: 4px;
    line-height: normal;
  }
}
.popover-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
