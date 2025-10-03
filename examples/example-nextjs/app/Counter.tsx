/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import { spacing, text, globalTokens as $, colors } from './globalTokens.stylex';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div {...stylex.props(styles.container)}>
      <button
        {...stylex.props(styles.button)}
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </button>
      <div
        {...stylex.props(
          styles.count,
          Math.abs(count) > 99 && styles.largeNumber,
        )}
      >
        {count}
      </div>
      <button
        {...stylex.props(styles.button)}
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </button>
    </div>
  );
}

const DARK = '@media (prefers-color-scheme: dark)' as const;

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: spacing.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue7,
    padding: spacing.xxxs,
    fontFamily: $.fontSans,
    gap: spacing.xs,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '6rem',
    aspectRatio: 1,
    color: colors.blue7,
    backgroundColor: {
      default: colors.gray3,
      ':hover': colors.gray4,
      [DARK]: {
        default: colors.gray9,
        ':hover': colors.gray8,
      },
    },
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: spacing.xs,
    padding: spacing.xs,
    margin: spacing.xs,
    cursor: 'pointer',
    fontSize: text.h2,
    transform: {
      default: null,
      ':hover': 'scale(1.025)',
      ':active': 'scale(0.975)',
    },
  },
  count: {
    fontSize: text.h2,
    fontWeight: 100,
    color: colors.lime7,
    minWidth: '6rem',
    textAlign: 'center',
    fontFamily: $.fontMono,
  },
  largeNumber: {
    fontSize: text.h3,
  },
});
