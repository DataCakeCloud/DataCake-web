<template>
  <div class="crontab">
    <div class="label">{{ crontab.crontab }}</div>
  </div>
</template>

<script>
export default {
  props: {
    crontab: {
      required: true,
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.crontab {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 60px;
  height: 60px;
  border: 1px solid #5f95ff;
  border-radius: 50%;
  padding: 12px;
  overflow: hidden;
  background: #fff;
  .label {
    word-break: break-all;
    color: #333;
    font-size: $global-font-size-12;
    line-height: 1.6;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; //多行在这里修改数字即可
    overflow: hidden;
    /* autoprefixer: ignore next */
    -webkit-box-orient: vertical;
  }
}
</style>
