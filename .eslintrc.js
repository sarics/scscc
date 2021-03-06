module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    webextensions: true,
  },
  globals: {
    UNICODE_ALPHABETIC: false,
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'max-len': 'off',
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
  },
};
