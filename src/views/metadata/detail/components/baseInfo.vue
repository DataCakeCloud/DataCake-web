<template>
  <div v-loading="loading" class="detial-item">
    <div class="tool">
      <div class="tool-lf">
        <div class="title">基本信息</div>
      </div>
      <div class="tool-rh">
        <el-button v-if="!tableInfo.flag" icon="el-icon-plus" @click="handleCollect">收藏</el-button>
        <el-tooltip v-else class="item" effect="dark" content="取消收藏" placement="bottom">
          <el-button @click="handleCollect">已收藏</el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="detial-content">
      <el-row class="detial-box" :gutter="20">
        <el-col :span="12">
          <p v-for="item in leftDetial" :key="item.prop" :class="['box-item', { pad: item.edit }]">
            <template>
              <span v-if="item.iconType === 'svg'" class="label">
                <svg-icon v-if="item.titleIcon" class="icon" :icon-class="item.titleIcon"></svg-icon>
                {{ item.label + ' : ' }}
              </span>
              <span v-else :class="['label', item.titleIcon]">{{ item.label + ' : ' }}</span>
            </template>
            <template v-if="editList.includes(item.prop)">
              <template v-if="item.modelData">
                <el-cascader v-model="item.modelData.idValues" class="item-trans" clearable :options="options[item.modelData.id]" :props="modelProps"></el-cascader>
              </template>
            </template>
            <template v-else>
              <!-- listTag  -->
              <template v-if="item.prop === 'listTag'">
                <div class="tag-box">
                  <el-tag v-for="tag in tableInfo[item.prop]" :key="tag.name" :closable="permission" @close="closeTag(tag)">{{ tag.name }}</el-tag>
                  <el-input v-if="showInput" v-model.trim="tagName" style="width: 180px; margin-right: 5px" clearable size="mini" placeholder="请输入标签名称"></el-input>
                  <svg-icon v-if="showInput" icon-class="cancel1" class="tag-btn-icon" @click="handelTag(false)" />
                  <svg-icon v-if="showInput" icon-class="save" class="tag-btn-icon" @click="addTag" />
                  <el-button v-else class="new-tag tag-btn" size="mini" :disabled="!permission" @click="handelTag(true)">+ New Tag</el-button>
                </div>
              </template>
              <template v-else-if="item.modelData">
                <span class="value">{{ item.modelData.nameValues.slice(1).join('/') || '-' }}</span>
              </template>
              <template v-else-if="item.prop === 'provider'">
                <el-tag type="info" class="value transY5">{{ tableInfo[item.prop] }}</el-tag>
              </template>
              <template v-else-if="item.prop === 'fileFormat'">
                <template v-if="tableInfo[item.prop]">
                  <div class="tag-box">
                    <template v-for="val in tableInfo[item.prop].split(',')">
                      <el-tag :key="val">{{ val }}</el-tag>
                    </template>
                  </div>
                </template>
                <span v-else class="value"> - </span>
              </template>
              <!-- 正常展示 -->
              <span v-else class="value">
                {{ tableInfo[item.prop] || '-' }}
                <template v-if="item.copy">
                  <el-tooltip class="item" effect="dark" content="复制" placement="top">
                    <i class="el-icon-document-copy icon-btn" @click="copy(tableInfo[item.prop])"></i>
                  </el-tooltip>
                </template>
              </span>
            </template>
            <template v-if="item.edit">
              <template v-if="editList.includes(item.prop)">
                <svg-icon icon-class="cancel1" class="icon-btn" @click="calcelEdit(item.prop, item.modelData)" />
                <svg-icon icon-class="save" class="icon-btn" @click="handelItem(item.prop, 'save')" />
              </template>
              <i v-else class="el-icon-edit icon-btn" @click="handelItem(item.prop, 'edit')"></i>
            </template>
            <template v-if="item.delete">
              <el-tooltip class="item" effect="dark" content="该模型已禁用只允许被删除" placement="top">
                <i class="el-icon-delete icon-btn" @click="handelItem(item.prop, 'delete')"></i>
              </el-tooltip>
            </template>
          </p>
        </el-col>
        <el-col :span="12">
          <p v-for="item in rightDetial" :key="item.prop" :class="['box-item', { pad: item.edit }]">
            <template>
              <span v-if="item.iconType === 'svg'" class="label">
                <svg-icon v-if="item.titleIcon" class="icon" :icon-class="item.titleIcon"></svg-icon>
                {{ item.label + ' : ' }}
              </span>
              <span v-else :class="['label', item.titleIcon]">{{ item.label + ' : ' }}</span>
            </template>
            <template v-if="editList.includes(item.prop)">
              <template v-if="item.prop === 'owner'">
                <el-select v-model="tableInfo[item.prop]" class="item-trans" clearable placeholder="请选择">
                  <el-option v-for="group in groupOptions" :key="group.id" :label="group.name" :value="group.name"> </el-option>
                </el-select>
              </template>
              <template v-if="item.prop === 'securityLevel'">
                <el-select v-model="tableInfo[item.prop]" class="item-trans" clearable placeholder="请选择">
                  <el-option v-for="level in securityLevelList" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </template>
              <template v-if="item.prop === 'description' || item.prop === 'useDirection'">
                <el-input v-model="tableInfo[item.prop]" type="textarea" :maxlength="120" :rows="2" style="width: calc(100% - 135px); vertical-align: top" placeholder="请输入内容"></el-input>
              </template>
            </template>
            <template v-else>
              <span v-if="item.prop === 'partitionKeys'" class="value">{{ formatKeys(tableInfo[item.prop]) }}</span>
              <el-tag v-else-if="item.prop === 'partitionType'" type="warning" class="transY5">{{ formatpartitionType(tableInfo[item.prop]) }}</el-tag>
              <template v-else-if="item.prop === 'latestPartitionName'">
                <el-tag v-if="tableInfo[item.prop]" type="warning" class="transY5">{{ tableInfo[item.prop] }}</el-tag>
                <span v-else class="value">{{ '-' }}</span>
              </template>
              <!-- 正常展示 -->
              <span v-else class="value">{{ tableInfo[item.prop] || '-' }}</span>
            </template>
            <template v-if="item.edit">
              <template v-if="editList.includes(item.prop)">
                <svg-icon icon-class="cancel1" class="icon-btn" @click="calcelEdit(item.prop, item.modelData)" />
                <svg-icon icon-class="save" class="icon-btn" @click="handelItem(item.prop, 'save')" />
              </template>
              <i v-else class="el-icon-edit icon-btn" @click="handelItem(item.prop, 'edit')"></i>
            </template>
          </p>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getTableInfo, getTableOtherInfo, getModelTree, updateTableInfo, collect } from '@/api/metadata';
