/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const spin = stylex.keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: 'var(--ifm-color-emphasis-200)',
    borderTopColor: 'var(--ifm-color-primary)',
    borderRadius: '50%',
    animationName: spin,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

export default function LoadingSpinner() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.spinner)} />
    </div>
  );
}
