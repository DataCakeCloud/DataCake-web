<template>
  <agile :autoplay="imgList.length > 1" :dots="imgList.length > 1" :infinite="imgList.length > 1" :nav-buttons="imgList.length > 1" class="banner dashboard-card">
    <template v-for="(item, index) in imgList">
      <div :key="index" :class="['slide', `slide_${index}`]">
        <img :src="item" />
      </div>
    </template>
  </agile>
</template>

<script>
import Vue from 'vue';
import VueAgile from '@/components/AgileSlider/src';

Vue.use(VueAgile);
export default {
  name: '',
  data() {
    const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);
    return {
      imgList: [!isCloud ? require('@/assets/banner/0.png') : require('@/assets/banner/1.png')]
    };
  }
};
</script>

<style lang="scss" res="stylesheet/sass">
.agile__nav-button {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: $global-font-size-24;
  height: 100%;
  position: absolute;
  top: 0;
  transition-duration: 0.3s;
  width: 40px;

  /* &:hover {
    background-color: rgba(#000, 0.5);
    opacity: 1;
  } */
  &.agile__nav-button--prev {
    left: 0;
  }
  &.agile__nav-button--next {
    right: 0;
  }
}

.agile__dots {
  bottom: 10px;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
}

.agile__dot {
  margin: 0 10px;
  button {
    background-color: transparent;
    border: 1px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    display: block;
    height: 10px;
    font-size: $global-font-size-0;
    line-height: 0;
    margin: 0;
    padding: 0;
    transition-duration: 0.3s;
    width: 10px;
  }

  &.agile__dot--current,
  &:hover button {
    background-color: #fff;
    border-radius: 50%;
  }
}
</style>

<style lang="scss" res="stylesheet/sass" scoped>
.banner {
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.slide {
  display: block;
  height: 240px;
  object-fit: cover;

  /* &.slide_0 {
    background: url(~@/assets/banner/0.png) no-repeat;
    background-size: cover;
  } */
  img {
    display: block;
    max-width: 100%;
  }
}
</style>
