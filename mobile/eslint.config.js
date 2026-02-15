const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'supabase/functions/*', 'web/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
