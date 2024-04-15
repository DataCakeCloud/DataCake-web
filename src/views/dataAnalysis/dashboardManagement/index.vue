<template>
  <div class="chartPanel_wrapper">
    <div class="wrap_left">
      <div class="search_top">
        <div class="search_left">
          <el-tooltip effect="dark" content="全部" placement="top" :enterable="false" @click.native="getCatalogue('all')">
            <i class="el-icon-s-cooperation icon"></i>
          </el-tooltip>
          <!-- <el-tooltip effect="dark" content="我的" placement="top" @click.native="getCatalogue('my')">
          <i class="el-icon-user icon"></i>
        </el-tooltip> -->
          <el-tooltip effect="dark" content="收藏" placement="top" :enterable="false" @click.native="getCatalogue('tuck')">
            <svg-icon icon-class="follow" class="title_follow icon"></svg-icon>
          </el-tooltip>
          <el-tooltip effect="dark" content="分享" placement="top" :enterable="false" @click.native="getCatalogue('share')">
            <svg-icon icon-class="share1" class="share1" />
          </el-tooltip>
        </div>
        <div class="search_right">
          <el-tooltip effect="dark" content="新建仪表盘" placement="top" :enterable="false" @click.native="addDashboard({}, {}, {}, 'tree')">
            <i class="el-icon-circle-plus-outline icon"></i>
          </el-tooltip>
        </div>
      </div>
      <customTree
        v-if="activeTitle === 'all'"
        ref="customTree"
        v-loading="folderLoading"
        :set-no-drag="setNoDrag"
        :tree-data="folderList"
        :default-props="defaultProps"
        :options="treeOptions"
        :node-options="nodeOptions"
        :is-contextmenu="true"
        :is-filter="true"
        :depth="4"
        :no-drag="noDrag"
        :context-menu-option="contextMenuOption"
        @moveFile="moveFile"
        @delFile="delFile"
        @resetFolderName="resetFolderName"
        @addFile="addFile"
        @node-click="handelFolder"
      />
      <div class="left_list">
        <!-- <div class="list_search">
          <el-input v-model="params.title" class="search_input" size="mini" placeholder="请输入名称" @keydown.native.enter="getChartTable"> </el-input>
        </div> -->
        <div v-if="!dashboardLoading" class="list_box">
          <div v-for="item in dashboardList" :key="item.id" class="list_item">
            <div class="item" @click="handelDashboard(item)">
              <span class="item_left">
                <svg-icon icon-class="dash"></svg-icon>
                <span class="text">{{ item.name }}</span>
              </span>
              <span class="item_right">
                <el-tooltip v-if="activeTitle === 'tuck'" class="item_tuck" effect="dark" content="取消" placement="top" @click.native.stop="addTuckDashBoard(item)">
                  <svg-icon icon-class="follow" :class="['title_follow icon', 'shadow']"></svg-icon>
                </el-tooltip>
              </span>
            </div>
          </div>
          <el-empty v-if="dashboardList.length === 0" description="暂无数据"></el-empty>
        </div>
        <i v-else class="el-icon-loading"></i>
      </div>
    </div>
    <div class="wrap_right">
      <el-empty v-if="empty" description="暂无图表"></el-empty>
      <dashboardBox v-else ref="dashboardBox" v-loading="dashLoading" />
    </div>
  </div>
</template>

<script>
import customTree from '@/components/customTree';
import dashboardBox from './components/dashBoardBox.vue';
import { getDashboardList, getDashboardTree, addDashboardFolder, editDashboardFolderName, delDashboardFolder, delDashboard, moveDashboardFolder, getDashboardData, addTuckChart, chartTuckDel } from '@/api/querydata';
import { localGetItem, localSetItem } from '@/utils/customStorage';

