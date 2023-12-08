/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import stylex from 'stylex';
import fooStyles from './fooStyles';

const fadeInAnimation = stylex.keyframes({
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
});

const styles = stylex.create({
  bar: {
    animationName: fadeInAnimation,
    display: 'flex',
    marginLeft: 10,
    height: 700,
    backgroundColor: 'red',
    ':hover': {
      backgroundColor: 'pink',
    },
  },
});

export default function App() {
  return stylex(fooStyles.foo, styles.bar);
}
