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
import { colors } from './vars.stylex';

const styles = stylex.create({
  foo: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  bar: {
    color: colors.textSecondary,
  },
});

export default function App() {
  return stylex.props(styles.foo, styles.bar);
}
