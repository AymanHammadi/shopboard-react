import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.next/**',
      'next-env.d.ts',
      'node_modules/**',
      '.claude/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression',
          message:
            'Validate or narrow the value instead of asserting its type.',
        },
        {
          selector: 'TSTypeAssertion',
          message:
            'Validate or narrow the value instead of asserting its type.',
        },
        {
          selector: 'UnaryExpression[operator="!"]',
          message: 'Use an explicit boolean comparison.',
        },
      ],
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'axios', message: 'Use shared/api/client.ts.' }] },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use shared/api/client.ts.' },
        {
          name: 'localStorage',
          message: 'Use shared/storage.ts from a feature state file.',
        },
      ],
    },
  },
  {
    files: ['src/shared/api/client.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/shared/storage.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/modules/**/*.logic.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/*.state',
                '**/shared/storage',
                'react',
                'react-dom',
                'react-router-dom',
              ],
              message:
                'Business rules must be pure. Keep React, storage and state in their own files.',
            },
          ],
        },
      ],
    },
  },
);
