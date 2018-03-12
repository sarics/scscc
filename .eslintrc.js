module.exports = {
  extends: 'airbnb',
  env: {
    'browser': true,
    'webextensions': true,
  },
  globals: {
    UNICODE_ALPHABETIC: false,
  },
  settings: {
    react: {
      pragma: 'h',
    },
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'max-len': 'off',
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],

    'react/no-unknown-property': 'off',
    'react/prop-types': 'off',

    'jsx-a11y/label-has-for': 'off',
  },
};
