<template>
  <div ref="monaco" class="monaco-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import languageKeywords from './language-keywords.js';
import sqlFormatter from './sql-formatter/sqlFormatter.js';
import { getTableList, getDbList } from '@/api/querydata.js';
import { mapGetters, mapMutations } from 'vuex';
const runImg = require('@/assets/run.png');
import { debounce } from '@/utils';

export default {
  name: 'AnalysisCopy',
  props: {
    readOnly: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'vs'
    },
    language: {
      type: String,
      default: 'sql'
    },
    minimap: {
      type: Boolean,
      default: false
    },
    scrollBeyondLastLine: {
      type: Boolean,
      default: true
    },
    executeType: {
      type: Boolean,
      default: false
    },
    renderLineHighlight: {
      type: String,
      default: 'line'
    },
    customTheme: {
      type: Object,
      default: () => {
        return {
          rules: [],
          colors: {}
        };
      }
    }
  },
  data() {
    return {
      once: true,
      dbList: [],
      tableList: [],
      startColumn: 0,
      codes: '',
      editorOptions: {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: this.readOnly, // 只读
        cursorStyle: 'line', // 光标样式
        automaticLayout: true, // 自动布局
        // glyphMargin: true, // 字形边缘
        useTabStops: false,
        fontSize: 14, // 字体大小
        autoIndent: false, // 自动布局,
        folding: true,
        foldingStrategy: 'indentation',
        scrollBeyondLastLine: this.scrollBeyondLastLine,
        renderLineHighlight: this.renderLineHighlight, // 当前行突出显示方式
        minimap: {
          enabled: this.minimap
        },
        scrollbar: {
          alwaysConsumeMouseWheel: false
        }
      },
      currentIndex: 0,
      segmentPositions: [],
      currentLine: '',
      debounceHandel: null,
      selectionSql: ''
    };
  },
  computed: {
    ...mapGetters(['catalog', 'provider', 'engineConfig'])
  },
  mounted() {
    this.debounceHandel = debounce(this.debounceRender, 600);

    const self = this;
    const engineConfig = this.engineConfig;
    if (!this.provider) {
      const provider = monaco.languages.registerCompletionItemProvider(this.language, {
        triggerCharacters: ['.'],
        provideCompletionItems: async function(model, position) {
          var word = model.getWordUntilPosition(position);
          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };
          var textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });
          const resultData = await self.initSqlKeyWords(range, textUntilPosition, engineConfig);
          return {
            suggestions: resultData
          };
        }
      });
      this.SET_PROVIDER(provider);
    }
    // 自定义灰色背景主题
    monaco.editor.defineTheme('customTheme', {
      base: this.theme,
      inherit: true,
      rules: this.customTheme.rules,
      colors: this.customTheme.colors
    });
    // 设置自定义主题
    // monaco.editor.setTheme('GreyTheme');
    this.monacoEditor = monaco.editor.create(this.$refs.monaco, {
      value: this.value, // 见props
      language: this.language,
      theme: 'customTheme', // 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
      ...this.editorOptions // 同codes
    });
    this.monacoEditor.onDidChangeModelContent(event => {
      this.startColumn = event.changes[0].rangeOffset; // 鼠标的位置
      const changeContent = this.monacoEditor.getValue();
      this.updateCode(changeContent);
    });
    this.monacoEditor.onMouseUp(e => {
      this.selectionSql = this.getSelection();
    });
    this.monacoEditor.onMouseDown(e => {
      if (this.executeType) {
        this.setLineStyle(e.target);
        this.$emit('update:downType', true);
        // 点击行号光标处理
        if (e.target?.type === 3) {
          // 设置光标位置
          this.monacoEditor.setPosition({
            lineNumber: e.target.position.lineNumber,
            column: 0
          });

          // 聚焦到编辑器
          this.monacoEditor.focus();

          const currentSql = this.segmentPositions[this.currentIndex]?.str || '';
          const sql = this.selectionSql || currentSql;
          this.$emit('handelExecute', e, sql);
        }
      }
    });
    this.monacoEditor.onDidScrollChange(e => {
      this.debounceHandel?.();
    });
    // 位置处理
    this.monacoEditor.onDidChangeCursorPosition(e => {
      this.$emit('edit-position', e.position);
    });
    // 增加快捷键 Ctrl+S保存，Ctrl+Shift+L格式化，Ctrl+Enter运行
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      this.$emit('save');
    });
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyL, () => {
      this.formatSql();
    });
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.$emit('exec');
    });
  },
  destroyed() {
    this.monacoEditor.dispose();
  },
  methods: {
    ...mapMutations(['SET_PROVIDER']),
    debounceRender() {
      this.renderRunBtn();
    },
    async initSqlKeyWords(range, textUntilPosition, engineConfig) {
      const region = engineConfig.region;
      const catalog = engineConfig.catalog;
      let keywords = [...languageKeywords[this.language]];
      const cruxKey = ['from', 'join', 'inner', 'FROM', 'JOIN', 'INNER'];
      // const reg = new RegExp(`\\b(${cruxKey.join('|')})\\b [a-zA-Z]+.`)
      const reg = /[a-zA-Z]*\.$/;

      // this.codes = this.codes.slice(0, this.startColumn + 1);
      // const inputList = this.codes.split(' ');

      // 参数输入不提示
      const endKeyWords = textUntilPosition.lastIndexOf('}}');
      const startKeyWords = textUntilPosition.lastIndexOf('{{');
      if (startKeyWords > 0 && startKeyWords > endKeyWords) {
        return [
          {
            label: '',
            // kind: monaco.languages.CompletionItemKind.Keyword,   // 图标,这个官方API有介绍
            insertText: '', // 选择后粘贴到编辑器中的文字
            sortText: 'A'.concat(name), // 排序
            detail: ' '
          }
        ];
      }

      const inputList = textUntilPosition.split(' ');
      if (cruxKey.includes(inputList[inputList.length - 2])) {
        this.dbList = await (await getDbList({ region, catalog, engine: '' })).data;
        keywords = this.dbList;
        if (inputList[inputList.length - 1].includes('\r\n')) keywords = [...languageKeywords[this.language]];
      }
      if (reg.test(textUntilPosition)) {
        const res = textUntilPosition.split(' ');
        const database = res[res.length - 1].split('.')[0];
        const tableRes = await getTableList({ region, engine: '', catalog, database });
        keywords = tableRes.data;
      }
      const suggestions = keywords?.map(item => {
        return {
          label: item,
          // kind: monaco.languages.CompletionItemKind.Keyword,   // 图标,这个官方API有介绍
          insertText: item, // 选择后粘贴到编辑器中的文字
          sortText: 'A'.concat(name), // 排序
          detail: ' ',
          range
        };
      });
      return suggestions || [];
    },
    setLineStyle(e) {
      // 获取编辑器中的全部内容
      const content = this.monacoEditor.getValue();
      // 使用正则表达式将文本内容按照 `;` 分割为数组
      const segments = content.split(/\s*;\s*/).filter(str => str.trim());

      let contrntEndIndex = 0;
      // 保存每段的起始行号和结束行号
      const segmentPositions = segments.map((segment, index) => {
        const startIndex = content.indexOf(segment, contrntEndIndex);
        const endIndex = startIndex + segment.length;
        contrntEndIndex = endIndex;
        // 获取起始和结束位置对应的行号和列号
        const startPos = this.monacoEditor.getModel().getPositionAt(startIndex);
        const endPos = this.monacoEditor.getModel().getPositionAt(endIndex);
        if (e.position.lineNumber >= startPos.lineNumber && e.position.lineNumber <= endPos.lineNumber) {
          this.currentIndex = index;
          // 清楚选择
          if (this.currentLine) this.currentLine.clear();
          this.currentLine = this.monacoEditor.createDecorationsCollection([
            {
              range: new monaco.Range(startPos.lineNumber, 1, endPos.lineNumber, 1),
              options: {
                isWholeLine: true,
                marginClassName: 'myGlyphMarginClass'
              }
            },
            {
              range: new monaco.Range(e.position.lineNumber, 1, e.position.lineNumber, 1),
              options: {
                isWholeLine: true,
                marginClassName: 'myGlyphMarginClass_current'
              }
            }
          ]);
        }
        return {
          startLineNumber: startPos.lineNumber,
          endLineNumber: endPos.lineNumber,
          str: segment
        };
      });
      this.segmentPositions = segmentPositions;
      setTimeout(() => {
        this.renderRunBtn();
      }, 300);
    },
    setCurrent(data) {
      this.currentLine && this.currentLine.clear();
      this.currentLine = this.monacoEditor.createDecorationsCollection([
        {
          range: new monaco.Range(data.startLineNumber, 1, data.endLineNumber, 1),
          options: {
            isWholeLine: true,
            marginClassName: 'myGlyphMarginClass'
          }
        },
        {
          range: new monaco.Range(data.startLineNumber, 1, data.startLineNumber, 1),
          options: {
            isWholeLine: true,
            marginClassName: 'myGlyphMarginClass_current'
          }
        }
      ]);
      setTimeout(() => {
        this.renderRunBtn();
      }, 300);
    },
    handelCurrent(type = 'add') {
      if (this.currentIndex === this.segmentPositions.length - 1 && type === 'add') {
        return;
      } else if (this.currentIndex === 0 && type === 'sub') {
        return;
      } else {
        type === 'add' ? this.currentIndex++ : this.currentIndex--;
      }
      this.setCurrent(this.segmentPositions[this.currentIndex]);
    },
    renderRunBtn() {
      const MDB = this.$refs.monaco;
      const numberDom = MDB?.querySelector('.myGlyphMarginClass_current');
      if (numberDom) {
        numberDom.innerHTML = `
        <div class="myGlyphMarginClass_btn">
          <image src=${runImg} />
        </div>
        `;
      }
    },
    formatSql() {
      let sqlContent = '';
      sqlContent = this.monacoEditor.getValue();
      if (sqlContent) {
        console.log(sqlContent, '格式化之前');
        sqlContent = sqlFormatter.format(sqlContent);
        console.log(sqlContent, '格式化之后');
        this.monacoEditor.setValue(sqlContent);
        this.updateCode(sqlContent);
      }
    },
    updateCode(codes) {
      this.codes = codes;
      this.$emit('input', codes);
    },
    setCode(codes) {
      codes = codes || '';
      this.monacoEditor.setValue(codes);
    },
    insertContent(text) {
      const selection = this.monacoEditor.getSelection();
      const range = new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: range, text, forceMoveMarkers: true };
      this.monacoEditor.executeEdits(this.root, [op]);
      this.monacoEditor.focus();
    },
    getSelection() {
      const selection = this.monacoEditor.getSelection();
      return this.monacoEditor.getModel().getValueInRange(selection);
    }
  }
};
</script>
<style lang="scss" scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
  border: 1px solid #e4e7ed;
}
</style>
<style lang="scss">
.myGlyphMarginClass {
  position: relative;
  left: 39px !important;
  z-index: 10;
  background: #4aaa69;
  width: 3px !important;
}
.myGlyphMarginClass_current {
  padding: 0 3px;
  width: 33px !important;
  background: #fff;
  z-index: 1;
}
.monaco-editor {
  .line-numbers {
    border-right: 3px solid #dcdfe6;
    // padding-right: 5px;
    text-align: center !important;
  }
}
</style>
<style lang="scss">
.myGlyphMarginClass_btn {
  margin-top: 1px;
  padding: 0 3px;
  height: 18px;
  display: flex;
  align-items: center;
  font-size: $global-font-size-10;
  background-color: #ecf9ec;
  padding-top: 2px;
  padding-left: 2px;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid #b3e6b4;
  img {
    height: 15px;
    margin-top: -2px;
    margin-left: 4px;
  }
}
</style>
