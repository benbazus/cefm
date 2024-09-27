// module.exports = {
//   root: true,
//   env: {
//     browser: true,
//     es2020: true,
//     node: true,
//   },
//   extends: [
//     'airbnb',
//     'airbnb/hooks',
//     'airbnb-typescript',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:react-hooks/recommended',
//     'plugin:prettier/recommended',
//   ],
//   ignorePatterns: [
//     'dist',
//     '.eslintrc.cjs',
//     'src/components/ui',
//     'tailwind.config.js',
//   ],
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 2020,
//     sourceType: 'module',
//     project: './tsconfig.json',
//   },
//   plugins: ['react-refresh', '@typescript-eslint', 'prettier'],
//   rules: {
//     'react-refresh/only-export-components': [
//       'warn',
//       { allowConstantExport: true },
//     ],
//     'react/react-in-jsx-scope': 'off', // Not needed in React 17+
//     'react/prop-types': 'off', // We're using TypeScript, so prop-types aren't necessary
//     'react/require-default-props': 'off', // Not needed with TypeScript
//     'import/prefer-default-export': 'off', // Allow named exports
//     'import/no-extraneous-dependencies': [
//       'error',
//       {
//         devDependencies: [
//           '**/*.test.ts',
//           '**/*.test.tsx',
//           '**/*.spec.ts',
//           '**/*.spec.tsx',
//           'vite.config.ts',
//         ],
//       },
//     ],
//     '@typescript-eslint/explicit-function-return-type': 'off', // Too restrictive
//     '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//     'no-console': ['warn', { allow: ['warn', 'error'] }],
//     'prettier/prettier': ['error', {}, { usePrettierrc: true }],
//   },
//   settings: {
//     'import/resolver': {
//       typescript: {},
//     },
//   },
// };

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'src/components/ui',
    'tailwind.config.js',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
