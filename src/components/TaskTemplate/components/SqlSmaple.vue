<template>
  <div class="sql-smaple">
    <!-- {{ text }} -->
    <!--  popper-class="sql-popper" -->
    <el-popover class="sql-tips" placement="bottom" width="900" trigger="click">
      <!-- <img v-if="name === 'flink_sql'" src="@/assets/flink_sql.png" alt="sql样例" /> -->
      <!-- <img v-else-if="name === 'hive_sql'" src="@/assets/hive_sql.png" alt="sql样例" /> -->
      <img v-if="name === 'metis_sql'" src="@/assets/metis_sql.png" alt="sql样例" />
      <div v-else class="monaco-editor-wrap">
        <monaco-editor ref="monaco" v-model="content" :read-only="true"></monaco-editor>
      </div>
      <i slot="reference" class="el-icon-info"></i>
    </el-popover>
  </div>
</template>
<script>
import MonacoEditor from '@/components/MonacoEditor/index';

export default {
  name: 'SqlSmaple',
  components: {
    MonacoEditor
  },
  props: {
    name: {
      type: String,
      default: 'flink_sql'
    }
  },
  computed: {
    text() {
      let text = '在下方填写SQL，包含insert，overwrite等，还有一些别的Tips';
      if (this.name === 'redshift_sql') {
        text = '在下方填写要执行的sql语句，可参考示例';
      } else if (this.name === 'redis_sql') {
        text = '在下方填写要执行sql语句，只支持写sql查询语句，示例';
      }
      return text;
    },
    content() {
      let content;
      const db = '${db}';
      const table_name = '${table_name}';
      if (['clickhouse_sql', 'mysql_sql'].includes(this.name)) {
        content = `--注意时间变量和as转换，具体可查看"提示"
SELECT
  beyla_id as \${destination_field_name} ---\${destination_field_name}代表目标表对应字段名称，下同
  user_id as \${destination_field_name}，
  device_id as \${destination_field_name}，
FROM
 ${db}.${table_name}
WHERE
  dt = '{{ yesterday_ds_nodash }}'`;
      } else if (this.name === 'flink_sql') {
        content = `# 1.添加依赖(如果有)
set flink.execution.packages=org.apache.flink:flink-connector-jdbc_2.11:1.11.0,mysql:mysql-connector-java:5.1.6,org.apache.flink:flink-connector-kafka_2.11:1.11.0;
# 2.注册UDF(如果有)
# 3.source DDL
DROP TABLE IF EXISTS read_from_kafka;
Create table read_from_kafka(
\`AnrMsg\` String,
\`AnrCpuStatus\` String,
\`AnrMsgQueue\` String,
\`AnrTrace\` String,
\`AnrDecodedTrace\` String,
\`AnrTraceId\` String,
\`ProblemPos\` String
)  WITH (
   'connector' = 'kafka',
   'topic' = 'bdp_medusa_crash',
   'properties.bootstrap.servers' = 'prod.crash.medusa.bdp.sg2.mq:9092',
   'properties.group.id' = 'bdp_medusa_crash',
--    'scan.startup.mode' = 'latest-offset',
   'format' = 'json'
);
# 4.sink DDL
Create table sink_to_mysql(
)with();
# 5.写入sink逻辑
insert into sink_to_mysql select * from read_from_kafka; `;
      } else if (this.name === 'hive_sql') {
        content = `/* =====DEMO-针对目标表不存在，支持创建iceberg表===== */
---先建表,此步骤为可选
CREATE TABLE IF NOT EXISTS test.zptest4(
  name STRING ,
  age STRING ,
  dt STRING
) 
PARTITIONED BY (dt) 
---写入逻辑
INSERT
  OVERWRITE TABLE test.zptest4 PARTITION(dt = '{{ yesterday_ds_nodash }}')
SELECT pageid, age, count(1) 
FROM source_database.source_table_name
WHERE dt = '{{ yesterday_ds_nodash }}'
GROUP BY pageid, age`;
      } else if (this.name === 'redshift_sql') {
        content = `---示例
---创建临时表
CREATE temp TABLE XXXXX (day varchar(64), hour varchar(64),
country varchar(200),... ) WITH OIDS ;
---指定S3路径、iam_role信息及存储格式
copy XXXXX from 's3://XXXX/XXXX/dt=2022032904'
iam_role 'arn:aws:iam::848318613114:role/XXXXXX'
FORMAT AS PARQUET statupdate on;
---写入redshift下游表
delete from db.tableXXXX where dt='2022032904';
insert into db.tableXXXX (day,hour,country,...) select .... from XXXXX;
drop table XXXXX;
commit;`;
      } else if (this.name === 'redis_sql') {
        content = `/* =====示例DEMO===== */
select
  Name,
  age,
  score
from
  student
where
  dt = '{{ yesterday_ds_nodash }}'`;
      }
      return content;
    }
  }
};
</script>
<style lang="scss" scoped>
.sql-smaple {
  position: absolute;
  top: -27px;
  font-size: $global-font-size-12;
  border: 1px solid #91d5ff;
  background: #e6f7ff;
  color: #888;
  padding: 4px 10px;
  border-radius: 2px;
  .el-icon-info {
    color: #108ee9;
    font-size: $global-font-size-16;
    position: relative;
    top: 1px;
    cursor: pointer;
  }
}
.monaco-editor-wrap {
  height: 380px;
}
</style>
