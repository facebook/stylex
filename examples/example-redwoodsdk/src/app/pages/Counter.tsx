/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  button: {
    backgroundColor: 'tomato',
    borderStyle: 'none',
    appearance: 'none',
    color: 'white',
    paddingInline: 20,
    paddingBlock: 10,
    borderRadius: 5,
    margin: 10,
  },
  count: {
    fontFamily: 'monospace',
    fontSize: 20,
  },
});

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(styles.container)}>
      <button
        {...stylex.props(styles.button)}
        onClick={() => setCount(count - 1)}
      >
        -
      </button>
      <span {...stylex.props(styles.count)}>{count}</span>
      <button
        {...stylex.props(styles.button)}
        onClick={() => setCount(count + 1)}
      >
        +
      </button>
    </div>
  );
}