import { mapActions } from 'vuex';
import copy from 'copy-to-clipboard';
import { mapGetters } from 'vuex';

const editorPropList = ['owner', 'securityLevel', 'description', 'useDirection'];

export default {
  name: 'BaseInfo',
  props: {
    groupOptions: {
      type: Array,
      default: () => []
    },
    authority: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      leftDetial: [
        { label: '表类型', prop: 'tableType' },
        { label: 'Provider', prop: 'provider' },
        { label: 'Location', prop: 'location', copy: true },
        { label: '输入', prop: 'inputFormat' },
        { label: '输出', prop: 'outputFormat' },
        { label: '存储类型', prop: 'fileFormat', titleIcon: 'el-icon-cloudy icon' }, // titleIcon: 'el-icon-cloudy icon'
        // { label: '小文件数', prop: 'fileNum' }, // titleIcon: 'el-icon-document icon'
        // { label: '生命周期', prop: 'lifecycle' }, //
        // { label: '行数', prop: 'count' }, //
        { label: '标签', prop: 'listTag' }
        // { label: '分层模型', prop: 'listModel', edit: false }
      ],
      defaultLeftDetial: [
        { label: '表类型', prop: 'tableType' },
        { label: 'Provider', prop: 'provider' },
        { label: 'Location', prop: 'location', copy: true },
        { label: '输入', prop: 'inputFormat' },
        { label: '输出', prop: 'outputFormat' },
        { label: '存储类型', prop: 'fileFormat', titleIcon: 'el-icon-cloudy icon' }, // titleIcon: 'el-icon-cloudy icon'
        // { label: '小文件数', prop: 'fileNum' }, // titleIcon: 'el-icon-document icon'
        // { label: '生命周期', prop: 'lifecycle' }, //
        // { label: '行数', prop: 'count' }, //
        { label: '标签', prop: 'listTag' }
        // { label: '分层模型', prop: 'listModel', edit: false }
      ],
      rightDetial: [
        { label: '归属库', prop: 'dbName' },
        // { label: '负责人', prop: 'createBy' }, //
        { label: '归属用户组', prop: 'owner', edit: false, titleIcon: 'userGroup', iconType: 'svg' },
        { label: '创建时间', prop: 'createTime' },
        { label: '安全级别', prop: 'securityLevel', edit: false },
        // { label: '存储大小', prop: 'size' }, //
        { label: '分区类型', prop: 'partitionType' },
        { label: '分区字段', prop: 'partitionKeys' },
        { label: '分区数', prop: 'partitionCount' },
        { label: '最新分区', prop: 'latestPartitionName' },
        { label: '表描述', prop: 'description', edit: false },
        { label: '使用说明', prop: 'useDirection', edit: false }
      ],
      loading: false,
      tableInfo: {},
      oldTableInfo: {},
      route: this.$route.query || {},
      editList: [],
      tagName: '',
      showInput: false,
      options: {},
      modelData: [],
      modelProps: {
        label: 'name',
        value: 'id',
        checkStrictly: true
      },
      securityLevelList: ['一级', '二级', '三级', '四级']
    };
  },
  computed: {
    ...mapGetters(['currentUserGroup']),
    permission() {
      return this.currentUserGroup?.name === 'dpm' || this.currentUserGroup?.name === this.tableInfo['owner'];
    }
  },
  watch: {
    'tableInfo.listModel': function(data) {
      this.leftDetial = [...this.defaultLeftDetial];
      data?.forEach(item => {
        // 模型有效 或者  无效但是之前选过的展示
        if (item.effective || (!item.effective && item.idValues.length)) {
          this.leftDetial.push({
            label: item.name,
            prop: 'listModel' + item.id,
            modelData: Object.assign({ ...item }, { idValues: item.idValues.slice(1) }),
            edit: this.permission && item.effective,
            delete: this.permission && !item.effective
          });
        }

        this.addDisabled(this.options[item.id], item.idValues[item.idValues.length - 1]);
        // 对有模型的进行处理
        if (item.idValues.length) {
          this.formatOptions(item.idValues, item.nameValues, item.idValues[item.idValues.length - 1]);
        }
      });
    },
    authority: {
      handler: function(val) {
        if (val) {
          this.leftDetial.forEach(item => {
            if (editorPropList.includes(item.prop)) {
              item.edit = true;
            }
          });
          this.rightDetial.forEach(item => {
            if (editorPropList.includes(item.prop)) {
              item.edit = true;
            }
          });
        }
      },
      immediate: true
    }
  },
  created() {
    this.getTableInfo();
  },
  methods: {
    ...mapActions(['initDetail']),
    copy(str) {
      copy(str, {
        format: 'text/plain'
      });
      this.$message({
        type: 'success',
        message: '已复制到剪贴板'
      });
    },
    formatpartitionType(val) {
      return ['非分区表', '分区表'][val] || '-';
    },
    formatKeys(data) {
      if (data) {
        try {
          const dataList = JSON.parse(data) || [];
          return (
            dataList
              .reduce((a, b) => {
                a.push(`${b.name}-${b.type}-${b.comment}`);
                return a;
              }, [])
              .join(', ') || '-'
          );
        } catch (error) {
          return '-';
        }
      } else {
        return '-';
      }
    },
    handleCollect() {
      const isCollect = !this.tableInfo.flag;
      let tableName = this.route.tableName;
      if (!isCollect) tableName = `${this.route.region}.${this.route.databaseName}.${this.route.tableName}`;
      const params = {
        region: this.route.region,
        dbName: this.route.databaseName,
        tableName,
        isCollect
      };
      collect(params).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: isCollect ? '收藏成功' : '取消收藏成功'
          });
          this.tableInfo.flag = isCollect;
        }
      });
    },
    getModelTree() {
      return getModelTree().then(res => {
        this.modelData = res.data || [];
        this.modelData = this.removeChildrenNo(this.modelData);
        this.setOptions(this.modelData);
      });
    },
    setOptions(data) {
      data.forEach(item => {
        this.options[item.id] = item.children ? [].concat(item.children) : [];
      });
    },
    addDisabled(data, currentId) {
      if (!data) return;
      data.forEach(item => {
        const disabled = item.id === currentId || !item.children || !item.children.length;
        item.disabled = !disabled;
        if (item.children && item.children.length) this.addDisabled(item.children, currentId);
      });
    },
    // 根据返回的模型数据处理 optiontree
    formatOptions(ids, names, currentId) {
      if (this.options[ids[0]]) {
        const data = this.$utils.findSubsetById(this.options[ids[0]], currentId, 'id');
        if (data) {
          return;
        } else {
          const leaveIds = ids.slice(1);
          let currentData = {};
          for (let index = 0; index < leaveIds.length; index++) {
            const id = leaveIds[index];
            if (this.options[ids[0]].length === 0) {
              this.options[ids[0]].push({
                id,
                name: names[index + 1]
              });
            }
            const data = this.$utils.findSubsetById(this.options[ids[0]], id, 'id');
            if (!data) {
              currentData.children = [
                {
                  id: id,
                  name: names[index + 1]
                }
              ];
              currentData = currentData.children[0];
            } else {
              currentData = data;
            }
          }
        }
      }
    },
    removeChildrenNo(data) {
      data.forEach(item => {
        if (item.children && item.children.length) {
          this.removeChildrenNo(item.children);
        } else {
          delete item.children;
        }
      });
      return data;
    },
    handelTag(type) {
      this.showInput = type;
      if (!type) {
        this.tagName = '';
      }
    },
    async addTag() {
      if (this.tagName) {
        const result = await this.updateTableInfo({
          targetTagName: this.tagName,
          region: this.route.region,
          dbName: this.route.databaseName,
          tableName: this.route.tableName
        });
        if (result) {
          this.tagName = '';
          this.showInput = false;
          this.getTableInfo();
        }
      } else {
        this.$message.warning('请输入标签名称');
      }
    },
    async closeTag(data) {
      const result = await this.updateTableInfo({
        sourceTagCategoryId: data.id,
        region: this.route.region,
        dbName: this.route.databaseName,
        tableName: this.route.tableName
      });
      if (result) {
        this.handelTag(false);
        this.getTableInfo();
      }
    },
    updateTableInfo(params) {
      return updateTableInfo(params).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功');
          return true;
        }
      });
    },
    calcelEdit(prop, modelData) {
      if (modelData) {
        const data = this.leftDetial.find(item => item.prop === prop);
        const dataModel = this.oldTableInfo[data.modelData.name];
        data.modelData = Object.assign(dataModel, { idValues: dataModel.idValues.slice(1) });
      } else {
        this.tableInfo[prop] = this.oldTableInfo[prop];
      }
      const index = this.editList.indexOf(prop);
      this.editList.splice(index, 1);
    },
    async handelItem(prop, type) {
      if (type === 'edit') {
        this.editList.push(prop);
      } else if (type === 'save') {
        // 后端返回状态
        let result;

        if (prop.includes('listModel')) {
          const modelData = this.leftDetial.find(item => item.prop === prop)?.modelData;
          const params = {};
          const newVal = modelData.idValues.slice(-1)[0];
          const oldVal = this.oldTableInfo[modelData.name].idValues.slice(-1)[0];
          if (!newVal) {
            // 删除
            params.sourceModelCategoryId = oldVal;
          } else if (!oldVal) {
            // 新增
            params.targetModelCategoryId = newVal;
          } else {
            // 编辑
            // if (!modelData.effective && newVal !== oldVal) {
            //   // 无效的模型
            //   this.$message.warning('该模型无效不支持更改');
            //   return;
            // }
            params.sourceModelCategoryId = oldVal;
            params.targetModelCategoryId = newVal;
          }
          result = await this.updateTableInfo({
            ...params,
            region: this.route.region,
            dbName: this.route.databaseName,
            tableName: this.route.tableName
          });
          if (result) {
            this.getTableInfo();
          }
        } else {
          result = await this.updateTableInfo({
            [prop]: this.tableInfo[prop],
            region: this.route.region,
            dbName: this.route.databaseName,
            tableName: this.route.tableName
          });
          if (result) {
            this.oldTableInfo[prop] = this.tableInfo[prop];
          }
        }

        // 结果处理
        if (result) {
          const index = this.editList.indexOf(prop);
          this.editList.splice(index, 1);
        }
      } else if (type === 'delete') {
        // 后端返回状态
        let result;

        if (prop.includes('listModel')) {
          this.$confirm('确定要删除该模型吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async res => {
            const modelData = this.leftDetial.find(item => item.prop === prop)?.modelData;
            const oldVal = modelData.idValues.slice(-1)[0];
            result = await this.updateTableInfo({
              sourceModelCategoryId: oldVal,
              region: this.route.region,
              dbName: this.route.databaseName,
              tableName: this.route.tableName
            });
            if (result) {
              this.getTableInfo();
            }
          });
        }
      }
    },
    getTableInfo(clearCache) {
      this.loading = true;
      const params = {
        region: this.route.region,
        dbName: this.route.databaseName,
        tableName: this.route.tableName,
        clearCache: !!clearCache
      };
      getTableInfo(params)
        .then(res => {
          if (res.code === 0) {
            this.tableInfo = {
              ...this.tableInfo,
              ...res.data
            };
            this.initDetail(this.tableInfo);
            this.oldTableInfo = JSON.parse(JSON.stringify(this.tableInfo));
          }
        })
        .finally(() => {
          this.loading = false;
        });
      getTableOtherInfo(params).then(async res => {
        if (res.code === 0) {
          const data = res.data || {};
          await this.getModelTree();
          const modelData =
            data.listModel?.reduce((a, b) => {
              a[b.name] = b;
              return a;
            }, {}) || {};
          this.tableInfo = {
            ...this.tableInfo,
            ...modelData,
            listModel: data.listModel,
            latestPartitionName: data.latestPartitionName,
            partitionCount: data.partitionCount,
            listTag: data.listTag
          };
          this.initDetail(this.tableInfo);
          this.oldTableInfo = JSON.parse(JSON.stringify(this.tableInfo));
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './title.scss';
.detial-item {
  .detial-content {
    margin-top: 10px;
    .detial-box {
      padding: 0 10px;
      .box-item {
        display: flex;
        margin-bottom: 30px;
        // display: flex;
        // position: relative;
        // &.pad {
        //   padding-right: 16px;
        // }
        .item-trans {
          transform: translateY(-8px);
        }
        .label {
          margin-right: 10px;
          white-space: nowrap;
          &.icon::before,
          .icon {
            color: #81d3f8;
          }
        }
        .value {
          color: #5a5a5a;
          word-break: break-all;
        }
        .icon-btn {
          margin-left: 10px;
          color: $c-primary;
          vertical-align: middle;
          cursor: pointer;
          // position: absolute;
          // right: 0;
          // top: 2px;
          &.el-icon-delete {
            color: #e47470;
          }
        }
        .tag-box {
          margin-top: -4px;
          .el-tag {
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .tag-btn {
            height: 24px;
          }
          .tag-btn-icon {
            cursor: pointer;
            color: $c-primary;
            transform: translateY(3px);
            &:not(:last-child) {
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}
.transY5 {
  transform: translateY(-5px);
}
</style>
