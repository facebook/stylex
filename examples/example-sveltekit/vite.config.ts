import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    sveltekit(),
    // @ts-expect-error - ignore for now
    {
      ...stylex.vite({
        useCSSLayers: true,
        enableFontSizePxToRem: true,
      }),
      enforce: undefined,
    },
  ],
});
