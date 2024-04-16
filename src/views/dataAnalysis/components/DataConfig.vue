<template>
  <div class="data-config">
    <div class="config_title">
      <el-radio-group v-model="tabActive" class="config_tool ellipsis" size="mini" fill="#7c8de9">
        <el-radio-button label="datas">元数据预览</el-radio-button>
        <el-radio-button label="history">最近查询记录</el-radio-button>
      </el-radio-group>
      <el-tooltip effect="dark" placement="right">
        <template #content>
          {{ tabActive === 'datas' ? '点击此按钮，可刷新出新增的数据库/数据表' : '点击此按钮,可刷新查询记录列表' }}
        </template>
        <i :class="['title_tips', refreshing ? 'el-icon-loading' : 'el-icon-refresh', { refreshing }]" @click="refreshConfig(tabActive)"></i>
      </el-tooltip>
    </div>
    <el-form v-show="tabActive === 'datas'" label-position="top" :model="form" size="mini" class="config_from">
      <el-form-item class="config_ag">
        <div class="config_ag_item">
          <!-- <span class="label">数据源: </span> -->
          <el-select v-model="form.catalog" :title="form.catalog" class="w100" placeholder="请选择数据源">
            <svg-icon slot="prefix" icon-class="artifact"></svg-icon>
            <!-- <div v-show="catalogLoading" style="text-align: center; padding: 10px"><i class="el-icon-loading"></i></div> -->
            <el-option v-for="item in filterCatalogList" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </div>
        <div class="config_ag_item">
          <!-- <span class="label">数据库: </span> -->
          <el-select v-model="form.database" filterable :title="form.database" class="w100" placeholder="请选择数据库">
            <svg-icon slot="prefix" icon-class="dataSource"></svg-icon>
            <div v-show="dbLoading" style="text-align: center; padding: 10px"><i class="el-icon-loading"></i></div>
            <el-option v-for="item in dbList" v-show="!dbLoading" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </div>
      </el-form-item>
      <el-form-item class="config_tuck">
        <template #label>
          <div class="label">
            <svg-icon icon-class="follow" class="title_follow"></svg-icon>
            <span class="text">我的收藏</span>
          </div>
        </template>
        <div class="tuck_content">
          <div class="configLoading">
            <i v-show="tuckLoading" class="el-icon-loading"></i>
          </div>
          <el-empty v-if="tuckList.length <= 0 && !tuckLoading" description="暂无收藏"></el-empty>
          <div v-else class="content">
            <div v-for="table in tuckList" :key="table.id" class="tuck_item" @dblclick="select('table', table.table, table.db)">
              <!-- <svg-icon icon-class="table" class="icon" /> -->
              <el-tooltip class="item" effect="dark" :content="table.table" placement="top">
                <div class="tuck_table_name ellipsis">{{ table.table }}</div>
              </el-tooltip>
              <div class="item_right">
                <el-tooltip content="定位" placement="top" :enterable="false" @click.native="tuckLockTable(table)">
                  <svg-icon icon-class="fixed" class="fixed" />
                </el-tooltip>
                <el-tooltip effect="dark" content="取消" placement="top" :enterable="false" @click.native="cancelTuck(table.id)">
                  <i class="el-icon-close"></i>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="config_table">
          <!-- <div class="tips"><i class="el-icon-info"></i><span class="tips-text">双击表名或字段可引用至编辑器中</span></div> -->
          <div class="table_title">
            <el-input v-model="form.keyword" class="table_search" placeholder="请输入表名" suffix-icon="el-icon-search" clearable></el-input>
            <el-dropdown v-if="formatEngine" v-permission="permission" placement="bottom-start" trigger="click">
              <i class="el-icon-circle-plus-outline"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item data-testid="crate_table" @click.native="changeDrawer">创建临时表</el-dropdown-item>
                <el-dropdown-item data-testid="sql_crate_table" @click.native="$emit('sqlCreateTable', { db: form.database })">使用SQL创建</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="configLoading table">
            <i v-show="tableLoading" class="el-icon-loading"></i>
          </div>
          <div class="table_content">
            <el-empty v-if="showTableList.length <= 0 && !tableLoading" description="暂无数据"></el-empty>
            <div v-else ref="tableTree" class="table-tree">
              <div v-for="(table, index) in showTableList" :key="table + index" class="table-item">
                <div class="table-title" @click.stop="clickTable(table)">
                  <svg-icon icon-class="table" class="table-title-icon" />
                  <!-- <el-tooltip content="元数据信息" placement="top" :enterable="false">
                  </el-tooltip> -->
                  <el-tooltip :ref="'tooltip' + table" class="item" effect="dark" :disabled="isTipDisabled" :content="table" placement="bottom">
                    <span class="table-title-text ellipsis" @mouseenter="isShowTooltip" @dblclick="select('table', table)">
                      {{ table }}
                    </span>
                  </el-tooltip>
                  <span :class="['table_icon', form.database === 'temp_database' && catalog === 'hive' ? 'widthAdd' : '', catalog === 'hive' ? 'widthSub' : '', form.database === 'temp_database' ? 'widthSub' : '']">
                    <el-tooltip v-if="catalog === 'hive'" content="查看" placement="top" :enterable="false" @click.native.stop="lockTable(table)">
                      <svg-icon icon-class="eye-open-2" class="eye" />
                    </el-tooltip>
                    <el-tooltip placement="top" :enterable="false" @click.native.stop="addTuck(table)">
                      <template #content>
                        {{ tuckNameList.includes(table) ? '取消' : '收藏' }}
                      </template>
                      <svg-icon icon-class="follow" :class="['follow', tuckNameList.includes(table) ? 'shadow' : '']" />
                    </el-tooltip>
                    <el-tooltip v-if="form.database === 'temp_database'" content="导入" placement="top" :enterable="false">
                      <svg-icon icon-class="import" class="import" @click.stop="importDial(table)" />
                    </el-tooltip>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div v-show="tabActive === 'history'" v-loadMore="{ fn: searchHistory, selector: '.query_content' }" class="history_query">
      <div class="query_search">
        <el-input v-model="historyFilterText" size="mini" class="condition-input" placeholder="搜索历史查询sql" clearable @keyup.enter.native="searchHistory" @change="filterChange"> <i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer" @click="searchHistory"></i></el-input>
      </div>
      <div class="query_content">
        <div class="configLoading">
          <i v-show="historyLoading" class="el-icon-loading"></i>
        </div>
        <div v-for="item in historyQueryList" :key="item.id" class="query_item">
          <div class="query_title">
            <span class="query_id">
              <el-tag :type="historyTagStatus[item.status + '']" size="mini">{{ item.id }}</el-tag>
            </span>
            <span class="time">{{ $utils.parseTime(item.startTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </div>
          <div class="query_sql">
            <el-tooltip effect="dark" placement="right" popper-class="table_overflow_tootip" @click.native="goQueryTab(item)">
              <template #content>
                <div style="height: 100%; overflow: auto">{{ item.querySql }}</div>
              </template>
              <span class="cell-ellipsis2 query_text">{{ item.querySql }}</span>
            </el-tooltip>
            <!-- {{ item.querySql }} -->
          </div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="45%" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDial">
      <template #title>
        <div class="title">
          <span>导入数据</span>
          <div class="title-tips">支持用户基于原有的数据结构重新导入数据,不支持重新解析数据结构,因此请您确保导入的数据和原有的数据结构保持一致</div>
        </div>
      </template>
      <div class="upload">
        <div class="label">
          <span>
            选择文件
            <el-tooltip content="上传数据前,请你确保单元格中不存在回车换行,否则建表之后,会出现数据乱行的情况" placement="top-start">
              <svg-icon icon-class="help" class="svg_help" style="vertical-align: middle; margin-top: -3px" />
            </el-tooltip>
            :
          </span>
        </div>
        <el-upload ref="rebateUpload" class="upload-demo" action="" :accept="accept" :on-remove="fileRemove" :limit="1" :file-list="field" :on-exceed="fileExceed" :on-change="fileChange" :auto-upload="false">
          <el-button size="mini" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">仅支持上传 .csv 文件格式的数据,上传数据量最大为50MB</div>
        </el-upload>
        <!-- <el-button size="mini" class="cancel" :disabled="percentageStatus !== 1" @click="cancelFile">取消上传</el-button> -->
      </div>
      <div v-show="running && percentage > 0" class="progress">
        <div class="label">{{ percentageText }} :</div>
        <el-progress :percentage="percentage"></el-progress>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <!-- <el-button type="primary" @click="dialogVisible = false">确 定</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDbList, getTableList, clearCache, overwriteFile, addTuckTable, getTuckTableList, delTuckTable, historyQueryList } from '@/api/querydata.js';
import { getTableList as getTableListMeta } from '@/api/metadata';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import axios from 'axios';
import { EventBus, EventType } from '@/utils/eventbus';
import { localGetItem, localSetItem } from '@/utils/customStorage';

export default {
  props: {},
  data() {
    return {
      tabActive: 'datas',
      form: {
        engine: '',
        catalog: localGetItem('ds-query-catalog') || '',
        database: localGetItem('ds-query-database') || '',
        keyword: ''
      },
      dbList: [],
      tableList: [],
      tableLoading: false,
      refreshing: false,
      dbLoading: false,
      dialogVisible: false,
      field: [],
      running: false,
      percentageStatus: 0,
      percentage: 0,
      tableName: '',
      historyQueryList: [],
      historyLoading: false,
      historyListEnd: false,
      tuckList: [],
      tuckLoading: false,
      historyTagStatus: {
        0: 'success',
        1: 'danger',
        2: 'warning',
        3: ''
      },
      historyFilterText: '',
      params: {
        info: '',
        pageSize: 30,
        pageNum: 1
      },
      isTipDisabled: false
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'region', 'catalogList', 'catalog', 'currentUserGroup']),
    tuckNameList() {
      return this.tuckList.map(({ table }) => table);
    },
    formatEngine() {
      const formatList = ['hive', 'iceberg'];
      return this.form.catalog && formatList.some(item => this.form.catalog.startsWith(item));
    },
    permission() {
      const res = {};
      res.condition = 'external';
      res.instead = true;
      res.condition_met = this.userInfo ? this.userInfo.tenantName : '';
      return res;
    },
    filterCatalogList() {
      return this.catalogList.filter(item => item !== 'mysql_databend-test');
    },
    showTableList() {
      if (this.form.keyword) {
        return this.tableList.filter(item => {
          return item.includes(this.form.keyword);
        });
      }
      return this.tableList;
    },
    accept() {
      // return '.xls, .xlsx, .csv';
      return '.csv';
    },
    percentageText() {
      return ['初始化状态', '正在上传', '已取消', '已完成'][this.percentageStatus];
    }
  },
  watch: {
    tuckList() {
      this.tableHeight();
    },
    catalog(newVal) {
      if (this.form.catalog !== newVal) this.form.catalog = newVal;
    },
    catalogList(val) {
      if (val.length > 0 && !this.form.catalog) this.form.catalog = val[0];
    },
    dbList() {
      if (this.form.catalog && this.form.database) this.getTableList();
    },
    region(region, oldRegion) {
      this.getCatalogAndEngine({ region });
      const oldoldCatalog = JSON.parse(localGetItem('ds-query-catalogObj'))?.[oldRegion] || '';
      const oldCatalog = JSON.parse(localGetItem('ds-query-catalogObj'))?.[region] || '';
      this.form.catalog = oldCatalog;
      if (oldoldCatalog === oldCatalog && oldoldCatalog !== '') {
        this.getDbList();
      }
      this.form.database = '';
      this.dbList = [];
      this.tableList = [];
      // this.$nextTick(() => {
      //   if(this.catalogList.length>0) this.form.catalog = this.catalogList[0];
      // });
    },
    tabActive(val) {
      if (val === 'history') {
        this.historyListEnd = false;
        this.params.pageNum = 1;
        this.historyQueryList = [];
        this.searchHistory();
      } else {
        this.historyFilterText = '';
      }
    },
    'form.catalog'(catalog) {
      // this.form.database = ''
      this.getDbList();
      this.$store.commit('SET_CATALOG', catalog);
      localSetItem('ds-query-catalog', catalog);
      const catalogObj = JSON.parse(localGetItem('ds-query-catalogObj')) || {};
      localSetItem('ds-query-catalogObj', JSON.stringify(Object.assign(catalogObj, { [this.region]: catalog })));
    },
    'form.database'(database) {
      this.tableList = [];
      this.getTableList();
      localSetItem('ds-query-database', database);
    }
  },
  created() {
    if (this.region) this.getCatalogAndEngine({ region: this.region });
    if (this.region && this.form.catalog && this.form.database) {
      this.getTableList();
      this.getDbList();
    } else if (this.region && this.form.catalog) {
      this.getDbList();
    }
  },
  mounted() {
    this.tableHeight();
  },
  methods: {
    ...mapActions(['getCatalogAndEngine']),
    ...mapMutations(['SET_METADATA', 'SET_TABLELIST']),
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    goQueryTab(row) {
      EventBus.$emit(EventType.switchQueryTab, row);
    },
    tableHeight() {
      this.$nextTick(() => {
        const tuckDom = document.querySelector('.config_tuck .tuck_content');
        if (tuckDom) {
          const tableDom = this.$refs.tableTree;
          if (tableDom) {
            setTimeout(() => {
              tableDom.style.height = `calc(100vh - ${282 + tuckDom.offsetHeight}px)`;
            });
          }
        }
      });
    },
    filterChange() {
      this.historyListEnd = false;
      this.params.pageNum = 1;
      this.historyQueryList = [];
      this.searchHistory();
    },
    searchHistory() {
      if (this.historyListEnd || this.historyLoading) return;
      this.historyLoading = true;
      const params = {
        ...this.params,
        query_sql: this.historyFilterText.trim(),
        createBy: this.userInfo.userId
      };
      historyQueryList(params)
        .then(res => {
          const data = res.data;
          if (this.historyQueryList.length === 0) {
            this.historyQueryList = data.list;
          } else {
            this.historyQueryList.push(...data.list);
          }
          this.params.pageNum++;
          if (data.list.length < this.params.pageSize) this.historyListEnd = true;
        })
        .finally(() => {
          this.historyLoading = false;
        });
    },
    tuckLockTable(data) {
      if (this.form.database !== data.db) this.form.database = data.db;
      this.form.keyword = data.table || '';
    },
    cancelTuck(id) {
      delTuckTable({ id: id + '' }).then(res => {
        if (res.data) {
          this.$message({
            type: 'success',
            message: '取消成功'
          });
          this.getTuckTableList();
        }
      });
    },
    getTuckTableList() {
      this.tuckLoading = true;
      this.tuckList = [];
      const params = { catalog: this.form.catalog, region: this.region };
      getTuckTableList(params)
        .then(res => {
          this.tuckList = res.data || [];
        })
        .finally(() => {
          this.tuckLoading = false;
        });
    },
    // 查看
    lockTable(table) {
      const params = {
        pageSize: 10,
        pageNum: 1,
        keyWord: `${this.form.database}.${table}`
      };
      getTableListMeta(params).then(res => {
        if (res.code === 0) {
          if (res.data && res.data.results && res.data.results.length > 0) {
            const metaData = res.data.results[0];
            const url = this.$router.resolve({
              path: '/meta/detail',
              query: {
                id: metaData.id,
                region: metaData.region,
                databaseName: metaData.db_name,
                tableName: metaData.table_name
              }
            });
            window.open(url.href);
            return;
          }
        }
        this.$message({
          type: 'warning',
          message: '获取元数据失败'
        });
      });
    },
    // 收藏
    addTuck(table) {
      if (this.tuckNameList.includes(table)) {
        this.cancelTuck(this.tuckList.find(item => item.name === table).id);
        return;
      }
      const params = {
        name: table,
        is_active: 1,
        region: this.region,
        catalog: this.form.catalog,
        db: this.form.database
      };
      addTuckTable(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '收藏成功'
          });
          this.getTuckTableList();
        })
        .catch(() => {});
    },
    // 创建临时表状态
    changeDrawer() {
      this.$emit('changeDrawer', true);
    },
    importDial(table) {
      this.dialogVisible = true;
      this.tableName = table;
    },
    getDbList(params) {
      if (!this.form.catalog) {
        this.dbList = [];
        return;
      }

      // 获取收藏数据
      this.getTuckTableList();

      this.dbLoading = true;
      return getDbList({ engine: this.form.engine, catalog: this.form.catalog, region: this.region })
        .then(res => {
          const data = res.data;
          this.dbList = data;
          if (this.dbList.length > 0) {
            this.form.database = params ? params.db : this.currentUserGroup.defaultHiveDbName ? this.currentUserGroup.defaultHiveDbName : this.dbList[0];
          } else {
            this.refreshing = false;
          }
        })
        .finally(() => {
          this.dbLoading = false;
        });
    },
    getTableList() {
      if (!this.form.database) {
        this.tableList = [];
        return;
      }

      this.tableLoading = true;
      getTableList({ engine: this.form.engine, catalog: this.form.catalog, database: this.form.database, region: this.region })
        .then(res => {
          const data = res.data;
          this.tableList = data;
          this.SET_TABLELIST(data || []);
        })
        .finally(() => {
          this.tableLoading = false;
          this.refreshing = false;
        });
    },
    clickTable(table) {
      this.$emit('lookMetadata', { catalog: this.form.catalog, database: this.form.database, table });
    },
    // 选中表头或字段
    select(type, name, db = '') {
      const dbName = db || this.form.database;
      this.$emit('select', type, dbName, name);
    },
    async refreshConfig(type, data) {
      if (type === 'datas') {
        if (this.refreshing) {
          return;
        }
        this.refreshing = true;
        await clearCache();
        this.tableList = [];
        this.tuckList = [];
        this.getCatalogAndEngine({ region: this.region });
        // this.getTuckTableList();
        await this.getDbList();
        // this.getTableList();

        if (data) this.tuckLockTable(data);
        // 清空元数据信息
        this.SET_METADATA({ region: this.region, resultData: [] });
        this.$emit('closeVisible');
      } else if (type === 'history') {
        this.historyFilterText = '';
        this.filterChange();
      }
    },
    closeDial() {
      this.cancel && this.cancel();
      this.percentageStatus = 0;
      this.running = false;
      this.field = [];
    },
    cancelFile() {
      this.cancel && this.cancel();
      this.$message({
        type: 'warning',
        message: '已取消,重新上传文件的话请先删除当前文件',
        duration: 4000
      });
    },
    fileChange(file, fileList) {
      const self = this;
      const CancelToken = axios.CancelToken;

      const res = this.beforeAvatarUpload(file);
      if (!res) this.field = fileList.splice(fileList.length - 1, 1);
      if (!res) return;
      this.field = fileList;
      this.running = true;
      const FormDatas = new FormData();
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data;'
        },
        timeout: 600000,
        cancelToken: new CancelToken(function executor(c) {
          // executor 函数接收一个 cancel 函数作为参数
          self.cancel = c;
        })
      };
      config.onUploadProgress = ProgressEvent => {
        this.onUploadProgress(ProgressEvent);
      };
      const data = {
        database: 'temp_database',
        table: this.tableName,
        file: file.raw,
        engine_key: '',
        region: this.region,
        catalog: this.form.catalog
      };
      Object.keys(data).forEach(key => {
        FormDatas.append(key, data[key]);
      });
      overwriteFile(FormDatas, config)
        .then(res => {
          if (res.data.status === 0) {
            // this.refreshConfig();
            this.dialogVisible = false;
            this.percentage = 100;
            this.percentageStatus = 3;
            this.$message({
              type: 'success',
              message: '上传成功'
            });
          }
        })
        .catch(() => {
          this.percentageStatus = 2;
        });
    },
    onUploadProgress(ProgressEvent) {
      if (ProgressEvent.lengthComputable) {
        const fileSize = Math.round(ProgressEvent.total / 1024 / 1024);
        if (fileSize <= 1) {
          const num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
          this.percentage = num > 99 ? 99 : num;
        } else {
          let num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
          num = Math.round(((51 - fileSize) / 50) * num);
          this.percentage = num > 99 ? 99 : num;
        }
      }
    },
    beforeAvatarUpload(file) {
      this.percentageStatus = 1;
      // const isJPG = file.type === 'text/csv';
      const isLt2M = file.size / 1024 / 1024 < 50;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.warning('上传文件不能超过 50MB!');
      }
      // return isJPG && isLt2M;
      return isLt2M;
    },
    fileExceed(files, fileList) {
      this.cancel && this.cancel();
      this.$refs['rebateUpload'].clearFiles(); // 清除文件
      setTimeout(() => {
        this.percentageStatus = 1;
      });
      this.percentage = 0;
      this.$set(this.field[0], 'raw', files[0]);
      this.$set(this.field[0], 'name', files[0].name);
      this.$set(this.field[0], 'size', files[0].size);
      this.$set(this.field[0], 'status', 'ready');
      this.$set(this.field[0], 'percentage', 0);
      this.$set(this.field[0], 'uid', files[0].uid);
      this.$refs['rebateUpload'].handleStart(files[0]); // 选择文件后的赋值方法
    },
    fileRemove(file, fileList) {
      this.cancel && this.cancel();
      this.percentageStatus = 0;
      this.percentage = 0;
      this.running = false;
      this.field = fileList;
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.configLoading {
  &.table {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
  text-align: center;
  i {
    margin: 15px 20px 15px 0px;
  }
}
.data-config {
  padding: 8px;
  .config_title {
    display: flex;
    align-items: center;
    padding-right: 20px;
    margin-bottom: 10px;
    .config_tool {
      white-space: nowrap;
      ::v-deep {
        .el-radio-button__inner {
          height: 28px;
          line-height: 16px;
        }
      }
    }
    .title_tips {
      position: absolute;
      right: 10px;
      top: 15px;
      cursor: pointer;
      &:hover {
        color: $c-primary;
      }
      &.refreshing {
        cursor: auto;
      }
    }
  }
  .config_from {
    .el-form-item {
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
    .config_ag {
      margin: 5px 0;
      // ::v-deep .el-form-item__content {
      //   display: flex;
      //   justify-content: space-between;
      //   align-items: center;
      // }
      .config_ag_item {
        display: flex;
        margin-bottom: 10px;
        .label {
          width: 70px;
        }
        .el-select {
          ::v-deep .el-input--mini {
            font-size: $global-font-size-13;
          }
        }
      }
      .symbol {
        width: 10px;
        margin-right: 5px;
      }
      .svg-icon {
        vertical-align: middle;
      }
      ::v-deep .el-input--prefix .el-input__inner {
        padding-left: 25px;
        height: 28px;
        line-height: 28px;
      }
    }
    .config_tuck {
      ::v-deep .el-form-item__label {
        line-height: 14px;
        .label {
          margin-bottom: 4px;
          .text {
            font-size: 12px;
            margin-left: 2px;
          }
        }
      }
      .title_follow {
        transform: scale(1.3);
        vertical-align: bottom;
      }
      .tuck_content {
        padding: 6px;
        padding-top: 0;
        max-height: 170px;
        overflow: auto;
        // border-bottom: 1px solid #f2f2f2;
        .tuck_item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          // font-size: $global-font-size-13;
          cursor: pointer;
          .tuck_table_name {
            flex: 1;
            text-align: start;
            padding-left: 5px;
            max-width: calc(100% - 55px);
          }
          .el-icon-close {
            margin-right: 4px;
            // background-color: #fff;
          }
          &:hover {
            background-color: #f2f6fc;
          }
          .item_right {
            display: flex;
            align-items: center;
            .fixed {
              // color: $c-primary;
              margin-right: 4px;
              transform: rotate(45deg);
            }
          }
        }
        .el-empty {
          padding: 0;
          ::v-deep .el-empty__image {
            width: 40px;
            margin: 0 auto;
          }
          ::v-deep .el-empty__description {
            margin-top: 0px;
          }
        }
      }
    }
    .config_table {
      // margin-top: 5px;
      .tips {
        margin: 4px 0;
        line-height: 18px;
      }
      .table_title {
        display: flex;
        align-items: center;
        width: 97%;
        i {
          margin-left: 5px;
          cursor: pointer;
          font-size: $global-font-size-18;
          color: $c-primary;
        }
        .table_search {
          ::v-deep {
            .el-input__inner {
              height: 28px;
              line-height: 28px;
            }
          }
        }
      }
      .table_content {
        // font-size: $global-font-size-13;
        .table-tree {
          padding-right: 4px;
          height: calc(100vh - 373px);
          padding-bottom: 10px;
          overflow-y: auto;
        }
        .table-item {
          padding: 6px 0;
          border-bottom: 1px solid #e2e9f3;
          cursor: pointer;
          .table-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .table-title-text {
              padding-left: 6px;
              flex: 1;
              min-width: calc(100% - 15px);
            }
            .table-title-icon {
              min-width: 1em;
            }
            .table_icon {
              display: inline-flex;
              align-items: center;
              width: 0px;
              white-space: nowrap;
              padding-right: 5px;
              svg {
                // background-color: #fff;
              }
              .eye {
                color: $c-primary;
                margin-right: 4px;
              }
              .import {
                margin-left: 4px;
              }
              .follow {
                transform: scale(1.1);
                &.shadow {
                  opacity: 0.3;
                  // cursor: not-allowed;
                }
              }
            }
            &:hover {
              background-color: #f2f6fc;
              .table-title-text {
                min-width: calc(100% - 75px);
              }
              .table_icon {
                width: 20px;
                &.widthSub {
                  width: 40px;
                }
                &.widthAdd {
                  width: 60px;
                }
              }
            }
          }
        }
        .table-cols {
          padding-left: 24px;
          margin-bottom: 4px;
          &-loading {
            margin: 8px 0 0 60px;
          }
          .table-col-item {
            padding: 4px 0;
            color: #909399;
            font-size: $global-font-size-12;
            cursor: pointer;
            line-height: 18px;
            padding: 0;
            display: flex;
            justify-content: space-between;
            padding-right: 15px;
            &:hover {
              background: #f2f6fc;
            }
            .col_name {
              width: 86%;
            }
          }
        }
        .el-empty {
          ::v-deep .el-empty__image {
            width: 15%;
          }
        }
      }
      .el-empty {
        height: 390px;
      }
    }
  }
  .history_query {
    padding: 6px;
    padding-left: 0;
    .query_search {
      margin-bottom: 5px;
    }
    .query_content {
      max-height: calc(100vh - 192px);
      min-height: calc(100vh - 192px);
      overflow: auto;
      font-size: $global-font-size-14;
      margin-right: -10px;
      padding-right: 4px;
      .query_item {
        &:not(:last-child) {
          border-bottom: 1px solid #e2e9f3;
          margin-bottom: 4px;
          padding-bottom: 4px;
        }
        .query_title {
          display: flex;
          justify-content: space-between;
          .time {
            font-size: $global-font-size-12;
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
        }
        .query_text {
          // display: block;
          // width: 100%;
        }
      }
      .query_sql {
        margin-top: 4px;
        font-size: 12px;
        .cell-ellipsis2 {
          display: -webkit-box;
          word-wrap: break-word;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          cursor: pointer;
        }
      }
    }
  }
  .w100 {
    width: 100%;
  }
  ::v-deep .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  ::v-deep .el-form-item--mini.el-form-item {
    margin-bottom: 0;
    &:last-child {
      .el-form-item__label {
        width: 100%;
      }
    }
  }
  .tips {
    margin: 6px 0;
    &-text {
      display: inline-block;
      transform-origin: left;
      transform: scale(0.83);
    }
  }
  ::v-deep .el-dialog__body {
    padding: 15px 20px;
  }
  .el-dialog {
    .title {
      font-size: $global-font-size-18;
      .title-tips {
        margin-top: 5px;
        color: #909399;
        font-size: $global-font-size-12;
      }
    }
    .label {
      display: inline-block;
      width: 95px;
    }
    .upload {
      position: relative;
      display: flex;
      margin-bottom: 10px;
      .cancel {
        position: absolute;
        top: 0px;
        left: 180px;
      }
      .el-upload__tip {
        color: #909399;
        margin: 8px 0 0 5px;
      }
      ::v-deep .el-upload-list {
        .el-icon-close {
          display: block;
        }
        .el-list-leave-active {
          transition: all 0s !important;
        }
      }
    }
    .progress {
      .label {
        text-align: end;
      }
      display: flex;
      .el-progress {
        width: 100%;
        padding-left: 14px;
      }
    }
  }
}
</style>
