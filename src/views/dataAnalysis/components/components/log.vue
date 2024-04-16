<template>
  <div class="log-box">
    <div class="tool">
      <el-tooltip class="item" effect="dark" :content="`${fold ? '展开' : '折叠'}`" placement="top">
        <i v-if="fold" class="el-icon-arrow-down icon" @click="() => (fold = false)"></i>
        <i v-if="!fold" class="el-icon-arrow-up icon" @click="() => (fold = true)"></i>
      </el-tooltip>
    </div>
    <div :class="['log-content', { 'content-fold': !fold }]">
      <div v-for="(item, i) in logData" :key="i" class="xhr-log">
        {{ item }}
      </div>
      <div v-show="endType" class="end-log">-</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getLogs } from '@/api/querydata';

export default {
  name: 'Log',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    uuid: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      from: 0,
      logData: [],
      maxLength: 10000,
      status: null,
      timer: null,
      timer1: null,
      endType: true,
      fold: true
    };
  },
  computed: {
    ...mapGetters(['region', 'sqlOptions', 'userInfo'])
  },
  created() {
    const sqlOptions = this.sqlOptions && this.sqlOptions[this.region];
    if (sqlOptions) {
      const logData = sqlOptions[this.data.name]?.logData;
      if (logData) {
        this.logData = logData.data || [];
        this.from = logData.from;
        this.status = logData.status;
        if (this.status !== 1) {
          this.initGetLog();
          this.handelEndType();
          if (this.$parent) {
            this.$parent.logType = true;
          }
        } else {
          this.endType = false;
        }
      }
    }
  },
  destroyed() {
    clearInterval(this.timer);
    clearInterval(this.timer1);
  },
  methods: {
    handelExecute() {
      this.logData = [];
      this.from = 0;
      this.status = null;
      this.initGetLog();
      this.handelEndType();
    },
    handelEndType() {
      clearInterval(this.timer1);
      this.timer1 = setInterval(() => {
        this.endType = !this.endType;
      }, 600);
    },
    addLog(str = []) {
      if (this.logData.length >= this.maxLength) {
        for (let i = 0; i < str.length; i++) {
          this.logData.shift();
        }
      }
      this.logData.push(...str);
      const logData = {
        data: this.logData,
        from: this.from,
        status: this.status
      };
      this.$store.commit('SET_SQLOPTIONS', { region: this.region, name: this.data.name, key: 'logData', value: logData });
      // 自动定位到最后一行
      // setTimeout(() => {
      //   const dom = document.querySelector('.log-content .end-log')
      //   if (dom) {
      //     dom.scrollIntoView({ behavior: 'smooth', block: 'end' });
      //   }
      // }, 100)
    },
    initGetLog() {
      clearInterval(this.timer);
      this.getLog();
      this.timer = setInterval(this.getLog, 1000 * 5);
    },
    getLog() {
      if (!this.uuid) return;
      if (this.status === 1) {
        clearInterval(this.timer);
        clearInterval(this.timer1);
        this.endType = false;
        this.from = 0;
        return;
      }
      const params = {
        uuid: this.uuid,
        from: this.from
      };
      getLogs(params).then(res => {
        const data = res.data || {};
        this.from = data.pointer || 0;
        this.status = data.status || 0;
        this.addLog(data.rows);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.log-box {
  position: relative;
  .tool {
    position: absolute;
    right: 5px;
    top: 3px;
    color: #2c3b5e;
    .icon {
      cursor: pointer;
    }
  }
  .log-content {
    background-color: #f2f2f2;
    color: #2c3b5e;
    padding: 10px;
    overflow-y: auto;
    height: 250px;
    &.content-fold {
      height: calc(100vh - 100px);
    }
  }
}
</style>
