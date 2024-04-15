<template>
  <el-dialog :title="isEdit ? '编辑用户组' : '创建用户组'" :visible.sync="dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="用户组名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入用户组名称" maxlength="64"></el-input>
        <div class="tip">允许英文字母、数字或'_'。字符数应小于等于64个</div>
      </el-form-item>
      <el-form-item label="用户组描述">
        <el-input v-model="ruleForm.description" placeholder="请输入用户组描述" type="textarea" :rows="4"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addGroup, updateGroup } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
export default {
  name: 'WinAddGroup',
  props: {
    currentSelection: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入用户组名称', trigger: 'change' }]
      },
      isEdit: false,
      btnDisabled: false
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    showWin(row) {
      this.dialogVisible = true;
      if (row) {
        this.isEdit = true;
        this.ruleForm.id = row.id;
        this.ruleForm.name = row.name;
        this.ruleForm.description = row.description;
        delete this.ruleForm.tenantId;
        delete this.ruleForm.parentId;
      } else {
        this.ruleForm.tenantId = this.currentSelection.tenantId;
        this.ruleForm.parentId = this.currentSelection.id;
      }
    },
    resetForm() {
      this.isEdit = false;
      this.$refs.ruleForm.resetFields();
      this.ruleForm.id = JSON.parse(sessionStorage.getItem('userInfo')).tenantId;
      this.ruleForm.description = '';
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          let actionUrl;
          if (this.isEdit) {
            actionUrl = updateGroup(this.ruleForm);
          } else {
            actionUrl = addGroup(this.ruleForm);
          }
          actionUrl
            .then(res => {
              const data = res.data;
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: this.isEdit ? '编辑成功' : '新建成功'
              });
              this.$emit('updateList', data);
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
  line-height: normal;
}
</style>
