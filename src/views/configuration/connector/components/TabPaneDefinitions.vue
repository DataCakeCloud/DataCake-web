<!--  chenyh1 -->
<template>
  <div class="definitions">
    <!-- 查询条件 -->
    <div class="search-condition-wrap">
      <div class="search-group">
        <search-item :span="8" label="连接器名称" class="custom-search search-time-item">
          <!-- <el-autocomplete v-model.trim="params.name" class="search-input" popper-class="suggest-input" :fetch-suggestions="querySearch" value-key="name" placeholder="连接器名称" :trigger-on-focus="false" clearable @keyup.enter.native="search"></el-autocomplete> -->
          <!-- <el-select v-model="params.sourceDefinitionId" filterable clearable placeholder="请选择">
            <el-option v-for="item in optionList" :key="item.sourceDefinitionId" :label="item.name" :value="item.sourceDefinitionId"> </el-option>
          </el-select> -->
          <el-input v-model="params.name" placeholder="请输入连接器名称" clearable> </el-input>
        </search-item>
        <search-item :span="8" label="创建时间" class="custom-search search-time-item">
          <el-date-picker v-model="params.createDate" type="date" placeholder="创建时间" value-format="yyyy-MM-dd" :picker-options="pickerOptions"> </el-date-picker>
        </search-item>
        <search-item :span="7" label="更新时间" class="custom-search">
          <el-date-picker v-model="params.updateDate" type="date" placeholder="更新时间" value-format="yyyy-MM-dd" :picker-options="pickerOptions"> </el-date-picker>
        </search-item>
        <search-item v-show="isShowAll" :span="8" label="创建人" class="custom-search">
          <el-select v-model="params.createBy" placeholder="请输入创建人" clearable filterable remote :remote-method="remoteMethod" :loading="ownerLoading" class="search-input" popper-class="custom-popper">
            <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
              <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
            </el-option>
          </el-select>
        </search-item>
        <search-item v-show="isShowAll" :span="8" label="是否开启" class="custom-search search-time-item">
          <el-select v-model="params.isOpen" placeholder="请选择" clearable>
            <el-option :value="1" label="是"></el-option>
            <el-option :value="0" label="否"></el-option>
          </el-select>
        </search-item>
        <el-col v-show="isShowAll" :span="8" class="btn-line">
          <el-button type="primary" size="small" icon="el-icon-search" @click="search"></el-button>
          <el-button size="small" @click="resetParamsFn">重置</el-button>
        </el-col>
      </div>
      <div class="btns">
        <el-button type="primary" size="small" @click="dialogVisible = true">添加Connector</el-button>
        <el-button type="text" size="mini" style="margin-left: 0; min-width: auto" @click="isShowAll = !isShowAll">
          {{ text }}
          <i :class="isShowAll ? 'el-icon-arrow-down ' : 'el-icon-arrow-right'"></i>
        </el-button>
      </div>
    </div>
    <!-- 表格 -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="tableData" style="width: 100%" :default-sort="{ prop: 'createTime', order: 'descending' }" @sort-change="changeGateSort">
        <el-table-column type="index" :index="indexMethod" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="name" label="连接器名称" sortable min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="name-col">
              <div class="img-box">
                <el-image :src="scope.row.icon" fit="fill">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </div>
              <span class="name-cont">{{ scope.row.name }}</span>
              <span>({{ scope.row.releaseStage }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="镜像地址" width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <a :href="scope.row.documentationUrl" target="_blank">{{ scope.row.dockerRepository }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="dockerImageTag" label="当前版本"> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" sortable min-width="90" show-overflow-tooltip>
          <template slot-scope="scope">{{ $utils.parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable min-width="90" show-overflow-tooltip>
          <template slot-scope="scope">{{ $utils.parseTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="是否开启">
          <template slot-scope="scope">
            <el-switch :value="scope.row.isOpen === 1" class="online-switch" active-color="#13ce66" inactive-color="#ff4949" @change="goLine(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="changePage"> </el-pagination>
    </div>
    <!-- 弹窗 -->
    <el-dialog :title="`${operation === 'edit' ? '编辑' : '添加'}连接器`" :visible.sync="dialogVisible" width="700px" class="dialog-box" @closed="closed">
      <div class="dialog-tips">
        <a href="https://docs.airbyte.com/" target="_blank">查看说明文档</a>
        来理解如何填充以下字段！
      </div>
      <el-form ref="dataSourceRef" :model="dataSourceForm" :rules="dataSourceRules" class="data-form" label-width="140px">
        <el-form-item label="连接器名称" prop="name">
          <el-input v-model="dataSourceForm.name" placeholder="请输入连接器名称" clearable></el-input>
          <div class="el-upload__tip">英文字母、下划线/中划线与数字的组合，不超过60个字符</div>
        </el-form-item>

        <el-form-item label="Docker仓库名称" prop="dockerRepository">
          <el-input v-model="dataSourceForm.dockerRepository" placeholder="请输入Docker仓库名称" clearable :disabled="operation === 'edit'"></el-input>
          <div class="el-upload__tip">不超过200个英文字符</div>
        </el-form-item>
        <el-form-item label="Docker镜像版本号" prop="dockerImageTag">
          <el-input v-model="dataSourceForm.dockerImageTag" placeholder="请输入Docker镜像版本号" clearable></el-input>
          <div class="el-upload__tip">字母、数字与小数点的组合，不超过15个字符</div>
        </el-form-item>
        <el-form-item label="连接器文档URL" prop="documentationUrl">
          <el-input v-model="dataSourceForm.documentationUrl" placeholder="请输入连接器文档URL" clearable></el-input>
        </el-form-item>
        <el-form-item label="连接器Icon">
          <el-upload
            class="upload-demo"
            :file-list="fileList"
            accept=".png,.jpg,.jpeg"
            :multiple="false"
            :limit="1"
            :on-change="fileChange"
            :on-exceed="fileExceed"
            :on-remove="fileRemove"
            :auto-upload="false"
list-type="picture"
            action="#"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件，且不超过5MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="submitBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SearchItem from '@/components/SearchItem';
import { getUserList } from '@/api/task';
import * as tools from '@/utils/tools';
import { createPost, updatePost, pageGet, listGet, deletePost, openPost } from '@/api/connector.js';
const resetParams = () => {
  return {
    pageNum: 1,
    pageSize: 10,
    sourceDefinitionId: '', // ?
    name: '',
    createDate: '',
    updateDate: '',
    dockerRepository: '', // ?
    createBy: '',
    isOpen: '',
    sortKey: 'createTime',
    sortOrder: 'desc'
  };
};
const resetForm = () => {
  return {
    name: '',
    dockerRepository: '',
    dockerImageTag: '',
    documentationUrl: '',
    iconImage: ''
  };
};
export default {
  components: {
    SearchItem
  },
  props: {
    activeName: {
      type: String,
      default: 'source'
    }
  },
  data() {
    var validateName = (rule, value, callback) => {
      const reg = /^[A-Za-z0-9][)A-Za-z0-9_-\s(]{0,59}$/;
      if (value === '') {
        callback(new Error('请输入连接器名称'));
      } else {
        if (!reg.test(value)) {
          callback(new Error('英文字母、下划线/中划线与数字的组合，不超过60个字符'));
        }
        callback();
      }
    };
    var validateRepository = (rule, value, callback) => {
      const reg =
        /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/;
      if (value === '') {
        callback(new Error('请输入Docker仓库名称'));
      } else {
        if (reg.test(value)) {
          callback(new Error('不能包含有中文字符'));
        }
        callback();
      }
    };
    var validateImageTag = (rule, value, callback) => {
      const reg =
        /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/;
      if (value === '') {
        callback(new Error('请输入Docker镜像版本号'));
      } else {
        if (reg.test(value)) {
          callback(new Error('不能包含有中文字符'));
        }
        callback();
      }
    };

    return {
      fileList: [],
      btnLoading: false,
      operation: '',
      optionList: [],
      isShowAll: true,
      ownerLoading: false,
      ownerList: [],
      params: resetParams(),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      total: 0,
      tableData: [],
      loading: false,
      dialogVisible: false,
      model: null,
      dataSourceForm: resetForm(),
      dataSourceRules: {
        name: [
          { required: true, message: '请输入连接器名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        dockerRepository: [
          { required: true, message: '请输入Docker仓库名称', trigger: 'blur' },
          { min: 1, max: 200, message: '不超过200个字符', trigger: 'blur' },
          { validator: validateRepository, trigger: 'blur' }
        ],
        dockerImageTag: [
          { required: true, message: '请输入Docker镜像版本号', trigger: 'blur' },
          { min: 1, max: 15, message: '不超过15个字符', trigger: 'blur' },
          { validator: validateImageTag, trigger: 'blur' }
        ],
        documentationUrl: [{ required: true, message: '请输入连接器文档URL', trigger: 'blur' }]
      }
    };
  },
  computed: {
    rightWidth() {
      if (this.isOpen) {
        return 'calc(100% - 225px)';
      } else {
        return 'calc(100% - 10px)';
      }
    },
    text() {
      if (this.isShowAll) {
        return '收起';
      } else {
        return '展开';
      }
    }
  },
  watch: {
    activeName(newVal, oldVal) {
      // this.search();
      this.getDataSourceByPage();
      // this.listGetFn(); // 连接器名称
    }
  },
  created() {
    // this.listGetFn(); // 连接器名称
    this.getDataSourceByPage();
  },
  methods: {
    changeGateSort(val) {
      const { order, prop } = val;
      this.params.sortKey = prop;
      this.params.sortOrder = order === 'descending' ? 'desc' : 'asc';
      this.search();
    },
    formDataFn(obj) {
      const formData = new FormData();
      for (const key in obj) {
        formData.append(key, obj[key]);
      }
      return formData;
    },
    // 删除
    handleDelete(row) {
      const { name } = row;
      this.$confirm(`确定删除 ${name}连接器吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            [`${this.activeName}DefinitionId`]: row[`${this.activeName}DefinitionId`]
          };
          this.loading = true;
          deletePost(this.formDataFn(params), this.activeName)
            .then(res => {
              this.$message.success('删除成功');
              this.getDataSourceByPage();
              // this.listGetFn(); // 连接器名称
            })
            .finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {});
    },
    // 编辑
    handleEdit(row) {
      this.operation = 'edit';
      this.dataSourceForm = JSON.parse(JSON.stringify(row));
      this.dataSourceForm.iconImage = this.dataSourceForm.icon;
      if (row.icon) {
        const i = this.dataSourceForm.iconImage.lastIndexOf('.');
        const p = this.dataSourceForm.iconImage.slice(i + 1);
        this.fileList = [{ name: row.name + '.' + p, url: this.dataSourceForm.icon }];
      }
      this.dialogVisible = true;
    },
    // 分页器的改变
    handleSizeChange(val) {
      this.params.pageNum = 1;
      this.params.pageSize = val;
      this.getDataSourceByPage();
    },
    changePage(page) {
      this.params.pageNum = page;
      this.getDataSourceByPage();
    },
    // 连接器名称
    async listGetFn() {
      const data = await (await listGet(this.activeName)).data;
      this.optionList = data.length > 0 ? data.map(item => ({ name: item.name, sourceDefinitionId: item.sourceDefinitionId })) : [];
    },
    getDataSourceByPage() {
      const params = { ...this.params };
      // if (params.sourceDefinitionId) {
      //   const findObj = this.optionList.find(item => item.sourceDefinitionId === params.sourceDefinitionId);
      //   params.name = findObj.name;
      //   params.dockerRepository = findObj.dockerRepository;
      // }
      // if (this.activeName === 'destination') { // 输出源连接器的入参
      //   params.destinationDefinitionId = params.sourceDefinitionId;
      //   params.sourceDefinitionId = '';
      // }
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });

      this.loading = true;
      pageGet(params, this.activeName)
        .then(res => {
          const data = res.data;
          this.tableData = data.list;
          this.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          const data = res.data;
          this.ownerLoading = false;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    resetParamsFn() {
      this.params.name = '';
      this.params.createDate = '';
      this.params.updateDate = '';
      this.params.createBy = '';
      this.params.isOpen = '';
    },
    fileExceed() {
      this.$message({
        type: 'warning',
        message: '最多上传1张图片,如果已存在请先删除图片再添加'
      });
    },
    fileRemove(file, fileList) {
      this.dataSourceForm.iconImage = '';
      this.fileList = [];
    },
    async fileChange(file) {
      if (file.size / 1024 / 1024 > 5) {
        setTimeout(() => {
          this.$message({
            type: 'warning',
            message: '文件大小限制为5MB'
          });
        }, 0);
      } else {
        const { name, raw, url } = file;
        this.dataSourceForm.iconImage = raw;
        this.fileList = [{ name, url }];
      }
    },
    submitBtn() {
      this.$refs['dataSourceRef'].validate(async valid => {
        if (valid) {
          const formData = new FormData();
          this.btnLoading = true;
          try {
            if (this.operation === 'edit') {
              formData.append('name', this.dataSourceForm.name);
              formData.append(`${this.activeName}DefinitionId`, this.dataSourceForm[`${this.activeName}DefinitionId`]);
              formData.append('dockerImageTag', this.dataSourceForm.dockerImageTag);
              formData.append('documentationUrl', this.dataSourceForm.documentationUrl);
              if (typeof this.dataSourceForm.iconImage === 'object') {
                formData.append('iconImage', this.dataSourceForm.iconImage);
              }
              await updatePost(formData, this.activeName);
              this.$message.success('编辑成功');
              this.dialogVisible = false;
              this.getDataSourceByPage();
            } else {
              for (const key in this.dataSourceForm) {
                this.dataSourceForm[key] && formData.append(key, this.dataSourceForm[key]);
              }
              await createPost(formData, this.activeName);
              this.$message.success('添加成功');
              this.dialogVisible = false;
              this.search();
            }
            // this.listGetFn(); // 连接器名称
          } catch (error) {
            console.error(error);
          }
          this.btnLoading = false;
        } else {
          this.$message({
            type: 'info',
            message: '请完善信息！'
          });
        }
      });
    },
    closed() {
      this.$refs.dataSourceRef.resetFields();
      this.dataSourceForm = resetForm();
      this.operation = '';
      this.fileList = [];
    },
    goLine(row) {
      // 下线时 是否通知直接下游
      const { isOpen } = row;
      this.$confirm(`确定${isOpen === 1 ? '关闭' : '开启'}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true;
          const params = {
            isOpen: isOpen === 1 ? 0 : 1,
            [`${this.activeName}DefinitionId`]: row[`${this.activeName}DefinitionId`]
          };
          openPost(this.formDataFn(params), this.activeName)
            .then(data => {
              this.$message({
                type: 'success',
                message: '操作成功!'
              });
              this.getDataSourceByPage();
            })
            .finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {});
    },
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    search() {
      this.params.pageNum = 1;
      this.getDataSourceByPage();
    }
  }
};
</script>
<style lang="scss" scoped>
.definitions {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    display: flex;
    align-items: flex-end;
    .search-group {
      flex: 1;
    }
    .btns {
      display: flex;
      // width: 265px;
    }
    .btn-line {
      position: relative;
      top: 5px;
      left: 48px;
    }
    .custom-search {
      ::v-deep .search-item {
        margin-bottom: 0;
        margin-top: 5px;
        .label {
          width: 60px;
        }
      }
    }
    .search-input {
      width: calc(100% - 80px) !important;
      // max-width: 250px;
      &.table {
        width: calc(50% - 80px) !important;
      }
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  .online-switch {
    ::v-deep .el-switch__core::after {
      background: #fff !important;
    }
  }
  .dialog-box {
    ::v-deep .el-dialog__body {
      padding-top: 0;
    }
    .dialog-tips {
      margin-top: 15px;
      margin-bottom: 15px;
      padding-left: 50px;
    }
    .data-form {
      ::v-deep .el-upload__tip {
        margin-top: 2px;
        line-height: 15px;
      }
    }
  }

  .search-time-item {
    ::v-deep .el-date-editor {
      width: 99%;
    }
    ::v-deep .el-select {
      width: 100%;
    }
  }
  .name-col {
    display: flex;
    align-items: center;
    .img-box {
      height: 30px;
      width: 30px;
      min-width: 30px;
      min-height: 30px;
      max-width: 30px;
      max-height: 30px;
      // overflow: hidden;
      ::v-deep .el-icon-picture-outline:before {
        font-size: $global-font-size-30;
      }
      ::v-deep .el-image {
        height: 100%;
        width: 100%;
      }
      ::v-deep .el-image__inner {
        height: 100%;
        width: 100%;
        // object-fit: fill;
      }
    }
    .name-cont {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
</style>
