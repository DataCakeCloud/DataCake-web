<template>
  <div class="box">
    <div ref="col1" class="col">
      <transition-group name="list">
        <div v-for="item in dataList1" :key="item.id" class="item">
          {{ item.text }}
          <img :src="item.url" />
        </div>
      </transition-group>
    </div>
    <div ref="col2" class="col">
      <transition-group name="list">
        <div v-for="item in dataList2" :key="item.id" class="item">
          {{ item.text }}
          <img :src="item.url" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mainMenuList: [
        {
          id: 1,
          text: '我是1afrawetwetwert',
          url: 'https://img.zcool.cn/community/01162e5d903ad6a8012060bee46bf3.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 2,
          text: '我是2',
          url: 'https://img.zcool.cn/community/0121a55d903ad6a801211d53066683.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 3,
          text: '我是3qwerqwer',
          url: 'https://img.zcool.cn/community/01162e5d903ad6a8012060bee46bf3.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 4,
          text: '我是4',
          url: 'https://img.zcool.cn/community/0121a55d903ad6a801211d53066683.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 5,
          text: '我是5qwerqwer',
          url: 'https://img.zcool.cn/community/01162e5d903ad6a8012060bee46bf3.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 6,
          text: '我是6',
          url: 'https://img.zcool.cn/community/01162e5d903ad6a8012060bee46bf3.jpg@1280w_1l_2o_100sh.jpg'
        },
        {
          id: 7,
          text: '我是7',
          url: 'https://img.zcool.cn/community/0121a55d903ad6a801211d53066683.jpg@1280w_1l_2o_100sh.jpg'
        }
      ],
      dataList1: [],
      dataList2: []
    };
  },
  mounted() {
    // this.mountMenu();
    this.getFlow(0);
  },
  methods: {
    getFlow(index) {
      const h1 = this.$refs.col1.offsetHeight;
      const h2 = this.$refs.col2.offsetHeight;
      if (h2 > h1) {
        this.dataList1.push(this.mainMenuList[index]);
      } else {
        this.dataList2.push(this.mainMenuList[index]);
      }
      index++;
      if (index < this.mainMenuList.length) {
        this.$nextTick(() => {
          this.getFlow(index);
        });
      }
    },
    mountMenu(arg) {
      var temp = this.mainMenuList;
      var index = arg || 0;
      var refName = this.selectCol();
      if (temp.length > index) {
        this[refName].push(this.mainMenuList[index]);
        this.$nextTick(() => {
          this.mountMenu(index + 1);
        });
      }
    },
    selectCol() {
      var getHeight = ref => {
        return this.$refs[ref].offsetHeight;
      };
      var height1 = getHeight('col1');
      var height2 = getHeight('col2');
      switch (
        Math.min(height1, height2) // Math.min()方法返回参数中最小的值
      ) {
        case height1:
          return 'dataList1';
        case height2:
          return 'dataList2';
      }
    }
  }
};
</script>

<style scoped>
.box {
  overflow: hidden;
  width: 400px;
}
.col {
  float: left;
  width: 100px;
}
img {
  width: 100%;
}
</style>
