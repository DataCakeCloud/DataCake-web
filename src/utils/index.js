/* eslint-disable no-extend-native */
/**
 * Created by jiachenpan on 16/11/18.
 */
import router from '../router';
import elementResizeDetectorMaker from 'element-resize-detector';
import CryptoJS from 'crypto-js';
const privateKey = 'DataStudio-20210628';

// Echart  监听div容器和窗口变化，自适应图表
/*
 *  that: 当前调用方法的this对象
 *  myChart：echart图对象
 *  domId：容器id
 */
export function chartResizeListen(that, myChart, domId) {
  const dom = document.getElementById(domId);
  if (!dom) return;
  // 监听window窗口变化
  function fn() {
    myChart.resize();
    window.removeEventListener('resize', fn);
  }
  window.removeEventListener('resize', fn);
  window.addEventListener('resize', fn);

  // 监听div大小变化
  const erd = elementResizeDetectorMaker();
  erd.listenTo(document.getElementById(domId), _ => {
    that.$nextTick(() => {
      myChart.resize();
    });
  });
}

export function domResizeListen(that, doFn, domId) {
  const dom = document.getElementById(domId);
  if (!dom) return;
  // 监听window窗口变化
  function fn() {
    doFn();

    window.removeEventListener('resize', fn);
  }
  window.removeEventListener('resize', fn);
  window.addEventListener('resize', fn);

  // 监听div大小变化
  const erd = elementResizeDetectorMaker();
  erd.listenTo(dom, _ => {
    that.$nextTick(() => {
      fn();
    });
  });
}

// 随机颜色值
export function randomColor() {
  return '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
}

// 柱状图鼠标悬浮显示全部标签
export function extension(chart) {
  // 注意这里，是以X轴显示内容过长为例，如果是y轴的话，需要把params.componentType == 'xAxis'改为yAxis
  // 判断是否创建过div框,如果创建过就不再创建了
  // 该div用来盛放文本显示内容的，方便对其悬浮位置进行处理
  var elementDiv = document.getElementById('extension');
  if (!elementDiv) {
    var div = document.createElement('div');
    div.setAttribute('id', 'extension');
    div.style.display = 'block';
    document.querySelector('html').appendChild(div);
  }
  chart.on('mouseover', function (params) {
    if (params.componentType === 'yAxis') {
      var elementDiv = document.querySelector('#extension');
      // 设置悬浮文本的位置以及样式
      var elementStyle = 'position: absolute;z-index: 99999;color: #fff;font-size: 12px;padding: 5px;display: inline;border-radius: 4px;background-color: #303133;box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 8px';
      elementDiv.style.cssText = elementStyle;
      elementDiv.innerHTML = params.value;
      document.querySelector('html').onmousemove = function (event) {
        var elementDiv = document.querySelector('#extension');
        var xx = event.pageX + 10;
        var yy = event.pageY - 30;
        elementDiv.style.top = yy + 'px';
        elementDiv.style.left = xx + 'px';
      };
    }
  });
  chart.on('mouseout', function (params) {
    // 注意这里，我是以X轴显示内容过长为例，如果是y轴的话，需要改为yAxis
    if (params.componentType === 'yAxis') {
      var elementDiv = document.querySelector('#extension');
      elementDiv.style.cssText = 'display:none';
    }
  });
}

// 数字四舍五入之后转成千分位
export function toQian(value = 0) {
  return (value.toFixed(2) - 0).toLocaleString('en-US');
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  // const format = cFormat || '{y}/{m}/{d} {h}:{i}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (('' + time).length === 10) {
      time = parseInt(time) * 1000;
    }
    // const utc0Timestamp = new Date().getTimezoneOffset() * 60 * 1000;
    // time = time - utc0Timestamp;
    date = new Date(time);
  }

  // 0 时区时间处理
  const isOverseas = JSON.parse(process.env.VUE_APP_IS_OVERSEAS);
  if (isOverseas) {
    const timezoneOffset = new Date().getTimezoneOffset();
    const time0 = date.getTime() + timezoneOffset * 60 * 1000;
    date = new Date(time0);
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    b: date.getMilliseconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|b|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (key === 'b') {
      if (result.length > 0 && value < 10) {
        value = '00' + value;
      } else if (value > 10 && value < 100) {
        value = '0' + value;
      }
    } else {
      if (result.length > 0 && value < 10) {
        value = '0' + value;
      }
    }
    return value || 0;
  });
  return time_str;
}

export function parseDate(time) {
  var cFormat = '{y}-{m}-{d}';
  return parseTime(time, cFormat);
}

export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
  }
}

/**
 * 按照需要将dataObj中数据赋值给aimObj
 * @param {*} dataObj
 * @param {*} aimObj
 */
