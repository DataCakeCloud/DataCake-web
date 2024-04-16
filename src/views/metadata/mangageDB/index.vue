<template>
  <div class="manage-db">
    <div class="search">
      <div class="search-item">
        <span class="label">库名称: </span>
        <el-input v-model="params.databaseName" clearable placeholder="请输入库名称"></el-input>
      </div>
      <!-- <div class="search-item">
        <span class="label">数据源类型: </span>
        <el-select v-model="params.region" clearable placeholder="请选择">
          <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div> -->
      <div class="search-item">
        <span class="label">描述信息: </span>
        <el-input v-model="params.description" clearable placeholder="请输入内容"></el-input>
      </div>
      <div class="search-item">
        <span class="label">归属用户组: </span>
        <el-select v-model="params.owner" clearable placeholder="请选择">
          <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.name"> </el-option>
        </el-select>
      </div>
      <!-- <div class="search-item">
        <span class="label">负责人: </span>
        <el-select
          v-model="params.owner"
          placeholder="请输入负责人"
          clearable
          filterable
          remote
          :remote-method="
            query => {
              remoteMethod(query);
            }
          "
          :loading="userLoading"
          popper-class="custom-popper"
          class="senior-input"
        >
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name"> </el-option>
        </el-select>
      </div> -->
      <div class="search-item db-width">
        <span class="label">创建时间: </span>
        <el-date-picker v-model="timer" clearable value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"> </el-date-picker>
      </div>
      <div class="search-btn">
        <el-button type="primary" @click="getList">查询</el-button>
      </div>
    </div>
    <div class="manage-content">
      <div class="tool">
        <el-button type="primary" @click="handelDb('add')">创建库</el-button>
      </div>
      <table-page v-loading="loading" class="table-box" :table-data="data" :column-data="columnData" table-height="calc(100vh - 244px)" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column label="操作" width="60">
          <template slot-scope="scope">
            <el-button type="text" @click="handelDb('edit', scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>

    <!-- 创建/修改 库 -->
    <CreateDb ref="createDb" :region-list="regionList" @addDbOk="getList" />
  </div>
</template>

<script>
import TablePage from '@/components/TablePage';
import * as tools from '@/utils/tools';
import { getGroupPage } from '@/api/jurisdiction';
// import { getUserList } from '@/api/task';
import CreateDb from '../step/components/CreateDb.vue';
import { getDbPage } from '@/api/metadata';

export default {
  name: 'ManageDB',
  components: {
    TablePage,
    CreateDb
  },
  data() {
    return {
      regionList: [],
      groupOptions: [],
      ownerList: [],
      loading: false,
      userLoading: false,
      data: [],
      columnData: [
        {
          prop: 'databaseName',
          label: '库名称',
          width: '130'
        },
        // {
        //   prop: 'region',
        //   label: '数据源类型',
        //   width: '130'
        // },
        {
          prop: 'description',
          label: '描述信息',
          width: '150'
        },
        {
          prop: 'owner',
          label: '归属用户组',
          width: '150'
        },
        {
          prop: 'location',
          label: 'Location',
          width: '150',
          tooltip: true
        },
        // {
        //   prop: 'owner',
        //   label: '负责人',
        //   width: '150'
        // },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '150',
          format: row => {
            return this.$utils.parseTime(row.createTime, '{y}/{m}/{d} {h}:{i}:{s}');
          }
        }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      params: {
        databaseName: '',
        region: '',
        description: '',
        groupName: '',
        owner: '',
        pageNum: 1,
        pageSize: 20
      },
      total: 0,
      timer: []
    };
  },
  async created() {
    const res = await tools.regionList;
    this.regionList = res || [];
    this.getGroupPage();
    this.getList();
  },
  methods: {
    handelDb(type, data) {
      if (type === 'add') {
        this.$refs.createDb?.showWin(this.regionList[0].value);
      } else {
        this.$refs.createDb?.showWin(data.region, data);
      }
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getGroupPage() {
      const params = {
        tenantId: this.$store.getters['userInfo'].tenantId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
    },
    // remoteMethod(query) {
    //   this.userLoading = true;
    //   getUserList(query)
    //     .then(res => {
    //       const data = res.data;
    //       this.ownerList = data;
    //     })
    //     .finally(() => {
    //       this.userLoading = false;
    //     });
    // },
    getList() {
      this.loading = true;
      const params = {
        ...this.params,
        region: this.regionList[0]?.value || ''
      };
      getDbPage(params)
        .then(res => {
          this.data = res.data.list || [];
          this.total = res.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.manage-db {
  padding: 15px;
  .search {
    display: flex;
    flex-wrap: wrap;
    &-item {
      display: flex;
      align-items: center;
      width: calc((100% - 125px) / 5);
      margin: 0 15px 10px 0;
      &.db-width {
        width: calc((100% - 125px) / 5 * 2);
      }
      .label {
        white-space: nowrap;
        margin-right: 5px;
      }
    }
  }
  .manage-content {
    border-top: 1px solid #d1d7e6;
    padding-top: 10px;
    .tool {
      text-align: end;
    }
    .table-box {
      margin-top: 10px;
    }
  }
}
</style>
