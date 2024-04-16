<template>
  <div class="content">
    <div class="box1">
      <SearchItem v-model="editorInfo.editorDataLink" :label="$t('task.taskEditor14')">
        <el-select v-model="editorInfo.editorDataLink" size="mini" clearable filterable class="selectBox1">
          <el-option v-for="item in dataLinkArr" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </SearchItem>
    </div>
    <div>
      <SearchItem v-model="editorInfo.editorDataDb" :label="$t('task.taskEditor15')">
        <el-select v-model="editorInfo.editorDataDb" size="mini" clearable filterable class="selectBox2">
          <el-option v-for="item in dbArr" :key="item.name" :label="item.name" :value="item.name"> </el-option>
        </el-select>
      </SearchItem>
    </div>
  </div>
</template>
<script>
import SearchItem from '@/components/SearchItem/autoIndex.vue';
import { getDataSetList } from '@/api/task';
export default {
  components: {
    SearchItem
  },
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
      dataLinkArr: [
        {
          value: 'iceberg',
          label: 'Iceberg'
        }
      ],
      dbArr: []
    };
  },
  watch: {
    'editorInfo.region'(newV, oldV) {
      if (oldV !== '') {
        // 表示区域是手动切换的
        this.editorInfo.editorDataDb = '';
      }
      if (newV) {
        this.getDbArr();
      }
    }
  },
  methods: {
    getDbArr() {
      getDataSetList({ region: this.editorInfo.region, type: 'hive', metaFlag: 'AIRBYTE' }).then(res => {
        this.dbArr = res.data.data;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  .box1 {
    margin-right: 20px;
  }
  .search-item {
    ::v-deep {
      .el-input__suffix {
        top: 3px;
      }
    }
  }
}
</style>
