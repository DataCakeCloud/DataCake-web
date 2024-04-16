<template>
  <el-dialog title="申请权限" :visible="visiable" width="55%" :close-on-click-modal="false" class="ope-dialog" @update:visible="dialogVisiable = $event">
    <el-descriptions v-if="Object.keys(perData).length" size="medium" :column="3">
      <el-descriptions-item label="申请用户组" label-class-name="ope-validate">
        {{ userGroup.name || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="申请用户组负责人">{{ viewHeader() }}</el-descriptions-item>
      <el-descriptions-item label="存储位置">{{ regionFormat(perData.region) || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所属业务">{{ perData.application || '-' }}</el-descriptions-item>
      <el-descriptions-item label="对象类型">{{ perData.db_name }}</el-descriptions-item>
      <el-descriptions-item label="对象名称" :span="2">{{ perData.table_name }}</el-descriptions-item>
      <el-descriptions-item label="申请权限信息" :span="3" label-class-name="ope-validate">
        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedOpes" class="checkbox-group" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in permissions" :key="item" :label="item">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </el-descriptions-item>
      <el-descriptions-item label="申请原因" :span="3" label-class-name="ope-validate">
        <el-input v-model="reason" :rows="3" type="textarea" placeholder="请输入申请原因" maxlength="50" show-word-limit style="width: 100%"></el-input>
      </el-descriptions-item>

      <!-- <el-descriptions-item label="权限保留周期" :span="3" label-class-name="ope-validate">
        <el-radio-group v-model="cycle">
          <el-radio v-for="(item, index) in cycleList" :key="index" :label="item.value">{{ item.name }}</el-radio>
        </el-radio-group>
      </el-descriptions-item> -->

      <!-- <el-descriptions-item label="共同申请人" :span="3">
        <el-select v-model="coApplicants" placeholder="请输入用户名，最多 10 个" clearable filterable multiple remote :remote-method="remoteMethod" :loading="ownerLoading" popper-class="custom-popper" style="width: 80%">
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.mobile }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-descriptions-item> -->
    </el-descriptions>
    <div class="level_info">
      <div class="title">申请数据表信息:</div>
      <TableInfo :table-id-list="[perData]" />
    </div>
    <div class="level_info">
      <div class="title">敏感级别说明:</div>
      <proveTable />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import proveTable from './ProveTable';
import TableInfo from './TableInfo';
import { grantPrivilegeToUser } from '@/api/metadata';
import { resourceSearch } from '@/api/cluster';
// import { getUserList } from '@/api/task';
import { mapGetters } from 'vuex';
const permissions = ['查询数据'];
export default {
  name: 'DataPermission',
  components: {
    proveTable,
    TableInfo
  },
  props: {
    visiable: {
      type: Boolean,
      required: true
    },
    listIndex: {
      type: Number,
      default: 0
    },
    perData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      cycleList: this.$t('data.cycle'),
      // ownerLoading: false,
      coApplicants: [],
      ownerList: [],
      searchValue: '',
      reason: '',
      submitLoading: false,
      dialogVisiable: this.visiable,
      regionList: this.$t('data.regionList'),
      checkAll: false,
      checkedOpes: ['查询数据'],
      permissions: permissions,
      isIndeterminate: true,
      userName: '',
      userGroup: {},
      scope: '',
      cycle: '5'
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud', 'currentUserGroup'])
  },
  watch: {
    visiable() {
      this.dialogVisiable = this.visiable;
      if (this.dialogVisiable) this.reason = '';
      else this.$emit('close', this.listIndex);
    },
    dialogVisiable(val) {
      this.$emit('update:visiable', val);
    }
  },
  created() {
    this.userName = this.userInfo.userId;
    this.scope = this.currentUserGroup.uuid;
    Object.assign(this.userGroup, this.currentUserGroup);
    this.isCloud && this.getRegion();
  },
  methods: {
    viewHeader() {
      return this.userGroup.ownerList?.join(',') || '-';
    },
    getRegion() {
      resourceSearch().then(res => {
        const data = res.data;
        this.regionList = data.list.map(item => {
          return { label: item.description || item.regionAlias, value: item.regionAlias };
        });
      });
    },
    handleCheckAllChange(val) {
      this.checkedOpes = val ? permissions : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.permissions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length;
    },
    regionFormat(region) {
      const obj = this.regionList.find(item => item.value === region);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    // remoteMethod(query, shareId) {
    //   if (query !== '') {
    //     this.ownerLoading = true;
    //     getUserList(query).then(res => {
    //       this.ownerLoading = false;
    //       const data = res.data;
    //       this.ownerList = data;
    //     });
    //   } else {
    //     this.ownerList = [];
    //   }
    // },
    cancel() {
      this.$emit('update:visiable', false);
    },

    ok() {
      if (!this.checkedOpes.length) {
        this.$message({
          type: 'warning',
          message: '请选择权限'
        });
        return;
      }
      if (!this.reason) {
        this.$message({
          type: 'warning',
          message: '请输入原因'
        });
        return;
      }
      if (!this.cycle) {
        this.$message({
          type: 'warning',
          message: '请选择周期'
        });
        return;
      }
      const operation = this.checkedOpes.includes('查询数据') ? [...this.checkedOpes, '描述表'] : [...this.checkedOpes];
      const params = {
        reason: this.reason,
        cycle: this.cycle,
        coApplicants: this.coApplicants.join(','),
        userName: this.userName || '',
        roleInputs: {
          objectName: [`${this.perData.region}.${this.perData.db_name}.${this.perData.table_name}:${this.perData.owner}`],
          operation,
          scope: [this.scope]
        }
      };

      this.submitLoading = true;
      grantPrivilegeToUser(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '申请权限成功'
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
.checkbox-group {
  display: inline-flex;
  margin-left: 20px;
}

.ope-dialog {
  ::v-deep {
    .ope-validate {
      &::before {
        display: inline-block;
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }
    .el-dialog__body {
      overflow: auto;
    }
  }
  .level_info {
    margin: 10px 0;
    .title {
      font-weight: 550;
      margin-bottom: 10px;
    }
  }
}
</style>
