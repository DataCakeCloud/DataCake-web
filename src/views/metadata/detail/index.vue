<template>
  <div class="detial">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="baseInfo">
        <BaseInfo ref="baseInfo" :group-options="groupOptions" :authority="authority" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columns">
        <Columns ref="columns" :authority="authority" @setColums="setColums" />
      </el-tab-pane>
      <el-tab-pane label="数据样本" name="samples">
        <Samples ref="samples" />
      </el-tab-pane>
      <el-tab-pane v-if="userInfo.isAdmin" label="访问信息" name="access">
        <Access ref="access" />
      </el-tab-pane>
      <!-- <el-tab-pane label="产出来源" name="source">
        <Source />
      </el-tab-pane> -->
      <el-tab-pane v-if="userInfo.isAdmin" label="授权记录" name="permission">
        <Permission ref="permission" :group-options="groupOptions" />
      </el-tab-pane>
      <el-tab-pane label="表血缘" name="tableRecourse">
        <TableRecourse ref="tableRecourse" :active-name="activeName" />
      </el-tab-pane>
      <el-tab-pane label="字段血缘" name="columnRecourse" :disabled="!colums.length">
        <ColumnRecourse ref="columnRecourse" :colums="colums" :active-name="activeName" />
      </el-tab-pane>
    </el-tabs>
    <div class="refresh">
      <el-button type="text" @click="handelRefresh">
        <i class="el-icon-refresh"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
import BaseInfo from './components/baseInfo.vue';
import Columns from './components/columns.vue';
import Samples from './components/samples.vue';
import Access from './components/access.vue';
// import Source from './components/Source.vue';
import Permission from './components/Permission.vue';
import TableRecourse from './components/tableRecourse.vue';
import ColumnRecourse from './components/columnRecourse.vue';
import { getGroupPage } from '@/api/jurisdiction';
import { doAuth } from '@/api/metadata';
import { mapGetters } from 'vuex';

export default {
  name: 'Detial',
  components: {
    BaseInfo,
    Columns,
    Samples,
    Access,
    // Source,
    Permission,
    TableRecourse,
    ColumnRecourse
  },
  data() {
    return {
      activeName: 'baseInfo',
      groupOptions: [],
      authority: false,
      route: this.$route.query || {},
      colums: []
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    const type = this.$route.query.type;
    if (type) {
      this.activeName = type;
    }
    this.doAuth();
    this.getGroupPage();
  },
  methods: {
    handelRefresh() {
      this.$refs.baseInfo?.getTableInfo(true);
      this.$refs.columns?.column();
      this.$refs.samples?.getData();
      this.$refs.access?.tableProfileInfo();
      this.$refs.permission?.getList();
      this.$refs.tableRecourse?.getData();
      this.$refs.columnRecourse?.getData();
    },
    setColums(data) {
      this.colums = data;
    },
    doAuth() {
      const params = {
        catalogName: this.route.region || '',
        operation: 'ALTER_TABLE',
        projectId: this.userInfo.tenantName,
        qualifiedName: `${this.route.region}.${this.route.databaseName}.${this.route.tableName}`,
        region: this.route.region
      };
      return doAuth(params).then(res => {
        this.authority = res.data;
      });
    },
    getGroupPage() {
      const params = {
        tenantId: this.userInfo.tenantId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(res => {
        this.groupOptions = res.data.list || [];
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.detial {
  padding: 10px;
  position: relative;
  .refresh {
    position: absolute;
    right: 5px;
    top: 10px;
    cursor: pointer;
    color: $c-primary;
    .el-icon-refresh {
      padding: 5px 10px;
      border-radius: 3px;
      font-size: $global-font-size-18;
    }
    &:hover .el-icon-refresh {
      background-color: #eef5fe;
    }
  }
}
</style>
