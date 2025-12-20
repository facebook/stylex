/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import stylex from '@stylexjs/unplugin';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(rootDir, 'extension');
const extensions = ['.js', '.jsx'];
const isWatch = Boolean(process.env.ROLLUP_WATCH);

function cssBundle({ fileName = 'assets/style.css' } = {}) {
  let styles = new Map();
  return {
    name: 'css-bundle',
    buildStart() {
      styles = new Map();
    },
    resolveId(source, importer) {
      if (!source.endsWith('.css')) return null;
      const resolved = importer
        ? path.resolve(path.dirname(importer), source)
        : path.resolve(source);
      return { id: resolved, moduleSideEffects: true };
    },
    async load(id) {
      if (!id.endsWith('.css')) return null;
      const css = await fs.readFile(id, 'utf8');
      styles.set(id, css);
      this.addWatchFile(id);
      return 'export default ""';
    },
    generateBundle() {
      if (styles.size === 0) return;
      const combined = Array.from(styles.values()).join('\n');
      this.emitFile({
        type: 'asset',
        fileName,
        source: combined,
      });
    },
  };
}

function copyStatic({ outDir, targets }) {
  const resolved = targets.map(({ src, dest }) => ({
    src: path.resolve(rootDir, src),
    dest: path.resolve(outDir, dest),
  }));
  async function copyAll() {
    await fs.mkdir(outDir, { recursive: true });
    await Promise.all(
      resolved.map(async ({ src, dest }) => {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
      }),
    );
  }
  return {
    name: 'copy-static',
    buildStart() {
      for (const { src } of resolved) {
        this.addWatchFile(src);
      }
    },
    async generateBundle() {
      await copyAll();
    },
  };
}

export default {
  input: {
    devtools: path.resolve(rootDir, 'src/devtools/main.js'),
    panel: path.resolve(rootDir, 'src/panel/main.js'),
  },
  output: {
    dir: outDir,
    format: 'es',
    sourcemap: true,
    entryFileNames: 'assets/[name].js',
    chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name][extname]',
  },
  plugins: [
    cssBundle(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(
          isWatch ? 'development' : 'production',
        ),
      },
    }),
    stylex.rollup({ devMode: 'off', useCSSLayers: true }),
    babel({
      babelHelpers: 'bundled',
      extensions,
      babelrc: true,
      configFile: path.resolve(rootDir, '.babelrc.js'),
      include: [
        path.resolve(rootDir, 'src/**/*'),
        path.resolve(rootDir, 'flow-types/**/*'),
      ],
      exclude: ['**/node_modules/**'],
    }),
    nodeResolve({
      browser: true,
      extensions,
      preferBuiltins: false,
    }),
    json(),
    commonjs({ include: /node_modules/ }),
    copyStatic({
      outDir,
      targets: [
        { src: 'devtools.html', dest: 'devtools.html' },
        { src: 'panel.html', dest: 'panel.html' },
        { src: 'public/manifest.json', dest: 'manifest.json' },
      ],
    }),
  ],
};
