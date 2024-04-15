<template>
  <div class="wrapper">
    <div class="config">
      <el-form ref="form" :model="form" label-width="100px" class="ruleForm">
        <el-form-item label="名称: " size="mini" prop="title" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
          <el-input v-model.trim="form.title" class="w250" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="描述: ">
          <el-input v-model="form.describe" type="textarea" maxlength="200"></el-input>
        </el-form-item>
        <div class="base">
          <div class="config_title">基本格式</div>
          <el-form-item label="样式: ">
            <div class="base_style">
              <div class="switch">
                <el-switch v-model="form.params.format.indexType"> </el-switch>
                <span>序号</span>
              </div>
              <el-checkbox v-model="form.params.format.transposition">行列转置</el-checkbox>
              <el-checkbox v-model="form.params.format.wrap">自动换行</el-checkbox>
              <!-- <el-checkbox v-model="form.params.format.auto">自适应宽度</el-checkbox> -->
            </div>
          </el-form-item>
          <el-form-item label="分页: ">
            <div class="pagination">
              <el-switch v-model="form.params.pagination.paginationType"></el-switch>
              <div v-if="form.params.pagination.paginationType" class="paginationConfig">
                <div class="item">
                  <span class="title">每页显示: </span>
                  <el-select v-model="form.params.pagination.pageSize" class="w100" size="mini">
                    <el-option v-for="item in pageSizeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </div>
                <!-- <div class="item">
                <span class="title">显示上限: </span>
                <el-select v-model="form.params.pagination.max" class="w100" size="mini">
                  <el-option v-for="item in maxOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </div> -->
              </div>
            </div>
          </el-form-item>
          <el-form-item label="对齐方式: ">
            <el-select v-model="form.params.align" class="w100" size="mini">
              <el-option v-for="item in alignOptions" :key="item.label" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="field">
          <div class="config_title">字段设置</div>
          <div class="tag">
            <div class="show_tag">
              <p>显示字段列表</p>
              <el-tag v-for="tag in filterList" :key="tag.valueKey" :class="[showTypeActive === tag.valueKey ? 'active' : '']" closable type="success" @close="handleClose(tag.valueKey, false)" @click="showTypeActive = tag.valueKey">
                {{ tag.valueKey }}
              </el-tag>
            </div>
            <div v-if="filterListDel.length > 0" class="no_show_tag">
              <p>不显示字段列表</p>
              <el-tag v-for="tag in filterListDel" :key="tag.valueKey" closable type="info" @close="handleClose(tag.valueKey, true)">
                {{ tag.valueKey }}
              </el-tag>
            </div>
          </div>
          <div v-if="filterList.length > 0" class="field_box">
            <div v-for="item in columnOptions" :key="item.valueKey" class="field_content">
              <div v-show="showTypeActive === item.valueKey" class="field_item">
                <el-form-item label="展示名称: ">
                  <el-input v-model="item.name" class="w250" size="mini"></el-input>
                </el-form-item>
                <el-form-item label="搜索条件: ">
                  <el-radio-group v-model="item.isFilterType">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="展示类型: ">
                  <el-select v-model="item.showType" class="w100" size="mini">
                    <el-option v-for="val in viewTypeOption" :key="val.value" :label="val.label" :value="val.value"> </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="条件格式: ">
                  <div class="tremFormat">
                    <el-select v-model="item.tremFormat.symbol" size="mini" class="symbol w100">
                      <el-option label="小于" value="lt" />
                      <el-option label="等于" value="equal" />
                      <el-option label="大于" value="gt" />
                    </el-select>
                    <el-input v-model="item.tremFormat.value" class="value" placeholder="请输入值" size="mini"></el-input>
                    <div class="color">
                      <span class="title">显示</span>
                      <el-color-picker v-model="item.tremFormat.viewColor"></el-color-picker>
                    </div>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <div class="view">
      <div class="view_title">
        <span class="title">结果展示区</span>
      </div>
      <el-card class="view_content">
        <el-row class="search" :gutter="10">
          <el-col v-for="val in tableSearhList" :key="val.valueKey" :span="4" class="search_item">
            <span class="name ellipsis" :title="val.name">{{ val.name + ': ' }}</span>
            <el-input v-model="val.value" :placeholder="val.name" size="mini" clearable></el-input>
          </el-col>
        </el-row>
        <myTable :table-data="tableData" :table-options="tableOptions" />
        <el-pagination
          v-if="form.params.pagination.paginationType"
          background
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.params.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="data.result.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </el-card>
      <div class="footer">
        <el-button size="small" @click="$emit('cancel')">取 消</el-button>
        <el-button type="primary" size="small" @click="submit">保 存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import myTable from './components/table.vue';
