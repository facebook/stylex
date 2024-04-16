/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

import { tokens } from './tokens.stylex';

export default function AnimatedGradientBox() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)} />
    </div>
  );
}

const COLOR_1 = '#052b2f';
const COLOR_2 = '#073438';
const COLOR_3 = '#0e4b50';
const COLOR_4 = '#2d8f85';
const COLOR_5 = '#637c54';

const rotate = stylex.keyframes({
  '0%': { [tokens.angle]: '0deg' },
  '100%': { [tokens.angle]: '360deg' },
});

const styles = stylex.create({
  container: {
    aspectRatio: '16 / 9',
    backgroundColor: COLOR_2,
    borderRadius: 8,
    boxSizing: 'border-box',
    padding: 64,
    width: '100%',
    marginBlock: 16,
  },
  card: {
    backgroundColor: COLOR_1,
    borderRadius: 8,
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    inset: -8,
    zIndex: -1,
    backgroundImage: `conic-gradient(from ${tokens.angle}, ${COLOR_3}, ${COLOR_4}, ${COLOR_5}, ${COLOR_4}, ${COLOR_3})`,
    borderRadius: 16,
    animationName: rotate,
    animationDuration: '10s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
