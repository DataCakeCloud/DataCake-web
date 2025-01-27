export default {
  // 任务详情
  taskInfo: {
    instanceInfo: '实例信息',
    runStatus: '运行状态',
    place_runStatus: '请选择运行状态',
    timeRange: '执行入参时间',
    batchClear: '批量重算',
    batchStop: '批量停止',
    instanceId: '实例ID',
    runNum: '运行次数',
    bout: '次',
    inputTime: '执行入参时间',
    taskStartTime: '任务开始时间',
    taskEndTime: '任务结束时间',
    taskTime: '任务耗时',
    restartCheck: '重新启动检查',
    repeat: '重算',
    more: '更多',
    kibana: 'Kibana日志',
    viewScript: '脚本预览',
    viewSql: 'SQL预览',
    dataLineage: '数据血缘',
    instanceTime: '实例时间',
    place_instanceTime: '当前任务对应的实例时间',
    upstream: '上 游',
    downstream: '下 游',
    depth: '血缘深度',
    internalData: '内部数据',
    externalData: '外部数据',
    taskName: '任务名称',
    dataSetType: '数据集类型',
    external: '外部',
    internal: '内部',
    dataSetName: '数据集名称',
    path: '检查路径',
    readyTime: '就绪时间',
    omitInstance: '该节点代表该依赖链路上被省略的中间实例',
    taskId: '任务ID',
    currentInstance: '当前实例',
    dataDate: '数据日期',
    instanceDate: '实例日期',
    dataSetOwner: '数据集owner',
    taskOwner: '任务owner',
    isRepeat: '确定重算?',
    setSuccess: '置为成功',
    setFail: '置为失败',
    executionSuccess: '执行成功',
    executionFailed: '执行失败',
    linkAnalysis: '链路分析',
    instanceView: '实例运行表视图',
    recent: '最近N个',
    executionTime: '执行时间',
    name: '名称',
    startTime: '开始时间',
    endTime: '结束时间',
    owner: '负责人',
    log: '日志',
    ganttChart: '实例运行甘特图',
    status: '状态',
    success: '成功',
    fail: '失败',
    new: '最新',
    repeatTips: '重算任务是否在执行过程中检查上游',
    relyTips: '主要用于自依赖任务顺序执行',
    dataTips: '边框实线与虚线用以区分内部or外部数据；背景灰色代表任务下线；边框颜色用以区分当前实例状态',
    online: '下线',
    omit: '中间有省略节点',
    noUpInstance: '未检查到上游实例',
    runRecord: '运行记录',
    schedulingType: '调度类型',
    complement: '补数',
    scheduling: '正常调度',
    lookLog: '查看日志',
    isBatchClear: '确定批量重算?',
    selectInstance: '请至少选择一个任务实例',
    yesTime: '完成时间'
  },
  taskStatusMenu: {
    checkUp: '检查上游',
    queuing: '排队中',
    running: '运行中',
    success: '成功',
    error: '失败',
    notReady: '未就绪',
    ready: '已就绪',
    stopCheckUp: '终止检查上游',
    waitRepeat: '等待重试'
  },
  task: {
    lang: 'zh',
    // 翻译补充1
    taskAdd1: '添加内部依赖设置',
    taskAdd2: '前置任务',
    taskAdd3: '支持按任务id/任务名称/产出数据集搜索任务',
    taskAdd4: '请选择任务',
    taskAdd5: '偏移量设置说明：',
    taskAdd6: '1）含义：',
    taskAdd7: '当前任务的执行入参时间与上游任务(即下表每行的任务)的执行入参时间相差多少个周期(月/周/天/时)；',
    taskAdd8: '2）效果：',
    taskAdd9: '当前任务入参时间 + 偏移量 * 被依赖任务的周期 = 被依赖任务的入参时间。',
    taskAdd10: '3）举例（如下图）:',
    taskAdd11: '当前任务B依赖任务A，今天为 11月18日，入参时间为 11月18日，',
    taskAdd12: '-- 如果偏移量为0，A 任务入参时间 = 11月18日 + 0 = 11月18日',
    taskAdd13: '-- 如果偏移量为-1，A任务入参时间 = 11月18日 -1 = 11月17日',
    taskAdd14: '更多配置请参考',
    taskAdd15: '频率',
    taskAdd16: '星期',
    taskAdd17: '日期',
    taskAdd18: '刷新后将会根据上一步中的配置重新识别前置依赖',
    taskAdd19: '刷新提示',
    taskAdd20: '是否配置周',
    taskAdd21: '偏移模式',
    taskAdd22: '指定模式',
    taskAdd23: '偏移模式设置不能为空',
    taskAdd24: '指定模式设置不能为空',
    taskAdd25: '名称/ID',
    taskAdd26: '保存校验',
    taskAdd27: '通过',
    taskAdd28: '提醒',
    taskAdd29: '校验中',
    taskAdd30: '提醒信息',
    taskAdd31: '请联系当前租户的管理员（xuebotao）去申请',
    taskAdd32: '去申请',
    taskAdd33: '去修改',
    taskAdd34: '请在"上线"前确保上述警告项已被处理',
    taskAdd35: '不通过',
    taskAdd36: '卡',
    taskAdd37: '执行命令',
    taskAdd38: '请输入代码位置',
    taskAdd39: '请输入训练参数文件',
    taskAdd40: '请输入执行命令',
    taskAdd41: '请输入CPU资源',
    taskAdd42: '请输入内存资源',
    taskAdd43: '请输入GPU资源',
    taskAdd44: '请完善信息!',
    // 任务列表及任务卡片页
    tagSelectPh: '请选择标签',
    allTag: '全部标签',
    collectText: '收藏',
    myCollectText: '我的收藏',
    myTagText: '我的标签',
    editTip: '右键点击可编辑',
    addText: '添加',
    publicTagText: '公开给我的标签',
    searchLabeld: 'ID/名称',
    taskTypelabel: '任务类型',
    taskStatusLabel: '任务状态',
    taskGuidsLabel: '依赖数据集',
    taskOn: '上线',
    taskDown: '下线',
    taskTableName: '产出数据集',
    taskTableNamePh: '产出数据集',
    taskOwner: '负责人',
    taskOwnerPh: '负责人',
    onlySelf: '只看自己',
    addTask: '新建',
    allTaskNums: '结果共',
    statusPre: '实例最近执行状态为：',
    sucessStatus: '已成功',
    failedStatus: '已失败',
    runningStatus: '执行中',
    columsText: '自定义列',
    taskList1: '任务ID',
    taskList2: '任务名称',
    taskType: '任务类型',
    taskList3: '最近运行状态',
    taskList4: '执行时间：',
    taskList5: '执行状态：',
    taskList6: '开始时间：',
    taskList7: '结束时间：',
    taskList8: '耗时：',
    taskList9: '产出数据集',
    taskList10: '依赖数据集',
    updateTime: '更新时间',
    taskStatus: '状态',
    taskList11: '上下线状态',
    taskList12: '任务描述',
    taskList13: '操作',
    commonSmall: '还原',
    commonBig: '放大',
    taskList14: '跳转到工作流详情',
    taskEdit: '编辑',
    taskShow: '查看',
    taskCopy: '复制任务',
    taskList15: '补数',
    taskList151: '手动执行',
    taskVersion: '版本信息',
    taskDelet: '删除',
    taskList16: '是否通知直接下游',
    taskTrue: '是',
    taskFalse: '否',
    taskCancel: '取 消',
    taskOk: '确 定',
    taskCancel1: '取消',
    taskOk1: '确定',
    taskList17: '任务执行状态流',
    taskList18: '收起',
    taskList19: '展开',
    taskList20: '确定删除此标签?',
    taskList21: '提示',
    taskList22: '删除成功!',
    taskList23: '添加收藏',
    taskList24: '收藏成功!',
    taskList25: '取消收藏',
    taskList26: '取消收藏成功!',
    copy: '复制',
    taskList27: '在新标签页打开链接',
    taskList28: '确定发版?',
    taskList29: '操作成功!',
    taskList30: '确定上线?',
    taskList31: '确定执行此任务?',
    duringTime: '起止时间',
    to: '至',
    startTime: '开始时间',
    endTime: '结束时间',
    taskList32: '补数方式',
    taskList33: '普通',
    taskList34: '深度',
    taskList35: '下游选择',
    taskList36: '全选',
    taskList37: '请选择下游依赖',
    taskList38: '只能选择当前用户组的下游任务',
    taskList39: '通知下游负责人',
    taskList40: '请选择起止时间',
    taskList41: '请选择补数方式',
    taskList42: '请选择下游选择',
    taskList43: '请输入标签名字，不超过128个字符',
    taskList44: '请选择归属于该标签的任务（最多可选500个）',
    taskList45: '是否公开此标签',
    taskList46: '标签公开后，公开对象除了不能删除此标签外，可任意编辑此标签',
    labelName: '标签名字',
    linkTask: '关联任务',
    publickTo: '公开给',
    taskList47: '请输入协作人',
    taskrule1: '【只包含a-z,A-Z,0-9或_或中文】，长度2-128',
    taskrule2: '请选择公开人',
    editTitle: '编辑标签',
    addTitle: '添加标签',
    taskList48: '关联任务不能超过500个',
    taskList49: '版本信息',
    taskList50: '记录所保存的历史版本信息，以及针对任务所进行的上/下线、补数/重算这类操作信息',
    taskList51: '操作类型:',
    taskList52: '版本号',
    taskList53: '跳转到当前版本的编辑页面',
    taskList54: '-当前版本',
    taskList55: '操作时间',
    taskList56: '操作类型',
    taskList57: '操作人',
    taskList58: '描述',
    taskList59: '切换',
    taskList60: '确定切换为当前版本?',
    taskStep1: '设置任务信息',
    taskStep2: '设置依赖信息',
    taskStep3: '选模板',
    taskStep4: '选择数据源',
    taskStep5: '选择所需模板',
    taskStep6: '定义数据源的基本信息',
    taskStep7: '配置任务',
    taskStep8: '创建表',
    taskStep9: '源与目标信息配置、字段映射、加工逻辑等',
    taskStep10: '填写表信息',
    taskStep11: '配置调度',
    taskStep12: '设置表信息',
    taskStep13: '调度Cron、前置依赖、生成数据集等',
    taskStep14: '添加表维护信息',
    taskStep15: '预览',
    taskStep16: '预览结果和校验',
    taskCardAdd: '该模板适用于将对象存储(如OSS S3等)或分布式文件存储(如HDFS等)中存储的各种格式(如csv、json、paruet、orc等)的文件数据同步到Lakehouse湖仓中。',
    taskCard1: '数据接入 Data Ingestion',
    taskCard2: '用于拉取DB数据到LakeHouse湖仓，供后续的LakeHouse数据分析及相关数据的使用。',
    taskCard3: 'Kafka2LakeHouse统一模板，对接Kafka/Metis，透传至LakeHouse表。',
    taskCard4: '湖仓处理 Data Transformation',
    taskCard5: '基于Spark SQL进行数据处理，此方式不支持跨云逻辑。',
    taskCard6: '用于湖仓数据的跨云数据同步，要求所同步的数据模型一致。',
    taskCard7: '数据导出 Data Digestion',
    taskCard8: '用于数据的导出处理，可将数据从LakeHouse导出到MySQL中。',
    taskCard9: '用于数据的导出处理，可将数据从LakeHouse导出到ClickHouse中。',
    taskCard10: '用于数据的导出处理，可将数据从LakeHouse导出到Doris中。',
    taskCard11: '可将湖仓数据（暂支持LakeHouse）导出到Redis数据库，适用于业务数据缓存场景。',
    taskCard12: '适用于将S3文件中结构化数据映射到Aws Redshift表中的业务场景。',
    taskCard13: '用于数据的导出处理，可将数据从LakeHouse导入到ShareStore/TiKV中。',
    taskCard14: '用于LakeHouse数据导出到文件的任务，可以支持以邮件的方式将文件发送给用户。',
    taskCard15: '数据接入 Data Ingestion',
    taskCard16: '用于湖仓数据的基于Jar包的数据处理，一般用于更加复杂的数据处理逻辑。',
    taskCard17: 'Shell/Python脚本',
    taskCard18: '用于python和shell脚本任务的执行。',
    taskCard19: '湖仓处理 Lakehouse ETL',
    taskCard20: '通过上传Flink Jar包的方式，进行流式数据处理。',
    taskCard21: '流式任务的统一模板，基于SQL查询的方式（Flink SQL）进行数据处理。Metis日志处理，统一归集到此处通过SQL的方式进行处理。',
    stepTip: '通用模版',
    stepMore: '更多',
    taskFile1: '文件夹',
    taskFile2: '标签',
    taskFile3: '全部标签',
    taskFile4: '请选择标签',
    taskFile5: '右击可编辑标签',
    taskFile6: '关联任务',
    taskFile7: '新建任务',
    taskFile8: '删除成功',
    taskFile9: '修改成功',
    taskFile10: '新建成功',
    // 任务详情
    // 高级设置非流式任务
    setting1: '协作人',
    setting2: '请输入协作人',
    setting3: '您可以在用户管理模块中创建新的用户组',
    setting4: '用户组',
    setting5: '计算引擎',
    setting6: '这里指的是任务执行时采用何种计算引擎，不同模板支持的计算引擎有所不同，选择计算引擎后，会将任务提交到相关联的集群上执行，可根据需要进行选择；',
    setting7: '请选择计算引擎',
    setting8: '集群类型',
    setting9: '请选择集群类型',
    setting10: '任务资源大小',
    setting11: '任务成本和机型、模式、并行度、运行时长有关。以下为单并行度任务的大概费用，仅供参考，具体费用请查看成本中心。',
    setting12: '机型',
    setting13: '模式',
    setting14: '费用($/h)',
    setting15: '超时重试时长',
    setting16: '任务运行时长超过此值时，将会自动重试。0表示默认，后台将根据该任务历史n次执行时长设定一个默认超时时间，当实例执行时长超过此值时会触发钉钉告警通知，同时任务不会被kill；',
    setting17: '秒',
    setting18: '任务重试次数',
    setting19: '输入值范围：0~100',
    setting20: '任务并行度',
    setting21: '指定实例并行运行的数量(最小值1)',
    setting22: '任务并行度',
    setting23: '注：当并行度超过5时，可能会造成集群占满，请谨慎修改',
    setting24: '任务开始日期',
    setting25: '任务结束日期',
    setting26: '任务模式',
    setting27: '经济模式：Ec2spot；保障模式：OnDemand',
    setting28: '经济模式',
    setting29: '保障模式',
    setting30: '标签选择器',
    setting31: '用来控制pod被调度的机器',
    setting32: '标签',
    setting33: '用于pod的发现',
    setting34: '环境变量',
    setting35: '设置pod的环境变量',
    setting36: '资源',
    setting37: '配置pod申请的资源，包括cpu，memory等',
    setting38: '存储卷',
    setting39: '用于存储数据',
    setting40: '挂载卷',
    setting41: '用于挂载数据卷，通常和volumn一起使用',
    setting42: '注解',
    setting43: '用于注入非识别类信息',
    setting44: '以下示例仅供参考(请注意，部分参数需带单位):',
    setting45: '其他参数',
    setting46: '请输入其他参数',
    setting47: '请先输入当前参数的key！',
    // 高级设置流式任务
    settingStreaming1: '参数设置',
    settingStreaming2: '时间间隔',
    settingStreaming3: '超时时间',
    settingStreaming4: 'Checkpoint模式',
    settingStreaming5: '自动伸缩模式',
    settingStreaming6: '没找到？去创建',
    settingStreaming7: '指定MySQL CDC启动模式',
    settingStreaming8: '启动模式',
    settingStreaming9: '配置选项',
    settingStreaming10: '指定MySQL CDC使用者的启动模式。有效枚举包括：',
    settingStreaming11: '(默认)：在第一次启动时对受监视的数据库表执行初始快照，并继续读取最新的binlog。',
    settingStreaming12: '：跳过快照阶段，从可读取的最早binlog位点开始读取',
    settingStreaming13: '：首次启动时，从不对受监视的数据库表执行快照，连接器仅从binlog的结尾处开始读取，这意味 着连接器只能读取在连接器启动之后的数据更改。',
    settingStreaming14: '请选择启动模式',
    settingStreaming15: '高级',
    settingStreaming16: 'flink job类型',
    settingStreaming17: '批',
    settingStreaming18: '流',
    settingStreaming19: '邮箱',
    settingStreaming20: '输入告警邮件发送邮箱',
    settingStreaming21: '以下参数只对Per-Job生效',
    settingStreaming22: '统一身份认证，账号由运维提供且必须包含有对目录【obs://cbs-flink-sg/main-sg2-prod/】的操作权限',
    settingStreaming23: '输入aws Iam',
    settingStreaming24: '统一身份认证，账号由运维提供且必须包含有对目录【s3a://cbs.flink.ap-southeast-1/ads-sg1-prod/】的操作权限',
    settingStreaming25: '核',
    settingStreaming26: '报警类型',
    settingStreamingTime: '超时时间',
    settingStreaming27: '指定当任务实例处于“成功”、“失败”、“重试”、“开始”状态时，以怎样的报警方式进行通知。注："失败"指实例最终运行失败，“重试”则指实例在指定重试次数内每次重启时。',
    settingStreaming28: '报警方式',
    settingStreaming29: '钉钉',
    settingStreaming30: '电话',
    settingStreaming31: '邮件',
    settingStreamingAdd1: '企业微信',
    settingStreaming32: '是否通知协作人',
    settingStreaming33: 'Jar文件',
    settingStreaming34: 'Jar版本',
    settingStreaming35: '经济模式',
    settingStreaming36: '开启经济模式',
    settingStreaming37: '选择策略',
    settingStreaming38: '算子操作建议策略',
    settingStreaming39: 'kafka消费延迟策略',
    settingStreaming40: '周期性策略',
    settingStreaming41: 'topic名称',
    settingStreaming42: '请输入topic名称',
    settingStreaming43: 'KAFKA集群',
    settingStreaming44: '请输入KAFKA集群',
    settingStreaming45: '冷却时间',
    settingStreaming46: '扩缩容忍度',
    settingStreaming47: '最小并行度',
    settingStreaming48: '最大并行度',
    settingStreaming49: 'topic名称',
    settingStreaming50: 'kafka消费延迟策略',
    settingStreaming51: 'KAFKA集群',
    settingStreaming52: '消费者组',
    settingStreaming53: '最大延迟条数',
    settingStreaming54: '最小延迟条数',
    settingStreaming55: '延迟时间',
    settingStreaming56: '冷却时间',
    settingStreaming57: '扩缩比例',
    settingStreaming58: '最小并行度',
    settingStreaming59: '最大并行度',
    settingStreaming60: '时间区间',
    settingStreaming61: '结束时间小于23才允许添加',
    settingStreaming62: '并行度',
    settingStreaming63: '请选择自动伸缩模式',
    settingStreaming64: '请选择cluster',
    settingStreaming65: '请输入邮箱',
    settingStreaming66: '请选择checkpoint模式',
    settingStreaming67: '请输入时间间隔',
    settingStreaming68: '请输入超时时间',
    settingStreaming69: '请输入冷却时间',
    settingStreaming70: '请输入扩缩容忍度',
    settingStreaming71: '请输入最小并行度',
    settingStreaming72: '请输入最大并行度',
    settingStreaming73: '请输入消费者组',
    settingStreaming74: '请输入延迟时间',
    settingStreaming75: '请输入扩缩比例',
    settingStreaming76: '请输入最小延迟条数',
    settingStreaming77: '请输入最大延迟条数',
    settingStreaming78: '请先选择当前的Version！',
    settingStreaming79: '周期性策略 时间区间结束时间必须为24',
    settingStreaming80: '高级设置中有必填项未填写',
    // step3任务配置页
    stepThree1: '基本属性',
    stepThree2: '任务名称',
    stepThree3: '只有下线任务才可以修改任务名称',
    stepThree4: '任务描述',
    stepThree5: '调度配置',
    stepThree6: '调度方式',
    stepThree7: '周期调度',
    stepThree8: '手动调度',
    stepThree9: '说明：周期调度将按照调度周期例行调度，手动调度则是指从任务列表不定时的去手动触发执行',
    stepThree10: '调度周期',
    stepThree11: '请选择调度周期',
    stepThree12: '说明：表示该任务以怎样的频率执行',
    stepThree13: '时间间隔',
    stepThree14: '请选择时间间隔',
    stepThree15: '每',
    stepThree16: '分钟',
    stepThree17: '分',
    stepThree18: '定时调度时间',
    stepThree19: '请选择定时调度时间',
    stepThree20: '指定天',
    stepThree21: '请选择指定时间',
    stepThree23: '请选择定时调度时间',
    stepThree24: '高级配置',
    stepThree25: '开始时间',
    stepThree26: '结束时间',
    stepThree27: '请选择开始时间',
    stepThree28: '请选择结束时间',
    stepThree29: '指定小时',
    stepThree30: '时间间隔',
    stepThree31: '请选择时间间隔',
    stepThree32: '小时',
    stepThree33: 'cron表达式',
    stepThree34: '查看utc0转换时间',
    stepThree35: '查看接下来7次执行时间',
    stepThree36: '前置依赖',
    stepThree37: '提示：如果设置了前置依赖，则只有当前置依赖就绪时，任务才会执行',
    stepThree38: '依赖类型',
    stepThree39: '内部依赖',
    stepThree40: '提示：当需要将本平台产出的任务/数据集作为前置依赖时，可选择此项；',
    stepThree41: '外部依赖',
    stepThree42: '提示：当需要将非本平台产出的数据集作为前置依赖时，可选择此项；',
    stepThree43: '内部依赖设置',
    stepThree44: '序号',
    stepThree45: '任务ID',
    stepThree46: '(已删除)',
    stepThree47: '任务名称',
    stepThree48: '任务周期',
    stepThree49: '产出数据集',
    stepThree50: '偏移量',
    stepThree51: '偏移量设置说明',
    stepThree52: '设置',
    stepThree53: '偏移',
    stepThree54: '指定',
    stepThree55: '外部依赖设置',
    stepThree56: '数据集',
    stepThree57: '自定义数据集',
    stepThree58: '筛选数据集',
    stepThree59: '请输入自定义数据集',
    stepThree60: '请输入数据集',
    stepThree61: '请选择数据集',
    stepThree62: '数据库',
    stepThree63: '请选择数据库',
    stepThree64: '表名称',
    stepThree65: '请选择表名称',
    stepThree66: '加载中...',
    stepThree67: '数据类型',
    stepThree68: '外部数据',
    stepThree69: '内部数据',
    stepThree70: '数据周期',
    stepThree71: '请选择数据粒度',
    stepThree72: '偏移量',
    stepThree73: '任务依赖多少个粒度之前的数据。负表示之前，正数表示之后',
    stepThree74: '单一偏移',
    stepThree75: '连续偏移',
    stepThree76: '偏移量：',
    stepThree77: '描述文字',
    stepThree78: '完成时间',
    stepThree79: '当该数据的生产任务不在本平台，每个周期该完成时间默认该粒度的数据准备就绪',
    stepThree80: '设置依赖就绪条件',
    stepThree81: '生成数据集信息',
    stepThree82: '生成数据集信息说明',
    stepThree83: '说明',
    stepThree84: '库名称',
    stepThree85: '表名称',
    stepThree86: '生成标志',
    stepThree87: '任务归属成本录入',
    stepThree88: '添加成本部门',
    stepThree89: '成本归属部门',
    stepThree90: '请选择成本归属部门',
    stepThree91: '成本归属占比',
    stepThree92: '请输入成本归属占比',
    stepThree93: '生成数据集主要有以下几个作用：',
    stepThree94: '当下游任务需要依赖当前任务时，下游任务可以通过生成数据集信息来添加"前置依赖"；',
    stepThree95: '为当前任务指定一个产出的标志-success文件路径，当下游任务需要依赖当前任务时，只需要去依赖当前任务对应的_success文件路径即可；',
    stepThree96: '定时告警',
    stepThree97: '提示：在任务的每个调度周期内，当在指定的“检查时间”下“触发条件”被满足，将通过指定的“告警渠道”发送一条通知信息到任务owner（如果勾选了协作人，则同时发送）；反之，则不发送通知信息；',
    stepThree98: '任务成功时',
    stepThree99: '任务失败时',
    stepThree100: '任务重试时',
    stepThree101: '任务开始时',
    stepThree102: '告警渠道',
    stepThree103: '检查时间',
    stepThree104: '请选择',
    stepThree105: '第',
    stepThree106: '个周期',
    stepThree107: '本周期后',
    stepThree108: '触发条件',
    stepThree109: '"告警渠道"未设置',
    stepThree110: '名字只能包含a-z,A-Z,0-9或-；开始需为字符，不能以下划线结尾；最多45个字符',
    stepThree111: '名字只能包含a-z,A-Z,0-9或-或_;开始需为字符，不能以下划线结尾；最多60个字符',
    stepThree112: 'AWS 美东',
    stepThree113: 'AWS 新加坡',
    stepThree114: '华为 新加坡',
    stepThree145: '本周期',
    stepThree146: '本周期后',
    stepThree147: '任务未开始',
    stepThree148: '任务未成功',
    stepThree149: '请输入任务名称',
    stepThree150: '请选择数据产出粒度',
    stepThree151: '请选择调度周期',
    stepThree152: '请选择指定时间',
    stepThree153: '请选择开始时间',
    stepThree154: '请选择时间间隔',
    stepThree155: '请选择结束时间',
    stepThree156: '请选择定时调度时间',
    stepThree157: '每月最后1天',
    stepThree158: '每月',
    stepThree159: '号',
    stepThree160: '最多只能输入45个字符',
    stepThree161: '最多只能输入60个字符',
    stepThree162: '请先选择库表',
    stepThree163: '请先选择查询对应ID',
    stepThree164: '任务ID',
    stepThree165: '已被添加',
    stepThree166: 'utc0时间',
    stepThree167: 'cron表达式：',
    stepThree168: '接下来7次的执行时间',
    stepThree169: '成本分摊最多支持4个部门哦',
    stepThree170: '至少保留一条任务归属成本哦',
    // setp4预览
    stepView1: '源表字段',
    stepView2: '目标表字段',
    stepView3: '字段信息',
    stepView4: '字段名称',
    stepView5: '加工逻辑',
    stepView6: '数据依赖',
    stepView7: '生成数据集',
    stepView8: '数据源',
    stepView9: '告警策略',
    stepView10: '告警类型',
    stepView11: '表',
    stepView12: '文件',
    stepView13: '可视化模式',
    stepView14: 'SQL模式',
    stepView15: 'hive表',
    stepView16: 'S3/Obs文件',
    stepView17: '工件',
    stepView18: '版本',
    stepView19: '同步类型',
    stepView20: '源路径',
    stepView21: '过滤该目录下的文件',
    stepView22: '目标数据区域',
    stepView23: '目标路径',
    stepView24: '删除目标文件',
    stepView25: '源数据库名称',
    stepView26: '源表名称',
    stepView27: '分区信息',
    stepView28: '目标数据库名称',
    stepView29: '目标表名称',
    stepView30: '指定时间',
    stepView31: 'ClickHouse数据源',
    stepView32: 'ClickHouse数据库',
    stepView33: 'ClickHouse表名称',
    stepView34: 'Mysql数据源',
    stepView35: 'Mysql数据库',
    stepView36: 'Mysql表名称',
    stepView37: '源数据区域',
    stepView38: 'Doris数据源',
    stepView39: 'Doris数据库',
    stepView40: 'Doris表名称',
    stepView41: 'Redis服务器',
    stepView42: '端口号',
    stepView43: '过期时间',
    stepView44: 'Redshift服务器',
    stepView45: '库名',
    stepView46: '是否生成标志',
    stepView47: '标志路径',
    stepView48: '检查文件名',
    stepView49: '输出数据类型',
    stepView50: '源数据类型',
    stepView51: 'S3/Obs路径',
    stepView52: 'sharestore连接地址',
    stepView53: 'sharestore集群名称',
    stepView54: 'sharestore的zookeeper地址',
    stepView55: '目标表名(segment)',
    stepView56: 'tikv连接地址',
    stepView57: '目标表名',
    stepView58: 'tikv类型',
    stepView59: '源种类',
    stepView60: 'Kafka服务器地址',
    stepView61: '显示元数据方式',
    stepView62: '分区键',
    stepView63: 'Iceberg区域',
    stepView64: 'Iceberg数据库',
    stepView65: 'Iceberg表名称',
    stepView66: '字段信息',
    stepView67: 'MySQL数据源名称',
    stepView68: 'MySQL库名',
    stepView69: 'MySQL表名',
    stepView70: 'LakeHouse库名',
    stepView71: 'LakeHouse表名',
    stepView72: '分区标识',
    stepView73: '表类型选择',
    stepView74: '数据同步方式',
    stepView75: 'LakeHouse表名前缀(可选)',
    stepView76: '源数据源名称',
    stepView77: '数据库名称',
    stepView78: '脚本类型',
    stepView79: '镜像地址',
    stepView80: '依赖工件',
    stepView81: '文件地址',
    stepView82: '文件类型',
    stepView83: '目标类型',
    stepView84: '主题',
    stepView85: '正文',
    stepView86: '邮箱',
    stepView87: '附件格式',
    stepView88: '代码位置',
    stepView89: '训练参数文件',
    stepView90: 'CPU资源',
    stepView91: '内存资源',
    stepView92: 'GPU资源',
    stepView93: 'Jar文件',
    stepView94: 'Jar版本',
    stepView95: 'Jar地址',
    stepView96: '输入数据集',
    stepView97: '输出数据集',
    // 任务组件I
    // iptTable
    ipt1: '(变更)',
    ipt2: '(删除)',
    ipt3: '确定删除此字段？',
    ipt4: 'decimal类型自定义',
    // ConFun
    conFun1: '输入字段',
    conFun2: '转换函数管理',
    conFun3: '已添加的函数',
    conFun4: '函数名：',
    conFun5: '参数：',
    conFun6: '新增函数',
    conFun7: '请选择新增函数',
    conFun8: '查看详细说明文档',
    conFun9: '请选择',
    conFun10: '请输入',
    conFun11: '关闭',
    conFun12: '从字符串的指定位置（包含）截取指定长度的字符串。如果开始位置非法抛出异常。如果字段为空值，直接返回（即不参与本transformer）',
    conFun13: '字段值的开始位置',
    conFun14: '目标字段长度',
    conFun15: '如果源字符串长度小于目标字段长度，按照位置添加pad字符后返回。如果长于，直接截断（都截右边）。如果字段为空值，转换为空字符串进行pad，即最后的字符串全是需要pad的字符',
    conFun16: '可输入："l","r", "l"是在头进行pad，"r"是尾进行pad',
    conFun18: '需要pad的字符',
    conFun19: '从字符串的指定位置（包含）替换指定长度的字符串。如果开始位置非法抛出异常。如果字段为空值，直接返回（即不参与本transformer）',
    conFun20: '需要被替换的字符串',
    conFun21: '替换的字符串',
    conFun22: '如果匹配正则表达式，返回Null，表示过滤该行。不匹配表达式时，表示保留该行。（注意是该行）。对于>=<都是对字段直接compare的结果.',
    conFun23: '运算符，支持以下运算符：like, not like, >, =, <, >=, !=, <=',
    conFun24: '正则表达式（java正则表达式）、值',
    // genPatchForm
    gpForm1: '是否生成标志:',
    gpForm2: '标志路径:',
    gpForm3: '请输入路径',
    gpForm4: '检查文件名:',
    gpForm5: '请输入文件名',
    // sep3 Dialog
    step3dialog1: '设置依赖就绪条件',
    step3dialog2: '检查路径',
    step3dialog3: '就绪时间',
    step3dialog4: '检查方式',
    step3dialog5: '路径:',
    step3dialog6: '示例路径如下：',
    step3dialog7: '请输入当前数据所在路径',
    step3dialog8: '高级配置是对上述文件路径表达式进一步进行设置，以指定多个连续/离散的文件路径作为依赖；',
    step3dialog9: '输入提示：可使用下方推荐值填充',
    step3dialog10: '就绪时间:',
    step3dialog11: '请选择就绪时间',
    step3dialog12: '偏移量设置',
    step3dialog13: '数据周期',
    step3dialog14: '请选择数据粒度',
    step3dialog15: '单一偏移',
    step3dialog16: '它是针对依赖任务的“任务周期”而言，比如：依赖任务的"任务周期"为"天"，偏移量设为“0”，则表示依赖任务的当天实例；偏移量设为“-1”，则表示依赖任务的前1天实例；依此类推；',
    step3dialog17: '连续偏移',
    step3dialog18: '它是针对依赖任务的“任务周期”而言，比如：依赖任务的"任务周期"为"天"，偏移量设为“-3~-1”，表示该依赖任务过去3天的全部实例，依此类推；',
    step3dialog19: '高级配置',
    step3dialog20: ' 当当前任务与依赖任务呈现非规律性的依赖，比如：当前任务周期与依赖任务周期不一致、依赖任务的间隔呈离散性，可勾选此方式。',
    step3dialog21: '描述文字',
    step3dialog22: '基础偏移量',
    step3dialog23: '不设置',
    step3dialog24: '指定依赖',
    step3dialog25: '指定',
    step3dialog26: '请选择指定',
    step3dialog27: 'L是"Last"的代指，当L是针对“小时”进行设置时，则代表1天中的最后一个小时，L-1代表1天中的第23个小时，L+1则代表第2天的第1个小时，依此类推；',
    step3dialog28: '依赖预览',
    step3dialog29: '以当前任务最近一次调度为例',
    step3dialog30: '当前时间',
    step3dialog31: '当前任务入参时间',
    step3dialog32: '前置任务',
    step3dialog33: '入参时间',
    step3dialog34: '自然月，0代表当前依赖任务本月份的实例；',
    step3dialog35: '自然周，大多数场景下无需设置此值，默认为0即可；只有当需要指定依赖任务的第几周的实例时才设置它；',
    step3dialog36: '自然日，需结合以上两个选项来理解，当月、周均为0时，这里的数值代表的是本月第X天的实例；如果月为-1、周为0则代表上月第X天的实例；',
    step3dialog37: `1）大粒度依赖小粒度时，涉及跨多个周期依赖（比如：monthly任务依赖hourly任务）时，允许对该依赖任务的天、小时分别设置指定数值；依此类推；
    2）小粒度依赖大粒度时，比如：hourly任务依赖monthly任务,无需对该依赖任务的月设置指定数值；`,
    // task editor
    taskEditor1: '加工逻辑',
    taskEditor2: '校验',
    taskEditor3: '格式化',
    taskEditor4: '清除',
    taskEditor5: '拉取git库',
    taskEditor6: '参数提示',
    taskEditor7: '数据表',
    taskEditor8: '函数',
    taskEditor9: '校验结果：',
    taskEditor10: '表达式中的tomorrow、yesterday等都是基于ds（入参时间）计算',
    taskEditor11: '参数',
    taskEditor12: '含义',
    taskEditor13: '其他情况请参考：',
    taskEditor14: '数据连接：',
    taskEditor15: '数据库：',
    taskEditor16: '点击生成一条标准select语句',
    taskEditor17: '字段名',
    taskEditor18: '数点击引用该udf据库：',
    taskEditor19: '使用说明',
    taskEditor20: '引用语法：',
    taskEditor21: '参数说明：',
    taskEditor22: '返回值说明：',
    taskEditor23: '--注意时间变量和as转换，具体可查看"提示"',
    taskEditor24: '代表目标表对应字段名称，下同',
    taskEditor25: '1.添加依赖(如果有)',
    taskEditor26: '2.注册UDF(如果有)',
    taskEditor27: '---先建表,此步骤为可选',
    taskEditor28: '=====DEMO-针对目标表不存在，支持创建iceberg表=====',
    taskEditor29: '---写入逻辑',
    taskEditor30: '---示例',
    taskEditor31: '---创建临时表',
    taskEditor32: '=====示例DEMO===== ',
    taskEditor33: '---指定S3路径、iam_role信息及存储格式 ',
    // 具体模版step2+
    // db->lakehouse Mysql2Hive
    highSetting: '高级设置',
    region: '区域',
    dbTip1: '这里的区域指的是任务提交执行的集群所在的区域',
    dbTip2: '请选择区域',
    dbToLakehouse2: '数据源类型',
    dbTip3: '请选择数据源',
    dbToLakehouse3: '表类型选择',
    dbContent1: '单表',
    dbContent2: '整库/多表',
    dbToLakehouse4: '数据同步方式',
    dbContent3: '全量',
    dbContent4: '实时',
    dbToLakehouse5: '数据源名称',
    place_dbToLakehouse5: '数据源名称',
    dbContent5: '请先选择区域',
    dbContent6: '新建数据源',
    dbToLakehouse6: '库名',
    dbToLakehouse7: '表名',
    dbTip4: '选择表名称',
    dbContent7: '数据预览',
    dbContent8: '选择来源',
    dbContent9: '选择目标',
    dbContent10: '下游目标表如果已经存在（包含表结构），则必须保证所选择的目标表结构涵盖上游表中的字段；',
    dbContent11: '下游目标表如果不存在，则此处支持由用户自定义输入表名，输入后，后台将根据此库表+"字段转换映射"处的“目标表”信息去创建目标表；',
    dbContent12: '选择数据库名称',
    dbContent13: '+没找到？请联系admin或到元数据页面建库',
    dbContent14: '+没找到？创建自定义表',
    dbTip5: 'LakeHouse表名前缀(可选)',
    dbToLakehouse8: '分区标识',
    dbContent15: '此字段标识了目标表是否每天保存一个全量数据，如果填写了分区字段，则每天往指定的分区字段中写入全量数据；否则，只保留最新一个全量数据',
    dbContent16: '分区名称',
    dbContent17: '分区内容',
    dbContent18: '参数提示',
    dbContent19: '源表',
    dbContent20: '源表schema变更的几种情况说明',
    dbTip6: 'LakeHouse表名前缀(可选)',
    tempTable1: '字段映射',
    tempTable2: '添加',
    tempTable3: '刷新源表字段',
    dbTip7: '在当前选中表中选择字段',
    dbContent21: '映射',
    dbContent22: '目标表',
    tempTable4: '同名映射',
    tempTable5: '序号',
    tempTable6: '源字段名称',
    tempTable7: '目标字段名称',
    tempTable8: '字段类型',
    tempTable9: '字段描述',
    tempTable10: '操作',
    dbTable1: '预览',
    dbTable2: '映射&转换',
    dbCopy: '确认复制',
    dbSave: '保存',
    dbContent23: '切换至该版本',
    dbTip8: '全量同步方式介绍',
    dbTip9: '将源端所有数据周期性全量拉取到LakeHouse，任务例行过程中，如果源发生DDL类变更，需及时关注任务运行状态。',
    dbTip10: '实时同步方式介绍',
    dbTip11: '先将源端所有数据一次性全量拉取到LakeHouse后，再实时地将增量数据拉取到LakeHouse中；整库/多表方式下不支持一键实时选项；此方式需要您提前开启MySQL客户端的Binlog设置。',
    dbTip12: '的数据预览',
    dbTip13: '只显示limit10的信息',
    dbValid1: '请输入库名',
    dbValid2: '请选择区域',
    dbValid3: '请选择数据源',
    dbValid4: '请选择数据源名称',
    dbValid5: '请选择数据库名称',
    dbValid6: '请选择表名称',
    dbValid8: '请输入主题',
    dbValid9: '请输入目标表名称',
    dbValid10: '请选请输入LakeHouse表名前缀择数据源',
    dbValid11: '请输入name',
    dbValid12: '请选择数据同步方式',
    dbValid13: '(自定义)',
    dbValid14: '只能包含a-z,0-9或-或_；开始需为字符',
    dbTip14: '至少选择2项表映射',
    dbTip15: '成本归属占比总额必须是100哦',
    dbTip16: '请至少添加一条内部依赖',
    dbTip17: '在当前选中表中选择字段',
    dbTip18: '拖动列头图标可进行手动排序',
    dbTable3: '函数名',
    dbTable4: '参数',
    dbTable5: '添加转换函数',
    dbTable6: '成功',
    dbTable7: '失败',
    dbTip19: '字段类型',
    dbTip20: '请选择目标字段类型',
    dbTip21: 'decimal类型支持让用户自定义精度和小数位数',
    dbTable8: '精度',
    dbTable9: '请输入精度',
    dbTable10: '小数位数',
    dbTable11: '请输入小数位数',
    dbTableInpt: '自定义表名',
    dbTableSelect: '选择已有表',
    // kafka Metis2Hive
    kfk1: '源区域',
    kfk2: '请选择源区域',
    kfk3: '源种类',
    kfk4: '源表名称',
    kfk5: '请输入topic',
    kfk6: '请输入Kafka服务器地址',
    kfk7: 'Kafka服务器地址',
    kfk8: '显示元数据方式',
    kfk9: '字段',
    kfk10: '请输入字段名称',
    kfk11: '请选择字段类型',
    kfk12: '填写字段描述',
    kfk13: '目标表',
    kfk14: 'Lakehouse区域',
    kfk15: '请选择Lakehouse区域',
    kfk16: 'Lakehouse数据库',
    kfk17: '请选择Lakehouse数据库',
    kfk18: 'Lakehouse表名称',
    kfk19: '请输入Iceberg表名称',
    kfk20: '下一步',
    kfk21: '确认复制',
    kfk22: '保存',
    chooseRegion: '请选择区域',
    kfk23: '请选择显示元数据方式',
    kfk24: '请选择源区域',
    kfk25: '请选择组名',
    kfk26: '请输入源表名称',
    kfk27: '请选择Lakehouse区域',
    kfk28: '请选择Lakehouse数据库',
    kfk29: '请选择Lakehouse表名称',
    kfk30: '请输入topic',
    kfk31: '请输入Kafka服务器地址',
    kfk32: '可视化模式',
    kfk33: 'SQL模式',
    kfk34: '请添加字段',
    kfk35: '请输入SQL',
    kfk36: '上一步',
    // step2HCCloud DataMigration
    DM1: '同步类型',
    DM2: '示例：dt={{ yesterday_ds }}',
    DM3: '分区信息',
    DM4: '源路径提示',
    DM5: '过滤该目录下的文件',
    DM6: '过滤文件提示',
    DM7: '基于来源表生成的目标表名称',
    DM8: '目标路径提示',
    DM9: '同步任务执行前，如果需要删除目标目录下与同步的源文件同名的文件，可以选择“是”，否则，选择“否”；',
    DM10: '1）此处支持同步单一文件，也支持同步单一目录（即同步此目录下的全部文件）；',
    DM11: '2）同步单一文件时，需要在此栏中填写路径+指定的文件名（含扩展名），例如： s3://桶名/data/shier/singleFile.csv ，系统将读取指定的文件；注意，路径、文件名区分大小写；',
    DM12: '3）同步单一目录时，需要在路径中以“/”结尾；',
    DM13: '4）路径中支持填写任务运行参数，可支持的任务运行参数参考输入框后方"参数提示"；',
    DM14: '1）当“源路径”输入的是一个目录时，如果需要过滤此目录下的文件，可勾选此项，并支持在下方输入框以正则的方式批量匹配要过滤的文件。例如：当只需要同步某个目录下除以“_Success”结尾文件以外的所有文件时，比如某目录下有以下几个文件，',
    DM15: '在下方输入框中填写“.*_Success”或"ab_Success"，就能匹配到 ‘ab_Success’。同步此目录时，将 排除掉此输入框匹配到的文件。',
    DM16: '1）此栏支持填写任务运行参数，可支持的任务运行参数参考输入框后方"参数提示"；',
    DM17: '2）此栏请以斜杠结尾，如果没有，会自动识别为以斜杠为结尾的目录',
    DM18: '3）指定要同步到的目标路径应该是单一目录，比如：',
    DM19: '假设任务执行日期为2022年6月14日，对应要写入的目标目录为：/data/202206/，即“源路径”中指定的文件将会被同步到此目录下',
    DM20: '默认执行集群所在区域',
    DM21: '示例：s3://桶名称/{{ yesterday_ds }}.strftime("%Y%m%d")/',
    DM22: '示例：.*_SUCCESS',
    DM23: '示例：s3://桶名称/xx/{{ yesterday_ds }}.strftime("%Y%m%d")/',
    DM24: '请选择源数据区域',
    DM25: '请选择目标数据区域',
    DM26: '请选择源数据库名称',
    DM27: '请选择源表名称',
    DM28: '请选择任务类型',
    DM29: '请输入源路径',
    DM30: '请选择是否删除目标文件',
    DM31: '请输入目标路径',
    DM32: '请输入过滤文件',
    DM33: '华为新加坡',
    DM34: '如果数据跨云（源与目标数据不在相同云下），默认执行集群是在华为新加坡；如果数据不跨云，默认执行集群是在源数据所在区域',
    DM35: '语法参考',
    // Hive2Mysql
    HM1: '只能包含a-z,A-Z,0-9或-或_；开始需为字符，最多60个字符',
    HM2: '快速建表',
    HM3: '返 回',
    HM4: 'sql处理结果集默认以“overwrite”的方式往mysql表写入，此字段标识了mysql表相应地会被清空的数据',
    HM5: '请填写分区标识',
    HM6: '请输入表名称',
    HM7: '--注意时间变量和as转换,具体可查看"提示"11',
    HM8: '--注意时间变量和as转换,具体可查看"提示"22',
    HM9: '请完善信息！',
    // Hive2Clickhouse
    HC1: 'ClickHouse数据源',
    HC2: 'ClickHouse数据库',
    HC3: 'ClickHouse表名称',
    HC4: '根据所选库表,自动获取',
    HC5: '获 取',
    HC6: '分区',
    HC7: '填写字段名称',
    HC8: '填写字段类型',
    HC9: '--注意时间变量和as转换,具体可查看"提示"',
    // lakehouse->doris  Hive2Doris
    HD1: 'Doris数据源',
    HD2: 'Doris数据库',
    HD3: 'Doris表名称',
    // lakehoue->redis
    LR1: 'Redis参数设置',
    LR2: 'Redis服务器',
    LR3: '端口号',
    LR4: '请输入host，比如：192.168.01',
    LR5: '请输入端口号，比如：3306',
    LR6: 'Redis过期时间',
    LR7: '请选择数据源区域',
    LR8: '请输入Redis服务器',
    LR9: '请输入端口号',
    LR10: '请选择Redis过期时间',
    LR11: '--注意时间变量，具体可查看"提示"',
    LR12: '至少包含一个前置依赖',
    // Hive2Redshift
    HR1: 'Redshift参数设置',
    HR2: 'Redshift服务器',
    HR3: '请输入aws redshift地址，比如：http://xxxx.ap_southeast-1.redshift.aws.com',
    HR4: '端口号',
    HR5: '请输入端口号，比如：3306',
    HR6: '请输入aws iam_role信息',
    HR7: '库名',
    HR8: '请输入库名',
    HR9: '请输入Redshift服务器',
    HR10: '请输入端口号',
    HR11: '请输入aws iam_role信息',
    HR12: '请输入库名',
    HR13: '标志路径输入格式有误',
    HR14: '数据依赖偏移量不能为空',
    // Hive2Sharestore
    HS1: '输出数据类型',
    HS2: '数据源类型',
    HS3: 'S3/Obs路径',
    HS4: '例如：s3://shareit.tmp.ap-southeast-1/Default/BDP/dmp/dmp_to_sharestore',
    HS5: '源数据库名称',
    HS6: '查看schema',
    HS7: '填写分区信息',
    HS8: '填写tikv连接地址',
    HS9: '填写目标表名',
    HS10: 'tikv连接地址',
    HS11: '目标表名',
    HS12: 'tikv类型',
    HS13: '请选择tikv类型',
    HS14: 'sharestore连接地址',
    HS15: 'sharestore集群名称',
    HS16: 'sharestore的zookeeper地址',
    HS17: '目标表名(segment)',
    HS18: '源字段类型',
    HS19: '请输入正确的S3/Obs文件路径，以 s3: 或 obs: 开头',
    HS20: '目标表名',
    HS21: '请选择输出数据类型',
    HS22: '请选择数据源类型',
    HS23: '请输入S3/Obs文件路径',
    HS24: '请选择数据集区域',
    HS25: '请输入sharestore连接地址',
    HS26: '请输入sharestore集群名称',
    HS27: '请输入sharestore的zookeeper地址',
    HS28: '请输入目标表名',
    HS29: '请输入tikv连接地址',
    HS30: 'Lakehouse表',
    HS31: 'S3/Obs文件',
    // Hive2File
    HF1: '目标设置',
    HF2: '目标类型',
    HF3: '请输入邮箱,多个邮箱之间用英文逗号分开',
    HF4: '请输入附件格式',
    HF5: '请选择目标类型',
    HF6: '请输入主题',
    HF7: '请输入正文',
    HF8: '请输入附件格式',
    HF9: '请输入邮箱',
    HF10: '请输入正确的邮箱格式,多个邮箱之间用英文逗号分开',
    // flinkJar StreamingJAR
    FJ1: '选择上传Jar版本',
    FJ2: '输入Jar地址',
    FJ3: 'Jar文件',
    FJ4: 'Jar版本',
    FJ5: '请选择Jar文件',
    FJ6: '请选择Jar版本',
    FJ7: 'Jar地址',
    FJ8: 'Attention: 只支持OBS上传的Jar地址，以Https开头',
    FJ9: '--这是一串带代码我想在这折行请手动输入',
    FJ10: '请输入应用名称',
    FJ11: '请选择Jar文件',
    FJ12: '请选择Jar文件版本',
    FJ13: '请输入Jar地址',
    FJ14: '请输入主类名',
    FJ15: '请选择Cluster',
    FJ16: '请输入邮箱',
    FJ17: '请输入topic名称',
    FJ18: '请输入KAFKA集群',
    FJ19: '请输入冷却时间',
    FJ20: '请输入扩缩容忍度',
    FJ21: '请输入最小并行度',
    FJ22: '请输入最大并行度',
    FJ23: '请输入消费者组',
    FJ24: '请输入延迟时间',
    FJ25: '请输入扩缩比例',
    FJ26: '请输入最小延迟条数',
    FJ27: '请输入最大延迟条数',
    FJ28: '请输入正确的Main Class',
    // sparkjar SPARKJAR
    SJ1: '文件类型',
    SJ2: '选择上传版本',
    SJ3: '输入地址',
    SJ4: '文件',
    SJ5: '版本',
    SJ6: '文件地址',
    SJ7: '支持aws s3和华为云obs地址',
    SJ8: '--提示--',
    SJ9: '--这是一串代码我想在这折行请手动输入',
    SJ10: '请选择文件',
    SJ11: '请选择文件版本',
    SJ12: '请输入地址',
    // PythonShell
    PS1: '脚本类型',
    PS2: '请选择脚本类型',
    PS3: '选择镜像',
    PS4: '请输入镜像地址',
    PS5: '镜像地址',
    PS6: '镜像提供了',
    PS7: '任务运行时所需的库、资源、配置等软件包。',
    PS8: '查看配置教程',
    PS9: '请输入镜像地址',
    PS10: '镜像详情',
    PS11: '查看镜像配置',
    PS12: '选择依赖工件',
    PS13: '该工件在镜像中的路径为：/work/依赖文件名称。如果在',
    PS14: '脚本中需要依赖该工件，请直接引用上述路径。',
    PS15: '依赖工件',
    PS16: '工件版本',
    PS17: '没有找到想要的文件？',
    PS18: '上传工件',
    PS19: '请输入执行命令',
    PS20: '编辑模式',
    PS21: '拉取git代码库',
    PS22: '选择git跟目录',
    PS23: '输入子路径',
    PS24: '输入提示：输入git子路径，例如：/a/b/test.py',
    PS25: '拉取git仓库代码',
    PS26: '请选择git跟目录',
    PS27: '请输入子路径',
    PS28: '请先选择当前的Version！',
    // Flink SQL StreamingSQL
    FS1: '输入数据集',
    FS2: '输出数据集',
    FS3: '示例参数如下：',
    FS4: '请选择输入数据集',
    FS5: '请选择输出数据集',
    FS6: '至少包含一个生成数据集',
    HCtip: '请确保目标区域已存在该库名，否则将执行失败'
  }
};
