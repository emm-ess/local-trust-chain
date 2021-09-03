module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
    },
    plugins: [
        'simple-import-sort',
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'standard',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:promise/recommended',

        // code-smell-detection / code-quality
        'plugin:unicorn/recommended',
        'plugin:sonarjs/recommended',

        // imports & import-sorting
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',

        // node
        'plugin:node/recommended',

        // misc
        'plugin:eslint-comments/recommended',
    ],
    rules: {
        indent: [
            'error',
            4,
            {
                // 0 would be nicer but somehow eslint is not working with that
                SwitchCase: 1,
            },
        ],
        'brace-style': [
            'error',
            'stroustrup',
            {
                allowSingleLine: true,
            },
        ],
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            },
        ],
        'no-multi-spaces': [
            'error',
            {
                exceptions: {
                    VariableDeclarator: true,
                    ImportDeclaration: true,
                },
            },
        ],
        'comma-dangle': ['error', 'always-multiline'],
        'key-spacing': [
            'error',
            {
                mode: 'minimum',
            },
        ],
        'object-property-newline': [
            'error',
            {
                allowAllPropertiesOnSameLine: true,
            },
        ],
        semi: [
            'error',
            'never',
            {
                beforeStatementContinuationChars: 'always',
            },
        ],
        'no-use-before-define': 0,
        'no-unused-vars': 0,
        'no-undef': 0,
        'multiline-ternary': ['warn', 'always'],
        'operator-linebreak': ['warn', 'before'],
        quotes: ['error', 'single'],
        'quote-props': ['error', 'as-needed'],
        'object-curly-spacing': ['error', 'never'],
        'arrow-parens': ['error', 'always'],
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/array-type': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-member-accessibility': 0,
        '@typescript-eslint/no-use-before-define': 0,
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
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 0,

        // node
        'node/no-unsupported-features/es-syntax': 0,
        'node/no-missing-import': ['error', {
            'tryExtensions': ['.js', '.json', '.ts'],
        }],

        // import sorting
        'sort-import': 0,
        'import/order': 0,
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',

        'unicorn/prefer-node-protocol': 0,
    },
};
