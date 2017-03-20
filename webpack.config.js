const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
      {
        test: /\.(?!js).+$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'manifest.json',
      },
      {
        from: 'icons',
        to: 'icons',
      },
    ]),
  ],
};
