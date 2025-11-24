import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'waku/config';

const stylexPlugin = stylex.vite({
  debug: process.env.NODE_ENV === 'development',
  enableDebugClassNames: false,
  enableDevClassNames: false,
  useCSSLayers: true,
  devMode: 'css-only',
  devPersistToDisk: true,
  runtimeInjection: false,
});

export default defineConfig({
  vite: {
    plugins: [
      // @ts-ignore
      stylexPlugin,
      // @ts-ignore
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
  },
});
