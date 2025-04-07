/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {
    backgroundColor: 'purple',
    borderColor: 'orange',
    borderStyle: 'solid',
    borderWidth: 10,
    boxSizing: 'border-box',
    display: 'flex',
    marginBlockEnd: 16,
    marginBlockStart: 16,
    marginInline: 16,
    paddingBlock: 32,
    paddingInlineEnd: 32,
    paddingInlineStart: 32,
    verticalAlign: 'top',
    textDecorationLine: 'underline',
  },
});
