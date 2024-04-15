<template>
  <Iframe :src="src" />
</template>

<script>
import Iframe from '@/components/Iframe';

export default {
  name: 'Cluster',
  components: {
    Iframe
  },
  data() {
    return {
      src: process.env.VUE_APP_CLUSTER_MANAGER_URL
    };
  }
};
</script>
