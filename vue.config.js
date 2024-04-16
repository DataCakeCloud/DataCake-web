'use strict';
const path = require('path');

// const defaultSettings = require('./src/settings.js');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const UpdateVersion = require('./updateVersion');

const whiteList = ['development', 'cloud-aws-development'];
const isCloud = JSON.parse(process.env.VUE_APP_IS_CLOUD);

function resolve(dir) {
  return path.join(__dirname, dir);
}

const { name } = require('./package');

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528; // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: whiteList.includes(process.env.VUE_APP_ENV),
  productionSourceMap: false,
  transpileDependencies: ['element-ui'],
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '/bridge': {
        target: 'https://ds-api-gateway.datacake.cloud',
        changeOrigin: true,
        pathRewrite: {
          '^/bridge': ''
        }
      },
      [process.env.VUE_APP_BASE_API_GATEWAY]: {
        target: process.env.VUE_APP_API_GATEWAY_PATH,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API_GATEWAY]: ''
        }
      },
      [process.env.VUE_APP_BASE_API7]: {
        target: process.env.VUE_APP_API_PATH7,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API7]: ''
        }
      },
      [process.env.VUE_APP_BASE_API6]: {
        target: process.env.VUE_APP_API_PATH6,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API6]: ''
        }
      },
      [process.env.VUE_APP_BASE_API5]: {
        target: process.env.VUE_APP_API_PATH5,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API5]: ''
        }
      },
      [process.env.VUE_APP_BASE_API4]: {
        target: process.env.VUE_APP_API_PATH4,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API4]: ''
        }
      },
      [process.env.VUE_APP_BASE_API3]: {
        target: process.env.VUE_APP_API_PATH3,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API3]: ''
        }
      },
      [process.env.VUE_APP_BASE_API2]: {
        target: process.env.VUE_APP_API_PATH2,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API2]: ''
        }
      },
      [process.env.VUE_APP_BASE_API]: {
        target: process.env.VUE_APP_API_PATH,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    },
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
    // after: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // name: name,
    name: process.env.VUE_APP_NAME,
    resolve: {
      alias: {
        '@': resolve('src'),
        vue$: 'vue/dist/vue.esm.js'
      }
    },
    output: {
      // filename: 'js/[name].[hash:10].js',
      // chunkFilename: 'js/[name].[hash:10].js',
      // 把子应用打包成 umd 库格式   name不能包含空格会导致加载失败
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`,
      globalObject: 'window'
    },
    module: {
      rules: [
        {
          test: /\.js$/,

          // 这里需要替换成node_modules中的element依赖名称，我用cnpm安装的这里为_element-ui@2.13.0@element-ui

          include: [path.resolve(__dirname, 'node_modules/element-ui'), path.resolve(__dirname, 'node_modules/monaco-editor')],

          use: {
            loader: 'babel-loader',

            options: {
              presets: ['@vue/babel-preset-jsx'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        }
      ]
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import 'src/layout/components/styles/variables.scss';
        `
      }
    }
  },
  chainWebpack(config) {
    // config.plugin('monaco').use(new MonacoWebpackPlugin());
    config.plugins.delete('preload'); // TODO: need test
    config.plugins.delete('prefetch'); // TODO: need test

    // 动态设置 favicon
    config.plugin('html').tap(args => {
      args[0].favicon = !isCloud ? resolve('public/stadio/favicon.ico') : resolve('public/cloud/favicon.ico');

      return args;
    });
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: ['python', 'shell', 'sql']
      }
    ]);
    // webpack 内部 NODE_ENV 只有development、dev、test、production
    if (process.env.NODE_ENV !== 'development') {
      // 更新版本
      config.plugin('UpdateVersion').use(new UpdateVersion());
      // gzip压缩
      const productionGzipExtensions = ['js', 'css'];
      config.plugin('compressionPlugin').use(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240, // 只有大于该值(10.24kb)的资源会被处理 20034
          minRatio: 0.8 // 只有压缩率小于这个值的资源才会被处理
        })
      );
    }
    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();
    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true;
        return options;
      })
      .end();

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(whiteList.includes(process.env.VUE_APP_ENV), config => config.devtool('eval-source-map'));

    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end();
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });
      config.optimization.runtimeChunk('single');
    });
  }
};
