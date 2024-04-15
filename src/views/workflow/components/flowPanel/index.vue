<template>
  <div class="flow-panel">
    <div v-if="editAble" class="leftDrag transition" :class="{ 'left-close': !isOpen }">
      <div class="title">任务类型</div>
      <el-collapse v-model="openTaskSheets" class="content">
        <div v-for="(taskSheet, i) in taskSheets" :key="i">
          <el-collapse-item v-if="!(taskSheet.title === '数据接入类' && !isAdmin && !currentUserGroup.dbc)" :name="taskSheet.title + i">
            <template slot="title">
              {{ taskSheet.title }}
              <img :src="icon[taskSheet.icon]" style="width: 25px; height: 25px; margin-left: 5px" :class="{ DD: taskSheet.icon === 'DD' }" />
            </template>
            <div v-for="(task, j) in taskSheet.list" :id="'dragger' + i + j" :key="j" class="dragger" draggable @dragstart="dragStart(task)" @dragend="dragEnd">
              <el-tooltip :content="task.content" placement="right"><Task :task="task" /></el-tooltip>
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </div>
    <div class="btn-wrap">
      <el-tooltip content="下载" :open-delay="200" popper-class="tag-popper">
        <i class="el-icon-download btn-icon" @click="download"></i>
      </el-tooltip>
      <el-tooltip content="全屏" :open-delay="200" popper-class="tag-popper">
        <i class="el-icon-rank btn-icon" @click="fullscreenFn"></i>
      </el-tooltip>
      <el-tooltip content="格式化" :open-delay="200" popper-class="tag-popper">
        <svg-icon icon-class="format" class="btn-icon" @click="format" />
      </el-tooltip>
    </div>
    <div id="right-content" v-loading="loading" class="right-content">
      <div :class="['tree-arrow']" @click="isOpen = !isOpen">
        <i :class="['icon-arrow-tree', isOpen ? 'el-icon-arrow-left' : 'el-icon-arrow-right']"></i>
      </div>
      <div ref="flowContent" :class="['flow-content', `${fullscreen ? 'table-fullscreen' : ''}`]" @dragover="e => e.preventDefault()">
        <Slider ref="slider" @zoom="handleZoom"></Slider>
        <Graph ref="graph" :data="data" @node-click="handleNodeClick" @edge-connect="handleEdgeConnect" @edge-remove="handleEdgeRemove" @right-click="handleRightClick"></Graph>
        <LabelList :label-list="labelList" @open="openLabel" @close="closeLabel"></LabelList>
      </div>
      <el-tabs v-show="isShowLog" v-model="activeTab" class="log-content" type="card" closable @tab-remove="removeTab">
        <el-tab-pane v-for="item in taskTabs" :key="item.title" :label="item.title" :name="item.name">
          <div class="log" v-html="item.content"></div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-drawer class="drawerDom" :title="dialogTitle" :modal="false" :visible="dialogVisable" :before-close="cancel" size="55%">
      <component :is="taskType" v-if="dialogVisable" ref="componentTask" :data="taskData" source="workflow" class="workflowStep2" @save="save" @cancel="cancel" />
      <i v-if="dialogVisable" class="el-icon-minus minus" title="小窗" @click="addLabelList"></i>
      <div v-if="dialogVisable" v-dragSize="dragSizeObj" class="drop" style="right: 55%">
        <i class="el-icon-more icon"></i>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import taskConfig from './js/taskConfig';
