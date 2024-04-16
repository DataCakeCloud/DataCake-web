<template>
  <el-dialog title="批量申请权限" :visible="visiable" width="55%" :close-on-click-modal="false" class="ope-dialog" @update:visible="dialogVisiable = $event">
    <!-- 筛选 -->
    <!-- <div class="tips">Tips：ue1=AWS 美东 sg1=AWS新加坡 sg2=华为新加坡</div> -->
    <div class="usergroup_info">
      <div class="usergroup_item">
        <span class="label">申请用户组: </span>
        <span>{{ userGroup.name || '-' }}</span>
      </div>
      <div class="usergroup_item">
        <span class="label">申请用户组负责人: </span>
        <span>{{ viewHeader() }}</span>
      </div>
    </div>
    <el-form :model="params" label-position="left" label-width="120px">
      <el-form-item prop="roleInputs.objectName" label="表名">
        <el-select
          v-model="params.roleInputs.objectName"
          placeholder="请输入表名, 最多支持20个"
          clearable
          filterable
          multiple
          remote
          :remote-method="remoteMethod"
          :loading="tableLoading"
          popper-class="custom-popper"
style="width: 100%"
          @change="changeTable"
        >
          <el-option v-for="item in tableList" :key="item.table_name" :value="`${item.region}.${item.db_name}.${item.table_name}:${item.owner}:${item.id}`" :label="`${item.title}`">
            <div style="max-width: 420px; word-break: break-all">{{ item.title }}</div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="roleInputs.operation" label="权限选择">
        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="params.roleInputs.operation" class="checkbox-group" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in permissions" :key="item" :label="item">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item prop="reason" label="原因">
        <el-input v-model="params.reason" :rows="3" type="textarea" placeholder="请输入您申请表的理由，最多输入50个字" maxlength="50" show-word-limit style="width: 100%"></el-input>
      </el-form-item>

      <!-- <el-form-item prop="cycle" label="权限保留周期">
        <el-radio-group v-model="params.cycle">
          <el-radio v-for="(item, index) in cycleList" :key="index" :label="item.value">{{ item.name }}</el-radio>
        </el-radio-group>
      </el-form-item> -->

      <!-- <el-form-item prop="coApplicants" label="共同申请人">
        <el-select v-model="params.coApplicants" placeholder="请输入用户名，最多 10 个" clearable filterable multiple remote :remote-method="remoteMethodPerson" :loading="ownerLoading" popper-class="custom-popper" style="width: 100%">
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.mobile }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-form-item> -->
    </el-form>
    <div class="level_info">
      <div class="title">申请数据表信息:</div>
      <div class="content">
        <TableInfo :table-id-list="tableIdList" />
      </div>
    </div>
    <div class="level_info">
      <div class="title">敏感级别说明:</div>
      <div class="content">
        <ProveTable />
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ProveTable from './ProveTable';
import TableInfo from './TableInfo';
import { grantPrivilegeToUser, getTableList } from '@/api/metadata';
import { getUserList } from '@/api/task';
import { mapGetters } from 'vuex';
const permissions = ['查询数据'];
export default {
  name: 'DataPermission',
  components: {
    ProveTable,
    TableInfo
  },
  props: {
    visiable: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      searchValue: '',
      ownerLoading: false,
      submitLoading: false,
      tableLoading: false,
      dialogVisiable: this.visiable,
      checkAll: false,
      permissions: permissions,
      isIndeterminate: true,
      tableList: [],
      cycleList: this.$t('data.cycle'),
      ownerList: [],
      scope: '',
      params: {
        cycle: '5',
        coApplicants: [],
        reason: '',
        userName: '',
        roleInputs: {
          objectName: [],
          operation: ['查询数据']
        }
      },
      userGroup: {},
      tableIdList: [],
      handelTableList: []
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'currentUserGroup'])
  },
  watch: {
    visiable() {
      this.dialogVisiable = this.visiable;
      if (this.dialogVisiable) {
        this.params.roleInputs.objectName = [];
        this.params.roleInputs.operation = ['查询数据'];
        this.params.reason = '';
        this.params.cycle = '5';
        this.params.coApplicants = [];
      } else {
        this.tableIdList = [];
        this.handelTableList = [];
        this.$emit('close');
      }
    },
    dialogVisiable(val) {
      this.$emit('update:visiable', val);
    }
  },
  created() {
    this.params.userName = this.userInfo.userId;
    this.scope = this.currentUserGroup.uuid || '';
    Object.assign(this.userGroup, this.currentUserGroup);
  },
  methods: {
    viewHeader() {
      return this.userGroup.ownerList?.join(',') || '-';
    },
    changeTable(data) {
      const res = [];
      data.forEach(item => {
        const str = item.split(':')[0];
        const currentTableInfo = this.handelTableList.find(v => {
          return `${v.region}.${v.db_name}.${v.table_name}` === str;
        });
        if (currentTableInfo) res.push(currentTableInfo);
      });

      this.$set(this, 'tableIdList', res);
    },
    handleCheckAllChange(val) {
      this.params.roleInputs.operation = val ? permissions : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.permissions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length;
    },
    remoteMethod(query, shareId) {
      if (query !== '') {
        this.tableLoading = true;
        getTableList({
          userId: this.userInfo.userId,
          keyWord: query,
          pageNum: 1,
          pageSize: 10
        }).then(res => {
          this.tableLoading = false;
          const data = res.data;
          this.tableList = data.results || [];
          this.handelTableList.push(...this.tableList);
        });
      } else {
        // this.tableList = [];
      }
    },
    remoteMethodPerson(query, shareId) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    cancel() {
      this.$emit('update:visiable', false);
    },

    ok() {
      if (!this.params.roleInputs.objectName.length) {
        this.$message({
          type: 'warning',
          message: '请输入表名'
        });
        return;
      }
      if (!this.params.roleInputs.operation.length) {
        this.$message({
          type: 'warning',
          message: '请选择权限'
        });
        return;
      }
      if (!this.params.reason) {
        this.$message({
          type: 'warning',
          message: '请输入原因'
        });
        return;
      }
      if (!this.params.cycle) {
        this.$message({
          type: 'warning',
          message: '请选择周期'
        });
        return;
      }

      this.submitLoading = true;
      const operation = this.params.roleInputs.operation.includes('查询数据') ? [...this.params.roleInputs.operation, '描述表'] : [...this.params.roleInputs.operation];
      const params = Object.assign({}, this.params, {
        coApplicants: this.params.coApplicants.join(','),
        roleInputs: {
          ...this.params.roleInputs,
          operation,
          scope: [this.scope]
        }
      });
      grantPrivilegeToUser(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '批量申请权限成功'
          });
          this.$emit('update:visiable', false);
        })
        .finally(() => {
          this.submitLoading = false;
        });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
// .tips {
//   color: #333;
//   height: 40px;
//   line-height: 40px;
//   margin-left: 120px;
//   font-size: $global-font-size-14;
// }
.usergroup_info {
  display: flex;
  margin-left: 120px;
  margin-bottom: 10px;
  .usergroup_item {
    margin-right: 20px;
  }
}
.checkbox-group {
  display: inline-block;
  margin-left: 20px;
}
.level_info {
  margin: 10px 0;
  .title {
    font-weight: 550;
    margin-bottom: 10px;
  }
  .content {
    padding-left: 20px;
  }
}
</style>
