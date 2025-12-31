/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

const fadeAnimation = stylex.keyframes({
  '0%': {
    opacity: 0.25,
  },
  '100%': {
    opacity: 1,
  },
});

export const styles = stylex.create({
  foo: {
    animationName: fadeAnimation,
    backgroundColor: {
      default: null,
      ':hover': 'red',
    },
    borderStartStartRadius: 7.5,
    display: 'flex',
    height: 500,
    marginInlineStart: 10,
    marginBlockStart: 99,
  },
});

export default function App() {
  return stylex.props(styles.foo);
}
