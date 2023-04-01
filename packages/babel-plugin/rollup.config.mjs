import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const config = {
  input: './src/index.ts',
  output: {
    file: './lib/index.js',
    format: 'cjs',
  },
  plugins: [
    babel({ babelHelpers: 'bundled', extensions, include: ['./src/**/*'] }),
    nodeResolve({
      extensions,
      resolveOnly: process.env['HASTE']
        ? []
        : [
            '@stylexjs/shared',
            '@stylexjs/shared/**/*',
            '@stylexjs/stylex',
            '@stylexjs/stylex/**/*',
          ],
    }),
    commonjs(),
    json(),
  ],
};

export default config;
