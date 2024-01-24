const path = require('path');
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        genConditionalClasses: true,
        treeshakeCompensation: true,
        aliases: {
          '@/*': [path.join(__dirname, '*')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: path.join(__dirname, '../..'),
        },
      },
    ],
  ],
};
