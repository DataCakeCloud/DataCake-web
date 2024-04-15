<template>
  <el-card class="engine-config-list box-card-container">
    <div class="search-condition-wrap">
      <div class="tips"><i class="el-icon-warning-outline"></i>具有Zeus访问权限的用户，系统会默认分配Presto、Spark等相关引擎的权限；对于ClickHouse、Tidb、MySql等相关的引擎，需要管理员通过当前页面进行配置</div>
      <search-condition label="">
        <el-input v-model.trim="params.info" class="search-box" placeholder="请输入用户名、引擎" clearable @keyup.enter.native="search"></el-input>
      </search-condition>
      <el-button type="primary" size="small" @click="search">查询</el-button>
      <el-button type="primary" class="create" @click="addConfig">新建</el-button>
    </div>
    <div class="table-wrap">
      <table-page v-loading="loading" :table-data="tableData" :column-data="columnData" :table-height="'calc(100vh - 230px)'" :total="total" :page-num="params.pageNum" :page-size="params.pageSize" @changePage="changePage">
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">配置</el-button>
            <el-button type="text" size="mini" class="global-color-cb" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </table-page>
    </div>
    <el-dialog title="新增用户" width="450px" :close-on-click-modal="false" :visible.sync="addDialogVisible" @close="closeDialog">
      <el-form ref="form" :model="form" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="name">
          <el-select v-model="form.name" style="width: 250px" filterable placeholder="请选择">
            <el-option v-for="user in users" :key="user" :label="user" :value="user"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="featching" @click="add">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="引擎配置" width="600px" :close-on-click-modal="false" :visible.sync="configDialogVisible">
      <div>
        <div>引擎分类以及名称</div>
        <div class="engine-box">
          <div v-for="(item, type) in engineAuthList" :key="type" class="engine-item">
            <div class="engine-item-title">{{ type }}</div>
            <el-checkbox-group v-model="checkList">
              <template v-for="(engine, index) in item">
                <el-checkbox :key="engine.value" class="engine-item-option" :label="JSON.stringify(engine)">{{ engine.label }}</el-checkbox><br :key="index" />
              </template>
            </el-checkbox-group>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="featching" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
import SearchCondition from '@/components/SearchCondition';
import TablePage from '@/components/TablePage';
import { getAuthList, engineAuthList, engineConfigList, addEngineConfig, updateEngineConfig, deleteConfig } from '@/api/querydata';

export default {
  components: {
    SearchCondition,
    TablePage
  },
  data() {
    return {
      loading: false,
      tableData: [],
      columnData: [
        {
          prop: 'name',
          label: '用户名',
          width: '120'
        },
        {
          prop: 'engine',
          label: '已配置的引擎',
          width: '600',
          format: row => {
            let engines = JSON.parse(row.engine);
            engines = engines.map(item => {
              return item.label;
            });
            return engines.join(',');
          }
        }
      ],
      total: 0,
      params: {
        info: '',
        pageNum: 1,
        pageSize: 10
      },
      engineAuthList: {},
      users: [],
      featching: false,
      addDialogVisible: false,
      configDialogVisible: false,
      form: {
        name: ''
      },
      id: '',
      name: '',
      checkList: [],
      rules: {
        name: [{ required: true, message: '请选择用户!', trigger: 'change' }]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      engineAuthList().then(data => {
        this.engineAuthList = data.data;
      });
      getAuthList().then(data => {
        this.users = data.data;
      });
      this.getList();
    },
    changePage(page) {
      this.params.pageSize = page.pageSize;
      this.params.pageNum = page.pageNum;
      this.getList();
    },
    getList() {
      this.loading = true;
      engineConfigList(this.params).then(data => {
        this.loading = false;
        this.total = data.data.total;
        this.tableData = data.data.list;
      });
    },
    search() {
      this.params.pageNum = 1;
      this.getList();
    },
    addConfig() {
      this.addDialogVisible = true;
    },
    closeDialog() {
      this.$refs.form && this.$refs.form.resetFields();
    },
    add() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.featching = true;
          addEngineConfig({ name: this.form.name, engine: [] })
            .then(res => {
              this.$message.success({
                message: '新增成功'
              });
              this.addDialogVisible = false;
              this.getList();
            })
            .finally(() => {
              this.featching = false;
            });
        }
      });
    },
    edit(row) {
      this.id = row.id;
      this.name = row.name;
      const engines = JSON.parse(row.engine);
      this.checkList = engines.map(item => {
        return JSON.stringify(item);
      });
      this.configDialogVisible = true;
    },
    submit() {
      const engine = this.checkList.map(item => {
        return JSON.parse(item);
      });
      this.featching = true;
      updateEngineConfig({ id: this.id, name: this.name, engine })
        .then(res => {
          this.$message.success({
            message: '配置成功!'
          });
          this.configDialogVisible = false;
          this.getList();
        })
        .finally(() => {
          this.featching = false;
        });
    },
    deleteData(row) {
      this.$confirm(`确定删除 ${row.name} 的引擎配置?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteConfig(row.id).then(data => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.engine-config-list {
  display: flex;
  flex-direction: column;
  .search-condition-wrap {
    padding: 15px;
    .tips {
      padding-left: 10px;
      color: #909399;
    }
    .create {
      float: right;
    }
  }
  .table-wrap {
    flex: 1;
    .btn-wrap {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  .engine-box {
    margin-top: 10px;
    padding: 14px 20px;
    border: 1px solid #e2e9f3;
    .engine-item {
      margin-bottom: 12px;
      &-title {
        margin-bottom: 10px;
      }
      &-option {
        margin-left: 20px;
      }
    }
  }
}
</style>
