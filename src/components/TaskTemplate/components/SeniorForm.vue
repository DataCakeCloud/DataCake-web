<template>
  <div>
    <el-button type="primary" class="drawer-btn" @click="$emit('close')">确认</el-button>
    <el-tabs type="card">
      <el-tab-pane label="高级设置" class="senior-set">
        <el-form ref="seniorForm" :model="seniorForm" label-width="120px">
          <el-form-item label="负责人" prop="owner">
            <el-select
              v-model="seniorForm.owner"
              placeholder="请输入负责人"
              clearable
              filterable
              remote
              :remote-method="
                query => {
                  remoteMethod(query, 'ownerList');
                }
              "
              :loading="loading"
              popper-class="custom-popper"
            >
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
                <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="协作人">
            <el-select
              v-model="seniorForm.collaborators"
              placeholder="请输入协作人"
              filterable
              multiple
              remote
              reserve-keyword
              :remote-method="
                query => {
                  remoteMethod(query, 'collaboratorsList');
                }
              "
              :loading="loading"
              popper-class="custom-popper"
            >
              <el-option v-for="item in collaboratorsList" :key="item.shareId" :value="item.shareId" :label="item.name">
                <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="用户组">
            <el-cascader v-model="seniorForm.dsGroups" :options="groupOptions" :props="props" clearable placeholder="请选择用户组"></el-cascader>
            <el-tooltip class="item" effect="dark" content="您可以在用户管理模块中创建新的用户组" placement="top" style="margin-left: 5px">
              <i class="el-icon-info" style="cursor: pointer"></i>
            </el-tooltip>
          </el-form-item> -->
          <el-form-item label="用户组" prop="dsGroups">
            <!-- :rules="[{ required: true, message: '请选择用户组', trigger: ['blur', 'change'] }]" -->
            <el-select v-model="seniorForm.dsGroups" disabled placeholder="请选择用户组" multiple filterable>
              <el-option v-for="item in userGroupList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
            <el-tooltip class="item" effect="dark" content="您可以在用户管理模块中创建新的用户组" placement="top" style="margin-left: 5px">
              <i class="el-icon-info" style="cursor: pointer"></i>
            </el-tooltip>
          </el-form-item>
          <!-- <el-form-item label="组名">
            <el-select v-model="seniorForm.group">
              <el-option v-for="item in groupList" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item v-if="runModeShow" label="集群类型">
            <el-select v-model="seniorForm.acrossCloud" placeholder="请选择集群类型" filterable allow-create default-first-option clearable>
              <el-option v-for="item in cloudList" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="任务资源大小" class="other-param">
            <el-popover placement="left" width="340" trigger="hover">
              <div>任务成本和机型、模式、并行度、运行时长有关。以下为单并行度任务的大概费用，仅供参考，具体费用请查看成本中心。</div>
              <el-table :data="resourceData" :span-method="objectSpanMethod" border class="merge-table">
                <el-table-column prop="model" label="机型" min-width="100"></el-table-column>
                <el-table-column prop="type" label="模式" min-width="100"></el-table-column>
                <el-table-column prop="cost" label="费用($/h)" min-width="100"></el-table-column>
              </el-table>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -24px; position: relative"></i>
            </el-popover>
            <el-select v-model="seniorForm.resourceLevel">
              <el-option value="standard" label="standard"></el-option>
              <el-option value="middle" label="medium"></el-option>
              <el-option value="large" label="large"></el-option>
              <el-option value="extra_large" label="extra_large"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="超时Kill时长" class="other-param">
            <el-popover placement="left" width="340" trigger="hover">
              <div>如果设置了此值且不为0，任务运行时长超过此值时，将会 kill任务并自动重试 。如果默认设置为0，后台将根据 该任务历史5次执行时长自动设定一个运行超时告警时间---当任务运行时长超过此值时会触发钉钉告警通知，同时此种情况下任务不会被kill；</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -24px; position: relative"></i>
            </el-popover>
            <el-input-number v-model="seniorForm.executionTimeout" :min="0" :max="86400"></el-input-number> 秒
            <!-- <div style="color: #aaa; position: absolute; top: 24px">注：0表示默认，由系统自动指定。</div> -->
          </el-form-item>
          <el-form-item label="任务重试次数" class="other-param">
            <el-popover placement="left" width="170" trigger="hover">
              <div>输入值范围：0~100</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -24px; position: relative"></i>
            </el-popover>
            <el-input-number v-model="seniorForm.retries" :min="0" :max="100" label="任务重试次数"></el-input-number>
          </el-form-item>
          <el-form-item label="重试时间间隔" class="other-param">
            <!-- <el-popover placement="left" width="340" trigger="hover">
              <div>如果设置了此值且不为0，任务运行时长超过此值时，将会 kill任务并自动重试 。如果默认设置为0，后台将根据 该任务历史5次执行时长自动设定一个运行超时告警时间---当任务运行时长超过此值时会触发钉钉告警通知，同时此种情况下任务不会被kill；</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -24px; position: relative"></i>
            </el-popover> -->
            <el-input-number v-model="seniorForm.retryInterval" :min="0" :max="86400"></el-input-number> 秒
          </el-form-item>
          <el-form-item label="任务并行度" class="other-param">
            <el-popover placement="left" width="200" trigger="hover">
              <!-- <div>指定实例并行运行的数量(输入值范围：1~5)</div> -->
              <div>指定实例并行运行的数量(最小值1)</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -10px; position: relative"></i>
            </el-popover>
            <el-input-number v-model="seniorForm.maxActiveRuns" :min="1" :max="50" label="任务并行度"></el-input-number>
            <div v-show="seniorForm.maxActiveRuns > 5" style="color: #e6a23c; font-size: 10px; margin-top: 2px; line-height: 14px">注：当并行度超过5时，可能会造成集群占满，请谨慎修改</div>
          </el-form-item>
          <!-- <el-form-item label="集群优先级">
            <el-select v-model="seniorForm.clusterSla">
              <el-option value="normal" label="normal"></el-option>
              <el-option value="high" label="high"></el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="报警策略" class="other-param">
            <el-popover placement="left" width="320" trigger="hover">
              <div>指定当任务实例处于“成功”、“失败”、“重试”、“开始”状态时，以怎样的报警方式进行通知。注："失败"指实例最终运行失败，“重试”则指实例在指定重试次数内每次重启时。</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer"></i>
            </el-popover>
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'success' }" :value="seniorForm.alertModel.success.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('success')">成功</el-checkbox>
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'failure' }" :value="seniorForm.alertModel.failure.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('failure')">失败</el-checkbox>
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'retry' }" :value="seniorForm.alertModel.retry.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('retry')">重试</el-checkbox>
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'start' }" :value="seniorForm.alertModel.start.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('start')">开始</el-checkbox>
            <div v-if="alertTypeValue" class="alert-method-box">
              <el-form-item label="报警方式" label-width="70px" size="mini">
                <el-checkbox-group v-model="seniorForm.alertModel[alertTypeValue].alertType">
                  <el-checkbox label="dingTalk" style="margin-right: 10px !important">钉钉</el-checkbox>
                  <el-checkbox label="phone" style="margin-right: 10px !important">电话</el-checkbox>
                  <el-checkbox label="email">邮件</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="是否通知协作人" label-width="70px" size="mini">
                <el-radio v-model="seniorForm.alertModel[alertTypeValue].notifyCollaborator" :label="true">是</el-radio>
                <el-radio v-model="seniorForm.alertModel[alertTypeValue].notifyCollaborator" :label="false">否</el-radio>
              </el-form-item>
            </div>
          </el-form-item> -->
          <!-- <el-form-item v-if="seniorForm.alertType.length" label="告警邮件发送邮箱">
            <el-input v-model="seniorForm.emails" placeholder="输入告警邮件发送邮箱"></el-input>
          </el-form-item> -->
          <el-form-item label="任务开始日期">
            <el-date-picker v-model="seniorForm.startDate" type="datetime" placeholder="选择任务开始日期" value-format="yyyy-MM-dd HH:mm:ss" default-time="00:00:00" :picker-options="pickerOptions"></el-date-picker>
          </el-form-item>
          <el-form-item label="任务结束日期">
            <el-date-picker v-model="seniorForm.endDate" type="datetime" placeholder="选择任务结束日期" value-format="yyyy-MM-dd HH:mm:ss" default-time="23:59:59" :picker-options="pickerOptions2"></el-date-picker>
          </el-form-item>
          <!-- <el-form-item v-if="isShowMode && runModeShow" label="任务模式" class="other-param">
            <el-popover placement="left" width="320" trigger="hover">
              <div>经济模式：Ec2spot；保障模式：OnDemand</div>
              <i slot="reference" class="el-icon-info primary" style="cursor: pointer"></i>
            </el-popover>
            <el-radio-group v-model="seniorForm.lifecycle">
              <el-radio label="Ec2spot">经济模式</el-radio>
              <el-radio label="OnDemand">保障模式</el-radio>
            </el-radio-group>
          </el-form-item> -->
          <el-divider></el-divider>
          <div style="margin-left: 30px">
            <el-popover placement="right" width="550" trigger="hover">
              <div>
                <!-- <template v-if="code == 'PythonShell'">
                  {<br />
                  "node_selectors": {},#标签选择器，用来控制pod被调度的机器<br />
                  "labels": {}, #标签 用于pod的发现<br />
                  "env_vars": {}, #环境变量 设置pod的环境变量<br />
                  "resources": {}, #资源 配置pod申请的资源，包括cpu，memory等<br />
                  "volumes”: [],#存储卷 用于存储数据<br />
                  "volume_mounts": [], #挂载卷 用于挂载数据卷，通常和volumn一起使用<br />
                  "annotations": {} #注解 用于注入非识别类信息<br />
                  }
                </template>
                <template v-else>
                  <div class="global-color-cb">以下示例仅供参考(请注意，部分参数需带单位):</div>
                  --conf spark.executor.memory=6G<br />
                  --conf spark.driver.memory=10g<br />
                  --conf spark.executor.memoryOverhead=5000M<br />
                  --conf spark.hadoop.mapreduce.input.fileinputformat.split.maxsize=134217728<br />
                  --conf spark.hadoop.mapreduce.input.fileinputformat.split.minsize=134217728<br />
                  --conf spark.network.timeout=3000ms<br />
                  --conf spark.default.parallelism=1500<br />
                  --conf spark.speculation=true<br />
                  --conf spark.task.maxFailures=3<br />
                  --conf spark.speculation.multiplier=2.5<br />
                  --conf spark.speculation.quantile=0.95<br />
                  --conf spark.speculation.interval=600000<br />
                  --conf spark.hadoop.mapred.output.direct.EmrFileSystem=false<br />
                  --conf spark.hadoop.mapred.output.direct.NativeS3FileSystem=false<br />
                  --conf spark.hadoop.mapreduce.fileoutputcommitter.algorithm.version=2<br />
                  --conf spark.executor.instances=700<br />
                  --conf spark.sql.broadcastTimeout=1<br />
                </template> -->
                <template>
                  { <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"errorLimit":{ "record":1, "percentage":0.02 },<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"speed":{ "channel":2 },<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"jvm":"-Xms1G -Xmx1G"<br />
                  } <br />
                  // speed : 传输速度配置 <br />
                  // channel : 并发数 <br />
                  // errorLimit : 容错比例配置 <br />
                  // record : 错误条数上限,超出则任务失败 <br />
                  // percentage : 错误比例上限,超出则任务失败 <br />
                </template>
              </div>
              <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
            </el-popover>
            <label class="label">其他参数</label>
            <el-input v-model="seniorForm.batchParams" class="batch-params" type="textarea" :rows="12" placeholder="请输入其他参数" clearable></el-input>
          </div>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { getUserList } from '@/api/task';

