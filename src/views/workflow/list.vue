<template>
  <el-card class="box-card-container">
    <div class="task-list">
      <div class="left-wrap transition" :class="{ 'left-close': !isOpen }">
        <div v-show="isOpen" class="tree">
          <el-card class="box-card" shadow="never">
            <div slot="header">
              <span>全部标签</span>
            </div>
            <el-select v-model="labelId" placeholder="请选择标签" size="small" :title="tagTitle" filterable clearable style="width: 100%" @change="clickTag">
              <el-option v-for="item in allTagList" :key="item.id" :label="item.name" :value="item.id">
                <el-tooltip popper-class="tag-popper" :content="item.name" placement="top" :disabled="isTipDisabled">
                  <span style="float: left; max-width: 320px; overflow: hidden; text-overflow: ellipsis" @mouseenter="isShowTooltip">{{ item.name }}</span>
                </el-tooltip>
                <el-popover trigger="hover" popper-class="tag-popper" class="icon-star">
                  收藏
                  <!-- <i slot="reference" class="el-icon-star-off" @click="collectTag($event, item)"></i> -->
                  <el-rate slot="reference" v-model="item.collectVal" disabled :max="1" @click.native="collectTag(item)"></el-rate>
                </el-popover>
              </el-option>
            </el-select>
          </el-card>
          <el-card class="box-card" shadow="never">
            <div slot="header">
              <span>我的收藏</span>
            </div>
            <template v-if="collectList && collectList.labels">
              <span v-for="item in collectList.labels" :key="item.name" @contextmenu.prevent="onContextmenu($event, item, 3)">
                <el-tooltip popper-class="tag-popper" :content="item.name" placement="bottom-start" :disabled="isTipDisabled">
                  <el-tag :effect="item.id == params.labelId ? 'dark' : 'plain'" class="item" @mouseenter.native="isShowTooltip" @click="clickTag(item.id)">{{ item.name }}</el-tag>
                </el-tooltip>
              </span>
            </template>
            <div v-else class="no-data">No Data</div>
          </el-card>
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>
                我的标签
                <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                  右击可编辑标签
                  <i slot="reference" class="el-icon-info global-color-ca"></i>
                </el-popover>
              </span>
              <el-button style="float: right; padding: 0" type="text" @click="addTag">添加</el-button>
            </div>
            <div v-if="tagList.current && tagList.current.length === 0" class="no-data">No Data</div>
            <template v-else>
              <span v-for="item in tagList.current" :key="item.name" @contextmenu.prevent="onContextmenu($event, item, 1)">
                <el-tooltip popper-class="tag-popper" :content="item.name" placement="bottom-start" :disabled="isTipDisabled">
                  <el-tag :effect="item.id == params.labelId ? 'dark' : 'plain'" class="item" @mouseenter.native="isShowTooltip" @click="clickTag(item.id)">{{ item.name }}</el-tag>
                </el-tooltip>
              </span>
            </template>
          </el-card>
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>
                公开给我的标签
                <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                  右击可编辑标签
                  <i slot="reference" class="el-icon-info global-color-ca"></i>
                </el-popover>
              </span>
            </div>
            <div v-if="publishTagList.length === 0" class="no-data">No Data</div>
            <template v-else>
              <span v-for="item in publishTagList" :key="item.name" @contextmenu.prevent="onContextmenu($event, item, 4)">
                <el-tooltip popper-class="tag-popper" :content="item.name" placement="bottom-start" :disabled="isTipDisabled">
                  <el-tag :effect="item.id == params.labelId ? 'dark' : 'plain'" class="item" @mouseenter.native="isShowTooltip" @click="clickTag(item.id)">{{ item.name }}</el-tag>
                </el-tooltip>
              </span>
            </template>
          </el-card>
        </div>
        <div :class="['tree-arrow', { 'tree-arrow-close': !isOpen }]" @click="handleOpen">
          <i :class="['icon-arrow-tree', isOpen ? 'el-icon-arrow-left' : 'el-icon-arrow-right']"></i>
        </div>
      </div>
      <div ref="rightWrap" class="right-wrap">
        <div class="search-condition-wrap">
          <div class="search">
            <search-item width="100px" :span="8" label="ID/名称" class="custom-search">
              <el-input v-model.trim="params.keyWord" class="search-box" placeholder="请输入工作流ID、名称" clearable style="width: 300px" @keyup.enter.native="search"></el-input>
            </search-item>
            <!-- <search-item width="60px" :span="8" label="负责人" class="custom-search">
              <el-select
                v-model="params.owner"
                placeholder="请输入负责人"
                size="small"
                clearable
                filterable
                remote
                allow-create
                default-first-option
                :remote-method="remoteMethod"
