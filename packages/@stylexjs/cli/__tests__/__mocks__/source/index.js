/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import * as stylex from '@stylexjs/stylex';
import otherStyles from './otherStyles';
import npmStyles from './npmStyles';

const fadeAnimation = stylex.keyframes({
  '0%': {
    opacity: 0.25,
  },
  '100%': {
    opacity: 1,
  },
});

const styles = stylex.create({
  foo: {
    animationName: fadeAnimation,
    backgroundColor: {
      default: null,
      ':hover': 'red',
    },
    display: 'flex',
    height: 500,
    marginBlockStart: 99,
    marginInlineStart: 10,
  },
});

export default function App() {
  return stylex.props(otherStyles.bar, styles.foo, npmStyles.baz).className;
}
