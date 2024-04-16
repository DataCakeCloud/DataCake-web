<template>
  <div v-loading="loading" class="metadata-model">
    <el-tabs v-if="editableTabs.length" v-model="editableTabsValue" type="card" editable :class="['model-tabs', { 'disabled-tabs': editableTabs.length >= 4 }]" @edit="handleTabsEdit">
      <el-tab-pane v-for="item in editableTabs" :key="item.id" :label="item.name" :name="item.name">
        <template slot="label">
          <template>
            <el-tooltip class="item" effect="dark" content="双击修改模型" :disabled="item.id === 0 || !userInfo.isAdmin" :open-delay="600" placement="top">
              <span @dblclick="editorModel(item)">
                {{ item.name }}
              </span>
            </el-tooltip>
          </template>
        </template>
        <TabItem :data="item" @getModelTree="getModelTree" />
      </el-tab-pane>
    </el-tabs>
    <el-empty v-else description="暂无数据"></el-empty>
    <AddModel ref="AddModel" @addModel="addModel" />
  </div>
</template>

<script>
import TabItem from './components/tabItem';
import AddModel from './components/addModel';
import { getModelTree } from '@/api/metadata';
import { mapGetters } from 'vuex';

export default {
  name: 'Model',
  components: {
    TabItem,
    AddModel
  },
  data() {
    return {
      editableTabs: [],
      editableTabsValue: '',
      loading: false
    };
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    this.getModelTree();
  },
  methods: {
    getModelTree() {
      this.loading = true;
      getModelTree()
        .then(res => {
          this.editableTabs = this.formatData(res.data);
          if (this.editableTabs.length) {
            this.editableTabsValue = this.editableTabs[0].name;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatData(data = [], level = 0) {
      data.forEach(item => {
        item.level = level;
        item['name' + level] = item.name;
        if (item.children && item.children.length) {
          item.children = this.formatData(item.children, level + 1);
        }
      });
      return data;
    },
    handleTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.editableTabs.length >= 4) return;
        this.$refs.AddModel?.show();
      }
    },
    editorModel(data) {
      if (data.id === 0 || !this.userInfo.isAdmin) return;
      this.$refs.AddModel?.show(data);
    },
    addModel(data) {
      this.editableTabsValue = data.name;
      this.getModelTree();
    }
  }
};
</script>

<style lang="scss" scoped>
.metadata-model {
  padding: 10px;
  .model-tabs {
    ::v-deep {
      .el-icon-close {
        display: none;
      }
      .el-tabs__header {
        display: flex;
        flex-direction: row-reverse;
        justify-content: start;
      }
      .el-tabs__new-tab {
        width: 16px !important;
        height: 37px !important;
        border: none;
        .el-icon-plus {
          color: $c-primary;
          font-size: $global-font-size-18;
        }
      }
      .el-tabs__content {
        min-height: calc(100vh - 106px);
      }
      .el-tabs__item {
        padding: 0 15px !important;
      }
    }
    &.disabled-tabs {
      ::v-deep {
        .el-tabs__new-tab {
          cursor: not-allowed;
          .el-icon-plus {
            color: #c0c4cc !important;
          }
        }
      }
    }
  }
}
</style>
