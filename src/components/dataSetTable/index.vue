<template>
  <div class="step-table">
    <div v-if="title" class="step-table-title">{{ title }}</div>
    <el-table :max-height="maxHeight" :data="tableData">
      <el-table-column v-for="c in cols" :key="c.key" :label="c.label">
        <template slot-scope="scope">
          <div :class="{ 'is-err': c.required && isErr(c, scope.row) }">
            <template v-if="isAppending(scope.$index) && !c.disabled">
              <el-select v-if="c.selectEle" v-model="appendingData[c.key]" placeholder="请选择" class="block">
                <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <el-input v-else v-model="appendingData[c.key]" />
            </template>
            <template v-else-if="isEditing(scope.row) && !c.disabled">
              <el-select v-if="c.selectEle" v-model="editingData[c.key]" placeholder="请选择" class="block">
                <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <el-input v-else v-model="editingData[c.key]" />
            </template>
            <template v-else>{{ scope.row[c.key] }}</template>
          </div>
          <!-- <div v-if="c.required && err" class="err-tips">{{ err }}</div> -->
        </template>
      </el-table-column>
      <el-table-column v-if="!disabled" label="操作">
        <template slot-scope="scope">
          <template v-if="isAppending(scope.$index)">
            <el-button type="text" @click="submit(scope.$index)">添加</el-button>
          </template>
          <template v-else-if="isEditing(scope.row)">
            <el-button type="text" @click="submit(scope.$index)">确认</el-button>
            <el-button type="text" @click="cancel">取消</el-button>
          </template>
          <template v-else>
            <el-button :disabled="scope.$index < 1" type="text" @click="move(scope.$index, scope.$index - 1)">上移</el-button>
            <el-button :disabled="scope.$index > data.length - 2" type="text" @click="move(scope.$index, scope.$index + 1)">下移</el-button>
            <el-button type="text" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" @click="remove(scope.$index)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
const required = true;
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    cols: {
      type: Array,
      default() {
        return [];
      },
      required
    },
    maxHeight: {
      type: String,
      default: '400'
    },
    data: {
      type: Array,
      default() {
        return [];
      },
      required
    }
  },
  data() {
    return {
      editingData: this.createEmptyCol(),
      appendingData: this.createEmptyCol(),
      appendErr: false,
      typeOptions: [
        {
          value: 'STRING',
          label: 'STRING'
        },
        {
          value: 'BIGINT',
          label: 'BIGINT'
        },
        {
          value: 'DECIMAL(22,6)',
          label: 'DECIMAL(22,6)'
        },
        {
          value: 'TIMESTAMP',
          label: 'TIMESTAMP'
        }
      ]
    };
  },
  computed: {
    tableData() {
      if (this.disabled) return this.data;
      return this.data.concat({ ...this.appendingData, index: this.data.length });
    },
    appendNotEmpty() {
      let notEmpty = false;
      this.cols.forEach(col => {
        if (col.key !== 'index' && this.appendingData[col.key]) {
          notEmpty = true;
        }
      });
      return notEmpty;
    }
  },
  methods: {
    isErr(c, row) {
      return (this.isAppending(row.index) ? this.appendErr : true) && c.required && !row[c.key];
    },
    isEditing(row) {
      return row.index === this.editingData.index;
    },
    isAppending(index) {
      if (this.disabled) return false;
      return index === this.data.length;
    },
    move(sourceIndex, targetIndex) {
      const { data } = this;
      const [source] = data.splice(sourceIndex, 1);
      data.splice(targetIndex, 0, source);
    },
    remove(index) {
      this.data.splice(index, 1);
    },
    edit(row) {
      this.editingData = { ...row };
    },
    submit(index) {
      if (this.isAppending(index)) {
        if (this.validate(this.appendingData)) return (this.appendErr = true);
        this.data.push({ ...this.appendingData, index: `${this.data.length}` });
        this.appendErr = false;
        this.appendingData = this.createEmptyCol();
      } else {
        this.data.splice(index, 1, { ...this.editingData });
        this.cancel();
      }
    },
    cancel() {
      this.editingData = this.createEmptyCol();
    },
    createEmptyCol() {
      return this.cols.reduce((obj, c) => ({ [c.key]: '' }), {});
    },
    validateAll() {
      let hasErr = false;
      if (this.appendNotEmpty || !this.data.length) {
        this.submit(this.data.length);
        hasErr = this.appendErr;
      }
      hasErr = hasErr || !!this.data.find(dt => this.validate(dt));
      return hasErr;
    },
    validate(row) {
      return !!this.cols.find(col => this.isErr(col, row));
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.step-table {
  .is-err {
    ::v-deep .el-input__inner {
      border-color: red;
    }
  }
  margin-bottom: 32px;
  .block {
    display: block;
  }
  &-title {
    margin-bottom: 16px;
    font-weight: 500;
    color: #2c3b5e;
    line-height: 1;
    font-size: $global-font-size-14;
    padding-left: 16px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: $c-primary;
    }
  }
}
</style>
