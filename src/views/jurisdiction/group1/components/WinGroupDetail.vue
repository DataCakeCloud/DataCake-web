<template>
  <div>
    <el-dialog title="用户组详情" :visible.sync="dialogVisible" width="600px" class="custom-dialog">
      <el-card class="box-card">
        <el-descriptions :column="2">
          <el-descriptions-item label="用户组名称">{{ groupDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="用户组ID">{{ groupDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="用户组描述">{{ groupDetail.description }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-tabs>
        <el-tab-pane>
          <span slot="label"><i class="el-icon-s-custom"></i> 用户管理</span>
          <el-button type="primary" class="mb10" size="mini" @click="addUserVisible = true">添加用户</el-button>
          <el-table v-loading="tableLoading" :data="groupDetail.users" border stripe class="custom-table" height="250">
            <el-table-column prop="name" label="用户名称"></el-table-column>
            <el-table-column prop="createTime" label="添加用户组时间" width="180">
              <template slot-scope="scope">
                {{ $utils.parseTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-popconfirm title="确认移除该用户吗？" @confirm="removeUserBtn(scope.row.id)">
                  <el-button slot="reference" type="text" size="mini">从该用户组移除</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog :title="`用户组名称:${groupDetail.name}`" :visible.sync="addUserVisible" width="560px" @closed="addUserClosed">
      <div v-for="(item, index) in addUserIds" :key="index" class="user-group">
        <span class="labelEle">用户名称</span>
        <el-select
          v-model="item.id"
          filterable
          placeholder="请输入用户名称"
          :remote-method="
            query => {
              remoteMethod(query, index);
            }
          "
          remote
          reserve-keyword
          :loading="loadingSelect"
        >
          <el-option v-for="item1 in options[index]" :key="item1.value" :label="item1.label" :value="item1.value"> </el-option>
        </el-select>
        <el-radio-group v-model="item.isLeader">
          <el-radio :label="1">组员</el-radio>
          <el-radio :label="0">Leader</el-radio>
        </el-radio-group>
        <i v-if="index === 0" class="el-icon-plus iconEle" @click="addItem"></i>
        <i v-if="index !== 0" class="el-icon-minus iconEle" @click="deleteItem(index)"></i>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addUserLoading" @click="addUserBtn">增 加</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getGroupInfo, removeUser, userList, addGroupUser } from '@/api/jurisdiction';

export default {
  name: 'WinGroupDetail',
  data() {
    return {
      dialogVisible: false,
      tenantId: JSON.parse(sessionStorage.getItem('userInfo')).tenantId,
      groupDetail: {},
      tableLoading: false,
      addUserVisible: false,
      addUserIds: [{ id: '', isLeader: 1 }],
      options: [[]],
      loadingSelect: false,
      addUserLoading: false
    };
  },
  methods: {
    showWin(row) {
      this.dialogVisible = true;
      this.groupId = row.id;
      this.getInfo();
    },
    getInfo() {
      this.tableLoading = true;
      getGroupInfo({
        id: this.groupId
      }).then(res => {
        const data = res.data;
        this.groupDetail = data;
        this.tableLoading = false;
      });
    },
    removeUserBtn(id) {
      removeUser({
        id: this.groupId,
        userId: id
      }).then(data => {
        this.$message({
          type: 'success',
          message: '删除成功'
        });
        this.$emit('updateList', {});
        this.getInfo();
      });
    },
    deleteItem(i) {
      this.addUserIds.splice(i, 1);
    },
    addItem() {
      this.addUserIds.push({ id: '', isLeader: 1 });
      this.options.push([]);
    },
    addUserBtn() {
      if (this.addUserIds.some(item => item.id === '')) {
        this.$message.warning('用户名称不能为空');
        return;
      }
      this.addUserLoading = true;
      addGroupUser({
        id: this.groupId,
        userIds: this.addUserIds.map(it => it.id).join(','),
        isLeader: this.addUserIds.map(it => it.isLeader).join(',')
      })
        .then(data => {
          this.$message.success('添加成功');
          this.getInfo();
          this.$emit('updateList', {});
          this.addUserVisible = false;
        })
        .finally(() => {
          this.addUserLoading = false;
        });
    },
    addUserClosed() {
      this.addUserIds = [{ id: '', isLeader: 1 }];
      this.options = [[]];
    },
    async remoteMethod(query, index) {
      if (query.trim() !== '') {
        this.loadingSelect = true;
        const data = await (await userList({ name: query, tenantId: this.tenantId })).data;
        this.loadingSelect = false;
        this.options[index] = data.length > 0 ? data.map(item => ({ label: item.name, value: item.id })) : [];
      } else {
        this.options[index] = [];
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.user-group {
  padding: 5px 20px;

  ::v-deep .el-select {
    margin-right: 30px;
  }
}
.iconEle {
  margin-left: 10px;
}
</style>
