module.exports = {
  assumptions: {
    iterableIsArray: true,
  },
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['@babel/plugin-transform-typeof-symbol'],
        targets: 'defaults',
        modules:
          process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'cjs'
            ? 'commonjs'
            : false,
      },
    ],
    '@babel/preset-flow',
  ],
  plugins: [['babel-plugin-syntax-hermes-parser', { flow: 'detect' }]],
};
