<template>
  <iframe class="iframe" :src="newSrc"></iframe>
</template>

<script>
export default {
  name: 'Iframe',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  computed: {
    newSrc() {
      return this.src + `?time=${new Date().getTime()}`;
    }
  }
};
</script>
<style>
.iframe {
  width: calc(100vw - 45px);
  height: calc(100vh - 48px);
  border: none;
}
</style>
