import { defineConfig } from 'vite';
import { redwood } from 'rwsdk/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'worker' },
    }),
    redwood(),
    stylex.vite({
      // Keep transforms on in dev, but only expose the CSS endpoint (no runtime/HTML injection)
      devMode: 'css-only',
      devPersistToDisk: true,
      dev: true,
      runtimeInjection: false,
    }),
  ],
});
