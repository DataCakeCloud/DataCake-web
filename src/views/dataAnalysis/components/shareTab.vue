<template>
  <div class="shartTab-box">
    <div class="condition-box">
      <div class="condition-search">
        <div class="condition-item">
          <span class="label">SQL: </span>
          <el-input v-model="params.share_sql" class="condition-input" placeholder="请输入sql" clearable size="mini" @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition-item">
          <span class="label">分享人: </span>
          <el-input v-model="params.sharer" class="condition-input" placeholder="请输入分享人" clearable size="mini" @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition-item">
          <span class="label">引擎: </span>
          <el-select v-model="params.engine" placeholder="请选择引擎" clearable class="condition-input" size="mini" @change="search"> <el-option v-for="item in engineListAll" :key="item.value" :label="item.label" :value="item.value"></el-option></el-select>
        </div>
      </div>
      <div class="reset_btn">
        <el-button size="mini" @click="resetSearch">重置</el-button>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
      </div>
    </div>
    <div class="query-list">
      <el-table ref="multipleTable" v-loading="loading" border :data="list" style="width: 100%" height="calc(100vh - 180px)" tooltip-effect="dark table_overflow_tootip" :cell-style="{ padding: '0px', height: '36px' }" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="index" label="序号" :index="indexMethod" width="55" align="center"> </el-table-column> -->
        <el-table-column label="分享ID" width="80" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="jumpSearch(scope.row)">{{ scope.row.id }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="名称" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="content">{{ scope.row.name || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="查询">
          <template slot-scope="scope">
            <div class="content">
              <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="scope.row.sql" placement="top" :enterable="false">
                <div class="title" @mouseenter="isShowTooltip">{{ scope.row.sql }}</div>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="复制" placement="top" :enterable="false">
                <i class="el-icon-document-copy" @click="copySql(scope.row.sql)"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sharer" label="分享人" width="160" show-overflow-tooltip> </el-table-column>
        <el-table-column label="所属数据区域" width="220" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ regionFormat(scope.row.region) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="查询引擎" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ engineFormat(scope.row.engine) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="shareBtn(scope.row)">分享</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </div>
    </div>
    <shareDialog ref="shareDialog" :share-url="shareUrl" :grade="grade" @submitFn="shaerSubmit" />
  </div>
</template>

<script>
import { EventBus, EventType } from '@/utils/eventbus';
import shareDialog from './shareDialog.vue';
import { getShares, addShare } from '@/api/querydata';
import { mapGetters } from 'vuex';
import copy from 'copy-to-clipboard';

export default {
  components: {
    shareDialog
  },
  data() {
    return {
      params: {
        share_sql: '',
        sharer: '',
        engine: '',
        pageSize: 30,
        pageNum: 1
      },
      total: 0,
      list: [],
      loading: false,
      shareUrl: '',
      grade: null,
      isTipDisabled: false
    };
  },
  created() {
    this.search();
  },
  computed: {
    ...mapGetters(['regionList', 'engineListAll', 'userInfo'])
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    copySql(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    jumpSearch(data) {
      if (!data.shareUrl) {
        this.$message({
          type: 'warning',
          message: '该分享数据有误'
        });
      }
      let uuid;
      if (data.shareUrl && data.shareUrl.includes('uuid')) {
        const strArr = data.shareUrl.split('?')[1];
        const uuidStr = strArr.split('&').find(item => item.includes('uuid'));
        uuid = uuidStr.split('=')[1] || '';
      }
      const params = {
        ...data,
        querySql: data.sql,
        uuid
      };
      EventBus.$emit(EventType.switchQueryTab, params);
    },
    resetSearch() {
      this.params.sharer = '';
      this.params.share_sql = '';
      this.params.engine = '';
      this.params.pageSize = 30;
      this.params.pageNum = 1;

      this.search();
    },
    engineFormat(engine) {
      return this.engineListAll.find(item => item.value === engine)?.label || engine;
    },
    regionFormat(region) {
      return this.regionList.find(item => item.name === region)?.name_zh || region;
    },
    shaerSubmit(data) {
      const params = {
        ...data,
        sharer: this.userInfo.userId,
        shareUrl: this.shareUrl,
        name: ''
      };
      addShare(params).then(res => {
        this.$message({
          type: 'success',
          message: '分享成功'
        });
      });
    },
    shareBtn(data) {
      this.shareUrl = data.shareUrl || '';
      this.grade = data.grade;
      this.$refs.shareDialog.open();
    },
    getList() {
      this.loading = true;
      getShares(this.params)
        .then(res => {
          this.list = res.data.list;
          this.total = res.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
};
</script>

<style lang="scss" scoped>
.shartTab-box {
  height: 100%;
  padding: 10px;
  .condition-box {
    position: relative;
    padding-bottom: 10px;
    .condition-search {
      display: flex;
      .condition-item {
        .label {
          margin-right: 4px;
        }
        .condition-input {
          width: 160px;
          margin-right: 10px;
        }
      }
    }
    .reset_btn {
      position: absolute;
      right: 5px;
      top: 0;
    }
  }
  .query-list {
    .el-table {
      border-left: 0;
      border-right: 0;
    }
    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      i {
        cursor: pointer;
      }
      .title {
        width: 95%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .footer {
      .el-pagination {
        padding-top: 10px;
      }
    }
  }
}
</style>
