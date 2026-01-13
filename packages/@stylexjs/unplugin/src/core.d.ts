/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type UnpluginFactory, type UnpluginInstance } from 'unplugin';
import type { Options as StyleXOptions } from '@stylexjs/babel-plugin';
import type { TransformOptions } from 'lightningcss';

type LightningcssOptions = TransformOptions<any>;

export type UserOptions = StyleXOptions & {
  useCSSLayers?: boolean;
  enableLTRRTLComments?: boolean;
  legacyDisableLayers?: boolean;
  lightningcssOptions?: LightningcssOptions;
  cssInjectionTarget?: (filepath: string) => boolean;
  devPersistToDisk?: boolean;
  devMode?: 'full' | 'css-only' | 'off';
};

export const unpluginFactory: UnpluginFactory<Partial<UserOptions>, false>;

declare const unplugin: UnpluginInstance<Partial<UserOptions>, false>;

export default unplugin;
