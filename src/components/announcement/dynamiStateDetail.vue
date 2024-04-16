<template>
  <el-dialog v-loading="loading" :title="title" center :visible="visible" :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <div v-viewer class="detail" v-html="detail"></div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">关闭</el-button>
    </div>

    <viewer :images="images">
      <img v-for="src in images" :key="src" :src="src" />
    </viewer>
  </el-dialog>
</template>

<script>
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';
import Vue from 'vue';
Vue.use(Viewer);
export default {
  name: 'DynamiStateDetail',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: Boolean,
    title: {
      type: String,
      default: ''
    },
    detail: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisiable: this.visible,
      images: []
    };
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    cancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.detail {
  max-height: calc(50vh);
  overflow-y: auto;
  ::v-deep p {
    line-height: 23px;
  }
  ::v-deep img {
    display: block;
    max-width: 100%;
  }
}
</style>
