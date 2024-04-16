<template>
  <div class="content_box">
    <div ref="treeDom" class="content_left" :style="{ marginTop: titleMaxheight + 4 + 'px' }">
      <treeMap v-if="data.tree" :trees="data.tree" class="treeMap" />
    </div>
    <div class="container">
      <div class="top">
        <div v-for="(item, index) in topData.dataItemCom.listCom" :key="index" class="item">
          <div class="item_box">
            <el-tooltip v-for="(val, i) in item.list" :key="i" effect="dark" :content="`执行时间: ${formatTime(topData.dataItemCom.list[index][i])}`" placement="right" :enterable="false">
              <span class="block" :style="{ height: val + 'px', marginTop: titleMaxheight - val + 'px', display: 'inline-block' }"></span>
            </el-tooltip>
          </div>
          <div class="shadow" :class="!item.endTime && index === topData.dataItemCom.listCom.length - 1 ? 'delEndLine' : ''">
            <span class="date_start">{{ item.startTime }}</span>
            <span v-if="item.endTime" class="date_end">{{ item.endTime }}</span>
          </div>
          <div class="medianline" :style="[{ bottom: topData.avgTimeM + 'px', display: topData.avgTimeM === '0' ? 'none' : 'block' }]">
            <span v-if="index === topData.dataItemCom.listCom.length - 1" class="value">{{ topData.avgTime || ' ' }}</span>
          </div>
        </div>
      </div>
      <div class="content_item_right">
        <div v-for="(item, i) in data.list" :key="i" class="right_row">
          <div v-for="(val, index) in item" :key="index" class="item" :class="index === item.length - 1 && val.length < 5 ? 'delLine' : ''">
            <el-tooltip v-for="(result, ii) in val" :key="ii" effect="dark" placement="right" popper-class="task_tootip" :disabled="!result.state">
              <template #content>
                <div class="tootip-content">
                  <div>
                    <span>I D:</span>
                    <span>{{ result.task_id || '-' }}</span>
                  </div>
                  <div>
                    <span>名称:</span>
                    <span>{{ result.dagId || '-' }}</span>
                  </div>
                  <div>
                    <span>实例时间:</span>
                    <span>{{ result.executionDate || '-' }}</span>
                  </div>
                  <div>
                    <span>开始时间:</span>
                    <span>{{ result.start_date ? $utils.parseTime(result.start_date, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
                  </div>
                  <div>
                    <span>结束时间:</span>
                    <span>{{ result.end_date ? $utils.parseTime(result.end_date, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
                  </div>
                  <!-- <div>
                    <span>负责人:</span>
                    <span>{{ result.owner || '-' }}</span>
                  </div> -->
                </div>
                <div slot="footer" class="tootip-footer" style="margintop: 10px">
                  <el-button type="primary" :disabled="result.state === 'waiting' || result.state === 'waiting_queue'" @click="$emit('click-item', 'repeatCalc', result, 1)">重 算</el-button>
                  <el-button type="primary" @click="$emit('click-item', 'stop', result, 1)">停 止</el-button>
                  <el-button :disabled="!template_code_list.includes(result.template_code)" type="primary" @click="$emit('click-item', 'getSql', result, 1)">SQL</el-button>
                  <el-button type="primary" @click="$emit('click-item', 'getLogs', result, 1)">日 志</el-button>
                </div>
              </template>
              <span class="block" :style="nodeStyle(result)"></span>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import treeMap from './DAGTree.vue';

export default {
  components: {
    treeMap
  },
  props: {
    titleMaxheight: {
      type: Number,
      default: 150
    },
    data: {
      type: Object,
      default: () => {
        return {
          tree: {},
          list: []
        };
      }
    }
  },
  data() {
    return {
      template_code_list: ['Hive2Hive', 'Hive2Mysql', 'Hive2Clickhouse', 'SPARKJAR']
    };
  },
  computed: {
    topData() {
      const dataCopy = JSON.parse(JSON.stringify(this.data));
      const listData = dataCopy.list || [];
      if (listData.length === 0) {
        return {
          avgTime: 0,
          dataItemCom: {}
        };
      }
      const data = {};
      data.dataItemCom = {};
      const flatList = this.data.time_column.flat(Infinity);
      const minData = Math.min(...flatList);
      const maxData = Math.max(...flatList);
      const legend = maxData ? this.titleMaxheight / maxData : 1;
      data.minData = minData;
      data.maxData = maxData;
      data.dataItemCom.list = this.data.time_column;
      const columnList = JSON.parse(JSON.stringify(this.data.time_column));

      const histogram = this.data.histogram_start;
      data.dataItemCom.listCom = columnList.map((item, index, arr) => {
        for (let i = 0; i < item.length; i++) {
          item[i] = item[i] * legend;
        }
        const data = {
          list: item,
          startTime: histogram[index]
        };
        if (index === arr.length - 1 && this.data.endTime) data.endTime = this.data.endTime;
        return data;
      });
      const dataItemAllList = data.dataItemCom.listCom.flat(Infinity);
      const dataItemAlllength = data.dataItemCom.list.flat(Infinity).length;
      const sumData = dataItemAllList.reduce((a, b) => {
        for (let index = 0; index < b.list.length; index++) {
          a += b.list[index];
        }
        return a;
      }, 0); // 重定义数据后的和
      data.dataItemCom.histogram_start = this.data.histogram_start;
      data.avgTimeM = (sumData / dataItemAlllength).toFixed(0); // 平均时间高度
      data.avgTime = this.data.time_median; // 平均时间
      return data;
    }
  },
  methods: {
    formatTime(time) {
      const timeStr = this.$utils.formatSecondToHHmmss(time * 1000, true);
      let str = '';
      timeStr.split(':').forEach((v, i) => {
        if (!(v === '00')) {
          if (i === 0) {
            if (v.startsWith('0')) v = v.slice(1);
            str = str + v + ' Hours ';
          } else if (i === 1) {
            if (v.startsWith('0')) v = v.slice(1);
            str = str + v + ' Min ';
          } else if (i === 2) {
            if (v.startsWith('0')) v = v.slice(1);
            str = str + v + ' Sec ';
          }
        }
      });
      return str;
    },
    nodeStyle(data) {
      let className = {};
      if (data.state === 'waiting') {
        className = { backgroundColor: '#d7bdf2' };
      } else if (data.state === 'waiting_queue') {
        className = { backgroundColor: '#87e0f0' };
      } else if (data.state === 'running' || data.state === 'up_for_retry') {
        className = { backgroundColor: '$c-primary' };
      } else if (data.state === 'success') {
        className = { backgroundColor: '#67c23a' };
      } else if (data.state === 'failed' || data.state === 'termination') {
        className = { backgroundColor: '#f10d15' };
      } else {
        className = { backgroundColor: 'transparent', cursor: 'default' };
      }
      return className;
    }
  }
};
</script>

<style lang="scss" scoped>
.content_box {
  display: flex;
  height: 100%;
  padding: 8px 0;
  overflow-x: auto;
  .top {
    display: flex;
    .item {
      position: relative;
      .shadow {
        position: absolute;
        width: calc(100% + 2px);
        height: 35%;
        bottom: -2px;
        left: 0;
        border-right: 2px solid #666;
        border-bottom: 2px solid #666;
        &::after {
          content: '';
          position: absolute;
          top: -10px;
          right: -6px;
          width: 0;
          height: 0;
          border: 14px solid #666;
          border-top-width: 0;
          border-left-width: 5px;
          border-right-width: 5px;
          border-left-color: transparent;
          border-right-color: transparent;
        }
        .date_start {
          position: absolute;
          top: -25px;
          left: 0;
          transform: translateX(-50%);
          z-index: 1;
        }
        .date_end {
          position: absolute;
          top: -25px;
          right: 0;
          transform: translateX(50%);
          z-index: 1;
        }
      }
      .medianline {
        position: absolute;
        bottom: 30px;
        left: 0;
        height: 1px;
        width: 102%;
        border-bottom: 1px dotted #666;
        z-index: 2;
        .value {
          position: absolute;
          right: 0;
          top: -8px;
          transform: translateX(110%);
        }
      }
      .item_box {
        display: flex;
        padding: 0 20px;
        span {
          margin: 4px;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: #82c684;
          z-index: 1;
          cursor: pointer;
        }
      }
      &:last-child {
        .medianline {
          width: 125%;
        }
      }
    }
    .shadow.delEndLine {
      border-right: none;
      &::after {
        display: none;
      }
    }
    & > div:nth-child(1) {
      .shadow {
        border-left: 2px solid #666;
        &::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -6px;
          width: 0;
          height: 0;
          border: 14px solid #666;
          border-top-width: 0;
          border-left-width: 5px;
          border-right-width: 5px;
          border-left-color: transparent;
          border-right-color: transparent;
        }
      }
    }
  }
  .content_left {
    border-top: 2px solid #666;
    padding: 0;
    .treeMap {
      padding: 0 5px 0 0;
      margin: 0;
    }
  }
  .content_item_right {
    .right_row {
      display: flex;
      flex-wrap: nowrap;
      border-left: 2px solid #666;
      .item {
        display: flex;
        border-right: 2px solid #666;
        border-bottom: 2px solid #666;
        padding: 0 19px;
        span {
          margin: 4px;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: #82c684;
          cursor: pointer;
        }
        &.delLine {
          border-right: none;
        }
      }
    }
  }
}
.task_tootip {
  .tootip-content {
    & > div {
      margin-bottom: 1px;
    }
  }
  .tootip-footer {
    margin-top: 6px;
  }
}
</style>
