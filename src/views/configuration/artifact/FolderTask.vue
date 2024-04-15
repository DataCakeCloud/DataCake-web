<template>
  <div>
    <el-dialog width="30%" title="关联文件" :visible.sync="dialogVisible" :append-to-body="true">
      <el-form ref="ruleForm" v-loading="formLoading" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item label="已关联文件">
          <el-input v-model="filterLinkedTask" placeholder="请选择归属于该标签的文件（最多可选500个）" @input="getFilterLinkedTask"></el-input>
          <div v-if="!filterSelectTasks.length" :class="['task-tag-wrap', selectTasks.length ? 'border-dashed' : '']">
            <el-tag v-for="item in selectTasks" :key="item.id" closable type="info" effect="plain" class="task-tag" @close="handleClose(item)">
              {{ item.name }}
            </el-tag>
          </div>
          <div v-else :class="['task-tag-wrap', selectTasks.length ? 'border-dashed' : '']">
            <el-tag v-for="item in filterSelectTasks" :key="item.id" closable type="info" effect="plain" class="task-tag" @close="handleClose(item)">
              {{ item.name }}
            </el-tag>
          </div>
          <div v-if="!selectTasks.length" class="no-task">暂无关联文件</div>
        </el-form-item>
        <el-form-item label="添加关联文件">
          <el-input v-model="filterText" v-loading="taskLoading" placeholder="请选择归属于该标签的文件（最多可选500个）"></el-input>
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
import { getArtifactPage } from '@/api/artifact.js';
import { getListForLabel, getTaskLabelInfo, updateFolderTask } from '@/api/task';
import * as tools from '@/utils/tools';
export default {
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
    }
  },
  methods: {
    showFolderTask(folderId) {
      this.dialogVisible = true;
      this.filterLinkedTask = '';
      this.filterSelectTasks = [];
      this.folderId = folderId;
      this.filterText = '';
      this.getInfo(folderId);
    },
    getFilterLinkedTask(val) {
      if (this.selectTasks.length) {
        this.filterSelectTasks = this.selectTasks.filter((item, key) => {
          return item.name.indexOf(val) !== -1;
        });
      }
    },
    getInfo(folderId) {
      this.formLoading = true;
      getTaskLabelInfo({ folderId: folderId }).then(res => {
        const data = res.data;
        if (data.length) {
          this.selectTasks = data.map(item => {
            return {
              id: item.taskId,
              name: item.taskName
            };
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
      getArtifactPage({
        name: name,
        pageNum: 1,
        pageSize: 10000
      }).then(res => {
        this.taskLoading = false;
        const data = res.data;
        this.options = data.list;
        if (data) {
          // for (var i in data) {
          //   this.options.push({
          //     id: 'createBy-' + i,
          //     name: i,
          //     children: data[i]
          //   });
          // }
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
            message: '关联文件不能超过500个'
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
          this.btnDisabled = true;
          const params = {
            folderId: this.folderId,
            taskIds: this.selectTasks.map(item => {
              return {
                taskId: item.id,
                taskName: item.name
              };
            })
          };
          updateFolderTask(params)
            .then(data => {
              this.dialogVisible = false;
              this.$message({
                type: 'success',
                message: '关联成功'
              });
              this.$emit('saveFolderTask');
              this.btnDisabled = false;
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
