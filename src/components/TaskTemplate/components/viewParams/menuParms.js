export default {
  DataMigration: {
    task_info: {
      file: [
        { key: 'isTable', label: '同步类型' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourcePath', label: '源路径' },
        { key: 'filtersFile', label: '过滤该目录下的文件' },
        { key: 'targetRegion', aliasKey: 'targetRegion', label: '目标数据区域' },
        { key: 'targetPath', label: '目标路径' },
        { key: 'deleteMode', label: '删除目标文件' }
      ],
      table: [
        { key: 'isTable', label: '同步类型' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourceDb', label: '源数据库名称' },
        { key: 'sourceTable', label: '源表名称' },
        { key: 'partitions', label: '分区信息' },
        { key: 'targetRegion', aliasKey: 'targetRegion', label: '目标数据区域' },
        { key: 'targetDb', label: '目标数据库名称' },
        { key: 'targetTable', label: '目标表名称' }
      ]
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Db2Hive: {},
  Hive2Clickhouse: {
    task_info: [
      { key: 'runtimeConfig.sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'inputDataset.0.metadata.db', label: '源数据库名称' },
      { key: 'inputDataset.0.metadata.table', label: '源表名称' },
      { key: 'partitions', label: '分区信息' },
      { key: 'targetSource', aliasKey: 'targetSource', label: 'ClickHouse数据源' },
      { key: 'targetDB', label: 'ClickHouse数据库' },
      { key: 'targetTable', label: 'ClickHouse表名称' }
    ],
    field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'columnComment'
      },
      target_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'columnComment'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Hive: {
    task_info: [{ key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' }],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Mysql: {
    task_info: [
      { key: 'runtimeConfig.sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'inputDataset.0.metadata.db', label: '源数据库名称' },
      { key: 'inputDataset.0.metadata.table', label: '源表名称' },
      { key: 'partitions', label: '分区信息' },
      { key: 'targetSource', aliasKey: 'targetSource', label: 'Mysql数据源' },
      { key: 'targetDB', label: 'Mysql数据库' },
      { key: 'targetTable', label: 'Mysql表名称' }
    ],
    field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'columnComment'
      },
      target_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Doris: {
    task_info: [
      { key: 'runtimeConfig.sourceRegion', aliasKey: 'sourceRegion', label: '源数据区域' },
      { key: 'inputDataset.0.metadata.db', label: '源数据库名称' },
      { key: 'inputDataset.0.metadata.table', label: '源表名称' },
      { key: 'partitions', label: '分区信息' },
      { key: 'targetSource', aliasKey: 'targetSource', label: 'Doris数据源' },
      { key: 'targetDB', label: 'Doris数据库' },
      { key: 'targetTable', label: 'Doris表名称' },
      { key: 'executeMode', label: '运行模式' }
    ],
    field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'columnComment'
      },
      target_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Redis: {
    task_info: [
      { key: 'inputDataset.0.metadata.region', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'inputDataset.0.metadata.db', label: '源数据库名称' },
      { key: 'inputDataset.0.metadata.table', label: '源表名称' },
      { key: 'redisAddr', label: 'Redis服务器' },
      { key: 'redisPort', label: '端口号' },
      { key: 'interval', label: '过期时间' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Redshift: {
    task_info: [
      { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'redshiftAddr', label: 'Redshift服务器' },
      { key: 'redshiftPort', label: '端口号' },
      { key: 'redshiftUser', label: 'User' },
      { key: 'redshiftDatabase', label: '库名' }
    ],
    flag: [
      { key: 'outputDataset.0.check', label: '是否生成标志' },
      { key: 'outputDataset.0.location', label: '标志路径' },
      { key: 'outputDataset.0.fileName', label: '检查文件名' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2Sharestore: {
    task_info: {
      ShareStore: [
        { key: 'isSharestore', label: '输出数据类型' },
        { key: 'isHive', label: '源数据类型' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourceDb', label: '源数据库名称' },
        { key: 's3ObsPath', label: 'S3/Obs路径' },
        { key: 'sourceTable', label: '源表名称' },
        { key: 'partitions', label: '分区信息' },
        { key: 'restEndpoint', label: 'sharestore连接地址' },
        { key: 'clusterLoad', label: 'sharestore集群名称' },
        { key: 'zkStr', label: 'sharestore的zookeeper地址' },
        { key: 'segmentLoad', label: '目标表名(segment)' }
      ],
      TiKV: [
        { key: 'isSharestore', label: '输出数据类型' },
        { key: 'isHive', label: '源数据类型' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourceDb', label: '源数据库名称' },
        { key: 's3ObsPath', label: 'S3/Obs路径' },
        { key: 'sourceTable', label: '源表名称' },
        { key: 'partitions', label: '分区信息' },
        { key: 'pdaddr', label: 'tikv连接地址' },
        { key: 'segment', label: '目标表名' },
        { key: 'kvType', label: 'tikv类型' }
      ]
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Metis2Hive: {
    task_info: [
      { key: 'region', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'inputDataset.0.metadata.region', aliasKey: 'sourceRegion', label: '源数据区域' },
      { key: 'runtimeConfig.sourceType', label: '源种类' },
      { key: 'inputDataset.0.metadata.table', label: '源表名称' },
      { key: 'runtimeConfig.topic', label: 'topic' },
      { key: 'runtimeConfig.bootstrapServerUri', label: 'Kafka服务器地址' },
      { key: 'createType', label: '显示元数据方式' },
      { key: 'partitionKeys', label: '分区键' },
      { key: 'outputDataset.0.metadata.region', aliasKey: 'sourceRegion', label: 'Iceberg区域' },
      { key: 'outputDataset.0.metadata.db', label: 'Iceberg数据库' },
      { key: 'outputDataset.0.metadata.table', label: 'Iceberg表名称' }
    ],
    cloumns: {
      key: 'columns',
      label: '字段信息'
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  },
  Mysql2Hive: {
    task_info: {
      single: [
        { key: 'table_type', label: '表类型选择' },
        { key: 'syncType', label: '数据同步方式' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourceId', aliasKey: 'targetSource', label: '源数据源名称' },
        { key: 'sourceDb', label: '源库名' },
        { key: 'sourceTable', label: '源表名' },
        { key: 'targetDb', label: 'LakeHouse库名' },
        { key: 'targetTable', label: 'LakeHouse表名' },
        { key: 'partitions', label: '分区标识' },
        { key: 'filterStr', label: '过滤条件' },
        { key: 'executeMode', label: '运行模式' }
      ],
      more: [
        { key: 'table_type', label: '表类型选择' },
        { key: 'syncType', label: '数据同步方式' },
        { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
        { key: 'sourceId', aliasKey: 'targetSource', label: 'MySQL数据源名称' },
        { key: 'sourceDb', label: 'MySQL库名' },
        { key: 'targetDb', label: 'LakeHouse库名' },
        { key: 'targetTablePart', label: 'LakeHouse表名前缀(可选)' },
        { key: 'partitions', label: '分区标识' },
        { key: 'executeMode', label: '运行模式' }
      ]
    },
    mysql2hive_field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      },
      target_columns: {
        name: 'columnName',
        data_type: 'columnType',
        comment: 'columnComment'
      },
      moreInputColumns: {
        tableName: 'name',
        dbName: 'dbName',
        columns: 'columns'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' },
      { key: 'executeMode', label: '运行模式设置' }
    ]
  },
  Mysql2Hudi: {
    task_info: [
      { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'connectionName', aliasKey: 'targetSource', label: '源数据源名称' },
      { key: 'sourceDb', label: '源数据库名称' },
      { key: 'sourceTable', label: '源表名称' },
      { key: 'partitions', label: '分区信息' },
      { key: 'targetDb', label: '数据库名称' },
      { key: 'targetTable', label: '目标表名称' },
      { key: 'syncType', label: '数据同步方式' }
    ],
    field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      },
      target_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  },
  PythonShell: {
    task_info: [
      { key: 'commandType', label: '脚本类型' },
      { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'image', label: '镜像地址' },
      { key: 'displayDependJars', label: '依赖工件' },
      { key: 'executeMode', label: '运行模式' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  SPARKJAR: {
    task_info: [
      { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'displayDependJars.0.artifactId', aliasKey: 'displayDependJarsJob', label: '文件' },
      { key: 'displayDependJars.0.id', aliasKey: 'displayDependJarsVersion', label: '版本' },
      { key: 'jarUrl', label: '文件地址' },
      { key: 'type', label: '文件类型' },
      { key: 'mainClass', label: 'Main Class' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  Hive2File: {
    task_info: [
      { key: 'runtimeConfig.sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'runtimeConfig.targetType', label: '目标类型' },
      { key: 'runtimeConfig.subject', label: '主题' },
      { key: 'runtimeConfig.text', label: '正文' },
      { key: 'runtimeConfig.email', label: '邮箱' },
      { key: 'runtimeConfig.format', label: '附件格式' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' },
      { key: 'alert', label: '报警类型' }
    ]
  },
  TfJob: {
    task_info: [
      { key: 'runtimeConfig.sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'runtimeConfig.codeAddr', label: '代码位置' },
      { key: 'runtimeConfig.paramFile', label: '训练参数文件' },
      { key: 'runtimeConfig.cpu', label: 'CPU资源' },
      { key: 'runtimeConfig.memory', label: '内存资源' },
      { key: 'runtimeConfig.gpu', label: 'GPU资源' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  },
  StreamingJAR: {
    task_info: [
      { key: 'region', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'displayDependJars.0.artifactId', aliasKey: 'displayDependJarsJob', label: 'Jar文件' },
      { key: 'displayDependJars.0.id', aliasKey: 'displayDependJarsVersion', label: 'Jar版本' },
      { key: 'jarUrl', label: 'Jar地址' },
      { key: 'mainClass', label: 'Main Class' },
      { key: 'flinkClusterId', label: 'Cluster' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  },
  StreamingSQL: {
    task_info: [
      { key: 'region', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'inputDataset.0.completePath', aliasKey: 'completePath', label: '输入数据集' },
      { key: 'outputDataset.0.completePath', aliasKey: 'completePath', label: '输出数据集' }
    ],
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  },
  File2Lakehouse: {
    task_info: [
      { key: 'sourceRegion', aliasKey: 'sourceRegion', label: '区域' },
      { key: 'sourceType', label: '数据源类型' },
      { key: 'sourceParam.provider.path', label: '文件路径' },
      { key: 'sourceParam.provider.fileType', label: '文件类型' },
      { key: 'sourceParam.provider.fieldDelimiter', label: '字段分隔符' },
      { key: 'targetDb', label: 'LakeHouse库名' },
      { key: 'targetTable', label: 'LakeHouse表名' },
      { key: 'partitions', label: '分区标识' },
      { key: 'taskParam.tableComment', label: '表描述' },
      { key: 'taskParam.tableLevel', label: '安全级别' },
      { key: 'taskParam.location', label: 'Location' }
    ],
    field_map: {
      source_columns: {
        name: 'name',
        data_type: 'data_type',
        comment: 'comment'
      },
      target_columns: {
        name: 'columnName',
        data_type: 'columnType',
        security_level: 'securityLevel',
        comment: 'columnComment'
      }
    },
    config_info: [
      { key: 'name', label: '任务名称' },
      { key: 'description', label: '任务描述' },
      { key: 'triggerParam.isIrregularSheduler', label: '调度方式' },
      { key: 'triggerParam.outputGranularity', label: '调度周期' },
      { key: 'triggerParam.crontabParam.range', label: '指定时间' },
      { key: 'triggerParam.crontabParam.startTime', label: '开始时间' },
      { key: 'triggerParam.crontabParam.interval', label: '时间间隔' },
      { key: 'triggerParam.crontabParam.endTime', label: '结束时间' },
      { key: 'triggerParam.crontabParam.fixedTime', label: '定时调度时间' },
      { key: 'triggerParam.crontab', label: 'cron表达式' }
    ]
  }
};
