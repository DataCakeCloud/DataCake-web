<template>
  <div class="transfer">
    <div class="leftTransfer">
      <div class="leftTransfer_title">
        <el-checkbox v-model="left.checkAll" :indeterminate="left.isIndeterminate" @change="leftHandleCheckAllChange">{{ titles[0] }}</el-checkbox>
        <span>{{ left.transferDataChecked.length }}/{{ left.transferData.length }}</span>
      </div>
      <el-input v-model="left.inputValue" class="transfer_input" placeholder="请输入内容" prefix-icon="el-icon-search" @input="transferInputLeft"> </el-input>
      <div style="margin: 5px 0"></div>
      <el-checkbox-group v-model="left.transferDataChecked" class="transfer_group" @change="leftHandleCheckedCitiesChange">
        <el-checkbox v-for="item in left.transferData" :key="item[defaultProps.id]" :label="item">{{ item[defaultProps.label] }}</el-checkbox>
      </el-checkbox-group>
      <el-pagination small class="pagination" layout="prev, pager, next" :page-size="100" :total="total" @current-change="handleCurrentChange"> </el-pagination>
    </div>
    <div class="transferButton">
      <el-button type="primary" @click="push">&gt;</el-button>
      <el-button type="primary" @click="del">&lt;</el-button>
    </div>
    <div class="rightTransfer">
      <div class="rightTransfer_title">
        <el-checkbox v-model="right.checkAll" :indeterminate="right.isIndeterminate" @change="rightHandleCheckAllChange">{{ titles[1] }}</el-checkbox>
        <span>{{ right.transferDataChecked.length }}/{{ right.transferData.length }}</span>
      </div>
      <el-input v-model="right.inputValue" class="transfer_input" placeholder="请输入内容" prefix-icon="el-icon-search" @input="transferInputRight"> </el-input>
      <div style="margin: 5px 0"></div>
      <el-checkbox-group v-model="right.transferDataChecked" class="transfer_group transfer_group_right" @change="rightHandleCheckedCitiesChange">
        <el-checkbox v-for="item in right.transferData" :key="item[defaultProps.id]" :label="item">{{ item[defaultProps.label] }}</el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import { dataShowNoPrivileges } from '@/api/dataRole';
