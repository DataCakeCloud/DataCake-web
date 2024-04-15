<template>
  <div :class="['chat-dialog', chatLeft ? '' : 'flex-end']">
    <template v-if="chatLeft">
      <div class="user-box">
        <el-avatar size="small" icon="el-icon-user-solid"></el-avatar>
        <div>{{ user }}</div>
      </div>
      <div class="bubble-box">
        <slot></slot>
        <div class="bubble-arrow right"></div>
      </div>
    </template>
    <template v-else>
      <div class="bubble-box left">
        <slot></slot>
        <div class="bubble-arrow left"></div>
      </div>
      <div class="user-box">
        <el-avatar size="small" icon="el-icon-user-solid"></el-avatar>
        <div>{{ user }}</div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'ChatDialog',
  props: {
    chatLeft: {
      type: Boolean,
      default: true
    },
    user: {
      type: String,
      default: 'user'
    }
  }
};
</script>
<style lang="scss" scoped>
.chat-dialog {
  margin-bottom: 10px;
  display: flex;
  &.flex-end {
    justify-content: flex-end;
  }
  .user-box {
    width: 80px;
    text-align: center;
  }
  .bubble-box {
    /* flex: 1; */
    position: relative;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #e1e5ef;
    padding: 12px;
    color: #445782;
    line-height: 1.4;
    text-align: justify;
    font-size: $global-font-size-14;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    word-break: break-all;
    max-width: 50%;
    &.left {
      background: #e5f6ff;
      border: 0;
    }
    .bubble-arrow {
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      border-width: 6px;
      top: 8px;
      &::after {
        content: ' ';
        border-width: 6px;
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        border-color: transparent;
        border-style: solid;
      }
      &.right {
        left: -6px;
        margin-bottom: 3px;
        border-right-color: #e1e5ef;
        border-left-width: 0;
        &::after {
          bottom: -6px;
          left: 1px;
          border-right-color: #fff;
          border-left-width: 0;
        }
      }
      &.left {
        right: -6px;
        margin-bottom: 3px;
        border-right-width: 0;
        // border-left-color: #e1e5ef;
        &::after {
          right: 1px;
          bottom: -6px;
          margin-left: -6px;
          border-right-width: 0;
          border-left-color: #e5f6ff;
        }
      }
    }
  }
}
</style>
