<template>
  <el-card class="box-card-container metadata-box">
    <el-row :gutter="10" class="meta-box">
      <el-col :span="6" class="meta-left">
        <!-- 左侧 -->
        <LeftBar ref="leftBar" :keyword="params.keyWord" :region="params.region" :list="data" @updateList="updateList"></LeftBar>
      </el-col>
      <el-col v-loading="loading" :span="18" class="content">
        <!-- 搜索条件 -->
        <SearchCondition :keyword="params.keyWord" @updateList="updateList"></SearchCondition>
        <!-- 结果列表 -->
        <div class="remark">
          <el-button :loading="batchLoading" :disabled="batchLoading" type="primary" @click="batchApply">{{ batchText }}</el-button>
          <div>
            <span>没找到您想要的表？</span>
            <el-button type="primary" @click="create">创建表</el-button>
          </div>
        </div>
        <el-empty v-if="data.length === 0" :image-size="200"></el-empty>
        <template v-else>
          <el-card
            v-for="(item, index) in data"
            :key="index"
            v-loading="item.updateLoading"
            shadow="hover"
            class="content-card box-card"
            title="点击进入详情"
            element-loading-text="列表更新中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.8)"
            @click.native="gotoDetail(item)"
          >
            <div class="content-card-title">
              <span class="title" v-html="$utils.hKeyword(params.keyWord, `${item.db_name}.${item.table_name}`)"></span>
              <span v-loading="item.collectLoading" element-loading-spinner="el-icon-loading" :class="['item-flag', { 'el-icon-star-on': item.flag }, { 'el-icon-star-off': !item.flag }, { collect: item.flag }]" @click.stop="handleCollect(item, index)">{{ item.collect || '' }}</span>
              <span class="item-flag el-icon-user owner" v-html="$utils.hKeyword(params.keyWord, item.owner) || '-'"></span>
              <el-tag v-if="item.level" effect="plain">{{ item.level }}</el-tag>
              <el-tag v-if="item.storage" effect="plain" type="warning">{{ item.storage }}</el-tag>
            </div>
            <div class="tag-wrap">
              <!-- <el-tag type="danger">区域：{{ regionFormat(item.region) }}</el-tag> -->
              <template v-for="(val, i) in item.listModel">
                <el-tag v-if="val.effective" :key="val.id" class="tag" :type="['danger', 'success', 'info'][i]">{{ val.name }}：{{ val.nameValues.slice(1).join('/') || '-' }}</el-tag>
              </template>
              <el-tag
                type="warning"
              >分区类型：
                <template v-if="item.Partition_type === 0">非分区表</template>
                <template v-else-if="item.Partition_type === 1">分区表</template>
                <template v-else>-</template>
              </el-tag>
              <el-tag v-for="tag in formatTags(item.tags)" :key="tag.key" class="tag" :type="tag.type">{{ `${tag.key || '-'}: ${tag.value || '-'}` }}</el-tag>
            </div>
            <p class="content-text">
              <!-- <span>中文表名：{{ item.cnName || '--' }}</span> -->
              <span>描述：
                <span v-html="$utils.hKeyword(params.keyWord, item.description) || '--'"></span>
              </span>
            </p>
            <div class="content-basic">
              <span class="time">创建时间：{{ item.create_time || '-' }}</span>
              <span>最近访问：{{ item.lastAccessTime || '-' }}</span>
            </div>
            <!-- <el-button v-if="userInfo.userId === item.owner" :loading="item.authLoading" class="authorization-btn" type="primary" :disabled="item.authLoading" @click.stop="authorization(item, index)">{{ item.authText }}</el-button> -->
            <el-button :loading="item.applyLoading" class="content-btn" type="primary" :disabled="item.applyLoading || item.tableAuth" @click.stop="apply(item, index)">{{ item.applyText }}</el-button>
          </el-card>
          <!-- <el-pagination background :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination> -->
        </template>
        <div class="pagination">
          <el-button :disabled="!previousMarker" icon="el-icon-arrow-left" @click="handleCurrentChange('pre')"></el-button>
          <el-button :disabled="!nextMarker || data.length < params.pageSize" icon="el-icon-arrow-right" @click="handleCurrentChange('next')"></el-button>
        </div>
      </el-col>
    </el-row>

    <!-- 申请权限 -->
    <DataPermission :visiable.sync="dataPermissionVisible" :per-data="perData" :list-index="listIndex" @close="handleClosePer"></DataPermission>

    <!-- 授权权限 -->
    <Authorization :visiable.sync="authorizationVisible" :autho-data="authoData" :list-index="listIndex" @close="handleCloseAuth"></Authorization>

    <!-- 批量申请权限 -->
    <BatchApply :visiable.sync="batchApplyVisible" @close="handleCloseBatch"></BatchApply>
  </el-card>
