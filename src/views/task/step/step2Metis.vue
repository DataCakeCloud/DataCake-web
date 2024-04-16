<template>
  <el-card class="box-card-container">
    <Metis2Hive ref="step2Ref" :data="data" :is-show-publish="true" @cancel="cancel" @save="save"></Metis2Hive>
  </el-card>
</template>
<script>
import Metis2Hive from '@/components/TaskTemplate/Metis2Hive';
import { getTaskInfo, addTask, updateTask } from '@/api/task';

export default {
  components: {
    Metis2Hive
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
    save(params) {
      let actionUrl;
      this.$refs.step2Ref.btnLoading = true;
      if (this.queryId) {
        // 修改
        params.id = this.queryId;
        actionUrl = updateTask(params);
      } else {
        actionUrl = addTask(params);
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
