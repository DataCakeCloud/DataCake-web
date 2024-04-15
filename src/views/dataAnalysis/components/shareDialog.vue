<template>
  <el-dialog title="分享" :visible.sync="dialogVisible" width="30%" class="shaerDial" @close="close">
    <div class="wrapper">
      <el-radio-group v-model="shareType" class="type">
        <el-radio label="one">个 人</el-radio>
        <el-radio label="all" :disabled="grade === 3">公 开</el-radio>
      </el-radio-group>
      <div v-show="shareType === 'one'" class="one_share">
        <el-form ref="form" :model="dialForm" label-width="80px">
          <el-form-item label="分享给:" prop="shareeEmail" :rules="[{ required: true, message: '请选择被分享者', trigger: 'change' }]">
            <el-select
              v-model="dialForm.shareeEmail"
              filterable
              placeholder="请输入用户邮箱"
              :remote-method="
                query => {
                  remoteMethod(query);
                }
              "
              remote
              :reserve-keyword="false"
              :loading="loadingSelect"
            >
              <el-option v-for="val in options" :key="val.value" :label="val.label" :value="val.value" @click.native="handelClick(val)"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="权限:" prop="grade" :rules="[{ required: true, message: '请选择权限级别', trigger: 'change' }]">
            <el-select v-model="dialForm.grade" placeholder="请选择权限">
              <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </div>
      </div>
      <div v-show="shareType === 'all'" class="all_share">
        <div class="box_item">
          <div class="title">链接:</div>
          <div class="url_box">
            {{ shareUrl }}
            <el-tooltip effect="dark" content="复制" placement="top" :enterable="false">
              <i class="el-icon-document-copy" @click="copyUrl(shareUrl)"></i>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import copy from 'copy-to-clipboard';
import { userPage } from '@/api/jurisdiction';

export default {
  name: 'ShareDialog',
  props: ['grade', 'shareUrl'],
  data() {
    return {
      shareType: 'one',
      dialogVisible: false,
      loadingSelect: false,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      dialForm: {
        sharee: '',
        shareeEmail: '',
        grade: ''
      },
      options: [],
      powerOptions: [
        {
          label: '编辑',
          value: '1'
        },
        // {
        //   label: '运行',
        //   value: '2'
        // },
        {
          label: '查看',
          value: '3'
        }
      ]
    };
  },
  computed: {
    gradeOptions() {
      const grade = this.grade ? this.grade + '' : '1';
      const index = this.powerOptions.findIndex(item => item.value === grade);
      return this.powerOptions.slice(index);
    }
  },
  methods: {
    copyUrl(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    handelClick(data) {
      this.dialForm.sharee = data.name;
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submitFn', JSON.parse(JSON.stringify(this.dialForm)));
          this.dialogVisible = false;
        }
      });
    },
    open() {
      this.dialogVisible = true;
    },
    close() {
      this.$refs.form.resetFields();
      this.options = [];
      this.shareType = 'one';
      this.$emit('close');
    },
    async remoteMethod(query, index) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userPage({ name: query, tenantId: this.tenantId })).data;
        this.loadingSelect = false;
        this.options = data.list.length > 0 ? data.list.map(item => ({ label: item.email, value: item.email, name: item.name })) : [];
      } else {
        this.options = [];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.shaerDial {
  .wrapper {
    .type {
      margin-bottom: 20px;
    }
    .one_share {
      .el-form {
        .el-select {
          width: 100%;
        }
      }
      .footer {
        text-align: end;
      }
    }
    .all_share {
      .box_item {
        display: flex;
        .title {
          margin-bottom: 10px;
          width: 60px;
          margin-right: 10px;
          text-align: end;
        }
        .url_box {
          line-height: 1.5;
          i {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
