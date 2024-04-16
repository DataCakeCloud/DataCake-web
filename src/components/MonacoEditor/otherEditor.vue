<template>
  <div ref="monaco" class="monaco-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { language as pythonLanguage } from 'monaco-editor/esm/vs/basic-languages/python/python.js';
import { language as shellLanguage } from 'monaco-editor/esm/vs/basic-languages/shell/shell.js';

export default {
  name: 'MonacoEditor',
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
    renderLineHighlight: {
      type: String,
      default: 'line'
    },
    customTheme: {
      type: Object,
      default: () => {
        return {};
      },
      wordWrap: {
        type: String,
        default: ''
      }
    }
  },
  data() {
    return {
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
        scrollBeyondLastLine: this.scrollBeyondLastLine,
        renderLineHighlight: this.renderLineHighlight, // 当前行突出显示方式
        foldingStrategy: 'indentation',
        wordWrap: this.wordWrap,
        minimap: {
          enabled: this.minimap
        },
        scrollbar: {
          alwaysConsumeMouseWheel: false
        }
      }
    };
  },
  computed: {
    languageKeywords() {
      let res = [];
      switch (this.language) {
        case 'python':
          res = pythonLanguage.keywords;
          break;
        case 'shell':
          res = shellLanguage.keywords;
          break;
      }
      return res;
    }
  },
  mounted() {
    const self = this;
    monaco.languages.registerCompletionItemProvider(this.language, {
      provideCompletionItems: function(model, position) {
        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        return {
          suggestions: self.initSqlKeyWords(range)
        };
      }
    });
    // 自定义灰色背景主题
    monaco.editor.defineTheme('customTheme', {
      base: this.theme,
      inherit: true,
      rules: this.customTheme.rules || [],
      colors: this.customTheme.colors || {}
    });
    this.monacoEditor = monaco.editor.create(this.$refs.monaco, {
      value: this.value, // 见props
      language: this.language,
      theme: 'customTheme', // 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
      ...this.editorOptions // 同codes
    });
    this.monacoEditor.onDidChangeModelContent(event => {
      const changeContent = this.monacoEditor.getValue();
      this.updateCode(changeContent);
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
    initSqlKeyWords(range) {
      const keywords = [...this.languageKeywords];

      const suggestions = keywords.map(item => {
        return {
          label: item,
          // kind: monaco.languages.CompletionItemKind.Keyword,   // 图标,这个官方API有介绍
          insertText: item, // 选择后粘贴到编辑器中的文字
          sortText: 'A'.concat(name), // 排序
          detail: ' ',
          range
        };
      });
      return suggestions;
    },
    formatSql() {
      // let sqlContent = '';
      // sqlContent = this.monacoEditor.getValue();
      // if (sqlContent) {
      //   sqlContent = sqlFormatter.format(sqlContent);
      //   this.monacoEditor.setValue(sqlContent);
      //   this.updateCode(sqlContent);
      // }
      this.updateCode(this.monacoEditor.getValue());
    },
    updateCode(codes) {
      this.$emit('input', codes);
    },
    setCode(codes) {
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
  z-index: 999;
}
</style>
<style lang="scss">
.monaco-editor {
  .line-numbers {
    border-right: 3px solid #dcdfe6;
    // padding-right: 5px;
    text-align: center !important;
  }
}
</style>
