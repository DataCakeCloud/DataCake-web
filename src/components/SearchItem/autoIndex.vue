<template>
  <div class="search-item" :class="{ dateRange: dateRange, isDate: isDate }" @mouseenter="enterBtn" @mouseleave="leaveBtn">
    <div class="label">{{ label + `${hasVal ? ': ' : ''}` }}</div>
    <div :class="['search-item-input']">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchItem',
  props: {
    dateRange: {
      type: Boolean,
      default: false
    },
    isDate: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Boolean, Array, Object, Number, null],
      default: null
    },
    maxWidth: {
      type: String,
      default: '15vw'
    },
    minWidth: {
      type: String,
      default: '70px'
    }
  },
  data() {
    return {
      hasVal: false,
      Dom: null
    };
  },
  watch: {
    value(val) {
      if (val === '') {
        this.Inpt.style.width = this.minWidth;
        this.hasVal = false;
      } else {
        this.hasVal = true;
        this.$nextTick(() => {
          this.getTextWidth();
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.Dom = this.$slots.default?.[0].elm;
      this.getInpt(this.Dom.children);
      this.Inpt.style.maxWidth = this.maxWidth;
      this.Inpt.style.minWidth = this.minWidth;
    });
  },
  methods: {
    getTextWidth() {
      const text = this.Inpt.value;
      // 创建一个隐藏的临时元素，用于计算文本宽度
      var tempElement = document.createElement('span');
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'pre'; // 保持空格和换行的格式
      tempElement.style.display = 'inline-block';
      tempElement.textContent = text;
      // 将临时元素添加到文档中
      document.body.appendChild(tempElement);
      // 获取文本的宽度
      var width = tempElement.offsetWidth;
      // 从文档中移除临时元素
      document.body.removeChild(tempElement);
      const widthNum = width + 35 > 70 ? width + 35 : 70;
      this.Inpt.style.width = widthNum + 'px';
    },
    getInpt(Dom) {
      const DomList = Array.from(Dom);
      DomList.forEach(item => {
        if (item.children.length) {
          this.getInpt(item.children);
        } else {
          if (item.nodeName === 'INPUT') {
            this.Inpt = item;
          }
        }
      });
    },
    enterBtn() {
      if (this.hasVal) {
        this.$nextTick(() => {
          this.getTextWidth();
        });
      } else {
        this.Inpt.style.width = this.minWidth;
      }
    },
    leaveBtn() {
      let dropFlag = false;
      const dropList = Array.from(document.querySelectorAll('.el-select-dropdown')) || [];
      dropList.some(item => {
        if (item.style.display !== 'none') {
          dropFlag = true;
          return;
        }
      });
      if (!this.hasVal && !dropFlag) {
        this.Inpt.style.width = this.minWidth;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.search-item {
  border-radius: 4px;
  border: 1px solid #d1d7e6;
  display: inline-flex;
  align-items: center;
  padding-left: 8px;
  line-height: 30px;
  height: 30px;
  margin-right: 12px;
  // margin-bottom: 8px;
  cursor: pointer;
  &:hover {
    border-color: #3782ff;
  }
  .label {
    white-space: nowrap;
  }
  ::v-deep {
    .el-input {
      line-height: 28px;
      height: 28px;
    }
    .el-input__inner {
      width: 70px;
      height: 100%;
      border: none;
      padding-left: 8px;
      padding-right: 26px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &::placeholder {
        font-size: $global-font-size-12;
      }
      &:focus {
        width: 100%;
      }
    }
    .el-input__prefix {
      height: 100%;
    }
  }
  .search-item-input {
    height: 100%;
    line-height: 1;
    overflow: hidden;
    ::v-deep {
      .el-select {
        height: 100%;
      }
      .el-autocomplete {
        height: 100%;
      }
      .search-input {
        height: 100%;
      }
      .el-input {
        position: relative;
        top: -1px;
        height: 100%;
        line-height: 100%;
      }
    }
    &.show {
      ::v-deep {
        .el-input__inner {
          width: 100%;
        }
      }
    }
  }
}
</style>
<style lang="scss">
// 时间选择器样式
.dateRange {
  .el-date-editor {
    min-width: 270px !important;
  }
  .el-input__inner {
    padding-right: 0px !important;
  }
}
.isDate {
  .el-input__inner {
    padding-left: 27px !important;
  }
  .el-input__icon {
    line-height: 28px;
  }
}
</style>
