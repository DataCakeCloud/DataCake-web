'use strict';

function _typeof(obj) {
  '@babel/helpers - typeof';

  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
    };
  }

  return _typeof(obj);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

var src = createCommonjsModule(function (module, exports) {
  var __assign =
    (commonjsGlobal && commonjsGlobal.__assign) ||
    function () {
      __assign =
        Object.assign ||
        function (t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];

            for (var p in s) {
              if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
          }

          return t;
        };

      return __assign.apply(this, arguments);
    };

  exports.__esModule = true;
  var defaultSettings = {
    renderNode: null,
    mode: 'cover',
    text: '请勿外传',
    font: {
      rotate: 18,
      opacity: 0.1,
      color: '#000',
      size: '15px'
    },
    position: {
      top: '0px',
      left: '0px'
    },
    density: 'normal'
  };
  var densityState = {
    high: {
      cWidth: '150',
      cHeight: '120'
    },
    normal: {
      cWidth: '200',
      cHeight: '170'
    },
    low: {
      cWidth: '300',
      cHeight: '220'
    }
  };

  var watermark = function watermark(setting) {
    if (checkOption(setting) && getRenderDom(setting)) {
      render(setting);
      observeWmDomChange(setting);
    }
  }; // 水印参数类型检查

  function checkOption(options) {
    if (!options) {
      return console.error('水印参数不可为空');
    }

    if (_typeof(options) !== 'object') {
      return console.error('水印参数必须为对象');
    } else {
      if (!options.renderNode) {
        return console.error('renderNode参数为必填');
      }
    }

    return true;
  } // 检查是否是dom类型

  function isDom(item) {
    if ((typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object') {
      return item instanceof HTMLElement;
    } else {
      return _typeof(item) === 'object' && item.nodeType === 1 && typeof item.nodeName === 'string';
    }
  } // 检查renderNode

  function getRenderDom(_a) {
    var renderNode = _a.renderNode;

    if (!isDom(renderNode)) {
      var dom = document.getElementById(renderNode);

      if (!dom) {
        return console.error('renderNode节点不存在');
      }

      return dom;
    }

    return renderNode;
  } // 渲染水印

  function render(setting) {
    var params = __assign(__assign({}, defaultSettings), setting);

    var mode = params.mode,
      text = params.text,
      density = params.density,
      font = params.font,
      position = params.position;
    var watermarkDom = document.createElement('div');
    watermarkDom.setAttribute('id', 'watermark-shareit');
    watermarkDom.style.width = '100%';
    watermarkDom.style.height = '100%';
    watermarkDom.style.pointerEvents = 'none';
    watermarkDom.style.position = mode === 'background' ? 'absolute' : 'fixed';

    var cPosition = __assign(
      __assign(__assign({}, defaultSettings.position), {
        zIndex: mode === 'cover' ? 10000 : 1
      }),
      position
    );

    var top = cPosition.top,
      left = cPosition.left,
      zIndex = cPosition.zIndex;
    watermarkDom.style.top = top;
    watermarkDom.style.left = left;
    watermarkDom.style.zIndex = zIndex; // 画布

    var _a = densityState[density],
      cWidth = _a.cWidth,
      cHeight = _a.cHeight;
    var canvas = document.createElement('canvas');
    canvas.width = cWidth;
    canvas.height = cHeight;
    var ctx = canvas.getContext('2d'); // font样式

    var cFont = __assign(__assign({}, defaultSettings.font), font);

    var rotate = cFont.rotate,
      opacity = cFont.opacity,
      color = cFont.color,
      size = cFont.size;
    ctx.rotate((-rotate * Math.PI) / 180);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = size + ' Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top'; // 多行/单行文字

    var txtWidth = Math.round(ctx.measureText(text).width);
    var txtHeight = Math.abs(txtWidth * Math.sin((rotate * Math.PI) / 180));
    var ctxMarginTop = Math.round(txtHeight) + Number(10);

    if (txtWidth > 180) {
      var textLen = text.length;
      var devide = Math.floor(textLen / 2);
      ctx.fillText(text.substring(0, devide), 10, ctxMarginTop);
      ctx.fillText(text.substring(devide, textLen), 10, Number(ctxMarginTop) + 20);
    } else {
      ctx.fillText(text, 10, ctxMarginTop);
    } // 水印Dom

    watermarkDom.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
    var renderDom = getRenderDom(setting);

    if (mode === 'background') {
      renderDom.style.position = 'relative';
    }

    renderDom.prepend(watermarkDom);
  } // 监听水印节点变化

  function observeWmDomChange(params) {
    var renderDom = getRenderDom(params);
    var MutationObserver = window.MutationObserver; // 水印节点：观察自身属性变化，样式或id改变则移除自身

    var wmDomId = 'watermark-shareit';
    var wmDom = document.getElementById(wmDomId);
    var wmObserver = new MutationObserver(function (mutationList) {
      if (mutationList.length) {
        if (wmDom.parentNode) {
          wmDom.parentNode.removeChild(wmDom);
        }
      }
    });
    wmObserver.observe(wmDom, {
      attributes: true
    }); // 水印节点的父节点：观察直接子节点变动，水印节点不存在则重新渲染

    var renderDomObserver = new MutationObserver(function (mutationList) {
      var _a;

      for (var _i = 0, mutationList_1 = mutationList; _i < mutationList_1.length; _i++) {
        var mutation = mutationList_1[_i];
        var firstChild = (_a = mutation.target) === null || _a === void 0 ? void 0 : _a.childNodes[0];
        var firstChildId = firstChild.id;

        if (!firstChildId || firstChildId !== wmDomId) {
          wmObserver.disconnect();
          renderDomObserver.disconnect();
          watermark(params);
        }
      }
    });
    renderDomObserver.observe(renderDom, {
      childList: true,
      attributeOldValue: true
    });
  }

  exports['default'] = watermark;
});
var index = unwrapExports(src);

module.exports = index;
