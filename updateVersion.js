const fs = require('fs');

function randomStr() {
  return Math.random().toString(16).substr(2, 10).toUpperCase();
}
const pluginName = 'updateVersion';

class updateVersion {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, compilation => {
      const versionFile = {
        version: randomStr()
      };

      // 每次发版动态生成版本信息
      fs.writeFile('./public/version.json', JSON.stringify(versionFile), () => {
        console.log('版本号生成成功');
      });
    });
  }
}

module.exports = updateVersion;
