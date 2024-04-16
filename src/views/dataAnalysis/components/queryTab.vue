<template>
  <div ref="queryTab" class="query-tab">
    <!-- <div class="query_region">
      <span class="label">区域: </span>
      <el-select v-model="regionCopy" placeholder="请选择区域" size="mini" style="width: 150px" @change="regionCopyChange">
        <el-option v-for="item in regionList" :key="item.name" :label="item.name_zh" :value="item.name"> </el-option>
      </el-select>
    </div> -->
    <div ref="leftBox" class="left-wrap" :style="{ width: leftWidth + '%' }">
      <div>
        <data-config ref="dataConfig" @select="select" @changeDrawer="changeDrawer" @lookMetadata="lookMetadata" @closeVisible="closeVisible" @sqlCreateTable="sqlCreateTable" />
      </div>
      <div class="drag-bar" @mousedown="dragEagle">
        <span class="bar"></span>
      </div>
    </div>
    <div class="right-wrap" :style="{ width: rightWidth }">
      <el-menu class="el-menu-more" :default-active="activeTabName" mode="horizontal">
        <el-submenu :popper-append-to-body="false" index="menu">
          <template slot="title">
            <svg-icon class="icon-more" icon-class="more" />
          </template>
          <el-menu-item key="-1" index="-1">
            <div class="menu-item-close-all" @click="closeAll">关闭所有</div>
          </el-menu-item>
          <el-menu-item v-for="item in queryList" :key="item.name" :index="item.name">
            <span class="menu-item-tabname" @click="openTab(item.name)">{{ item.title }}</span>
            <i class="el-icon-close menu-item-close" @click.stop="closeTab(item.name)"></i>
          </el-menu-item>
        </el-submenu>
      </el-menu>
      <el-tabs v-model="activeTabName" type="card" :class="{ 'add-disabled': queryList.length >= 15 }" editable @edit="tabsEdit" @click.native="tableClick">
        <el-dropdown trigger="click" style="display: none">
          <span class="closeTabdropdown"></span>
          <el-dropdown-menu slot="dropdown" class="closeTabdropdownMenu">
            <el-dropdown-item @click.native="addTabFn('add')">新建查询</el-dropdown-item>
            <el-dropdown-item @click.native="addTabFn('save')">已保存查询</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-tab-pane v-for="item in queryList" :key="item.name" :label="item.title" :name="item.name">
          <template slot="label">
            <template v-if="!item.inputType">
              <span class="tabName">
                <svg-icon v-if="item.result && (item.result.status === 0 || item.result.status === 1 || item.result.status === 2)" :icon-class="tabIcon(item.result)"></svg-icon>
                <i v-if="item.result && (item.result.running || item.result.status === 3)" class="el-icon-loading"></i>
                <el-button type="text" @dblclick.native="item.inputType = true">{{ item.title }}</el-button>
              </span>
            </template>
            <template v-else>
              <el-input
                v-model="item.title"
                v-autoFous
                class="tabNameInput"
                :title="item.validMsg || item.title"
                placeholder="标签名称"
                minlength="3"
                size="mini"
                @input="item.title = handelInput(item)"
                @keydown.enter.native="titleInputBlur(item)"
                @blur="titleInputBlur(item)"
                @keydown.enter.native.right.delete.stop
              ></el-input>
            </template>
          </template>
          <div class="query-tab-content">
            <QueryTabItem
              :ref="item.name"
              :key="region"
              :data="item"
              :active-tab-name="activeTabName"
              @keyDownExecute="keyDownExecute"
              @changeName="
                e => {
                  activeTabName = e;
                }
              "
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <MetadataView ref="MetadataView" v-model="visible" :region="region" :width="metaDateWidth" @update="visible = $event" />
    <!-- 创建临时表 -->
    <TemporaryTable :drawer.sync="drawer" />
    <el-dialog title="已保存列表" :visible.sync="addSaveDial" class="saveList_dial" width="45%" @close="saveDialClose">
      <div class="saveList_content">
        <div class="dial_search">
          <el-input v-model="params.title" class="search_item" placeholder="查询名称" size="mini" clearable @keyup.enter.native="searchSaveList"><i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer" @click="searchSaveList"></i></el-input>
        </div>
        <div class="search_save_list">
          <el-table ref="saveDialTable" v-loading="saveListLoading" :data="saveList" :header-cell-style="{ height: '36px', padding: '0px' }" :cell-style="{ height: '32px', padding: '0px' }" style="width: 100%">
            <el-table-column label="" width="50">
              <template slot-scope="scope">
                <el-radio v-model="addQuerySave" :label="scope.row">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="名称" width="140" />
            <el-table-column prop="querySql" label="查询" show-overflow-tooltip />
          </el-table>
          <el-pagination :total="total" :current-page="params.pageNum" :page-sizes="[10, 20, 30, 50, 100]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"> </el-pagination>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="addSaveDial = false">取 消</el-button>
        <el-button type="primary" @click="addSaveSub">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DataConfig from './DataConfig.vue';
