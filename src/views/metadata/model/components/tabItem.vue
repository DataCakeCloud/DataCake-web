<template>
  <div class="tab-item">
    <div class="tab-title">
      <div class="title-lf">
        <el-checkbox v-model="data.effective" :disabled="effectiveType" @change="changeChecked">是否启用此模型</el-checkbox>
        <el-popover placement="bottom-start" trigger="click" width="800">
          <template>
            <img style="width: 100%" :src="modelSrc" alt="模型说明" />
          </template>
          <el-button slot="reference" class="yan" type="text">
            <el-tooltip class="item" effect="dark" content="预览" placement="top">
              <svg-icon icon-class="eye-open-2" class="eye" />
            </el-tooltip>
          </el-button>
        </el-popover>
      </div>
      <div class="title-rh">
        <el-button type="primary" :disabled="effectiveType" @click="handelAdd">添加</el-button>
      </div>
    </div>
    <ModelTable :column-data="columnData" :data="data" :table-data="tableData" :disabled="effectiveType" v-on="$listeners" @handleEdit="handelAdd" />
    <DefaultAdd ref="DefaultAdd" :data="data" v-on="$listeners" />
    <OtherAdd ref="OtherAdd" :data="data" v-on="$listeners" />
  </div>
</template>

<script>
import ModelTable from './modelTable.vue';
import DefaultAdd from './defaultAdd.vue';
import OtherAdd from './otherAdd.vue';
import { updateEffectiveModel } from '@/api/metadata';
import * as utils from '@/utils/index';
import { mapGetters } from 'vuex';

const defaultColumnData = [
  // {
  //   prop: 'name1',
  //   label: '云资源区域',
  //   width: '120'
  // },
  {
    prop: 'name1',
    label: '数据源类型',
    width: '100'
  },
  {
    prop: 'name2',
    label: '库',
    width: '100',
    tooltip: true
  },
  {
    prop: 'description',
    label: '备注',
    width: '100',
    tooltip: true
  },
  {
    prop: 'createTime',
    label: '添加时间',
    width: '100',
    format: row => {
      return row.createTime ? utils.parseTime(row.createTime) : '-';
    }
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    width: '100',
    format: row => {
      return row.updateTime ? utils.parseTime(row.updateTime) : '-';
    }
  }
];
const otherColumnData = [
  {
    prop: 'name1',
    label: '一级类目名称',
    width: '120'
  },
  {
    prop: 'name2',
    label: '二级类目名称',
    width: '100'
  },
  {
    prop: 'name3',
    label: '三级类目名称',
    width: '100',
    tooltip: true
  },
  {
    prop: 'description',
    label: '描述',
    width: '100'
  },
  {
    prop: 'createTime',
    label: '添加时间',
    width: '100',
    format: row => {
      return row.createTime ? utils.parseTime(row.createTime) : '-';
    }
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    width: '100',
    format: row => {
      return row.updateTime ? utils.parseTime(row.updateTime) : '-';
    }
  }
];

export default {
  name: 'TabItem',
  components: {
    ModelTable,
    DefaultAdd,
    OtherAdd
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      modelSrc: require('@/assets/model.png')
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    columnData() {
      return this.data.id === 0 ? defaultColumnData : otherColumnData;
    },
    effectiveType() {
      return this.data.id === 0 || !this.userInfo.isAdmin;
    },
    tableData() {
      return this.tileData(this.data.children);
    }
  },
  methods: {
    tileData(data = []) {
      return data.reduce((a, b) => {
        a.push({ ...b, children: null });
        if (b.children && b.children.length) {
          const list = this.tileData(b.children);
          a.push(...list);
        }
        return a;
      }, []);
    },
    changeChecked(val) {
      const params = {
        modelId: this.data.id,
        isEffective: val
      };
      updateEffectiveModel(params).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功');
        }
      });
    },
    handelAdd(data) {
      if (this.data.id === 0) {
        this.$refs.DefaultAdd?.show(data);
      } else {
        this.$refs.OtherAdd?.show(data);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tab-item {
  .tab-title {
    display: flex;
    justify-content: space-between;
    .title-lf {
      .yan {
        margin-left: 10px;
        .eye {
          transform: translateY(2px);
        }
      }
    }
  }
}
</style>
