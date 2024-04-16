<template>
  <el-dialog title="偏移量设置" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="resetForm">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" label-width="120px">
      <el-form-item v-if="outKey === 'detailSet'" label="数据周期">
        <el-select v-model="granularity" placeholder="请选择数据粒度" @change="changeGranularity">
          <el-option v-for="(value, key) in granularityToText" :key="key" :value="key" :label="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="偏移量设置" style="margin-bottom: 0">
        <el-radio-group v-model="ruleForm.offsetType" @change="clickPreview">
          <el-radio :label="1">
            单一偏移
            <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
              它是针对依赖任务的“任务周期”而言，比如：依赖任务的"任务周期"为"天"，偏移量设为“0”，则表示依赖任务的当天实例；偏移量设为“-1”，则表示依赖任务的前1天实例；依此类推；
              <i slot="reference" class="el-icon-info global-color-ca"></i>
            </el-popover>
          </el-radio>
          <el-radio :label="2">
            连续偏移
            <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
              它是针对依赖任务的“任务周期”而言，比如：依赖任务的"任务周期"为"天"，偏移量设为“-3~-1”，表示该依赖任务过去3天的全部实例，依此类推；
              <i slot="reference" class="el-icon-info global-color-ca"></i>
            </el-popover>
          </el-radio>
          <el-radio :label="3" :disabled="['monthly', 'weekly'].includes(granularity)">
            高级配置
            <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
              当当前任务与依赖任务呈现非规律性的依赖，比如：当前任务周期与依赖任务周期不一致、依赖任务的间隔呈离散性，可勾选此方式。
              <i slot="reference" class="el-icon-info global-color-ca"></i>
            </el-popover>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-divider class="divider"></el-divider>
      <el-form-item>
        <div style="border: 1px solid #dcdfe6; padding-top: 20px; padding-left: 10px; width: 380px">
          <el-form-item v-if="ruleForm.offsetType === 1" label="偏移量" label-width="100px;">
            <el-input-number v-model="ruleForm.singleOffset" :min="minOffset" :max="maxOffset" size="mini" label="描述文字" @change="clickPreview"></el-input-number> {{ granularityToText[granularity] || '' }}
          </el-form-item>
          <el-form-item v-if="ruleForm.offsetType === 2" label="偏移量" label-width="100px;">
            <el-input-number v-model="ruleForm.minRangeValue" size="mini" controls-position="right" :min="minOffset" :max="ruleForm.maxRangeValue" @change="clickPreview"></el-input-number> ~
            <el-input-number v-model="ruleForm.maxRangeValue" size="mini" controls-position="right" :min="ruleForm.minRangeValue" :max="maxOffset" @change="clickPreview"></el-input-number> {{ granularityToText[granularity] || '' }}
          </el-form-item>
          <template v-if="ruleForm.offsetType === 3">
            <el-form-item label="基础偏移量" style="margin-bottom: 0" label-width="100px;"></el-form-item>
            <el-form-item style="margin-bottom: 0">
              <el-form-item v-for="(value, key) in offsetObj" :key="dataMap[key]" :label="dataMap[key] + ' 偏移'">
                <span slot="label">
                  {{ dataMap[key] + ' 偏移' }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ formatTip(key) }}
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                </span>
                <el-input-number v-model="value.unitOffset" :min="min(key)" :max="max(key)" :disabled="isSetWeek && key === 'week'" size="mini" label="描述文字" @change="clickPreview"></el-input-number>
                <el-checkbox v-if="key === 'week'" v-model="isSetWeek" @change="clickPreview">不设置</el-checkbox>
              </el-form-item>
            </el-form-item>
            <el-form-item label="指定依赖" style="margin-bottom: 0" label-width="100px;"></el-form-item>
            <el-form-item style="margin-bottom: 0">
              <el-form-item v-for="(value, key) in rangeObj" :key="dataMap[key]" :label="dataMap[key] + ' 指定'">
                <span slot="label">
                  {{ dataMap[key] + ' 指定' }}
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    {{ formatTip(key) }}
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                </span>
                <el-select v-model="value.range" :placeholder="'请选择指定' + dataMap[key]" multiple filterable style="width: 212px" @change="clickPreview">
                  <el-option v-for="item in rangeList[key]" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div>
                  L + <el-input-number v-model="rangeL[key].value" size="mini" class="input-num" controls-position="right" :min="rangeL[key].min" :max="rangeL[key].max"></el-input-number>
                  <el-popover trigger="hover" placement="bottom" popper-class="tag-popper">
                    <div>L是"Last"的代指，当L是针对“小时”进行设置时，则代表1天中的最后一个小时，L-1代表1天中的第23个小时，L+1则代表第2天的第1个小时，依此类推；</div>
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                  <i class="el-icon-circle-plus global-color-ca" @click="addRange(value, key)"></i>
                </div>
              </el-form-item>
            </el-form-item>
          </template>
        </div>
      </el-form-item>
    </el-form>
    <div>
      <!-- <el-button type="text" @click="clickPreview">查看依赖预览</el-button> -->
      <template>
        <div class="preview-title">依赖预览<span style="font-size: 12px; color: #c0c4cc; margin-left: 15px">以当前任务最近一次调度为例</span></div>
        <el-table v-loading="tableLoading" :data="dependDate" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" max-height="380px">
          <el-table-column prop="current_date" label="当前时间" min-width="160" align="center" :formatter="formatter"></el-table-column>
          <el-table-column prop="curExecutionDate" label="当前任务入参时间" min-width="160" align="center" :formatter="formatter"></el-table-column>
          <el-table-column v-if="outKey === 'eventDepends'" prop="executionDate" :label="`前置任务(${taskId})入参时间`" min-width="220" align="center" :formatter="formatter">
            <template slot-scope="scope">
              <div v-for="item in scope.row.dependDate.dependDate" :key="item">{{ item }}</div>
            </template>
          </el-table-column>
          <el-table-column v-else prop="checkPath" label="检查路径" min-width="300" align="center">
            <template slot-scope="scope">
              <el-tooltip :disabled="isTipDisabled">
                <div slot="content">
                  <div v-for="item in scope.row.dependDate.checkPath" :key="item">{{ item }}</div>
                </div>
                <div>
                  <span v-for="item in scope.row.dependDate.checkPath" :key="item" class="ellipsis block" @mouseenter="isShowTooltip">{{ item }}</span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { preview } from '@/api/task';
