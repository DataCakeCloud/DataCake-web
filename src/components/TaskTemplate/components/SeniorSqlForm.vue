<template>
  <div>
    <el-button type="primary" class="drawer-btn" @click="confirm">确认</el-button>
    <el-form ref="seniorForm" :model="seniorForm" :rules="rules" label-width="195px" class="sql-form">
      <el-tabs type="card">
        <el-tab-pane label="参数设置" class="senior-set">
          <el-form-item label="Checkpoint">
            <el-switch v-model="seniorForm.runtimeConfig.checkpoint" active-color="#409EFF" :active-value="1" :inactive-value="0"></el-switch>
          </el-form-item>
          <template v-if="seniorForm.runtimeConfig.checkpoint == 1">
            <el-form-item label="时间间隔" prop="runtimeConfig.checkpointInterval"> <el-input-number v-model="seniorForm.runtimeConfig.checkpointInterval" :min="1" :max="3600" :step="1"></el-input-number> 秒 </el-form-item>
            <el-form-item label="超时时间" prop="runtimeConfig.checkpointTimeout"> <el-input-number v-model="seniorForm.runtimeConfig.checkpointTimeout"></el-input-number> 秒 </el-form-item>
            <el-form-item label="Checkpoint模式" prop="runtimeConfig.checkpointMode">
              <el-select v-model="seniorForm.runtimeConfig.checkpointMode" clearable placeholder="请选择">
                <el-option v-for="item in checkpointTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item v-if="isShowModel" label="自动伸缩模式" prop="runtimeConfig.isAutoScaleMode">
            <el-radio-group v-model="seniorForm.runtimeConfig.isAutoScaleMode" @change="changeModel">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Cluster" prop="flinkClusterId">
            <el-select v-model="seniorForm.flinkClusterId" filterable placeholder="请选择">
              <el-option v-for="item in clusterList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <div v-if="noCluster" style="color: red">没找到?<router-link to="/config/cluster">去创建</router-link></div>
          </el-form-item>
          <el-form-item v-if="seniorForm.isLakeHouseReal" label-width="195px" label="指定MySQL CDC启动模式" class="other-param">
            <el-popover placement="left" width="400" trigger="hover">
              <div class="mode-box">
                <h3>启动模式</h3>
                <div>配置选项 <span>scan.startup.mode</span> 指定MySQL CDC使用者的启动模式。有效枚举包括：</div>
                <ul>
                  <li><span>initial</span> (默认)：在第一次启动时对受监视的数据库表执行初始快照，并继续读取最新的binlog。</li>
                  <li><span>earliest-offset</span>：跳过快照阶段，从可读取的最早binlog位点开始读取</li>
                  <li><span>latest-offset</span>：首次启动时，从不对受监视的数据库表执行快照，连接器仅从binlog的结尾处开始读取，这意味 着连接器只能读取在连接器启动之后的数据更改。</li>
                  <!-- <li><span>specific-offset</span>：跳过快照阶段，从指定的binlog位点开始读取。位点可通过binlog文件名和位置指定，或者在GTID 在集群上启用时通过GTID集合指定。</li>
                  <li><span>timestamp</span>：跳过快照阶段，从指定的时间戳开始读取binlog事件。</li> -->
                </ul>
              </div>

              <i slot="reference" class="el-icon-info primary" style="cursor: pointer; left: -105px; position: relative"></i>
            </el-popover>
            <el-select v-model="seniorForm.runtimeConfig.mysqlCdcType" class="area-select" placeholder="请选择启动模式" clearable>
              <el-option v-for="item in typeList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <!-- </el-form> -->
        </el-tab-pane>
        <el-tab-pane label="高级" class="senior-set">
          <el-form-item v-if="isShowBatch" label="flink job类型" required>
            <el-radio-group v-model="seniorForm.runtimeConfig.isBatchTask">
              <el-radio :label="true">批</el-radio>
              <el-radio :label="false">流</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="isShowBatch && seniorForm.runtimeConfig.isBatchTask" label="邮箱" prop="runtimeConfig.emails">
            <el-input v-model="seniorForm.runtimeConfig.emails" placeholder="输入告警邮件发送邮箱" class="senior-input" clearable></el-input>
          </el-form-item>
          <el-form-item label="负责人" prop="runtimeConfig.owner" label-width="100px">
            <el-select
              v-model="seniorForm.runtimeConfig.owner"
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
              class="senior-input"
            >
              <el-option v-for="item in ownerList" :key="item.shareId" :value="item.shareId" :label="item.name">
                <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="协作人">
            <el-select
              v-model="seniorForm.runtimeConfig.collaborators"
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
              class="senior-input"
            >
              <el-option v-for="item in collaboratorsList" :key="item.shareId" :value="item.shareId" :label="item.name">
                <div style="max-width: 250px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="用户组" prop="runtimeConfig.dsGroups" label-width="100px">
            <!-- :rules="[{ required: true, message: '请选择用户组', trigger: ['blur', 'change'] }]" -->
            <el-select v-model="seniorForm.runtimeConfig.dsGroups" disabled placeholder="请选择用户组" multiple filterable>
              <el-option v-for="item in userGroupList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <div style="margin-bottom: 10px; color: #e6a23c"><i class="el-icon-info"></i> 以下参数只对Per-Job生效</div>
          <el-form-item label="Parallelism" prop="parallelism" label-width="100px">
            <el-input-number v-model="seniorForm.runtimeConfig.parallelism" :min="1" :max="3600" :step="1"></el-input-number>
          </el-form-item>
          <!-- <el-form-item label="HuaWei IAM" label-width="100px">
            <el-input v-model="seniorForm.runtimeConfig.huaweiIam" class="senior-input" placeholder="输入HuaWei IAM" clearable></el-input>
            <el-tooltip class="item" effect="dark" content="统一身份认证，账号由运维提供且必须包含有对目录【obs://cbs-flink-sg/main-sg2-prod/】的操作权限" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="AWS IAM" label-width="100px">
            <el-input v-model="seniorForm.runtimeConfig.awsIam" class="senior-input" placeholder="输入HuaWei awsIam" clearable></el-input>
            <el-tooltip class="item" effect="dark" content="统一身份认证，账号由运维提供且必须包含有对目录【s3a://cbs.flink.ap-southeast-1/ads-sg1-prod/】的操作权限" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item> -->
          <el-form-item label="TM CPU" label-width="100px">
            <el-input-number v-model="seniorForm.runtimeConfig.tmCpu" :min="0.1" :precision="1" :step="1"></el-input-number> 核
            <el-tooltip class="item" effect="dark" content="kubernetes.taskmanager.cpu" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="TM Memory" label-width="100px">
            <el-input-number v-model="seniorForm.runtimeConfig.tmMemory" :min="1" :step="1"></el-input-number> G
            <el-tooltip class="item" effect="dark" content="taskmanager.memory.process.size" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <!-- <el-form-item v-if="isShowBatch && seniorForm.runtimeConfig.isBatchTask" label="报警方式">
            <el-checkbox-group v-model="seniorForm.alertMethod">
              <el-checkbox label="dingTalk">钉钉</el-checkbox>
              <el-checkbox label="phone">电话</el-checkbox>
            </el-checkbox-group>
          </el-form-item> -->
          <el-form-item label="报警类型" label-width="100px" class="other-param">
            <el-popover placement="left" width="320" trigger="hover">
              <div>指定当任务实例处于“成功”、“失败”、“重试”、“开始”状态时，以怎样的报警方式进行通知。注："失败"指实例最终运行失败，“重试”则指实例在指定重试次数内每次重启时。</div>
              <i slot="reference" class="el-icon-info" style="cursor: pointer; color: #409eff"></i>
            </el-popover>
            <!-- <el-checkbox-group v-model="seniorForm.runtimeConfig.alertType">
              <el-checkbox :label="1">成功</el-checkbox>
              <el-checkbox :label="2">失败</el-checkbox>
              <el-checkbox :label="4">开始</el-checkbox>
            </el-checkbox-group> -->
            <!-- <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'success' }" :value="seniorForm.runtimeConfig.alertModel.success.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('success')">成功</el-checkbox> -->
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'failure' }" :value="seniorForm.runtimeConfig.alertModel.failure.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('failure')">失败</el-checkbox>
            <!-- <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'retry' }" :value="seniorForm.runtimeConfig.alertModel.retry.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('retry')">重试</el-checkbox>
            <el-checkbox :class="{ 'active-checkbox': alertTypeValue === 'start' }" :value="seniorForm.runtimeConfig.alertModel.start.alertType.length > 0" style="margin-right: 16px" @change="checkAlertType('start')">开始</el-checkbox> -->
            <div v-if="alertTypeValue" class="alert-method-box">
              <el-form-item label="报警方式" label-width="70px" size="mini">
                <!-- <el-checkbox-group v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].alertType">
                  <el-checkbox label="dingTalk" style="margin-right: 10px !important">钉钉</el-checkbox>
                  <el-checkbox label="phone" style="margin-right: 10px !important">电话</el-checkbox>
                  <el-checkbox label="email">邮件</el-checkbox>
                </el-checkbox-group> -->
                <el-checkbox-group v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].alertType">
                  <el-checkbox v-for="(item, k) in alertList" :key="k" :label="item.value" style="margin-right: 10px !important">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <div>
                <div v-if="seniorForm.runtimeConfig.alertModel[alertTypeValue].alertType.includes('enterprise_wechat')">
                  <el-form-item
                    label="微信群token："
                    label-width="130px"
                    size="mini"
                    :prop="`runtimeConfig.alertModel.${alertTypeValue}.wechatRobotKey`"
                    style="margin-top: 20px"
                    :rules="[
                      {
                        required: true,
                        message: '请填写微信群token',
                        trigger: ['blur', 'change']
                      }
                    ]"
                  >
                    <el-input v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].wechatRobotKey" type="textarea"></el-input>
                  </el-form-item>
                  <el-form-item
                    label="此群需要@："
                    label-width="130px"
                    size="mini"
                    :prop="`runtimeConfig.alertModel.${alertTypeValue}.wechatReceivers`"
                    style="margin-top: 20px"
                    :rules="[
                      {
                        required: true,
                        message: '请选择微信群@对象',
                        trigger: ['blur', 'change']
                      }
                    ]"
                  >
                    <el-select
                      v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].wechatReceivers"
                      placeholder="请选择@对象"
                      size="small"
                      clearable
                      filterable
                      remote
                      multiple
                      reserve-keyword
                      value-key="shareId"
                      :remote-method="
                        query => {
                          remoteMethod(query, 'sendList');
                        }
                      "
                      :loading="loading"
                      popper-class="custom-popper"
                      style="width: 100%"
                    >
                      <el-option v-for="item in sendList" :key="item.shareId" :value="item" :label="item.shareId">
                        <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div v-if="seniorForm.runtimeConfig.alertModel[alertTypeValue].alertType.includes('email')">
                  <el-form-item
                    label="邮件接收人："
                    label-width="130px"
                    size="mini"
                    :prop="`runtimeConfig.alertModel.${alertTypeValue}.emailReceivers`"
                    style="margin-top: 20px"
                    :rules="[
                      {
                        required: true,
                        message: '请选择邮件接收人',
                        trigger: ['blur', 'change']
                      }
                    ]"
                  >
                    <el-select
                      v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].emailReceivers"
                      placeholder="请选择邮件接收人"
                      size="small"
                      clearable
                      filterable
                      remote
                      reserve-keyword
                      multiple
                      value-key="shareId"
                      :remote-method="
                        query => {
                          remoteMethod(query, 'sendList');
                        }
                      "
                      :loading="loading"
                      popper-class="custom-popper"
                      style="width: 100%"
                    >
                      <el-option v-for="item in sendList" :key="item.shareId" :value="item" :label="item.shareId">
                        <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
              <!-- <el-form-item label="是否通知协作人" label-width="70px" size="mini">
                <el-radio v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].notifyCollaborator" :label="true">是</el-radio>
                <el-radio v-model="seniorForm.runtimeConfig.alertModel[alertTypeValue].notifyCollaborator" :label="false">否</el-radio>
              </el-form-item> -->
            </div>
          </el-form-item>
          <el-divider></el-divider>
          <el-form-item label="其他参数" label-width="100px">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addParam"></el-button>
          </el-form-item>
          <div class="param-wrap">
            <div v-for="(item, index) in seniorForm.runtimeConfig.params" :key="index" class="param-item">
              <el-input v-model="item.key" placeholder="key" style="width: 180px"></el-input> :
              <el-input v-model="item.value" placeholder="value" style="width: 120px"></el-input>
              <i class="el-icon-delete" @click="deleteParam(index)"></i>
            </div>
          </div>
          <!-- </el-form> -->
        </el-tab-pane>
        <el-tab-pane label="UDF" class="senior-set">
          <div v-for="(item, index) in seniorForm.displayDependJars" :key="index" class="sqlapp-main-set-udf">
            <!-- <el-form-item label="区域" label-width="70px">
              <el-select v-model="item.region" filterable clearable @change="regionChange($event, index, item)">
                <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUdf(index)"></el-button>
            </el-form-item> -->
            <el-form-item label="Jar文件" label-width="70px">
              <el-select v-model="item.artifactId" filterable clearable @change="artifactChange($event, index, item)">
                <el-option v-for="jar in artifactListMap[index]" :key="jar.id" :label="jar.name" :value="jar.id"></el-option>
              </el-select>
              <el-button v-if="region" type="danger" size="mini" icon="el-icon-delete" @click="deleteUdf(index)"></el-button>
            </el-form-item>
            <el-form-item label="Jar版本" label-width="70px">
              <el-select v-model="item.id" filterable clearable>
                <el-option v-for="version in versionList[index]" :key="version.id" :label="version.displayVersion" :value="version.id"></el-option>
              </el-select>
              <el-button v-show="index == seniorForm.displayDependJars.length - 1" type="primary" size="mini" icon="el-icon-plus" @click="addUdf"></el-button>
            </el-form-item>
          </div>
          <div v-if="seniorForm.displayDependJars.length == 0" style="text-align: center; margin-top: 10px">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addUdf"></el-button>
          </div>
          <!-- </el-form> -->
        </el-tab-pane>
        <!-- <el-tab-pane v-if="isShowBatch && !seniorForm.runtimeConfig.isBatchTask" label="经济模式" class="senior-set">
          <el-form-item label="开启经济模式">
            <el-switch v-model="seniorForm.runtimeConfig.isAutoScaleMode"></el-switch>
          </el-form-item>
          <el-form-item v-if="seniorForm.runtimeConfig.isAutoScaleMode" label="选择策略">
            <el-checkbox-group v-model="checkList">
              <el-checkbox label="OPERATOR_PROCESS_STRATEGY">算子操作建议策略</el-checkbox>
              <el-checkbox label="KAFKA_LAG_STRATEGY">kafka消费延迟策略</el-checkbox>
              <el-checkbox label="PERIODIC_STRATEGY">周期性策略</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form ref="scaleMode" :model="scaleMode" :rules="modeRules" label-width="110px">
            <el-collapse v-if="seniorForm.runtimeConfig.isAutoScaleMode && checkList.length > 0">
              <el-collapse-item v-if="checkList.includes('OPERATOR_PROCESS_STRATEGY')" title="算子操作建议策略">
                <el-form-item label="topic名称" prop="operator.topic">
                  <el-input v-model="scaleMode.operator.topic" class="senior-input" placeholder="请输入topic名称"></el-input>
                </el-form-item>
                <el-form-item label="KAFKA集群" prop="operator.kafkaCluster">
                  <el-input v-model="scaleMode.operator.kafkaCluster" class="senior-input" placeholder="请输入KAFKA集群"></el-input>
                </el-form-item>
                <el-form-item label="冷却时间" prop="operator.coolingTime"> <el-input-number v-model="scaleMode.operator.coolingTime"></el-input-number> 秒 </el-form-item>
                <el-form-item label="扩缩容忍度" prop="operator.minimumPercentage">
                  <el-input-number v-model="scaleMode.operator.minimumPercentage" :precision="1"></el-input-number>
                </el-form-item>
                <el-form-item label="最小并行度" prop="operator.minPar">
                  <el-input-number v-model="scaleMode.operator.minPar" :min="1" :max="512"></el-input-number>
                </el-form-item>
                <el-form-item label="最大并行度" prop="operator.maxPar">
                  <el-input-number v-model="scaleMode.operator.maxPar" :min="1" :max="512"></el-input-number>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item v-if="checkList.includes('KAFKA_LAG_STRATEGY')" title="kafka消费延迟策略">
                <el-form-item label="topic名称" prop="kafka.topic">
                  <el-input v-model="scaleMode.kafka.topic" class="senior-input" placeholder="请输入topic名称"></el-input>
                </el-form-item>
                <el-form-item label="KAFKA集群" prop="kafka.kafkaCluster">
                  <el-input v-model="scaleMode.kafka.kafkaCluster" class="senior-input" placeholder="请输入KAFKA集群"></el-input>
                </el-form-item>
                <el-form-item label="消费者组" prop="kafka.consumer_group">
                  <el-input v-model="scaleMode.kafka.consumer_group" class="senior-input" placeholder="请输入消费者组"></el-input>
                </el-form-item>
                <el-form-item label="最大延迟条数" prop="kafka.maxDelayCount">
                  <el-input-number v-model="scaleMode.kafka.maxDelayCount"></el-input-number>
                </el-form-item>
                <el-form-item label="最小延迟条数" prop="kafka.minDelayCount">
                  <el-input-number v-model="scaleMode.kafka.minDelayCount"></el-input-number>
                </el-form-item>
                <el-form-item label="延迟时间" prop="kafka.delayTime"> <el-input-number v-model="scaleMode.kafka.delayTime"></el-input-number> 秒 </el-form-item>
                <el-form-item label="冷却时间" prop="kafka.coolingTime"> <el-input-number v-model="scaleMode.kafka.coolingTime"></el-input-number> 秒 </el-form-item>
                <el-form-item label="扩缩比例" prop="kafka.expandProportion">
                  <el-input-number v-model="scaleMode.kafka.expandProportion" :min="1.2" :precision="1"></el-input-number>
                </el-form-item>
                <el-form-item label="最小并行度" prop="kafka.minPar">
                  <el-input-number v-model="scaleMode.kafka.minPar" :min="1" :max="512"></el-input-number>
                </el-form-item>
                <el-form-item label="最大并行度" prop="kafka.maxPar">
                  <el-input-number v-model="scaleMode.kafka.maxPar" :min="1" :max="512"></el-input-number>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item v-if="checkList.includes('PERIODIC_STRATEGY')" title="周期性策略">
                <div v-for="(item, index) in scaleMode.periodic.periodicList" :key="index">
                  <el-form-item label="时间区间" required>
                    <el-input-number v-model="item.startTime" :min="0" :disabled="true"></el-input-number> --
                    <el-input-number v-model="item.endTime" :min="item.startTime + 1" :max="24"></el-input-number>
                    <template v-if="index === scaleMode.periodic.periodicList.length - 1">
                      <el-tooltip content="结束时间小于23才允许添加" :open-delay="200" popper-class="tag-popper">
                        <span><el-button type="text" :disabled="item.endTime >= 23" icon="el-icon-circle-plus" circle @click="addPeriod(item.endTime)"></el-button></span>
                      </el-tooltip>
                      <el-button type="text" :disabled="index === 0" icon="el-icon-remove" circle style="margin-left: 0" @click="removePeriod()"></el-button>
                    </template>
                  </el-form-item>
                  <el-form-item label="并行度" required>
                    <el-input-number v-model="item.par" :min="1"></el-input-number>
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </el-tab-pane> -->
      </el-tabs>
    </el-form>
  </div>
