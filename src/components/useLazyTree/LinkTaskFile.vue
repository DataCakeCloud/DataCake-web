<template>
  <div>
    <el-dialog width="30%" :title="module === 'TASK' ? '关联任务' : '关联文件'" :visible.sync="dialogVisible" :append-to-body="true">
      <el-form ref="ruleForm" v-loading="formLoading" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item :label="module === 'TASK' ? '关联任务' : '关联文件'">
          <!-- <el-input v-if="selectTasks.length" v-model="filterLinkedTask" @input="getFilterLinkedTask"></el-input> -->
          <div v-if="!filterLinkedTask && selectTasks.length" :class="['task-tag-wrap', selectTasks.length ? 'border-dashed' : '']">
            <el-tag v-for="item in selectTasks" :key="item.id" closable type="info" effect="plain" class="task-tag" @close="handleClose(item)">
              {{ item.name }}
            </el-tag>
          </div>
          <div v-else-if="filterSelectTasks.length" :class="['task-tag-wrap', selectTasks.length ? 'border-dashed' : '']">
            <el-tag v-for="item in filterSelectTasks" :key="item.id" closable type="info" effect="plain" class="task-tag" @close="handleClose(item)">
              {{ item.name }}
            </el-tag>
          </div>
          <div v-else class="no-task">暂无历史关联项</div>
        </el-form-item>
        <el-form-item label="添加关联项">
          <el-input v-model="filterText" v-loading="taskLoading"></el-input>
          <div v-if="filterText" class="tree-wrap">
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
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getListForLabel } from '@/api/task';
import { getArtifactPage } from '@/api/artifact.js';
import { getFolderTree } from '@/api/useLazyTree';
import * as tools from '@/utils/tools';
export default {
  props: {
    module: {
      type: String,
      default: 'TASK'
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectTasks: [],
      options: [],
      filterSelectTasks: [],
      taskLoading: false,
      formLoading: false,
      filterLinkedTask: '',
      filterText: '',
      ruleForm: {},
      rules: {},
      folderId: '',
      btnDisabled: false,
      defaultProps: {
        multiple: true,
        value: 'id',
        label: 'name'
      }
    };
  },
  watch: {
    filterText(value) {
      this.filterTasks({ vm: this, value });
    },
    selectTasks() {
      this.getFilterLinkedTask(this.filterLinkedTask);
    }
  },
  methods: {
    showFolderTask(folderId) {
      this.dialogVisible = true;
      this.filterLinkedTask = '';
      this.filterSelectTasks = [];
      this.folderId = folderId;
      this.filterText = '';
      this.selectTasks = [];
      // this.getInfo(folderId);
    },
    getFilterLinkedTask(val) {
      if (this.selectTasks.length) {
        this.filterSelectTasks = this.selectTasks.filter((item, key) => {
          return item.name.indexOf(val) !== -1;
        });
      } else {
        this.filterSelectTasks = [];
      }
    },
    getInfo(folderId) {
      this.formLoading = true;
      getFolderTree({ module: this.module, id: folderId }).then(res => {
        const data = res.data.entityList;
        if (data.length) {
          this.selectTasks = data.filter(item => {
            if (item.leaf) {
              return {
                id: item.taskId,
                name: item.taskName
              };
            }
          });
        } else {
          this.selectTasks = [];
        }
        this.formLoading = false;
      });
    },
    filterTasks: tools.debounce(({ vm, value }) => {
      if (value) {
        vm.getList(value);
      } else {
        vm.options = [];
      }
    }, 400),
    getList(name) {
      this.taskLoading = true;
      const api = this.module === 'TASK' ? getListForLabel(name) : getArtifactPage({ name: name, pageNum: 1, pageSize: 10000 });
      api.then(res => {
        this.taskLoading = false;
        const data = res.data;
        this.options = [];
        if (data) {
          if (this.module === 'TASK') {
            for (var i in data) {
              this.options.push({
                id: 'createBy-' + i,
                name: i,
                children: data[i]
              });
            }
          } else {
            this.options = data.list;
          }
          this.$nextTick(() => {
            this.selectTasks.forEach(item => {
              this.$refs.tree.setChecked(item, true);
            });
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
            message: '关联不能超过500个'
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
    save() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.dialogVisible = false;
          this.$emit('saveFolderTask', this.selectTasks, this.folderId);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.task-tag-wrap {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding-left: 5px;
  margin: 5px 0;
  .task-tag {
    margin-right: 5px;
  }
}
.border-dashed {
  border: 1px dashed #d1d7e6;
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
.no-task {
  text-align: center;
  color: #d1d7e6;
}
</style>
