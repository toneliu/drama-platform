export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue({ file }) {
        // Vant 组件用 375 设计稿，自己的代码用 750
        return file && file.includes('node_modules/vant') ? 37.5 : 75
      },
      propList: ['*'],
      selectorBlackList: ['.norem'],
    },
  },
}
