<template>
  <div ref="monaco" class="monaco-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import languageKeywords from './language-keywords.js';
import sqlFormatter from '@/utils/sql-formatter/sqlFormatter.js';

export default {
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
        foldingStrategy: 'indentation'
      }
    };
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
    this.monacoEditor = monaco.editor.create(this.$refs.monaco, {
      value: this.value, // 见props
      language: this.language,
      theme: this.theme, // 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
      ...this.editorOptions // 同codes
    });
    this.monacoEditor.onDidChangeModelContent(event => {
      const changeContent = this.monacoEditor.getValue();
      this.updateCode(changeContent);
    });
  },
  destroyed() {
    this.monacoEditor.dispose();
  },
  methods: {
    initSqlKeyWords(range) {
      const keywords = [...languageKeywords[this.language]];

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
      let sqlContent = '';
      sqlContent = this.monacoEditor.getValue();
      if (sqlContent) {
        sqlContent = sqlFormatter.format(sqlContent);
        this.monacoEditor.setValue(sqlContent);
        this.updateCode(sqlContent);
      }
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
    }
  }
};
</script>

<style lang="scss" scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
  border: 1px solid #e4e7ed;
  z-index: 2200;
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
