<template>
  <el-dialog v-loading="loading" title="新建公告" :visible="visible" width="750" :close-on-click-modal="false" @update:visible="dialogVisiable = $event">
    <el-form ref="form" :model="params" :rules="rules" label-position="left" label-width="80px">
      <el-form-item prop="name" label="公告名称">
        <el-input v-model="params.name" placeholder="请输入公告名称"></el-input>
      </el-form-item>
      <el-form-item prop="content" label="公告内容">
        <quill-editor ref="myQuillEditor" v-model="params.content" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)"></quill-editor>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { utf8_to_b64, b64_to_utf8 } from '@/utils/';
import { add, update } from '@/api/dashboard';
import { getToken } from '@/utils/auth';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { quillEditor, Quill } from 'vue-quill-editor';
// import { container, ImageExtend, QuillWatch } from 'quill-image-extend-module';
import { container, ImageExtend, QuillWatch } from 'quill-image-super-solution-module';
Quill.register('modules/ImageExtend', ImageExtend); // 注册扩展模块

export default {
  name: 'CreatAnnoucement',
  components: {
    quillEditor
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: Boolean,
    editData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const whiteList = ['development', 'cloud-aws-development'];
    return {
      dialogVisiable: this.visible,
      submitLoading: false,
      params: {
        name: '',
        content: ''
      },
      editorOption: {
        placeholder: '请输入公告内容... ...',
        modules: {
          ImageExtend: {
            loading: true, // 可选参数 是否显示上传进度和提示语
            name: 'image', // 图片参数名
            size: 10, // 可选参数 图片大小，单位为M，1M = 1024kb
            action: `${whiteList.includes(process.env.VUE_APP_ENV) ? process.env.VUE_APP_BASE_API_GATEWAY : process.env.VUE_APP_API_GATEWAY_PATH}ds_task/announcement/upload`, // 服务器地址, 如果action为空，则采用base64插入图片 process.env.VUE_APP_API_PATH
            // response 为一个函数用来获取服务器返回的具体图片地址
            // 例如服务器返回{code: 0; data:{ url: 'baidu.com'}}
            // 则 return res.data.url
            accept: 'image/jpg, image/png, image/gif, image/jpeg, image/bmp, image/x-icon',
            response: res => {
              return res.data;
            },
            headers: xhr => {
              xhr.setRequestHeader('Authentication', getToken());
            }, // 可选参数 设置请求头部
            // start: () => {}, // 可选参数 自定义开始上传触发事件
            // end: () => {}, // 可选参数 自定义上传结束触发的事件，无论成功或者失败
            // error: () => {}, // 可选参数 自定义网络错误触发的事件
            change: (xhr, formData) => {
              // formData.append('type', 1);
            } // 可选参数 选择图片触发，也可用来设置头部，但比headers多了一个参数，可设置formData
          },
          toolbar: {
            container: container, // container为工具栏，此次引入了全部工具栏，也可自行配置
            handlers: {
              image() {
                QuillWatch.emit(this.quill.id);
              }
            }
          }
        }
      },

      rules: {
        name: [{ required: true, message: '请输入公告名称', trigger: ['blur', 'change'] }],
        content: [{ required: true, message: '请输入公告内容', trigger: ['blur', 'change'] }]
      }
    };
  },
  watch: {
    visible() {
      this.dialogVisiable = this.visible;
    },
    dialogVisiable(val) {
      this.$emit('update:visible', val);
    },
    editData: {
      handler(val) {
        if (!Object.keys(val).length) {
          this.params.name = '';
          this.params.content = '';
          this.submitLoading = false;
        } else {
          this.params.name = b64_to_utf8(this.editData.name);
          this.params.content = b64_to_utf8(this.editData.content);
          this.submitLoading = false;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onEditorBlur() {},
    onEditorFocus() {},
    onEditorReady() {},
    cancel() {
      this.$emit('update:visible', false);
    },
    ok() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          let params = Object.assign({}, this.params);
          params.name = utf8_to_b64(params.name);
          params.content = utf8_to_b64(params.content);
          if (Object.keys(this.editData).length) {
            params = Object.assign({}, params, { id: this.editData.id });
            update(params).then(res => {
              this.submitLoading = false;
              this.$message({
                type: 'success',
                message: '编辑公告成功'
              });
              this.$emit('update:visible', false);
              this.$emit('updateList');
            });
          } else {
            add(params).then(res => {
              this.submitLoading = false;
              this.$message({
                type: 'success',
                message: '新建公告成功'
              });
              this.$emit('update:visible', false);
              this.$emit('updateList');
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
::v-deep .ql-editor {
  min-height: 300px;
}
</style>
