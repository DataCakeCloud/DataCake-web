<template>
  <el-drawer v-if="drawer" class="chartDrawer" :visible.sync="drawer" direction="rtl" :close="handleClose" size="85%">
    <template #title>
      <span class="title">{{ title }}</span>
    </template>
    <!-- <tableConfig v-if="chartType === 'table'" ref="tableConfig" :data="data" @cancel="cancel" @submit="submit" /> -->
    <chartConfig ref="chartConfig" :data="data" :loading="loading" @cancel="cancel" @submit="submit" />
  </el-drawer>
</template>

<script>
import { addChart, updateChart, chartClearCache } from '@/api/querydata';
// import tableConfig from './tableConfig.vue';
import chartConfig from './chartConfig.vue';
import { mapGetters } from 'vuex';
export default {
  components: {
    // tableConfig,
    chartConfig
  },
  props: {
    title: {
      type: String,
      require: true,
      default: ''
    },
    engine: {
      type: String,
      default: ''
    },
    chartType: {
      type: String,
      require: true,
      default: ''
    },
    data: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      drawer: false,
      loading: false
    };
  },
  computed: {
    ...mapGetters(['region'])
  },
  methods: {
    setData(data) {
      const copyObj = JSON.parse(JSON.stringify(data));
      if (copyObj.form.type !== 'table') Object.assign(copyObj, { chartOptions: { ...copyObj.chartOptions, chartId: copyObj.chartOptions.chartId + Math.random() }});
      this.$refs.chartConfig.setData(copyObj);
    },
    open() {
      this.drawer = true;
    },
    cancel() {
      this.drawer = false;
    },
    submit(data) {
      this.loading = true;
      let content = `SELECT * ,'{{ ds_nodash }}' as bidt FROM (${this.data.editSql}) b`;
      content = window.btoa(encodeURIComponent(content));
      if (data.form.type !== 'table') {
        data.chartOptions.chartId = 'chartId' + Math.random();
      }
      const params = {
        columnList: JSON.stringify(this.data.type),
        type: data.form.type,
        param: JSON.stringify(data),
        title: data.form.title,
        describe: data.form.describe,
        content,
        querySql: `SELECT * ,'{{ ds_nodash }}' as bidt FROM (${this.data.editSql}) b`,
        uuid: this.data.uuid,
        region: this.region,
        engine: this.engine
      };
      let fn = addChart;
      if (data.form.id) {
        let querySql;
        if (data.form.querySql) {
          querySql = data.form.querySql;
        } else {
          querySql = `SELECT * ,{{ ds_nodash }} as bidt FROM (${this.data.editSql}) b`;
        }
        params.id = data.form.id + '';
        params.querySql = querySql;
        params.content = data.form.content;
        fn = updateChart;
      }
      fn(params)
        .then(res => {
          if (res.codeStr === 'SUCCESS') {
            this.$message({
              type: 'success',
              message: '已保存至图表管理，您可以去图表管理中查看'
            });
            if (res.data && res.data.id) {
              data.form.id = res.data.id;
            }
            this.drawer = false;
            this.$emit('submit', data);
          }
        })
        .finally(_ => {
          chartClearCache();
          this.loading = false;
        });
    },
    handleClose() {}
  }
};
</script>

<style lang="scss" scoped>
.chartDrawer {
  ::v-deep .el-drawer__header {
    margin-bottom: 5px;
    .title {
      color: #445782;
      font-size: 16px;
      font-weight: 600;
    }
  }
  ::v-deep .el-drawer__body {
    margin-top: -10px;
  }
}
</style>
