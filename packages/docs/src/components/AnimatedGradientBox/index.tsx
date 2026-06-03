/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

const COLORS = [
  '#ffadad',
  '#ffd6a5',
  '#fdffb6',
  '#caffbf',
  '#9bf6ff',
  '#a0c4ff',
  '#bdb2ff',
  '#ffc6ff',
];

const rotate = stylex.keyframes({
  '0%': { [tokens.angle]: '0deg' },
  '100%': { [tokens.angle]: '360deg' },
});

const styles = stylex.create({
  container: {
    zIndex: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: '16 / 9',
    marginBlock: 16,
    borderRadius: 8,
  },
  card: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '65%',
    height: '65%',
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `conic-gradient(from ${tokens.angle}, ${COLORS.join(', ')}, ${COLORS[0]})`,
    borderRadius: 16,
    animationName: rotate,
    animationDuration: '10s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  blur: {
    filter: 'blur(25px)',
  },
});

export function AnimatedGradientBox() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.gradient)} />
        <div {...stylex.props(styles.gradient, styles.blur)} />
      </div>
    </div>
  );
}

export default AnimatedGradientBox;