</template>
<script>
import { getArtifactList, getVersionList, getClusterList, getUserList, getIam, getClusterAuto, getClusterNotauto } from '@/api/task';
import { getGroup } from '@/api/jurisdiction';
import * as tools from '@/utils/tools';

export default {
  name: 'SeniorSqlForm',
  props: {
    noCluster: {
      type: Boolean,
      default: false
    },
    region: {
      type: String,
      default: ''
    },
    seniorForm: {
      type: Object,
      default: () => ({
        // 参数设置
        flinkClusterId: '',
        runtimeConfig: {
          // 参数设置
          checkpoint: 1,
          checkpointInterval: 30,
          checkpointTimeout: 100,
          checkpointMode: 'AT_LEAST_ONCE',
          // 高级设置
          owner: '',
          collaborators: [],
          parallelism: 1,
          huaweiIam: '',
          awsIam: '',
          tmCpu: 1,
          tmMemory: 4,
          params: []
        },
        // UDF
        displayDependJars: [{ artifactId: '', id: '' }]
      })
    },
    isShowModel: {
      type: Boolean,
      default: false
    },
    isShowBatch: {
      type: Boolean,
      default: false
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
      // }
      jarIndex: 0,
      regionList: tools.regionList,
      typeList: ['initial', 'earliest-offset', 'latest-offset'],
      // 'specific-offset', 'timestamp'
      alertList: [],
      sendList: [],
      rules: {
        isAutoScaleMode: [{ required: true, message: '请选择自动伸缩模式', trigger: ['blur', 'change'] }],
        flinkClusterId: [{ required: true, message: '请选择cluster', trigger: ['blur', 'change'] }],
        runtimeConfig: {
          emails: [{ required: true, message: '请输入邮箱', trigger: ['blur', 'change'] }],
          checkpointMode: [{ required: true, message: '请选择checkpoint模式', trigger: ['blur', 'change'] }],
          checkpointInterval: [{ required: true, message: '请输入时间间隔', trigger: ['blur', 'change'] }],
          checkpointTimeout: [{ required: true, message: '请输入超时时间', trigger: ['blur', 'change'] }],
          isAutoScaleMode: [{ required: true, message: '请选择自动伸缩模式', trigger: ['blur', 'change'] }]
        }
      },
      checkpointTypeList: [
        {
          label: 'At Least Once',
          value: 'AT_LEAST_ONCE'
        },
        {
          label: 'Exactly Once',
          value: 'EXACTLY_ONCE'
        }
      ],
      clusterList: [],
      autoClusterList: [],
      notautoClusterList: [],
      artifactListMap: {},
      versionList: [],
      ownerList: [],
      collaboratorsList: [],
      huaweiList: [],
      awsList: [],
      userGroupList: [],
      loading: false,
      checkList: [],
      regionObj: {},
      scaleMode: {
        operator: {
          name: 'OPERATOR_PROCESS_STRATEGY',
          topic: '',
          kafkaCluster: '',
          coolingTime: 120,
          minimumPercentage: 1.5,
          minPar: 1,
          maxPar: 512
        },
        kafka: {
          name: 'KAFKA_LAG_STRATEGY',
          topic: '',
          kafkaCluster: '',
          consumer_group: '',
          delayTime: 1800,
          expandProportion: 1.5,
          minDelayCount: 1000,
          maxDelayCount: 200000,
          coolingTime: 120,
          minPar: 1,
          maxPar: 512
        },
        periodic: {
          name: 'PERIODIC_STRATEGY',
          periodicList: [
            {
              startTime: 0,
              endTime: 24,
              par: 1
            }
          ]
        }
      },
      modeRules: {
        operator: {
          topic: [{ required: true, message: '请输入topic名称', trigger: ['blur', 'change'] }],
          kafkaCluster: [{ required: true, message: '请输入KAFKA集群', trigger: ['blur', 'change'] }],
          coolingTime: [{ required: true, message: '请输入冷却时间', trigger: ['blur', 'change'] }],
          minimumPercentage: [{ required: true, message: '请输入扩缩容忍度', trigger: ['blur', 'change'] }],
          minPar: [{ required: true, message: '请输入最小并行度', trigger: ['blur', 'change'] }],
          maxPar: [{ required: true, message: '请输入最大并行度', trigger: ['blur', 'change'] }]
        },
        kafka: {
          topic: [{ required: true, message: '请输入topic名称', trigger: ['blur', 'change'] }],
          kafkaCluster: [{ required: true, message: '请输入KAFKA集群', trigger: ['blur', 'change'] }],
          consumer_group: [{ required: true, message: '请输入消费者组', trigger: ['blur', 'change'] }],
          delayTime: [{ required: true, message: '请输入延迟时间', trigger: ['blur', 'change'] }],
          expandProportion: [{ required: true, message: '请输入扩缩比例', trigger: ['blur', 'change'] }],
          minDelayCount: [{ required: true, message: '请输入最小延迟条数', trigger: ['blur', 'change'] }],
          maxDelayCount: [{ required: true, message: '请输入最大延迟条数', trigger: ['blur', 'change'] }],
          coolingTime: [{ required: true, message: '请输入冷却时间', trigger: ['blur', 'change'] }],
          minPar: [{ required: true, message: '请输入最小并行度', trigger: ['blur', 'change'] }],
          maxPar: [{ required: true, message: '请输入最大并行度', trigger: ['blur', 'change'] }]
        }
      },
      alertTypeValue: ''
    };
  },
  watch: {
    region(val) {
      this.seniorForm.displayDependJars = [{ artifactId: '', id: '' }];
      this.regionChange(val, 0, this.seniorForm.displayDependJars[0]);
      this.seniorForm.flinkClusterId = '';
      this.getCluster();
    }
  },
  created() {
    tools.regionList.then(res => {
      this.regionList = res;
    });
    if (this.seniorForm.oldAlertList?.length && !this.$route.query.copyId) {
      this.alertList = this.seniorForm.oldAlertList;
    } else {
      const systemAlertList = JSON.parse(this.$store.getters['user/systemConf'].config)?.alarm_channel;
      systemAlertList.map(item => {
        switch (item) {
          case 'enterprise_wechat':
            this.alertList.push({ label: '企业微信', value: 'enterprise_wechat' });
            break;
          case 'email':
            this.alertList.push({ label: '邮件', value: 'email' });
            break;
        }
      });
      this.seniorForm.oldAlertList = this.alertList;
    }
    this.init();
    if (!this.seniorForm.runtimeConfig.owner) {
      this.seniorForm.runtimeConfig.owner = this.$store.getters.userInfo.userId;
    }
    this.remoteMethod(this.seniorForm.runtimeConfig.owner, 'ownerList');
    this.remoteMethod('', 'sendList');
    if (this.seniorForm.runtimeConfig.collaborators.length) {
      this.seniorForm.runtimeConfig.collaborators.map(item => {
        getUserList(item).then(res => {
          const data = res.data;
          this.collaboratorsList.push(...data);
        });
      });
    }
    if (this.seniorForm.runtimeConfig.strategyList) {
      this.checkList = this.seniorForm.runtimeConfig.strategyList.map(item => {
        const key = item.name.split('_')[0].toLowerCase();
        this.scaleMode[key] = item;
        return item.name;
      });
    }
  },
  methods: {
    getArtifactList(params, index) {
      getArtifactList(params).then(res => {
        const data = res.data || [];
        this.$set(this.artifactListMap, index, data);
      });
    },
    init() {
      // 获取 Cluster 下拉框数据
      this.getCluster();
      this.seniorForm.displayDependJars.forEach((item, index) => {
        if (item.artifactId) {
          this.artifactChange(item.artifactId, index, item);
        }
        if (this.region) {
          this.getArtifactList({ typeCode: 'JAR', region: this.region }, index);
        }
      });
      this.jarIndex = this.seniorForm.displayDependJars.length - 1;
      // 获取huawei aws
      getIam().then(res => {
        const data = res.data;
        if (data) {
          this.huaweiList = data.huawei;
          this.awsList = data.aws;
        }
      });
      getGroup().then(res => {
        // const data = res.data;
        // this.userGroupList = data;
        this.userGroupList = this.$store.getters['user/userGroupList'];
      });
    },
    getCluster() {
      if (this.isShowModel) {
        const params = {
          region: this.region
        };
        getClusterAuto(params).then(res => {
          const data = res.data;
          this.autoClusterList = data;
          if (this.seniorForm.runtimeConfig.isAutoScaleMode) {
            this.clusterList = this.autoClusterList;
            if (!this.seniorForm.flinkClusterId) {
              this.seniorForm.flinkClusterId = this.clusterList[0].id;
            }
          }
        });
        getClusterNotauto(params).then(res => {
          const data = res.data;
          this.notautoClusterList = data;
          if (!this.seniorForm.runtimeConfig.isAutoScaleMode) {
            this.clusterList = this.notautoClusterList;
            if (!this.seniorForm.flinkClusterId) {
              this.seniorForm.flinkClusterId = this.clusterList[0].id;
            }
          }
        });
      } else {
        const params = {
          region: this.region
        };
        getClusterList(params).then(res => {
          const data = res.data;
          this.clusterList = data;
          if (!this.seniorForm.flinkClusterId) {
            this.seniorForm.flinkClusterId = this.clusterList[0].id;
          }
        });
      }
    },
    changeModel(value) {
      this.seniorForm.flinkClusterId = '';
      if (value) {
        this.clusterList = this.autoClusterList;
      } else {
        this.clusterList = this.notautoClusterList;
      }
    },
    remoteMethod(query, list) {
      // if (query !== '') {
      //   this.loading = true;
      //   getUserList(query).then(res => {
      //     const data = res.data;
      //     this.loading = false;
      //     this[list] = data;
      //   });
      // } else {
      //   this[list] = [];
      // }
      this.loading = true;
      getUserList(query).then(res => {
        this.loading = false;
        const data = res.data;
        this[list] = data;
      });
    },
    addParam() {
      const length = this.seniorForm.runtimeConfig.params.length;
      if (length > 0 && !this.seniorForm.runtimeConfig.params[length - 1].key) {
        this.$message({
          type: 'error',
          message: '请先输入当前参数的key！'
        });
        return;
      } else {
        this.seniorForm.runtimeConfig.params.push({ key: '', value: '' });
      }
    },
    deleteParam(index) {
      this.seniorForm.runtimeConfig.params.splice(index, 1);
    },
    regionChange(val, index, item) {
      this.regionObj[index] = val;
      item.artifactId = null;
      item.id = null;
      // 获取Jar文件数据
      this.getArtifactList(
        {
          typeCode: 'JAR',
          region: this.region
        },
        index
      );
    },
    artifactChange(value, index, item) {
      getVersionList({
        artifactId: value,
        region: this.region
      }).then(res => {
        const data = res.data;
        this.$set(this.versionList, index, data);
      });
    },
    deleteUdf(index) {
      this.$delete(this.seniorForm.displayDependJars, index);
      this.$delete(this.artifactListMap, index);
      this.$delete(this.versionList, index);
      this.jarIndex--;
    },
    addUdf() {
      const length = this.seniorForm.displayDependJars.length;
      if (length > 0 && !this.seniorForm.displayDependJars[length - 1].id) {
        this.$message({
          type: 'error',
          message: '请先选择当前的Version！'
        });
        return;
      } else {
        const addItem = { artifactId: '', id: '' };
        this.jarIndex++;
        this.seniorForm.displayDependJars.push(addItem);
        this.regionChange(this.region, this.jarIndex, addItem);
      }
    },
    addPeriod(endTime) {
      this.scaleMode.periodic.periodicList.push({
        startTime: endTime + 1,
        endTime: 24,
        par: 1
      });
    },
    removePeriod() {
      this.scaleMode.periodic.periodicList.pop();
    },
    checkForm(form) {
      return new Promise((resolve, reject) => {
        this.$refs[form].validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    confirm() {
      const list = [this.checkForm('seniorForm')];
      if (this.checkList.length) {
        list.push(this.checkForm('scaleMode'));
      }
      Promise.all(list)
        .then(() => {
          this.seniorForm.runtimeConfig.strategyList = [];
          if (this.seniorForm.runtimeConfig.isAutoScaleMode && this.checkList.length > 0) {
            if (this.checkList.includes('OPERATOR_PROCESS_STRATEGY')) {
              this.seniorForm.runtimeConfig.strategyList.push(this.scaleMode.operator);
            }
            if (this.checkList.includes('KAFKA_LAG_STRATEGY')) {
              this.seniorForm.runtimeConfig.strategyList.push(this.scaleMode.kafka);
            }
            if (this.checkList.includes('PERIODIC_STRATEGY')) {
              const last = this.scaleMode.periodic.periodicList.at(-1);
              if (last.endTime !== 24) {
                this.$message.warning('周期性策略 时间区间结束时间必须为24');
                return;
              } else {
                this.seniorForm.runtimeConfig.strategyList.push(this.scaleMode.periodic);
              }
            }
          }
          this.$emit('close');
        })
        .catch(() => {
          this.$message.warning('高级设置中有必填项未填写哦～');
        });
      // this.$refs.seniorForm.validate(valid => {
      //   if (valid) {
      //     this.$emit('close');
      //   } else {
      //     this.$message.warning('高级设置中有必填项未填写哦～')
      //   }
      // });
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
.senior-input {
  width: 200px;
}
.other-param {
  position: relative;
  ::v-deep .el-popover__reference-wrapper {
    position: absolute;
    left: -88px;
  }
}
.active-checkbox {
  border-bottom: 2px solid #67c23a;
}
.alert-method-box {
  margin-right: 2px;
  padding: 0 8px;
  border: 1px solid #e4e7ed;
  padding-bottom: 20px;
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
  ::v-deep .el-form-item__label {
    font-weight: 400;
  }
}
.mode-box {
  div {
    margin: 5px 0;
  }
  li {
    margin-bottom: 5px;
    margin-left: 20px;
    list-style-type: disc;
  }
  span {
    color: #ff5656;
  }
}
.sqlapp-main-set-udf {
  margin-top: 10px;
  border-bottom: 1px solid #dadfeb;
}
.sql-form {
  ::v-deep .el-tabs__content {
    border: none !important;
  }
  ::v-deep .el-form-item--small.el-form-item {
    margin-bottom: 18px !important;
  }
}
</style>