export function copyToNeed(dataObj, aimKeys) {
  const obj = {};
  if (dataObj && aimKeys) {
    aimKeys.forEach(key => {
      if (dataObj.hasOwnProperty(key)) {
        if (dataObj[key] === '' || dataObj[key] === null) {
          obj[key] = '';
        } else {
          obj[key] = dataObj[key];
        }
      }
    });
  }
  return obj;
}
/**
 * 转换tree数据  列表格式-父子嵌套格式
 * @param {*} data
 */
export function formatTreeData(data) {
  const temp = {};
  const tree = {};
  for (const item of data) {
    temp[item.id] = item;
  }
  for (const key in temp) {
    if (temp[key].parentMenuId === -1) {
      tree[temp[key].id] = temp[key];
    } else if (temp[temp[key].parentMenuId]) {
      if (!temp[temp[key].parentMenuId].hasOwnProperty('children')) {
        temp[temp[key].parentMenuId].children = {};
      }
      temp[temp[key].parentMenuId].children[temp[key].id] = temp[key];
    }
  }
  return objToArr(tree);
  // // 一级菜单 const first = data.filter(obj => (obj.parentMenuId === -1)); data =
  // data.filter(obj => (obj.parentMenuId !== -1)); // {firstid:[secondList]}
  // const mapData = {}; for (const obj of data) {   if (obj.level !== 1) {     if
  // (!mapData.hasOwnProperty(obj.parentMenuId)) {       mapData[obj.parentMenuId]
  // = [];     }     mapData[obj.parentMenuId].push(obj);   } } for (const obj of
  // first) {   if (mapData.hasOwnProperty(obj.id)) {     obj.children =
  // mapData[obj.id];   } } return first;
}
// 将formatTreeData中转换好的object层级关系转为数组层级关系
function objToArr(data) {
  const parent = [];
  for (const key in data) {
    const node = Object.assign({}, data[key]);
    if (node.hasOwnProperty('children')) {
      node.children = objToArr(node.children);
    }
    parent.push(node);
  }
  return parent;
}
export function getParams(url, variable) {
  const query = url.substring(url.indexOf('?') + 1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}
// 通过url 获取videoId和文件类型 .m3u8 || .mpd  type="application/x-mpegURL" .mp4
// type="video/mp4" export function videoInfo(url) {   if (!url) {     return
// false;   }   let Suffix = '';   if (url.indexOf('.') > -1) {     Suffix =
// url.substring(url.lastIndexOf('.') + 1);   }
//
//   return (Suffix === 'mp4') ? 'video/mp4' : 'application/x-mpegURL'; } export
// function videoInfo(url) {   if (!url) {     return false;   }   let Suffix =
// '';   if (url.indexOf('.') > -1) {     Suffix =
// url.substring(url.lastIndexOf('.') + 1);   }
//
//   const type = (Suffix === 'mp4') ? 'video/mp4' : 'application/x-mpegURL';
// const videoId = getParams(url, 'v');   return {     type: type,     videoId:
// videoId   }; }

/**
 * 将时间字符串转换成时间戳
 */
export function getTimeStamp(date) {
  const invalidDates = [undefined, null, '', 0];
  const formate = d => new Date(d).getTime();
  if (invalidDates.includes(date)) {
    return null;
  } else {
    switch (typeof date) {
      case 'number':
        return date;
      default:
        return formate(date);
    }
  }
}
/**
 * 分享url处理
 */
export function getFormatUrl(key, value, pathname) {
  return location.origin + pathname + `?${key}=${value}`;
}

// 数组对象去重
export function deduplicate(data, key) {
  if (!data.length) return [];
  const set = new Set();
  return data.reduce((pre, cur) => {
    if (!set.has(cur[key])) {
      pre.push(cur);
      set.add(cur[key]);
    }
    return pre;
  }, []);
}

// 去重
export function removeDuplicate(arr, key = 'id') {
  if (!arr.length) return [];
  var obj = {};
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    if (!obj[arr[i][key]]) {
      newArr.push(arr[i]);
      obj[arr[i][key]] = true;
    }
  }
  return newArr;
}

// 获取时间段 获取间隔天数
export function getDays(dates) {
  var st = dates[0].getDate();
  var et = dates[1].getDate();
  var retArr = [];
  var yyyy = st.getFullYear();
  var mm = st.getMonth();
  var dd = st.getDate();
  while (st.getTime() !== et.getTime()) {
    retArr.push(st.getYMD());
    st = new Date(yyyy, mm, dd++);
  }
  retArr.push(et.getYMD());
  const arr = Array.from(new Set(retArr));
  return arr;
}

// 给Date对象添加getYMD方法，获取字符串形式的年月日
Date.prototype.getYMD = function () {
  return [this.getFullYear(), fz(this.getMonth() + 1), fz(this.getDate())].join('-');
};

// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期
String.prototype.getDate = function () {
  var strArr = this.split('-');
  return new Date(strArr[0], strArr[1] - 1, strArr[2]);
};

// 给月和天，不足两位的前面补0
function fz(num) {
  if (num < 10) {
    num = '0' + num;
  }
  return num;
}

// getDays(['2015-2-9', '2015-3-8']);

export function getFirstDay() {
  const date = new Date();
  date.setDate(1);
  let month = parseInt(date.getMonth() + 1);
  let day = date.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return date.getFullYear() + '-' + month + '-' + day;
}

export function getLastDay() {
  const endDate = new Date();
  let currentMonth = endDate.getMonth();
  const nextMonth = ++currentMonth;
  const nextMonthFirstDay = new Date(endDate.getFullYear(), nextMonth, 1);
  const oneDay = 1000 * 60 * 60 * 24;
  const lastTime = new Date(nextMonthFirstDay - oneDay);
  let endMonth = parseInt(lastTime.getMonth() + 1);
  let endDay = lastTime.getDate();
  if (endMonth < 10) {
    endMonth = '0' + endMonth;
  }
  if (endDay < 10) {
    endDay = '0' + endDay;
  }
  return endDate.getFullYear() + '-' + endMonth + '-' + endDay;
}

function getQuarterSeasonStartMonth(month) {
  const spring = 0; // 春
  const summer = 3; // 夏
  const fall = 6; // 秋
  const winter = 9; // 冬
  // 月份从0-11
  if (month < 3) {
    return spring;
  }

  if (month < 6) {
    return summer;
  }

  if (month < 9) {
    return fall;
  }

  return winter;
}

export function getLastMonthAndDay() {
  const nowDate = new Date();
  let year = nowDate.getFullYear();
  let month = nowDate.getMonth();
  if (month === 0) {
    month = 12;
    year = year - 1;
  }

  month = month < 10 ? '0' + month : month;

  const date = new Date(year, month, 0);
  const startDate = year + '-' + month + '-01';
  const endDate = year + '-' + month + '-' + date.getDate();
  return `${startDate} ~ ${endDate}`;
}

export function getMonthDays(year, month) {
  // 本月第一天 1-31
  var relativeDate = new Date(year, month, 1);
  // 获得当前月份0-11
  var relativeMonth = relativeDate.getMonth();
  // 获得当前年份4位年
  var relativeYear = relativeDate.getFullYear();

  // 当为12月的时候年份需要加1
  // 月份需要更新为0 也就是下一年的第一个月
  if (relativeMonth === 11) {
    relativeYear++;
    relativeMonth = 0;
  } else {
    // 否则只是月份增加,以便求的下一月的第一天
    relativeMonth++;
  }
  // 一天的毫秒数
  var millisecond = 1000 * 60 * 60 * 24;
  // 下月的第一天
  var nextMonthDayOne = new Date(relativeYear, relativeMonth, 1);
  // 返回得到上月的最后一天,也就是本月总天数
  return new Date(nextMonthDayOne.getTime() - millisecond).getDate();
}

export function getCurrentWeek() {
  // 起止日期数组
  var startStop = [];
  // 获取当前时间
  var currentDate = new Date();
  // 返回date是一周中的某一天
  var week = currentDate.getDay();
  // 返回date是一个月中的某一天

  // 一天的毫秒数
  var millisecond = 1000 * 60 * 60 * 24;
  // 减去的天数
  var minusDay = week !== 0 ? week - 1 : 6;
  // 本周 周一
  var monday = new Date(currentDate.getTime() - minusDay * millisecond);
  // 本周 周日
  var sunday = new Date(monday.getTime() + 6 * millisecond);
  // 添加本周时间
  startStop.push(monday); // 本周起始时间
  // 添加本周最后一天时间
  startStop.push(sunday); // 本周终止时间
  // 返回
  return startStop;
}

export function getCurrentSeason() {
  // 起止日期数组
  const startStop = [];
  // 获取当前时间
  const currentDate = new Date();
  // 获得当前月份0-11
  const currentMonth = currentDate.getMonth();
  // 获得当前年份4位年
  const currentYear = currentDate.getFullYear();
  // 获得本季度开始月份
  const quarterSeasonStartMonth = getQuarterSeasonStartMonth(currentMonth);
  // 获得本季度结束月份
  const quarterSeasonEndMonth = quarterSeasonStartMonth + 2;

  // 获得本季度开始的日期
  const quarterSeasonStartDate = new Date(currentYear, quarterSeasonStartMonth, 1);
  // 获得本季度结束的日期
  const quarterSeasonEndDate = new Date(currentYear, quarterSeasonEndMonth, getMonthDays(currentYear, quarterSeasonEndMonth));
  // 加入数组返回
  startStop.push(quarterSeasonStartDate);
  startStop.push(quarterSeasonEndDate);
  // 返回
  return startStop;
}

