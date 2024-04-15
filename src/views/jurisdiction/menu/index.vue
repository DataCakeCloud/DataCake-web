<template>
  <el-card class="menu-list box-card-container">
    <div class="statusBox">
      <span class="labelEle">有效</span>
      <el-checkbox v-model="validValue" :true-label="0" :false-label="1"></el-checkbox>
    </div>
    <div class="box-card">
      <!-- menu -->
      <el-card class="inner-card leftCard">
        <div slot="header" class="inner-card-header">
          <span>菜单</span>
          <el-button type="text" icon="el-icon-plus" class="addIcon addBtn" @click="addMenu('')"></el-button>
        </div>
        <el-tree v-loading="menuLoading" :data="menus" node-key="id" :expand-on-click-node="false" default-expand-all @node-click="menuClick">
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span class="node-name" :class="{ 'menu-invalid': data.valid === 1 }">{{ data.name }}</span>
            <span class="node-btn">
              <el-button v-if="data.level === 1" type="text" :disabled="data.valid === 1" size="mini" icon="el-icon-plus" @click.stop="addMenu(data)"> </el-button>
              <el-button type="text" size="mini" icon="el-icon-edit" @click.stop="editMenu(data)"></el-button>
              <el-popconfirm title="确定移除该菜单吗？" @confirm="removeMenu(data)">
                <el-button slot="reference" type="text" size="mini" icon="el-icon-delete" @click.stop></el-button>
              </el-popconfirm>
            </span>
          </span>
        </el-tree>
      </el-card>
      <!-- action -->
      <el-card class="inner-card">
        <div slot="header" class="inner-card-header">
          <span>功能</span>
          <el-button v-show="actionAddBtn" type="text" icon="el-icon-plus" class="addBtn addIcon" :disabled="selectMenuValid === 1" @click="addAction"> </el-button>
        </div>
        <el-tree ref="actionTree" :data="actions" node-key="id" :expand-on-click-node="false" default-expand-all>
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span class="node-name" :class="{ 'menu-invalid': data.valid === 1 }">{{ data.name }}</span>
            <span class="node-btn">
              <el-button type="text" size="mini" icon="el-icon-edit" @click.stop="editAction(data)"></el-button>
              <el-popconfirm title="确定移除该功能吗？" @confirm="removeAction(data)">
                <el-button slot="reference" type="text" size="mini" icon="el-icon-delete"></el-button>
              </el-popconfirm>
            </span>
          </span>
        </el-tree>
      </el-card>
    </div>
    <!-- 弹框 -->
    <el-dialog ref="dialogRef" :title="dialogTitle" :visible.sync="visibleDialog" width="700px" @closed="closed">
      <el-form ref="formRef" :model="menuActionForm" label-width="150px" class="main-form">
        <el-form-item label="编码" prop="code" required>
          <el-input v-model.trim="menuActionForm.code" :clearable="true" :disabled="level === 3 && dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="menuActionForm.name" :clearable="true"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description" required>
          <el-input v-model="menuActionForm.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="valid" required>
          <el-radio-group v-model="menuActionForm.valid">
            <el-radio v-for="item in statusArr" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 所属产品在添加一级菜单的时候显示 -->
        <el-form-item v-if="level === 1" label="所属产品" prop="productId" required>
          <el-select v-model="menuActionForm.productId" placeholder="请选择所属产品" class="productEle" :disabled="dialogType === 'edit'">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接" prop="url" required>
          <el-input v-model="menuActionForm.url" :clearable="true"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="submitBtn">保 存</el-button>
          <el-button @click="visibleDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-card>
