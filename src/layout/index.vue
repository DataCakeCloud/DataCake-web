<template>
  <layout :hide-navbar="isSpaApp" :watermark="{ show: true }" :navbar-options="options">
    <float-ball v-model="feedback" @input="handleInpout"></float-ball>
  </layout>
</template>

<script>
// https://gitlab.ushareit.me/web/admin_workflow/shareit-adminui
import { start } from 'qiankun';
import Layout from './components/layout';
import FloatBall from '@/components/FloatBall';
import { mapGetters } from 'vuex';
import checkOneUser from '@/utils/checkOneUser';
export default {
  name: 'LayoutWapper',
  components: {
    Layout,
    FloatBall
  },
  data() {
    const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);
    return {
      feedback: this.$route.query.feedback === 'true',
      options: {
        fixedRouterNum: 6,
        fullscreen: false,
        rightFixedRouter: ['/admin/order/list'],
        isOpenMenuAll: true,
        logo: {
          src: !isCloud ? require('@/assets/logo/logo-ds.svg') : require('@/assets/logo/logo-cloud.svg')
        },
        userAvatar: {
          src: !isCloud ? require('@/assets/avatar/ds.png') : require('@/assets/avatar/cloud.png')
        }
      }
    };
  },
  computed: {
    ...mapGetters(['isSpaApp']),
    ...mapGetters(['userInfo'])
  },
  mounted() {
    checkOneUser('ST_VUE-TOKEN', 3, this.tipsCallFunction, 'cookie');
  },
  methods: {
    start,
    handleInpout(feedback) {
      this.feedback = feedback;
      this.$router.push({ query: { ...this.$route.query, feedback: this.feedback } });
    },
    tipsCallFunction() {
      this.$message({
        type: 'warning',
        message: '检测新用户登录，当前页面会在3s之后刷新!',
        duration: 3000
      });
    }
  },

  beforeRouteUpdate(to, from, next) {
    this.feedback = to.query.feedback;
    next();
  }
};
</script>
