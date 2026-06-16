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
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import stylex from '@stylexjs/unplugin';
import { Features } from 'lightningcss';

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
  // The StyleX unplugin merges its CSS into the `.css` asset and may rename it
  // (e.g. `style.css` -> `style2.css`) to avoid collisions. It rewrites
  // references inside bundled JS, but these HTML files are copied verbatim and
  // are not part of the bundle, so their `<link href>` must be rewritten to the
  // actual emitted CSS filename — otherwise the panel loads with no styles.
  async function copyAll(bundle) {
    const cssAsset = bundle
      ? Object.values(bundle).find(
          (item) =>
            item != null &&
            item.type === 'asset' &&
            typeof item.fileName === 'string' &&
            item.fileName.endsWith('.css'),
        )
      : null;
    const cssHref = cssAsset ? `./${cssAsset.fileName}` : null;

    await fs.mkdir(outDir, { recursive: true });
    await Promise.all(
      resolved.map(async ({ src, dest }) => {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        if (cssHref != null && dest.endsWith('.html')) {
          const html = await fs.readFile(src, 'utf8');
          const rewritten = html.replace(
            /(<link\b[^>]*\bhref=")[^"]*\.css(")/g,
            `$1${cssHref}$2`,
          );
          await fs.writeFile(dest, rewritten);
          return;
        }
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
    async generateBundle(_opts, bundle) {
      await copyAll(bundle);
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
    stylex.rollup({
      devMode: 'off',
      useCSSLayers: true,
      lightningcssOptions: {
        targets: browserslistToTargets(browserslist('>= 2%')),
        exclude: Features.LightDark,
      },
    }),
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
