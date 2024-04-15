import { resourceSearch } from '@/api/cluster';
import store from '../store';

// 任务模块 第一步中的code和path的对应关系
export const taskCodeToPath = {
  StreamingSQL: 'step2FlinkSQL',
  StreamingJAR: 'step2FlinkJar',
  Metis2Hive: 'step2Metis',
  MysqlCDC2Hive: 'step2CDC',
  Mysql2Lakehouse: 'step2Hive',
  Mysql2Hive: 'step2Hive',
  File2Lakehouse: 'step2File',
  Mysql2Hudi: 'step2Hudi',
  Hive2Hive: 'step2HiveSQL',
  DataMigration: 'step2HCCloud',
  SPARKJAR: 'step2SparkJar',
  Hive2Sharestore: 'step2ShareStore',
  Hive2Clickhouse: 'step2ClickHouse',
  Hive2Mysql: 'step2MySql',
  Hive2Doris: 'step2Doris',
  PythonShell: 'step2Shell',
  Db2Hive: 'step2DB',
  Hive2Redis: 'step2Redis',
  Hive2Redshift: 'step2Redshift',
  MergeSmallFiles: 'step2FileMerge',
  Hive2File: 'step2Hive2File',
  TfJob: 'step2TrainingModel'
};
const isCloud = store.getters['isCloud'];
export const dataSetList = [
  {
    title: '数据接入 Data Ingestion',
    list: [
      {
        label: 'DB -> Lakehouse',
        templateCode: 'step2Hive',
        path: 'step2Hive',
        content: '该模板适用于拉取各类关系型DataBase数据到Lakehouse湖仓，提供离线全量和实时增量同步方案。'
      },
      {
        label: 'File -> Lakehouse',
        templateCode: 'File2Lakehouse',
        path: 'step2File',
        content: '该模板适用于将对象存储(如AWS S3、OBS、KS3等)或分布式文件存储(如HDFS等)中存储的各种格式(如csv、json、paruet、orc等)的文件数据同步到Lakehouse湖仓中。'
      },
      {
        label: 'Kafka -> Lakehouse',
        templateCode: 'Metis2Hive',
        path: 'step2Metis',
        content: 'Kafka2Lakehouse统一模板，对接Kafka/Metis，透传至Lakehouse表。',
        isGray: true
      }
    ]
  },
  {
    title: '湖仓处理 Data Transformation',
    list: [
      {
        label: 'Lakehouse -> Lakehouse',
        templateCode: 'Hive2Hive',
        path: 'step2HiveSQL',
        content: '基于Hive SQL/Spark SQL数据处理，不同的执行引擎语法略有差异，请参考官方语法。'
      }
    ]
  },
  {
    title: '数据导出 Data Digestion',
    list: [
      {
        label: 'Lakehouse -> Doris',
        templateCode: 'Hive2Doris',
        path: 'step2Doris',
        content: '用于数据的导出处理，可将数据从Lakehouse导出到Doris中。'
      },
      {
        label: 'Lakehouse -> File',
        templateCode: 'Hive2File',
        path: 'step2Hive2File',
        content: '用于Lakehouse数据导出到文件的任务，可以支持以邮件的方式将文件发送给用户。'
      },
      {
        label: 'Lakehouse -> MySQL',
        templateCode: 'Hive2Mysql',
        path: 'step2MySql',
        content: '用于数据的导出处理，可将数据从Lakehouse导出到MySQL中。'
      },
      {
        label: 'Lakehouse -> ClickHouse',
        content: '用于数据的导出处理，可将数据从Lakehouse导出到ClickHouse中。',
        isGray: true
      },
      {
        label: 'Lakehouse -> Redshift',
        content: '适用于将S3文件中结构化数据映射到Aws Redshift表中的业务场景。',
        isGray: true
      }
    ]
  }
];
export const otherList = [
  {
    title: '数据接入 Data Ingestion',
    list: [
      {
        label: 'Spark Jar',
        templateCode: 'SPARKJAR',
        path: 'step2SparkJar',
        content: '用于湖仓数据的基于Jar包的数据处理，一般用于更加复杂的数据处理逻辑。'
      },
      {
        label: 'Shell/Python脚本',
        templateCode: 'PythonShell',
        path: 'step2Shell',
        content: '用于python和shell脚本任务的执行。'
      }
    ]
  },
  {
    title: '湖仓处理 Lakehouse ETL',
    list: [
      {
        label: 'Flink Jar',
        templateCode: 'StreamingJAR',
        path: 'step2FlinkJar',
        content: '通过上传Flink Jar包的方式，进行流式数据处理。',
        isGray: true
      },
      {
        label: 'Flink SQL',
        templateCode: 'StreamingSQL',
        path: 'step2FlinkSQL',
        content: '流式任务的统一模板，基于SQL查询的方式（Flink SQL）进行数据处理。Metis日志处理，统一归集到此处通过SQL的方式进行处理。',
        isGray: true
      }
    ]
  }
];

