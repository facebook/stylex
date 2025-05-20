/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100vh',
    paddingTop: '32px',
    paddingBottom: '32px',
  },
  main: {
    fontSize: '24px',
    lineHeight: 1,
    fontFamily: 'sans-serif',
    fontWeight: 400,
    textAlign: 'center',
    display: 'flex',
    gap: '16px',
    whiteSpace: 'nowrap',
    flexDirection: 'row',
  },
  h1: {
    fontWeight: 700,
    fontFamily: 'monospace',
  },
});
