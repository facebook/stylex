/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '../common-types';
import { defaultOptions } from '../utils/default-options';

<<<<<<< HEAD
const logicalToPhysical: $ReadOnly<{ [string]: string }> = {
  start: 'left',
  end: 'right',
  'inline-start': 'left',
  'inline-end': 'right',
};

// These values are polyfilled to LTR/RTL equivalents due to incomplete browser support, regardless of `enableLogicalStylesPolyfill`
// Note: Currently unused after removing legacy polyfill blocks, but kept for potential future use
// const legacyValuesPolyfill: $ReadOnly<{
//   [key: string]: ($ReadOnly<[string, string]>) => $ReadOnly<[string, string]>,
// }> = {
//   float: ([key, val]) => [key, logicalToPhysical[val] ?? val],
//   clear: ([key, val]) => [key, logicalToPhysical[val] ?? val],
// };

=======
>>>>>>> 81170ee3 (Auto-flipping CSS custom properties for logical float/clear)
// These properties are kept for a polyfill that is only used with `legacy-expand-shorthands`
const inlinePropertyToLTR: $ReadOnly<{
  [key: string]: ($ReadOnly<[string, string]>) => $ReadOnly<[string, string]>,
}> = {
  'margin-inline-start': ([_key, val]) => ['margin-left', val],
  'margin-inline-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'margin-right',
    val,
  ],
  'padding-inline-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'padding-left',
    val,
  ],
  'padding-inline-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'padding-right',
    val,
  ],
  'border-inline-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left',
    val,
  ],
  'border-inline-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right',
    val,
  ],
  'border-inline-start-width': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-width',
    val,
  ],
  'border-inline-end-width': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-width',
    val,
  ],
  'border-inline-start-color': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-color',
    val,
  ],
  'border-inline-end-color': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-color',
    val,
  ],
  'border-inline-start-style': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-style',
    val,
  ],
  'border-inline-end-style': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-style',
    val,
  ],
  'border-start-start-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-top-left-radius',
    val,
  ],
  'border-end-start-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-bottom-left-radius',
    val,
  ],
  'border-start-end-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-top-right-radius',
    val,
  ],
  'border-end-end-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-bottom-right-radius',
    val,
  ],
  'inset-inline-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'left',
    val,
  ],
  'inset-inline-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'right',
    val,
  ],
};

const propertyToLTR: $ReadOnly<{
  [key: string]: ($ReadOnly<[string, string]>) => $ReadOnly<[string, string]>,
}> = {
  'margin-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'margin-left',
    val,
  ],
  'margin-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'margin-right',
    val,
  ],
  'padding-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'padding-left',
    val,
  ],
  'padding-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'padding-right',
    val,
  ],
  'border-start': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left',
    val,
  ],
  'border-end': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right',
    val,
  ],
  'border-start-width': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-width',
    val,
  ],
  'border-end-width': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-width',
    val,
  ],
  'border-start-color': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-color',
    val,
  ],
  'border-end-color': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-color',
    val,
  ],
  'border-start-style': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-left-style',
    val,
  ],
  'border-end-style': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-right-style',
    val,
  ],
  'border-top-start-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-top-left-radius',
    val,
  ],
  'border-bottom-start-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-bottom-left-radius',
    val,
  ],
  'border-top-end-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-top-right-radius',
    val,
  ],
  'border-bottom-end-radius': ([_key, val]: $ReadOnly<[string, string]>) => [
    'border-bottom-right-radius',
    val,
  ],
  start: ([_key, val]: $ReadOnly<[string, string]>) => ['left', val],
  // 'inset-inline-start': ([key, val]: $ReadOnly<[string, string]>) => ['left', val],
  end: ([_key, val]: $ReadOnly<[string, string]>) => ['right', val],
  // 'inset-inline-end': ([key, val]) => ['right', val],
  'background-position': ([key, val]: $ReadOnly<[string, string]>) => [
    key,
    val
      .split(' ')
      .map((word) =>
        word === 'start' || word === 'insetInlineStart'
          ? 'left'
          : word === 'end' || word === 'insetInlineEnd'
            ? 'right'
            : word,
      )
      .join(' '),
  ],
};

export default function generateLTR(
  pair: $ReadOnly<[string, string]>,
  options: StyleXOptions = defaultOptions,
): $ReadOnly<[string, string]> {
  const { enableLogicalStylesPolyfill, styleResolution } = options;
  const [key] = pair;

  if (styleResolution === 'legacy-expand-shorthands') {
    if (!enableLogicalStylesPolyfill) {
      return pair;
    }

    if (inlinePropertyToLTR[key]) {
      return inlinePropertyToLTR[key](pair);
    }
  }

  if (!propertyToLTR[key]) {
    return pair;
  }

  return propertyToLTR[key](pair);
}
