<template>
  <el-dialog title="启动" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="应用版本" prop="tagId">
        <el-select v-model="ruleForm.tagId" placeholder="请选择应用版本" clearable>
          <el-option v-for="item in appVersionList" :key="item.id" :label="item.displayVersion" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="State" prop="savepointId">
        <el-select v-model="ruleForm.savepointId" placeholder="请选择State" clearable @change="changeSavePoint">
          <el-option :value="-1" label="None"></el-option>
          <el-option-group v-for="(group, key) in savePointList" :key="key" :label="key">
            <el-option v-for="item in group" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.savepoint && ruleForm.savepoint.createTime" label="CreateTime">
        <span>{{ $utils.parseTime(ruleForm.savepoint.createTime) }}</span>
      </el-form-item>
      <el-form-item v-if="ruleForm.savepoint && ruleForm.savepoint.description" label="Description">
        <span>{{ ruleForm.savepoint.description }}</span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getVersionList, getSnapshotList, startTask } from '@/api/taskDetail';

export default {
  name: 'WinStart',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        tagId: '',
        savepoint: '',
        savepointId: ''
      },
      rules: {
        tagId: [{ required: true, message: '请选择Version', trigger: ['blur', 'change'] }],
        savepointId: [{ required: true, message: '请选择Savepoint', trigger: ['blur', 'change'] }]
      },
      appVersionList: [],
      savePointList: [],
      queryId: '',
      btnDisabled: false
    };
  },
  methods: {
    init() {
      getVersionList({
        taskId: this.queryId
      }).then(res => {
        const data = res.data;
        this.appVersionList = data;
      });
      getSnapshotList({
        taskId: this.queryId
      }).then(res => {
        const data = res.data;
        this.savePointList = data;
      });
    },
    showWin(id) {
      this.queryId = id;
      this.init();
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    changeSavePoint(value) {
      const allList = Object.values(this.savePointList).flat();
      this.ruleForm.savepoint = allList.find(item => item.id === value);
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          startTask({
            id: this.queryId,
            tagId: this.ruleForm.tagId,
            savepointId: this.ruleForm.savepointId
          }).then(data => {
            // this.$parent.init();
            this.$emit('save');
            this.btnDisabled = false;
            this.dialogVisible = false;
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.ruleForm {
  width: 340px;
  margin: 0 auto;
}
</style>
