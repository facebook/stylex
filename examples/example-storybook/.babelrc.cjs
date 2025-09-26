const path = require('path')

module.exports = {
  presets: [
    ['@babel/preset-react', {runtime: 'automatic'}],
    '@babel/preset-typescript'
  ],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        debug: process.env.NODE_ENV === 'development',
        unstable_moduleResolution: {
          type: 'commonJS'
        }
      }
    ]
  ]
}
