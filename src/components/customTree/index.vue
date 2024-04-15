<template>
  <div class="wrapper">
    <el-input v-if="isFilter" v-model="filterText" placeholder="输入关键字" size="mini"> </el-input>
    <div class="folder_content">
      <el-tree
        ref="fileTree"
        class="folderData"
        :data="comTreeData"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        v-bind="options"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
:filter-node-method="filterNode"
        @node-drop="handleDrop"
        @node-click="nodeClick"
      >
        <template slot-scope="{ node, data }">
          <slot :node="node" :data="data">
            <div
              v-if="isContextmenu"
              class="custom-tree-node"
              :class="[data.id === selectNode.id && isLocked ? 'selected-node' : '', data[defaultProps.children] ? 'custom-tree-node-children' : '', nodeId === node.id ? 'currentClass' : '']"
              @contextmenu.prevent="onContextmenu($event, node, data)"
              @dblclick="dbClickNOde(data)"
            >
              <div class="node_left">
                <span v-if="data[defaultProps.children]" class="node_icon">
                  <svg-icon v-if="node.expanded && data[defaultProps.children].length > 0" icon-class="folder_open" />
                  <svg-icon v-else icon-class="folder" />
                </span>
                <svg-icon v-if="data[nodeOptions.key] && data[nodeOptions.key] === nodeOptions.value" :icon-class="nodeOptions.icon" />
                <el-input v-if="data.inputType" v-model="data[defaultProps.label]" v-autoFous="'input'" placeholder="请输入名称" size="mini" @input="data[defaultProps.label] = handelInput(data[defaultProps.label])" @keyup.native="dataNameInput($event, data)" @blur="nodeBlur(data)"></el-input>
                <el-tooltip v-else effect="dark" :disabled="isTipDisabled" :content="data[defaultProps.label]" placement="right">
                  <span class="node_text ellipsis" @mouseenter="isShowTooltip">{{ data[defaultProps.label] }}</span>
                </el-tooltip>
              </div>
              <div class="node_right">
                <svg-icon v-if="isMenuIcon" icon-class="extendedMenu" class="svg_extendedMenu" @click.prevent.stop="onContextmenu($event, node, data)" />
              </div>
            </div>
            <div v-else class="custom-tree-node" :class="[data.id === selectNode.id && isLocked ? 'selected-node' : '', data[defaultProps.children] ? 'custom-tree-node-children' : '']">
              <div class="node_left">
                <span v-if="data[defaultProps.children]" class="node_icon">
                  <svg-icon v-if="node.expanded && data[defaultProps.children].length > 0" icon-class="folder_open" />
                  <svg-icon v-else icon-class="folder" />
                </span>
                <el-tooltip effect="dark" :disabled="isTipDisabled" :content="data[defaultProps.label]" placement="right">
                  <span class="node_text ellipsis" @mouseenter="isShowTooltip">{{ data[defaultProps.label] }}</span>
                </el-tooltip>
              </div>
              <div class="node_right">
                <svg-icon v-if="isMenuIcon" icon-class="extendedMenu" class="svg_extendedMenu" @click.stop="onContextmenu($event, node, data)" />
              </div>
            </div>
          </slot>
        </template>
      </el-tree>
    </div>
    <!-- 文件移动 -->
    <el-dialog width="30%" title="文件移动" :visible.sync="moveFileDialType" :append-to-body="true" @close="moveClose">
      <el-form ref="moveFileForm" label-width="80px" :model="moveForm">
        <el-form-item label="移动到 :" prop="moveFileName" :rules="[{ required: true, message: '请选择文件夹', trigger: 'change' }]">
          <el-select ref="moveSelectTree" v-model="moveForm.moveFileName" placeholder="请选择文件夹" style="width: 100%">
            <el-option hidden value=""></el-option>
            <CustomTree :tree-data="moveTree" :default-props="defaultProps" :is-menu-icon="false" @node-click="handelClickMove"></CustomTree>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveFileDialType = false">取 消</el-button>
        <el-button type="primary" @click="moveFilebtn">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 添加文件夹 -->
    <el-dialog width="30%" title="添加文件夹" :visible.sync="addFolderDialType" :append-to-body="true" @close="addClose">
      <el-form ref="addFileForm" label-width="100px" :model="addForm" @submit.native.prevent>
        <el-form-item label="文件夹名称 :" prop="addFileName" :rules="[{ required: true, message: '请输入文件夹名称', trigger: 'blur' }]">
          <el-input v-model.trim="addForm.addFileName" @input="addForm.addFileName = handelInput(addForm.addFileName)" @keydown.enter.native="addFilebtn"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFolderDialType = false">取 消</el-button>
        <el-button type="primary" @click="addFilebtn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStrByte } from '@/utils';

