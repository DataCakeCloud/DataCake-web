<template>
  <el-card class="r-r-card dashboard-card">
    <div slot="header">
      <span>筛选</span>
      <el-button size="mini" type="primary" class="search-btn" @click="handleQuery">查询</el-button>
      <el-button size="mini" type="primary" class="clear-btn" @click="handleClear">全部清除</el-button>
    </div>

    <div class="list">
      <el-collapse v-model="activeName" @change="handleCollapse">
        <el-collapse-item name="1">
          <template slot="title">业务参数</template>
          <!-- 业务参数 -->
          <template v-for="(item, index) in filterList">
            <div v-if="item.dimensionality === 1 && item.isCheck" :key="index" :ref="`${item.field}_item`" class="item" :class="{ active: item.active }" @click="handleClick(item, index)">
              <div class="item-text">
                <span class="name">{{ item.name }}</span>
                <span v-if="item.shortName" class="s-name">（{{ item.shortName }}）</span>
              </div>

              <div v-if="filterField[item.field] && filterField[item.field].length" class="filter-result">
                <template v-for="(subItem, subIndex) in filterField[item.field]">
                  <span :key="index + '-' + subIndex" class="filter-item">
                    <span class="text cell-ellipsis">{{ subItem.name }}</span>
                    <i class="el-icon-delete" @click.stop="handleDeleteFilter(subItem, item, index)"></i>
                  </span>
                </template>
              </div>

              <el-tooltip v-show="filterField[item.field] && filterField[item.field].length" placement="top">
                <div slot="content">
                  <template v-for="(subItem, subIndex) in filterField[item.field]">
                    <div :key="index + '-' + subIndex + '-' + 'subIndex'" class="result-tag-list">
                      <span :key="index + '-' + subIndex">{{ subItem.name }} <i class="el-icon-delete" @click.stop="handleDeleteFilter(subItem, item, index)"></i></span>
                    </div>
                  </template>
                </div>
                <span class="result-tag">{{ filterField[item.field] && filterField[item.field].length }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template slot="title">资源参数</template>
          <!-- 资源参数 -->
          <template v-for="(item, index) in filterList">
            <div v-if="item.dimensionality === 2 && item.isCheck" :key="index" :ref="`${item.field}_item`" class="item" :class="{ active: item.active }" @click="handleClick(item, index)">
              <div class="item-text">
                <span class="name">{{ item.name }}</span>
                <span v-if="item.shortName" class="s-name">（{{ item.shortName }}）</span>
              </div>
              <div v-if="filterField[item.field] && filterField[item.field].length" class="filter-result">
                <template v-for="(subItem, subIndex) in filterField[item.field]">
                  <span :key="index + '-' + subIndex" class="filter-item">
                    <span class="text cell-ellipsis">{{ subItem.name }}</span>
                    <i class="el-icon-delete" @click.stop="handleDeleteFilter(subItem, item, index)"></i>
                  </span>
                </template>
              </div>

              <el-tooltip v-show="filterField[item.field] && filterField[item.field].length" placement="top">
                <div slot="content">
                  <template v-for="(subItem, subIndex) in filterField[item.field]">
                    <div :key="index + '-' + subIndex + '-' + 'subIndex'" class="result-tag-list">
                      <span :key="index + '-' + subIndex">{{ subItem.name }} <i class="el-icon-delete" @click.stop="handleDeleteFilter(subItem, item, index)"></i></span>
                    </div>
                  </template>
                </div>
                <span v-show="filterField[item.field] && filterField[item.field].length" class="result-tag">{{ filterField[item.field] && filterField[item.field].length }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div ref="treeWrapper" class="tree-wrapper transition" :class="{ show: treeShow }" :style="filterTreeStyle">
      <el-dropdown class="drop-down-icon" :tabindex="tabindex" @command="handleCommand">
        <span class="el-dropdown-link"> {{ dropDownText }} <i class="el-icon-arrow-down el-icon--right"></i> </span>
        <el-dropdown-menu slot="dropdown">
          <template v-for="(item, index) in dropdownList">
            <el-dropdown-item :key="index" :disabled="dropDownText === item.value" :command="item.value">{{ item.name }}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
      <el-divider></el-divider>
      <div class="filter-result">
        <template v-for="(item, index) in filterResultList">
          <span :key="index" class="filter-item">
            <span class="text cell-ellipsis">{{ item.name }}</span>
            <i class="el-icon-delete" @click="handleDelete(item)"></i>
          </span>
        </template>
      </div>
      <el-input v-model="filterValue" placeholder="搜索维度" suffix-icon="el-icon-search" class="filter-input"></el-input>
      <div v-loading="treeLoading" element-loading-text="树加载中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.15)" class="tree-list">
        <el-tree
          ref="tree"
          node-key="id"
          :indent="8"
          show-checkbox
          :check-strictly="true"
          :data="trees"
          :props="defaultProps"
          :expand-on-click-node="expanOnType"
          :filter-node-method="filterNode"
          :default-checked-keys="defaultCheckedKeys"
          :default-expanded-keys="defaultExpandedKeys"
          highlight-current
          @node-click="handleTreeNodeClick"
          @check="handleTreeCheck"
        >
          <span slot-scope="{ node }" class="custom-tree-node">
            <span class="tree-label cell-ellipsis">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>

      <el-divider></el-divider>
      <div class="tips">共有 {{ trees.length }} 个结果，显示 {{ filterResultList.length }} 个</div>
      <el-divider></el-divider>
      <div class="btns">
        <el-button @click="handleSearch">确认</el-button>
        <!-- <el-button type="primary" @click="handleSearch">应用</el-button> -->
      </div>
    </div>
  </el-card>
</template>

<script>
import { debounce, removeDuplicate } from '@/utils';
import { costListDictionary } from '@/api/cost';
import { mapGetters } from 'vuex';
const clientHeight = document.documentClientHeight || document.body.clientHeight;
const TREE_HEIGHT = clientHeight / 2.5;
export default {
  name: 'SideFilter',
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    filters: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const list = JSON.parse(JSON.stringify(this.$t('cost.filterList')));
    return {
      activeName: ['1', '2'],
      list: list,
      currentFilter: '',
      specialFilterList: ['tasks', 'buckets', 'searchIds'],
      filterResultList: [],
      filterTreeStyle: {},
      catchTress: {},
      treeShow: false,
      treeLoading: false,
      expanOnType: false,
      trees: [],
      getJobs: null,
      defaultCheckedKeys: [],
      defaultExpandedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      tabindex: 2,
      dropDownText: '仅包含',
      dropdownList: [
        {
          name: '仅包含',
          value: 'include'
        },
        {
          name: '仅排除',
          value: 'exclude'
        },
        {
          name: '清除筛选条件',
          value: 'clear'
        }
      ],
      filterValue: '',
      clientHeight: document.documentClientHeight || document.body.clientHeight,
      clientWidth: document.documentClientWidth || document.body.clientWidth.toExponential,
      searchType: ['jobs', 'queryIds']
    };
  },
  computed: {
    ...mapGetters(['isCloud', 'userInfo']),
    filterList() {
      if (!Object.keys(this.params).length) return [];
      let list = this.list.map(e => ({
        ...e,
        isCheck: !this.isCloud || this.userInfo.isSupperAdmin || e.isTenant === 1
      }));
      switch (this.params.roleView) {
        case 1:
          list = list.filter(e => e.type !== this.params.roleView);
          break;
      }
      return list;
    },
    filterField() {
      if (Object.keys(this.filters).length) return this.filters;
      const list = JSON.parse(JSON.stringify(this.$t('cost.filterList')));
      const obj = {};
      this.list.forEach(e => {
        obj[e.field] = [];
      });
      return obj;
    }
  },
  watch: {
    filterValue(val) {
      if (this.searchType.includes(this.currentFilter)) {
        if (!val) {
          this.trees = [];
          return;
        }
        const id = this.list.find(e => e.field === this.currentFilter)['value'];
        this.getJobs(id);
      } else {
        this.$refs.tree.filter(val);
      }
    }
  },
  created() {
    this.getJobs = debounce(this.getTrees, 300);
  },
  methods: {
    handleCommand(command) {
      if (!this.trees.length) {
        this.$message({
          type: 'warning',
          message: '请先请求维度数据'
        });
        return;
      }
      const arr = [];
      const allKeys = findTreesId(this.trees);
      const checkedKeys = this.$refs.tree.getCheckedKeys();
      const invertKeys = allKeys.filter(e => checkedKeys.findIndex(ee => ee === e) === -1);
      const text = this.dropdownList.find(e => e.value === command)['name'];
      this.dropDownText = text;

      switch (command) {
        case 'include':
          this.include(checkedKeys);
          break;
        case 'exclude':
          this.exclude(invertKeys);
          break;
        case 'clear':
          this.clear();
          break;
      }

      const checkedNodes = this.$refs.tree.getCheckedNodes();
      this.handleFilterResult(checkedNodes);

      function findTreesId(tree) {
        if (tree.length === 0) return;
        for (let i = 0; i < tree.length; i++) {
          if (tree[i].children && tree[i].children.length) {
            findTreesId(tree[i].children);
          } else {
            arr.push(tree[i].id);
          }
        }
        return arr;
      }
    },
    include(checkedKeys) {
      this.defaultCheckedKeys = checkedKeys;
      this.$refs.tree.setCheckedKeys(checkedKeys);
    },
    exclude(invertKeys) {
      this.defaultCheckedKeys = invertKeys;
      this.$refs.tree.setCheckedKeys(invertKeys);
    },
    clear() {
      this.defaultCheckedKeys = [];
      this.$refs.tree.setCheckedKeys([]);
    },
    handleClear() {
      // if (!this.trees.length) return;
      this.list.forEach(e => {
        this.filterField[e.field] = [];
      });
      this.list.forEach(e => {
        e.active = false;
      });

      this.defaultCheckedKeys = [];
      this.filterResultList = [];
      this.handleTreeStyle();
      // this.$emit('updateFilter', this.filterField);
      this.handleChange();
    },
    getTrees(val) {
      const params = {
        requestType: val,
        name: this.searchType.includes(this.currentFilter) ? this.filterValue : ''
      };
      this.treeLoading = true;
      this.trees = [];
      costListDictionary(params).then(res => {
        this.treeLoading = false;
        this.catchTress[this.currentFilter] = this.trees = res.data;
      });
    },
    handleClick(item, index) {
      this.filterValue = '';
      if (item.active) {
        this.list.forEach(e => {
          e.active = false;
        });

        this.currentFilter = item.field;
      } else {
        this.list.forEach(e => {
          e.active = false;
        });
        this.list[index].active = true;
        this.currentFilter = item.field;
        if (!this.filterField[item.field].length) {
          this.filterResultList = [];
          this.$refs.tree.setCheckedKeys([]);
        } else {
          this.filterResultList = this.filterField[item.field];
          const keys = this.filterResultList.map(e => e.key);
          this.$refs.tree.setCheckedKeys(keys);
        }
      }
      if (item.field !== 'jobs') {
        if (!this.catchTress[this.currentFilter]) this.getTrees(item.value);
        else this.trees = this.catchTress[this.currentFilter];
      } else {
        this.trees = [];
      }
      this.handleTreeStyle();
    },
    handleTreeCheck(checkedNode, checkedData) {
      const checkedNodes = checkedData.checkedNodes;
      this.handleFilterResult(checkedNodes);
    },
    handleFilterResult(checkedNodes) {
      // let result = this.filterField[this.currentFilter].concat(
      //   checkedNodes.map(e => {
      //     return {
      //       name: e.label,
      //       key: e.id,
      //       id: this.currentFilter === 'groups' || this.currentFilter === 'pus' ? e.id : e.name
      //     };
      //   })
      // );

      let result =
        this.currentFilter === 'jobs'
          ? this.filterField[this.currentFilter].concat(
            checkedNodes.map(e => ({
              name: e.label,
              key: e.id,
              id: this.currentFilter === 'groups' || this.currentFilter === 'pus' ? e.id : e.name
            }))
          )
          : checkedNodes.map(e => ({
            name: e.label,
            key: e.id,
            id: this.currentFilter === 'groups' || this.currentFilter === 'pus' ? e.id : e.name
          }));

      result = removeDuplicate(result, 'name');
      this.filterField[this.currentFilter] = this.filterResultList = result;

      this.$nextTick(_ => {
        this.handleTreeStyle();
      });
    },
    handleDeleteFilter(subItem, item, i) {
      const index = this.filterField[item.field].findIndex(e => e.key === subItem.key);
      if (index !== -1) {
        this.filterField[item.field].splice(index, 1);
        this.filterResultList = this.filterField[item.field];
        this.defaultCheckedKeys = this.filterField[item.field].map(e => e.key);

        this.$refs.tree.setCheckedKeys(this.defaultCheckedKeys);
      }

      // 没删完，就选中
      if (this.filterField[item.field].length) {
        this.list.forEach(e => {
          e.active = false;
        });
        this.list[i].active = true;
      }
      this.currentFilter = item.field;
      // const timer = setTimeout(_ => {
      //   this.handleTreeStyle();

      //   clearTimeout(timer);
      // }, 0);

      this.$nextTick(_ => {
        this.handleTreeStyle();
      });
      this.handleChange();
    },
    handleDelete(item) {
      const index = this.filterResultList.findIndex(e => e.key === item.key);
      if (index !== -1) {
        this.filterResultList.splice(index, 1);
        this.filterField[this.currentFilter] = this.filterResultList;
        this.defaultCheckedKeys = this.filterResultList.map(e => e.key);

        this.$refs.tree.setCheckedKeys(this.defaultCheckedKeys);
      }
      // const timer = setTimeout(_ => {
      //   this.handleTreeStyle();

      //   clearTimeout(timer);
      // }, 0);
      this.$nextTick(_ => {
        this.handleTreeStyle();
      });
      this.handleChange();
    },
    handleTreeStyle() {
      if (!this.currentFilter) return;
      const ref = this.$refs[`${this.currentFilter}_item`][0];
      const rect = ref.getBoundingClientRect();
      const b = rect.bottom;
      const t = rect.top;
      const l = rect.left;
      const w = rect.width;
      const diff = clientHeight - b;
      const top = clientHeight - t;
      const flag = this.list.every(e => !e.active);

      if (flag) this.treeShow = false;
      else this.treeShow = true;
      if (diff < TREE_HEIGHT) {
        this.filterTreeStyle = flag
          ? {
            bottom: top + 'px'
            // left: l + 'px'
            // right: this.clientWidth - w - l + 'px'
          }
          : {
            bottom: top + 'px',
            left: l + 'px',
            width: w + 'px'
          };
      } else {
        this.filterTreeStyle = flag
          ? {
            top: b + 'px'
            // left: l + 'px'
            // right: this.clientWidth - w - l + 'px'
          }
          : {
            top: b + 'px',
            left: l + 'px',
            width: w + 'px'
          };
      }
    },
    handleClose() {
      this.list.forEach(e => {
        e.active = false;
      });

      this.handleTreeStyle();
    },
    handleSearch() {
      this.handleClose();
      this.handleChange();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleTreeNodeClick(data, node, component) {
      node.checked = !node.checked;
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      this.handleFilterResult(checkedNodes);
    },
    handleCollapse(val) {
      if (!this.currentFilter) return;
      this.handleClose();
    },
    handleFilterText() {
      let str = '';
      this.list.forEach(e => {
        const name = e.name;
        const field = this.filterField[e.field].map(e => e.name).join('、');
        str += field ? `${name}: ${field}; ` : '';
      });
      return str;
    },
    handleQuery() {
      this.$emit('handleQuery');
    },
    handleChange() {
      const filters = {};
      this.list.forEach(e => {
        if (this.filterField[e.field].length) filters[e.field] = this.filterField[e.field].map(ee => ee.id);
        else filters[e.field] = this.filterField[e.field];
      });

      this.$emit('updateFilter', filters, this.filterField, this.handleFilterText());
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.r-r-card {
  height: calc(100vh - $s-navbar-height - 20px);
  overflow-y: auto;

  ::v-deep .el-card__header {
    position: relative;
  }

  .clear-btn {
    position: absolute;
    top: 5px;
    right: 10px;
  }
  .search-btn {
    position: absolute;
    top: 5px;
    right: 90px;
  }

  .list {
    ::v-deep .el-collapse-item__header {
      padding: 0 20px;
    }
    ::v-deep .el-collapse-item__content {
      padding-bottom: 0;
    }
    .item {
      position: relative;
      padding: 10px 20px 10px 30px;
      border-bottom: 1px solid #e1e1e1;

      .item-text {
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .result-tag {
        border: 1px solid $c-primary;
        color: $c-primary;
      }

      &:last-child {
        border-bottom: none;
      }

      &.active {
        background: $c-primary;
        color: #fff;

        .filter-result .filter-item {
          border: 1px solid #fff;
        }

        .result-tag {
          border: 1px solid #fff;
          color: #fff;
        }
      }
    }
  }
}

.tree-wrapper {
  position: fixed;
  min-height: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  &.show {
    min-height: 300px;
    max-height: calc(45vh);
    padding: 30px 10px 10px;
    border-radius: 4px;
    border: 1px solid #e1e5ef;
    border-top: none;
    box-shadow: 0 2px 12px 0 rgb(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
    opacity: 1;
    z-index: 3000;
    /* overflow-y: auto; */
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3500;
  }

  .drop-down-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3500;
  }
}

.filter-result {
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
  flex-wrap: wrap;
  height: 22px;
  overflow: hidden;
  .filter-item {
    display: flex;
    align-items: center;
    padding: 0 3px;
    height: 20px;
    line-height: 20px;
    border-radius: 4px;
    margin: 0 3px 3px;
    background: $c-primary;
    color: #fff;
    font-size: $global-font-size-12;

    .text {
      max-width: 100px;
    }
    .el-icon-delete {
      margin-left: 3px;
      font-size: $global-font-size-10;
    }
  }
}

.filter-input {
  margin-top: 10px;
}

.result-tag {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 50%;
  width: 15px;
  height: 15px;
}

.result-tag-list {
  line-height: 22px;
}

.tree-list {
  margin-top: 10px;
  max-height: calc(13vh);
  overflow-y: auto;
}

.tips {
  text-align: center;
}

.btns {
  display: flex;
  justify-content: flex-end;
}

::v-deep .el-divider--horizontal {
  margin: 10px 0;
}
</style>
