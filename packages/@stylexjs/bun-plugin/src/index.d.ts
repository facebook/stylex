/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PluginItem } from '@babel/core';
import type { Options } from '@stylexjs/babel-plugin';
import type { TransformOptions } from 'lightningcss';

export type PluginOptions = {
  dev?: boolean;
  unstable_moduleResolution?: {
    type: 'commonJS' | 'haste';
    rootDir?: string;
    themeFileExtension?: string;
  };
  fileName?: string;
  babelConfig?: {
    plugins?: PluginItem[];
    presets?: PluginItem[];
  };
  importSources?: string[];
  useCSSLayers?: boolean;
  lightningcssOptions?: Omit<
    TransformOptions<{}>,
    'code' | 'filename' | 'visitor'
  >;
} & Partial<Options>;

declare function stylexPlugin(options?: PluginOptions): {
  name: string;
  setup(build: unknown): void | Promise<void>;
};

export default stylexPlugin;
