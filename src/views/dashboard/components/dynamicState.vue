<template>
  <el-card class="dashboard-card dynamic-state">
    <div class="title dy-state">
      <span class="item">产品动态</span>
      <a href="https://shimo.im/docs/pmkxQmWOO4COMKAN" target="_blank" class="help-btn">帮助文档</a>
    </div>
    <el-empty v-if="!list.length && !loading" description="无动态数据" :image-size="50"></el-empty>
    <div v-else v-loading="loading" class="list">
      <template v-for="(item, index) in list">
        <p v-if="index < 10" :key="index" class="item" @click="handleDetail(item)">
          <span class="cell-ellipsis name">{{ item.name }}</span>
          <span class="time">{{ parseTime(item.updateTime) }}</span>
        </p>
      </template>
    </div>

    <DynamiStateDetail :visible.sync="dynamiStateDetailVisible" :title="title" :detail="detail" :loading="detailLoading"></DynamiStateDetail>
  </el-card>
</template>

<script>
import { parseDate, b64_to_utf8 } from '@/utils/';
import { list, detail } from '@/api/dashboard';
import DynamiStateDetail from '@/components/announcement/dynamiStateDetail';
export default {
  name: 'DynamicState',
  components: {
    DynamiStateDetail
  },
  data() {
    return {
      query: this.$route.query,
      dynamiStateDetailVisible: false,
      loading: false,
      detailLoading: false,
      title: '',
      detail: '',
      list: []
    };
  },
  created() {
    this.getList();
    if (this.query.announcementId) {
      this.handleDetail({ id: this.query.announcementId });
    }
  },
  methods: {
    parseTime(time) {
      return parseDate(time);
    },
    getList() {
      this.loading = true;
      list().then(res => {
        this.loading = false;
        const data = res.data;
        this.list =
          (data.length &&
            data.map(e => {
              return { ...e, name: b64_to_utf8(e.name) };
            })) ||
          [];
      });
    },
    handleDetail(item) {
      this.detailLoading = true;
      this.dynamiStateDetailVisible = true;
      ((this.query.announcementId && this.query.announcementId !== item.id) || !this.query.announcementId) && this.$router.push({ query: { ...this.$route.query, announcementId: item.id }});
      detail({ id: item.id }).then(res => {
        this.detailLoading = false;
        const data = res.data;
        this.detail = b64_to_utf8(data.content);
        this.title = b64_to_utf8(data.name);
      });
    }
  }
};
</script>

<style lang="scss" res="stylesheet/sass" scoped>
@import './title.scss';

.dynamic-state {
  height: 240px;
  .title {
    position: relative;
    .help-btn {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
.list {
  margin-top: 15px;
  min-height: 150px;
  max-height: 170px;
  overflow-y: auto;
  overflow-x: hidden;
  p {
    position: relative;
    display: flex;
    margin-bottom: 15px;
    font-size: $global-font-size-12;

    &::before {
      display: inline-block;
      width: 2px;
      height: 2px;
      margin-right: 5px;
      content: '•';
    }
    &::after {
      position: absolute;
      right: 3%;
      top: -1px;
      width: 5px;
      height: 5px;
      content: '>';
      color: #a49b9b;
    }
  }
  .name {
    width: 60%;
    margin-right: 10px;
  }

  .time {
    position: absolute;
    top: 0;
    right: 6%;
    color: #999;
  }
}
</style>
