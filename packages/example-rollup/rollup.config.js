import { createBabelInputPluginFactory } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import stylexPlugin from 'rollup-plugin-stylex';

const stylex = stylexPlugin({ fileName: 'atomic.css' });

export default {
  input: './index.js',
  output: {
    file: './build/main.js',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    commonjs(),
    createBabelInputPluginFactory(stylex.babelHook)({
      babelHelpers: 'bundled',
    }),
    stylex,
  ],
};
