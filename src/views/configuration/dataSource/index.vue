<!--  chenyh1 -->
<template>
  <el-card class="box-card-container">
    <div class="search-condition-wrap">
      <search-condition label="数据源类型">
        <el-radio-group v-model="params.sourceType" size="small" @change="search">
          <el-radio-button v-for="item in dataSourceTypeList" :key="item.englishName" :label="item.englishName"> {{ item.chineseName }} </el-radio-button>
        </el-radio-group>
      </search-condition>
      <search-condition label="数据源名称">
        <el-input v-model.trim="params.query" class="search-box" placeholder="请输入数据源名称、描述信息进行搜索" @keyup.enter.native="search"></el-input>
      </search-condition>
      <search-condition label="负责人">
        <el-input v-model.trim="params.owner" class="search-box" placeholder="请输入负责人" @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="addSource">新建</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="pageNum" :page-size="params.limit" @changePage="changePage">
        <el-table-column fixed="right" label="操作" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" size="mini" :disabled="btnDisabled(scope.row)" :style="{ color: btnDisabled(scope.row) ? '#d1d7e6' : '#e6a23c' }" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" :disabled="btnDisabled(scope.row)" :style="{ color: btnDisabled(scope.row) ? '#d1d7e6' : '#FF5656' }" @click="deleteDataSource(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" title="数据源" width="600px">
      <detail ref="detail" :value="model" :loading="loading" @submit="submit"></detail>
    </el-dialog>
  </el-card>
</template>

<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { getDataSourceListByPage, addOrUpdate, deleteDataSource, getDataSourceDetail } from '@/api/dataSource';
import detail from './components/detail.vue';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';

export default {
  components: {
    SearchCondition,
    TablePage,
    detail
  },
  data() {
    return {
      params: {
        sourceType: 'metis',
        query: '',
        owner: '',
        limit: 10,
        offset: 0
      },
      pageNum: 1,
      total: 0,
      tableData: [],
      loading: false,
      dataSourceTypeList: [
        // { englishName: 'mysql', chineseName: 'mysql' },
        { englishName: 'metis', chineseName: 'metis' },
        { englishName: 'clickhouse', chineseName: 'clickhouse' }
      ],
      dialogVisible: false,
      model: null,
      columnData: [
        {
          prop: 'name',
          label: '数据源名称',
          width: '150',
          tooltip: true
        },
        {
          prop: 'sourceType',
          label: '数据源类型',
          width: '100'
        },
        {
          prop: 'description',
          label: '数据源描述',
          width: '150',
          tooltip: true
        },
        // {
        //   prop: 'owner',
        //   label: '负责人',
        //   width: '100'
        // },
        {
          prop: 'creator',
          label: '创建人',
          width: '100'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '140',
          format: row => {
            return this.$utils.parseTime(row.createTime);
          }
        },
        {
          prop: 'updater',
          label: '更新人',
          width: '100'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '140',
          format: row => {
            return this.$utils.parseTime(row.updateTime);
          }
        },
        {
          prop: 'env',
          label: '区域',
          width: '100',
          format: row => {
            const obj = this.regionList.find(item => item.value === row.env);
            if (obj) {
              return obj.label;
            } else {
              return '-';
            }
          }
        },
        {
          prop: 'url',
          label: '源信息',
          width: '180',
          tooltip: true
        },
        {
          prop: 'securityLevel',
          label: '安全等级',
          width: '100'
        },
        {
          prop: '',
          label: '是否可用',
          width: '80',
          format: () => {
            return '-';
          }
        }
      ],
      regionList: []
    };
  },
  computed: {
    ...mapGetters(['isAdmin']),
    userId() {
      let userId;
      if (this.$store.getters.userInfo) {
        userId = this.$store.getters.userInfo.userId;
      } else {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
          userId = JSON.parse(userInfo).userId;
        }
      }
      return userId;
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.model = null;
      }
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    this.init();
    this.getDataSourceByPage();
  },
  methods: {
    init() {
      // 暂时写死数据源类型
      // getDataSourceList().then(res => {
      //   this.dataSourceTypeList = res;
      // });
    },
    getDataSourceByPage() {
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      if (params.owner) {
        params.owner = params.owner.split(',');
      }
      this.loading = true;
      getDataSourceListByPage(params)
        .then(res => {
          this.tableData = res.data;
          this.total = res.count;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    reset() {
      this.params = {
        sourceType: '',
        query: '',
        owner: '',
        limit: 10,
        offset: 0
      };
      this.getDataSourceByPage();
    },
    search() {
      this.pageNum = 1;
      this.params.offset = 0;
      this.getDataSourceByPage();
    },
    // handleCurrentChange(val) {
    //   this.pageNum = val;
    //   this.params.offset = this.params.limit * (val - 1);
    //   this.getDataSourceByPage();
    // },
    // handleSizeChange(val) {
    //   this.pageNum = 1;
    //   this.params.limit = val;
    //   this.params.offset = 0;
    //   this.getDataSourceByPage();
    // },
    changePage(page) {
      this.pageNum = page.pageNum;
      this.params.limit = page.pageSize;
      this.params.offset = this.params.limit * (page.pageNum - 1);
      this.getDataSourceByPage();
    },
    deleteDataSource(row) {
      this.$confirm('确定删除此数据源?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDataSource(row.guid).then(res => {
          this.getDataSourceByPage();
        });
      });
    },
    btnDisabled(row) {
      let flag = true;
      if (this.isAdmin) {
        flag = false;
      } else {
        if (row.creator === this.userId) {
          return false;
        }
      }
      return flag;
    },
    edit(row) {
      getDataSourceDetail(row.guid).then(res => {
        const data = res.data;
        this.model = data;
        this.dialogVisible = true;
      });
    },
    addSource() {
      this.dialogVisible = true;
    },
    submit(data) {
      if (data) {
        const params = { ...data };
        if (this.model) {
          params.guid = this.model.guid;
        }
        this.loading = true;
        addOrUpdate(params)
          .then(res => {
            this.dialogVisible = false;
            this.getDataSourceByPage();
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.dialogVisible = false;
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
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
