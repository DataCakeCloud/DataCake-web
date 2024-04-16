<template>
  <el-dialog v-loading="loading" title="监控报告" :visible="visible" width="60%" :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <el-tag v-if="report.status !== undefined" effect="dark" style="margin-bottom: 20px">{{ statusList.find(e => e.value === report.status)['name'] }}</el-tag>
    <el-tabs v-if="report.ruleResultList !== undefined" type="border-card" class="box-tab">
      <el-tab-pane label="监控条件">
        <template v-if="!report.ruleResultList.length">
          <el-empty description="无监控报告"></el-empty>
        </template>
        <template v-else>
          <template v-for="(item, index) in report.ruleResultList">
            <el-card :key="`detail_${index}`">
              <div slot="header" class="clearfix">
                <span>{{ `条件${index + 1}` }}</span>
              </div>
              <el-descriptions :column="2">
                <el-descriptions-item label="规则模板">{{ item.typeName }}</el-descriptions-item>
                <el-descriptions-item label="模板名称">{{ item.lastRuleResult.name }}</el-descriptions-item>
                <el-descriptions-item v-if="item.lastRuleResult.checkType === 'NUMBER'" label="监控字段">{{ item.fieldName }}</el-descriptions-item>
                <el-descriptions-item label="sql表达段">{{ item.lastRuleResult.sqlStatement }}</el-descriptions-item>
                <el-descriptions-item label="校验类型">{{ item.typeName }}</el-descriptions-item>
                <el-descriptions-item label="校验方式">{{ item.actionTypeName }}</el-descriptions-item>
                <el-descriptions-item label="比较方式">{{ item.operatorName }}</el-descriptions-item>
                <el-descriptions-item v-if="item.lastRuleResult.checkType === 'NUMBER'" label="阈值">{{ item.fixedValue }}</el-descriptions-item>
                <el-descriptions-item v-if="item.lastRuleResult.checkType === 'RATIO'" label="橙色阈值">{{ `${item.minValue}%` }}</el-descriptions-item>
                <el-descriptions-item v-if="item.lastRuleResult.checkType === 'RATIO'" label="红色阈值">{{ `${item.maxValue}%` }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            <template v-if="item.operators !== undefined">
              <el-tag v-if="index < report.ruleResultList.length - 1" :key="`tag_${index}`" type="info" effect="plain" style="position: relative; left: -30px; margin: 10px 0">{{ item.operators }}</el-tag>
            </template>
          </template>
        </template>
      </el-tab-pane>
    </el-tabs>
    <template v-for="(item, index) in report.ruleResultList">
      <div :key="`chart_${index}`">
        <div :id="`report_${index}_chart`" class="chart"></div>
        <el-divider v-if="index !== report.ruleResultList.length - 1"></el-divider>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { MetricReport } from '@/api/dqc';
import { parseTime } from '@/utils/';
import * as echarts from 'echarts/core';
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition]);

export default {
  name: 'Report',
  props: {
    reportData: {
      type: Object,
      default: () => {}
    },
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      report: {},
      loading: false,
      dialogVisiable: this.visible,
      statusList: this.$t('dqc.statusList'),
      ruleTypeList: this.$t('dqc.ruleTypeList'),
      checkTypeList: this.$t('dqc.checkTypeList'),
      checkActionLists: this.$t('dqc.checkActionList'),
      checkOperatorLists: this.$t('dqc.checkOperatorList'),
      ruleOperatorsList: this.$t('dqc.ruleOperatorsList'),
      option: {
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '',
            type: 'line',
            symbol: 'none',
            stack: 'Total',
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      }
    };
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
      if (this.dialogVisiable) this.metricReport();
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    render() {
      this.report.ruleResultList.forEach((e, index) => {
        const dom = document.getElementById(`report_${index}_chart`);
        const chart = echarts.init(dom);
        const option = JSON.parse(JSON.stringify(this.option));
        option.title.text = e.lastRuleResult.checkType === 'NUMBER' ? `指标最近波动图-${e.lastRuleResult.name}-${e.fieldName}-${index}` : `指标最近波动图-${e.lastRuleResult.name}`;
        option.series[0].data = e.yAxisData;

        if (this.report.checkInterval === 0) {
          option.xAxis[0].data = e.xAxisData.map(ee => {
            const time = parseTime(ee, '{y}/{m}/{d}');
            return time;
          });
        } else {
          option.xAxis[0].data = e.xAxisData.map(ee => {
            const time = parseTime(ee, '{h}:{i}');
            return time;
          });
        }
        chart.setOption(option, true);
      });
    },
    metricReport() {
      this.loading = true;
      this.report = {};
      MetricReport({ id: this.reportData.id }).then(res => {
        this.loading = false;
        if (res.resultCode !== 0) {
          this.$message({
            type: 'error',
            message: res.msg || '服务端错误'
          });
          return;
        }
        const data = res.data;
        data.ruleResultList.map((e, i) => {
          const item = e.lastRuleResult;
          const actionList = this.checkActionLists[item.checkType];
          const operatorList = this.checkOperatorLists[item.checkType];
          const typeName = this.checkTypeList.find(ee => ee.value === item.checkType)['name'];
          const actionName = actionList.find(ee => ee.value === item.checkAction)['name'];
          const operatorName = operatorList.find(ee => ee.value === item.checkOperator)['name'];
          const actionTypeName = `${typeName}-${actionName}`;
          const checkValue = item.checkValue ? JSON.parse(item.checkValue) : '';
          const fixedValue = checkValue.fixedValue;
          const minValue = checkValue.min;
          const maxValue = checkValue.max;
          const fieldList = item.params.indexOf('{') !== -1 ? JSON.parse(item.params) : [];
          const fieldName =
            (fieldList.length &&
              fieldList
                .map((ee, i) => {
                  return ee.tableField;
                })
                .join(', ')) ||
            '';

          e.typeName = typeName;
          e.actionTypeName = actionTypeName;
          e.operatorName = operatorName;
          if (fixedValue) {
            e.fixedValue = fixedValue;
          } else {
            e.minValue = minValue;
            e.maxValue = maxValue;
          }
          e.fieldName = fieldName;
          if (i < data.ruleResultList.length - 1) {
            e.operators = this.ruleOperatorsList.find(ee => ee.value === data.ruleOperators[i])['name'];
          }
          return e;
        });
        this.report = data;

        this.$nextTick(_ => {
          this.render();
        });
      });
    },
    cancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.box-tab {
  margin-bottom: 20px;
  ::v-deep .el-tabs__content {
    overflow: unset;
  }
}
.chart {
  height: 300px;
}
</style>
