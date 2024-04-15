<template>
  <el-card>
    <div class="title hive-title">
      <!-- <div class="el-icon-caret-bottom">
        {{ modelText }}
        <el-tooltip v-if="modelId === 0" class="item" effect="dark" content="点击进行搜索,右键支持创建库/表" placement="top">
          <i class="el-icon-warning-outline" style="cursor: pointer"></i>
        </el-tooltip>
      </div> -->
      <el-dropdown trigger="click" placement="bottom-start">
        <span class="el-dropdown-link">
          <el-button slot="reference" :disabled="!modelData.length" type="text">
            <i class="el-icon-sort rotate"></i>
            切换
          </el-button>
        </span>
        <el-dropdown-menu slot="dropdown" class="model-drop">
          <el-dropdown-item v-for="item in modelData" :key="item.id" :class="[{ active: item.id === modelId }]" @click.native="changeModel(item)">{{ item.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button type="text" @click="searchModelCount">
          <i class="el-icon-refresh"></i>
        </el-button>
      </el-tooltip>
    </div>
    <div class="config_table">
      <div v-loading="loading" class="table_content">
        <el-empty v-if="showModelList.length <= 0" description="暂无数据" :image-size="100"></el-empty>
        <div v-else ref="tableTree" class="table-tree">
          <el-tree ref="tableTree" class="model-tree" :data="showModelList" default-expand-all :expand-on-click-node="false" :filter-node-method="filterNode">
            <template slot-scope="{ node, data }">
              <div :class="['node-item', { default: modelId === 0 }]" @click="handelModel($event, node, data)">
                <div class="node-text">
                  <svg-icon v-if="modelId === 0 && node.level === 1" icon-class="dataLake" class="title-icon" />
                  <svg-icon v-else-if="modelId === 0 && node.level === 2" icon-class="database" class="title-icon" />
                  <svg-icon v-else-if="modelId !== 0 && node.level === 3" icon-class="model" class="title-icon" />
                  <el-tooltip effect="dark" :content="data.groupName" :disabled="isTipDisabled" placement="top">
                    <div class="text" @mouseenter="isShowTooltip">{{ data.groupName }}</div>
                  </el-tooltip>
                </div>
                <div class="node-count">{{ data.count }}</div>
                <svg-icon v-if="modelId === 0" icon-class="extendedMenu" class="svg_extendedMenu" @click.prevent.stop="onContextmenu($event, node, data)" />
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </div>
    <el-divider></el-divider>
    <div class="title el-icon-search">历史搜索</div>
    <el-empty v-if="!hisSearchList.length && !hisSearchLoading" :image-size="100"></el-empty>
    <div v-else v-loading="hisSearchLoading" class="history-list">
      <el-tooltip v-for="(item, index) in hisSearchList" :key="item.id" popper-class="tag-popper" :content="item.input" placement="bottom-start" :disabled="isTipDisabled">
        <span
          v-loading="item.delLoading"
          element-loading-spinner="el-icon-loading"
          :class="['sl-value-item bg', { active: keyword === item.input }]"
          @mouseenter="isShowTooltip"
          @click="searchParam('keyWord', item.input)"
        >{{ item.input }} <i class="del el-icon-error" @click.stop="delHistorySearch(item, index)"></i>
        </span>
      </el-tooltip>
    </div>
    <el-divider></el-divider>
    <div class="title el-icon-star-off">我的收藏</div>
    <el-empty v-if="!collectList.length & !collectLoading" :image-size="100"></el-empty>
    <div v-else v-loading="collectLoading" class="history-list">
      <el-tooltip v-for="(item, index) in collectList" :key="item.tableName" popper-class="tag-popper" :content="item.dbTable" placement="bottom-start" :disabled="isTipDisabled">
        <span v-loading="item.collectLoading" element-loading-spinner="el-icon-loading" class="sl-value-item bg" @mouseenter="isShowTooltip" @click="handelCollect(item)">{{ item.dbTable }} <i class="del el-icon-error" @click.stop="handleCollect(item, index)"></i> </span>
      </el-tooltip>
      <el-button v-if="!collectLoading" type="text" class="show-more" @click="handleShowMoreCollect">查看更多</el-button>
    </div>
    <create-db ref="createDb" @addDbOk="addDbOk"></create-db>
    <CollectDial ref="collectDial" @getCollectList="handelGetCollect"></CollectDial>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex';
import CollectDial from './collectDial.vue';
import CreateDb from '../../step/components/CreateDb';
import { getHistorySearch, delHistorySearch, collectList, collect, getModelTree, searchModelCount, collectPages } from '@/api/metadata';

export default {
  name: 'LeftBar',
  components: {
    CreateDb,
    CollectDial
  },
  props: {
    keyword: {
      type: String,
      default: ''
    },
    region: {
      type: String,
      default: ''
    },
    showNumTip: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    leftDbList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      hisSearchLoading: false,
      collectLoading: false,
      isTipDisabled: false,
      hisSearchList: [],
      collectList: [],
      params: {
        dbName: '',
        subject: ''
      },
      modelData: [],
      showModelList: [],
      modelId: null,
      currentModel: null,
      parentDom: null
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'currentUserGroup']),
    isRoot() {
      return ['dpm'].includes(this.currentUserGroup.name);
    }
    // modelText() {
    //   const text = this.modelData.find(item => item.id === this.modelId)?.name || '经典模型';
    //   return text;
    // }
  },
  watch: {
    keyword() {
      this.currentModel = null;
      this.searchModelCount();
    }
  },
  async created() {
    const modelId = sessionStorage.getItem('modelId');
    if (modelId) this.modelId = modelId * 1;
    await this.getModelTree();
    this.getHistorySearch();
    this.searchModelCount();
    this.getCollectList();
  },
  methods: {
    handelCollect(data) {
      this.$router.push({
        name: 'MetaDataDetail',
        query: {
          region: data.region,
          databaseName: data.dbName,
          tableName: data.tableName.split('.')[2]
        }
      });
    },
    handelModel(e, node, data) {
      if (this.modelId === 0) {
        let groupName = data.groupName === this.params.dbName ? '' : data.groupName;
        this.params.categoryId = null;
        if (node.level === 1) groupName = '';
        this.searchParam('dbName', groupName);
      } else {
        const categoryId = data.id === this.params.categoryId ? '' : data.id;
        this.params.dbName = '';
        this.searchParam('categoryId', categoryId);
      }
      const parentDom = this.searchParentNode(e.target, 'el-tree-node__content');
      if (this.parentDom && this.parentDom !== parentDom) this.parentDom.classList.remove('select-item');
      this.parentDom = parentDom;
      this.parentDom?.classList.toggle('select-item');
    },
    searchParentNode(dom, parentClass) {
      const parentNode = dom.parentNode;
      if (Array.from(parentNode.classList).includes(parentClass)) {
        return parentNode;
      } else {
        return this.searchParentNode(parentNode, parentClass);
      }
    },
    // 右键实例
    onContextmenu(event, node, data) {
      if (this.modelId !== 0) return;
      const items = [];
      if (node.level === 1) {
        items.push({
          label: '创建库',
          onClick: () => {
            this.$router.push({
              name: 'DbManage'
            });
          }
        });
      } else if (node.level === 2) {
        items.push({
          label: '创建表',
          onClick: () => {
            this.$router.push({
              name: 'MetaDataStep',
              query: {
                region: this.region || '',
                dbName: ''
              }
            });
          }
        });
      }
      this.$contextmenu({
        items,
        event,
        zIndex: 4200,
        minWidth: 50
      });
      event.preventDefault();
    },
    changeModel(data) {
      if (this.modelId === data.id) return;
      this.modelId = data.id;
      sessionStorage.setItem('modelId', this.modelId);
      this.searchModelCount();
    },
    searchModelCount() {
      if (this.modelId === null || this.modelId === undefined) return;
      this.loading = true;
      const params = {
        keyWord: this.keyword,
        region: '',
        categoryId: this.modelId
      };
      searchModelCount(params)
        .then(res => {
          this.showModelList = res.data?.children || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    filterNode(value, data) {
      console.log(value, data);
    },
    getModelTree() {
      return getModelTree().then(res => {
        this.modelData = res.data?.filter(item => item.effective);
        if ((this.modelData.length && this.modelId === null) || this.modelId === undefined) {
          this.modelId = this.modelData[0].id;
        }
      });
    },
    addDbOk(edit) {
      if (edit) {
        this.getDbDetail(this.params.dbName);
      }
    },
    delHistorySearch(item, index) {
      this.hisSearchList[index].delLoading = true;
      delHistorySearch({ name: item.input }).then(res => {
        this.hisSearchList[index].delLoading = false;
        this.$message({
          type: 'success',
          message: '删除搜索记录成功'
        });
        this.getHistorySearch();
      });
    },
    getHistorySearch() {
      this.hisSearchLoading = true;
      this.hisSearchList = [];
      getHistorySearch({ size: 10 }).then(res => {
        this.hisSearchLoading = false;
        const data = res.data;
        if (Array.isArray(data) && !data.length) return;
        this.hisSearchList =
          data.length &&
          data.map(e => {
            const item = { ...e, delLoading: false };
            return item;
          });
      });
    },
    handelGetCollect() {
      this.getCollectList();
      this.$emit('updateList', {});
    },
    getCollectList() {
      this.collectLoading = true;
      this.collectList = [];
      collectPages({
        pageNum: 1,
        pageSize: 6
      })
        .then(res => {
          const data = res.data?.list || [];
          if (!data.length) return;
          this.collectList =
            (data.length &&
              data.map(e => {
                const item = { ...e, collectLoading: false };
                return item;
              })) ||
            [];
        })
        .finally(() => {
          this.collectLoading = false;
        });
    },
    handleShowMoreCollect() {
      this.$refs.collectDial.show();
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    handleCollect(item, index) {
      this.collectList[index].collectLoading = true;
      collect({
        region: item.region,
        dbName: item.dbName,
        tableName: item.tableName,
        isCollect: false
      }).then(res => {
        this.collectList[index].collectLoading = false;
        this.$message({
          type: 'success',
          message: '取消收藏成功'
        });
        this.$emit('updateList', {});
        this.getCollectList();
      });
    },
    searchParam(key, value) {
      this.params[key] = value;
      this.$emit('updateList', this.params);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.title {
  margin-bottom: 20px;
  font-size: $global-font-size-18;
  &::before {
    margin-right: 5px;
  }
}
.tableNumBox {
  margin-left: 10px;
  color: rgb(83, 168, 255);
}
.hive-title {
  margin: 6px 0 6px 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .rotate {
    transform: rotate(90deg);
  }
}
.table-title {
  display: flex;
  align-items: center;
}
.config_table {
  margin-bottom: 15px;
  .table-tree {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    .model-tree {
      width: 100%;
      ::v-deep {
        .el-tree-node__expand-icon {
          padding: 5px;
        }
        & > .el-tree-node {
          margin-bottom: 10px;
          & > .el-tree-node__content {
            background-color: #f8f8f8;
            border-radius: 3px;
            & > .node-item {
              font-weight: 500;
            }
          }
          & > .el-tree-node__children {
            & > .el-tree-node {
              & > .el-tree-node__content {
                & > .node-item {
                  font-weight: 500;
                  &.default {
                    font-weight: 400;
                  }
                }
              }
            }
          }
        }
        .el-tree-node {
          .el-tree-node__children {
            .el-tree-node__content {
              // padding-left: 20px !important;
              border-radius: 3px;
            }
          }
        }
        .el-tree-node__children {
          .node-item {
            width: calc(100% - 15px);
            .node-text {
              width: calc(100% - 25px);
            }
          }
        }
        .select-item {
          background-color: #e4f5fe !important;
          color: $c-primary;
          .node-count {
            color: $c-primary !important;
          }
        }
        .node-item {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
          padding-right: 5px;
          align-items: center;
          justify-content: space-between;
          .node-text {
            width: 100%;
            display: flex;
            align-items: center;
            .title-icon {
              vertical-align: middle;
              margin-right: 5px;
            }
            .text {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .node-count {
            padding: 1px 8px;
            background-color: #f3f3f3;
            border-radius: 3px;
            color: #797979;
          }
          &.default {
            .svg_extendedMenu {
              display: none;
              position: absolute;
              right: 0;
              right: 6px;
              background: #f1f1f1;
              height: 18px;
              border-radius: 3px;
            }
            &:hover {
              padding-right: 25px;
              .svg_extendedMenu {
                display: block;
              }
            }
          }
        }
      }
    }
  }
  .table-item {
    height: 25px;
    line-height: 25px;
    cursor: pointer;
  }
}
.history-list {
  min-height: 50px;
  margin-bottom: 10px;
  position: relative;

  .show-more {
    position: absolute;
    bottom: -15px;
    right: 0px;
  }
}
.sl-value-item {
  position: relative;
  display: inline-block;
  padding: 5px 10px;
  margin: 0 10px 10px 0;
  border-radius: 4px;
  cursor: pointer;
  /* word-break: break-all; */
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
  white-space: nowrap;
  ::v-deep .el-loading-spinner {
    margin-top: -7px;
  }
  .del {
    position: absolute;
    right: 3px;
    top: -15px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
  &.bg {
    background: #f5f5f5;
  }
  &:hover {
    background: #f5f5f5;
    .del {
      top: 3px;
    }
  }
  &.active {
    background: $c-primary;
    color: #fff;
  }
}
</style>
<style lang="scss">
.model-drop {
  .active {
    color: $c-primary;
  }
}
</style>
