<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" :rules="rules" label-width="130px">
      <el-form-item label="标签名字" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入标签名字，不超过128个字符" maxlength="128" clearable :disabled="tagType === 4"></el-input>
      </el-form-item>
      <el-form-item label="关联工作流">
        <div :class="['task-tag-wrap', selectTasks.length ? 'border-dashed' : '']">
          <el-tag v-for="item in selectTasks" :key="item.id" closable type="info" effect="plain" class="task-tag" @close="handleClose(item)">
            {{ item.name }}
          </el-tag>
        </div>
        <el-input v-model="filterText" placeholder="请选择归属于该标签的工作流（最多可选500个）"></el-input>
        <div v-if="filterText" v-loading="taskLoading" class="tree-wrap">
          <el-tree
            ref="tree"
            class="filter-tree"
            :data="options"
            :props="defaultProps"
            :empty-text="filterText ? 'No Data' : ''"
            :check-on-click-node="true"
            :expand-on-click-node="false"
            node-key="id"
            show-checkbox
default-expand-all
            @check="handleCheck"
          ></el-tree>
        </div>
      </el-form-item>
      <el-form-item label="是否公开此标签">
        <div slot="label">
          是否公开此标签
          <el-popover trigger="hover" placement="top" popper-class="tag-popper" width="250">
            标签公开后，公开对象除了不能删除此标签外，可任意编辑此标签
            <i slot="reference" class="el-icon-info global-color-ca"></i>
          </el-popover>
        </div>
        <el-radio v-model="ruleForm.publish" :label="0" :disabled="createBy !== userId">否</el-radio>
        <el-radio v-model="ruleForm.publish" :label="1" :disabled="createBy !== userId">是</el-radio>
      </el-form-item>
      <el-form-item v-if="showPublic" label="公开给" prop="publishers">
        <el-select
          v-model="ruleForm.publishers"
          placeholder="请输入公开人"
          filterable
          multiple
          remote
          allow-create
          reserve-keyword
          :disabled="createBy !== userId"
          :remote-method="
            query => {
              remoteMethod(query, 'collaboratorsList');
            }
          "
          :loading="publicLoading"
          popper-class="custom-popper"
          class="senior-input"
        >
          <el-option v-for="item in collaboratorsList" :key="item.shareId" :value="item.shareId" :label="item.name">
            <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getWorkflowList } from '@/api/flow';
import { getLabelInfo, addLabel, updateLabel, getUserList } from '@/api/task';
import * as tools from '@/utils/tools';

