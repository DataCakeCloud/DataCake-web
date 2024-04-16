import { Chart } from '@antv/g2';

export default {
  data() {
    return {
      chart: null,
      chartOption: {
        id: '',
        autoFit: true,
        // chartWidth: 200,
        chartHeight: 300,
        padding: [20, 20, 40, 60], // 边距
        axisX: '', // X轴显示字段
        axisY: '' // Y轴显示字段
      }
    };
  },
  methods: {
    initChart() {
      this.chart = null;
      // Step 1: 创建 Chart 对象
      this.chart = new Chart({
        container: this.chartOption.id, // 指定图表容器 ID
        width: this.chartOption.chartWidth, // 指定图表宽度
        height: this.chartOption.chartHeight, // 指定图表高度
        autoFit: this.chartOption.autoFit, // 是否自适应
        padding: this.chartOption.padding // 边距
      });
    },
    setChartData(data) {
      this.chart.data(data);
    },
    formatterValue(val) {
      let res = val;
      if (this.chartOption.axisY.format === 'number') {
        res = val;
      } else if (this.chartOption.axisY.format === 'hundred') {
        res = res * 100 + ' %';
      } else if (this.chartOption.axisY.format === 'thousand') {
        res = res * 1000 + ' ‰';
      }
      return res;
    },
    setChartOption(type, setOptionFn = chart => {}) {
      this.chart.clear();

      // 共有的配置
      // this.chart.legend(this.chartOption.legend);
      if (this.chartOption.legend) {
        this.chart.legend({
          position: 'bottom',
          offsetY: type === 'line' ? 8 : 4
        });
      } else {
        this.chart.legend(this.chartOption.legend);
      }
      this.chart.scale(this.chartOption.axisX.value, {
        nice: true,
        alias: this.chartOption.axisX.name
      });
      this.chart.scale(this.chartOption.axisY.value, {
        nice: true,
        alias: this.chartOption.axisY.name
      });
      this.chart.axis(this.chartOption.axisX.value, {
        title: this.chartOption.axisX.name ? { position: 'center', offset: 30 } : null
      });
      this.chart.axis(this.chartOption.axisY.value, {
        title: this.chartOption.axisY.name ? { position: 'center' } : null,
        label: {
          formatter: val => {
            let res = val;
            if (this.chartOption.axisY.format === 'number') {
              res = val;
            } else if (this.chartOption.axisY.format === 'hundred') {
              res = res * 100 + ' %';
            } else if (this.chartOption.axisY.format === 'thousand') {
              res = res * 1000 + ' ‰';
            }
            return res.length > 8 ? `${res.slice(0, 8)}...` : res;
          }
        }
      });

      // 捕捉axis-label的mouseenter事件创建DOM
      this.chart.on('axis-label:mouseenter', ev => {
        // 单对y轴处理
        if (ev.target.cfg.delegateObject.axis.cfg.field !== this.chartOption.axisY.value) return;
        // 判断是否创建过div框,如果创建过就不再创建了
        const id = document.getElementById('extension');
        if (!id) {
          const div = document.createElement('div');
          div.id = 'extension';
          div.style.display = 'none';
          document.body.appendChild(div);
        }
        const extensionDom = document.querySelector('#extension');
        extensionDom.style.position = 'absolute';
        extensionDom.style.color = '#333';
        extensionDom.style.background = '#fff';
        extensionDom.style['font-size'] = '12px';
        extensionDom.style.padding = '5px';
        extensionDom.style.display = 'inline';
        extensionDom.style.border = '1px solid #333';
        extensionDom.style['z-index'] = '10000';
        extensionDom.innerText = this.formatterValue(ev.target.cfg.delegateObject.item.name);

        document.body.onmousemove = function(event) {
          const xx = event.pageX - 30;
          const yy = event.pageY + 20;
          extensionDom.style.top = yy + 'px';
          extensionDom.style.left = xx + 'px';
        };
      });
      // 捕捉axis-mouseleave隐藏DOM
      this.chart.on('axis-label:mouseleave', ev => {
        const extensionDom = document.querySelector('#extension');
        if (extensionDom) extensionDom.style.display = 'none';
      });

      let geom;
      if (type === 'line') {
        this.chart.tooltip({
          shared: true,
          showCrosshairs: true // hover竖线
        });
        this.chart.line().position(`${this.chartOption.axisX.value}*${this.chartOption.axisY.value}`).color(`${this.chartOption.dimension}`).shape('smooth');
        geom = this.chart.point().position(`${this.chartOption.axisX.value}*${this.chartOption.axisY.value}`).color(`${this.chartOption.dimension}`).shape('circle');
      } else if (type === 'interval' || type === 'stack') {
        this.chart.tooltip({
          shared: true,
          showMarkers: false
        });
        this.chart.interaction('active-region');
        geom = this.chart.interval().position(`${this.chartOption.axisX.value}*${this.chartOption.axisY.value}`).adjust('stack').color(`${this.chartOption.group}`);
      } else if (type === 'polygon') {
        this.chart.axis(false);
        this.chart.tooltip({
          showTitle: false,
          showMarkers: false,
          itemTpl: '<li style="list-style: none;">' + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' + '{name}<br/>' + '<span style="padding-left: 16px">value：{value}</span><br/>' + '<br/></li>'
        });
        geom = this.chart
          .polygon()
          .position(`x*y`)
          .color('name')
          .tooltip('name*value', (name, value) => {
            if (this.chartOption.format === 'hundred') {
              value = value * 100 + ' %';
            } else if (this.chartOption.format === 'thousand') {
              value = value * 1000 + ' ‰';
            }
            return {
              name,
              value
            };
          })
          .style({
            lineWidth: 1,
            stroke: '#fff'
          })
          .label('name', {
            offset: 0,
            style: {
              textBaseline: 'middle'
            },
            content: obj => {
              if (obj.name !== 'root') {
                return obj.name;
              }
            }
          });
      }

      setOptionFn(this.chart, geom);
    },
    renderChart() {
      this.chart.render();
    }
  }
};
