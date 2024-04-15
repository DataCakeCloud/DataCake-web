<template>
  <el-dialog v-loading="loading" title="新建监控" :visible="visible" width="45%" :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <el-form ref="form" :model="params" :rules="rules" label-position="left" label-width="80px" class="module">
      <el-form-item prop="name" label="监控名称">
        <el-input v-model="params.name" :disabled="!!Object.keys(editData).length" placeholder="请输入监控名称" style="width: 80%"></el-input>
      </el-form-item>
      <el-form-item prop="type" label="监控类型">
        <el-radio-group v-model="params.type" :disabled="!!Object.keys(editData).length" @change="handleType">
          <template v-for="(item, index) in typeList">
            <el-radio :key="index" :label="item.value">{{ item.name }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="params.type === 1" prop="monitorLevel" label="监控维度">
        <el-radio-group v-model="params.monitorLevel" :disabled="!!Object.keys(editData).length" @change="handleScope">
          <template v-for="(item, index) in dimensionList">
            <el-radio v-if="item.value < 4" :key="index" :label="item.value">{{ item.name }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-else prop="monitorLevel" label="监控维度">
        <el-radio-group v-model="params.monitorLevel" :disabled="!!Object.keys(editData).length" @change="handleScope">
          <template v-for="(item, index) in dimensionList">
            <el-radio :key="index" :label="item.value">{{ item.name }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="params.type === 1" prop="frep" label="监控频率">
        <el-select v-model="params.frep" disabled multiple placeholder="频率">
          <el-option label="每天" :value="'0'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-else-if="params.type === 2 || params.type === 3 || params.type === 4" prop="frep" label="监控频率">
        <el-select v-model="params.frep" clearable filterable multiple collapse-tags placeholder="频率" style="width: 50%">
          <template v-for="(item, index) in dayList">
            <el-option v-if="index > 0" :key="index" :label="item.name" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <template>
        <el-form-item prop="dpList" label="监控范围">
          <el-select v-if="params.monitorLevel === 1" v-model="params.dpList" clearable filterable multiple collapse-tags placeholder="未选择监控全部部门" style="width: 50%">
            <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-select v-if="params.monitorLevel === 2" v-model="params.puList" clearable filterable multiple collapse-tags placeholder="未选择监控全部pu" style="width: 50%">
            <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-select v-if="params.monitorLevel === 3" v-model="params.ownerList" clearable filterable multiple collapse-tags placeholder="未选择监控全部owner" style="width: 50%">
            <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-select v-if="params.monitorLevel === 4" v-model="params.jobList" clearable filterable multiple collapse-tags placeholder="未选择监控全部任务" style="width: 50%">
            <el-option v-for="(item, index) in trendList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item v-if="params.type !== 1" prop="ratio" label="告警阈值">
        <el-input v-model="params.ratio" placeholder="请输入阈值" style="width: 50%"><template slot="append">%</template></el-input>
      </el-form-item>
      <el-form-item prop="noticeType" label="通知方式">钉钉</el-form-item>
      <el-form-item prop="noticePersons" label="通知范围">
        <el-select v-model="params.noticePersons" placeholder="请输入用户ID, 可多选" clearable filterable multiple remote :remote-method="remoteMethod" :loading="ownerLoading" popper-class="custom-popper" style="width: 80%">
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 420px; word-break: break-all">({{ item.name }})-{{ item.mobile }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listDictionary, saveEdit } from '@/api/cost';
import { getUserList } from '@/api/task';
import { mapGetters } from 'vuex';
export default {
  name: 'CreateMonitor',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    editData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      report: {},
      loading: false,
      dialogVisiable: this.visible,
      ownerLoading: false,
      ownerList: [],
      dictType: 1,
      submitLoading: false,
      defaultParams: {
        createShareitId: null,
        name: '',
        type: 1,
        monitorLevel: 1,
        dpList: [],
        puList: [],
        ownerList: [],
        jobList: [],
        ratio: '0',
        noticeType: 1,
        frep: ['0'],
        noticePersons: [],
        scopeUnit: 1
      },
      params: {
        createShareitId: null,
        name: '',
        type: 1,
        monitorLevel: 1,
        dpList: [],
        puList: [],
        ownerList: [],
        jobList: [],
        ratio: '0',
        noticeType: 1,
        frep: ['0'],
        noticePersons: [],
        scopeUnit: 1
      },
      typeList: this.$t('cost.typeList'),
      dimensionList: this.$t('cost.dimensionList'),
      trendList: [],
      dayList: this.$t('cost.dayList'),
      scopeList: this.$t('cost.scopeList'),
      rules: {
        name: [{ required: true, message: '请输入监控名称', trigger: ['blur', 'change'] }],
        type: [{ required: true, message: '请选择监控类型', trigger: ['blur', 'change'] }],
        monitorLevel: [{ required: true, message: '请输入选择监控维度', trigger: ['blur', 'change'] }],
        ratio: [{ required: true, message: '请输入告警阈值', trigger: ['blur', 'change'] }],
        frep: [{ required: true, message: '请选择监控频率', trigger: ['blur', 'change'] }],
        noticePersons: [{ required: true, message: '请输入通知人', trigger: ['blur', 'change'] }]
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
      if (!this.dialogVisiable) {
        this.params = Object.assign({}, this.defaultParams);
        this.dictType = 1;
      } else {
        this.params = Object.assign({}, this.params, this.editData);
        if (!Object.keys(this.editData).length) this.listDictionary();
      }
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    },
    editData: {
      handler(val) {
        if (!Object.keys(val).length) return;
        if (val.dpList && val.dpList.length) {
          this.dictType = 1;
        } else if (val.puList && val.puList.length) {
          this.dictType = 2;
        } else if (val.ownerList && val.ownerList.length) {
          this.dictType = 3;
        } else if (val.jobList && val.jobList.length) {
          this.dictType = 4;
        }
        this.listDictionary();
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.defaultParams.createShareitId = this.userInfo.userId;
    this.params.createShareitId = this.userInfo.userId;
  },
  methods: {
    handleScope(val) {
      this.dictType = val;
      this.listDictionary();

      this.params.dpList = [];
      this.params.puList = [];
      this.params.ownerList = [];
      this.params.jobList = [];
    },
    listDictionary() {
      const params = {
        type: this.dictType,
        shareitId: this.userInfo.userId || ''
      };
      listDictionary(params).then(res => {
        const data = res.data;
        this.trendList = data || [];
      });
    },
    remoteMethod(query, shareId) {
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
    handleType(val) {
      if (val === 1) {
        this.params.ratio = '0';
        this.params.frep = ['0'];
      } else {
        this.params.ratio = '';
        this.params.frep = [];
      }
    },
    cancel() {
      this.$emit('update:visible', false);
    },
    ok() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.params);
          this.submitLoading = true;
          saveEdit(params).then(data => {
            this.submitLoading = false;
            this.$message({
              type: 'success',
              message: '新建监控成功'
            });
            this.$emit('update:visible', false);
            this.$emit('updateList');
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
