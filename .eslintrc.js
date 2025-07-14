module.exports = {
  env: {
    browser: true
  },
  parser: '@typescript-eslint/parser', // TypeScript のパーサを指定
  parserOptions: {
    ecmaVersion: 2020,  // 最新の ECMAScript 機能に対応
    sourceType: 'module', // モジュール（import/export）を使用
  },
  extends: [
    'eslint:recommended', // ESLint の推奨ルール
    'plugin:@typescript-eslint/recommended', // TypeScript 用の推奨ルール
    'plugin:prettier/recommended', // Prettier と統合
  ],
  plugins: ['@typescript-eslint', 'prettier'], // プラグインを追加
  rules: {
    'prettier/prettier': 'error', // Prettier のエラーを ESLint で表示
  },
};
