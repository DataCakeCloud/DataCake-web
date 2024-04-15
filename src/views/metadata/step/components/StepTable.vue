<template>
  <el-tabs class="step-table">
    <el-tab-pane :label="label">
      <div class="align-r mb10">
        <el-button type="primary" size="mini" :disabled="disabled" @click="addRow">添加</el-button>
      </div>
      <el-form ref="ruleForm" :model="ruleForm">
        <el-table :data="ruleForm.data" class="table" stripe>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="name" label="字段名称" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'data.' + scope.$index + '.name'" :rules="[{ required: true, message: '请输入字段名称', trigger: 'blur' }]">
                <el-input v-model="scope.row.name" placeholder="填写字段名称" :disabled="disabled" clearable></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="字段类型" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'data.' + scope.$index + '.type'" :rules="[{ required: true, message: '请选择字段类型', trigger: 'change' }]">
                <el-select v-model="scope.row.type" placeholder="选择字段类型" :disabled="disabled" clearable>
                  <el-option v-for="item in typeList" :key="item" :value="item" :label="item"></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="字段描述" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment" placeholder="填写字段描述" :disabled="disabled"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="80" align="center">
            <template slot-scope="scope">
              <el-button type="text" :disabled="disabled" @click="delRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
export default {
  name: 'StepTable',
  props: {
    label: {
      type: String,
      default: '字段'
    },
    name: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    typeList: {
      type: Array,
      default: () => {
        return ['STRING', 'BIGINT', 'DECIMAL(22,6)', 'TIMESTAMP'];
      }
    }
  },
  data() {
    return {
      ruleForm: {
        data: this.data
      }
      // typeList: ['STRING', 'BIGINT', 'DECIMAL(22,6)', 'TIMESTAMP']
    };
  },
  watch: {
    data(newV, oldV) {
      this.ruleForm.data = newV;
    }
  },
  methods: {
    addRow() {
      this.$emit('add', this.name);
    },
    delRow(index) {
      this.$emit('del', this.name, index);
    }
  }
};
</script>
<style lang="scss" scoped>
.step-table {
  margin-bottom: 20px;
  ::v-deep .el-tabs__content {
    padding: 0 20px;
  }
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
}
</style>
