<template>
  <div>
    <el-form ref="ruleForm" class="step-three" :model="ruleForm" :rules="rules">
      <el-tabs>
        <el-tab-pane label="基本属性" class="base-form">
          <el-form-item label="任务名称" label-width="110px" prop="name" class="name-item">
            <el-popover :disabled="!nameDisabled" placement="bottom" trigger="hover" popper-class="tag-popper">
              <div v-if="!['Mysql2Hive', 'File2Lakehouse'].includes(ruleForm.templateCode)">只有下线任务才可以修改任务名称</div>
              <div v-else>{{ ruleForm.name }}</div>
              <el-input
                slot="reference"
                v-model="ruleForm.name"
                :placeholder="namePlaceholder"
                :disabled="nameDisabled"
                :maxlength="['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(ruleForm.templateCode) || ruleForm.isLakeHouseReal ? 45 : 60"
                @change="changeName"
                @keyup.native="nameKeyUp"
              ></el-input>
            </el-popover>
            <span class="name-tips">{{ nameTips }}</span>
          </el-form-item>
          <el-form-item label="保存至" label-width="110px" prop="folderName">
            <UseLazyTree module="TASK" :select-mode-obj="selectModeObj" @selectFolder="selectFolder" />
          </el-form-item>
          <el-form-item label="任务描述" label-width="110px">
            <el-input v-model="ruleForm.description" type="textarea"></el-input>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <div v-if="!ruleForm.isLakeHouseReal">
        <el-tabs v-if="isShowDispatch && source === 'task'">
          <el-tab-pane label="调度配置">
            <el-form-item label="调度方式" label-width="110px" prop="triggerParam.isIrregularSheduler">
              <!-- <el-select v-model="ruleForm.triggerParam.isIrregularSheduler" :disabled="isWorkflow" class="cron-input" placeholder="请选择调度方式" clearable @change="changeRegularSheduler">
                <el-option label="固定周期" :value="1"></el-option>
                <el-option label="手动调度" :value="2"></el-option>
              </el-select> -->
              <el-radio-group v-model="ruleForm.triggerParam.isIrregularSheduler" :disabled="isWorkflow" class="cron-input" @change="changeRegularSheduler">
                <el-radio :label="1">周期调度</el-radio>
                <el-radio :label="2">手动调度</el-radio>
              </el-radio-group>
              <span class="tip">说明：周期调度将按照调度周期例行调度，手动调度则是指从任务列表不定时的去手动触发执行</span>
            </el-form-item>
            <template v-if="ruleForm.triggerParam.isIrregularSheduler === 1">
              <el-form-item label="调度周期" label-width="110px" prop="triggerParam.outputGranularity">
                <el-select v-model="ruleForm.triggerParam.outputGranularity" :disabled="isWorkflow" class="cron-input" placeholder="请选择调度周期" @change="changeOutputGranularity">
                  <el-option v-for="item in cycleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <span class="tip">说明：表示该任务以怎样的频率执行</span>
              </el-form-item>
              <el-form-item v-if="ruleForm.triggerParam.outputGranularity === 'minutely'" label="时间间隔" label-width="110px" prop="triggerParam.crontabParam.interval">
                <el-select v-model="ruleForm.triggerParam.crontabParam.interval" class="cron-input" placeholder="请选择时间间隔" clearable @change="changeCron">
                  <el-option v-for="item in intervalList" :key="item" :label="'每' + item" :value="item"></el-option>
                </el-select>
                <span>分钟</span>
              </el-form-item>
              <el-form-item v-if="ruleForm.triggerParam.outputGranularity === 'hourly'" label="定时调度时间" label-width="110px" prop="triggerParam.crontabParam.fixedTime">
                <el-select v-model="ruleForm.triggerParam.crontabParam.fixedTime" class="cron-input" placeholder="请选择定时调度时间" clearable @change="changeCron">
                  <el-option v-for="item in minuteList" :key="item.value" :label="item.label" :value="item.label"></el-option>
                </el-select>
                <span>分</span>
              </el-form-item>
              <el-form-item v-if="isShowRange" key="range" label="指定天" label-width="110px" prop="triggerParam.crontabParam.range">
                <el-select v-model="ruleForm.triggerParam.crontabParam.range" class="cron-input" placeholder="请选择指定时间" multiple clearable filterable @change="changeCron">
                  <el-option v-for="item in rangeList" :key="item" :label="formatRangeLabel(item, ruleForm.triggerParam.outputGranularity)" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="isShowFixed" label="定时调度时间" label-width="110px" prop="triggerParam.crontabParam.fixedTime">
                <el-time-picker v-model="ruleForm.triggerParam.crontabParam.fixedTime" class="cron-input" placeholder="请选择定时调度时间" format="HH:mm" value-format="HH:mm" clearable @change="changeCron"></el-time-picker>
              </el-form-item>
              <template v-if="ruleForm.triggerParam.outputGranularity === 'hourly' || ruleForm.triggerParam.outputGranularity === 'minutely'">
                <el-form-item label="高级配置" label-width="110px">
                  <el-checkbox v-model="ruleForm.triggerParam.crontabParam.advancedSetting" @change="changeCron"></el-checkbox>
                </el-form-item>
                <template v-if="ruleForm.triggerParam.crontabParam.advancedSetting">
                  <template v-if="ruleForm.triggerParam.outputGranularity === 'minutely'">
                    <el-form-item label="开始时间" label-width="110px">
                      <el-time-picker v-model="ruleForm.triggerParam.crontabParam.startTime" class="cron-input" placeholder="请选择开始时间" :picker-options="startMinPicker" :default-value="startDefaultValue" format="HH:mm" value-format="HH:mm" clearable @change="changeCron"></el-time-picker>
                    </el-form-item>
                    <el-form-item label="结束时间" label-width="110px">
                      <el-time-picker v-model="ruleForm.triggerParam.crontabParam.endTime" class="cron-input" placeholder="请选择结束时间" :picker-options="endMinPicker" :default-value="endDefaultValue" format="HH:mm" value-format="HH:mm" clearable @change="changeCron"></el-time-picker>
                    </el-form-item>
                  </template>
                  <el-form-item v-if="ruleForm.triggerParam.outputGranularity === 'hourly'" label="" label-width="80px">
                    <el-radio-group v-model="isRange" class="hour-radio" @change="changeIsRange">
                      <el-radio :label="true">
                        <el-form-item key="range" label="指定小时" label-width="90px" :prop="isRange ? 'triggerParam.crontabParam.range' : ''">
                          <el-select v-model="ruleForm.triggerParam.crontabParam.range" class="cron-input" placeholder="请选择指定时间" :disabled="!isRange" multiple clearable filterable @change="changeCron">
                            <el-option v-for="item in rangeList" :key="item" :label="item + '时'" :value="item"></el-option>
                          </el-select>
                        </el-form-item>
                      </el-radio>
                      <br />
                      <el-radio :label="false">
                        <el-form-item key="interval" label="时间间隔" label-width="90px" :prop="isRange ? '' : 'triggerParam.crontabParam.interval'">
                          <el-select v-model="ruleForm.triggerParam.crontabParam.interval" class="cron-input" placeholder="请选择时间间隔" :disabled="isRange" clearable @change="changeCron">
                            <el-option v-for="item in intervalList" :key="item" :label="'每' + item" :value="item"></el-option>
                          </el-select>
                          <span>小时</span>
                        </el-form-item>
                        <el-form-item key="startTime" label="开始时间" label-width="90px">
                          <el-time-picker
                            v-model="ruleForm.triggerParam.crontabParam.startTime"
                            class="cron-input"
                            placeholder="请选择开始时间"
                            :picker-options="startPicker"
                            :default-value="startDefaultValue"
                            :disabled="isRange"
                            format="HH:mm"
                            value-format="HH:mm"
                            clearable
                            @change="changeCron"
                          ></el-time-picker>
                        </el-form-item>
                        <el-form-item key="endTime" label="结束时间" label-width="90px">
                          <el-time-picker
                            v-model="ruleForm.triggerParam.crontabParam.endTime"
                            class="cron-input"
                            placeholder="请选择结束时间"
                            :picker-options="endPicker"
                            :default-value="endDefaultValue"
                            :disabled="isRange"
                            format="HH:mm"
                            value-format="HH:mm"
                            clearable
                            @change="changeCron"
                          ></el-time-picker>
                        </el-form-item>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </template>
              </template>
              <el-form-item label="cron表达式" label-width="110px" style="margin-bottom: 0">
                <div>
                  {{ ruleForm.triggerParam.crontab }}
                  <el-button type="text" size="mini" class="cron-btn" :loading="btnLoad" @click="getUtc0">查看utc0转换时间</el-button>
                </div>
              </el-form-item>
              <el-button type="text" size="mini" :loading="btnLoad2" style="margin-left: 26px" @click="getTime">查看接下来7次执行时间</el-button>
            </template>
          </el-tab-pane>
        </el-tabs>
        <!-- 前置依赖模块ruleForm.inputDataset和ruleForm.eventDepends的数据 -->
        <el-tabs>
          <el-tab-pane label="前置依赖">
            <template slot="label">
              前置依赖
              <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                提示：如果设置了前置依赖，则只有当前置依赖就绪时，任务才会执行
                <i slot="reference" class="el-icon-info global-color-ca"></i>
              </el-popover>
              <i v-if="isShowDependRefresh" class="el-icon-refresh" style="margin-left: 4px" @click="$emit('dependReresh')"></i>
            </template>
            <el-form-item class="sync-num" label="检测超时时间" required>
              <el-input-number v-model="seniorForm.checkExpirationTime" :min="1"></el-input-number>
              小时
              <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                当触发例行调度时（可以是手动触发补数、重算，也可以是例行调度开始时），调度服务会持续检测上游是否成功，当超过该指定时间（默认24小时）后将停止检测，并且变为‘终止检查上游’状态。重新开始检测需要从实例页手动触发"重算"。
                <i slot="reference" class="el-icon-info global-color-ca"></i>
              </el-popover>
            </el-form-item>
            <el-form-item label="依赖类型" label-width="110px" prop="dependTypes">
              <el-checkbox-group v-model="ruleForm.dependTypes" :disabled="!isShowDispatch" @change="changeDepend">
                <el-checkbox v-show="isShowDispatch" label="event">
                  内部依赖
                  <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                    提示：当需要将本平台产出的任务/数据集作为前置依赖时，可选择此项；
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                </el-checkbox>
                <el-checkbox label="dataset">
                  外部依赖
                  <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                    提示：当需要将非本平台产出的数据集作为前置依赖时，可选择此项；
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <div v-if="ruleForm.dependTypes.includes('event')" class="depend-wrap">
              <div class="table-title">
                <h4 class="title">内部依赖设置</h4>
                <el-button type="primary" size="mini" @click="addEvent">+</el-button>
              </div>
              <el-table v-loading="eventLoading" class="table" :data="ruleForm.eventDepends" stripe>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column label="任务ID" prop="taskId" min-width="120" align="center">
                  <template slot-scope="scope">
                    <div>
                      {{ scope.row.taskId }}<span class="color-red">{{ scope.row.isDelete ? '(已删除)' : '' }}</span>
                    </div>
                  </template>
                </el-table-column>
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
                <el-table-column label="产出数据集" prop="metadataId" min-width="200" align="center">
                  <template slot-scope="scope">
                    <el-tooltip :content="scope.row.metadataId" :disabled="isTipDisabled">
                      <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.metadataId || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column label="偏移量" prop="dateCalculationParam" min-width="180" align="left" header-align="center">
                  <template #header>
                    偏移量
                    <i class="el-icon-info" style="cursor: pointer" @click="handelInfo('offset_num', '偏移量设置说明')"></i>
                  </template>
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" :style="scope.row.useDateCalcuParam ? 'position:relative;top:-4px;' : ''" @click="offsetConfig('eventDepends', scope.row, scope.$index)">设置</el-button>
                    <div slot="reference" class="popover-text">
                      <template v-if="scope.row.useDateCalcuParam">
                        <el-tooltip>
                          <span v-for="(value, key) in scope.row.dateCalculationParam" slot="content" :key="key">
                            {{ value.type === 'range' && value.range.length === 0 ? '' : dataMap[key] + ':' }} {{ value.type === 'offset' ? `偏移${value.unitOffset};` : value.range.length ? `指定${value.range.join(',')};` : '' }}
                          </span>
                          <div class="ellipsis">
                            <span v-for="(value, key) in scope.row.dateCalculationParam" :key="key">
                              {{ value.type === 'range' && value.range.length === 0 ? '' : dataMap[key] + ':' }} {{ value.type === 'offset' ? `偏移${value.unitOffset};` : value.range.length ? `指定${value.range.join(',')};` : '' }}
                            </span>
                          </div>
                        </el-tooltip>
                      </template>
                      <span v-else class="i-block">{{ scope.row.unitOffset }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" min-width="70" align="center">
                  <template slot-scope="scope">
                    <!-- <el-button v-if="isOfflineTemp" type="text" size="mini" @click="preview(scope.row, 'taskDepend')">预览</el-button> -->
                    <el-button type="text" size="mini" @click="delEvent(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-if="ruleForm.dependTypes.includes('dataset')" class="depend-wrap">
              <div class="table-title">
                <h4 class="title">外部依赖设置</h4>
                <el-button v-if="isShowInputBtn" type="primary" size="mini" @click="addData">+</el-button>
              </div>
              <el-table :key="inputDatasetKey" class="table" :data="ruleForm.inputDataset" stripe>
                <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                <template v-if="isJar">
                  <el-table-column label="数据集" min-width="180" align="center">
                    <div slot-scope="scope" class="table-cell">
                      <el-button type="text" class="btn-check" @click="switchClick(scope.row)">{{ scope.row.isMetadataSel ? '自定义数据集' : '筛选数据集' }}</el-button>
                      <el-form-item v-if="scope.row.isMetadataSel === false" :prop="'inputDataset.' + scope.$index + '.id'" :rules="[{ required: true, message: '请输入自定义数据集', trigger: 'change' }]">
                        <el-input v-model="scope.row.id" placeholder="请输入数据集" :title="scope.row.id" clearable @blur="handleBlur(scope.row.id, scope.row)"></el-input>
                      </el-form-item>
                      <el-form-item v-else :prop="'inputDataset.' + scope.$index + '.metadata.table'" :rules="[{ required: true, message: '请选择数据集', trigger: 'change' }]">
                        <el-cascader
                          :ref="'inputDataset' + scope.$index"
                          v-model="scope.row.completePath"
                          placeholder="请选择数据集"
                          :title="scope.row.metadata.table"
                          :show-all-levels="false"
                          :owner-list="metadataOptions"
                          :props="props"
                          filterable
                          clearable
                          @change="handleChange($event, scope.row)"
                        ></el-cascader>
                      </el-form-item>
                      <!-- <el-button v-if="ruleForm.templateCode === 'SPARKJAR' && (scope.row.completePath || scope.row.metadata.table)" class="btn-check" type="text" @click="check(scope.$index, scope.row)">依赖检查</el-button> -->
                    </div>
                  </el-table-column>
                </template>
                <template v-else>
                  <el-table-column v-if="isShowDb" label="数据库" min-width="150" align="center">
                    <template slot-scope="scope">
                      <el-form-item v-if="isInputEdit" :prop="'inputDataset.' + scope.$index + '.metadata.db'" :rules="[{ required: true, message: '请选择数据库', trigger: 'change' }]">
                        <el-tooltip :disabled="!scope.row.metadata.db" :content="scope.row.metadata.db">
                          <el-select
                            v-model="scope.row.metadata.db"
                            placeholder="请选择数据库"
                            filterable
                            :allow-create="['Hive2Hive', 'PythonShell', 'Hive2Redis', 'Hive2Redshift', 'Hive2File', 'TfJob', 'DataMigration'].includes(ruleForm.templateCode)"
                            default-first-option
                            clearable
                            @change="changeDb($event, scope.row)"
                          >
                            <el-option v-for="item in sourceDbList" :key="item.name" :value="item.name" :label="item.name">
                              <ellipsis-tooltip :text="item.name" />
                            </el-option>
                          </el-select>
                        </el-tooltip>
                      </el-form-item>
                      <el-tooltip v-else :content="scope.row.metadata.db" :disabled="isTipDisabled">
                        <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.metadata.db || '-' }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column label="表名称" min-width="180" align="center">
                    <div slot-scope="scope" class="table-cell">
                      <el-form-item v-if="isInputEdit" class="table-select" :prop="'inputDataset.' + scope.$index + '.metadata.table'" :rules="[{ required: true, message: '请选择表名称', trigger: 'change' }]">
                        <el-tooltip :disabled="!scope.row.metadata.table" :content="scope.row.metadata.table">
                          <el-select
                            v-model="scope.row.metadata.table"
                            placeholder="请选择表名称"
                            filterable
                            :allow-create="['Hive2Hive', 'PythonShell', 'Hive2Redis', 'Hive2Redshift', 'Hive2File', 'TfJob', 'DataMigration'].includes(ruleForm.templateCode)"
                            default-first-option
                            clearable
                            loading-text="加载中..."
                            no-data-text="加载中..."
                            @change="changeTable($event, scope.row, scope.$index, ruleForm.inputDataset)"
                          >
                            <el-option v-for="item in scope.row.sourceTableList" :key="item.name" :value="item.name" :label="item.name">
                              <ellipsis-tooltip :text="item.name" />
                            </el-option>
                          </el-select>
                        </el-tooltip>
                      </el-form-item>
                      <el-tooltip v-else :content="scope.row.metadata.table" :disabled="isTipDisabled">
                        <span class="ellipsis block" @mouseenter="isShowTooltip">{{ scope.row.metadata.table || '-' }}</span>
                      </el-tooltip>
                    </div>
                  </el-table-column>
                </template>
                <template v-if="!isShowDispatch">
                  <el-table-column label="数据类型" min-width="100" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.isExternal === 1 ? '外部数据' : '内部数据' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="数据周期" min-width="120" align="center">
                    <template slot-scope="scope">
                      <el-form-item :prop="'inputDataset.' + scope.$index + '.granularity'" :rules="[{ required: true, message: '请选择数据粒度', trigger: 'change' }]">
                        <el-select v-if="isShowInputCheck" v-model="scope.row.granularity" placeholder="请选择数据粒度" clearable @change="changeGranularity($event, scope.row)">
                          <el-option v-for="item in scope.row.granularityList" :key="item" :value="item" :label="item"></el-option>
                        </el-select>
                        <el-select v-else v-model="scope.row.granularity" placeholder="请选择数据粒度" clearable @change="changeGranularity($event, scope.row)">
                          <el-option v-for="item in granularityList" :key="item.id" :value="item.englishName" :label="item.englishName"></el-option>
                        </el-select>
                        <Crontab ref="crontab" v-model="scope.row.ready_time" :time-unit="scope.row.granularity" :unit-disabled="true" style="display: none" />
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="偏移量" min-width="165" align="center">
                    <template #header>
                      偏移量
                      <el-tooltip popper-class="custom-tip" effect="light" content="任务依赖多少个粒度之前的数据。负表示之前，正数表示之后" placement="bottom">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </template>
                    <template slot-scope="scope">
                      <el-popover placement="bottom" width="371" trigger="click" :tabindex="scope.$index" @show="showPoppver(scope.row)">
                        <div>
                          <el-radio-group v-model="isSingleOffset">
                            <el-radio :label="true">单一偏移</el-radio>
                            <el-radio :label="false">连续偏移</el-radio>
                          </el-radio-group>
                          <div style="margin-top: 15px">
                            <span>偏移量：</span>
                            <el-input-number v-if="isSingleOffset" v-model="singleOffset" size="mini" label="描述文字"></el-input-number>
                            <template v-else>
                              <el-input-number v-model="minRangeValue" size="mini" controls-position="right" :min="-168" :max="maxRangeValue"></el-input-number> ~
                              <el-input-number v-model="maxRangeValue" size="mini" controls-position="right" :min="minRangeValue" :max="168"></el-input-number>
                            </template>
                          </div>
                        </div>
                        <div class="popover-footer">
                          <el-button size="mini" @click="closePopover">取消</el-button>
                          <el-button type="primary" size="mini" @click="savePopover(scope.row)">确定</el-button>
                        </div>
                        <div slot="reference" class="popover-text">
                          <div v-if="scope.row.useDateCalcuParam">
                            <span v-for="(value, key) in scope.row.dateCalculationParam" :key="key"> {{ dataMap[key] }}: {{ value.type === 'offset' ? `偏移${value.unitOffset}` : `指定${value.range.join(',')}` }}; </span>
                          </div>
                          <span v-else class="i-block">{{ scope.row.unitOffset }}</span>
                        </div>
                      </el-popover>
                      <el-button size="mini" type="text" @click="seniorConfig('inputDataset', scope.row, scope.$index)">高级配置</el-button>
                    </template>
                  </el-table-column>
                </template>
                <!--  v-if="!isShowInputCheck" -->
                <el-table-column v-if="!isShowInputCheck" label="完成时间" min-width="120" align="center">
                  <template #header>
                    完成时间
                    <el-tooltip popper-class="custom-tip" effect="light" content="当该数据的生产任务不在本平台，每个周期该完成时间默认该粒度的数据准备就绪" placement="bottom">
                      <i class="el-icon-question"></i>
                    </el-tooltip>
                  </template>
                  <template slot-scope="scope">
                    <Crontab ref="crontab" v-model="scope.row.ready_time" :time-unit="scope.row.granularity" :unit-disabled="true" input-class="crontab-class" />
                  </template>
                </el-table-column>
                <el-table-column v-if="isShowInputCheck" label="设置依赖就绪条件" min-width="180" align="center">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" style="position: relative; top: -4px" @click="set(scope.$index, scope.row)">设置</el-button>
                    <el-tooltip :disabled="!scope.row.check_path" :content="scope.row.check_path" placement="bottom">
                      <!-- <div class="td-border ellipsis">{{ scope.row.check_path || scope.row.ready_time }}</div> -->
                      <div v-if="scope.row.check_path" class="td-border ellipsis">{{ scope.row.check_path }}</div>
                      <div v-else-if="scope.row.success_time" class="td-border ellipsis">{{ scope.row.success_time }} <span v-if="scope.row.success_time.indexOf(':') === -1">分</span></div>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column v-if="isShowInputBtn || isShowInputCheck" label="操作" min-width="100" align="center">
                  <template slot-scope="scope">
                    <!-- <el-button v-if="isShowInputCheck" type="text" size="mini" :disabled="scope.row.isExternal === 0 && scope.row.granularity === scope.row.granularityList[0]" :loading="btnLoading" @click="set(scope.$index, scope.row)">详细设置</el-button> -->
                    <!-- <el-button v-if="isOfflineTemp" type="text" size="mini" @click="preview(scope.row, 'dataDepend')">预览</el-button> -->
                    <el-button v-if="isShowInputBtn" type="text" size="mini" @click="delData(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- 生成数据集信息 -->
        <el-tabs v-if="isDataSet2">
          <el-tab-pane label="生成数据集信息">
            <template slot="label">
              生成数据集信息
              <span class="tips" @click="handelInfo('data_info', '生成数据集信息说明')">说明</span>
              <i v-if="isShowDependRefresh" class="el-icon-refresh" style="margin-left: 4px" @click="$emit('dependReresh')"></i>
            </template>
            <el-table :key="outputDatasetKey" class="table" :data="ruleForm.outputDataset" stripe>
              <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
              <template>
                <el-table-column label="库名称" min-width="120" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.metadata.db || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="表名称" min-width="200" align="center">
                  <div slot-scope="scope" class="table-cell">
                    <div>{{ scope.row.metadata.table }}</div>
                  </div>
                </el-table-column>
              </template>
            </el-table>
            <div v-if="ruleForm.templateCode !== 'Mysql2Hive'">
              <GeneratePathFrom ref="GeneratePathFrom" :name="ruleForm.name" :rule-form="ruleForm.outputDataset[0]"></GeneratePathFrom>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-tabs v-if="isDataSet1 && ruleForm.templateCode !== 'Mysql2Hive'">
          <el-tab-pane label="生成标志">
            <GeneratePathFrom ref="GeneratePathFrom" class="GeneratePathFrom" :name="ruleForm.name" :rule-form="ruleForm.outputDataset[0]"></GeneratePathFrom>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 任务归属成本录入 -->
      <!-- <el-tabs>
        <el-tab-pane label="任务归属成本录入">
          <div class="align-r mb10">
            <el-button type="primary" size="mini" @click="addCost">添加成本部门</el-button>
          </div>
          <el-table class="table" :data="ruleForm.cost" stripe>
            <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
            <el-table-column label="成本归属部门" min-width="120" align="center">
              <template slot-scope="scope">
                <el-form-item :prop="'cost.' + scope.$index + '.key'" :rules="[{ required: true, message: '请选择成本归属部门', trigger: ['change', 'blur'] }]">
                  <el-select v-model="scope.row.key" placeholder="请选择成本归属部门" filterable clearable @change="changeCost">
                    <el-option v-for="item in costList" :key="item.id" :value="item.id" :label="item.organizationName" :disabled="item.disabled"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="成本归属占比" min-width="120" align="center">
              <template slot-scope="scope">
                <el-form-item :prop="'cost.' + scope.$index + '.value'" :rules="[{ required: true, message: '请输入成本归属占比', trigger: 'change' }]"> <el-input-number v-model="scope.row.value" label="描述文字" :min="0" :max="100" style="width: 110px"></el-input-number>% </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="delCost(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs> -->
      <el-form
        v-if="
          ['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File', 'File2Lakehouse'].includes(ruleForm.templateCode) || (ruleForm.templateCode === 'Mysql2Hive' && !ruleForm.isLakeHouseReal)
        "
        ref="seniorFormDom"
        key="seniorForm"
        class="step-three"
        :model="seniorForm"
      >
        <el-tabs>
          <el-tab-pane label="告警策略">
            <el-form-item label="告警类型" class="other-param">
              <span v-if="ruleForm.triggerParam.isIrregularSheduler === 1 && ruleForm.triggerParam.outputGranularity !== 'minutely' && source !== 'workflow'" class="check-text">
                <el-checkbox v-model="seniorForm.regularAlert.isChecked" style="margin-right: 3px" @change="checkChange(seniorForm.regularAlert.isChecked, 'timer')"></el-checkbox>
                <span class="tab" :class="{ activeText: alertTypeValue === 'timer' }" @click="checkAlertType('timer')">
                  定时告警
                  <el-popover trigger="hover" placement="top" popper-class="tag-popper">
                    提示：在任务的每个调度周期内，当在指定的“检查时间”下“触发条件”被满足，将通过指定的“告警渠道”发送一条通知信息到任务owner（如果勾选了协作人，则同时发送）；反之，则不发送通知信息；
                    <i slot="reference" class="el-icon-info global-color-ca"></i>
                  </el-popover>
                </span>
              </span>
              <span class="check-text">
                <el-checkbox v-model="seniorForm.alertModel['success'].isChecked" style="margin-right: 3px" @change="checkChange(seniorForm.alertModel['success'].isChecked, 'success')"></el-checkbox>
                <span class="tab" :class="{ activeText: alertTypeValue === 'success' }" @click="checkAlertType('success')">任务成功时</span>
              </span>
              <span class="check-text">
                <el-checkbox v-model="seniorForm.alertModel['failure'].isChecked" style="margin-right: 3px" @change="checkChange(seniorForm.alertModel['failure'].isChecked, 'failure')"></el-checkbox>
                <span class="tab" :class="{ activeText: alertTypeValue === 'failure' }" @click="checkAlertType('failure')">任务失败时</span>
              </span>
              <span class="check-text">
                <el-checkbox v-model="seniorForm.alertModel['retry'].isChecked" style="margin-right: 3px" @change="checkChange(seniorForm.alertModel['retry'].isChecked, 'retry')"></el-checkbox>
                <span class="tab" :class="{ activeText: alertTypeValue === 'retry' }" @click="checkAlertType('retry')">任务重试时</span>
              </span>
              <span class="check-text">
                <el-checkbox v-model="seniorForm.alertModel['start'].isChecked" style="margin-right: 3px" @change="checkChange(seniorForm.alertModel['start'].isChecked, 'start')"></el-checkbox>
                <span class="tab" :class="{ activeText: alertTypeValue === 'start' }" @click="checkAlertType('start')">任务开始时</span>
              </span>
            </el-form-item>
            <div v-if="showAlartModel" class="alert-method-box" :class="{ noReg: !isAlertReg }">
              <el-form-item v-if="alertList.length" label="告警渠道" label-width="110px" size="mini" :required="true">
                <el-checkbox-group v-model="seniorForm.alertModel[alertTypeValue].alertType" @change="checkTypeChange">
                  <el-checkbox v-for="(item, k) in alertList" :key="k" :label="item.value" style="margin-right: 10px !important">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <div v-if="seniorForm.alertModel[alertTypeValue].alertType.length">
                <div v-if="seniorForm.alertModel[alertTypeValue].alertType.includes('email')" class="alert-method-box">
                  <el-form-item
                    label="邮件接收人："
                    label-width="130px"
                    size="mini"
                    :prop="`alertModel.${alertTypeValue}.emailReceivers`"
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
                      key="select1"
                      v-model="seniorForm.alertModel[alertTypeValue].emailReceivers"
                      placeholder="请选择邮件接收人"
                      size="small"
                      clearable
                      filterable
                      remote
                      multiple
                      reserve-keyword
                      value-key="shareId"
                      :remote-method="remoteMethod"
                      :loading="ownerLoading"
                      class="search-input"
                      popper-class="custom-popper"
                      style="min-width: 300px"
                      @change="alertWayChange"
                    >
                      <el-option v-for="item in ownerList" :key="item.email + Math.random()" :value="item" :label="item.email">
                        <div style="max-width: 420px; word-break: break-all">{{ item.email }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div v-if="seniorForm.alertModel[alertTypeValue].alertType.includes('wechat')" class="alert-method-box">
                  <el-form-item
                    label="告警机器人："
                    label-width="130px"
                    size="mini"
                    :prop="`alertModel.${alertTypeValue}.wechatRobotKey`"
                    style="margin-top: 20px"
                    :rules="[
                      {
                        required: true,
                        message: '请填写告警机器人',
                        trigger: ['blur', 'change']
                      }
                    ]"
                  >
                    <el-select key="select2" v-model="seniorForm.alertModel[alertTypeValue].wechatRobotKey" placeholder="请选择Token" size="small" clearable filterable class="search-input" popper-class="custom-popper" style="min-width: 300px" @change="alertWayChange">
                      <el-option v-for="item in tokenList" :key="item.id + Math.random()" :value="item.token" :label="item.name"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="此群需要@："
                    label-width="130px"
                    size="mini"
                    :prop="`alertModel.${alertTypeValue}.wechatReceivers`"
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
                      key="select3"
                      v-model="seniorForm.alertModel[alertTypeValue].wechatReceivers"
                      placeholder="请选择@对象"
                      size="small"
                      clearable
                      filterable
                      remote
                      multiple
                      reserve-keyword
                      value-key="shareId"
                      :remote-method="remoteMethod"
                      :loading="ownerLoading"
                      class="search-input"
                      popper-class="custom-popper"
                      style="min-width: 300px"
                      @change="alertWayChange"
                    >
                      <el-option v-for="item in ownerList" :key="item.shareId + Math.random()" :value="item" :label="item.shareId">
                        <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </div>
            <div v-if="showRegularAlert" class="alert-method-box" :class="{ noReg: !isAlertReg }">
              <el-form-item label="检查时间" label-width="110px">
                <div class="check-time-box">
                  <el-select v-model="checkTime" placeholder="请选择">
                    <el-option v-for="item in checkTimeArr" :key="item" :label="item" :value="item"> </el-option>
                  </el-select>
                  <div class="check-time-group">
                    <span v-if="checkTime === '本周期后'"> 第<el-input-number v-model="seniorForm.regularAlert.offset" controls-position="right" :min="1" :max="10"></el-input-number>个周期 </span>
                    <span v-if="ruleForm.triggerParam.outputGranularity === 'weekly'" key="weekly">
                      <el-select v-model="timeGroup.week" style="width: 100px">
                        <el-option v-for="item in weekList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </span>
                    <span v-if="ruleForm.triggerParam.outputGranularity === 'monthly'" key="monthly">
                      <el-select v-model="timeGroup.date" style="width: 100px">
                        <el-option v-for="item in dayList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                      号
                    </span>
                    <span v-if="['monthly', 'weekly', 'daily'].includes(ruleForm.triggerParam.outputGranularity)" key="daily">
                      <el-select v-model="timeGroup.hour" style="width: 100px">
                        <el-option v-for="item in hourList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                      时
                    </span>
                    <span v-if="['monthly', 'weekly', 'daily', 'hourly'].includes(ruleForm.triggerParam.outputGranularity)" key="hourly">
                      <el-select v-model="timeGroup.minute" style="width: 100px">
                        <el-option v-for="item in minuteList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                      分
                    </span>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="触发条件" label-width="110px">
                <el-select v-model="seniorForm.regularAlert.triggerCondition" placeholder="请选择">
                  <el-option v-for="item in triggerConditionArr" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="alertList.length"
                label="告警渠道"
                label-width="110px"
                size="mini"
                :rules="[
                  {
                    required: true,
                    message: '请选择告警渠道',
                    trigger: ['blur', 'change']
                  }
                ]"
              >
                <el-checkbox-group v-model="seniorForm.regularAlert.alertType" @change="checkTypeChange">
                  <el-checkbox v-for="(item, k) in alertList" :key="k" :label="item.value" style="margin-right: 10px !important">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <div v-if="seniorForm.regularAlert.alertType.length">
                <div v-if="seniorForm.regularAlert.alertType.includes('email')" class="alert-method-box">
                  <el-form-item
                    label="邮件接收人："
                    label-width="130px"
                    size="mini"
                    :prop="'regularAlert.emailReceivers'"
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
                      key="select4"
                      v-model="seniorForm.regularAlert.emailReceivers"
                      placeholder="请选择邮件接收人"
                      size="small"
                      clearable
                      filterable
                      remote
                      reserve-keyword
                      multiple
                      value-key="shareId"
                      :remote-method="remoteMethod"
                      :loading="ownerLoading"
                      class="search-input"
                      popper-class="custom-popper"
                      style="min-width: 300px"
                      @change="alertWayChange"
                    >
                      <el-option v-for="item in ownerList" :key="item.email + Math.random()" :value="item" :label="item.email">
                        <div style="max-width: 420px; word-break: break-all">{{ item.email }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div v-if="seniorForm.regularAlert.alertType.includes('wechat')" class="alert-method-box">
                  <el-form-item
                    label="告警机器人："
                    label-width="130px"
                    size="mini"
                    prop="regularAlert.wechatRobotKey"
                    style="margin-top: 20px"
                    :rules="[
                      {
                        required: true,
                        message: '请填写告警机器人',
                        trigger: ['blur', 'change']
                      }
                    ]"
                  >
                    <el-select key="select5" v-model="seniorForm.regularAlert.wechatRobotKey" placeholder="请选择Token" size="small" clearable filterable class="search-input" popper-class="custom-popper" style="min-width: 300px" @change="alertWayChange">
                      <el-option v-for="item in tokenList" :key="item.id + Math.random()" :value="item.token" :label="item.name"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="此群需要@："
                    label-width="130px"
                    size="mini"
                    :prop="'regularAlert.wechatReceivers'"
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
                      key="select6"
                      v-model="seniorForm.regularAlert.wechatReceivers"
                      placeholder="请选择@对象"
                      size="small"
                      clearable
                      filterable
                      remote
                      multiple
                      reserve-keyword
                      value-key="shareId"
                      :remote-method="remoteMethod"
                      :loading="ownerLoading"
                      class="search-input"
                      popper-class="custom-popper"
                      style="min-width: 300px"
                      @change="alertWayChange"
                    >
                      <el-option v-for="item in ownerList" :key="item.shareId + Math.random()" :value="item" :label="item.shareId">
                        <div style="max-width: 420px; word-break: break-all">({{ item.staffId }})-{{ item.name }}{{ item.deptFullPath ? '-' + item.deptFullPath : '' }}</div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </div>
            <div v-if="!isAlertReg" class="tip-text">{{ tipType }}的告警渠道未填写必填项</div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <check-path ref="checkPath" @save="savePath"></check-path>
      <detail-set ref="detailSet" @save="saveSet"></detail-set>
      <!-- <add-event ref="addEvent" @save="saveEvent"></add-event> -->
      <add-inside ref="addInside" @save="saveInside"></add-inside>
      <senior-config ref="seniorConfig" @save="saveConfig"></senior-config>
      <offset-config ref="offsetConfig" @save="saveOffset"></offset-config>
      <preview-dialog ref="previewDialog"></preview-dialog>

      <el-info v-model="infoObj.type" :title="infoObj.title">
        <div v-if="infoObj.msgType === 'data_info'" class="create_data">
          <div class="title1">生成数据集主要有以下几个作用：</div>
          ①当下游任务需要依赖当前任务时，下游任务可以通过生成数据集信息来添加'前置依赖'；<br />
          ②为当前任务指定一个产出的标志-success文件路径，当下游任务需要依赖当前任务时，只需要去依赖当前任务对应的_success文件路径即可；
        </div>
        <div v-else-if="infoObj.msgType === 'offset_num'" class="offset_num">
          <offset-tips></offset-tips>
        </div>
      </el-info>
    </el-form>
  </div>
