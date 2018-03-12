const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const XRegExp = require('xregexp/lib/xregexp');
const XRegExpUnicodeBase = require('xregexp/lib/addons/unicode-base');
const XRegExpUnicodeProperties = require('xregexp/lib/addons/unicode-properties');

XRegExpUnicodeBase(XRegExp);
XRegExpUnicodeProperties(XRegExp);

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
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
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.DefinePlugin({
      UNICODE_ALPHABETIC: JSON.stringify(XRegExp._getUnicodeProperty('Alphabetic').bmp), // eslint-disable-line no-underscore-dangle
    }),
    isProduction && new webpack.optimize.ModuleConcatenationPlugin(),
    isProduction && new UglifyJsPlugin(),
    new CopyWebpackPlugin([
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
    ]),
  ].filter(Boolean),
};
