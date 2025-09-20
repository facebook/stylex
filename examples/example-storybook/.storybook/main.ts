/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'node:path';

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  typescript: {
    /* infer property docs from typescript types  */
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        /* does property have documentation? */
        const hasDoc = prop.description !== '';

        /* is property defined in external dependency package? */
        const isExternal =
          prop.parent && /node_modules/.test(prop.parent.fileName);

        return hasDoc && !isExternal;
      },
    },
  },

  core: {
    /* use builder-vite for fast startup times and near-instant HMR */
    builder: {
      name: '@storybook/builder-vite',

      options: {
        /* use a different config for static build for self-contained setup to
        include external deps (like react) into the served package */
        viteConfigPath: './vite-storybook.config.ts',
      },
    },
    disableTelemetry: true,
  },
};

export default config;
