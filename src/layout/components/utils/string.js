/**
 * 字符串相关函数
 */

/**
 * 在状态数组中找到某个状态对应的描述
 * @param {*} optionList 状态列表，每项包含(value和label)
 * @param {*} value 具体值
 * @return 返回当前值对应的描述
 */
function mappingLabel(optionList, value) {
  let result = '';
  const filteredOptions = optionList.filter(item => item.value == value);
  if (filteredOptions && filteredOptions.length > 0) {
    result = filteredOptions[0].label;
  }
  return result;
}

function trimLeft(val) {
  return val && val.replace(/(^\s*)/g, '');
}

function trimRight(val) {
  return val && val.replace(/(\s*$)/g, '');
}

function trim(val) {
  return val && val.replace(/(^\s*) | (\s*$)/g, '');
}

function trimAll(val) {
  return val && val.replace(/\s*/g, '');
}

function isEmpty(val) {
  return val === null || val === undefined || val === '';
}

function formatNumber(val, fractionalPartLength) {
  if (!val) {
    return '';
  }

  let fpLength = 0;
  if (fractionalPartLength && fractionalPartLength > 0) {
    fpLength = fractionalPartLength;
  }

  let strVal = '' + val;
  const indexOfDot = strVal.indexOf('.');
  if (fpLength) {
    if (indexOfDot < 0) {
      return val;
    } else {
      strVal = strVal.substring(0, indexOfDot + fpLength + 1);
      if (indexOfDot == 0) {
        return '0' + strVal;
      } else {
        return strVal;
      }
    }
  } else {
    if (indexOfDot < 0) {
      return val;
    } else {
      strVal = strVal.substring(0, indexOfDot);
      if (indexOfDot == 0) {
        return '0';
      } else {
        return strVal;
      }
    }
  }
}

function parseNumber(value) {
  if (value == null || isNaN(value)) {
    return;
  }
  return parseFloat(value);
}

export default {
  mappingLabel,
  trimLeft,
  trimRight,
  trim,
  trimAll,
  isEmpty,
  formatNumber,
  parseNumber
};
