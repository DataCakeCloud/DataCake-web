<template>
  <el-dialog title="保存校验" class="task-save" :visible.sync="visible" width="40%" :append-to-body="true" :close-on-click-modal="false" :close-on-press-escape="false" :before-close="close">
    <el-timeline>
      <el-timeline-item v-for="(item, index) in validList" :key="index.validType" :type="statusType(item.state.status)" size="large" :hide-timestamp="true" class="valid-item">
        <div class="valid-item-title">
          {{ `校验Step${item.step}: ${item.description}` }}
          <el-tooltip v-if="['warn', 'forbid'].includes(item.state.status)" effect="dark" :content="item.state.isUnfold ? '收起' : '展开'" placement="top">
            <i :class="[item.state.isUnfold ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" style="cursor: pointer; color: #409eff" @click="item.state.isUnfold = !item.state.isUnfold"></i>
          </el-tooltip>
          <span style="float: right">
            <el-tooltip v-if="item.state.status === 'pass'" effect="dark" content="通过" placement="top">
              <i class="el-icon-success" style="color: #67c23a"></i>
            </el-tooltip>
            <el-tooltip v-else-if="item.state.status === 'forbid'" effect="dark" content="提醒" placement="top">
              <i class="el-icon-error" style="color: #f56c6c"></i>
            </el-tooltip>
            <el-tooltip v-else-if="item.state.status === 'warn'" effect="dark" content="提醒" placement="top">
              <i class="el-icon-warning" style="color: #e6a23c"></i>
            </el-tooltip>
            <el-tooltip v-else-if="item.state.status === 'checking'" effect="dark" content="校验中" placement="top">
              <i class="el-icon-loading" style="color: #409eff"></i>
            </el-tooltip>
            <el-popover v-if="item.state.status === 'warn'" :disabled="['HIVE_READ_PRI', 'HIVE_WRITE_PRI', 'HIVE_CREATE_PRI'].includes(item.validType)" placement="top" trigger="hover" width="310">
              <div>
                <div style="margin-bottom: 10px; font-size: 14px"><i class="el-icon-warning" style="color: #e6a23c; margin-right: 4px"></i>提醒信息</div>
                <!-- <div v-if="['HIVE_READ_PRI', 'HIVE_WRITE_PRI', 'HIVE_CREATE_PRI'].includes(item.validType)" style="font-size: 13px">
                  申请hive表权限请通过此链接-<a :href="getUrl(item)" target="_blank">{{ getUrl(item) }}</a>
                </div> -->
                <div style="font-size: 13px">请联系当前租户的管理员（xuebotao）去申请</div>
              </div>
              <el-link slot="reference" type="primary" target="_blank" :href="['HIVE_READ_PRI', 'HIVE_WRITE_PRI', 'HIVE_CREATE_PRI'].includes(item.validType) ? getUrl(item) : null" style="width: 36px; font-size: 12px; transform: scale(0.9)">去申请</el-link>
            </el-popover>
            <span v-else style="display: inline-block; width: 36px"></span>
          </span>
        </div>
        <div v-show="item.state.isUnfold" class="valid-item-result">
          <div v-if="item.state.message" :style="{ color: item.state.status === 'warn' ? '#E6A23C' : '#F56C6C', paddingLeft: '10px', fontSize: '12px' }">{{ item.state.message }}</div>
          <template v-for="result in item.state.itemList">
            <div v-if="['warn', 'forbid'].includes(result.itemStatus)" :key="result.itemName" :style="{ color: result.itemStatus === 'warn' ? '#E6A23C' : '#F56C6C', paddingLeft: '10px', fontSize: '12px' }">{{ result.itemName }}：不通过{{ result.errorMessage ? '，' + result.errorMessage : '' }}</div>
          </template>
        </div>
      </el-timeline-item>
    </el-timeline>
    <search-item v-if="data" width="80px" label="版本描述：" class="save-commit">
      <el-input v-model.trim="data.commit" class="save-inpt" type="textarea" placeholder="请输入版本描述" clearable></el-input>
    </search-item>
    <span slot="footer" class="dialog-footer">
      <el-button v-if="statusText === 'pass' || statusText === 'checking'" @click="close">取消</el-button>
      <el-button v-else @click="cancel">去修改</el-button>
      <el-tooltip v-if="statusText === 'warn'" effect="dark" content="请在'上线'前确保上述警告项已被处理" placement="top">
        <el-button type="primary" @click="save">保存</el-button>
      </el-tooltip>
      <el-button v-else type="primary" :disabled="statusText !== 'pass'" @click="save">保存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getValidList, validator } from '@/api/validParams';
