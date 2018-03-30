const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const XRegExp = require('xregexp/lib/xregexp');
const XRegExpUnicodeBase = require('xregexp/lib/addons/unicode-base');
const XRegExpUnicodeProperties = require('xregexp/lib/addons/unicode-properties');

XRegExpUnicodeBase(XRegExp);
XRegExpUnicodeProperties(XRegExp);

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: process.env.NODE_ENV,

  devtool: isProduction ? false : 'cheap-module-source-map',

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

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
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
    new CopyWebpackPlugin([
      {
        from: 'manifest.json',
      },
      {
        from: 'icons',
        to: 'icons',
      },
      {
        from: '*/*.html',
      },
    ]),
  ],
};