:loading="ownerLoading"
                class="search-input"
                popper-class="custom-popper"
                @change="search('createBy')"
              >
                <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.shareId">
                  <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                </el-option>
              </el-select>
            </search-item> -->
            <search-item width="60px" :span="8" label="上线状态" class="custom-search">
              <el-select v-model="params.status" placeholder="请选择上线状态" size="small" clearable class="search-input" @change="search('createBy')">
                <el-option key="1" :value="1" label="上线"></el-option>
                <el-option key="2" :value="2" label="下线"></el-option>
              </el-select>
            </search-item>
            <el-button type="primary" size="small" @click="search">查询</el-button>
            <el-checkbox v-if="isShowSelf" v-model="params.onlyMine" class="custom-checkbox" style="margin-left: 5px" @change="getList">只看自己</el-checkbox>
            <el-tooltip v-if="isShowSelf" effect="dark" content="勾选此项后，可以查看&编辑'负责人'为自己或'协作者'为自己或'用户组'包含自己的工作流；" placement="bottom">
              <i class="el-icon-info global-color-ca"></i>
            </el-tooltip>
          </div>
          <el-button type="primary" @click="dialogVisible = true">创建工作流</el-button>
        </div>
        <div class="table-wrap">
          <el-table v-loading="loading" :data="data" stripe border class="custom-table" :cell-style="{ padding: '10px 0' }" style="width: 100%" @sort-change="sortChange">
            <el-table-column prop="id" label="工作流ID" min-width="95" sortable="custom" label-class-name="column-padding"></el-table-column>
            <el-table-column prop="name" label="工作流名称" min-width="270" sortable="custom">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.name" placement="top" :disabled="isTipDisabled">
                  <a class="ellipsis block" @click="clickName(scope.row)" @mouseenter="isShowTooltip">{{ scope.row.name }}</a>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="创建人" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" min-width="160" sortable="custom">
              <template slot-scope="scope">{{ scope.row.updateTime | dataTime }}</template>
            </el-table-column>
            <el-table-column prop="updateBy" label="最近运行状态" min-width="190" align="right" header-align="left" class-name="statusCol">
              <template slot-scope="scope">
                <el-popover v-for="(item, index) in scope.row.taskInstances" :key="index" trigger="hover" placement="bottom">
                  <p>执行时间：{{ item.executionDate ? $utils.parseTime(item.executionDate) : '-' }}</p>
                  <p>执行状态：{{ offlineStateCode[item.state] || '-' }}</p>
                  <p>开始时间：{{ item.startDate ? $utils.parseTime(item.startDate) : '-' }}</p>
                  <p>结束时间：{{ item.endDate ? $utils.parseTime(item.endDate) : '-' }}</p>
                  <p>耗时：{{ (item.duration * 1000) | duration }}</p>
                  <span slot="reference" :class="['circle', 'task-state', item.state]" @click="clickIns(scope.row, item.executionDate)"></span>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="userGroup" label="用户组" min-width="110"></el-table-column>
            <!-- <el-table-column prop="groupList" label="用户组" min-width="120">
              <template slot-scope="scope">{{ getGroupName(scope.row.groupList) }}</template>
            </el-table-column> -->
            <el-table-column prop="granularity" label="执行计划" min-width="120" sortable="custom"></el-table-column>
            <el-table-column prop="nextExecutionDate" label="下次执行" min-width="160">
              <template slot-scope="scope">{{ scope.row.nextExecutionDate | dataTime }}</template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="160">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.description" placement="top" :disabled="isTipDisabled">
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.description || '-' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column fixed="right" prop="status" label="状态" min-width="70" sortable="custom" label-class-name="column-padding">
              <template slot-scope="scope">
                <el-switch :value="scope.row.status === 1" class="online-switch" active-color="#13ce66" inactive-color="#ff4949" @change="goLine(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" min-width="160">
              <template slot-scope="scope">
                <el-button type="text" :disabled="isDisabled(scope.row)" @click="navEdit(scope.row)">编辑</el-button>
                <el-button type="text" :disabled="isDisabled(scope.row) || scope.row.status !== 1" @click="addNum(scope.row)">补数</el-button>
                <el-button type="text" :disabled="isDisabled(scope.row) || scope.row.status === 1" @click="deleteHandler(scope.row)">删除</el-button>
                <el-button type="text" :disabled="isDisabled(scope.row)" @click="getVersion(scope.row)">版本</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination background :total="total" :current-page="params.pageNo" :page-size="params.pageSize" :page-sizes="[10, 20, 30, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
    <win-add-tag ref="dialogTag" :user-id="userInfo.userId" @save="init"></win-add-tag>
    <win-add-num ref="winAddNum" @save="getList"></win-add-num>
    <workflow-version-list ref="versionList" @save="getList"></workflow-version-list>
    <win-del-tip ref="winDelTip" @save="getList"></win-del-tip>
    <el-dialog title="创建工作流" :visible.sync="dialogVisible" width="500px">
      <div class="btn-wrap">
        <span @click="addWorkFlow('new')">全部新建</span>
        <span @click="addWorkFlow('history')">批量导入历史任务</span>
      </div>
    </el-dialog>
    <history-task ref="historyTask"></history-task>
  </el-card>