</template>
<script>
import SearchCondition from './components/SearchCondition';
import LeftBar from './components/LeftBar';
import DataPermission from './components/DataPermission';
import Authorization from './components/Authorization';
import BatchApply from './components/BatchApply';
import { getTableList, collect, searchOne } from '@/api/metadata';
import { mapGetters } from 'vuex';

export default {
  components: {
    SearchCondition,
    LeftBar,
    DataPermission,
    Authorization,
    BatchApply
  },
  data() {
    return {
      dataPermissionVisible: false,
      authorizationVisible: false,
      batchApplyVisible: false,
      collectLoading: false,
      batchLoading: false,
      batchText: '批量申请权限',
      listIndex: 0,
      perData: {},
      authoData: {},
      params: {
        keyWord: this.$route.query.tableName || window.sessionStorage.getItem('metaKeyWord') || '',
        region: '',
        subject: '',
        pageNum: 1,
        pageSize: 10,
        pageToken: ''
      },
      hisSearchList: [],
      hisBrowseList: [],
      // regionList: this.$t('data.regionList'),
      themeList: [],
      loading: false,
      data: [],
      total: 0,
      nextMarker: '',
      previousMarker: '',
      isTipDisabled: false,
      closePerTimer: null,
      closeAuthTimer: null,
      closeBatchTimer: null,
      types: ['info', 'success', '', 'danger', 'warning']
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'currentUserGroup']),
    isRoot() {
      return ['dpm'].includes(this.currentUserGroup.name);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    formatTags(data) {
      if (data) {
        return data
          .split(',')
          .map((v, i) => {
            const [key, value] = v.split('=');
            return {
              key,
              value,
              type: this.types[i % this.types.length]
            };
          })
          .filter(item => item.key);
      }
      return data;
    },
    updateList(params, type) {
      if (type === 'keyWord') {
        params.dbName = '';
      }
      this.$refs.leftBar?.getHistorySearch();
      this.params = Object.assign({}, this.params, params, { pageToken: '' });
      this.getList();
    },
    getList() {
      this.loading = true;
      const params = Object.assign({}, this.params);
      window.sessionStorage.setItem('metaKeyWord', this.params.keyWord);
      Object.keys(params).forEach(item => {
        if (!params[item]) delete params[item];
      });
      getTableList({
        ...params
      })
        .then(res => {
          const data = res.data || {};
          if (data) {
            this.data =
              data.results?.map(e => {
                const item = {
                  ...e,
                  recents: e.recents && e.recents.length ? e.recents.split(',') : [],
                  collectLoading: false,
                  updateLoading: false,
                  authLoading: false,
                  applyLoading: false,
                  authText: '权限授予',
                  applyText: '申请权限'
                };
                return item;
              }) || [];
            // this.total = data.total || 0;
            this.nextMarker = data.nextMarker || '';
            this.previousMarker = data.previousMarker || '';
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // handleSizeChange(val) {
    //   this.params.pageSize = val;
    //   this.params.pageNum = 1;
    //   this.getList();
    // },
    handleCurrentChange(type) {
      this.params.pageToken = type === 'next' ? this.nextMarker : this.previousMarker;
      this.getList();
    },
    handleCollect(item, index) {
      this.data[index].collectLoading = true;
      const tableName = item.flag ? `${item.region}.${item.db_name}.${item.table_name}` : item.table_name;
      const params = {
        id: item.id,
        region: item.region,
        dbName: item.db_name,
        tableName
      };
      collect({
        ...params,
        isCollect: !item.flag
      }).then(res => {
        this.data[index].collectLoading = false;
        if (res.code !== 0) return;
        this.$message({
          type: 'success',
          message: !item.flag ? '收藏成功' : '取消收藏成功'
        });
        this.$refs.leftBar?.getCollectList();
        this.data[index].updateLoading = true;
        searchOne({ ...params, tableName: item.table_name }).then(res => {
          this.data[index].updateLoading = false;
          if (res.code !== 0) return;
          const data = res.data;
          const obj = {
            ...data,
            recents: data.recents && data.recents.length ? data.recents.split(',') : [],
            collectLoading: false,
            updateLoading: false,
            authLoading: false,
            applyLoading: false,
            authText: '权限授予',
            applyText: '申请权限'
          };
          this.data.splice(index, 1, obj);
        });
      });
    },
    gotoDetail(item) {
      this.$router.push({
        name: 'MetaDataDetail',
        query: {
          id: item.id,
          region: item.region,
          databaseName: item.db_name,
          tableName: item.table_name
        }
      });
    },
    create() {
      this.$router.push({
        name: 'MetaDataStep',
        query: {
          region: this.params.region || '',
          dbName: this.params.dbName || ''
        }
      });
    },
    // regionFormat(region) {
    //   const obj = this.regionList.find(item => item.value === region);
    //   if (obj) {
    //     return obj.label;
    //   } else {
    //     return '-';
    //   }
    // },
    apply(item, index) {
      this.listIndex = index;
      this.data[index].applyLoading = true;
      this.data[index].applyText = '申请中';
      this.dataPermissionVisible = true;
      this.perData = item;
    },
    authorization(item, index) {
      this.listIndex = index;
      this.data[index].authLoading = true;
      this.data[index].authText = '申请中';
      this.authorizationVisible = true;
      this.authoData = item;
    },
    batchApply() {
      this.batchLoading = true;
      this.batchText = '申请中';
      this.batchApplyVisible = true;
    },
    handleClosePer(index) {
      clearTimeout(this.closePerTimer);
      this.closePerTimer = setTimeout(() => {
        this.data[index].applyLoading = false;
        this.data[index].applyText = '申请权限';
      }, 1000);
    },
    handleCloseAuth(index) {
      clearTimeout(this.closeAuthTimer);
      this.closeAuthTimer = setTimeout(() => {
        this.data[index].authLoading = false;
        this.data[index].authText = '权限授予';
      }, 1000);
    },
    handleCloseBatch() {
      clearTimeout(this.closeBatchTimer);
      this.closeBatchTimer = setTimeout(() => {
        this.batchLoading = false;
        this.batchText = '批量申请权限';
      }, 100);
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
::v-deep .el-card__body {
  padding: 10px;
}
.metadata-box {
  min-height: calc(100vh - 72px);
  .search {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    color: #999;
    ::v-deep .el-input {
      width: 40%;
      margin-right: 10px;
    }
    ::v-deep .el-input-group__append {
      background: $c-primary;
      color: #fff;
      border: 1px solid $c-primary;
    }
  }
  .card-box {
    margin-bottom: 15px;
    .info-box {
      border-bottom: 1px solid #e1e5ef;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 5px;
      .icon-box {
        display: flex;
        align-items: center;
        .metaIcon {
          display: block;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #999;
          margin-right: 5px;
          img {
            width: 100%;
          }
        }
      }
      .btn-box {
        display: flex;
        align-items: center;
        cursor: pointer;
        i:nth-child(1) {
          margin-right: 10px;
          color: #3782ff;
        }
        i.delete {
          color: #ff5656;
        }
      }
    }
    .detail-box {
      padding-top: 10px;
    }
  }
  .content {
    .remark {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      span {
        font-size: $global-font-size-12;
        color: #999;
      }
    }
    .content-card {
      cursor: pointer;
      position: relative;
      margin-bottom: 10px;

      .tag-wrap {
        .tag {
          margin-right: 5px;
          margin-bottom: 5px;
        }
      }
      .content-card-title {
        display: flex;
        align-items: center;
        height: 30px;
        margin-bottom: 10px;

        .title {
          font-size: $global-font-size-18;
          margin-right: 10px;
        }
        .item-flag {
          margin-left: 10px;
          ::v-deep .el-loading-spinner {
            margin-top: -7px;
          }
          &::before {
            margin-right: 3px;
            font-size: $global-font-size-14;
          }
        }
        .owner,
        .collect {
          &::before {
            color: #f49a27;
          }
        }
        .collect {
          display: flex;
          align-items: center;
          &::before {
            font-size: $global-font-size-18;
          }
        }

        ::v-deep {
          .el-tag {
            margin-left: 10px;
          }
        }
      }
      .content-text {
        display: flex;
        align-items: center;
        height: 40px;
        span {
          margin-right: 10px;
        }
      }
      .content-basic {
        color: #999;
        .time {
          margin-right: 10px;
        }
        ::v-deep {
          .el-tag {
            margin-right: 15px;
          }
        }
      }
      .content-range {
        color: #888;
        font-size: $global-font-size-14;
        margin-top: 15px;
        span {
          margin-right: 10px;
          border: 1px solid #dcdfe6;
          padding: 5px 8px;
        }
      }
      .authorization-btn {
        position: absolute;
        top: 20px;
        right: 20px;
      }
      .content-btn {
        position: absolute;
        right: 20px;
        bottom: 20px;
      }
    }
    .pagination {
      text-align: center;
    }
  }
}
</style>
