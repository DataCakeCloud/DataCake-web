<template>
  <div class="EditorTableDrawer">
    <div class="content-box">
      <div class="seatch-box">
        <el-input v-model="params.keyword" size="mini" clearable @keyup.enter.native="searchItem" @clear="searchItem">
          <el-button slot="append" @click="searchItem">查询</el-button>
        </el-input>
      </div>
      <el-collapse v-model="activeNames" accordion @change="getTableDetail">
        <el-collapse-item v-for="(table, tableKey) in tableList" :key="tableKey" :name="tableKey">
          <span slot="title" class="collapse-title">
            <span class="item-title">{{ table.name }} </span>
            <el-tooltip effect="dark" :content="$t('task.taskEditor16')" class="preview-header" placement="top">
              <i class="el-icon-copy-document" @click.stop="getTableDetail(table.name)"></i>
            </el-tooltip>
            <!-- <div class="title-box">
              <span class="item-title">{{ table.name }} </span> <el-button size="mini" type="primary" @click.stop="useSql(table.name)">生成sql语句</el-button>
            </div> -->
          </span>
          <div class="item-content">
            <el-table v-loading="tableLoading" :data="tableData" stripe>
              <el-table-column prop="name" :label="$t('task.taskEditor17')" show-overflow-tooltip> </el-table-column>
              <el-table-column prop="type" :label="$t('task.tempTable8')" show-overflow-tooltip> </el-table-column>
              <el-table-column prop="comment" :label="$t('task.tempTable9')" show-overflow-tooltip> </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="page-box">
      <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>
  </div>
</template>
<script>
import { getDataSetList } from '@/api/task';
import { number } from 'echarts/core';
export default {
  props: {
    editorInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      activeNames: [''],
      tableList: [],
      reqTableList: [],
      tableData: [],
      total: 0,
      tableLoading: false,
      params: {
        keyword: '',
        pageNum: 1,
        pageSize: 20
      }
    };
  },
  watch: {
    'editorInfo.editorDataDb'(val) {
      if (val) {
        this.getTableList();
      }
    }
  },
  methods: {
    getTableList() {
      getDataSetList({ region: this.editorInfo.region, db: this.editorInfo.editorDataDb, type: 'hive', metaFlag: 'AIRBYTE' }).then(res => {
        this.reqTableList = res.data.data;
        this.getCurrentList();
      });
    },
    getTableDetail(val) {
      console.log(val, typeof val, 333);
      this.tableData = [];
      this.tableLoading = true;
      if (typeof val === 'number') {
        getDataSetList({ region: this.editorInfo.region, db: this.editorInfo.editorDataDb, table: this.tableList[val].name, type: 'hive', metaFlag: 'AIRBYTE' }).then(res => {
          this.tableData = res.data.columns;
          this.tableLoading = false;
        });
      } else if (typeof val === 'string') {
        // 引用sql
        getDataSetList({ region: this.editorInfo.region, db: this.editorInfo.editorDataDb, table: val, type: 'hive', metaFlag: 'AIRBYTE' }).then(res => {
          let sql = 'select\n';
          res.data.columns.forEach((item, index) => {
            if (index !== res.data.columns.length - 1) {
              if (item.comment) {
                sql += ' ' + item.name + ',' + ' --' + item.comment + '\n';
              } else {
                sql += ' ' + item.name + ',' + '\n';
              }
            } else {
              if (item.comment) {
                sql += ' ' + item.name + ' --' + item.comment + '\n';
              } else {
                sql += ' ' + item.name + '\n';
              }
            }
          });
          sql += 'from\n' + ' ' + val;
          this.$emit('insertSql', sql);
        });
      }
    },
    handleCurrentChange(index) {
      this.params.pageNum = index;
      this.getCurrentList();
    },
    handleSizeChange(size) {
      this.params.pageSize = size;
      this.getCurrentList();
    },
    getCurrentList() {
      const tableList = this.reqTableList.filter(item => {
        return item.name.indexOf(this.params.keyword.trim()) !== -1;
      });
      this.total = tableList.length;
      this.tableList = tableList.slice((this.params.pageNum - 1) * this.params.pageSize, this.params.pageNum * this.params.pageSize);
    },
    searchItem() {
      this.getCurrentList();
    }
  }
};
</script>
<style lang="scss" scoped>
.EditorTableDrawer {
  border: 1px solid #dcdfe6;
  border-right: 0;
  background-color: #fff;
  margin-right: 1px;
  padding-left: 5px;
  box-shadow: -1px 0 1px 1px rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.content-box {
  height: calc(100% - 40px);
  overflow-x: auto;
  .seatch-box {
    width: 300px;
    margin: 3px;
  }
}
.title-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-title {
  padding-left: 10px;
  margin-right: 5px;
}
i {
  color: #3782ff;
}
.item-content {
  padding-left: 20px;
  padding-right: 5px;
}
.page-box {
  position: absolute;
  bottom: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
<style lang="scss">
.EditorTableDrawer {
  .el-collapse-item__content {
    padding-bottom: 0px;
  }
  .collapse-title {
    flex: 1 0 90%;
    order: 1;
    .el-collapse-item__header {
      flex: 1 0 auto;
      order: -1;
    }
  }
}
</style>