import { addAndStart, updateAndStart } from '@/api/task'; // addTask, updateTask,
import { addFileApi } from '@/api/useLazyTree';
import SearchItem from '@/components/SearchItem';
export default {
  components: { SearchItem },
  props: {
    code: {
      // 模板类型
      type: String,
      required: true
    },
    params: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      queryId: this.$route.query.id,
      visible: false,
      data: null,
      validList: [] // { validType: '校验项类型', description: '标题', state: { status: pass|warn|forbid|'', message}}
    };
  },
  computed: {
    statusText() {
      let status = 'pass';
      for (let i = 0; i < this.validList.length; i++) {
        const item = this.validList[i];
        if (item.state.status === 'checking') {
          status = 'checking';
          break;
        } else if (item.state.status === 'forbid') {
          status = 'forbid';
          break;
        } else if (item.state.status === 'warn') {
          status = 'warn';
        }
      }
      return status;
    }
  },
  methods: {
    getUrl(item) {
      const tablename = item.state.message.split(':')[1];
      let url = `${this.$locationOrigin}/meta/list`;
      if (tablename) {
        url = url + `?tableName=${tablename}`;
      }
      return url;
    },
    async initValidList() {
      if (this.validList.length <= 0) {
        const res = await getValidList(this.code);
        res.data &&
          res.data.forEach(item => {
            item.state = {
              status: '',
              step: item.step,
              message: '',
              isUnfold: false, // 是否展开
              itemList: [] // { itemName: '', itemStatus: pass|warn|forbid, successMessage: '', errorMessage: ''}
            };
          });
        this.validList = res.data;
      }
    },
    async show(data) {
      this.data = data;
      if (['Metis2Hive', 'StreamingJAR', 'StreamingSQL', 'MergeSmallFiles', 'Hive2File', 'TrainingModel'].includes(this.code) || (this.code === 'Mysql2Hive' && this.data.runtimeConfig.syncType === 2)) {
        this.save();
        return;
      }
      await this.initValidList();
      this.visible = true;
      this.validRun();
    },
    validRun() {
      for (let i = 0; i < this.validList.length; i++) {
        const item = this.validList[i];
        item.state.status = 'checking'; // 正在校验中
        const task = JSON.parse(JSON.stringify(this.data));
        if (task.id && String(task.id).includes('addTask')) {
          delete task.id;
        }
        validator(this.code, { validType: item.validType, task: task })
          .then(res => {
            const data = res.data;
            item.state = { ...item.state, ...data };
            if (['warn', 'forbid'].includes(data.status)) {
              item.state.isUnfold = true;
            }
          })
          .catch(error => {
            console.log('校验出错:', error);
            item.state.status = 'forbid';
            item.state.step = item.step;
            item.state.isUnfold = true;
            item.state.message = error.message;
          });
      }
    },
    statusType(status) {
      let type = '';
      switch (status) {
        case 'pass':
          type = 'success';
          break;
        case 'warn':
          type = 'warning';
          break;
        case 'forbid':
          type = 'danger';
          break;
        case 'checking':
          type = 'primary';
          break;
      }
      return type;
    },
    save() {
      this.$emit('save', this.data);
      this.visible = false;
    },
    // save() {
    //   if (this.$route.path.indexOf('workflow') !== -1) {
    //     // 工作流emit出去保存
    //     this.$emit('save', this.data);
    //     this.visible = false;
    //   } else {
    //     // 任务在第四步统一保存
    //     this.saveApi(this.data);
    //   }
    // },
    // saveApi(params, text) {
    //   let actionUrl;
    //   // this.$refs.step2Ref.btnLoading = true;
    //   if (this.queryId) {
    //     // 修改
    //     params.id = this.queryId;
    //     actionUrl = updateAndStart(params);
    //   } else {
    //     // 新增
    //     actionUrl = addAndStart(params);
    //   }
    //   actionUrl
    //     .then(async res => {
    //       this.visible = false;
    //       // this.$refs.step2Ref.btnLoading = false;
    //       // if (this.$route.query.folderId) {
    //       //   await addFileApi({ module: 'TASK', name: this.data.name, isFolder: false, entityId: res.data.id, parentId: this.$route.query.folderId }).then(res => {
    //       //     if (res.code === 0) {
    //       //       this.$message({
    //       //         type: 'success',
    //       //         message: '添加成功'
    //       //       });
    //       //     }
    //       //   });
    //       // }
    //       this.$router.push('/task/list');
    //     })
    //     .catch(() => {
    //       // this.$refs.step2Ref.btnLoading = false;
    //     });
    // },
    cancel() {
      const firstForbid = this.validList.find(item => {
        return item.state.status === 'forbid';
      });
      const step = firstForbid && firstForbid.state.step ? firstForbid.state.step : 2;
      this.data = null;
      this.validList.forEach(item => {
        item.state = { status: '', step: item.step, message: '', isUnfold: false, itemList: [] };
      });
      this.visible = false;
      this.$parent.currentStep = step - 1;
    },
    close() {
      this.data = null;
      this.validList.forEach(item => {
        item.state = { status: '', step: item.step, message: '', isUnfold: false, itemList: [] };
      });
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.valid-item {
  &-result {
    margin-top: 10px;
  }
}
.save-commit {
  .save-inpt {
    width: 80%;
  }
}
</style>
<style lang="scss">
.task-save {
  .search-item .label {
    color: #2c3b5e;
  }
}
</style>
