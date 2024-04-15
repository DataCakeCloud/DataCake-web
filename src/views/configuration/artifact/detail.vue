<template>
  <el-card class="box">
    {{ title }}
    <el-divider></el-divider>
    <el-form ref="form" :model="params" label-width="100px" :rules="rules" inline-message>
      <el-form-item :label="$t('common.name')" prop="name">
        <el-input v-model="params.name" :disabled="!!id" class="w400" placeholder="名字只能包含a-z,A-Z,0-9或-"></el-input>
      </el-form-item>
      <el-form-item label="保存至" prop="folderName">
        <UseLazyTree class="w400" module="ARTIFACT" :select-mode-obj="selectModeObj" @selectFolder="selectFolder" />
      </el-form-item>
      <!-- <el-form-item label="区域" prop="regionList">
        <el-select v-model="params.regionList" placeholder="请选择区域" :disabled="!!id" class="w400" multiple clearable>
          <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="模式" prop="modeCode">
        <el-radio-group v-model="params.modeCode" size="small" :disabled="!!id" @change="modeChange">
          <el-radio-button label="UPLOAD">上传工件</el-radio-button>
          <el-radio-button label="ONLINE">在线编辑</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('common.type')" prop="typeCode">
        <el-select v-model="params.typeCode" class="w400" :disabled="!!id">
          <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.label"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="params.modeCode == 'UPLOAD'" label="文件" :prop="id ? '' : 'jarFile'">
        <el-upload
          ref="upload"
          class="w400"
          action=""
          :accept="accept"
          :on-change="fileChange"
          :on-exceed="fileExceed"
          :on-remove="fileRemove"
          :file-list="fileList"
          :limit="1"
:multiple="false"
          :auto-upload="false"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        </el-upload>
        <el-progress v-show="loading" style="margin-top: 10px; width: 400px" status="success" :text-inside="true" :stroke-width="20" :percentage="percentage"></el-progress>
      </el-form-item>
      <el-form-item :label="$t('common.description')" prop="description">
        <el-input v-model="params.description" type="textarea" class="w400" :autosize="{ minRows: 1, maxRows: 4 }"></el-input>
      </el-form-item>
      <el-form-item v-if="params.modeCode == 'ONLINE'" label="" prop="content">
        <monaco-editor v-if="showEditor" ref="monaco" v-model="params.content" :language="language" style="height: 450px; width: 80%" theme="vs" />
      </el-form-item>
      <el-form-item label="是否公开">
        <el-radio-group v-model="params.isPublic">
          <el-radio :label="0">是</el-radio>
          <el-radio :label="1">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="!versionId" style="text-align: center; margin: 50px 0 40px">
        <el-button @click="cancelHandler">返回</el-button>
        <el-button type="primary" :disabled="loading" @click="submit">保存</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script>
