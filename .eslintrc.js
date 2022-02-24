module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        tsconfigRootDir: __dirname,
        ecmaVersion: 2017,
        sourceType: 'module',
        ecmaFeatures: {
            impliedStrict: true
        }
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                allowExpressions: true
            }
        ],
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/indent': ['off', 4, { SwitchCase: 1 }],
        'no-prototype-builtins': 'off'
    }
};
