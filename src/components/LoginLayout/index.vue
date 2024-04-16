<template>
  <div class="datacake-login-container">
    <div :class="['login-left', lang]">
      <!-- <div class="login-logo"></div>

      <div class="login-content">
        <p class="desc font-size-32"><span>多云</span> 一站式自助化大数据平台</p>
        <p class="desc-2 desc-3 font-size-20">让大数据易如反掌</p>
        <p class="desc-2 desc-4 font-size-18">Master DataOps</p>
        <p class="desc-2 desc-4 font-size-18">Leverage Multi-Cloud</p>
        <p class="desc-2 desc-4 font-size-18">Cover FinOps</p>
      </div> -->
    </div>
    <!-- <div class="login-left"></div> -->
    <el-card class="login-right">
      <slot></slot>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'LoginLayout',
  data() {
    let lang = window.navigator.language || window.navigator.userLanguage;
    lang = lang.substr(0, 2);
    return {
      lang: lang || 'zh'
    };
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
$loginWidth: 570px;
$login-bj-color: #5a2bca;

.datacake-login-container {
  height: calc(100vh);
  width: 100%;
  display: flex;
  box-sizing: border-box !important;
  overflow-y: hidden;
  overflow-x: scroll;
}

.login-left {
  position: relative;
  width: $loginWidth;
  min-width: 300px;
  background: $login-bj-color url(../../assets/loginBgZh.svg) no-repeat center top;
  &.en {
    background: $login-bj-color url(../../assets/loginBgEn.svg) no-repeat center top;
  }
  &.zh {
    background: $login-bj-color url(../../assets/loginBgZh.svg) no-repeat center top;
  }
  /* background-size: cover; */

  .login-logo {
    width: 15em;
    height: 5em;
    background: url(../../assets/logoLogin.svg) no-repeat;
  }
  .login-content {
    position: absolute;
    width: 100%;
    top: 120px;
    left: 0;
    color: #fff;
    font-style: normal;

    .desc {
      font-weight: 500;
      line-height: 44px;
      margin-bottom: 12px;
      text-align: center;

      span {
        color: rgb(23, 255, 201);
      }
    }

    .desc-2 {
      font-weight: 400;
      text-indent: 180px;
      opacity: 0.8;
    }

    .desc-3 {
      margin: 20px 0 30px;
      text-indent: 146px;
      font-weight: 500;
    }

    .desc-4 {
      margin: 15px 180px 0 146px;
      padding: 8px 20px;
      border-radius: 20px;
      text-indent: 0;
      background: #fff;
      color: $login-bj-color;
    }
  }
}

.login-right {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh);
  width: calc(100% - $loginWidth);
  min-width: 350px;
  border-radius: 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  font-family: Roboto, PingFang SC, sans-serif !important;

  ::v-deep .el-card__body {
    width: 488px;
  }
}
/*
@media (min-width: 1024px) and (max-width: 1280px) {
  .login-left {
    background-size: 60%;
  }
}

@media (max-width: 1024px) {
  .login-left {
    background: $login-bj-color;
  }
} */
</style>
