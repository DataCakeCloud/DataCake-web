<template>
  <div :class="['breadcrumb', 'navs-bread']">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
          <span v-if="item.redirect === 'noRedirect' || index == levelList.length - 1" class="no-redirect">{{ generateTitle(item.meta) }}</span>
          <span v-else @click.prevent="handleLink(item)">{{ generateTitle(item.meta) }}</span>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script>
import pathToRegexp from 'path-to-regexp';

export default {
  data() {
    return {
      levelList: null
    };
  },
  watch: {
    $route() {
      this.getBreadcrumb();
    }
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title);
      const first = matched[0];
      if (this.isDashboard(first)) {
        matched.shift();
      } else {
      }

      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false);
    },
    isDashboard(route) {
      const name = route && route.meta && route.meta.title;
      if (!name) {
        return false;
      }
      return name.trim().toLocaleLowerCase() === 'Home'.toLocaleLowerCase();
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route;
      var toPath = pathToRegexp.compile(path);
      return toPath(params);
    },
    handleLink(item) {
      const { redirect, path } = item;
      if (redirect) {
        this.$router.push(redirect);
        return;
      }
      this.$router.push(this.pathCompile(path));
    },
    generateTitle(meta) {
      const hasKey = this.$t('route.' + meta.title);
      const translatedTitle = this.$t('route.' + meta.title);
      let str = meta.title;
      if (hasKey) {
        str = translatedTitle;
      }
      if (meta.title === 'metadataDetail') {
        const routerQuery = this.$route?.query;
        if (routerQuery) str = str + ` ( ${routerQuery.databaseName}.${routerQuery.tableName} )`;
      }
      if (meta.isTaskTemplate && this.$route.query.taskName) {
        str = str + ` ( ${this.$route.query.taskName} )`;
      }
      return str;
    }
  }
};
</script>

<style lang="scss" scoped>
.breadcrumb {
  padding: 5px 10px;
  .el-breadcrumb {
    ::v-deep {
      .el-breadcrumb__inner {
        color: #fff;
        font-weight: 700 !important;
        cursor: pointer;
        &:hover {
          color: #4495e6;
        }
      }
    }
    .no-redirect {
      cursor: text;
      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
