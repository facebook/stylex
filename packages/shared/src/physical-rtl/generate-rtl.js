/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 */

import parser from 'postcss-value-parser';

const cursorFlip = {
  'e-resize': 'w-resize',
  'w-resize': 'e-resize',
  'ne-resize': 'nw-resize',
  'nesw-resize': 'nwse-resize',
  'nw-resize': 'ne-resize',
  'nwse-resize': 'nesw-resize',
  'se-resize': 'sw-resize',
  'sw-resize': 'se-resize',
};

function splitByDivisor(value) {
  const ast = parser(value);
  const groups = [];

  let currGroup = [];
  function push() {
    if (currGroup.length === 0) {
      return;
    }

    groups.push(parser.stringify((currGroup: $FlowFixMe)));
    currGroup = [];
  }

  for (const node of ast.nodes) {
    if (node.type === 'div') {
      push();
    } else {
      currGroup.push(node);
    }
  }

  push();

  return groups;
}

function flipSign(value) {
  if (value === '0') {
    return value;
  } else {
    return value[0] === '-' ? value.slice(1) : '-' + value;
  }
}

function flipShadow(value) {
  const defs = splitByDivisor(value);
  const builtDefs = [];

  for (const def of defs) {
    const parts = def.split(' ');
    const index = parser.unit(parts[0]) === false ? 1 : 0;
    if (index < parts.length) {
      parts[index] = flipSign(parts[index]);
    }
    builtDefs.push(parts.join(' '));
  }

  const rtl = builtDefs.join(', ');
  if (rtl !== value) {
    return rtl;
  }
}

// Should we be flipping shadows at all?
// I think the better approach would be to let engineers use
// CSS-vars directly.
const shadowsFlip = {
  'box-shadow': ([key, val]) => {
    const rtlVal = flipShadow(val);
    return rtlVal ? [key, rtlVal] : null;
  },
  'text-shadow': ([key, val]) => {
    const rtlVal = flipShadow(val);
    return rtlVal ? [key, rtlVal] : null;
  },
};

const logicalToPhysical = {
  start: 'right',
  end: 'left',
};

const propertyToRTL = {
  'margin-start': ([key, val]) => ['margin-right', val],
  // 'margin-inline-start': ([key, val]) => ['margin-right', val],
  'margin-end': ([key, val]) => ['margin-left', val],
  // 'margin-inline-end': ([key, val]) => ['margin-left', val],
  'padding-start': ([key, val]) => ['padding-right', val],
  // 'padding-inline-start': ([key, val]) => ['padding-right', val],
  'padding-end': ([key, val]) => ['padding-left', val],
  // 'padding-inline-end': ([key, val]) => ['padding-left', val],
  'border-start': ([key, val]) => ['border-right', val],
  // 'border-inline-start': ([key, val]) => ['border-right', val],
  'border-end': ([key, val]) => ['border-left', val],
  // 'border-inline-end': ([key, val]) => ['border-left', val],
  'border-start-width': ([key, val]) => ['border-right-width', val],
  // 'border-inline-start-width': ([key, val]) => ['border-right-width', val],
  'border-end-width': ([key, val]) => ['border-left-width', val],
  // 'border-inline-end-width': ([key, val]) => ['border-left-width', val],
  'border-start-color': ([key, val]) => ['border-right-color', val],
  // 'border-inline-start-color': ([key, val]) => ['border-right-color', val],
  'border-end-color': ([key, val]) => ['border-left-color', val],
  // 'border-inline-end-color': ([key, val]) => ['border-left-color', val],
  'border-start-style': ([key, val]) => ['border-right-style', val],
  // 'border-inline-start-style': ([key, val]) => ['border-right-style', val],
  'border-end-style': ([key, val]) => ['border-left-style', val],
  // 'border-inline-end-style': ([key, val]) => ['border-left-style', val],
  'border-top-start-radius': ([key, val]) => ['border-top-right-radius', val],
  // 'border-start-start-radius': ([key, val]) => ['border-top-right-radius', val],
  'border-bottom-start-radius': ([key, val]) => [
    'border-bottom-right-radius',
    val,
  ],
  // 'border-end-start-radius': ([key, val]) => ['border-bottom-right-radius', val],
  'border-top-end-radius': ([key, val]) => ['border-top-left-radius', val],
  // 'border-start-end-radius': ([key, val]) => ['border-top-left-radius', val],
  'border-bottom-end-radius': ([key, val]) => [
    'border-bottom-left-radius',
    val,
  ],
  // 'border-end-end-radius': ([key, val]) => ['border-bottom-left-radius', val],
  'text-align': ([key, val]) =>
    logicalToPhysical[val] != null ? [key, logicalToPhysical[val]] : null,
  float: ([key, val]) =>
    logicalToPhysical[val] != null ? [key, logicalToPhysical[val]] : null,
  clear: ([key, val]) =>
    logicalToPhysical[val] != null ? [key, logicalToPhysical[val]] : null,
  start: ([key, val]) => ['right', val],
  // 'inset-inline-start': ([key, val]) => ['right', val],
  end: ([key, val]) => ['left', val],
  // 'inset-inline-end': ([key, val]) => ['left', val],
  'background-position': ([key, val]) => {
    const words = val.split(' ');
    if (!words.includes('start') && !words.includes('end')) {
      return null;
    }
    return [
      key,
      words
        .map((word) =>
          word === 'start' ? 'right' : word === 'end' ? 'left' : word
        )
        .join(' '),
    ];
  },
  cursor: ([key, val]) =>
    cursorFlip[val] != null ? [key, cursorFlip[val]] : null,
  ...shadowsFlip,
};

export default function generateRTL([key, value]: [string, string]): ?[
  string,
  string
] {
  if (propertyToRTL[key]) {
    return propertyToRTL[key]([key, value]);
  }
  return null;
}
