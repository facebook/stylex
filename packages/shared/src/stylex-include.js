/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as messages from './messages';

let number = 0;
function uuid() {
  return `__included_${++number}__`;
}

export class IncludedStyles {
  astNode: any;
  constructor(astNode: any) {
    this.astNode = astNode;
  }
}

export default function stylexInclude(
  firstArg: any,
  ...styles: any
): {
  [key: string]: IncludedStyles,
} {
  if (styles.length > 0) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }
  return { [uuid()]: new IncludedStyles(firstArg.node) };
}
