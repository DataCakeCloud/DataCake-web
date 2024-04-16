<template>
  <div class="savedquery-box">
    <div class="savedquery-content">
      <div class="savedquery-left">
        <div class="savequery_title">
          <span class="label">文件夹列表</span>
          <!-- <el-tooltip effect="dark" content="创建文件夹" placement="right">
            <i class="el-icon-circle-plus-outline" @click="addFolder"></i>
          </el-tooltip> -->
        </div>
        <customTree
          ref="customTree"
          :tree-data="folderList"
          :default-props="defaultProps"
          :options="treeOptions"
          :is-contextmenu="true"
          :is-filter="true"
          :depth="3"
          :no-drag="noDrag"
          @moveFile="moveFile"
          @delFile="delFile"
          @resetFolderName="resetFolderName"
          @addFile="addFile"
          @node-click="handelFolder"
        />
      </div>
      <div class="savedquery-right">
        <div class="condition-box">
          <div class="condition-search">
            <div class="condition-item">
              <span class="label">名称: </span>
              <el-input v-model="params.title" class="condition-input" placeholder="请输入名称" clearable size="mini" @keyup.enter.native="search"></el-input>
            </div>
            <div class="condition-item">
              <span class="label">SQL: </span>
              <el-input v-model="params.query_sql" class="condition-input" placeholder="请输入sql" clearable size="mini" @keyup.enter.native="search"></el-input>
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
          <el-table ref="multipleTable" v-loading="loading" border class="saveTable" style="width: 100%" height="calc(100vh - 192px)" :data="list" tooltip-effect="dark table_overflow_tootip" :cell-style="{ padding: '0px', height: '36px' }" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="名称" min-width="80" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button class="ellipsis saveName" size="mini" type="text" @click="goQueryTab(scope.row)">{{ scope.row.title }}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="querySql" label="查询" min-width="550">
              <template slot-scope="{ row }">
                <el-tooltip class="item" effect="dark" :disabled="isTipDisabled" :content="row.querySql" placement="bottom">
                  <div class="ellipsis" @mouseenter="isShowTooltip">{{ row.querySql }}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="区域" width="220" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ regionFormat(scope.row.region) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="engineZh" label="查询引擎" width="180" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="description" label="描述" min-width="170" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="checkSql(scope.row)">查看</el-button>
                <el-button size="mini" type="text" @click="shareBtn(scope.row)">分享</el-button>
                <el-button size="mini" type="text" @click="moveQuery(scope.row)">移动</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="footer">
            <el-button type="danger" size="mini" :disabled="multipleSelection.length <= 0" :loading="deleting" @click="deleteHandler">删除</el-button>
            <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
          </div>
        </div>
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
    <el-dialog width="30%" title="文件移动" :visible.sync="moveFileDialType" @close="moveClose">
      <el-form ref="moveFileForm" label-width="80px" :model="moveForm">
        <el-form-item label="移动到 :" prop="moveFileName" :rules="[{ required: true, message: '请选择文件夹', trigger: 'change' }]">
          <el-select ref="moveSelectTree" v-model="moveForm.moveFileName" placeholder="请选择文件夹" style="width: 100%">
            <el-option hidden value=""></el-option>
            <customTree :tree-data="folderList" :default-props="defaultProps" :is-menu-icon="false" @node-click="handelClickMove"></customTree>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveFileDialType = false">取 消</el-button>
        <el-button type="primary" @click="moveFilebtn">确 定</el-button>
      </div>
    </el-dialog>
    <shareDialog ref="shareDialog" :share-url="shareUrl" @submitFn="shaerSubmit" />
  </div>
</template>

<script>
import { savedQueryList, deleteQuery, getSaveFolderTree, folderMove, delFolder, editFolderName, addShare, addFolder } from '@/api/querydata';
import { EventBus, EventType } from '@/utils/eventbus';
import { mapGetters, mapMutations } from 'vuex';
import MonacoEditor from '@/components/MonacoEditor/index';
import customTree from '@/components/customTree';
// import copy from 'copy-to-clipboard';
import shareDialog from './shareDialog.vue';
import { getFormatUrl } from '@/utils';

