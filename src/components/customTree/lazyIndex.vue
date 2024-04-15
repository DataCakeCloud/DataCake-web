<!-- 懒加载时，item分为文件类型和文件夹类型，文件的item数据中需要leaf:true标识文件类型为叶子节点，无法展开和创建子节点 -->
<template>
  <div class="wrapper">
    <div v-if="!selectModeObj.isSelectMode">
      <el-input v-if="isFilter" v-model="filterText" class="wrapper-input" prefix-icon="el-icon-search" :placeholder="$t('dataAnalysis.place_enter_keys')" size="medium" @change="changeFilter"> </el-input>
      <div class="folder_content">
        <el-tree
          v-if="showTree"
          ref="treeDom"
          :key="treeKey"
          class="folderData"
          :data="comTreeData"
          :load="lazyLoad"
          :lazy="lazyOptions.isLazy"
          node-key="id"
          :props="defaultProps"
          :default-expand-all="!lazyOptions.isLazy"
          v-bind="options"
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          :filter-node-method="filterNode"
          @node-drop="handleDrop"
          @node-click="nodeClick"
          @node-expand="handleExpand"
          @node-collapse="handleCollapse"
        >
          <template slot-scope="{ node, data }">
            <slot :node="node" :data="data">
              <div
                v-if="isContextmenu"
                class="custom-tree-node"
                :class="[data.id && data.id === selectNode.id && isLocked ? 'selected-node' : '', data[defaultProps.children] ? 'custom-tree-node-children' : '', enterData.id === data.id || !data[defaultProps.isLeaf] ? 'enter-node' : '']"
                @contextmenu.prevent="onContextmenu($event, node, data)"
                @dblclick="dbClickNOde(data)"
                @mouseenter="enterNode(data)"
                @mouseleave="leaveNode(data)"
              >
                <div class="node_left">
                  <span v-if="data[defaultProps.children] || lazyOptions.isLazy" class="node_icon">
                    <svg-icon v-if="data[defaultProps.children] && data[defaultProps.children].length && node.expanded && !lazyOptions.isLazyIcon" icon-class="folder_open" />
                    <svg-icon v-else-if="data[defaultProps.isLeaf] && lazyOptions.isLazyIcon" icon-class="treeTask" />
                    <svg-icon v-else icon-class="folder" />
                  </span>
                  <svg-icon v-if="data[nodeOptions.key] && data[nodeOptions.key] === nodeOptions.value" :icon-class="nodeOptions.icon" />
                  <span v-if="data.inputType" class="rename-box">
                    <el-input v-model="data[defaultProps.label]" v-autoFous="'input'" :placeholder="$t('dataAnalysis.place_name')" size="mini" @input="data[defaultProps.label] = handelInput(data[defaultProps.label])" @keyup.native="dataNameInput($event, data)" @blur="nodeBlur(data)"></el-input>
                    <!-- :class="[{ 'error-border': nameError }]"
                  <span v-if="nameError">填写错误</span> -->
                  </span>

                  <el-tooltip v-else effect="dark" :disabled="isTipDisabled" :content="data[defaultProps.label]" placement="top">
                    <span class="node_text ellipsis" @mouseenter="isShowTooltip">{{ data[defaultProps.label] }}</span>
                  </el-tooltip>
                  <!-- 计数 -->
                  <div v-if="!data[defaultProps.isLeaf] && !data.inputType" :class="['file-nums', data.id && data.id === selectNode.id && isLocked ? 'selected-node' : '']">
                    <span class="node-count">{{ filterText ? data.fileNums : getFileObj(data).fileNums }}</span>
                  </div>
                </div>
                <div v-if="isMenuIcon" class="node_right">
                  <svg-icon v-if="enterData.id === data.id" icon-class="extendedMenu" @click.prevent.stop="onContextmenu($event, node, data)" />
                </div>
              </div>
              <div
                v-else
                class="custom-tree-node"
                :class="[data.id && data.id === selectNode.id && isLocked ? 'selected-node' : '', data[defaultProps.children] ? 'custom-tree-node-children' : '', enterData.id === data.id ? 'enter-node' : '']"
                @mouseenter="enterNode(data)"
                @mouseleave="leaveNode(data)"
              >
                <div class="node_left">
                  <span v-if="data[defaultProps.children] || lazyOptions.isLazy" class="node_icon">
                    <svg-icon v-if="data[defaultProps.children] && data[defaultProps.children].length && node.expanded && !lazyOptions.isLazyIcon" icon-class="folder_open" />
                    <svg-icon v-else-if="data[defaultProps.isLeaf] && lazyOptions.isLazyIcon" icon-class="treeTask" />
                    <svg-icon v-else icon-class="folder" />
                  </span>
                  <el-tooltip effect="dark" :disabled="isTipDisabled" :content="data[defaultProps.label]" placement="top">
                    <span class="node_text ellipsis" :class="{ 'disable-color': data[defaultProps.isLeaf] }" @mouseenter="isShowTooltip">{{ data[defaultProps.label] }}</span>
                  </el-tooltip>
                </div>
                <div v-if="isMenuIcon" class="node_right">
                  <svg-icon icon-class="extendedMenu" @click.prevent.stop="onContextmenu($event, node, data)" />
                </div>
              </div>
            </slot>
          </template>
        </el-tree>
      </div>
    </div>
    <div v-else>
      <el-select ref="moveSelectTree" v-model="moveForm.moveFileName" :placeholder="$t('dataAnalysis.place_folder')" style="width: 100%">
        <el-option hidden value=""></el-option>
        <LazyCustomTree ref="selectTree" :is-filter="true" :tree-data="moveTreeData" :is-deep-com="true" :default-props="defaultProps" :lazy-load="lazyLoad" :lazy-options="lazyOptions" @changeFilter="changeFilter" @node-click="handelClickMove"></LazyCustomTree>
      </el-select>
    </div>
    <!-- 文件移动 -->
    <el-dialog width="30%" :title="$t('dataAnalysis.fileMove')" :visible.sync="moveFileDialType" :append-to-body="true" @close="moveClose">
      <el-form ref="moveFileForm" label-width="80px" :model="moveForm">
        <el-form-item :label="$t('dataAnalysis.moveTo')" prop="moveFileName" :rules="[{ required: true, message: $t('dataAnalysis.place_folder'), trigger: 'change' }]">
          <el-select ref="moveSelectTree" v-model="moveForm.moveFileName" :placeholder="$t('dataAnalysis.place_folder')" style="width: 100%">
            <el-option hidden value=""></el-option>
            <LazyCustomTree ref="selectTree" tree-key="secondCell" :is-deep-com="true" :is-filter="true" :tree-data="moveTreeData" :default-props="defaultProps" :lazy-load="lazyLoad" :lazy-options="deepLazyOptions" @changeFilter="changeFilter" @node-click="handelClickMove"></LazyCustomTree>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveFileDialType = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="moveFilebtn">{{ $t('common.sure') }}</el-button>
      </div>
    </el-dialog>
    <!-- 添加文件夹 -->
    <el-dialog width="30%" :title="addType === 'file' ? '新建文件' : $t('dataAnalysis.addFolder')" :visible.sync="addFolderDialType" :append-to-body="true" @close="addClose">
      <el-form ref="addFileForm" label-width="100px" :model="addForm" @submit.native.prevent>
        <el-form-item :label="addType === 'file' ? '文件名称' : $t('dataAnalysis.folderName')" prop="addFileName" :rules="[{ required: true, message: $t('dataAnalysis.place_folderName'), trigger: 'blur' }]">
          <el-input v-model.trim="addForm.addFileName" @input="addForm.addFileName = handelInput(addForm.addFileName)" @keydown.enter.native="addFilebtn"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFolderDialType = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="addFilebtn">{{ $t('common.sure') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStrByte } from '@/utils';
export default {
  name: 'LazyCustomTree',
  props: {
    treeKey: {
      type: String,
      default: 'firstCell'
    },
    isLocked: {
      // 是否点击时保留高亮
      type: Boolean,
      default: false
    },
    isDeepCom: {
      // 当前是否处于自调用的深层次组件中
      type: Boolean,
      default: false
    },
    isCreateFile: {
      // 是否右键出现创建文件
      type: Boolean,
      default: false
    },
    selectModeObj: {
      type: Object,
      default: () => {
        return {
          isSelectMode: false,
          selectName: ''
        };
      }
    },
    movePopup: {
      // 是否在弹窗中展示
      type: Boolean,
      default: false
    },
    lazyLoad: {
      // 懒加载函数
      type: Function,
      default: (node, resolve) => {
        resolve([]);
      }
    },
    treeData: {
      // 数据源
      type: Array,
      default: () => []
    },
    deepTreeData: {
      // 数据源
      type: Array,
      default: () => []
    },
    defaultProps: {
      // 节点配置
      type: Object,
      default: () => ({
        children: 'children',
        label: 'label'
      })
    },
    nodeOptions: {
      type: Object,
      default: () => {
        return {};
      }
    },
    noDrag: {
      // 不能拖拽的条件
      type: Array,
      default: () => []
    },
    isMenuIcon: {
      // 是否显示菜单图标
      type: Boolean,
      default: true
    },
    isContextmenu: {
      // 是否可右击,也可用于区别是否为移动弹窗中的树组件
      type: Boolean,
      default: false
    },
    isFilter: {
      // 是否显示筛选框
      type: Boolean,
      default: false
    },
    isFold: {
      // 是否显示筛选框
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => {
        return {
          'expand-on-click-node': false,
          draggable: false
        };
      }
    },
    lazyOptions: {
      type: Object,
      default: () => ({
        isLazy: false,
        isLazyFilter: false,
        isLazyIcon: false
      })
    },
    // 支持其他菜单项
    contextMenuOption: {
      type: Object,
      default: () => {
        return {
          menuList: [],
          setMenu: () => {}
        };
      }
    },
    fileStorage: {
      // 不能拖拽的条件
      type: Array,
      default: () => []
    },
    depth: {
      type: Number,
      default: 4
    },
    setNoDrag: {
      type: Function,
      default: () => true
    }
  },
  data() {
    return {
      isTipDisabled: false,
      showTree: true,
      filterText: '',
      oldNodeName: '',
      moveFileDialType: false,
      selectTreeData: [],
      normalTreedata: [],
      moveForm: {
        id: '',
        moveFileName: ''
      },
      nameError: false,
      addForm: {
        addFileName: ''
      },
      comTreeData: [],
      moveTreeData: [],
      addFolderDialType: false,
      moveFileObj: {},
      moveToFileObject: {},
      oldAddFileObj: {},
      nodeId: null,
      selectNode: {},
      enterData: {},
      leaveData: {},
      addType: 'folder',
      deepLazyOptions: {
        isLazy: true,
        isLazyFilter: true,
        isLazyIcon: true,
        module: this.module
      }
    };
  },
  watch: {
    filterText(val) {
      if (!this.lazyOptions.isLazyFilter) {
        this.$refs.treeDom.filter(val);
      }
    },
    moveFileDialType(val) {
      // 是否打开了移动弹窗，此时树组件为弹窗内的组件
      this.$emit('isMoveFile', val);
    },
    'selectModeObj.selectName'(val) {
      this.moveForm.moveFileName = val;
    },
    treeData: {
      handler(val) {
        this.getComTree();
      },
      deep: true
    },
    deepTreeData: {
      handler(val) {
        this.getMoveTree(val);
      },
      deep: true
    }
  },
  mounted() {
    if (this.isDeepCom) {
      this.getMoveTree(this.treeData);
    } else {
      this.getComTree();
    }
  },
  methods: {
    // 刷新组件
    refresh() {
      this.showTree = false;
      this.$nextTick(() => {
        this.showTree = true;
      });
    },
    getComTree() {
      const data = JSON.parse(JSON.stringify(this.treeData));
      function handelData(data, children) {
        data.forEach(item => {
          if (item[children]) handelData(item[children], children);
          item.inputType = false;
        });
        return data;
      }
      this.comTreeData = handelData(data, this.defaultProps.children);
    },
    getMoveTree(val) {
      this.moveTreeData = JSON.parse(JSON.stringify(val));
    },
    getFileObj(treeItem) {
      const fileStorageIndex = this.fileStorage.findIndex(item => item.id === treeItem.id);
      return this.fileStorage[fileStorageIndex];
    },
    changeFilter(val, isDeepCom) {
      if (this.isDeepCom) {
        isDeepCom = true;
      }
      this.$emit('changeFilter', val, isDeepCom);
    },
    // 改变树的懒加载状态
    toggleLazyStatus(status) {
      this.lazyOptions.isLazy = status;
      this.refresh();
      // if (!this.moveFileDialType) {
      //   this.lazyOptions.isLazy = status;
      //   this.refresh();
      // }
      // if (this.$refs.selectTree) {
      //   this.$refs.selectTree.lazyOptions.isLazy = status;
      //   this.$refs.selectTree.showTree = false;
      //   this.$nextTick(() => {
      //     this.$refs.selectTree.showTree = true;
      //   });
      // }
    },
    // 展开节点
    expandNode(parentId) {
      const node = this.getTreeNode(parentId); // 通过节点id找到对应树节点对象
      if (node) {
        node.loaded = false;
        node.expand();
      }
    },
    // 从前端删除树item
    delTreeItem(id) {
      this.$refs.treeDom.remove(id);
    },
    // 获取树节点node
    getTreeNode(id) {
      if (this.$refs.treeDom) {
        const node = this.$refs.treeDom.getNode(id);
        return node;
      } else {
        return false;
      }
    },
    handleExpand(data, node, comp) {
      // this.expandNode(data.id);
    },
    handleCollapse(data, node, comp) {
      // node.loaded = false;
    },
    leaveNode(data) {
      this.leaveData = data;
      this.enterData = {};
      this.$emit('leaveNode', data);
    },
    enterNode(data) {
      this.enterData = data;
      this.leaveData = {};
      this.$emit('enterNode', data);
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
    handelInput(str) {
      return getStrByte(str, 30);
    },
    nodeClick(data, node, curr) {
      // if (data[this.defaultProps.children]) {
      //   this.nodeId = null;
      // } else {
      //   this.nodeId = node.id;
      // }
      if (this.selectNode.id !== data.id) {
        this.selectNode = data;
      } else {
        this.selectNode = {};
      }
      if (this.isLocked) {
        this.$emit('node-click', this.selectNode, node, curr);
      } else {
        this.$emit('node-click', data, node, curr);
      }
    },
    dbClickNOde(data) {
      if (data[this.defaultProps.isLeaf]) return;
      if (data.parentId === 0) return;
      data.inputType = true;
      this.oldNodeName = data[this.defaultProps.label];
    },
    addClose() {
      // this.addForm.addFileName = ''
      this.$refs.addFileForm.resetFields();
    },
    moveClose() {
      // this.moveForm.moveFileName = ''
      this.$refs.moveFileForm.resetFields();
    },
    async handelClickMove(data) {
      if (data[this.defaultProps.isLeaf]) {
        return;
      }
      this.moveForm.id = data.id;
      this.$emit('selectFolder', this.moveForm);
      this.moveToFileObject = data;
      this.$refs.moveSelectTree.blur();
    },
    // 添加文件
    addFilebtn() {
      this.$refs.addFileForm.validate(valid => {
        if (valid) {
          this.addFolderDialType = false;
          this.$emit('addFile', JSON.parse(JSON.stringify(this.addForm)), this.oldAddFileObj, this.addType);
        }
      });
    },
    // 移动文件
    moveFilebtn() {
      this.$refs.moveFileForm.validate(valid => {
        if (valid) {
          this.moveFileDialType = false;
          this.$emit('moveFile', this.moveFileObj, this.moveToFileObject);
        }
      });
    },
    delFile(data) {
      if (this.lazyOptions.module === 'TASK') {
        this.$emit('delFile', data);
      } else {
        this.$confirm(this.$t('dataAnalysis.isDel'), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        })
          .then(() => {
            this.$emit('delFile', data);
          })
          .catch(() => {});
      }
    },
    moveFile(data) {
      this.moveFileObj = data;
      this.moveFileDialType = true;
    },
    dataNameInput(el, data) {
      if (el.keyCode === 13) {
        data.inputType = false;
      }
    },
    addFolder(data) {
      this.addFolderDialType = true;
      this.oldAddFileObj = data;
    },
    nodeBlur(data) {
      if (data[this.defaultProps.isLeaf]) {
        // const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
        // if (!reg.test(data[this.defaultProps.label]) || data[this.defaultProps.label].length > 120) {
        //   callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符'));
        // this.nameError = true;
        // return false
        // }
      }
      if (!data[this.defaultProps.label]) {
        this.$message({
          type: 'warning',
          message: this.$t('dataAnalysis.place_name')
        });
        return;
      }
      data.inputType = false;
      if (data[this.defaultProps.label] !== this.oldNodeName) {
        this.$emit('resetFolderName', data);
      } // 更改名称了
    },
    resetName(data) {
      this.oldNodeName = data[this.defaultProps.label];
      data.inputType = true;
    },
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
      return data[this.defaultProps.label].indexOf(value) !== -1;
    },
    // 右键实例
    onContextmenu(event, node, data) {
      // if (this.lazyOptions.isLazyFilter && data[this.defaultProps.isLeaf]) {
      //   return;
      // }

      let items = [
        {
          label: this.$t('dataAnalysis.resetName'),
          disabled: data.parentId === 0,
          hidden: this.lazyOptions.isLazy && data[this.defaultProps.isLeaf],
          onClick: () => {
            this.resetName(data);
          }
        },
        {
          label: this.$t('dataAnalysis.moveFile'),
          disabled: data.parentId === 0,
          onClick: () => {
            this.moveFile(data);
          }
        },
        {
          label: this.$t('dataAnalysis.delFile'),
          disabled: data.parentId === 0 || (data[this.defaultProps.children] && data[this.defaultProps.children].length > 0),
          onClick: () => {
            this.delFile(data);
          }
        },
        {
          label: this.$t('dataAnalysis.createFolder'),
          // disabled: !(data[this.defaultProps.children] && node.level < this.depth),
          disabled: this.lazyOptions.isLazy && data[this.defaultProps.isLeaf],
          hidden: this.lazyOptions.isLazy && data[this.defaultProps.isLeaf],
          onClick: () => {
            this.addType = 'folder';
            this.addFolder(data);
          }
        }
      ];
      if (this.contextMenuOption.menuList.length > 0) {
        this.contextMenuOption.menuList.forEach(item => {
          const menuItem = {};
          menuItem.label = item.label;
          menuItem.disabled = item.disabledFn(event, node, data);
          menuItem.hidden = item.hiddenFn ? item.hiddenFn(event, node, data) : false;
          menuItem.onClick = () => {
            item.onClick(event, node, data);
          };
          items.push(menuItem);
        });
        items = this.contextMenuOption.setMenu(items, event, node, data);
      }
      this.$contextmenu({
        items,
        event,
        zIndex: 4200,
        minWidth: 50
      });
      event.preventDefault();

      //  避免点击菜单  事件冒泡
      this.$nextTick(() => {
        document.documentElement.querySelector('.contextmenu_menu.menu').onmouseup = function(e) {
          e.stopPropagation();
        };
      });
    },
    // 拖拽完成
    handleDrop(draggingNode, dropNode, dropType) {
      if (dropType === 'inner') {
        this.$emit('moveFile', draggingNode.data, dropNode.data, dropNode);
      } else {
        let moveTo = {};
        if (dropNode.parent.level !== 0) moveTo = dropNode.parent.data;
        this.$emit('moveFile', draggingNode.data, moveTo, dropNode.parent);
      }
    },
    // 判断能否放至
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.data[this.defaultProps.isLeaf]) return type !== 'inner';
      return true;
    },
    // 是否能够拖拽
    allowDrag(draggingNode) {
      return !this.noDrag.includes(draggingNode.data[this.defaultProps.label]);
    }
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  &-input {
    ::v-deep {
      .el-input__inner {
        border: none;
        background-color: #f8f8fa;
        &::placeholder {
          color: #a8aeba;
        }
      }
    }
  }
  .folder_content {
    margin-top: 5px;
    width: 100%;
    height: calc(100% - 45px);
    overflow: auto;
    .el-tree.folderData {
      display: block;
      padding-left: 5px;
      // width: 100%;
      ::v-deep {
        .el-tree-node__content {
          display: flex;

          .el-tree-node__expand-icon {
            width: 25px;
            height: 25px;
            padding: 0;
            position: relative;
          }
          .el-tree-node__expand-icon::before {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: fit-content;
            height: fit-content;
            margin: auto;
            font-size: 16px;
          }
          .custom-tree-node {
            flex: 1;
            width: calc(100% - 36px);

            .node_icon {
              vertical-align: middle;
              margin-left: 2px;
            }
            &.enter-node {
              .node_right {
                display: block;
              }
            }

            &.custom-tree-node-children {
              display: flex;
              justify-content: space-between;
              .el-input {
                width: calc(100% - 20px);
              }
            }
          }
          .node_left {
            width: calc(100% - 10px);
            position: relative;
            .node_text {
              margin-left: 1px;
              display: inline-block;
              vertical-align: middle;
              width: calc(100% - 40px);
              padding-right: 7px;
            }
            .file-nums {
              color: #e6a23c;
              position: absolute;
              right: 0;
              top: 2px;
              .node-count {
                padding: 1px 5px;
                background-color: #f3f3f3;
                border-radius: 3px;
                color: #797979;
              }
              &.select-node {
                color: $c-primary;
                .node-count {
                  color: $c-primary;
                }
              }
            }
          }
          .node_right {
            display: none;
            line-height: 1em;
            width: 20px;
          }
        }
        .el-tree-node {
          .custom-tree-node {
            display: flex;
            align-items: center;
            color: #6a6767;

            span {
              margin-left: -2px;
            }

            &.currentClass {
              color: $c-primary;
            }
          }
        }

        & > .el-tree-node {
          .el-tree-node__children {
            .el-tree-node__content {
              padding-left: 8px !important;
            }
            .el-tree-node__children {
              padding-left: 8px;
            }
          }
        }
      }
    }
  }
}
.wrapper-input {
  ::v-deep .el-input__inner {
    border: none;
    background-color: #f8f8fa;
  }
}
.disable-color {
  opacity: 0.6;
}
.selected-node {
  color: $c-primary !important;
  font-weight: bold;
  span {
    color: $c-primary !important;
  }
  .node_left {
    width: calc(100% - 20px) !important;
  }
  // background-color: #ebf3ff;
}
.wrapper .custom-tree-node.selected-node {
  position: absolute;
  padding-left: 26px;
  background-color: #ebf3ff;
  width: 100% !important;
  height: 100% !important;
  .selected-node.file-nums {
    right: 8px !important;
  }
}
.rename-box {
  position: relative;
  span {
    position: absolute;
    left: 0;
    bottom: -14px;
    color: rgb(255, 73, 73) !important;
    font-size: 10px;
  }
}
.error-border {
  ::v-deep input {
    border-color: rgb(255, 73, 73);
    height: 20px;
    line-height: 20px;
  }
}
</style>
<style lang="scss">
.wrapper .el-tree-node__content {
  position: relative;
}
.wrapper .el-icon-caret-right {
  z-index: 100;
}
</style>
