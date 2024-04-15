<template>
  <el-card class="box-card-container">
    {{ title }}
    <el-divider></el-divider>
    <el-form ref="form" :model="params" label-width="120px" :rules="rules" inline-message>
      <el-form-item :label="$t('common.name')" prop="name">
        <el-input v-model="params.name" class="w400" placeholder="名字只能包含a-z,A-Z,0-9或_或-"></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.description')" prop="description">
        <el-input v-model="params.description" type="textarea" class="w400" placeholder="请输入描述"></el-input>
      </el-form-item>
      <el-form-item label="集群类型" prop="typeCode">
        <el-radio-group v-model="params.typeCode">
          <el-radio label="K8S">K8S</el-radio>
          <!-- <el-radio label="YARN">YARN</el-radio> -->
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('cluster.address')" prop="address">
        <el-input v-model="params.address" class="w400" placeholder="请输入K8S集群名称"></el-input>
      </el-form-item>
      <el-form-item label="region" prop="region">
        <el-input v-model="params.region" class="w400" placeholder="请输入region"></el-input>
      </el-form-item>
      <el-collapse class="collapse">
        <el-collapse-item title="高级设置" name="1">
          <el-form-item label="State Path" prop="statePath">
            <el-input v-model="params.statePath" class="w400" placeholder="请输入State Path"></el-input>
            <el-tooltip effect="dark" placement="top">
              <div slot="content">Savepoint/Checkpoint状态存储公共路径<br />如：s3a://bucketName/path/</div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="ZK Quorum" prop="zookeeperQuorum">
            <el-input v-model="params.zookeeperQuorum" class="w400" placeholder="请输入ZK Quorum"></el-input>
            <el-tooltip effect="dark" placement="top">
              <div slot="content">zookeeper.quorum地址<br />如：test.mw-1.cbs.sg2.zk:2181,test.mw-2.cbs.sg2.zk:2181</div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="logEsSource">
            <el-input v-model="params.logEsSource" class="w400" placeholder="请输入logEsSource"></el-input>
          </el-form-item>
          <el-form-item label="containerImage">
            <el-input v-model="params.containerImage" class="w400" placeholder="请输入containerImage"></el-input>
          </el-form-item>
          <el-form-item label="env">
            <el-input v-model="params.env" class="w400" placeholder="请输入env"></el-input>
          </el-form-item>
          <el-form-item label="namespace">
            <el-input v-model="params.nameSpace" class="w400" placeholder="请输入namespace"></el-input>
          </el-form-item>
          <el-form-item label="node_selector">
            <el-input v-model="params.nodeSelector" class="w400" placeholder="请输入node_selector"></el-input>
          </el-form-item>
          <el-form-item label="tolerations">
            <el-input v-model="params.tolerations" class="w400" placeholder="请输入tolerations"></el-input>
          </el-form-item>
          <el-form-item label="version">
            <el-input v-model="params.version" class="w400" placeholder="请输入version"></el-input>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
      <div style="padding-left: 20%; margin: 50px 0 40px">
        <el-button type="primary" @click="submit">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script>
import { addCluster, getClusterDetail, updateCluster } from '@/api/cluster.js';
import { copyToNeed } from '@/utils/index.js';

var validatePass = (rule, value, callback) => {
  const reg = /^[\w-]+$/;
  if (!reg.test(value)) {
    callback(new Error('名字只能包含a-z,A-Z,0-9,_或-'));
  } else {
    callback();
  }
};
// var validateUrl = (rule, value, callback) => {
//   const reg = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
//   if (!reg.test(value)) {
//     callback(new Error('请输入正确的URL地址'));
//   } else {
//     callback();
//   }
// };
export default {
  data() {
    return {
      id: '',
      params: {
        name: '',
        description: '',
        typeCode: 'K8S',
        address: '',
        region: '',
        statePath: '',
        zookeeperQuorum: '',
        logEsSource: '',
        containerImage: '',
        env: '',
        nameSpace: '',
        nodeSelector: '',
        tolerations: '',
        version: ''
      }
    };
  },
  computed: {
    title() {
      return this.id ? '编辑集群' : '新建集群';
    },
    rules() {
      const rules = {
        name: [
          { required: true, message: this.$t('cluster.nameRule'), trigger: ['blur', 'change'] },
          { validator: validatePass, trigger: ['blur', 'change'] }
        ],
        clusterType: [{ required: true, message: this.$t('cluster.typeRule'), trigger: ['blur', 'change'] }],
        typeCode: [{ required: true, message: '请选择集群类型', trigger: ['blur', 'change'] }],
        region: [{ required: true, message: '请输入region', trigger: ['blur', 'change'] }],
        address: [{ required: true, message: this.$t('cluster.addressRule'), trigger: ['blur', 'change'] }]
      };
      // if (this.params.clusterType === 'SESSION') {
      //   rules.address.push({ validator: validateUrl, trigger: ['blur'] });
      // }
      return rules;
    }
  },
  created() {
    this.id = this.$route.query.id;
    if (this.id) {
      this.getClusterInfo(this.id);
    }
  },
  methods: {
    getClusterInfo(id) {
      getClusterDetail(id).then(res => {
        const data = res.data;
        this.params = copyToNeed(data, Object.keys(this.params));
      });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let ajaxApi = addCluster;
          const params = { ...this.params };
          if (this.id) {
            ajaxApi = updateCluster;
            params.id = this.id;
          }
          ajaxApi(params).then(res => {
            this.$router.push('/config/cluster');
          });
        } else {
          this.$message({
            type: 'info',
            message: '请完善集群信息！'
          });
        }
      });
    },
    cancel() {
      this.$router.push('/config/cluster');
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
.box-card-container {
  padding: 20px;
}
.w400 {
  width: 400px;
}
.collapse {
  ::v-deep .el-collapse-item__header {
    display: block;
  }
}
</style>