</template>
<script>
import Crontab from '@/components/Crontab';
import DetailSet from './DetailSet';
import CheckPath from './CheckPath';
import GeneratePathFrom from './GeneratePathFrom';
// import AddEvent from './AddEvent';
import AddInside from './AddInside';
import SeniorConfig from './SeniorConfig';
import PreviewDialog from './PreviewDialog';
import OffsetTips from './OffsetTips';
import OffsetConfig from './OffsetConfig';
import EllipsisTooltip from '@/components/EllipsisTooltip';
import { getTokenList } from '@/api/system.js';
import { getGranularityList, getDataSetList, getDatasetInfo, getCostList, getCrontab, getUserList, getCronTime, getTokenSelect } from '@/api/task';
import { getLabelUrl, getFolderTree } from '@/api/useLazyTree';
import { mapGetters } from 'vuex';
import UseLazyTree from '@/components/useLazyTree';
export default {
  name: 'StepThree',
  components: {
    Crontab,
    CheckPath,
    DetailSet,
    // AddEvent,
    AddInside,
    SeniorConfig,
    PreviewDialog,
    OffsetTips,
    OffsetConfig,
    EllipsisTooltip,
    GeneratePathFrom,
    UseLazyTree
  },
  /**
   * id: 用来判断编辑时 名称是否可以修改（流式任务名称可以修改，离线任务名称不可以修改），默认空
   * isEdit: 用来判断是否编辑时进入
   * isShowDispatch：是否显示调度配置（流式任务不显示，离线任务显示），默认为true
   * isJar: 用来判断是否是Jar模板，Jar模板选择数据集用的是级联选择器，默认false
   * isShowInputBtn: 用来判断是否显示 添加依赖 按钮（Flink SQL, Flink Jar，Hive2Hive，Spark Jar显示，其余模板不显示），默认false
   * isShowOutputBtn: 用来判断是否显示 添加生成数据集 按钮（Flink SQL, Flink Jar，Spark Jar显示，其余模板不显示），默认false
   * isInputEdit: 用来判断 前置依赖 是否可以编辑（Flink SQL, Flink Jar，Spark，Hive2Hive可编辑，其余模板不可编辑），默认false
   * isOutputEdit: 用来判断 生成数据集信息 是否可以编辑（Flink SQL, Flink Jar，Spark，Hive2Hive，Hive2ClickHouse，Hive2MySQL可编辑，其余模板不可编辑），默认false
   * isShowDb: 用来判断 前置依赖 是否显示db列，（Metis2Hive没有db），默认true
   * isShowSource: 用来判断 生成数据集信息 是否有数据源（Hive2ClickHouse，Hive2MySQL有数据源 ），默认false
   * isShowOffset: 用来判断 生成数据集信息 是否显示 偏移周期（所有离线任务都是显示，所有流式任务都不显示），默认true
   * isShowInputCheck: 用来判断 前置依赖 是否显示 详细设置 按钮（所有离线任务都显示，所有流式任务都不显示），默认false
   * isShowOutputCheck: 用来判断 生成数据集信息 是否显示 生成依赖 按钮（Hive2Hive，Spark Jar显示，其余模板不显示），默认false 新增mysql2hive也显示
   * region: 由上一步带过来的region（Hive2Hive，Spark 用到），默认空
   * isWorkflow: 是否被工作流引入，如果是，调度周期不能编辑
   */
  props: {
    isChangeTable: { type: Boolean, default: false },
    nameDisabled: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
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
    isWorkflow: { type: Boolean, default: false },
    isShowDependRefresh: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    ruleForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    seniorForm: {
      type: Object,
      default: () => ({})
    },
    cost: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let validatePass;
    if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(this.ruleForm.templateCode) || this.ruleForm.isLakeHouseReal) {
      validatePass = (rule, value, callback) => {
        const reg = /^[a-zA-Z]([-a-zA-Z0-9]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)*$/;
        if (!reg.test(value) || value.length > 120) {
          callback(new Error('名字只能包含a-z,A-Z,0-9或-；开始需为字符，最多45个字符'));
        } else {
          callback();
        }
      };
    } else {
      validatePass = (rule, value, callback) => {
        const reg = /^[a-zA-Z0-9][-_a-zA-Z0-9]*$/;
        if (!reg.test(value) || value.length > 120) {
          callback(new Error('名字只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符'));
        } else {
          callback();
        }
      };
    }
    const validatorFolder = (rule, value, callback) => {
      if (!value) {
        callback(new Error('去选择文件夹'));
      } else {
        callback();
      }
    };
    return {
      infoObj: {
        type: false,
        msgType: '',
        title: ''
      },
      selectModeObj: {
        isSelectMode: true,
        selectName: ''
      },
      ownerList: [],
      tokenList: [],
      ownerLoading: false,
      isDataSet1: false,
      isDataSet2: false,
      isExecuteMode: false,
      validate: validatePass,
      nameTips: '',
      initNameLimit: true,
      isRange: false,
      isTipDisabled: false,
      cascaderProps: {},
      outputGranularityList: ['hourly', 'daily', 'weekly', 'monthly'],
      alertList: [],
      dataMap: {
        minute: '分钟',
        hour: '小时',
        day: '日',
        week: '周',
        month: '月',
        year: '年'
      },
      cycleList: [
        { label: '分钟', value: 'minutely' },
        { label: '小时', value: 'hourly' },
        { label: '天', value: 'daily' },
        { label: '周', value: 'weekly' },
        { label: '月', value: 'monthly' }
      ],
      granularityList: [],
      sourceDbList: [],
      targetDbList: [],
      metadataOptions: [
        {
          value: 'ue1',
          label: 'AWS 美东',
          disabled: this.region && this.region !== 'ue1',
          children: [
            // { value: 'kafka', label: 'kafka' },
            { value: 'mysql', label: 'MySql' },
            // { value: 'es', label: 'ES' },
            { value: 'hive', label: 'Hive' },
            { value: 'metis', label: 'Metis' },
            { value: 'clickhouse', label: 'ClickHouse' }
            // { value: 'sharestore', label: 'ShareStore' },
            // { value: 'cassandra', label: 'Cassandra' }
          ]
        },
        {
          value: 'sg1',
          label: 'AWS 新加坡',
          disabled: this.region && this.region !== 'sg1',
          children: [
            // { value: 'kafka', label: 'kafka' },
            { value: 'mysql', label: 'MySql' },
            { value: 'hive', label: 'Hive' },
            { value: 'metis', label: 'Metis' },
            { value: 'clickhouse', label: 'ClickHouse' }
          ]
        },
        {
          value: 'sg2',
          label: '华为 新加坡',
          disabled: this.region && this.region !== 'sg2',
          children: [
            // { value: 'kafka', label: 'kafka' },
            { value: 'mysql', label: 'MySql' },
            { value: 'hive', label: 'Hive' },
            { value: 'metis', label: 'Metis' },
            { value: 'clickhouse', label: 'ClickHouse' }
          ]
        }
      ],
      props: {
        lazy: true,
        lazyLoad: this.getDataSetData
      },
      inputDatasetKey: 0,
      outputDatasetKey: 0,
      costList: [],
      btnLoading: true,
      btnLoad: false,
      btnLoad2: false,
      isSingleOffset: true,
      singleOffset: 0,
      minRangeValue: -1,
      maxRangeValue: 1,
      eventLoading: false,
      source: 'task',
      alertTypeValue: '',
      showAlartModel: false,
      showRegularAlert: false,
      isAlertReg: true,
      weekList: [
        { label: '星期一', value: 1 },
        { label: '星期二', value: 2 },
        { label: '星期三', value: 3 },
        { label: '星期四', value: 4 },
        { label: '星期五', value: 5 },
        { label: '星期六', value: 6 },
        { label: '星期日', value: 7 }
      ],
      tipType: '',
      dayList: [],
      hourList: [],
      minuteList: [],
      checkTimeArr: ['本周期', '本周期后'],
      checkTime: '本周期',
      triggerConditionArr: [
        {
          label: '任务未开始',
          value: 'notStart'
        },
        {
          label: '任务未成功',
          value: 'notSuccess'
        }
      ],
      timeGroup: {
        date: 1,
        week: 1,
        hour: 0,
        minute: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: ['blur', 'change'] },
          { validator: this.ruleForm.templateCode === 'Mysql2Hive' ? '' : validatePass, trigger: ['blur', 'change'] }
        ],
        folderName: [{ required: true, message: '请选择文件夹', trigger: ['blur', 'change'] }, { validator: validatorFolder }],
        triggerParam: {
          outputGranularity: [{ required: true, message: '请选择数据产出粒度', trigger: ['blur', 'change'] }],
          crontabParam: {
            cycle: [{ required: true, message: '请选择调度周期', trigger: ['blur', 'change'] }],
            range: [{ required: true, message: '请选择指定时间', trigger: ['blur', 'change'] }],
            startTime: [{ required: true, message: '请选择开始时间', trigger: ['blur', 'change'] }],
            interval: [{ required: true, message: '请选择时间间隔', trigger: ['blur', 'change'] }],
            endTime: [{ required: true, message: '请选择结束时间', trigger: ['blur', 'change'] }],
            fixedTime: [{ required: true, message: '请选择定时调度时间', trigger: ['blur', 'change'] }]
          }
        }
      },
      startDefaultValue: null,
      endDefaultValue: null
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    namePlaceholder() {
      let text = '名字只能包含a-z,A-Z,0-9或-或_；开始结尾需为字符，最多60个字符';
      if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive'].includes(this.ruleForm.templateCode)) {
        text = '名字只能包含a-z,A-Z,0-9或-；开始结尾需为字符，最多60个字符';
      }
      return text;
    },
    isOfflineTemp() {
      if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive'].includes(this.ruleForm.templateCode)) {
        return false;
      } else {
        return true;
      }
    },
    intervalList() {
      let list = [];
      // const cycle = this.ruleForm.triggerParam.crontabParam.cycle;
      const cycle = this.ruleForm.triggerParam.outputGranularity;
      if (cycle === 'minutely') {
        list = [5, 10, 15, 20, 30];
      } else if (cycle === 'hourly') {
        list = Array.from({ length: 12 }, (v, k) => k + 1);
      }
      return list;
    },
    rangeList() {
      let list = [];
      // const cycle = this.ruleForm.triggerParam.crontabParam.cycle;
      const cycle = this.ruleForm.triggerParam.outputGranularity;
      if (cycle === 'hourly') {
        list = Array.from({ length: 24 }, (v, k) => k);
      } else if (cycle === 'weekly') {
        list = Array.from({ length: 7 }, (v, k) => k + 1);
      } else if (cycle === 'monthly') {
        list = Array.from({ length: 31 }, (v, k) => k + 1);
        list.push('L');
      }
      return list;
    },
    isShowTime() {
      // const cycle = this.ruleForm.triggerParam.crontabParam.cycle;
      const cycle = this.ruleForm.triggerParam.outputGranularity;
      if (cycle === 'minutely' || (cycle === 'hourly' && !this.isRange)) {
        return true;
      } else {
        return false;
      }
    },
    isShowRange() {
      // const cycle = this.ruleForm.triggerParam.crontabParam.cycle;
      const cycle = this.ruleForm.triggerParam.outputGranularity;
      if (['weekly', 'monthly'].includes(cycle)) {
        return true;
      } else {
        return false;
      }
    },
    isShowFixed() {
      // if (['daily', 'weekly', 'monthly'].includes(this.ruleForm.triggerParam.crontabParam.cycle)) {
      if (['daily', 'weekly', 'monthly'].includes(this.ruleForm.triggerParam.outputGranularity)) {
        return true;
      } else {
        return false;
      }
    },
    depGra() {
      let gra = '';
      if (this.ruleForm.triggerParam.type === 'data') {
        gra = this.ruleForm.triggerParam.outputGranularity;
      } else if (this.ruleForm.triggerParam.type === 'cron') {
        // gra = this.ruleForm.triggerParam.crontabParam.cycle ;
        gra = this.ruleForm.triggerParam.outputGranularity;
      }
      return gra;
    },
    startMinPicker() {
      const endTime = this.ruleForm.triggerParam.crontabParam.endTime || '23:59';
      return { selectableRange: `00:00:00-${endTime}:00` };
    },
    endMinPicker() {
      const startTime = this.ruleForm.triggerParam.crontabParam.startTime || '00:00';
      return { selectableRange: `${startTime}:00-23:59:00` };
    },
    startPicker() {
      const endTime = this.ruleForm.triggerParam.crontabParam.endTime;
      let end = 23;
      if (endTime) {
        end = Number(endTime.split(':')[0]);
      }
      const timeRange = [];
      for (let i = 0; i < end + 1; i++) {
        const num = i < 10 ? '0' + i : i;
        timeRange.push(`${num}:00:00-${num}:00:00`);
      }
      return { selectableRange: timeRange };
    },
    endPicker() {
      const startTime = this.ruleForm.triggerParam.crontabParam.startTime;
      let start = 0;
      if (startTime) {
        start = Number(startTime.split(':')[0]);
      }
      const timeRange = [];
      for (let i = start; i < 24; i++) {
        const num = i < 10 ? '0' + i : i;
        timeRange.push(`${num}:59:00-${num}:59:00`);
      }
      return { selectableRange: timeRange };
    }
  },
  async created() {
    // if (!this.seniorForm.alertModel.failure.alertType.length) {
    //   // 新建时默认选中
    //   this.seniorForm.alertModel.failure.alertType = [this.alertList[0].value];
    // }
    // 初始化显示文件夹
    this.ruleForm.folderName = '';
    if (!this.ruleForm.folderId) {
      const reqData = await getFolderTree({ module: 'TASK', id: 0 });
      this.ruleForm.folderId = reqData.data.entityList[0].id;
    }
    getLabelUrl({ id: this.ruleForm.folderId }).then(res => {
      const list = res.data.pfolderList;
      list.forEach((item, index) => {
        if (index !== list.length - 1) {
          this.ruleForm.folderName += item.name + '/';
        } else {
          this.ruleForm.folderName += item.name;
        }
      });
      this.$set(this.selectModeObj, 'selectName', this.ruleForm.folderName);
    });

    if (this.ruleForm.oldAlertList?.length && !this.$route.query.copyId) {
      this.alertList = this.ruleForm.oldAlertList;
    } else {
      const systemAlertList = this.$store.getters['user/systemConf'].config && JSON.parse(this.$store.getters['user/systemConf'].config)?.channel_info;
      if (systemAlertList && systemAlertList.length) {
        systemAlertList.map(item => {
          switch (Object.keys(item)[0]) {
            case 'enterprise_wechat':
              this.alertList.push({ label: '企业微信', value: 'wechat' });
              break;
            case 'email':
              this.alertList.push({ label: '邮件', value: 'email' });
              break;
          }
        });
        this.ruleForm.oldAlertList = this.alertList;
      } else {
        this.alertList = [];
      }
    }
    this.startDefaultValue = new Date();
    this.startDefaultValue.setHours(0);
    this.startDefaultValue.setMinutes(0);
    this.endDefaultValue = new Date();
    this.endDefaultValue.setHours(23);
    this.endDefaultValue.setMinutes(59);
    // 生成数据集表单只取最后一条数据
    if (this.ruleForm.outputDataset.length) {
      this.ruleForm.outputDataset = [this.ruleForm.outputDataset[this.ruleForm.outputDataset.length - 1]];
    }
    const nowDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    for (let i = 1; i < Number(nowDays) + 1; i++) {
      this.dayList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
    for (let i = 0; i < 24; i++) {
      this.hourList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
    for (let i = 0; i < 60; i++) {
      this.minuteList.push({ label: i < 10 ? '0' + i : i, value: i });
    }
    // 判断是否是工作流的任务
    this.source = this.$parent.source;
    const workflowTask = this.$parent.data;
    const hasInputDataset = this.ruleForm.inputDataset.length && this.ruleForm.inputDataset[0].metadata.table;
    // 如果在工作流里创建任务，依赖类型去掉默认选中的外部依赖
    if (this.source === 'workflow' && Object.keys(workflowTask).length === 0 && !hasInputDataset) {
      this.ruleForm.dependTypes = this.ruleForm.dependTypes.filter(item => item !== 'dataset');
    }
    if (this.region) {
      this.ruleForm.inputDataset.forEach(item => {
        item.metadata.region = this.region;
      });
    }
    // 生成数据集
    if (
      (this.ruleForm.templateCode === 'DataMigration' && this.seniorForm.isTable) ||
      this.ruleForm.templateCode === 'Mysql2Hive' ||
      (this.ruleForm.templateCode === 'Hive2Hive' && this.ruleForm.outputDataset[0].metadata && this.ruleForm.outputDataset[0].metadata.db) ||
      this.ruleForm.templateCode === 'File2Lakehouse'
    ) {
      this.isDataSet2 = true;
      this.ruleForm.isDataSet2 = true;
      this.ruleForm.outputDataset[0].check = !!this.ruleForm.outputDataset[0].location;
    }
    // 初始化生成标志
    if (
      ['Hive2Mysql', 'Hive2Clickhouse', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'Hive2File', 'SPARKJAR', 'PythonShell'].includes(this.ruleForm.templateCode) ||
      (this.ruleForm.templateCode === 'DataMigration' && this.seniorForm.isTable === false) ||
      (this.ruleForm.templateCode === 'Hive2Hive' && (!this.ruleForm.outputDataset[0].metadata || !this.ruleForm.outputDataset[0].metadata.db))
    ) {
      this.isDataSet1 = true;
      if (this.ruleForm.outputDataset[0] && this.ruleForm.outputDataset[0].location) {
        this.ruleForm.outputDataset[0].check = true;
      } else {
        this.$set(this.ruleForm, 'outputDataset', [
          {
            fileName: '',
            check: false,
            location: ''
          }
        ]);
      }
    }
    // if (['Mysql2Hive', 'PythonShell', 'Hive2Doris'].includes(this.ruleForm.templateCode)) {
    //   this.isExecuteMode = true;
    // }
    // 新增高级配置字段 ruleForm.triggerParam.crontabParam.advancedSetting，历史数据兼容
    if (this.ruleForm.triggerParam.crontabParam.advancedSetting === undefined) {
      this.$set(this.ruleForm.triggerParam.crontabParam, 'advancedSetting', this.ruleForm.triggerParam.type === 'cron');
    }
    if (!this.ruleForm.triggerParam.crontabParam.startTime) this.$set(this.ruleForm.triggerParam.crontabParam, 'startTime', '');
    if (!this.ruleForm.triggerParam.crontabParam.endTime) this.$set(this.ruleForm.triggerParam.crontabParam, 'endTime', '');
    if (!this.ruleForm.triggerParam.crontabParam.fixedTime) {
      const startTime = this.ruleForm.triggerParam.crontabParam.startTime;
      const defaultValue = startTime ? startTime.split(':')[1] : '00';
      this.$set(this.ruleForm.triggerParam.crontabParam, 'fixedTime', this.ruleForm.triggerParam.outputGranularity === 'hourly' ? defaultValue : '00:00');
    }
    if (this.ruleForm.triggerParam.type === 'data') {
      this.$set(this.ruleForm.triggerParam.crontabParam, 'range', [1]);
      this.changeCron();
      this.ruleForm.triggerParam.type = 'cron';
    }
    if (this.ruleForm.triggerParam.crontabParam.range && this.ruleForm.triggerParam.crontabParam.range.length) {
      this.isRange = true;
    } else {
      this.isRange = false;
    }
    this.init();
  },
  async mounted() {
    if (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.ruleForm.templateCode) || (this.ruleForm.templateCode === 'Mysql2Hive' && !this.ruleForm.isLakeHouseReal)) {
      // 兼容旧数据
      this.autoCheck();
      // 回显定时告警时间选项
      if (this.seniorForm.regularAlert.checkTime) {
        const dateList1 = this.seniorForm.regularAlert.checkTime.split(' ');
        if (dateList1.length === 2) {
          if (this.seniorForm.regularAlert.graularity === 'monthly') {
            this.timeGroup.date = Number(dateList1[0]);
          } else {
            this.timeGroup.week = Number(dateList1[0]);
          }
          this.timeGroup.hour = Number(dateList1[1].split(':')[0]);
          this.timeGroup.minute = Number(dateList1[1].split(':')[1]);
        } else {
          const dateList2 = dateList1[0].split(':');
          if (dateList2.length === 2) {
            this.timeGroup.hour = Number(dateList2[0]);
            this.timeGroup.minute = Number(dateList2[1]);
          } else {
            this.timeGroup.minute = Number(dateList2[0]);
          }
        }
      }
      // 回显时设置周期
      this.seniorForm.regularAlert.graularity = this.ruleForm.triggerParam.outputGranularity;
      // 回显时显示默认展开的报警框
      this.expandTab();
    }
    if (this.isJar || this.ruleForm.isLakeHouseMore) {
      if (this.ruleForm.inputDataset.length) {
        this.ruleForm.inputDataset.forEach((item, index) => {
          this.$nextTick(() => {
            if (this.$refs['inputDataset' + index]) {
              this.$refs['inputDataset' + index].inputValue = item.metadata.table;
            }
          });
        });
      }
    }
    if (['Hive2Hive', 'PythonShell', 'Hive2Redis', 'Hive2Redshift', 'Hive2File', 'TfJob', 'DataMigration'].includes(this.ruleForm.templateCode)) {
      await this.getDbList(); // 获取数据依赖的数据库名称下拉列表
      this.ruleForm.inputDataset.forEach(item => {
        if (item.metadata && item.metadata.db) {
          this.changeDb(item.metadata.db, item); // 获取数据依赖的表名称的下拉列表数据
        }
      });
      this.ruleForm.outputDataset.forEach(item => {
        if (item.metadata && item.metadata.db) {
          this.changeDb(item.metadata.db, item);
        }
      });
    } else if (this.isShowSource) {
      if (!['Hive2Mysql', 'Hive2Doris', 'Hive2Clickhouse'].includes(this.ruleForm.templateCode)) {
        this.getSourceList();
      }
    }
    if (this.isShowInputCheck) {
      this.ruleForm.inputDataset.forEach(item => {
        // if (item.metadata.table) {
        // this.getDatasetInfoList(item); // 获取数据依赖的数据类型、数据周期等信息
        // }
      });
    }
    if (!this.ruleForm.triggerParam.crontab) {
      this.changeCron();
    }
    if (this.ruleForm.triggerParam.crontabParam.range && this.ruleForm.triggerParam.crontabParam.range.length) {
      this.isRange = true;
    }
  },
  beforeDestroy() {
    // 跳转第四步预览时，处理数据
    if (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.ruleForm.templateCode) || (this.ruleForm.templateCode === 'Mysql2Hive' && !this.ruleForm.isLakeHouseReal)) {
      switch (this.ruleForm.triggerParam.outputGranularity) {
        case 'monthly':
          this.seniorForm.regularAlert.checkTime = `${this.timeGroup.date} ${this.timeGroup.hour}:${this.timeGroup.minute}`;
          break;
        case 'weekly':
          this.seniorForm.regularAlert.checkTime = `${this.timeGroup.week} ${this.timeGroup.hour}:${this.timeGroup.minute}`;
          break;
        case 'daily':
          this.seniorForm.regularAlert.checkTime = `${this.timeGroup.hour}:${this.timeGroup.minute}`;
          break;
        case 'hourly':
          this.seniorForm.regularAlert.checkTime = `${this.timeGroup.minute}`;
          break;
      }
    }
  },
  methods: {
    init() {
      this.remoteMethod();
      this.getTokenSelect();
      // 获取数据粒度下拉框数据
      getGranularityList({
        componentCode: 'UPDATE_FREQUENCY'
      }).then(res => {
        const data = res.data;
        this.granularityList = data;
      });
      // 获取成本归属部门
      getCostList(this.userInfo.id).then(res => {
        this.costList = res.data;
        // if (!this.ruleForm.cost[0].key) {
        //   this.ruleForm.cost[0].key = res.data[0].id;
        // }
        // if (this.ruleForm.cost.length === 1 && this.ruleForm.cost[0].key === '') {
        //   this.costList.forEach(item => {
        //     if (item.isDefault) {
        //       this.ruleForm.cost[0].key = item.costName;
        //     }
        //   });
        // }
        this.changeCost();
      });
    },
    selectFolder(val) {
      this.ruleForm.folderName = val.selectName;
      this.ruleForm.folderId = val.id;
    },
    remoteMethod(query) {
      // if (query !== '') {
      //   this.ownerLoading = true;
      //   getUserList(query).then(res => {
      //     this.ownerLoading = false;
      //     const data = res.data;
      //     this.ownerList = data;
      //   });
      // } else {
      //   this.ownerList = [];
      // }
      this.ownerLoading = true;
      if (!query) {
        query = '';
      }
      getUserList(query).then(res => {
        this.ownerLoading = false;
        const data = res.data;
        this.ownerList = data;
        // 设置默认选中@对象
        let atItem = {};
        this.ownerList.forEach(item => {
          if (item.shareId === this.seniorForm.owner) {
            atItem = item;
          }
        });
        if (!this.seniorForm.regularAlert.wechatReceivers || !this.seniorForm.regularAlert.wechatReceivers.length) {
          this.seniorForm.regularAlert.wechatReceivers = [atItem];
        }
        if (!this.seniorForm.regularAlert.emailReceivers || !this.seniorForm.regularAlert.emailReceivers.length) {
          this.seniorForm.regularAlert.emailReceivers = [atItem];
        }
        Object.keys(this.seniorForm.alertModel).forEach(item => {
          if (!this.seniorForm.alertModel[item].wechatReceivers || !this.seniorForm.alertModel[item].wechatReceivers.length) {
            this.seniorForm.alertModel[item].wechatReceivers = [atItem];
          }
          if (!this.seniorForm.alertModel[item].emailReceivers || !this.seniorForm.alertModel[item].emailReceivers.length) {
            this.seniorForm.alertModel[item].emailReceivers = [atItem];
          }
        });
      });
    },
    getTokenSelect() {
      getTokenList({ userGroupId: this.$store.getters['user/currentUserGroup'].id }).then(res => {
        this.tokenList = res.data;
      });
    },
    expandTab() {
      if (this.seniorForm.regularAlert.isChecked) {
        this.checkAlertType('timer');
      } else {
        Object.keys(this.seniorForm.alertModel).some(item => {
          if (this.seniorForm.alertModel[item].isChecked) {
            this.checkAlertType(item);
            return true;
          }
        });
      }
    },
    checkChange(val, type) {
      if (!this.alertList.length) {
        return;
      }
      // 告警类型选择
      if (type === 'timer') {
        if (val) {
          this.seniorForm.regularAlert.alertType = [this.alertList[0].value];
        } else {
          this.seniorForm.regularAlert.alertType = [];
        }
      } else {
        if (val) {
          this.seniorForm.alertModel[type].alertType = [this.alertList[0].value];
        } else {
          this.seniorForm.alertModel[type].alertType = [];
        }
      }
      this.$nextTick(() => {
        this.$refs.seniorFormDom.clearValidate(); // 防止输入框出现时直接校验
      });
      this.checkAlertType(type);
      if (!this.isAlertReg) {
        this.validateType();
      }
    },
    checkTypeChange() {
      // 告警渠道选择
      if (this.seniorForm.regularAlert.alertType.length === 0) {
        this.seniorForm.regularAlert.isChecked = false;
      }
      Object.keys(this.seniorForm.alertModel).forEach(item => {
        if (this.seniorForm.alertModel[item].alertType.length === 0) {
          this.seniorForm.alertModel[item].isChecked = false;
        }
      });
      this.$nextTick(() => {
        this.$refs.seniorFormDom.clearValidate(); // 防止输入框出现时直接校验
      });
      this.autoCheck();
      if (!this.isAlertReg) {
        this.validateType();
      }
    },
    // 选择了告警渠道，自动钩上告警类型
    autoCheck() {
      if (this.seniorForm.regularAlert.alertType.length > 0) {
        this.seniorForm.regularAlert.isChecked = true;
      }
      if (this.seniorForm.alertModel.success.alertType.length > 0) {
        this.seniorForm.alertModel.success.isChecked = true;
      }
      if (this.seniorForm.alertModel.failure.alertType.length > 0) {
        this.seniorForm.alertModel.failure.isChecked = true;
      }
      if (this.seniorForm.alertModel.retry.alertType.length > 0) {
        this.seniorForm.alertModel.retry.isChecked = true;
      }
      if (this.seniorForm.alertModel.start.alertType.length > 0) {
        this.seniorForm.alertModel.start.isChecked = true;
      }
      this.$forceUpdate();
    },
    // 校验告警类型
    validateAlert() {
      this.tipType = '';
      let alertModelFlag = true;
      if (this.seniorForm.regularAlert.isChecked) {
        if (!this.seniorForm.regularAlert.alertType.length) {
          alertModelFlag = false;
          this.tipType += "'定时告警'、";
        }
      }
      Object.keys(this.seniorForm.alertModel).forEach(item => {
        if (this.seniorForm.alertModel[item].isChecked && this.seniorForm.alertModel[item].alertType.length === 0) {
          alertModelFlag = false;
          if (item === 'success') {
            this.tipType += "'任务成功时'、";
          }
          if (item === 'failure') {
            this.tipType += "'任务失败时'、";
          }
          if (item === 'retry') {
            this.tipType += "'任务重试时'、";
          }
          if (item === 'start') {
            this.tipType += "'任务开始时'、";
          }
        }
      });
      this.tipType = this.tipType.slice(0, this.tipType.length - 1);
      this.isAlertReg = alertModelFlag;
      return alertModelFlag;
    },
    alertWayChange() {
      this.$forceUpdate();
      if (!this.isAlertReg) {
        this.validateType();
      }
    },
    // 校验告警渠道
    validateType() {
      this.tipType = '';
      let alertModelFlag = true;
      if (this.seniorForm.regularAlert.isChecked) {
        if (
          (this.seniorForm.regularAlert.alertType.includes('email') && (!this.seniorForm.regularAlert.emailReceivers || !this.seniorForm.regularAlert.emailReceivers.length)) ||
          (this.seniorForm.regularAlert.alertType.includes('wechat') && (!this.seniorForm.regularAlert.wechatReceivers || !this.seniorForm.regularAlert.wechatReceivers.length || !this.seniorForm.regularAlert.wechatRobotKey))
        ) {
          alertModelFlag = false;
          this.tipType += "'定时告警'、";
        }
      }
      Object.keys(this.seniorForm.alertModel).forEach(item => {
        if (
          (this.seniorForm.alertModel[item].alertType.includes('email') && (!this.seniorForm.alertModel[item].emailReceivers || !this.seniorForm.alertModel[item].emailReceivers.length)) ||
          (this.seniorForm.alertModel[item].alertType.includes('wechat') && (!this.seniorForm.alertModel[item].wechatReceivers || !this.seniorForm.alertModel[item].wechatReceivers.length || !this.seniorForm.alertModel[item].wechatRobotKey))
        ) {
          alertModelFlag = false;
          if (item === 'success') {
            this.tipType += "'任务成功时'、";
          }
          if (item === 'failure') {
            this.tipType += "'任务失败时'、";
          }
          if (item === 'retry') {
            this.tipType += "'任务重试时'、";
          }
          if (item === 'start') {
            this.tipType += "'任务开始时'、";
          }
        }
      });
      this.tipType = this.tipType.slice(0, this.tipType.length - 1);
      this.isAlertReg = alertModelFlag;
      return alertModelFlag;
    },
    changeRegularSheduler(value) {
      if (
        (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.ruleForm.templateCode) || (this.ruleForm.templateCode === 'Mysql2Hive' && !this.ruleForm.isLakeHouseReal)) &&
        value === 2
      ) {
        this.seniorForm.regularAlert.isChecked = false;
      }
    },
    checkAlertType(type) {
      this.alertTypeValue = type;
      if (type === 'timer') {
        this.showAlartModel = false;
        this.showRegularAlert = true;
      } else {
        this.showAlartModel = true;
        this.showRegularAlert = false;
      }
    },
    handelInfo(msgType, title) {
      this.infoObj.type = true;
      this.infoObj.title = title;
      this.infoObj.msgType = msgType;
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
    formatRangeLabel(value, granularty) {
      let label = value;
      if (granularty === 'weekly') {
        switch (value) {
          case 1:
            label = '星期一';
            break;
          case 2:
            label = '星期二';
            break;
          case 3:
            label = '星期三';
            break;
          case 4:
            label = '星期四';
            break;
          case 5:
            label = '星期五';
            break;
          case 6:
            label = '星期六';
            break;
          case 7:
            label = '星期日';
            break;
        }
      } else if (granularty === 'monthly') {
        if (value === 'L') {
          label = '每月最后1天';
        } else {
          label = '每月' + value + '号';
        }
      }
      return label;
    },
    formatGranularty(value) {
      const obj = this.cycleList.find(item => item.value === value);
      if (obj) {
        return obj.label;
      } else {
        return '-';
      }
    },
    getDataSetData(node, resolve) {
      const { level } = node;
      const children = node.children;
      node.children = [];
      if (level === 1) {
        // 第一级
        resolve(children);
      } else if (level === 2) {
        // 第二级
        const parentValue = node.parent.value;
        const params = {
          region: parentValue,
          type: node.value
        };
        if (node.value === 'hive' || node.value === 'mysql' || node.value === 'metis' || node.value === 'clickhouse') {
          params.metaFlag = 'AIRBYTE';
          params.templateCode = this.ruleForm.templateCode;
        }
        getDataSetList(params).then(res => {
          const data = res.data;
          let nodes = [];
          if (data) {
            nodes = data.data.map(item => ({
              label: node.value === 'metis' ? item.qualifiedName : item.name,
              value: node.value === 'metis' ? item : node.value === 'mysql' || node.value === 'clickhouse' ? item.actorId : item.name,
              leaf: node.value === 'metis'
            }));
          }
          resolve(nodes);
        });
      } else if (level === 3) {
        const pValue = node.parent.value;
        const gPValue = node.parent.parent.value;
        if (pValue === 'mysql' || pValue === 'clickhouse') {
          const params = {
            region: gPValue,
            type: pValue,
            actorId: node.value,
            metaFlag: 'AIRBYTE',
            templateCode: this.ruleForm.templateCode
          };
          getDataSetList(params).then(res => {
            const data = res.data;
            let nodes = [];
            if (data) {
              nodes = data.data.map(item => ({
                label: item.name,
                value: item.name
              }));
            }
            resolve(nodes);
          });
        } else {
          let name = 'db';
          if (pValue === 'kafka') {
            name = 'datasource';
          }
          const params = {
            region: gPValue,
            type: pValue,
            [name]: node.value
          };
          if (pValue === 'hive' || pValue === 'mysql' || pValue.value === 'metis' || pValue.value === 'clickhouse') {
            params.metaFlag = 'AIRBYTE';
            params.templateCode = this.ruleForm.templateCode;
          }
          getDataSetList(params).then(res => {
            const data = res.data;
            let nodes = [];
            if (data) {
              nodes = data.data.map(item => ({
                label: item.name,
                value: item,
                leaf: true
              }));
            }
            resolve(nodes);
          });
        }
      } else if (level === 4) {
        const pValue = node.parent.value;
        const gPValue = node.parent.parent.value;
        const ggPValue = node.parent.parent.parent.value;
        const name = 'db';
        let source = 'datasource';
        if (gPValue === 'mysql' || gPValue === 'clickhouse') {
          source = 'actorId';
        }
        const params = {
          region: ggPValue,
          type: gPValue,
          [source]: pValue,
          [name]: node.value
        };
        if (gPValue === 'hive' || gPValue === 'mysql' || gPValue === 'metis' || gPValue === 'clickhouse') {
          params.metaFlag = 'AIRBYTE';
          params.templateCode = this.ruleForm.templateCode;
        }
        getDataSetList(params).then(res => {
          const data = res.data;
          let nodes = [];
          if (data) {
            nodes = data.data.map(item => ({
              label: item.name,
              value: item,
              leaf: true
            }));
          }
          resolve(nodes);
        });
      }
    },
    async getDbList() {
      const { data } = await getDataSetList({
        region: this.region,
        type: 'hive',
        metaFlag: 'AIRBYTE',
        templateCode: this.ruleForm.templateCode
      });
      if (data && data.data) {
        this.sourceDbList = data.data;
        this.targetDbList = data.data;
      }
    },
    changeDepend(value) {
      if (!value.includes('event')) {
        this.ruleForm.eventDepends = [];
      }
    },
    nameKeyUp(value) {
      if (['StreamingSQL', 'StreamingJAR', 'MysqlCDC2Hive', 'Metis2Hive', 'Db2Hive'].includes(this.ruleForm.templateCode) || this.ruleForm.isLakeHouseReal) {
        if (!this.initNameLimit) {
          this.nameTips = '最多只能输入45个字符';
        }
        if (this.ruleForm.name.length === 45) {
          this.initNameLimit = false;
        } else {
          this.initNameLimit = true;
          this.nameTips = '';
        }
      } else {
        if (!this.initNameLimit) {
          this.nameTips = '最多只能输入60个字符';
        }
        if (this.ruleForm.name.length === 60) {
          this.initNameLimit = false;
        } else {
          this.initNameLimit = true;
          this.nameTips = '';
        }
      }
    },
    changeName(value) {
      const templateCode = this.ruleForm.templateCode;
      if (['Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'PythonShell', 'Hive2Redis', 'Hive2Redshift'].includes(templateCode) && this.ruleForm.outputDataset[0].metadata && !this.ruleForm.outputDataset[0].metadata.table) {
        this.ruleForm.outputDataset[0].metadata.table = value;
      }
      if (this.isChangeTable && templateCode === 'DataMigration') {
        this.ruleForm.outputDataset[0].metadata.table = value;
      }
    },
    showPoppver(row) {
      if (!row.useDateCalcuParam) {
        const unitOffset = row.unitOffset.toString();
        if (unitOffset.indexOf('~') > -1) {
          const arr = unitOffset.split('~');
          this.minRangeValue = Number(arr[0]);
          this.maxRangeValue = Number(arr[1]);
          this.isSingleOffset = false;
        } else {
          this.singleOffset = Number(row.unitOffset);
          this.isSingleOffset = true;
        }
      }
    },
    savePopover(row) {
      if (this.isSingleOffset) {
        this.$set(row, 'unitOffset', this.singleOffset);
      } else {
        this.$set(row, 'unitOffset', `${this.minRangeValue}~${this.maxRangeValue}`);
      }
      this.$set(row, 'useDateCalcuParam', false);
      this.closePopover();
    },
    closePopover() {
      document.body.click();
    },
    seniorConfig(key, row, index) {
      this.$refs.seniorConfig.showWin(key, row, index);
    },
    saveConfig(key, data, index) {
      this.$set(this.ruleForm[key][index], 'dateCalculationParam', data);
      this.$set(this.ruleForm[key][index], 'useDateCalcuParam', true);
    },
    offsetConfig(key, row, index) {
      const params = {
        taskGra: this.ruleForm.triggerParam.outputGranularity
      };
      params.taskCrontab = this.ruleForm.triggerParam.crontab;
      params.key = 'taskDepend';
      params.taskDepend = row;
      this.$refs.offsetConfig.showWin(key, row, this.ruleForm.triggerParam.outputGranularity, params, index);
    },
    saveOffset(key, data, index) {
      this.$set(this.ruleForm[key][index], data.key, data.value);
      this.$set(this.ruleForm[key][index], 'useDateCalcuParam', data.useDateCalcuParam);
    },
    changeDb(value, row) {
      if (['Hive2Hive', 'PythonShell', 'Hive2Redis', 'Hive2Redshift', 'Hive2File', 'TfJob', 'DataMigration'].includes(this.ruleForm.templateCode)) {
        const obj = this.sourceDbList.find(item => item.name === value);
        if (obj) {
          this.$set(row, 'sourceTableList', []);
          getDataSetList({
            region: this.region,
            type: 'hive',
            db: value,
            metaFlag: 'AIRBYTE',
            templateCode: this.ruleForm.templateCode
          }).then(res => {
            const data = res.data;
            if (data && data.data) {
              // row.sourceTableList = data.data;
              this.$set(row, 'sourceTableList', data.data);
            }
          });
        } else {
          this.$set(row, 'sourceTableList', []);
        }
      }
    },
    changeTable(value, row, index, dataSet) {
      let flag = true;
      if (dataSet.length > 1) {
        dataSet.forEach((item, ind) => {
          if (index !== ind && item.metadata.table === value && item.metadata.db === row.metadata.db) {
            this.$message.error('库表名称不能重复');
            row.metadata.table = '';
            flag = false;
            return;
          }
        });
      }
      if (flag) {
        if (row.sourceTableList === undefined) {
          row.sourceTableList = [];
        }
        const selectedObj = row.sourceTableList.find(item => item.name === value);
        if (selectedObj) {
          row.id = selectedObj.qualifiedName;
          row.guid = selectedObj.guid;
        } else {
          row.id = ``;
          row.guid = '';
        }
        if (row.tableGuid) {
          delete row.tableGuid;
        }
        if (this.isShowInputCheck) {
          // this.getDatasetInfoList(row, 'changeTable');
        }
      }
    },
    getDatasetInfoList(row, text) {
      this.btnLoading = true;
      const obj = {
        // type: row.metadata.type,
        // region: row.metadata.region,
        // source: row.metadata.source,
        // db: row.metadata.db,
        // tbl: row.metadata.table,
        taskName: this.ruleForm.name
      };
      if (!row.isMetadataSel) {
        obj.qualifyname = row.id;
      }
      getDatasetInfo(obj).then(res => {
        const data = res.data;
        row.isExternal = data.isExternal;
        if (data.isExternal === 0) {
          this.$set(row, 'granularityList', [data.granularity]);
          row.granularity = data.granularity;
        } else {
          this.$set(row, 'granularityList', data.allowDependGran);
          if (text && !data.allowDependGran.includes(row.granularity)) {
            row.granularity = data.allowDependGran[0];
          }
        }
        this.$set(row, 'checkPathList', data.checkPath);
        this.btnLoading = false;
      });
    },
    handleChange(arr, row) {
      const value = arr.slice(-1)[0];
      const region = arr[0];
      const type = arr[1];
      let source = '';
      let db = '';
      if (type === 'mysql' || type === 'clickhouse' || type === 'kafka') {
        source = arr[2];
        db = arr[3];
      } else if (type === 'hive') {
        db = arr[2];
      }
      const table = type === 'metis' ? value.qualifiedName : value.name;
      row.id = value.qualifiedName;
      row.guid = value.guid;
      row.metadata = {
        region,
        type,
        source,
        db,
        table
      };
      if (this.isShowInputCheck) {
        // this.getDatasetInfoList(row);
      }
    },
    switchClick(row) {
      row.isMetadataSel = !row.isMetadataSel;
      row.metadata.table = '';
      row.completePath = '';
    },
    handleBlur(value, row) {
      row.id = value;
      row.guid = '';
      row.metadata.type = 'hive';
      row.metadata.source = '';
      row.metadata.db = '';
      row.metadata.table = '';
      if (this.isShowInputCheck) {
        // this.getDatasetInfoList(row, 'changeTable');
      }
    },
    preview(row, name) {
      if (name === 'dataDepend') {
        if ((!row.metadata.db || !row.metadata.table) && !row.id) {
          this.$message.warning('请先选择库表');
          return;
        }
      }
      if (name === 'taskDepend') {
        if (!row.taskId || !row.dependId) {
          this.$message.warning('请先选择查询对应ID');
          return;
        }
      }
      const params = {
        taskGra: this.ruleForm.triggerParam.outputGranularity
      };
      params.taskCrontab = this.ruleForm.triggerParam.crontab;
      params[name] = row;
      this.$refs.previewDialog.showWin(params);
    },
    check(index, row) {
      let tableGuid = row.guid || row.tableGuid;
      if (!tableGuid && row.sourceTableList) {
        const selectedObj = row.sourceTableList.find(item => item.name === row.metadata.table);
        tableGuid = selectedObj ? selectedObj.guid : '';
      }
      this.$refs.checkPath.showWin({
        guid: tableGuid,
        index: index,
        location: row.location,
        partitions: row.partitions,
        fileName: row.fileName,
        check_path: row.check_path
      });
    },
    set(index, row) {
      // if (!this.btnLoading) {
      //   const params = {
      //     taskGra: this.ruleForm.triggerParam.outputGranularity
      //   };
      //   if (this.seniorChecked) {
      //     params.taskCrontab = this.ruleForm.triggerParam.crontab;
      //   }
      //   params.key = 'dataDepend';
      //   params.dataDepend = row;
      //   this.$refs.detailSet.showWin(index, row, this.ruleForm.triggerParam.outputGranularity, params);
      // }
      const params = {
        taskGra: this.ruleForm.triggerParam.outputGranularity
      };
      params.taskCrontab = this.ruleForm.triggerParam.crontab;
      params.key = 'dataDepend';
      params.dataDepend = row;
      this.$refs.detailSet.showWin(index, row, this.ruleForm.triggerParam.outputGranularity, params);
    },
    saveSet(data) {
      if (data.isExternal === 1) {
        // 外部数据
        if (data.checkType === 1) {
          this.ruleForm.inputDataset[data.index].check_path = data.check_path;
          this.ruleForm.inputDataset[data.index].detailed_gra = data.detailed_gra;
          this.ruleForm.inputDataset[data.index].detailed_dependency = data.detailed_dependency;
          delete this.ruleForm.inputDataset[data.index].ready_time;
          delete this.ruleForm.inputDataset[data.index].success_time;
          this.ruleForm.inputDataset[data.index].unitOffset = data.unitOffset;
          this.ruleForm.inputDataset[data.index].useDateCalcuParam = data.useDateCalcuParam;
          this.ruleForm.inputDataset[data.index].dateCalculationParam = data.dateCalculationParam;
          this.ruleForm.inputDataset[data.index].granularity = data.granularity;
        } else if (data.checkType === 2) {
          this.ruleForm.inputDataset[data.index].ready_time = data.ready_time;
          this.$set(this.ruleForm.inputDataset[data.index], 'success_time', data.success_time);
          delete this.ruleForm.inputDataset[data.index].check_path;
          delete this.ruleForm.inputDataset[data.index].detailed_gra;
          delete this.ruleForm.inputDataset[data.index].detailed_dependency;
          this.ruleForm.inputDataset[data.index].unitOffset = 0;
          this.ruleForm.inputDataset[data.index].useDateCalcuParam = false;
          this.ruleForm.inputDataset[data.index].dateCalculationParam = {};
          this.ruleForm.inputDataset[data.index].granularity = data.granularity;
        } else {
          delete this.ruleForm.inputDataset[data.index].check_path;
          delete this.ruleForm.inputDataset[data.index].detailed_gra;
          delete this.ruleForm.inputDataset[data.index].detailed_dependency;
          delete this.ruleForm.inputDataset[data.index].ready_time;
          delete this.ruleForm.inputDataset[data.index].success_time;
        }
      } else {
        // 内部数据
        this.ruleForm.inputDataset[data.index].detailed_gra = data.detailed_gra;
        this.ruleForm.inputDataset[data.index].detailed_dependency = data.detailed_dependency;
        delete this.ruleForm.inputDataset[data.index].check_path;
        delete this.ruleForm.inputDataset[data.index].ready_time;
        delete this.ruleForm.inputDataset[data.index].success_time;
      }
      this.inputDatasetKey++;
    },
    savePath(data) {
      if (data.check) {
        this.ruleForm.inputDataset[data.index].location = data.location;
        this.ruleForm.inputDataset[data.index].partitions = data.partitions;
        this.ruleForm.inputDataset[data.index].fileName = data.fileName;
        delete this.ruleForm.inputDataset[data.index].check_path;
      } else if (data.checkCustom) {
        this.ruleForm.inputDataset[data.index].check_path = data.check_path;
        delete this.ruleForm.inputDataset[data.index].location;
        delete this.ruleForm.inputDataset[data.index].partitions;
        delete this.ruleForm.inputDataset[data.index].fileName;
      } else {
        delete this.ruleForm.inputDataset[data.index].location;
        delete this.ruleForm.inputDataset[data.index].partitions;
        delete this.ruleForm.inputDataset[data.index].fileName;
        delete this.ruleForm.inputDataset[data.index].check_path;
      }
    },
    addEvent() {
      this.$refs.addInside.showWin();
    },
    saveInside(tasks) {
      const taskIds = this.ruleForm.eventDepends.map(item => item.taskId + '');
      tasks.forEach(item => {
        if (taskIds.includes(item.id + '')) {
          this.$message.warning(`任务ID=${item.id}已被添加`);
        } else {
          this.ruleForm.eventDepends.push({
            dependId: item.name || '-',
            dependGra: '',
            dateCalculationParam: {},
            // unitOffset: item.offset || -1,
            unitOffset: 0,
            useDateCalcuParam: false,
            granularity: item.granularity || '-',
            taskId: item.id || '-',
            metadataId: item.metadataId || '-',
            templateCode: item.templateCode || '-'
          });
        }
      });
    },
    delEvent(index) {
      this.ruleForm.eventDepends.splice(index, 1);
    },
    changeIsRange(value) {
      if (!value) {
        this.$set(this.ruleForm.triggerParam.crontabParam, 'range', []);
      } else {
        this.$set(this.ruleForm.triggerParam.crontabParam, 'interval', '');
        this.$set(this.ruleForm.triggerParam.crontabParam, 'startTime', '');
        this.$set(this.ruleForm.triggerParam.crontabParam, 'endTime', '');
      }
    },
    getUtc0() {
      const crontabParam = this.ruleForm.triggerParam.crontabParam;
      this.btnLoad = true;
      getCrontab({
        // cycle: crontabParam.cycle,
        cycle: this.ruleForm.triggerParam.outputGranularity,
        range: crontabParam.range,
        interval: crontabParam.interval,
        startTime: crontabParam.startTime,
        endTime: crontabParam.endTime,
        fixedTime: crontabParam.fixedTime,
        convertUtc0: true
      })
        .then(res => {
          const data = res.data;
          this.$msgbox({
            title: 'utc0时间',
            message: `cron表达式：${data}`,
            showConfirmButton: false
          });
        })
        .finally(() => {
          this.btnLoad = false;
        });
    },
    getTime() {
      this.btnLoad2 = true;
      getCronTime({
        crontab: this.ruleForm.triggerParam.crontab,
        num: 7
      })
        .then(res => {
          const data = res.data;
          let dataStr = '';
          data.forEach(item => {
            dataStr += item + '<br/>';
          });
          this.$msgbox({
            title: '接下来7次的执行时间',
            message: dataStr,
            dangerouslyUseHTMLString: true,
            showConfirmButton: false
          }).catch(() => {});
        })
        .finally(() => {
          this.btnLoad2 = false;
        });
    },
    changeOutputGranularity(value) {
      // 当调度周期由 天/周/月 切换到 小时 时，定时调度时候去掉小时，只显示分钟；当调度周期由 小时 切换到 天/周/月 时，定时调度时候加上小时的显示
      const fixedTime = this.ruleForm.triggerParam.crontabParam.fixedTime + '';
      if (value === 'hourly' && fixedTime.indexOf(':') > -1) {
        this.ruleForm.triggerParam.crontabParam.fixedTime = fixedTime.split(':')[1];
      }
      if ((value === 'daily' || value === 'weekly' || value === 'monthly') && fixedTime && fixedTime.indexOf(':') === -1) {
        this.ruleForm.triggerParam.crontabParam.fixedTime = '00:' + fixedTime;
      }
      this.$set(this.ruleForm.triggerParam.crontabParam, 'range', [1]);
      this.$set(this.ruleForm.triggerParam.crontabParam, 'interval', value === 'minutely' ? 5 : '');
      this.$set(this.ruleForm.triggerParam.crontabParam, 'startTime', '');
      this.$set(this.ruleForm.triggerParam.crontabParam, 'endTime', '');
      this.isRange = true;
      this.ruleForm.triggerParam.crontabParam.advancedSetting = false;
      // this.$refs.ruleForm.clearValidate();
      this.changeCron();
    },
    changeCron() {
      const crontabParam = this.ruleForm.triggerParam.crontabParam;
      if (!crontabParam.startTime) this.ruleForm.triggerParam.crontabParam.startTime = '';
      if (!crontabParam.endTime) this.ruleForm.triggerParam.crontabParam.endTime = '';
      // 周期为小时，必填项没填不调接口 (开始结束时间改为非必填项了，所以这段代码注释掉了)
      // if (this.ruleForm.triggerParam.outputGranularity === 'hourly') {
      //   if (!this.isRange) {
      //     if (!crontabParam.startTime || !crontabParam.endTime || !crontabParam.interval) {
      //       return;
      //     }
      //   } else {
      //     if (!crontabParam.range.length) return;
      //   }
      // }
      if (['Hive2Hive', 'DataMigration', 'SPARKJAR', 'Hive2Clickhouse', 'Hive2Mysql', 'Hive2Doris', 'Hive2Redis', 'Hive2Redshift', 'Hive2Sharestore', 'PythonShell', 'Hive2File'].includes(this.ruleForm.templateCode) || (this.ruleForm.templateCode === 'Mysql2Hive' && !this.ruleForm.isLakeHouseReal)) {
        this.seniorForm.regularAlert.graularity = this.ruleForm.triggerParam.outputGranularity;
        if (this.ruleForm.triggerParam.outputGranularity === 'minutely') {
          this.seniorForm.regularAlert.isChecked = false;
          this.expandTab();
        }
      }
      getCrontab({
        // cycle: crontabParam.cycle,
        cycle: this.ruleForm.triggerParam.outputGranularity,
        range: crontabParam.range,
        interval: crontabParam.interval,
        startTime: crontabParam.startTime,
        endTime: crontabParam.endTime,
        fixedTime: crontabParam.fixedTime,
        advancedSetting: this.ruleForm.triggerParam.crontabParam.advancedSetting
      }).then(res => {
        const data = res.data;
        if (data) {
          this.ruleForm.triggerParam.crontab = data;
        } else {
          this.ruleForm.triggerParam.crontab = '';
        }
      });
    },
    addData() {
      const obj = {
        id: '',
        guid: '',
        completePath: '',
        metadata: {
          region: this.region,
          type: 'hive',
          source: '',
          db: '',
          table: ''
        },
        granularity: 'daily',
        // offset: -1,
        unitOffset: 0,
        ready_time: '0 0 * * *',
        useDateCalcuParam: false,
        dateCalculationParam: {},
        sourceTableList: []
      };
      if (this.isJar) {
        obj.isMetadataSel = true;
      }
      this.ruleForm.inputDataset.push(obj);
    },
    delData(index) {
      this.ruleForm.inputDataset.splice(index, 1);
      if (this.isJar && this.ruleForm.inputDataset.length) {
        this.inputDatasetKey++;
        this.ruleForm.inputDataset.forEach((item, index) => {
          this.$nextTick(() => {
            if (this.$refs['inputDataset' + index]) {
              this.$refs['inputDataset' + index].inputValue = item.metadata.table;
            }
          });
        });
      }
    },
    addCost() {
      if (this.ruleForm.cost.length < 4) {
        this.ruleForm.cost.push({
          key: '',
          value: ''
        });
      } else {
        this.$message({
          type: 'warning',
          message: '成本分摊最多支持4个部门哦'
        });
      }
    },
    delCost(index) {
      if (this.ruleForm.cost.length > 1) {
        this.ruleForm.cost.splice(index, 1);
      } else {
        this.$message({
          type: 'warning',
          message: '至少保留一条任务归属成本哦'
        });
      }
    },
    changeCost(value) {
      this.costList.forEach(item => {
        const obj = this.ruleForm.cost.find(child => child.key === item.id);
        if (obj) {
          this.$set(item, 'disabled', true);
        } else {
          this.$set(item, 'disabled', false);
        }
      });
    },
    changeGranularity(value, row) {
      this.$nextTick(() => {
        this.$refs.crontab.changeTimeUnit();
      });
      row.unitOffset = 0;
      row.useDateCalcuParam = false;
      // if (['Hive2Hive', 'Hive2File', 'TfJob'].includes(this.ruleForm.templateCode)) {
      //   const formData = new FormData();
      //   formData.append('table', `${row.metadata.db}.${row.metadata.table}`);
      //   formData.append('granularity', value);
      //   formData.append('sql', this.ruleForm.content);
      //   getOffset(formData).then(data => {
      //     if (data !== 'null') {
      //       row.unitOffset = data;
      //     } else {
      //       row.unitOffset = undefined;
      //     }
      //   });
      // }
    }
  }
};
</script>
<style lang="scss" scoped>
.step-three {
  .base-form {
    width: 80%;
    ::v-deep .el-form-item__label {
      width: 80px;
    }
    ::v-deep .el-form-item__content {
      margin-left: 80px;
    }
  }
  .hour-radio {
    ::v-deep .el-radio__label {
      display: inline-block;
    }
    ::v-deep .el-radio__input {
      vertical-align: top;
      margin-top: 8px;
    }
  }
  .depend-wrap {
    padding: 10px 20px;
    border: 1px solid #d7dae2;
    border-radius: 2px;
    margin: 5px 40px;
  }
  .table-title {
    text-align: right;
    position: relative;
    margin-bottom: 10px;
    height: 24px;
    .title {
      margin: 0;
      position: absolute;
      bottom: 0;
      font-weight: normal;
    }
  }
  .table {
    margin-bottom: 10px;
    ::v-deep .el-form-item {
      margin-bottom: 0;
    }
    .table-cell {
      display: flex;
      justify-content: center;
      .table-select {
        flex: 1;
      }
      .btn-check {
        font-size: $global-font-size-12;
        min-width: 30px !important;
        white-space: nowrap;
      }
    }
  }
  .cron-input {
    width: 200px;
  }
  .cron-btn {
    margin-left: 10px;
    position: relative;
    top: -1px;
  }
  .tip {
    font-size: $global-font-size-12;
    color: #aaa;
    line-height: normal;
  }
}
.popover-text {
  // cursor: pointer;
  display: inline-block;
  width: 120px;
  text-align: center;
  padding: 3px 0;
  border: 1px solid #d1d7e6;
  border-radius: 4px;
  line-height: normal;
}
.popover-footer {
  margin-top: 20px;
  text-align: right;
}
.td-border {
  border: 1px solid #d1d7e6;
  border-radius: 4px;
  display: inline-block;
  width: 130px;
  position: relative;
  top: 4px;
  // cursor: pointer;
}
.GeneratePathFrom {
  padding-left: 30px;
}
.name-item {
  position: relative;
  margin-bottom: 15px !important;
  .name-tips {
    position: absolute;
    right: -150px;
    color: #ff5656;
  }
}

.alert-method-box {
  width: 80%;
  margin-left: 80px;
  margin-top: 10px;
  padding: 15px 15px;
  border: 1px solid #e4e7ed;
  ::v-deep .el-form-item {
    margin-bottom: 0 !important;
  }
  ::v-deep .el-form-item__label {
    font-weight: 400;
  }
  .el-form-item {
    margin: 5px 0;
  }
  .check-time-box {
    display: flex;
  }
  .check-time-group {
    margin-left: 10px;
    span {
      margin-left: 10px;
    }
  }
}
.other-param {
  .check-text {
    margin-left: 15px;
    cursor: pointer;
  }
  .activeText {
    color: #3782ff;
    position: relative;
  }
  .activeText::before {
    content: '';
    position: absolute;
    width: 100%;
    border-bottom: 2px solid #3782ff;
    bottom: -5px;
  }
}
.noReg {
  border-color: #ff5656;
}
.tip-text {
  color: #ff5656;
  margin-left: 80px;
  margin-top: 5px;
}
.token-tip {
  color: #3782ff;
}
</style>
<style>
.step3-run-popper {
  max-width: 400px;
}
</style>
