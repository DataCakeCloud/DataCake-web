<template>
  <div class="filter">
    <v-affix-box :offset-top="56">
      <v-form v-show="!collapsed" ref="form" btn-label="关键字:" inline :disabled="loading" :fields="filters" :default-model="defaultModel" class="filter-form" @submit="submitHandler" @reset="resetHandler">
        <div class="filter-form-footer">
          <el-input v-model="query" :placeholder="placeholder" class="filter-form-input" />
          <div class="filter-form-footer__btns">
            <el-button type="primary" :loading="loading" @click="$refs.form.submit()">查询</el-button>
            <el-button @click="$refs.form.reset()">重置</el-button>
            <el-button type="text" icon="el-icon-caret-top" @click="collapse">收起</el-button>
          </div>
        </div>
      </v-form>
      <div v-show="collapsed" class="filter-form-footer filter-form-footer--collapsed bg-white">
        <el-input v-model="query" :placeholder="placeholder" class="filter-form-input" />
        <div class="filter-form-footer__btns">
          <el-button type="primary" :loading="loading" @click="$refs.form.submit()">查询</el-button>
          <el-button @click="$refs.form.reset()">重置</el-button>
          <el-button type="text" icon="el-icon-caret-bottom" @click="collapse">展开</el-button>
        </div>
      </div>
    </v-affix-box>
    <slot />
    <v-affix-box :offset-bottom="0">
      <el-pagination class="filter-footer" hide-on-single-page background :page-size="10" layout="prev, pager, next" :total="count" :current-page.sync="currentPage" :disabled="loading" />
    </v-affix-box>
  </div>
</template>

<script>
import { trigger, watch, wrapComponent } from '@/utils/vue-helpers';
import qs from 'qs';
import vForm from '@/components/dataSetForm';

const changeQuery = (t, n, d) => {
  const fn = d.value;
  d.value = async function(...args) {
    const model = await fn.apply(this, args);
    const result = { ...model, query: this.query, offset: this.currentPage * 10 - 10 };
    const { origin, pathname, hash } = window.location;
    window.history.pushState(null, '', `${origin}${pathname}${this.$router.mode === 'hash' ? hash.split('?')[0] : ''}?${qs.stringify(result)}`);
    return result;
  };
};

export default wrapComponent({
  components: { vForm },
  props: {
    loading: { type: Boolean },
    count: { type: Number, default: 0 },
    filters: { type: Array, required: true },
    placeholder: { type: String, default: '请输入相关表名或字段进行搜索' }
  },
  data() {
    const values = qs.parse(this.$router.mode === 'hash' ? window.location.hash.split('?')[1] || '' : window.location.search.substr(1));
    return {
      query: values.query || '',
      defaultModel: this.filters.reduce((m, f) => ({ ...m, [f.key]: values[f.key] || f.value || '' }), {}),
      currentPage: (values.offset || 0) / 10 + 1,
      collapsed: false
    };
  },
  mounted() {
    this.$refs.form.submit();
  },
  methods: {
    @watch('currentPage')
    @trigger('search')
    @changeQuery
    changePage() {
      return this.defaultModel;
    },
    @trigger('search')
    @changeQuery
    async submitHandler(model) {
      const result = await model;
      this.defaultModel = result;
      return result;
    },
    @trigger('search')
    @changeQuery
    resetHandler(model) {
      this.query = '';
      this.defaultModel = model;
      this.currentPage = 1;
      return model;
    },
    collapse() {
      this.collapsed = !this.collapsed;
    }
  }
});
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.filter {
  &-form {
    margin: 0 0 16px;
    padding: 16px;
    &-footer {
      display: flex;
      justify-content: space-between;
      &--collapsed {
        padding: 16px;
        margin-bottom: 16px;
      }
      &__btns {
        flex: 0 0 auto;
      }
    }
    &-input {
      width: calc(66.66% - 33px);
      margin-right: 16px;
    }
  }
}
</style>