</template>
<script>
import { menuAdd, menuUpdate, menuList, menuDelete, getConfig } from '@/api/jurisdiction';
const resetMenuActionForm = () => {
  return {
    code: '',
    name: '',
    description: '',
    valid: 0, // valid=0表示有效，valid=1表示无效
    deleteStatus: 0,
    productId: '',
    url: ''
  };
};
export default {
  components: {},
  data() {
    return {
      options: [],
      submitLoading: false,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      userId: JSON.parse(sessionStorage.getItem('userInfo')).id,
      actionAddBtn: false,
      statusArr: [
        { label: '有效', value: 0 },
        { label: '无效', value: 1 }
      ],
      visibleDialog: false,
      menuLoading: false,
      menus: [],
      dialogType: '',
      selectMenuId: null,
      selectMenuValid: null,
      selectMenuName: null,
      selectProductId: null,
      selectLevel: null,
      actions: [],
      actionsAll: [],
      parentAction: {},
      level: 1, // 1:一级菜单，2：二级菜单，3：功能
      menuActionForm: resetMenuActionForm(),
      validValue: 1, // valid=0表示有效，valid=1表示无效
      allArr: []
    };
  },
  computed: {
    dialogTitle() {
      if (this.dialogType === 'add' && this.level === 1) {
        return '新增一级菜单';
      }
      if (this.dialogType === 'edit' && this.level === 1) {
        return '编辑一级菜单';
      }
      if (this.dialogType === 'add' && this.level === 2) {
        return '新增二级菜单';
      }
      if (this.dialogType === 'edit' && this.level === 2) {
        return '编辑二级菜单';
      }
      if (this.dialogType === 'add' && this.level === 3) {
        return `新增功能 所属菜单：${this.selectMenuName}`;
      }
      if (this.dialogType === 'edit' && this.level === 3) {
        return `编辑功能 所属菜单：${this.selectMenuName}`;
      }
      return '';
    }
  },
  watch: {
    actionsAll(newVal, oldVal) {
      this.getAction();
    },
    validValue(newvalid) {
      this.getValidMenu();
    }
  },
  created() {
    this.getMenuList();
    this.getConfigList();
  },
  methods: {
    async getConfigList() {
      const data = await (await getConfig()).data;
      this.options = data.length > 0 ? data.map(item => ({ label: item.name, value: item.id })) : [];
    },
    getValidMenu() {
      if (this.validValue === 0) {
        // 有效
        const copyArr = JSON.parse(JSON.stringify(this.allArr));
        copyArr.forEach((row1, index1) => {
          if (row1.valid === 1) {
            copyArr.splice(index1, 1);
          } else if (row1.valid === 0) {
            if (row1.children) {
              row1.children.forEach((row2, index2) => {
                if (row2.valid === 1) {
                  row1.children.splice(index2, 1);
                }
              });
            }
          }
        });
        this.menus = copyArr;
      } else {
        this.menus = JSON.parse(JSON.stringify(this.allArr));
      }
    },
    // 获取功能列表
    getAction() {
      this.actions = [];
      if (this.selectLevel === 1) {
        this.actionAddBtn = false;
        this.actions = this.actionsAll.filter(item => item.grandId1 === this.selectMenuId);
      } else if (this.selectLevel === 2) {
        this.actionAddBtn = true;
        this.actions = this.actionsAll.filter(item => item.grandId2 === this.selectMenuId);
      }
    },
    // 点击菜单
    menuClick(data) {
      this.selectMenuId = data.id;
      this.selectMenuValid = data.valid;
      this.selectMenuName = data.name;
      this.selectProductId = data.productId;
      this.selectLevel = data.level;
      this.getAction();
    },
    // 菜单列表
    async getMenuList() {
      this.actionsAll = [];
      this.menuLoading = true;
      this.allArr = await (await menuList({ userId: this.userId })).data;
      this.menuLoading = false;
      this.allArr.forEach(row1 => {
        if (row1.children) {
          row1.children.forEach(row2 => {
            if (row2.children && row2.level === 2) {
              this.setIdFn(row2.children, row1.id, row2.id);
              this.actionsAll.push(...row2.children);
              delete row2.children;
            }
          });
        }
      });
      this.getValidMenu();
    },
    // 给action添加level=1和level=2的id；
    setIdFn(arr, id1, id2) {
      arr.forEach(item => {
        item.grandId1 = id1;
        item.grandId2 = id2;
        if (item.children) {
          this.setIdFn(item.children, id1, id2);
        }
      });
    },
    // 编辑菜单
    async editMenu(item) {
      this.dialogType = 'edit';
      const { id, level, parentMenuId } = item;
      Object.keys(this.menuActionForm).forEach(key => {
        this.menuActionForm[key] = item[key];
      });
      this.menuActionForm.id = id;
      this.menuActionForm.parentMenuId = parentMenuId;
      this.level = level;
      this.visibleDialog = true;
    },
    // 新增菜单
    addMenu(item) {
      this.dialogType = 'add';
      if (item) {
        this.menuActionForm.parentMenuId = item.id;
        this.menuActionForm.productId = item.productId;
        this.level = 2;
      } else {
        this.menuActionForm.parentMenuId = -1;
        this.level = 1;
      }
      this.visibleDialog = true;
    },
    // 菜单提交
    submitBtn() {
      this.$refs.formRef.validate(async vali => {
        if (vali) {
          const params = {
            ...this.menuActionForm,
            level: this.level
          };
          this.submitLoading = true;
          try {
            const postFn = this.dialogType === 'add' ? menuAdd : menuUpdate;
            await postFn(params);
            this.$message.success(`${this.dialogType === 'add' ? '新增' : '编辑'}成功`);
            this.visibleDialog = false;
            this.getMenuList();
          } catch (error) {
            console.log(error);
          }
          this.submitLoading = false;
        }
      });
    },
    // 删除菜单
    async removeMenu({ id, level, children }) {
      if (level === 1 && children) {
        this.$message.warning(`请先删除子菜单`);
        return;
      }
      await menuDelete({ id });
      this.$message.success(`删除成功`);
      this.getMenuList();
    },
    // 删除功能
    async removeAction({ id }) {
      await menuDelete({ id });
      this.$message.success(`删除成功`);
      this.getMenuList();
    },
    // 新增功能
    addAction() {
      this.dialogType = 'add';
      this.menuActionForm.parentMenuId = this.selectMenuId;
      this.menuActionForm.productId = this.selectProductId;
      this.level = 3;
      this.visibleDialog = true;
    },
    // 编辑功能
    async editAction(item) {
      this.dialogType = 'edit';
      const { id, level, parentMenuId } = item;
      Object.keys(this.menuActionForm).forEach(key => {
        this.menuActionForm[key] = item[key];
      });
      this.menuActionForm.id = id;
      this.menuActionForm.parentMenuId = parentMenuId;
      this.level = level;
      this.visibleDialog = true;
    },
    // dialog关闭回调 清空表单
    closed() {
      this.menuActionForm = resetMenuActionForm();
      this.$refs.formRef.resetFields();
    }
  }
};
</script>
<style lang="scss" scoped>
.menu-list {
  display: flex;
  flex-direction: column;
  .statusBox {
    width: 700px;
    margin: 50px auto 20px;
    .labelEle {
      display: inline-block;
      margin-right: 10px;
    }
  }
  .menu-invalid {
    color: #aaa;
  }
  .productEle {
    width: 100%;
  }
  .menu-invalid {
    color: #aaa;
  }
  .box-card {
    width: 700px;
    margin: 0 auto;

    .leftCard {
      margin-right: 50px;
    }
    .addIcon {
      // color: $c-primary;
      font-size: $global-font-size-18;
      float: right;
      &.addBtn {
        position: relative;
        top: -8px;
      }
    }
  }
  .inner-card {
    width: 300px;
    float: left;
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: $global-font-size-14;
      padding-right: 8px;
      .node-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .node-btn {
        .el-button {
          min-width: 24px;
          & + .el-button {
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
