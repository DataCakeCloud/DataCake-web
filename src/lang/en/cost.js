export default {
  cost: {
    chartMenuList: ['department', 'pu'],
    typeList: [
      {
        name: '新任务',
        value: 1
      },
      {
        name: '同比分析',
        value: 2
      },
      {
        name: '环比分析',
        value: 3
      }
    ],
    dimensionList: [
      {
        name: '部门',
        value: 1
      },
      {
        name: 'PU',
        value: 2
      },
      {
        name: 'owner',
        value: 3
      },
      {
        name: '任务',
        value: 4
      }
    ],
    trendList: [],
    dayList: [
      {
        name: '每天',
        value: '0'
      },
      {
        name: '周一',
        value: '1'
      },
      {
        name: '周二',
        value: '2'
      },
      {
        name: '周三',
        value: '3'
      },
      {
        name: '周四',
        value: '4'
      },
      {
        name: '周五',
        value: '5'
      },
      {
        name: '周六',
        value: '6'
      },
      {
        name: '周天',
        value: '7'
      }
    ],
    scopeList: [
      {
        name: '所有任务',
        value: 1
      },
      {
        name: '自定义',
        value: 2
      }
    ],

    lesseeList: [
      {
        name: '全部租户',
        value: ''
      }
    ],
    dateTypeList: [
      {
        name: '每日',
        value: 0
      },
      {
        name: '每月',
        value: 1
      }
    ],
    shortcuts: [
      {
        id: 1,
        text: '自定义',
        time() {
          const date = new Date().getTime();
          return [date - 86400 * 8 * 1000, date - 86400 * 2 * 1000];
        }
      },
      {
        id: 2,
        text: '最近 30 天',
        time() {
          const date = new Date().getTime();
          return [date - 86400 * 30 * 1000, date - 86400 * 1000];
        }
      },
      {
        id: 3,
        text: '最近 90 天',
        time() {
          const date = new Date().getTime();
          return [date - 86400 * 90 * 1000, date - 86400 * 2 * 1000];
        }
      }
    ],

    homeDayTypeList: [
      {
        name: '上月',
        value: 3
      },
      {
        name: '本月',
        value: 1
      },
      {
        name: 'T-2',
        value: 2
      }
    ],

    filterList: [
      {
        name: '计费项',
        value: 1,
        active: false,
        field: 'costTypes',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '租户',
        value: 2,
        active: false,
        field: 'tenants',
        type: 1,
        shortName: '',
        dimensionality: 1,
        isTenant: 2
      },
      {
        name: '业务线',
        value: 15,
        active: false,
        field: 'pus',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: 'Group',
        value: 3,
        active: false,
        field: 'groups',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: 'Owner',
        value: 4,
        active: false,
        field: 'owner',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '任务',
        value: 5,
        active: false,
        field: 'jobs',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '任务标签',
        value: 6,
        active: false,
        field: 'jobTags',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '任务模式',
        value: 7,
        active: false,
        field: 'jobModels',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '桶 Group',
        value: 8,
        active: false,
        field: 'bucketGroups',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '桶',
        value: 9,
        active: false,
        field: 'bucketNames',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '查询 ID',
        value: 10,
        active: false,
        field: 'queryIds',
        type: 0,
        dimensionality: 1,
        isTenant: 1
      },
      {
        name: '机型',
        value: 11,
        active: false,
        field: 'instanceNames',
        type: 1,
        shortName: '',
        dimensionality: 2,
        isTenant: 2
      },
      {
        name: '集群',
        value: 12,
        active: false,
        field: 'clusters',
        type: 0,
        dimensionality: 2,
        isTenant: 1
      },
      {
        name: '其他计费项',
        value: 13,
        active: false,
        field: 'shares',
        type: 1,
        shortName: '',
        dimensionality: 2,
        isTenant: 2
      },
      {
        name: '区域',
        value: 14,
        active: false,
        field: 'regions',
        type: 0,
        dimensionality: 2,
        isTenant: 1
      }
    ]
  }
};
