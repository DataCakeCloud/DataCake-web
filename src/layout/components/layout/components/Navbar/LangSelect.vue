<template>
  <el-dropdown trigger="hover" class="lang-select" @command="handleSetLanguage">
    <div>
      <svg-icon class-name="lang-select-icon" icon-class="language" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language === 'zh'" command="zh" divided> 中文 </el-dropdown-item>
      <el-dropdown-item :disabled="language === 'en'" command="en" divided> English </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language;
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang;
      if (this.$store._actions.setLanguage) {
        this.$store.dispatch('setLanguage', lang);
      } else if (this.$store._actions['app/setLanguage']) {
        this.$store.dispatch('app/setLanguage', lang);
      } else {
        console.log('请添加setLanguage或setLanguage/setLanguage的action');
      }

      this.$message({
        message: 'switch language success',
        type: 'success'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.lang-select {
  padding: 0 10px;
}
.lang-select-icon {
  font-size: 20px;
  cursor: pointer;
  vertical-align: -5px !important;
}
</style>