// 运行状态颜色
export const statusConfig = {
  CREATED: '#8896B3',
  INITIALIZING: 'rgba(146, 112, 202, 0.8)',
  SCHEDULED: 'rgba(146, 112, 202, 0.8)',
  RUNNING: '#409EFF',
  RESTARTING: '#C6E2FF',
  RECONCILING: '#41F3D8',
  SUSPENDED: '#67C23A',
  CANCELED: '#E6A23C',
  CANCELLING: '#E6A23C',
  FAILED: '#FF5656',
  SUCCESS: '#67C23A',
  FINISHED: '#67C23A',
  FAILLING: '#FCE2E2'
};
// 任务列表运行状态颜色
export const taskStatusConfig = {
  CREATED: '#8896B3',
  INITIALIZING: 'rgba(146, 112, 202, 0.8)',
  SCHEDULED: 'rgba(146, 112, 202, 0.8)',
  RUNNING: '#409EFF',
  CANCELED: '#E6A23C',
  FAILED: '#FF5656',
  SUCCESS: '#67C23A',
  SUSPENDED: '#67C23A',
  FINISHED: '#67C23A',
  OFFLINE: '#dcdfe6'
};
// 运行状态
export const codeToText = {
  CREATED: '已创建',
  INITIALIZING: '已上线',
  SCHEDULED: '已上线',
  RUNNING: '执行中',
  CANCELED: '已取消',
  FAILED: '失败',
  SUCCESS: '成功',
  SUSPENDED: '成功',
  FINISHED: '成功',
  OFFLINE: '已下线'
};
// 离线任务运行状态
export const offlineStateCode = {
  waiting: '检查上游',
  termination: '终止检查上游',
  // waiting_queue: '等待调度队列资源中',
  waiting_queue: '排队中',
  running: '运行中',
  up_for_retry: '等待重试',
  failed: '失败',
  success: '成功'
};
// 实时任务运行状态
export const realtimeStateCode = {
  INITIALIZING: '初始化中',
  CREATED: '已创建',
  RUNNING: '运行中',
  FAILING: '失败中',
  CANCELLING: '取消中',
  RESTARTING: '重启中',
  RECONCILING: '调度中',
  FAILED: '已失败',
  CANCELED: '已下线',
  FINISHED: '已完成',
  SUSPENDED: '已停止'
};
// 数据集分区 region
async function getRegionFn() {
  const { data } = await resourceSearch();
  return data.list.map(item => {
    return { label: item.description, value: item.regionAlias };
  });
}
export const regionList = isCloud
  ? getRegionFn()
  : new Promise((resolve, reject) => {
      resolve([
        { label: 'AWS 美东', value: 'ue1' },
        { label: 'AWS 新加坡', value: 'sg1' },
        { label: '华为 新加坡', value: 'sg2' }
      ]);
    });
// console.log('regionList', regionList);
// export const regionList = [
//   { label: 'AWS 美东', value: 'ue1' },
//   { label: 'AWS 新加坡', value: 'sg1' },
//   { label: '华为 新加坡', value: 'sg2' }
// ];
// 监控等级
export const levelList = [
  { label: 'P0', value: 0 },
  { label: 'P1', value: 1 },
  { label: 'P2', value: 2 },
  { label: 'P3', value: 3 }
];
// 紧急程度
export const feedbackLevelList = {
  GENERAL: '一般',
  SENIOR: '紧急'
};

// 级联选择器最后一层为空数组时，显示暂无数据，修改为最后一层没有数据时，不可展开
export function filterData(data) {
  data.forEach(item => {
    if (item.children && item.children.length > 0) {
      filterData(item.children);
    } else {
      item.children = undefined;
    }
  });
  return data;
}
// 防抖函数
export function debounce(func, wait) {
  let timeout = '';
  return v => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(v);
    }, wait);
  };
}
// 深拷贝对象函数
export function copyFn(obj) {
  if (obj == null) {
    return null;
  }
  var result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        result[key] = copyFn(obj[key]); // 如果是对象，再次调用该方法自身
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

// python/shell镜像的配置信息
export const imageConfig = [
  { package: 'awscli', version: '1.16.263' },
  { package: 'backports.ssl-match-hostname', version: '3.5.0.1' },
  { package: 'boto', version: '2.49.0' },
  { package: 'boto3', version: '1.9.220' },
  { package: 'botocore', version: '1.12.253' },
  { package: 'certifi', version: '2020.12.5' },
  { package: 'chardet', version: '3.0.4' },
  { package: 'colorama', version: '0.4.1' },
  { package: 'docutils', version: '0.15.2' },
  { package: 'futures', version: '3.3.0' },
  { package: 'idna', version: '2.10' },
  { package: 'iniparse', version: '0.4' },
  { package: 'ipaddress', version: '1.0.16' },
  { package: 'jmespath', version: '0.9.5' },
  { package: 'kitchen', version: '1.1.1' },
  { package: 'pip', version: '20.3.3' },
  { package: 'pyasn1', version: '0.4.8' },
  { package: 'pycurl', version: '7.19.0' },
  { package: 'pygobject', version: '3.22.0' },
  { package: 'pygpgme', version: '0.3' },
  { package: 'pyliblzma', version: '0.5.3' },
  { package: 'python-dateutil', version: '2.8.1' },
  { package: 'pyxattr', version: '0.5.1' },
  { package: 'PyYAML', version: '5.1.2' },
  { package: 'requests', version: '2.24.0' },
  { package: 'rsa', version: '3.4.2' },
  { package: 's3transfer', version: '0.2.1' },
  { package: 'setuptools', version: '0.9.8' },
  { package: 'six', version: '1.15.0' },
  { package: 'urlgrabber', version: '3.10' },
  { package: 'urllib3', version: '1.25.11' },
  { package: 'yum-metadata-parser', version: '1.1.4' }
];
// python/shell镜像地址
export const imageAddress = {
  sg2: 'swr.ap-southeast-3.myhuaweicloud.com/shareit-bdp/airflow-business:script_task',
  ue1: '848318613114.dkr.ecr.us-east-1.amazonaws.com/bdp/airflow:script_task',
  sg1: '848318613114.dkr.ecr.ap-southeast-1.amazonaws.com/bdp/workflow:script_task'
};
