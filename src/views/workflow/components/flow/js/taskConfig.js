const otherList = [
  {
    title: '数据接入 Data Ingestion',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Flink SQL',
        type: 'StreamingSQL',
        path: 'step2FlinkSQL',
        content: '流式任务的统一模板，基于SQL查询的方式（Flink SQL）进行数据处理。Metis日志处理，统一归集到此处通过SQL的方式进行处理。',
        component() {
          return import('@/components/TaskTemplate/StreamingSQL');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Shell/Python脚本',
        type: 'PythonShell',
        path: 'step2Shell',
        content: '用于python和shell脚本任务的执行。',
        component() {
          return import('@/components/TaskTemplate/PythonShell');
        }
      }
    ]
  },
  {
    title: '湖仓处理 Lakehouse ETL',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Flink Jar',
        type: 'StreamingJAR',
        path: 'step2FlinkJar',
        content: '通过上传Flink Jar包的方式，进行流式数据处理。',
        component() {
          return import('@/components/TaskTemplate/StreamingJAR');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: '批量入仓（DB->Hive）',
        type: 'Mysql2Hudi',
        path: 'step2Hudi',
        content: '支持MySql/Tidb数据批量入库，生成源表天/小时级镜像分区，天/小时延时。',
        component() {
          return import('@/components/TaskTemplate/Mysql2Hudi');
        }
      }
    ]
  },
  {
    title: '数据导出 Data Digestion',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Hive -> ShareStore/TiKV',
        type: 'Hive2Sharestore',
        path: 'step2ShareStore',
        content: '用于数据的导出处理，可将数据从hive导入到ShareStore/TiKV中。',
        component() {
          return import('@/components/TaskTemplate/Hive2Sharestore');
        }
      }
    ]
  }
];
const dataSetList = [
  {
    title: '数据接入 Data Ingestion',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'MySql -> Hive',
        type: 'Mysql2Hive',
        path: 'step2Hive',
        content: '用于拉取MySql数据到hive数仓，供后续的hive数据分析及相关数据的使用，所有入hive的数据均通过此进行数据处理。',
        component() {
          return import('@/components/TaskTemplate/Mysql2Hive');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Kafka -> Hive',
        type: 'Metis2Hive',
        path: 'step2Metis',
        content: 'Kafka2Hive统一模板，对接Kafka/Metis，透传至Hive表。',
        component() {
          return import('@/components/TaskTemplate/Metis2Hive');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: '流式入仓（DB->Hive）',
        type: 'Db2Hive',
        path: 'step2DB',
        content: '支持Mysql/Tidb数据增量入库，数据自动Merge、小文件合并，生产源库实时镜像表，秒级延迟。',
        component() {
          return import('@/components/TaskTemplate/Db2Hive');
        }
      }
    ]
  },
  {
    title: '湖仓处理 Data Transformation',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: '湖仓数据处理（Hive -> Hive SQL）',
        type: 'Hive2Hive',
        path: 'step2HiveSQL',
        content: '基于Spark SQL进行数据处理，此方式不支持跨云逻辑。',
        component() {
          return import('@/components/TaskTemplate/Hive2Hive');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: '跨区域同步（Hive -> Hive Cross Region）',
        type: 'DataMigration',
        path: 'step2HCCloud',
        content: '用于数仓数据的跨云数据同步，可支持数据进行跨云数据同步。此要求所同步的数据及模型一致。',
        component() {
          return import('@/components/TaskTemplate/DataMigration');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Spark Jar',
        type: 'SPARKJAR',
        path: 'step2SparkJar',
        content: '用于数仓数据的基于Jar包的数据处理，一般用于更加复杂的数据处理逻辑。',
        component() {
          return import('@/components/TaskTemplate/SPARKJAR');
        }
      }
    ]
  },
  {
    title: '数据导出 Data Digestion',
    list: [
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Hive -> ClickHouse',
        type: 'Hive2Clickhouse',
        path: 'step2ClickHouse',
        content: '用于数据的导出处理，可将数据从hive导入到ClickHouse中。',
        component() {
          return import('@/components/TaskTemplate/Hive2Clickhouse');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Hive -> MySql',
        type: 'Hive2Mysql',
        path: 'step2MySql',
        content: '用于数据的导出处理，可将数据从hive导入到MySql中。',
        component() {
          return import('@/components/TaskTemplate/Hive2Mysql');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Hive -> Redis',
        type: 'Hive2Redis',
        path: 'step2Redis',
        content: '可将湖仓数据（暂支持hive）导出到Redis数据库，适用于业务数据缓存场景。',
        component() {
          return import('@/components/TaskTemplate/Hive2Redis');
        }
      },
      {
        logo: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        label: 'Hive -> Redshift',
        type: 'Hive2Redshift',
        path: 'step2Redshift',
        content: '适用于将S3文件映射到Aws Redshift表中的业务场景。',
        component() {
          return import('@/components/TaskTemplate/Hive2Redshift');
        }
      }
    ]
  }
];

export default [...dataSetList, ...otherList];
