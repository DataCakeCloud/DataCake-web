<template>
  <el-card class="artifact-list box-card-container">
    <div class="wx-list">
      <div class="wx-box">
        <div class="search-item-wrap">
          <search-item width="160px" :span="8" label="告警机器人名称">
            <el-input v-model="params.name" size="small" clearable @keyup.enter.native="search"></el-input>
          </search-item>
          <search-item width="135px" label="创建时间" :span="8" class="custom-search">
            <el-date-picker v-model="params.timeRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" style="width: 350px" @change="search"> </el-date-picker>
          </search-item>
          <el-button type="primary" class="search-btn" size="small" icon="el-icon-search" @click="search"></el-button>
          <el-button type="primary" class="create" @click="openTokenForm">添加token</el-button>
        </div>
        <div class="table-wrap">
          <table-page v-loading="loading" :table-data="tableList" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" @click="openTokenForm(scope.row)">编辑</el-button>
                <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" title="确定删除？" @confirm="deleteToken(scope.row)">
                  <el-button slot="reference" class="global-color-cb" type="text">删除</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </table-page>
        </div>
      </div>
    </div>
    <el-dialog :title="editRow.id ? '编辑token' : '添加token'" :visible.sync="dialogVisible" :close-on-click-modal="false" width="800px">
      <div>
        <el-form ref="form" :model="tokenForm" :rules="formRules" label-width="135px">
          <el-form-item label="告警机器人名称：" prop="name">
            <el-input v-model="tokenForm.name" class="search-input" size="small" clearable></el-input>
          </el-form-item>
          <el-form-item label="微信群token：" prop="token">
            <el-input v-model="tokenForm.token" class="search-input" type="textarea" size="small" clearable></el-input>
            <a class="token-tip" target="_blank" href="https://alidocs.dingtalk.com/i/p/VlPDmr3gPOYGxdRLy0mVP9MANW1Bjz89">怎么获取token?</a>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import SearchItem from '@/components/SearchItem';
import TablePage from '@/components/TablePage';
import { parseTime } from '@/utils/';
import { addToken, updateToken, deleteToken, getTokenList } from '@/api/system.js';
export default {
  components: {
    SearchItem,
    TablePage
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      editRow: {},
      tokenForm: {
        name: '',
        token: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入名字', trigger: ['blur', 'change'] }],
        token: [{ required: true, message: '请输入token', trigger: ['blur', 'change'] }]
      },
      params: {
        pageNum: 1,
        pageSize: 20,
        name: '',
        timeRange: []
      },
      tableList: [],
      reqTableList: [],
      columnData: [
        {
          prop: 'name',
          label: '告警机器人名称',
          tooltip: true,
          width: '150px'
        },
        {
          prop: 'token',
          label: '群token',
          width: '200px',
          tooltip: true
        },
        {
          prop: 'userGroupName',
          label: '归属用户组'
        },
        {
          prop: 'createBy',
          label: '创建人'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '155px',
          format: data => {
            return parseTime(data.createTime, '{y}-{m}-{d} {h}:{i}:{s}');
          }
        },
        {
          prop: 'updateBy',
          label: '更新人'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '155px',
          format: data => {
            return parseTime(data.createTime, '{y}-{m}-{d} {h}:{i}:{s}');
          }
        }
      ],
      total: 0
    };
  },
  created() {
    // 校验是否勾选微信配置
    // let tokenFlag;
    // const systemAlertList = this.$store.getters['user/systemConf'].config && JSON.parse(this.$store.getters['user/systemConf'].config)?.channel_info;
    // if (systemAlertList && systemAlertList.length) {
    //   tokenFlag = systemAlertList.some(item => {
    //     if (Object.keys(item)[0] === 'enterprise_wechat') {
    //       return true;
    //     }
    //   });
    // }
    // if (!tokenFlag) {
    //   this.$router.push('/404');
    // }
    this.search();
  },
  methods: {
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getCurrentList();
    },
    getCurrentList() {
      const tableList = this.reqTableList;
      this.total = tableList.length;
      this.tableList = tableList.slice((this.params.pageNum - 1) * this.params.pageSize, this.params.pageNum * this.params.pageSize);
    },

    search() {
      getTokenList({ name: this.params.name, startTime: this.params.timeRange ? this.params.timeRange[0] : '', endTime: this.params.timeRange ? this.params.timeRange[1] : '' }).then(res => {
        this.reqTableList = res.data;
        this.getCurrentList();
      });
    },
    openTokenForm(row) {
      this.editRow = row;
      this.tokenForm.name = row.name;
      this.tokenForm.token = row.token;
      this.dialogVisible = true;
    },
    save() {
      this.$refs.form.validate(async formValid => {
        if (formValid) {
          if (this.editRow.id) {
            updateToken({ ...this.tokenForm, id: this.editRow.id }).then(res => {
              if (res.code === 0) {
                this.$message({
                  type: 'success',
                  message: '修改成功'
                });
                this.dialogVisible = false;
                this.search();
              }
            });
          } else {
            await addToken(this.tokenForm).then(res => {
              if (res.code === 0) {
                this.$message({
                  type: 'success',
                  message: '添加成功'
                });
                this.dialogVisible = false;
                this.search();
              }
            });
          }
        }
      });
    },
    deleteToken(row) {
      deleteToken({ id: row.id }).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          this.search();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.artifact-list {
  display: flex;
  flex-direction: column;
  .search-item-wrap {
    padding: 15px;
    position: relative;
    .create {
      position: absolute;
      right: 15px;
      top: 20px;
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
}
.wx-list {
  display: flex;
  .border-card {
    height: 100%;
  }
  .wx-box {
    width: 100%;
  }
  .search-btn {
    margin-left: 10px;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.custom-search {
  margin-left: 10px;
}
</style>
