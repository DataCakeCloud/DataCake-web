<template>
  <el-card class="guidance-wrapper">
    <div class="title">平台使用流程简介</div>
    <div class="list">
      <template v-for="(item, index) in titleList">
        <div :key="index" class="list-item">
          <span class="order">{{ index + 1 }}</span>
          <span class="text">{{ item }}</span>
        </div>
      </template>
    </div>

    <div class="title">请选择您的订阅计划</div>
    <el-card class="subscribe-card">
      <div class="card-title">共享计算模式</div>

      <template v-for="(item, index) in cardList">
        <div :key="index" class="card-list"><svg-icon icon-class="success"></svg-icon> {{ item }}</div>
      </template>

      <el-button type="primary" size="auto" class="select-btn" @click="handleHome">选择共享模式</el-button>
    </el-card>
  </el-card>
</template>

<script>
import { setToken } from '../../utils/auth';
export default {
  name: 'Guidance',
  data() {
    return {
      titleList: ['选择订阅计划', '选择云资源注册', '云资源授权', '数据挂载', '开始功能使用'],
      cardList: ['优质的计算资源', '独立的存储资源', '基于角色访问控制'],
      token: window.sessionStorage.getItem('datacake_token')
    };
  },
  created() {
    // const domain = process.env.VUE_APP_ENV === 'cloud-aws-development' ? 'localhost' : '.datacake.cloud';
    const domain = process.env.VUE_APP_ENV === 'cloud-aws-development' ? 'localhost' : window.location.host;
    setToken(this.token, { domain });
  },
  methods: {
    handleHome() {
      window.location.replace(process.env.VUE_APP_ENV === 'cloud-aws-development' ? `http://localhost:9528` : `${process.env.VUE_APP_DATACAKE_FRONTEND}/config/cloud`);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
$login-bj-color: #7c6bdf;
::v-deep .el-button--primary {
  background-color: $login-bj-color !important;
  border-color: $login-bj-color !important;
}
.guidance-wrapper {
  /* position: fixed;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 80%; */
  min-height: calc(100vh);

  .title {
    font-size: $global-font-size-28;
    font-weight: 500;
  }

  .list {
    display: flex;
    align-items: center;
    height: 80px;
    margin-bottom: 20px;

    .list-item {
      display: flex;
      height: 100%;
      align-items: center;
      margin-right: 30px;
    }
    .order {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
      width: 1.5em;
      height: 1.5em;
      border-radius: 50%;
      color: #fff;
      background: $c-primary;
    }
  }

  .subscribe-card {
    width: 300px;
    margin-top: 20px;

    .card-title {
      font-size: $global-font-size-20;
      font-weight: 500;
      margin-bottom: 20px;
      color: #666;
    }
    .card-list {
      display: flex;
      align-items: center;
      line-height: 50px;
      ::v-deep .svg-icon {
        width: 1.2em;
        height: 1.2em;
        margin-right: 10px;
      }
    }

    .select-btn {
      width: 100%;
      mrgin-top: 20px;
    }
  }
}
</style>
