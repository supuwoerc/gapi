import globals from 'globals'

import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tailwindcss from 'eslint-plugin-tailwindcss'
import { defineConfig, globalIgnores } from 'eslint/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  globalIgnores(['dist']),
  ...tailwindcss.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: path.join(__dirname, 'src/style/index.css'),
      },
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'tailwindcss/enforces-shorthand': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'tailwindcss/classnames-order': 'off', // prettier do it
      'tailwindcss/no-custom-classname': 'off',
    },
  },
])
