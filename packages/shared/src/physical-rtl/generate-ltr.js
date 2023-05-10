/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 */

const logicalToPhysical = {
  start: 'left',
  end: 'right',
};

const propertyToLTR = {
  'margin-start': ([_key, val]: [string, string]) => ['margin-left', val],
  // 'margin-inline-start': ([_key, val]) => ['margin-left', val],
  'margin-end': ([_key, val]: [string, string]) => ['margin-right', val],
  // 'margin-inline-end': ([_key, val]: [string, string]) => ['margin-right', val],
  'padding-start': ([_key, val]: [string, string]) => ['padding-left', val],
  // 'padding-inline-start': ([_key, val]: [string, string]) => ['padding-left', val],
  'padding-end': ([_key, val]: [string, string]) => ['padding-right', val],
  // 'padding-inline-end': ([_key, val]: [string, string]) => ['padding-right', val],
  'border-start': ([_key, val]: [string, string]) => ['border-left', val],
  // 'border-inline-start': ([_key, val]: [string, string]) => ['border-left', val],
  'border-end': ([_key, val]: [string, string]) => ['border-right', val],
  // 'border-inline-end': ([_key, val]: [string, string]) => ['border-right', val],
  'border-start-width': ([_key, val]: [string, string]) => [
    'border-left-width',
    val,
  ],
  // 'border-inline-start-width': ([key, val]: [string, string]) => ['border-left-width', val],
  'border-end-width': ([_key, val]: [string, string]) => [
    'border-right-width',
    val,
  ],
  // 'border-inline-end-width': ([_key, val]: [string, string]) => ['border-right-width', val],
  'border-start-color': ([_key, val]: [string, string]) => [
    'border-left-color',
    val,
  ],
  // 'border-inline-start-color': ([_key, val]: [string, string]) => ['border-left-color', val],
  'border-end-color': ([_key, val]: [string, string]) => [
    'border-right-color',
    val,
  ],
  // 'border-inline-end-color': ([_key, val]: [string, string]) => ['border-right-color', val],
  'border-start-style': ([_key, val]: [string, string]) => [
    'border-left-style',
    val,
  ],
  // 'border-inline-start-style': ([_key, val]: [string, string]) => ['border-left-style', val],
  'border-end-style': ([_key, val]: [string, string]) => [
    'border-right-style',
    val,
  ],
  // 'border-inline-end-style': ([_key, val]: [string, string]) => ['border-right-style', val],
  'border-top-start-radius': ([_key, val]: [string, string]) => [
    'border-top-left-radius',
    val,
  ],
  // 'border-start-start-radius': ([_key, val]: [string, string]) => ['border-top-left-radius', val],
  'border-bottom-start-radius': ([_key, val]: [string, string]) => [
    'border-bottom-left-radius',
    val,
  ],
  // 'border-end-start-radius': ([_key, val]: [string, string]) => ['border-bottom-left-radius', val],
  'border-top-end-radius': ([_key, val]: [string, string]) => [
    'border-top-right-radius',
    val,
  ],
  // 'border-start-end-radius': ([_key, val]: [string, string]) => ['border-top-right-radius', val],
  'border-bottom-end-radius': ([_key, val]: [string, string]) => [
    'border-bottom-right-radius',
    val,
  ],
  // 'border-end-end-radius': ([key, val]: [string, string]) => ['border-bottom-right-radius', val],
  'text-align': ([key, val]: [string, string]) => [
    key,
    logicalToPhysical[val] ?? val,
  ],
  float: ([key, val]: [string, string]) => [key, logicalToPhysical[val] ?? val],
  clear: ([key, val]: [string, string]) => [key, logicalToPhysical[val] ?? val],
  start: ([_key, val]: [string, string]) => ['left', val],
  // 'inset-inline-start': ([key, val]: [string, string]) => ['left', val],
  end: ([_key, val]: [string, string]) => ['right', val],
  // 'inset-inline-end': ([key, val]) => ['right', val],
  'background-position': ([key, val]: [string, string]) => [
    key,
    val
      .split(' ')
      .map((word) =>
        word === 'start' ? 'left' : word === 'end' ? 'right' : word
      )
      .join(' '),
  ],
};

export default function generateLTR(pair: [string, string]): [string, string] {
  const [key] = pair;
  if (propertyToLTR[key]) {
    return propertyToLTR[key](pair);
  }
  return pair;
}