export default {
  components: {
    MonacoEditor,
    customTree,
    shareDialog
  },
  data() {
    return {
      params: {
        info: '',
        title: '',
        query_sql: '',
        engine: '',
        folderID: null,
        pageSize: 30,
        pageNum: 1
      },
      total: 0,
      list: [],
      loading: false,
      deleting: false,
      multipleSelection: [],
      dialogVisible: false,
      activeItem: {
        title: '',
        userGroup: '',
        engine: '',
        querySql: ''
      },
      treeOptions: {
        'expand-on-click-node': false,
        draggable: true
      },
      moveFileDialType: false,
      moveQueryObj: {},
      moveForm: {
        moveFileName: ''
      },
      defaultProps: {
        children: 'child',
        label: 'name'
      },
      moveToFileObject: {},
      shareUrl: '',
      isTipDisabled: false
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'folderList', 'engineListAll', 'regionList']),
    noDrag() {
      const data = this.folderList[0];
      return data ? [data[this.defaultProps.label]] : [];
    }
  },
  created() {
    this.search();
    this.getFolderList();
  },
  methods: {
    ...mapMutations(['SET_FOLDERLIST']),
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    regionFormat(region) {
      return this.regionList.find(item => item.name === region)?.name_zh;
    },
    resetSearch() {
      this.params.info = '';
      this.params.title = '';
      this.params.query_sql = '';
      this.params.engine = '';
      this.params.folderID = null;
      this.params.pageSize = 30;
      this.params.pageNum = 1;

      this.search();
    },
    handelFolder(data) {
      this.params.folderID = data.level === 0 ? '' : data.id;
      this.getList();
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
    addFile(addFolderObj, oldFolderObj) {
      const params = {
        name: addFolderObj.addFileName,
        level: oldFolderObj ? oldFolderObj.level + 1 : 1,
        parent_id: oldFolderObj ? oldFolderObj.id : this.folderList[0]?.id,
        is_active: 1,
        is_query: 0
      };
      addFolder(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '新建成功'
          });
          this.getFolderList();
        }
      });
    },
    // 更改文件夹名
    resetFolderName(data) {
      const params = {
        id: data.id + '',
        name: data[this.defaultProps.label]
      };
      editFolderName(params).then(res => {
        this.$message({
          type: 'success',
          message: '修改成功'
        });
        this.getFolderList();
      });
    },
    // 删除文件夹
    async delFile(data) {
      let info = this.params.info.trim();
      info = info.replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\{/g, '%7B').replace(/\}/g, '%7D').replace(/\\/g, '%5C');
      const { data: resData } = await savedQueryList({ ...this.params, info, folderID: data.id });
      if (resData.list && resData.list.length > 0) {
        this.$message({
          type: 'warning',
          message: '该文件夹下存在保存的sql,请先删除保存的sql再进行该操作'
        });
        return;
      }
      delFolder({ id: data.id + '' }).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        this.getFolderList();
      });
    },
    moveClose() {
      this.$refs.moveFileForm.resetFields();
    },
    // 移动文件
    moveFilebtn() {
      this.$refs.moveFileForm.validate(valid => {
        if (valid) {
          this.moveFileDialType = false;
          const params = {
            id: this.moveQueryObj.id + '',
            parent_id: this.moveToFileObject.id + '',
            is_query: '1'
          };
          this.folderMove(params);
        }
      });
    },
    handelClickMove(data) {
      this.moveForm.moveFileName = data[this.defaultProps.label];
      this.moveToFileObject = data;
      this.$refs.moveSelectTree.blur();
    },
    moveQuery(data) {
      this.moveFileDialType = true;
      this.moveQueryObj = data;
    },
    moveFile(moveFileObj, moveToFileObject) {
      const params = {
        id: moveFileObj.id + '',
        parent_id: moveToFileObject.id ? moveToFileObject.id + '' : null,
        is_query: '0'
      };
      this.folderMove(params);
    },
    folderMove(data) {
      folderMove(data)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          });
        })
        .finally(() => {
          this.getFolderList();
        });
    },
    getFolderList() {
      getSaveFolderTree().then(res => {
        const data = res.data || [];
        this.SET_FOLDERLIST(data);
      });
    },
    // 添加文件夹
    // addFolder() {
    //   this.$refs.customTree.addFolder();
    // },
    // 分享功能
    shareBtn(data) {
      const { id } = data;
      const resText = getFormatUrl('sqlId', id, location.hash);
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
    getList() {
      this.loading = true;
      let info = this.params.info.trim();
      info = info.replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\{/g, '%7B').replace(/\}/g, '%7D').replace(/\\/g, '%5C');
      savedQueryList({ ...this.params, info })
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
    },
    deleteHandler() {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const ids = this.multipleSelection.map(item => {
            return item.id;
          });
          this.deleting = true;
          deleteQuery({ id: ids.join(',') })
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功'
              });
              this.search();
            })
            .finally(() => {
              this.deleting = false;
            });
        })
        .catch(() => {});
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
.savedquery-box {
  height: 100%;
  .savedquery-content {
    display: flex;
    .savedquery-left {
      width: 230px;
      min-width: 230px;
      padding: 8px;
      border-right: 1px solid #e2e9f3;
      border-bottom: 1px solid #e2e9f3;
      box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
      .savequery_title {
        margin-bottom: 8px;
        font-size: $global-font-size-14;
      }
      ::v-deep {
        .custom-tree-node.custom-tree-node-children {
          .node_right {
            width: 10px;
          }
        }
      }
    }
    .savedquery-right {
      flex: 1;
      width: calc(100% - 230px);
      padding: 8px;
      border: 1px solid #e2e9f3;
      // margin: 5px;
      border-left: none;
      margin-bottom: 0;
      .condition-box {
        margin-bottom: 8px;
        overflow: hidden;
        position: relative;
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
        .footer {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .el-pagination {
            padding: 0;
          }
        }
        .saveTable {
          border-left: 0;
          border-right: 0;
          .saveName {
            white-space: nowrap !important;
          }
        }
      }
    }
  }
}
</style>
