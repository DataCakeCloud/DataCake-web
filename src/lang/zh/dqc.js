export default {
  dqc: {
    statusList: [
      {
        name: '触发报警',
        value: 'SUCCESS'
      },
      {
        name: '未触发报警',
        value: 'FAILED'
      },
      {
        name: '未执行',
        value: 'NOT_RUNNING'
      }
    ],
    ruleTypeList: [
      {
        name: '字段级',
        value: 'FIELD'
      },
      {
        name: '表级',
        value: 'TABLE'
      }
    ],
    checkTypeList: [
      {
        name: '波动率型',
        value: 'RATIO'
      },
      {
        name: '数值型',
        value: 'NUMBER'
      }
    ],
    checkActionList: {
      NUMBER: [
        {
          name: '固定值',
          value: 'FIXED_VALUE'
        },
        {
          name: '1天差值',
          value: 'DIFF_DAY1'
        }
      ],
      RATIO: [
        {
          name: '与1天前比较',
          value: 'RATIO_DAY1'
        },
        {
          name: '与7天前比较',
          value: 'RATIO_DAY7'
        },
        {
          name: '与30天前比较',
          value: 'RATIO_DAY30'
        }
      ]
    },
    activeList: [
      {
        name: '启动',
        value: 1
      },
      {
        name: '关闭',
        value: 0
      }
    ],
    fieldTypeList: ['STRING', 'INT', 'FLOAT', 'DATETIME'],
    dataSourceList: [
      {
        name: 'Clickhouse',
        value: 'clickhouse'
      },
      {
        name: 'Hive',
        value: 'hive'
      }
    ],
    checkOperatorList: {
      NUMBER: [
        {
          name: '>',
          value: 'GREATER_THAN'
        },
        {
          name: '>=',
          value: 'GREATER_OR_EQUAL'
        },
        {
          name: '=',
          value: 'EQUAL'
        },
        {
          name: '!=',
          value: 'NOT_EQUAL'
        },
        {
          name: '<',
          value: 'LESS_THAN'
        },
        {
          name: '<=',
          value: 'LESS_OR_EQUAL'
        }
      ],
      RATIO: [
        {
          name: '上升',
          value: 'RISE'
        },
        {
          name: '下降',
          value: 'DECLINE'
        },
        {
          name: '绝对值',
          value: 'ABS'
        }
      ]
    },
    ruleMandatoryList: [
      {
        name: '弱',
        value: 'WEAK'
      },
      {
        name: '强',
        value: 'STRONG'
      }
    ],
    projectList: ['广告中心', '矩阵产品中心', '互金', 'SHAREit产品', 'Project X', 'Porject Y', 'SHAREit Lite', 'BDP', '其它'],
    ruleFromList: [
      {
        name: '平台',
        value: 'PLATFORM'
      },
      {
        name: '自定义',
        value: 'CUSTOM'
      }
    ],
    ruleOperatorsList: [
      {
        name: '与',
        value: 'AND'
      },
      {
        name: '或',
        value: 'OR'
      }
    ]
  }
};
