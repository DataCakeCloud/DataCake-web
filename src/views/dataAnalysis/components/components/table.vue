<template>
  <div class="wrapper_table">
    <el-table ref="singleTable" border :class="['singleTable', tableOptions.format.transposition ? 'tansTable' : '']" stripe :data="handelTableData" highlight-current-row :cell-style="{ padding: '0', height: '30px' }" :header-cell-style="{ padding: '0', height: '36px' }" @sort-change="sortChange">
      <el-table-column v-if="tableOptions.format.indexType" type="index" width="50" :index="indexMethod" align="center">
        <template slot="header">序号</template>
      </el-table-column>
      <el-table-column v-for="item in transTableHeader" :key="item.valueKey" min-width="180" :prop="item.valueKey" :align="tableOptions.align" :show-overflow-tooltip="!tableOptions.format.wrap" sortable="custom">
        <template slot="header" slot-scope="scope">
          <span v-if="item.name && item.name.length * 14 < scope.column.realWidth">{{ item.name }}</span>
          <el-tooltip v-else effect="dark" :content="item.name" placement="top">
            <span style="max-width: 90%; display: inline-block">{{ item.name }}</span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <template v-if="!tableOptions.format.transposition">
            <span class="cell_label" :style="cellStyle(item.tremFormat, scope.row[item.valueKey])">
              <span v-if="item.showType === 'text'">
                {{ scope.row[item.valueKey] }}
              </span>
              <a v-else-if="item.showType === 'link'" :href="scope.row[item.valueKey]" target="_blank">
                {{ scope.row[item.valueKey] }}
              </a>
              <img v-else-if="item.showType === 'img'" :src="scope.row[item.valueKey]" />
            </span>
          </template>
          <template v-else>
            <span class="cell_label" :style="cellStyle(tremFormatFn(scope.row.valueKey).tremFormat, scope.row[item.valueKey])">
              <span v-if="tremFormatFn(scope.row.valueKey).showType === 'text'">
                {{ scope.row[item.name] }}
              </span>
              <a v-else-if="tremFormatFn(scope.row.valueKey).showType === 'link'" :href="scope.row[item.valueKey]" target="_blank">
                {{ scope.row[item.name] }}
              </a>
              <img v-else-if="tremFormatFn(scope.row.valueKey).showType === 'img'" :src="scope.row[item.valueKey]" />
            </span>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    tableOptions: {
      type: Object,
      default: () => {
        return {
          filterList: [],
          align: '',
          format: {
            indexType: false,
            transposition: false,
            wrap: false,
            auto: false
          },
          pagination: {
            paginationType: false,
            pageSize: 20,
            pageNum: 1,
            max: 1000
          }
        };
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    transTableHeader() {
      if (this.tableOptions.format.transposition) {
        const headerData =
          this.handelTableData[0] &&
          Object.keys(this.handelTableData[0]).map(item => {
            if (item !== 'valueKey') {
              return { name: item, valueKey: item };
            }
          });
        return headerData.filter(item => item);
      } else {
        return this.tableOptions.filterList;
      }
    },
    handelTableData() {
      let data = this.tableData;
      if (data.length <= 0) return [];
      if (this.tableOptions.format.transposition) {
        const titleHeader = this.tableOptions.filterList.map(item => item.valueKey);
        const result = {};
        titleHeader.forEach(key => {
          result[key] = data.map(item => item[key]);
        });
        const dataList = [];
        Object.keys(result).forEach(key => {
          const obj = {};
          obj.name = this.tableOptions.filterList.find(item => item.valueKey === key).name;
          obj.valueKey = key;
          result[key].forEach((v, i) => {
            obj['key' + i] = v;
          });
          dataList.push(obj);
        });
        data = dataList;
      }
      return data;
    }
  },
  methods: {
    sortChange(column) {
      this.$emit('sortChange', column);
    },
    indexMethod(index) {
      return (this.tableOptions.pagination.pageNum - 1) * this.tableOptions.pagination.pageSize + index + 1;
    },
    tremFormatFn(valueKey) {
      return this.tableOptions.filterList.find(item => item.valueKey === valueKey) || {};
    },
    cellStyle(data, v) {
      if (!data || (!v && v !== 0)) return {};
      const { symbol, value, viewColor } = data;
      let newVal = value;
      if (typeof v === 'number') {
        newVal = Number(value);
      }

      if (!symbol || (!newVal && newVal !== 0) || !viewColor) return {};
      if (symbol === 'lt') {
        if (v < newVal) return { 'background-color': viewColor, color: '#fff' };
      } else if (symbol === 'equal') {
        if (newVal === v) return { 'background-color': viewColor, color: '#fff' };
      } else if (symbol === 'gt') {
        if (v > newVal) return { 'background-color': viewColor, color: '#fff' };
      }
      return {};
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper_table {
  .el-table {
    border: none;
    ::v-deep .el-table__header-wrapper .cell {
      white-space: nowrap;
    }
    ::v-deep .el-table__body-wrapper {
      .cell {
        height: 100%;
        width: 100% !important;
        line-height: 30px;
        padding: 0;
        .cell_label {
          display: inline-block;
          width: 100%;
          height: 100%;
          span,
          a {
            display: inline-block;
            width: 100%;
            height: 100%;
            padding: 0 10px;
          }
        }
      }
    }
  }
  .tansTable {
    ::v-deep .el-table__header-wrapper {
      display: none;
    }
    ::v-deep .el-table__body-wrapper {
      border-top: 1px solid #e2e9f3;
      .el-table__row td {
        &:first-child {
          background-color: #f7f9ff;
        }
      }
    }
  }
}
</style>
