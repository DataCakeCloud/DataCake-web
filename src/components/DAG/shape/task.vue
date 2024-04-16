<template>
  <div class="task">
    <!-- <img class="logo" :src="logo" :alt="id" /> -->
    <a v-if="url" class="label url" @click="jump" v-html="id"></a>
    <span v-else class="label" v-html="id"></span>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      required: true,
      type: String,
      default() {
        return '';
      }
    },
    url: {
      type: String,
      default: ''
    }
  },
  computed: {
    logo() {
      return 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg';
    }
  },
  methods: {
    jump() {
      const id = this.id.split('<br')[0];
      const name = this.id.split('<br/>')[1];
      const href = this.$router.resolve({
        path: this.url,
        query: {
          id: id,
          name: name
        }
      }).href;
      window.open(href, '_blank');
    }
  }
};
</script>

<style lang="scss" scoped>
.task {
  display: flex;
  align-items: center;
  width: 200px;
  height: 50px;
  background-color: #5f95ff;
  border: 1px solid #5f95ff;
  border-radius: 4px;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 12px;

  .logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }
  .label {
    display: inline-block;
    flex: 1;
    margin-left: 8px;
    color: #fff;
    font-size: $global-font-size-12;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .url {
    &:hover {
      color: $c-primary !important;
      text-decoration: underline;
    }
  }
}
</style>
