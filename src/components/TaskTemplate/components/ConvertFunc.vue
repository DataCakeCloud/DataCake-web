<template>
  <el-dialog :title="'输入字段' + name + '转换函数管理'" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false" @close="resetFunc">
    <div class="dialog-body">
      <div class="tag-wrap">
        <label class="tag-label">已添加的函数</label>
        <div class="tag-group">
          <el-popover v-for="(item, index) in funcs" :key="index" trigger="hover" placement="bottom" popper-class="tag-popper">
            <div>函数名：{{ item.funcName }}</div>
            <div>参数：{{ item.funcParams.join(',') }}</div>
            <el-tag slot="reference" class="tag-item" closable @close="removeTag(index)">{{ item.funcName }}</el-tag>
          </el-popover>
        </div>
      </div>
      <el-divider></el-divider>
      <el-form ref="ruleForm" :model="ruleForm" label-width="100px">
        <el-form-item label="新增函数">
          <el-select v-model="ruleForm.funcName" placeholder="请选择新增函数">
            <el-option v-for="(value, key) in funcList" :key="key" :value="key" :label="key"></el-option>
          </el-select>
          <a class="link" @click="clickDoc">查看详细说明文档</a>
          <div class="desc">{{ ruleForm.funcName && funcList[ruleForm.funcName].description }}</div>
        </el-form-item>
        <template v-if="ruleForm.funcName">
          <el-form-item v-for="(item, index) in funcList[ruleForm.funcName].params" :key="index" :label="'参数' + (index + 1)">
            <el-select v-if="item.valueList" v-model="item.value" placeholder="请选择" style="width: 100%">
              <el-option v-for="value in item.valueList" :key="value" :label="value" :value="value"></el-option>
            </el-select>
            <el-radio-group v-else-if="item.radioList" v-model="item.value">
              <el-radio v-for="(radioItem, radioKey) in item.radioList" :key="radioKey" :label="radioItem.value">{{ radioItem.name }}</el-radio>
            </el-radio-group>
            <el-input v-else v-model="item.value" placeholder="请输入" :disabled="item.disabled"></el-input>
            <div class="desc">{{ item.comment }}</div>
          </el-form-item>
        </template>
        <el-form-item v-show="ruleForm.funcName">
          <el-button type="primary" @click="addFunc">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { number } from 'echarts/core';
export default {
  name: 'ConvertFunc',
  data() {
    return {
      dialogVisible: false,
      index: '',
      name: '',
      funcs: [],
      ruleForm: {
        funcName: ''
      },
      funcList: {
        dx_digest: {
          description: '',
          params: [
            {
              value: 'md5',
              disabled: true,
              comment: ''
            },
            {
              value: 'toUpperCase',
              disabled: true,
              comment: ''
            }
          ]
        },
        dx_substr: {
          description: '从字符串的指定位置（包含）截取指定长度的字符串。如果开始位置非法抛出异常。如果字段为空值，直接返回（即不参与本transformer）',
          params: [
            {
              value: '',
              comment: '字段值的开始位置'
            },
            {
              value: '',
              comment: '目标字段长度'
            }
          ]
        },
        dx_pad: {
          description: '如果源字符串长度小于目标字段长度，按照位置添加pad字符后返回。如果长于，直接截断（都截右边）。如果字段为空值，转换为空字符串进行pad，即最后的字符串全是需要pad的字符',
          params: [
            {
              value: '',
              valueList: ['l', 'r'],
              comment: '可输入："l","r", "l"是在头进行pad，"r"是尾进行pad'
            },
            {
              value: '',
              comment: '目标字段长度'
            },
            {
              value: '',
              comment: '需要pad的字符'
            }
          ]
        },
        dx_replace: {
          description: '从字符串的指定位置（包含）替换指定长度的字符串。如果开始位置非法抛出异常。如果字段为空值，直接返回（即不参与本transformer）',
          params: [
            {
              type: number,
              value: '',
              comment: '字段值的开始位置'
            },
            {
              type: number,
              value: '',
              comment: '需要替换的字段长度'
            },
            {
              value: '',
              comment: '需要替换的字符串'
            }
          ]
        },
        dx_filter: {
          description: '如果匹配正则表达式，返回Null，表示过滤该行。不匹配表达式时，表示保留该行。（注意是该行）。对于>=<都是对字段直接compare的结果.',
          params: [
            {
              value: '',
              valueList: ['like', 'not like', '>', '=', '<', '>=', '!=', '<='],
              comment: '运算符，支持以下运算符：like, not like, >, =, <, >=, !=, <='
            },
            {
              value: '',
              comment: '正则表达式（java正则表达式）、值'
            }
          ]
        },
        dx_ede: {
          description: '',
          params: [
            {
              value: true,
              radioList: [
                { name: '加密', value: true },
                { name: '解密', value: false }
              ],
              comment: ''
            },
            {
              value: '',
              comment: ''
            }
          ]
        }
      }
    };
  },
  methods: {
    showWin(row, index) {
      this.dialogVisible = true;
      this.index = index;
      this.name = row.name;
      this.funcs = row.funcs || [];
    },
    addFunc() {
      this.funcs.push({
        funcName: this.ruleForm.funcName,
        funcParams: this.funcList[this.ruleForm.funcName].params.map(item => item.value)
      });
      this.resetFunc();
    },
    resetFunc() {
      if (this.ruleForm.funcName) {
        this.funcList[this.ruleForm.funcName].params.forEach(item => {
          item.value = '';
        });
        this.ruleForm.funcName = '';
      }
    },
    removeTag(index) {
      this.funcs.splice(index, 1);
    },
    clickDoc() {
      window.open('https://shimo.im/docs/pmkxQmWOO4COMKAN#anchor-RnHU', '_blank');
    },
    save() {
      this.$emit('save', this.funcs, this.index);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-body {
  .tag-wrap {
    display: flex;
    .tag-label {
      font-weight: normal;
      width: 94px;
      line-height: 24px;
    }
    .tag-group {
      flex: 1;
      .tag-item {
        margin: 0 5px 5px;
      }
    }
  }
  .desc {
    font-size: $global-font-size-12;
    color: #8c8c8c;
    line-height: normal;
  }
}
</style>
