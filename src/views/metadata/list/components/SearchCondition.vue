<template>
  <el-card class="condition-box">
    <div class="search">
      <el-input v-model="params.keyWord" class="input" placeholder="请输入搜索表名称、表描述、表owner、字段名称、字段描述" clearable @keydown.enter.native="search">
        <el-button slot="append" @click="search">查询</el-button>
      </el-input>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'SearchCondition',
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      params: {
        keyWord: window.sessionStorage.getItem('metaKeyWord') || '',
        pageNum: 1
      }
    };
  },
  watch: {
    keyword(val) {
      this.params.keyWord = val;
    }
  },
  methods: {
    search() {
      window.sessionStorage.setItem('metaKeyWord', this.params.keyWord);
      this.$emit('updateList', this.params, 'keyWord');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.condition-box {
  margin-bottom: 10px;
  .search {
    width: 65%;
    margin: auto;
    .input {
      ::v-deep {
        .el-input-group__append {
          background-color: $c-primary;
          color: #fff;
          border-color: $c-primary;
        }
      }
    }
  }
}
</style>
