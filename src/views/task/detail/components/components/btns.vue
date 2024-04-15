<script>
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {
          color: '#686868',
          text: '按钮',
          borderStyle: 'solid'
        };
      }
    }
  },
  render(h) {
    return <span style={{ 'border-color': `${this.info.color}`, 'border-style': `${this.info.borderStyle}` }}>{this.info.text}</span>;
  }
};
</script>

<style lang="scss" scoped>
span {
  display: inline-block;
  border: 2px solid #686868;
  padding: 4px 8px;
  border-radius: 5px;
}
</style>