export default {
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    const checkName = (rule, value, callback) => {
      const reg = /^[A-Za-z0-9_\u4e00-\u9fa5]{2,128}$/;
      if (!reg.test(value)) {
        callback(new Error('【只包含a-z,A-Z,0-9或_或中文】，长度2-128'));
      } else {
        callback();
      }
    };
    const checkPublicList = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请选择公开人'));
      } else {
        callback();
      }
    };
    return {
      createBy: '',
      publicLoading: false,
      taskLoading: false,
      showPublic: false,
      collaboratorsList: [],
      dialogVisible: false,
      loading: false,
      ruleForm: {
        name: '',
        publishers: [],
        publish: 0
      },
      rules: {
        name: [{ required: true, validator: checkName, trigger: ['blur', 'change'] }],
        publishers: [{ required: true, validator: checkPublicList, trigger: ['blur', 'change'] }]
      },
      btnDisabled: false,
      selectTasks: [],
      filterText: '',
      options: [],
      defaultProps: {
        multiple: true,
        value: 'id',
        label: 'name'
      },
      title: '添加标签',
      tagType: 0
    };
  },
  watch: {
    filterText(value) {
      this.filterTasks({ vm: this, value });
    },
    'ruleForm.publish'(v) {
      this.showPublic = v === 1;
    }
  },
  created() {
    this.createBy = this.userId;
  },
  methods: {
    showWin(id, index) {
      this.dialogVisible = true;
      this.btnDisabled = false;
      this.tagType = index;
      if (id) {
        this.ruleForm.id = id;
        this.title = '编辑标签';
        this.getInfo(id);
      } else {
        this.ruleForm.id = '';
        this.ruleForm.publishers = [];
        this.ruleForm.publish = 0;
        this.title = '添加标签';
      }
    },
    getInfo(id) {
      this.loading = true;
      getLabelInfo(id).then(res => {
        const data = res.data;
        this.createBy = data.createBy;
        this.ruleForm.name = data.name;
        this.ruleForm.publish = data.publish;
        this.ruleForm.publishers = data.publishers ? data.publishers.split(',') : [];
        if (data.workflows) {
          this.getList('', data.workflows);
        }
        this.loading = false;
      });
    },
    filterTasks: tools.debounce(({ vm, value }) => {
      if (value) {
        vm.getList(value);
      } else {
        vm.options = [];
      }
    }, 400),
    remoteMethod(query, list) {
      if (query !== '') {
        this.publicLoading = true;
        getUserList(query).then(res => {
          this.publicLoading = false;
          const data = res.data;
          this[list] = data.filter(item => {
            return item.shareId !== this.createBy;
          });
        });
      } else {
        this[list] = [];
      }
    },
    getList(name, workflows) {
      this.taskLoading = true;
      workflows = name ? '' : workflows;
      const params = {
        workflows: workflows,
        keyWord: name,
        onlyMine: false,
        pageNo: 1,
        pageSize: 100000,
        comefromLabel: true
      };
      getWorkflowList(params).then(res => {
        this.taskLoading = false;
        if (workflows) {
          this.selectTasks = res.data.list.map(item => {
            return {
              id: item.id,
              name: item.name
            };
          });
        }
        const optionsData = {};
        res.data.list.forEach(item => {
          if (optionsData[item.owner]) {
            optionsData[item.owner].push(item);
          } else {
            optionsData[item.owner] = [item];
          }
        });
        this.options = [];
        if (optionsData) {
          for (var i in optionsData) {
            optionsData[i].forEach(item => {
              item.name = `(${item.id})${item.name}`;
            });
            this.options.push({
              id: 'createBy-' + i,
              name: i,
              children: optionsData[i]
            });
          }
          this.$nextTick(() => {
            if (this.$refs.tree) {
              this.selectTasks.forEach(item => {
                this.$refs.tree.setChecked(item, true);
              });
            }
          });
        }
      });
    },
    handleCheck(data, { checkedKeys, checkedNodes }) {
      if (checkedKeys.includes(data.id)) {
        // 选中操作
        checkedNodes.forEach(item => {
          if (!item.children) {
            const obj = this.selectTasks.find(task => task.id === item.id);
            if (!obj) {
              if (this.selectTasks.length >= 500) {
                this.$refs.tree.setChecked(item, false);
              } else {
                this.selectTasks.push({
                  id: item.id,
                  name: item.name
                });
              }
            }
          }
        });
        if (this.selectTasks.length >= 500) {
          this.$message({
            type: 'warning',
            message: '关联任务不能超过500个'
          });
        }
      } else {
        // 取消选中操作
        if (data.children) {
          data.children.forEach(item => {
            const index = this.selectTasks.findIndex(task => task.id === item.id);
            if (index !== -1) {
              this.selectTasks.splice(index, 1);
            }
          });
        } else {
          const index = this.selectTasks.findIndex(task => task.id === data.id);
          if (index !== -1) {
            this.selectTasks.splice(index, 1);
          }
        }
      }
    },
    handleClose(task) {
      this.selectTasks.splice(
        this.selectTasks.findIndex(item => item.id === task.id),
        1
      );
      this.$refs.tree.setChecked(task, false);
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.selectTasks = [];
      this.filterText = '';
      this.options = [];
    },
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnDisabled = true;
          const params = {
            name: this.ruleForm.name,
            workflows: this.selectTasks.map(item => item.id).join(','),
            publish: this.ruleForm.publish,
            publishers: this.ruleForm.publishers.join(',')
          };
          let actionUrl;
          if (this.ruleForm.id) {
            params.id = this.ruleForm.id;
            actionUrl = updateLabel(params);
          } else {
            actionUrl = addLabel(params);
          }
          actionUrl
            .then(data => {
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: this.title + '成功'
              });
              this.$emit('save');
            })
            .finally(() => {
              this.btnDisabled = false;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-select {
  width: 350px;
}
.tree-wrap {
  margin-top: 10px;
  max-height: 280px;
  overflow: auto;
  .filter-tree {
    display: inline-block;
    min-width: 100%;
  }
}
.task-tag-wrap {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding-left: 5px;
  margin-bottom: 5px;
  .task-tag {
    margin-right: 5px;
  }
}
.border-dashed {
  border: 1px dashed #d1d7e6;
}
</style>
