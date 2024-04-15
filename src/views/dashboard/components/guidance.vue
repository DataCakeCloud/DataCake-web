<template>
  <div class="guidance-wrapper" :class="{ close: !guidanceMode }">
    <div class="title">开始使用</div>
    <p class="tip">{{ txt1 }}</p>
    <p class="tip">{{ txt2 }}</p>

    <template v-if="userInfo.isAdmin">
      <div class="title">作为管理员</div>
      <template v-for="(item, index) in adminList">
        <div :key="index + 'admin'" class="admin-list list" @click="handleLink(item)">
          <div class="list-left">
            <div class="icon">
              <svg-icon :icon-class="item.leftIcon"></svg-icon>
            </div>
            <span class="text">{{ item.text }}</span>
          </div>
          <div class="right-icon">
            <svg-icon :icon-class="item.rightIcon"></svg-icon>
            <i class="el-icon-circle-check check-icon"></i>
          </div>
        </div>
      </template>
    </template>

    <template>
      <div class="title">探索 DataCake</div>
      <template v-for="(item, index) in exploreList">
        <div :key="index + 'explore'" class="explore-list list" @click="handleLink(item)">
          <div class="list-left">
            <div class="icon">
              <svg-icon :icon-class="item.leftIcon"></svg-icon>
            </div>
            <span class="text">{{ item.text }}</span>
          </div>
          <div class="right-icon">
            <svg-icon :icon-class="item.rightIcon"></svg-icon>
            <i class="el-icon-circle-check check-icon"></i>
          </div>
        </div>
      </template>
    </template>

    <div class="btn" @click="handleGuidanceMode">关闭</div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  name: '',
  data() {
    return {
      txt1: '使用 DataCake 您可以查询数据、构建数数据pipeline 、可视化数据结果、治理数据资产等。',
      txt2: '接下来的几个步骤将帮助您快速入门。',

      adminList: [
        // {
        //   leftIcon: 'gears',
        //   text: '云资源创建',
        //   link: 'Cloud',
        //   rightIcon: 'rightFill'
        // },
        // {
        //   leftIcon: 'dataSource',
        //   text: '挂载数据',
        //   link: 'ImportData',
        //   rightIcon: 'rightFill'
        // },
        {
          leftIcon: 'addUser',
          text: '邀请用户',
          link: 'user',
          rightIcon: 'rightFill'
        }
      ],

      exploreList: [
        {
          leftIcon: 'analysis',
          text: '运行你的第一个查询',
          link: 'DataAnalysis',
          rightIcon: 'rightFill'
        },
        {
          leftIcon: 'develop',
          text: '构建一个数据任务',
          link: 'TaskStep1',
          rightIcon: 'rightFill'
        },
        {
          leftIcon: 'workflow',
          text: '构建一个工作流',
          link: 'Workflow',
          rightIcon: 'rightFill'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'guidanceMode'])
  },
  methods: {
    handleGuidanceMode() {
      this.$store.dispatch('app/setGuidanceMode', !this.guidanceMode);
    },
    handleLink(item) {
      this.$router.push({ name: item.link });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.guidance-wrapper {
  position: relative;
  /* height: calc(100vh - $s-navbar-height); */
  height: calc(100%);
  transform: translate3d(-20px, -20px, 0);
  padding: 0 20px 20px;
  background: #e5eaf0;
  overflow-y: auto;

  &.close {
    display: none;
  }

  .title {
    height: 68px;
    line-height: 68px;
    font-weight: 500;
    font-size: $global-font-size-20;
  }

  .tip {
    line-height: 24px;
    color: #666;
  }

  .admin-list,
  .explore-list {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding-right: 10px;
    background: #fff;
    color: #527a5c;
    margin-bottom: 10px;
    border-radius: 4px;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #cbdfcc;
      color: #31403a;

      .right-icon {
        ::v-deep .svg-icon {
          display: block;
        }
      }
      .check-icon {
        display: none;
      }
    }

    .check-icon {
      display: block;
      font-size: $global-font-size-18;
      color: #4a7d58;
    }

    .list-left {
      height: 100%;
      display: flex;
      align-items: center;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 100%;
      margin-right: 10px;
      background: #6caa84;

      ::v-deep .svg-icon:first-child {
        color: #fff;
        width: 1.5em;
        height: 1.5em;
      }
    }

    .right-icon {
      ::v-deep .svg-icon {
        display: none;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 1.5em;
        height: 1.5em;
      }
    }
  }

  .btn {
    position: absolute;
    right: 30px;
    top: 25px;
    cursor: pointer;
  }
}
</style>
