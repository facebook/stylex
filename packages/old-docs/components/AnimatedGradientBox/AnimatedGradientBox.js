/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

import { tokens } from './tokens.stylex';

export default function AnimatedGradientBox() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.gradient)} />
        <div {...stylex.props(styles.gradient, styles.blur)} />
      </div>
    </div>
  );
}

const COLOR_1 = '#ffadad';
const COLOR_2 = '#ffd6a5';
const COLOR_3 = '#fdffb6';
const COLOR_4 = '#caffbf';
const COLOR_5 = '#9bf6ff';
const COLOR_6 = '#a0c4ff';
const COLOR_7 = '#bdb2ff';
const COLOR_8 = '#ffc6ff';

const rotate = stylex.keyframes({
  '0%': { [tokens.angle]: '0deg' },
  '100%': { [tokens.angle]: '360deg' },
});

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '16 / 9',
    borderRadius: 8,
    boxSizing: 'border-box',
    width: '100%',
    marginBlock: 16,
    zIndex: 0,
  },
  card: {
    borderRadius: 16,
    height: '65%',
    position: 'relative',
    width: '65%',
    boxSizing: 'border-box',
  },
  blur: {
    filter: 'blur(25px)',
  },
  gradient: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `conic-gradient(from ${tokens.angle}, ${COLOR_1}, ${COLOR_2}, ${COLOR_3}, ${COLOR_4}, ${COLOR_5}, ${COLOR_6}, ${COLOR_7}, ${COLOR_8}, ${COLOR_1})`,
    borderRadius: 16,
    animationName: rotate,
    animationDuration: '10s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
