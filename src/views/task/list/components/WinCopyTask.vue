<template>
  <el-dialog title="复制任务" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="任务名称" prop="name" :show-message="false">
        <el-input v-model="ruleForm.name" placeholder="请输入任务名称" :maxlength="['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(templateCode) ? 45 : 60" clearable></el-input>
        <span class="tip" :style="{ color: !showTip ? '#ff5656' : '' }">{{ nameText }}</span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { copyTask } from '@/api/task';

export default {
  name: 'WinCopyTask',
  data() {
    return {
      dialogVisible: false,
      showTip: true,
      ruleForm: {
        id: '',
        name: ''
      },
      rules: {
        // name: [
        //   // { required: true, message: '请输入任务名称', trigger: ['blur', 'change'] },
        //   { validator: validatePass, trigger: ['blur', 'change'] }
        // ]
      },
      templateCode: '',
      btnDisabled: false
    };
  },
  computed: {
    nameText() {
      let text = '名字只能包含a-z,A-Z,0-9或-或_；开始结尾需为字符，最多60个字符';
      if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(this.templateCode)) {
        text = '名字只能包含a-z,A-Z,0-9或-；开始结尾需为字符，最多45个字符';
      }
      return text;
    },
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
    }
  },
  methods: {
    showWin(row) {
      this.ruleForm.id = row.id;
      this.templateCode = row.templateCode;
      let validatePass;
      if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(this.templateCode)) {
        this.ruleForm.name = row.name + '-copy';
        validatePass = (rule, value, callback) => {
          const reg = /^[a-zA-Z]([-a-zA-Z0-9]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)*$/;
          if (!reg.test(value)) {
            this.showTip = false;
            callback(new Error('名字只能包含a-z,A-Z,0-9或-；开始需为字符，最多60个字符'));
          } else {
            this.showTip = true;
            callback();
          }
        };
      } else {
        this.ruleForm.name = row.name + '_copy';
        validatePass = (rule, value, callback) => {
          const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
          if (!reg.test(value)) {
            this.showTip = false;
            callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符'));
          } else {
            this.showTip = true;
            callback();
          }
        };
      }
      this.rules = {
        name: [{ validator: validatePass, trigger: ['blur', 'change'] }]
      };
      this.dialogVisible = true;
      this.btnDisabled = false;
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          copyTask({
            id: this.ruleForm.id,
            name: this.ruleForm.name
          })
            .then(data => {
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: '操作成功'
              });
              this.$parent.getTaskListByPage();
            })
            .finally(() => {
              this.btnDisabled = false;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.tip {
  font-size: $global-font-size-12;
  color: #aaa;
}
</style>
