/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'waku/config';
import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config.js';
import tsconfigPaths from 'vite-tsconfig-paths';
import stylex from '@stylexjs/unplugin';
// import lightningcss from 'lightningcss';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Inline playground sources/types so Monaco and the playground bundler can resolve them.
const playgroundDefines = (() => {
  const stylexFilename = require.resolve('@stylexjs/stylex');
  const stylexSource = fs.readFileSync(stylexFilename, 'utf8');
  const stylexDir = path.dirname(stylexFilename);
  const stylexTypes: Record<string, string> = {};

  for (const file of fs.readdirSync(stylexDir, { recursive: true })) {
    const fileName = String(file);
    if (!fileName.endsWith('.d.ts')) {
      continue;
    }
    const normalizedFile = fileName.split(path.sep).join('/');
    stylexTypes[`file:///node_modules/@stylexjs/stylex/${normalizedFile}`] =
      fs.readFileSync(path.join(stylexDir, fileName), 'utf8');
  }

  const reactTypesDir = path.dirname(
    require.resolve('@types/react/package.json'),
  );
  const reactTypes = fs.readFileSync(
    path.join(reactTypesDir, 'index.d.ts'),
    'utf8',
  );
  const reactJsxRuntimeTypes = fs.readFileSync(
    path.join(reactTypesDir, 'jsx-runtime.d.ts'),
    'utf8',
  );

  return {
    stylexSource,
    stylexTypes,
    reactTypes,
    reactJsxRuntimeTypes,
  };
})();

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        // react-refresh/babel depends on Node.js built-in crypto module
        crypto: path.join(__dirname, 'src/crypto-shim.ts'),
      },
    },
    optimizeDeps: {
      include: [
        '@stylexjs/babel-plugin',
        '@babel/standalone',
        'use-query-params',
        'serialize-query-params',
        'path-browserify',
        'lz-string',
        'react-refresh/babel',
      ],
    },
    ssr: {
      // Force these CJS modules to be bundled during SSR so they work properly
      noExternal: ['use-query-params', 'serialize-query-params'],
      optimizeDeps: {
        include: ['use-query-params', 'serialize-query-params'],
      },
    },
    define: {
      STYLEX_SOURCE: JSON.stringify(playgroundDefines.stylexSource),
      STYLEX_TYPES: JSON.stringify(playgroundDefines.stylexTypes),
      REACT_TYPES: JSON.stringify(playgroundDefines.reactTypes),
      REACT_JSX_RUNTIME_TYPES: JSON.stringify(
        playgroundDefines.reactJsxRuntimeTypes,
      ),
      ESBUILD_WASM_VERSION: JSON.stringify(
        require('esbuild-wasm/package.json').version,
      ),
    },
    plugins: [
      // @ts-ignore
      stylex.vite({
        debug: process.env.NODE_ENV === 'development',
        treeshakeCompensation: true,
        enableDebugClassNames: false,
        enableDevClassNames: false,
        useCSSLayers: true,
        devMode: 'css-only',
        devPersistToDisk: true,
        runtimeInjection: false,
        aliases: {
          '@/*': [path.join(__dirname, 'src/*')],
        },
        lightningcssOptions: {
          minify: process.env.NODE_ENV !== 'development',
          targets: browserslistToTargets(browserslist('>= 5%')),
        },
      }),
      // @ts-ignore
      mdx(MdxConfig),
      // @ts-ignore
      tsconfigPaths(),
    ],
  },
});
