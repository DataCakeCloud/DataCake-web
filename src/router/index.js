import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

/* Layout */
import Layout from '@/layout';
import Home from '@/views/dashboard/index';
import Official from '@/views/official/index';
import Login from '@/login/login/index';
import MFA from '@/login/mfa/index';
import RetrievePassword from '@/login/retrievePassword/index';
import Guidance from '@/login/guidance/index';
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);

export const constantRoutes = [
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    meta: { cnName: '404页面' },
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    meta: { title: 'home', isAdmin: false, icon: 'dashboard', cnName: '概览页' },
    children: [
      {
        path: '/',
        name: 'Official',
        component: Official,
        meta: { title: 'index', cnName: '官网' },
        hidden: true
      },
      {
        path: 'home',
        name: 'Dashboard',
        component: Home,
        meta: { title: 'home', cnName: '概览页' }
      }
    ]
  },
  {
    hidden: true,
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { cnName: '登录页' }
  },
  {
    hidden: true,
    path: '/mfa',
    name: 'MFAVerify',
    component: MFA,
    meta: { cnName: 'MFA 验证' }
  },
  {
    hidden: true,
    path: '/retrieve-password/:id',
    name: 'RetrievePassword',
    component: RetrievePassword,
    meta: { cnName: '找回密码' }
  },
  {
    hidden: true,
    path: '/guidance',
    name: 'Guidance',
    component: Guidance,
    meta: { cnName: '模式选择' }
  }
  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
];
export const asyncRouterMap = [
  {
    path: '/data-analysis',
    name: 'DataAnalysis',
    component: Layout,
    redirect: '/data-analysis/query',
    meta: { title: 'dataAnalysis', isAdmin: false, icon: 'dataAnalysis' },
    children: [
      {
        path: 'query',
        name: 'DataQuery',
        component: () => import('@/views/dataAnalysis/query/index'),
        // meta: { title: 'dataAnalysis', icon: 'dataQuery', cnName: '数据查询' }
        meta: { title: 'searchSql', isAdmin: false, cnName: '数据查询' }
      },
      {
        path: 'chartManagement',
        name: 'chartManagement',
        component: () => import('@/views/dataAnalysis/chartManagement/index'),
        meta: { title: 'chartManagement', isAdmin: false, cnName: '可视化图表' },
        hidden: true
      },
      {
        path: 'dashboardManagement',
        name: 'dashboardManagement',
        component: () => import('@/views/dataAnalysis/dashboardManagement/index'),
        meta: { title: 'dashboardManagement', isAdmin: false, cnName: '仪表盘' },
        hidden: true
      }
    ]
  },
  {
    path: '/meta',
    component: Layout,
    redirect: '/meta/list',
    meta: { title: 'metadata', isAdmin: false, icon: 'meta' },
    children: [
      {
        path: 'list',
        name: 'MetaData',
        component: () => import('@/views/metadata/list'),
        meta: { title: 'metadataList', cnName: '数据目录' }
      },
      {
        path: 'detail',
        name: 'MetaDataDetail',
        component: () => import('@/views/metadata/detail'),
        meta: { title: 'metadataDetail', cnName: '数据详情' },
        hidden: true
      },
      {
        path: 'step',
        name: 'MetaDataStep',
        component: () => import('@/views/metadata/step'),
        meta: { title: 'createTable', cnName: '创建元数据' },
        hidden: true
      },
      {
        path: 'model',
        name: 'Model',
        component: () => import('@/views/metadata/model'),
        meta: { cnName: '模型管理', title: 'metadataModel' }
      },
      {
        path: 'dbManage',
        name: 'DbManage',
        component: () => import('@/views/metadata/mangageDB'),
        meta: { cnName: '库管理', title: 'dbManage' }
      }
    ]
  },
  {
    path: '/task',
    name: 'Task',
    component: Layout,
    redirect: '/task/list',
    meta: { title: 'taskNav', isAdmin: false, icon: 'develop' },
    children: [
      {
        path: 'list',
        name: 'TaskList',
        component: () => import('@/views/task/list'),
        // meta: { title: 'task', icon: 'task', cnName: '任务列表' }
        meta: { title: 'task', cnName: '任务列表' }
      },
      {
        path: 'workflow',
        name: 'Workflow',
        component: () => import('@/views/workflow/list'),
        // meta: { title: 'Workflow', icon: 'WorkflowIcon', cnName: '工作流管理' }
        meta: { title: 'workflow', cnName: '工作流管理' }
      },
      {
        path: 'offlineDetail',
        name: 'OfflineDetail',
        component: () => import('@/views/task/offlineDetail/index'),
        meta: { title: 'offlineDetail', cnName: '离线实例运维' }
      },
      {
        path: process.env.VUE_APP_JH_URL,
        // meta: { title: 'jupyterhub', icon: 'link', cnName: 'jupyterhub' }
        meta: { title: 'jupyterhub', cnName: 'jupyterhub' },
        hidden: true
      },
      {
        path: 'detail',
        name: 'TaskDetail',
        component: () => import('@/views/task/detail'),
        meta: { cnName: '离线任务详情', title: 'taskInfo' },
        hidden: true
      },
      {
        path: 'log',
        name: 'TaskDetailLog',
        component: () => import('@/views/task/detail/detailLog'),
        meta: { cnName: '任务详情日志' },
        hidden: true
      },
      {
        path: 'info',
        name: 'TaskInfo',
        component: () => import('@/views/task/info'),
        meta: { cnName: '流式任务详情', title: 'taskInfo' },
        hidden: true
      },
      {
        path: 'step1',
        name: 'TaskStep1',
        component: () => import('@/views/task/step/step1'),
        meta: { cnName: '任务模板选择', title: 'taskTemplate' },
        hidden: true
      },
      {
        path: 'step2FlinkJar',
        name: 'TaskStep2FlinkJar',
        component: () => import('@/views/task/step/step2FlinkJar'),
        meta: { cnName: 'Flink Jar模板', title: 'flinkJarTemplate' },
        hidden: true
      },
      {
        path: 'step2FlinkSQL',
        name: 'TaskStep2FlinkSQL',
        component: () => import('@/views/task/step/step2FlinkSQL'),
        meta: { cnName: 'Flink SQL模板', title: 'flinkSqlTemplate' },
        hidden: true
      },
      {
        path: 'step2Metis',
        name: 'TaskStep2Metis',
        component: () => import('@/views/task/step/step2Metis'),
        meta: { cnName: 'Metis->Iceberg模板', title: 'metisTemplate' },
        hidden: true
      },
      {
        path: 'step2CDC',
        name: 'TaskStep2CDC',
        component: () => import('@/views/task/step/step2CDC'),
        meta: { cnName: 'CDC->Iceberg模板', title: 'step2CDCTemplate' },
        hidden: true
      },
      {
        path: 'step2Kafka',
        name: 'TaskStep2Kafka',
        component: () => import('@/views/task/step/step2Kafka'),
        meta: { cnName: 'Kafka->ClickHouse模板', title: 'kafkaTemplate' },
        hidden: true
      },
      {
        path: 'step2HiveSQL',
        name: 'TaskStep2HiveSQL',
        component: () => import('@/views/task/step/step2HiveSQL'),
        meta: { cnName: 'Hive->Hive SQL模板', title: 'hiveSqlTemplate' },
        hidden: true
      },
      {
        path: 'step2Hive',
        name: 'TaskStep2Lakehouse',
        component: () => import('@/views/task/step/step2Lakehouse'),
        meta: { cnName: 'MySql->Lakehouse模板', title: 'lakehouseTemplate' },
        hidden: true
      },
      {
        path: 'step2Hive2',
        name: 'TaskStep2Lakehouse2',
        component: () => import('@/views/task/step/step2Lakehouse2'),
        meta: { cnName: 'MySql->Lakehouse模板', title: 'lakehouseTemplate' },
        hidden: true
      },
      {
        path: 'step2File',
        name: 'TaskStep2File',
        component: () => import('@/views/task/step/step2File'),
        meta: { cnName: 'COS->Lakehouse模板', title: 'step2FileTemplate' },
        hidden: true
      },
      {
        path: 'step2SparkJar',
        name: 'TaskStep2SparkJar',
        component: () => import('@/views/task/step/step2SparkJar'),
        meta: { cnName: 'Spark Jar模板', title: 'sparkJarTemplate' },
        hidden: true
      },
      {
        path: 'step2Shell',
        name: 'TaskStep2Shell',
        component: () => import('@/views/task/step/step2Shell'),
        meta: { cnName: 'Shell/Python脚本 模板', title: 'pythonOrshellTemplate' },
        hidden: true
      },
      {
        path: 'step2Doris',
        name: 'TaskStep2Doris',
        component: () => import('@/views/task/step/step2Doris'),
        meta: { cnName: 'Hive->Doris模板', title: 'dorisTemplate' },
        hidden: true
      },
      {
        path: 'step2MySql',
        name: 'TaskStep2MySql',
        component: () => import('@/views/task/step/step2MySql'),
        meta: { cnName: 'Hive->MySql模板', title: 'hive2MysqlTemplate' },
        hidden: true
      },
      {
        path: 'step2Hive2File',
        name: 'TaskStep2Hive2File',
        component: () => import('@/views/task/step/step2Hive2File'),
        meta: { cnName: 'Hive->File模板', title: 'hive2FileTemplate' },
        hidden: true
      },
      {
        path: 'artifact',
        name: 'Artifact',
        component: () => import('@/views/configuration/artifact'),
        // meta: { title: 'artifact', icon: 'artifact', cnName: '工件列表' }
        meta: { title: 'artifact', cnName: '文件管理列表' }
      },
      {
        path: 'artifact/detail',
        name: 'ArtifactDetail',
        component: () => import('@/views/configuration/artifact/detail'),
        meta: { isAdmin: true, cnName: '新建工件', title: 'artifactDetail' },
        hidden: true
      },
      {
        path: 'artifact/version',
        name: 'ArtifactVersion',
        component: () => import('@/views/configuration/artifact/version'),
        meta: { isAdmin: true, cnName: '工件详情', title: 'artifactVersion' },
        hidden: true
      },
      {
        path: 'step2RDB',
        name: 'step2RDB',
        component: () => import('@/views/task/step/step2RDB'),
        meta: { title: 'step2RDB' },
        hidden: true
      }
    ]
  },
  {
    path: '/lakecat',
    name: 'Lakecat',
    component: Layout,
    redirect: '/lakecat/assets',
    meta: { title: 'lakecat', isAdmin: false, icon: 'dataGovernance', micro: true },
    hidden: true,
    children: [
      {
        path: 'lakecat2',
        name: 'Lakecat2',
        meta: { title: 'lakecat2', isHot: !isCloud && true }
      },
      // {
      //   path: 'assets',
      //   name: 'Assets',
      //   meta: { title: 'assets', isHot: !isCloud && true, cnName: '资产盘点' }
      // },
      // {
      //   path: 'assets-analysis',
      //   name: 'AssetsAnalysis',
      //   meta: { cnName: '资产分析' },
      //   hidden: true
      // },
      // {
      //   path: 'calculate',
      //   name: 'Calculate',
      //   meta: { title: 'calculate', cnName: '计算治理' }
      // },
      // {
      //   path: 'calculate-business',
      //   name: 'CalculateBusinessDetail',
      //   meta: { cnName: '业务方治理工作台' },
      //   hidden: true
      // },
      // {
      //   path: 'calculate-platform',
      //   name: 'CalculatePlatformDetail',
      //   meta: { cnName: '平台方治理工作台' },
      //   hidden: true
      // },
      // {
      //   path: 'storage',
      //   name: 'Storage',
      //   meta: { title: 'storage', cnName: '存储治理' }
      // },
      // {
      //   path: 'storage-platform',
      //   name: 'StoragePlatform',
      //   meta: { cnName: '存储治理工作台' },
      //   hidden: true
      // },
      // {
      //   path: 'bucket-detail',
      //   name: 'BucketDetail',
      //   meta: { cnName: '存储治理桶治理详情' },
      //   hidden: true
      // },
      // {
      //   path: 'permission',
      //   name: 'Permission',
      //   meta: { title: 'permission', isHot: !isCloud && true, cnName: '权限治理' }
      // },
      // {
      //   path: 'permission-log',
      //   name: 'PermissionLog',
      //   meta: { cnName: '权限治理记录' },
      //   hidden: true
      // },
      {
        path: '*',
        name: 'LakecatDefault',
        component: () => import('@/views/lakecat'),
        meta: { cnName: '其他', keepAlive: true },
        hidden: true
      }
    ]
  },
  // {
  //   path: '/assets',
  //   component: Layout,
  //   meta: { title: 'dataAssets', isAdmin: false, icon: 'bi' },
  //   children: [
  //     {
  //       path: 'lakecat2',
  //       name: 'Lakecat2',
  //       redirect: '/lakecat/lakecat2',
  //       meta: { title: 'lakecat2', isHot: !isCloud && true }
  //     },
  //     {
  //       path: 'metaList',
  //       name: 'MetaData',
  //       component: () => import('@/views/metadata/list'),
  //       meta: { title: 'metadata', cnName: '元数据列表' }
  //     },
  //     {
  //       path: 'metaDetail',
  //       name: 'MetaDataDetail',
  //       component: () => import('@/views/metadata/detail'),
  //       meta: { cnName: '元数据详情' },
  //       hidden: true
  //     },
  //     {
  //       path: 'step',
  //       name: 'MetaDataStep',
  //       component: () => import('@/views/metadata/step'),
  //       meta: { cnName: '创建元数据' },
  //       hidden: true
  //     }
  //   ]
  // },
  {
    path: '/external-link',
    component: Layout,
    meta: { title: 'bi', isAdmin: false, icon: 'bi' },
    hidden: true,
    children: [
      {
        path: process.env.VUE_APP_BI_URL,
        // meta: { title: 'bi', icon: 'bi' }
        meta: { title: 'bi' }
      }
    ]
  },
  // {
  //   path: '/dict',
  //   name: 'Dictionary',
  //   component: Layout,
  //   redirect: '/dict/list',
  //   meta: { title: 'dictionary', isAdmin: false, icon: 'dictionary' },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'DictionaryList',
  //       component: () => import('@/views/dictionary/list'),
  //       hidden: true,
  //       // meta: { title: 'dictionary', icon: 'dictionary', cnName: '字典列表' }
  //       meta: { title: 'dictionary', cnName: '字典列表' }
  //     }
  //   ]
  // },
  // SLA & DQC
  {
    path: '/monitor',
    name: 'Monitor',
    component: Layout,
    redirect: '/monitor/pan',
    meta: { title: 'monitor', isAdmin: false, icon: 'monitor' },
    hidden: true,
    children: [
      {
        path: 'monlist',
        name: 'MonitorList',
        component: () => import('@/views/monitor/list'),
        // meta: { title: 'monitorList', icon: 'monitorList', cnName: '监控列表' }
        meta: { title: 'monitorList', cnName: 'SLA监控管理' }
      },
      {
        path: 'info',
        name: 'MonitorConfigInfo',
        component: () => import('@/views/monitor/info'),
        meta: { cnName: '配置详情' },
        hidden: true
      },
      {
        path: 'pan',
        name: 'MonitorPan',
        component: () => import('@/views/monitor/pan'),
        // meta: { title: 'monitorPan', icon: 'monitorPan', cnName: '监控大盘' }
        meta: { title: 'monitorPan', cnName: 'SLA监控概览' }
      },
      {
        path: 'detail',
        name: 'minitorDetail',
        component: () => import('@/views/monitor/detail'),
        meta: { cnName: '监控详情' },
        hidden: true
      },
      {
        path: 'dqclist',
        name: 'DqcList',
        component: () => import('@/views/dqc/index'),
        // meta: { title: 'dqcList', icon: 'dqcList', cnName: '监控列表' }
        meta: { title: 'dqcList', cnName: 'DQC监控管理' }
      },
      {
        hidden: true,
        path: 'config',
        name: 'DqcConfig',
        component: () => import('@/views/dqc/config'),
        // meta: { title: 'dqcConfig', icon: 'dqcList', cnName: '配置DQC' }
        meta: { title: 'dqcConfig', cnName: '配置DQC' }
      },
      {
        path: 'ruleList',
        name: 'DqcRuleList',
        component: () => import('@/views/dqc/ruleList'),
        // meta: { title: 'dqcRuleList', icon: 'dqcRuleList', cnName: '规则模板列表' }
        meta: { title: 'dqcRuleList', cnName: 'DQC规则模板' }
      },
      {
        hidden: true,
        path: 'ruleModel',
        name: 'DqcRuleModelConfig',
        component: () => import('@/views/dqc/ruleModel'),
        // meta: { title: 'dqcRuleModelConfig', icon: 'dqcRuleList', cnName: '规则模板配置' }
        meta: { title: 'dqcRuleModelConfig', cnName: '规则模板配置' }
      }
    ]
  },
  {
    path: '/config',
    name: 'Configuration',
    component: Layout,
    redirect: '/config/sourceInstance',
    meta: { title: 'configuration', isAdmin: true, icon: 'configuration' },
    children: [
      {
        hidden: true,
        path: 'engine',
        name: 'EngineConfig',
        component: () => import('@/views/dataAnalysis/engineConfig/index'),
        // meta: { title: 'engineConfig', icon: 'engine', cnName: '引擎配置' }
        meta: { title: 'engineConfig', isAdmin: true, cnName: '引擎配置' }
      },
      // {
      //   path: 'datasource',
      //   name: 'DataSource',
      //   component: () => import('@/views/configuration/dataSource'),
      //   // meta: { title: 'dataSource', icon: 'dataSource', cnName: '数据源列表' }
      //   meta: { title: 'dataSource', isAdmin: true, cnName: '数据源列表' }
      // },
      {
        hidden: true,
        path: 'connector',
        name: 'Connector',
        component: () => import('@/views/configuration/connector'),
        // meta: { title: 'connector', icon: 'connector', cnName: '数据源连接器' }
        meta: { title: 'connector', isAdmin: true, cnName: '数据源连接器' }
      },
      {
        path: 'sourceInstance',
        name: 'sourceInstance',
        component: () => import('@/views/configuration/sourceInstance'),
        // meta: { title: 'sourceInstance', icon: 'sourceInstance', cnName: '数据源管理' }
        meta: { title: 'sourceInstance', isAdmin: true, cnName: '数据源管理' }
      },
      {
        path: 'sourceInstance/sourceDetail',
        name: 'sourceDetail',
        component: () => import('@/views/configuration/sourceInstance/detail'),
        // meta: { title: 'sourceInstance', icon: 'sourceInstance', cnName: '新建数据源实例' },
        meta: { title: 'sourceInstanceDetail', isAdmin: true, cnName: '新建数据源实例' },
        hidden: true
      },
      // {
      //   path: 'artifact',
      //   name: 'Artifact',
      //   component: () => import('@/views/configuration/artifact'),
      //   // meta: { title: 'artifact', icon: 'artifact', cnName: '工件列表' }
      //   meta: { title: 'artifact', isAdmin: true, cnName: '工件列表' }
      // },
      // {
      //   path: 'artifact/detail',
      //   name: 'ArtifactDetail',
      //   component: () => import('@/views/configuration/artifact/detail'),
      //   meta: { isAdmin: true, cnName: '新建工件' },
      //   hidden: true
      // },
      // {
      //   path: 'artifact/version',
      //   name: 'ArtifactVersion',
      //   component: () => import('@/views/configuration/artifact/version'),
      //   meta: { isAdmin: true, cnName: '工件详情' },
      //   hidden: true
      // },
      {
        hidden: true,
        path: 'cluster',
        name: 'Cluster',
        component: () => import('@/views/configuration/cluster'),
        // meta: { title: 'cluster', icon: 'cluster', cnName: '集群列表' }
        meta: { title: 'cluster', isAdmin: true, cnName: '集群列表' }
      },
      {
        hidden: true,
        path: 'newCluster',
        name: 'newCluster',
        component: () => import('@/views/cluster'),
        meta: { title: 'newCluster', isAdmin: true, cnName: '新集群' }
      },
      {
        path: 'cluster/detail',
        name: 'ClusterDetail',
        component: () => import('@/views/configuration/cluster/detail'),
        meta: { isAdmin: true, cnName: '新建集群' },
        hidden: true
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/views/configuration/audit'),
        // meta: { title: 'audit', icon: 'audit', cnName: '审计列表' }
        meta: { title: 'audit', isAdmin: true, cnName: '审计列表' }
      },
      // {
      //   // hidden: true,
      //   path: 'announcement',
      //   name: 'Announcement',
      //   component: () => import('@/views/configuration/announcement'),
      //   meta: { title: 'announcement', isAdmin: true, cnName: '公告' }
      // },
      {
        hidden: true,
        path: 'cloud',
        name: 'Cloud',
        component: () => import('@/views/cloud/index'),
        meta: { title: 'cloud', isAdmin: true, cnName: '云资源注册' }
      },
      {
        hidden: true,
        path: 'import',
        name: 'ImportData',
        component: () => import('@/views/import/index'),
        meta: { title: 'import', isAdmin: true, cnName: '数据挂载' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/configuration/system/index'),
        meta: { title: 'system', isAdmin: true, cnName: '系统配置' }
      },
      {
        path: 'systemWxToken',
        name: 'SystemWxToken',
        component: () => import('@/views/configuration/system/wxTokenConf.vue'),
        meta: { title: 'system', isAdmin: true, cnName: '微信token配置' },
        hidden: true
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Layout,
    redirect: '/admin/feedback',
    meta: { title: 'admin', isAdmin: true, icon: 'admin' },
    // hidden: true,
    children: [
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/admin/feedback'),
        // meta: { title: 'feedback', icon: 'feedback', cnName: '反馈列表' }
        meta: { title: 'feedback', isAdmin: true, cnName: '反馈列表' },
        hidden: true
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('@/views/admin/order/list'),
        // meta: { title: 'order', icon: 'feedback', cnName: '工单列表' }
        meta: { title: 'order', isAdmin: true, cnName: '工单列表' }
      },
      {
        path: 'order/create',
        name: 'orderCreate',
        component: () => import('@/views/admin/order/create'),
        meta: { isAdmin: true, cnName: '新建工单', title: 'orderDetail' },
        hidden: true
      },
      // {
      //   path: 'cost',
      //   name: 'CostCenter',
      //   component: () => import('@/views/admin/cost/index'),
      //   meta: { title: 'cost', isAdmin: true, cnName: '成本中心' }
      // },
      // {
      //   path: 'cost/monitor',
      //   name: 'CostMonitor',
      //   component: () => import('@/views/admin/cost/monitor'),
      //   meta: { isAdmin: true, cnName: '成本监控' },
      //   hidden: true
      // },
      // {
      //   path: 'cost/monitor/detail',
      //   name: 'CostMonitorDetail',
      //   component: () => import('@/views/admin/cost/components/monitorDetail'),
      //   meta: { isAdmin: true, cnName: '成本监控详情' },
      //   hidden: true
      // },
      {
        // hidden: true,
        path: 'announcement',
        name: 'Announcement',
        component: () => import('@/views/configuration/announcement'),
        meta: { title: 'announcement', isAdmin: true, cnName: '公告' }
      }
    ]
  },
  {
    path: '/cost',
    component: Layout,
    meta: { title: 'newCost', isAdmin: true, icon: 'cost' },
    hidden: true,
    children: [
      // 成本 2.0
      {
        path: 'center',
        name: 'NewCostCenter',
        component: () => import('@/views/cost/index'),
        meta: { title: 'newCost', isAdmin: true, isHot: !isCloud && true, cnName: '成本中心' }
      },
      {
        path: 'newcost/analysis',
        name: 'NewCostAnalysis',
        component: () => import('@/views/cost/analysis'),
        meta: { isAdmin: true, cnName: '成本分析' },
        hidden: true
      },
      {
        path: 'newcost/bill',
        name: 'NewCostBill',
        component: () => import('@/views/cost/bill'),
        meta: { isAdmin: true, cnName: '成本账单' },
        hidden: true
      },
      {
        path: 'newcost/report',
        name: 'NewCostReport',
        component: () => import('@/views/cost/report'),
        meta: { isAdmin: true, cnName: '报告管理' },
        hidden: true
      }
    ]
  },
  {
    path: '/jurisdiction',
    name: 'Jurisdiction',
    component: Layout,
    redirect: '/jurisdiction/user',
    meta: { title: 'jurisdiction', isAdmin: true, icon: 'jurisdiction' },
    children: [
      {
        path: 'tenant',
        name: 'tenant',
        component: () => import('@/views/jurisdiction/tenant'),
        // meta: { title: 'tenant', icon: 'tenant', cnName: '租户管理' }
        meta: { title: 'tenant', isAdmin: true, cnName: '租户管理' },
        hidden: true
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/jurisdiction/user'),
        // meta: { title: 'user', icon: 'user', cnName: '用户管理' }
        meta: { title: 'user', isAdmin: true, cnName: '用户管理' }
      },
      {
        path: 'userGroup',
        name: 'userGroup',
        component: () => import('@/views/jurisdiction/group'),
        // meta: { title: 'user', icon: 'user', cnName: '用户组管理' }
        meta: { title: 'userGroup', isAdmin: true, cnName: '用户组管理' }
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/jurisdiction/role'),
        // meta: { title: 'role', icon: 'role', cnName: '角色管理' }
        meta: { title: 'role', isAdmin: true, cnName: '角色管理' }
      },
      {
        path: 'dataRole',
        name: 'dataRole',
        component: () => import('@/views/jurisdiction/dataRole'),
        // meta: { title: 'dataRole', icon: 'dataRole', cnName: '数据角色管理' }
        meta: { title: 'dataRole', isAdmin: true, cnName: '数据角色管理' }
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/jurisdiction/menu'),
        // meta: { title: 'menu', icon: 'menu', cnName: '菜单管理' }
        meta: { title: 'menu', isAdmin: true, cnName: '菜单管理' },
        hidden: true
      },
      {
        path: 'group',
        name: 'group',
        component: () => import('@/views/jurisdiction/group'),
        // meta: { title: 'group', icon: 'group', cnName: '用户组管理' }
        meta: { title: 'group', isAdmin: true, cnName: '用户组管理' },
        hidden: true
      },
      {
        path: 'organization',
        name: 'organization',
        component: () => import('@/views/jurisdiction/organization'),
        meta: { title: 'organization', isAdmin: true, cnName: '组织架构' }
      }
    ]
  },
  {
    path: '/workflow',
    name: 'WorkFlow',
    component: Layout,
    redirect: '/workflow/list',
    meta: { title: 'workflow', icon: 'workflow' },
    hidden: true,
    children: [
      {
        hidden: true,
        path: 'edit/:id',
        name: 'workflowEdit',
        component: () => import('@/views/workflow/detail2'),
        // meta: { title: 'workflowEdit', icon: 'workflow', cnName: '编辑工作流' }
        meta: { title: 'workflowEdit', cnName: '编辑工作流' }
      },
      {
        hidden: true,
        path: 'add',
        name: 'workflowAdd',
        component: () => import('@/views/workflow/add'),
        // meta: { title: 'workflowAdd', icon: 'workflow', cnName: '创建工作流' }
        meta: { title: 'workflowAdd', cnName: '创建工作流' }
      },
      {
        hidden: true,
        path: 'detail',
        name: 'workflowDetail',
        component: () => import('@/views/workflow/info'),
        // meta: { title: 'workflowDetail', icon: 'workflow', cnName: '查看工作流' }
        meta: { title: 'workflowDetail', cnName: '查看工作流' }
      }
    ]
  }
];

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject);
  }
  return originalPush.call(this, location).catch(err => err);
};

const createRouter = () =>
  new Router({
    mode: 'hash', // 后端支持可开
    base: '/',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
