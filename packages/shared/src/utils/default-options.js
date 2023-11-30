/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '../common-types';

// {
//   ...options,
//   dev: !!(options as any).dev,
//   test: !!(options as any).test,
//   stylexSheetName: (options as any).stylexSheetName ?? undefined,
//   classNamePrefix: (options as any).classNamePrefix ?? 'x',
//   importSources: (options as any).importSources ?? [name, 'stylex'],
//   definedStylexCSSVariables:
//     (options as any).definedStylexCSSVariables ?? {},
//   genConditionalClasses: !!(options as any).genConditionalClasses,
//   skipShorthandExpansion: !!(options as any).skipShorthandExpansion,
// } as StyleXOptions;

export const defaultOptions: StyleXOptions = {
  dev: false,
  runtimeInjection: false,
  test: false,
  classNamePrefix: 'x',
  styleResolution: 'application-order',
};
