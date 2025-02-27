/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  main: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink7,
  },
  card: {
    backgroundColor: colors.blue9,
    padding: sizes.spacing5,
    borderRadius: sizes.spacing2,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    color: colors.gray0,
    fontFamily: fonts.mono,
  },
});

export default function App() {
  return stylex.props(styles.main, styles.card);
}
