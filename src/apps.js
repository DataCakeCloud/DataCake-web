export const APP_PREFIX = '';

// const apps = {
//   development: [
//     {
//       name: 'lakecat',
//       entry: 'http://localhost:3003/'
//     }
//   ],
//   dev: [
//     {
//       name: 'lakecat',
//       entry: 'https://meta-data-dev.ushareit.org/'
//     }
//   ],
//   test: [
//     {
//       name: 'lakecat',
//       entry: 'https://meta-data-test.ushareit.org/'
//     }
//   ],
//   prod: [
//     {
//       name: 'lakecat',
//       entry: 'https://meta-data.ushareit.org/'
//     }
//   ],
//   'cloud-aws-development': [
//     {
//       name: 'lakecat',
//       entry: 'http://localhost:3003/'
//     }
//   ],
//   'cloud-aws-dev': [
//     {
//       name: 'lakecat',
//       entry: 'https://metadata-dev.datacake.cloud/'
//     }
//   ],
//   'cloud-aws-test': [
//     {
//       name: 'lakecat',
//       entry: 'https://metadata-test.datacake.cloud/'
//     }
//   ],
//   'cloud-aws-production': [
//     {
//       name: 'lakecat',
//       entry: 'https://metadata.datacake.cloud/'
//     }
//   ]
// };
const apps = {
  [process.env.VUE_APP_ENV]: [
    {
      name: process.env.VUE_APP_QIANKUN_NAME,
      entry: process.env.VUE_APP_LAKECAT_FRONTEND_ORIGIN
    }
  ]
};
export default apps[process.env.VUE_APP_ENV];
