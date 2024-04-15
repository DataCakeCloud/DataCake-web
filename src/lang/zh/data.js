export default {
  data: {
    boolean: [
      {
        label: '是',
        value: true
      },
      {
        label: '否',
        value: false
      }
    ],
    booleanNum: [
      {
        label: '是',
        value: 1
      },
      {
        label: '否',
        value: 0
      }
    ],
    weekdays: [
      { label: '周一', value: '1' },
      { label: '周二', value: '2' },
      { label: '周三', value: '3' },
      { label: '周四', value: '4' },
      { label: '周五', value: '5' },
      { label: '周六', value: '6' },
      { label: '周日', value: '7' }
    ],
    days: [
      { label: '01', value: '1' },
      { label: '02', value: '2' },
      { label: '03', value: '3' },
      { label: '04', value: '4' },
      { label: '05', value: '5' },
      { label: '06', value: '6' },
      { label: '07', value: '7' },
      { label: '08', value: '8' },
      { label: '09', value: '9' },
      { label: '10', value: '10' },
      { label: '11', value: '11' },
      { label: '12', value: '12' },
      { label: '13', value: '13' },
      { label: '14', value: '14' },
      { label: '15', value: '15' },
      { label: '16', value: '16' },
      { label: '17', value: '17' },
      { label: '18', value: '18' },
      { label: '19', value: '19' },
      { label: '20', value: '20' },
      { label: '21', value: '21' },
      { label: '22', value: '22' },
      { label: '23', value: '23' },
      { label: '24', value: '24' },
      { label: '25', value: '25' },
      { label: '26', value: '26' },
      { label: '27', value: '27' },
      { label: '28', value: '28' },
      { label: '29', value: '29' },
      { label: '30', value: '30' },
      { label: '31', value: '31' },
      { label: 'L', value: 'L' }
    ],
    hours: [
      { label: '00', value: '0' },
      { label: '01', value: '1' },
      { label: '02', value: '2' },
      { label: '03', value: '3' },
      { label: '04', value: '4' },
      { label: '05', value: '5' },
      { label: '06', value: '6' },
      { label: '07', value: '7' },
      { label: '08', value: '8' },
      { label: '09', value: '9' },
      { label: '10', value: '10' },
      { label: '11', value: '11' },
      { label: '12', value: '12' },
      { label: '13', value: '13' },
      { label: '14', value: '14' },
      { label: '15', value: '15' },
      { label: '16', value: '16' },
      { label: '17', value: '17' },
      { label: '18', value: '18' },
      { label: '19', value: '19' },
      { label: '20', value: '20' },
      { label: '21', value: '21' },
      { label: '22', value: '22' },
      { label: '23', value: '23' }
    ],
    minutes: [
      { label: '00', value: '0' },
      { label: '01', value: '1' },
      { label: '02', value: '2' },
      { label: '03', value: '3' },
      { label: '04', value: '4' },
      { label: '05', value: '5' },
      { label: '06', value: '6' },
      { label: '07', value: '7' },
      { label: '08', value: '8' },
      { label: '09', value: '9' },
      { label: '10', value: '10' },
      { label: '11', value: '11' },
      { label: '12', value: '12' },
      { label: '13', value: '13' },
      { label: '14', value: '14' },
      { label: '15', value: '15' },
      { label: '16', value: '16' },
      { label: '17', value: '17' },
      { label: '18', value: '18' },
      { label: '19', value: '19' },
      { label: '20', value: '20' },
      { label: '21', value: '21' },
      { label: '22', value: '22' },
      { label: '23', value: '23' },
      { label: '24', value: '24' },
      { label: '25', value: '25' },
      { label: '26', value: '26' },
      { label: '27', value: '27' },
      { label: '28', value: '28' },
      { label: '29', value: '29' },
      { label: '30', value: '30' },
      { label: '31', value: '31' },
      { label: '32', value: '32' },
      { label: '33', value: '33' },
      { label: '34', value: '34' },
      { label: '35', value: '35' },
      { label: '36', value: '36' },
      { label: '37', value: '37' },
      { label: '38', value: '38' },
      { label: '39', value: '39' },
      { label: '40', value: '40' },
      { label: '41', value: '41' },
      { label: '42', value: '42' },
      { label: '43', value: '43' },
      { label: '44', value: '44' },
      { label: '45', value: '45' },
      { label: '46', value: '46' },
      { label: '47', value: '47' },
      { label: '48', value: '48' },
      { label: '49', value: '49' },
      { label: '50', value: '50' },
      { label: '51', value: '51' },
      { label: '52', value: '52' },
      { label: '53', value: '53' },
      { label: '54', value: '54' },
      { label: '55', value: '55' },
      { label: '56', value: '56' },
      { label: '57', value: '57' },
      { label: '58', value: '58' },
      { label: '59', value: '59' }
    ],
    timeUnits: [
      { label: '每小时', value: 'hourly' },
      { label: '每天', value: 'daily' },
      { label: '每周', value: 'weekly' },
      { label: '每月', value: 'monthly' }
    ],

    status: [
      {
        label: '无效',
        value: 0
      },
      {
        label: '有效',
        value: 1
      }
    ],
    regionList: [
      { label: '全部', value: '' },
      { label: 'AWS 美东', value: 'ue1' },
      { label: 'AWS 新加坡', value: 'sg1' },
      { label: '华为 新加坡', value: 'sg2' }
    ],
    enumerateText: ['root', 'test', 'NULL', 'null', '', ' ', 'bdp', 'test123', 'lakecat'],
    sqlExam: `
-- CREATE TABLE TEMPLATE
-- 左侧必填：创建区域、数据源类型、库名、表名、location、fileformat。
-- SQL窗口定义schema和分区即可，选填：字段 COMMENT 注释，表  COMMENT 注释，location 自定义示例：s3(obs)示例："s3://bucket/../databaseName/tableName"
CREATE EXTERNAL TABLE IF NOT EXISTS dbname.tablename (
  id string COMMENT 'ID' ,
  name string COMMENT '名称'
)
COMMENT '测试表'
PARTITIONED BY ( \`dt\` string COMMENT '分区时间yyyy-MM-dd')
    `,
    tagVisiteText: {
      name: '在过去30天内，该数据集的访问频次在',
      list: ['[0, 3] 区间，为访问频次低；', '(3, 28] 区间，为访问频次中等；', '(28,+∞) 区间，为访问频次高；']
    },
    tagStoreText: ['存储量低：存储量范围0-15.9G；', '存储量中等：存储量范围15.9G-2556.6G；', '存储量高：存储量大于2556.6G；'],
    tagSourceText: {
      CPU使用率高: '在T-1时，该任务的cpu使用率在(79.2%, 100%] 区间，为cpu使用率高；',
      CPU使用率中等: '在T-1时，该任务的cpu使用率在(32％, 79.2%] 区间，为cpu使用率中等；',
      CPU使用率低: '在T-1时，该任务的cpu使用率在[0, 32％] 区间，为cpu使用率低；',
      内存使用率高: '在T-1时，该任务的内存使用率在(54%, 100%] 区间，为内存使用率高；',
      内存使用率中等: '在T-1时，该任务的内存使用率在(25％, 54%] 区间，为内存使用率中等；',
      内存使用率低: '在T-1时，该任务的内存使用率在[0, 25％] 区间，为内存使用率低；',
      用量大: '在T-1时，该任务的用量在(73, +∞] 区间，为用量大；',
      用量中等: '在T-1时，该任务的用量在(10, 73] 区间，为用量中等；',
      用量小: '在T-1时，该任务的用量在[0, 10] 区间，为用量小；',
      任务评分低: '在T-1时，该任务的评分在[0, 26.62] 区间，为任务评分低；',
      任务评分中等: '在T-1时，该任务的评分在(26.62, 56.23] 区间，为任务评分中等；',
      任务评分高: '在T-1时，该任务的评分在(56.23, 100] 区间，为任务评分高；'
    },
    tagConfig: {
      用量大: 'danger',
      用量中等: 'warning',
      用量小: 'success',
      CPU使用率高: 'success',
      CPU使用率中等: 'warning',
      CPU使用率低: 'danger',
      内存使用率高: 'success',
      内存使用率中等: 'warning',
      内存使用率低: 'danger',
      任务评分低: 'danger',
      任务评分中等: 'warning',
      任务评分高: 'success',
      数据倾斜: 'danger'
    },
    cycle: [
      {
        name: '1天',
        value: '1'
      },
      {
        name: '1周',
        value: '2'
      },
      {
        name: '1个月',
        value: '3'
      },
      {
        name: '3个月',
        value: '4'
      },
      {
        name: '永久',
        value: '5'
      }
    ]
  }
};
