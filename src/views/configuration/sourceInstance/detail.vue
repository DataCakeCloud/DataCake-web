<!--  chenyh1 -->
<template>
  <div class="detail-page">
    <el-row :gutter="20">
      <el-col :span="12" class="left-col">
        <div v-loading="editLoading" class="left-side">
          <div class="left-title">{{ disabledBoolean ? '查看' : $route.query.editId ? '编辑' : '添加' }}{{ activeName === 'source' ? '数据源' : '输出源' }}</div>
          <el-card class="box-card">
            <!-- <div slot="header" class="line-ele">
              <span class="line-left">区域</span>
              <div class="line-right">
                <el-select v-model="params.region" filterable placeholder="请选择区域" :disabled="disabledBoolean" :class="noRegion ? 'err-select' : ''" @change="regionChange">
                  <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <div v-if="noRegion" class="err-region">区域不能为空</div>
              </div>
            </div> -->
            <div>
              <div>
                <div class="name-line">
                  <div class="form-label required">数据源名称</div>
                  <el-input v-model="params.name" placeholder="请输入数据源名称" clearable :class="nameError || noName ? 'err-input' : ''" :disabled="disabledBoolean" @blur="handleBlur"> </el-input>
                  <p v-if="nameError" class="err-txt">数据源名称已存在</p>
                  <p v-if="noName" class="err-txt">数据源名称不能为空</p>
                </div>
                <div class="name-line">
                  <div class="form-label required">数据源类型</div>
                  <el-select v-model="params.bothId" filterable placeholder="请选择数据源类型" class="name-ele" popper-class="select-box" :disabled="$route.query.editId ? true : false" @change="selectChange">
                    <el-option v-for="item in optionList" :key="item.bothId" :label="`${item.name}(${item.releaseStage})`" :value="item.bothId">
                      <div class="option-ele">
                        <div class="img-box">
                          <el-image :src="item.icon" fit="fill">
                            <div slot="error" class="image-slot">
                              <i class="el-icon-picture-outline"></i>
                            </div>
                          </el-image>
                        </div>
                        <span>{{ item.name }}</span>
                        <span style="margin-left: 20px">({{ item.releaseStage }})</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>
                <div class="name-line">
                  <div class="form-label required">用户组</div>
                  <el-select v-model="params.groups" style="width: 100%" placeholder="请选择用户组" clearable @change="changeGroups">
                    <el-option v-for="item in groupOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                  </el-select>
                  <p v-if="noGroups" class="err-txt">所属组织不能为空</p>
                </div>
              </div>
              <div v-loading="loading" class="form-box">
                <!-- Vue JSON Schema Form -->
                <VueForm v-model="formData" :schema="schema">
                  <div slot-scope="{ formData, formRefFn }">
                    <div v-if="showErrorTxt" class="error-txt">连接失败</div>
                    <el-progress v-if="showProgress" class="progress" :text-inside="true" :stroke-width="24" :percentage="percentage" status="success"></el-progress>
                    <div v-if="!disabledBoolean" class="btn-box">
                      <el-button v-if="Object.keys(schema).length" class="btn_l" @click="submit(formData, formRefFn, true)">联通性测试</el-button>
                      <span class="btn_r">
                        <el-button @click="handlerCancel">取消</el-button>
                        <el-button v-if="Object.keys(schema).length" type="primary" :loading="btnLoading" :disabled="disabledBoolean" @click="submit(formData, formRefFn)">{{ $route.query.editId ? '修改' : '添加' }}</el-button>
                      </span>
                    </div>
                  </div>
                </VueForm>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :span="12" class="right-col">
        <el-card v-loading="docLoading" class="right-side">
          <template>
            <div id="mdocumet" :class="['markdown-theme-airbyte', { 'no-text-box': !hasTextUrl }]"></div>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import VueForm from '@lljj/vue-json-schema-form';
