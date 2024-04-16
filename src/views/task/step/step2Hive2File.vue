<template>
  <el-card class="box-card-container">
    <Step2Hive2File ref="step2Ref" :data="data" :is-show-publish="true" @cancel="cancel" @save="save"></Step2Hive2File>
  </el-card>
</template>
<script>
import Step2Hive2File from '@/components/TaskTemplate/Step2Hive2File';
import { getTaskInfo, addAndStart, updateAndStart } from '@/api/task';

export default {
  components: {
    Step2Hive2File
  },
  data() {
    return {
      queryId: this.$route.query.id,
      copyId: this.$route.query.copyId,
      version: this.$route.query.version,
      data: {}
    };
  },
  created() {
    if (this.queryId || this.copyId) {
      this.getInfo();
    }
  },
  methods: {
    getInfo() {
      const params = {
        id: this.queryId || this.copyId
      };
      if (this.version) {
        params.version = this.version;
      }
      getTaskInfo(params).then(res => {
        const data = res.data;
        this.data = data;
      });
    },
    cancel() {
      this.$router.go(-1);
    },
    save(params, text) {
      let actionUrl;
      this.$refs.step2Ref.btnLoading = true;
      if (this.queryId) {
        // 修改
        params.id = this.queryId;
        // if (text === 'start') {
        actionUrl = updateAndStart(params);
        // } else {
        //   actionUrl = updateTask(params);
        // }
      } else {
        // 新增
        // if (text === 'start') {
        actionUrl = addAndStart(params);
        // } else {
        //   actionUrl = addTask(params);
        // }
      }
      actionUrl
        .then(data => {
          this.$refs.step2Ref.btnLoading = false;
          this.$router.push('/task/list');
        })
        .catch(() => {
          this.$refs.step2Ref.btnLoading = false;
        });
    }
  }
};
</script>
<style lang="scss" scoped></style>
