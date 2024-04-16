<template>
  <div class="ganttChart_box">
    <div class="map">
      <treeMap v-if="data.tree" :trees="data.tree" class="treeMap" />
      <div class="ganteMap">
        <div class="axis-scroll-wrapper">
          <Axis v-if="data.internal" class="ganttChart_axis" :start-time="data.startDate" :end-time="data.endDate" :scale="data.internal === 1 ? data.internal : data.internal / 60" :min-unit="10" @unitsChange="unitsChange" />
          <Waterfall v-if="data.internal" :start-time="data.startDate" :end-time="data.endDate" :instances="mapList" :scale="data.internal === 1 ? data.internal : data.internal / 60" :style="{ width: axisWidth + 'px' }" @click-item="clickItem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import treeMap from '../histogram/DAGTree';
import Axis from './Axis.vue';
import Waterfall from './Waterfall.vue';

export default {
  components: {
    treeMap,
    Waterfall,
    Axis
  },
  props: {
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
      axisWidth: 0
    };
  },
  computed: {
    mapList() {
      const list = this.data.nodeList || [];
      const copyList = JSON.parse(JSON.stringify(list));
      const data = copyList.flat(Infinity) || [];
      return data;
    }
  },
  methods: {
    unitsChange(data = 0, unitPixel = 0) {
      this.axisWidth = data * unitPixel;
    },
    clickItem(type, data) {
      this.$emit('click-item', type, data, 2);
    }
  }
};
</script>

<style lang="scss" scoped>
.ganttChart_box {
  .title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 15px;
    margin: 0 -20px;
    border-bottom: 1px solid #e1e5ef;
    .title_lf {
      padding-left: 10px;
      font-size: $global-font-size-14;
    }
    .title_right {
      display: flex;
      .item_legend {
        display: flex;
        align-items: center;
        margin-right: 20px;
        i {
          width: 14px;
          height: 14px;
          border: 1px solid #333;
          margin-right: 6px;
        }
      }
    }
  }
  .map {
    display: flex;
    margin-top: 20px;
    .treeMap {
      margin: 40px 0 0 0;
      padding: 0;
    }
    .ganteMap {
      margin-left: 5px;
      padding-left: 15px;
      padding-bottom: 15px;
      overflow: auto;
    }
  }
  .ganttChart_axis {
    margin-bottom: 20px;
  }
}
</style>
