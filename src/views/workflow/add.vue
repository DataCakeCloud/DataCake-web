<template>
  <div class="container">
    <div class="menu">
      <div class="menu-left">
        <!-- <router-link :to="{ path: '/task/workflow' }">工作流列表</router-link> -->
        <!-- <el-popconfirm v-if="this.formData.taskList.length" title="确定退出当前页面吗？" confirm-button-text="是" cancel-button-text="否" @confirm="close">
          <a slot="reference">工作流列表</a>
        </el-popconfirm> -->
        <a @click="close">工作流列表</a>
        / {{ workflowId ? formData.name : '新建工作流' }}
        <span class="graph-tips">
          画布说明
          <el-tooltip effect="dark" popper-class="tooltip-width" placement="top" content="画布中的虚线边框节点代表的是依赖任务/数据集，它不属于此工作流管理，工作流不会调度/执行它">
            <i class="el-icon-info global-color-ca"></i>
          </el-tooltip>
        </span>
      </div>
      <div class="menu-right">
        <el-button class="menu-btn" size="mini" type="primary" @click="save">保存</el-button>
        <el-popconfirm v-if="this.formData.taskList.length" class="menu-btn" popper-class="close-popper" title="确定退出当前页面吗？" confirm-button-text="是" cancel-button-text="否" @confirm="close">
          <el-button slot="reference" size="mini">关闭</el-button>
        </el-popconfirm>
        <el-button v-else size="mini" @click="close">关闭</el-button>
      </div>
    </div>
    <flow-panel ref="flowPanel" :loading="loading" :data="flowData" :task-list="formData.taskList" :edit-able="editAble"></flow-panel>
    <el-dialog title="保存工作流" :visible.sync="dialogVisable" width="600px" append-to-body>
      <el-form ref="formData" :model="formData" :rules="rules" label-position="right" label-width="100px">
        <el-form-item prop="name" label="工作流名称">
          <el-input v-model="formData.name" placeholder="须以字母、数字、下划线（_）组合，且不能以数字和下划线（_）开头，不超过100个字符" maxlength="100" />
        </el-form-item>
        <el-form-item prop="description" label="描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入不超过200个字符" maxlength="200" />
        </el-form-item>
        <!-- <el-form-item label="负责人" prop="owner">
          <el-select
            v-model="formData.owner"
            placeholder="请输入负责人"
            clearable
            filterable
            remote
            :remote-method="
              query => {
                remoteMethod(query, 'ownerList');
              }
            "
            :loading="selectLoading"
            popper-class="custom-popper"
            style="width: 100%"
          >
            <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
              <div style="max-width: 410px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="协作人">
          <el-select
            v-model="formData.collaborators"
            placeholder="请输入协作人"
            filterable
            multiple
            :multiple-limit="5"
            remote
            :remote-method="
              query => {
                remoteMethod(query, 'collaboratorsList');
              }
            "
            :loading="selectLoading"
            popper-class="custom-popper"
            style="width: 100%"
          >
            <el-option v-for="item in collaboratorsList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
              <div style="max-width: 410px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="用户组">
          <el-select v-model="formData.groupList" placeholder="请选择用户组" multiple filterable style="width: 100%" disabled>
            <el-option v-for="item in userGroupList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-tabs>
          <el-tab-pane label="调度配置"><dispatch-config ref="dispatchConfig" :data="this.formData"></dispatch-config></el-tab-pane>
        </el-tabs>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisable = false">取 消</el-button>
        <el-tooltip effect="dark" popper-class="tooltip-width" placement="top" :content="type === 'history' ? '保存即上线，如需下线，请自行切换至下线。并且，其中的历史任务（如果有）将不再在任务列表中显示，将只在工作流中显示' : '保存即上线，如需下线，请自行切换至下线。'">
          <el-button type="primary" :disabled="submitDisabled" @click="submit">确 定</el-button>
        </el-tooltip>
      </span>
    </el-dialog>
    <el-dialog title="删除提示" :visible.sync="deleteVisible" width="700px">
      <div class="mb10">以下是删除的任务正在被依赖的信息：</div>
      <el-table v-loading="deleteLoading" :data="tableData" stripe border class="custom-table" :cell-style="{ padding: '10px 0' }" style="width: 100%">
        <el-table-column prop="curTaskName" label="任务名称" min-width="150"></el-table-column>
        <el-table-column prop="downTaskName" label="下游任务" min-width="150"></el-table-column>
        <el-table-column prop="downTaskOwner" label="下游任务owner" min-width="100"></el-table-column>
      </el-table>
      <div class="mt10">
        <span>通知下游任务owner：</span>
        <el-radio-group v-model="notify">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="deleteSave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { addWorkflow, editWorkflow, getWorkFlowById } from '@/api/workflow';
