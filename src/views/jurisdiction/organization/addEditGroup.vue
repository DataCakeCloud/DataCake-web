<template>
  <el-dialog :title="dialogData.type === 'edit' ? '编辑组织架构' : '新建组织'" :visible.sync="dialogData.dialogVisible" width="600px" class="custom-dialog" :close-on-click-modal="false">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="组织名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入组织名称"></el-input>
        <!-- <div class="tip">允许英文字母、数字或'_'。字符数应小于等于64个</div> -->
      </el-form-item>
      <el-form-item label="负责人" prop="director">
        <el-select
          v-model="ruleForm.director"
          placeholder="请输入负责人，支持模糊搜索用户列表"
          size="small"
          clearable
          filterable
          remote
          allow-create
          default-first-option
          :remote-method="remoteMethod"
:loading="ownerLoading"
          class="search-input"
          popper-class="custom-popper"
        >
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="组织描述">
        <el-input v-model="ruleForm.description" placeholder="请输入组织描述" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogData.dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getUserList } from '@/api/task';
import { addGroup, updateGroup } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
export default {
  name: 'WinAddGroup',
  props: {
    dialogData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    // var validatePass = (rule, value, callback) => {
    //   const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
    //   if (!reg.test(value) || value.length > 64) {
    //     callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符'));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      ownerLoading: false,
      ownerList: [],
      ruleForm: {
        name: '',
        director: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入组织名称', trigger: ['change', 'blur'] }]
      },
      btnDisabled: false
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    'dialogData.dialogVisible'(v) {
      if (v) {
        if (this.dialogData.type === 'edit') {
          this.ruleForm.tenantId = '';
          this.ruleForm.parentId = '';
          this.ruleForm.id = this.dialogData.tableRow.id;
          this.ruleForm.name = this.dialogData.tableRow.name;
          this.ruleForm.director = this.dialogData.tableRow.director;
          this.ruleForm.description = this.dialogData.tableRow.description;
        } else {
          this.ruleForm.tenantId = this.dialogData.tableRow ? this.dialogData.tableRow.tenantId : this.userInfo.tenantId;
          this.ruleForm.parentId = this.dialogData.tableRow ? this.dialogData.tableRow.id : null;
          this.ruleForm.id = '';
          this.ruleForm.name = '';
          this.ruleForm.director = '';
          this.ruleForm.description = '';
        }
      }
    }
  },
  methods: {
    remoteMethod(query) {
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
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          let actionUrl;
          if (this.dialogData.type === 'edit') {
            actionUrl = updateGroup(this.ruleForm);
          } else {
            actionUrl = addGroup(this.ruleForm);
          }
          actionUrl
            .then(res => {
              const data = res.data;
              this.dialogData.dialogVisible = false;
              this.$message({
                type: 'success',
                message: this.dialogData.type === 'edit' ? '编辑成功' : '新建成功'
              });
              if (this.dialogData.type === 'edit') {
                // 前段直接改变表单数据，以维持表单现有展开项
                this.dialogData.tableRow.name = this.ruleForm.name;
                this.dialogData.tableRow.director = this.ruleForm.director;
                this.dialogData.tableRow.description = this.ruleForm.description;
              } else {
                this.$emit('updateList', data);
              }
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
.search-input {
  width: 100% !important;
}
</style>
