<template>
  <div>
    <!-- <h3 class="powerTitle">权限配置</h3> -->
    <!-- menu -->
    <el-card class="inner-card leftCard">
      <div slot="header" class="inner-card-header">
        <span>可见菜单</span>
      </div>
      <el-tree
        ref="menuTree"
        v-loading="menuLoading"
        :expand-on-click-node="false"
        :data="menus"
        accordion
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :check-strictly="false"
:props="props"
        @node-click="menuClick"
        @check="checkChange"
      > </el-tree>
    </el-card>
    <!-- action -->
    <el-card class="inner-card">
      <div slot="header" class="inner-card-header">
        <span>功能权限</span>
      </div>
      <el-tree
        ref="actionTree"
        v-loading="menuLoading"
        :data="actions"
        node-key="id"
        :expand-on-click-node="false"
        :check-strictly="false"
        show-checkbox
        :check-on-click-node="false"
        :props="props"
default-expand-all
        :filter-node-method="filterAction"
        @check="actionChange"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span class="node-name" :class="{ 'menu-invalid': data.status === 0 }">{{ data.name }}</span>
          <!-- <span class="node-btn">
            <el-popconfirm title="确定移除该功能吗？" @confirm="removeAction(data)">
              <el-button slot="reference" type="text" size="mini" icon="el-icon-delete" @click.stop></el-button>
            </el-popconfirm>
          </span> -->
        </span>
      </el-tree>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'MenuAction',
  props: {
    menuLoading: {
      type: Boolean,
      default: false
    },
    // menus: {
    //   type: Array,
    //   default() {
    //     return [];
    //   }
    // },
    // actions: {
    //   type: Array,
    //   default() {
    //     return [];
    //   }
    // },
    allArr: {
      type: Array,
      default() {
        return [];
      }
    },
    menuChecked: {
      type: Array,
      default() {
        return [];
      }
    },
    actionChecked: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      props: {
        label: 'name'
      },
      clickLevel: 1,
      menus: [],
      actions: []
    };
  },
  watch: {
    allArr: {
      deep: true,
      handler(arr) {
        this.actions = [];
        this.menus = [];
        const copyArr = JSON.parse(JSON.stringify(arr));
        copyArr.forEach(row1 => {
          if (row1.children) {
            row1.children.forEach(row2 => {
              if (row2.children && row2.level === 2) {
                row2.children.forEach(row3 => {
                  row3.grandId1 = row1.id;
                  row3.grandId2 = row2.id;
                  if (row3.children) {
                    row3.children.forEach(row4 => {
                      row4.grandId1 = row1.id;
                      row4.grandId2 = row2.id;
                    });
                  }
                });
                this.actions.push(...row2.children);
                delete row2.children;
              }
            });
          }
        });
        this.menus = copyArr;
        const level1ArrId = this.menus.map(item => item.id);
        this.$nextTick(() => {
          // this.menuChecked.forEach(val => {
          //   this.$refs.menuTree.setChecked(val, true, false);
          // });
          const level2Id = [];
          if (this.menuChecked.length > 0) {
            this.menuChecked.forEach((value, index) => {
              if (!level1ArrId.includes(value)) {
                level2Id.push(value);
              }
            });
          }
          this.$refs.menuTree.setCheckedKeys(level2Id);
          this.$refs.actionTree.setCheckedKeys(this.actionChecked);
        });
      },
      immediate: true
    }
  },
  methods: {
    actionChange(data, checkedObj) {
      const id = data.id;
      const parentMenuId = data.parentMenuId;
      const checkedKeys = checkedObj.checkedKeys;
      const copyArr = JSON.parse(JSON.stringify(this.allArr));
      copyArr.forEach(row1 => {
        if (row1.children) {
          const obj = row1.children.find(row2 => row2.id === parentMenuId); // obj是二级菜单
          if (obj) {
            const level3Ids = [];
            obj.children.forEach(row3 => {
              level3Ids.push(row3.id);
            });
            if (checkedKeys.includes(id)) {
              const node = this.$refs.menuTree.getNode(obj.id);
              this.$refs.menuTree.setChecked(node, true);
              // node.indeterminate = true;
            }
            // if (level3Ids.every(it => checkedKeys.includes(it))) {
            //   this.$refs.menuTree.setCheckedKeys([...new Set([...getCheckedMenu, obj.id])]);
            // }
            if (level3Ids.every(it => !checkedKeys.includes(it))) {
              const node = this.$refs.menuTree.getNode(obj.id);
              this.$refs.menuTree.setChecked(node, false);
            }
          }
        }
      });
    },
    checkChange(data, checkedObj) {
      const copyArr = JSON.parse(JSON.stringify(this.allArr));
      const pickAction = []; // 功能权限的id组成的数组
      if (data.level === 1) {
        const childArr = copyArr.find(row1 => row1.id === data.id).children;
        if (childArr) {
          childArr.forEach(row2 => {
            // pickMenu.push(row2.id);
            if (row2.children) {
              row2.children.forEach(row3 => {
                pickAction.push(row3.id);
                if (row3.children) {
                  row3.children.forEach(row4 => {
                    pickAction.push(row4.id);
                  });
                }
              });
            }
          });
        }
      } else if (data.level === 2) {
        copyArr.forEach(row1 => {
          if (row1.children) {
            const obj = row1.children.find(row2 => row2.id === data.id);
            if (obj) {
              if (obj.children) {
                obj.children.forEach(row3 => {
                  pickAction.push(row3.id);
                  if (row3.children) {
                    row3.children.forEach(row4 => {
                      pickAction.push(row4.id);
                    });
                  }
                });
              }
            }
          }
        });
      }
      pickAction.forEach(id => {
        var node = this.$refs.actionTree.getNode(id);
        this.$refs.menuTree.setChecked(node, checkedObj.checkedKeys.includes(data.id));
      });
    },
    // 通过选中的菜单过滤功能列表
    filterAction(value, data, node) {
      if (this.clickLevel === 1) {
        return data.grandId1 === value;
      }
      return data.grandId2 === value;
    },
    // 点击菜单
    menuClick(data) {
      this.clickLevel = data.level === 1 ? 1 : 2;
      this.$refs.actionTree.filter(data.id);
    }
  }
};
</script>
<style lang="scss" scoped>
.inner-card {
  width: 300px;
  float: left;
  &.leftCard {
    margin-right: 20px;
  }
}
</style>
