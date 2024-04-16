<template>
  <div class="wrapper">
    <h3 class="title">可视化图表列表</h3>
    <div class="search">
      <div class="search_item" @click="setSarch('my')">
        <i class="el-icon-s-cooperation"></i>
        <span class="label">全部图表</span>
      </div>
      <!-- <div class="search_item" @click="setSarch('my')">
        <i class="el-icon-user"></i>
        <span class="label">我的创建</span>
      </div> -->
      <div class="search_item" @click="setSarch('tuck')">
        <svg-icon icon-class="follow" class="title_follow"></svg-icon>
        <span class="label">我的收藏</span>
      </div>
      <div class="search_item" @click="setSarch('share')">
        <svg-icon icon-class="share1" class="share1" />
        <span class="label">分享列表</span>
      </div>
    </div>
    <div class="contnent">
      <el-table v-loading="loading" class="table" :data="tableData" style="width: 100%" :header-cell-style="{ padding: '3px 0' }">
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column type="index" :index="indexMethod" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="name" label="名称" sortable min-width="180" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="describeChart" label="描述" sortable min-width="150" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createBy" label="创建人"> </el-table-column>
        <el-table-column label="图表类型">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.type === 'table'" icon-class="chartTable" class="chartTable"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'line'" icon-class="chartLine" class="chartLine"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'interval' || scope.row.type === 'stack'" icon-class="chartColumn" class="chartColumn"></svg-icon>
            <svg-icon v-else-if="scope.row.type === 'polygon'" icon-class="rectChart" class="rectChart"></svg-icon>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <span>{{ $utils.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.isShare !== 1" effect="dark" content="编辑" placement="top" @click.native="edit(scope.row)">
              <i class="el-icon-edit icon"></i>
            </el-tooltip>
            <el-tooltip v-if="scope.row.isShare !== 1" effect="dark" :content="`${scope.row.isFavorate !== 1 ? '收藏' : '取消'}`" placement="top" @click.native="addTuckChart(scope.row)">
              <svg-icon icon-class="follow" :class="['title_follow', 'icon', scope.row.isFavorate === 1 ? 'disabled' : '']"></svg-icon>
            </el-tooltip>
            <el-tooltip v-if="scope.row.isShare !== 1" effect="dark" content="分享" placement="top" @click.native="shaerChart(scope.row)">
              <svg-icon icon-class="share1" class="share1 icon" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.isShare === 1" content="查看" placement="top" @click.native="lockChart(scope.row)">
              <svg-icon icon-class="eye-open-2" class="eye icon" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.isShare !== 1" effect="dark" content="删除" placement="top" @click.native="chartDel(scope.row)">
              <i class="el-icon-delete icon"></i>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-sizes="[10, 20, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" :current-page="params.pageNum" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>
    <dashBoardShare ref="dashBoardShare" @submitFn="shareSubmit" />
  </div>
</template>

<script>
import dashBoardShare from '../components/dashBoardShare.vue';
import { getChartList, chartDel, addTuckChart, chartTuckDel, shaerChart, chartClearCache } from '@/api/querydata';
import { mapGetters } from 'vuex';

export default {
  components: {
    dashBoardShare
  },
  data() {
    return {
      tableData: [],
      params: {
        title: '',
        pageSize: 20,
        pageNum: 1,
        type: 'my'
      },
      total: 0,
      loading: false,
      currentObj: {}
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  mounted() {
    // 分享过来的chart处理
    if (this.$route.query.BIID) {
      this.params.type = 'share';
    }
    this.getData();
  },
  methods: {
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    lockChart(data) {
      window.open(`${this.$locationOrigin}/data-analysis/query?uuid=${data.uuid}&BIID=${data.id}&chartGrade=1`);
    },
    edit(data) {
      window.open(`${this.$locationOrigin}/data-analysis/query?uuid=${data.uuid}&BIID=${data.id}`);
    },
    shareSubmit(data) {
      const params = {
        sharer: this.userInfo.userId,
        sharee: data.sharee,
        shareeEmail: data.shareeEmail,
        shareid: this.currentObj.id + '',
        shareUrl: this.$locationOrigin + `/data-analysis/chartManagement?uuid=${this.currentObj.uuid}`
      };
      shaerChart(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '分享成功'
          });
        }
      });
    },
    shaerChart(data) {
      this.currentObj = data;
      this.$refs.dashBoardShare.open();
    },
    setSarch(type) {
      this.params.type = type;
      this.params.pageNum = 1;
      this.getData();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getData();
    },
    addTuckChart(data) {
      let params = {
        favorId: data.id,
        type: 'chart',
        isActive: 1
      };
      let fn = addTuckChart;
      if (data.isFavorate === 1) {
        fn = chartTuckDel;
        params = { id: data.id + '', type: 'chart' };
      }
      fn(params)
        .then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: `${data.isFavorate === 1 ? '取消' : '收藏'}成功`
            });
          }
        })
        .finally(() => {
          chartClearCache();
          this.getData();
        });
    },
    chartDel(data) {
      this.$confirm(`确定要删除该图表?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        chartDel({ id: data.id + '' })
          .then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '删除成功'
              });
              this.getData();
            }
          })
          .finally(_ => {
            chartClearCache();
          });
      });
    },
    getData() {
      this.loading = true;
      getChartList(this.params)
        .then(res => {
          this.tableData = res.data.list || [];
          this.total = res.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 10px;
  .disabled {
    opacity: 0.3;
  }
  .title_follow {
    transform: scale(1.3);
    margin-bottom: -2px;
  }
  .share1 {
    margin-bottom: -2px;
  }
  .chartLine,
  .rectChart,
  .chartColumn {
    transform: scale(1.4);
  }
  .search {
    display: flex;
    margin: 20px 0;
    .search_item {
      cursor: pointer;
      margin-right: 50px;
    }
    .el-icon-user {
      color: $c-primary;
    }
    .el-icon-s-cooperation {
      color: $color-c3;
    }
  }
  .contnent {
    .table {
      ::v-deep .el-table__body-wrapper {
        min-height: calc(100vh - 232px);
        max-height: calc(100vh - 232px);
        overflow: auto;
      }
      .icon {
        cursor: pointer;
        margin-right: 10px;
      }
      .el-icon-edit {
        color: $c-primary;
      }
      .el-icon-delete {
        color: $color-cb;
      }
      .eye {
        color: $c-primary;
      }
    }
    .el-pagination {
      ::v-deep .el-pagination__total {
        margin-top: 3px;
      }
    }
  }
}
</style>
