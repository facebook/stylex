import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error - ignore for now
  plugins: [stylex.vite(), react({})],
});
