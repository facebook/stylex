import { type UnpluginInstance } from 'unplugin';
import type { Options as StyleXOptions } from '@stylexjs/babel-plugin';
import type { TransformOptions as LightningcssOptions } from 'lightningcss';

export default unplugin;

type UserOptions = StyleXOptions & {
  useCSSLayers?: boolean;
  enableLTRRTLComments?: boolean;
  legacyDisableLayers?: boolean;
  lightningcssOptions?: LightningcssOptions;
  cssInjectionTarget?: (filepath: string) => boolean;
  devPersistToDisk?: boolean;
  devMode?: 'full' | 'css-only' | 'off';
};

declare const unplugin: UnpluginInstance<Partial<UserOptions>, false>;
