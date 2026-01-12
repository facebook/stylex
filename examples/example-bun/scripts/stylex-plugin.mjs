/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import { mkdir } from 'fs/promises';
import stylex from '@stylexjs/unplugin';

const rawPlugin = stylex.raw({
  dev: true,
  useCSSLayers: true,
  importSources: ['@stylexjs/stylex'],
  runtimeInjection: false,
  unstable_moduleResolution: {
    type: 'commonJS',
    rootDir: process.cwd(),
  },
});

const STYLEX_MARKER = '--stylex-injection';
const STYLEX_DEV_CSS_PATH = path.join(process.cwd(), 'dist', 'stylex.dev.css');
let lastCssOutput = null;

const writeStylexCss = async () => {
  const css = rawPlugin.__stylexCollectCss?.() || '';
  const next = css
    ? `:root { ${STYLEX_MARKER}: 0; }\n${css}`
    : `:root { ${STYLEX_MARKER}: 0; }`;
  if (next === lastCssOutput) return;
  lastCssOutput = next;
  await mkdir(path.dirname(STYLEX_DEV_CSS_PATH), { recursive: true });
  await Bun.write(STYLEX_DEV_CSS_PATH, next);
};

const loaders = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
};

export default {
  name: '@stylexjs/unplugin-bun',
  setup(build) {
    build.onStart(() => {
      rawPlugin.__stylexResetState?.();
      rawPlugin.buildStart?.();
      writeStylexCss();
    });

    build.onLoad({ filter: /\.[cm]?[jt]sx?(\?|$)/ }, async (args) => {
      if (args.path.includes('node_modules')) return;
      const code = await Bun.file(args.path).text();
      const result = await rawPlugin.transform?.(code, args.path);

      if (!result || !result.code) {
        return {
          contents: code,
          loader: loaders[path.extname(args.path)] || 'js',
        };
      }

      await writeStylexCss();
      return {
        contents: result.code,
        loader: loaders[path.extname(args.path)] || 'js',
      };
    });

    build.onEnd(() => {
      rawPlugin.buildEnd?.();
    });
  },
};
