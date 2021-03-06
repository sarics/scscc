const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const XRegExp = require('xregexp/lib/xregexp');
const XRegExpUnicodeBase = require('xregexp/lib/addons/unicode-base');
const XRegExpUnicodeProperties = require('xregexp/lib/addons/unicode-properties');

XRegExpUnicodeBase(XRegExp);
XRegExpUnicodeProperties(XRegExp);

module.exports = {
  mode: process.env.NODE_ENV,

  context: path.resolve(__dirname, 'src'),

  entry: {
    background: './background/index.js',
    content: './content/index.js',
    popup: './popup/index.js',
    options: './options/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js',
  },

  devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false,

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      UNICODE_ALPHABETIC: JSON.stringify(XRegExp._getUnicodeProperty('Alphabetic').bmp), // eslint-disable-line no-underscore-dangle
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
        },
        {
          from: 'icons',
          to: 'icons',
        },
        {
          from: '*/*.+(html|css)',
        },
      ],
    }),
  ],

  optimization: {
    minimize: false,
  },
};
