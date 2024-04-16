export default [
  {
    title: '数据接入类',
    icon: 'DI',
    list: [
      {
        label: 'DB -> Lakehouse',
        templateCode: 'Mysql2Hive',
        path: 'step2Hive',
        content: '用于拉取MySql数据到Lakehouse数仓，供后续的Lakehouse数据分析及相关数据的使用。'
      }
    ]
  },
  {
    title: '湖仓处理类',
    icon: 'DT',
    list: [
      {
        label: 'Lakehouse -> Lakehouse',
        templateCode: 'Hive2Hive',
        path: 'step2HiveSQL',
        content: '基于Spark SQL进行数据处理，此方式不支持跨云逻辑。'
      }
      // {
      //   label: 'Lakehouse Cross Region',
      //   templateCode: 'DataMigration',
      //   path: 'step2HCCloud',
      //   content: '用于数仓数据的跨云数据同步，要求所同步的数据模型一致。'
      // }
    ]
  },
  {
    title: '数据导出类',
    icon: 'DD',
    list: [
      // {
      //   label: 'Lakehouse -> ClickHouse',
      //   templateCode: 'Hive2Clickhouse',
      //   path: 'step2ClickHouse',
      //   content: '用于数据的导出处理，可将数据从Lakehouse导出到ClickHouse中。'
      // },
      {
        label: 'Lakehouse -> MySql',
        templateCode: 'Hive2Mysql',
        path: 'step2MySql',
        content: '用于数据的导出处理，可将数据从Lakehouse导出到MySql中。'
      },
      {
        label: 'Lakehouse -> Doris',
        templateCode: 'Hive2Doris',
        path: 'step2Doris',
        content: '用于数据的导出处理，可将数据从LakeHouse导出到Doris中。'
      }
      // {
      //   label: 'Lakehouse -> Redis',
      //   templateCode: 'Hive2Redis',
      //   path: 'step2Redis',
      //   content: '可将湖仓数据（暂支持Lakehouse）导出到Redis数据库，适用于业务数据缓存场景。'
      // },
      // {
      //   label: 'Lakehouse -> Redshift',
      //   templateCode: 'Hive2Redshift',
      //   path: 'step2Redshift',
      //   content: '适用于将S3文件中结构化数据映射到Aws Redshift表中的业务场景。'
      // }
      // {
      //   label: 'Lakehouse -> ShareStore/TiKV',
      //   templateCode: 'Hive2Sharestore',
      //   path: 'step2ShareStore',
      //   content: '用于数据的导出处理，可将数据从Lakehouse导入到ShareStore/TiKV中。'
      // }
    ]
  },
  {
    title: '通用',
    icon: 'Ot',
    list: [
      {
        label: 'Shell/Python脚本',
        templateCode: 'PythonShell',
        path: 'step2Shell',
        content: '用于python和shell脚本任务的执行。'
      },
      {
        label: 'Spark Jar',
        templateCode: 'SPARKJAR',
        path: 'step2SparkJar',
        content: '用于数仓数据的基于Jar包的数据处理，一般用于更加复杂的数据处理逻辑。'
      }
    ]
  }
];