import { addArtifact, getArtifactDetail, updateArtifact, getVersionInfo } from '@/api/artifact.js';
import monacoEditor from '@/components/monaco-editor/index.vue';
import { copyToNeed } from '@/utils/index.js';
import { getLabelUrl, getFolderTree } from '@/api/useLazyTree';
import * as tools from '@/utils/tools';
import UseLazyTree from '@/components/useLazyTree';
var validatePass = (rule, value, callback) => {
  const reg = /^[a-zA-Z0-9-_.]*$/;
  if (!reg.test(value)) {
    callback(new Error('名字只能包含a-z,A-Z,0-9或-'));
  } else {
    callback();
  }
};
const validatorFolder = (rule, value, callback) => {
  if (!value) {
    callback(new Error('去选择文件夹'));
  } else {
    callback();
  }
};
export default {
  components: {
    'monaco-editor': monacoEditor,
    UseLazyTree
  },
  data() {
    return {
      id: '',
      params: {
        folderId: '',
        folderName: '',
        name: '',
        regionList: [],
        typeCode: 'JAR',
        jarFile: null,
        description: '',
        modeCode: 'UPLOAD',
        content: '',
        isPublic: 0
      },
      selectModeObj: {
        isSelectMode: true,
        selectName: ''
      },
      versionId: '',
      fileList: [],
      regionList: tools.regionList,
      loading: false,
      percentage: 0,
      template: {
        java: '/**\n * 1、本文本为java语言udf函数模板，可直接重写eval方法实现逻辑功能\n * 2、[请修改类名]处，需替换成真实类名\n * 3、同一程序使用多个udf函数时，请确保类名不冲突\n * 4、SQL注册udf是需指定全路径\n */\nimport org.apache.flink.table.functions.ScalarFunction;\n\npublic class [请修改类名] extends ScalarFunction {\n\n    public String eval(String s){\n        return s+"!!!";\n    }\n}',
        scala:
          '/**\n  * 1、本文本为scala语言udf函数模板，可直接重写eval方法实现逻辑功能\n  * 2、[请修改类名]处，需替换成真实类名\n  * 3、同一程序使用多个udf函数时，请确保类名不冲突\n  * 4、SQL注册udf是需指定全路径\n  */\nimport org.apache.flink.table.functions.ScalarFunction\n\nclass [请修改类名] extends ScalarFunction{\n  def eval(s: String): String = {s+"!!!"}\n}'
      },
      showEditor: true
    };
  },
  computed: {
    title() {
      if (this.id) {
        return '编辑工件';
      } else if (this.versionId) {
        return '预览工件';
      }
      return '新增工件';
    },
    rules() {
      const rules = {
        name: [
          { required: true, message: '请输入工件名称', trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        folderName: [{ required: true, message: '请选择文件夹', trigger: ['blur', 'change'] }, { validator: validatorFolder }],
        regionList: [{ required: true, message: '请选择数据集区域', trigger: ['blur', 'change'] }],
        typeCode: [{ required: true, message: '请选择类型', trigger: ['blur', 'change'] }],
        content: [{ required: true, message: '请输入内容!', trigger: ['blur', 'change'] }],
        jarFile: [{ required: true, message: '请选择Jar文件', trigger: ['blur', 'change'] }]
      };
      // if (!this.id) {
      //   rules.jarFile = [{ required: true, message: '请选择Jar文件', trigger: ['blur', 'change'] }];
      // }
      return rules;
    },
    typeList() {
      if (this.params.modeCode === 'ONLINE') {
        return [
          { label: 'JAVA', value: 'JAVA' },
          { label: 'SCALA', value: 'SCALA' }
        ];
      }
      return [
        { label: 'JAR', value: 'JAR' },
        { label: 'JSON', value: 'JSON' },
        { label: 'CSV', value: 'CSV' },
        { label: 'shell', value: 'shell' },
        { label: 'python', value: 'python' },
        { label: 'proto', value: 'proto' }
      ];
    },
    language() {
      return this.params.typeCode.toLowerCase();
    },
    accept() {
      if (this.params.typeCode === 'JAR') {
        return '.jar';
      } else if (this.params.typeCode === 'JSON') {
        return '.json';
      } else if (this.params.typeCode === 'CSV') {
        return '.csv';
      } else if (this.params.typeCode === 'shell') {
        return '.sh';
      } else if (this.params.typeCode === 'python') {
        return '.py';
      } else if (this.params.typeCode === 'config') {
        return '.cfg';
      } else if (this.params.typeCode === 'proto') {
        return '.proto';
      }
      return '';
    }
  },
  watch: {
    'params.content'() {
      this.$refs.form.validateField('content');
    },
    'params.typeCode'() {
      if (!this.id && !this.versionId) {
        if (this.params.typeCode === 'JAVA') {
          this.params.content = this.template.java;
        } else if (this.params.typeCode === 'SCALA') {
          this.params.content = this.template.scala;
        } else {
          this.params.content = '';
        }
      }
      this.showEditor = false;
      this.$nextTick(() => {
        this.showEditor = true;
      });
    }
  },
  async created() {
    // 初始化显示文件夹
    if (this.$route.query.folderId) {
      this.params.folderId = this.$route.query.folderId;
      this.getInitFolder();
    }
    // if (!this.params.folderId) {
    //   const reqData = await getFolderTree({ module: 'ARTIFACT', id: 0 });
    //   this.params.folderId = reqData.data.entityList[0].id;
    // }
    tools.regionList.then(res => {
      this.regionList = res;
      this.params.regionList = res[0].value;
    });
    this.id = this.$route.query.id;
    this.versionId = this.$route.query.versionId;
    if (this.id || this.versionId) {
      this.getArtifactInfo();
    }
  },
  methods: {
    getArtifactInfo() {
      const id = this.id ? this.id : this.versionId;
      const api = this.id ? getArtifactDetail : getVersionInfo;
      api(id).then(res => {
        const data = res.data;
        // 回显文件夹
        if (data.folderId) {
          this.params.folderId = data.folderId;
          this.getInitFolder();
        }
        this.params = copyToNeed(data, Object.keys(this.params));
        // this.fileList = [
        //   {
        //     name: data.fileName
        //   }
        // ];
        if (!this.params.regionList || this.params.regionList.length === 0) {
          this.params.regionList = ['sg2'];
        } else {
          this.params.regionList = data.regionList.split(',');
        }
        if (this.params.content && this.params.modeCode === 'ONLINE') {
          this.params.content = decodeURIComponent(atob(this.params.content));
        }
        this.showEditor = false;
        this.$nextTick(() => {
          this.showEditor = true;
        });
      });
    },
    getInitFolder() {
      getLabelUrl({ id: this.params.folderId }).then(res => {
        const list = res.data.pfolderList;
        this.params.folderName = '';
        list.forEach((item, index) => {
          if (index !== list.length - 1) {
            this.params.folderName += item.name + '/';
          } else {
            this.params.folderName += item.name;
          }
        });
        this.$set(this.selectModeObj, 'selectName', this.params.folderName);
      });
    },
    selectFolder(val) {
      this.params.folderName = val.selectName;
      this.params.folderId = val.id;
    },
    fileChange(file, fileList) {
      this.$set(this.params, 'jarFile', file.raw);
    },
    fileRemove() {
      this.params.jarFile = null;
    },
    fileExceed() {
      this.$message({
        type: 'info',
        message: '只能上传一个文件，请先删除之前的文件！'
      });
    },
    onUploadProgress(ProgressEvent) {
      if (ProgressEvent.lengthComputable) {
        const num = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100);
        this.percentage = num >= 98 ? 99 : num;
      }
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: ProgressEvent => {
              this.onUploadProgress(ProgressEvent);
            }
          };
          let ajaxApi = addArtifact;
          const formData = new FormData();
          formData.append('name', this.params.name);
          formData.append('regionList', this.params.regionList);
          formData.append('modeCode', this.params.modeCode);
          formData.append('typeCode', this.params.typeCode);
          formData.append('description', this.params.description);
          formData.append('isPublic', this.params.isPublic);
          formData.append('content', btoa(encodeURIComponent(this.params.content)));
          if (this.params.jarFile) {
            formData.append('jarFile', this.params.jarFile);
          }
          if (this.id) {
            ajaxApi = updateArtifact;
            formData.append('id', this.id);
          }
          this.loading = true;
          formData.append('folderId', this.params.folderId);
          ajaxApi(formData, config)
            .then(async res => {
              if (res.code === 0) {
                this.$router.back();
              }
              // await addFileApi({ module: 'ARTIFACT', name: this.params.name, entityId: res.data.id, isFolder: false, parentId: this.$route.query.folderId }).then(res => {
              //   if (res.code === 0) {
              //     this.$message({
              //       type: 'success',
              //       message: '添加成功'
              //     });
              //     this.$router.back();
              //   }
              // });
            })
            .finally(() => {
              this.loading = false;
              this.percentage = 0;
            });
        } else {
          this.$message({
            type: 'info',
            message: '请完善应用信息！'
          });
        }
      });
    },
    cancelHandler() {
      this.$router.back();
    },
    modeChange(modeCode) {
      if (modeCode === 'ONLINE') {
        this.params.typeCode = 'JAVA';
      } else {
        this.params.typeCode = 'JAR';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.box-card-container {
  padding: 20px;
}
.w400 {
  width: 400px;
}
</style>
