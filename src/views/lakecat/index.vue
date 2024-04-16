<template>
  <section id="micro-app"></section>
</template>

<script>
import { start } from 'qiankun';

export default {
  mounted() {
    if (!window.qiankunStarted) {
      window.qiankunStarted = true;
      start({ prefetch: false });
    }
  }
};
</script>
