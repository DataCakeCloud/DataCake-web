<template>
  <!-- eslint-disable vue/require-component-is -->
  <component v-bind="linkProps(to)" @click="close">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '../../../utils/validate.js';
import { close } from '../../../utils/weakStore';

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    close,
    linkProps(url) {
      if (isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        };
      }
      return {
        is: 'router-link',
        to: url
      };
    }
  }
};
</script>
