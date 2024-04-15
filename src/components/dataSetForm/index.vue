<!--  chenyh1 -->
<template>
  <el-form ref="form" :model="model" label-width="100px" label-position="right" :disabled="disabled" class="form" :class="{ 'form--inline': inline }">
    <div v-if="title" class="form-title">{{ title }}</div>
    <div class="form-items">
      <template v-for="field in showFields">
        <el-form-item :key="field.key" :label="field.label + ':'" :required="field.required" :prop="field.key" :class="['form-item', { secondEle: field.cnTheme }]">
          <div v-if="field.readonly" class="form-item--readonly-mask" />
          <el-autocomplete v-if="field.type == 'autocomplete'" v-model="model[field.key]" :placeholder="field.placeholder" :fetch-suggestions="field.filter" class="block" />
          <el-input v-if="field.type == 'input'" v-model="model[field.key]" :placeholder="field.placeholder" :clearable="field.clearable">
            <template v-if="field.prepend" slot="prepend">{{ field.prepend(model) }}</template>
            <template v-if="field.append" slot="append">{{ field.append(model) }}</template>
          </el-input>
          <el-input v-if="field.type == 'textarea'" v-model="model[field.key]" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" :placeholder="field.placeholder" :clearable="field.clearable" />
          <el-input-number v-if="field.type == 'inputNumber'" v-model="model[field.key]" />
          <el-select v-if="field.type == 'select'" v-model="model[field.key]" class="block" :placeholder="field.placeholder" :clearable="field.clearable" :filterable="field.filterable">
            <el-option v-for="item in field.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-radio-group v-if="field.type == 'radio-btn'" v-model="model[field.key]" :clearable="field.clearable">
            <el-radio-button v-for="item in field.options" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
          </el-radio-group>
          <el-radio-group v-if="field.type == 'radio'" v-model="model[field.key]" :clearable="field.clearable">
            <el-radio v-for="(item, i) in field.options" :key="i" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
          <el-switch v-if="field.type == 'switch'" v-model="model[field.key]" />
        </el-form-item>
      </template>
      <template v-if="showFields.length < 3">
        <div v-for="i in 3 - showFields.length" :key="i" class="form-item"></div>
      </template>
    </div>
    <el-form-item :label="btnLabel" class="form-btns">
      <slot v-if="$slots.default" />
      <template v-else>
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="reset">重置</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script>
import { trigger, watch, wrapComponent } from '@/utils/vue-helpers';
import isEmpty from 'lodash/isEmpty';

export default wrapComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    btnLabel: {
      type: String,
      default: '\u200E'
    },
    fields: {
      type: Array,
      default() {
        return [];
      },
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    },
    defaultModel: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    showFields() {
      return (this.fields || []).filter(f => !f.hidden);
    }
  },
  data() {
    return {
      model: { ...this.defaultModel },
      activeWatchers: []
    };
  },
  methods: {
    @trigger('submit')
    submit() {
      return this.$refs.form.validate().then(() => ({ ...this.model }));
    },
    @watch('fields', true)
    resetModel(newFields) {
      const fields = newFields || this.fields;

      this.model = fields.reduce((m, f) => {
        const o = { ...m, [f.key]: f.value };
        if (f.secondKey) {
          o[f.secondKey] = f.secondValue;
        }
        return o;
      }, {});
      if (newFields && !isEmpty(this.defaultModel)) {
        Object.keys(this.model).forEach(k => this.defaultModel[k] && (this.model[k] = this.defaultModel[k]));
      }

      this.activeWatchers.forEach(fn => fn());
      this.activeWatchers = [];
      fields.forEach(field => {
        if (!field.options?.length) field.source?.(this.model);
        if (field.dependencies?.length) {
          this.activeWatchers.push(
            this.$watch(
              () => field.dependencies.reduce((r, key) => r + this.model[key], ''),
              () =>
                field.source?.(this.model).then(() => {
                  this.model[field.key] = field.value;
                })
            )
          );
        }
      });
    },
    @trigger('reset')
    reset() {
      this.resetModel();
      this.$refs.form.clearValidate();
      return { ...this.model };
    }
  }
});
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.form {
  .block {
    display: block;
  }
  &-title {
    margin-bottom: 16px;
    font-weight: 500;
    color: #2c3b5e;
    line-height: 1;
    font-size: $global-font-size-14;
    padding-left: 16px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: $c-primary;
    }
  }
  &-item {
    position: relative;
    &--readonly-mask {
      position: absolute;
      left: 0;
      top: 0;
      background: transparent;
      cursor: not-allowed;
      width: 100%;
      height: 100%;
      z-index: 100;
    }
  }
  &-btns {
    margin: 16px 0 0;
    &:empty {
      display: none;
    }
  }
  &--inline {
    background: #fff;
    border: 1px solid #eaf0f7;
    .form-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(366px, 1fr));
      justify-items: stretch;
      align-items: stretch;
      // justify-content: space-between;
      row-gap: 16px;
      ::v-deep .el-form-item {
        margin: 0;
      }
    }
  }
  .secondEle {
    ::v-deep .el-form-item__error {
      left: 20%;
    }
    ::v-deep .el-input-group__prepend {
      padding: 0;
      background: #fff;
    }
    .secondKeyEle {
      width: 90px;
      height: 30px;
      line-height: 30px;
      margin: 0 auto;
    }
    .cnNameInput {
      ::v-deep .el-input__inner {
        border: none;
        background: #fff;
        height: 28px;
      }
    }
  }
  .inputBox {
    ::v-deep .el-form-item__error {
      left: 0%;
      width: 140px;
    }
    ::v-deep .el-input-group__prepend {
      width: 100px;
    }
    ::v-deep .el-input-group__append {
      width: 135px;
      padding: 0;
      text-align: center;
    }
  }
}
</style>
