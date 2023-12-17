/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { LogoText, viewBox } from './Logo';

const ANIM_DURATION = '6s';
const STAGGER = '-2.5s';

const rotate = stylex.keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});
const fade = stylex.keyframes({
  '0%': { opacity: 1, transform: 'scale(1)' },
  '45%': { opacity: 1, transform: 'scale(1)' },
  '55%': { opacity: 0, transform: 'scale(0.5)' },
  '90%': { opacity: 0, transform: 'scale(0.5)' },
});
const fade2 = stylex.keyframes({
  '0%': { opacity: 0, transform: 'scale(0)' },
  '10%': { opacity: 1, transform: 'scale(1)' },
  '58%': { opacity: 1, transform: 'scale(1)' },
  '68%': { opacity: 0, transform: 'scale(0.5)' },
  '100%': { opacity: 0, transform: 'scale(0.5)' },
});

const styles = stylex.create({
  root: {
    position: 'relative',
    transformStyle: 'preserve-3d',
    perspective: '1000px',
  },
  arc: {
    position: 'absolute',
    height: '100%',
    top: 0,
    right: 0,
    aspectRatio: '1',
    borderRadius: '50%',
  },
  arc1: {
    transform: 'rotate3d(0, 14.8, -4.4, 130deg) translate(-7%, 1%) scale(1.12)',
  },
  arc2: {
    transform:
      'rotate3d(0, 13.1, -4.5, -138deg) translate(-18%, 10%) scale(1.12)',
  },
  arcOrbit: {
    position: 'absolute',
    inset: 2,
    borderRadius: '50%',
    borderLeftWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    borderColor: 'var(--fg1)',
    borderTopColor: 'var(--fg1)',
    borderLeftColor: 'var(--fg1)',
  },
  mask1: {
    maskImage: 'linear-gradient(125deg, white 30%, transparent 65%)',
    WebkitMaskImage: 'linear-gradient(125deg, white 30%, transparent 65%)',
  },
  mask2: {
    maskImage: 'linear-gradient(80deg, white 30%, transparent 65%)',
    WebkitMaskImage: 'linear-gradient(80deg, white 30%, transparent 65%)',
  },
  dotPath: {
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    animationName: rotate,
    animationDuration: ANIM_DURATION,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  dotPath2: {
    animationDelay: STAGGER,
  },
  dot: {
    animationDuration: ANIM_DURATION,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: '50%',
    borderColor: 'var(--bg1)',
    borderStyle: 'solid',
    borderWidth: 2,
    zIndex: 1,
  },
  dotPink: {
    bottom: 28,
    left: 28,
    animationName: fade,
    backgroundImage:
      'radial-gradient(#FCD5FD 0%, #FD9EFF 19.619%, #F53BFA 51.352%, #E22FE6 82.291%, #CF28D4 100%)',
  },
  dotBlue: {
    bottom: 28,
    right: 28,
    animationName: fade2,
    animationDelay: STAGGER,
    backgroundImage:
      'radial-gradient(#E5F9FF 0%, #B2EEFE 21.605%, #5ED9FB 57.356%, #5DD1F1 77.207%, #55C4E3 100%)',
  },
});

export default function StylexAnimatedLogo({ style }) {
  return (
    <div {...stylex.props(styles.root)}>
      <svg {...stylex.props(style)} viewBox={viewBox}>
        <LogoText />
      </svg>
      <div {...stylex.props([styles.arc, styles.arc2])}>
        <div {...stylex.props([styles.arcOrbit, styles.mask2])} />
        <div {...stylex.props([styles.dotPath, styles.dotPath2])}>
          <div {...stylex.props([styles.dot, styles.dotBlue])} />
        </div>
      </div>
      <div {...stylex.props([styles.arc, styles.arc1])}>
        <div {...stylex.props([styles.arcOrbit, styles.mask1])} />
        <div {...stylex.props(styles.dotPath)}>
          <div {...stylex.props([styles.dot, styles.dotPink])} />
        </div>
      </div>
    </div>
  );
}
