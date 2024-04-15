<template>
  <div class="wrap_metadata">
    <!-- <div v-show="!value" class="close_tips" @click="update(true)">
      <i class="el-icon-d-arrow-left"></i>
    </div> -->
    <div v-show="value" class="content" :style="{ width: width + 'px' }">
      <i class="el-icon-close close_icon" @click="update(false)"></i>
      <el-tabs ref="metadataTabs" v-model="activeTable" class="metadataTabs" closable type="card" @tab-remove="removeTab">
        <el-tab-pane v-for="(item, index) in metaDataList" :key="item.table + item.database" class="tableTabs" :label="item.table" :name="item.table + item.database">
          <div class="title">
            <svg-icon icon-class="table" class="icon" />
            <span class="name ellipsis">{{ item.table }}</span>
            <span v-if="item.owner !== '$'" class="owner">
              <i class="el-icon-user"></i>
              <span class="owner_name">{{ item.owner }}</span>
            </span>
          </div>
          <el-tabs key="0" v-model="item.type" class="tableDiatal" type="card" @tab-click="handleClick($event, item, index)">
            <el-tooltip v-show="item.type === 'first'" effect="dark" placement="bottom" class="title_tips">
              <template #content>
                {{ '点击此按钮，可刷新元数据信息' }}
              </template>
              <i :class="[item.refreshing || item.metaLoading ? 'el-icon-loading' : 'el-icon-refresh']" @click="clearTableCache(item, index)"></i>
            </el-tooltip>
            <el-tab-pane label="元数据信息" name="first">
              <el-table v-loading="item.metaLoading" class="box_table" :data="item.metaData" stripe style="width: 100%">
                <el-table-column label="字段名" min-width="120" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button class="ellipsis cloumnClass" type="text" @click="setSql(item, scope.row.columnName)">{{ scope.row.columnName }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="columnType" label="字段类型" min-width="120" show-overflow-tooltip> </el-table-column>
                <el-table-column prop="columnComment" label="字段描述" min-width="130" show-overflow-tooltip> </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane v-if="item.catalog === 'hive'" label="数据预览" name="second">
              <el-table v-if="item.viewData && item.viewData.length > 0" v-loading="item.viewLoading" class="box_table" :data="item.viewData" stripe style="width: 100%">
                <el-table-column v-for="(v, key) in item.viewData[0]" :key="key" :prop="key" :label="key" min-width="120" show-overflow-tooltip> </el-table-column>
              </el-table>
              <el-empty v-else description="暂无数据"></el-empty>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { getTableOwner, getTableCols, clearTableCache } from '@/api/querydata';
import { getData } from '@/api/metadata';
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'MetadataView',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 0
    },
    region: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeTable: '',
      metaDataList: [
        // {
        //   table: 'sd',
        //   type: 'sd',
        //   owner:'',
        //   region:'',
        //   catalog:'',
        //   database:'',
        //   metaData:[],
        //   viewData:[]
        // }
      ],
      menuRegion: {
        aws_ue1: 'ue1',
        aws_sg: 'sg1',
        huawei_sg: 'sg2'
      }
    };
  },
  computed: {
    ...mapGetters(['metaData'])
  },
  watch: {
    region(newVal, oldVal) {
      this.SET_METADATA({ region: oldVal, resultData: this.metaDataList });
      this.$nextTick(() => {
        this.metaDataList = [];
        const metaData = this.metaData[newVal] || [];
        this.metaDataList = metaData;
        this.resetGetData(this.metaDataList);
      });
    },
    activeTable() {
      this.SET_METADATA({ region: this.region, resultData: this.metaDataList });
    }
  },
  created() {
    const metaData = this.metaData[this.region] || [];
    this.metaDataList = metaData;
    this.resetGetData(this.metaDataList);
  },
  methods: {
    ...mapMutations(['SET_METADATA']),
    clearTableCache(data, index) {
      this.$set(data, 'refreshing', true);
      const params = {
        engine: '',
        catalog: data.catalog,
        region: data.region,
        database: data.database,
        table: data.table
      };
      clearTableCache(params)
        .then(res => {
          if (res.code === 0) {
            this.getCols(data, index);
            this.getTableOwner(index);
          }
        })
        .finally(() => {
          this.$set(data, 'refreshing', false);
        });
    },
    resetGetData(data) {
      data.forEach((item, index) => {
        if (item.metaLoading) this.getCols(item, index);
        if (item.viewLoading) this.getData(item);
      });
    },
    resetData() {
      this.metaDataList = [];
    },
    setSql(data, columnName) {
      // const str = `select ${columnName} from ${data.database}.${data.table} `;
      this.$parent.setSql(columnName);
    },
    removeTab(name) {
      const index = this.metaDataList.findIndex(item => item.table + item.database === name);
      this.metaDataList.splice(index, 1);
      if (this.metaDataList.length === 0) {
        this.update(false);
        return;
      }
      if (index < this.metaDataList.length) {
        this.activeTable = this.metaDataList[index].table + this.metaDataList[index].database;
      } else {
        this.activeTable = this.metaDataList[index - 1].table + this.metaDataList[index - 1].database;
      }
    },
    addTabs(data) {
      let currObj;
      let index;
      data.region = this.region || '';

      this.metaDataList.forEach((item, i) => {
        if (item.table === data.table && item.database === data.database) {
          currObj = item;
          index = i;
        }
      });
      if (currObj) {
        currObj.owner || this.getTableOwner(index);
        currObj.type = currObj.type ? currObj.type : 'first';
      } else {
        data.type = 'first';
        if (this.metaDataList.length >= 5) {
          this.$message.warning('最多展示5个数据表信息，此次查看将替换第1个数据表信息');
          this.metaDataList.pop();
          this.metaDataList.unshift(data);
          this.getTableOwner(0);
          this.getCols(data, 0);
        } else {
          this.metaDataList.push(data);

          this.getTableOwner(this.metaDataList.length - 1);
          this.getCols(data, this.metaDataList.length - 1);
        }
      }
      this.$nextTick(() => {
        this.activeTable = data.table + data.database;
      });
    },
    handleClick(e, data, index) {
      this.metaDataList[index].type = e.name;
      if (e.name === 'second' && !data.viewData) {
        this.getData(data);
      }
    },
    getCols(data, index) {
      this.$set(this.metaDataList[index], 'metaLoading', true);
      const params = { engine: '', catalog: data.catalog, region: data.region, database: data.database, table: data.table };
      getTableCols(params)
        .then(res => {
          const data = res.data;
          this.$set(this.metaDataList[index], 'metaData', data);
        })
        .finally(() => {
          this.$set(this.metaDataList[index], 'metaLoading', false);
        });
    },
    getData(data) {
      if (data.catalog !== 'hive') return;
      this.$set(data, 'viewLoading', true);
      const params = {
        region: this.menuRegion[data.region] || '',
        table: `${data.database}.${data.table}`
      };
      getData(params)
        .then(res => {
          if (Array.isArray(res.data)) {
            const result = res.data || [];
            this.$set(data, 'viewData', result);
          } else {
            this.$message.error(res.data);
            this.$set(data, 'viewData', []);
          }
        })
        .catch(() => {
          this.$set(data, 'viewData', []);
        })
        .finally(() => {
          this.$set(data, 'viewLoading', false);
        });
    },
    getTableOwner(index) {
      if (!['hive', 'iceberg'].includes(this.metaDataList[index].catalog)) {
        this.$set(this.metaDataList[index], 'owner', '$');
        return;
      }
      const params = {
        catalog: this.metaDataList[index].catalog,
        table: this.metaDataList[index].table,
        database: this.metaDataList[index].database,
        region: this.region
      };
      getTableOwner(params).then(res => {
        if (res.code === 0) {
          this.$set(this.metaDataList[index], 'owner', res.data?.[0] || '_');
        }
      });
    },
    update(type) {
      this.$emit('update', type);
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap_metadata {
  height: 100%;
  position: relative;
  height: calc(100vh - 96px);
  box-shadow: -2px 2px 6px 0 rgb(0 0 0 / 10%);
  &:hover .close_tips {
    display: block;
  }
  .close_tips {
    cursor: pointer;
    position: relative;
    height: 100%;
    display: none;
    .el-icon-d-arrow-left {
      position: absolute;
      top: 50%;
      left: 0;
    }
  }
  .content {
    position: relative;
    height: 100%;
    .close_icon {
      font-size: $global-font-size-16;
      position: absolute;
      right: 9px;
      top: 7px;
      cursor: pointer;
      z-index: 2001;
    }
    .metadataTabs {
      height: 100%;
      ::v-deep .el-tabs__header {
        padding: 0;
        .el-tabs__item {
          padding: 0 5px;
          // font-size: $global-font-size-12;
        }
        .el-tabs__nav > div,
        .el-tabs__nav-prev,
        .el-tabs__nav-next {
          height: 32px;
          line-height: 32px;
        }
      }
      ::v-deep > .el-tabs__header {
        padding-right: 30px;
      }
      ::v-deep .el-tabs__content {
        height: calc(100% - 32px);
        padding: 5px;
        border: none;
      }
      .tableTabs {
        height: 100%;
        .title {
          padding: 10px 0;
          white-space: nowrap;
          .icon {
            vertical-align: baseline;
          }
          .name {
            font-weight: 550;
            display: inline-block;
            max-width: 66%;
          }
          .owner {
            margin-left: 20px;
            color: #93a1c2;
            .owner_name {
              font-size: $global-font-size-12;
            }
          }
        }
        .tableDiatal {
          position: relative;
          height: 100%;
          ::v-deep .el-tabs__content {
            height: calc(100% - 74px);
            padding: 5px;
            padding-left: 0;
            padding-right: 0;
            // border: 1px solid #e2e9f3;
            .el-tab-pane {
              height: 100%;
            }
            .el-table {
              height: 100%;
            }
            .el-table__body-wrapper {
              height: calc(100% - 40px);
              overflow-y: auto;
            }
            .cell {
              white-space: nowrap;
              span {
                white-space: nowrap;
              }
              .cloumnClass {
                display: inline-block;
                width: 100%;
                text-align: start;
              }
            }
          }
          .title_tips {
            position: absolute;
            top: -20px;
            right: 6px;
            cursor: pointer;
          }
          .el-empty {
            ::v-deep .el-empty__image {
              width: 100px;
            }
          }
        }
      }
    }
  }
}
.box_table {
  &::before {
    height: 0;
  }
  ::v-deep .el-table__body-wrapper {
    .el-table__cell {
      padding: 4px 0;
      height: 24px;
    }
  }
}
</style>
