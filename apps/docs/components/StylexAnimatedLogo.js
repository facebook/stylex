/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import stylex from '@stylexjs/stylex';

const rotator = stylex.keyframes({
  '0%': {
    transform: 'rotate(-55deg)',
  },
  '40%, 100%': {
    transform: 'rotate(-415deg)',
  },
});
const styles = stylex.create({
  root: {
    fontSize: '3rem',
    marginBottom: '2.5rem',
    marginLeft: '-1em',
    '@media (min-width: 900px) and (max-width: 1200px)': {
      fontSize: '2rem',
    },
    '@media (max-width: 900px)': {
      fontSize: '1.5rem',
    },
  },
  logo: {
    display: 'inline-block',
    position: 'relative',
    fontWeight: 'normal',
  },
  text: {
    fontSize: '3em',
    textShadow: '0.02em 0.02em 1px white, -0.02em -0.02em 1px var(--bg1)',
    transform: 'translateZ(1px)',
  },
  arc: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderLeftWidth: 0,
    borderTopWidth: '0.5em',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftColor: 'var(--fg1)',
    borderTopColor: 'var(--fg1)',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: '50%',
    transform: 'rotate(-55deg)',
    animationName: rotator,
    animationDuration: '5s',
    animationIterationCount: 'infinite',
    animationDelay: '2s',
  },
  arc1: {
    position: 'absolute',
    right: '-2em',
    top: '-0.5em',
    height: '6em',
    width: '6em',
    transform: 'rotate3d(2, 1.5, 4, 175deg)',
  },
  arc2: {
    position: 'absolute',
    right: '-2em',
    top: '-0.5em',
    height: '6em',
    width: '6em',
    transform: 'rotate3d(0, 12.8, 4, -140deg)',
  },
  delay: {
    animationDelay: '2.3s',
  },
});

export default function StylexAnimatedLogo() {
  return (
    <div className={stylex(styles.root)}>
      <div className={stylex(styles.logo)}>
        <div className={stylex(styles.arc1)}>
          <div className={stylex(styles.arc, styles.delay)} />
        </div>
        <div className={stylex(styles.arc2)}>
          <div className={stylex(styles.arc)} />
        </div>
        <div className={stylex(styles.text)}>style</div>
      </div>
    </div>
  );
}
