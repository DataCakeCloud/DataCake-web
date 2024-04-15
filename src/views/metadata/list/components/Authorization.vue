<template>
  <el-dialog title="权限授权" :visible="visiable" width="45%" :close-on-click-modal="false" class="ope-dialog" @update:visible="dialogVisiable = $event">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>表基础信息</span>
      </div>
      <el-descriptions v-if="Object.keys(authoData).length" :column="3">
        <el-descriptions-item label="数据源位置">{{ regionFormat(authoData.region) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对象类型">{{ authoData.db_name }}</el-descriptions-item>
        <el-descriptions-item label="对象名称" :span="2">{{ authoData.table_name }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>授权信息</span>
      </div>
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
      <el-checkbox-group v-model="checkedOpes" class="checkbox-group" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="city in permissions" :key="city" :label="city">{{ city }}</el-checkbox>
      </el-checkbox-group>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>添加对象</span>
      </div>
      <el-descriptions v-if="Object.keys(authoData).length">
        <el-descriptions-item label="生效范围" :span="3">
          <el-select v-model="effectScope" placeholder="选择生效范围" @change="handleScope">
            <el-option v-for="(item, index) in scopeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>

          <el-select v-if="effectScope === 2" v-model="scopes" class="select_group" placeholder="请选择用户组" multiple clearable>
            <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.uuid"></el-option>
          </el-select>
          <el-tooltip v-if="effectScope === 2" class="item" effect="dark" content="您可以在用户管理模块中创建新的用户组" placement="top" style="margin-left: 5px">
            <i class="el-icon-info" style="cursor: pointer"></i>
          </el-tooltip>
        </el-descriptions-item>

        <el-descriptions-item label="权限保留周期" :span="3">
          <el-radio-group v-model="cycle">
            <el-radio v-for="(item, index) in cycleList" :key="index" :label="item.value">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <!-- <el-card>
      <div slot="header" class="clearfix">
        <span>通知对象</span>
      </div>
      <el-descriptions v-if="Object.keys(authoData).length">
        <el-descriptions-item label="是否钉钉通知用户">
          <el-radio-group v-model="flag" class="radio-group" :disabled="effectScope === 2">
            <el-radio :label="1">不通知</el-radio>
            <el-radio :label="2">通知</el-radio>
          </el-radio-group>
        </el-descriptions-item>
      </el-descriptions>
    </el-card> -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { batchGrantPrivilegeToUser } from '@/api/metadata';
import { resourceSearch } from '@/api/cluster';
import { getGroupPage } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
const permissions = ['查询数据', '修改表', '删除表', '描述表', '插入数据'];
export default {
  name: 'DataPermission',
  props: {
    visiable: {
      type: Boolean,
      required: true
    },
    listIndex: {
      type: Number,
      default: 0
    },
    authoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      groupOptions: [],
      searchValue: '',
      reason: '',
      dialogVisiable: this.visiable,
      regionList: this.$t('data.regionList'),
      cycleList: this.$t('data.cycle'),
      submitLoading: false,
      checkAll: false,
      checkedOpes: ['查询数据'],
      permissions: permissions,
      isIndeterminate: true,
      scopes: [],
      flag: 1,
      effectScope: 2,
      cycle: '2',
      userGroupList: [],
      scopeList: [
        // {
        //   name: '个人',
        //   value: 1
        // },
        {
          name: '用户组',
          value: 2
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud'])
  },
  watch: {
    visiable() {
      this.dialogVisiable = this.visiable;
      if (this.dialogVisiable) {
        this.scopes = [];
        this.checkedOpes = ['查询数据'];
      } else {
        this.$emit('close', this.listIndex);
      }
    },
    dialogVisiable(val) {
      this.$emit('update:visiable', val);
    }
  },
  created() {
    this.getGroupPage();
    this.isCloud && this.getRegion();
  },
  methods: {
    getGroupPage() {
      const params = {
        userId: JSON.parse(sessionStorage.getItem('userInfo')).userId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
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
    handleScope(val) {
      this.scopes = [];
      if (val === 2) this.flag = 1;
    },
    regionFormat(region) {
      const obj = this.regionList.find(item => item.value === region);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
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
      if (!this.scopes.length) {
        this.$message({
          type: 'warning',
          message: '请选择生效范围'
        });
        return;
      }
      const params = {
        owner: this.authoData.owner,
        type: 1,
        flag: this.flag,
        cycle: this.cycle,
        roleInputs: {
          objectName: [`${this.authoData.region}.${this.authoData.db_name}.${this.authoData.table_name}`],
          scope: this.scopes,
          operation: this.checkedOpes
        }
      };
      this.submitLoading = true;
      batchGrantPrivilegeToUser(params).then(res => {
        this.submitLoading = false;
        this.$message({
          type: 'success',
          message: '权限授权成功'
        });
        this.$emit('update:visiable', false);
      });
      this.$emit('trigger', this.resultList);
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.checkbox-group {
  display: inline-flex;
  margin-left: 20px;
}
.select_group {
  width: 60%;
  margin-left: 20px;
}

.ope-dialog {
  ::v-deep .ope-validate {
    &::before {
      display: inline-block;
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
}
</style>
