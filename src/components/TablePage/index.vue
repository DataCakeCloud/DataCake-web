<template>
  <div class="table-page">
    <el-table :key="tableKey" :data="tableData" :border="true" stripe class="custom-table" style="width: 100%" :cell-style="{ padding: '10px 0' }" :height="tableHeight">
      <el-table-column v-if="isShowIndex" type="index" :index="indexMethod" label="序号" width="70" align="center"></el-table-column>
      <el-table-column v-for="item in columnData" :key="item.prop" :prop="item.prop" :label="item.label" :min-width="item.width" :sortable="item.sortable">
        <template slot-scope="scope">
          <el-tooltip v-if="item.tooltip" :content="item.format ? item.format(scope.row) : scope.row[item.prop]" :disabled="isTipDisabled">
            <span v-if="item.format" class="ellipsis block" @mouseenter="isShowTooltip">{{ item.format(scope.row) }}</span>
            <a v-else-if="item.link" class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row, item.link)">{{ scope.row[item.prop] }}</a>
            <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row[item.prop] || '-' }}</span>
          </el-tooltip>
          <template v-else>
            <template v-if="item.format">{{ item.format(scope.row) }}</template>
            <router-link v-else-if="item.link" :to="item.link(scope.row)">{{ scope.row[item.prop] }}</router-link>
            <div v-else-if="item.longData" class="ellipsis pointer" @click="showAll(scope.row[item.prop], item.formatTipJSON)">{{ scope.row[item.prop] || '-' }}</div>
            <template v-else-if="item.attach">
              <span v-if="scope.row[item.prop].length === 0"> - </span>
              <template v-else>
                <el-tooltip v-for="attach in scope.row[item.prop]" :key="attach.id" :content="attach.fileName" :disabled="isTipDisabled">
                  <a class="attachment ellipsis block" @mouseenter="isShowTooltip" @click="downloadAttach(attach.id)">{{ attach.fileName }}</a>
                </el-tooltip>
              </template>
            </template>
            <template v-else>{{ scope.row[item.prop] || '-' }}</template>
          </template>
        </template>
      </el-table-column>
      <slot></slot>
    </el-table>
    <el-pagination v-if="isShowPage" background :total="total" :current-page="newPageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="newPageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    <el-dialog title="" :visible.sync="JSONTipVisible">
      <div>
        <el-input v-model="JSONText" type="textarea" :rows="8" disabled> </el-input>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'TablePage',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    columnData: {
      type: Array,
      default: () => []
    },
    isShowIndex: {
      type: Boolean,
      default: true
    },
    isShowPage: {
      type: Boolean,
      default: true
    },
    tableHeight: {
      type: String,
      default: '100%'
    },
    total: {
      type: Number,
      default: 0
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      // total: 0,
      newPageNum: this.pageNum,
      newPageSize: this.pageSize,
      isTipDisabled: false,
      tableKey: 0,
      textarea: '',
      JSONTipVisible: false,
      JSONText: ''
    };
  },
  watch: {
    'columnData.length'(news, olds) {
      this.tableKey++;
    }
  },
  methods: {
    indexMethod(index) {
      return (this.newPageNum - 1) * this.newPageSize + index + 1;
    },
    handleCurrentChange(val) {
      this.newPageNum = val;
      this.$emit('changePage', { pageNum: this.newPageNum, pageSize: this.newPageSize });
    },
    handleSizeChange(val) {
      this.newPageSize = val;
      this.newPageNum = 1;
      this.$emit('changePage', { pageNum: this.newPageNum, pageSize: this.newPageSize });
    },
    gotoDetail(row, link) {
      this.$router.push(link(row));
    },
    showAll(data, formatTipJSON) {
      if (data) {
        if (formatTipJSON) {
          let showdata = data;
          let text = '';
          if (typeof data === 'object') {
            text = data;
          } else {
            text = JSON.parse(data);
          }
          if (typeof text === 'string') {
            showdata = JSON.stringify(JSON.parse(text), null, 2);
          } else {
            showdata = JSON.stringify(text, null, 2);
          }
          this.JSONText = showdata;
          this.JSONTipVisible = true;
        } else {
          this.$alert(data, 'data', {
            showConfirmButton: false,
            customClass: 'template-alert',
            callback: () => {}
          });
        }
      }
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    downloadAttach(id) {
      const url = process.env.VUE_APP_API_GATEWAY_PATH + `ds_task/attachment/download?id=${id}`;
      window.location.href = url;
      return;
    }
  }
};
</script>
<style lang="scss" scoped>
.attachment {
  margin-right: 10px;
}
.table-page {
  ::v-deep .el-textarea__inner {
    cursor: pointer !important;
  }
}
</style>
