<template>
  <div>
    <el-empty v-if="!body.length && !loading" description="暂无数据"></el-empty>
    <template v-else>
      <div v-if="multipleSelections.length" class="ope-box">
        <el-button icon="el-icon-delete" type="text" :loading="deleteLoading" @click="handleDelete">删除</el-button>

        <el-popover v-model="saveAsvisible" placement="top" width="240">
          <el-input v-model="name" placeholder="请输入报告名称"></el-input>
          <div style="text-align: right; margin: 10px 0 0 0">
            <el-button size="mini" type="text" @click="saveAsvisible = false">取消</el-button>
            <el-button :disabled="!name.length || saveAsLoading" :loading="saveAsLoading" type="primary" size="mini" @click="handleSaveAsConfirm">确定</el-button>
          </div>
          <el-button slot="reference" icon="el-icon-document-copy" type="text">另存为</el-button>
        </el-popover>
      </div>
      <el-table v-loading="loading" :data="body" highlight-current-row border height="calc(100vh - 185px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="报告名称" prop="name" align="left" min-width="100">
          <template slot-scope="scope">
            <a href="javascript:;" class="cell-ellipsis" @click="handleLink(scope.row)">{{ scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="createUser" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" min-width="100"> </el-table-column>
        <el-table-column label="账单日期" prop="updateTime" align="center" min-width="100"> </el-table-column>
        <el-table-column label="时间范围" prop="timeRange" align="center" min-width="90">
          <template slot-scope="scope">
            {{ getTimeRangeText(scope.row.timeRange) }}
          </template>
        </el-table-column>
        <el-table-column label="时间粒度" prop="dt" align="center" min-width="90">
          <template slot-scope="scope">
            {{ getDateTypeText(scope.row.dtType) }}
          </template>
        </el-table-column>
        <el-table-column label="分组依据" prop="queryGroup" align="center" min-width="90">
          <template slot-scope="scope">
            {{ getQueryGroupText(scope.row.queryGroup) }}
          </template>
        </el-table-column>
        <el-table-column label="筛选条件" prop="filterStr" align="center" min-width="200">
          <template slot-scope="scope">
            <el-tooltip slot="label" effect="dark" :content="scope.row.filterStr" placement="top">
              <div class="cell-ellipsis">{{ scope.row.filterStr }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="params.page" :page-sizes="[10, 20, 30, 40]" :page-size="params.limit" layout="total, sizes, prev, pager, next, jumper" :total="params.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </template>
  </div>
</template>
<script>
import { reportDel, reportSaveAs } from '@/api/cost';
export default {
  name: '',
  props: {
    body: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      shortcuts: this.$t('cost.shortcuts'),
      dateTypeList: this.$t('cost.dateTypeList'),
      filterList: this.$t('cost.filterList'),
      multipleSelections: [],
      deleteLoading: false,
      saveAsvisible: false,
      saveAsLoading: false,
      name: ''
    };
  },
  methods: {
    getTimeRangeText(id) {
      return this.shortcuts.find(e => e.id === id)['text'];
    },
    getDateTypeText(id) {
      return this.dateTypeList.find(e => e.value === id)['name'];
    },
    getQueryGroupText(id) {
      const obj = this.filterList.find(e => e.value === id);
      if (!obj) return;
      return Object.keys(obj).length && obj['name'];
    },
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val);
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val);
    },
    handleSelectionChange(val) {
      this.$emit('updateMultipleSelection', val);

      this.multipleSelections = val;
    },

    handleSaveAsConfirm() {
      if (this.multipleSelections.length > 1) {
        this.message({
          type: 'warning',
          message: '另存为报告只能选择一项，请重新选择'
        });
        return;
      }
      this.saveAsLoading = true;
      const params = {
        name: this.name,
        topParams: this.multipleSelections[0].topParams,
        queryGroup: this.multipleSelections[0].queryGroup,
        sideFilter: this.multipleSelections[0].sideFilter,
        timeRange: this.multipleSelections[0].timeRange,
        dtType: this.multipleSelections[0].dtType,
        filterStr: this.multipleSelections[0].filterStr
      };

      // 保存
      reportSaveAs(params).then(res => {
        this.saveAsLoading = false;
        if (res.code !== 0) return;
        this.$message({
          type: 'success',
          message: '另存为报告成功'
        });
        this.$emit('updateList');
      });
    },

    handleDelete() {
      this.deleteLoading = true;
      const ids = this.multipleSelections.map(e => e.id);
      reportDel({ ids }).then(res => {
        this.deleteLoading = false;
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        this.$emit('updateList');
      });
    },

    handleLink(row) {
      this.$router.push({ name: 'NewCostAnalysis', query: { id: row.id }});
    }
  }
};
</script>