export default {
  components: {
    customTree,
    dashboardBox
  },
  data() {
    return {
      nodeOptions: {
        key: 'type',
        value: '看板',
        icon: 'dash'
      },
      empty: true,
      defaultProps: {
        children: 'child',
        label: 'name'
      },
      treeOptions: {
        'expand-on-click-node': false,
        draggable: true
      },
      noDrag: [],
      folderLoading: false,
      folderList: [],
      activeTitle: 'all',
      dashboardList: [],
      dashboardLoading: false,
      contextMenuOption: {
        menuList: [
          { label: '新建仪表盘', disabledFn: this.dashboardDisabledType, onClick: this.addDashboard },
          { label: '收藏', disabledFn: this.dashBoardTuckType, onClick: this.tuckDashboard }
        ],
        setMenu: this.setMenu
      },
      dashLoading: false
    };
  },
  mounted() {
    this.getDashboardTree();

    const dashboardId = this.$route.query.dashBoardId;
    if (dashboardId) {
      this.handelDashboard({ id: dashboardId, isShare: true });
      return;
    }
    const dashboardSave = JSON.parse(localGetItem('dashboardSave'));
    if (dashboardSave) {
      this.handelDashboard({ id: dashboardSave.id, isShare: dashboardSave.isShare });
    }
  },
  methods: {
    setNoDrag(draggingNode, dropNode, type) {
      return dropNode.data.type !== '看板';
    },
    addTuckDashBoard(data) {
      if (data.isFavorate === 1) {
        chartTuckDel({ id: data.id + '', type: 'dashboard' })
          .then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '取消成功'
              });
            }
          })
          .finally(() => {
            this.getDashboardTree();
            this.getDashboardList();
          });
      } else {
        addTuckChart({ favorId: data.id + '', type: 'dashboard', isActive: 1 })
          .then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '收藏成功'
              });
            }
          })
          .finally(() => {
            this.getDashboardTree();
          });
      }
    },
    // 新建仪表盘
    addDashboard(event, node, data, type = '') {
      this.empty = false;
      this.$nextTick(() => {
        if (type) {
          const res = this.folderList[0] || {};
          this.$refs.dashboardBox?.addDashboard(event, node, res);
        } else {
          this.$refs.dashboardBox?.addDashboard(event, node, data);
        }
      });
    },
    // 收藏 / 取消收藏
    tuckDashboard(event, node, data) {
      this.addTuckDashBoard(data);
    },
    getCatalogue(type) {
      this.activeTitle = type;
      if (type !== 'all') {
        this.getDashboardList();
      }
    },
    dashboardDisabledType(event, node, data) {
      return !data[this.defaultProps.children] || data.type === '看板' || node.level === 4;
    },
    dashBoardTuckType(event, node, data) {
      return data.type !== '看板';
    },
    setMenu(menuList, event, node, data) {
      // 新建文件夹disabled处理
      menuList.forEach(item => {
        if (item.label === '新建文件夹') {
          if (item.type === '看板' || node.level >= 3) {
            item.disabled = true;
          }
        }
        if (item.label === '收藏') {
          if (data.isFavorate === 1) {
            item.label = '取消收藏';
          }
        }
      });
      const index = menuList.findIndex(item => item.label === '新建仪表盘');
      const cueerntObj = menuList.splice(index, 1);
      menuList.splice(1, 0, ...cueerntObj);
      return menuList;
    },
    moveFile(moveFileObj, moveToFileObject) {
      const params = {
        id: moveFileObj.id + '',
        parent_id: moveToFileObject.id ? moveToFileObject.id + '' : null,
        is_query: moveFileObj.type === '看板' ? '1' : '0'
      };
      moveDashboardFolder(params)
        .then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '操作成功'
            });
          }
        })
        .finally(() => {
          this.getDashboardTree();
        });
    },
    // 删除文件夹
    delFile(data) {
      let fn = delDashboardFolder;
      if (data.type === '看板') fn = delDashboard;
      fn({ id: data.id + '' }).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          if (data.type === '看板') this.empty = true;
          this.getDashboardTree();
        }
      });
    },
    // 更改文件夹名
    resetFolderName(data) {
      const params = {
        id: data.id + '',
        is_query: data.type === '看板' ? '1' : '0',
        name: data[this.defaultProps.label]
      };
      editDashboardFolderName(params)
        .then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '修改成功'
            });
          }
        })
        .finally(() => {
          this.getDashboardTree();
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
      addDashboardFolder(params).then(res => {
        if (res.codeStr === 'SUCCESS') {
          this.$message({
            type: 'success',
            message: '新建成功'
          });
          this.getDashboardTree();
        }
      });
    },
    handelFolder(data, node, curr) {
      if (data.type === '看板') {
        this.handelDashboard(data);
      }
    },
    handelDashboard(data) {
      this.empty = false;
      this.$refs.dashboardBox?.resetData();
      this.dashLoading = true;
      getDashboardData({ id: data.id })
        .then(res => {
          if (res.code === 0) {
            this.$refs.dashboardBox?.initData(Object.assign(res.data[0], { isShare: data.isShare }));
            localSetItem('dashboardSave', JSON.stringify({ id: data.id, isShare: data.isShare }));
          }
        })
        .finally(() => {
          this.dashLoading = false;
        });
    },
    // 获取目录列表
    getDashboardList() {
      this.dashboardLoading = true;
      getDashboardList({ pageNum: 1, pageSize: 10000, type: this.activeTitle })
        .then(res => {
          this.dashboardList = res.data.list;
        })
        .finally(() => {
          this.dashboardLoading = false;
        });
    },
    // 获取目录树列表
    getDashboardTree() {
      this.folderLoading = true;
      getDashboardTree()
        .then(res => {
          this.folderList = res.data;
        })
        .finally(() => {
          this.folderLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.chartPanel_wrapper {
  display: flex;
  .icon {
    cursor: pointer;
  }
  .wrap_left {
    padding: 6px;
    min-height: calc(100vh - 60px);
    width: 230px;
    border-right: 1px solid #e2e9f3;
    border-bottom: 1px solid #e2e9f3;
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
    .search_top {
      padding: 5px 0 10px 0;
      display: flex;
      justify-content: space-between;
      .search_left {
        .icon {
          margin-right: 10px;
        }
        .title_follow {
          margin-bottom: -2px;
          transform: scale(1.2);
        }
        .share1 {
          margin-bottom: -1px;
        }
        .el-icon-s-cooperation {
          color: $color-c3;
        }
        .el-icon-user {
          color: $c-primary;
        }
      }
      .search_right {
        .icon {
          font-size: $global-font-size-16;
          color: $c-primary;
        }
      }
    }
    .left_list {
      .list_search {
        margin-bottom: 6px;
      }
      .list_box {
        .list_item {
          padding: 4px 0;
          border-bottom: 1px solid #e2e9f3;
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 4px 0;
            padding-left: 10px;
            &:hover {
              background-color: #f2f6fc;
              .item_right {
                visibility: visible;
                .shadow {
                  opacity: 0.3;
                }
              }
            }
            .item_right {
              visibility: hidden;
              padding-right: 5px;
              display: flex;
              align-items: center;
            }
            .item_left {
              display: flex;
              align-items: center;
              .text {
                margin-left: 6px;
              }
            }
          }
        }
      }
      .el-icon-loading {
        display: block;
        width: 20px;
        font-size: 20px;
        margin: 20px auto;
      }
      .el-empty {
        ::v-deep .el-empty__image {
          width: 80px;
        }
      }
    }
  }
  .wrap_right {
    max-width: calc(100% - 230px);
    flex: 1;
    padding: 10px;
    padding-bottom: 0;
    .el-empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
