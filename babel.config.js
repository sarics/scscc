module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          browsers: 'Firefox >= 60',
        },
        modules: false,
      },
    ],
  ],
};
