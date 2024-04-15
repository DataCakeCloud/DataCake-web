import { getDictType } from '@/api/dictionary';

const clearable = true;
const required = true;
const readonly = true;

export const LIST_FIELDS = [
  {
    label: '字典类型',
    key: 'componentCode',
    type: 'select',
    value: '',
    options: [],
    clearable,
    async source() {
      const data = await (await getDictType()).data;
      this.options = Object.keys(data).map(value => ({ label: data[value], value }));
    }
  },
  {
    label: '创建人',
    key: 'createBy',
    type: 'input',
    value: '',
    clearable
  }
];

export const FIELDS = [
  {
    label: 'ID',
    key: 'id',
    type: 'input',
    value: '',
    required,
    readonly,
    hidden: true
  },
  {
    label: '字典类型',
    key: 'componentCode',
    type: 'select',
    value: '',
    options: [],
    required,
    async source() {
      const data = await (await getDictType()).data;
      this.options = Object.keys(data).map(value => ({ label: data[value], value }));
    }
  },
  {
    label: '中文名称',
    key: 'chineseName',
    type: 'input',
    value: '',
    placeholder: '请填写中文名称',
    required
  },
  {
    label: '英文名称',
    key: 'englishName',
    type: 'input',
    value: '',
    placeholder: '只能填写小写英文与下划线',
    required
  },
  {
    label: '描述',
    type: 'textarea',
    key: 'description',
    value: ''
  }
];
