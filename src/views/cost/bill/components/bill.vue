<template>
  <el-card v-loading="loading" class="r-l-card dashboard-card">
    <template v-for="(item, index) in billData.title">
      <div :key="`${item.name}_${index}`" class="title">
        <span class="name">{{ item.name }}</span>
        <span class="value">$ {{ item.value }}</span>
        <span class="tip">比上月同期总成本 <span v-html="getValue(item.yoy)"></span></span>
      </div>
    </template>

    <el-collapse v-model="activeName">
      <template v-for="(item, index) in billData.body">
        <el-collapse-item :key="index" :name="index">
          <div slot="title" class="title">
            <span class="name">{{ item.name }}</span>
            <span class="value">$ {{ item.value }}</span>
            <span class="tip">比上月同期总成本 <span v-html="getValue(item.yoy)"></span></span>
          </div>
          <el-divider v-if="activeName.includes(index)"></el-divider>
          <div class="list-content">
            <div class="list-tip">{{ item.tip }}</div>
            <!-- 子 -->
            <el-collapse v-model="item.activeName">
              <template v-for="(subItem, subIndex) in item.children">
                <el-collapse-item :key="subIndex" :name="subIndex">
                  <template v-if="subItem">
                    <div slot="title" :key="`${index}-${subIndex}`" class="list-item item">
                      <span class="name">{{ subItem.name }}</span>
                      <span class="value">$ {{ subItem.value }}</span>
                    </div>
                    <!-- 孙 -->
                    <template v-for="(grandItem, grandIndex) in subItem.children">
                      <div :key="`${index}-${subIndex}-${grandIndex}`" class="list-sub-item item">
                        <span class="name">{{ grandItem.name }}</span>
                        <div class="item-content">
                          <template v-for="(vItem, i) in grandItem.v">
                            <span :key="i" :class="[`v${i + 1}`]">{{ vItem }}</span>
                          </template>
                        </div>
                        <span class="value">$ {{ grandItem.value }}</span>
                      </div>
                      <!-- 曾孙 -->
                      <template v-for="(greatGrandItem, greatGrandIndex) in grandItem.children">
                        <div :key="`${index}-${subIndex}-${grandIndex}-${greatGrandIndex}`" class="list-grand-item item">
                          <span class="name">{{ greatGrandItem.name }}</span>
                          <div class="item-content">
                            <template v-for="(vItem, i) in greatGrandItem.v">
                              <span :key="i" :class="[`v${i + 1}`]">{{ vItem }}</span>
                            </template>
                          </div>
                          <span class="value">$ {{ greatGrandItem.value }}</span>
                        </div>
                        <!-- 玄孙 -->
                        <template v-for="(greatGrandGrandItem, greatGrandGrandIndex) in greatGrandItem.children">
                          <div :key="`${index}-${subIndex}-${grandIndex}-${greatGrandIndex}-${greatGrandGrandIndex}`" class="list-great-grand-item item">
                            <span class="name">{{ greatGrandGrandItem.name }}</span>
                            <div class="item-content">
                              <template v-for="(vItem, i) in greatGrandGrandItem.v">
                                <span :key="i" :class="[`v${i + 1}`]">{{ vItem }}</span>
                              </template>
                            </div>
                            <span class="value">$ {{ greatGrandGrandItem.value }}</span>
                          </div>
                        </template>
                      </template>
                    </template>
                  </template>
                </el-collapse-item>
              </template>
            </el-collapse>
          </div>
        </el-collapse-item>
      </template>
    </el-collapse>
  </el-card>
</template>

<script>
import { getValue } from '@/utils/';

export default {
  name: '',
  props: {
    billData: {
      type: Object,
      default: () => {}
    },
    loading: Boolean,
    actives: {
      type: Array,
      default: () => [0]
    }
  },
  data() {
    return {
      // activeName: [0]
    };
  },
  computed: {
    activeName: {
      get() {
        return this.actives;
      },
      set(val) {
        this.$emit('updateActive', val);
      }
    }
  },
  methods: {
    getValue(val) {
      if (!val) return '';
      return getValue(val);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped src="./bill.scss"></style>
