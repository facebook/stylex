function makeHaste() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.get('source').isStringLiteral()) {
          const oldValue = path.get('source').node.value;
          path.get('source').node.value = oldValue.slice(
            oldValue.lastIndexOf('/') + 1
          );
        }
      },
      ExportDefaultDeclaration(path) {
        path.remove();
      },
    },
  };
}

const presets = process.env['HASTE']
  ? []
  : [
      [
        '@babel/preset-env',
        {
          exclude: ['@babel/plugin-transform-typeof-symbol'],
          targets: 'defaults',
        },
      ],
      '@babel/preset-flow',
      '@babel/preset-react',
    ];

const plugins = process.env['HASTE']
  ? [makeHaste, '@babel/plugin-syntax-flow', '@babel/plugin-syntax-jsx']
  : [];

module.exports = {
  assumptions: {
    iterableIsArray: true,
  },
  presets,
  plugins,
};