import { numberType } from '@/views/dataAnalysis/util';

export default {
  name: 'TableConfig',
  components: {
    myTable
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      transTableData: [],
      transTableHeader: [],
      columnOptions: [
        {
          name: '',
          valueKey: '',
          isFilterType: false,
          showType: 'text',
          tremFormat: {
            symbol: '',
            value: '',
            viewColor: ''
          }
        }
      ],
      showTypeActive: '',
      tableSearhList: [
        {
          name: '',
          valueKey: '',
          value: ''
        }
      ],
      filterListDel: [],
      filterList: [],
      viewTypeOption: [
        { label: '文本', value: 'text' },
        { label: '超链接', value: 'link' },
        { label: '图片', value: 'img' }
      ],
      alignOptions: [
        { label: '靠左', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '靠右', value: 'right' }
      ],
      maxOptions: [
        { label: '100条', value: 100 },
        { label: '200条', value: 200 },
        { label: '500条', value: 500 },
        { label: '1000条', value: 1000 }
      ],
      pageSizeOptions: [
        { label: '10条/页', value: 10 },
        { label: '20条/页', value: 20 },
        { label: '50条/页', value: 50 },
        { label: '100条/页', value: 100 }
      ],
      form: {
        title: '',
        describe: '',
        params: {
          format: {
            indexType: true,
            transposition: false,
            wrap: false,
            auto: false
          },
          pagination: {
            paginationType: true,
            pageSize: 20,
            pageNum: 1,
            max: 1000
          },
          align: 'left'
        }
      }
    };
  },
  computed: {
    tableOptions() {
      return Object.assign({}, { align: this.form.params.align, format: this.form.params.format, pagination: this.form.params.pagination, filterList: this.filterList });
    },
    tableData() {
      let result = this.data.result || [];

      // 字段类型处理
      if (this.data.type) {
        result.forEach(item => {
          Object.keys(item).forEach(key => {
            const currentTypeObj = this.data.type.find(v => v[key]);
            if (currentTypeObj && Object.values(currentTypeObj)[0] === 'integer') {
              item[key] = Number(item[key]);
            }
          });
        });
      }

      if (this.tableSearhList.length > 0 && this.tableSearhList.some(item => item.value.trim())) {
        const filterList = this.tableSearhList.filter(item => item.value.trim());
        const searchNames = filterList.map(item => item.valueKey);
        const searchValues = filterList.map(item => item.value);
        result = result.filter(item => {
          const res = [];
          searchNames.forEach((name, i) => {
            const typeObj = this.data.type.find(item => Object.keys(item)[0] === name);
            if (typeObj && numberType.includes(typeObj[Object.keys(typeObj)[0]])) {
              if (item[name] || item[name] === 0) res.push(item[name] === searchValues[i] * 1);
            } else {
              if (item[name]) res.push(item[name].includes(searchValues[i]));
            }
          });
          return !res.some(item => !item);
        });
      }

      if (this.form.params.pagination.paginationType) {
        const start = (this.form.params.pagination.pageNum - 1) * this.form.params.pagination.pageSize;
        const end = this.form.params.pagination.pageNum * this.form.params.pagination.pageSize;
        return result.slice(start, end);
      } else {
        return result;
      }
    }
  },
  watch: {
    tableData: {
      handler(val) {
        const titleHeader = val[0] ? Object.keys(val[0]) : [];
        const result = {};
        titleHeader.forEach(key => {
          result[key] = val.map(item => item[key]);
        });
        const data = [];
        Object.keys(result).forEach(key => {
          const obj = {};
          obj.name = key;
          result[key].forEach((v, i) => {
            obj['key' + i] = v;
          });
          data.push(obj);
        });
        this.transTableData = data;
        this.transTableHeader = data[0] ? Object.keys(data[0]).map(item => ({ name: item, valueKey: item })) : [];
      },
      immediate: true
    },
    'data.meta': {
      handler: function(val) {
        this.columnOptions = val.map(item => {
          return {
            name: item,
            valueKey: item,
            isFilterType: false,
            isShow: true,
            showType: 'text',
            tremFormat: {
              symbol: '',
              value: '',
              viewColor: ''
            }
          };
        });
        this.showTypeActive = this.columnOptions.find(item => item.isShow).valueKey;
      },
      immediate: true
    },
    columnOptions: {
      handler: function(val) {
        this.filterList = [].concat(val.filter(item => item.isShow));
        this.filterListDel = [].concat(val.filter(item => !item.isShow));
        const tableSearhList = val.filter(item => item.isFilterType);
        this.tableSearhList = tableSearhList.map(item => ({ valueKey: item.valueKey, name: item.name, value: '' }));
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setData(data) {
      this.form = data.form;
      this.chartOptions = data.chartOptions;
      this.filterList = data.filterList;
      this.tableSearhList = data.tableSearhList;
      this.filterListDel = data.filterListDel;
      this.columnOptions = data.columnOptions;
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const data = Object.assign({}, { form: { ...this.form, type: 'table' }, columnOptions: this.columnOptions, filterList: this.filterList, tableSearhList: this.tableSearhList, filterListDel: this.filterListDel });
          this.$emit('submit', data);
        }
      });
    },
    cellStyle(data, v) {
      if (!data || !v) return {};
      const { symbol, value, viewColor } = data;
      let newVal = value;
      if (typeof v === 'number') {
        newVal = Number(value);
      }

      if (!symbol || !newVal || !viewColor) return {};
      if (symbol === 'lt') {
        if (v < newVal) return { color: viewColor };
      } else if (symbol === 'equal') {
        if (newVal === v) return { color: viewColor };
      } else if (symbol === 'gt') {
        if (v > newVal) return { color: viewColor };
      }
      return {};
    },
    indexMethod(index) {
      return (this.form.params.pagination.pageNum - 1) * this.form.params.pagination.pageSize + index + 1;
    },
    handleSizeChange(val) {
      this.form.params.pagination.pageSize = val;
    },
    handleCurrentChange(val) {
      this.form.params.pagination.pageNum = val;
    },
    handleClose(valueKey, type) {
      this.columnOptions.forEach((item, index, arr) => {
        if (item.valueKey === valueKey) {
          item.isShow = type;
          if (!type) {
            const index_ = index - 1;
            if (index_ < 0) return;
            this.showTypeActive = arr[index_].valueKey;
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  display: flex;
  .w100 {
    width: 100px;
  }
  .w250 {
    width: 250px;
  }
  .config {
    width: 35%;
    padding: 10px;
    // box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
    .config_title {
      margin: 10px 0;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -1px;
        left: -8px;
        width: 3px;
        height: 18px;
        background-color: $c-primary;
      }
    }
    .ruleForm {
      .title {
        white-space: nowrap;
      }
      .base_style {
        display: flex;
        align-items: center;
        .switch {
          margin-right: 20px;
          display: flex;
          align-items: center;
          .el-switch {
            margin-right: 10px;
          }
          span {
            white-space: nowrap;
          }
        }
        .el-checkbox:not(:last-child) {
          margin-right: 20px;
        }
      }
      .pagination {
        height: 32px;
        display: flex;
        align-items: center;
        .paginationConfig {
          display: flex;
          margin-left: 10px;
          .item {
            display: flex;
            .title {
              width: 70px;
            }
            &:not(:last-child) {
              margin-right: 10px;
            }
          }
        }
      }
      .base {
        padding-left: 30px;
      }
      .field {
        padding-left: 30px;
        .tag {
          padding-left: 30px;
          .el-tag {
            margin: 5px;
            margin-left: 0;
            cursor: pointer;
            &.active {
              border-color: #41c143;
            }
          }
          p {
            font-size: $global-font-size-12;
          }
        }
        .tremFormat {
          display: flex;
          align-items: center;
          .value {
            margin-left: 10px;
            width: 180px;
          }
          .color {
            margin-left: 10px;
            display: flex;
            align-items: center;
            .title {
              white-space: nowrap;
            }
            .el-color-picker {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
  .view {
    width: 65%;
    padding: 10px;
    .view_title {
      margin-bottom: 20px;
      .title {
        border-radius: 5px;
        background-color: #9587de;
        color: #f2f6fc;
        padding: 5px 8px;
      }
    }
    .view_content {
      padding: 5px 15px;
      max-height: calc(100vh - 150px);
      overflow: auto;
      .search {
        display: flex;
        flex-wrap: wrap;
        margin: 5px 0;
        .search_item {
          min-width: 200px;
          display: flex;
          align-items: center;
          // margin-right: 8px;
          margin-bottom: 5px;
          .name {
            width: 40%;
            text-align: end;
            display: inline-block;
            white-space: nowrap;
            margin-right: 5px;
          }
          .el-input {
            ::v-deep .el-input__inner {
              padding-left: 4px;
            }
          }
        }
      }
      .el-table {
        width: 100%;
        ::v-deep .el-table__header-wrapper {
          .cell {
            white-space: nowrap;
          }
        }
        ::v-deep .el-table__body-wrapper {
          height: 445px;
          width: 100%;
          overflow: auto;
        }
      }
      .el-pagination {
        padding-top: 5px;
      }
    }
    .footer {
      position: absolute;
      bottom: 15px;
      right: 20px;
      text-align: end;
    }
  }
}
</style>
