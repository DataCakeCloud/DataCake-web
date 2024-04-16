<template>
  <el-card class="dashboard-card syn-module">
    <div class="title">
      <span class="item">数据资产</span>
      <el-tooltip class="item" effect="dark" placement="top">
        <template slot="content">
          <p>数据资产：Owner 表 表示您是表的创建者；user 表示具有该表权限的使用者数量；</p>
        </template>
        <i class="el-icon-info"></i>
      </el-tooltip>
    </div>

    <el-empty v-if="!list.length && !loading" description="无数据资产数据"></el-empty>
    <div v-else id="data-property-list" v-loading="loading" class="list">
      <div v-for="(item, index) in list" :key="index" class="item_box">
        <div class="sub-title">{{ item.name }}</div>
        <div class="box_item">
          <template v-for="(subItem, subIndex) in item.value">
            <div :key="`dp_${index}_${subIndex}`" class="item">
              <span>{{ `${subItem.name}: ${subItem.value}` }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { asset } from '@/api/dashboard';
import { domResizeListen } from '@/utils/';
export default {
  name: 'DataProperty',
  data() {
    return {
      loading: false,
      iW: [],
      list: []
    };
  },
  watch: {
    list() {
      this.$nextTick(_ => {
        this.getDataPropertyWidth();
      });
    }
  },
  created() {
    this.asset();
  },
  mounted() {
    domResizeListen(this, this.getDataPropertyWidth, 'data-property-list');
  },
  methods: {
    getDataPropertyWidth() {
      const dataList = this.list.map(e => e.value.map(ee => ee.proportion)).flat();
      const box = document.getElementById('data-property-list');
      if (box) {
        const list = box.querySelectorAll('.item');
        Array.from(list).forEach((e, i) => {
          const w = e.clientWidth;
          const span = e.getElementsByTagName('span')[0];
          const iW = this.iW.length < dataList.length ? span.clientWidth : this.iW[i];
          const n = w * (parseInt(dataList[i]) / 100);
          if (this.iW.length < dataList.length) this.iW.push(iW);
          if (n - iW < 10) {
            span.style.width = iW + 10 + 'px';
          } else {
            span.style.width = n + 'px';
          }
        });
      }
    },
    asset() {
      this.loading = true;
      asset()
        .then(res => {
          const data = res.data;
          this.list = data;
          window.sessionStorage.setItem('dataPropertyList', JSON.stringify(this.list.map(e => e.value.map(ee => ee.proportion)).flat()));
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
@import './title.scss';
.syn-module {
  margin-top: 20px;
  // min-height: 361px;
}

::v-deep .el-icon-info {
  color: $c-primary;
}

.list {
  // display: flex;
  // min-height: 280px;
  .sub-title {
    margin-top: 10px;
    &::before {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 5px;
      content: '';
      background: #64d3ee;
    }
  }
  .item_box {
    width: 100%;
    margin: 0 10px;
    .box_item {
      // display: flex;
    }
  }
  .item {
    flex: 1;
    margin: 0 10px;
    position: relative;
    height: 35px;
    line-height: 35px;
    padding: 3px;
    border: 1px solid #64d3ee;
    border-radius: 8px;
    margin-top: 10px;
    background: linear-gradient(to right, #64d3ee 0%, #c2e9fb 100%);

    span {
      display: flex;
      align-items: center;
      text-indent: 20px;
      position: absolute;
      top: 3px;
      left: 5px;
      bottom: 3px;
      border-radius: 8px;
      white-space: nowrap;
      background: linear-gradient(to right, #c2e9fb 0%, #fff 100%);
    }
  }
}
</style>
