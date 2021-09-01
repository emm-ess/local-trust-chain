module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'standard',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',

        // code-smell-detection / code-quality
        'plugin:unicorn/recommended',
        'plugin:sonarjs/recommended',

        // imports & import-sorting
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',

        // misc
        'plugin:eslint-comments/recommended',
        'plugin:json/recommended',
        'plugin:compat/recommended',
    ],
    rules: {
        'indent': ['error', 4, {
            // 0 would be nicer but somehow eslint is not working with that
            SwitchCase: 1,
        }],
        'brace-style': ['error', 'stroustrup', {
            allowSingleLine: true,
        }],
        'space-before-blocks': ['error', {
            functions: 'never',
            keywords: 'always',
            classes: 'always',
        }],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always',
        }],
        'no-multiple-empty-lines': ['error', {
            max: 3,
            maxEOF: 3, // due to vue sfc
            maxBOF: 0,
        }],
        'no-multi-spaces': ['error', {
            exceptions: {
                VariableDeclarator: true,
                ImportDeclaration: true,
            },
        }],
        'comma-dangle': ['error', 'always-multiline'],
        'key-spacing': ['error', {
            mode: 'minimum',
        }],
        'space-in-brackets': ['off'],
        'object-property-newline': ['error', {
            allowAllPropertiesOnSameLine: true,
        }],
        semi: [
            'error',
            'never',
            {
                beforeStatementContinuationChars: 'always',
            },
        ],
        'multiline-ternary': ['warn', 'always'],
        'operator-linebreak': ['warn', 'before'],
        quotes: ['error', 'single'],
        'quote-props': ['error', 'as-needed'],
        'object-curly-spacing': ['error', 'never'],
        'arrow-parens': ['error', 'always'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/member-delimiter-style': ['error', {
            multiline: {delimiter: 'none'},
            singleline: {delimiter: 'comma'},
        }],
        '@typescript-eslint/no-inferrable-types': ['error', {
            ignoreParameters: true,
        }],
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
            },
        ],
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

        // import sorting
        'sort-import': 'off',
        'import/order': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
    },
};
