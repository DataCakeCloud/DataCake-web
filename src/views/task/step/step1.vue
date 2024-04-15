<!--  chenyh1 -->
<template>
  <el-card class="step1 box-card-container taskStep2">
    <steps-head :active="0" direction="vertical"></steps-head>
    <div class="content_box">
      <el-row class="data-set-wrap" :gutter="60">
        <div v-for="(item, index) in dataSetList" :key="item.title">
          <data-set v-if="isShow(item)" :title="item.title" :span="8">
            <data-set-item v-for="child in item.list.slice(0, 2)" :key="child.label" :class="{ gray: child.isGray }" :label="child.label" @handle-click="next(child)">
              {{ child.content }}
            </data-set-item>
            <div v-if="item.list.slice(2).length > 0" class="more_item_task">
              <div v-if="!moreFoldType[index]" class="mb10">
                <span class="show-more" @click="handelMore(index)">更多<i class="el-icon-arrow-right"></i></span>
              </div>
              <div v-show="moreFoldType[index]" class="more_content">
                <data-set-item v-for="child in item.list.slice(2)" :key="child.label" :class="{ gray: child.isGray }" :label="child.label" @handle-click="next(child)">
                  {{ child.content }}
                </data-set-item>
              </div>
              <div v-if="moreFoldType[index]" class="mb10">
                <span class="show-more" @click="handelMore(index)">收起<i class="el-icon-arrow-up"></i></span>
              </div>
            </div>
          </data-set>
        </div>
      </el-row>
      <div class="data-set-wrap">
        <!-- <div class="mb10">
          <span class="show-more" @click="showMore = !showMore">
            {{ showMore ? '收起' : '更多模板' }}
            <i :class="showMore ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
          </span>
        </div> -->
        <div class="mb10">
          <span class="show-more"> 通用模版 </span>
        </div>
        <div class="other-list">
          <el-row :gutter="60">
            <data-set v-for="item in otherList" :key="item.title" :span="8">
              <data-set-item v-for="child in item.list" :key="child.label" :label="child.label" :class="{ gray: child.isGray }" @click.native="next(child)">
                {{ child.content }}
              </data-set-item>
            </data-set>
          </el-row>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import StepsHead from '@/components/StepsHead';
import DataSet from './components/DataSet';
import DataSetItem from './components/DataSetItem';
import { mapGetters } from 'vuex';
import * as tools from '@/utils/tools';

export default {
  components: {
    StepsHead,
    DataSet,
    DataSetItem
  },
  data() {
    const list = tools.copyFn(tools.otherList);
    return {
      showMore: true,
      otherList: list,
      dataSetList: tools.dataSetList,
      moreFoldType: {
        0: false,
        1: false,
        2: false
      }
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'currentUserGroup'])
  },
  created() {
    sessionStorage.removeItem('params');
  },
  methods: {
    isShow(data = {}) {
      if (data.title === '数据接入 Data Ingestion') {
        if (this.isAdmin) {
          return true;
        } else if (this.currentUserGroup?.dbc) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    handelMore(index) {
      this.moreFoldType[index] = !this.moreFoldType[index];
    },
    next(child) {
      if (child.isGray) {
        return;
      }
      this.$router.push({
        path: `/task/${child.path}`,
        query: {
          folderId: this.$route.query.folderId
        }
      });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  &::v-deep .el-card__body {
    .content_box {
      padding-left: 17%;
      .data-set-wrap {
        // margin-top: 20px;
        padding-right: 40px;
        .show-more {
          cursor: pointer;
          color: #409eff;
        }
      }
      .other-list {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin-bottom: 20px;
      }
    }
  }
  .gray {
    filter: grayscale(0.8);
  }
}
</style>
