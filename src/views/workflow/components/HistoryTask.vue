<template>
  <el-dialog :visible.sync="dialogVisible" width="1100px" class="custom-dialog" :close-on-click-modal="false" @close="closeDialog">
    <div slot="title">
      导入历史任务
      <el-tooltip effect="dark" content="只能导入任务owner或协作者为自己的任务" placement="bottom">
        <i class="el-icon-info global-color-ca"></i>
      </el-tooltip>
    </div>
    <div v-loading="loading" class="history-task">
      <!-- <el-transfer v-model="value" :data="taskData" :props="props" class="transfer" filterable filter-placeholder="请输入任务ID/名称/标签" :titles="['历史任务列表', '已选择列表']" @change="changeTransfer">
        <el-tooltip slot-scope="{ option }" :content="`${option.name}(${option.granularity})`">
          <span>{{ option.name }}({{ option.granularity }})</span>
        </el-tooltip>
      </el-transfer> -->
      <tree-transfer ref="treeTransfer" :datas="treeTransferData" :default-props="defaultProps" :checked-list="treeChecked"></tree-transfer>
      <div class="preview-btn">
        <!-- <el-tooltip effect="dark" content="这里预览的是“已选择列表”中的全部任务" placement="top"> -->
        <el-button type="primary" :loading="btnLoading" @click="priview">预览</el-button>
        <!-- </el-tooltip> -->
      </div>
      <div ref="previewWrap" class="preview-wrap">
        <Graph ref="graph" :data="graphData" :is-show-minmap="false" :layout-begin="[10, 10]" :ranksep="20" :nodesep="30"></Graph>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <!-- <el-tooltip effect="dark" content="这里将要导入的是“已选择列表”中的全部任务" placement="top"> -->
      <el-button type="primary" @click="submit">确认导入</el-button>
      <!-- </el-tooltip> -->
    </span>
  </el-dialog>
</template>
<script>
import { searchTask, getWorkflowDraw } from '@/api/flow';
import TreeTransfer from './TreeTransfer';
import Graph from './Graph';

export default {
  name: 'HistoryTask',
  components: {
    TreeTransfer,
    Graph
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      props: {
        key: 'id',
        label: 'name'
      },
      btnLoading: false,
      value: [],
      taskData: [],
      graphData: {
        nodes: [],
        edges: []
      },
      treeTransferData: [],
      defaultProps: {
        id: 'treeId',
        label: 'name',
        children: 'children'
      },
      treeChecked: []
    };
  },
  methods: {
    showWin() {
      this.dialogVisible = true;
      this.getTaskList();
      this.$nextTick(() => {
        const graphWidth = this.$refs.previewWrap && this.$refs.previewWrap.offsetWidth;
        const graphHeight = this.$refs.previewWrap && this.$refs.previewWrap.offsetHeight;
        this.$refs.graph.init(graphWidth, graphHeight);
        this.$refs.treeTransfer.reset();
      });
    },
    getTaskList() {
      this.loading = true;
      searchTask({
        keyword: ''
      }).then(res => {
        const data = res.data;
        this.taskData = [];
        this.treeTransferData = [];
        data.forEach(item => {
          // item.taskList.forEach(child => {
          //   this.taskData.push({
          //     ...child,
          //     disabled: false
          //   });
          // });
          // 构造树形结构数据
          const obj = {
            treeId: item.labelName,
            name: item.labelName
          };
          item.taskList.forEach(child => {
            child.disabled = false;
            child.treeId = item.labelName + child.id;
          });
          obj.children = item.taskList;
          this.treeTransferData.push(obj);
        });
        this.loading = false;
      });
    },
    priview() {
      const selected = this.$refs.treeTransfer.getVal();
      // if (this.value.length) {
      if (selected.length) {
        const tasks = selected.map(item => {
          return { taskId: item.id };
        });
        this.btnLoading = true;
        getWorkflowDraw({ tasks })
          .then(res => {
            const data = res.data;
            this.graphData = {
              nodes: [],
              edges: []
            };
            data.nodeList.forEach(item => {
              this.graphData.nodes.push({
                id: item.taskId + '',
                shape: 'mini-card',
                data: {
                  id: item.taskId + '',
                  name: item.taskName,
                  templateCode: item.templateCode,
                  isHistoryTask: item.isOutside
                }
              });
            });
            data.relation.forEach(item => {
              this.graphData.edges.push({
                source: item.source + '',
                target: item.target + '',
                shape: item.sourceIsOutside ? 'light-dash-edge' : 'light-edge'
              });
            });
            this.$refs.graph.render();
          })
          .finally(() => {
            this.btnLoading = false;
          });
      } else {
        // this.$message.warning('请先选择历史任务');
        this.$message.warning('请在已选择列表中勾选想要预览的任务');
      }
    },
    changeTransfer(allKey, direction, removeKey) {
      if (direction === 'right') {
        // 向右移动时，判断粒度是否一致，不一致不能移动
        if (allKey.length === removeKey.length) {
          // 第一次移动，右侧没有数据
          const removeObjs = this.taskData.filter(item => removeKey.includes(item.id));
          const granularity = removeObjs[0].granularity;
          removeObjs.forEach(item => {
            if (item.granularity !== granularity) {
              this.$message.warning('必须选择粒度一致的任务');
              this.value = [];
              return;
            }
          });
          if (this.value.length) {
            this.taskData.forEach(item => {
              if (item.granularity !== granularity) {
                item.disabled = true;
              }
            });
          }
        }
      }
      if (allKey.length === 0) {
        this.taskData.forEach(item => {
          item.disabled = false;
        });
      }
    },
    closeDialog() {
      this.value = [];
      this.graphData = {
        nodes: [],
        edges: []
      };
      this.$refs.graph.dispose();
    },
    submit() {
      const selected = this.$refs.treeTransfer.getVal();
      // if (this.value.length) {
      if (selected.length) {
        const tasks = selected.map(item => {
          return { taskId: item.id };
        });
        // localStorage.setItem('graphData', JSON.stringify(this.graphData));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        this.$router.push({
          path: '/workflow/add',
          query: { type: 'history' }
        });
      } else {
        this.$message.warning('请在已选择列表中勾选想要导入的任务');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.history-task {
  display: flex;
  align-items: center;
  .transfer {
    ::v-deep .el-transfer-panel {
      width: 220px;
    }
  }
  .preview-btn {
    width: 100px;
    text-align: center;
  }
  .preview-wrap {
    width: 280px;
    height: 300px;
  }
}
</style>
