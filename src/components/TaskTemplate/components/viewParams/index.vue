<template>
  <div class="content">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item name="1">
        <template #title>
          <span class="title_label" @click.stop="() => {}">
            <span>step2</span>
            <!-- <span class="edit" @click.stop="handelStep(1)">编辑</span> -->
          </span>
        </template>
        <el-descriptions class="box" :column="2" content-class-name="des-content">
          <el-descriptions-item v-for="(item, index) in menu['task_info']" :key="index" :label="item.label">
            <el-tooltip popper-class="des-tooltip" effect="dark" :content="formatData(item)">
              <span>{{ formatData(item) }}</span>
            </el-tooltip>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 字段映射 -->
        <el-row v-if="!!menu['field_map']" class="depend-wrap">
          <h4 class="title">字段映射</h4>
          <el-col :span="13">
            <el-table :data="info.source_columns" class="table_left trans_table" stripe :row-style="{ height: '42px' }" :cell-style="{ height: '42px', padding: '0px' }" row-key="name" style="font-size: 13px">
              <el-table-column type="index" label="序号" width="80" align="center">
                <template #header> 序号 </template>
                <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column :prop="menu['field_map']['source_columns']['name']" label="源表字段" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['source_columns']['name']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :prop="menu['field_map']['source_columns']['data_type']" label="字段类型" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['source_columns']['data_type']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['source_columns']['comment']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column min-width="100" align="center" class-name="table-func" fixed="right">
                <template slot-scope="scope">
                  <el-popover
                    v-if="scope.$index < info.source_columns.length && scope.$index < info.target_columns.length"
                    trigger="hover"
                    :disabled="!['Mysql2Hive', 'File2Lakehouse'].includes(info.templateCode) || !scope.row.funcs || scope.row.funcs.length <= 0"
                    placement="bottom"
                    popper-class="tag-popper"
                  >
                    <div v-if="scope.row.funcs && scope.row.funcs.length > 0">
                      <span class="func-span">函数名</span>
                      <span class="func-span">参数</span>
                      <div v-for="(item, index) in scope.row.funcs" :key="index">
                        <span class="func-span">{{ item.funcName }}</span>
                        <span class="func-span">{{ item.funcParams.join(',') }}</span>
                      </div>
                    </div>
                    <template slot="reference">
                      <func-icon :showicon="['Mysql2Hive', 'File2Lakehouse'].includes(info.templateCode)"></func-icon>
                      <template v-if="['Mysql2Hive', 'File2Lakehouse'].includes(info.templateCode)">
                        <div v-if="scope.row.funcs && scope.row.funcs.length > 0" class="func-num">{{ scope.row.funcs.length }}</div>
                        <span v-if="scope.row.state === 'success'" class="state state-success">成功</span>
                        <span v-else-if="scope.row.state === 'fail'" class="state state-fail">失败</span>
                      </template>
                    </template>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="11">
            <el-table :data="info.target_columns" row-key="name" stripe class="table_right trans_table" :row-style="{ height: '42px' }" style="font-size: 13px">
              <el-table-column type="index" label="序号" width="80" align="center">
                <template #header> 序号 </template>
                <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
              </el-table-column>
              <el-table-column :prop="menu['field_map']['target_columns']['name']" label="目标表字段" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['target_columns']['name']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :prop="menu['field_map']['target_columns']['data_type']" label="字段类型" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['target_columns']['data_type']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="menu['field_map']['target_columns']['security_level']" :prop="menu['field_map']['target_columns']['security_level']" label="安全级别" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['target_columns']['security_level']] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{ scope.row[menu['field_map']['target_columns']['comment']] || '-' }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <!-- mysqkl字段映射 -->
        <el-row v-if="!!menu['mysql2hive_field_map']" class="depend-wrap">
          <h4 class="title">字段映射</h4>
          <div v-if="info.table_type === 'single'">
            <ipt-c-table :input-columns="info['source_columns']" :columns="info['target_columns']" :disabled="true"></ipt-c-table>
          </div>
          <div v-else>
            <el-row>
              <el-table ref="moreInputColumns" height="300px" :data="info['moreTableList']" stripe :cell-style="{ height: '42px', padding: '0px' }">
                <el-table-column type="expand" width="30">
                  <template slot-scope="scope">
                    <div class="more-table">
                      <ipt-c-table :key="scope.$index" :input-columns="scope.row.inputColumns" :columns="scope.row.columns" :disabled="true"></ipt-c-table>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="库名" align="center">
                  <template>
                    <el-tooltip :content="info.sourceDb" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ info.sourceDb || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="表名" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.name || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <!-- <el-table-column label="预览" align="center" width="80px">
                  <template slot-scope="scope"> <el-button type="text"
                      @click="getPreviewData(scope.row.name, scope.$index)">数据预览</el-button> </template>``
                </el-table-column> -->
                <el-table-column label="映射&转换" align="center" min-width="100"> </el-table-column>
                <el-table-column label="库名" min-width="100" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.lakeHouseDbName" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.lakeHouseDbName || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="表名" min-width="100" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.name" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.preMoreTableName || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
          </div>
        </el-row>
        <!-- 字段信息 -->
        <div v-if="menu['cloumns']" class="depend-wrap">
          <div class="table-title">
            <h4 class="title">字段信息</h4>
          </div>
          <el-table :data="info.columns" row-key="name" stripe class="table_right" :row-style="{ height: '42px' }" style="font-size: 13px">
            <el-table-column type="index" label="序号" width="80" align="center">
              <template #header> 序号 </template>
              <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
            </el-table-column>
            <el-table-column prop="name" label="字段名称" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="字段类型" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.type }}</span>
              </template>
            </el-table-column>
            <el-table-column label="字段描述" min-width="100" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row.comment }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 加工逻辑 -->
        <div v-if="content" class="depend-wrap sql_edit">
          <div class="table-title">
            <h4 class="title">加工逻辑</h4>
          </div>
          <monaco-editor key="work_code" ref="monaco" :read-only="true" language="text" :custom-theme="customTheme" line-numbers="off" render-line-highlight="none"></monaco-editor>
        </div>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span class="title_label" @click.stop="() => {}">
            <span>step3</span>
            <!-- <span class="edit" @click.stop="handelStep(2)">编辑</span> -->
          </span>
        </template>
        <el-descriptions class="box" :column="2">
          <el-descriptions-item v-for="(item, index) in menu['config_info']" :key="index" :label="item.label">{{ formatData(item) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 内部依赖 -->
        <div v-if="info.dependTypes.includes('event')" class="depend-wrap">
          <div class="table-title">
            <span class="title">内部依赖设置</span>
          </div>
          <el-table class="table" :data="info.eventDepends" stripe style="font-size: 13px">
            <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
            <el-table-column label="任务ID" prop="taskId" width="100" align="center"></el-table-column>
            <el-table-column label="任务名称" prop="dependId" min-width="170" align="center">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.dependId" :disabled="isTipDisabled">
                  <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.dependId || '-' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="任务周期" prop="granularity" min-width="80" align="center">
              <template slot-scope="scope">{{ formatGranularty(scope.row.granularity) }}</template>
            </el-table-column>
            <el-table-column label="产出数据集" prop="metadataId" min-width="200" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="偏移量" prop="unitOffset" min-width="130" align="center" header-align="center"> </el-table-column>
          </el-table>
        </div>

        <!-- 外部依赖 -->
        <div v-if="info.dependTypes.includes('dataset')" class="depend-wrap">
          <div class="table-title">
            <span class="title">外部依赖设置</span>
          </div>
          <el-table class="table" :data="info.inputDataset" stripe style="font-size: 13px">
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <template v-if="isJar">
              <el-table-column label="数据集" min-width="180" align="center" prop="metadata.table"> </el-table-column>
            </template>
            <template v-else>
              <el-table-column v-if="isShowDb" label="数据库" min-width="150" align="center" prop="metadata.db"> </el-table-column>
              <el-table-column label="表名称" min-width="180" align="center" prop="metadata.table"> </el-table-column>
            </template>
            <template v-if="!isShowDispatch">
              <el-table-column label="数据类型" min-width="100" align="center">
                <template slot-scope="scope">
                  {{ scope.row.isExternal === 1 ? '外部数据' : '内部数据' }}
                </template>
              </el-table-column>
              <el-table-column label="数据周期" min-width="120" align="center" prop="granularity"> </el-table-column>
              <el-table-column label="偏移量" min-width="165" align="center">
                <template slot-scope="scope">
                  <div v-if="scope.row.useDateCalcuParam">
                    <span v-for="(value, key) in scope.row.dateCalculationParam" :key="key"> {{ dataMap[key] }}: {{ value.type === 'offset' ? `偏移${value.unitOffset}` : `指定${value.range.join(',')}` }}; </span>
                  </div>
                  <span v-else class="i-block">{{ scope.row.unitOffset }}</span>
                </template>
              </el-table-column>
            </template>
            <!-- <el-table-column v-if="!isShowInputCheck" prop="ready_time" label="完成时间" min-width="120" align="center"> </el-table-column> -->
            <el-table-column v-if="isShowInputCheck" label="数据依赖" min-width="180" align="center">
              <template slot-scope="scope">
                <!-- <div class="td-border ellipsis">{{ scope.row.check_path || scope.row.ready_time }}</div> -->
                <div class="td-border ellipsis">{{ scope.row.check_path }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 生成标志 -->
        <div v-if="menu['flag'] && info.outputDataset['0'].check" class="depend-wrap">
          <div class="table-title">
            <h4 class="title">生成标志</h4>
          </div>
          <el-descriptions :column="2">
            <el-descriptions-item v-for="(item, index) in menu['flag'].slice(1)" :key="index" :label="item.label">{{ formatData(item) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 生成数据集 -->
        <div v-if="info.isDataSet2" class="depend-wrap">
          <div class="table-title">
            <h4 class="title">生成数据集信息</h4>
          </div>
          <el-table class="table" :data="info.outputDataset" stripe style="font-size: 13px">
            <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
            <template v-if="isJar">
              <el-table-column label="生成数据集" min-width="200" align="center" prop="id"> </el-table-column>
            </template>
            <template v-else>
              <el-table-column v-if="isShowSource" label="数据源" min-width="120" align="center" prop="metadata.source"> </el-table-column>
              <el-table-column label="库名称" min-width="120" align="center" prop="metadata.db"> </el-table-column>
              <el-table-column label="表名称" min-width="200" align="center" prop="metadata.table"> </el-table-column>
            </template>
          </el-table>
        </div>

        <!-- 任务归属成本录入 -->
        <!-- <div class="depend-wrap">
          <div class="table-title">
            <h4 class="title">任务归属成本录入</h4>
          </div>
          <el-table class="table" :data="info.cost" stripe style="font-size: 13px">
            <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
            <el-table-column label="成本归属部门" min-width="120" align="center" prop="key">
              <template slot-scope="scope">
                {{ formatLabel(scope.row.key, 'id', 'organizationName', 'costList') }}
              </template>
            </el-table-column>
            <el-table-column label="成本归属占比" min-width="120" align="center" prop="value">
              <template slot-scope="scope">
                {{ scope.row.value + '%' }}
              </template>
            </el-table-column>
          </el-table>
        </div> -->
        <div v-if="isAlertTemplate" class="depend-wrap">
          <div class="table-title">
            <h4 class="title">告警策略</h4>
          </div>
          <el-descriptions :column="2">
            <el-descriptions-item label="告警类型">{{ formatData({ key: 'alert' }) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <!-- <div v-if="isExecuteMode" class="depend-wrap">
          <div class="table-title">
            <h4 class="title">运行模式设置</h4>
          </div>
          <el-descriptions :column="2">
            <el-descriptions-item label="运行模式">{{ formatData({ key: 'executeMode' }) }}</el-descriptions-item>
          </el-descriptions>
        </div> -->
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import menuParms from './menuParms';
import { mapGetters } from 'vuex';
import { getCostList } from '@/api/task';
import MonacoEditor from '@/components/MonacoEditor/index';
import FuncIcon from '@/components/FuncIcon';
import * as tools from '@/utils/tools';
import IptCTable from '../lackHouseIptCTable.vue';

export default {
  components: {
    MonacoEditor,
    FuncIcon,
    IptCTable
  },
  props: {
    info: {
      type: Object,
      default: () => {
        return {};
      }
    },
    regionList: {
      type: Array,
      default: () => []
    },
    targetSourceList: {
      type: Array,
      default: () => []
    },
    connectionNameList: {
      type: Array,
      default: () => []
    },
    versionList: {
      type: Array,
      default: () => []
    },
    artifactList: {
      type: Array,
      default: () => []
    },
    clusterList: {
      type: Array,
      default: () => []
    },
    isChangeTable: { type: Boolean, default: false },
    nameDisabled: { type: Boolean, default: false },
    // isEdit: { type: Boolean, default: false },
    isShowDispatch: { type: Boolean, default: true },
    isJar: { type: Boolean, default: false },
    isShowInputBtn: { type: Boolean, default: false },
    isShowOutputBtn: { type: Boolean, default: false },
    isInputEdit: { type: Boolean, default: false },
    isOutputEdit: { type: Boolean, default: false },
    isShowDb: { type: Boolean, default: true },
    isShowSource: { type: Boolean, default: false },
    isShowOffset: { type: Boolean, default: true },
    isShowInputCheck: { type: Boolean, default: false },
    isShowOutputCheck: { type: Boolean, default: false },
    region: { type: String, default: '' },
    content: { type: String, default: '' },
    isWorkflow: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    isShowDependRefresh: { type: Boolean, default: false }
  },
  data() {
    return {
      isAlertTemplate: false,
      isExecuteMode: false,
      activeNames: ['1', '2'],
      cycleList: [
        { label: '分钟', value: 'minutely' },
        { label: '小时', value: 'hourly' },
        { label: '天', value: 'daily' },
        { label: '周', value: 'weekly' },
        { label: '月', value: 'monthly' }
      ],
      costList: [],
      isTipDisabled: false,
      customTheme: {
        rules: [],
        colors: {
          'editor.background': '#f7f9ff' // 设置背景颜色
        }
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    noDispatch() {
      // 无调度的条件
      let res = false;
      if (this.info.templateCode === 'Metis2Hive') res = true;
      if (this.info.templateCode === 'StreamingSQL' && this.info.runtimeConfig?.isBatchTask === false) res = true;
      if (this.info.templateCode === 'StreamingJAR' && !this.info.isBatchTask) res = true;
      if (this.info.templateCode === 'Mysql2Hive' && this.info.syncType === 2) res = true;
      return res;
    },
    menu() {
      const result = Object.assign({}, menuParms[this.info.templateCode]);
      if (this.info.templateCode === 'DataMigration') {
        if (this.info.isTable) {
          result['task_info'] = result['task_info'].table;
        } else {
          result['task_info'] = result['task_info'].file;
        }
      }
      if (this.info.templateCode === 'Mysql2Hive') {
        if (this.info.table_type === 'single') {
          result['task_info'] = result['task_info'].single;
        } else {
          result['task_info'] = result['task_info'].more;
        }
      }

      if (this.info.templateCode === 'Hive2Sharestore') {
        const sourceType = this.info.isHive;
        const hiveType = ['sourceTable', 'sourceDb'];
        const s3Type = ['s3ObsPath'];
        if (this.info.isSharestore) {
          result['task_info'] = result['task_info'].ShareStore.filter(item => {
            if (sourceType) {
              return !s3Type.includes(item.key);
            } else {
              return !hiveType.includes(item.key);
            }
          });
        } else {
          result['task_info'] = result['task_info'].TiKV.filter(item => {
            if (sourceType) {
              return !s3Type.includes(item.key);
            } else {
              return !hiveType.includes(item.key);
            }
          });
        }
      }

      if (this.info.templateCode === 'Metis2Hive') {
        if (this.info.createType === '1') {
          delete result.cloumns;
        }

        const metisType = ['inputDataset.0.metadata.table'];
        const kafka = ['runtimeConfig.topic', 'runtimeConfig.bootstrapServerUri'];

        result['task_info'] = result['task_info'].filter(item => {
          if (this.info.runtimeConfig.sourceType === 'metis') {
            return !kafka.includes(item.key);
          } else {
            return !metisType.includes(item.key);
          }
        });
      }
      if (this.info.templateCode === 'SPARKJAR' || this.info.templateCode === 'StreamingJAR') {
        if (this.info.typeCode === 'ARTIFACT') {
          result['task_info'] = result['task_info'].filter(item => item.key !== 'jarUrl');
        } else if (this.info.typeCode === 'ONLINE') {
          result['task_info'] = result['task_info'].filter(item => !['displayDependJars.0.id', 'displayDependJars.0.artifactId'].includes(item.key));
        }
        if (this.info.templateCode === 'SPARKJAR') {
          if (this.info.type === 'python') result['task_info'] = result['task_info'].filter(item => item.key !== 'mainClass');
        }
      }
      // 调度参数处理
      let key;
      if (this.info.triggerParam.isIrregularSheduler === 2 || this.noDispatch) {
        key = ['name', 'description', 'triggerParam.isIrregularSheduler'];
      } else {
        if (this.info.triggerParam.type === 'cron') {
          if (this.info.triggerParam.outputGranularity === 'daily') {
            key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler', 'triggerParam.crontabParam.fixedTime'];
          } else if (this.info.triggerParam.outputGranularity === 'weekly' || this.info.triggerParam.outputGranularity === 'monthly') {
            key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler', 'triggerParam.crontabParam.fixedTime', 'triggerParam.crontabParam.range'];
          } else if (this.info.triggerParam.outputGranularity === 'hourly') {
            if (this.info.triggerParam.crontabParam.range && this.info.triggerParam.crontabParam.range.length > 0) {
              key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler', 'triggerParam.crontabParam.range'];
            } else {
              key = key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler', 'triggerParam.crontabParam.startTime', 'triggerParam.crontabParam.interval', 'triggerParam.crontabParam.endTime'];
            }
          } else if (this.info.triggerParam.outputGranularity === 'minutely') {
            key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler', 'triggerParam.crontabParam.startTime', 'triggerParam.crontabParam.interval', 'triggerParam.crontabParam.endTime'];
          }
          key.push('triggerParam.crontab');
        } else {
          key = ['name', 'description', 'triggerParam.outputGranularity', 'triggerParam.isIrregularSheduler'];
        }
      }
      if (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.info.templateCode) || (this.info.templateCode === 'Mysql2Hive' && !this.info.isLakeHouseReal)) {
        key.push('alert');
      }
      result['config_info'] = result['config_info'].filter(item => key.includes(item.key));
      return result;
    }
  },
  created() {
    if (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.info.templateCode) || (this.info.templateCode === 'Mysql2Hive' && !this.info.isLakeHouseReal)) {
      this.isAlertTemplate = true;
    }
    if (['Mysql2Hive', 'PythonShell', 'Hive2Doris'].includes(this.info.templateCode)) {
      this.isExecuteMode = true;
    }
    this.getCostList();
    if (this.content) {
      this.$nextTick(() => {
        this.setCode(this.content);
      });
    }
  },
  methods: {
    isShowTooltip(e) {
      const clientWidth = e.target.clientWidth;
      const scrollWidth = e.target.scrollWidth;
      if (scrollWidth > clientWidth) {
        this.isTipDisabled = false;
      } else {
        this.isTipDisabled = true;
      }
    },
    setCode(code) {
      this.$refs.monaco?.setCode(code);
    },
    getCostList() {
      getCostList(this.userInfo.id).then(res => {
        this.costList = res.data || [];
      });
    },
    formatLabel(val, key, label, type) {
      return this[type].find(item => item[key] === val)?.[label] || val;
    },
    formatGranularty(value) {
      const obj = this.cycleList.find(item => item.value === value);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    handelStep(index) {
      this.$emit('jumpStep', index);
    },
    formatData(item) {
      const { key, label, aliasKey } = item;
      const keyArr = key.split('.');
      let str = '';
      if (keyArr.length > 1) {
        const obj = keyArr.reduce((acc, key) => {
          key += '';
          return acc[key] || {};
        }, tools.copyFn(this.info));
        if (Object.keys(obj).length) {
          str = obj;
        } else {
          str = '';
        }
        if (label === '调度方式') {
          str = obj === 1 ? '周期调度' : '手动调度';
        }
      } else {
        str = tools.copyFn(this.info)[key];
      }
      if (aliasKey === 'sourceRegion' || aliasKey === 'targetRegion') {
        str = this.regionList.find(item => item.value === str)?.label || '-';
      }
      if (aliasKey === 'targetSource') {
        str = this.targetSourceList.find(item => item.actorId === str)?.name || '-';
      }
      if (key === 'partitions') {
        if (Array.isArray(str)) {
          str = str
            .map(item => {
              if (!item.name && !item.value) {
                return '-';
              }
              return (item.name ? item.name : '-') + '=' + (item.value ? item.value : '-');
            })
            .join(' , ');
        }
      }
      if (this.info.templateCode === 'DataMigration') {
        if (key === 'isTable') str = str ? '表' : '文件';
        if (key === 'deleteMode') str = str ? '是' : '否';
      }
      if (this.info.templateCode === 'Hive2Redis' && key === 'interval') {
        str = str + ' ' + this.info.timeCategory;
      }
      if (this.info.templateCode === 'Mysql2Hive') {
        if (key === 'syncType') {
          str = str === 1 ? '全量' : '一键实时';
        }
        if (key === 'table_type') {
          str = str === 'single' ? '单表' : '整库/多表';
        }
      }
      if (this.info.templateCode === 'Metis2Hive') {
        if (key === 'createType') str = str === '0' ? '可视化模式' : 'SQL模式';
      }
      if (this.info.templateCode === 'StreamingSQL' && aliasKey === 'completePath') {
        str = str[str.length - 1]?.name || '-';
      }
      if (this.info.templateCode === 'Hive2Sharestore') {
        if (key === 'isSharestore') {
          str = str ? 'ShareStore' : 'TiKV';
        }
        if (key === 'isHive') {
          str = str ? 'hive表' : 'S3/Obs文件';
        }
      }
      if (this.info.templateCode === 'SPARKJAR' || this.info.templateCode === 'StreamingJAR') {
        if (aliasKey === 'displayDependJarsJob') {
          str = this.artifactList.find(i => i.id === str)?.name;
        }
        if (aliasKey === 'displayDependJarsVersion') {
          str = this.versionList?.find(i => i.id === str)?.displayVersion;
        }
        if (key === 'flinkClusterId') {
          str = this.clusterList?.find(i => i.id === str)?.name;
        }
      }
      if (this.info.templateCode === 'PythonShell') {
        if (key === 'displayDependJars') {
          str.forEach((item, index) => {
            item['工件'] = this.artifactList.find(i => i.id === item.artifactId)?.name;
            item['版本'] = this.versionList[index]?.find(i => i.id === item.id)?.displayVersion;
            delete item.id;
            delete item.artifactId;
          });
          if (
            !str.some(item => {
              return Object.values(item).some(item => item);
            })
          ) {
            str = '-';
          }
        }
      }
      if (key === 'alert') {
        str = '';
        if (this.info.regularAlert.isChecked) {
          str += '定时告警;';
        }
        if (this.info.alertModel.success.isChecked) {
          str += '任务成功时;';
        }
        if (this.info.alertModel.failure.isChecked) {
          str += '任务失败时;';
        }
        if (this.info.alertModel.retry.isChecked) {
          str += '任务重试时;';
        }
        if (this.info.alertModel.start.isChecked) {
          str += '任务开始时;';
        }
      }
      if (key === 'executeMode') {
        if (this.info.executeMode === 'local') {
          str = '本地模式';
        } else {
          str = '分布式模式';
        }
      }
      return str || '-';
    },
    handleChange(activeNames) {
      this.activeNames = activeNames;
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  .title_label {
    position: relative;
    padding-left: 10px;
    font-weight: 550;
    display: flex;
    width: calc(100% - 30px);
    justify-content: space-between;
    cursor: default;
    font-size: $global-font-size-16;
    color: #445782;

    .edit {
      font-size: $global-font-size-14;
      font-weight: 500;
      color: $c-primary;
      cursor: pointer;
    }

    &::before {
      content: '';
      display: inline-block;
      position: absolute;
      top: 7px;
      left: 0;
      width: 3px;
      height: 20px;
      background-color: $c-primary;
    }
  }

  .el-collapse {
    border: none;
  }

  .el-collapse-item {
    border: 1px solid #e1e5ef;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 10px 15px;

    ::v-deep {
      .el-collapse-item__wrap {
        border: none;
      }

      .el-descriptions-item__container {
        align-items: flex-start;
      }

      .el-collapse-item__content {
        padding-bottom: 0;
      }

      .el-collapse-item__header {
        height: 36px;
        line-height: 36px;
        border-bottom-color: rgba(0, 0, 0, 0);
      }
    }
  }

  .box {
    padding: 0 10px;

    ::v-deep .el-descriptions--small {
      font-size: $global-font-size-13;
    }
    ::v-deep .des-content {
      overflow: hidden;
      span {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .depend-wrap {
    padding: 0 10px;
    margin-bottom: 20px;

    .trans_table {
      .func-num {
        position: absolute;
        height: 14px;
        width: 14px;
        background: #2fbfa0;
        color: #fff;
        top: 8px;
        left: 50%;
        border-radius: 50%;
        font-size: $global-font-size-12;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: scale(0.6);
      }

      .state {
        font-size: $global-font-size-12;
        position: absolute;
        top: 4px;
        left: calc(50% + 25px);

        &::before {
          position: absolute;
          left: -6px;
          top: 0;
          bottom: 0;
          margin: auto;
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }

        &.state-success {
          &::before {
            background: #67c23a;
          }
        }

        &.state-fail {
          &::before {
            background: $color-cb;
          }
        }
      }
    }
  }

  .sql_edit {
    height: 300px;

    ::v-deep .monaco-editor {
      height: calc(100% - 23px);
      position: relative;

      ::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        width: calc(100% - 6px);
        height: calc(100% - 6px);
        cursor: not-allowed;
      }
    }
  }
  .more-table {
    width: 90%;
    margin: 0 auto;
  }
}
</style>
