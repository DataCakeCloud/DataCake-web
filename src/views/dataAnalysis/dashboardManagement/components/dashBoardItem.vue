<template>
  <div class="dashBoardItem_content">
    <div class="item_title">
      <div class="title_l">
        <!-- <i v-if="!options.isDrag" class="el-icon-s-operation cursor-move" style="color: #c0c4cc"></i> -->
        <div v-if="!options.isDrag" class="move_bar"></div>
        <div class="title_l_r">
          <span class="name">{{ data.name }}</span>
          <span v-if="data.viewTime" class="time">{{ $utils.parseTime(data.viewTime) }}</span>
        </div>
      </div>
      <div class="title_r">
        <el-dropdown v-if="!options.isDrag" ref="expdropdown" placement="bottom-start" trigger="click">
          <span class="title_icon">
            <svg-icon icon-class="extendedMenu" class="svg_extendedMenu" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="editDashBoard(data)">编 辑</el-dropdown-item>
            <el-dropdown-item @click.native="delDashBoard(data)">删 除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div ref="itemBox" v-loading="!data.resData" class="item_box" :style="{ height: data.height - 50 + 'px' }">
      <template v-if="!nullData">
        <div v-if="data.type === 'table' && data.resData && data.resData.length > 0" class="item_item">
          <div v-if="data.param.tableSearhList && data.param.tableSearhList.length > 0" class="search">
            <div v-for="val in data.param.tableSearhList" :key="val.name" class="search_item">
              <span class="name">{{ val.name + ': ' }}</span>
              <el-input v-model="val.value" :placeholder="val.name" size="mini" clearable></el-input>
            </div>
          </div>
          <myTable :table-data="tableData" :table-options="{ ...data.param, ...data.param.form.params }" @sortChange="sortChange" />
          <el-pagination
            v-if="data.param.form.params.pagination.paginationType"
            background
            :total="filterData.length"
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="data.param.form.params.pagination.pageNum"
            :page-size="data.param.form.params.pagination.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
        <div v-else class="item_item">
          <chart
            v-if="data.resData && data.resData.length > 0"
            :key="data.height"
            :data="Object.assign({}, { result: data.resData, type: data.columnList })"
            v-bind="Object.assign({}, { chartConfig: data.param.form, chartConfigOptions: Object.assign(data.param.chartOptions, { chartHeight: data.height - 60, padding: setPadding(data) }) })"
          />
        </div>
      </template>
      <el-empty v-else description="暂无数据"></el-empty>
    </div>
  </div>
</template>

<script>
import chart from '../../components/components/chart.vue';
import myTable from '../../components/components/table.vue';
import { numberType } from '@/views/dataAnalysis/util';

