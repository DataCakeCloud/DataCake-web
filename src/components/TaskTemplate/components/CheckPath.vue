<template>
  <el-dialog :visible.sync="dialogVisible" width="650px" class="check-path" :close-on-click-modal="false" :append-to-body="true" :modal-append-to-body="false" @close="resetForm">
    <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" label-width="100px">
      <el-tabs v-model="ruleForm.activeName">
        <el-tab-pane v-if="showTab1" label="检查路径" name="first">
          <el-form-item label="是否检查路径:">
            <el-switch v-model="ruleForm.check" @change="changeCheck($event, 'checkCustom')"></el-switch>
          </el-form-item>
          <el-form-item label="路径:">
            {{ ruleForm.location }}
          </el-form-item>
          <el-form-item v-for="(item, index) in partitionKeys" :key="index" :label="'分区' + (index + 1) + ':'">
            {{ item.name }} =
            <el-autocomplete v-model="ruleForm.times[index]" :fetch-suggestions="querySearch" placeholder="请输入时间格式" clearable></el-autocomplete>
          </el-form-item>
          <el-form-item label="检查文件名:">
            <el-input v-model="ruleForm.fileName" placeholder="请输入文件名" clearable style="width: 95%"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="自定义路径" name="second">
          <el-form-item label="是否检查路径:">
            <el-switch v-model="ruleForm.checkCustom" @change="changeCheck($event, 'check')"></el-switch>
          </el-form-item>
          <el-form-item label="路径:">
            <el-input v-model="ruleForm.check_path" placeholder="请输入路径" clearable style="width: 95%"></el-input>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getDataSetColumns } from '@/api/task';

export default {
  name: 'CheckPath',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      ruleForm: {
        activeName: 'first',
        index: 0,
        fileName: '_SUCCESS',
        check: false,
        location: '',
        times: [],
        partitions: [],
        checkCustom: false,
        check_path: ''
      },
      partitionKeys: '',
      timeFormat: [{ value: '%Y%m%d' }, { value: '%Y-%m-%d' }, { value: '%H' }],
      showTab1: true
    };
  },
  methods: {
    getTableDetail(guid) {
      this.loading = true;
      getDataSetColumns({
        guid: guid
      }).then(res => {
        const data = res.data;
        this.ruleForm.location = data.location;
        this.partitionKeys = data.partitionKeys || [];
        // 给时间格式设置初始值
        if (!this.ruleForm.check) {
          this.partitionKeys.forEach(item => {
            this.ruleForm.partitions.push('%Y%m%d');
          });
        }
        this.loading = false;
      });
    },
    showWin({ guid, index, location, partitions, fileName, check_path }) {
      this.dialogVisible = true;
      this.ruleForm.index = index;
      this.ruleForm.fileName = fileName === undefined ? '_SUCCESS' : fileName;
      this.ruleForm.check_path = check_path;
      if (location) {
        this.ruleForm.check = true;
        this.ruleForm.checkCustom = false;
        this.ruleForm.location = location;
        // this.ruleForm.partitions = partitions;
        this.ruleForm.times = partitions.map(item => {
          return item.split('=')[1];
        });
      }
      if (check_path) {
        this.ruleForm.checkCustom = true;
        this.ruleForm.check = false;
        this.ruleForm.activeName = 'second';
      }
      if (guid) {
        this.getTableDetail(guid);
        this.showTab1 = true;
      } else {
        this.showTab1 = false;
        this.ruleForm.activeName = 'second';
      }
    },
    querySearch(queryString, cb) {
      var restaurants = this.timeFormat;
      // var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(restaurants);
    },
    createFilter(queryString) {
      return restaurant => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    changeCheck(value, name) {
      if (value) {
        this.ruleForm[name] = false;
      }
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.ruleForm.check = false;
      this.ruleForm.partitions = [];
      this.ruleForm.times = [];
    },
    save() {
      if (this.partitionKeys) {
        this.ruleForm.partitions = this.partitionKeys.map((item, index) => {
          return `${item.name}=${this.ruleForm.times[index]}`;
        });
      }
      this.$emit('save', this.ruleForm);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.check-path {
  ::v-deep .el-dialog__body {
    padding-top: 0;
  }
}
</style>