</template>

<script>
import SearchItem from '@/components/SearchItem';
import { getWorkflowList, turnOnWorkflow, getWorkflowInstance, getNextdate, deleteWorkflow } from '@/api/flow';
import { getLabelList, deleteLabel, collectLabel, cancelLabel, myLabel, getUserList } from '@/api/task';
import WorkflowVersionList from './components/version';
import WinAddNum from './components/WinAddNum';
import WinDelTip from './components/WinDelTip';
import HistoryTask from './components/HistoryTask';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';
import WinAddTag from './components/WinAddTag';
export default {
  components: { WorkflowVersionList, WinAddNum, WinDelTip, HistoryTask, WinAddTag, SearchItem },
  data() {
    let workflowParams;
    if (sessionStorage.getItem('workflowParams')) {
      workflowParams = JSON.parse(sessionStorage.getItem('workflowParams'));
    }
    let initIsOpen = true;
    if (sessionStorage.getItem('isOpen')) {
      initIsOpen = sessionStorage.getItem('isOpen') === 'true';
    }
    return {
      labelId: workflowParams && workflowParams.labelId ? workflowParams.labelId : '',
      params: {
        comefromLabel: false,
        owner: '',
        status: '',
        workflows: '',
        labelId: workflowParams && workflowParams.labelId ? workflowParams.labelId : '',
        keyWord: workflowParams && workflowParams.keyWord ? workflowParams.keyWord : '',
        pageNo: workflowParams && workflowParams.pageNo ? workflowParams.pageNo : 1,
        pageSize: workflowParams && workflowParams.pageSize ? workflowParams.pageSize : 20,
        sortKey: '',
        sortValue: '',
        onlyMine: workflowParams ? workflowParams.onlyMine : false
      },
      isShowSelf: false,
      total: 0,
      ownerLoading: false,
      loading: false,
      ownerList: [],
      // tableHeight: window.innerHeight - 423,
      isOpen: initIsOpen,
      isShowAll: true,
      fullscreen: false,
      statusConfig: tools.taskStatusConfig,
      codeToText: tools.codeToText,
      offlineStateCode: tools.offlineStateCode,
      realtimeStateCode: tools.realtimeStateCode,
      filterTag: '',
      tagList: {},
      allTagList: [],
      publishTagList: [],
      collectList: {},
      isTipDisabled: false,
      keyWordResults: [],
      // 下线弹窗字段
      dialogVisible: false,
      btnDisabled: false,
      ruleForm: {
        id: '',
        status: 0,
        ifnotify: false
      },
      ifnotifyFrom: '',

      data: [],
      recordParams: {
        eventId: 1,
        pageNo: 1,
        pageSize: 10,
        module: 'WORKFLOW'
      }
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'userInfo']),
    tagTitle() {
      const obj = this.allTagList.find(item => item.id === this.labelId);
      if (obj) {
        return obj.name;
      } else {
        return '';
      }
    },
    userInfo() {
      return this.$store.getters.userInfo || JSON.parse(sessionStorage.getItem('userInfo'));
    }
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      if (this.isAdmin) {
        this.isShowSelf = false;
      } else {
        this.isShowSelf = true;
        this.params.onlyMine = JSON.parse(sessionStorage.getItem('workflowParams')) ? JSON.parse(sessionStorage.getItem('workflowParams')).onlyMine : true;
      }
      if (this.params.labelId) {
        await this.getLabelList();
        const workflows = this.allTagList.find(item => {
          return item.id === this.params.labelId;
        }).workflows;
        this.$set(this.params, 'labelId', this.params.labelId);
        this.$set(this.params, 'workflows', workflows);
        this.$set(this.params, 'comefromLabel', true);
        this.labelId = this.params.labelId;
        this.params.pageNum = 1;
        this.getList();
      } else {
        this.getLabelList();
        this.getList();
      }
    },
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query).then(res => {
          this.ownerLoading = false;
          const data = res.data;
          this.ownerList = data;
        });
      } else {
        this.ownerList = [];
      }
    },
    onContextmenu(event, item, index) {
      const itemsList = [
        {
          label: '编辑',
          onClick: () => {
            this.$refs.dialogTag.showWin(item.id, index);
          },
          disabled: !(item.isMy || item.publish)
        },
        {
          label: '删除',
          onClick: () => {
            this.$confirm('确定删除此标签?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                deleteLabel(item.id).then(data => {
                  this.$message({
                    type: 'success',
                    message: '删除成功!'
                  });
                  this.getLabelList();
                  if (item.id === this.params.labelId) {
                    this.labelId = '';
                    this.params.labelId = '';
                    this.search();
                  }
                });
              })
              .catch(() => {});
          },
          disabled: !item.isMy
        },
        {
          label: '添加收藏',
          onClick: () => {
            collectLabel({
              labelId: item.id
            }).then(data => {
              this.$message({
                type: 'success',
                message: '收藏成功!'
              });
              this.getLabelList();
            });
          }
        },
        {
          label: '取消收藏',
          onClick: () => {
            cancelLabel({
              labelId: item.id
            }).then(data => {
              this.$message({
                type: 'success',
                message: '取消收藏成功!'
              });
              this.getLabelList();
            });
          }
        }
      ];
      let items;
      if (index === 1) {
        items = [itemsList[0], itemsList[1], itemsList[2]];
      } else if (index === 2) {
        items = [itemsList[2]];
      } else if (index === 3) {
        items = [itemsList[0], itemsList[1], itemsList[3]];
      } else if (index === 4) {
        items = [itemsList[0]];
      }
      this.$contextmenu({
        items,
        event,
        zIndex: 2100,
        minWidth: 50
      });
      event.preventDefault();
    },
    clickTag(id) {
      const workflows = this.allTagList.find(item => {
        return item.id === id;
      }).workflows;
      if (this.params.labelId === id) {
        this.$set(this.params, 'labelId', '');
        this.$set(this.params, 'workflows', '');
        this.$set(this.params, 'comefromLabel', false);
      } else {
        this.$set(this.params, 'labelId', id);
        this.$set(this.params, 'workflows', workflows);
        this.$set(this.params, 'comefromLabel', true);
      }
      this.labelId = this.params.labelId;
      this.params.pageNum = 1;
      this.getList();
    },
    addTag() {
      this.$refs.dialogTag.showWin();
    },
    handleOpen() {
      this.isOpen = !this.isOpen;
      sessionStorage.setItem('isOpen', this.isOpen);
    },
    collectTag(item) {
      if (item.collectVal) {
        cancelLabel({
          labelId: item.id
        }).then(data => {
          this.$message({
            type: 'success',
            message: '取消收藏成功!'
          });
          this.getLabelList();
        });
      } else {
        collectLabel({
          labelId: item.id
        }).then(data => {
          this.$message({
            type: 'success',
            message: '收藏成功!'
          });
          this.getLabelList();
        });
      }
    },
    async getLabelList() {
      return new Promise((resolve, rej) => {
        getLabelList().then(res => {
          const data = res.data;
          if (data) {
            this.tagList = data;
            this.allTagList = [...data.current, ...data.others];
            this.publishTagList = this.allTagList.filter((item, index) => {
              return item.publish === 1 && item.publishers.includes(this.userInfo.userId);
            });
          }
          this.getMyLabel();
          resolve('success');
        });
      });
    },
    getMyLabel() {
      myLabel().then(res => {
        const data = res.data;
        if (data) {
          this.collectList = data;
          this.allTagList.forEach(item => {
            item.collectVal = 0;
            const collectIndex = this.collectList.labels.findIndex(collectItem => {
              return collectItem.name === item.name;
            });
            if (collectIndex > -1) {
              item.collectVal = 1;
            }
          });
        } else {
          this.collectList = {};
        }
      });
    },
    navEdit(row) {
      // this.$router.push(`/workflow/edit/${id}`);
      this.$router.push({
        path: '/workflow/add',
        query: { id: row.id, version: row.version }
      });
    },
    clickName(row) {
      this.$router.push({
        path: '/workflow/detail',
        query: { id: row.id, version: row.version, name: row.name }
      });
      localStorage.removeItem('executionDate');
    },
    clickIns(row, executionDate) {
      this.$router.push({
        path: '/workflow/detail',
        query: { id: row.id, version: row.version, name: row.name, tab: 2 }
      });
      localStorage.setItem('executionDate', this.$utils.parseTime(executionDate, '{y}-{m}-{d} {h}:{i}:{s}'));
    },
    sortChange({ column, prop, order }) {
      const sortValue = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : '';
      this.params.sortKey = prop;
      this.params.sortValue = sortValue;
      this.getList();
    },
    addNum(row) {
      this.$refs.winAddNum.showWin(row);
    },
    getGroupName(groupList) {
      const name = groupList.map(item => item.name);
      if (name.length) {
        return name.join();
      } else {
        return '-';
      }
    },
    isDisabled(row) {
      if (this.userInfo) {
        if (!this.userInfo.isAdmin) {
          // 判断当前登录人是否在当前工作流的用户组中
          const groupListIds = row.groupList.map(item => item.id);
          const groupIds = this.userInfo.groupIds.split(',');
          const isContainGroup = groupIds.some(item => {
            return groupListIds.includes(Number(item));
          });
          if (row.owner === this.userInfo.userId || row.collaborators.includes(this.userInfo.userId) || isContainGroup) {
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
    },
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNo = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '') delete params[item];
      });
      getWorkflowList(params).then(res => {
        const data = res.data;
        this.data = data.list;
        this.total = data.total;
        this.loading = false;
        const idList = this.data ? this.data.map(item => item.id) : [];
        sessionStorage.setItem('workflowParams', JSON.stringify(params));
        if (idList.length) {
          getWorkflowInstance({
            workflowList: idList,
            num: 7
          }).then(res => {
            const data = res.data;
            for (const i in data) {
              const currentObj = this.data.find(item => item.id === Number(i));
              if (currentObj) {
                this.$set(currentObj, 'taskInstances', data[i]);
              }
            }
          });
          getNextdate({
            workflowList: idList
          }).then(res => {
            const data = res.data;
            for (const i in data) {
              const currentObj = this.data.find(item => item.id === Number(i));
              if (currentObj) {
                this.$set(currentObj, 'nextExecutionDate', data[i]);
              }
            }
          });
        }
      });
    },
    search() {
      this.params.pageNo = 1;
      this.getList();
    },
    goLine(row) {
      if (row.status !== 1) {
        // 当前是下线状态
        this.$confirm(`确定上线?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          turnOnWorkflow({
            workflowId: row.id,
            version: row.version // 列表没有返回这个字段
          })
            .then(res => {
              this.$message.success('上线成功');
              this.getList();
            })
            .finally(() => {
              this.loading = false;
            });
        });
      } else {
        this.$refs.winDelTip.showWin(row, 'turnoff');
      }
    },
    addWorkFlow(type) {
      if (type === 'history') {
        this.dialogVisible = false;
        this.$refs.historyTask.showWin();
      } else {
        this.$router.push({
          path: '/workflow/add',
          query: { type }
        });
      }
      // this.dialogVisible = true;
    },
    deleteHandler(row) {
      // 纯历史的新建工作流 简单删除
      if (row.source === 'history' && row.status === 0) {
        this.$confirm(`确定删除工作流?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          deleteWorkflow({
            workflowId: row.id,
            notify: false
          })
            .then(res => {
              this.$message.success('删除成功');
              this.getList();
            })
            .finally(() => {
              this.loading = false;
            });
        });
      }
      this.$refs.winDelTip.showWin(row, 'del');
    },
    getVersion(row) {
      this.$refs.versionList.showWin(row);
    }
  }
};
</script>

