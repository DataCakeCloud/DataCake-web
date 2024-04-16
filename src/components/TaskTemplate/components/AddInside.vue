<template>
  <el-dialog title="添加内部依赖设置" :visible.sync="dialogVisible" width="500px" class="custom-dialog" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false">
    <el-form ref="ruleForm" class="ruleForm" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="前置任务" prop="task">
        <el-select v-model="ruleForm.task" placeholder="支持按任务id/任务名称/产出数据集搜索任务" popper-class="custom-popper" multiple filterable remote :remote-method="remoteMethod" :loading="loading" value-key="id" style="width: 390px">
          <el-option v-for="item in options" :key="item.id" :label="`${item.id} | ${item.name}`" :value="item">
            <el-tooltip effect="dark" placement="left-end">
              <div slot="content">{{ item.id }} | {{ item.name }}<br />{{ item.metadataId }}</div>
              <div class="ellipsis" style="max-width: 350px">
                {{ item.id }} | {{ item.name }}
                <div class="ellipsis" style="font-size: 12px; color: #909399">{{ item.metadataId }}</div>
              </div>
            </el-tooltip>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getTasks } from '@/api/task';

export default {
  name: 'AddInside',
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        task: []
      },
      rules: {
        task: [{ required: true, message: '请选择任务', trigger: ['blur', 'change'] }]
      },
      loading: false,
      options: []
    };
  },
  methods: {
    showWin() {
      this.ruleForm.task = [];
      this.dialogVisible = true;
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        const formData = new FormData();
        formData.append('name', query);
        getTasks(formData).then(res => {
          const data = res.data;
          this.loading = false;
          this.options = data;
        });
      }
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.$emit('save', this.ruleForm.task);
          this.dialogVisible = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>
