/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import stylexPlugin from '@stylexjs/esbuild-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR_NAME = 'public/dist';
const OUTFILE = `${BUILD_DIR_NAME}/bundle.js`;
const STYLEX_BUNDLE_PATH = path.resolve(
  __dirname,
  '..',
  `${BUILD_DIR_NAME}/stylex.css`,
);

const isWatch = ['-w', '--watch'].some(arg => process.argv.includes(arg));
const isServe = ['--serve', '-s'].some(arg => process.argv.includes(arg));
const PORT = process.argv.includes('-p') ? process.argv[process.argv.indexOf('-p') + 1] : 5173;

const buildOptions = {
  entryPoints: [path.resolve(__dirname, '..', 'src/App.jsx')],
  bundle: true,
  outfile: OUTFILE,
  minify: true,
  plugins: [
    // See all options in the babel plugin configuration docs:
    // https://stylexjs.com/docs/api/configuration/babel-plugin/
    stylexPlugin({
      useCSSLayers: true,
      generatedCSSFileName: STYLEX_BUNDLE_PATH,
      stylexImports: ['@stylexjs/stylex'],
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: path.resolve(__dirname, '../../..'),
      },
    }),
  ],
}

async function serve() {
  const ctx = await esbuild.context(buildOptions);
  const { hosts, port } = await ctx.serve({
    port: PORT,
    servedir: path.resolve(__dirname, '..', 'public'),
  });
  console.log(`Preview: http://${hosts[0]}:${port}`);
}

async function watch() {
  const ctx = await esbuild.context({
    ...buildOptions,
    define: {
      ...(buildOptions.define || {}),
      'window.IS_DEV': 'true',
    }
  });
  await ctx.watch();
  const { hosts, port } = await ctx.serve({
    port: PORT,
    servedir: path.resolve(__dirname, '..', 'public'),
  });
  console.log(`Dev server: http://${hosts[0]}:${port}`);
  console.log('Watching for changes...');
}

if (isServe) {
  serve();
} else if (isWatch) {
  watch();
} else {
  esbuild
    .build(buildOptions)
    .catch(() => process.exit(1));
}
