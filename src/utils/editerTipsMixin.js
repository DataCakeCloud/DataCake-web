import { getDbs, getTables, getDataSetList } from '@/api/task';
export default {
  data() {
    return {
      monacoRules: [
        {
          regFunction: this.dbRegFunction,
          dataFunction: this.getDbFunction
        },
        {
          regFunction: this.tableRegFunction,
          dataFunction: this.getTableFunction
        },
        {
          regFunction: this.regColumnName,
          dataFunction: this.getColumnName
        }
      ]
    };
  },
  methods: {
    dbRegFunction(str) {
      const reg = /(?:USE|FROM|JOIN)\s+`?([a-zA-Z0-9_]+)`?$/gi;
      const flag = reg.test(str);
      const endStr = str.split(' ')[str.split(' ').length - 1];
      if (flag && !endStr.includes('.')) {
        return {
          ...this.editorParams
        };
      }
    },
    getDbFunction(params) {
      return getDbs({ ...params }).then(res => {
        return res.data || [];
      });
    },
    tableRegFunction(str) {
      const reg = /\s?SELECT\s+.+?\bFROM\s+`?([a-zA-Z0-9_]+)`?\b/gi;
      const flag = reg.test(str);
      const endStr = str.split(' ')[str.split(' ').length - 1];
      if (flag && endStr.split('.').length === 2) {
        return {
          ...this.editorParams,
          db: endStr.split('.')[0] || ''
        };
      }
    },
    getTableFunction(params) {
      return getTables({ ...params }).then(res => {
        return res.data || [];
      });
    },
    regColumnName(str, value) {
      const reg = /(SELECT\s+`?([a-zA-Z0-9_,]+)`?)$/i;
      const flag = reg.test(str);
      if (flag && value.length > str.length) {
        const valStr1 = value.replace(str, '');
        console.log(valStr1, 333);
        const valStrArr1 = valStr1.split('.');
        let table = valStrArr1[1].split(' ')[0];
        table = table.replace(';', '');
        const db = valStrArr1[0].split(' ')[valStrArr1[0].split(' ').length - 1];
        return {
          ...this.editorParams,
          tips: true,
          table: table,
          db: db,
          type: 'hive',
          metaFlag: 'AIRBYTE'
        };
      }
    },
    getColumnName(params) {
      return getDataSetList({ ...params }).then(res => {
        return res.data
          ? res.data.columns.map(item => {
              return item.name;
            })
          : [];
      });
    }
  }
};
