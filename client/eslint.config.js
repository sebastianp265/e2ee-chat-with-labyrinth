import typescriptEslint from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import cypressPlugin from 'eslint-plugin-cypress';

import typescriptEslintParser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'react-hooks': reactHooksPlugin,
            cypress: cypressPlugin,
        },
        ignores: ['dist'],
        languageOptions: {
            parser: typescriptEslintParser,
        },
    },
];