export default {
  name: 'SeniorForm',
  props: {
    seniorForm: {
      type: Object,
      default: () => ({
        group: this.$store.getters.userInfo.group.split(',')[0],
        resourceLevel: 'standard',
        retries: 1,
        emails: '',
        clusterSla: 'normal',
        // params: []
        batchParams: ''
      })
    },
    runModeShow: {
      // 有运行模式选项的模版
      type: Boolean,
      default: true
    },
    isShowCloud: {
      type: Boolean,
      default: false
    },
    isShowMode: {
      type: Boolean,
      default: true
    },
    code: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // seniorForm: {
      //   group: this.$store.getters.userInfo.org.split(',')[0],
      //   resourceLevel: 'standard',
      //   retries: 2,
      //   emails: '',
      //   clusterSla: 'normal',
      //   params: []
      // },
      props: { multiple: true, value: 'id', label: 'name' },
      groupOptions: [],
      loading: false,
      ownerList: [],
      collaboratorsList: [],
      userGroupList: [],
      resourceData: [
        { model: 'standard', type: 'spot', cost: '0.028' },
        { model: 'standard', type: 'ondemand', cost: '0.055' },
        { model: 'middle', type: 'spot', cost: '0.064' },
        { model: 'middle', type: 'ondemand', cost: '0.128' },
        { model: 'large', type: 'spot', cost: '0.096' },
        { model: 'large', type: 'ondemand', cost: '0.192' },
        { model: 'extra large', type: 'spot', cost: '0.192' },
        { model: 'extra large', type: 'ondemand', cost: '0.384' }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= new Date(new Date(new Date().toLocaleDateString()).getTime() - 24 * 60 * 60 * 1000);
        }
      },
      pickerOptions2: {
        disabledDate(time) {
          return time.getTime() <= new Date(new Date(new Date().toLocaleDateString()).getTime() - 24 * 60 * 60 * 1000);
        }
      },
      alertTypeValue: ''
    };
  },
  computed: {
    groupList() {
      const userInfo = this.$store.getters.userInfo;
      if (userInfo && userInfo.group) {
        return userInfo.group.split(',');
      } else {
        return [];
      }
    },
    cloudList() {
      // let list = ['common', 'yarn', 'gpu'];
      let list = ['common', 'gpu'];
      if (this.seniorForm.sourceRegion === 'sg2') {
        list = ['common', 'migration', 'gpu'];
      }
      return list;
    }
  },
  watch: {
    'seniorForm.alertType'(value) {
      if (value.length === 0) this.seniorForm.emails = '';
    },
    // 'seniorForm.lifecycle'(value) {
    //   if (value === 'Ec2spot') {
    //     this.seniorForm.retries = 1;
    //   } else {
    //     this.seniorForm.retries = 0;
    //   }
    // },
    'seniorForm.startDate'(value) {
      if (value) {
        this.pickerOptions2 = {
          disabledDate(time) {
            return time.getTime() < new Date(value).getTime();
          }
        };
      }
    }
  },
  created() {
    this.getUserGroup();
    // if (!this.seniorForm.group) {
    //   this.seniorForm.group = this.groupList[0];
    // }
    if (!this.seniorForm.owner) {
      this.seniorForm.owner = this.$store.getters.userInfo.userId;
    }
    this.remoteMethod(this.seniorForm.owner, 'ownerList');
    if (this.seniorForm.collaborators && this.seniorForm.collaborators.length) {
      this.seniorForm.collaborators.map(item => {
        getUserList(item).then(res => {
          const data = res.data;
          this.collaboratorsList.push(...data);
        });
      });
    }
  },
  methods: {
    // getUserGroup() {
    //   const params = {
    //     userId: JSON.parse(sessionStorage.getItem('userInfo')).userId
    //   };
    //   getUserGroup(params).then(data => {
    //     this.groupOptions = data.data;
    //     this.solveEmptyChildren(this.groupOptions);
    //   });
    // },
    solveEmptyChildren(data) {
      data.forEach(item => {
        if (!item.children.length) {
          delete item.children;
        } else {
          this.solveEmptyChildren(item.children);
        }
      });
    },
    getUserGroup() {
      this.userGroupList = this.$store.getters['user/userGroupList'];
      // getGroup().then(res => {
      //   this.userGroupList = res.data;
      // });
    },
    remoteMethod(query, list) {
      if (query !== '') {
        this.loading = true;
        getUserList(query).then(res => {
          this.loading = false;
          const data = res.data;
          this[list] = data;
        });
      } else {
        this[list] = [];
      }
    },
    addParam() {
      const length = this.seniorForm.params.length;
      if (length > 0 && !this.seniorForm.params[length - 1].key) {
        this.$message({
          type: 'warning',
          message: '请先输入当前参数的key！'
        });
        return;
      } else {
        this.seniorForm.params.push({ key: '', value: '' });
      }
    },
    deleteParam(index) {
      this.seniorForm.params.splice(index, 1);
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    },
    checkAlertType(type) {
      if (this.alertTypeValue === type) {
        this.alertTypeValue = '';
        return;
      }
      this.alertTypeValue = type;
    }
  }
};
</script>
<style lang="scss" scoped>
.senior-set {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.param-wrap {
  // overflow-y: auto;
  padding: 0 15px;
  // max-height: calc(100vh - 450px);
  .param-item {
    margin-bottom: 10px;
    .el-icon-delete {
      color: $color-cb;
      cursor: pointer;
      margin-left: 5px;
    }
  }
}
.other-param {
  position: relative;
  ::v-deep .el-popover__reference-wrapper {
    position: absolute;
    left: -88px;
  }
}
.label {
  font-weight: 500;
  color: #2c3b5e;
}
.batch-params {
  word-break: break-all;
  margin-top: 10px;
}
.merge-table {
  ::v-deep th,
  ::v-deep td {
    border-right: 1px solid #e2e9f3 !important;
  }
  &::v-deep::after {
    background-color: #e2e9f3 !important;
  }
}
.active-checkbox {
  border-bottom: 2px solid #67c23a;
}
.alert-method-box {
  margin-right: 2px;
  padding: 0 8px;
  border: 1px solid #e4e7ed;
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
  ::v-deep .el-form-item__label {
    font-weight: 400;
  }
}
</style>
