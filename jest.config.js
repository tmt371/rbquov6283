// jest.config.js

export default {
  // 告訴 Jest 在執行測試前，使用 babel-jest 來轉譯 .js 檔案
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // 測試環境設為 jsdom，讓我們可以使用瀏覽器環境中的物件 (如 window)
  testEnvironment: 'jsdom',

  // 測試檔案的匹配模式
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // 將遠端的 uuid 模組 URL 映射到本地安裝的 npm 套件，以解決 Node.js 環境下的導入問題
  moduleNameMapper: {
    'https://cdn.jsdelivr.net/npm/uuid@9.0.1/dist/esm-browser/index.js': 'uuid',
  },
};