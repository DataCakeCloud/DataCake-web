<!-- 组件在移动弹窗内递归调用了一次，在某些数据上进行了第一层调用和第二层调用的分层 -->
<template>
  <div>
    <CustomTree
      ref="treeDom"
      :context-menu-option="contextMenuOption"
      :tree-data="treeData"
      :deep-tree-data="deepTreeData"
      :select-tree="selectTree"
      :is-create-file="true"
      :default-props="defaultProps"
      :options="treeOptions"
      :lazy-options="lazyOptions"
      :lazy-load="loadNode"
      :is-contextmenu="true"
      :is-filter="true"
      :allow-drag="true"
      :allow-drop="true"
      :depth="100"
      :is-locked="true"
      :file-storage="fileStorage"
      :select-mode-obj="selectModeObj"
      @changeFilter="changeFilter"
      @delFile="delTreeItem"
      @resetFolderName="resetFolderName"
      @addFile="addFile"
      @node-click="clickTree"
      @moveFile="moveFile"
      @selectFolder="selectFolder"
      @isMoveFile="isMoveFile"
    />
    <Link-File ref="linkFileRef" :module="module" @saveFolderTask="saveFolderTask"></Link-File>
  </div>
</template>
<script>
import CustomTree from '@/components/customTree/lazyIndex.vue';
import LinkFile from './LinkTaskFile';
import { getLabelUrl } from '@/api/useLazyTree';
import { getFolderTree, fileSearch, addFileApi, addFileListApi, delTreeItemApi, moveTreeItemApi, changeNameApi, getFileNums } from '@/api/useLazyTree';
export default {
  components: {
    CustomTree,
    LinkFile
  },
  props: {
    module: {
      type: String,
      default: 'TASK'
    },
    selectModeObj: {
      type: Object,
      default: () => {
        return {
          isSelectMode: false,
          selectName: ''
        };
      }
    }
  },
  data() {
    return {
      treeData: [],
      deepTreeData: [],
      selectTree: [],
      fileStorage: [], // 用于处理文件计数
      contextMenuOption: {},
      selectFolderId: '',
      onlyShowFolder: false,
      defaultProps: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf',
        fileNums: 'fileNums'
      },
      treeOptions: {
        'expand-on-click-node': false,
        draggable: true
      },
      lazyOptions: {
        isLazy: true,
        isLazyFilter: true,
        isLazyIcon: true,
        module: this.module
      },
      params: {
        module: this.module
      }
    };
  },
  created() {
    this.contextMenuOption = {
      menuList: [
        {
          label: '复制任务',
          disabledFn: (event, node, data) => {
            return false;
          },
          hiddenFn: (event, node, data) => {
            // return this.lazyOptions.isLazy && !data[this.defaultProps.isLeaf];
            return true;
          },
          onClick: this.copyItem
        },
        // {
        //   label: this.module === 'TASK' ? '关联任务' : '关联文件',
        //   disabledFn: (event, node, data) => {
        //     return false;
        //   },
        //   hiddenFn: (event, node, data) => {
        //     return this.lazyOptions.isLazy && data[this.defaultProps.isLeaf];
        //   },
        //   onClick: this.linkItem
        // },
        {
          label: this.module === 'TASK' ? '新建任务' : '新建文件',
          disabledFn: (event, node, data) => {
            return false;
          },
          hiddenFn: (event, node, data) => {
            return this.lazyOptions.isLazy && data[this.defaultProps.isLeaf];
          },
          onClick: this.createItem
        }
      ],
      setMenu(menuList, event, node, data) {
        // menuList.forEach((item, index) => {
        //   if (item.label === '移 动') {
        //     menuList.splice(index, 1);
        //   }
        // });
        return menuList;
      }
    };
    if (this.selectModeObj.isSelectMode) {
      this.onlyShowFolder = true;
    }
  },
  methods: {
    async loadNode(node, resolve) {
      if (node.level === 0) {
        const reqData = await getFolderTree({ ...this.params, id: 0 });
        if (resolve) {
          resolve(reqData.data.entityList);
          // 默认展开第一级
          if (!this.onlyShowFolder) {
            this.getStorageList(reqData.data.entityList);
            //  在!this.onlyShowFolder判断中，防止弹窗展开时会自动展开第一层调用的树组件
            this.$refs.treeDom.expandNode(reqData.data.entityList[0].id);
          }
        } else {
          return reqData.data.entityList;
        }
      }
      if (node.level >= 1) {
        const reqData = await getFolderTree({ ...this.params, id: node.data.id });
        const deepData = this.getTreeList(reqData.data.entityList, node.data.id);
        if (resolve) {
          if (!this.onlyShowFolder) {
            this.getStorageList(reqData.data.entityList);
          }
          resolve(deepData);
        } else {
          return deepData;
        }
      }
    },
    getStorageList(reqArr, type) {
      // 把文件数收集和更新到this.fileStorage中
      const arr = JSON.parse(JSON.stringify(reqArr)).filter(item => !item[this.defaultProps.isLeaf]);
      let arrIndex;
      const haveIndex = this.fileStorage.findIndex(item => {
        arrIndex = arr.findIndex(arrItem => arrItem.id === item.id);
        return arrIndex !== -1;
      });
      if (haveIndex > -1) {
        if (type === 'delete') {
          this.fileStorage.splice(haveIndex, 1);
        } else {
          this.fileStorage.splice(haveIndex, 1, arr[arrIndex]);
          arr.splice(arrIndex, 1);
          if (arr.length) {
            this.getStorageList(arr);
          }
        }
      } else {
        this.fileStorage = this.fileStorage.concat(arr);
      }
      // 当无搜索时，调用额外接口更新文件数，当有搜索时
      if (!this.filterText) {
        const fileIds = this.getIdStr(this.fileStorage, 'fileStorage');
        getFileNums({ ids: fileIds }).then(res => {
          const reqList = res.data.entityList;
          reqList.forEach(item => {
            const storageItem = this.fileStorage.find(storageItem => storageItem.id === item.id);
            if (storageItem) {
              storageItem.fileNums = item.fileNums;
            }
          });
        });
      }
    },
    getTreeList(data = [], parentId) {
      const folderList = [];
      data.forEach((item, index) => {
        item.children = [];
        item.level = 0;
        if (!item.parentId || item.parentId === parentId) {
          if (!this.onlyShowFolder || (this.onlyShowFolder && !item[this.defaultProps.isLeaf])) {
            folderList.push(item);
          }
        }
      });
      const childrenList = data.filter(item => folderList.findIndex(folderItem => folderItem.id === item.id) < 0);
      if (childrenList.length) {
        folderList.forEach((item, index) => {
          const otherDataList = JSON.parse(JSON.stringify(childrenList));
          this.resolveTreeData(item, otherDataList);
        });
      }
      // 处理某一个子节点数组的树数据
      return folderList;
    },
    resolveTreeData(resolveData, totalData) {
      totalData.map((item, index) => {
        const otherDataList = JSON.parse(JSON.stringify(totalData));
        if (item.parentId === resolveData.id) {
          if (!this.onlyShowFolder || (this.onlyShowFolder && !item[this.defaultProps.isLeaf])) {
            otherDataList.splice(index, 1);
            resolveData.children.push(item);
            this.resolveTreeData(item, otherDataList);
          }
        }
      });
    },
    isMoveFile(val) {
      this.onlyShowFolder = val;
    },
    async changeFilter(val, isDeepCom) {
      this.filterText = val;
      if (val) {
        const reqData = await fileSearch({ ...this.params, name: val });
        this.$nextTick(() => {
          if (!isDeepCom) {
            this.treeData = this.getTreeList(reqData.data.entityList);
            this.$refs.treeDom.toggleLazyStatus(false);
          } else {
            this.deepTreeData = this.getTreeList(reqData.data.entityList);
            this.$refs.treeDom.$refs.selectTree.toggleLazyStatus(false);
          }
        });
      } else {
        if (!isDeepCom) {
          this.$refs.treeDom.toggleLazyStatus(true);
        } else {
          this.$refs.treeDom.$refs.selectTree.toggleLazyStatus(true);
        }
      }
    },
    async clickTree(data) {
      // // 获取点击的文件夹id
      // if (!data[this.defaultProps.isLeaf]) {
      //   this.selectFolderId = data.id;
      // } else {
      //   this.selectFolderId = '';
      // }
      // // 获取文件夹中的子节点拼接的字符串
      // let dataList = [];
      // if (data.children && data.children.length) {
      //   // 搜索状态时处于非懒加载情况
      //   dataList = data.children;
      // } else {
      //   // 懒加载情况下
      //   const node = this.$refs.treeDom.getTreeNode(data.id);
      //   if (node) {
      //     dataList = await this.loadNode(node);
      //   }
      // }
      // // 用于搜索列表的id拼接字符串
      // const searchIds = data[this.defaultProps.isLeaf] ? data.entityId : this.getIdStr(dataList, 'click');
      this.$emit('clickTreeItem', data, this.filterText);
    },
    getIdStr(dataList, type) {
      const idsObj = {
        ids: ''
      };
      dataList.forEach(item => {
        if (type === 'click') {
          if (item[this.defaultProps.isLeaf]) {
            idsObj.ids += item.entityId + ',';
          }
        } else {
          idsObj.ids += item.id + ',';
        }
      });
      const idStr = idsObj.ids.slice(0, -1);
      return idStr;
    },
    // 移动文件夹
    moveFile(oldData, toData) {
      moveTreeItemApi({ id: oldData.id, oldParentId: oldData.parentId, newParentId: toData.id }).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '移动成功'
          });
          if (this.lazyOptions.isLazy) {
            this.$refs.treeDom.delTreeItem(oldData.id);
            this.$refs.treeDom.expandNode(toData.id);
          } else {
            this.changeFilter(this.$refs.treeDom.filterText);
          }
        }
      });
    },
    // 删除文件夹
    async delTreeItem(data) {
      if (this.module === 'TASK' && data[this.defaultProps.isLeaf]) {
        this.$emit('deleteItem', data);
      } else {
        delTreeItemApi({ id: data.id }).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功'
            });
            this.getStorageList([data], 'delete');
            this.$refs.treeDom.delTreeItem(data.id);
          }
        });
      }
    },
    // 更改文件夹名
    resetFolderName(data) {
      const params = {
        id: data.id,
        newName: data.name,
        module: this.module
      };
      changeNameApi(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '修改成功'
          });
        }
      });
    },
    addFile(addFolderObj, parentFolderObj, addType) {
      addFileApi({ ...this.params, name: addFolderObj.addFileName, isFolder: addType === 'folder', parentId: parentFolderObj.id }).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '新建成功'
          });
          if (this.lazyOptions.isLazy) {
            // if (this.$refs.treeDom.getTreeNode(parentFolderObj.id).expanded) {
            //   this.$refs.treeDom.expandNode(parentFolderObj.id);
            // }
            this.$refs.treeDom.expandNode(parentFolderObj.id);
          } else {
            this.changeFilter(this.filterText);
          }
        }
      });
    },
    linkItem(event, node, data) {
      this.$refs.linkFileRef.showFolderTask(data.id);
    },
    createItem(event, node, data) {
      if (this.module === 'TASK') {
        this.$router.push({ name: 'TaskStep1', query: { folderId: data.id }});
      } else {
        this.$router.push({ name: 'ArtifactDetail', query: { folderId: data.id }});
      }
    },
    copyItem(event, node, data) {
      // this.$emit('copyItem', data)
    },
    saveFolderTask(val, parentId) {
      const paramsList = val.map(item => {
        return {
          module: this.module,
          name: item.name,
          parentId: parentId,
          isFolder: false,
          entityId: item.id
        };
      });
      addFileListApi(paramsList).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '关联成功'
          });
          if (this.lazyOptions.isLazy) {
            this.$refs.treeDom.expandNode(parentId);
          } else {
            this.changeFilter(this.filterText);
          }
          if (this.selectFolderId === parentId) {
            this.$emit('treeSearch');
          }
        }
      });
    },
    selectFolder(data) {
      // 根据id获取文件的完整链路名字
      getLabelUrl({ id: data.id }).then(res => {
        const list = res.data.pfolderList;
        const selectData = {
          selectName: ''
        };
        selectData.id = data.id;
        list.forEach((item, index) => {
          if (index !== list.length - 1) {
            selectData.selectName += item.name + '/';
          } else {
            selectData.selectName += item.name;
          }
        });
        this.selectModeObj.selectName = selectData.selectName;
        this.$emit('selectFolder', selectData);
      });
    }
  }
};
</script>
