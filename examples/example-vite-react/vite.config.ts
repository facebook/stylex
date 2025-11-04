import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error - Something is broken. Will fix later.
import stylex from '@stylexjs/unplugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [stylex.vite(), react({})],
});