export default {
  name: 'CustomTree',
  props: {
    isLocked: {
      // 是否点击时保留高亮
      type: Boolean,
      default: false
    },
    treeData: {
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
      // 是否可右击
      type: Boolean,
      default: false
    },
    isFilter: {
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
      filterText: '',
      oldNodeName: '',
      moveFileDialType: false,
      moveForm: {
        moveFileName: ''
      },
      addForm: {
        addFileName: ''
      },
      addFolderDialType: false,
      moveFileObj: {},
      moveToFileObject: {},
      oldAddFileObj: {},
      nodeId: null,
      selectNode: {}
    };
  },
  computed: {
    comTreeData() {
      const data = JSON.parse(JSON.stringify(this.treeData));
      function handelData(data, children) {
        data.forEach(item => {
          if (item[children]) handelData(item[children], children);
          item.inputType = false;
        });
        return data;
      }
      return handelData(data, this.defaultProps.children);
    },
    moveTree() {
      const data = JSON.parse(JSON.stringify(this.treeData));
      const defaultProps = JSON.parse(JSON.stringify(this.defaultProps));
      return this.$utils.dataChildrenTree(data, defaultProps.children);
    }
  },
  watch: {
    filterText(val) {
      this.$refs.fileTree.filter(val);
    }
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
    handelInput(str) {
      return getStrByte(str, 30);
    },
    nodeClick(data, node, curr) {
      if (data[this.defaultProps.children]) {
        this.nodeId = null;
      } else {
        this.nodeId = node.id;
      }
      this.selectNode = data;
      // if (this.selectNode.id !== data.id) {
      //   this.selectNode = data;
      // } else {
      //   this.selectNode = {};
      // }
      if (this.isLocked) {
        this.$emit('node-click', this.selectNode, node, curr);
      } else {
        this.$emit('node-click', data, node, curr);
      }
    },
    dbClickNOde(data) {
      if (this.treeData[0][this.defaultProps.label] === data[this.defaultProps.label]) return;
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
    handelClickMove(data) {
      this.moveForm.moveFileName = data[this.defaultProps.label];
      this.moveToFileObject = data;
      this.$refs.moveSelectTree.blur();
    },
    // 添加文件
    addFilebtn() {
      this.$refs.addFileForm.validate(valid => {
        if (valid) {
          this.addFolderDialType = false;
          this.$emit('addFile', JSON.parse(JSON.stringify(this.addForm)), this.oldAddFileObj);
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
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('delFile', data);
        })
        .catch(() => {});
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
      if (!data[this.defaultProps.label]) {
        this.$message({
          type: 'warning',
          message: '请输入文件名'
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
      let items = [
        {
          label: '新建文件夹',
          disabled: !(data[this.defaultProps.children] && node.level < this.depth),
          onClick: () => {
            this.addFolder(data);
          }
        },

        {
          label: '重命名',
          disabled: this.treeData[0]?.id === data.id,
          onClick: () => {
            this.resetName(data);
          }
        },
        {
          label: '移 动',
          disabled: this.treeData[0]?.id === data.id,
          onClick: () => {
            this.moveFile(data);
          }
        },
        {
          label: '删 除',
          disabled: this.treeData[0]?.id === data.id || (data[this.defaultProps.children] && data[this.defaultProps.children].length > 0),
          onClick: () => {
            this.delFile(data);
          }
        }
      ];
      if (this.contextMenuOption.menuList.length > 0) {
        this.contextMenuOption.menuList.forEach(item => {
          const menuItem = {};
          menuItem.label = item.label;
          menuItem.disabled = item.disabledFn(event, node, data);
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
        this.$emit('moveFile', draggingNode.data, dropNode.data);
      } else {
        let moveTo = {};
        if (dropNode.parent.level !== 0) moveTo = dropNode.parent.data;
        this.$emit('moveFile', draggingNode.data, moveTo);
      }
    },
    // 判断能否放至
    allowDrop(draggingNode, dropNode, type) {
      const dragTreeH = this.$utils.getMaxFloor([draggingNode], 'childNodes');
      const dropTreeH = dropNode.level;
      // 自定义限制不能释放条件
      if (!this.setNoDrag(draggingNode, dropNode, type)) return false;

      // console.log(draggingNode, dropNode, type,dragTreeH , dropTreeH,'44');
      if (dragTreeH + dropTreeH > this.depth) return false;
      if (dropNode.level === 1 || draggingNode.parent.data.id === dropNode.parent.data.id) return type === 'inner';
      if (!dropNode.data[this.defaultProps.children]) return type !== 'inner';
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

  .folder_content {
    margin-top: 5px;
    width: 100%;
    height: calc(100% - 45px);
    overflow: auto;

    .el-tree.folderData {
      display: block;
      // width: 100%;
      ::v-deep .el-tree-node__content {
        display: flex;

        .el-tree-node__expand-icon {
          width: $global-font-size-24;
        }

        .custom-tree-node {
          flex: 1;
          width: calc(100% - 36px);

          .node_icon {
            vertical-align: middle;
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
          width: calc(100% - 20px);
          .node_text {
            display: inline-block;
            vertical-align: middle;
            width: calc(100% - 40px);
          }
        }
        .node_right {
          width: 20px;
          .svg_extendedMenu {
          }
        }
      }

      ::v-deep .el-tree-node {
        .custom-tree-node {
          display: flex;
          align-items: center;
          color: #6a6767;

          span {
            margin-left: 5px;
          }

          &.currentClass {
            color: $c-primary;
          }
        }
      }
    }
  }
}

.selected-node {
  color: #409eff !important;
  font-weight: bold;
  background-color: #ebf3ff;
}
</style>
