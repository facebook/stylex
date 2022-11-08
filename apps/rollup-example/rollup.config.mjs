import stylexPlugin from '@stylexjs/rollup-plugin';

const config = {
  input: './index.js',
  output: {
    file: './.build/bundle.js',
    format: 'es',
  },
  plugins: [stylexPlugin({ fileName: 'stylex.css' })],
};

export default config;
