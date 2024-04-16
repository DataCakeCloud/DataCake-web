<template>
  <div class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">字段信息</div>
        <el-button v-if="!enumerateText.includes(metaDetail.owner || '') && authority" class="el-icon-circle-plus" type="text" size="mini" :disabled="isAddDisabled || isBatchDisabled" @click="addColumn">添加</el-button>

        <el-button v-if="!enumerateText.includes(metaDetail.owner || '') && authority" class="el-icon-edit" type="text" size="mini" :disabled="isBatchDisabled || isAddDisabled" @click="batchEditColumn">批量编辑</el-button>

        <template v-if="isAddDisabled">
          <el-button type="text" :loading="saveLoading" size="mini" @click="saveColumn">确定</el-button>
          <el-button type="text" size="mini" @click="cancelColumn">取消</el-button>
        </template>

        <template v-if="isBatchDisabled">
          <el-button type="text" :loading="saveLoading" size="mini" @click="saveBatchColumn">确定</el-button>
          <el-button type="text" size="mini" @click="cancelBatchColumn">取消</el-button>
        </template>
      </div>
    </div>
    <el-table v-loading="loading" :data="columns" stripe>
      <el-table-column prop="name" label="字段名称" min-width="110">
        <template slot-scope="scope">
          <el-input v-if="scope.row.isAdd" v-model="editColumnData.name" placeholder="字段名称" clearable></el-input>
          <el-input v-else-if="scope.row.isEdit" v-model="scope.row.name" placeholder="字段名称" clearable></el-input>
          <el-tooltip v-else slot="label" effect="dark" :content="scope.row.name" placement="top">
            <div class="cell-ellipsis" title="左击可复制" @click="handleCopy(scope.row.name)">{{ scope.row.name }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="字段类型">
        <template slot-scope="scope">
          <el-select v-if="scope.row.isAdd" v-model="editColumnData.type" placeholder="字段类型">
            <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.key"></el-option>
          </el-select>
          <el-select v-else-if="scope.row.isEdit" v-model="scope.row.type" placeholder="字段类型" @change="changeType(scope.$index, scope.row.type)">
            <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.key"></el-option>
          </el-select>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="字段描述" min-width="120">
        <template slot-scope="scope">
          <el-input v-if="scope.row.isAdd" v-model="editColumnData.comment" placeholder="字段描述" clearable></el-input>
          <el-input v-else-if="scope.row.isEdit" v-model="scope.row.comment" placeholder="字段描述" clearable></el-input>
          <el-tooltip v-else slot="label" effect="dark" :content="scope.row.comment" placement="top">
            <div class="cell-ellipsis" title="左击可复制" @click="handleCopy(scope.row.comment)">{{ scope.row.comment }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="安全级别">
        <template slot-scope="scope">
          <el-select v-if="scope.row.isAdd" v-model="editColumnData.dataGrade" clearable placeholder="安全级别">
            <el-option v-for="item in dataGradeList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
          <el-select v-else-if="scope.row.isEdit" v-model="scope.row.dataGrade" clearable placeholder="安全级别">
            <el-option v-for="item in dataGradeList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
          <span v-else>{{ scope.row.dataGrade }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="decimal类型自定义" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="resetForm">
      <div class="tip">decimal类型支持让用户自定义精度和小数位数</div>
      <el-form ref="decimalForm" :model="decimalForm" label-width="140px">
        <el-form-item label="精度" prop="accuracy" :rules="[{ required: true, message: '请输入精度', trigger: 'change' }]">
          <el-input-number v-model="decimalForm.accuracy" controls-position="right" :min="1" :max="38"></el-input-number>
        </el-form-item>
        <el-form-item label="小数位数" prop="decimal" :rules="[{ required: true, message: '请输入小数位数', trigger: 'change' }]">
          <el-input-number v-model="decimalForm.decimal" controls-position="right" :min="0" :max="decimalForm.accuracy"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDecimal">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { editColumn, addColumn, dict, column } from '@/api/metadata';
import copy from 'copy-to-clipboard';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';
export default {
  name: 'Columns',
  props: {
    authority: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      decimalForm: {
        accuracy: 22,
        decimal: 6
      },
      query: this.$route.query,
      loading: false,
      isAddDisabled: false,
      saveLoading: false,
      isBatchDisabled: false,
      columns: [],
      oldColumns: [],
      typeList: [],
      editColumnData: {},
      enumerateText: this.$t('data.enumerateText'),
      dataGradeList: ['1级', '2级', '3级', '4级']
    };
  },
  computed: {
    ...mapGetters(['metaDetail'])
  },
  created() {
    this.column();
    this.getTypeList();
  },
  methods: {
    getTypeList() {
      dict({ dictType: 'data_type' }).then(res => {
        const data = res.data;
        this.typeList = data;
        // 自己添加decimal自定义
        this.typeList.some((item, index) => {
          if (item.value.startsWith('DECIMAL')) {
            this.typeList.splice(index, 0, { value: 'DECIMAL(自定义)', key: 'DECIMAL(自定义)' });
            return true;
          }
        });
      });
    },
    changeType(index, value) {
      this.currentIndex = index;
      if (value === 'DECIMAL(自定义)') {
        this.dialogVisible = true;
      }
    },
    saveDecimal() {
      this.dialogVisible = false;
      setTimeout(() => {
        this.columns[this.currentIndex].type = `DECIMAL(${this.decimalForm.accuracy},${this.decimalForm.decimal})`;
      }, 100);
    },
    resetForm() {
      this.columns[this.currentIndex].type = 'DECIMAL(22,6)';
    },
    column() {
      this.loading = true;
      const params = {
        id: this.query.id,
        region: this.query.region,
        dbName: this.query.databaseName,
        tableName: this.query.tableName
      };
      column(params)
        .then(res => {
          const data = res.data;
          if (Array.isArray(data) && !data.length) return;
          this.columns = data.columnsList;
          this.oldColumns = JSON.parse(JSON.stringify(this.columns));
          this.$emit('setColums', this.oldColumns);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addColumn() {
      const colomn = {
        name: '',
        type: '',
        comment: '',
        logic: '',
        dataGrade: '',
        isEdit: false,
        isAdd: true
      };
      this.columns.unshift(colomn);
      this.editColumnData = { name: '', type: '', comment: '', logic: '', dataGrade: '' };
      this.isAddDisabled = true;
    },
    batchEditColumn() {
      this.isBatchDisabled = true;
      this.columns.forEach(item => {
        this.$set(item, 'isEdit', true);
        this.$set(item, 'isAdd', false);
      });
    },
    saveBatchColumn() {
      this.saveLoading = true;
      const columns = tools.copyFn(this.columns);
      columns.forEach(item => {
        delete item.isEdit;
        delete item.isAdd;
      });
      const renameList = [];
      const alterList = [];
      this.oldColumns.forEach((item, index) => {
        if (item.name !== columns[index].name) {
          renameList.push({
            beforeColumnName: item.name,
            columnName: columns[index].name,
            colType: columns[index].type,
            comment: columns[index].comment
          });
        }
        if (item.type !== columns[index].type || item.comment !== columns[index].comment) {
          alterList.push({
            beforeColumnName: item.name,
            columnName: columns[index].name,
            colType: columns[index].type,
            comment: columns[index].comment
          });
        }
      });
      editColumn({
        id: this.query.id,
        region: this.query.region,
        dbName: this.query.databaseName,
        name: this.query.tableName,
        columns: JSON.stringify(columns),
        renameList,
        alterList
      })
        .then(res => {
          this.$message({
            type: 'success',
            message: '批量编辑成功'
          });
          this.isAddDisabled = false;
          this.isBatchDisabled = false;
          this.column();
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    cancelBatchColumn() {
      this.columns = JSON.parse(JSON.stringify(this.oldColumns));
      this.columns.forEach(item => {
        this.$set(item, 'isEdit', false);
        this.$set(item, 'isAdd', false);
      });
      this.isAddDisabled = false;
      this.isBatchDisabled = false;
    },
    handleCopy(val) {
      copy(val, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: `${val}已复制到剪贴板`
      });
    },
    saveColumn() {
      const columns = tools.copyFn(this.columns);
      columns.splice(0, 1);
      columns.push(this.editColumnData);
      this.saveLoading = true;
      addColumn({
        id: this.query.id,
        region: this.query.region,
        dbName: this.query.databaseName,
        name: this.query.tableName,
        columns: JSON.stringify(columns)
      })
        .then(res => {
          this.$message({
            type: 'success',
            message: '添加成功'
          });
          this.isAddDisabled = false;
          this.column();
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    cancelColumn() {
      this.isAddDisabled = false;
      this.columns.splice(0, 1);
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';
.detial-item {
  .tool {
    &-lf {
      display: flex;
    }
  }
}
</style>
