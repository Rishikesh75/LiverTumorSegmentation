import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@application/*', '@infrastructure/*', '@presentation/*', '@app/*'],
              message:
                'Domain layer must not depend on application, infrastructure, presentation, or app.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@infrastructure/*', '@presentation/*', '@app/*'],
              message:
                'Application layer must not depend on infrastructure, presentation, or app.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@infrastructure/*'],
              message:
                'Presentation must use repositories via AppServices context, not import infrastructure directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/infrastructure/mocks/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'src/presentation/context/**/*.{ts,tsx}',
      '**/*Context.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
