<!--  chenyh1 -->
<template>
  <v-filters class="dictionary" placeholder="请输入字典名称、描述等信息进行搜索" :filters="filterFields" :loading="loading" :count="count" @search="filtersHandler">
    <div class="dictionary-bulks">
      <el-button type="primary" icon="el-icon-plus" @click="createHandler">创建</el-button>
    </div>
    <el-table :data="list">
      <el-table-column v-for="c in cols" :key="c.key" :label="c.label">
        <template slot-scope="scope">{{ c.filter ? c.filter(scope.row[c.key]) : scope.row[c.key] }}</template>
      </el-table-column>
      <el-table-column label="操作">
        <div slot-scope="scope" class="dictionary-btns">
          <el-button type="primary" size="mini" @click="updateHandler(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="deleteHandler(scope.row)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog v-if="isShowEditModal" :title="dialogTitle" :visible="isShowEditModal" :close-on-click-modal="false" width="600px">
      <v-form ref="form" :disabled="loading" :fields="fields" :default-model="model" @submit="editModalSubmitHandler">{{ '' }}</v-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="closeEditModal">取消</el-button>
        <el-button type="primary" :loading="loading" @click="$refs.form.submit()">确定</el-button>
      </span>
    </el-dialog>
  </v-filters>
</template>

<script>
import vFilters from '@/components/dataSetFilter';
import vForm from '@/components/dataSetForm';
import { LIST_FIELDS as filterFields, FIELDS as fields } from '../constants';
import { debounceHandler, loadingHandler, watch, wrapComponent } from '@/utils/vue-helpers';
import { deleteDict, getDictListByPage, updateDict } from '@/api/dictionary';
import { parseTime } from '@/utils';

const cols = [...fields, { key: 'createBy', label: '创建人' }, { key: 'createTime', label: '创建时间', filter: parseTime }, { key: 'updateBy', label: '更新人' }, { key: 'updateTime', label: '更新时间', filter: parseTime }];

const creatEmptyModel = () => fields.reduce((obj, { key, value }) => ({ ...obj, [key]: value }), {});

export default wrapComponent({
  components: { vFilters, vForm },
  data() {
    return {
      isShowEditModal: false,
      filterFields,
      filters: {},
      loading: false,
      model: creatEmptyModel(),
      fields,
      list: [],
      cols,
      count: 0
    };
  },
  computed: {
    dialogTitle() {
      return this.model?.id ? '修改' : '创建';
    }
  },
  methods: {
    @watch('filters')
    @debounceHandler(100)
    @loadingHandler
    async getList() {
      const {
        filters: { query, offset, componentCode, createBy }
      } = this;
      const { total, list } = await (await getDictListByPage(componentCode, query, createBy, offset / 10 + 1)).data;
      this.count = total;
      this.list = list;
    },
    async filtersHandler(model) {
      this.filters = await model;
    },
    createHandler() {
      this.isShowEditModal = true;
    },
    updateHandler(row) {
      Object.keys(this.model).forEach(key => {
        this.model[key] = row[key] || '';
      });
      this.createHandler();
    },
    @loadingHandler
    async deleteHandler(row) {
      await this.$confirm(`是否删除${row.chineseName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      await deleteDict(row.id);
      this.getList();
    },
    @loadingHandler
    async editModalSubmitHandler(model) {
      const data = await model;
      await updateDict(data);
      this.closeEditModal();
      this.getList();
    },
    closeEditModal() {
      this.isShowEditModal = false;
      this.model = creatEmptyModel();
    }
  }
});
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.dictionary {
  &-bulks {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  &-btns {
    white-space: nowrap;
  }
}
</style>
