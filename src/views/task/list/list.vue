<!--  chenyh1 -->
<template>
  <el-card class="box-card-container">
    <div class="task-list">
      <div id="leftWrap" class="left-wrap transition" :class="{ 'left-close': !isOpen }">
        <div v-show="isOpen" class="tree">
          <el-tabs v-model="tabActiveName" type="border-card" class="border-card" @tab-click="tabClick">
            <el-tab-pane name="文件夹" label="文件夹">
              <UseLazyTree v-if="tabActiveName === '文件夹'" ref="UseLazyTree" module="TASK" @deleteItem="deleteData" @copyItem="copyTask" @clickTreeItem="clickTreeItem" @treeSearch="treeSearch" />
            </el-tab-pane>
            <el-tab-pane name="标签" label="标签">
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
            </el-tab-pane>
          </el-tabs>
        </div>
        <div :class="['tree-arrow', { 'tree-arrow-close': !isOpen }]" @click="handleOpen">
          <i :class="['icon-arrow-tree', isOpen ? 'el-icon-arrow-left' : 'el-icon-arrow-right']"></i>
        </div>
        <div v-if="showDrag" v-dragSize="dragSizeObj" class="drop">
          <!-- <i class="el-icon-more icon"></i> -->
        </div>
      </div>
      <div ref="rightWrap" class="right-wrap">
        <div class="search-condition-wrap">
          <div class="search-group">
            <search-item width="120px" :span="8" label="ID/名称" class="custom-search">
              <el-autocomplete v-model.trim="params.keyWord" class="search-input" size="small" popper-class="suggest-input" :fetch-suggestions="querySearch" value-key="name" placeholder="任务名称/ID" :trigger-on-focus="false" clearable @keyup.enter.native="search">
                <template slot-scope="{ item }">
                  <el-tooltip effect="dark" :content="item.name" placement="left-end">
                    <div>{{ item.name }}</div>
                  </el-tooltip>
                </template>
              </el-autocomplete>
            </search-item>
            <search-item :span="7" width="80px" label="任务类型" class="custom-search">
              <el-select v-model="params.templateCode" class="search-input" size="small" placeholder="任务类型" clearable @change="search">
                <el-option-group v-for="(group, key) in templateCodeList" :key="key" :label="key">
                  <el-option v-for="item in group" :key="item.code" :label="item.value" :value="item.code"></el-option>
                </el-option-group>
              </el-select>
            </search-item>
            <search-item :span="8" width="60px" label="任务状态" class="custom-search">
              <el-select v-model="params.online" class="search-input" size="small" placeholder="任务状态" clearable @change="search">
                <el-option label="上线" :value="1"></el-option>
                <el-option label="下线" :value="0"></el-option>
              </el-select>
            </search-item>
            <search-item v-show="isShowAll" width="120px" :span="8" label="前置依赖数据集" class="custom-search">
              <el-input v-model.trim="params.inputGuids" class="search-input table" size="small" placeholder="请输入前置依赖数据集" clearable @keyup.enter.native="search"></el-input>
            </search-item>
            <search-item v-show="isShowAll" width="80px" :span="7" label="产出数据集" class="custom-search">
              <el-input v-model.trim="params.tableName" class="search-input table" size="small" placeholder="请输入产出数据集" clearable @keyup.enter.native="search"></el-input>
            </search-item>
            <search-item v-show="isShowAll" width="60px" :span="8" label="负责人" class="custom-search">
              <el-select
                v-model="params.createBy"
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
            </search-item>
          </div>
          <div class="btns">
            <el-button type="primary" size="small" icon="el-icon-search" @click="search"></el-button>
            <el-button type="primary" plain @click="create">新建</el-button>
            <el-button type="text" size="small" style="margin-left: 0; min-width: auto" @click="changeHeight">
              {{ text }}
              <i :class="isShowAll ? 'el-icon-arrow-down ' : 'el-icon-arrow-right'"></i>
            </el-button>
          </div>
        </div>
        <el-alert class="custom-alert" show-icon :closable="false">
          <div slot="title">
            结果共 {{ statisticNum.total }} 个，
            <!-- <span :class="['status-tag', 'online', params.statusCode === 'INITIALIZING,SCHEDULED' ? 'active' : '']" @click="changeStatusCode('INITIALIZING,SCHEDULED')">已上线</span> {{ statisticNum.online }} 个， -->
            实例最近执行状态为：
            <span :class="['status-tag', 'success', params.statusCode === 'SUCCESS' ? 'active' : '']" @click="changeStatusCode('SUCCESS')">已成功</span>
            <span v-if="!params.statusCode">{{ statisticNum.success }} 个，</span>
            <span :class="['status-tag', 'failed', params.statusCode === 'FAILED' ? 'active' : '']" @click="changeStatusCode('FAILED')">已失败</span>
            <span v-if="!params.statusCode">{{ statisticNum.failed }} 个，</span>
            <!-- <span :class="['status-tag', 'canceled', params.statusCode === 'CANCELED' ? 'active' : '']" @click="changeStatusCode('CANCELED')">已取消</span> {{ statisticNum.canceled }} 个， -->
            <span :class="['status-tag', 'running', params.statusCode === 'RUNNING' ? 'active' : '']" @click="changeStatusCode('RUNNING')">执行中</span>
            <span v-if="!params.statusCode">{{ statisticNum.running }} 个，</span>
            <span :class="['status-tag', 'unexecuted', params.statusCode === 'UNEXECUTED' ? 'active' : '']" @click="changeStatusCode('UNEXECUTED')">未执行</span>
            <span v-if="!params.statusCode">{{ statisticNum.unexecuted }} 个</span>

            <el-popover placement="bottom" width="200" trigger="click">
              <el-checkbox-group v-model="selectedCols">
                <div v-for="item in taskTableColList" :key="item.name">
                  <el-checkbox :label="item.name" @change="changeCols(item.name, $event)">{{ item.label }}</el-checkbox>
                </div>
              </el-checkbox-group>
              <el-button slot="reference" size="mini" style="min-width: 40px; padding: 5px; position: absolute; top: 1px; right: 0">自定义列<i class="el-icon-arrow-down el-icon--right"></i></el-button>
            </el-popover>
          </div>
        </el-alert>
        <div :class="`${fullscreen ? 'table-fullscreen' : ''}`">
          <!-- height="calc(100vh - 270px)" -->
          <el-table ref="tableList" v-loading="loading" :data="tableData" :border="true" stripe class="custom-table" :header-cell-style="{ height: '40px', padding: '0' }" :cell-style="{ height: '36px', padding: '0' }" :height="tableHeight" @header-dragend="dragHeader">
            <!-- <template v-for="item in showTaskCols"> -->
            <el-table-column v-if="showtableCol('id')" prop="id" label="任务ID" min-width="65"></el-table-column>
            <el-table-column v-if="showtableCol('name')" prop="name" label="任务名称" min-width="270" sortable :sort-orders="[null]">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.name" placement="top" :disabled="isTipDisabled">
                  <a class="ellipsis block" @mouseenter="isShowTooltip" @click="gotoDetail(scope.row)" @contextmenu.prevent="onContextmenuName($event, scope.row)">{{ scope.row.name }}</a>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('displayTemplateCode')" prop="displayTemplateCode" label="任务类型" min-width="220"></el-table-column>
            <el-table-column v-if="showtableCol('createBy')" prop="createBy" label="创建人" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column v-if="showtableCol('userGroups')" prop="userGroups" label="用户组" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column v-if="showtableCol('statusCode')" prop="statusCode" label="最近运行状态" min-width="190" align="right" header-align="left" class-name="statusCol">
              <template #header>
                最近运行状态
                <!-- <status-tips></status-tips> -->
                <i class="el-icon-info" @click="infoType = true"></i>
              </template>
              <template slot-scope="scope">
                <!-- 实时任务状态 -->
                <el-popover v-if="scope.row.isStreamingTemplateCode" trigger="hover" placement="bottom">
                  <p>执行时间：{{ scope.row.releaseTime ? $utils.parseTime(scope.row.releaseTime) : '-' }}</p>
                  <p>执行状态：{{ realtimeStateCode[scope.row.statusCode] || '-' }}</p>
                  <span slot="reference" :class="['circle', 'task-state', formatColor(scope.row.statusCode)]"></span>
                </el-popover>
                <!-- 离线任务状态 -->
                <template v-else>
                  <el-popover v-for="(item, index) in scope.row.taskInstances" :key="index" trigger="hover" placement="bottom">
                    <p>执行时间：{{ item.execution_date ? $utils.parseTime(item.execution_date) : '-' }}</p>
                    <p>执行状态：{{ offlineStateCode[item.state] || '-' }}</p>
                    <p>开始时间：{{ item.start_date ? $utils.parseTime(item.start_date) : '-' }}</p>
                    <p>结束时间：{{ item.end_date ? $utils.parseTime(item.end_date) : '-' }}</p>
                    <p>耗时：{{ item.duration || '-' }}</p>
                    <span slot="reference" :class="['circle', 'task-state', item.state]"></span>
                  </el-popover>
                </template>
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('outputGuids')" prop="outputGuids" label="产出数据集" min-width="150" :formatter="formatter">
              <template slot-scope="scope">
                <el-tooltip :disabled="isTipDisabled">
                  <div slot="content" v-html="formatGuids(scope.row.outputGuids)"></div>
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ formatDataView(scope.row.outputGuids) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('inputGuids')" prop="inputGuids" label="前置依赖数据集" min-width="150" :formatter="formatter">
              <template slot-scope="scope">
                <el-tooltip :disabled="isTipDisabled">
                  <div slot="content" v-html="formatGuids(scope.row.inputGuids)"></div>
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ formatDataView(scope.row.inputGuids) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('updateTime')" prop="updateTime" label="更新时间" sortable :sort-orders="[null]" min-width="160">
              <template slot-scope="scope">
                {{ $utils.parseTime(scope.row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('online')" prop="online" fixed="right" label="状态" align="center" header-align="left" sortable :sort-method="statusSort" min-width="80">
              <template #header>
                状态
                <el-popover trigger="hover" placement="bottom" class="header-tip" popper-class="tag-popper">
                  上下线状态
                  <i slot="reference" class="el-icon-info"></i>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <el-switch v-if="!scope.row.isStreamingTemplateCode" :value="scope.row.online === 1" :disabled="!scope.row.canEdit || scope.row.isStreamingTemplateCode" class="online-switch" active-color="#13ce66" inactive-color="#ff4949" @change="goLine(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column v-if="showtableCol('description')" prop="description" label="任务描述" min-width="150" :formatter="formatter">
              <template slot-scope="scope">
                <el-tooltip :disabled="isTipDisabled">
                  <div slot="content" v-html="formatGuids(scope.row.description)"></div>
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.description || '-' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <!-- </template> -->
            <el-table-column fixed="right" label="操作" min-width="170">
              <template #header> 操作 <i class="btn-full-screen el-icon-full-screen" :title="fullscreen ? '还原' : '放大'" @click="switchFullscreen"></i> </template>
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.hiddenType === 1" content="跳转到工作流详情" :open-delay="200" popper-class="tag-popper">
                  <i :class="['el-icon-edit', 'table-icon']" @click="gotoFlow(scope.row)"></i>
                </el-tooltip>
                <template v-else>
                  <el-tooltip v-if="scope.row.online === 1 && scope.row.isIrregularSheduler === 2" content="手动执行" :open-delay="200" popper-class="tag-popper">
                    <i class="el-icon-video-play table-icon" @click="customRunTask(scope.row)"></i>
                  </el-tooltip>
                  <el-tooltip :content="scope.row.canEdit ? '编辑' : '查看'" :open-delay="200" popper-class="tag-popper">
                    <i :class="[scope.row.canEdit ? 'el-icon-edit' : 'el-icon-view', 'table-icon']" @click="edit(scope.row)"></i>
                  </el-tooltip>
                  <el-tooltip content="复制任务" :open-delay="200" popper-class="tag-popper">
                    <i class="el-icon-document-copy table-icon" @click="copyTask(scope.row)"></i>
                  </el-tooltip>
                  <template v-if="scope.row.canEdit">
                    <el-tooltip v-if="!scope.row.isStreamingTemplateCode && scope.row.online === 1" content="补数" :open-delay="200" popper-class="tag-popper">
                      <i class="el-icon-document-add table-icon" @click="addNum(scope.row)"></i>
                    </el-tooltip>
                    <el-tooltip v-if="!scope.row.isStreamingTemplateCode" content="版本信息" :open-delay="200" popper-class="tag-popper">
                      <i class="el-icon-finished table-icon" @click="getVersion(scope.row)"></i>
                    </el-tooltip>
                  </template>
                  <el-tooltip v-if="scope.row.canDelete" content="删除" :open-delay="200" popper-class="tag-popper">
                    <i class="el-icon-delete table-icon table-icon-red global-color-cb" @click="deleteData(scope.row)"></i>
                    <i class="el-icon-delete table-icon table-icon-red global-color-cb" @click="deleteData(scope.row)"></i>
                  </el-tooltip>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination style="padding-top: 10px" background :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
    </div>
    <win-add-num ref="dialog" @save="getTaskListByPage"></win-add-num>
    <win-add-tag ref="dialogTag" :user-id="userInfo.userId" @save="reloadApi"></win-add-tag>
    <!-- <win-copy-task ref="dialogCopy"></win-copy-task> -->
    <el-dialog :title="ifnotifyFrom === 'offline' ? '下线' : '删除'" :visible.sync="dialogVisible" :close-on-click-modal="false" @close="resetForm">
      <div style="font-weight: 500">下游任务列表</div>
      <el-table :data="dialogTable" :border="true" stripe class="custom-table" style="margin-bottom: 35px; margin-top: 10px" :header-cell-style="{ height: '40px', padding: '0' }" :cell-style="{ height: '36px', padding: '0' }">
        <el-table-column prop="id" label="任务ID" align="center"></el-table-column>
        <el-table-column prop="name" label="任务名称" align="center"></el-table-column>
        <el-table-column prop="createBy" label="创建人" align="center"></el-table-column>
        <el-table-column prop="userGroup" label="用户组" align="center"></el-table-column>
        <el-table-column prop="id" label="状态" align="center">
          <template slot-scope="scope">
            {{ scope.row.online === 1 ? '上线' : '下线' }}
          </template>
        </el-table-column>
      </el-table>
      <el-form ref="ruleForm" :model="ruleForm" label-width="140px">
        <el-form-item label="是否通知直接下游" prop="ifnotify" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <el-radio-group v-model="ruleForm.ifnotify">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="btnDisabled" @click="save(ifnotifyFrom)">确 定</el-button>
      </span>
    </el-dialog>
    <win-version-list ref="versionList"></win-version-list>
    <el-info v-model="infoType" title="任务执行状态流">
      <img src="@/assets/status2.png" alt="状态图" style="height: 400px; min-width: 400px" />
    </el-info>
  </el-card>
</template>

<script>
import SearchItem from '@/components/SearchItem';
import WinAddNum from './components/winAddNum';
// import StatusTips from './components/StatusTips';
import WinAddTag from './components/WinAddTag';
import WinVersionList from './components/WinVersionList';
// import CustomTree from '@/components/customTree';
import { getDownstreamTask, getTaskInfo, getTaskListByPage, getTemplateList, deleteTask, changeStatus, getLabelList, deleteLabel, collectLabel, cancelLabel, myLabel, searchName, getTaskInstance, getUserList, customRunTask } from '@/api/task';
import { startTask } from '@/api/taskDetail';
import * as tools from '@/utils/tools';
import { mapGetters } from 'vuex';
import UseLazyTree from '@/components/useLazyTree';
export default {
  name: 'TaskList',
  components: {
    // FilterTree,
    // SearchGroup,
    SearchItem,
    // SearchCondition,
    WinAddNum,
    // StatusTips,
    // WinRelationChart,
    WinAddTag,
    WinVersionList,
    // CustomTree,
    UseLazyTree
    // WinCopyTask
  },
  data() {
    // let initIsShowAll = true;
    let initIsOpen = true;
    let taskParams;
    // if (sessionStorage.getItem('isShowAll')) {
    //   initIsShowAll = sessionStorage.getItem('isShowAll') === 'true';
    // }
    if (sessionStorage.getItem('isOpen')) {
      initIsOpen = sessionStorage.getItem('isOpen') === 'true';
    }
    if (sessionStorage.getItem('taskParams')) {
      taskParams = JSON.parse(sessionStorage.getItem('taskParams'));
    }
    const taskTableColList = [
      { name: 'id', label: '任务ID', width: 0 },
      { name: 'name', label: '任务名称', width: 0 },
      { name: 'displayTemplateCode', label: '任务类型', width: 0 },
      { name: 'createBy', label: '创建人', width: 0 },
      { name: 'userGroups', label: '用户组', width: 0 },
      { name: 'statusCode', label: '最近运行状态', width: 0 },
      { name: 'outputGuids', label: '产出数据集', width: 0 },
      { name: 'inputGuids', label: '前置依赖数据集', width: 0 },
      { name: 'updateTime', label: '更新时间', width: 0 },
      { name: 'online', label: '状态', width: 0 },
      { name: 'description', label: '任务描述', width: 0 }
    ];
    let taskTableCols;
    if (localStorage.getItem('taskTableCols')) {
      taskTableCols = JSON.parse(localStorage.getItem('taskTableCols'));
    }
    return {
      rateV: 1,
      infoType: false,
      treeNode: [],
      timeRange: [],
      linkTaskForm: {},
      dialogTable: [],
      isFold: true,
      statisticNum: {
        failed: 0,
        online: 0,
        success: 0,
        canceled: 0,
        unexecuted: 0,
        running: 0,
        total: 0
      },
      tabActiveName: '文件夹',
      checked: true,
      isShowSelf: false,
      labelId: taskParams && taskParams.labelId ? taskParams.labelId : '',
      params: {
        keyWord: taskParams && taskParams.keyWord ? taskParams.keyWord : '',
        createBy: taskParams && taskParams.createBy ? taskParams.createBy : '',
        templateCode: taskParams && taskParams.templateCode ? taskParams.templateCode : '',
        online: taskParams && taskParams.online ? taskParams.online : '',
        statusCode: taskParams && taskParams.statusCode ? taskParams.statusCode : '',
        tenancyCode: taskParams && taskParams.tenancyCode ? taskParams.tenancyCode : '',
        labelId: taskParams && taskParams.labelId ? taskParams.labelId : '',
        tableName: taskParams && taskParams.tableName ? taskParams.tableName : '',
        inputGuids: taskParams && taskParams.inputGuids ? taskParams.inputGuids : '',
        down: taskParams && taskParams.down ? taskParams.down : '',
        pageNum: taskParams && taskParams.pageNum ? taskParams.pageNum : 1,
        pageSize: Number(sessionStorage.getItem('pageSize')) || 30
      },
      templateCodeList: {},
      total: 0,
      tableData: [],
      selectFolderId: '',
      ownerLoading: false,
      ownerList: [],
      loading: false,
      // tableHeight: window.innerHeight - 423,
      isOpen: true,
      isShowAll: true,
      fullscreen: false,
      statusConfig: tools.taskStatusConfig,
      codeToText: tools.codeToText,
      offlineStateCode: tools.offlineStateCode,
      realtimeStateCode: tools.realtimeStateCode,
      tagList: {},
      allTagList: [],
      publishTagList: [],
      collectList: {},
      isTipDisabled: false,
      keyWordResults: [],
      dragSizeObj: {},
      // 下线弹窗字段
      dialogVisible: false,
      btnDisabled: false,
      ruleForm: {
        id: '',
        status: 0,
        ifnotify: false
      },
      showDrag: false,
      ifnotifyFrom: '',
      taskTableColList: taskTableColList,
      showTaskCols: taskTableCols || taskTableColList, // [{name: 'id', width: 100}]
      selectedCols: (taskTableCols || taskTableColList).map(item => item.name)
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
    },
    text() {
      if (this.isShowAll) {
        return '收起';
      } else {
        return '展开';
      }
    },
    tableHeight() {
      if (this.isShowAll) {
        return 'calc(100vh - 218px)';
      } else {
        return 'calc(100vh - 181px)';
      }
    }
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        getDownstreamTask({ id: this.ruleForm.id }).then(res => {
          this.dialogTable = res.data;
        });
      }
    }
  },
  activated() {
    // this.getTaskListByPage();
    this.reloadApi();
  },
  created() {
    document.onkeyup = e => {
      if (e.code === 'Escape' || e.keycode === 27) {
        this.fullscreen = false;
      }
    };
    this.init();
    this.reloadApi();
  },
  mounted() {
    const result = {};
    result.sizeDom = document.getElementById('leftWrap');
    result.sizeDomSeat = 'left';
    result.dropSeatType = 'left';
    // result.callbackStatus = this.dragCallBack;
    result.sizeType = {
      width: true
    };
    result.limit = {
      minWidth: '10px',
      maxWidth: '50%'
    };
    this.dragSizeObj = result;
    this.showDrag = true;
  },
  methods: {
    clickTreeItem(data, filterText) {
      // 获取点击的文件夹id
      if (!data.leaf) {
        this.selectFolderId = data.id;
        this.params.folderId = this.selectFolderId;
        this.params.fileName = filterText;
        this.params.id = '';
      } else {
        this.selectFolderId = '';
        this.params.folderId = this.selectFolderId;
        this.params.fileName = '';
        this.params.id = data.entityId;
      }
      this.search();
    },
    treeSearch() {
      this.search();
    },
    formatDataView(data) {
      return data ? data.toString().split('@')[0] : '-';
    },
    tabClick() {
      delete this.params.taskIds;
      delete this.params.labelId;
      this.search();
    },
    init() {
      // 获取任务类型数据
      getTemplateList().then(res => {
        const data = res.data;
        data.sort.map(item => {
          this.templateCodeList[item.code] = data[item.code];
        });
      });
      // this.getLabelList();
    },
    showtableCol(name) {
      const showIndex = this.showTaskCols.findIndex(item => {
        return item.name === name;
      });
      return showIndex !== -1;
    },
    reloadApi() {
      this.getLabelList();
      this.getTaskListByPage();
      // 获取任务类型数据
      getTemplateList().then(res => {
        const data = res.data;
        data.sort.map(item => {
          this.templateCodeList[item.code] = data[item.code];
        });
      });
    },
    filterTags: tools.debounce(({ vm, value }) => {
      vm.getLabelList(value);
    }, 400),
    getLabelList(name) {
      // 所有标签，我的标签，公开给我的标签的数据
      getLabelList(name).then(res => {
        const data = res.data;
        if (data) {
          this.tagList = data;
          this.allTagList = [...data.current, ...data.others];
          this.publishTagList = this.allTagList.filter((item, index) => {
            return item.publish === 1 && item.publishers.includes(this.userInfo.userId);
          });
        }
        this.getMyLabel();
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
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    addTag() {
      this.$refs.dialogTag.showWin();
    },
    clickTag(id) {
      if (this.params.labelId === id) {
        this.$set(this.params, 'labelId', '');
      } else {
        this.$set(this.params, 'labelId', id);
      }
      this.labelId = this.params.labelId;
      this.params.pageNum = 1;
      this.getTaskListByPage();
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
    onContextmenuName(event, row) {
      const items = [
        {
          label: '复制',
          onClick: () => {
            this.copyHandler(row.name);
          }
        },
        {
          label: '在新标签页打开链接',
          onClick: () => {
            if (row.isStreamingTemplateCode) {
              // 实时任务
              const { href } = this.$router.resolve({
                path: '/task/info',
                query: {
                  id: row.id
                }
              });
              window.open(href, '_blank');
            } else {
              // 离线任务
              const { href } = this.$router.resolve({
                path: '/task/detail',
                query: {
                  id: row.id,
                  name: row.name
                }
              });
              window.open(href, '_blank');
            }
          }
        }
      ];
      this.$contextmenu({
        items,
        event,
        zIndex: 2100,
        minWidth: 50
      });
      event.preventDefault();
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
    indexMethod(index) {
      return (this.params.pageNum - 1) * this.params.pageSize + index + 1;
    },
    getTaskListByPage() {
      this.loading = true;
      const params = { ...this.params };
      Object.keys(params).forEach(item => {
        if (params[item] === '' && item !== 'taskIds') delete params[item];
      });
      getTaskListByPage(params).then(res => {
        const data = res.data;
        this.loading = false;
        this.total = data.result.total;
        this.statisticNum.failed = data.FAILED;
        this.statisticNum.online = data.ONLINE;
        this.statisticNum.success = data.SUCCESS;
        this.statisticNum.canceled = data.CANCELED;
        this.statisticNum.running = data.RUNNING;
        this.statisticNum.unexecuted = data.UNEXECUTED;
        this.statisticNum.total = data.TOTAL;
        this.tableData = data.result.list;
        const idList = this.tableData ? this.tableData.map(item => item.id) : [];
        getTaskInstance({
          ids: idList.join(',')
        }).then(res => {
          const data = res.data;
          for (const i in data) {
            const currentObj = this.tableData.find(item => item.id === Number(i));
            if (currentObj) {
              this.$set(currentObj, 'taskInstances', data[i]);
            }
          }
        });
      });
      sessionStorage.setItem('taskParams', JSON.stringify(params));
    },
    formatter(row, column, cellValue, index) {
      if (cellValue === '' || cellValue === null) {
        return '-';
      } else {
        return cellValue;
      }
    },
    statusSort(a, b) {
      if (a.online > b.online) {
        return -1;
      }
    },
    formatGuids(value) {
      const reg = /[,，]/g;
      value = this.formatDataView(value);
      const text = value ? value.replace(reg, ',<br>') : '-';
      return text;
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
    querySearch(queryString, cb) {
      searchName(queryString).then(res => {
        const data = res.data;
        if (data) {
          this.keyWordResults = data;
        } else {
          this.keyWordResults = [];
        }
        cb(this.keyWordResults);
      });
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    search(type) {
      this.params.pageNum = 1;
      this.getTaskListByPage();
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.getTaskListByPage();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getTaskListByPage();
      sessionStorage.setItem('pageSize', this.params.pageSize);
    },
    input(value) {
      this.$forceUpdate();
    },
    create() {
      this.$router.push({ name: 'TaskStep1', query: { folderId: this.selectFolderId }});
    },
    changeStatusCode(code) {
      if (code === this.params.statusCode) {
        this.params.statusCode = '';
      } else {
        this.params.statusCode = code;
      }
      this.search();
    },
    changeHeight() {
      this.isShowAll = !this.isShowAll;
      // sessionStorage.setItem('isShowAll', this.isShowAll);
    },
    copyTask(data) {
      // this.$refs.dialogCopy.showWin(row);
      const path = tools.taskCodeToPath[data.templateCode];
      this.$router.push({
        path: `/task/${path}`,
        query: {
          copyId: data.id
        }
      });
    },
    gotoDetail(row) {
      if (row.isStreamingTemplateCode) {
        // 实时任务
        // const { href } = this.$router.resolve({
        //   path: '/task/info',
        //   query: {
        //     id: row.id
        //   }
        // });
        // window.open(href, '_blank');
        this.$router.push({
          path: '/task/info',
          query: {
            id: row.id
          }
        });
      } else {
        // 离线任务
        // const { href } = this.$router.resolve({
        //   path: '/task/detail',
        //   query: {
        //     id: row.id,
        //     name: row.name
        //     // isOnline: row.online
        //   }
        // });
        // window.open(href, '_blank');
        this.$router.push({
          path: '/task/detail',
          query: {
            id: row.id,
            name: row.name
          }
        });
      }
    },
    gotoFlow(row) {
      this.$router.push({
        path: '/workflow/add',
        query: { id: row.workflowId }
      });
    },
    edit(data) {
      const path = tools.taskCodeToPath[data.templateCode];
      // this.$router.push({
      //   path: `/task/${path}`,
      //   query: {
      //     id: data.id
      //   }
      // });
      location.href = `/#/task/${path}?id=${data.id}&taskName=${data.name}`;
    },
    addNum(row) {
      this.$refs.dialog.showWin(row);
    },
    // showRelation(row) {
    //   this.$refs.relation.showWin(row);
    // },
    getVersion(row) {
      this.$refs.versionList.showWin(row);
    },
    goOnLine(row) {
      this.$confirm(`确定发版?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          startTask({
            id: row.id
          }).then(data => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
            this.getTaskListByPage();
          });
        })
        .catch(() => {});
    },
    goLine(row) {
      // 下线时 是否通知直接下游
      if (row.online === 1) {
        this.dialogVisible = true;
        this.ruleForm.id = row.id;
        this.ifnotifyFrom = 'offline';
        this._row = row;
      } else {
        this.$confirm(`确定上线?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.loading = true;
            startTask({
              id: row.id
            })
              .then(data => {
                this.$message({
                  type: 'success',
                  message: '操作成功!'
                });
                // this.getTaskListByPage();
                getTaskInfo({ id: row.id }).then(res => {
                  row.online = res.data.online;
                  row.updateTime = res.data.updateTime;
                });
              })
              .finally(() => {
                this.loading = false;
              });
          })
          .catch(() => {});
      }
    },
    save(from) {
      this.btnDisabled = true;
      let action;
      if (from === 'offline') {
        action = changeStatus(this.ruleForm);
      } else if (from === 'delete') {
        action = deleteTask({
          id: this.ruleForm.id,
          ifNotify: this.ruleForm.ifnotify
        });
      }
      action
        .then(data => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
          this.dialogVisible = false;
          if (from === 'offline') {
            getTaskInfo({ id: this._row.id }).then(res => {
              this._row.online = res.data.online;
              this._row.updateTime = res.data.updateTime;
            });
          } else if (from === 'delete') {
            this.$refs.UseLazyTree.$refs.treeDom.refresh();
            delete this.params.taskIds;
            this.getTaskListByPage();
          }
        })
        .finally(() => {
          this.btnDisabled = false;
        });
    },
    resetForm() {
      this.ruleForm.id = '';
      this.ruleForm.ifnotify = false;
    },
    deleteData(data) {
      this.dialogVisible = true;
      // 当通过文件夹删除时，取entityId
      this.ruleForm.id = data.entityId || data.id;
      this.ifnotifyFrom = 'delete';
      // this.$confirm('确定删除?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     deleteTask(id).then(data => {
      //       this.$message({
      //         type: 'success',
      //         message: '删除成功!'
      //       });
      //       this.getTaskListByPage();
      //     });
      //   })
      //   .catch(() => {});
    },
    handleOpen() {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) {
        this.showDrag = this.isOpen;
      } else {
        setTimeout(() => {
          this.showDrag = this.isOpen;
        }, 300);
      }
      // sessionStorage.setItem('isOpen', this.isOpen);
    },
    formatColor(code) {
      let className = '';
      if (code === 'FAILED') {
        className = 'failed';
      } else if (['CANCELED', 'FINISHED', 'SUSPENDED'].includes(code)) {
        className = 'success';
      } else if (['INITIALIZING', 'RUNNING'].includes(code)) {
        className = 'running';
      } else if (['FAILING', 'CANCELLING', 'RESTARTING', 'RECONCILING'].includes(code)) {
        className = 'up_for_retry';
      }
      return className;
    },
    filterCreateBy() {
      this.$nextTick(() => {
        // 将原过滤数据去重，再重新赋值
        const newArr = this.$refs.cascader.suggestions.reduce((all, next) => (all.some(item => item.text === next.text) ? all : [...all, next]), []);
        this.$refs.cascader.suggestions = newArr;
      });
    },
    changeCols(name, value) {
      if (value) {
        this.showTaskCols.push({
          name,
          width: 0
        });
      } else {
        this.showTaskCols = this.showTaskCols.filter(item => {
          return item.name !== name;
        });
      }
      this.$nextTick(() => {
        this.$refs.tableList.doLayout();
      });
      localStorage.setItem('taskTableCols', JSON.stringify(this.showTaskCols));
    },
    dragHeader(newWidth, oldWidth, column) {
      const col = this.showTaskCols.find(item => {
        return item.name === column.property;
      });
      col.width = newWidth;
      localStorage.setItem('taskTableCols', JSON.stringify(this.showTaskCols));
    },
    customRunTask(row) {
      this.$confirm(`确定执行任务?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        customRunTask({ taskId: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
          getTaskInfo({ id: row.id }).then(res => {
            row.releaseTime = res.data.releaseTime;
            row.statusCode = res.data.statusCode;
          });
          getTaskInstance({
            ids: row.id
          }).then(res => {
            const data = res.data;
            for (const i in data) {
              this.$set(row, 'taskInstances', data[i]);
            }
          });
        });
      });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  ::v-deep .el-card__body {
    padding: 0;
  }
}
.icon-star {
  float: right;
  margin-left: 10px;
  margin-top: 5px;
}
::v-deep .el-rate__item {
  cursor: pointer !important;
}
.task-list {
  display: flex;
  .left-wrap {
    position: relative;
    width: 250px;
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
        &:last-children {
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
    right: -30px;
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
    .custom-checkbox {
      position: absolute;
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
        &.unexecuted {
          color: #999;
          border: 1px solid #999;
          &.active {
            color: #fff;
            background: #999;
          }
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
.border-card {
  overflow: auto;
  height: 100%;
}
</style>
<style lang="scss">
.left-wrap .wrapper-input .el-input__inner {
  border: none;
  background-color: #f8f8fa;
  color: rgb(68, 87, 130);
}
.drop {
  z-index: 1000;
  height: 100%;
  border-right: 5px solid #f2f2f2;
  position: absolute;
  top: 0;
  .icon {
    position: absolute;
    top: 50%;
    transform: rotate(90deg) translateY(12px);
    color: #c0c0c0;
  }
}
</style>
