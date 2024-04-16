<template>
  <div class="history-box">
    <div class="condition-box">
      <div class="condition-search">
        <div class="condition_item">
          <span class="search_text">ID: </span>
          <el-input v-model="params.query_id" size="mini" class="condition-input" placeholder="执行ID" clearable @input="params.query_id = checkNum(params.query_id)" @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition_item">
          <span class="search_text">SQL: </span>
          <el-input v-model="params.query_sql" size="mini" class="condition-input" placeholder="查询sql" clearable @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition_item">
          <span class="search_text">执行人: </span>
          <el-input v-model="params.createBy" size="mini" class="condition-input" placeholder="执行人" clearable @keyup.enter.native="search"></el-input>
        </div>
        <div class="condition_item">
          <span class="search_text">引擎: </span>
          <el-select v-model="params.engine" placeholder="请选择引擎" class="condition-input" size="mini" clearable @change="search"> <el-option v-for="item in engineListAll" :key="item.value" :label="item.label" :value="item.label"></el-option></el-select>
        </div>
        <div class="condition_item">
          <span class="search_text">状态: </span>
          <el-select v-model="params.status" placeholder="请选择状态" class="condition-input" size="mini" clearable @change="search"> <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"></el-option></el-select>
        </div>
      </div>
      <div class="reset_btn">
        <el-button size="mini" @click="resetSearch">重置</el-button>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
      </div>
    </div>
    <div class="query-list">
      <el-table v-loading="loading" border :data="list" stripe style="width: 100%" height="calc(100vh - 178px)" tooltip-effect="dark table_overflow_tootip" :cell-style="{ padding: '0px', height: '36px' }">
        <el-table-column v-permission="permission" label="" width="50">
          <template slot-scope="scope">
            <el-radio v-model="uuid" :disabled="scope.row.status !== 0" :label="scope.row.uuid" @change="changeCurrentDl($event, scope.row)">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="执行ID" width="120">
          <template slot-scope="scope">
            <div class="content">
              <el-button size="mini" type="text" @click="goQueryTab(scope.row)">{{ scope.row.id }}</el-button>
              <div v-if="scope.row.isDatabend === 0" class="tag">
                <svg-icon icon-class="accelerate" />
                <span>已加速</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="querySql" label="查询" min-width="350">
          <template slot-scope="{ row }">
            <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="row.querySql" placement="bottom">
              <div class="ellipsis" @mouseenter="isShowTooltip">{{ row.querySql }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="执行人" width="120"></el-table-column>
        <el-table-column label="开始时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.startTime | dataTime }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <div :class="` status status${scope.row.status}`">
              <i v-if="scope.row.status === 0" class="el-icon-circle-check"></i>
              <i v-if="scope.row.status === 1" class="el-icon-circle-close"></i>
              <i v-if="scope.row.status === 3" class="el-icon-loading"></i>
              <svg-icon v-if="scope.row.status === 2" icon-class="stop" />
              {{ scope.row.status === 0 ? '已完成' : scope.row.status === 2 ? '已取消' : scope.row.status === 3 ? '运行中' : '已失败' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="executeDuration" label="运行时间(秒)" width="115"></el-table-column>
        <el-table-column prop="dataSize" label="数据已扫描" width="100">
          <template slot-scope="scope">
            {{ scope.row.scanSize || scope.row.dataSize }}
          </template>
        </el-table-column>
        <el-table-column prop="dataSize" label="下载量" width="100"></el-table-column>
        <el-table-column label="区域" width="220">
          <template slot-scope="scope">
            <span>{{ regionFormat(scope.row.region) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="使用的查询引擎版本" width="200">
          <template slot-scope="scope">
            <span v-if="scope.row.isDatabend === 0">加速引擎</span>
            <span v-else>{{ scope.row.engineLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="checkSql(scope.row)">查看</el-button>
            <el-button size="mini" type="text" :disabled="scope.row.status === 3" @click="shareBtn(scope.row)">分享</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-dropdown>
          <el-button type="primary" size="mini" :disabled="!uuid || downloading">
            下载
            <i v-if="downloading" class="el-icon-loading"></i>
            <i v-else class="el-icon-arrow-up" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="download('')">CSV</el-dropdown-item>
            <el-dropdown-item @click.native="download('pdf')">PDF</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
      </div>
    </div>
    <el-dialog width="700px" :close-on-click-modal="false" :visible.sync="dialogVisible" @opened="openDialog">
      <div slot="title">
        SQL脚本<span style="color: #909399">(Query Engine: {{ formatter(activeItem) || '-' }})</span>
      </div>
      <div style="height: 350px">
        <monaco-editor ref="showMonaco" v-model="activeItem.querySql" :read-only="true" render-line-highlight="all" :scroll-beyond-last-line="false"></monaco-editor>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
    <shareDialog ref="shareDialog" :share-url="shareUrl" @submitFn="shaerSubmit" />
  </div>
</template>

<script>
import { historyQueryList, download, addShare, downloadFile, validOlap } from '@/api/querydata';
import { EventBus, EventType } from '@/utils/eventbus';
import { mapGetters } from 'vuex';
import MonacoEditor from '@/components/MonacoEditor/index';
// import copy from 'copy-to-clipboard';
import shareDialog from './shareDialog.vue';
import { getFormatUrl } from '@/utils';

export default {
  components: {
    MonacoEditor,
    shareDialog
  },
  data() {
    return {
      isTipDisabled: false,
      currentObj: {},
      params: {
        info: '',
        task_id: '',
        query_id: '',
        query_sql: '',
        createBy: '',
        status: '',
        engine: '',
        pageSize: 30,
        pageNum: 1
      },
      total: 0,
      list: [],
      loading: false,
      uuid: null,
      dialogVisible: false,
      activeItem: {
        title: '',
        userGroup: '',
        engine: '',
        querySql: ''
      },
      downloading: false,
      shareUrl: '',
      statusList: [
        {
          label: '已完成',
          value: 0
        },
        {
          label: '已失败',
          value: 1
        },
        {
          label: '已取消',
          value: 2
        },
        {
          label: '运行中',
          value: 3
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['engineListAll', 'userInfo', 'regionList']),
    permission() {
      const res = {};
      res.condition = 'external';
      res.instead = true;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      return res;
    }
  },
  created() {
    this.search();
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
    checkNum(data) {
      if (data) {
        return (data = Number(data.replace(/[^\d.%\\]/g, ''))) || '';
      }
    },
    resetSearch() {
      this.params.info = '';
      this.params.task_id = '';
      this.params.query_id = '';
      this.params.query_sql = '';
      this.params.createBy = '';
      this.params.status = '';
      this.params.engine = '';
      this.params.pageSize = 30;
      this.params.pageNum = 1;
      this.search();
    },
    regionFormat(region) {
      return this.regionList.find(item => item.name === region)?.name_zh;
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
    // 分享功能
    shareBtn(data) {
      const { uuid } = data;
      const resText = getFormatUrl('uuid', uuid, location.hash);
      this.shareUrl = resText;
      this.$refs.shareDialog?.open();
      // copy(resText, {
      //   format: 'text/plain'
      // });
      // this.$message({
      //   type: 'success',
      //   message: '分享链接已复制到剪贴板'
      // });
    },
    getList() {
      this.loading = true;
      let info = this.params.info.trim();
      info = info.replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\{/g, '%7B').replace(/\}/g, '%7D').replace(/\\/g, '%5C');
      historyQueryList({ ...this.params, info })
        .then(res => {
          const data = res.data;
          this.list = data.list;
          this.total = data.total;
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
    formatter(row) {
      if (this.engineListAll.length <= 0) {
        return '';
      }
      const item = this.engineListAll.find(item => {
        return item.value === row.engine;
      });
      if (!item) {
        return '';
      }
      return item.label || '';
    },
    changeCurrentDl(val, data) {
      this.currentObj = Object.assign({}, data);
    },
    async download(type) {
      this.downloading = true;
      // const validOlapType = (await validOlap(this.uuid)).data;
      // const handelFn = validOlapType || type === 'pdf' ? download : downloadFile;
      const config = {
        responseType: 'blob'
      };
      download({ uuid: this.uuid, type }, config)
        .then(res => {
          // if (!validOlapType && type !== 'pdf') {
          //   const data = res.data || [];
          //   if (data.length > 0) {
          //     const a = document.createElement('a');
          //     a.href = data[0];
          //     a.click();
          //     data.forEach(async(url, i) => {
          //       if (i > 0) {
          //         await this.$utils.sleep(i * 3000);
          //         const a = document.createElement('a');
          //         a.href = url;
          //         a.click();
          //       }
          //     });
          //   }
          // }
        })
        .finally(() => {
          this.downloading = false;
        });
    },
    checkSql(row) {
      this.activeItem = { ...row };
      this.dialogVisible = true;
    },
    openDialog() {
      this.$refs.showMonaco.setCode(this.activeItem.querySql);
    },
    goQueryTab(row) {
      EventBus.$emit(EventType.switchQueryTab, row);
    }
  }
};
</script>

<style lang="scss" scoped>
.history-box {
  height: 100%;
  padding: 10px;
  .condition-box {
    position: relative;
    margin-bottom: 10px;
    .condition-search {
      display: flex;
      flex-wrap: nowrap;
      .condition_item {
        &:not(:first-child) {
          margin-left: 10px;
        }
        .search_text {
          margin-right: 4px;
        }
        .condition-input {
          width: 160px;
        }
      }
    }
    .reset_btn {
      position: absolute;
      top: 0;
      right: 5px;
    }
  }
  .query-list {
    .status {
      font-size: $global-font-size-12;
      &0 {
        color: #67c23a;
      }
      &1 {
        color: $color-cb;
      }
      &2 {
        color: #909399;
      }
      &3 {
        color: #5f9bff;
      }
    }
    .el-table {
      border-left: 0;
      border-right: 0;
    }
    .content {
      display: flex;
      align-items: center;
      .tag {
        margin-left: 3px;
        display: inline-flex;
        background-color: #f5ca49;
        color: #fff;
        font-size: $global-font-size-12;
        justify-content: center;
        align-items: center;
        line-height: 16px;
        border-radius: 3px;
        span {
          white-space: nowrap;
          transform: scale(0.8);
        }
      }
    }
    ::v-deep .el-radio__label {
      padding-left: 0;
    }
    .footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-pagination {
        padding: 0;
      }
    }
  }
}
</style>
