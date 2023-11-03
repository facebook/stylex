const path = require('path');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        stylexSheetName: '<>',
        genConditionalClasses: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: path.join(__dirname, '../..'),
        },
      },
    ],
  ],
};
