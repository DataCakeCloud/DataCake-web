<template>
  <div class="data-warp">
    <div class="title">
      <div class="lf">
        <span class="lf-title">
          数据探查
          <el-tooltip placement="top">
            <div slot="content">
              数据探查规则: <br />
              1.字符串和时间类型的字段统计占比TOP2的数据以及其他值(otherValue)的占比<br />
              2.数据类型的字段以直方图形式统计数据分布情况,鼠标移动到右上角的"详细"展示当前列的sum、averge、min、max聚合值<br />
              3.枚举类型的字段以饼图形式 统计数据分布情况
            </div>
            <svg-icon class="toolbar-icon-question svg_help" icon-class="help" />
          </el-tooltip>
        </span>
        <span class="lf-total">
          Count
          <el-tooltip content="探查总条数" placement="top">
            <svg-icon class="toolbar-icon-question svg_help" icon-class="help" />
          </el-tooltip>
          :{{ probTotal }}
        </span>
      </div>
      <div class="ri" @click="closePage">关闭</div>
    </div>
    <el-table :data="showData" stripe class="resultTable" border>
      <el-table-column>
        <el-table-column type="index" :index="indexMethod" label="序号" width="50" align="center"></el-table-column>
      </el-table-column>
      <el-table-column v-for="item in resProp" :key="item.prop" min-width="180">
        <template slot="header" slot-scope="scope">
          <TableTitle :scope="{ scope, ...item.obj }" :tab-nam="item.prop" />
        </template>
        <el-table-column :prop="item.prop" :label="formatLabel(item.prop)" min-width="180">
          <template slot-scope="scope">
            <template v-if="scope.row[item.prop] && scope.row[item.prop].length > 22">
              <el-tooltip class="item" effect="dark" :content="scope.row[item.prop]" placement="top">
                <div class="ellipsis" style="max-width: 350px">{{ scope.row[item.prop] }}</div>
              </el-tooltip>
            </template>
            <template v-else>
              <div>{{ scope.row[item.prop] }}</div>
            </template>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import TableTitle from './TableTitle';

export default {
  name: 'DataExploration',
  components: {
    TableTitle
  },
  props: {
    showData: {
      type: Array,
      default() {
        return [];
      }
    },
    meta: {
      type: Array,
      default() {
        return [];
      }
    },
    repeatMeta: {
      type: Object,
      default() {
        return {};
      }
    },
    probeData: {
      type: Array,
      default() {
        return [];
      }
    },
    probTotal: {
      type: Number || undefined,
      default: 0
    }
  },
  data() {
    return {};
  },
  computed: {
    resProp() {
      const meta = JSON.parse(JSON.stringify(this.meta));
      return meta.map(item => {
        const obj = this.probeData.find(val => val.volume === item);
        return { prop: item, obj };
      });
    }
  },
  methods: {
    closePage() {
      this.$parent.explorationShow = false;
    },
    // 重复表头的处理
    formatLabel(label) {
      return this.repeatMeta[label] ? this.repeatMeta[label] : label;
    },
    indexMethod(index) {
      return (this.$parent.pageNum - 1) * this.$parent.pageSize + index + 1;
    }
  }
};
</script>

<style lang="scss" scoped>
.data-warp {
  .title {
    height: 25px;
    display: flex;
    justify-content: space-between;
    .lf {
      .lf-title {
        margin-right: 20px;
      }
    }
    .ri {
      margin-right: 20px;
      cursor: pointer;
    }
  }
  height: 100%;
  width: 100%;
  .el-table {
    border: none;
    ::v-deep thead {
      tr:nth-child(1) {
        height: 100px;
        th {
          overflow: visible;
        }
        .el-table__cell {
          padding: 0;
          .cell {
            height: 100%;
            padding: 0;
            overflow: visible;
          }
        }
      }
    }
    ::v-deep tr td:first-child,
    ::v-deep tr th:first-child {
      width: 50px;
      padding-left: 0px;
      padding-right: 0px;
      .cell {
        padding: 0px !important;
      }
    }
    ::v-deep .el-table__cell {
      padding: 2px 0;
    }
  }
}
</style>
