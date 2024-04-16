<template>
  <el-card style="min-height: calc(100vh - 70px)">
    <el-page-header class="page-header" content="公告管理" @back="goBack"></el-page-header>
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="params" label-position="top" label-width="80px">
      <el-row type="flex" justify="space-between">
        <div>
          <el-button type="primary" @click="handleAnnouncement">新建公告</el-button>
        </div>
        <div>
          <el-form-item prop="online">
            <el-select v-model="params.online" clearable placeholder="请选择状态" @change="page">
              <el-option label="上线" :value="1"></el-option>
              <el-option label="下线" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="name">
            <el-input v-model="params.name" placeholder="请输入公告名称" class="search-input" prefix-icon="el-icon-search" clearable style="min-width: 200px" @change="page"></el-input>
          </el-form-item>
        </div>
      </el-row>
    </el-form>
    <el-empty v-if="!list.length && !loading" description="无公告数据"></el-empty>
    <div v-else v-loading="loading">
      <el-table :data="list" style="width: 100%" highlight-current-row border header-row-class-name="custom-table-head">
        <el-table-column label="公告名称" prop="name" align="center">
          <template slot-scope="scope">
            <el-tooltip slot="label" effect="dark" :content="b64_to_utf8(scope.row.name)" placement="right">
              <div title="点击可分享" class="cell-ellipsis" @click="handleShare(scope.row)">{{ b64_to_utf8(scope.row.name) }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="online" align="center">
          <template slot-scope="scope">
            {{ scope.row.online === 0 ? '已下线' : '已上线' }}
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="updateTime" align="center">
          <template slot-scope="scope">
            {{ getTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOnlineOffline(scope.row)">{{ scope.row.online === 0 ? '上线' : '下线' }}</el-button>
            <el-button type="text" @click="handleDetail(scope.row)">查看</el-button>
            <el-button v-if="!scope.row.online" type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="!scope.row.online" :loading="scope.row.deleteLoading" :disabled="scope.row.deleteLoading" type="text" @click="handleDelete(scope.row, scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="params.pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
    </div>

    <CreatEditAnnoucement :visible.sync="creatEditAnnoucementVisible" :edit-data="editData" :loading="detailLoading" @updateList="page"></CreatEditAnnoucement>
    <DynamiStateDetail :visible.sync="dynamiStateDetailVisible" :title="title" :detail="detail" :loading="detailLoading"></DynamiStateDetail>
  </el-card>
</template>

<script>
import { parseTime, b64_to_utf8, utf8_to_b64 } from '@/utils/';
import copy from 'copy-to-clipboard';
import { page, detail, onlineOffline, deleteAnn } from '@/api/dashboard';
import CreatEditAnnoucement from './components/creatEditAnnoucement';
import DynamiStateDetail from '@/components/announcement/dynamiStateDetail';
export default {
  name: 'Announcement',
  components: {
    CreatEditAnnoucement,
    DynamiStateDetail
  },
  data() {
    return {
      loading: false,
      creatEditAnnoucementVisible: false,
      dynamiStateDetailVisible: false,
      detailLoading: false,
      deleteLoading: false,
      list: [],
      detail: '',
      title: '',
      editData: {},
      total: 0,
      params: {
        name: '',
        online: null,
        pageNum: 1,
        pageSize: 10
      }
    };
  },
  created() {
    this.page();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Dashboard' });
    },
    b64_to_utf8(str) {
      return b64_to_utf8(str);
    },
    utf8_to_b64(str) {
      if (!str) return;
      return utf8_to_b64(str);
    },
    getTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}');
    },
    // handleSearch(val) {
    //   const v = b64_to_utf8(val);

    // },
    page() {
      this.loading = true;
      const params = Object.assign({}, this.params, { name: utf8_to_b64(this.params.name), content: utf8_to_b64(this.params.content) });
      page(params).then(res => {
        this.loading = false;
        const data = res.data;
        this.list =
          (data.list &&
            data.list.length &&
            data.list.map(e => {
              return { ...e, deleteLoading: false };
            })) ||
          [];
        this.total = data.total;
        this.params.pageNum = data.pageNum;
        this.params.pageSize = data.pageSize;
      });
    },
    handleShare(val) {
      copy(`${this.$locationOrigin}/home?announcementId=${val.id}`, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: `${this.b64_to_utf8(val.name)}分享链接已复制到剪切板`
      });
    },
    handleOnlineOffline(val) {
      onlineOffline({
        id: val.id,
        online: val.online === 0 ? 1 : 0
      }).then(data => {
        this.page();
      });
    },
    handleDetail(row) {
      this.detailLoading = true;
      this.dynamiStateDetailVisible = true;
      detail({ id: row.id }).then(res => {
        this.detailLoading = false;
        const data = res.data;
        this.title = b64_to_utf8(data.name);
        this.detail = b64_to_utf8(data.content);
      });
    },
    handleEdit(row) {
      this.detailLoading = true;
      this.creatEditAnnoucementVisible = true;
      detail({ id: row.id }).then(res => {
        const data = res.data;
        this.detailLoading = false;
        this.editData = data;
        this.page();
      });
    },
    handleDelete(row, index) {
      this.list[index].deleteLoading = true;
      deleteAnn({ id: row.id }).then(data => {
        this.list[index].deleteLoading = false;
        this.$message({
          type: 'success',
          message: `${b64_to_utf8(row.name)}删除成功`
        });
        this.page();
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.page();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.page();
    },
    handleAnnouncement() {
      this.creatEditAnnoucementVisible = true;
      this.editData = {};
    }
  }
};
</script>

<style lang="scss" rel="stysheet/sass" scoped>
.page-header {
  margin-bottom: 15px;
}
</style>