// 获取当前月份在当年的月份数组
export function getYearMonthArray() {
  const result = [];
  for (var i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    let m = d.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    // 在这里可以自定义输出的日期格式
    result.push(d.getFullYear() + '-' + m);
  }
  return result.reverse();
}

export function getValue(str) {
  if (str.length < 2) return str;
  const index = str.indexOf('-');
  if (index !== -1) return `${str}<i class="el-icon-bottom" style="color: green"></i>`;
  else return `${str}<i class="el-icon-top" style="color: red"></i>`;
}

// 防抖
export function debounce(func, wait, immediate) {
  let res, timeout, context, args;

  const debounced = function () {
    context = this;
    args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var runNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (runNow) res = func.apply(context, args);
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
    return res;
  };

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

// 节流
export function throttle(fn, delay) {
  let previous = 0;
  return function () {
    const args = arguments;
    const now = new Date();
    if (now - previous > delay) {
      fn.apply(this, args);
      previous = now;
    }
  };
}

/**
 * times=>hh:mm:ss
 */
export function formatSecondToHHmmss(time) {
  const fixedTwo = num => {
    if (num >= 0 && num <= 9) {
      num = '0' + num;
    }
    return num;
  };

  time = Number(time);
  if (time < 0) time = 0;
  let str = '';

  const secs = Math.floor(time / 1000);
  const sec = Math.floor(secs % 60);
  const mins = Math.floor(secs / 60);
  const min = Math.floor(mins % 60);
  const hour = Math.floor(mins / 60);

  str = `${fixedTwo(hour)}:${fixedTwo(min)}:${fixedTwo(sec)}`;

  return str;
}

// 字符串转base64
export function strToBase64(str) {
  // 对字符串进行编码
  var encode = encodeURIComponent(str);
  // 对编码的字符串转化base64
  var base64 = btoa(encode);
  return base64;
}

// base64转字符串
export function base64ToStr(base64) {
  // 对base64转编码
  var decode = atob(base64);
  // 编码转字符串
  var str = decodeURIComponent(decode);
  return str;
}

export function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
export function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

// 获取树型数据的深度
export function getMaxFloor(treeData, key = 'children') {
  const floor = 0;
  let max = 0;
  function each(data, floor) {
    data.forEach(e => {
      e.floor = floor;
      if (floor > max) {
        max = floor;
      }
      if (e[key] && e[key].length > 0) {
        each(e[key], floor + 1);
      }
    });
  }
  each(treeData, 1);
  return max;
}

// 筛选有子集的树形数据
export function dataChildrenTree(data = [], type = 'children') {
  const resulrData = [];
  data.forEach(item => {
    if (item[type]) {
      item[type] = dataChildrenTree(item[type], type);
      resulrData.push(item);
    }
  });
  return resulrData;
}

// 筛选树形结构中的某一项
export function searchTree(data = [], children = 'children', searchKey, searchVal) {
  for (let _i = 0; _i < data.length; _i++) {
    if (data[_i][searchKey] === searchVal) {
      return data[_i];
    } else {
      if (data[_i][children] && data[_i][children].length > 0) {
        const res = searchTree(data[_i][children], (children = 'children'), searchKey, searchVal);
        if (res) {
          return res;
        }
      }
    }
  }
  return null;
}

// 限制字符串字节大小
export function getStrByte(str, length) {
  if (!str) {
    return str;
  }
  const reg = /[\u4e00-\u9fa5]/;
  let start = 0;
  let resStr = '';
  str.split('').forEach((s, i) => {
    if (reg.test(s)) {
      start += 2;
    } else {
      start++;
    }
    if (start > length && !resStr) resStr = str.slice(0, i);
  });
  return resStr || str;
}

// DES 加密
export function encryptByDES(message) {
  var keyHex = CryptoJS.enc.Utf8.parse(privateKey);
  var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

// DES 解密
export function decryptByDES(message) {
  var keyHex = CryptoJS.enc.Utf8.parse(privateKey);
  var decrypted = CryptoJS.DES.decrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// 树形结构通过唯一值获取子集
export function findSubsetById(data, value, type) {
  if (!data) return null;
  // 遍历树结构
  for (const item of data) {
    if (item[type] === value) {
      return item;
    }
    if (item.children) {
      const found = findSubsetById(item.children, value, type);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// location.origin 兼容 hash模式
export const locationOrigin = () => {
  if (router?.mode === 'hash') {
    return window.location.origin + '/#';
  }
  return window.location.origin;
};

export function sleep(time = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

// 突出搜索关键字
export function hKeyword(keyword, source) {
  if (!source) return '';
  // 构建正则表达式，匹配动态关键字
  const regex = new RegExp(keyword, 'gi');
  return source.replace(regex, (word, i, str) => {
    return `<span class="highlight-words">${word}</span>`;
  });
}
