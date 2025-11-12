import stylex from '@stylexjs/unplugin';
import rsc from '@vitejs/plugin-rsc/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [
    // @ts-expect-error - no types for this yet
    stylex.vite({
      useCSSLayers: true,
      enableDebugClassNames: false,
    }),
    react(),
    rsc({
      entries: {
        client: 'src/entry.browser.tsx',
        rsc: 'src/entry.rsc.tsx',
        ssr: 'src/entry.ssr.tsx',
      },
    }),
    // @ts-expect-error - no types for this yet
    devtoolsJson(),
  ],
});