<style lang="scss" scoped>
.list {
  padding: 15px;
}
.search-condition-wrap {
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.online-switch {
  ::v-deep .el-switch__core::after {
    background: #fff !important;
  }
}
.btn-wrap {
  text-align: center;
  span {
    font-size: 16px;
    display: inline-block;
    width: 180px;
    height: 60px;
    line-height: 60px;
    border: 1px solid #e1e5ef;
    border-radius: 4px;
    margin: 0 10px;
    cursor: pointer;
    &:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
  }
}
.circle {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 4px;
  background: #dcdfe6;
  cursor: pointer;
}
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0;
  }
}
.icon-star {
  float: right;
  margin-left: 10px;
  margin-top: 5px;
  cursor: pointer;
}
::v-deep .el-rate__item {
  cursor: pointer !important;
}
.task-list {
  display: flex;
  .left-wrap {
    position: relative;
    width: 180px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &.left-close {
      flex: 0 0 0;
      width: 0;
    }

    .header {
      height: 40px;
      padding: 0 15px;
    }
    .tree {
      padding: 8px;
      overflow-y: auto;
      height: calc(100vh - 48px);
      .box-card {
        margin-bottom: 15px;
        max-height: 42%;
        overflow-y: auto;
        &:last-child {
          margin-bottom: 0;
        }
        ::v-deep .el-card__header {
          padding: 6px 8px;
        }
        ::v-deep .el-card__body {
          padding: 6px;
          .item {
            margin: 2px;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 135px;
          }
        }
      }
    }
  }
  .tree-arrow {
    position: absolute;
    right: -25px;
    top: 50%;
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
    &.tree-arrow-close {
      top: 50%;
      right: -25px;
    }
    .icon-arrow-tree {
      position: relative;
      left: -12px;
      top: -10px;
      color: #c2c2c2;
    }
  }
  .right-wrap {
    padding: 10px 20px 0;
    flex: 1;
    overflow: auto;
    height: calc(100vh - 55px);
    .header {
      height: 26px;
      border-bottom: 1px solid #dcdfe6;
      margin-bottom: 10px;
      .can-click {
        ::v-deep .el-breadcrumb__inner {
          cursor: pointer;
          color: #10adf2;
        }
      }
    }
    .custom-table {
      ::v-deep .statusCol {
        .cell {
          & > span {
            display: inline-block;
            height: 100%;
            padding-top: 7px;
          }
        }
      }
      .el-icon-info {
        cursor: pointer;
      }
    }
    .table-icon {
      color: $c-primary;
    }
    .table-icon-red {
      color: $color-cb;
    }
    .search-condition-wrap {
      display: flex;
      align-items: flex-end;
      .search-group {
        flex: 1;
        margin-right: 70px;
      }
      .btns {
        width: 180px;
        margin-left: 30px;
      }
      .custom-search {
        margin: 3px 0;
        ::v-deep .search-item {
          margin-bottom: 0;
        }
      }
      .search-input {
        width: calc(100% - 80px) !important;
        max-width: 250px;
      }
    }
    ::v-deep .el-tabs.el-tabs--card.el-tabs--top {
      .el-tabs__content {
        padding: 15px 0 0;
        border: none;
      }
    }
    .check-content {
      position: relative;
    }
    .search {
      display: flex;
      align-items: center;
    }
    .custom-checkbox {
      margin-left: 5px;
      ::v-deep .el-checkbox__label {
        padding-left: 5px;
      }
    }
    .custom-alert {
      margin-bottom: 0;
      padding: 4px 16px;
      .status-tag {
        font-size: $global-font-size-12;
        padding: 2px 6px;
        border-radius: 20px;
        background: #fff;
        color: #fff;
        cursor: pointer;
        &.online {
          color: #9270ca;
          border: 1px solid rgba(146, 112, 202, 0.8);
          &.active {
            background: rgba(146, 112, 202, 0.8);
          }
        }
        &.success {
          color: $color-cd;
          border: 1px solid $color-cd;
          &.active {
            background: $color-cd;
          }
        }
        &.failed {
          color: $color-cb;
          border: 1px solid $color-cb;
          &.active {
            background: $color-cb;
          }
        }
        &.canceled {
          color: $color-cc;
          border: 1px solid $color-cc;
          &.active {
            background: $color-cc;
          }
        }
        &.running {
          color: $c-primary;
          border: 1px solid $c-primary;
          &.active {
            background: $c-primary;
          }
        }
        &.active {
          color: #fff;
          font-size: $global-font-size-13;
        }
      }
    }
  }
  .status {
    color: #fff;
    background: #909399;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: $global-font-size-13;
  }
  .circle {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 4px;
    background: #dcdfe6;
  }
  .header-tip {
    position: absolute;
    top: 4px;
    right: 4px;
  }
  .online-switch {
    ::v-deep .el-switch__core::after {
      background: #fff !important;
    }
  }
}
</style>
