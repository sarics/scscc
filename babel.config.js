module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          browsers: 'Firefox >= 52',
        },
        modules: false,
      },
    ],
  ],
};
