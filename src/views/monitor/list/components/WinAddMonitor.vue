<template>
  <el-dialog title="新增监控" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="80px">
      <!-- <el-form-item label="监控类型" prop="type">
        <el-radio-group v-model="ruleForm.type" disabled>
          <el-radio :label="0">SLA</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="数据集" required>
        <el-row :gutter="5">
          <el-col :span="6">
            <el-form-item prop="region">
              <el-select v-model="ruleForm.region" placeholder="请选择分区" clearable @change="changeRegion">
                <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="db">
              <el-select v-model="ruleForm.db" placeholder="请选择数据库" clearable filterable default-first-option @change="changeDb">
                <el-option v-for="item in dbList" :key="item.name" :value="item.name" :label="item.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item prop="table">
              <el-select v-model="ruleForm.table" placeholder="请选择数据表" clearable filterable default-first-option>
                <el-option v-for="item in tableList" :key="item.name" :value="item.name" :label="item.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="tips">目前仅支持 hive 表</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getDataSetList } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  name: 'WinAddMonitor',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        type: 0,
        region: '',
        db: '',
        table: '',
        guid: ''
      },
      rules: {
        // type: [{ required: true, message: '请选择监控类型', trigger: 'change' }],
        region: [{ required: true, message: '请选择分区', trigger: 'change' }],
        db: [{ required: true, message: '请选择数据库', trigger: 'change' }],
        table: [{ required: true, message: '请选择数据集', trigger: 'change' }]
      },
      regionList: tools.regionList,
      dbList: [],
      tableList: [],
      btnDisabled: false
    };
  },
  watch: {
    'ruleForm.table'(val) {
      const guid = this.tableList.find(e => e.name === val)['guid'];
      this.ruleForm.guid = guid;
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
  },
  methods: {
    showWin() {
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    changeRegion(value) {
      this.dbList = [];
      if (value) {
        getDataSetList({
          region: value,
          type: 'hive',
          metaFlag: 'AIRBYTE'
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.dbList = data.data;
          }
        });
      }
    },
    changeDb(value) {
      this.tableList = [];
      if (value) {
        getDataSetList({
          region: this.ruleForm.region,
          type: 'hive',
          db: value,
          metaFlag: 'AIRBYTE'
        }).then(res => {
          const data = res.data;
          if (data.data) {
            this.tableList = data.data;
          }
        });
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          sessionStorage.setItem('SLA', JSON.stringify(this.ruleForm));
          sessionStorage.setItem('monitorParams', JSON.stringify(this.$parent.params));
          this.$router.push({ name: 'MonitorConfigInfo' });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.tips {
  color: #909399;
}
</style>