import Task from './task';
import Graph from '../Graph';
import { getToken } from '@/utils/auth';
import Slider from '../Slider';
import { checkOutput } from '@/api/flow';
import LabelList from '../labelList';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';
const taskTemplate = {};
const comsCTX = require.context('@/components/TaskTemplate', false, /.vue$/, 'lazy');
taskConfig.forEach(item => {
  item.list.forEach(child => {
    taskTemplate[child.templateCode] = () => comsCTX(`./${child.templateCode}.vue`);
  });
});
export default {
  name: 'FlowPanel',
  components: {
    Task,
    Graph,
    Slider,
    LabelList,
    ...taskTemplate
  },
  props: {
    data: {
      type: Object,
      default() {
        return {
          nodes: [],
          edges: []
        };
      }
    },
    editAble: {
      type: Boolean,
      default: true
    },
    taskList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // graphWidth: 2000,
      // graphHeight: 1500,
      // data: {
      //   nodes: [],
      //   edges: []
      // },
      icon: {
        DI: require('@/assets/DI.png'),
        DD: require('@/assets/DD.png'),
        DT: require('@/assets/DT.png'),
        Ot: require('@/assets/Ot.png')
      },
      isOpen: true,
      addTaskNum: 0,
      openTaskSheets: taskConfig.map((obj, i) => obj.title + i),
      taskSheets: taskConfig,
      dialogTitle: '',
      dialogVisable: false,
      taskType: '',
      taskData: {},
      activeTab: '',
      taskTabs: [],
      removeTabs: [],
      isShowLog: false,
      websocket: null,
      isConnected: false,
      fullscreen: false,
      removeTaskIds: [],
      dataChangeNum: 0,
      labelList: [],
      dialogDom: null,
      labelNum: 1
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'currentUserGroup']),
    dragSizeObj() {
      const res = {};
      res.sizeDom = this.dialogDom;
      res.sizeDomSeat = 'right';
      res.dropSeatType = 'right';
      res.sizeType = {
        width: true
      };
      res.limit = {
        minWidth: '55%',
        maxWidth: '80%'
      };
      return res;
    }
  },
  watch: {
    editAble(value) {
      this.$nextTick(() => {
        this.$refs.graph && this.$refs.graph.dispose();
        const graphWidth = this.$refs.flowContent.offsetWidth;
        const graphHeight = this.$refs.flowContent.offsetHeight;
        this.$refs.graph.init(graphWidth, graphHeight);
      });
    },
    data(value) {
      this.dataChangeNum++;
      // 只有第一次进入页面时触发
      if (this.dataChangeNum === 1 && this.$route.query.taskId) {
        const obj = value.nodes.find(item => item.id === this.$route.query.taskId);
        if (obj) {
          this.$nextTick(() => {
            const cell = this.$refs.graph.graph.getCellById(this.$route.query.taskId);
            this.handleNodeClick(cell);
          });
        }
      }
    }
  },
  created() {
    this.initWebSocket();
  },
  mounted() {
    const graphWidth = this.$refs.flowContent.offsetWidth;
    const graphHeight = this.$refs.flowContent.offsetHeight;
    this.$refs.graph.init(graphWidth, graphHeight);
    this.$nextTick(() => {
      document.addEventListener('keyup', e => {
        if (e.keyCode === 27) {
          this.fullscreen = false;
          // this.$refs.graph && this.$refs.graph.dispose();
          this.$nextTick(() => {
            const graphWidth = this.$refs.flowContent.offsetWidth;
            const graphHeight = this.$refs.flowContent.offsetHeight;
            // this.$refs.graph.init(graphWidth, graphHeight);
            this.$refs.graph.graph.resize(graphWidth, graphHeight);
          });
        }
      });
    });

    this.dialogDom = document.querySelector('.drawerDom .el-drawer');
    const closeDom = document.querySelector('.drawerDom .el-drawer__header .el-dialog__close');
    closeDom.onclick = () => {
      this.closeLabelFn();
    };
  },
  destroyed() {
    this.websocket && this.websocket.close();
  },
  methods: {
    getLabel(code) {
      let label = '';
      taskConfig.some(item => {
        return item.list.some(child => {
          if (child.templateCode === code) {
            label = child.label;
            return true;
          }
        });
      });
      return label;
    },
    openLabel(data, index) {
      this.dragEnd();
      this.taskData = {};
      this.taskType = data.ruleForm.templateCode;
      this.dialogTitle = data.dialogTitle;
      this.$nextTick(() => {
        const taskCom = this.$refs.componentTask;
        Object.keys(data).forEach(key => {
          taskCom[key] = data[key];
        });
        if (data.ruleForm.templateCode === 'PythonShell') {
          this.resetSql(taskCom, data.seniorForm.cmds);
        } else if (data.ruleForm.templateCode === 'SPARKJAR') {
          this.resetSql(taskCom, data.ruleForm.mainClassArgs);
        } else {
          this.resetSql(taskCom, data.content);
        }
      });
    },
    addLabelList() {
      const taskCom = this.$refs.componentTask;
      const data = tools.copyFn(taskCom[`_data`]);
      data.onceType = taskCom.onceType;
      data.labelName = taskCom.labelName;
      data.dialogTitle = this.dialogTitle;
      if (data.onceType) {
        const index = this.labelList.findIndex(item => item.onceType === data.onceType);
        this.labelList.splice(index, 1, data);
      } else {
        data.onceType = Math.random() + '';

        // 没有任务名称 自定义label名称
        if (!data.ruleForm.name) {
          data.labelName = `编辑中 (${this.labelNum}) ...`;
          this.labelNum++;
        }

        this.labelList.push(data);
      }
      // this.cancel()
      this.dialogVisable = false;
    },
    dragStart(task) {
      this.taskType = task.templateCode;
      this.taskData = {};
      this.dialogTitle = `创建${task.label}`;
    },
    dragEnd() {
      this.dialogVisable = true;
    },
    // 保存任务后更新画布
    formatGraphData(data) {
      let positionX = 0;
      if (!data.id) {
        // 标签多次保存产生多个相同节点处理
        if (this.taskList.some(item => item.name === data.name)) return;

        // 新增的节点
        data.taskKey = 'addTask' + this.addTaskNum;
        this.taskList.push(data);
        // this.data.nodes.push({
        //   id: 'addTask' + this.addTaskNum,
        //   shape: 'card',
        //   data: {
        //     id: 'addTask' + this.addTaskNum,
        //     ...data
        //   }
        // });
        const node = {
          id: 'addTask' + this.addTaskNum,
          x: positionX,
          shape: 'card',
          data: {
            id: 'addTask' + this.addTaskNum,
            ...data
          }
        };
        this.$refs.graph.graph.addNode(node);
      } else {
        // 编辑画布中的节点，更新节点内容
        const id = data.id + '';
        let name = 'id';
        if (id.indexOf('addTask') > -1) {
          data.taskKey = data.id;
          name = 'taskKey';
        }
        const taskIndex = this.taskList.findIndex(item => item[name] + '' === data[name] + '');
        // const nodeIndex = this.data.nodes.findIndex(item => item.id === data.id + '');
        const taskObj = { ...data };
        if (id.indexOf('addTask') > -1) {
          delete taskObj.id;
        }
        this.taskList[taskIndex] = taskObj;
        // this.data.nodes[nodeIndex].data = data;
        const cell = this.$refs.graph.graph.getCellById(data.id + '');
        cell.setData(data);
      }
      // 找到当前任务依赖的所有历史节点，如果该历史节点没有被其他任务依赖，就删除此历史节点
      const historySource = [];
      // 连线逻辑是：找到原画布中 当前任务的所有上游关系，删除连线，根据新的依赖关系重新添加
      // this.data.edges = this.data.edges.filter(item => {
      //   // 找到当前任务依赖的所有历史节点
      //   if (item.target === data.id && item.shape === 'light-dash-edge') {
      //     historySource.push(item.source);
      //   }
      //   return item.target !== data.id;
      // });
      const dataId = data.id || data.taskKey;
      const allEdges = this.$refs.graph.graph.getIncomingEdges(dataId);
      if (allEdges && allEdges.length) {
        allEdges.forEach(edge => {
          if (edge.shape === 'light-dash-edge') {
            historySource.push(edge.source.cell);
          }
          this.$refs.graph.graph.removeEdge(edge);
        });
      }
      if (data.eventDepends.length) {
        // const nodesId = this.data.nodes.map(item => item.id); // 获取当前节点中已存在的id
        data.eventDepends.forEach(item => {
          const id = item.taskId ? item.taskId + '' : item.taskKey; // 如果没有taskId,有taskKey，说明当前的依赖任务是新创建的
          // 判断原画布中是否有当前依赖的任务节点，如果没有，就添加
          // if (!nodesId.includes(id)) {
          //   this.data.nodes.push({
          //     id: id,
          //     shape: 'card',
          //     data: {
          //       ...item,
          //       id: id,
          //       name: item.dependId,
          //       templateCode: item.templateCode, // 应该取item.templateCode,后端还没有返回
          //       isHistoryTask: true // 暂定为true，如果是当前工作流中创建的任务，就为false
          //     }
          //   });
          // }
          if (!this.$refs.graph.graph.hasCell(id)) {
            positionX += 220;
            const node = {
              id: id,
              x: positionX,
              shape: 'card',
              data: {
                ...item,
                id: id,
                name: item.dependId,
                templateCode: item.templateCode, // 应该取item.templateCode,后端还没有返回
                isHistoryTask: true // 暂定为true，如果是当前工作流中创建的任务，就为false
              }
            };
            this.$refs.graph.graph.addNode(node);
          }
          let shape = 'light-dash-edge';
          // 新增的任务没有id,返回taskKey
          const taskIds = this.taskList.map(item => {
            if (item.id) {
              return item.id + '';
            } else if (item.taskKey) {
              return item.taskKey;
            }
          }); // 获取当前任务列表的id
          if (taskIds.includes(id)) {
            // 说明当前依赖任务是工作流中的，用实线连
            shape = 'light-edge';
          }
          // 添加画布中的连线
          // this.data.edges.push({
          //   source: id,
          //   target: data.id || data.taskKey,
          //   shape: shape
          // });
          const edge = {
            source: id,
            target: data.id || data.taskKey,
            shape: shape
          };
          this.$refs.graph.graph.addEdge(edge);
        });
      }
      // 判断依赖的历史任务是否有其他任务依赖，如果没有，就需要删除此历史节点
      if (historySource.length) {
        historySource.forEach(sourceId => {
          // const sourceArr = this.data.edges.filter(item => item.source === sourceId);
          // if (sourceArr.length === 0) {
          //   this.data.nodes = this.data.nodes.filter(item => item.id !== sourceId);
          // }
          const dependEdges = this.$refs.graph.graph.getOutgoingEdges(sourceId);
          if (dependEdges === null) {
            this.$refs.graph.graph.removeNode(sourceId);
          }
        });
      }
      this.updateData();
      this.$refs.graph.render();
    },
    handleZoom(operate) {
      this.$refs.graph.zoomFn(operate);
    },
    save(data) {
      // const params = {
      //   outputDataset: data.outputDataset
      // };
      // if (data.id && data.id.indexOf('addTask') === -1) {
      //   params.taskId = data.id;
      // }
      // checkOutput(params).then(res => {
      //   // const data = res.data;
      //   if (res.code === 0) {
      //     this.addTaskNum++;
      //     this.formatGraphData(data);
      //     this.dialogVisable = false;
      //   }
      // });
      this.addTaskNum++;
      this.formatGraphData(data);
      this.dialogVisable = false;
    },
    closeLabelFn() {
      const taskDom = this.$refs.componentTask;
      if (taskDom && taskDom.onceType) {
        const index = this.labelList.findIndex(item => item.onceType === taskDom.onceType);
        index >= 0 && this.closeLabel(index);
      }
    },
    closeLabel(index) {
      this.labelList.splice(index, 1);
    },
    cancel() {
      this.dialogVisable = false;
    },
    copyNode(data) {
      const task = { ...data };
      delete task.id;
      task.isCopy = true;
      // task.name = task.name + '_copy';
      // if (typeof task.runtimeConfig === 'string') {
      //   task.runtimeConfig = JSON.parse(task.runtimeConfig);
      // }
      // task.runtimeConfig.owner = this.$store.getters.userInfo.userId;
      task.runtimeConfig = typeof task.runtimeConfig === 'string' ? task.runtimeConfig : JSON.stringify(task.runtimeConfig);
      task.inputDataset = typeof task.inputDataset === 'string' ? task.inputDataset : JSON.stringify(task.inputDataset);
      task.outputDataset = typeof task.outputDataset === 'string' ? task.outputDataset : JSON.stringify(task.outputDataset);
      task.dependTypes = typeof task.dependTypes === 'string' ? task.dependTypes : JSON.stringify(task.dependTypes);
      task.triggerParam = typeof task.triggerParam === 'string' ? task.triggerParam : JSON.stringify(task.triggerParam);
      task.eventDepends = typeof task.eventDepends === 'string' ? task.eventDepends : JSON.stringify(task.eventDepends);
      if (!task.canEdit) {
        task.canEdit = true;
      }
      this.taskData = task;
      this.taskType = task.templateCode;
      this.dialogTitle = `创建${this.getLabel(task.templateCode)}`;
      this.dialogVisable = true;
    },
    removeNode(data) {
      this.$confirm('确定删除此节点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 找到要删除节点的target，更新eventDepends
          const targetArr = this.data.edges.filter(item => item.source === data.id);
          const targetIds = targetArr.map(item => item.target);
          if (targetIds.length) {
            targetIds.forEach(id => {
              const cell = this.$refs.graph.graph.getCellById(id);
              const cellData = cell.getData();
              if (typeof cellData.eventDepends === 'string') {
                cellData.eventDepends = JSON.parse(cellData.eventDepends);
                cellData.dependTypes = JSON.parse(cellData.dependTypes);
              }
              // 删除任务中当前source依赖
              const eventId = data.id.indexOf('addTask') > -1 ? 'taskKey' : 'taskId';
              cellData.eventDepends = cellData.eventDepends.filter(item => item[eventId] !== data.id);
              if (cellData.eventDepends.length === 0 && cellData.dependTypes.includes('event')) {
                cellData.dependTypes = cellData.dependTypes.filter(item => item !== 'event');
              }
              cell.setData(cellData);
              // this.$refs.graph.graph.updateCellId(cell);
              // 更新taskList的数据
              const obj = this.taskList.find(item => (item.id || item.taskKey) === id);
              if (obj) {
                obj.dependTypes = cellData.dependTypes;
                obj.eventDepends = cellData.eventDepends;
              }
            });
          }
          // 删除虚线框的前置依赖节点
          const sourceEdgesArr = this.data.edges.filter(item => {
            return item.target === data.id;
          });
          const sourceNodesArr = this.data.nodes.filter(item => {
            return sourceEdgesArr.findIndex(item1 => item1.source === item.data.id) > -1 && item.data.isHistoryTask;
          });
          if (sourceNodesArr.length) {
            sourceNodesArr.forEach(item => {
              this.$refs.graph.graph.removeNode(item.data.id);
            });
          }
          this.$refs.graph.graph.removeNode(data.id);
          this.updateData(); // 后续优化可以去掉，暂时因为有的地方使用的X6 API，有的地方根据data重绘画布，需要统一
          const taskIndex = this.taskList.findIndex(item => {
            // 如果删除的是原来创建的任务，需要保存下来  (排除刚创建的工作流)
            if (item.id === data.id && this.data.id) {
              this.removeTaskIds.push(item.id);
            }
            const id = item.id || item.taskKey;
            return id === data.id;
          });
          if (taskIndex !== -1) {
            this.taskList.splice(taskIndex, 1);
          }
          this.$message.success('删除成功!');
        })
        .catch(() => {});
    },
    updateData() {
      this.data.nodes = [];
      this.data.edges = [];
      const cells = this.$refs.graph.graph.getCells();
      cells.forEach(cell => {
        if (cell.isNode()) {
          const cellData = cell.getData();
          this.data.nodes.push({
            id: cellData.id,
            shape: cell.shape,
            data: {
              ...cellData
            }
          });
        } else if (cell.isEdge()) {
          this.data.edges.push({
            source: cell.source.cell,
            target: cell.target.cell,
            shape: cell.shape
          });
        }
      });
    },
    initWebSocket() {
      if (typeof WebSocket === 'undefined') {
        this.$message.error('您的浏览器不支持socket');
      } else {
        if (this.websocket === null) {
          const name = process.env.VUE_APP_API_PATH.split('//')[1];
          const url = `wss://${name}/websocket/task/debug`;
          const token = getToken();
          this.websocket = new WebSocket(url, token);
          this.websocket.onopen = evt => {
            this.onOpen(evt);
          };
          this.websocket.onmessage = evt => {
            this.onMessage(evt);
          };
          this.websocket.onclose = evt => {
            this.onClose(evt);
          };
          this.websocket.onerror = evt => {
            this.onError(evt);
          };
        }
      }
    },
    onOpen(evt) {
      console.log('onOpen...', evt);
    },
    onMessage(evt) {
      // console.log('onMessage...', evt);
      const res = JSON.parse(evt.data);
      if (res.code === 0) {
        const data = res.data;
        if (data) {
          if (data.type === 'SYSTEM_MESSAGE' && data.data.message.indexOf('连接成功') > -1) {
            this.isConnected = true;
          }
          // 任务调试信息
          if (data.type === 'TASK_MESSAGE') {
            this.pushTaskMsg(data.data);
          }
          // 任务状态信息
          if (data.type === 'STATUS_INFO') {
            const obj = this.data.nodes.find(item => item.id === data.data.taskId + '');
            obj.data.state = data.data.status;
            this.$refs.graph.render();
          }
        }
      } else {
        this.$notify.error({
          title: '错误',
          message: res.message
        });
      }
    },
    onSend(message) {
      if (this.isConnected) {
        if (this.websocket) {
          this.websocket.send(JSON.stringify(message));
        } else {
          this.initWebSocket();
          setTimeout(() => {
            this.websocket.send(JSON.stringify(message));
          }, 3000);
        }
      }
    },
    onClose(evt) {
      console.log('onClose...', evt);
      this.websocket.close();
    },
    onError(evt) {
      console.log('onError...', evt);
    },
    pushTaskMsg(data) {
      const task = this.taskTabs.find(item => item.name + '' === data.taskId + '');
      if (task) {
        task.content += '<br/>' + data.message;
      }
    },
    // 运行节点
    runNode(data, isRun) {
      if (!this.isShowLog) {
        this.isShowLog = true;
      }
      if (isRun) {
        // 运行节点
        const ids = this.taskTabs.map(item => item.name);
        if (!ids.includes(data.id)) {
          this.taskTabs.push({
            title: data.name,
            name: data.id,
            content: '正在运行中...'
          });
        }
        const params = {
          type: 'DEBUG',
          data: [data]
        };
        this.onSend(params);
        this.activeTab = data.id;
      } else {
        const params = {
          type: 'SHUTDOWN',
          data: [data.id]
        };
        this.onSend(params);
        // 停止节点
        // this.removeTab(data.id);
      }
      // 在渲染画布的数据中找到当前运行的节点，添加状态:运行-检查上游 停止-失败，判断按钮显示运行/停止字段
      const obj = this.data.nodes.find(item => item.id === data.id);
      obj.data.state = isRun ? 'waiting' : 'failed';
      obj.data.isRunNode = isRun;
      this.$refs.graph.render();
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000);
    },
    runNodes(data, isRun, name) {
      const taskIds = this.findNodes(data.id, name);
      if (!this.isShowLog) {
        this.isShowLog = true;
      }
      this.activeTab = data.id;
      const taskLists = this.taskList.filter(item => taskIds.includes(item.id));
      const ids = this.taskTabs.map(item => item.name);
      if (isRun) {
        // 运行节点
        const runTasks = [];
        taskLists.forEach(item => {
          if (!ids.includes(item.id)) {
            this.taskTabs.push({
              title: item.name,
              name: item.id,
              content: '正在运行中...'
            });
          }
          if (taskIds.includes(item.id)) {
            runTasks.push(item);
          }
        });
        const params = {
          type: 'DEBUG',
          data: runTasks
        };
        this.onSend(params);
      } else {
        // 停止节点
        // this.removeTab(item.id);
        const params = {
          type: 'SHUTDOWN',
          data: taskIds
        };
        this.onSend(params);
      }
      // 在渲染画布的数据中找到当前运行的节点，添加状态:运行-检查上游 停止-失败，判断按钮显示运行/停止字段
      taskIds.forEach(taskId => {
        const obj = this.data.nodes.find(item => item.id === taskId);
        obj.data.state = isRun ? 'waiting' : 'failed';
        // obj.data[name === 'source' ? 'isRunNodeDown' : 'isRunNodeUp'] = isRun
      });
      const currentObj = this.data.nodes.find(item => item.id === data.id);
      currentObj.data[name === 'source' ? 'isRunNodeDown' : 'isRunNodeUp'] = isRun;
      this.$refs.graph.render();
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000);
    },
    // 运行节点及下游
    runNodeDown(data, isRun) {
      this.runNodes(data, isRun, 'source');
    },
    // 运行节点及上游
    runNodeUp(data, isRun) {
      this.runNodes(data, isRun, 'target');
    },
    findNodes(currentId, name) {
      const name2 = name === 'source' ? 'target' : 'source';
      const targetIds = [currentId];
      const edges = this.data.edges;
      function getTarget(sourceArr) {
        sourceArr.forEach(sourceId => {
          var targetIdArr = edges
            .filter(item => {
              return item[name] === sourceId && item[name2].indexOf('addTask') === -1 && item.shape === 'light-edge';
            })
            .map(item => item[name2]);
          if (targetIdArr.length) {
            targetIds.push(...targetIdArr);
            getTarget(targetIdArr);
          }
        });
      }
      getTarget([currentId]);
      return targetIds;
    },
    watchLog(data) {
      const obj = this.taskTabs.find(item => item.name === data.id);
      if (obj) {
        this.activeTab = data.id;
      } else {
        const removeObj = this.removeTabs.find(item => item.name === data.id);
        if (removeObj) {
          this.isShowLog = true;
          this.taskTabs.push(removeObj);
          this.activeTab = data.id;
        } else {
          // this.runNode(data, true);
          this.$message.warning('此节点没有运行过，暂无日志');
        }
      }
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000);
    },
    handleRightClick(name, data, isRun) {
      this[name](data, isRun);
    },
    // 手动连线
    handleEdgeConnect(source, target) {
      const obj = this.taskList.find(item => item.name === target.name); // 为了更新任务列表，传给后端用的
      // const dataNode = this.data.nodes.find(item => item.id === target.id); // 为了更新画布节点，页面用的
      const targetCell = this.$refs.graph.graph.getCellById(target.id);
      if (obj) {
        if (typeof obj.dependTypes === 'string') {
          obj.dependTypes = JSON.parse(obj.dependTypes);
          obj.eventDepends = JSON.parse(obj.eventDepends);
        }
        if (!obj.dependTypes.includes('event')) {
          obj.dependTypes.push('event');
        }
        let eventObj;
        // 如果source是历史数据
        if (source.isHistoryTask) {
          eventObj = {
            dependId: source.dependId,
            granularity: source.granularity,
            metadataId: source.metadataId,
            dateCalculationParam: source.dateCalculationParam,
            unitOffset: source.unitOffset,
            useDateCalcuParam: source.useDateCalcuParam
          };
        } else {
          let metadata, granularity;
          if (typeof source.outputDataset === 'string') {
            metadata = JSON.parse(source.outputDataset).lenght ? JSON.parse(source.outputDataset)[0].metadata : '';
            granularity = JSON.parse(source.triggerParam).outputGranularity; // 调度配置在新建任务时没设置呢，所以不应该有这个值
          } else {
            metadata = source.outputDataset.length ? source.outputDataset[0].metadata : '';
            granularity = source.triggerParam.outputGranularity;
          }
          eventObj = {
            dependId: source.name,
            granularity: granularity,
            metadataId: metadata ? `${metadata.db}.${metadata.table}@${metadata.region}` : '',
            dateCalculationParam: {},
            unitOffset: 0,
            useDateCalcuParam: false
          };
        }
        if (source.id.indexOf('addTask') > -1) {
          eventObj.taskKey = source.id;
        } else {
          eventObj.taskId = source.id;
        }
        const eventTaskIds = obj.eventDepends.map(item => {
          if (item.taskId) {
            return item.taskId;
          } else if (item.taskKey) {
            return item.taskKey;
          }
        });
        if (!eventTaskIds.includes(eventObj.taskId) && !eventTaskIds.includes(eventObj.taskKey)) {
          obj.eventDepends.push(eventObj);
        }
        // dataNode.data = {
        //   id: target.id,
        //   ...obj
        // };
        // this.data.edges.push({
        //   source: source.id + '',
        //   target: target.id + '',
        //   shape: source.isHistoryTask ? 'light-dash-edge' : 'light-edge'
        // });
        targetCell.setData(obj);
      }
      // this.$refs.graph.render();
      this.updateData();
    },
    // 手动删除连线
    handleEdgeRemove(sourceCellId, targetCellId) {
      const sourceId = sourceCellId;
      const targetCell = this.$refs.graph.graph.getCellById(targetCellId);
      const target = targetCell.getData();
      if (typeof target.eventDepends === 'string') {
        target.eventDepends = JSON.parse(target.eventDepends);
        target.dependTypes = JSON.parse(target.dependTypes);
      }
      // 删除任务中当前source依赖
      const eventId = sourceId.indexOf('addTask') > -1 ? 'taskKey' : 'taskId';
      target.eventDepends = target.eventDepends.filter(item => item[eventId] + '' !== sourceId);
      if (target.eventDepends.length === 0 && target.dependTypes.includes('event')) {
        target.dependTypes = target.dependTypes.filter(item => item !== 'event');
      }
      targetCell.setData(target);
      // 更新taskList中的数据
      const obj = this.taskList.find(item => item.id === target.id);
      if (obj) {
        obj.dependTypes = target.dependTypes;
        obj.eventDepends = target.eventDepends;
      }
      this.updateData();
      // this.$refs.graph.render();
    },
    // 点击节点
    handleNodeClick(node) {
      const data = node.getData();
      // const task = this.taskList.find(item => item.name === data.name);
      // data.dependTypes = task.dependTypes;
      // data.eventDepends = task.eventDepends;
      if (data.isHistoryTask) {
        const { href } = this.$router.resolve({
          path: '/task/detail',
          query: {
            id: data.id,
            name: data.name
          }
        });
        window.open(href, '_blank');
      } else {
        const index = this.labelList.findIndex(item => item.ruleForm.name === data.name);
        if (index > -1) {
          // 具有标签引用
        } else {
          data.runtimeConfig = typeof data.runtimeConfig === 'string' ? data.runtimeConfig : JSON.stringify(data.runtimeConfig);
          data.inputDataset = typeof data.inputDataset === 'string' ? data.inputDataset : JSON.stringify(data.inputDataset);
          data.outputDataset = typeof data.outputDataset === 'string' ? data.outputDataset : JSON.stringify(data.outputDataset);
          data.dependTypes = typeof data.dependTypes === 'string' ? data.dependTypes : JSON.stringify(data.dependTypes);
          data.triggerParam = typeof data.triggerParam === 'string' ? data.triggerParam : JSON.stringify(data.triggerParam);
          data.eventDepends = typeof data.eventDepends === 'string' ? data.eventDepends : JSON.stringify(data.eventDepends);
          if (data.canEdit === undefined) {
            data.canEdit = true;
          }
          this.taskData = data;
        }
        this.taskType = data.templateCode;
        this.dialogTitle = '编辑' + this.getLabel(data.templateCode);
        this.dialogVisable = true;
        if (index > -1) {
          this.taskData = {};
          this.$nextTick(() => {
            const taskDom = this.$refs.componentTask;
            const currtObj = this.labelList[index];
            taskDom.onceType = Math.random() + '';
            if (currtObj.labelName) taskDom.labelName = currtObj.labelName;
            Object.keys(currtObj).forEach(key => {
              taskDom[key] = currtObj[key];
            });

            if (currtObj.ruleForm.templateCode === 'PythonShell') {
              this.resetSql(taskDom, currtObj.seniorForm.cmds);
            } else if (currtObj.ruleForm.templateCode === 'SPARKJAR') {
              this.resetSql(taskDom, currtObj.ruleForm.mainClassArgs);
            } else {
              this.resetSql(taskDom, currtObj.content);
            }
          });
        }
      }
    },
    resetSql(dom, sql) {
      sql = sql || '';
      dom.$refs.monaco?.setCode(sql);
    },
    removeTab(targetName) {
      this.$confirm('此操作会停止打印该任务的运行日志，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            type: 'SHUTDOWN',
            data: [targetName]
          };
          this.onSend(params);
          const tabs = this.taskTabs;
          const task = tabs.find(item => item.name === targetName);
          this.removeTabs.push(task); // 缓存移除的节点日志
          this.taskTabs = tabs.filter(tab => tab.name !== targetName);
          if (this.taskTabs.length) {
            if (this.activeTab === targetName) {
              this.activeTab = this.taskTabs[0].name;
            }
          } else {
            this.isShowLog = false;
          }
        })
        .catch(() => {});
    },
    scrollToBottom() {
      const div = document.getElementById('right-content');
      div && (div.scrollTop = div.scrollHeight);
    },
    download() {
      this.$refs.graph.exportPng();
    },
    fullscreenFn() {
      this.fullscreen = !this.fullscreen;
      // this.$refs.graph.dispose();
      this.$nextTick(() => {
        const graphWidth = this.$refs.flowContent.offsetWidth;
        const graphHeight = this.$refs.flowContent.offsetHeight;
        // this.$refs.graph.init(graphWidth, graphHeight);
        this.$refs.graph.graph.resize(graphWidth, graphHeight);
        this.$message('按ESC可退出全屏');
      });
    },
    format() {
      this.$refs.graph.dispose();
      this.$nextTick(() => {
        // 删除节点状态
        this.data.nodes.forEach(item => {
          if (item.data.state) {
            delete item.data.state;
          }
        });
        const graphWidth = this.$refs.flowContent.offsetWidth;
        const graphHeight = this.$refs.flowContent.offsetHeight;
        this.$refs.graph.init(graphWidth, graphHeight);
        this.$refs.slider.value = 100;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.flow-panel {
  // overflow: hidden;
  display: flex;
  position: relative;
  height: calc(100vh - 148px);

  .leftDrag {
    z-index: 100;
    position: relative;
    flex: 0 0 auto;
    width: 227px;
    height: 100%;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #e1e5ef;
    &.left-close {
      flex: 0 0 0;
      width: 0;
    }
    .title {
      font-size: $global-font-size-16;
      padding: 8px 10px;
      color: #333;
    }
    .content {
      padding: 0 10px;
      width: 220px;
      .dragger + .dragger {
        margin-top: 24px;
      }
      .DD {
        transform: rotate(180deg);
      }
      .header-icon {
        width: 23px;
        height: 22px;
        border: 2px solid #edab61;
        margin-left: 5px;
        text-align: center;
        &.DI {
          border-color: #edab61;
          color: #edab61;
        }
        &.DT {
          border-color: #74e74a;
          color: #74e74a;
        }
        &.DD {
          border-color: #459445;
          color: #459445;
        }
        &.Ot {
          border-color: #bb66cb;
          color: #bb66cb;
        }
        span {
          position: relative;
          bottom: 15px;
        }
      }
    }
  }
  .tree-arrow {
    position: absolute;
    left: -0;
    top: 50%;
    z-index: 100;
    cursor: pointer;
    height: 56px;
    line-height: 56px;
    border-radius: 2px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 12px solid #f2f2f2;
    &:hover {
      transform: scale(1.1);
      transform-origin: left center;
      border-left: 12px solid #f0f0f0;
      .icon-arrow-tree {
        color: #c0c0c0;
      }
    }
    // &.tree-arrow-close {
    //   top: 50%;
    //   right: -25px;
    // }
    .icon-arrow-tree {
      position: relative;
      left: -12px;
      top: -10px;
      color: #c2c2c2;
    }
  }
  .btn-wrap {
    position: absolute;
    top: -30px;
    right: 200px;
    .btn-icon {
      font-size: $global-font-size-16;
      // color: $c-primary;
      margin-right: 10px;
      cursor: pointer;
      &:nth-child(2) {
        transform: rotate(-45deg);
      }
      &:nth-child(3) {
        font-size: $global-font-size-20;
        position: absolute;
        top: -2px;
      }
    }
  }
  .right-content {
    flex: 1;
    overflow-y: auto;
    // overflow: visible;
    position: relative;
    .flow-content {
      height: calc(100vh - 148px);
      overflow: hidden;
      position: relative;
    }
    .log-content {
      // border: 1px solid #ddd;
      // height: 100px;
      ::v-deep .el-tabs__nav-scroll {
        background: #5a5a5a;
      }
      ::v-deep .el-tabs__header .el-tabs__item {
        background: #5a5a5a;
        color: #fff;
        &.is-active {
          background: #2d2f3f;
        }
      }
      ::v-deep .el-tabs__content {
        background: #2d2f3f;
        color: #fff;
      }
      .log {
        min-height: 300px;
        max-height: 600px;
        overflow-y: auto;
      }
    }
  }
}
</style>
<style lang="scss">
.drawerDom {
  overflow: auto;
  .el-drawer__body {
    // min-width: 830px;
    .minus {
      position: fixed;
      top: 24px;
      right: 55px;
      cursor: pointer;
    }
    .drop {
      height: 56px;
      line-height: 38px;
      border-radius: 2px;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 12px solid #f2f2f2;
      position: fixed;
      top: 50%;
      transform: translate(100%, -50%);
      .icon {
        transform: rotate(90deg) translateY(12px);
        color: #c0c0c0;
      }
    }
  }
}
</style>