import { marked } from 'marked';
import * as tools from '@/utils/tools';
import { listGet } from '@/api/connector.js';
import { specGet, checkConnection, createPost, updatePost, getSourceDestination, documentGet, existGet } from '@/api/sourceInstance.js';
import { getGroupPage } from '@/api/jurisdiction';
import { mapGetters } from 'vuex';
import user from '@/store/modules/user';
// import amplitude from './amplitude.md' // 导入！！！注意使用你存放的路径

export default {
  components: {
    VueForm
  },
  data() {
    return {
      noRegion: false,
      noName: false,
      noGroups: false,
      nameError: false,
      docLoading: false,
      editLoading: false,
      btnLoading: false,
      schema: {},
      formData: {},
      params: {
        groups: null,
        region: '',
        name: '',
        bothId: '' // sourceDefinitionId或是destinationDefinitionId
      },
      regionList: tools.regionList,
      optionList: [],
      readMeUrl: '',
      loading: false,
      showErrorTxt: false,
      hasTextUrl: false,
      groupOptions: [],
      showProgress: false,
      percentage: 0
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    activeName() {
      return this.$route.query.activeName;
    },
    disabledBoolean() {
      return !!this.$route.query.operate;
    }
  },
  async created() {
    this.getGroupPage();

    tools.regionList.then(res => {
      this.regionList = res || [];
      if (!this.$route.query.id) {
        // 新增
        this.params.region = this.regionList[0]?.value || '';
      }
    });
    this.editLoading = true;
    new Promise((resolve, reject) => {
      this.listGetFn(resolve); // 数据源类型
    }).then(() => {
      if (this.$route.query.id) {
        // 编辑的页面
        this.params.bothId = this.$route.query.id * 1;
      }
    });
    if (this.$route.query.editId) {
      // this.$route.query.editId=实例id;this.$route.query.id=连接器id;
      try {
        await this.selectChange();
        await this.getSourceDestinationFn();
      } catch (error) {
        console.log('error', error);
      }
    } else {
      this.$nextTick(() => {
        document.getElementById('mdocumet').innerHTML = '暂无相关的文档';
      });
    }
    this.editLoading = false;
  },
  methods: {
    changeGroups(val) {
      if (!val) {
        this.noGroups = true;
      } else {
        this.noGroups = false;
      }
    },
    getGroupPage() {
      const params = {
        tenantId: this.$store.getters['userInfo'].tenantId,
        name: '',
        pageNum: 1,
        pageSize: 10000
      };
      getGroupPage(params).then(data => {
        this.groupOptions = data.data.list || [];
      });
    },
    regionChange(val) {
      this.noRegion = false;
    },
    async handleBlur(val) {
      if (!this.params.name.trim()) {
        this.noName = true;
        return;
      }
      this.noName = false;
      const params = {
        [`${this.activeName}Id`]: this.$route.query.editId * 1 || '',
        name: this.params.name.trim()
      };
      const data = await (await existGet(params, this.activeName)).data;
      this.nameError = data;
    },
    async selectChange(newV) {
      await this.specGetFn();
      this.documentGetFn();
      return;
    },
    async getSourceDestinationFn() {
      const params = {
        [`${this.activeName}Id`]: this.$route.query.editId * 1
      };
      const data = await (await getSourceDestination(params, this.activeName)).data;
      const { connectionConfiguration, name, region, groups } = data;
      this.params.region = region;
      this.params.name = name;
      this.params.groups = isNaN(Number(groups)) ? null : Number(groups);
      this.formData = connectionConfiguration;
    },
    getMarkdownName(id) {
      const typeName = this.optionList.find(item => item[`bothId`] === id).name;
      return typeName.toLowerCase().replace(/ /g, '-') + '.md';
    },
    // 获取右侧边栏的markdown文档
    async documentGetFn() {
      // const typeName = this.getMarkdownName(this.params.bothId);
      if (!this.readMeUrl) {
        this.hasTextUrl = false;
        this.$nextTick(() => {
          document.getElementById('mdocumet').innerHTML = '暂无相关的文档';
        });
        return;
      }
      this.docLoading = true;
      try {
        const data = await (await documentGet(this.readMeUrl, this.activeName)).data;
        this.docLoading = false;
        if (data.startsWith('<!doctype') || data.startsWith('<!DOCTYPE')) {
          this.hasTextUrl = false;
          this.$nextTick(() => {
            document.getElementById('mdocumet').innerHTML = '暂无相关的文档';
          });
          return;
        }
        this.hasTextUrl = true;
        this.$nextTick(() => {
          document.getElementById('mdocumet').innerHTML = marked(data);
        });
      } catch (error) {
        this.docLoading = false;
        this.hasTextUrl = false;
        this.$nextTick(() => {
          document.getElementById('mdocumet').innerHTML = '暂无相关的文档';
        });
      }
    },
    // 获取动态表格
    async specGetFn() {
      const params = {
        [`${this.activeName}DefinitionId`]: this.params.bothId || this.$route.query.id
      };
      this.loading = true;
      this.schema = {};
      try {
        const data = await (await specGet(params, this.activeName)).data;
        this.loading = false;
        const { connectionSpecification, readMeUrl } = data;
        this.schema = this.handleSchema(connectionSpecification.connectionSpecification);
        if (readMeUrl) {
          this.readMeUrl = readMeUrl.slice(readMeUrl.lastIndexOf('/') + 1);
        } else {
          this.readMeUrl = '';
        }
      } catch (error) {
        this.readMeUrl = '';
      }
      return;
    },

    handleSchema(schema) {
      const { properties, oneOf, allOf, anyOf } = schema;
      const iterable = [properties, oneOf, allOf, anyOf].filter(e => e);
      // 常量字段，隐藏表单，设置默认值
      if (schema['const'] !== undefined) {
        schema['ui:hidden'] = true;
        schema['default'] = schema['const'];
      }
      // 密码字段，设置为密码输入框
      if (schema['airbyte_secret']) {
        schema['ui:show-password'] = true;
      }
      if (iterable.length) {
        for (const entity of iterable) {
          // 设置字段顺序
          const orderKeys = Object.keys(entity).sort((a, b) => (entity[a].order === undefined ? 1 : entity[b].order === undefined ? -1 : entity[a].order - entity[b].order));
          if (orderKeys.length) {
            schema['ui:order'] = orderKeys;
          }
          for (const i in entity) {
            this.handleSchema(entity[i]);
          }
        }
      }
      return schema;
    },

    // 数据源类型
    async listGetFn(resolve) {
      const data = await (await listGet(this.activeName)).data;
      data.forEach(item => {
        item.bothId = item[`${this.activeName}DefinitionId`];
      });
      this.optionList = data;
      typeof resolve === 'function' && resolve();
    },
    handlerCancel() {
      this.$router.push({
        path: '/config/sourceInstance'
      });
    },
    async checkConnectionFn(form) {
      const params = {
        [`${this.activeName}DefinitionId`]: this.params.bothId,
        connectionConfiguration: form,
        metaFlag: 'AIRBYTE'
      };
      try {
        const data = await (await checkConnection(params)).data;
        return data;
      } catch (error) {
        return { status: 'FAILED' };
      }
    },
    async updatePostFn(form) {
      const { name, region, groups } = this.params;
      const params = {
        [`${this.activeName}Id`]: this.$route.query.editId * 1,
        name,
        region,
        groups: groups + '',
        connectionConfiguration: form
      };
      await updatePost(params, this.activeName);
      return;
    },
    async createPostFn(form) {
      const { bothId, name, region, groups } = this.params;
      const params = {
        [`${this.activeName}DefinitionId`]: bothId,
        name,
        region,
        groups: groups + '',
        connectionConfiguration: form
      };
      await createPost(params, this.activeName);
      return;
    },
    async validateFn(form, formRefFn) {
      if (!this.params.region || !this.params.name.trim() || !this.params.groups) {
        !this.params.region &&
          // this.noRegion = true
          this.$message.warning('缺少区域参数请联系管理员');
        !this.params.name.trim() && (this.noName = true);
        !this.params.groups && (this.noGroups = true);
        return false;
      }

      if (this.nameError) {
        this.$message.error('数据源名称已存在');
        return false;
      }

      return true;
    },
    hadnelProGress() {
      this.showProgress = true;
      this.percentage = 0;
      this.timer = setInterval(() => {
        if (this.percentage === 90) return;
        this.percentage = this.percentage + 10;
      }, 150);
    },
    async submit(form, formRefFn, test = false) {
      const valid = await this.validateFn(form, formRefFn);
      if (!valid) return;
      const formObj = formRefFn();
      this.showErrorTxt = false;
      formObj.validate(async valid => {
        if (valid) {
          if (!test) this.btnLoading = true;
          try {
            if (test) this.hadnelProGress();
            // 测试联通性接口 SUCCEEDED
            const { status, message = '' } = await this.checkConnectionFn(form);

            if (test) {
              setTimeout(() => {
                // 延迟
                this.showProgress = false;
                this.percentage = 0;
                clearInterval(this.timer);

                // 展示结果
                const str = status === 'FAILED' ? message : '连接成功';
                this.$alert(str, '提示', {
                  confirmButtonText: '确定',
                  type: status === 'FAILED' ? 'error' : 'success'
                });
              }, 1500);
              return;
            } else {
              if (status === 'FAILED') {
                this.showErrorTxt = true;
                this.btnLoading = false;
                return;
              }
            }

            if (this.$route.query.editId) {
              await this.updatePostFn(form);
              this.$message.success('修改成功');
            } else {
              await this.createPostFn(form);
              this.$message.success('添加成功');
            }
            this.$router.push({
              path: '/config/sourceInstance'
            });
          } catch (error) {
            console.error(error);
          }
          this.btnLoading = false;
        } else {
          // this.$message({
          //   type: 'info',
          //   message: '请完善信息！'
          // });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-page {
  .left-col,
  .right-col {
    height: calc(100vh - 68px);
    overflow-y: scroll;
    padding: 15px;
  }
  .left-side {
    .left-title {
      margin-bottom: 20px;
      font-size: $global-font-size-28;
      text-align: center;
      font-weight: 500;
    }
    .line-ele {
      .line-left {
        display: inline-block;
        width: 70px;
        text-align: left;
        font-size: $global-font-size-14;
        font-weight: 500;
        padding-bottom: 8px;
        &::before {
          display: inline-block;
          content: '*';
          color: $color-cb;
          margin-right: 4px;
        }
      }
      .line-right {
        flex: 1;
        ::v-deep .el-select {
          width: 100%;
        }
        .err-region {
          font-size: $global-font-size-13;
          color: #ff5656;
        }
        .err-select {
          ::v-deep .el-input__inner {
            border-color: #ff5656;
          }
        }
      }
    }
    .form-label {
      line-height: 26px;
      padding-bottom: 8px;
      font-size: $global-font-size-14;
      font-weight: 500;
      color: #2c3b5e;
      &.required::before {
        display: inline-block;
        content: '*';
        color: $color-cb;
        margin-right: 4px;
      }
    }
    .form-content {
      width: 100%;
      margin-bottom: 10px;
    }
    .name-ele {
      width: 100%;
    }
    .name-line {
      margin-bottom: 10px;
      .err-input {
        ::v-deep .el-input__inner {
          border-color: #ff5656;
        }
      }
      .err-txt {
        margin: 0;
        margin-top: 5px;
        font-size: $global-font-size-13;
        color: #ff5656;
      }
    }
    .box-card {
      min-height: calc(100vh - 160px);
    }
  }
  .right-side {
    min-height: calc(100vh - 107px);
    .no-text-box {
      box-sizing: border-box;
      height: 100%;
      font-size: $global-font-size-16;
      font-weight: 600;
      padding-top: 200px;
      text-align: center;
    }
  }
  .form-box {
    margin-top: 20px;
    .btn-box {
      text-align: end;
      position: relative;
      .btn_l {
        position: absolute;
        left: 0;
      }
    }
    .error-txt {
      color: #ff5656;
      font-size: $global-font-size-16;
      flex: 1;
      text-align: start;
      margin-bottom: 15px;
    }
    .progress {
      margin-bottom: 15px;
    }
  }
}
</style>
<style lang="scss">
.select-box {
  .option-ele {
    display: flex;
    .img-box {
      margin-right: 20px;
      height: 25px;
      width: 25px;
      min-width: 25px;
      min-height: 25px;
      max-width: 25px;
      max-height: 25px;
      position: relative;
      top: 7px;
      // overflow: hidden;
      ::v-deep .el-icon-picture-outline:before {
        font-size: $global-font-size-25;
      }
      .el-image {
        height: 100%;
        width: 100%;
      }
      ::v-deep .el-image__inner {
        height: 100%;
        width: 100%;
        // object-fit: fill;
      }
    }
  }
}

.markdown-theme-airbyte {
  * {
    color: #1a194d;
    font-size: $global-font-size-16;
    font-weight: 400;
    line-height: 24px;
  }
  h1 {
    font-size: $global-font-size-32;
    font-weight: 700;
    line-height: 56px;
  }
  h2 {
    font-size: $global-font-size-22;
    font-weight: 700;
    line-height: 36px;
  }
  h3 {
    font-size: $global-font-size-18;
    font-weight: 700;
  }
  h4 {
    font-weight: 700;
  }
  a {
    color: $c-primary;
    line-height: 24px;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  table {
    border-collapse: collapse;
  }
  td,
  th {
    border: 1px solid #e8e8ed;
    margin: 0;
    padding: 8px 16px;
  }
  th {
    background: #f8f8fa;
  }
  blockquote {
    border-left: 4px solid #e8e8ed;
    margin-left: 25px;
    padding-left: 16px;
  }
  strong {
    font-weight: 700;
  }
  code {
    background: #f8f8fa;
    font-family: Menlo, Monaco, Consolas, monospace;
    white-space: break-spaces;
  }
  pre > code {
    border-bottom: 2px solid #e8e8ed;
    border-radius: 8px;
    display: block;
    overflow: auto;
    padding: 15px;
  }
  img {
    max-width: 100%;
  }
  .admonition {
    background-color: #f8f8fa;
    border-left: 8px solid #afafc1;
    border-radius: 8px;
    margin: -1px 0 15px;
    padding: 1px 16px 1px 48px;
    position: relative;
  }
  .admonition:before {
    content: 'ℹ️';
    left: 16px;
    position: absolute;
    top: 16px;
  }

  .admonitions_admonition--caution__f-0P1,
  .admonitions_admonition--warning__GgWnG {
    background-color: #fdf8e1;
    border-left-color: #f8d54e;
  }

  .admonitions_admonition--caution__f-0P1:before,
  .admonitions_admonition--warning__GgWnG:before {
    content: '⚠️';
  }

  .admonitions_admonition--danger__cmSO- {
    background-color: #ffe4e8;
    border-left-color: #ff5e7b;
  }

  .admonitions_admonition--danger__cmSO-:before {
    content: '⚠️';
  }

  .admonitions_admonition--note__c5aTv:before {
    content: '📝';
  }

  .admonitions_admonition--info__jPf\+W,
  .admonitions_admonition--tip__aujQr {
    background-color: #eae9ff;
    border-left-color: #7f7eff;
  }

  .admonitions_admonition--tip__aujQr:before {
    content: '💡';
  }

  .DocumentationPanel_container__pc6f7 {
    background-color: #fff;
    min-height: 100vh;
    padding-bottom: 40px;
  }

  .DocumentationPanel_content__t1ztB {
    padding: 0 35px;
  }
}
</style>
