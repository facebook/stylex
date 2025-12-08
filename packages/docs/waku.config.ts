import { defineConfig } from 'waku/config';
import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config.js';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import stylex from '@stylexjs/unplugin';
// import lightningcss from 'lightningcss';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

export default defineConfig({
  vite: {
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
        lightningcssOptions: {
          minify: process.env.NODE_ENV !== 'development',

          targets: browserslistToTargets(browserslist('>= 5%')),
        },
      }),
      // @ts-ignore
      tailwindcss(),
      // @ts-ignore
      mdx(MdxConfig),
      // @ts-ignore
      tsconfigPaths(),
    ],
  },
});
