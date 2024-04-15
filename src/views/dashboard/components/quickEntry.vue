<template>
  <div class="quick-entry">
    <template v-for="(item, index) in list">
      <el-card :key="index" class="dashboard-card quick-entry-card" @click.native="handleLink(item)">
        <div class="title">
          <svg-icon :icon-class="item.icon"></svg-icon>
          <span :class="['item', `item-${index}`]">{{ item.name }}</span>
        </div>
        <div class="content">{{ item.content }}</div>
        <div class="link">
          <span class="card-tip">立即进入</span>
        </div>
      </el-card>
      <div v-if="index !== list.length - 1" :key="`line-${index}`" class="honri-line">
        <svg-icon icon-class="nounArrow"></svg-icon>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { searchTree } from '@/utils/index';

export default {
  name: 'QuickEntry',
  data() {
    return {
      list: [
        {
          name: '数据分析',
          icon: 'analysis',
          content: '提供多引擎即时查询，帮助用户实现从数据查询到探查的一站式数据查询平台',
          link: `/data-analysis/query`,
          routerName: 'DataAnalysis'
        },
        {
          name: '元数据',
          icon: 'meta',
          content: '跨云跨区域的统一元数据服务，提供元数据查询、业务建表等能力。',
          link: `/meta/list`,
          routerName: 'MetaData'
        },
        {
          name: '数据开发',
          icon: 'develop',
          content: '易扩展的模板式任务开发、调度和监控，提供数据加工、单任务和工作流编排等功能。',
          link: `/task/list`,
          routerName: 'TaskList'
        },
        {
          name: '数据治理',
          icon: 'lakecat',
          content: '主动发现数据存储、任务计算待治理问题提供任务参数发布和存储策略修改等功能',
          routerName: 'Lakecat2'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['routers'])
  },
  methods: {
    handleLink(data) {
      if (data.routerName === 'Lakecat2') {
        return;
      }
      const haveRoute = searchTree(this.routers, 'children', 'name', data.routerName);
      if (haveRoute) {
        this.$router.push({
          path: data.link
        });
      } else {
        this.$message({
          center: true,
          type: 'warning',
          message: '权限不足,请联系管理员'
        });
      }
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
@import './title.scss';
.dashboard-card {
  cursor: pointer;
}
.quick-entry {
  display: flex;
  position: relative;
  margin-top: 20px;

  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    ::v-deep .svg-icon {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      color: #0b99ea;
    }
  }
  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: $global-font-size-16;
    font-weight: 500;

    /* &::before {
      display: inline-block;
      width: 50px;
      height: 50px;
      margin-right: 10px;
      content: '';
    } */
  }
  .item-0 {
    &::before {
      background: url(~@/assets/entry/analysis.png) no-repeat;
    }
  }
  .item-1 {
    &::before {
      background: url(~@/assets/entry/develop.png) no-repeat;
    }
  }
  .item-2 {
    &::before {
      background: url(~@/assets/entry/meta.png) no-repeat;
    }
  }
  .item-3 {
    &::before {
      background: url(~@/assets/entry/lakecat.png) no-repeat;
    }
  }

  .content {
    line-height: 23px;
    font-size: $global-font-size-12;
    margin-top: 20px;
    text-align: center;
  }

  .link {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    box-shadow: 0 -8px 10px 0 rgb(0 0 0 / 8%);
    padding-top: 20px;
    text-align: center;

    a {
      font-size: $global-font-size-12;
    }
  }
}

.quick-entry-card {
  position: relative;
  flex: 1;
  padding-bottom: 50px;
}
.quick-entry-card:hover {
  transform: scale(1.1);
  z-index: 1300;
}

.honri-line {
  margin: 0 5px;
  position: relative;
  top: 80px;

  ::v-deep .svg-icon {
    width: 50px;
    height: 35px;
  }
  /* &::after {
    display: inline-block;
    width: 33px;
    height: 14px;
    content: '';
    background: url(~@/assets/entry/right.png) no-repeat;
    background-size: cover;
  } */
}
.card-tip {
  color: #3782ff;
}
</style>