import { addWorkflow, editWorkflow, getWorkflowInfo, getWorkflowDraw, getTaskBatch, getDelTasks } from '@/api/flow';
import { getUserList } from '@/api/task';
import FlowPanel from './components/flowPanel';
import DispatchConfig from './components/DispatchConfig';
import { getGroup } from '@/api/jurisdiction';

export default {
  components: { FlowPanel, DispatchConfig },
  data() {
    const validatePass = (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多100个字符'));
      } else {
        callback();
      }
    };
    return {
      workflowId: this.$route.query.id,
      version: this.$route.query.version,
      type: this.$route.query.type,
      loading: false,
      name: '创建工作流',
      dialogVisable: false,
      relations: [],
      editAble: true,
      ownerList: [],
      collaboratorsList: [],
      flowData: {
        nodes: [],
        edges: []
      },
      formData: {
        source: this.$route.query.type,
        name: '',
        description: '',
        owner: '',
        collaborators: [],
        groupList: [],
        granularity: 'daily',
        cronConfig: {
          dayOfWeek: 1,
          dayOfMonth: 1,
          hour: 0,
          minute: 0,
          fromHour: 0,
          fromMinute: 0
        },
        taskList: []
      },
      userGroupList: [],
      rules: {
        name: [
          { required: true, message: '请输入工作流名称', trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        collaborators: [{ required: true, message: '请输入协作人', trigger: 'blur' }]
      },
      submitDisabled: false,
      selectLoading: false,
      deleteVisible: false,
      deleteLoading: false,
      tableData: [],
      notify: true,
      btnDisabled: false
    };
  },
  created() {
    if (!this.workflowId) {
      this.formData.owner = this.$store.getters.userInfo.userId;
    }
    this.remoteMethod(this.formData.owner, 'ownerList');
    this.getUserGroup();
  },
  mounted() {
    if (this.workflowId) {
      this.getData();
    }
    if (this.type === 'history') {
      this.editAble = false;
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      if (tasks) {
        this.getTasksList(tasks);
      }
    }
  },
  methods: {
    getUserGroup() {
      this.formData.groupList = this.$store.getters['user/currentUserGroup'].id ? [this.$store.getters['user/currentUserGroup'].id] : [];
      this.userGroupList = this.$store.getters['user/userGroupList'];
      // getGroup().then(res => {
      //   const data = res.data;
      //   this.userGroupList = data;
      // });
    },
    remoteMethod(query, list) {
      if (query !== '') {
        this.selectLoading = true;
        getUserList(query).then(res => {
          const data = res.data;
          this.selectLoading = false;
          this[list] = data;
        });
      }
    },
    getTasksList(params, graphData) {
      this.loading = true;
      getTaskBatch(params).then(res => {
        const data = res.data;
        this.formData.taskList = data;
        this.getRelation(params);
      });
    },
    close() {
      this.$router.push('/task/workflow');
    },
    save() {
      this.dialogVisable = true;
    },
    submit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.formData.taskList = this.$refs.flowPanel.taskList;
          this.formData.taskList.forEach(item => {
            item.eventDepends = typeof item.eventDepends === 'string' ? JSON.parse(item.eventDepends) : item.eventDepends;
            item.eventDepends.forEach(child => {
              if (child.taskKey) {
                child.granularity = this.formData.granularity;
              }
            });
          });
          const removeTaskIds = this.$refs.flowPanel.removeTaskIds;
          // 如果删除过非新增的任务，需要弹窗提示依赖的下游和是否通知
          if (removeTaskIds.length) {
            this.showDeleteDialog(removeTaskIds);
          } else {
            this.submitDisabled = true;
            let action, text;
            if (this.formData.id) {
              action = editWorkflow(this.formData);
              text = '编辑成功';
            } else {
              action = addWorkflow(this.formData);
              text = '新建成功';
            }
            action
              .then(res => {
                this.$message.success(text);
                this.$router.push('/task/workflow');
              })
              .finally(() => {
                this.submitDisabled = false;
              });
          }
        }
      });
    },
    showDeleteDialog(removeTaskIds) {
      this.deleteVisible = true;
      this.deleteLoading = true;
      getDelTasks({
        taskIds: removeTaskIds.join(',')
      }).then(res => {
        const data = res.data;
        this.tableData = data;
        if (this.tableData.length === 0) {
          this.notify = false;
        }
        this.deleteLoading = false;
      });
    },
    deleteSave() {
      this.btnDisabled = true;
      editWorkflow({
        ...this.formData,
        notify: this.notify
      })
        .then(res => {
          this.$message.success('编辑成功');
          this.$router.push('/task/workflow');
        })
        .finally(() => {
          this.btnDisabled = false;
        });
    },
    getData() {
      this.loading = true;
      getWorkflowInfo({
        workflowId: this.workflowId,
        version: this.version
      }).then(res => {
        const data = res.data;
        if (data.source === 'history' && data.status === 0) {
          this.editAble = false;
        }
        this.formData = {
          id: data.id,
          originWorkflowVersionId: data.workflowVersionId,
          source: this.$route.query.type,
          name: data.name,
          description: data.description,
          owner: data.owner,
          collaborators: data.collaborators,
          groupList: data.groupList.map(item => item.id),
          granularity: data.granularity,
          cronConfig: data.cronConfig,
          taskList: data.taskList
        };
        const tasks = data.taskList.map(item => {
          return {
            taskId: item.id,
            version: item.currentVersion
          };
        });
        this.getRelation(tasks);
      });
    },
    getRelation(tasks) {
      getWorkflowDraw({ tasks }).then(res => {
        const data = res.data;
        this.flowData = {
          nodes: [],
          edges: []
        };
        data.nodeList.forEach(item => {
          let nodesData = {};
          const obj = this.formData.taskList.find(task => task.id === item.taskId);
          if (obj) {
            obj.id = obj.id + '';
            nodesData = {
              ...obj,
              isHistoryTask: item.isOutside
            };
          } else {
            let eventObj = {};
            this.formData.taskList.forEach(task => {
              const eventDepends = JSON.parse(task.eventDepends);
              const event = eventDepends.find(event => event.taskId === item.taskId + '');
              if (event) {
                eventObj = event;
                return;
              }
            });
            nodesData = {
              ...eventObj,
              id: item.taskId + '',
              name: item.taskName,
              templateCode: item.templateCode,
              isHistoryTask: item.isOutside
            };
          }
          nodesData.canEdit = !this.noEdit(this.formData);
          this.flowData.nodes.push({
            id: item.taskId + '',
            shape: 'card',
            data: nodesData
          });
        });
        data.relation.forEach(item => {
          this.flowData.edges.push({
            source: item.source + '',
            target: item.target + '',
            shape: item.sourceIsOutside ? 'light-dash-edge' : 'light-edge'
          });
        });
        this.loading = false;
      });
    },
    noEdit(row) {
      if (this.$store.getters.userInfo) {
        if (!this.$store.getters.userInfo.isAdmin) {
          // 判断当前登录人是否在当前工作流的用户组中
          const groupListIds = row.groupList.map(item => item.id);
          const groupIds = this.$store.getters.userInfo.groupIds.split(',');
          const isContainGroup = groupIds.some(item => {
            return groupListIds.includes(Number(item));
          });
          if (row.owner === this.$store.getters.userInfo.userId || row.collaborators.includes(this.$store.getters.userInfo.userId) || isContainGroup) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  padding: 15px;
  .menu {
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-btn {
      margin-left: 12px;
    }
    &-left {
      color: #333;
      // font-size: $global-font-size-18;
    }
  }
}
.graph-tips {
  color: #909399;
  margin-left: 10px;
  font-size: $global-font-size-12;
}

.wrap {
  width: 100%;
  flex: 1;
}

.data-tooltip {
  line-height: 1.6;
  font-size: $global-font-size-12;
}
.icon-info {
  color: #333;
  cursor: pointer;
}
</style>
