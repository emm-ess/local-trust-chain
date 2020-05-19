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
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
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
        'object-curly-spacing': ['off'],
        'object-property-newline': ['error', {
            allowAllPropertiesOnSameLine: true,
        }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/array-type': 'off',
        // arghs those python developer
        'camelcase': 'off',
        '@typescript-eslint/camelcase': 'off',
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
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
};
