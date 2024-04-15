<template>
  <div :class="{ 'table-fullscreen': fullscreen }">
    <el-empty v-if="!list.length && !loading" description="无成本变化数据" :image-size="120"></el-empty>
    <!-- :height="tableHeight" -->
    <el-table v-else v-loading="loading" :data="tableList" border :show-header="false" highlight-current-row>
      <template v-for="(item, index) in tableHeader">
        <el-table-column v-if="item === 'name'" :key="index" :prop="item" align="left" min-width="170px" fixed> </el-table-column>
        <el-table-column v-else :key="index" :prop="item" align="center" :fixed="item === 'sum' || item === 'basic' ? 'right' : false" :min-width="item === 'sum' ? '160px' : '100px'"> </el-table-column>
      </template>
    </el-table>
    <div class="btns">
      <el-pagination :current-page="params.page" :page-sizes="[20, 30]" :page-size="params.limit" layout="total, sizes, prev, pager, next, jumper" :total="params.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      <el-button type="primary" class="export-btn" @click="handleExport">导出 csv</el-button>
      <i class="el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'SummaryTable',
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    list: {
      type: Array,
      default: () => []
    },
    tableHeight: String,
    loading: Boolean
  },
  data() {
    return {
      filterList: this.$t('cost.filterList'),
      fullscreen: false
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    tableList() {
      if (!this.list.length) return;

      const item = this.filterList.find(e => e.value === this.params.queryGroup);
      const groupBy = item ? item['name'] : '';
      const list = this.list.reduce((a, b) => {
        const obj = {};
        obj['name'] = b['key'];
        b.objData.forEach(item => {
          obj[item.dt] = item.value;
        });
        obj.sum = b['value'];
        obj['basic'] = b['basic'];
        return [...a, obj];
      }, []);

      const dts = this.list[0].objData.map(e => e.dt);
      // const basics =
      //   list
      //     .map(e => e.basic)
      //     .reduce((a, b) => {
      //       if (isNaN(a)) a = 0;
      //       if (isNaN(b)) b = 0;
      //       return parseInt(a) + parseInt(b);
      //     }, 0) + '%';
      // const sumObj = { name: '总计-时间维度', basic: basics };
      let firstRow = { name: `${groupBy}（分组依据）` };
      const sum = 0;

      dts.forEach(e => {
        // sumObj[e] = list.map(val => val[e]).reduce((a, b) => a + b, 0);
        // sum += sumObj[e];
        firstRow[e] = e;
      });
      firstRow = Object.assign({}, firstRow, { sum: `总计 - ${groupBy} 维度`, basic: '总计环比' });

      // sumObj['sum'] = sum;
      list.unshift(firstRow);
      return list;
    },
    tableHeader() {
      if (!this.tableList) return;
      return Object.keys(this.tableList[0]);
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val);
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val);
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
      this.$emit('updateHeight', this.fullscreen);
    },
    handleExport() {
      const str = `user_id=${this.userInfo.userId}&tenant_name=${this.userInfo.tenantName}&`;
      const arr = [];
      const keys = Object.keys(this.params);

      keys.forEach(e => {
        const value = this.params[e];
        if (!Array.isArray(value)) {
          arr.push(`${e}=${value}&`);
        } else {
          const item = value.map(ee => `${e}=${ee}&`);
          arr.push(item);
        }
      });

      let query = arr.flat().join('');
      query = str + query.substr(0, query.length - 1);
      const href = `${process.env.VUE_APP_API_GATEWAY_PATH}cost/stat/excel?${query}`;
      window.open(href, '_blank');
    }
  }
};
</script>

<style lang="scss" rel="stysheet/sass" scoped>
::v-deep .el-pagination {
  padding: 0;
  margin-right: 10px;
}
.btns {
  display: flex;
  height: 50px;
  justify-content: flex-end;
  align-items: center;

  .export-btn {
    margin-right: 10px;
  }
}
</style>
