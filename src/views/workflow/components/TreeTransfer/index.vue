<template>
  <!-- 自定义树形穿梭框组件、理论上左右均可选择是否为树形结构，目前固定为左侧树形、右侧无层级结构 -->
  <div class="tree-transfer">
    <!-- 穿梭框左侧 -->
    <div class="tree-transfer-left">
      <div class="title"><el-checkbox v-model="allCheckLeft">历史任务列表</el-checkbox></div>
      <div class="transfer-content">
        <el-input v-model="filterText" placeholder="请输入任务ID/名称/标签"></el-input>
        <!-- 左侧采用element-ui的el-tree -->
        <el-tree ref="treeLeft" class="treeLeft" :data="dataLeft" show-checkbox :indent="8" :node-key="defaultProps.id" :props="defaultProps" default-expand-all :filter-node-method="filterNode">
          <div slot-scope="{ node, data }" class="tree_item ellipsis">
            <div v-if="data.id" class="item_wrap">
              <div class="item_title">
                <span>{{ data.id }}</span>
                |
                <span>{{ data.granularity ? `${data.granularity}` : '-' }}</span>
              </div>
              <el-tooltip class="item" effect="dark" :content="node.label" placement="bottom-start">
                <span class="ellipsis name">{{ node.label }}</span>
              </el-tooltip>
            </div>
            <el-tooltip v-else class="item" effect="dark" :content="node.label" placement="bottom-start">
              <span class="ellipsis">{{ node.label }}</span>
            </el-tooltip>
          </div>
        </el-tree>
      </div>
    </div>
    <!-- 穿梭框中间按钮区域 -->
    <div class="tree-transfer-middle">
      <el-button icon="el-icon-arrow-left" size="mini" @click="remove"></el-button>
      <el-button icon="el-icon-arrow-right" size="mini" @click="add"></el-button>
    </div>
    <!-- 穿梭框右侧 -->
    <div class="tree-transfer-right">
      <div class="title"><el-checkbox v-model="allCheckRight">已选择列表</el-checkbox></div>
      <!-- 右侧直接放置结果 -->
      <div class="transfer-content">
        <el-input v-model="filterRightText" placeholder="请输入任务ID/名称"></el-input>
        <el-checkbox-group v-model="rightChecked" class="transfer_group">
          <el-checkbox v-for="item in dataRight" :key="item[defaultProps.id]" :label="item">
            <div class="item_wrap">
              <div class="item_title">
                <span>{{ item.id }}</span>
                |
                <span>{{ item.granularity ? `${item.granularity}` : '-' }}</span>
              </div>
              <el-tooltip class="item" effect="dark" :content="item[defaultProps.label]" placement="bottom-start">
                <span class="ellipsis name">{{ item[defaultProps.label] }}</span>
              </el-tooltip>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeTranster',
  // data为原始树的数据，defaultProps默认设置字段，checkedList为初始选中的list集合
  props: ['datas', 'defaultProps', 'checkedList'],
  data() {
    return {
      filterText: '', // 搜索名
      filterRightText: '',
      yuansiData: [],
      dataLeft: [],
      rawDataRight: [], // 右侧的原始数据，方便搜索使用
      dataRight: [],
      rightChecked: []
    };
  },
  computed: {
    allCheckRight: {
      get() {
        return this.dataRight.length && this.rightChecked.length === this.dataRight.length;
      },
      set(value) {
        if (value) {
          this.rightChecked = this.dataRight;
        } else {
          this.rightChecked = [];
        }
      }
    },
    allCheckLeft: {
      get() {
        const list = this.$refs.treeLeft && this.$refs.treeLeft.getCheckedNodes();
        const parentCheck = [];
        if (list && list.length) {
          list.forEach(item => {
            if (item.children && item.children.length) {
              parentCheck.push(item);
            }
          });
        }
        return this.dataLeft.length && this.dataLeft.length === parentCheck.length;
      },
      set(value) {
        this.dataLeft.forEach(item => {
          this.$refs.treeLeft.setChecked(item[this.defaultProps.id], value);
          item.children.forEach(child => {
            if (!child.disabled) {
              this.$refs.treeLeft.setChecked(child[this.defaultProps.id], value);
            }
          });
        });
      }
    }
  },
  watch: {
    // 搜索
    filterText(val) {
      this.$refs.treeLeft.filter(val);
    },
    filterRightText(value) {
      this.dataRight = this.rawDataRight.filter(item => {
        const name = `${item.name}(${item.granularity})`;
        return name.indexOf(value) > -1;
      });
    },
    // 初始选中集合改变时，左侧的数据对应选中，右侧的列表加上
    checkedList() {
      this.$nextTick(() => {
        this.checkedList.map((item, index) => {
          this.$refs.treeLeft.setChecked(item[this.defaultProps.id], true);
        });
        this.dataRight = this.checkedList;
      });
    },
    datas() {
      this.dataLeft = JSON.parse(JSON.stringify(this.datas));
    }
  },
  mounted() {
    // this.dataLeft = this.filterTreeData(this.datas);
    this.yuansiData = JSON.parse(JSON.stringify(this.datas));
  },
  methods: {
    // 树筛选
    filterNode(value, data, node) {
      if (!value) return true;
      // return data[this.defaultProps.label].indexOf(value) !== -1;
      const one = data[this.defaultProps.label].indexOf(value) !== -1 || (data['id'] && data['id'].toString().indexOf(value) !== -1);
      const two = node.parent && node.parent.data && node.parent.data[this.defaultProps.label] && node.parent.data[this.defaultProps.label].indexOf(value) !== -1;
      let result_one = false;
      let result_two = false;
      if (node.level === 1) {
        result_one = one;
      } else if (node.level === 2) {
        result_two = one || two;
      }
      return result_one || result_two;
    },
    /** 处理只能选择最后一级 */
    filterTreeData(treeData) {
      return treeData.filter(item => {
        if (item[this.defaultProps.children] && item[this.defaultProps.children].length > 0) {
          item.disabled = true;
          item.children = this.filterTreeData(item[this.defaultProps.children]);
        } else {
          item[this.defaultProps.label] = `${item[this.defaultProps.label]}(${item[this.defaultProps.pCode]})`;
        }
        return item;
      });
    },
    // 添加到右侧
    add() {
      const preDataRightIds = this.dataRight.map(item => item.id);
      // 获取所有选中的项,将最后一级选中的节点添加到右侧已选
      this.dataRight = [];
      let list = this.$refs.treeLeft.getCheckedNodes();
      list = list.filter(item => !item.children || item.children.length === 0); // 过滤父元素
      const granularity = list[0].granularity;
      let isCanAdd = true;
      list.forEach(item => {
        if (item.granularity !== granularity) {
          this.$message.warning('必须选择粒度一致的任务');
          isCanAdd = false;
          return;
        }
      });
      if (isCanAdd) {
        this.dataRight = list;
        const dataRightIds = this.dataRight.map(item => item.id);
        // 将与右侧数据粒度不一致和已经在右侧的数据禁用
        this.dataLeft.forEach(item => {
          if (item.children && item.children.length) {
            item.children.forEach(child => {
              child.disabled = child.granularity !== granularity;
              if (dataRightIds.includes(child.id)) child.disabled = true;
            });
          }
        });
        // 默认当前导入右侧是数据是选中状态
        this.dataRight.forEach(item => {
          if (!preDataRightIds.includes(item.id)) this.rightChecked.push(item);
        });
      }
      this.rawDataRight = JSON.parse(JSON.stringify(this.dataRight));
    },

    // 移除到左侧
    remove() {
      const rightCheckedData = JSON.parse(JSON.stringify(this.rightChecked));
      const rightCheckedIds = rightCheckedData.map(item => item.id);
      rightCheckedData.map((item, index) => {
        this.$refs.treeLeft.setChecked(item[this.defaultProps.id], false);
        this.dataRight.map((right, rightIndex) => {
          if (item[this.defaultProps.id] === right[this.defaultProps.id]) {
            this.dataRight.splice(rightIndex, 1);
          }
        });
      });
      this.rawDataRight = JSON.parse(JSON.stringify(this.dataRight));
      this.dataLeft.forEach(item => {
        if (item.children && item.children.length) {
          item.children.forEach(child => {
            if (this.dataRight.length === 0) {
              child.disabled = false;
            } else if (rightCheckedIds.includes(child.id)) {
              child.disabled = false;
            }
          });
        }
      });
      this.rightChecked = [];
    },
    // 重置数据
    reset() {
      // 重置左侧
      const list = this.$refs.treeLeft.getCheckedNodes();
      list.map((item, index) => {
        this.$refs.treeLeft.setChecked(item, false);
      });
      // 重置右侧
      this.dataRight = [];
      this.rawDataRight = [];
      this.rightChecked = [];
    },
    // 返回当前选中的值
    getVal() {
      // return this.dataRight;
      return this.rightChecked;
    }
  }
};
</script>
<style scoped lang="scss">
.el-checkbox .is-disabled {
  display: none;
}
.el-checkbox-group {
  width: 100%;
  position: relative;
  overflow: auto;
  overflow-x: hidden;
}
.tree-transfer {
  display: flex;
  min-height: 300px;
  .title {
    padding: 10px 20px;
    border-bottom: 1px #e5e5e5 solid;
    background: #f3f4f7;
  }
  .transfer-content {
    padding: 10px;
    height: 300px;
    overflow-y: auto;
  }
  .tree-transfer-left {
    // max-width: 640px;
    // min-width: 200px;
    width: 230px;
    // height: 300px;
    border: 1px #e5e5e5 solid;
    border-radius: 4px;
    // max-height: 540px;
    // overflow-y: scroll;
    .treeLeft {
      margin-top: 10px;
      width: 100%;
      ::v-deep .el-tree-node__children .el-tree-node__content {
        align-items: flex-start;
        height: 36px;
        .el-icon-caret-right {
          margin-top: -3px;
        }
        .tree_item {
          .name {
            display: inline-block;
            width: 100%;
            font-size: $global-font-size-13;
            color: #909399;
          }
        }
      }
    }
  }
  .tree-transfer-middle {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 120px;
    margin: 0 5px;
  }
  .tree-transfer-right {
    // min-width: 200px;
    width: 230px;
    // height: 300px;
    border: 1px #e5e5e5 solid;
    border-radius: 4px;
    // max-height: 540px;
    // overflow-y: scroll;
    .transfer_group {
      margin-top: 10px;
    }
    .el-checkbox {
      display: flex;
      align-items: start;
      ::v-deep .el-checkbox__label {
        width: 100%;
        .el-checkbox__input {
          margin-top: 2px;
        }
        .item_wrap {
          .name {
            display: inline-block;
            width: 100%;
            font-size: $global-font-size-13;
          }
        }
      }
    }
  }
}
</style>
