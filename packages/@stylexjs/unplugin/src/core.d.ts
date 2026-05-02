/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Options as StyleXOptions } from '@stylexjs/babel-plugin';
import type { TransformOptions } from 'lightningcss';

type LightningcssOptions = Omit<TransformOptions<any>, 'filename' | 'code'>;

type UnpluginMetaOptions = {
  framework?:
    | 'rollup'
    | 'vite'
    | 'webpack'
    | 'rspack'
    | 'esbuild'
    | 'rolldown'
    | 'farm'
    | 'unloader'
    | 'bun';
};

type StyleXUnpluginFactory<Options> = (
  options?: Options,
  metaOptions?: UnpluginMetaOptions,
) => any;

export type CSSLayersConfig =
  | boolean
  | {
      before?: ReadonlyArray<string>;
      after?: ReadonlyArray<string>;
      prefix?: string;
    };

export type UserOptions = StyleXOptions & {
  useCSSLayers?: CSSLayersConfig;
  enableLTRRTLComments?: boolean;
  legacyDisableLayers?: boolean;
  lightningcssOptions?: LightningcssOptions;
  cssInjectionTarget?: (filepath: string) => boolean;
  externalPackages?: ReadonlyArray<string>;
  devPersistToDisk?: boolean;
  devMode?: 'full' | 'css-only' | 'off';
};

export const unpluginFactory: StyleXUnpluginFactory<Partial<UserOptions>>;

declare const unplugin: any;

export default unplugin;
