<template>
  <el-card class="cluster-list box-card-container">
    <!-- <search-group class="bg-white mb10" :show-fold-btn="false" @reset="reset" @search="search">
      <search-item :span="8" :label="$t('common.name')">
        <el-input v-model="params.name" class="search-input" :placeholder="$t('cluster.nameRule')" clearable @keyup.enter.native="search"></el-input>
      </search-item>
    </search-group> -->
    <div class="search-condition-wrap">
      <search-condition :label="$t('common.name')">
        <el-input v-model.trim="params.name" class="search-box" :placeholder="$t('cluster.nameRule')" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="add">新建</el-button>
    </div>
    <div class="table-wrap">
      <!-- <div class="btn-wrap">
        <el-button type="primary" @click="add">新建</el-button>
      </div> -->
      <table-page v-loading="loading" :table-data="data" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" :label="$t('common.operation')" min-width="120">
          <template slot-scope="scope">
            <router-link :to="{ path: '/config/cluster/detail', query: { id: scope.row.id } }">{{ $t('common.edit') }}</router-link>
            <el-button type="text" class="global-color-cb" @click="deleteCluster(scope.row.id)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
  </el-card>
</template>

<script>
// import SearchGroup from '@/components/SearchGroup';
// import SearchItem from '@/components/SearchItem';
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { getClusterListPage, deleteCluster } from '@/api/cluster.js';

export default {
  components: {
    // SearchGroup,
    // SearchItem,
    SearchCondition,
    TablePage
  },
  data() {
    return {
      params: {
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      loading: false,
      data: [],
      columnData: [
        {
          prop: 'name',
          label: this.$t('common.name'),
          width: '120'
        },
        {
          prop: 'description',
          label: this.$t('common.description'),
          width: '120'
        },
        {
          prop: 'createTime',
          label: this.$t('common.createTime'),
          width: '180',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        }
      ],
      total: 0
    };
  },
  created() {
    this.getClusterListPage();
  },
  methods: {
    search() {
      this.params.pageNum = 1;
      this.getClusterListPage();
    },
    reset() {
      this.params = {
        name: '',
        pageNum: 1,
        pageSize: 10
      };
      this.getClusterListPage();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getClusterListPage();
    },
    getClusterListPage() {
      this.loading = true;
      getClusterListPage(this.params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    add() {
      this.$router.push('/config/cluster/detail');
    },
    deleteCluster(id) {
      this.$confirm('确定删除此集群?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCluster(id).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getClusterListPage();
        });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.cluster-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    padding: 15px;
    position: relative;
    .create {
      position: absolute;
      right: 15px;
      top: 20px;
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
}
</style>
