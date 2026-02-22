/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import stylex from '@stylexjs/unplugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entrypoint = path.resolve(__dirname, '..', 'src', 'main.jsx');
const outdir = path.resolve(__dirname, '..', 'dist');
const htmlTemplate = path.resolve(__dirname, '..', 'src', 'index.html');
const htmlOutput = path.resolve(outdir, 'index.html');

async function build() {
  const result = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    target: 'browser',
    minify: true,
    metafile: true,
    plugins: [
      stylex.esbuild({
        useCSSLayers: true,
        importSources: ['@stylexjs/stylex'],
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: path.resolve(__dirname, '../../..'),
        },
      }),
    ],
  });

  if (!result.success) {
    console.error('Bun build failed.');
    for (const message of result.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  try {
    await Bun.write(htmlOutput, await Bun.file(htmlTemplate).text());
  } catch (error) {
    console.error('Failed to write dist/index.html.');
    console.error(error);
    process.exit(1);
  }
}

build();
