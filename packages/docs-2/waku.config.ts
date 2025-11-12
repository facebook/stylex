import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'waku/config';
import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config.js';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const __dirname = path.resolve(import.meta.url);

export default defineConfig({
  vite: {
    plugins: [
      // @ts-ignore
      stylex.vite({
        aliases: {
          // NOT WORKING... WHY?
          '@/*': [path.join(__dirname, 'src/*')],
        },
        debug: process.env.NODE_ENV === 'development',
        enableDebugClassNames: false,
        enableDevClassNames: false,
        useCSSLayers: false,
        devMode: 'css-only',
        devPersistToDisk: true,
        runtimeInjection: false,
      }),
      // @ts-ignore
      react({
        // babel: {
        //   plugins: ['babel-plugin-react-compiler'],
        // },
      }),
      // @ts-ignore
      mdx(MdxConfig),
      // @ts-ignore
      tsconfigPaths(),
    ],
  },
});
