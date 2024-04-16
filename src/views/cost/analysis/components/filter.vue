<template>
  <div class="filter-list">
    <span>分组维度：</span>
    <div class="filter-content">
      <template v-for="(item, index) in filterList">
        <a v-if="item.isCheck" :key="index" href="javascript:;" :class="{ active: item.active }" @click="handleClick(item, index)">{{ item.name }}</a>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: '',
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    queryGroup: Number
  },
  data() {
    const list = JSON.parse(JSON.stringify(this.$t('cost.filterList')));
    return {
      list: list,
      item: {}
    };
  },
  computed: {
    ...mapGetters(['isCloud', 'userInfo']),
    filterList() {
      if (!Object.keys(this.params).length) return [];
      let list = this.list.map(e => ({
        ...e,
        isCheck: !this.isCloud || this.userInfo.isSupperAdmin || e.isTenant === 1
      }));
      switch (this.params.roleView) {
        case 1:
          list = list.filter(e => e.type !== this.params.roleView);
          break;
      }

      list = list.map(e => {
        const item = { ...e, active: this.queryGroup === e.value };
        return item;
      });
      return list;
    }
  },
  methods: {
    handleClick(item, index) {
      if (item.active) {
        this.list.forEach(e => {
          e.active = false;
        });
      } else {
        this.list.forEach(e => {
          e.active = false;
        });
        this.list[index].active = true;

        this.item = item;
      }
      this.handleChange();
    },
    handleChange() {
      this.$emit('updateFilter', this.item);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.filter-list {
  display: flex;
  align-items: center;
  height: 20px;

  .filter-content {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    flex-wrap: wrap;
  }

  span {
    min-width: 80px;
  }
  a {
    margin-right: 5px;
    padding: 3px 5px;
    border-radius: 4px;

    &:hover,
    &.active {
      background: $c-primary;
      color: #fff;
    }
  }
}
</style>