export default {
  name: 'TransferPage',
  props: {
    titles: {
      type: Array,
      default: () => ['待选列表', '已选列表']
    },
    objectType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      originData: {},
      left: {
        inputValue: '',
        isIndeterminate: false, // 半选按钮
        checkAll: false, // 是否点击全选
        transferData: [], // 穿梭框左侧全部数据
        transferDataAll: [], // 穿梭框左侧全部数据记录
        transferDataChecked: [] // 穿梭框左侧选中数据
      },
      right: {
        inputValue: '',
        isIndeterminate: false, // 半选按钮
        checkAll: false, // 是否点击全选
        transferData: [], // 穿梭框右侧全部数据
        transferDataAll: [], // 穿梭框左侧全部数据记录
        transferDataChecked: [] // 穿梭框右侧选中数据
      },
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 100
      },
      defaultProps: {
        label: 'label',
        id: 'id'
      },
      timer: null
    };
  },
  watch: {
    objectType() {
      this.right.inputValue = '';
      this.right.isIndeterminate = false;
      this.right.checkAll = false;
      this.right.transferData = [];
      this.right.transferDataAll = [];
      this.right.transferDataChecked = [];
      this.left.inputValue = '';
      this.left.isIndeterminate = false;
      this.left.checkAll = false;
      this.left.transferData = [];
      this.left.transferDataAll = [];
      this.left.transferDataChecked = [];
      this.initTransferData();
    }
  },
  created() {
    this.initTransferData();
  },
  destroyed() {
    clearTimeout(this.timer);
  },
  methods: {
    // 初始化数据
    initTransferData() {
      const data = {
        objectType: this.objectType,
        keyword: this.left.inputValue,
        ...this.queryParams
      };
      dataShowNoPrivileges(data).then(res => {
        const data = res.data;
        this.originData = data;
        this.left.transferData = data.objectNames;
        this.left.transferData = this.left.transferData.map((item, index) => {
          // item.pageNum = this.queryParams.pageNum;
          return {
            label: item,
            id: item,
            pageNum: this.queryParams.pageNum
          };
        });
        this.total = data.total;
        this.left.transferDataAll = this.left.transferData;
        // 获得一个右边的数据，只有纯id
        const checkedIdArr = this.right.transferData.map(item => {
          return item[this.defaultProps.id];
        });
        // 左侧数据删除
        this.left.transferData = this.left.transferData.filter(item => {
          if (!checkedIdArr.includes(item[this.defaultProps.id])) {
            return item;
          }
        });
      });
    },
    // 左侧是否点击全选
    leftHandleCheckAllChange(val) {
      this.left.transferDataChecked = val ? this.left.transferData : [];
      this.left.isIndeterminate = false;
    },
    // 左侧勾选数据
    leftHandleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.left.checkAll = checkedCount === this.left.transferData.length;
      this.left.isIndeterminate = checkedCount > 0 && checkedCount < this.left.transferData.length;
    },
    // 左侧是否点击全选
    rightHandleCheckAllChange(val) {
      this.right.transferDataChecked = val ? this.right.transferData : [];
      this.right.isIndeterminate = false;
    },
    // 左侧勾选数据
    rightHandleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.right.checkAll = checkedCount === this.right.transferData.length;
      this.right.isIndeterminate = checkedCount > 0 && checkedCount < this.right.transferData.length;
    },
    // 穿梭框选中数据
    push() {
      // 数据移到右侧
      this.right.transferData = [...this.right.transferData, ...this.left.transferDataChecked].sort((a, b) => {
        return a[this.defaultProps.id] - b[this.defaultProps.id];
      });
      this.right.transferDataAll = this.right.transferData;
      // 获得一个右边的数据，只有纯id
      const checkedIdArr = this.right.transferData.map(item => {
        return item[this.defaultProps.id];
      });
      // 左侧数据删除
      this.left.transferData = this.left.transferData.filter(item => {
        if (!checkedIdArr.includes(item[this.defaultProps.id])) {
          return item;
        }
      });
      this.left.transferDataAll = this.left.transferData;
      // 每次推送完之后，重置选中框
      this.left.transferDataChecked = [];
      this.left.isIndeterminate = false;
      this.left.checkAll = false;
    },
    // 穿梭框删除数据 回显的时候根据pageNum回显到当前
    del() {
      // 过滤当前页选中的数据
      const arr = this.right.transferDataChecked.filter(item => {
        if (this.queryParams.pageNum === item.pageNum) {
          return item;
        }
      });
      // 数据移到左侧
      this.left.transferData = [...this.left.transferData, ...arr].sort((a, b) => {
        return a[this.defaultProps.id] - b[this.defaultProps.id];
      });
      this.left.transferDataAll = this.left.transferData;
      // 获得一个右边的数据，只有纯id
      const checkedIdArr = this.right.transferDataChecked.map(item => {
        return item[this.defaultProps.id];
      });
      // 删除选中的数据
      this.right.transferData = this.right.transferData.filter(item => {
        if (!checkedIdArr.includes(item[this.defaultProps.id])) {
          return item;
        }
      });
      this.right.transferDataAll = this.right.transferData;
      // 每次推送完之后，重置选中框
      this.right.transferDataChecked = [];
      this.right.isIndeterminate = false;
      this.right.checkAll = false;
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.initTransferData();
    },
    transferInputLeft() {
      // if (this.left.inputValue) {
      //   this.left.transferData = this.left.transferData.filter(p => p[this.defaultProps.label].indexOf(this.left.inputValue) !== -1);
      // } else {
      //   this.left.transferData = this.left.transferDataAll;
      // }
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.queryParams.pageNum = 1;
        this.queryParams.pageSize = 100;
        this.initTransferData();
      }, 600);
    },
    transferInputRight() {
      if (this.right.inputValue) {
        this.right.transferData = this.right.transferData.filter(p => p[this.defaultProps.label].indexOf(this.right.inputValue) !== -1);
      } else {
        this.right.transferData = this.right.transferDataAll;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.transfer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  .transferButton {
    .el-button {
      display: block;
      margin: 10px 0;
    }
  }
  .el-checkbox {
    line-height: 30px;
  }
  .transfer_input {
    margin: 10px 15px 0 15px;
    width: 85%;
    .el-input--medium .el-input__inner {
      height: 36px;
      line-height: 36px;
      border-radius: 16px;
    }
  }
  .leftTransfer,
  .rightTransfer {
    height: 425px;
    border: 1px solid #e6ebf5;
    border-radius: 4px;
    overflow: hidden;
    background: #ffffff;
    display: inline-block;
    vertical-align: middle;
    width: 43%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: relative;
    margin: 0 10px;

    .el-checkbox {
      display: block;
    }
    .pagination {
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 1;
      display: flex;
      align-items: center;
    }
    .leftTransfer_title,
    .rightTransfer_title {
      display: flex;
      justify-content: space-between;
      height: 40px;
      line-height: 40px;
      background: #f5f7fa;
      margin: 0;
      padding-left: 15px;
      border-bottom: 1px solid #e6ebf5;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #000000;
      padding-right: 15px;
      align-items: center;
    }
  }
}
.transfer_group {
  padding-left: 15px;
  height: 70%;
  overflow-y: auto;
}
.transfer_group_right {
  height: 79%;
}
</style>