export default {
  components: {
    chart,
    myTable
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          resData: []
        };
      }
    },
    options: {
      type: Object,
      default: () => {
        return {
          isDrag: false
        };
      }
    }
  },
  data() {
    return {
      filterType: false,
      nullData: false
    };
  },
  computed: {
    tableData() {
      let data = this.filterData;
      if (this.filterType) {
        const resData = JSON.parse(JSON.stringify(data));
        data = resData.sort(this.sortFun(this.filterColumn.prop, this.filterColumn.order === 'ascending'));
      }

      // 分页
      if (this.data.param.form.params && this.data.param.form.params.pagination.paginationType) {
        const start = this.data.param.form.params.pagination.pageSize * (this.data.param.form.params.pagination.pageNum - 1);
        const end = start + this.data.param.form.params.pagination.pageSize;
        data = data.slice(start, end);
      }

      return data;
    },
    filterData() {
      let data = this.data.resData;

      //  筛选条件 (表格配置筛选条件)
      if (this.data.param.tableSearhList && this.data.param.tableSearhList.length > 0 && this.data.param.tableSearhList.some(item => item.value.trim())) {
        const filterList = this.data.param.tableSearhList.filter(item => item.value.trim());
        const searchNames = filterList.map(item => item.valueKey);
        const searchValues = filterList.map(item => item.value);
        data = data.filter(item => {
          const res = [];
          searchNames.forEach((name, i) => {
            const typeObj = this.data.columnList.find(item => Object.keys(item)[0] === name);
            if (typeObj && numberType.includes(typeObj[Object.keys(typeObj)[0]])) {
              if (item[name] || item[name] === 0) res.push(item[name] === searchValues[i] * 1);
            } else {
              if (item[name]) res.push(item[name].includes(searchValues[i]));
            }
          });
          if (!res || res.length === 0) {
            return false;
          } else {
            return !res.some(item => !item);
          }
        });
      }
      return data;
    }
  },
  watch: {
    'data.height': {
      handler: function(val) {
        const dom = this.$refs.itemBox;
        if (dom) {
          dom.style.height = val - 65 + 'px';
        }
      }
    },
    'data.resData': {
      handler: function(data) {
        if (data && data.length === 0) {
          this.nullData = true;
        } else if (data) {
          this.nullData = false;
        }
      },
      immediate: true
    },
    'data.param.tableSearhList': {
      handler: function() {
        if (this.data.param.form.params && this.data.param.form.params.pagination.paginationType) {
          this.data.param.form.params.pagination.pageNum = 1;
        }
      },
      deep: true
    }
  },
  methods: {
    setPadding(data) {
      if (data.type === 'polygon') {
        return [0, 0, 20, 0];
      } else {
        const res = [10, 10, 40, 60];
        if (data.param.form.legend) {
          res[2] = 60;
        }
        if (data.param.form.axisY.name) {
          res[3] = 100;
        }
        return res;
      }
    },
    delDashBoard(data) {
      this.$confirm('确定要删除该图表吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delDashBoard', data);
      });
    },
    sortChange(column) {
      this.filterColumn = column;
      this.filterType = column.order;
    },
    sortFun(attr, rev) {
      // 第一个参数传入info里的prop表示排的是哪一列，第二个参数是升还是降排序
      if (rev === undefined) {
        rev = 1;
      } else {
        rev = rev ? 1 : -1;
      }
      return function(a, b) {
        const reg = /^[0-9]+.?[0-9]*$/;
        a = a[attr];
        b = b[attr];
        if (reg.test(a) && reg.test(b)) {
          a = Number(a);
          b = Number(b);
        }
        if (a < b) {
          return rev * -1;
        }
        if (a > b) {
          return rev * 1;
        }
        return 0;
      };
    },
    handleSizeChange(val) {
      this.data.param.form.params.pagination.pageSize = val;
    },
    handleCurrentChange(val) {
      this.data.param.form.params.pagination.pageNum = val;
    },
    editDashBoard(data) {
      window.open(`${this.$locationOrigin}/data-analysis/query?uuid=${data.uuid}&BIID=${data.id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.dashBoardItem_content {
  .item_title {
    display: flex;
    justify-content: space-between;
    position: relative;
    .title_l {
      .title_l_r {
      }
      .time {
        margin-left: 10px;
        font-size: $global-font-size-12;
        color: #ccc;
      }
      .move_bar {
        position: absolute;
        left: 50%;
        transform: translateY(-50%);
        top: -13px;
        width: 46px;
        height: 3px;
        border-radius: 3px;
        overflow: hidden;
        background-color: #ccc;
        cursor: move;
      }
    }
  }
  .item_box {
    margin-top: 5px;
    padding-bottom: 6px;
    overflow: auto;
    .item_item {
      .search {
        display: flex;
        flex-wrap: wrap;
        margin: 0 !important;
        .search_item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          margin-right: 10px;
          .name {
            display: inline-block;
            white-space: nowrap;
            margin-right: 5px;
          }
          .el-input {
            width: 140px;
            ::v-deep .el-input__inner {
              padding-left: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
