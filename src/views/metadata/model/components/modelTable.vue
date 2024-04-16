<template>
  <el-table :data="tableData" stripe class="model-table" style="width: 100%" :cell-style="{ padding: '10px 0' }">
    <el-table-column v-for="item in columnData" :key="item.prop" :label="item.label" :min-width="item.width" :prop="item.prop">
      <template slot-scope="scope">
        <el-tooltip v-if="item.tooltip" :content="item.format ? item.format(scope.row) : scope.row[item.prop]" :disabled="isTipDisabled">
          <span v-if="item.format" class="ellipsis block" @mouseenter="isShowTooltip">{{ item.format(scope.row) }}</span>
          <a v-else-if="item.link" class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row, item.link)">{{ scope.row[item.prop] }}</a>
          <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row[item.prop] || '-' }}</span>
        </el-tooltip>
        <template v-else>
          <template v-if="item.format">{{ item.format(scope.row) }}</template>
          <router-link v-else-if="item.link" :to="item.link(scope.row)">{{ scope.row[item.prop] }}</router-link>
          <template v-else>{{ scope.row[item.prop] || '-' }}</template>
        </template>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="135px">
      <template slot-scope="scope">
        <el-button size="mini" :disabled="disabled" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="mini" :disabled="disabled" type="danger" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { delMetaMode } from '@/api/metadata';

export default {
  name: 'ModelTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    columnData: {
      type: Array,
      default: () => []
    },
    data: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      isTipDisabled: true
    };
  },
  methods: {
    handleEdit(data) {
      this.$emit('handleEdit', data);
    },
    handleDelete(data) {
      this.$confirm('确定要删除该类目吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        delMetaMode({ id: data.id }).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功');
            this.$emit('getModelTree');
          }
        });
      });
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.model-table {
  margin-top: 15px;
}
</style>