import * as tools from '@/utils/tools';
import * as filters from '@/filters';

export default {
  name: 'OffsetConfig',
  data() {
    return {
      dialogVisible: false,
      index: null,
      outKey: 'inputDataset',
      isSetWeek: true,
      ruleForm: {
        offsetType: 1,
        singleOffset: 0,
        minRangeValue: -1,
        maxRangeValue: 0,
        dateCalculationParam: {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] },
          hour: { type: 'offset', unitOffset: 0, range: [] },
          minute: { type: 'offset', unitOffset: 0, range: [] }
        }
      },
      granularityToText: {
        // minutely: '分钟',
        hourly: '小时',
        daily: '天',
        weekly: '周',
        monthly: '月'
      },
      granularity: 'daily',
      outputGranularity: 'daily',
      dataMap: {
        minute: '分钟',
        hour: '小时',
        day: '日',
        week: '周',
        month: '月',
        year: '年'
      },
      rangeL: {
        month: { value: 0, min: -11, max: 11 },
        day: { value: 0, min: -27, max: 27 },
        hour: { value: 0, min: -23, max: 23 },
        minute: { value: 0, min: -59, max: 59 }
      },
      rangeList: {
        day: Array.from({ length: 31 }, (v, k) => k + 1),
        hour: Array.from({ length: 24 }, (v, k) => k),
        minute: Array.from({ length: 60 }, (v, k) => k)
      },
      dependDate: [],
      taskId: '',
      tableLoading: false,
      isShowTable: false,
      previewParams: {},
      isTipDisabled: false
    };
  },
  computed: {
    offsetObj() {
      const obj = {};
      for (const key in this.ruleForm.dateCalculationParam) {
        if (this.ruleForm.dateCalculationParam[key].type === 'offset') {
          obj[key] = this.ruleForm.dateCalculationParam[key];
        }
      }
      return obj;
    },
    rangeObj() {
      const obj = {};
      for (const key in this.ruleForm.dateCalculationParam) {
        if (this.ruleForm.dateCalculationParam[key].type === 'range') {
          obj[key] = this.ruleForm.dateCalculationParam[key];
        }
      }
      return obj;
    },
    minOffset() {
      let value = 0;
      switch (this.granularity) {
        case 'monthly':
          value = -12;
          break;
        case 'weekly':
          value = -52;
          break;
        case 'daily':
          value = -366;
          break;
        case 'hourly':
          value = -1000;
          break;
      }
      return value;
    },
    maxOffset() {
      let value = 0;
      switch (this.granularity) {
        case 'monthly':
          value = 12;
          break;
        case 'weekly':
          value = 52;
          break;
        case 'daily':
          value = 366;
          break;
        case 'hourly':
          value = 1000;
          break;
      }
      return value;
    }
  },
  methods: {
    // params 预览接口需要的参数
    showWin(key, row, outputGranularity, params, index) {
      this.previewParams = { ...params };
      // this.previewParams[params.key] = row;
      // delete this.previewParams.key;
      this.dialogVisible = true;
      this.outKey = key;
      this.index = index;
      this.granularity = row.granularity;
      this.outputGranularity = outputGranularity;
      this.taskId = row.taskId;
      this.getParam(row.granularity, outputGranularity);
      // 回显
      if (row.useDateCalcuParam) {
        this.ruleForm.offsetType = 3;
        for (const key in row.dateCalculationParam) {
          this.ruleForm.dateCalculationParam[key] = row.dateCalculationParam[key];
          if (key === 'week') {
            this.isSetWeek = false;
          }
        }
      } else {
        const unitOffset = row.unitOffset + '';
        if (unitOffset.indexOf('~') > -1) {
          this.ruleForm.offsetType = 2;
          const offsetArr = unitOffset.split('~');
          this.ruleForm.minRangeValue = Number(offsetArr[0]);
          this.ruleForm.maxRangeValue = Number(offsetArr[1]);
        } else {
          this.ruleForm.offsetType = 1;
          this.ruleForm.singleOffset = Number(unitOffset);
        }
      }
      this.clickPreview();
    },
    getParam(granularity, outputGranularity) {
      if (granularity === 'minutely') {
        this.ruleForm.dateCalculationParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'range', unitOffset: 0, range: [] },
          hour: { type: 'range', unitOffset: 0, range: [] },
          minute: { type: 'range', unitOffset: 0, range: [] }
        };
      } else if (granularity === 'hourly') {
        this.ruleForm.dateCalculationParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'range', unitOffset: 0, range: [] },
          hour: { type: 'range', unitOffset: 0, range: [] }
        };
        if (outputGranularity === 'daily' || outputGranularity === 'hourly') {
          this.ruleForm.dateCalculationParam = {
            month: { type: 'offset', unitOffset: 0, range: [] },
            week: { type: 'offset', unitOffset: 0, range: [] },
            day: { type: 'offset', unitOffset: 0, range: [] },
            hour: { type: 'range', unitOffset: 0, range: [] }
          };
        }
      } else if (granularity === 'daily') {
        this.ruleForm.dateCalculationParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'range', unitOffset: 0, range: [] }
        };
      } else if (granularity === 'weekly') {
        this.ruleForm.dateCalculationParam = {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] }
        };
      } else if (granularity === 'monthly') {
        this.ruleForm.dateCalculationParam = {
          month: { type: 'offset', unitOffset: 0, range: [] }
        };
      }
    },
    changeGranularity(value) {
      this.getParam(value, this.outputGranularity);
      if (value === 'weekly' || value === 'monthly') {
        this.ruleForm.offsetType = 1;
      }
      this.clickPreview();
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
    formatTip(value) {
      let text = '';
      switch (value) {
        case 'month':
          text = '自然月，0代表当前依赖任务本月份的实例；';
          break;
        case 'week':
          text = '自然周，大多数场景下无需设置此值，默认为0即可；只有当需要指定依赖任务的第几周的实例时才设置它；';
          break;
        case 'day':
          text = '自然日，需结合以上两个选项来理解，当月、周均为0时，这里的数值代表的是本月第X天的实例；如果月为-1、周为0则代表上月第X天的实例；';
          break;
        case 'hour':
          text = `1）大粒度依赖小粒度时，涉及跨多个周期依赖（比如：monthly任务依赖hourly任务）时，允许对该依赖任务的天、小时分别设置指定数值；依此类推；
2）小粒度依赖大粒度时，比如：hourly任务依赖monthly任务,无需对该依赖任务的月设置指定数值；`;
          break;
      }
      return text;
    },
    formatter(row, column, cellValue, index) {
      if (cellValue === '' || cellValue === null) {
        return '-';
      } else {
        return cellValue;
      }
    },
    min(key) {
      let value = 0;
      if (key === 'month') {
        value = -12;
      } else if (key === 'week') {
        value = -52;
      } else if (key === 'day') {
        value = -366;
      } else if (key === 'hour') {
        value = -1000;
      }
      return value;
    },
    max(key) {
      let value = 0;
      if (key === 'month') {
        value = 12;
      } else if (key === 'week') {
        value = 52;
      } else if (key === 'day') {
        value = 366;
      } else if (key === 'hour') {
        value = 1000;
      }
      return value;
    },
    clickPreview() {
      this.tableLoading = true;
      this.isShowTable = true;
      const params = { ...this.previewParams };
      params[params.key].granularity = this.granularity;
      if (this.ruleForm.offsetType === 3) {
        params[params.key].useDateCalcuParam = true;
        const dateCalculationParam = tools.copyFn(this.ruleForm.dateCalculationParam);
        if (this.isSetWeek) {
          delete dateCalculationParam.week;
        }
        params[params.key].dateCalculationParam = dateCalculationParam;
      } else {
        params[params.key].useDateCalcuParam = false;
        if (this.ruleForm.offsetType === 1) {
          params[params.key].unitOffset = this.ruleForm.singleOffset;
        } else if (this.ruleForm.offsetType === 2) {
          params[params.key].unitOffset = this.ruleForm.minRangeValue + '~' + this.ruleForm.maxRangeValue;
        }
      }
      delete params.key;
      preview(params).then(res => {
        const data = res.data;
        this.dependDate = [data];
        this.tableLoading = false;
      });
    },
    addRange(value, key) {
      const currentNum = this.rangeL[key].value;
      const Lval = currentNum < 0 ? `L${currentNum}` : `L+${currentNum}`;
      if (!value.range.includes(Lval)) {
        value.range.push(Lval);
        this.clickPreview();
      }
    },
    resetForm() {
      this.ruleForm = {
        offsetType: 1,
        singleOffset: 0,
        minRangeValue: -1,
        maxRangeValue: 0,
        dateCalculationParam: {
          month: { type: 'offset', unitOffset: 0, range: [] },
          week: { type: 'offset', unitOffset: 0, range: [] },
          day: { type: 'offset', unitOffset: 0, range: [] },
          hour: { type: 'offset', unitOffset: 0, range: [] },
          minute: { type: 'offset', unitOffset: 0, range: [] }
        }
      };
      this.isShowTable = false;
    },
    save() {
      const data = {};
      data.granularity = this.granularity;
      if (this.ruleForm.offsetType === 3) {
        data.useDateCalcuParam = true;
        const dateCalculationParam = tools.copyFn(this.ruleForm.dateCalculationParam);
        if (this.isSetWeek) {
          delete dateCalculationParam.week;
        }
        data.key = 'dateCalculationParam';
        data.value = dateCalculationParam;
      } else {
        data.useDateCalcuParam = false;
        data.key = 'unitOffset';
        if (this.ruleForm.offsetType === 1) {
          data.value = this.ruleForm.singleOffset;
        } else if (this.ruleForm.offsetType === 2) {
          data.value = this.ruleForm.minRangeValue + '~' + this.ruleForm.maxRangeValue;
        }
      }
      this.$emit('save', this.outKey, data, this.index);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-icon-circle-plus {
  cursor: pointer;
  margin-left: 10px;
}
.divider {
  margin: 5px 0 10px;
}
.preview-title {
  font-size: $global-font-size-16;
  margin-bottom: 10px;
}
</style>
