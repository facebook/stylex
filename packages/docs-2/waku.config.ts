import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'waku/config';
import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config.js';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [
      // @ts-ignore
      stylex.vite({
        debug: process.env.NODE_ENV === 'development',
        enableDebugClassNames: false,
        enableDevClassNames: false,
        useCSSLayers: true,
        devMode: 'css-only',
        devPersistToDisk: true,
        runtimeInjection: false,
      }),
      // @ts-ignore
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      mdx(MdxConfig),
      tsconfigPaths(),
    ],
  },
});
