<template>
  <div>
    <div class="header">
      <el-button type="primary" @click="dialogVisible = true">添加数据权限</el-button>
      <el-input v-model.trim="keyWord" class="filter" placeholder="请输入要查询的数据库/表名称" @keyup.enter.native="getListFn">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="getListFn"></i>
      </el-input>
    </div>
    <el-table ref="tableData" :data="tableData" height="425px">
      <el-table-column type="selection" width="50" />
      <el-table-column label="对象类型" :filters="tableFilters.grantedOn" :filter-method="filterHandler" width="100" prop="grantedOn">
        <template slot-scope="{ row }">
          <div>
            {{ objectTypeFn(row.grantedOn, row.privilege) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属区域" :filters="tableFilters.regionRoleName" width="100" :filter-method="filterHandler" prop="regionRoleName" />
      <el-table-column label="名称" prop="name" min-width="180">
        <template slot-scope="{ row }">
          {{ formatTableName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="权限" min-width="160">
        <template slot-scope="{ row }">
          <el-tag v-for="(item, index) in row.privilege" :key="index" closable closablesize="medium" style="margin: 2px" @close="delRow({ rolename: row.name, privilege: item, grantedOn: row.grantedOn }, 'one')">
            {{ privilegeFn(item) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="{ row }">
          <el-button type="text" @click="delRow(row, 'row')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <el-button type="primary" @click="delRow('', 'all')">批量删除</el-button>
      <el-pagination background :pager-count="5" :page-size="params.maxResults" :page-sizes="[10, 20, 30, 50, 100]" layout="total,  prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>

    <el-dialog v-if="dialogVisible" title="添加数据权限" :visible.sync="dialogVisible" width="85%" append-to-body :close-on-click-modal="false" @close="closeAddDataRole">
      <div class="addDataRole">
        <el-card class="box-card">
          <el-descriptions :column="2">
            <el-descriptions-item label="角色名称">{{ info.roleName }}</el-descriptions-item>
            <el-descriptions-item label="角色ID">{{ info.roleId }}</el-descriptions-item>
            <el-descriptions-item label="角色描述">{{ info.comment }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <div class="selectType">
          <div class="label">请选择对象类型:&nbsp;&nbsp;</div>
          <el-select v-model="dataType" placeholder="请选择对象类型">
            <el-option v-for="item in optionsType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </div>
        <transferPage ref="transferPage" :object-type="dataType" />
        <div class="selelectRole">
          <div class="title">请选择具体的授予的权限</div>
          <div class="role">
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
            <el-checkbox-group v-model="roleList" @change="roleChange">
              <el-checkbox v-for="(item, index) in grantRole" :key="index" :label="item.label">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDial">取 消</el-button>
          <el-button type="primary" @click="addSubmit">保 存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { dataShowPrivileges, dataGrantPrivilegeToRole, dataRevokePrivilegeFromRolea } from '@/api/dataRole';
import transferPage from './transferPage';
import { mapGetters } from 'vuex';

const set2Filter = s => {
  const result = [];
  s.forEach(text => result.push({ text, value: text }));
  return result;
};
const privilegeObj = {
  'CREATE DATABASE': '创建库',
  'CREATE TABLE': '创建表',
  'DROP DATABASE': '删除库',
  'DESC DATABASE': '描述库',
  'ALTER DATABASE': '修改库',
  'ALTER TABLE': '修改表',
  'DROP TABLE': '删除表',
  'DESC TABLE': '描述表',
  'SELECT TABLE': '查询数据',
  'INSERT TABLE': '插入数据',
  'DESC CATALOG': '访问数据源',
  'DROP CATALOG': '删除数据源',
  'ALTER CATALOG': '编辑数据源'
};

export default {
  components: {
    transferPage
  },
  props: {
    info: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      isIndeterminate: true,
      checkAll: false,
      pageNum: 1,
      privilegesData: {},
      roleList: [],
      dataType: 'REGION',
      optionsType: [
        {
          value: 'REGION',
          label: '数据区域'
        },
        {
          value: 'DATABASE',
          label: '数据库'
        },
        {
          value: 'TABLE',
          label: '数据表'
        },
        {
          value: 'CATALOG',
          label: '外部数据源'
        }
      ],
      keyWord: '',
      tableData: [],
      total: 0,
      dialogVisible: false,
      params: {
        page: '',
        maxResults: 40
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    dobcomPrivilegesData() {
      return this.comPrivilegesData.slice((this.pageNum - 1) * 100, this.pageNum * 100);
    },
    comPrivilegesData() {
      const keyList = this.grantRole.map(({ value }) => value);

      let res = [];
      keyList.forEach(key => {
        this.privilegesData[key] && res.push(...this.privilegesData[key]);
      });
      res = Array.from(new Set(res));
      res = res.map(item => ({
        key: item,
        label: item
      }));
      return res;
    },
    grantRole() {
      const roleObj = {
        REGION: [{ label: '创建库', value: 'CREATE_DATABASE' }],
        DATABASE: [
          { label: '创建表', value: 'CREATE_TABLE' },
          { label: '删除库', value: 'DROP_DATABASE' },
          { label: '描述库', value: 'DESC_DATABASE' },
          { label: '修改库', value: 'ALTER_DATABASE' }
        ],
        TABLE: [
          { label: '修改表', value: 'ALTER_TABLE' },
          { label: '删除表', value: 'DROP_TABLE' },
          { label: '描述表', value: 'DESC_TABLE' },
          { label: '查询数据', value: 'SELECT_TABLE' },
          { label: '插入数据', value: 'INSERT_TABLE' }
        ],
        CATALOG: [
          { label: '访问数据源', value: 'DESC' },
          { label: '编辑数据源', value: 'DROP' },
          { label: '删除数据源', value: 'ALTER' }
        ]
      };
      return roleObj[this.dataType];
    },
    tableFilters() {
      const regionRoleName = new Set();
      const grantedOn = new Set();
      // const privilege = new Set();

      this.tableData.forEach(obj => {
        if ('grantedOn' in obj) grantedOn.add(obj.grantedOn);
        if ('regionRoleName' in obj) regionRoleName.add(obj.regionRoleName);
        // if ('privilege' in obj) privilege.add(obj.privilege);
      });

      return {
        regionRoleName: set2Filter(regionRoleName),
        grantedOn: set2Filter(grantedOn)
        // privilege: set2Filter(privilege)
      };
    }
  },
  watch: {
    dataType() {
      this.roleList = [];
    }
  },
  created() {
    this.getList();
  },
  methods: {
    roleChange(val) {
      const checkedCount = val.length;
      this.checkAll = checkedCount === this.grantRole.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.grantRole.length;
    },
    handleCheckAllChange(val) {
      this.roleList = val ? this.grantRole.map(({ label }) => label) : [];
      this.isIndeterminate = false;
    },
    formatTableName(row) {
      if (row.grantedOn === 'CATALOG') {
        return row.uuid;
      } else {
        return row.name;
      }
    },
    closeDial() {
      this.dialogVisible = false;
      this.closeAddDataRole();
    },
    closeAddDataRole() {
      this.roleList = [];
      this.checkAll = false;
      this.isIndeterminate = true;
    },
    getListFn() {
      this.params.page = '';
      this.getList();
    },
    objectTypeFn(type, privilege) {
      const res = this.optionsType.find(item => item.value === type) || {};
      if (type === 'CATALOG' && privilege[0].includes('DATABASE')) {
        return '数据区域';
      }
      return res.label || '- -';
    },
    privilegeFn(type) {
      return privilegeObj[type] || '- -';
    },
    addSubmit() {
      const transferData = this.$refs.transferPage.right.transferData.map(({ id }) => id);
      let message = '';
      if (transferData.length <= 0) {
        message = '请选择授权的数据';
        this.$message({
          type: 'warning',
          message
        });
        return;
      }
      if (this.roleList.length <= 0) {
        message = '请选择具体的授予的权限';
        this.$message({
          type: 'warning',
          message
        });
        return;
      }
      const data = {
        roleName: this.info.roleName,
        operation: this.roleList,
        objectNames: transferData
      };
      // 当选择外部数据源时，单独处理参数objectNames
      if (this.dataType === 'CATALOG') {
        data.objectNames = transferData.map(item => {
          const uuidItem = this.$refs.transferPage.originData.actors.find(item1 => {
            return item1.name === item;
          });
          return uuidItem.uuid;
        });
      }
      dataGrantPrivilegeToRole(data).then(res => {
        this.$message({
          type: 'success',
          message: '添加成功!'
        });
        this.dialogVisible = false;
        this.params.page = '';
        this.getList();
      });
    },
    getList() {
      const data = {
        projectId: this.userInfo.tenantName || 'shareit',
        roleName: this.info.roleName,
        objectName: this.keyWord,
        ...this.params,
        page: this.params.page,
        maxResults: this.params.maxResults
      };
      dataShowPrivileges(data).then(res => {
        const resData = res.data || [];
        this.total = res.total;
        const nameList = Array.from(new Set(resData.map(({ name }) => name)));
        const comData = [];
        nameList.forEach(item => {
          const data = resData.filter(({ name }) => item === name);
          const privilegeList = Array.from(new Set(data.map(({ privilege }) => privilege)));
          comData.push({
            grantedOn: data[0].grantedOn,
            name: item,
            privilege: privilegeList,
            regionRoleName: data[0].regionRoleName,
            uuid: data[0].uuid
          });
        });
        this.tableData = comData;
        // this.total = this.tableData.length;
      });
    },
    delRow(params, type) {
      this.$confirm('确定移除该权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const data = {
            roleName: this.info.roleName,
            roleInputs: []
          };
          if (type === 'one') {
            const res = [];
            res.push(privilegeObj[params.privilege]);
            data.roleInputs.push({
              objectName: [].concat(params.rolename),
              operation: res,
              objectType: params.grantedOn === 'REGION' ? 'CATALOG' : params.grantedOn
            });
          } else if (type === 'row') {
            const role = [];
            params.privilege.forEach(key => {
              role.push(privilegeObj[key]);
            });
            data.roleInputs.push({
              objectName: [].concat(params.name),
              operation: role,
              objectType: params.grantedOn === 'REGION' ? 'CATALOG' : params.grantedOn
            });
          } else if (type === 'all') {
            const selectList = this.$refs.tableData.selection;
            if (selectList.length <= 0) {
              this.$message({
                type: 'warning',
                message: '至少选择一项要删除的权限'
              });
              return;
            }
            const roleinputs = [];
            selectList.forEach(item => {
              const role = [];
              item.privilege.forEach(key => {
                role.push(privilegeObj[key]);
              });
              roleinputs.push({
                objectName: [].concat(item.name),
                operation: role,
                objectType: item.grantedOn === 'REGION' ? 'CATALOG' : item.grantedOn
              });
            });
            data.roleInputs = roleinputs;
          }
          dataRevokePrivilegeFromRolea(data).then(res => {
            this.params.page = '';
            this.getList();
            this.$message({
              type: 'success',
              message: '删除成功'
            });
          });
        })
        .catch(() => {});
    },
    handleSizeChange(val) {
      this.params.maxResults = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.page = val;
      this.getList();
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property]?.includes(value);
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  .filter {
    width: 35%;
  }
}
.footer {
  margin-top: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.addDataRole {
  margin-top: -5px;
  padding: 0 20px;
  .selectType {
    display: flex;
    align-content: center;
    height: 32px;
    margin-bottom: 10px;
    margin-top: 10px;
    .label {
      line-height: 32px;
      font-size: $global-font-size-16;
    }
  }
  .el-transfer {
    ::v-deep .el-transfer-panel {
      width: 280px;
    }
    .el-pagination {
      padding-top: 4px;
      display: flex;
      align-items: center;
      justify-content: end;
    }
  }
  .selelectRole {
    margin-top: 20px;
    .title {
      font-size: $global-font-size-16;
      margin-bottom: 10px;
    }
    .role {
      width: 75%;
      padding: 10px;
      margin: auto;
      border: 1px solid #e1e5ef;
      border-radius: 4px;
      text-align: center;
      .el-checkbox-group {
        display: inline-block;
        margin-left: 25px;
      }
    }
  }
  .dialog-footer {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
