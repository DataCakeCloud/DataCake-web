import Vue from 'vue';
import VueI18n from 'vue-i18n';
import elementEnLocale from 'element-ui/lib/locale/lang/en'; // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'; // element-ui lang
import Cookies from 'js-cookie';
import { en, zh } from './languages';
const { crc32 } = require('crc');
import lang_zh from './zh/translation.json';
import lang_en from './en/translation.json';

Vue.use(VueI18n);

const messages = {
  en: {
    ...elementEnLocale,
    ...en,
    ...lang_en
  },
  zh: {
    ...elementZhLocale,
    ...zh,
    ...lang_zh
  }
};

const i18n = new VueI18n({
  locale: Cookies.get('language') || 'zh', // set locale
  messages // set locale messages
});

export function lang(key) {
  const hashKey = `k${crc32(key).toString(16)}`;
  let words = i18n.t(hashKey);
  if (words === hashKey) {
    words = key;
  }
  return words;
}

Vue.prototype.$lang = lang;

export default i18n;
