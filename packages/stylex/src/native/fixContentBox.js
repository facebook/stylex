/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { warnMsg } from './errorMsg';

type FlatStyle = { [key: string]: mixed };
type Direction = 0 | 1 | 2 | 3;

const TOP: Direction = 0;
const RIGHT: Direction = 1;
const BOTTOM: Direction = 2;
const LEFT: Direction = 3;

// TODO: check for RTL and flip START and END
const START: Direction = LEFT;
const END: Direction = RIGHT;

const borderMapping: [string, Direction[]][] = [
  ['borderWidth', [TOP, RIGHT, BOTTOM, LEFT]],
  ['borderTopWidth', [TOP]],
  ['borderRightWidth', [RIGHT]],
  ['borderBottomWidth', [BOTTOM]],
  ['borderLeftWidth', [LEFT]],
  ['borderStartWidth', [START]],
  ['borderEndWidth', [END]],
];

const paddingMapping: [string, Direction[]][] = [
  ['padding', [TOP, RIGHT, BOTTOM, LEFT]],
  ['paddingVertical', [TOP, BOTTOM]],
  ['paddingHorizontal', [LEFT, RIGHT]],
  ['paddingTop', [TOP]],
  ['paddingRight', [RIGHT]],
  ['paddingBottom', [BOTTOM]],
  ['paddingLeft', [LEFT]],
  ['paddingStart', [START]],
  ['paddingEnd', [END]],
];

export function fixContentBox(flatStyle: FlatStyle): FlatStyle {
  const border: [number, number, number, number] = [0, 0, 0, 0];
  const padding: [number, number, number, number] = [0, 0, 0, 0];

  for (const [styleProp, directions] of borderMapping) {
    if (typeof flatStyle[styleProp] === 'number') {
      for (const direction of directions) {
        border[direction] = flatStyle[styleProp];
      }
    }
  }

  for (const [styleProp, directions] of paddingMapping) {
    if (typeof flatStyle[styleProp] === 'number') {
      for (const direction of directions) {
        padding[direction] = flatStyle[styleProp];
      }
    }
  }

  const correctionVertical =
    border[TOP] + padding[TOP] + padding[BOTTOM] + border[BOTTOM];
  const correctionHorizontal =
    border[LEFT] + padding[LEFT] + padding[RIGHT] + border[RIGHT];

  const correctionMapping = new Map<string, number>([
    ['width', correctionHorizontal],
    ['minWidth', correctionHorizontal],
    ['maxWidth', correctionHorizontal],
    ['height', correctionVertical],
    ['minHeight', correctionVertical],
    ['maxHeight', correctionVertical],
  ]);

  const nextStyle: FlatStyle = {};
  for (const styleProp of Object.keys(flatStyle)) {
    const correction = correctionMapping.get(styleProp);
    if (correction != null) {
      if (flatStyle[styleProp] == null) {
        nextStyle[styleProp] = null;
        continue;
      }
      if (typeof flatStyle[styleProp] !== 'number') {
        warnMsg(
          `fixContentBox: Expected style value as a number (${styleProp}: ${String(
            flatStyle[styleProp],
          )})`,
        );
        return flatStyle;
      }
      nextStyle[styleProp] = flatStyle[styleProp] + correction;
    } else {
      nextStyle[styleProp] = flatStyle[styleProp];
    }
  }

  return nextStyle;
}