import QueryTabItem from './queryTabItem.vue';
import TemporaryTable from './TemporaryTable.vue';
import MetadataView from './MetadataView.vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { EventBus, EventType } from '@/utils/eventbus';
import { localSet, localRemove } from '../util/index';
import { getDataById, getSaveSql, getHistorySql, savedQueryList, getShareGrade, getChartOptions, getStatus } from '@/api/querydata';
import { v4 as uuid } from 'uuid';
import { localGetItem, localSetItem } from '@/utils/customStorage';
import { getStrByte } from '@/utils';
const initId = uuid();

export default {
  components: {
    DataConfig,
    QueryTabItem,
    TemporaryTable,
    MetadataView
  },
  data() {
    return {
      regionCopy: localGetItem('regionCopy') || '',
      drawer: false,
      onceNum: false, // 首个tab首次进入的状态
      activeTabName: initId,
      oldActiveTabName: '',
      queryList: [
        {
          name: initId,
          title: 'query1',
          grade: '',
          querySql: '',
          inputType: false,
          uuid: '',
          result: {
            engine: '',
            executeDuration: 0,
            fileSize: '',
            keyList: [
              {
                key: '',
                value: ''
              }
            ],
            meta: [],
            name: '',
            once: false,
            param: {},
            queryId: '',
            querySql: '',
            querySqlParam: '',
            repeat_meta: {},
            result: [],
            running: false,
            scanSize: '',
            status: null,
            uuid: ''
          }
        }
      ],
      leftWidth: 16,
      offsetWidth: 0,
      startX: 0,
      addSaveDial: false,
      saveList: [],
      saveListLoading: false,
      total: 0,
      params: {
        pageNum: 1,
        pageSize: 10,
        info: '',
        title: '',
        query_sql: ''
      },
      mouseX: 0,
      mouseY: 0,
      addQuerySave: null,
      visible: false,
      debounce: false,
      metaDateWidth: 400
    };
  },
  computed: {
    ...mapGetters(['engineList', 'sqlList', 'region', 'regionList', 'userInfo', 'catalog', 'catalogList']),
    rightWidth() {
      const w = this.leftWidth + '%';
      return `calc(100% - ${w}${this.visible ? ` - ${this.metaDateWidth}px` : ''})`;
    }
  },
  watch: {
    activeTabName: {
      handler: function(newVal, oldVal) {
        this.oldActiveTabName = oldVal;
        this.changeactiveTabName(newVal);
      },
      immediate: true
    },
    region(newVal, oldVal) {
      // 关闭元数据展示
      this.visible = false;

      // 记录当前区域下打开的tab页
      if (oldVal) {
        const tabs = JSON.parse(localGetItem(`ds-query-sql-${oldVal}`)) || [];
        tabs.forEach(item => {
          const active = this.oldActiveTabName === item.name ? 1 : 0;
          localSet(oldVal, { name: item.name, active });
        });
      }

      // 设置tab的状态
      if (!this.sqlList[newVal]) this.setQueryStatus();

      this.initSqlList();
      this.$nextTick(() => {
        if (!this.activeTabName) return;
        this.$refs[this.activeTabName][0].retain = true;
        setTimeout(() => {
          this.$refs[this.activeTabName][0].retain = false;
        }, 800);
      });
    }
  },
  provide() {
    return {
      initList: this.initList,
      changeWidth: this.changeWidth,
      visible: () => this.visible,
      positionTable: this.positionTable
    };
  },
  async created() {
    // 获取区域列表
    await this.getRegionList();
    if (!this.regionCopy) {
      this.regionCopy = this.regionList[0]?.name;
      localSetItem('regionCopy', this.regionCopy);
      this.SET_REGION(this.regionCopy);
    }
    // 低分辨率处理布局
    const width = document.documentElement.clientWidth || document.body.clientWidth;
    if (width < 1300) this.leftWidth = 20;

    this.initSqlList();
    // 分享过来的
    if (this.$route.query.uuid || this.$route.query.sqlId) {
      this.onceNum = true;
      const LogicalJudgment = (res, type) => {
        // 是否需要切换引擎
        if (this.region === res.region) {
          if (this.queryList.length >= 15) {
            this.$message.warning({
              message: '最多添加15个查询窗口!'
            });
            res.name = this.queryList[0].name;
          } else {
            // 分享(使用首个teb页)
            if (this.queryList.length === 1 && this.queryList[0].querySql === '') {
              res.name = this.queryList[0].name;
            } else {
              res.name = uuid();

              let newTitle = '';
              let tabIndex = this.queryList.length + 1;
              for (;;) {
                newTitle = `query${tabIndex}`;
                const index = this.queryList.findIndex(item => {
                  return item.title === newTitle;
                });
                if (index <= -1) {
                  break;
                }
                tabIndex++;
              }
              let querySql = res.querySql;
              const paramObj = res.param ? res.param : {};
              if (Object.keys(paramObj).length > 0) {
                querySql = res.querySqlParam || res.querySql;
                this.$nextTick(() => {
                  const keyList = [];
                  Object.keys(res.param).forEach(key => {
                    keyList.push({
                      key,
                      value: res.param[key]
                    });
                  });
                  this.$nextTick(() => {
                    this.$refs[this.activeTabName][0].sqlKeyObj.keyList = keyList;
                  });
                });
              }
              const tab = { name: res.name, title: newTitle, querySql, engine: res.engine, catalog: res.catalog };
              if (type === 'share') tab.uuid = this.$route.query.uuid;
              this.queryList.push(tab);
              localSet(this.region, tab);
            }
          }
          if (res.name === this.activeTabName) {
            this.$nextTick(() => {
              let querySql = res.querySql;
              const paramObj = res.param ? res.param : {};
              if (Object.keys(paramObj).length > 0) {
                querySql = res.querySqlParam || res.querySql;
                this.$nextTick(() => {
                  const keyList = [];
                  Object.keys(res.param).forEach(key => {
                    keyList.push({
                      key,
                      value: res.param[key]
                    });
                  });
                  this.$refs[this.activeTabName][0].sqlKeyObj.keyList = keyList;
                });
              }
              this.$refs[this.activeTabName][0].$refs.monaco.setCode(querySql);
            });
          }
          this.activeTabName = res.name;
          if (type === 'share') {
            this.$nextTick(() => {
              // 分享按钮的处理
              this.$refs[this.activeTabName][0].showShare = true;
              this.$refs[this.activeTabName][0].uuid = this.$route.query.uuid;
              // 数据加载状态的处理
              this.$refs[this.activeTabName][0].running = true;
              this.$refs[this.activeTabName][0].result.executeDuration = 0;
              this.timer = setInterval(() => {
                this.$refs[this.activeTabName][0].result.executeDuration += 1;
              }, 1000);
            });
          }
          this.$nextTick(() => {
            this.$refs[this.activeTabName][0].engine = res.engine || '';
            localSet(this.region, { name: res.name, grade: res.grade });
          });
        } else {
          // 更换引擎
          this.regionChange(res.region);
          this.$nextTick(() => {
            if (this.queryList.length >= 15) {
              this.$message.warning({
                message: '最多添加15个查询窗口!'
              });
              res.name = this.queryList[0].name;
            } else {
              if (this.queryList.length === 1 && this.queryList[0].querySql === '') {
                res.name = this.queryList[0].name;
              } else {
                res.name = uuid();
                let newTitle = '';
                let tabIndex = this.queryList.length + 1;
                for (;;) {
                  newTitle = `query${tabIndex}`;
                  const index = this.queryList.findIndex(item => {
                    return item.title === newTitle;
                  });
                  if (index <= -1) {
                    break;
                  }
                  tabIndex++;
                }
                let querySql = res.querySql;
                const paramObj = res.param ? res.param : {};
                if (Object.keys(paramObj).length > 0) {
                  querySql = res.querySqlParam || res.querySql;
                  this.$nextTick(() => {
                    const keyList = [];
                    Object.keys(res.param).forEach(key => {
                      keyList.push({
                        key,
                        value: res.param[key]
                      });
                    });
                    this.$refs[this.activeTabName][0].sqlKeyObj.keyList = keyList;
                  });
                }
                const tab = { name: res.name, title: newTitle, querySql, engine: res.engine, catalog: res.catalog };
                if (type === 'share') tab.uuid = this.$route.query.uuid;
                this.queryList.push(tab);
                localSet(this.region, tab);
              }
            }
            if (res.name === this.activeTabName) {
              this.$nextTick(() => {
                let querySql = res.querySql;
                const paramObj = res.param ? res.param : {};
                if (Object.keys(paramObj).length > 0) {
                  querySql = res.querySqlParam || res.querySql;
                  this.$nextTick(() => {
                    const keyList = [];
                    Object.keys(res.param).forEach(key => {
                      keyList.push({
                        key,
                        value: res.param[key]
                      });
                    });
                    this.$refs[this.activeTabName][0].sqlKeyObj.keyList = keyList;
                  });
                }
                this.$refs[this.activeTabName][0].$refs.monaco.setCode(querySql);
              });
            }
            this.activeTabName = res.name;
            if (type === 'share') {
              this.$nextTick(() => {
                // 分析按钮处理
                this.$refs[this.activeTabName][0].showShare = true;
                this.$refs[this.activeTabName][0].uuid = this.$route.query.uuid;
                // 数据加载状态的处理
                this.$refs[this.activeTabName][0].running = true;
                this.$refs[this.activeTabName][0].result.executeDuration = 0;
                this.timer = setInterval(() => {
                  this.$refs[this.activeTabName][0].result.executeDuration += 1;
                }, 1000);
              });
            }
            this.$nextTick(() => {
              this.$refs[this.activeTabName][0].engine = res.engine || '';
              localSet(this.region, { name: res.name, grade: res.grade });
            });
          });
        }

        // 切换数据源
        const catalog = res.catalog || '';
        catalog && this.SET_CATALOG(catalog);
      };

      // 获取分享的权限  1为编辑，2为运行，3为查看
      let grade = {};
      try {
        if (this.$route.query.gradeID) {
          grade = await (await getShareGrade({ sharee: this.userInfo.userId, gradeID: this.$route.query.gradeID })).data;
        }
      } catch (error) {
        console.log(error, '分享错误');
      }
      // 已查询的分享
      if (this.$route.query.uuid) {
        let running = 0;
        if (!this.catalog || !this.region) {
          running = 1000 * 3;
        }
        setTimeout(() => {
          getHistorySql(this.$route.query.uuid).then(res => {
            const data = res.data;
            data.grade = grade.grade;
            LogicalJudgment(data, 'share');
            const activeTabName = JSON.parse(JSON.stringify(this.activeTabName));
            this.$store.commit('SET_SQLLIST', { key: this.region, list: { running: true, status: 3, name: activeTabName, once: true }});
            // this.$nextTick(() => {
            //   const catalog = data.catalog ? data.catalog : '';
            //   if (this.catalog !== catalog && catalog) {
            //     this.SET_CATALOG(catalog);
            //   }
            // });
            this.initList();
            getDataById(this.$route.query.uuid).then(res => {
              const data = res.data;
              data.name = activeTabName;
              data.running = false;
              data.once = true;
              this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
              this.initList();
              this.$nextTick(() => {
                this.$refs[activeTabName][0].running = false;
                this.$refs[activeTabName][0].result = data;
                clearInterval(this.timer);
              });
            });
            // 存在chart分享
            if (this.$route.query.BIID) {
              getChartOptions({ id: this.$route.query.BIID }).then(res => {
                const data = res.data[0];
                data.param = JSON.parse(data.param);
                data.param.form.id = data.id;
                data.param.form.querySql = data.querySql;
                data.param.form.content = data.content;
                const toolList = [
                  {
                    title: data.name,
                    type: data.type,
                    config: data.param,
                    chartGrade: this.$route.query.chartGrade // 查看的分享处理
                  }
                ];
                // if (data.type !== 'table') {
                //   toolList.unshift({ title: '表格', type: 'table', config: undefined });
                // }
                this.$refs[activeTabName][0].resultOption.toolList = toolList;
              });
            }
          });
        }, running);
      }

      // 保存的分享
      if (this.$route.query.sqlId) {
        getSaveSql(this.$route.query.sqlId).then(res => {
          const data = res.data;
          data.grade = grade;
          LogicalJudgment(data, 'save');
          this.initList();
        });
      }
    }
    //
    EventBus.$on(EventType.switchQueryTab, row => {
      if (row) {
        // 切换了引擎
        if (row.region !== this.region) {
          this.$confirm(`从"已保存的查询"或者"历史查询"跳转至"数据查询"页面时，查询区域和当前区域不一致时，将关闭当前查询选项卡，未保存的查询将丢失，如有要保存的内容，请先保存！`, '提示', {
            confirmButtonText: '切换',
            cancelButtonText: '取消'
          })
            .then(() => {
              this.regionChange(row.region);
              this.$nextTick(() => {
                if (this.queryList.length >= 15) {
                  this.$confirm(`您一次最多可以打开十五个查询,此查询将替换您的第一个查询选项卡,任何未保存的工作都将丢失。`, '提示', {
                    confirmButtonText: '打开查询',
                    cancelButtonText: '取消'
                  })
                    .then(() => {
                      this.activeTabName = this.queryList[0].name;
                      if (row.title) {
                        this.queryList[0].title = row.title;
                        localSet(this.region, { name: this.activeTabName, title: row.title });
                      }
                      this.$nextTick(() => {
                        this.$refs[this.activeTabName][0].changeData(row);
                      });
                    })
                    .catch(() => {});
                } else {
                  const options = {};
                  if (row.title) {
                    options.title = row.title;
                  }
                  this.addTabExecute(options);
                  this.$nextTick(() => {
                    this.$refs[this.activeTabName][0].changeData(row);
                  });
                }
              });
            })
            .catch(() => {});
        } else {
          // 已经打开10个选项卡
          if (this.queryList.length >= 15) {
            this.$confirm(`您一次最多可以打开十五个查询,此查询将替换您的第一个查询选项卡,任何未保存的工作都将丢失。`, '提示', {
              confirmButtonText: '打开查询',
              cancelButtonText: '取消'
            })
              .then(() => {
                this.activeTabName = this.queryList[0].name;
                if (row.title) {
                  this.queryList[0].title = row.title;
                  localSet(this.region, { name: this.activeTabName, title: row.title });
                }
                this.$nextTick(() => {
                  this.$refs[this.activeTabName][0].changeData(row);
                });
              })
              .catch(() => {});
          } else {
            const options = {};
            if (row.title) {
              options.title = row.title;
            }
            this.addTabExecute(options);
            this.$nextTick(() => {
              this.$refs[this.activeTabName][0].changeData(row);
            });
          }
        }
      }
    });

    // 设置历史tab对应的状态
    if (!this.sqlList[this.region]) this.setQueryStatus();
  },
  mounted() {
    document.addEventListener('click', this.mouseClick);
    document.body.onresize = function() {
      const clickMenuDom = document.documentElement.querySelector('.closeTabdropdownMenu');
      if (clickMenuDom) clickMenuDom.style.display = 'none';
    };
  },
  destroyed() {
    // 清楚定时器
    this.clearTimer();
    document.removeEventListener('click', this.mouseClick);

    EventBus.$off(EventType.switchQueryTab);
  },
  methods: {
    ...mapMutations(['SET_REGION', 'SET_CATALOG']),
    ...mapActions(['getRegionList']),
    keyDownExecute(name) {
      if (name) this.$refs[name][0].execute();
    },
    setQueryStatus() {
      const uuidList = this.queryList.map(({ uuid = false }) => uuid).filter(item => item);
      if (uuidList.length === 0) return;
      getStatus({ uuidList }).then(res => {
        const data = res.data || {};
        this.setStatus(data);
      });
    },
    setStatus(data) {
      if (Object.keys(data).length === 0) return;
      this.queryList.forEach((item, index) => {
        if (data[item.uuid] !== undefined) {
          item.result = { ...item.result, status: data[item.uuid] } || { status: data[item.uuid] };
          this.$set(this.queryList, index, { ...item });
          this.$store.commit('SET_SQLLIST', { key: this.region, list: { status: data[item.uuid], name: item.name }});
        }
      });
    },
    positionTable(data) {
      if (!data.table) {
        this.$refs.dataConfig?.tuckLockTable(data);
      } else {
        this.$refs.dataConfig?.refreshConfig('datas', data);
      }
    },
    closeVisible() {
      this.visible = false;
      this.$refs.MetadataView?.resetData();
    },
    lookMetadata(data) {
      setTimeout(() => {
        if (this.debounce) return;
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.MetadataView.addTabs(data);
        });
      }, 500);
    },
    changeWidth(type) {
      this.leftWidth = type ? 16 : 0;
    },
    mouseClick(e) {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    },
    tableClick(e) {
      if (this.queryList.length >= 15) return;
      if (e.target._prevClass === 'el-icon-plus') {
        const clickDom = document.documentElement.querySelector('.closeTabdropdown');
        clickDom.click();
        setTimeout(() => {
          const clickMenuDom = document.documentElement.querySelector('.closeTabdropdownMenu');
          clickMenuDom.style.top = this.mouseY + 10 + 'px';
          clickMenuDom.style.left = this.mouseX - 10 + 'px';
        });
      }
    },
    handelInput(data) {
      const str = getStrByte(data.title, 30);
      if (str !== data.title) {
        data.validMsg = '中文限制15个字，英文30个字母';
      } else {
        data.validMsg = '';
      }
      return str;
    },
    titleInputBlur(data) {
      if (data.title.trim().length <= 0) {
        this.$message({
          type: 'warning',
          message: '标题名称不能为空'
        });
        return;
      }
      data.inputType = false;
      localSet(this.region, { name: data.name, title: data.title });
    },
    addSaveSub() {
      if (!this.addQuerySave) {
        this.addSaveDial = false;
        return;
      }
      if (this.queryList.length >= 15) {
        this.$message.warning({
          message: '最多添加15个查询窗口!'
        });
        return;
      }
      const engine = this.addQuerySave.engine || this.engineList[0]?.value;
      if (this.addQuerySave.region !== this.region) {
        this.$confirm(`该查询区域和当前区域不一致时，将关闭当前查询选项卡，未保存的查询将丢失，如有要保存的内容，请先保存！`, '提示', {
          confirmButtonText: '切换',
          cancelButtonText: '取消'
        })
          .then(() => {
            this.regionChange(this.addQuerySave.region);
            this.$nextTick(() => {
              this.addTabExecute({ querySql: this.addQuerySave.querySql, engine, title: this.addQuerySave.title });
            });
          })
          .finally(() => {
            this.addQuerySave = null;
            this.addSaveDial = false;
          });
      } else {
        this.addTabExecute({ querySql: this.addQuerySave.querySql, engine, title: this.addQuerySave.title });
        this.addQuerySave = null;
        this.addSaveDial = false;
      }
    },
    saveDialClose() {
      this.addQuerySave = null;
      this.params.title = '';
      this.params.query_sql = '';
    },
    handleCurrentChange(val) {
      this.params.pageNum = val;
      this.searchSaveList();
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.searchSaveList();
    },
    searchSaveList() {
      this.saveListLoading = true;
      const params = {
        ...this.params
        // region: this.region
      };
      savedQueryList(params)
        .then(res => {
          const data = res.data;
          this.saveList = data.list || [];
          this.total = data.total || 0;
        })
        .finally(() => {
          this.saveListLoading = false;
        });
    },
    addTabFn(type) {
      if (this.queryList.length >= 15) {
        this.$message.warning({
          message: '最多添加15个查询窗口!'
        });
        return;
      }
      if (type === 'add') {
        let catalog = this.catalog || '';
        if (!this.catalogList.includes(catalog)) {
          catalog = this.catalogList[0];
        }
        const engine = this.engineList[0]?.value || '';
        this.addTabExecute({ engine, catalog });
      } else if (type === 'save') {
        if (!this.region) {
          this.$message.warning('请选择区域');
          return;
        }
        this.addSaveDial = true;
        this.searchSaveList();
      }
    },
    addTabExecute(options = {}) {
      const newName = uuid();
      let newTitle = '';
      const tabRegion = JSON.parse(localGetItem(`ds-query-sql-${this.region}`));
      const tabLength = tabRegion ? tabRegion.length + 1 : 1;
      let tabIndex = tabLength;
      for (;;) {
        newTitle = `query${tabIndex}`;
        const index = tabRegion.findIndex(item => {
          return item.title === newTitle;
        });
        if (index <= -1) {
          break;
        }
        tabIndex++;
      }
      const tab = Object.assign({ name: newName, title: newTitle, engine: '' }, options);
      this.queryList.push(tab);
      this.activeTabName = newName;
      localSet(this.region, tab);
    },
    regionCopyChange(val) {
      if (this.region !== val) {
        this.$confirm(`切换查询区域，将关闭其查询选项卡，未保存的查询将丢失，如有要保存的内容，请先保存！`, '提示', {
          confirmButtonText: '切换',
          cancelButtonText: '取消'
        })
          .then(() => {
            this.regionChange(val);
          })
          .catch(() => {
            this.regionCopy = this.region;
          });
      }
    },
    regionChange(val) {
      this.regionCopy = val;
      localSetItem('regionCopy', val);
      this.SET_REGION(val);

      this.initTabData();
      this.changeactiveTabName(this.activeTabName);
      // 清除定时运行中的定时器
      this.clearTimer();
      // 切换引擎  分享按钮的处理
      const oldSqlList = this.sqlList[this.region];
      if (oldSqlList) {
        // store存在结果,展示分享按钮
        Object.keys(oldSqlList).forEach(key => {
          this.$nextTick(() => {
            if (this.$refs[key] && this.$refs[key][0]) this.$refs[key][0].showShare = true;
          });
        });
      }
    },
    refreshConfig() {
      this.$refs.dataConfig.refreshConfig();
    },
    // 临时表弹窗状态
    changeDrawer(res) {
      this.drawer = res;
    },
    // 执行有结果了清楚定时器
    clearTimer(type = 'all') {
      this.queryList.forEach(item => {
        if (type === 'all') {
          if (item.timer || item.timerTow) {
            clearInterval(item.timer);
            clearInterval(item.timerTow);
          }
        } else {
          if (item.result?.queryId && (item.timer || item.timerTow)) {
            clearInterval(item.timer);
            clearInterval(item.timerTow);
          }
        }
      });
    },
    // tab图标的处理
    tabIcon(data) {
      if (data.status === 1) return 'err';
      if (data.status === 2) return 'cancel';
      if (data.status === 0) return 'succ';
    },
    changeactiveTabName(newVal) {
      this.initList();
      // 刷新|分享后重新获取数据
      this.refreshGetData(newVal);
    },
    refreshGetData(newVal) {
      const resIndex = this.queryList.findIndex(item => item.name === newVal);
      // 过滤再次分享默认先打开第一个tab
      if (this.queryList.length > 1 && resIndex === 0 && this.onceNum === true) {
        this.onceNum = false;
        return;
      }
      const resUuid = resIndex > -1 ? this.queryList[resIndex].uuid : undefined;
      const catalog = resIndex > -1 ? this.queryList[resIndex].catalog : undefined;
      const result = resIndex > -1 ? this.queryList[resIndex].result : undefined;
      const once = result ? result.once : undefined;
      if (resUuid && !once) {
        if (this.catalog !== catalog && catalog) this.SET_CATALOG(catalog);
        let Dom;
        // 数据加载状态的处理
        this.$nextTick(() => {
          Dom = this.$refs[newVal][0];
          clearInterval(Dom.timer1);
          Dom.result.status = 3;
          Dom.uuid = resUuid;
          let s = 0;
          this.$set(Dom.result, 'executeDuration', s);
          Dom.timer1 = setInterval(() => {
            s += 1;
            if (Dom) Dom.result.executeDuration = s;
          }, 1000);
        });
        this.$store.commit('SET_SQLLIST', { key: this.region, list: { running: true, name: this.activeTabName, once: true }});
        this.initList();

        getDataById(resUuid)
          .then(res => {
            const data = res.data;
            // 首次执行
            if (data.status !== 3) {
              clearInterval(Dom.timer1);
              data.once = true;
              data.name = newVal;
              data.running = false;
              if (data.param && Object.keys(data.param).length > 0) {
                const keyList = [];
                Object.keys(data.param).forEach(key => {
                  keyList.push({
                    key,
                    value: data.param[key]
                  });
                });
                data.keyList = keyList;
                Dom.$refs.monaco.setCode(data.querySqlParam);
              }
              this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
              Dom.result = data;
              Dom.showShare = true;
              Dom.uuid = resUuid;
              Dom.running = false;
              this.initList();
              return;
            } else {
              // presto引擎进度
              // if (data.engine.startsWith('presto') && !Dom?.progressObj.tipInfo && !data.engine.includes('huawei')) {
              //   const startDate = new Date().getTime();
              //   const endDate = startDate + 1000 * 3;
              //   Dom.progressObj = { startDate, loading: true, step: 1, endDate };
              //   this.$store.commit('SET_SQLOPTIONS', { region: data.region, name: this.activeTabName, key: 'progressObj', value: { startDate, loading: true, step: 1, endDate }});
              //   Dom?.progressFn();
              // }
              if (data.engine?.includes('hive')) Dom?.handelExecute();
            }
            // 执行中的状态循环请求
            Dom.timerTow = setInterval(() => {
              getDataById(resUuid)
                .then(res => {
                  const data = res.data;
                  if (data.status !== 3) {
                    clearInterval(Dom.timer1);
                    clearInterval(Dom.timerTow);
                    // 真正执行结果获取到后  不回重新赋值
                    if (Dom.result.status !== 3) return;
                    data.once = true;
                    data.name = newVal;
                    data.running = false;
                    if (data.param && Object.keys(data.param).length > 0) {
                      const keyList = [];
                      Object.keys(data.param).forEach(key => {
                        keyList.push({
                          key,
                          value: data.param[key]
                        });
                      });
                      data.keyList = keyList;
                      Dom.$refs.monaco.setCode(data.querySqlParam);
                    }
                    this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
                    Dom.result = data;
                    Dom.showShare = true;
                    Dom.uuid = resUuid;
                    Dom.running = false;
                    this.initList();
                  }
                })
                .catch(() => {
                  clearInterval(Dom.timer1);
                  clearInterval(Dom.timerTow);
                });
            }, 8000);
          })
          .catch(err => {
            clearInterval(Dom.timer1);
            clearInterval(Dom.timerTow);
            const data = {};
            data.status = 1;
            data.message = err.message || '查询出错';

            data.once = true;
            data.name = newVal;
            data.running = false;
            this.$store.commit('SET_SQLLIST', { key: this.region, list: data });
            Dom.result = data;
            Dom.showShare = true;
            Dom.uuid = resUuid;
            Dom.running = false;
            this.initList();
          });
      }
    },
    initList() {
      const sqlResult = this.sqlList[this.region] || {};
      let tabs = localGetItem(`ds-query-sql-${this.region}`);
      tabs = tabs ? JSON.parse(tabs) : [];
      if (tabs.length > 0) {
        tabs.forEach((item, index) => {
          if (Object.keys(sqlResult).includes(item.name)) item.result = sqlResult[item.name];
          item.inputType = false;
        });
        this.queryList = tabs;
      } else {
        const tab = { name: initId, title: 'query1', querySql: '', engine: '' };
        this.queryList = [{ ...tab, inputType: false }];
        localSet(this.region, tab);
      }

      this.clearTimer('once');
    },
    initSqlList() {
      this.initList();
      // 打开上次记录的tab页
      const activeTabName = this.queryList.find(item => item.active)?.name || this.queryList[0].name;
      this.activeTabName = activeTabName;
    },
    dragEagle(e) {
      var targetDiv = this.$refs.leftBox;
      this.offsetWidth = targetDiv.offsetWidth;
      this.startX = e.clientX;
      document.addEventListener('mousemove', this.moveHandler);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.moveHandler);
      });
    },
    moveHandler(e) {
      e.preventDefault();
      const distX = e.clientX - this.startX;
      let w = this.offsetWidth + distX;
      if (w <= 0) {
        w = 0;
      } else {
        if (w >= 600) {
          w = 600;
        }
      }
      const resWidth = (w / this.$refs.queryTab.offsetWidth) * 100;
      this.leftWidth = resWidth.toFixed(2);
    },
    initTabData() {
      this.queryList = [{ name: initId, title: 'query1', querySql: '' }];
      this.activeTabName = initId;
    },
    tabsEdit(targetName, action) {
      if (action === 'remove') {
        if (this.queryList.length <= 1) return;
        this.closeTab(targetName);
      }
    },
    openTab(targetName) {
      this.activeTabName = targetName;
    },
    closeTab(targetName) {
      const tabs = this.queryList;
      let activeName = this.activeTabName;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.activeTabName = activeName;
      this.queryList = tabs.filter(tab => tab.name !== targetName);
      localRemove(this.region, targetName);
      this.$store.commit('SET_SQLLIST', { key: this.region, list: { removeName: targetName }});
      this.initList();
    },
    closeAll() {
      this.$confirm(`关闭所有选项卡将清除所有选项卡，包括尚未保存的查询。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.initTabData();
          localRemove(this.region);
          this.$store.commit('SET_SQLLIST', { key: this.region, list: undefined });
        })
        .catch(() => {});
    },
    sqlCreateTable(data) {
      this.$refs[this.activeTabName][0].insertContent(`CREATE TABLE IF NOT EXISTS ${data.db}.tableName (
  name string COMMENT '名称',
  id string COMMENT '唯一ID'
) PARTITIONED BY (\`dt\` string) stored as parquet LOCATION 's3://XXX/XXXX/XX'`);
    },
    select(type, database, name) {
      this.debounce = true;
      this.visible = false;
      setTimeout(() => {
        this.debounce = false;
      }, 2000);
      if (type === 'table') {
        // this.$refs[this.activeTabName][0].insertContent(`select * from ${database}.${name} limit 20`);
        this.$refs[this.activeTabName][0].insertContent(name);
      } else if (type === 'col') {
        this.$refs[this.activeTabName][0].insertContent(name);
      }
    },
    setSql(sql) {
      this.$refs[this.activeTabName][0].insertContent(sql);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.query-tab {
  height: 100%;
  display: flex;
  position: relative;
  .left-wrap {
    position: relative;
    // height: calc(100vh - 110px);
    height: 100%;
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
    overflow: hidden;
    .drag-bar {
      cursor: col-resize;
      transition: all 1s;
      display: none;
      position: absolute;
      top: 50%;
      right: 0px;
      transform: translateY(-50%);
      height: 56px;
      line-height: 38px;
      border-radius: 2px;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 12px solid #f2f2f2;
      .bar {
        display: inline-block;
        transform: translate(8px, 6px);
        width: 3px;
        height: 25px;
        background-color: #c0c0c0;
      }
    }
    &:hover .drag-bar {
      display: block;
    }
  }
  .right-wrap {
    position: relative;
    // height: calc(100vh - 110px);
    height: 100%;
    padding: 0;
    ::v-deep .el-tabs__header {
      margin: 0;
      padding: 0;
      height: 33px;
      .el-tabs__new-tab {
        display: inline-block;
        float: none;
        width: 24px;
        height: 24px;
        margin-top: 8px;
        border: none;
        color: #409eff;
      }
      .el-tabs__nav-wrap {
        float: left;
        max-width: calc(100% - 100px);
        .el-tabs__item {
          padding: 0 6px;
          height: 32px;
          line-height: 32px;
          .tabName {
            svg,
            i {
              vertical-align: middle;
            }
            .el-button {
              border: none;
              padding-right: 4px;
              margin-right: -4px;
            }
          }
          .tabNameInput {
            width: 140px;
            .el-input__inner {
              padding: 0 2px;
            }
          }
        }
      }
    }
    .add-disabled ::v-deep .el-tabs__new-tab {
      color: #c0c4cc !important;
      cursor: not-allowed;
    }
    .el-tabs {
      ::v-deep .el-tabs__nav-prev,
      ::v-deep .el-tabs__nav-next {
        line-height: 32px;
      }
    }
    .el-menu-more {
      position: absolute;
      right: 10px;
      top: 3px;
      z-index: 200;
      border-bottom: none;
      .icon-more {
        width: 24px;
        height: 24px;
      }
      ::v-deep .el-submenu {
        overflow: visible !important;
      }
      ::v-deep .el-submenu__title {
        height: 28px;
        width: 24px;
        line-height: 38px;
        border-bottom: none;
      }
      ::v-deep .el-submenu__icon-arrow {
        display: none;
      }
      ::v-deep .el-menu--horizontal {
        top: 24px !important;
        left: auto !important;
        right: 6px;
        .el-menu--popup {
          min-width: auto;
          .el-menu-item {
            min-width: auto;
            display: flex;
            align-items: center;
            padding: 0;
          }
        }
      }
      .menu-item-tabname {
        flex: 1;
        padding: 0 30px 0 10px;
        &:hover {
          color: $c-primary;
        }
      }
      .menu-item-close {
        margin-right: 0;
        padding: 6px 10px;
        width: 38px;
        &:hover {
          color: $color-cb;
        }
        &-all {
          width: 100%;
          padding: 0 10px;
          &:hover {
            color: $color-cb;
          }
        }
      }
    }
    ::v-deep .el-tabs__content {
      padding: 0;
    }
    .query-tab-content {
      // height: calc(100vh - 158px);
    }
  }
  .query_region {
    position: absolute;
    top: -32px;
    right: 6px;
    display: flex;
    align-items: center;
    .label {
      margin-right: 5px;
    }
  }
}
.addSearch_dial {
  .dial_wrapper {
    margin-top: -20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .addTab_item {
      cursor: pointer;
      width: 100px;
      height: 100px;
      border: 2px solid #999;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .icon {
        font-size: $global-font-size-20;
      }
      .title {
        margin-top: 5px;
      }
      &:hover {
        box-shadow: 0 2px 6px 0 rgb(0 0 0 / 30%);
        transform: scale(1.1);
      }
    }
  }
}
.saveList_dial {
  ::v-deep .el-dialog__body {
    padding: 0 20px;
    .search_save_list {
      .el-table {
        overflow: auto;
        max-height: 400px;
      }
    }
    .dial_search {
      display: flex;
      margin-bottom: 10px;
      justify-content: end;
      .search_item {
        width: 40%;
      }
    }
    .el-pagination {
    }
  }
}
</style>
<style>
/* .svg_help {
  transform: scale(1.2);
} */
</style>
