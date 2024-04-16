<template>
  <el-dialog title="我的收藏" :visible.sync="dialogVisible" width="80%" class="collect-dial" @close="close">
    <el-table v-loading="loading" :data="collectList" class="table-box" stripe>
      <el-table-column v-for="(item, key) in columnData" :key="key" :prop="item.prop" :label="item.label" :min-width="item.width">
        <template slot-scope="scope">
          <el-tooltip :content="`${item.format ? item.format(scope.row[item.prop]) : scope.row[item.prop]}`" :disabled="isTipDisabled">
            <a v-if="item.prop === 'dbTable'" class="ellipsis block" @mouseenter="isShowTooltip" @click="handelCollect(scope.row)">
              {{ scope.row[item.prop] || '-' }}
            </a>
            <span v-else class="ellipsis block" @mouseenter="isShowTooltip">{{ item.format ? item.format(scope.row[item.prop]) : scope.row[item.prop] || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" :disabled="collectLoading" @click="cancelCollect(scope.row)">取消收藏</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    <span slot="footer" class="dialog-footer">
      <!-- <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button> -->
    </span>
  </el-dialog>
</template>

<script>
import { collectPages, collect } from '@/api/metadata';

export default {
  name: 'CollectDial',
  data() {
    return {
      dialogVisible: false,
      columnData: [
        {
          prop: 'dbTable',
          label: '表名',
          width: '140'
        },
        {
          prop: 'description',
          label: '描述',
          width: '120'
        },
        {
          prop: 'dbName',
          label: '归属库',
          width: '90'
        },
        {
          prop: 'listModel',
          label: '分层模型',
          width: '120',
          format: this.formatModel
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '120'
        },
        {
          prop: 'updateTime',
          label: '数据更新时间',
          width: '120'
        },
        {
          prop: 'collectTime',
          label: '收藏时间',
          width: '120'
        }
      ],
      isTipDisabled: true,
      collectList: [],
      params: {
        pageSize: 10,
        pageNum: 1
      },
      total: 0,
      loading: false,
      collectLoading: false
    };
  },
  methods: {
    handelCollect(data) {
      this.$router.push({
        name: 'MetaDataDetail',
        query: {
          region: data.region,
          databaseName: data.dbName,
          tableName: data.tableName.split('.')[2]
        }
      });
    },
    formatModel(data) {
      return (
        data
          ?.reduce((a, b) => {
            a.push(b.nameValues.join('/'));
            return a;
          }, [])
          .join() || '-'
      );
    },
    cancelCollect(data) {
      this.collectLoading = true;
      collect({
        region: data.region,
        dbName: data.dbName,
        tableName: data.tableName,
        isCollect: false
      })
        .then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '取消收藏成功'
            });
            this.$emit('getCollectList');
            if (this.collectList.length === 1 && this.params.pageNum > 1) {
              this.params.pageNum--;
            }
            this.getList();
          }
        })
        .finally(() => {
          this.collectLoading = false;
        });
    },
    handleSizeChange(val) {
      this.params.pageNum = 1;
      this.params.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getList();
    },
    close() {
      this.params = {
        pageSize: 10,
        pageNum: 1
      };
    },
    show() {
      this.dialogVisible = true;
      this.getList();
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
    getList() {
      this.loading = true;
      const params = {
        ...this.params
      };
      collectPages(params)
        .then(res => {
          this.collectList = res.data?.list || [];
          this.total = res.data?.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.collect-dial {
  ::v-deep {
    .el-dialog__body {
      padding-bottom: 10px;
    }
  }
  .table-box {
    ::v-deep {
      .el-table__body-wrapper {
        max-height: calc(100vh - 200px);
        overflow-y: auto;
      }
    }
  }
}
</style>
