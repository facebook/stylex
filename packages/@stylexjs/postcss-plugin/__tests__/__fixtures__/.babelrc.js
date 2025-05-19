module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    ['@stylexjs/babel-plugin', { dev: false, runtimeInjection: false }],
  ],
};
