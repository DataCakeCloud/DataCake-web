const fs = require('fs');
const { crc32 } = require('crc');
module.exports = {
  input: [
    'src/**/*.{js,jsx,vue}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{js,jsx,vue}',
    '!src/i18n/**',
    '!**/node_modules/**'
  ],
  output: './', // 输出目录
  options: {
    debug: true,
    func: false,
    trans: false,
    lngs: ['zh', 'en'],
    defaultLng: 'zh',
    resource: {
      loadPath: './src/lang/{{lng}}/{{ns}}.json', // 输入路径
      savePath: './src/lang/{{lng}}/{{ns}}.json', // 输出路径
      jsonIndent: 2,
      lineEnding: '\n'
    },
    removeUnusedKeys: true,
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    // 自己通过该函数来加工key或value
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ['lang'] }, (key, options) => {
      options.defaultValue = key;
      const hashKey = `k${crc32(key).toString(16)}`;
      parser.set(hashKey, options);
    });
    done();
  }
};
