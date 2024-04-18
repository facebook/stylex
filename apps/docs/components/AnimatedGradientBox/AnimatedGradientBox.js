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
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.gradient)} />
        <div {...stylex.props(styles.gradient, styles.blur)} />
        <div {...stylex.props(styles.bgColor)} />
      </div>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '16 / 9',
    backgroundColor: COLOR_2,
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
    backgroundImage: `conic-gradient(from ${tokens.angle}, ${COLOR_3}, ${COLOR_4}, ${COLOR_5}, ${COLOR_4}, ${COLOR_3})`,
    borderRadius: 16,
    animationName: rotate,
    animationDuration: '10s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  bgColor: {
    position: 'absolute',
    inset: '8px',
    backgroundColor: COLOR_1,
    borderRadius: 8,
  },
});
