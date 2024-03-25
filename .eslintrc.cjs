/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'standard',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-standard',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  rules: {
    semi: ['error', 'always'],
    'vue/multi-word-component-names': 'off'
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
};
