<template>
  <el-card class="box-card-container">
    <div class="box-content">
      <LeftTree></LeftTree>
      <div class="box-r">
        <!-- 客户账单 -->
        <BillBox :bill-type="1"></BillBox>
        <!-- DC 账单 -->
        <BillBox v-if="!isCloud || userInfo.isSupperAdmin" :bill-type="2"></BillBox>
      </div>
    </div>
  </el-card>
</template>

<script>
import LeftTree from '../components/leftTree';
import BillBox from './components/billBox';
import { mapGetters } from 'vuex';

export default {
  name: 'CostBill',
  components: {
    LeftTree,
    BillBox
  },
  data() {
    return {
      loading: false,
      params: {}
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud'])
  },
  methods: {
    handleChange() {}
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  ::v-deep .el-card__header {
    padding: 10px 20px;
  }
  ::v-deep .el-card__body {
    padding: 0;
  }

  .box-content {
    display: flex;
  }

  .box-r {
    display: flex;
    flex: 1;
    padding: 10px;
  }
}
</style>
